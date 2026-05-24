from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

# WHY: The JSON payload React sends when a user clicks "Create Group"
class GroupCreate(BaseModel):
    name: str
    description: str

# WHY: The JSON response FastAPI sends back to React
class GroupResponse(BaseModel):
    id: UUID
    name: str
    description: str
    created_by_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# WHY: Represents the relationship between a user and a group
class GroupMemberResponse(BaseModel):
    id: UUID
    group_id: UUID
    user_id: UUID
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)