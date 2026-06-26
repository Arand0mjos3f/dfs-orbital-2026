import json
import os
import sys
import uuid
from decimal import Decimal
from pathlib import Path
from urllib import request, error


API_BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000/api/v1").rstrip("/")

EXPENSE_ID = os.getenv("EXPENSE_ID")
GROUP_ID = os.getenv("GROUP_ID")
PAYER_ID = os.getenv("PAYER_ID")
PARTICIPANT_USER_IDS = [
    value.strip()
    for value in os.getenv("PARTICIPANT_USER_IDS", "").split(",")
    if value.strip()
]
RECEIPT_IMAGE_PATH = Path(os.getenv("RECEIPT_IMAGE_PATH", "tmp/test_receipts/real_receipt.jpg"))


def fail(message: str) -> None:
    print(f"\n{message}")
    sys.exit(1)


def require_env(name: str, value: str | None) -> str:
    if not value:
        fail(f"Missing required environment variable: {name}")
    return value


def parse_json_response(response_body: bytes) -> dict:
    try:
        return json.loads(response_body.decode("utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"Response is not valid JSON: {response_body!r}\n{exc}")


def unwrap_data(payload: dict):
    if isinstance(payload, dict) and "data" in payload:
        return payload["data"]
    return payload


def http_json(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{API_BASE_URL}{path}"

    headers = {
        "Accept": "application/json",
    }

    data = None

    if body is not None:
        data = json.dumps(body, default=str).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = request.Request(url, data=data, headers=headers, method=method)

    try:
        with request.urlopen(req, timeout=60) as response:
            return parse_json_response(response.read())
    except error.HTTPError as exc:
        response_body = exc.read()
        print(f"\nHTTP {exc.code} for {method} {url}")
        print(response_body.decode("utf-8", errors="replace"))
        raise
    except error.URLError as exc:
        fail(f"Could not connect to backend at {url}: {exc}")


def http_multipart_upload(path: str, fields: dict, file_field: str, file_path: Path) -> dict:
    url = f"{API_BASE_URL}{path}"

    if not file_path.exists():
        fail(f"Receipt image does not exist: {file_path}")

    boundary = f"----DFSBoundary{uuid.uuid4().hex}"
    body_parts: list[bytes] = []

    for name, value in fields.items():
        body_parts.append(f"--{boundary}\r\n".encode())
        body_parts.append(
            f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        )
        body_parts.append(f"{value}\r\n".encode())

    filename = file_path.name
    content_type = guess_content_type(file_path)

    body_parts.append(f"--{boundary}\r\n".encode())
    body_parts.append(
        (
            f'Content-Disposition: form-data; name="{file_field}"; '
            f'filename="{filename}"\r\n'
        ).encode()
    )
    body_parts.append(f"Content-Type: {content_type}\r\n\r\n".encode())
    body_parts.append(file_path.read_bytes())
    body_parts.append(b"\r\n")
    body_parts.append(f"--{boundary}--\r\n".encode())

    body = b"".join(body_parts)

    req = request.Request(
        url,
        data=body,
        headers={
            "Accept": "application/json",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )

    try:
        with request.urlopen(req, timeout=180) as response:
            return parse_json_response(response.read())
    except error.HTTPError as exc:
        response_body = exc.read()
        print(f"\nHTTP {exc.code} for POST {url}")
        print(response_body.decode("utf-8", errors="replace"))
        raise
    except error.URLError as exc:
        fail(f"Could not connect to backend at {url}: {exc}")


def guess_content_type(file_path: Path) -> str:
    suffix = file_path.suffix.lower()

    if suffix in {".jpg", ".jpeg"}:
        return "image/jpeg"

    if suffix == ".png":
        return "image/png"

    if suffix == ".webp":
        return "image/webp"

    return "application/octet-stream"


def extract_receipt_id(upload_data) -> str:
    if isinstance(upload_data, dict):
        candidates = [
            upload_data.get("id"),
            upload_data.get("receipt_id"),
        ]

        receipt = upload_data.get("receipt")

        if isinstance(receipt, dict):
            candidates.extend([receipt.get("id"), receipt.get("receipt_id")])

        for candidate in candidates:
            if candidate:
                return str(candidate)

    fail(f"Could not find receipt id in upload response:\n{json.dumps(upload_data, indent=2, default=str)}")


def extract_ocr_items(upload_data) -> list[dict]:
    if isinstance(upload_data, dict):
        for key in ["items", "ocr_items", "parsed_items"]:
            value = upload_data.get(key)

            if isinstance(value, list):
                return value

        receipt = upload_data.get("receipt")

        if isinstance(receipt, dict):
            for key in ["items", "ocr_items", "parsed_items"]:
                value = receipt.get(key)

                if isinstance(value, list):
                    return value

    fail(f"Could not find OCR items in upload response:\n{json.dumps(upload_data, indent=2, default=str)}")


def normalise_item_for_confirm(item: dict) -> dict:
    name = item.get("name") or item.get("original_name")

    if not name:
        fail(f"OCR item has no name: {item}")

    total_price = item.get("total_price") or item.get("unit_price")

    if total_price is None:
        fail(f"OCR item has no price: {item}")

    quantity = item.get("quantity") or 1
    unit_price = item.get("unit_price") or total_price

    return {
        "name": str(name),
        "original_name": str(item.get("original_name") or name),
        "unit_price": str(Decimal(str(unit_price))),
        "quantity": int(quantity),
        "total_price": str(Decimal(str(total_price))),
        "is_manually_edited": bool(item.get("is_manually_edited", False)),
    }


def extract_confirmed_items(confirm_data) -> list[dict]:
    data = unwrap_data(confirm_data)

    if isinstance(data, list):
        return data

    if isinstance(data, dict):
        for key in ["items", "created_items", "confirmed_items"]:
            value = data.get(key)

            if isinstance(value, list):
                return value

    fail(f"Could not find confirmed items in response:\n{json.dumps(confirm_data, indent=2, default=str)}")


def main() -> None:
    expense_id = require_env("EXPENSE_ID", EXPENSE_ID)
    group_id = require_env("GROUP_ID", GROUP_ID)
    payer_id = require_env("PAYER_ID", PAYER_ID)

    if not PARTICIPANT_USER_IDS:
        fail("Missing required environment variable: PARTICIPANT_USER_IDS")

    if payer_id not in PARTICIPANT_USER_IDS:
        print("PAYER_ID is not in PARTICIPANT_USER_IDS. Continuing, but this may be intentional.")

    print("===== MS2 Full Workflow Smoke Test =====")
    print("API_BASE_URL:", API_BASE_URL)
    print("EXPENSE_ID:", expense_id)
    print("GROUP_ID:", group_id)
    print("PAYER_ID:", payer_id)
    print("PARTICIPANT_USER_IDS:", PARTICIPANT_USER_IDS)
    print("RECEIPT_IMAGE_PATH:", RECEIPT_IMAGE_PATH)
    print()

    print("1. Uploading receipt image...")
    upload_payload = http_multipart_upload(
        path=f"/expenses/{expense_id}/receipts/upload",
        fields={"payer_id": payer_id},
        file_field="file",
        file_path=RECEIPT_IMAGE_PATH,
    )
    upload_data = unwrap_data(upload_payload)
    receipt_id = extract_receipt_id(upload_data)
    ocr_items = extract_ocr_items(upload_data)

    print("receipt_id:", receipt_id)
    print("OCR item count:", len(ocr_items))

    if not ocr_items:
        fail("OCR returned zero items. Parser may need improvement.")

    print("\n2. Confirming OCR items...")
    confirm_items = [normalise_item_for_confirm(item) for item in ocr_items]

    confirmed_items = []

    for item_payload in confirm_items:
        confirm_payload = http_json(
            "POST",
            f"/receipts/{receipt_id}/items",
            item_payload,
        )

        confirmed_item = unwrap_data(confirm_payload)

        if not isinstance(confirmed_item, dict):
            fail(
                "Confirm item response is not an object:\n"
                + json.dumps(confirm_payload, indent=2, default=str)
            )

        confirmed_items.append(confirmed_item)
        print(
            "confirmed item:",
            confirmed_item.get("id"),
            confirmed_item.get("name"),
        )

    print("confirmed item count:", len(confirmed_items))

    if not confirmed_items:
        fail("No confirmed items were created.")

    print("\n3. Creating equal item shares...")
    for item in confirmed_items:
        item_id = item.get("id")

        if not item_id:
            fail(f"Confirmed item has no id: {item}")

        share_payload = http_json(
            "POST",
            f"/items/{item_id}/shares/equal",
            {
                "user_ids": PARTICIPANT_USER_IDS,
                "replace_existing": True,
            },
        )

        print(f"item {item_id}: equal shares created")

    print("\n4. Allocating receipt tax/service charges...")
    allocation_payload = http_json(
        "POST",
        f"/receipts/{receipt_id}/shares/allocate-charges",
    )
    print("charges allocated")

    print("\n5. Recalculating debts...")
    recalculate_payload = http_json(
        "POST",
        f"/expenses/{expense_id}/debts/recalculate",
    )
    recalculate_data = unwrap_data(recalculate_payload)
    print("debt recalculation response:")
    print(json.dumps(recalculate_data, indent=2, default=str))

    print("\n6. Listing group debts...")
    debts_payload = http_json("GET", f"/groups/{group_id}/debts")
    debts_data = unwrap_data(debts_payload)

    print("group debts:")
    print(json.dumps(debts_data, indent=2, default=str))

    print("\nMS2 full workflow smoke test completed successfully.")


if __name__ == "__main__":
    main()
