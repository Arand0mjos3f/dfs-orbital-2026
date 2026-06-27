# Milestone 2 Backend Summary

## Overview

This Milestone 2 backend update completes the main receipt processing and bill splitting workflow for Debt-First Search.

The implemented backend flow is:

```text
Receipt image upload
→ OCR text extraction
→ Receipt text parsing
→ Parsed item creation
→ Item share assignment
→ Tax and service charge allocation
→ Debt calculation / recalculation
→ Group debt listing
```

## Main Features Completed

### 1. Receipt Image Upload

Implemented receipt image upload through the receipt upload endpoint.

The upload flow supports:

* image file upload
* payer selection
* receipt creation under an expense
* OCR result storage
* parsed receipt items returned to the frontend for user confirmation

Main endpoint:

```text
POST /api/v1/expenses/{expense_id}/receipts/upload
```

### 2. OCR Engine Integration

Implemented an OCR engine abstraction layer.

Supported OCR engines:

* `mock`: stable local/demo OCR engine
* `paddleocr`: real OCR engine for uploaded receipt images

The active engine is controlled by the environment variable:

```bash
OCR_ENGINE=mock
OCR_ENGINE=paddleocr
```

This allows the backend to use mock OCR for stable local testing and PaddleOCR for real receipt image recognition.

### 3. PaddleOCR Support

Integrated PaddleOCR as an optional OCR engine.

Because PaddleOCR dependencies are relatively heavy and version-sensitive, OCR-specific dependencies are separated into:

```text
requirements-ocr.txt
```

A separate Python 3.12 virtual environment is recommended for OCR testing:

```bash
python3.12 -m venv .venv-ocr
source .venv-ocr/bin/activate
pip install -r requirements.txt
pip install -r requirements-ocr.txt
```

The receipt upload endpoint now uses `run_receipt_ocr`, so the backend can switch between mock OCR and PaddleOCR through `OCR_ENGINE`.

### 4. Receipt Text Parser

Implemented and improved a receipt text parser.

The parser supports:

* item name and price on the same line
* item name / quantity / price split across multiple lines
* subtotal, tax, service charge, and grand total lines
* receipt-style thousand separators such as `125.000`
* filtering common non-item receipt fields such as payment, refund, table, quantity, and receipt metadata

The parser is designed to extract structured receipt information from raw OCR text.

### 5. OCR Item Confirmation

Parsed OCR items can be confirmed and saved into the `items` table.

The current backend supports creating confirmed items under a receipt through:

```text
POST /api/v1/receipts/{receipt_id}/items
```

This supports the intended product flow where users review and manually correct OCR results before confirming the final bill split.

### 6. Item Share Assignment

Implemented item-level share assignment.

Supported:

* manual item shares
* equal split item shares
* replace existing shares

Main endpoint:

```text
POST /api/v1/items/{item_id}/shares/equal
```

This allows each confirmed item to be assigned to one or more users before debt calculation.

### 7. Receipt Charge Allocation

Implemented proportional allocation of receipt-level tax and service charge to item shares.

Main endpoint:

```text
POST /api/v1/receipts/{receipt_id}/shares/allocate-charges
```

After allocation, each item share contains:

* item share amount
* tax share amount
* service charge share amount
* total share amount

This makes the debt calculation more accurate because tax and service charge are distributed based on each user’s item share.

### 8. Debt Calculation and Recalculation

Debt calculation now works with item-level shares and receipt payers.

Implemented debt recalculation support so existing active debts can be cancelled and recalculated after OCR items or shares are updated.

Main endpoint:

```text
POST /api/v1/expenses/{expense_id}/debts/recalculate
```

The recalculation flow:

* cancels existing active debts for the expense
* recalculates debts based on current item shares
* creates updated pending debt records
* supports group debt listing after recalculation

### 9. Full Workflow Smoke Test

Added a reusable MS2 full workflow smoke test script:

```text
scripts/ms2_full_workflow_smoke_test.py
```

The script validates the full backend flow:

* upload receipt image
* run OCR
* parse receipt items
* create confirmed items
* create equal item shares
* allocate receipt charges
* recalculate debts
* list group debts

This provides a repeatable way to verify the Milestone 2 backend workflow.

## Important Endpoints

```text
POST /api/v1/expenses/{expense_id}/receipts/upload
POST /api/v1/receipts/{receipt_id}/items
GET  /api/v1/receipts/{receipt_id}/items
POST /api/v1/items/{item_id}/shares/equal
POST /api/v1/receipts/{receipt_id}/shares/allocate-charges
POST /api/v1/expenses/{expense_id}/debts/recalculate
GET  /api/v1/groups/{group_id}/debts
PATCH /api/v1/debts/{debt_id}/mark-paid
PATCH /api/v1/debts/{debt_id}/confirm-received
```

## Testing Completed

The following backend tests and checks were completed:

```text
python -m compileall app tests scripts
python -m pytest tests/test_receipt_parser.py tests/test_ocr_service.py tests/test_paddleocr_engine.py -q
```

The full workflow smoke test was also completed successfully:

```text
python scripts/ms2_full_workflow_smoke_test.py
```

The smoke test verified:

```text
Receipt upload
→ OCR extraction
→ receipt parsing
→ confirmed item creation
→ equal item shares
→ tax/service charge allocation
→ debt recalculation
→ group debt listing
```

## Current Limitations

The OCR parser is heuristic-based. It works for common receipt formats but may require manual correction for complex layouts, unusual receipts, or poor image quality.

Manual correction is expected in the product flow before confirming OCR items.

## Future Improvements

Possible future improvements include:

* more robust receipt parsing for diverse receipt layouts
* frontend-driven manual OCR correction UI
* support for more receipt languages and currencies
* more complete endpoint-level automated tests
* advanced debt optimisation
* export features
