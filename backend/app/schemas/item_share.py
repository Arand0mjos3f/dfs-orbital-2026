import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ItemShareCreate(BaseModel):
    user_id: uuid.UUID
    item_share_amount: Decimal = Field(ge=0)
    tax_share_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    service_charge_share_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_share_amount: Decimal = Field(ge=0)


class ItemShareBatchCreate(BaseModel):
    shares: list[ItemShareCreate]


class ItemShareUpdate(BaseModel):
    item_share_amount: Decimal | None = Field(default=None, ge=0)
    tax_share_amount: Decimal | None = Field(default=None, ge=0)
    service_charge_share_amount: Decimal | None = Field(default=None, ge=0)
    total_share_amount: Decimal | None = Field(default=None, ge=0)


class ItemShareRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    item_id: uuid.UUID
    user_id: uuid.UUID
    item_share_amount: Decimal
    tax_share_amount: Decimal
    service_charge_share_amount: Decimal
    total_share_amount: Decimal
    created_at: datetime

class ItemShareEqualSplitCreate(BaseModel):
    user_ids: list[uuid.UUID]
    replace_existing: bool = True

class ReceiptChargeAllocationRead(BaseModel):
    receipt_id: uuid.UUID
    item_share_count: int
    item_subtotal_amount: Decimal
    tax_amount: Decimal
    service_charge_amount: Decimal
    total_allocated_amount: Decimal
    shares: list[ItemShareRead]

