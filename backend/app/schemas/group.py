import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None


class GroupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: str | None
    created_by_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
