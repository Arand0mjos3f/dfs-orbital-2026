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

from decimal import ROUND_HALF_UP as _ROUND_HALF_UP_FOR_EQUAL_SPLIT

from app.schemas.item_share import ItemShareEqualSplitCreate


def _split_amount_equally(amount: Decimal, count: int) -> list[Decimal]:
    amount = amount.quantize(Decimal("0.01"), rounding=_ROUND_HALF_UP_FOR_EQUAL_SPLIT)
    total_cents = int(amount * Decimal("100"))

    base_cents = total_cents // count
    remainder_cents = total_cents % count

    shares = []

    for index in range(count):
        cents = base_cents

        if index < remainder_cents:
            cents += 1

        shares.append((Decimal(cents) / Decimal("100")).quantize(Decimal("0.01")))

    return shares


@router.post(
    "/items/{item_id}/shares/equal",
    status_code=status.HTTP_201_CREATED,
)
def create_equal_item_shares(
    item_id: uuid.UUID,
    split_in: ItemShareEqualSplitCreate,
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

    if len(split_in.user_ids) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "EMPTY_USERS",
                "message": "At least one user is required.",
            },
        )

    if len(set(split_in.user_ids)) != len(split_in.user_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "DUPLICATE_USERS",
                "message": "Duplicate users are not allowed.",
            },
        )

    for user_id in split_in.user_ids:
        user = get_user(db, user_id)

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "USER_NOT_FOUND",
                    "message": "One or more users do not exist.",
                },
            )

    existing_shares = list_item_shares_by_item(db, item_id)

    if existing_shares and not split_in.replace_existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "code": "ITEM_SHARES_ALREADY_EXIST",
                "message": "This item already has share records.",
            },
        )

    if existing_shares and split_in.replace_existing:
        for existing_share in existing_shares:
            delete_item_share(db, existing_share)

    share_amounts = _split_amount_equally(item.total_price, len(split_in.user_ids))

    created_shares = []

    for user_id, share_amount in zip(split_in.user_ids, share_amounts, strict=True):
        item_share = create_item_share(
            db,
            item_id=item_id,
            user_id=user_id,
            item_share_amount=share_amount,
            tax_share_amount=Decimal("0.00"),
            service_charge_share_amount=Decimal("0.00"),
            total_share_amount=share_amount,
        )

        created_shares.append(item_share)

    return {
        "success": True,
        "data": [ItemShareRead.model_validate(share) for share in created_shares],
    }

