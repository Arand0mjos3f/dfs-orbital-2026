# Milestone 2 Backend Testing and Demo Guide

## Overview

This document describes how to test and demonstrate the Milestone 2 backend workflow for Debt-First Search.

The tested workflow is:

```text
Receipt image upload
→ OCR extraction
→ receipt parsing
→ confirmed item creation
→ item share assignment
→ tax/service charge allocation
→ debt recalculation
→ group debt listing
```

## 1. Standard Backend Checks

Activate the backend virtual environment:

```bash
source .venv/bin/activate
```

Run syntax check:

```bash
python -m compileall app tests scripts
```

Run backend tests:

```bash
python -m pytest -q
```

If only OCR-related tests are needed:

```bash
python -m pytest tests/test_receipt_parser.py tests/test_ocr_service.py tests/test_paddleocr_engine.py -q
```

The PaddleOCR integration test is skipped by default unless explicitly enabled.

## 2. OCR Environment Setup

PaddleOCR is optional and should be installed in a separate Python 3.12 virtual environment.

```bash
python3.12 -m venv .venv-ocr
source .venv-ocr/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install -r requirements-ocr.txt
```

Verify PaddleOCR import:

```bash
python - <<'PY'
import paddle
import paddleocr

print("paddle version:", paddle.__version__)
print("paddleocr import ok")
PY
```

## 3. Start Backend with Mock OCR

Mock OCR is useful for stable local testing.

```bash
source .venv/bin/activate
OCR_ENGINE=mock uvicorn app.main:app --reload
```

## 4. Start Backend with PaddleOCR

PaddleOCR is used for real receipt image recognition.

```bash
source .venv-ocr/bin/activate
OCR_ENGINE=paddleocr uvicorn app.main:app --reload
```

## 5. Prepare Full Workflow Smoke Test

The backend should already be running.

Set the required environment variables:

```bash
export API_BASE_URL="http://127.0.0.1:8000/api/v1"
export EXPENSE_ID="replace-with-expense-id"
export GROUP_ID="replace-with-group-id"
export PAYER_ID="replace-with-payer-user-id"
export PARTICIPANT_USER_IDS="user-id-1,user-id-2"
export RECEIPT_IMAGE_PATH="tmp/test_receipts/real_receipt.jpg"
```

Notes:

* `EXPENSE_ID` should belong to the selected `GROUP_ID`.
* `PAYER_ID` should be one of the group members.
* `PARTICIPANT_USER_IDS` should contain at least two users.
* The receipt image should exist locally.
* The receipt image should not be committed to GitHub.

## 6. Run Full MS2 Workflow Smoke Test

Run:

```bash
python scripts/ms2_full_workflow_smoke_test.py
```

Expected final output:

```text
MS2 full workflow smoke test completed successfully.
```

## 7. Smoke Test Coverage

The smoke test validates:

```text
receipt upload
→ OCR extraction
→ receipt parsing
→ confirmed item creation
→ equal item shares
→ tax/service charge allocation
→ debt recalculation
→ group debt listing
```

## 8. Important API Endpoints Used

```text
POST /api/v1/expenses/{expense_id}/receipts/upload
POST /api/v1/receipts/{receipt_id}/items
POST /api/v1/items/{item_id}/shares/equal
POST /api/v1/receipts/{receipt_id}/shares/allocate-charges
POST /api/v1/expenses/{expense_id}/debts/recalculate
GET  /api/v1/groups/{group_id}/debts
```

## 9. Demo Evidence to Capture

For Milestone 2 submission, capture screenshots of:

```text
1. Swagger receipt upload endpoint
2. Successful receipt upload response
3. Raw OCR text or parsed OCR items
4. Confirmed items created under receipt
5. Equal item shares created
6. Charge allocation response
7. Debt recalculation response
8. Group debt listing
9. Full workflow smoke test success output
```

## 10. Notes and Limitations

The receipt parser is heuristic-based. It works for common receipt formats but may require manual correction for complex receipt layouts, poor image quality, or unusual currency formats.

Manual correction is expected before confirming OCR items in the product flow.

Do not commit:

* real receipt images
* local OCR logs
* temporary OpenAPI files
* virtual environments
* uploaded files
* Python cache files
