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
| Navigation                  | Whether users understand the bottom navigation states and the purpose of the `Add` action          |
| Deployment reliability      | Whether deployed pages, API requests, and refreshed frontend routes work correctly                 |
| Overall usability           | Whether the complete workflow feels understandable and realistic for a shared group meal           |

---

## Participants

### Planned and Completed Participants

| Participant | Name            | Profile                    | Relationship to Project | Status                    |
| ----------- | --------------- | -------------------------- | ----------------------- | ------------------------- |
| P1          | Not recorded    | NUS student or peer user   | Testing participant     | Completed on 23 July 2026 |
| P2          | Chen Sihan      | NUS student or peer user   | Testing participant     | Completed on 23 July 2026 |
| P3          | To be confirmed | Optional additional tester | Testing participant     | Optional                  |

### Testing Target

```text
Minimum: 1 real external tester
Preferred: 2 real external testers
Optional: 1 additional tester
```

Two participant testing sessions have been completed.

Internal team testing may be recorded separately as system testing, but it should not be presented as external user testing. Participants should only be described as external testers if their lack of involvement in the project implementation has been confirmed.

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

### Participant 2 Environment

| Item        | Value                                     |
| ----------- | ----------------------------------------- |
| Participant | Chen Sihan                                |
| Frontend    | https://dfs-orbital-frontend.onrender.com |
| Backend     | https://dfs-orbital-2026.onrender.com     |
| Browser     | Google Chrome                             |
| Device      | MacBook Pro 14-inch                       |
| OCR Mode    | Deployed OCR configuration                |
| Test User   | Sixian demo account                       |
| Test Date   | 23 July 2026                              |

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

## Core Workflow Task Script

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

## Observation Sheets

### Participant 1 Core Workflow Observations

| Task   | Completed?              | Time Taken   | Notes                                                                                                                                   |
| ------ | ----------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Task 1 | Yes                     | Not recorded | Opened the group page and used an existing demo group or created a group.                                                               |
| Task 2 | Yes                     | Not recorded | Created a dinner expense successfully. The participant was occasionally unsure about the correct first action on the group detail page. |
| Task 3 | Yes                     | Not recorded | Uploaded a receipt image and successfully reviewed and edited OCR-detected items.                                                       |
| Task 4 | Yes                     | Not recorded | Assigned one item to Sixian and one shared item to both Sixian and Jingyi.                                                              |
| Task 5 | Not separately recorded | Not recorded | The completed session notes did not separately record the tax and service charge allocation step.                                       |
| Task 6 | Yes                     | Not recorded | Calculated the settlement successfully.                                                                                                 |
| Task 7 | Yes                     | Not recorded | Correctly identified who should pay whom, although the settlement result was not immediately noticeable after calculation.              |

### Participant 2 Navigation and Deployment Retest Observations

| Task                               | Completed? | Time Taken   | Notes                                                                                                           |
| ---------------------------------- | ---------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Open deployed application          | Yes        | Not recorded | The deployed frontend loaded successfully.                                                                      |
| Log in with Sixian demo account    | Yes        | Not recorded | The participant successfully entered the application.                                                           |
| Use the bottom `Add` button        | Yes        | Not recorded | The button opened the create-group form, but the participant still expected a broader creation menu.            |
| Create or open a group             | Yes        | Not recorded | The participant successfully accessed the group workflow.                                                       |
| Check Groups page navigation state | Yes        | Not recorded | The `Add` button active-state issue was identified and fixed.                                                   |
| Open the Debts page                | Yes        | Not recorded | The participant opened the Debts page during the navigation retest.                                             |
| Refresh deployed routes            | Yes        | Not recorded | Dashboard, Groups, and Debts routes refreshed successfully after the Render rewrite rule was added.             |
| Retest group loading               | Yes        | Not recorded | Group fetching initially experienced deployment delays but worked after the frontend API timeout was increased. |

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

Based on this testing session, we prioritised the following improvements:

1. Make the bottom navigation `Add` button useful.
2. Improve the Debts page loading, error, and empty-state behaviour.
3. Clarify the expense workflow on the group detail page.
4. Make the settlement result easier to notice after calculation.

---

### Participant 2 – Navigation and Deployment Retest

**Date:** 23 July 2026
**Participant:** Chen Sihan
**Device and browser:** Google Chrome on MacBook Pro 14-inch
**Environment:** Deployed Render frontend and backend

#### Tasks Tested

1. Opened the deployed application.
2. Logged in using the demo Sixian account.
3. Used the bottom `Add` button.
4. Created or opened a group.
5. Checked the Groups page navigation state.
6. Opened the Debts page.
7. Refreshed deployed frontend routes such as Groups, Debts, and Dashboard.

#### Findings

The participant expected the `Add` button to open a clearer creation flow, possibly a separate page where users could choose between creating a group and adding an expense to an existing group. The current `Add` button was somewhat improved after the first round of feedback because it opened the create-group form, but it still felt similar to the Groups page.

The participant also observed that the `Add` button being constantly highlighted in blue was confusing because it clashed with other bottom navigation states. This was fixed by updating the navigation active-state logic so that `Add` is highlighted only when the create-group route is active.

During testing, the Groups page occasionally failed to fetch groups. Follow-up API checks indicated that the deployed backend, database, CORS configuration, and group data were healthy at the time of investigation. The likely cause was the Render free-tier backend cold start combined with the frontend API timeout. We increased the frontend API timeout from 10 seconds to 75 seconds so that the deployed frontend can wait longer for the backend to wake up.

The participant also noted that uploading a receipt and assigning items still required some manual work. In particular, the tax and service charge allocation panel was visible before all items were assigned, which made the workflow feel slightly unclear.

#### Fixes Made After Testing

1. Increased the frontend API timeout from 10 seconds to 75 seconds.
2. Updated the bottom navigation active state so that `Add` is no longer always highlighted in blue.
3. Improved the Debts page loading, error, and empty-state behaviour.
4. Confirmed that the deployed frontend was rebuilt using the latest `milestone-3` commit.
5. Confirmed that frontend route refreshing works after adding the Render rewrite rule.
6. Retested the deployed application successfully after the fixes.

#### Retest Result

After redeploying the frontend on commit `eb07970`, the `Add` button behaviour was correct, route refreshing worked, and the deployed application loaded correctly.

The remaining improvements are to redesign the `Add` action into a fuller creation menu and make the receipt assignment workflow clearer.

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

| Area                          | Result                                                                                                                                                                                                                                                                                                                                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number of participants tested | 2 participants                                                                                                                                                                                                                                                                                                                                       |
| Overall task completion       | Participant 1 completed the core group, expense, OCR review, item assignment, settlement calculation, and settlement interpretation workflow. Participant 2 completed the navigation and deployed-route retest successfully after the fixes.                                                                                                         |
| Major usability issues        | During initial testing, the Debts page displayed an incorrect empty state stating that the user was not a member of any group. The deployed Groups page also experienced API request delays during backend cold starts before the frontend timeout was increased.                                                                                    |
| Minor usability issues        | The group detail workflow order was unclear, the `Add` action still resembled the Groups page, the settlement result was not immediately noticeable, and the tax and service charge panel appeared before all items were assigned.                                                                                                                   |
| Positive feedback             | Group creation was straightforward. OCR review and item editing were understandable. Item assignment and settlement calculation were completed successfully. Route refreshing and deployed application loading worked correctly after the deployment fixes.                                                                                          |
| Changes made after testing    | The frontend API timeout was increased from 10 seconds to 75 seconds. The bottom navigation active-state logic was corrected. The Debts page loading, error, and empty-state behaviour was improved. The frontend was rebuilt from the latest `milestone-3` commit. A Render rewrite rule was added, and route refreshing was successfully retested. |
| Remaining limitations         | The `Add` action does not yet provide a full creation menu. The receipt assignment sequence, tax and service charge panel timing, group detail workflow guidance, and settlement visibility still require improvement. The Debts page handling has been improved, but further investigation may be needed if the issue reappears.                    |

