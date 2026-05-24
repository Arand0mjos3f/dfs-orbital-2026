import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.item import get_item
from app.crud.item_share import (
    create_item_share,
    delete_item_share,
    get_item_share,
    list_item_shares_by_item,
    update_item_share,
)
from app.crud.user import get_user
from app.db.database import get_db
from app.schemas.item_share import (
    ItemShareBatchCreate,
    ItemShareRead,
    ItemShareUpdate,
)


router = APIRouter(tags=["item_shares"])


def _validate_share_total(
    item_share_amount: Decimal,
    tax_share_amount: Decimal,
    service_charge_share_amount: Decimal,
    total_share_amount: Decimal,
) -> None:
    expected_total = item_share_amount + tax_share_amount + service_charge_share_amount

    if expected_total.quantize(Decimal("0.01")) != total_share_amount.quantize(Decimal("0.01")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_SHARE_TOTAL",
                "message": "item_share_amount + tax_share_amount + service_charge_share_amount must match total_share_amount.",
            },
        )


@router.post(
    "/items/{item_id}/shares",
    status_code=status.HTTP_201_CREATED,
)
def create_item_shares(
    item_id: uuid.UUID,
    shares_in: ItemShareBatchCreate,
    db: Session = Depends(get_db),
):
    item = get_item(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_NOT_FOUND",
                "message": "The item does not exist.",
            },
        )

    created_shares = []

    for share_in in shares_in.shares:
        user = get_user(db, share_in.user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "USER_NOT_FOUND",
                    "message": "One or more users do not exist.",
                },
            )

        _validate_share_total(
            share_in.item_share_amount,
            share_in.tax_share_amount,
            share_in.service_charge_share_amount,
            share_in.total_share_amount,
        )

        item_share = create_item_share(
            db,
            item_id=item_id,
            user_id=share_in.user_id,
            item_share_amount=share_in.item_share_amount,
            tax_share_amount=share_in.tax_share_amount,
            service_charge_share_amount=share_in.service_charge_share_amount,
            total_share_amount=share_in.total_share_amount,
        )

        created_shares.append(item_share)

    return {
        "success": True,
        "data": [ItemShareRead.model_validate(share) for share in created_shares],
    }


@router.get("/items/{item_id}/shares")
def get_item_shares(
    item_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    item = get_item(db, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_NOT_FOUND",
                "message": "The item does not exist.",
            },
        )

    item_shares = list_item_shares_by_item(db, item_id)

    return {
        "success": True,
        "data": [ItemShareRead.model_validate(share) for share in item_shares],
    }


@router.patch("/item-shares/{item_share_id}")
def update_item_share_detail(
    item_share_id: uuid.UUID,
    share_in: ItemShareUpdate,
    db: Session = Depends(get_db),
):
    item_share = get_item_share(db, item_share_id)

    if item_share is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_SHARE_NOT_FOUND",
                "message": "The item share record does not exist.",
            },
        )

    update_data = share_in.model_dump(exclude_unset=True)

    item_share_amount = update_data.get(
        "item_share_amount",
        item_share.item_share_amount,
    )
    tax_share_amount = update_data.get(
        "tax_share_amount",
        item_share.tax_share_amount,
    )
    service_charge_share_amount = update_data.get(
        "service_charge_share_amount",
        item_share.service_charge_share_amount,
    )
    total_share_amount = update_data.get(
        "total_share_amount",
        item_share.total_share_amount,
    )

    _validate_share_total(
        item_share_amount,
        tax_share_amount,
        service_charge_share_amount,
        total_share_amount,
    )

    updated_share = update_item_share(db, item_share, update_data)

    return {
        "success": True,
        "data": ItemShareRead.model_validate(updated_share),
    }


@router.delete("/item-shares/{item_share_id}")
def delete_item_share_detail(
    item_share_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    item_share = get_item_share(db, item_share_id)

    if item_share is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "ITEM_SHARE_NOT_FOUND",
                "message": "The item share record does not exist.",
            },
        )

    delete_item_share(db, item_share)

    return {
        "success": True,
        "data": {
            "deleted_item_share_id": str(item_share_id),
        },
    }
