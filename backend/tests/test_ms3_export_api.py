import csv
import io
import uuid
from decimal import Decimal

from app.crud.debt import create_debt
from app.crud.expense import create_expense
from app.crud.group import create_group, create_group_member
from app.crud.item import create_item
from app.crud.item_share import create_item_share
from app.crud.receipt import create_receipt
from app.crud.user import create_user
from app.services.export_service import build_expense_report, format_money


def _create_export_context(db):
    payer = create_user(
        db,
        username="Sixian Export",
        email="sixian.export@example.com",
        password_hash="password123",
    )
    member = create_user(
        db,
        username="Jingyi Export",
        email="jingyi.export@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name="Export Test Group",
        description="Expense export tests",
        created_by_id=payer.id,
    )
    create_group_member(db, group_id=group.id, user_id=payer.id, role="owner")
    create_group_member(db, group_id=group.id, user_id=member.id, role="member")
    expense = create_expense(
        db,
        group_id=group.id,
        title="Team Dinner Export",
        description="Dinner report",
        created_by_id=payer.id,
        status="settlement_current",
    )

    first_receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=payer.id,
        subtotal_amount=Decimal("10.00"),
        tax_amount=Decimal("0.80"),
        service_charge_amount=Decimal("1.20"),
        total_amount=Decimal("12.00"),
        source_type="ocr",
        status="confirmed",
    )
    noodles = create_item(
        db,
        receipt_id=first_receipt.id,
        name="Very Long Handmade Noodles",
        quantity=2,
        unit_price=Decimal("5.00"),
        total_price=Decimal("10.00"),
        is_manually_edited=True,
    )
    create_item_share(
        db,
        item_id=noodles.id,
        user_id=payer.id,
        item_share_amount=Decimal("4.00"),
        tax_share_amount=Decimal("0.32"),
        service_charge_share_amount=Decimal("0.48"),
        total_share_amount=Decimal("4.80"),
    )
    create_item_share(
        db,
        item_id=noodles.id,
        user_id=member.id,
        item_share_amount=Decimal("6.00"),
        tax_share_amount=Decimal("0.48"),
        service_charge_share_amount=Decimal("0.72"),
        total_share_amount=Decimal("7.20"),
    )

    second_receipt = create_receipt(
        db,
        expense_id=expense.id,
        payer_id=member.id,
        subtotal_amount=Decimal("3.40"),
        tax_amount=Decimal("0.00"),
        service_charge_amount=Decimal("0.00"),
        total_amount=Decimal("3.40"),
        source_type="manual",
        status="confirmed",
    )
    drink = create_item(
        db,
        receipt_id=second_receipt.id,
        name="Lime Juice",
        quantity=1,
        unit_price=Decimal("3.40"),
        total_price=Decimal("3.40"),
    )
    create_item_share(
        db,
        item_id=drink.id,
        user_id=member.id,
        item_share_amount=Decimal("3.40"),
        tax_share_amount=Decimal("0.00"),
        service_charge_share_amount=Decimal("0.00"),
        total_share_amount=Decimal("3.40"),
    )

    create_debt(
        db,
        group_id=group.id,
        expense_id=expense.id,
        from_user_id=member.id,
        to_user_id=payer.id,
        amount=Decimal("7.20"),
        status="marked_paid",
    )
    return expense, payer, member


def test_csv_export_contains_all_report_sections_and_formatted_values(client, db):
    expense, _, _ = _create_export_context(db)

    response = client.get(f"/api/v1/expenses/{expense.id}/export/csv")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/csv")
    assert response.headers["content-disposition"] == (
        f'attachment; filename="dfs-expense-{expense.id}.csv"'
    )
    text = response.content.decode("utf-8")
    assert "EXPENSE SUMMARY" in text
    assert "Team Dinner Export" in text
    assert "RECEIPTS" in text
    assert "Very Long Handmade Noodles" in text
    assert "USER ALLOCATIONS" in text
    assert "Jingyi Export,6.00,0.48,0.72,7.20" in text
    assert "USER TOTALS" in text
    assert "Jingyi Export,9.40,0.48,0.72,10.60" in text
    assert "SETTLEMENT" in text
    assert "Jingyi Export,Sixian Export,7.20,marked_paid" in text
    assert "Decimal(" not in text
    assert "UUID(" not in text

    rows = list(csv.reader(io.StringIO(text)))
    assert ["Receipt ID", "Payer", "Subtotal", "Tax", "Service Charge", "Total", "Source Type", "Status"] in rows


def test_csv_export_for_unknown_expense_returns_project_error(client):
    response = client.get(f"/api/v1/expenses/{uuid.uuid4()}/export/csv")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_FOUND"


def test_pdf_export_is_downloadable_pdf(client, db):
    expense, _, _ = _create_export_context(db)

    response = client.get(f"/api/v1/expenses/{expense.id}/export/pdf")

    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert response.headers["content-disposition"] == (
        f'attachment; filename="dfs-expense-{expense.id}.pdf"'
    )
    assert response.content.startswith(b"%PDF")
    assert len(response.content) > 1_000


def test_pdf_export_for_unknown_expense_returns_project_error(client):
    response = client.get(f"/api/v1/expenses/{uuid.uuid4()}/export/pdf")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "EXPENSE_NOT_FOUND"


def test_report_aggregates_stored_decimal_shares_across_receipts(db):
    expense, payer, member = _create_export_context(db)

    report = build_expense_report(db, expense.id)

    assert report is not None
    assert len(report["receipts"]) == 2
    totals = {row["user_id"]: row for row in report["user_totals"]}
    assert totals[payer.id]["item_subtotal"] == Decimal("4.00")
    assert totals[payer.id]["tax_share"] == Decimal("0.32")
    assert totals[payer.id]["service_share"] == Decimal("0.48")
    assert totals[payer.id]["final_total"] == Decimal("4.80")
    assert totals[member.id]["item_subtotal"] == Decimal("9.40")
    assert totals[member.id]["tax_share"] == Decimal("0.48")
    assert totals[member.id]["service_share"] == Decimal("0.72")
    assert totals[member.id]["final_total"] == Decimal("10.60")
    assert format_money(Decimal("3.4")) == "3.40"


def test_report_handles_expense_without_receipts_or_shares(client, db):
    owner = create_user(
        db,
        username="Empty Export Owner",
        email="empty.export@example.com",
        password_hash="password123",
    )
    group = create_group(
        db,
        name="Empty Export Group",
        description="Empty report test",
        created_by_id=owner.id,
    )
    expense = create_expense(
        db,
        group_id=group.id,
        title="Empty Expense",
        created_by_id=owner.id,
    )

    response = client.get(f"/api/v1/expenses/{expense.id}/export/csv")

    assert response.status_code == 200
    assert "Empty Expense" in response.text
    assert "RECEIPTS" in response.text
    assert "USER TOTALS" in response.text
    assert "SETTLEMENT" in response.text
