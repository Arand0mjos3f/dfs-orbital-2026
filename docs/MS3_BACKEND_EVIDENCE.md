# MS3 Backend Evidence

## 1. Overview

This document summarises the backend contribution and engineering evidence for Milestone 3 of Debt-First Search.

The MS3 backend extends the project from a manual CRUD-style expense splitting prototype into an OCR-assisted and fairness-focused receipt splitting system. It supports receipt image upload, OCR result review, batch item confirmation, item-level share assignment, proportional tax and service charge allocation, cent-safe split preview, debt recalculation, automated regression tests, CI, and public deployment.

## 2. Public Deployment Links

Frontend:

    https://dfs-orbital-frontend.onrender.com

Backend:

    https://dfs-orbital-2026.onrender.com

API Documentation:

    https://dfs-orbital-2026.onrender.com/docs

Backend health check:

    https://dfs-orbital-2026.onrender.com/api/v1/health

## 3. Backend Contribution Summary

### Main backend responsibilities completed

- Receipt image upload API
- OCR service integration
- Mock OCR engine for local and CI-safe testing
- Production PaddleOCR integration using PP-OCRv5 mobile models
- Receipt text parser
- OCR-reviewed item confirmation
- Batch item confirmation endpoint
- Item share creation
- Equal share support
- Tax and service charge allocation
- Cent-safe split preview
- Debt calculation and recalculation
- Settlement status workflow
- Backend API regression tests
- GitHub Actions CI backend test automation
- Render backend deployment
- PostgreSQL database deployment

### MS3 backend story

The backend was improved from a basic manual expense API into a more realistic receipt splitting engine. Instead of relying only on manual item entry, the backend now supports an OCR-assisted workflow where receipt items can be extracted, reviewed, confirmed, split among users, adjusted for tax and service charge, previewed with cent-safe rounding, and converted into settlement debts.

## 4. Key Backend API Endpoints

The following endpoints are the main MS3 backend evidence.

| Endpoint | Purpose | MS3 Evidence |
|---|---|---|
| `PATCH /api/v1/expenses/{expense_id}` | Update an expense name, description, or status | Supports correcting expense details after creation |
| `POST /api/v1/expenses/{expense_id}/receipts/upload` | Upload a receipt image and run OCR/parsing | Supports OCR-assisted receipt entry |
| `POST /api/v1/receipts/{receipt_id}/items/batch` | Confirm reviewed OCR items in one request | Supports user-facing OCR review flow |
| `GET /api/v1/receipts/{receipt_id}/items` | Read confirmed items under a receipt | Allows frontend to display saved receipt items |
| `POST /api/v1/items/{item_id}/shares/equal` | Split an item equally among selected users | Supports fair item assignment |
| `POST /api/v1/receipts/{receipt_id}/shares/allocate-charges` | Allocate tax and service charge across item shares | Makes tax/service splitting transparent |
| `POST /api/v1/expenses/{expense_id}/split/preview` | Preview per-user subtotal, tax, service, total, and suggested debts | Supports cent-safe fairness preview |
| `POST /api/v1/expenses/{expense_id}/debts/recalculate` | Cancel old active debts and regenerate settlement debts | Supports repeated editing and recalculation |
| `GET /api/v1/groups/{group_id}/debts` | List group debts | Supports settlement display |
| `PATCH /api/v1/debts/{debt_id}/mark-paid` | Mark a debt as paid | Supports payment workflow |
| `PATCH /api/v1/debts/{debt_id}/confirm-received` | Confirm that payment was received | Supports settlement completion |

## 5. Feature Evidence

### 5.1 OCR-assisted receipt upload

Backend support:

- Accepts receipt image upload.
- Stores receipt metadata.
- Runs OCR service.
- Parses OCR text into structured receipt fields and item candidates.
- Returns parsed result for frontend review.

Evidence to capture:

- Swagger screenshot of `POST /api/v1/expenses/{expense_id}/receipts/upload`
- Upload response showing receipt information and parsed items
- Deployed PaddleOCR logs showing `PP-OCRv5_mobile_det` and `PP-OCRv5_mobile_rec`
- Deployed upload response showing `201 Created`

