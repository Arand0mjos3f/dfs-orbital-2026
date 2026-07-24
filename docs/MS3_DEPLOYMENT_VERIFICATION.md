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

    curl -s https://dfs-orbital-2026.onrender.com/api/v1/health | python -m json.tool

Result:

    TODO: Paste health response here.

Status:

    TODO: Passed / Failed

---

## Deployment Configuration

### Backend

- Platform: Render
- Framework: FastAPI
- Database: Render PostgreSQL
- Public backend URL: https://dfs-orbital-2026.onrender.com
- API documentation: Swagger UI at /docs
- Public deployment OCR mode: OCR_ENGINE=mock
- Reason for mock OCR on deployment: keeps the public demo stable and avoids heavy PaddleOCR model installation on the deployed server.

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

## Full Deployed Workflow Verification Checklist

| Step | Action | Expected Result | Status | Notes |
|---:|---|---|---|---|
| 1 | Open deployed frontend | Frontend loads successfully | TODO | TODO |
| 2 | Log in using demo/mock user | User enters protected app area | TODO | TODO |
| 3 | Create or open a group | Group page loads correctly | TODO | TODO |
| 4 | Add group members | Members are shown in group detail | TODO | TODO |
| 5 | Create an expense | Expense appears under selected group | TODO | TODO |
| 6 | Create or upload a receipt | Receipt is created under expense | TODO | TODO |
| 7 | Review OCR/manual receipt items | Items are visible and editable/reviewable | TODO | TODO |
| 8 | Confirm receipt items | Items are saved to backend | TODO | TODO |
| 9 | Assign item shares to members | Share records are created successfully | TODO | TODO |
| 10 | Preview split result | Per-user subtotal, tax, service, and total are shown | TODO | TODO |
| 11 | Recalculate debts | Suggested debts are generated | TODO | TODO |
| 12 | Open debts page | Debts are listed correctly | TODO | TODO |
| 13 | Mark debt as paid | Debt status changes to marked paid | TODO | TODO |
| 14 | Confirm debt as received | Debt status changes to confirmed received | TODO | TODO |

---
## Overall Test Result

Date:

    TODO: YYYY-MM-DD

Tester:

    TODO: Name

Overall status:

    TODO: Passed / Partially passed / Failed

Summary:

    TODO: Write a short summary of whether the deployed app workflow works end-to-end.

---

## Backend API Verification

| Endpoint | Purpose | Verified? | Notes |
|---|---|---|---|
| GET /api/v1/health | Backend health check | TODO | TODO |
| POST /api/v1/groups | Create group | TODO | TODO |
| GET /api/v1/groups/{group_id} | Read group detail | TODO | TODO |
| POST /api/v1/groups/{group_id}/members | Add group member | TODO | TODO |
| POST /api/v1/groups/{group_id}/expenses | Create expense | TODO | TODO |
| POST /api/v1/expenses/{expense_id}/receipts | Create manual receipt | TODO | TODO |
| POST /api/v1/expenses/{expense_id}/receipts/upload | Upload receipt image | TODO | TODO |
| POST /api/v1/receipts/{receipt_id}/items/batch | Confirm reviewed OCR items | TODO | TODO |
| POST /api/v1/items/{item_id}/shares/equal | Create equal item shares | TODO | TODO |
| POST /api/v1/receipts/{receipt_id}/shares/allocate-charges | Allocate tax and service charge | TODO | TODO |
| POST /api/v1/expenses/{expense_id}/split/preview | Preview fair split result | TODO | TODO |
| POST /api/v1/expenses/{expense_id}/debts/recalculate | Recalculate settlement debts | TODO | TODO |
| GET /api/v1/groups/{group_id}/debts | List group debts | TODO | TODO |
| PATCH /api/v1/debts/{debt_id}/mark-paid | Mark debt as paid | TODO | TODO |
| PATCH /api/v1/debts/{debt_id}/confirm-received | Confirm debt received | TODO | TODO |

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
| TODO | TODO | TODO | TODO | TODO |

Severity guide:

- High: blocks demo flow
- Medium: feature works but confusing or partially broken
- Low: minor UI/documentation issue

---

## Fixes Made After Verification

| Issue | Fix | Commit / PR | Status |
|---|---|---|---|
| TODO | TODO | TODO | TODO |

---

## Notes and Limitations

- The public deployment uses OCR_ENGINE=mock for stability.
- Real PaddleOCR integration was implemented and tested locally.
- The deployed demo focuses on verifying the full user workflow and frontend-backend integration.
- Heavy OCR model hosting is treated as a deployment limitation and future improvement.
- Database credentials are stored as Render environment variables and are not committed to the repository.

---

## Final Deployment Verification Statement

TODO: Example:

The deployed MS3 system was verified through the public frontend and backend links. The main workflow from group/expense creation to receipt item confirmation, split preview, debt recalculation, and settlement status update was tested. Backend API documentation and health check were accessible through the deployed backend. No demo-blocking backend issues were found during verification.
