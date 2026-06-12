import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ReceiptCreate(BaseModel):
    payer_id: uuid.UUID
    subtotal_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    tax_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    service_charge_amount: Decimal = Field(default=Decimal("0.00"), ge=0)
    total_amount: Decimal = Field(ge=0)


class ReceiptUpdate(BaseModel):
    subtotal_amount: Decimal | None = Field(default=None, ge=0)
    tax_amount: Decimal | None = Field(default=None, ge=0)
    service_charge_amount: Decimal | None = Field(default=None, ge=0)
    total_amount: Decimal | None = Field(default=None, ge=0)
    status: str | None = None


class ReceiptRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    expense_id: uuid.UUID
    payer_id: uuid.UUID
    image_url: str | None
    raw_ocr_text: str | None
    subtotal_amount: Decimal
    tax_amount: Decimal
    service_charge_amount: Decimal
    total_amount: Decimal
    source_type: str
    status: str
    uploaded_at: datetime

class ReceiptOcrItemRead(BaseModel):
    name: str
    original_name: str
    unit_price: Decimal
    quantity: int
    total_price: Decimal
    is_manually_edited: bool


class ReceiptUploadRead(BaseModel):
    receipt: ReceiptRead
    items: list[ReceiptOcrItemRead]
    raw_ocr_text: str