import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.crud.expense import (
    create_expense,
    get_expense,
    list_expenses_by_group,
    update_expense,
)
from app.crud.group import get_group, get_group_member
from app.crud.user import get_user
from app.db.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseRead, ExpenseUpdate


router = APIRouter(tags=["expenses"])


def _validate_expense_status(status_value: str) -> None:
    allowed_statuses = {"draft", "confirmed", "settled", "cancelled"}

    if status_value not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_EXPENSE_STATUS",
                "message": "Expense status must be draft, confirmed, settled, or cancelled.",
            },
        )


@router.post(
    "/groups/{group_id}/expenses",
    status_code=status.HTTP_201_CREATED,
)
def create_group_expense(
    group_id: uuid.UUID,
    expense_in: ExpenseCreate,
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

    creator = get_user(db, expense_in.created_by_id)

    if creator is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "USER_NOT_FOUND",
                "message": "The creator user does not exist.",
            },
        )

    member = get_group_member(db, group_id, expense_in.created_by_id)

    if member is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "NOT_GROUP_MEMBER",
                "message": "The creator is not a member of this group.",
            },
        )

    expense = create_expense(
        db,
        group_id=group_id,
        title=expense_in.title,
        description=expense_in.description,
        created_by_id=expense_in.created_by_id,
        status="draft",
    )

    return {
        "success": True,
        "data": ExpenseRead.model_validate(expense),
    }


@router.get("/groups/{group_id}/expenses")
def get_expenses_in_group(
    group_id: uuid.UUID,
    user_id: uuid.UUID | None = Query(default=None),
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

    if user_id is not None:
        member = get_group_member(db, group_id, user_id)

        if member is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "code": "NOT_GROUP_MEMBER",
                    "message": "The user is not a member of this group.",
                },
            )

    expenses = list_expenses_by_group(db, group_id)

    return {
        "success": True,
        "data": [ExpenseRead.model_validate(expense) for expense in expenses],
    }


@router.get("/expenses/{expense_id}")
def get_expense_detail(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    expense = get_expense(db, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EXPENSE_NOT_FOUND",
                "message": "The expense does not exist.",
            },
        )

    return {
        "success": True,
        "data": ExpenseRead.model_validate(expense),
    }


@router.patch("/expenses/{expense_id}")
def update_expense_detail(
    expense_id: uuid.UUID,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
):
    expense = get_expense(db, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EXPENSE_NOT_FOUND",
                "message": "The expense does not exist.",
            },
        )

    update_data = expense_in.model_dump(exclude_unset=True)

    if "status" in update_data:
        _validate_expense_status(update_data["status"])

    updated_expense = update_expense(db, expense, update_data)

    return {
        "success": True,
        "data": ExpenseRead.model_validate(updated_expense),
    }
