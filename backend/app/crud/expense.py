import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, update_record
from app.models.expense import Expense


def create_expense(
    db: Session,
    *,
    group_id: uuid.UUID,
    title: str,
    created_by_id: uuid.UUID,
    description: str | None = None,
    status: str = "draft",
) -> Expense:
    return create_record(
        db,
        Expense,
        {
            "group_id": group_id,
            "title": title,
            "description": description,
            "status": status,
            "created_by_id": created_by_id,
        },
    )


def get_expense(
    db: Session,
    expense_id: uuid.UUID,
) -> Expense | None:
    return get_by_id(db, Expense, expense_id)


def list_expenses_by_group(
    db: Session,
    group_id: uuid.UUID,
) -> Sequence[Expense]:
    statement = select(Expense).where(Expense.group_id == group_id)
    return db.execute(statement).scalars().all()


def update_expense(
    db: Session,
    expense: Expense,
    data: dict,
) -> Expense:
    return update_record(db, expense, data)


def delete_expense(
    db: Session,
    expense: Expense,
) -> None:
    delete_record(db, expense)
