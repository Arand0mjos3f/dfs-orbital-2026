from sqlalchemy.orm import Session
from uuid import UUID
from app.models.group import Group, GroupMember
from app.schemas.group import GroupCreate

class CRUDGroup:
    # WHY: We need to find all groups a specific user belongs to.
    # We use a SQL JOIN to connect the Groups table and the GroupMembers table.
    def get_multi_by_user(self, db: Session, user_id: UUID, skip: int = 0, limit: int = 100):
        return (
            db.query(Group)
            .join(GroupMember)
            .filter(GroupMember.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    # WHY: When a user creates a group, they don't just make the group. 
    # They must instantly become a member of that group with the role of "owner".
    # This must happen in a single database transaction.
    def create_with_owner(self, db: Session, *, obj_in: GroupCreate, owner_id: UUID) -> Group:
        # 1. Prepare the Group object
        db_obj = Group(
            name=obj_in.name,
            description=obj_in.description,
            created_by_id=owner_id
        )
        db.add(db_obj)
        db.flush() # WHY: flush() assigns a UUID to db_obj without finalizing the save yet.

        # 2. Prepare the GroupMember relationship
        member_obj = GroupMember(
            group_id=db_obj.id,
            user_id=owner_id,
            role="owner"
        )
        db.add(member_obj)
        
        # 3. Save both to the database simultaneously
        db.commit()
        db.refresh(db_obj)
        
        return db_obj

group = CRUDGroup()