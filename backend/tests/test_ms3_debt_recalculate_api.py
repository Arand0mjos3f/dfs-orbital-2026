import uuid
from decimal import Decimal

from app.crud.debt import list_debts_by_expense
from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share, update_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user


def _money(value):
    return Decimal(str(value))


def _create_recalculate_context(db):
    payer = create_user(
        db,
        username="Debt Payer",
        email="debt.payer@example.com",
        password_hash="password123",
    )
    member = create_user(
        db,
        username="Debt Member",
        email="debt.member@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name="Debt API Group",
        description="Debt recalculation tests",
        created_by_id=payer.id,
    )
    create_group_member(db, group_id=group.id, user_id=payer.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=member.id, role="member")
    expense = create_expense(
        db,
        group_id=group.id,
        title="Debt Recalculate Expense",
        description="Latest shares should win",
        created_by_id=payer.id,
    )
    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=payer.id,
        subtotal_amount=Decimal("10.00"),
        tax_amount=Decimal("0.00"),
        service_charge_amount=Decimal("0.00"),
        total_amount=Decimal("10.00"),
    )
    item = create_item(
        db,
        receipt_id=receipt.id,
        name="Shared Meal",
        quantity=1,
        unit_price=Decimal("10.00"),
        total_price=Decimal("10.00"),
    )
    payer_share = create_item_share(
        db,
        item_id=item.id,
        user_id=payer.id,
        item_share_amount=Decimal("5.00"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("5.00"),
    )
    member_share = create_item_share(
        db,
        item_id=item.id,
        user_id=member.id,
        item_share_amount=Decimal("5.00"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("5.00"),
    )
    return payer, member, expense, payer_share, member_share


def test_recalculate_creates_pending_then_cancels_and_recreates_from_latest_shares(
    client,
    db,
):
    payer, member, expense, payer_share, member_share = _create_recalculate_context(db)

    first_response = client.post(f"/api/v1/expenses/{expense.id}/debts/recalculate")

    assert first_response.status_code == 201
    first_data = first_response.json()["data"]
    assert first_data["cancelled_debt_count"] == 0
    assert len(first_data["created_debts"]) == 1
    first_debt = first_data["created_debts"][0]
    assert first_debt["from_user_id"] == str(member.id)
    assert first_debt["to_user_id"] == str(payer.id)
    assert _money(first_debt["amount"]) == Decimal("5.00")
    assert first_debt["status"] == "pending"

    update_item_share(
        db,
        payer_share,
        {
            "item_share_amount": Decimal("3.00"),
            "total_share_amount": Decimal("3.00"),
        },
    )
    update_item_share(
        db,
        member_share,
        {
            "item_share_amount": Decimal("7.00"),
            "total_share_amount": Decimal("7.00"),
        },
    )

    second_response = client.post(f"/api/v1/expenses/{expense.id}/debts/recalculate")

    assert second_response.status_code == 201
    second_data = second_response.json()["data"]
    assert second_data["cancelled_debt_count"] == 1
    assert len(second_data["created_debts"]) == 1
    second_debt = second_data["created_debts"][0]
    assert second_debt["id"] != first_debt["id"]
    assert second_debt["from_user_id"] == str(member.id)
    assert second_debt["to_user_id"] == str(payer.id)
    assert _money(second_debt["amount"]) == Decimal("7.00")
    assert second_debt["status"] == "pending"

    debts = list_debts_by_expense(db, expense.id)
    assert {debt.status for debt in debts} == {"cancelled", "pending"}
    old_debt = next(debt for debt in debts if str(debt.id) == first_debt["id"])
    assert old_debt.status == "cancelled"


def test_recalculate_missing_expense_returns_expense_not_found(client):
    response = client.post(f"/api/v1/expenses/{uuid.uuid4()}/debts/recalculate")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_FOUND"


def test_recalculate_expense_without_item_shares_returns_not_ready(client, db):
    payer = create_user(
        db,
        username="No Share Payer",
        email="no.share.payer@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name="No Share Debt Group",
        description="No shares",
        created_by_id=payer.id,
    )
    create_group_member(db, group_id=group.id, user_id=payer.id, role="owner")
    expense = create_expense(
        db,
        group_id=group.id,
        title="No Share Expense",
        description="Not ready",
        created_by_id=payer.id,
    )
    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=payer.id,
        subtotal_amount=Decimal("4.00"),
        tax_amount=Decimal("0.00"),
        service_charge_amount=Decimal("0.00"),
        total_amount=Decimal("4.00"),
    )
    create_item(
        db,
        receipt_id=receipt.id,
        name="Unshared Item",
        quantity=1,
        unit_price=Decimal("4.00"),
        total_price=Decimal("4.00"),
    )

    response = client.post(f"/api/v1/expenses/{expense.id}/debts/recalculate")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_READY"
