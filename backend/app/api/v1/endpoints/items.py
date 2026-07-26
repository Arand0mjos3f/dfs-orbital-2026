import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.item import (
    create_item,
    delete_item,
    get_item,
    list_items_by_receipt,
    update_item,
)
from app.crud.item_share import delete_item_share, list_item_shares_by_item
from app.crud.receipt import get_receipt
from app.db.database import get_db
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate, ReceiptItemBatchCreate


router = APIRouter(tags=["items"])


def _validate_item_total(
    quantity: int,
    unit_price: Decimal,
    total_price: Decimal,
) -> None:
    expected_total = Decimal(quantity) * unit_price

    if expected_total.quantize(Decimal("0.01")) != total_price.quantize(Decimal("0.01")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_ITEM_TOTAL",
                "message": "quantity * unit_price must match total_price.",
            },
        )


@router.post(
    "/receipts/{receipt_id}/items",
    status_code=status.HTTP_201_CREATED,
)
def create_receipt_item(
    receipt_id: uuid.UUID,
    item_in: ItemCreate,
    db: Session = Depends(get_db),
):
    receipt = get_receipt(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    _validate_item_total(
        item_in.quantity,
        item_in.unit_price,
        item_in.total_price,
    )

    item = create_item(
        db,
        receipt_id=receipt_id,
        name=item_in.name,
        quantity=item_in.quantity,
        unit_price=item_in.unit_price,
        total_price=item_in.total_price,
    )

    return {
        "success": True,
        "data": ItemRead.model_validate(item),
    }


@router.post(
    "/receipts/{receipt_id}/items/batch",
    status_code=status.HTTP_201_CREATED,
)
def create_receipt_items_batch(
    receipt_id: uuid.UUID,
    batch_in: ReceiptItemBatchCreate,
    db: Session = Depends(get_db),
):
    receipt = get_receipt(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    for item_in in batch_in.items:
        _validate_item_total(
            item_in.quantity,
            item_in.unit_price,
            item_in.total_price,
        )

    if batch_in.replace_existing:
        existing_items = list_items_by_receipt(db, receipt_id)

        for existing_item in existing_items:
            for existing_share in list_item_shares_by_item(db, existing_item.id):
                delete_item_share(db, existing_share)

        for existing_item in existing_items:
            delete_item(db, existing_item)

    created_items = [
        create_item(
            db,
            receipt_id=receipt_id,
            name=item_in.name,
            quantity=item_in.quantity,
            unit_price=item_in.unit_price,
            total_price=item_in.total_price,
            original_name=item_in.original_name,
            original_unit_price=item_in.original_unit_price,
            original_total_price=item_in.original_total_price,
            is_manually_edited=item_in.is_manually_edited,
        )
        for item_in in batch_in.items
    ]

    return {
        "success": True,
        "data": [ItemRead.model_validate(item) for item in created_items],
    }


@router.get("/receipts/{receipt_id}/items")
def get_items_in_receipt(
    receipt_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    receipt = get_receipt(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    items = list_items_by_receipt(db, receipt_id)

    return {
        "success": True,
        "data": [ItemRead.model_validate(item) for item in items],
    }


@router.patch("/items/{item_id}")
def update_receipt_item(
    item_id: uuid.UUID,
    item_in: ItemUpdate,
    db: Session = Depends(get_db),
):
    item = get_item(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_NOT_FOUND",
                "message": "The item does not exist.",
            },
        )

    update_data = item_in.model_dump(exclude_unset=True)

    quantity = update_data.get("quantity", item.quantity)
    unit_price = update_data.get("unit_price", item.unit_price)
    total_price = update_data.get("total_price", item.total_price)

    _validate_item_total(quantity, unit_price, total_price)

    if update_data:
        update_data["is_manually_edited"] = True

    financial_fields = {"quantity", "unit_price", "total_price"}
    if financial_fields.intersection(update_data):
        for existing_share in list_item_shares_by_item(db, item.id):
            db.delete(existing_share)

    updated_item = update_item(db, item, update_data)

    return {
        "success": True,
        "data": ItemRead.model_validate(updated_item),
    }


@router.delete("/items/{item_id}")
def delete_receipt_item(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    item = get_item(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_NOT_FOUND",
                "message": "The item does not exist.",
            },
        )

    existing_shares = list_item_shares_by_item(db, item.id)

    for existing_share in existing_shares:
        db.delete(existing_share)

    db.delete(item)
    db.commit()

    return {
        "success": True,
        "data": {
            "deleted_item_id": str(item_id),
        },
    }
