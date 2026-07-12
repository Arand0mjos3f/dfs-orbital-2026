# O(n) Debtor Testing Strategy

## Document Information

| Field | Value |
|---|---|
| Project | O(n) Debtor |
| Team | 6634 |
| Level of Achievement | Apollo 11 |
| Milestone | Milestone 3 - Extensions |
| Team Members | Chen Sixian, Sun Jingyi |
| Last Updated | 12 July 2026 |

## Milestone 3 Update

Milestone 3 extends the Milestone 2 prototype with more complete receipt review, fairer settlement calculation, stronger backend summary support, and automated CI checks.

New Milestone 3 testing evidence includes:

- OCR-assisted receipt upload and review flow.
- Editable OCR item confirmation before saving items.
- Tax and service charge allocation into final member shares.
- Group debt summary endpoint and frontend member balance display.
- GitHub Actions CI for frontend and backend checks.
- Backend tests for charge allocation and group debt summary.
- User testing plan in `docs/user_testing_ms3.md`.

Current automated verification commands:

```bash
cd frontend
npm run lint
npm test
npm run build

cd ../backend
python -m pytest -v
```

Current automated test result after Milestone 3 additions:

```text
Frontend: 4 passed
Backend: 11 passed, 1 skipped
CI: frontend and backend checks run automatically on pull requests
```

The optional PaddleOCR integration test remains skipped by default because it depends on local PaddleOCR installation and a real receipt image. Mock OCR remains the default test mode so that CI and local development are reproducible.

## 1. Testing Objectives

The testing strategy verifies that O(n) Debtor:

- Performs financial calculations accurately.
- Preserves data across browser refreshes.
- Enforces group-owner and settlement permissions.
- Integrates the React frontend, FastAPI backend, and database correctly.
- Handles matching and mismatching receipt totals clearly.
- Supports OCR-assisted receipt review.
- Allocates tax and service charges into final member shares.
- Summarises group-level balances and settlement status.
- Supports the complete settlement lifecycle.
- Remains stable when used through the primary mobile-first workflow.

## 2. Testing Scope

### In Scope

- Prototype authentication and demo-user login.
- Group creation, listing, editing, deletion, and membership.
- Expense creation.
- Manual receipt and item entry.
- OCR-assisted receipt upload and item review.
- Receipt and item-total validation.
- Item assignment and equal splitting.
- Tax and service charge allocation.
- Debt calculation.
- Group debt summary and member balance display.
- Mark-paid and confirm-received settlement states.
- Dashboard and Debts page data.
- Persistence after browser refresh.
- Backend API and database integration.
- CI checks for frontend and backend test commands.

### Out of Scope for Milestone 3

- Production token authentication.
- Production PaddleOCR accuracy benchmarking.
- Cloud deployment.
- Payment-provider integration.
- CSV or PDF export.
- Offline PWA behaviour.
- High-volume performance testing.

## 3. Testing Levels

### 3.1 Unit Testing

Unit tests verify pure calculations without loading React, FastAPI, or a database.

Current unit-test target:

- `frontend/src/utils/receiptTotals.js`

Covered behaviour:

- Summing receipt item totals.
- Handling an empty item list.
- Calculating absolute receipt differences.
- Detecting matching totals.

Runner:

```bash
cd frontend
npm test
```

Current result:

```text
4 tests passed
0 tests failed
```

### 3.2 Backend Integration Testing

Backend tests verify cooperation between models, CRUD functions, settlement calculation, OCR parsing, charge allocation, and group summary logic.

The backend tests use an isolated in-memory SQLite database where appropriate. They do not read from or write to the development PostgreSQL database.

Covered behaviour:

- Mock OCR text extraction.
- Receipt parser extraction of items, subtotal, tax, service charge, and total.
- Optional PaddleOCR integration test, skipped by default.
- Settlement calculation and payment lifecycle.
- Proportional tax and service charge allocation.
- Group debt summary calculation across pending, marked-paid, confirmed, and cancelled debt states.

Runner:

```bash
cd backend
source .venv/bin/activate
python -m pytest -v
```

Current result:

```text
11 tests passed
1 test skipped
0 tests failed
```

### 3.3 System Testing

System testing verifies the application through the browser while the React frontend, FastAPI backend, and PostgreSQL database are running together.

Backend:

```bash
cd backend
source .venv/bin/activate
python -m uvicorn main:app --reload
```

Frontend:

```bash
cd frontend
npm run dev
```

URLs:

```text
Frontend: http://localhost:5173
Swagger: http://127.0.0.1:8000/docs
```

### 3.4 User Testing

User testing will be conducted with 2-3 NUS students who were not involved in implementation.

The Milestone 3 user testing plan is documented in:

```text
docs/user_testing_ms3.md
```

User testing results must only be added after real participants complete the tasks.

### 3.5 Continuous Integration

GitHub Actions runs automated checks on pull requests and milestone branch pushes.

CI checks include:

- Frontend dependency installation.
- Frontend lint.
- Frontend unit tests.
- Frontend production build.
- Backend dependency installation.
- Backend pytest suite.

This reduces reliance on manual-only testing and provides visible pass/fail evidence for pull requests.

## 4. Test Environment

| Component | Environment |
|---|---|
| Operating System | macOS for local testing, Ubuntu for CI |
| Browser | Google Chrome |
| Frontend | React 19, Vite 8 |
| Backend | FastAPI |
| Development Database | PostgreSQL |
| Integration-Test Database | In-memory SQLite |
| Frontend Unit Runner | Node test runner |
| Backend Integration Runner | Pytest |
| API Inspection | Swagger/OpenAPI |
| CI | GitHub Actions |

## 5. Test Data

Prototype users:

| Username | Role |
|---|---|
| Sixian | Group owner |
| Jingyi | Group member |

Prototype login credentials:

```text
Sixian:
Email: sixian@example.com
Password: password123

Jingyi:
Email: jingyi.demo@example.com
Password: password123
```

These accounts are for local prototype testing only.

## 6. Entry Criteria

Testing can begin when:

- PostgreSQL is running for local system testing.
- Database migrations have been applied.
- Required dependencies are installed.
- Backend Swagger loads.
- Frontend loads on port 5173.
- Test users exist.
- Lint, test, and build commands complete successfully.

## 7. Exit Criteria

Milestone 3 testing is complete when:

- All frontend unit tests pass.
- All backend automated tests pass, except intentionally skipped optional PaddleOCR tests.
- Frontend lint passes.
- Frontend production build passes.
- GitHub Actions CI passes on pull requests.
- Critical system test cases pass.
- OCR review, tax/service allocation, and group summary workflows are manually verified.
- User testing has been performed or formally scheduled.
- No unresolved P0 or P1 defects remain.
- Known limitations are documented.

## 8. Automated Frontend Test Cases

| ID | Test | Expected Result | Status |
|---|---|---|---|
| UT-01 | Sum item totals of 4.25 and 5.75 | Total equals 10.00 | Passed |
| UT-02 | Sum an empty item list | Total equals 0.00 | Passed |
| UT-03 | Compare receipt 11.94 with items 12.00 | Difference equals 0.06 | Passed |
| UT-04 | Compare receipt 10.00 with items 10.00 | Difference equals 0.00 | Passed |

## 9. Automated Backend Test Cases

| ID | Test | Expected Result | Status |
|---|---|---|---|
| BT-01 | Mock OCR extracts raw receipt text | Mock receipt text is returned | Passed |
| BT-02 | Mock OCR service returns parsed items and totals | Items, subtotal, tax, service charge, and total are returned | Passed |
| BT-03 | Receipt parser handles tax, service, and total | Parsed values match expected Decimal amounts | Passed |
| BT-04 | Receipt parser handles missing explicit total | Total is derived from subtotal and charges | Passed |
| BT-05 | Receipt parser ignores non-item lines | Only valid item lines are extracted | Passed |
| BT-06 | Receipt parser handles multiline table-style receipts | Items and totals are extracted | Passed |
| BT-07 | Settlement lifecycle integration | Debt is calculated, marked paid, and confirmed received | Passed |
| BT-08 | Charge allocation | Tax and service charges are allocated proportionally into final share totals | Passed |
| BT-09 | Group debt summary | Outstanding, settled, and member balance summaries are calculated correctly | Passed |
| BT-10 | PaddleOCR real image integration | Runs only when enabled with local dependencies | Skipped by default |

## 10. System Test Cases

| ID | Test Procedure | Expected Result | Status |
|---|---|---|---|
| ST-01 | Open frontend | Application loads without crashing | Passed |
| ST-02 | Open Swagger | API documentation loads | Passed |
| ST-03 | Log in as Sixian | Sixian dashboard and groups load | Passed |
| ST-04 | Log in as Jingyi | Jingyi dashboard and groups load | Passed |
| ST-05 | View owner group as Sixian | Member and expense controls are visible | Passed |
| ST-06 | View Sixian-owned group as Jingyi | Owner-only controls are hidden | Passed |
| ST-07 | Create group | Group appears and persists after refresh | Passed |
| ST-08 | Add group member | Member count and list update | Passed |
| ST-09 | Create expense | Expense appears in the group page | Passed |
| ST-10 | Upload receipt image with mock OCR | Reviewable OCR item draft appears | Passed |
| ST-11 | Edit and save OCR items | Items appear in the normal bill section | Passed |
| ST-12 | Assign item shares | Split preview updates with assigned members | Passed |
| ST-13 | Apply tax and service charge | Final totals include item, tax, and service breakdown | Passed |
| ST-14 | Calculate settlement | Correct payment direction and amount appear | Passed |
| ST-15 | View group debt summary | Outstanding and settled counts appear | Passed |
| ST-16 | View member balances | Member balance badges show who owes and who is owed | Passed |
| ST-17 | Mark debt paid | Status becomes awaiting confirmation | Passed |
| ST-18 | Confirm receipt as receiver | Status becomes settled | Passed |
| ST-19 | Refresh Debts page | Settlement status and group selection persist | Passed |
| ST-20 | Compare receipt subtotal with items | Matching subtotal confirmation appears | Passed |
| ST-21 | Compare mismatching totals | Mismatch warning shows the difference | Passed |

