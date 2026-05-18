import uuid
from collections.abc import Sequence
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, update_record
from app.models.receipt import Receipt


def create_receipt(
    db: Session,
    *,
    expense_id: uuid.UUID,
    payer_id: uuid.UUID,
    subtotal_amount: Decimal,
    tax_amount: Decimal,
    service_charge_amount: Decimal,
    total_amount: Decimal,
    image_url: str | None = None,
    raw_ocr_text: str | None = None,
    source_type: str = "manual",
    status: str = "draft",
) -> Receipt:
    return create_record(
        db,
        Receipt,
        {
            "expense_id": expense_id,
            "payer_id": payer_id,
            "image_url": image_url,
            "raw_ocr_text": raw_ocr_text,
            "subtotal_amount": subtotal_amount,
            "tax_amount": tax_amount,
            "service_charge_amount": service_charge_amount,
            "total_amount": total_amount,
            "source_type": source_type,
            "status": status,
        },
    )


def get_receipt(
    db: Session,
    receipt_id: uuid.UUID,
) -> Receipt | None:
    return get_by_id(db, Receipt, receipt_id)


def list_receipts_by_expense(
    db: Session,
    expense_id: uuid.UUID,
) -> Sequence[Receipt]:
    statement = select(Receipt).where(Receipt.expense_id == expense_id)
    return db.execute(statement).scalars().all()


def update_receipt(
    db: Session,
    receipt: Receipt,
    data: dict,
) -> Receipt:
    return update_record(db, receipt, data)


def delete_receipt(
    db: Session,
    receipt: Receipt,
) -> None:
    delete_record(db, receipt)
