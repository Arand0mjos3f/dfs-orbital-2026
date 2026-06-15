from collections.abc import Sequence
from typing import Any, TypeVar

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import Base


ModelT = TypeVar("ModelT", bound=Base)


def get_by_id(
    db: Session,
    model: type[ModelT],
    record_id: Any,
) -> ModelT | None:
    return db.get(model, record_id)


def list_records(
    db: Session,
    model: type[ModelT],
    *,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[ModelT]:
    statement = select(model).offset(skip).limit(limit)
    return db.execute(statement).scalars().all()

def create_record(
    db: Session,
    model: type[ModelT],
    data: dict[str, Any],
) -> ModelT:
    record = model(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_record(
    db: Session,
    record: ModelT,
    data: dict[str, Any],
) -> ModelT:
    for field, value in data.items():
        if not hasattr(record, field):
            raise ValueError(f"Invalid field for update: {field}")
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return record


def delete_record(
    db: Session,
    record: ModelT,
) -> None:
    db.delete(record)
    db.commit()