## 11. User Testing Protocol

### Participants

- 2-3 NUS students.
- Participants should not have contributed to implementation.
- No real financial or sensitive data should be entered.

### Main Tasks

1. Log in with a supplied prototype account.
2. Open a test group.
3. Create an expense.
4. Upload a receipt image.
5. Review and save OCR-detected items.
6. Assign items to group members.
7. Apply tax and service charge allocation.
8. Interpret the final split preview.
9. Calculate the settlement.
10. Interpret the settlement summary.
11. Interpret the member balance summary.
12. Explain any confusing parts.

### Questions

1. Was the purpose of the application clear?
2. Could you find the group and expense workflow without assistance?
3. Was the OCR upload and review step clear?
4. Did you understand that OCR items could be edited before saving?
5. Did the tax and service charge allocation make sense?
6. Was the settlement direction clear?
7. Did the group member balance summary help explain who owes money?
8. Did any button or label feel misleading?
9. What step required the most thought?
10. What is the most important improvement?

### Observation Data

Record:

- Task completion.
- Completion time.
- Errors.
- Requests for help.
- Participant comments.
- Severity of usability problems.

### Results Template

| Participant | Tasks Completed | Time | Errors | Main Feedback |
|---|---:|---:|---:|---|
| Participant 1 | Pending | Pending | Pending | Pending |
| Participant 2 | Pending | Pending | Pending | Pending |
| Participant 3 | Pending | Pending | Pending | Pending |

## 12. Defect Severity

| Priority | Meaning | Required Response |
|---|---|---|
| P0 | Data loss, security failure, or application unusable | Fix immediately |
| P1 | Core workflow cannot be completed | Fix before submission |
| P2 | Workflow works with confusing or inconvenient behaviour | Fix if time permits |
| P3 | Cosmetic or minor issue | Record for refinement |

## 13. Problems Found During Testing

| Problem | Cause | Resolution |
|---|---|---|
| Frontend changed ports unexpectedly | Multiple Vite servers were running | Fixed Vite to port 5173 with strict-port mode |
| Group operations failed | Backend or frontend server was not running | Documented two-server startup process |
| Usernames appeared as UUIDs | Group membership API returned IDs | Loaded users and mapped IDs to usernames |
| Debts page reset group after refresh | Selection existed only in React state | Persisted selected group in local storage |
| Receipt and item totals differed silently | Values were stored independently | Added matching and mismatch feedback |
| OCR was backend-only in Milestone 2 | No user-facing OCR review flow existed | Added frontend upload, review, edit, and save flow |
| Tax and service were not visible in split preview | Preview showed item shares only | Added proportional charge allocation and final breakdown |
| Group settlement summary was frontend-derived only | Backend did not provide structured group analytics | Added group debt summary endpoint and frontend member balances |
| No CI/CD checks existed | Tests were run manually | Added GitHub Actions workflow for frontend and backend checks |

## 14. Traceability Matrix

| Feature | Unit | Backend | System | User |
|---|---|---|---|---|
| Groups and membership | Not applicable | Covered by settlement and summary setup | ST-05 to ST-08 | Planned |
| Receipt totals | UT-01 to UT-04 | Receipt parser tests | ST-20 to ST-21 | Planned |
| OCR review flow | Not applicable | OCR service tests | ST-10 to ST-11 | Planned |
| Item assignment | Calculation utility | Settlement setup | ST-12 | Planned |
| Tax and service allocation | Not applicable | BT-08 | ST-13 | Planned |
| Debt calculation | Not applicable | BT-07 | ST-14 | Planned |
| Group debt summary | Not applicable | BT-09 | ST-15 to ST-16 | Planned |
| Mark paid | Not applicable | BT-07 | ST-17 | Planned |
| Confirm received | Not applicable | BT-07 | ST-18 | Planned |
| Persistence | Not applicable | Database-backed workflow | ST-07, ST-09, ST-19 | Planned |
| CI | Not applicable | Backend pytest in CI | Pull request checks | Not applicable |

## 15. Evidence Collection

Retain the following evidence:

- Terminal output from `npm test`.
- Terminal output from `npm run lint`.
- Terminal output from `npm run build`.
- Terminal output from `python -m pytest -v`.
- Screenshot of OCR receipt review.
- Screenshot of tax and service charge allocation.
- Screenshot of final split preview with item, tax, service, and total amounts.
- Screenshot of settlement summary.
- Screenshot of member balance summary.
- Screenshot of GitHub Actions passing checks.
- Pull requests showing review and merge history.
- Completed user-testing forms after real user testing is performed.