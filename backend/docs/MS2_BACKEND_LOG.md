# Milestone 2 Backend Development Log

## Summary

Milestone 2 backend development focused on completing the receipt OCR and item-based bill splitting workflow for Debt-First Search.

The final backend workflow is:

```text id="j1v0ep"
Receipt image upload
→ OCR extraction
→ receipt parser
→ item confirmation
→ item share assignment
→ charge allocation
→ debt recalculation
→ group debt listing
```

## Completed Work

### Receipt Upload and OCR

* Added receipt image upload support.
* Added mock OCR for stable local development and early testing.
* Added an OCR engine adapter to separate OCR text extraction from receipt parsing.
* Integrated optional PaddleOCR support for real receipt image recognition.
* Added environment-variable-based OCR engine switching through `OCR_ENGINE`.
* Added `requirements-ocr.txt` for optional OCR dependencies.
* Updated the receipt upload flow to use `run_receipt_ocr`, allowing the backend to switch between mock OCR and PaddleOCR without changing the upload endpoint.

### Receipt Parsing

* Added a receipt text parser for converting raw OCR text into structured receipt data.
* Extracted item names and prices from OCR text.
* Added support for subtotal, tax, service charge, and grand total fields.
* Improved parsing for multiline receipt table formats where item name, quantity, and price may appear on separate lines.
* Added support for receipt-style thousand separators such as `125.000`.
* Added filtering for common non-item receipt metadata such as payment, refund, table number, quantity summary, and receipt header information.
* Added parser unit tests.

### Item Confirmation

* Added backend support for saving parsed OCR items into the `items` table.
* Confirmed OCR items can be manually corrected before being saved.
* Verified confirmed items can be created under a receipt using the receipt item endpoint.

### Item Shares

* Added item-level equal split endpoint.
* Added replace-existing behaviour for repeated assignment.
* Kept manual item share endpoints available.
* Verified item shares can be created for confirmed receipt items.

### Charge Allocation

* Added proportional allocation of tax and service charge across item shares.
* Updated item share totals after allocation.
* Verified receipt-level charges can be allocated after item shares are created.

### Debt Calculation

* Verified debt calculation based on item shares and receipt payers.
* Added debt recalculation support by cancelling old active debts and creating updated pending debts.
* Verified group debt listing after recalculation.

### Full Workflow Verification

* Added `scripts/ms2_full_workflow_smoke_test.py`.
* Verified the backend flow from receipt upload to final debt listing.
* Confirmed that the workflow can run with PaddleOCR by setting `OCR_ENGINE=paddleocr`.

## Testing Completed

The following tests and checks were completed:

```text id="m87do5"
python -m compileall app tests scripts
python -m pytest tests/test_receipt_parser.py tests/test_ocr_service.py tests/test_paddleocr_engine.py -q
python scripts/ms2_full_workflow_smoke_test.py
```

## Main API Endpoints Completed or Verified

```text id="is2aqv"
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

## Demo Evidence Prepared

The backend can be demonstrated with the following evidence:

```text id="ei0pk6"
1. Receipt upload endpoint in Swagger
2. Successful receipt image upload response
3. Raw OCR text or parsed OCR items
4. Confirmed items created under a receipt
5. Equal item shares created for confirmed items
6. Tax and service charge allocation response
7. Debt recalculation response
8. Group debt listing response
9. Full workflow smoke test success output
```

## Current Limitations

The OCR parser is heuristic-based. It works for common receipt formats but may require manual correction for complex layouts, poor image quality, unusual currency formats, or receipts in unsupported languages.

Manual correction is expected before confirming OCR items in the product flow.

## Remaining Future Work

These are not required for the current Milestone 2 backend scope but can be improved later:

* more robust OCR parsing for diverse receipt layouts
* frontend-driven manual OCR correction UI
* support for more receipt languages and currencies
* advanced debt optimisation
* export features
* more complete endpoint-level automated tests
