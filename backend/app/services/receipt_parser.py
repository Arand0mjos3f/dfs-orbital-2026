import re
from decimal import Decimal, ROUND_HALF_UP


TRAILING_MONEY_PATTERN = re.compile(
    r"(?P<amount>(?:\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d{1,2})?)\s*$"
)

PURE_MONEY_PATTERN = re.compile(
    r"^(?:\d{1,3}(?:[.,]\d{3})+|\d+)(?:[.,]\d{1,2})?$"
)

QUANTITY_PATTERN = re.compile(r"^\d+$")

TAX_KEYWORDS = {"gst", "tax", "vat"}
SERVICE_KEYWORDS = {"service", "service charge", "svc"}
TOTAL_KEYWORDS = {"total", "grand total", "amount due"}
SUBTOTAL_KEYWORDS = {"subtotal", "sub total", "price sale"}

NON_ITEM_KEYWORDS = {
    "check",
    "table",
    "outlet",
    "waitress",
    "guest",
    "guestname",
    "adult",
    "child",
    "product",
    "qty",
    "quantity",
    "sub total",
    "subtotal",
    "cash",
    "discount",
    "price sale",
    "cc charge",
    "tax",
    "gst",
    "service",
    "service charge",
    "svc",
    "grand total",
    "total",
    "remark",
    "payment",
    "refund",
    "phone",
    "fax",
}


def _round_money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _normalise_label(label: str) -> str:
    return " ".join(label.strip().lower().split())


def _normalise_amount_string(value: str) -> str:
    value = value.strip().replace(" ", "")

    if "," in value and "." in value:
        # Example: 1,234.56
        if value.rfind(".") > value.rfind(","):
            return value.replace(",", "")

        # Example: 1.234,56
        return value.replace(".", "").replace(",", ".")

    if "." in value:
        parts = value.split(".")

        # Treat 125.000 / 42.500 / 616.550 as thousands-style receipt amounts.
        if len(parts) == 2 and len(parts[1]) == 3:
            return "".join(parts)

        return value

    if "," in value:
        parts = value.split(",")

        if len(parts) == 2 and len(parts[1]) == 3:
            return "".join(parts)

        return value.replace(",", ".")

    return value


def _parse_money(value: str) -> Decimal:
    return _round_money(Decimal(_normalise_amount_string(value)))


def _is_money_line(line: str) -> bool:
    return PURE_MONEY_PATTERN.fullmatch(line.strip()) is not None


def _is_quantity_line(line: str) -> bool:
    return QUANTITY_PATTERN.fullmatch(line.strip()) is not None


def _is_keyword_line(label: str, keywords: set[str]) -> bool:
    normalised_label = _normalise_label(label)
    return any(keyword in normalised_label for keyword in keywords)


def _is_non_item_label(label: str) -> bool:
    normalised_label = _normalise_label(label)
    return any(keyword in normalised_label for keyword in NON_ITEM_KEYWORDS)


def _extract_trailing_amount(line: str) -> tuple[str, Decimal] | None:
    match = TRAILING_MONEY_PATTERN.search(line)

    if match is None:
        return None

    amount = _parse_money(match.group("amount"))
    label = line[: match.start()].strip(" -:$\t")

    if not label:
        return None

    return label, amount


def _parse_summary_value(lines: list[str], index: int) -> Decimal | None:
    current_line = lines[index]

    extracted = _extract_trailing_amount(current_line)

    if extracted is not None:
        return extracted[1]

    if index + 1 < len(lines) and _is_money_line(lines[index + 1]):
        return _parse_money(lines[index + 1])

    return None


def _looks_like_item_name(line: str) -> bool:
    if _is_money_line(line):
        return False

    if _is_quantity_line(line):
        return False

    if _is_non_item_label(line):
        return False

    if len(line.strip()) <= 1:
        return False

    return any(char.isalpha() for char in line)


def _parse_multiline_table_items(lines: list[str]) -> list[dict]:
    items = []
    index = 0

    while index < len(lines):
        line = lines[index]

        if not _looks_like_item_name(line):
            index += 1
            continue

        # Pattern:
        # item name
        # quantity
        # price
        if (
            index + 2 < len(lines)
            and _is_quantity_line(lines[index + 1])
            and _is_money_line(lines[index + 2])
        ):
            quantity = int(lines[index + 1])
            total_price = _parse_money(lines[index + 2])
            unit_price = _round_money(total_price / Decimal(quantity))

            items.append(
                {
                    "name": line,
                    "original_name": line,
                    "unit_price": unit_price,
                    "quantity": quantity,
                    "total_price": total_price,
                    "is_manually_edited": False,
                }
            )

            index += 3
            continue

        # Pattern:
        # item name
        # price
        if index + 1 < len(lines) and _is_money_line(lines[index + 1]):
            total_price = _parse_money(lines[index + 1])

            items.append(
                {
                    "name": line,
                    "original_name": line,
                    "unit_price": total_price,
                    "quantity": 1,
                    "total_price": total_price,
                    "is_manually_edited": False,
                }
            )

            index += 2
            continue

        # Pattern:
        # item name price
        extracted = _extract_trailing_amount(line)

        if extracted is not None:
            label, amount = extracted

            if not _is_non_item_label(label):
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

        index += 1

    return items


def parse_receipt_text(raw_text: str) -> dict:
    """
    Parse raw OCR receipt text into structured receipt fields.

    Supports:
    - item name and price on the same line
    - item name / quantity / price split across multiple lines
    - GST/tax, service charge, subtotal, and grand total summary lines
    - thousand-style amounts such as 125.000
    """
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]

    subtotal_amount: Decimal | None = None
    tax_amount = Decimal("0.00")
    service_charge_amount = Decimal("0.00")
    total_amount: Decimal | None = None

    for index, line in enumerate(lines):
        normalised_line = _normalise_label(line)

        if _is_keyword_line(normalised_line, SUBTOTAL_KEYWORDS):
            value = _parse_summary_value(lines, index)
            if value is not None:
                subtotal_amount = value
            continue

        if _is_keyword_line(normalised_line, TAX_KEYWORDS):
            value = _parse_summary_value(lines, index)
            if value is not None:
                tax_amount += value
                tax_amount = _round_money(tax_amount)
            continue

        if _is_keyword_line(normalised_line, SERVICE_KEYWORDS):
            value = _parse_summary_value(lines, index)
            if value is not None:
                service_charge_amount += value
                service_charge_amount = _round_money(service_charge_amount)
            continue

        if _is_keyword_line(normalised_line, TOTAL_KEYWORDS):
            value = _parse_summary_value(lines, index)
            if value is not None:
                total_amount = value
            continue

    items = _parse_multiline_table_items(lines)

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
