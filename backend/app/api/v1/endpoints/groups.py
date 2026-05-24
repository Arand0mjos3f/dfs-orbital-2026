from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List

from app.schemas.group import GroupCreate, GroupResponse
from app.crud.group import group as crud_group


from app.db.database import get_db 

router = APIRouter()

@router.get("/", response_model=List[GroupResponse])
def read_groups(
    user_id: UUID, # ⚠️ Temporary: Eventually we will get this from the Auth Token
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all groups that the specified user belongs to.
    """
    groups = crud_group.get_multi_by_user(db=db, user_id=user_id, skip=skip, limit=limit)
    return groups

@router.post("/", response_model=GroupResponse)
def create_group(
    group_in: GroupCreate,
    owner_id: UUID, # ⚠️ Temporary: Eventually we will get this from the Auth Token
    db: Session = Depends(get_db)
):
    """
    Create a new group and automatically assign the creator as the 'owner'.
    """
    new_group = crud_group.create_with_owner(db=db, obj_in=group_in, owner_id=owner_id)
    return new_group