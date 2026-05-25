import uuid
from collections.abc import Sequence

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.crud.base import create_record, delete_record, get_by_id, update_record
from app.models.expense import Expense
from app.models.group import Group, GroupMember


def create_group(
    db: Session,
    *,
    name: str,
    created_by_id: uuid.UUID,
    description: str | None = None,
) -> Group:
    return create_record(
        db,
        Group,
        {
            "name": name,
            "description": description,
            "created_by_id": created_by_id,
        },
    )


def get_group(
    db: Session,
    group_id: uuid.UUID,
) -> Group | None:
    return get_by_id(db, Group, group_id)


def list_groups_for_user(
    db: Session,
    user_id: uuid.UUID,
) -> Sequence[Group]:
    statement = (
        select(Group)
        .join(GroupMember, Group.id == GroupMember.group_id)
        .where(GroupMember.user_id == user_id)
    )
    return db.execute(statement).scalars().all()


def create_group_member(
    db: Session,
    *,
    group_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str = "member",
) -> GroupMember:
    return create_record(
        db,
        GroupMember,
        {
            "group_id": group_id,
            "user_id": user_id,
            "role": role,
        },
    )


def get_group_member(
    db: Session,
    group_id: uuid.UUID,
    user_id: uuid.UUID,
) -> GroupMember | None:
    statement = select(GroupMember).where(
        GroupMember.group_id == group_id,
        GroupMember.user_id == user_id,
    )
    return db.execute(statement).scalar_one_or_none()


def list_group_members(
    db: Session,
    group_id: uuid.UUID,
) -> Sequence[GroupMember]:
    statement = select(GroupMember).where(GroupMember.group_id == group_id)
    return db.execute(statement).scalars().all()


def is_group_owner(
    db: Session,
    group_id: uuid.UUID,
    user_id: uuid.UUID,
) -> bool:
    member = get_group_member(db, group_id, user_id)
    return member is not None and member.role == "owner"


def update_group(
    db: Session,
    group: Group,
    data: dict,
) -> Group:
    return update_record(db, group, data)


def group_has_expenses(
    db: Session,
    group_id: uuid.UUID,
) -> bool:
    statement = select(Expense.id).where(Expense.group_id == group_id).limit(1)
    return db.execute(statement).scalar_one_or_none() is not None


def delete_group_members(
    db: Session,
    group_id: uuid.UUID,
) -> None:
    statement = delete(GroupMember).where(GroupMember.group_id == group_id)
    db.execute(statement)
    db.commit()


def delete_group(
    db: Session,
    group: Group,
) -> None:
    delete_record(db, group)
