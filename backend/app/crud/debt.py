import uuid
from collections.abc import Sequence
from datetime import datetime
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, get_by_id, list_records, update_record
from app.models.debt import Debt


def create_debt(
    db: Session,
    *,
    group_id: uuid.UUID,
    from_user_id: uuid.UUID,
    to_user_id: uuid.UUID,
    amount: Decimal,
    expense_id: uuid.UUID | None = None,
    status: str = "pending",
) -> Debt:
    return create_record(
        db,
        Debt,
        {
            "group_id": group_id,
            "expense_id": expense_id,
            "from_user_id": from_user_id,
            "to_user_id": to_user_id,
            "amount": amount,
            "status": status,
        },
    )


def get_debt(
    db: Session,
    debt_id: uuid.UUID,
) -> Debt | None:
    return get_by_id(db, Debt, debt_id)


def list_debts(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[Debt]:
    return list_records(db, Debt, skip=skip, limit=limit)


def list_debts_by_group(
    db: Session,
    group_id: uuid.UUID,
) -> Sequence[Debt]:
    statement = select(Debt).where(Debt.group_id == group_id)
    return db.execute(statement).scalars().all()


def list_debts_by_expense(
    db: Session,
    expense_id: uuid.UUID,
) -> Sequence[Debt]:
    statement = select(Debt).where(Debt.expense_id == expense_id)
    return db.execute(statement).scalars().all()


def update_debt(
    db: Session,
    debt: Debt,
    data: dict,
) -> Debt:
    return update_record(db, debt, data)
