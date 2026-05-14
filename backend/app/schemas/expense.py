from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class ParticipantShare(BaseModel):
    """A participant's share of an expense."""

    name: str = Field(..., min_length=1, examples=["Alice"])
    amount: Decimal = Field(..., ge=0, examples=[12.50])


class ExpenseCreate(BaseModel):
    """Payload for creating a shared expense."""

    description: str = Field(..., min_length=1, examples=["Dinner receipt"])
    paid_by: str = Field(..., min_length=1, examples=["Bob"])
    currency: str = Field(default="SGD", min_length=3, max_length=3, examples=["SGD"])
    shares: list[ParticipantShare] = Field(default_factory=list)


class ExpenseRead(ExpenseCreate):
    """Expense response payload."""

    id: UUID
    total_amount: Decimal
