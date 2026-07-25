# MS3 Deployment Verification

## Public Links

Frontend:  
https://dfs-orbital-frontend.onrender.com

Backend:  
https://dfs-orbital-2026.onrender.com

API Docs:  
https://dfs-orbital-2026.onrender.com/docs

---

## Backend Health Check

Command:

    curl -s --max-time 20 https://dfs-orbital-2026.onrender.com/api/v1/health

Result:

    {"status":"ok","service":"Debt-First Search API","environment":"development"}
    HTTP_STATUS:200

Status:

    Passed on 2026-07-26 using the public Render URL.

---

## Deployment Configuration

### Backend

- Platform: Render
- Framework: FastAPI
- Database: Render PostgreSQL
- Public backend URL: https://dfs-orbital-2026.onrender.com
- API documentation: Swagger UI at /docs
- Public deployment OCR mode: `OCR_ENGINE=paddleocr`
- OCR runtime: `paddlepaddle==3.3.0`, `paddleocr==3.7.0`
- OCR models: `PP-OCRv5_mobile_det` and `PP-OCRv5_mobile_rec`
- OCR compatibility settings: oneDNN disabled and CPU inference limited to one thread
- Render backend instance: Standard (2 GB RAM), selected because the 512 MB Free instance restarted while loading PaddleOCR.

### Frontend

- Platform: Render
- Framework: React + Vite
- Public frontend URL: https://dfs-orbital-frontend.onrender.com
- Frontend API base URL points to deployed backend.

### Database

- Database: PostgreSQL
- Hosted on Render
- Migrations managed through Alembic
- Database URL is configured through environment variables and is not committed to the repository.

---

## Automated Backend Test Verification

Command:

    cd backend
    OCR_ENGINE=mock RUN_PADDLEOCR_TESTS=0 .venv/bin/python -m compileall app tests
    OCR_ENGINE=mock RUN_PADDLEOCR_TESTS=0 .venv/bin/python -m pytest -v

Database target:

    Local SQLite test database file: backend/ci_docs_test.db

Result:

    24 passed, 1 skipped in 0.22s

Status:

    Passed

Notes:

- Test run date: 2026-07-25
- The skipped test is the real PaddleOCR image test, skipped by default for local/CI-safe verification.
- This automated test run used local configuration only and did not use the deployed Render production database.
- On 2026-07-26, backend application and test compilation passed again. A fresh pytest run could not be completed because the local Python installation could not load its `pyexpat` library and the existing virtual environment was missing `httpx`; the earlier passing result above remains the latest complete backend suite result and is not represented as a new run.

---

## Frontend Verification

Commands:

    cd frontend
    npm run lint
    npm test
    npm run build

Observed result on 2026-07-26:

    ESLint passed
    4 frontend tests passed
    Vite production build completed successfully

Expense editing user-flow test:

1. Signed in as the Sixian demo user.
2. Opened a group and created an expense named `Dinner before edit`.
3. Confirmed that an `Edit details` button appeared below the expense description.
4. Changed the name to `Dinner after edit`.
5. Changed the description to `Updated after confirmation`.
6. Saved, reloaded the page, and confirmed that both edited values persisted.

Result:

    Passed locally against the FastAPI PATCH /api/v1/expenses/{expense_id} endpoint.

Deployment note:

    The expense-edit frontend change is uncommitted and not yet deployed at the time of this document update.

---

## Full Deployed Workflow Verification Checklist

| Step | Action | Expected Result | Status | Notes |
|---:|---|---|---|---|
| 1 | Open deployed frontend | Frontend loads successfully | Passed | User completed the deployed workflow on 2026-07-26. |
| 2 | Log in using demo/mock user | User enters protected app area | Passed | Demo login was also reproduced during the local browser user test. |
| 3 | Create or open a group | Group page loads correctly | Passed | Group detail and member information loaded in the tested workflow. |
| 4 | Add group members | Members are shown in group detail | Passed | Deployment logs recorded member creation with `201 Created` and subsequent retrieval with `200 OK`. |
| 5 | Create an expense | Expense appears under selected group | Passed | Deployment logs recorded expense creation with `201 Created`. |
| 5a | Edit expense name and description | Updated details remain after reload | Passed locally | `Edit details`, save, and reload flow passed; production deployment pending. |
| 6 | Create or upload a receipt | Receipt is created under expense | Passed | Real PNG OCR upload returned `201 Created`. |
| 7 | Review OCR/manual receipt items | Items are visible and editable/reviewable | Passed | User confirmed that real OCR results appeared; parsing quality was imperfect but reviewable. |
| 8 | Confirm receipt items | Items are saved to backend | Passed | Three item creation requests returned `201 Created`, followed by `GET .../items 200 OK`. |
| 9 | Assign item shares to members | Share records are created successfully | Pending | Share retrieval was observed, but share creation was not re-run during this verification. |
| 10 | Preview split result | Per-user subtotal, tax, service, and total are shown | Pending | Not re-run during this verification. |
| 11 | Recalculate debts | Suggested debts are generated | Pending | Not re-run during this verification. |
| 12 | Open debts page | Debts are listed correctly | Pending | Not re-run during this verification. |
| 13 | Mark debt as paid | Debt status changes to marked paid | Pending | Not re-run during this verification. |
| 14 | Confirm debt as received | Debt status changes to confirmed received | Pending | Not re-run during this verification. |

---
## Overall Test Result

Date:

    2026-07-26

