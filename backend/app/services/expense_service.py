from decimal import Decimal
from uuid import uuid4

from app.schemas.expense import ExpenseCreate, ExpenseRead


class ExpenseService:
    """In-memory expense service used until persistence is added."""

    def __init__(self) -> None:
        self._expenses: list[ExpenseRead] = []

    def list_expenses(self) -> list[ExpenseRead]:
        """Return all recorded expenses."""

        return self._expenses

    def create_expense(self, expense: ExpenseCreate) -> ExpenseRead:
        """Create a new expense and calculate its total from participant shares."""

        total_amount = sum((share.amount for share in expense.shares), Decimal("0"))
        created_expense = ExpenseRead(
            id=uuid4(),
            total_amount=total_amount,
            **expense.model_dump(),
        )
        self._expenses.append(created_expense)
        return created_expense


expense_service = ExpenseService()
