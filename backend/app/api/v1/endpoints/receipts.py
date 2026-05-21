import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.crud.expense import get_expense
from app.crud.receipt import (
    create_receipt,
    get_receipt,
    list_receipts_by_expense,
    update_receipt,
)
from app.crud.user import get_user
from app.db.database import get_db
from app.schemas.receipt import ReceiptCreate, ReceiptRead, ReceiptUpdate


router = APIRouter(tags=["receipts"])


def _validate_receipt_total(
    subtotal_amount: Decimal,
    tax_amount: Decimal,
    service_charge_amount: Decimal,
    total_amount: Decimal,
) -> None:
    expected_total = subtotal_amount + tax_amount + service_charge_amount

    if expected_total.quantize(Decimal("0.01")) != total_amount.quantize(Decimal("0.01")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_RECEIPT_TOTAL",
                "message": "subtotal_amount + tax_amount + service_charge_amount must match total_amount.",
            },
        )


@router.post(
    "/expenses/{expense_id}/receipts",
    status_code=status.HTTP_201_CREATED,
)
def create_manual_receipt(
    expense_id: uuid.UUID,
    receipt_in: ReceiptCreate,
    db: Session = Depends(get_db),
):
    expense = get_expense(db, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EXPENSE_NOT_FOUND",
                "message": "The expense does not exist.",
            },
        )

    payer = get_user(db, receipt_in.payer_id)

    if payer is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "PAYER_NOT_FOUND",
                "message": "The payer does not exist.",
            },
        )

    _validate_receipt_total(
        receipt_in.subtotal_amount,
        receipt_in.tax_amount,
        receipt_in.service_charge_amount,
        receipt_in.total_amount,
    )

    receipt = create_receipt(
        db,
        expense_id=expense_id,
        payer_id=receipt_in.payer_id,
        subtotal_amount=receipt_in.subtotal_amount,
        tax_amount=receipt_in.tax_amount,
        service_charge_amount=receipt_in.service_charge_amount,
        total_amount=receipt_in.total_amount,
        source_type="manual",
        status="draft",
    )

    return {
        "success": True,
        "data": ReceiptRead.model_validate(receipt),
    }


@router.get("/expenses/{expense_id}/receipts")
def get_receipts_in_expense(
    expense_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    expense = get_expense(db, expense_id)

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "EXPENSE_NOT_FOUND",
                "message": "The expense does not exist.",
            },
        )

    receipts = list_receipts_by_expense(db, expense_id)

    return {
        "success": True,
        "data": [ReceiptRead.model_validate(receipt) for receipt in receipts],
    }


@router.get("/receipts/{receipt_id}")
def get_receipt_detail(
    receipt_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    receipt = get_receipt(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    return {
        "success": True,
        "data": ReceiptRead.model_validate(receipt),
    }


@router.patch("/receipts/{receipt_id}")
def update_receipt_detail(
    receipt_id: uuid.UUID,
    receipt_in: ReceiptUpdate,
    db: Session = Depends(get_db),
):
    receipt = get_receipt(db, receipt_id)

    if receipt is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "RECEIPT_NOT_FOUND",
                "message": "The receipt does not exist.",
            },
        )

    update_data = receipt_in.model_dump(exclude_unset=True)

    subtotal_amount = update_data.get("subtotal_amount", receipt.subtotal_amount)
    tax_amount = update_data.get("tax_amount", receipt.tax_amount)
    service_charge_amount = update_data.get(
        "service_charge_amount",
        receipt.service_charge_amount,
    )
    total_amount = update_data.get("total_amount", receipt.total_amount)

    _validate_receipt_total(
        subtotal_amount,
        tax_amount,
        service_charge_amount,
        total_amount,
    )

    updated_receipt = update_receipt(db, receipt, update_data)

    return {
        "success": True,
        "data": ReceiptRead.model_validate(updated_receipt),
    }