Deployment verification on 2026-07-26:

- Render loaded `PP-OCRv5_mobile_det` and `PP-OCRv5_mobile_rec`.
- A real PNG receipt upload returned `201 Created`.
- Three reviewed items were created with `201 Created`.
- Receipt and item retrieval returned `200 OK`.
- The user confirmed that the detected content came from the uploaded receipt rather than mock data.
- OCR parsing quality was usable but imperfect, so manual review remains part of the intended workflow.

### 5.2 Expense detail editing

Frontend and backend support:

- Displays an `Edit details` action directly below each expense description.
- Opens inline fields for expense name and description.
- Saves through `PATCH /api/v1/expenses/{expense_id}`.
- Provides Save and Cancel actions.
- Updates the displayed expense immediately after a successful response.

User-flow verification on 2026-07-26:

1. Created an expense named `Dinner before edit`.
2. Opened `Edit details`.
3. Changed the name to `Dinner after edit`.
4. Changed the description to `Updated after confirmation`.
5. Saved and reloaded the page.
6. Confirmed that both edited values persisted.

Result:

    Passed locally; frontend change is uncommitted and not yet deployed.

### 5.3 OCR item review and batch confirmation

Backend support:

- Allows the frontend to submit all reviewed OCR items in one request.
- Preserves original OCR fields such as original item name and original price.
- Preserves manual edit information through `is_manually_edited`.
- Supports `replace_existing=true` so users can re-confirm corrected OCR items.
- Safely clears old dependent item shares when replacing old items.

Evidence to capture:

- Swagger screenshot of `POST /api/v1/receipts/{receipt_id}/items/batch`
- API response showing `created_item_count`
- Test result showing old item shares are cleared before replacement

### 5.4 Tax and service charge allocation

Backend support:

- Allocates receipt-level tax and service charge proportionally across item shares.
- Updates each item share with:
  - `item_share_amount`
  - `tax_share_amount`
  - `service_charge_share_amount`
  - `total_share_amount`
- Ensures allocated values remain cent-safe.

Evidence to capture:

- Swagger screenshot of `POST /api/v1/receipts/{receipt_id}/shares/allocate-charges`
- API response showing tax and service charge allocation
- Regression test result showing allocation sums match receipt totals

### 5.5 Split preview

Backend support:

- Provides a preview before final debt generation.
- Returns per-user:
  - item subtotal
  - tax share
  - service charge share
  - final total share
- Returns receipt-level allocation details.
- Returns suggested debts without writing debt records.
- Uses deterministic cent-safe rounding.

Evidence to capture:

- Swagger screenshot of `POST /api/v1/expenses/{expense_id}/split/preview`
- API response showing per-user totals
- Frontend split preview screenshot
- Regression tests for cent-safe allocation and preview payload

### 5.6 Debt recalculation

Backend support:

- Recalculates settlement debts from the latest item shares.
- Cancels old active debts before generating new pending debts.
- Prevents duplicate active debt records after repeated recalculation.
- Supports iterative user editing before final settlement.

Evidence to capture:

- Swagger screenshot of `POST /api/v1/expenses/{expense_id}/debts/recalculate`
- Debt list before and after recalculation
- Regression test showing old debts become `cancelled` and new debts become `pending`

## 6. Backend Testing Evidence

### 6.1 Test scope

The backend test suite covers unit-level logic and API-level regression tests.

Covered areas:

- Receipt parser behavior
- OCR service behavior
- PaddleOCR integration path, skipped by default in CI
- Cent-safe financial rounding
- Proportional tax and service charge allocation
- Suggested debt generation
- Batch item confirmation
- Foreign-key-safe cleanup of old item shares
- Split preview API success and error cases
- Charge allocation API correctness
- Debt recalculation behavior

### 6.2 MS3 regression tests

The following MS3 regression tests were added.