---

## Issues Found

| ID        | Issue                                                                                           | Severity | Evidence                                                                                                                                                                                               | Action                                                                                                                                              | Status             |
| --------- | ----------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| UT-MS3-01 | The group detail page did not make the first step of the expense workflow sufficiently clear.   | Medium   | Participant 1 was not always sure what to do first when creating an expense.                                                                                                                           | Clarify the starting action and improve workflow guidance on the group detail page.                                                                 | Planned            |
| UT-MS3-02 | The expense workflow did not clearly communicate the expected sequence of actions.              | Medium   | Participant 1 was not clearly guided through expense creation, receipt upload, item review, item assignment, and settlement calculation.                                                               | Add clearer visual sequencing, labels, or step-based guidance.                                                                                      | Planned            |
| UT-MS3-03 | The bottom navigation `Add` button behaved too similarly to the Groups page.                    | Medium   | Participant 1 found the action confusing, while Participant 2 expected a broader creation menu.                                                                                                        | The button now opens the create-group route. A fuller creation menu remains planned.                                                                | Partially resolved |
| UT-MS3-04 | The Debts page incorrectly stated that the user was not a member of any group.                  | High     | Participant 1 had already joined groups, but the Debts page displayed an incorrect membership empty state.                                                                                             | Improved Debts page loading, error, and empty-state behaviour. Further backend/user-state investigation may still be needed if the issue reappears. | Partially resolved |
| UT-MS3-05 | The settlement result was difficult to notice after calculation.                                | Medium   | Participant 1 had to scroll upward to locate the settlement summary and was not immediately sure where to look.                                                                                        | Scroll to, highlight, or reposition the updated settlement result after calculation.                                                                | Planned            |
| UT-MS3-06 | The `Add` button remained highlighted even when another bottom navigation page was active.      | Medium   | Participant 2 found the constant blue active state confusing.                                                                                                                                          | Updated the active-state logic so that `Add` is highlighted only on the create-group route.                                                         | Resolved           |
| UT-MS3-07 | Group fetching could fail while the Render backend was waking from a cold start.                | Medium   | Follow-up API checks indicated that the deployed services and data were healthy at the time of investigation, but the frontend request could time out before the free-tier backend finished waking up. | Increased the frontend API timeout from 10 seconds to 75 seconds.                                                                                   | Resolved           |
| UT-MS3-08 | Refreshing deployed frontend routes required correct rewrite handling.                          | Medium   | Direct refreshes of Dashboard, Groups, or Debts required the Render rewrite rule.                                                                                                                      | Added the Render rewrite rule and successfully retested direct route refreshing.                                                                    | Resolved           |
| UT-MS3-09 | The tax and service charge allocation panel appeared before all item assignments were complete. | Medium   | Participant 2 found the sequence slightly unclear because charge allocation was visible too early.                                                                                                     | Delay, disable, or visually separate the panel until item assignment is complete.                                                                   | Planned            |

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
* Screenshot of the improved Debts page states.
* Screenshot of the corrected bottom navigation active state.
* Screenshot of refreshed deployed routes working.
* Screenshot of passing GitHub Actions checks.
* Terminal output showing that the frontend checks passed.
* Terminal output showing that the backend tests passed.

---

## Notes for the Final Report

When finalizing the README or Milestone 3 report:

* State clearly that two participants completed testing sessions on 23 July 2026.
* Only describe participants as external testers if their lack of involvement in the project implementation has been confirmed.
* Keep internal developer testing separate from confirmed external user testing.
* Report both successfully completed tasks and moments of confusion.
* Distinguish between fixes that have been completed and improvements that remain planned.
* Mention that the deployment retest was completed successfully after commit `eb07970`.
* Include the frontend timeout, navigation active-state, Debts page state-handling, and Render rewrite fixes.
* Do not claim that an improvement has been implemented unless the corresponding change has actually been completed.
* Use screenshots that do not expose secrets, passwords, or private database URLs.
