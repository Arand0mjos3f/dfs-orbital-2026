import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.group import (
    create_group,
    create_group_member,
    delete_group,
    delete_group_members,
    get_group,
    get_group_member,
    group_has_expenses,
    is_group_owner,
    list_group_members,
    list_groups_for_user,
    update_group,
)
from app.crud.user import get_user
from app.db.database import get_db
from app.schemas.group import (
    GroupCreate,
    GroupMemberCreate,
    GroupMemberRead,
    GroupRead,
    GroupUpdate,
)


router = APIRouter(tags=["groups"])


@router.post(
    "/groups",
    status_code=status.HTTP_201_CREATED,
)
def create_group_endpoint(
    group_in: GroupCreate,
    db: Session = Depends(get_db),
):
    creator = get_user(db, group_in.created_by_id)

    if creator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "The creator user does not exist.",
            },
        )

    group = create_group(
        db,
        name=group_in.name,
        description=group_in.description,
        created_by_id=group_in.created_by_id,
    )

    create_group_member(
        db,
        group_id=group.id,
        user_id=group_in.created_by_id,
        role="owner",
    )

    return {
        "success": True,
        "data": GroupRead.model_validate(group),
    }


@router.get("/groups")
def get_groups_for_user_endpoint(
    user_id: uuid.UUID = Query(...),
    db: Session = Depends(get_db),
):
    user = get_user(db, user_id)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "The user does not exist.",
            },
        )

    groups = list_groups_for_user(db, user_id)

    return {
        "success": True,
        "data": [GroupRead.model_validate(group) for group in groups],
    }


@router.get("/groups/{group_id}")
def get_group_detail_endpoint(
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

    member = get_group_member(db, group_id, user_id)

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_GROUP_MEMBER",
                "message": "The user is not a member of this group.",
            },
        )

    return {
        "success": True,
        "data": GroupRead.model_validate(group),
    }


@router.post(
    "/groups/{group_id}/members",
    status_code=status.HTTP_201_CREATED,
)
def add_group_member_endpoint(
    group_id: uuid.UUID,
    member_in: GroupMemberCreate,
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
                "message": "Only group owners can add members.",
            },
        )

    new_user = get_user(db, member_in.user_id)

    if new_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "The user does not exist.",
            },
        )

    existing_member = get_group_member(db, group_id, member_in.user_id)

    if existing_member is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DUPLICATE_MEMBERSHIP",
                "message": "The user is already a member of this group.",
            },
        )

    member = create_group_member(
        db,
        group_id=group_id,
        user_id=member_in.user_id,
        role=member_in.role,
    )

    return {
        "success": True,
        "data": GroupMemberRead.model_validate(member),
    }


@router.get("/groups/{group_id}/members")
def get_group_members_endpoint(
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

    member = get_group_member(db, group_id, user_id)

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_GROUP_MEMBER",
                "message": "The user is not a member of this group.",
            },
        )

    members = list_group_members(db, group_id)

    return {
        "success": True,
        "data": [GroupMemberRead.model_validate(member) for member in members],
    }


@router.patch("/groups/{group_id}")
def update_group_detail_endpoint(
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
def delete_group_detail_endpoint(
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
