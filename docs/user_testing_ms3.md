# Milestone 3 User Testing Plan and Results Template

## Purpose

This document records the planned and completed user testing activities for **O(n) Debtor** during Milestone 3.

The goal of user testing is to determine whether users can understand and complete the application's main shared-expense workflow:

```text
Create group
-> Create expense
-> Upload or create receipt
-> Review receipt items
-> Assign items to members
-> Apply tax and service charge allocation
-> Calculate settlement
-> Interpret group balances
```

This document is intentionally structured as a template before testing is completed. Result fields should only be filled in after real testing sessions have been conducted.

---

## Test Scope

The testing process focuses on the main Milestone 3 extensions:

| Area                        | What We Are Testing                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------- |
| OCR-assisted receipt review | Whether users understand how to upload a receipt and review, edit, add, delete, and save item rows |
| Item assignment             | Whether users can assign receipt items to one or more group members                                |
| Fair split preview          | Whether users understand item subtotals, tax shares, service charge shares, and final totals       |
| Settlement calculation      | Whether users can calculate a settlement and understand who should pay whom                        |
| Group debt summary          | Whether users understand the outstanding amount and individual member balances                     |
| Overall usability           | Whether the complete workflow feels understandable and realistic for a shared group meal           |

---

## Participants

### Planned Participants

| Participant | Profile                    | Relationship to Project        | Status       |
| ----------- | -------------------------- | ------------------------------ | ------------ |
| P1          | NUS student or peer user   | Not involved in implementation | To be tested |
| P2          | NUS student or peer user   | Not involved in implementation | To be tested |
| P3          | Optional additional tester | Not involved in implementation | Optional     |

### Testing Target

```text
Minimum: 1 real external tester
Preferred: 2 real external testers
Optional: 1 additional tester
```

Internal team testing may be recorded separately as system testing, but it should not be presented as external user testing.

---

## Test Environment

| Item       | Value                                            |
| ---------- | ------------------------------------------------ |
| Frontend   | `http://localhost:5173` or deployed frontend URL |
| Backend    | `http://127.0.0.1:8000` or deployed backend URL  |
| Browser    | Google Chrome                                    |
| Device     | Laptop or mobile browser                         |
| OCR Mode   | Mock OCR or deployed OCR configuration           |
| Test Group | `MS3 User Testing Dinner`                        |
| Test Users | Sixian and Jingyi demo users                     |
| Test Date  | To be filled                                     |

---

## Pre-Test Setup

Before each testing session:

1. Start the backend or open the deployed backend.
2. Start the frontend or open the deployed frontend.
3. Confirm that the login flow works.
4. Prepare a group containing at least two members.
5. Prepare a test expense, or allow the participant to create one.
6. Prepare a receipt image or another image accepted by the OCR upload flow.
7. Confirm that the application loads without obvious errors.
8. Prepare a timer or note-taking document.

---

## Task Script

### Task 1: Open the Group and Review Its Members

**Instruction to participant:**

> Open the test group and explain who is in the group.

**Success criteria:**

* The participant can find the group.
* The participant can identify the group members.
* The participant understands the context and purpose of the group.

---

### Task 2: Create an Expense

**Instruction to participant:**

> Create a new dinner expense with a short description.

**Success criteria:**

* The participant can create an expense.
* The expense appears on the group detail page.
* The participant understands that the expense represents a shared bill.

---

### Task 3: Upload and Review an OCR Receipt

**Instruction to participant:**

> Upload the receipt image, review the detected items, edit anything that looks incorrect, and save the items.

**Success criteria:**

* The participant selects a payer.
* The participant uploads an image.
* The participant understands that the OCR results are editable.
* The participant can edit item names or prices.
* The participant can add or delete a row when needed.
* The saved items appear in the standard bill section.

---

### Task 4: Assign Items to Members

**Instruction to participant:**

> Assign one item to one person and one shared item to both members.

**Success criteria:**

* The participant can select members for an item.
* The participant can complete the item assignment.
* The split preview updates with the correct members.
* The participant understands that shared items are divided among the selected members.

---

### Task 5: Apply Tax and Service Charge Allocation

**Instruction to participant:**

> Apply tax and service charge allocation and explain the final split preview.

**Success criteria:**

