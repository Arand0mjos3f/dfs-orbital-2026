import uuid
from decimal import Decimal

from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user


def _money(value):
    return Decimal(str(value))


def _create_group_expense(db, *, title="Split Preview Expense"):
    payer = create_user(
        db,
        username=f"Payer {title}",
        email=f"{title.lower().replace(' ', '.')}@example.com",
        password_hash="password123",
    )
    member = create_user(
        db,
        username=f"Member {title}",
        email=f"{title.lower().replace(' ', '.')}.member@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name=f"{title} Group",
        description="Split preview tests",
        created_by_id=payer.id,
    )
    create_group_member(db, group_id=group.id, user_id=payer.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=member.id, role="member")
    expense = create_expense(
        db,
        group_id=group.id,
        title=title,
        description="Fair split preview",
        created_by_id=payer.id,
    )
    return payer, member, expense


def _create_ready_expense(db):
    payer, member, expense = _create_group_expense(db)
    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=payer.id,
        subtotal_amount=Decimal("8.70"),
        tax_amount=Decimal("0.70"),
        service_charge_amount=Decimal("1.30"),
        total_amount=Decimal("10.70"),
    )
    tea = create_item(
        db,
        receipt_id=receipt.id,
        name="Iced Lemon Tea",
        quantity=1,
        unit_price=Decimal("3.20"),
        total_price=Decimal("3.20"),
    )
    chicken = create_item(
        db,
        receipt_id=receipt.id,
        name="Chicken Rice",
        quantity=1,
        unit_price=Decimal("5.50"),
        total_price=Decimal("5.50"),
    )
    create_item_share(
        db,
        item_id=tea.id,
        user_id=payer.id,
        item_share_amount=Decimal("3.20"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("3.20"),
    )
    create_item_share(
        db,
        item_id=chicken.id,
        user_id=payer.id,
        item_share_amount=Decimal("2.75"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("2.75"),
    )
    create_item_share(
        db,
        item_id=chicken.id,
        user_id=member.id,
        item_share_amount=Decimal("2.75"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("2.75"),
    )
    return payer, member, expense, receipt


def test_split_preview_returns_users_receipts_debts_rounding_and_warnings(client, db):
    payer, member, expense, receipt = _create_ready_expense(db)

    allocation_response = client.post(
        f"/api/v1/receipts/{receipt.id}/shares/allocate-charges"
    )
    assert allocation_response.status_code == 200

    response = client.post(f"/api/v1/expenses/{expense.id}/split/preview")

    assert response.status_code == 200
    data = response.json()["data"]
    assert set(data) == {
        "users",
        "receipts",
        "suggested_debts",
        "rounding",
        "warnings",
    }

    users_by_id = {user["id"]: user for user in data["users"]}
    payer_summary = users_by_id[str(payer.id)]
    member_summary = users_by_id[str(member.id)]

    for summary in (payer_summary, member_summary):
        assert {
            "item_subtotal",
            "tax_share",
            "service_charge_share",
            "total_share",
        }.issubset(summary)

    assert _money(payer_summary["item_subtotal"]) == Decimal("5.95")
    assert _money(payer_summary["tax_share"]) == Decimal("0.48")
    assert _money(payer_summary["service_charge_share"]) == Decimal("0.89")
    assert _money(payer_summary["total_share"]) == Decimal("7.32")

    assert _money(member_summary["item_subtotal"]) == Decimal("2.75")
    assert _money(member_summary["tax_share"]) == Decimal("0.22")
    assert _money(member_summary["service_charge_share"]) == Decimal("0.41")
    assert _money(member_summary["total_share"]) == Decimal("3.38")

    assert len(data["receipts"]) == 1
    assert data["receipts"][0]["id"] == str(receipt.id)
    assert _money(data["rounding"]["total_receipt_amount"]) == Decimal("10.70")
    assert _money(data["rounding"]["total_user_share_amount"]) == Decimal("10.70")
    assert _money(data["rounding"]["delta"]) == Decimal("0.00")
    assert data["warnings"] == []

    assert len(data["suggested_debts"]) == 1
    suggested_debt = data["suggested_debts"][0]
    assert suggested_debt["group_id"] == str(expense.group_id)
    assert suggested_debt["from_user_id"] == str(member.id)
    assert suggested_debt["to_user_id"] == str(payer.id)
    assert _money(suggested_debt["amount"]) == Decimal("3.38")


def test_split_preview_missing_expense_returns_expense_not_found(client):
    response = client.post(f"/api/v1/expenses/{uuid.uuid4()}/split/preview")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_FOUND"


def test_split_preview_expense_with_no_receipts_returns_not_ready(client, db):
    _, _, expense = _create_group_expense(db, title="No Receipts")

    response = client.post(f"/api/v1/expenses/{expense.id}/split/preview")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_READY"


def test_split_preview_receipts_without_item_shares_returns_not_ready(client, db):
    payer, _, expense = _create_group_expense(db, title="No Shares")
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
        name="Unassigned Item",
        quantity=1,
        unit_price=Decimal("4.00"),
        total_price=Decimal("4.00"),
    )

    response = client.post(f"/api/v1/expenses/{expense.id}/split/preview")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_READY"
