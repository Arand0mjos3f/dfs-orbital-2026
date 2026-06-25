import re
from decimal import Decimal, ROUND_HALF_UP


MONEY_PATTERN = re.compile(r"(?P<amount>\d+(?:\.\d{1,2})?)\s*$")

TAX_KEYWORDS = {"gst", "tax", "vat"}
SERVICE_KEYWORDS = {"service", "service charge", "svc"}
TOTAL_KEYWORDS = {"total", "grand total", "amount due"}
SUBTOTAL_KEYWORDS = {"subtotal", "sub total"}


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _normalise_label(label: str) -> str:
    return " ".join(label.strip().lower().split())


def _extract_trailing_amount(line: str) -> tuple[str, Decimal] | None:
    match = MONEY_PATTERN.search(line)

    if match is None:
        return None

    amount = Decimal(match.group("amount"))
    label = line[: match.start()].strip(" -:$\t")

    if not label:
        return None

    return label, _round_money(amount)


def _is_keyword_line(label: str, keywords: set[str]) -> bool:
    normalised_label = _normalise_label(label)
    return any(keyword in normalised_label for keyword in keywords)


def parse_receipt_text(raw_text: str) -> dict:
    """
    Parse raw OCR receipt text into structured receipt fields.

    Supported first-version format examples:
    Chicken Rice 5.50
    Iced Lemon Tea 3.20
    GST 0.70
    SERVICE 1.30
    TOTAL 10.70
    """
    items = []
    subtotal_amount: Decimal | None = None
    tax_amount = Decimal("0.00")
    service_charge_amount = Decimal("0.00")
    total_amount: Decimal | None = None

    for raw_line in raw_text.splitlines():
        line = raw_line.strip()

        if not line:
            continue

        extracted = _extract_trailing_amount(line)

        if extracted is None:
            continue

        label, amount = extracted
        normalised_label = _normalise_label(label)

        if _is_keyword_line(normalised_label, SUBTOTAL_KEYWORDS):
            subtotal_amount = amount
            continue

        if _is_keyword_line(normalised_label, TAX_KEYWORDS):
            tax_amount += amount
            tax_amount = _round_money(tax_amount)
            continue

        if _is_keyword_line(normalised_label, SERVICE_KEYWORDS):
            service_charge_amount += amount
            service_charge_amount = _round_money(service_charge_amount)
            continue

        if _is_keyword_line(normalised_label, TOTAL_KEYWORDS):
            total_amount = amount
            continue

        items.append(
            {
                "name": label,
                "original_name": label,
                "unit_price": amount,
                "quantity": 1,
                "total_price": amount,
                "is_manually_edited": False,
            }
        )

    if subtotal_amount is None:
        subtotal_amount = _round_money(
            sum((item["total_price"] for item in items), Decimal("0.00"))
        )

    if total_amount is None:
        total_amount = _round_money(
            subtotal_amount + tax_amount + service_charge_amount
        )

    return {
        "items": items,
        "subtotal_amount": subtotal_amount,
        "tax_amount": tax_amount,
        "service_charge_amount": service_charge_amount,
        "total_amount": total_amount,
    }
