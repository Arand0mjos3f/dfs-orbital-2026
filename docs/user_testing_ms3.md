# Milestone 3 User Testing Plan and Results

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

This document contains both the original testing plan and the results of completed testing sessions. Fields relating to future participants should only be filled in after those sessions have been conducted.

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

### Planned and Completed Participants

| Participant | Profile                    | Relationship to Project        | Status                    |
| ----------- | -------------------------- | ------------------------------ | ------------------------- |
| P1          | NUS student or peer user   | Not involved in implementation | Completed on 23 July 2026 |
| P2          | NUS student or peer user   | Not involved in implementation | To be tested              |
| P3          | Optional additional tester | Not involved in implementation | Optional                  |

### Testing Target

```text
Minimum: 1 real external tester
Preferred: 2 real external testers
Optional: 1 additional tester
```

The minimum testing target has been met through the completed Participant 1 session.

Internal team testing may be recorded separately as system testing, but it should not be presented as external user testing.

---

## Test Environment

### Participant 1 Environment

| Item       | Value                                     |
| ---------- | ----------------------------------------- |
| Frontend   | https://dfs-orbital-frontend.onrender.com |
| Backend    | https://dfs-orbital-2026.onrender.com     |
| Browser    | Not recorded                              |
| Device     | Not recorded                              |
| OCR Mode   | Deployed OCR configuration                |
| Test Group | Dinner expense group or demo group        |
| Test Users | Sixian and Jingyi demo users              |
| Test Date  | 23 July 2026                              |

For future local testing sessions, the following development URLs may also be used:

```text
Frontend: http://localhost:5173
Backend: http://127.0.0.1:8000
```

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

| Participant | Task   | Completed?              | Time Taken   | Notes                                                                                                                                   |
| ----------- | ------ | ----------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| P1          | Task 1 | Yes                     | Not recorded | Opened the group page and used an existing demo group or created a group.                                                               |
| P1          | Task 2 | Yes                     | Not recorded | Created a dinner expense successfully. The participant was occasionally unsure about the correct first action on the group detail page. |
| P1          | Task 3 | Yes                     | Not recorded | Uploaded a receipt image and successfully reviewed and edited OCR-detected items.                                                       |
| P1          | Task 4 | Yes                     | Not recorded | Assigned one item to Sixian and one shared item to both Sixian and Jingyi.                                                              |
| P1          | Task 5 | Not separately recorded | Not recorded | The completed session notes did not separately record the tax and service charge allocation step.                                       |
| P1          | Task 6 | Yes                     | Not recorded | Calculated the settlement successfully.                                                                                                 |
| P1          | Task 7 | Yes                     | Not recorded | Correctly identified who should pay whom, although the settlement result was not immediately noticeable after calculation.              |
| P2          | Task 1 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 2 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 3 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 4 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 5 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 6 | To be filled            | To be filled | To be filled                                                                                                                            |
| P2          | Task 7 | To be filled            | To be filled | To be filled                                                                                                                            |

---

## Completed User Testing Sessions

### Participant 1 – OCR Dinner Split Flow

**Date:** 23 July 2026
**Environment:** Deployed Render frontend and backend
**Scenario:** The participant tested the full OCR-assisted dinner expense flow.

#### Tasks Completed

The participant successfully completed the core workflow:

1. Opened the group page.
2. Created a group or opened the demo group.
3. Added Jingyi as a member where needed.
4. Created a dinner expense.
5. Uploaded the receipt image.
6. Reviewed and edited OCR-detected receipt items.
7. Assigned one item to Sixian and one shared item to both Sixian and Jingyi.
8. Calculated the settlement.
9. Identified who should pay whom.

#### What Worked Well

The participant found group creation straightforward. The OCR review and item-editing workflow was understandable, and the participant was able to assign items and calculate the final settlement successfully.

#### Issues Observed

1. The group detail page was confusing because the participant was not always sure what to do first when creating an expense.
2. The expense creation flow did not clearly guide the participant through the expected order of actions: create the expense, upload the receipt, review the items, assign the shares, and calculate the settlement.
3. The bottom navigation `Add` button was confusing because it behaved like another Groups button instead of opening a genuine creation action.
4. The Debts page displayed a message stating that the participant was not a member of any group, even though the participant had already joined groups.
5. After calculating the settlement, the participant had to scroll back up to find the settlement summary and was not immediately sure where to look.

#### Improvements Planned

Based on this testing session, we will prioritise the following improvements:

1. Make the bottom navigation `Add` button useful.
2. Improve the Debts page empty-state behaviour.
3. Clarify the expense workflow on the group detail page.
4. Make the settlement result easier to notice after calculation.

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

| Area                          | Result                                                                                                                                                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number of participants tested | 1 external participant                                                                                                                                                                                                  |
| Overall task completion       | The participant completed the core group, expense, OCR review, item assignment, settlement calculation, and settlement interpretation workflow. The tax and service charge allocation step was not separately recorded. |
| Major usability issues        | The Debts page displayed an incorrect empty state stating that the user was not a member of any group.                                                                                                                  |
| Minor usability issues        | The group detail workflow order was unclear, the bottom navigation `Add` button was confusing, and the settlement result was not immediately noticeable after calculation.                                              |
| Positive feedback             | Group creation was straightforward. OCR review and item editing were understandable. Item assignment and settlement calculation were completed successfully.                                                            |
| Changes made after testing    | No changes have been recorded as completed yet. Four interface and workflow improvements have been prioritised.                                                                                                         |
| Remaining limitations         | The observed navigation, empty-state, workflow guidance, and settlement visibility issues remain pending improvement.                                                                                                   |

---

## Issues Found

| ID        | Issue                                                                                         | Severity | Evidence                                                                                                                                   | Action                                                                               |
| --------- | --------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| UT-MS3-01 | The group detail page did not make the first step of the expense workflow sufficiently clear. | Medium   | The participant was not always sure what to do first when creating an expense.                                                             | Clarify the starting action and improve workflow guidance on the group detail page.  |
| UT-MS3-02 | The expense workflow did not clearly communicate the expected sequence of actions.            | Medium   | The participant was not clearly guided through expense creation, receipt upload, item review, item assignment, and settlement calculation. | Add clearer visual sequencing, labels, or step-based guidance.                       |
| UT-MS3-03 | The bottom navigation `Add` button behaved like another Groups button.                        | Medium   | The participant expected the button to open a creation action but was taken to group-related navigation instead.                           | Make the button open a meaningful creation action or revise its label and icon.      |
| UT-MS3-04 | The Debts page incorrectly stated that the user was not a member of any group.                | High     | The participant had already joined groups, but the Debts page displayed an incorrect membership empty state.                               | Fix the membership or debt-loading logic and improve the empty-state behaviour.      |
| UT-MS3-05 | The settlement result was difficult to notice after calculation.                              | Medium   | The participant had to scroll upward to locate the settlement summary and was not immediately sure where to look.                          | Scroll to, highlight, or reposition the updated settlement result after calculation. |

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

* State clearly that one real external participant completed a user testing session on 23 July 2026.
* Keep internal developer testing separate from external user testing.
* Report both successfully completed tasks and moments of confusion.
* Include the planned improvements arising from the completed session.
* Do not claim that an improvement has been implemented unless the corresponding change has actually been completed.
* Use screenshots that do not expose secrets, passwords, or private database URLs.
