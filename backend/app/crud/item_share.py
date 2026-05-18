import uuid
from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, update_record
from app.models.item_share import ItemShare


def create_item_share(
    db: Session,
    *,
    item_id: uuid.UUID,
    user_id: uuid.UUID,
    item_share_amount: Decimal,
    tax_share_amount: Decimal,
    service_charge_share_amount: Decimal,
    total_share_amount: Decimal,
) -> ItemShare:
    return create_record(
        db,
        ItemShare,
        {
            "item_id": item_id,
            "user_id": user_id,
            "item_share_amount": item_share_amount,
            "tax_share_amount": tax_share_amount,
            "service_charge_share_amount": service_charge_share_amount,
            "total_share_amount": total_share_amount,
        },
    )


def get_item_share(
    db: Session,
    item_share_id: uuid.UUID,
) -> ItemShare | None:
    return get_by_id(db, ItemShare, item_share_id)


def list_item_shares_by_item(
    db: Session,
    item_id: uuid.UUID,
) -> Sequence[ItemShare]:
    statement = select(ItemShare).where(ItemShare.item_id == item_id)
    return db.execute(statement).scalars().all()


def update_item_share(
    db: Session,
    item_share: ItemShare,
    data: dict,
) -> ItemShare:
    return update_record(db, item_share, data)


def delete_item_share(
    db: Session,
    item_share: ItemShare,
) -> None:
    delete_record(db, item_share)
