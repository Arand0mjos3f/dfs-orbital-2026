import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.group import (
    delete_group,
    delete_group_members,
    get_group,
    group_has_expenses,
    is_group_owner,
    update_group,
)
from app.db.database import get_db
from app.schemas.group import GroupRead, GroupUpdate


router = APIRouter(tags=["groups"])


@router.patch("/groups/{group_id}")
def update_group_detail(
    group_id: uuid.UUID,
    group_in: GroupUpdate,
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    group = get_group(db, group_id)

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "GROUP_NOT_FOUND",
                "message": "The group does not exist.",
            },
        )

    if not is_group_owner(db, group_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "INSUFFICIENT_PERMISSION",
                "message": "Only group owners can update group information.",
            },
        )

    update_data = group_in.model_dump(exclude_unset=True)

    updated_group = update_group(db, group, update_data)

    return {
        "success": True,
        "data": GroupRead.model_validate(updated_group),
    }


@router.delete("/groups/{group_id}")
def delete_group_detail(
    group_id: uuid.UUID,
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    group = get_group(db, group_id)

    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "GROUP_NOT_FOUND",
                "message": "The group does not exist.",
            },
        )

    if not is_group_owner(db, group_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "INSUFFICIENT_PERMISSION",
                "message": "Only group owners can delete this group.",
            },
        )

    if group_has_expenses(db, group_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "GROUP_HAS_EXPENSES",
                "message": "This group has expenses and cannot be deleted directly.",
            },
        )

    delete_group_members(db, group_id)
    delete_group(db, group)

    return {
        "success": True,
        "data": {
            "deleted_group_id": str(group_id),
        },
    }
