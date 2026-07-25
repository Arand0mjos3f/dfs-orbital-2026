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


def test_parse_multiline_receipt_table_with_thousand_style_amounts():
    raw_text = """Product
Qty
Sub Total
Sirloin Steak (Import)
1
125.000
Green Pumpkin Juice
1
20.000
Cumi Goreng Tepung
1
65.000
Apple Juice
1
15.000
Quantity: 4
Sub Total
225.000
Tax(10%)
22.500
Grand Total
247.500
Payment
300.000
Refund
52.500
"""

    result = parse_receipt_text(raw_text)

    assert len(result["items"]) == 4
    assert result["items"][0]["name"] == "Sirloin Steak (Import)"
    assert result["items"][0]["total_price"] == Decimal("125000.00")
    assert result["items"][1]["name"] == "Green Pumpkin Juice"
    assert result["items"][1]["total_price"] == Decimal("20000.00")
    assert result["subtotal_amount"] == Decimal("225000.00")
    assert result["tax_amount"] == Decimal("22500.00")
    assert result["total_amount"] == Decimal("247500.00")


def test_parse_receipt_text_with_grouped_item_names_and_currency_amounts():
    raw_text = """LIONCITY BISTRO
Singapore
Receipt No: 018472Date:25/07/20267:42 PM
Laksa
Satay (6 pcs)
Milo Dinosaur
$6.80
$8.50
$3.20
Subtotal
$18.50
$1.85
Service Charge
$1.83GST========Total
$22.18
Thank you and please come again!
"""

    result = parse_receipt_text(raw_text)

    assert len(result["items"]) == 3
    assert result["items"][0]["name"] == "Laksa"
    assert result["items"][0]["total_price"] == Decimal("6.80")
    assert result["items"][1]["name"] == "Satay (6 pcs)"
    assert result["items"][1]["total_price"] == Decimal("8.50")
    assert result["items"][2]["name"] == "Milo Dinosaur"
    assert result["items"][2]["total_price"] == Decimal("3.20")
    assert result["subtotal_amount"] == Decimal("18.50")
    assert result["service_charge_amount"] == Decimal("1.85")
    assert result["tax_amount"] == Decimal("1.83")
    assert result["total_amount"] == Decimal("22.18")
