from fastapi import APIRouter, status

from app.schemas.expense import ExpenseCreate, ExpenseRead
from app.services.expense_service import expense_service

router = APIRouter()


@router.get("", response_model=list[ExpenseRead])
def list_expenses() -> list[ExpenseRead]:
    """List expenses recorded during the current server process."""

    return expense_service.list_expenses()


@router.post("", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate) -> ExpenseRead:
    """Create a shared expense from participant shares."""

    return expense_service.create_expense(expense)
