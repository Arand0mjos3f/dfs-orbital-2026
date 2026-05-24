from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.user import UserCreate, UserResponse
from app.crud.user import create_user 
from app.db.database import get_db

router = APIRouter()


@router.post("/", response_model=UserResponse)
def register_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user in the database.
    """
   
    new_user = create_user(
        db=db,
        username=user_in.username,
        email=user_in.email,
       
        password_hash=user_in.password, 
        avatar_url=user_in.avatar_url
    )
    return new_user