Tester:

    Project user and Codex-assisted local verification

Overall status:

    Core deployed OCR workflow passed; expense editing passed locally; remaining settlement lifecycle steps are pending re-verification

Summary:

    The public health endpoint returned HTTP 200. The deployed Standard instance loaded the PP-OCRv5 mobile models, processed a real PNG receipt, returned `201 Created`, and saved three parsed items. The new expense-edit interaction passed a local browser user test, including persistence after reload. The frontend passed lint, four tests, and a production build. Settlement share creation, preview, recalculation, and payment-state transitions were not re-run and remain pending rather than being claimed as passed.

---

## Backend API Verification

| Endpoint | Purpose | Verified? | Notes |
|---|---|---|---|
| GET /api/v1/health | Backend health check | Passed | Public endpoint returned HTTP 200 on 2026-07-26. |
| POST /api/v1/groups | Create group | Passed previously | Existing deployment evidence records successful group creation; not repeated in the final OCR test. |
| GET /api/v1/groups/{group_id} | Read group detail | Passed | Group detail loaded during the verified workflow. |
| POST /api/v1/groups/{group_id}/members | Add group member | Passed | Deployment log returned `201 Created`. |
| POST /api/v1/groups/{group_id}/expenses | Create expense | Passed | Deployment log returned `201 Created`. |
| PATCH /api/v1/expenses/{expense_id} | Edit expense name and description | Passed locally | Browser test confirmed saved values persisted after reload; frontend change not yet deployed. |
| POST /api/v1/expenses/{expense_id}/receipts | Create manual receipt | Not re-run | Real OCR upload was tested instead. |
| POST /api/v1/expenses/{expense_id}/receipts/upload | Upload receipt image | Passed | Real PaddleOCR PNG upload returned `201 Created`. |
| POST /api/v1/receipts/{receipt_id}/items/batch | Confirm reviewed OCR items | Passed through UI flow | Reviewed items were persisted; three item creation responses returned `201 Created`. |
| POST /api/v1/items/{item_id}/shares/equal | Create equal item shares | Pending | Not re-run during this verification. |
| POST /api/v1/receipts/{receipt_id}/shares/allocate-charges | Allocate tax and service charge | Pending | Not re-run during this verification. |
| POST /api/v1/expenses/{expense_id}/split/preview | Preview fair split result | Pending | Not re-run during this verification. |
| POST /api/v1/expenses/{expense_id}/debts/recalculate | Recalculate settlement debts | Pending | Not re-run during this verification. |
| GET /api/v1/groups/{group_id}/debts | List group debts | Pending | Endpoint requests succeeded in earlier testing; final lifecycle was not re-run. |
| PATCH /api/v1/debts/{debt_id}/mark-paid | Mark debt as paid | Pending | Not re-run during this verification. |
| PATCH /api/v1/debts/{debt_id}/confirm-received | Confirm debt received | Pending | Not re-run during this verification. |

---

## Evidence Screenshots To Capture

1. Deployed frontend homepage
2. Backend Swagger UI page
3. Backend health check response
4. Group creation or group detail page
5. Expense creation page/result
6. Receipt upload or receipt creation step
7. OCR/manual item review step
8. Item assignment step
9. Split preview showing tax/service allocation
10. Debt recalculation result
11. Debts page showing settlement status
12. Mark paid / confirm received result
13. GitHub Actions CI success page
14. Render frontend deployment success page
15. Render backend deployment success page

---
## Issues Found During Deployment Verification

| Issue | Step | Severity | Status | Notes |
|---|---|---:|---|---|
| Expense details could not be edited after creation | Expense creation and review | Medium | Fixed locally; deployment pending | Added a visible `Edit details` action below the expense description with name/description fields, Save, and Cancel. |
| PaddleOCR restarted the 512 MB Render Free backend | Receipt upload | High | Resolved | Switched to PP-OCRv5 mobile models, disabled oneDNN, limited CPU threads, and moved the backend to a Standard 2 GB instance. |
| OCR parsing is weak for some receipt layouts | OCR review | Medium | Open, mitigated | Results remain reviewable and editable before confirmation. |

Severity guide:

- High: blocks demo flow
- Medium: feature works but confusing or partially broken
- Low: minor UI/documentation issue

---

## Fixes Made After Verification

| Issue | Fix | Commit / PR | Status |
|---|---|---|---|
| Expense details could not be edited | Added PATCH API client call and inline expense editor | Uncommitted local change | Passed local user test; pending user commit/deployment |
| PaddleOCR runtime failure | Added mobile models and oneDNN/CPU settings | Merged before this verification | Passed deployed real-PNG test |
| Unpinned OCR package | Pinned `paddleocr==3.7.0` | Merged before this verification | Passed deployed real-PNG test |

---

## Notes and Limitations

- The public deployment uses real PaddleOCR on a Render Standard 2 GB instance.
- Receipt parsing remains heuristic and users should review OCR-detected items before confirmation.
- Uploaded receipt files are stored on the service filesystem; durable object storage remains recommended for long-term production use.
- Database credentials are stored as Render environment variables and are not committed to the repository.

---

## Final Deployment Verification Statement

Core deployment verification passed for public health, group/expense access, real OCR receipt upload, OCR item review, and item persistence. Expense name and description editing passed locally and is ready for the user's commit and deployment. Share assignment, split preview, debt recalculation, and settlement status transitions remain explicitly pending re-verification. No demo-blocking issue was observed in the verified core OCR workflow.
