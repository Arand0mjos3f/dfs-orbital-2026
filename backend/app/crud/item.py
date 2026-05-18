import uuid
from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, update_record
from app.models.item import Item


def create_item(
    db: Session,
    *,
    receipt_id: uuid.UUID,
    name: str,
    quantity: int,
    unit_price: Decimal,
    total_price: Decimal,
    original_name: str | None = None,
    original_unit_price: Decimal | None = None,
    original_total_price: Decimal | None = None,
    is_manually_edited: bool = False,
) -> Item:
    return create_record(
        db,
        Item,
        {
            "receipt_id": receipt_id,
            "name": name,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_price": total_price,
            "original_name": original_name,
            "original_unit_price": original_unit_price,
            "original_total_price": original_total_price,
            "is_manually_edited": is_manually_edited,
        },
    )


def get_item(
    db: Session,
    item_id: uuid.UUID,
) -> Item | None:
    return get_by_id(db, Item, item_id)


def list_items_by_receipt(
    db: Session,
    receipt_id: uuid.UUID,
) -> Sequence[Item]:
    statement = select(Item).where(Item.receipt_id == receipt_id)
    return db.execute(statement).scalars().all()


def update_item(
    db: Session,
    item: Item,
    data: dict,
) -> Item:
    return update_record(db, item, data)


def delete_item(
    db: Session,
    item: Item,
) -> None:
    delete_record(db, item)
