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
from app.schemas.item import ItemBatchCreate, ItemCreate, ItemRead, ItemUpdate


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


def _get_existing_receipt_or_404(
    db: Session,
    receipt_id: uuid.UUID,
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

    return receipt


def _delete_item_with_dependent_shares(
    db: Session,
    item,
) -> None:
    item_shares = list_item_shares_by_item(db, item.id)

    for item_share in item_shares:
        delete_item_share(db, item_share)

    delete_item(db, item)


def _create_item_from_payload(
    db: Session,
    *,
    receipt_id: uuid.UUID,
    item_in: ItemCreate,
):
    _validate_item_total(
        item_in.quantity,
        item_in.unit_price,
        item_in.total_price,
    )

    return create_item(
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


@router.post(
    "/receipts/{receipt_id}/items",
    status_code=status.HTTP_201_CREATED,
)
def create_receipt_item(
    receipt_id: uuid.UUID,
    item_in: ItemCreate,
    db: Session = Depends(get_db),
):
    _get_existing_receipt_or_404(db, receipt_id)

    item = _create_item_from_payload(
        db,
        receipt_id=receipt_id,
        item_in=item_in,
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
    batch_in: ItemBatchCreate,
    db: Session = Depends(get_db),
):
    _get_existing_receipt_or_404(db, receipt_id)

    if batch_in.replace_existing:
        existing_items = list_items_by_receipt(db, receipt_id)

        for item in existing_items:
            _delete_item_with_dependent_shares(db, item)

    created_items = [
        _create_item_from_payload(
            db,
            receipt_id=receipt_id,
            item_in=item_in,
        )
        for item_in in batch_in.items
    ]

    return {
        "success": True,
        "data": {
            "receipt_id": receipt_id,
            "created_item_count": len(created_items),
            "items": [ItemRead.model_validate(item) for item in created_items],
        },
    }


@router.get("/receipts/{receipt_id}/items")
def get_items_in_receipt(
    receipt_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    _get_existing_receipt_or_404(db, receipt_id)

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

    delete_item(db, item)

    return {
        "success": True,
        "data": {
            "deleted_item_id": str(item_id),
        },
    }
