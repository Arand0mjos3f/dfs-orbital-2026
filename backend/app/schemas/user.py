from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from uuid import UUID
from typing import Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True) 

class UserCreate(UserBase):
    password: str