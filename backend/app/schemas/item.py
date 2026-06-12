import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class ItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(ge=0)
    total_price: Decimal = Field(ge=0)


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    quantity: int | None = Field(default=None, ge=1)
    unit_price: Decimal | None = Field(default=None, ge=0)
    total_price: Decimal | None = Field(default=None, ge=0)


class ItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    receipt_id: uuid.UUID
    name: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    original_name: str | None
    original_unit_price: Decimal | None
    original_total_price: Decimal | None
    is_manually_edited: bool
    created_at: datetime
    updated_at: datetime

from decimal import Decimal as _DecimalForOcrItem
from pydantic import BaseModel as _BaseModelForOcrItem
from pydantic import Field as _FieldForOcrItem


class OcrItemConfirmCreate(_BaseModelForOcrItem):
    name: str = _FieldForOcrItem(min_length=1)
    original_name: str | None = None
    unit_price: _DecimalForOcrItem = _FieldForOcrItem(ge=0)
    quantity: int = _FieldForOcrItem(default=1, ge=1)
    total_price: _DecimalForOcrItem | None = _FieldForOcrItem(default=None, ge=0)
    is_manually_edited: bool = False


class OcrItemsConfirmCreate(_BaseModelForOcrItem):
    items: list[OcrItemConfirmCreate]

