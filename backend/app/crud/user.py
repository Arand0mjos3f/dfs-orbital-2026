import uuid
from collections.abc import Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, list_records, update_record
from app.models.user import User


def create_user(
    db: Session,
    *,
    username: str,
    email: str,
    password_hash: str,
    avatar_url: str | None = None,
) -> User:
    return create_record(
        db,
        User,
        {
            "username": username,
            "email": email,
            "password_hash": password_hash,
            "avatar_url": avatar_url,
        },
    )


def get_user(
    db: Session,
    user_id: uuid.UUID,
) -> User | None:
    return get_by_id(db, User, user_id)


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    statement = select(User).where(User.email == email)
    return db.execute(statement).scalar_one_or_none()


def list_users(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
) -> Sequence[User]:
    return list_records(db, User, skip=skip, limit=limit)


def update_user(
    db: Session,
    user: User,
    data: dict,
) -> User:
    return update_record(db, user, data)


def delete_user(
    db: Session,
    user: User,
) -> None:
    delete_record(db, user)
