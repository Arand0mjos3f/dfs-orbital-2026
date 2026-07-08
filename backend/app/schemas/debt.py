import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DebtRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    group_id: uuid.UUID
    expense_id: uuid.UUID | None
    from_user_id: uuid.UUID
    to_user_id: uuid.UUID
    amount: Decimal
    status: str
    payment_proof_url: str | None
    created_at: datetime
    marked_paid_at: datetime | None
    confirmed_received_at: datetime | None
    settled_at: datetime | None


class DebtMarkPaid(BaseModel):
    payment_proof_url: str | None = None


class GroupMemberDebtSummaryRead(BaseModel):
    user_id: uuid.UUID
    owes_amount: Decimal
    owed_amount: Decimal
    net_amount: Decimal
    outstanding_transaction_count: int


class GroupDebtSummaryRead(BaseModel):
    group_id: uuid.UUID
    outstanding_amount: Decimal
    outstanding_debt_count: int
    settled_debt_count: int
    member_summaries: list[GroupMemberDebtSummaryRead]