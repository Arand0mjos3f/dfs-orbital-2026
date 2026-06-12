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
from app.crud.receipt import get_receipt
from app.db.database import get_db
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate


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

import uuid as _uuid_for_ocr_items
from decimal import Decimal as _DecimalForOcrItems

from sqlalchemy import inspect as _sa_inspect_for_ocr_items

from app.crud.receipt import get_receipt as _get_receipt_for_ocr_items
from app.models.item import Item as _ItemForOcrItems
from app.schemas.item import OcrItemsConfirmCreate, ItemRead


def _set_item_value_if_column(
    values: dict,
    columns: set[str],
    column_name: str,
    value,
) -> None:
    if column_name in columns:
        values[column_name] = value


def _build_confirmed_item_values(
    *,
    receipt_id: _uuid_for_ocr_items.UUID,
    item_in,
    columns: set[str],
) -> dict:
    quantity = item_in.quantity
    total_price = item_in.total_price

    if total_price is None:
        total_price = item_in.unit_price * _DecimalForOcrItems(quantity)

    original_name = item_in.original_name or item_in.name

    values = {}

    _set_item_value_if_column(values, columns, "id", _uuid_for_ocr_items.uuid4())
    _set_item_value_if_column(values, columns, "receipt_id", receipt_id)

    _set_item_value_if_column(values, columns, "name", item_in.name)
    _set_item_value_if_column(values, columns, "item_name", item_in.name)

    _set_item_value_if_column(values, columns, "original_name", original_name)

    _set_item_value_if_column(values, columns, "quantity", quantity)

    _set_item_value_if_column(values, columns, "unit_price", item_in.unit_price)
    _set_item_value_if_column(values, columns, "unit_price_amount", item_in.unit_price)

    _set_item_value_if_column(values, columns, "total_price", total_price)
    _set_item_value_if_column(values, columns, "total_amount", total_price)

    _set_item_value_if_column(values, columns, "original_unit_price", item_in.unit_price)
    _set_item_value_if_column(values, columns, "original_total_price", total_price)

    _set_item_value_if_column(
        values,
        columns,
        "is_manually_edited",
        item_in.is_manually_edited,
    )

    return values


@router.post(
    "/receipts/{receipt_id}/items/confirm",
    status_code=status.HTTP_201_CREATED,
)
def confirm_ocr_items(
    receipt_id: _uuid_for_ocr_items.UUID,
    items_in: OcrItemsConfirmCreate,
    db: Session = Depends(get_db),
):
    receipt = _get_receipt_for_ocr_items(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    if len(items_in.items) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EMPTY_ITEMS",
                "message": "At least one item is required.",
            },
        )

    item_columns = {
        column.name
        for column in _sa_inspect_for_ocr_items(_ItemForOcrItems).columns
    }

    saved_items = []

    for item_in in items_in.items:
        item_values = _build_confirmed_item_values(
            receipt_id=receipt_id,
            item_in=item_in,
            columns=item_columns,
        )

        item = _ItemForOcrItems(**item_values)
        db.add(item)
        saved_items.append(item)

    db.commit()

    for item in saved_items:
        db.refresh(item)

    return {
        "success": True,
        "data": [ItemRead.model_validate(item) for item in saved_items],
    }

