from decimal import Decimal

from app.services.receipt_parser import parse_receipt_text


def test_parse_receipt_text_with_tax_service_and_total():
    raw_text = """Chicken Rice 5.50
Iced Lemon Tea 3.20
GST 0.70
SERVICE 1.30
TOTAL 10.70
"""

    result = parse_receipt_text(raw_text)

    assert len(result["items"]) == 2
    assert result["items"][0]["name"] == "Chicken Rice"
    assert result["items"][0]["unit_price"] == Decimal("5.50")
    assert result["items"][1]["name"] == "Iced Lemon Tea"
    assert result["items"][1]["total_price"] == Decimal("3.20")
    assert result["subtotal_amount"] == Decimal("8.70")
    assert result["tax_amount"] == Decimal("0.70")
    assert result["service_charge_amount"] == Decimal("1.30")
    assert result["total_amount"] == Decimal("10.70")


def test_parse_receipt_text_without_explicit_total():
    raw_text = """Chicken Rice 5.50
Iced Lemon Tea 3.20
GST 0.70
"""

    result = parse_receipt_text(raw_text)

    assert len(result["items"]) == 2
    assert result["subtotal_amount"] == Decimal("8.70")
    assert result["tax_amount"] == Decimal("0.70")
    assert result["service_charge_amount"] == Decimal("0.00")
    assert result["total_amount"] == Decimal("9.40")


def test_parse_receipt_text_ignores_lines_without_price():
    raw_text = """WELCOME TO DFS CAFE
Chicken Rice 5.50
THANK YOU
TOTAL 5.50
"""

    result = parse_receipt_text(raw_text)

    assert len(result["items"]) == 1
    assert result["items"][0]["name"] == "Chicken Rice"
    assert result["subtotal_amount"] == Decimal("5.50")
    assert result["total_amount"] == Decimal("5.50")