| Test file | Coverage |
|---|---|
| `backend/tests/test_ms3_batch_items_api.py` | Batch OCR item confirmation, replacement behavior, old item share cleanup, invalid totals, empty item list validation |
| `backend/tests/test_ms3_split_preview_api.py` | Split preview payload, per-user summaries, tax/service allocation, not-found and not-ready errors |
| `backend/tests/test_ms3_charge_allocation_api.py` | Proportional tax/service allocation, cent-safe sums, no-share error case |
| `backend/tests/test_ms3_debt_recalculate_api.py` | First and repeated recalculation, cancellation of old debts, latest-share recalculation, not-found and not-ready errors |
| `backend/tests/test_ms3_financial_logic.py` | Cent-safe rounding, proportional allocation, suggested debt generation, multiple debtor/creditor offset cases |

### 6.3 Local pytest command

Compile command:

    cd backend
    OCR_ENGINE=mock RUN_PADDLEOCR_TESTS=0 .venv/bin/python -m compileall app tests

Pytest command:

    cd backend
    OCR_ENGINE=mock RUN_PADDLEOCR_TESTS=0 .venv/bin/python -m pytest -v

Database target:

    Local SQLite test database file: backend/ci_docs_test.db

Observed result:

    24 passed, 1 skipped in 0.22s

Final pytest summary:

    24 passed, 1 skipped

Notes:

- Test run date: 2026-07-25
- Python interpreter used: `backend/.venv/bin/python`
- Full pytest output was reviewed locally. The final summary is recorded above.
- The skipped test is the real PaddleOCR image test, skipped because `RUN_PADDLEOCR_TESTS=0` for local/CI-safe verification.
- On 2026-07-26, backend source and test compilation passed. A fresh pytest run was blocked by the local Python installation failing to load `pyexpat` and by `httpx` being absent from the existing virtual environment. The `24 passed, 1 skipped` result above is retained as the latest complete backend suite result rather than being misrepresented as a new run.

### 6.4 Frontend verification

Commands:

    cd frontend
    npm run lint
    npm test
    npm run build

Observed result on 2026-07-26:

    ESLint passed
    4 tests passed
    Vite production build passed

The browser user test also verified expense creation, discovery of the `Edit details` action, editing both fields, saving, and persistence after reload.

### 6.5 CI testing

GitHub Actions workflow:

    .github/workflows/ci.yml

Backend CI job:

- Installs backend dependencies
- Runs backend compile check
- Runs backend pytest suite
- Uses the default mock OCR mode
- Uses a local SQLite CI database
- Skips heavy PaddleOCR tests by default
- Runs automatically on pull requests and pushes

The local MS3 evidence run mirrors the CI-safe backend testing path: compile check plus verbose pytest, mock OCR behavior, PaddleOCR disabled by default, and a local SQLite database instead of any deployed production database.

Evidence to capture:

- GitHub Actions CI success screenshot
- Backend test job log showing `python -m pytest -v`
- PR screenshot showing CI passed before merge

## 7. Database Evidence

The backend uses PostgreSQL as the main database.

Main tables:

- `users`
- `groups`
- `group_members`
- `expenses`
- `receipts`
- `items`
- `item_shares`
- `debts`

Database-related evidence:

- SQLAlchemy models under `backend/app/models`
- CRUD modules under `backend/app/crud`
- Alembic migration setup
- Render PostgreSQL deployment
- ERD diagram

Evidence to capture:

- ERD diagram
- Render PostgreSQL dashboard screenshot, with private values hidden
- Alembic migration evidence
- Example API call that creates or reads database records

## 8. Architecture Evidence

### Backend architecture

The backend follows a layered architecture.

Layers:

- API routes: `backend/app/api/v1/endpoints`
- Schemas: `backend/app/schemas`
- CRUD/data access: `backend/app/crud`
- Models: `backend/app/models`
- Services: `backend/app/services`
- Database setup: `backend/app/db`
- Tests: `backend/tests`

### Design pattern and principles

Backend design principles:

- Separation of concerns between API, schema, CRUD, model, and service layers
- Backend as the source of truth for financial calculation
- Use of `Decimal` instead of float for money values
- Deterministic cent-safe rounding
- User review before final OCR item confirmation
- Recalculation instead of unsafe overwriting for settlement debts
- Stable mock OCR mode for local and CI-safe testing
- Real PaddleOCR deployment using smaller mobile models on a 2 GB backend instance

### Design decisions

| Decision | Reason |
|---|---|
| Use FastAPI | Provides clear REST API structure and automatic Swagger documentation |
| Use PostgreSQL | Supports relational group, receipt, item, share, and debt data |
| Use OCR review before confirmation | OCR can be inaccurate, so users must review before saving final items |
| Add batch item confirmation | Frontend OCR review flow needs to submit all reviewed items at once |
| Use backend split preview | Prevents frontend/client-side rounding inconsistency |
| Use proportional tax/service allocation | Matches how receipt-level charges should be fairly distributed |
| Use Decimal for money | Avoids floating-point rounding errors |
| Use debt recalculation | Allows users to edit shares and regenerate debts safely |
| Use PP-OCRv5 mobile models in production | Reduces model memory use while retaining real OCR functionality |
| Disable oneDNN and limit OCR CPU threads | Avoids the observed Paddle inference incompatibility and controls resource use |
| Use Render Standard for the OCR backend | The 512 MB Free instance restarted during model initialization; Standard provides 2 GB RAM |
| Pin `paddleocr==3.7.0` | Preserves the exact dependency version verified in production |

## 9. Screenshot Evidence Checklist

Recommended backend screenshots for MS3 report or presentation:

| Screenshot | Purpose | Captured? |
|---|---|---|
| Deployed Swagger docs page | Shows public backend API documentation | TODO |
| Health endpoint response | Shows deployed backend is alive | TODO |
| Receipt upload endpoint in Swagger | Shows OCR upload API | TODO |
| Batch item confirmation endpoint in Swagger | Shows OCR review backend support | TODO |
| Split preview endpoint in Swagger | Shows fair split preview backend support | TODO |
| Charge allocation endpoint in Swagger | Shows tax/service allocation backend support | TODO |
| Debt recalculation endpoint in Swagger | Shows settlement recalculation support | TODO |
| GitHub Actions CI success page | Shows automated backend testing | TODO |
| Backend regression tests log | Shows MS3 backend tests pass | TODO |
| Render backend deployment page | Shows deployed backend service | TODO |
| Render PostgreSQL page | Shows deployed database, with private values hidden | TODO |
| Frontend split preview page | Shows backend preview result integrated into UI | TODO |
| Debts page | Shows backend debt calculation integrated into UI | TODO |

## 10. Known Limitations

- The deployed public backend uses real PaddleOCR and requires a Render Standard instance; the 512 MB Free and Starter tiers are insufficient for the verified configuration.
- Receipt parsing is heuristic-based and may require manual correction for complex receipt layouts.
- Receipt images currently use service-local storage and should move to durable object storage for long-term production use.
- The current authentication flow may still use mock/demo authentication depending on final frontend configuration.
- CSV/PDF export is treated as future work unless extra time is available.

## 11. Future Work

Possible future improvements:

- Improve receipt parser robustness for more receipt formats and languages
- Move uploaded receipt images to durable object storage
- Add OCR confidence scores and stronger image preprocessing
- Add real authentication and authorization
- Add CSV/PDF export
- Add more frontend integration tests
- Add user role permissions for group and expense operations
- Improve receipt image preprocessing before OCR
- Add confidence scores for OCR-recognized items

## 12. Final Backend Evidence Statement

The MS3 backend provides the core technical foundation for Debt-First Search's OCR-assisted and fairness-focused receipt splitting workflow. It supports receipt upload, OCR parsing, reviewed item confirmation, item-level share assignment, tax and service charge allocation, cent-safe split preview, debt recalculation, automated regression testing, CI, and public deployment. These backend features provide evidence of advanced functionality, database-backed system design, multi-level testing, and production-style deployment.
