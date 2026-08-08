import csv
import io
from collections import defaultdict
from decimal import Decimal
from typing import Any
import uuid

from sqlalchemy.orm import Session

from app.crud.debt import list_debts_by_expense
from app.crud.expense import get_expense
from app.crud.group import get_group
from app.crud.item import list_items_by_receipt
from app.crud.item_share import list_item_shares_by_item
from app.crud.receipt import list_receipts_by_expense
from app.crud.user import get_user


ZERO = Decimal("0.00")
TWO_PLACES = Decimal("0.01")


def format_money(value: Decimal) -> str:
    """Return database money values in a stable, human-readable form."""
    return format(value.quantize(TWO_PLACES), ".2f")


def build_expense_report(db: Session, expense_id: uuid.UUID) -> dict[str, Any] | None:
    """Build the shared read-only report consumed by both export formats."""
    expense = get_expense(db, expense_id)
    if expense is None:
        return None

    group = get_group(db, expense.group_id)
    users: dict[uuid.UUID, str] = {}

    def user_name(user_id: uuid.UUID) -> str:
        if user_id not in users:
            user = get_user(db, user_id)
            users[user_id] = user.username if user is not None else str(user_id)
        return users[user_id]

    receipts_report: list[dict[str, Any]] = []
    user_totals = defaultdict(
        lambda: {
            "item_subtotal": ZERO,
            "tax_share": ZERO,
            "service_share": ZERO,
            "final_total": ZERO,
        }
    )

    for receipt in list_receipts_by_expense(db, expense.id):
        items_report: list[dict[str, Any]] = []
        for item in list_items_by_receipt(db, receipt.id):
            allocations: list[dict[str, Any]] = []
            for share in list_item_shares_by_item(db, item.id):
                allocation = {
                    "user_id": share.user_id,
                    "user": user_name(share.user_id),
                    "item_share": share.item_share_amount,
                    "tax_share": share.tax_share_amount,
                    "service_share": share.service_charge_share_amount,
                    "final_share": share.total_share_amount,
                }
                allocations.append(allocation)

                # Totals intentionally sum confirmed share records; no split or
                # charge allocation logic is repeated in the reporting layer.
                totals = user_totals[share.user_id]
                totals["item_subtotal"] += share.item_share_amount
                totals["tax_share"] += share.tax_share_amount
                totals["service_share"] += share.service_charge_share_amount
                totals["final_total"] += share.total_share_amount

            items_report.append(
                {
                    "id": item.id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "total": item.total_price,
                    "is_manually_edited": item.is_manually_edited,
                    "allocations": allocations,
                }
            )

        receipts_report.append(
            {
                "id": receipt.id,
                "payer": user_name(receipt.payer_id),
                "subtotal": receipt.subtotal_amount,
                "tax": receipt.tax_amount,
                "service_charge": receipt.service_charge_amount,
                "total": receipt.total_amount,
                "source_type": receipt.source_type,
                "status": receipt.status,
                "items": items_report,
            }
        )

    totals_report = [
        {
            "user_id": user_id,
            "user": user_name(user_id),
            **totals,
        }
        for user_id, totals in user_totals.items()
    ]
    totals_report.sort(key=lambda row: (row["user"].casefold(), str(row["user_id"])))

    debts_report = [
        {
            "debtor": user_name(debt.from_user_id),
            "creditor": user_name(debt.to_user_id),
            "amount": debt.amount,
            "status": debt.status,
        }
        for debt in list_debts_by_expense(db, expense.id)
    ]

    return {
        "expense": {
            "id": expense.id,
            "title": expense.title,
            "group": group.name if group is not None else str(expense.group_id),
            "date": expense.created_at,
            "status": expense.status,
        },
        "receipts": receipts_report,
        "user_totals": totals_report,
        "debts": debts_report,
    }


