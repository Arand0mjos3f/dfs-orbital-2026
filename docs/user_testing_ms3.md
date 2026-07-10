# Milestone 3 User Testing Plan

## Purpose

This user testing plan verifies whether O(n) Debtor is understandable and usable for the main Milestone 3 workflows:

- Creating a group expense.
- Uploading and reviewing OCR receipt items.
- Assigning receipt items to group members.
- Applying tax and service charge allocation.
- Calculating settlement transactions.
- Understanding the group settlement summary and member balances.

## Participants

Target participants:

| Participant | Profile | Status |
|---|---|---|
| P1 | NUS student, not involved in implementation | Scheduled |
| P2 | NUS student, not involved in implementation | Scheduled |
| P3 | NUS student, not involved in implementation | Optional |

Testing should be performed with 2-3 participants before Milestone 3 submission.

## Test Environment

| Item | Value |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://127.0.0.1:8000` |
| Browser | Google Chrome |
| OCR mode | Mock OCR |
| Test group | `MS3 User Testing Dinner` |
| Test users | Sixian and Jingyi demo users |

## Pre-Test Setup

Before each session:

1. Start the backend server.
2. Start the frontend server.
3. Log in with a demo user.
4. Prepare a test group with at least two members.
5. Prepare any image file for OCR upload.
6. Confirm the app loads without console or terminal errors.

## User Tasks

### Task 1: Open Group and Review Members

Instruction to participant:

> Open the test group and explain who is in the group.

Expected success:

- Participant can find the group.
- Participant can identify the group members.

### Task 2: Create an Expense

Instruction to participant:

> Create a new dinner expense with a short description.

Expected success:

- Participant can create an expense.
- The expense appears in the group page.

### Task 3: Upload and Review OCR Receipt

Instruction to participant:

> Upload the receipt image, review the detected items, and save them.

Expected success:

- Participant selects a payer.
- Participant uploads an image.
- Participant understands that OCR results can be edited before saving.
- Saved items appear in the normal bill section.

### Task 4: Assign Items to Members

Instruction to participant:

> Assign one item to yourself and one shared item to both members.

Expected success:

- Participant can assign item shares.
- Split preview updates with the correct people and amounts.

### Task 5: Apply Tax and Service Charge

Instruction to participant:

> Apply tax and service charge allocation and explain the final split preview.

Expected success:

- Participant can find the tax/service allocation action.
- Participant understands why final totals are larger than item-only totals.
- Split preview shows item, tax, service, and final total amounts.

### Task 6: Calculate Settlement

Instruction to participant:

> Calculate the settlement and explain who should pay whom.

Expected success:

- Participant can calculate settlement.
- Settlement summary displays the payer, receiver, amount, and status.

### Task 7: Interpret Group Balance Summary

Instruction to participant:

> Look at the settlement summary and member balances. Explain who owes money and who is owed money.

Expected success:

- Participant understands outstanding amount.
- Participant understands member balance badges.
- Participant can identify who owes and who is owed.

## Observation Template

Use this table during each test session.

| Participant | Task | Completed? | Time Taken | Notes |
|---|---|---:|---:|---|
| P1 | Task 1 |  |  |  |
| P1 | Task 2 |  |  |  |
| P1 | Task 3 |  |  |  |
| P1 | Task 4 |  |  |  |
| P1 | Task 5 |  |  |  |
| P1 | Task 6 |  |  |  |
| P1 | Task 7 |  |  |  |
| P2 | Task 1 |  |  |  |
| P2 | Task 2 |  |  |  |
| P2 | Task 3 |  |  |  |
| P2 | Task 4 |  |  |  |
| P2 | Task 5 |  |  |  |
| P2 | Task 6 |  |  |  |
| P2 | Task 7 |  |  |  |

## Feedback Questions

Ask each participant after the tasks:

1. Which part of the flow was easiest?
2. Which part was confusing?
3. Did the OCR review step feel clear?
4. Did the tax and service charge allocation make sense?
5. Did the settlement summary clearly show who should pay whom?
6. What would you improve before final submission?

## Result Summary

Fill this section only after real user testing is completed.

| Area | Result |
|---|---|
| Participants completed | To be updated |
| Major usability issues | To be updated |
| Minor usability issues | To be updated |
| Changes made after testing | To be updated |
| Remaining limitations | To be updated |

## Issues Found

Fill this table after testing.

| ID | Issue | Severity | Action |
|---|---|---|---|
| UT-MS3-01 | To be updated | To be updated | To be updated |

## Evidence To Capture

For Milestone 3 documentation, capture:

- Screenshot of OCR receipt review.
- Screenshot of tax/service split preview.
- Screenshot of settlement summary.
- Screenshot of member balance summary.
- Screenshot of GitHub Actions passing.
- Terminal output showing frontend and backend tests passing.