* The participant can find the tax and service charge allocation action.
* The participant understands why final totals may be higher than item-only totals.
* The participant can identify the item amount, tax share, service charge share, and final total.

---

### Task 6: Calculate the Settlement

**Instruction to participant:**

> Calculate the settlement and explain who should pay whom.

**Success criteria:**

* The participant can trigger the settlement calculation.
* The settlement summary updates successfully.
* The participant can identify the payer, receiver, amount, and status.

---

### Task 7: Interpret the Group Balance Summary

**Instruction to participant:**

> Look at the settlement summary and member balances. Explain who owes money and who is owed money.

**Success criteria:**

* The participant understands the outstanding amount.
* The participant understands the member balance badges.
* The participant can identify who owes money and who is owed money.

---

## Observation Sheet

Use the following table during each testing session.

| Participant | Task   | Completed?   | Time Taken   | Notes        |
| ----------- | ------ | ------------ | ------------ | ------------ |
| P1          | Task 1 | To be filled | To be filled | To be filled |
| P1          | Task 2 | To be filled | To be filled | To be filled |
| P1          | Task 3 | To be filled | To be filled | To be filled |
| P1          | Task 4 | To be filled | To be filled | To be filled |
| P1          | Task 5 | To be filled | To be filled | To be filled |
| P1          | Task 6 | To be filled | To be filled | To be filled |
| P1          | Task 7 | To be filled | To be filled | To be filled |
| P2          | Task 1 | To be filled | To be filled | To be filled |
| P2          | Task 2 | To be filled | To be filled | To be filled |
| P2          | Task 3 | To be filled | To be filled | To be filled |
| P2          | Task 4 | To be filled | To be filled | To be filled |
| P2          | Task 5 | To be filled | To be filled | To be filled |
| P2          | Task 6 | To be filled | To be filled | To be filled |
| P2          | Task 7 | To be filled | To be filled | To be filled |

---

## Post-Test Questions

Ask each participant the following questions after the testing session:

1. Which part of the workflow was the easiest?
2. Which part of the workflow was confusing?
3. Did the OCR review step feel clear?
4. Did editing, adding, and deleting receipt rows feel understandable?
5. Did the item assignment step make sense?
6. Did the tax and service charge allocation make sense?
7. Did the settlement summary clearly show who should pay whom?
8. Did the member balance summary help you understand the group's settlement status?
9. What would you improve before the final submission?

---

## Results Summary

Complete this section only after real user testing has been conducted.

| Area                          | Result       |
| ----------------------------- | ------------ |
| Number of participants tested | To be filled |
| Overall task completion       | To be filled |
| Major usability issues        | To be filled |
| Minor usability issues        | To be filled |
| Positive feedback             | To be filled |
| Changes made after testing    | To be filled |
| Remaining limitations         | To be filled |

---

## Issues Found

Complete this table after testing.

| ID        | Issue        | Severity     | Evidence     | Action       |
| --------- | ------------ | ------------ | ------------ | ------------ |
| UT-MS3-01 | To be filled | To be filled | To be filled | To be filled |
| UT-MS3-02 | To be filled | To be filled | To be filled | To be filled |
| UT-MS3-03 | To be filled | To be filled | To be filled | To be filled |

### Severity Guide

| Severity | Meaning                                       |
| -------- | --------------------------------------------- |
| High     | Prevents the user from completing a key task  |
| Medium   | Causes confusion, but the user can continue   |
| Low      | Minor wording, layout, or visual polish issue |

---

## Evidence to Capture

Capture the following evidence for the Milestone 3 documentation:

* Screenshot of the group detail page.
* Screenshot of the OCR receipt upload flow.
* Screenshot of the OCR review table.
* Screenshot of the item assignment interface.
* Screenshot of the tax and service charge split preview.
* Screenshot of the settlement summary.
* Screenshot of the member balance summary.
* Screenshot of passing GitHub Actions checks.
* Terminal output showing that the frontend checks passed.
* Terminal output showing that the backend tests passed.

---

## Notes for the Final Report

When finalizing the README or Milestone 3 report:

* Do not claim that user testing has been completed until at least one real external tester has been observed.
* Keep internal developer testing separate from external user testing.
* Report both successfully completed tasks and moments of confusion.
* Include at least one concrete improvement, or planned improvement, based on the testing results.
* Use screenshots that do not expose secrets, passwords, or private database URLs.