def generate_csv(report: dict[str, Any]) -> bytes:
    output = io.StringIO(newline="")
    writer = csv.writer(output, lineterminator="\r\n")
    expense = report["expense"]

    writer.writerow(["DEBT-FIRST SEARCH EXPENSE REPORT"])
    writer.writerow([])
    writer.writerow(["EXPENSE SUMMARY"])
    writer.writerow(["Expense ID", str(expense["id"])])
    writer.writerow(["Expense Name", expense["title"]])
    writer.writerow(["Group Name", expense["group"]])
    writer.writerow(["Date", expense["date"].isoformat()])
    writer.writerow(["Status", expense["status"]])
    writer.writerow([])

    writer.writerow(["RECEIPTS"])
    writer.writerow(
        [
            "Receipt ID",
            "Payer",
            "Subtotal",
            "Tax",
            "Service Charge",
            "Total",
            "Source Type",
            "Status",
        ]
    )
    for receipt in report["receipts"]:
        writer.writerow(
            [
                str(receipt["id"]),
                receipt["payer"],
                format_money(receipt["subtotal"]),
                format_money(receipt["tax"]),
                format_money(receipt["service_charge"]),
                format_money(receipt["total"]),
                receipt["source_type"],
                receipt["status"],
            ]
        )
    writer.writerow([])

    writer.writerow(["ITEMS"])
    writer.writerow(
        ["Receipt", "Item", "Quantity", "Unit Price", "Total", "Manually Edited"]
    )
    for receipt in report["receipts"]:
        for item in receipt["items"]:
            writer.writerow(
                [
                    str(receipt["id"]),
                    item["name"],
                    item["quantity"],
                    format_money(item["unit_price"]),
                    format_money(item["total"]),
                    "Yes" if item["is_manually_edited"] else "No",
                ]
            )
    writer.writerow([])

    writer.writerow(["USER ALLOCATIONS"])
    writer.writerow(
        [
            "Receipt",
            "Item",
            "User",
            "Item Share",
            "Tax Share",
            "Service Share",
            "Final Share",
        ]
    )
    for receipt in report["receipts"]:
        for item in receipt["items"]:
            for allocation in item["allocations"]:
                writer.writerow(
                    [
                        str(receipt["id"]),
                        item["name"],
                        allocation["user"],
                        format_money(allocation["item_share"]),
                        format_money(allocation["tax_share"]),
                        format_money(allocation["service_share"]),
                        format_money(allocation["final_share"]),
                    ]
                )
    writer.writerow([])

    writer.writerow(["USER TOTALS"])
    writer.writerow(
        ["User", "Item Subtotal", "Tax Share", "Service Share", "Final Total"]
    )
    for totals in report["user_totals"]:
        writer.writerow(
            [
                totals["user"],
                format_money(totals["item_subtotal"]),
                format_money(totals["tax_share"]),
                format_money(totals["service_share"]),
                format_money(totals["final_total"]),
            ]
        )
    writer.writerow([])

    writer.writerow(["SETTLEMENT"])
    writer.writerow(["Debtor", "Creditor", "Amount", "Status"])
    for debt in report["debts"]:
        writer.writerow(
            [
                debt["debtor"],
                debt["creditor"],
                format_money(debt["amount"]),
                debt["status"],
            ]
        )

    return output.getvalue().encode("utf-8")


