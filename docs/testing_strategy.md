# O(n) Debtor Testing Strategy

## Document Information

| Field | Value |
|---|---|
| Project | O(n) Debtor |
| Team | 6634 |
| Level of Achievement | Apollo 11 |
| Milestone | Milestone 2 - Prototyping |
| Team Members | Chen Sixian, Sun Jingyi |
| Last Updated | 22 June 2026 |

## 1. Testing Objectives

The testing strategy verifies that O(n) Debtor:

- Performs financial calculations accurately.
- Preserves data across browser refreshes.
- Enforces group-owner and settlement permissions.
- Integrates the React frontend, FastAPI backend, and database correctly.
- Handles matching and mismatching receipt totals clearly.
- Supports the complete settlement lifecycle.
- Remains stable when used through the primary mobile-first workflow.

## 2. Testing Scope

### In Scope

- User selection through prototype authentication.
- Group creation, listing, editing, deletion, and membership.
- Expense creation.
- Manual receipt and item entry.
- Receipt and item-total validation.
- Item assignment and equal splitting.
- Debt calculation.
- Mark-paid and confirm-received settlement states.
- Dashboard and Debts page data.
- Persistence after browser refresh.
- Backend API and database integration.

### Out of Scope for Milestone 2

- Production token authentication.
- Production PaddleOCR accuracy.
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

### 3.2 Integration Testing

Integration testing verifies cooperation between backend models, CRUD functions, settlement calculation, and settlement status transitions.

The backend integration test uses an isolated in-memory SQLite database. It does not read from or write to the development PostgreSQL database.

Covered workflow:

1. Create two users.
2. Create a group.
3. Add owner and member records.
4. Create an expense.
5. Create a receipt.
6. Create an item.
7. Create equal item shares.
8. Calculate the resulting debt.
9. Mark the debt as paid.
10. Confirm that payment was received.

Runner:

```bash
cd backend
export DYLD_LIBRARY_PATH=/opt/homebrew/opt/expat/lib
source .venv/bin/activate
python -m pytest -v
```

Current result:

```text
1 integration test passed
0 tests failed
```

### 3.3 System Testing

System testing verifies the application through the browser while the React frontend, FastAPI backend, and PostgreSQL database are running together.

Backend:

