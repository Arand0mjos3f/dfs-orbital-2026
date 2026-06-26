from decimal import Decimal

from app.api.v1.endpoints.debts import (
    calculate_debts_for_expense,
    confirm_debt_received,
    mark_debt_as_paid,
)
from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user
from app.schemas.debt import DebtMarkPaid


def test_settlement_calculation_and_payment_lifecycle(db):
    sixian = create_user(
        db,
        username="Sixian",
        email="sixian.test@example.com",
        password_hash="password123",
    )
    jingyi = create_user(
        db,
        username="Jingyi",
        email="jingyi.test@example.com",
        password_hash="password123",
    )

    group = create_group(
        db,
        name="Integration Test Group",
        description="Settlement integration test",
        created_by_id=sixian.id,
    )

    create_group_member(
        db,
        group_id=group.id,
        user_id=sixian.id,
        role="owner",
    )
    create_group_member(
        db,
        group_id=group.id,
        user_id=jingyi.id,
        role="member",
    )

    expense = create_expense(
        db,
        group_id=group.id,
        title="Integration Test Expense",
        description="Shared meal",
        created_by_id=sixian.id,
    )

    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=sixian.id,
        subtotal_amount=Decimal("10.00"),
        tax_amount=Decimal("0.00"),
        service_charge_amount=Decimal("0.00"),
        total_amount=Decimal("10.00"),
    )

    item = create_item(
        db,
        receipt_id=receipt.id,
        name="Shared Item",
        quantity=1,
        unit_price=Decimal("10.00"),
        total_price=Decimal("10.00"),
    )

    create_item_share(
        db,
        item_id=item.id,
        user_id=sixian.id,
        item_share_amount=Decimal("5.00"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("5.00"),
    )
    create_item_share(
        db,
        item_id=item.id,
        user_id=jingyi.id,
        item_share_amount=Decimal("5.00"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("5.00"),
    )

    calculation = calculate_debts_for_expense(expense.id, db)
    calculated_debts = calculation["data"]

    assert calculation["success"] is True
    assert len(calculated_debts) == 1

    debt = calculated_debts[0]

    assert debt.from_user_id == jingyi.id
    assert debt.to_user_id == sixian.id
    assert debt.amount == Decimal("5.00")
    assert debt.status == "pending"

    marked_paid = mark_debt_as_paid(
        debt.id,
        DebtMarkPaid(payment_proof_url=None),
        jingyi.id,
        db,
    )

    assert marked_paid["data"].status == "marked_paid"
    assert marked_paid["data"].marked_paid_at is not None

    confirmed = confirm_debt_received(
        debt.id,
        sixian.id,
        db,
    )

    assert confirmed["data"].status == "confirmed_received"
    assert confirmed["data"].confirmed_received_at is not None
    assert confirmed["data"].settled_at is not None