def generate_pdf(report: dict[str, Any]) -> bytes:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfbase.pdfmetrics import stringWidth
    from reportlab.pdfgen import canvas

    buffer = io.BytesIO()
    pdf = canvas.Canvas(
        buffer,
        pagesize=A4,
    )
    pdf.setTitle("Debt-First Search Expense & Settlement Report")

    page_width, page_height = A4
    left_margin = 12 * mm
    right_margin = 12 * mm
    top_margin = 14 * mm
    bottom_margin = 14 * mm
    table_width = page_width - left_margin - right_margin
    body_font = "Helvetica"
    body_size = 7
    line_height = 9
    page_number = 1
    y = page_height - top_margin

    def finish_page() -> None:
        pdf.setFillColor(colors.grey)
        pdf.setFont(body_font, 7)
        pdf.drawRightString(page_width - right_margin, 7 * mm, f"Page {page_number}")
        pdf.setFillColor(colors.black)

    def new_page() -> None:
        nonlocal page_number, y
        finish_page()
        pdf.showPage()
        page_number += 1
        y = page_height - top_margin

    def wrap_text(value: Any, width: float) -> list[str]:
        text = str(value)
        if not text:
            return [""]

        lines: list[str] = []
        current = ""
        for word in text.split():
            candidate = f"{current} {word}".strip()
            if stringWidth(candidate, body_font, body_size) <= width:
                current = candidate
                continue
            if current:
                lines.append(current)
                current = ""
            while word and stringWidth(word, body_font, body_size) > width:
                split_at = 1
                while (
                    split_at < len(word)
                    and stringWidth(word[: split_at + 1], body_font, body_size) <= width
                ):
                    split_at += 1
                lines.append(word[:split_at])
                word = word[split_at:]
            current = word
        if current or not lines:
            lines.append(current)
        return lines

    def draw_row(values: list[Any], widths: list[float], *, header: bool = False) -> None:
        nonlocal y
        wrapped = [
            wrap_text(value, width - 6) for value, width in zip(values, widths, strict=True)
        ]
        row_height = max(15, max(len(lines) for lines in wrapped) * line_height + 6)
        row_bottom = y - row_height
        x = left_margin

        for lines, width in zip(wrapped, widths, strict=True):
            if header:
                pdf.setFillColor(colors.HexColor("#DCE6F1"))
                pdf.rect(x, row_bottom, width, row_height, stroke=0, fill=1)
            pdf.setStrokeColor(colors.grey)
            pdf.rect(x, row_bottom, width, row_height, stroke=1, fill=0)
            pdf.setFillColor(colors.black)
            pdf.setFont(body_font, body_size)
            text_y = y - line_height
            for line in lines:
                pdf.drawString(x + 3, text_y, line)
                text_y -= line_height
            x += width
        y = row_bottom

    def draw_table_header(heading: str, headers: list[str], widths: list[float]) -> None:
        nonlocal y
        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(left_margin, y, heading)
        y -= 7 * mm
        draw_row(headers, widths, header=True)

    def add_table(
        heading: str,
        headers: list[str],
        rows: list[list[Any]],
        widths: list[float],
    ) -> None:
        nonlocal y
        if y < bottom_margin + 30 * mm:
            new_page()
        draw_table_header(heading, headers, widths)

        for row in rows:
            wrapped = [
                wrap_text(value, width - 6)
                for value, width in zip(row, widths, strict=True)
            ]
            row_height = max(15, max(len(lines) for lines in wrapped) * line_height + 6)
            if y - row_height < bottom_margin + 4 * mm:
                new_page()
                draw_table_header(f"{heading} (continued)", headers, widths)
            draw_row(row, widths)
        y -= 5 * mm

    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawCentredString(page_width / 2, y, "Debt-First Search")
    y -= 10 * mm
    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawCentredString(page_width / 2, y, "Expense & Settlement Report")
    y -= 14 * mm

    expense = report["expense"]
    add_table(
        "Expense Summary",
        ["Field", "Value"],
        [
            ["Expense ID", expense["id"]],
            ["Expense Name", expense["title"]],
            ["Group Name", expense["group"]],
            ["Date", expense["date"].isoformat()],
            ["Status", expense["status"]],
        ],
        [38 * mm, table_width - 38 * mm],
    )
    add_table(
        "Receipt Summary",
        ["Receipt ID", "Payer", "Subtotal", "Tax", "Service", "Total", "Source"],
        [
            [
                receipt["id"],
                receipt["payer"],
                format_money(receipt["subtotal"]),
                format_money(receipt["tax"]),
                format_money(receipt["service_charge"]),
                format_money(receipt["total"]),
                receipt["source_type"],
            ]
            for receipt in report["receipts"]
        ],
        [42 * mm, 25 * mm, 20 * mm, 14 * mm, 18 * mm, 19 * mm, 22 * mm],
    )

    item_rows = [
        [
            receipt["id"],
            item["name"],
            item["quantity"],
            format_money(item["unit_price"]),
            format_money(item["total"]),
            "Yes" if item["is_manually_edited"] else "No",
        ]
        for receipt in report["receipts"]
        for item in receipt["items"]
    ]
    add_table(
        "Item Details",
        ["Receipt", "Item", "Quantity", "Unit Price", "Total", "Edited"],
        item_rows,
        [38 * mm, 47 * mm, 18 * mm, 22 * mm, 20 * mm, 20 * mm],
    )

    allocation_rows = []
    for receipt in report["receipts"]:
        for item in receipt["items"]:
            if item["allocations"]:
                for allocation in item["allocations"]:
                    allocation_rows.append(
                        [
                            receipt["id"],
                            item["name"],
                            allocation["user"],
                            format_money(allocation["item_share"]),
                            format_money(allocation["tax_share"]),
                            format_money(allocation["service_share"]),
                            format_money(allocation["final_share"]),
                        ]
                    )
            else:
                allocation_rows.append(
                    [receipt["id"], item["name"], "", "", "", "", ""]
                )
    add_table(
        "Allocation Details",
        ["Receipt", "Item", "User", "Item", "Tax", "Service", "Final"],
        allocation_rows,
        [35 * mm, 34 * mm, 26 * mm, 16 * mm, 14 * mm, 17 * mm, 18 * mm],
    )
    add_table(
        "Per-User Totals",
        ["User", "Item Subtotal", "Tax Share", "Service Share", "Final Total"],
        [
            [
                totals["user"],
                format_money(totals["item_subtotal"]),
                format_money(totals["tax_share"]),
                format_money(totals["service_share"]),
                format_money(totals["final_total"]),
            ]
            for totals in report["user_totals"]
        ],
        [50 * mm, 30 * mm, 27 * mm, 30 * mm, 30 * mm],
    )
    add_table(
        "Settlement Summary",
        ["Debtor", "Creditor", "Amount", "Status"],
        [
            [debt["debtor"], debt["creditor"], format_money(debt["amount"]), debt["status"]]
            for debt in report["debts"]
        ],
        [48 * mm, 48 * mm, 28 * mm, 42 * mm],
    )
    if y < bottom_margin + 12 * mm:
        new_page()
    pdf.setFillColor(colors.grey)
    pdf.setFont(body_font, 9)
    pdf.drawCentredString(page_width / 2, y, "Generated by Debt-First Search")
    finish_page()
    pdf.save()
    return buffer.getvalue()