```bash
cd backend
export DYLD_LIBRARY_PATH=/opt/homebrew/opt/expat/lib
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

User testing results must only be added after real participants complete the tasks.

## 4. Test Environment

| Component | Environment |
|---|---|
| Operating System | macOS |
| Browser | Google Chrome |
| Frontend | React 19, Vite 8 |
| Backend | FastAPI |
| Development Database | PostgreSQL 18 |
| Integration-Test Database | In-memory SQLite |
| Frontend Unit Runner | Node test runner |
| Backend Integration Runner | Pytest |
| API Inspection | Swagger/OpenAPI |

## 5. Test Data

Prototype users:

| Username | User ID | Role |
|---|---|---|
| Sixian | `16ab9e31-56f1-4afc-8d2f-09f45dfd57da` | Group owner |
| Jingyi | `facda849-579e-48d6-a589-b160f0533bf5` | Group member |

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

- PostgreSQL is running.
- Database migrations have been applied.
- Required dependencies are installed.
- Backend Swagger loads.
- Frontend loads on port 5173.
- Test users exist.
- Lint and build commands complete successfully.

## 7. Exit Criteria

Milestone 2 testing is complete when:

- All automated unit tests pass.
- All automated integration tests pass.
- Frontend lint passes.
- Frontend production build passes.
- All critical system test cases pass.
- No unresolved P0 or P1 defects remain.
- User testing has been performed or formally scheduled.
- Known limitations are documented.

## 8. Automated Unit Test Cases

| ID | Test | Expected Result | Status |
|---|---|---|---|
| UT-01 | Sum item totals of 4.25 and 5.75 | Total equals 10.00 | Passed |
| UT-02 | Sum an empty item list | Total equals 0.00 | Passed |
| UT-03 | Compare receipt 11.94 with items 12.00 | Difference equals 0.06 | Passed |
| UT-04 | Compare receipt 10.00 with items 10.00 | Difference equals 0.00 | Passed |

## 9. Automated Integration Test Cases

| ID | Test | Expected Result | Status |
|---|---|---|---|
| IT-01 | Create users, group, expense, receipt, item, and equal shares | All records persist in isolated database | Passed |
| IT-02 | Calculate debt for a 10.00 item shared equally | Jingyi owes Sixian 5.00 | Passed |
| IT-03 | Mark calculated debt as paid | Status becomes `marked_paid` | Passed |
| IT-04 | Confirm that payment was received | Status becomes `confirmed_received` | Passed |
| IT-05 | Complete settlement lifecycle | Settlement timestamps are populated | Passed |

## 10. System Test Cases

| ID | Test Procedure | Expected Result | Status |
|---|---|---|---|
| ST-01 | Open frontend | Application loads without crashing | Passed |
| ST-02 | Open Swagger | API documentation loads | Passed |
| ST-03 | Log in as Sixian | Sixian dashboard and groups load | Passed |
| ST-04 | Log in as Jingyi | Jingyi dashboard and groups load | Passed |
| ST-05 | View owner group as Sixian | Edit, delete, and member controls are visible | Passed |
| ST-06 | View Sixian-owned group as Jingyi | Owner-only controls are hidden | Passed |
| ST-07 | Create group | Group appears and persists after refresh | Passed |
| ST-08 | Add group member | Member count and list update | Passed |
| ST-09 | Create expense, receipt, and item | Records appear and persist | Passed |
| ST-10 | Assign 12.00 item equally to two users | Each user receives a 6.00 share | Passed |
| ST-11 | Calculate settlement | Correct payment direction and amount appear | Passed |
| ST-12 | Mark debt paid | Status becomes awaiting confirmation | Passed |
| ST-13 | Confirm receipt as receiver | Status becomes settled | Passed |
| ST-14 | Refresh Debts page | Settlement status and group selection persist | Passed |
| ST-15 | Compare receipt 11.94 with items 12.00 | Mismatch warning shows difference 0.06 | Passed |
| ST-16 | Compare receipt 10.00 with items 10.00 | Matching-total confirmation appears | Passed |
| ST-17 | Open dashboard | Real balances replace placeholder data | Passed |

## 11. User Testing Protocol

### Participants

- 2-3 NUS students.
- Participants should not have contributed to implementation.
- No real financial or sensitive data should be entered.

### Tasks

1. Log in with a supplied prototype account.
2. Create a group.
3. Add another user to the group.
4. Create an expense.
5. Create a receipt with a payer and total.
6. Add receipt items.
7. Assign an item to two users.
8. Interpret the split preview.
9. Calculate the settlement.
10. Mark the settlement as paid.
11. Switch account and confirm receipt.
12. Explain any confusing parts.

### Questions

1. Was the purpose of the application clear?
2. Could you find Groups, Debts, and Profile without assistance?
3. Was creating an expense intuitive?
4. Was choosing a receipt payer clear?
5. Did you understand item assignment?
6. Did you understand the receipt-total warning?
7. Was the settlement direction clear?
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
| React effect lint error | State-changing loader was invoked directly in an effect | Moved updates into asynchronous callbacks |
| Missing multipart dependency | Receipt upload introduced form-data handling | Installed requirements from `requirements.txt` |
| Tests were initially placed in the wrong directory | Backend tests were created under frontend tests | Moved tests to `backend/tests` |

## 14. Traceability Matrix

| Feature | Unit | Integration | System | User |
|---|---|---|---|---|
| Groups and membership | Not applicable | Covered by settlement setup | ST-05 to ST-08 | Planned |
| Receipt totals | UT-01 to UT-04 | Covered by receipt setup | ST-15 to ST-16 | Planned |
| Item assignment | Calculation utility | IT-01 | ST-10 | Planned |
| Debt calculation | Not applicable | IT-02 | ST-11 | Planned |
| Mark paid | Not applicable | IT-03 | ST-12 | Planned |
| Confirm received | Not applicable | IT-04 to IT-05 | ST-13 | Planned |
| Persistence | Not applicable | Database-backed workflow | ST-07, ST-09, ST-14 | Planned |
| Dashboard balances | Not applicable | Debt data integration | ST-17 | Planned |

## 15. Evidence Collection

Retain the following evidence:

- Terminal output from `npm test`.
- Terminal output from `python -m pytest -v`.
- Terminal output from `npm run lint`.
- Terminal output from `npm run build`.
- Screenshots of matching and mismatching receipt totals.
- Screenshots of pending, marked-paid, and settled debt states.
- GitHub issues linked to commits.
- Pull requests showing review and merge history.
- Completed user-testing forms.