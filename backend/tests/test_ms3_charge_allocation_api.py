from decimal import Decimal

from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user


def _money(value):
    return Decimal(str(value))


def _create_charge_context(db):
    users = [
        create_user(
            db,
            username=f"Charge User {index}",
            email=f"charge.user.{index}@example.com",
            password_hash="password123",
        )
        for index in range(3)
    ]
    group = create_group(
        db,
        name="Charge API Group",
        description="Charge allocation API tests",
        created_by_id=users[0].id,
    )
    for index, user in enumerate(users):
        create_group_member(
            db,
            group_id=group.id,
            user_id=user.id,
            role="owner" if index == 0 else "member",
        )
    expense = create_expense(
        db,
        group_id=group.id,
        title="Charge API Expense",
        description="Cent-safe allocation",
        created_by_id=users[0].id,
    )
    receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=users[0].id,
        subtotal_amount=Decimal("0.03"),
        tax_amount=Decimal("0.01"),
        service_charge_amount=Decimal("0.02"),
        total_amount=Decimal("0.06"),
    )
    item = create_item(
        db,
        receipt_id=receipt.id,
        name="Tiny Shared Item",
        quantity=1,
        unit_price=Decimal("0.03"),
        total_price=Decimal("0.03"),
    )
    return users, receipt, item


def test_allocate_charges_is_proportional_and_cent_safe(client, db):
    users, receipt, item = _create_charge_context(db)
    for user in users:
        create_item_share(
            db,
            item_id=item.id,
            user_id=user.id,
            item_share_amount=Decimal("0.01"),
            tax_share_amount=Decimal("0.00"),
            service_charge_share_amount=Decimal("0.00"),
            total_share_amount=Decimal("0.01"),
        )

    response = client.post(f"/api/v1/receipts/{receipt.id}/shares/allocate-charges")

    assert response.status_code == 200
    data = response.json()["data"]
    shares = data["shares"]

    assert data["item_share_count"] == 3
    assert _money(data["item_subtotal_amount"]) == Decimal("0.03")
    assert _money(data["tax_amount"]) == Decimal("0.01")
    assert _money(data["service_charge_amount"]) == Decimal("0.02")
    assert _money(data["total_allocated_amount"]) == Decimal("0.06")

    assert sum(_money(share["tax_share_amount"]) for share in shares) == Decimal("0.01")
    assert (
        sum(_money(share["service_charge_share_amount"]) for share in shares)
        == Decimal("0.02")
    )
    assert sum(_money(share["total_share_amount"]) for share in shares) == Decimal("0.06")

    for share in shares:
        expected_total = (
            _money(share["item_share_amount"])
            + _money(share["tax_share_amount"])
            + _money(share["service_charge_share_amount"])
        )
        assert _money(share["total_share_amount"]) == expected_total


def test_allocate_charges_without_item_shares_returns_clear_error(client, db):
    _, receipt, _ = _create_charge_context(db)

    response = client.post(f"/api/v1/receipts/{receipt.id}/shares/allocate-charges")

    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "NO_ITEM_SHARES"
