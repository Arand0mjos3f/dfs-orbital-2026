import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ExpenseCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str | None = None
    created_by_id: uuid.UUID


class ExpenseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    status: str | None = None


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    group_id: uuid.UUID
    title: str
    description: str | None
    status: str
    created_by_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
