# Milestone 3 User Testing Plan and Results

## 1. Purpose

This document records the planned and completed user testing activities conducted for **O(n) Debtor** during Milestone 3.

The primary objective of user testing is to evaluate whether users can understand and successfully complete the application's main shared-expense workflow:

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

The testing process also aims to identify usability issues, deployment-related problems, and areas requiring further improvement before the final submission.

---

## 2. Test Scope

User testing focuses on the following Milestone 3 features and extensions:

| Area                        | Testing Objective                                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| OCR-assisted receipt review | Determine whether users understand how to upload a receipt and review, edit, add, delete, and save detected item rows |
| Item assignment             | Determine whether users can assign receipt items to one or more group members                                         |
| Fair split preview          | Determine whether users understand item subtotals, tax shares, service charge shares, and final totals                |
| Settlement calculation      | Determine whether users can calculate a settlement and understand who should pay whom                                 |
| Group debt summary          | Determine whether users understand the outstanding amount and individual member balances                              |
| Navigation                  | Determine whether users understand the bottom navigation states and the purpose of the `Add` action                   |
| Deployment reliability      | Verify that deployed pages, API requests, and refreshed frontend routes function correctly                            |
| Overall usability           | Evaluate whether the complete workflow is understandable and realistic for managing a shared group meal               |

---

## 3. Participants

| Participant    | Name         | Profile                  | Relationship to Project | Status                    |
| -------------- | ------------ | ------------------------ | ----------------------- | ------------------------- |
| P1             | Not recorded | NUS student or peer user | Testing participant     | Completed on 23 July 2026 |
| P2             | Chen Sihan   | NUS student or peer user | Testing participant     | Completed on 23 July 2026 |
| Internal check | Chen Sixian  | Project developer        | Internal pre-test       | Completed on 25 July 2026 |

Two participant testing sessions were completed.

Internal team testing is recorded separately as system testing or pre-test validation and must not be presented as external user testing. A participant should only be described as an external tester after confirming that the participant was not involved in the project's implementation.

---

## 4. Test Environment

| Item              | Value                                      |
| ----------------- | ------------------------------------------ |
| Frontend          | https://dfs-orbital-frontend.onrender.com  |
| Backend           | https://dfs-orbital-2026.onrender.com      |
| API documentation | https://dfs-orbital-2026.onrender.com/docs |
| Test users        | Sixian and Jingyi demo users               |
| Main test dates   | 23 July 2026 and 25 July 2026              |

For future local testing sessions, the following development URLs may also be used:

```text
Frontend: http://localhost:5173
Backend: http://127.0.0.1:8000
```

---

## 5. Pre-Test Setup

Complete the following steps before each testing session:

1. Open the deployed backend once to reduce the impact of the Render cold-start delay.
2. Open the deployed frontend.
3. Confirm that the login flow functions correctly.
4. Prepare a group containing at least two members.
5. Prepare a test expense, or allow the participant to create one.
6. Prepare a receipt image for the participant.
7. Confirm that the application loads without obvious errors.
8. Ask the participant to think aloud while completing the workflow.
9. Record task completion, points of confusion, bugs, and suggestions.

---

## 6. Core Workflow Task Script

### Task 1: Open the Group and Review Its Members

**Instruction to participant:**

> Open the test group and explain who is in the group.

**Success criteria:**

* The participant can locate and open the group.
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
* The participant uploads a receipt image.
* The participant understands that OCR results are editable.
* The participant can edit item names or prices.
* The participant can add or delete an item row when necessary.
* The saved items appear in the standard bill section.

---

### Task 4: Assign Items to Members

**Instruction to participant:**

> Assign one item to one person and one shared item to both members.

**Success criteria:**

* The participant can select one or more members for an item.
* The participant can complete the item assignment.
* The split preview updates with the correct members.
* The participant understands that shared items are divided among the selected members.

---

### Task 5: Apply Tax and Service Charge Allocation

**Instruction to participant:**

> Apply tax and service charge allocation and explain the final split preview.

**Success criteria:**

* The participant can locate the tax and service charge allocation action.
* The participant understands why the final totals may be higher than the item-only totals.
* The participant can identify the item amount, tax share, service charge share, and final total.

---

### Task 6: Calculate the Settlement

**Instruction to participant:**

> Calculate the settlement and explain who should pay whom.

**Success criteria:**

* The participant can initiate the settlement calculation.
* The settlement summary updates successfully.
* The participant can identify the payer, receiver, amount, and settlement status.

---

### Task 7: Interpret the Group Balance Summary

**Instruction to participant:**

> Look at the settlement summary and member balances. Explain who owes money and who is owed money.

**Success criteria:**

* The participant understands the outstanding amount.
* The participant understands the member balance badges.
* The participant can identify who owes money and who is owed money.

---

## 7. Observation Sheets

### 7.1 Participant 1: Core Workflow Observations

| Task   | Completed?              | Time Taken   | Observations                                                                                                                                                             |
| ------ | ----------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Task 1 | Yes                     | Not recorded | The participant opened the group page and used an existing demo group or created a new group.                                                                            |
| Task 2 | Yes                     | Not recorded | The participant created a dinner expense successfully. However, the participant was occasionally unsure which action should be completed first on the group detail page. |
| Task 3 | Yes                     | Not recorded | The participant uploaded a receipt image and successfully reviewed and edited the OCR-detected items.                                                                    |
| Task 4 | Yes                     | Not recorded | The participant assigned one item to Sixian and one shared item to both Sixian and Jingyi.                                                                               |
| Task 5 | Not separately recorded | Not recorded | The completed session notes did not record the tax and service charge allocation step separately.                                                                        |
| Task 6 | Yes                     | Not recorded | The participant calculated the settlement successfully.                                                                                                                  |
| Task 7 | Yes                     | Not recorded | The participant correctly identified who should pay whom. However, the settlement result was not immediately noticeable after the calculation.                           |

### 7.2 Participant 2: Navigation and Deployment Retest Observations

| Task                               | Completed? | Time Taken   | Observations                                                                                                    |
| ---------------------------------- | ---------- | ------------ | --------------------------------------------------------------------------------------------------------------- |
| Open deployed application          | Yes        | Not recorded | The deployed frontend loaded successfully.                                                                      |
| Log in with Sixian demo account    | Yes        | Not recorded | The participant successfully logged in and entered the application.                                             |
| Use the bottom `Add` button        | Yes        | Not recorded | The button opened the create-group form, but the participant expected a broader creation menu.                  |
| Create or open a group             | Yes        | Not recorded | The participant successfully accessed the group workflow.                                                       |
| Check Groups page navigation state | Yes        | Not recorded | The `Add` button active-state issue was identified and fixed.                                                   |
| Open the Debts page                | Yes        | Not recorded | The participant successfully opened the Debts page during the navigation retest.                                |
| Refresh deployed routes            | Yes        | Not recorded | The Dashboard, Groups, and Debts routes refreshed successfully after the Render rewrite rule was added.         |
| Retest group loading               | Yes        | Not recorded | Group fetching initially experienced deployment delays but worked after the frontend API timeout was increased. |

---

## 8. Completed User Testing Sessions

### 8.1 Participant 1: OCR Dinner Split Workflow

**Date:** 23 July 2026
**Environment:** Deployed Render frontend and backend
**Scenario:** The participant tested the complete OCR-assisted dinner expense workflow.

#### Tasks Completed

The participant successfully completed the following workflow:

1. Opened the group page.
2. Created a group or opened the demo group.
3. Added Jingyi as a member where required.
4. Created a dinner expense.
5. Uploaded the receipt image.
6. Reviewed and edited the OCR-detected receipt items.
7. Assigned one item to Sixian and one shared item to both Sixian and Jingyi.
8. Calculated the settlement.
9. Identified who should pay whom.

#### Positive Findings

The participant found the group creation process straightforward. The OCR review and item-editing workflow was understandable, and the participant successfully assigned items and calculated the final settlement.

#### Issues Observed

1. The group detail page was confusing because the participant was not always certain which action should be completed first when creating an expense.
2. The expense creation workflow did not clearly guide the participant through the expected sequence:

   * Create the expense.
   * Upload the receipt.
   * Review the detected items.
   * Assign the item shares.
   * Calculate the settlement.
3. The bottom navigation `Add` button was confusing because it behaved similarly to another Groups button rather than opening a distinct creation action.
4. The Debts page displayed a message stating that the participant was not a member of any group, even though the participant had already joined groups.
5. After calculating the settlement, the participant had to scroll upwards to locate the settlement summary and was not immediately certain where the result appeared.

#### Improvements Prioritised

Based on this testing session, the following improvements were prioritised:

1. Make the bottom navigation `Add` button more useful.
2. Improve the Debts page loading, error, and empty-state behaviour.
3. Clarify the expense workflow on the group detail page.
4. Make the settlement result more noticeable after calculation.

---

### 8.2 Participant 2: Navigation and Deployment Retest

**Date:** 23 July 2026
**Participant:** Chen Sihan
**Device and browser:** Google Chrome on MacBook Pro 14-inch
**Environment:** Deployed Render frontend and backend

#### Tasks Tested

1. Opened the deployed application.
2. Logged in using the Sixian demo account.
3. Used the bottom `Add` button.
4. Created or opened a group.
5. Checked the Groups page navigation state.
6. Opened the Debts page.
7. Refreshed deployed frontend routes, including Dashboard, Groups, and Debts.

#### Findings

The participant expected the `Add` button to open a clearer creation workflow, potentially through a separate page that would allow users to choose between creating a group and adding an expense to an existing group.

The `Add` button had been improved after the first round of feedback because it opened the create-group form. However, the resulting experience still felt too similar to the Groups page.

The participant also observed that the `Add` button was constantly highlighted in blue. This was confusing because the highlighted state conflicted with the active states of other bottom navigation items. The issue was resolved by updating the navigation active-state logic so that `Add` is highlighted only when the create-group route is active.

During testing, the Groups page occasionally failed to fetch group data. Follow-up API checks indicated that the deployed backend, database, CORS configuration, and group data were healthy at the time of investigation. The likely cause was the Render free-tier backend cold start combined with the frontend API timeout.

The frontend API timeout was therefore increased from 10 seconds to 75 seconds, allowing the deployed frontend additional time to wait for the backend service to wake up.

The participant also noted that uploading a receipt and assigning items still required some manual work. In particular, the tax and service charge allocation panel was visible before all items had been assigned, making the expected workflow sequence slightly unclear.

#### Fixes Implemented After Testing

1. Increased the frontend API timeout from 10 seconds to 75 seconds.
2. Updated the bottom navigation active-state logic so that `Add` is no longer always highlighted in blue.
3. Improved the Debts page loading, error, and empty-state behaviour.
4. Confirmed that the deployed frontend was rebuilt using the latest `milestone-3` commit.
5. Confirmed that frontend route refreshing works after adding the Render rewrite rule.
6. Successfully retested the deployed application after implementing the fixes.

#### Retest Result

After the frontend was redeployed:

* The `Add` button active-state behaviour was correct.
* Direct route refreshing worked correctly.
* The deployed application loaded successfully.

The remaining improvements are to redesign the `Add` action as a more complete creation menu and to clarify the receipt assignment workflow.

---

## 9. Internal Pre-Test: OCR Receipt Parsing Regression

**Date:** 25 July 2026
**Tester:** Chen Sixian
**Environment:** Deployed Render frontend and backend
**Test type:** Internal pre-test conducted before additional external user testing
**Receipt used:** LionCity Bistro receipt image

### 9.1 Test Receipt Content

```text
LIONCITY BISTRO
Laksa $6.80
Satay (6 pcs) $8.50
Milo Dinosaur $3.20
Subtotal $18.50
Service Charge $1.85
GST $1.83
Total $22.18
```

### 9.2 Expected Result

The OCR review flow should display the following receipt-specific parsed items:

1. Laksa - $6.80
2. Satay (6 pcs) - $8.50
3. Milo Dinosaur - $3.20

The receipt summary should display:

```text
Subtotal: $18.50
Service Charge: $1.85
GST: $1.83
Total: $22.18
```

### 9.3 Actual Result

The deployed OCR upload flow returned items from the previous demo receipt:

1. Chicken Rice
2. Iced Lemon Tea

This result indicated that the deployed backend was still using the mock OCR engine instead of performing real OCR on uploaded receipt images.

### 9.4 Impact

This issue would significantly affect external user testing because the uploaded receipt image would not correspond to the parsed review result.

It would also reduce users' confidence in the OCR-assisted receipt workflow because users could not trust that the application was processing the receipt they uploaded.

### 9.5 Fix Prepared

A parser fix was implemented to support OCR text layouts in which item names and prices are grouped separately, such as:

```text
Laksa
Satay (6 pcs)
Milo Dinosaur
$6.80
$8.50
$3.20
```

The parser was also improved to support:

* Currency-prefixed values such as `$6.80`.
* Compressed OCR output around service charge, GST, and total lines.

### 9.6 Verification

The backend test suite passed after the parser fix:

```text
12 passed, 1 skipped
```

A regression test was also added for the LionCity Bistro receipt format.

### 9.7 Remaining Deployment Action

The deployed backend must still be configured to use the real OCR engine:

```text
OCR_ENGINE=paddleocr
```

The backend Render build command should also install the OCR dependencies:

```bash
pip install -r requirements.txt && pip install -r requirements-ocr.txt
```

After the backend has been redeployed with this configuration, the LionCity receipt upload must be retested before additional external user testing continues.

---

## 10. Post-Test Questions

Ask each participant the following questions after completing the testing session:

1. Which part of the workflow was easiest?
2. Which part of the workflow was confusing?
3. Did the OCR review step feel clear?
4. Did editing, adding, and deleting receipt rows feel understandable?
5. Did the item assignment process make sense?
6. Did the tax and service charge allocation process make sense?
7. Did the settlement summary clearly show who should pay whom?
8. Did the member balance summary help you understand the group's settlement status?
9. What would you improve before the final submission?

---

## 11. Results Summary

| Area                              | Result                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Number of participants tested     | 2 participants, plus 1 internal pre-test                                                                                                                                                                                                                                                                                                                        |
| Overall task completion           | Participant 1 completed the core group, expense, OCR review, item assignment, settlement calculation, and settlement interpretation workflow. Participant 2 successfully completed the navigation and deployed-route retesting after the fixes were implemented.                                                                                                |
| Major usability issues            | During initial testing, the Debts page displayed an incorrect empty state. The deployed Groups page also experienced API request delays during backend cold starts. During the internal pre-test, the deployed OCR upload flow returned mock receipt items instead of parsing the uploaded receipt.                                                             |
| Minor usability issues            | The workflow order on the group detail page was unclear. The `Add` action still resembled the Groups page. The settlement result was not immediately noticeable. The tax and service charge allocation panel appeared before all items had been assigned.                                                                                                       |
| Positive findings                 | Group creation was straightforward. OCR review and item editing were understandable. Item assignment and settlement calculation were completed successfully. Route refreshing and deployed application loading functioned correctly after the deployment fixes.                                                                                                 |
| Changes implemented after testing | The frontend API timeout was increased from 10 seconds to 75 seconds. The bottom navigation active-state logic was corrected. The Debts page loading, error, and empty-state behaviour was improved. A Render rewrite rule was added. The receipt parser was improved for grouped OCR layouts, and a regression test was added for the LionCity receipt format. |
| Remaining limitations             | The backend Render deployment still requires real OCR configuration. The `Add` action does not yet provide a complete creation menu. The receipt assignment sequence, tax and service charge panel timing, group detail workflow guidance, and settlement result visibility still require improvement.                                                          |

---

## 12. Issues Identified

| ID        | Issue                                                                                                      | Severity | Evidence                                                                                                                                                                        | Corrective Action                                                                                                                                            | Status             |
| --------- | ---------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| UT-MS3-01 | The group detail page did not make the first step of the expense workflow sufficiently clear.              | Medium   | Participant 1 was not always certain which action should be completed first when creating an expense.                                                                           | Clarify the initial action and improve workflow guidance on the group detail page.                                                                           | Planned            |
| UT-MS3-02 | The expense workflow did not clearly communicate the expected sequence of actions.                         | Medium   | Participant 1 was not clearly guided through expense creation, receipt upload, item review, item assignment, and settlement calculation.                                        | Add clearer visual sequencing, labels, or step-based guidance.                                                                                               | Planned            |
| UT-MS3-03 | The bottom navigation `Add` button behaved too similarly to the Groups page.                               | Medium   | Participant 1 found the action confusing, while Participant 2 expected a broader creation menu.                                                                                 | The button now opens the create-group route. A more complete creation menu remains planned.                                                                  | Partially resolved |
| UT-MS3-04 | The Debts page incorrectly stated that the user was not a member of any group.                             | High     | Participant 1 had already joined groups, but the Debts page displayed an incorrect membership empty state.                                                                      | Improved the Debts page loading, error, and empty-state behaviour. Further backend or user-state investigation may still be required if the issue reappears. | Partially resolved |
| UT-MS3-05 | The settlement result was difficult to notice after calculation.                                           | Medium   | Participant 1 had to scroll upwards to locate the settlement summary and was not immediately certain where to find the result.                                                  | Automatically scroll to, highlight, or reposition the updated settlement result after calculation.                                                           | Planned            |
| UT-MS3-06 | The `Add` button remained highlighted when another bottom navigation page was active.                      | Medium   | Participant 2 found the constant blue active state confusing.                                                                                                                   | Updated the active-state logic so that `Add` is highlighted only on the create-group route.                                                                  | Resolved           |
| UT-MS3-07 | Group fetching could fail while the Render backend was waking from a cold start.                           | Medium   | Follow-up API checks indicated that the deployed services and data were healthy, but the frontend request could time out before the free-tier backend completed its cold start. | Increased the frontend API timeout from 10 seconds to 75 seconds.                                                                                            | Resolved           |
| UT-MS3-08 | Refreshing deployed frontend routes required correct rewrite handling.                                     | Medium   | Direct refreshes of Dashboard, Groups, or Debts required the Render rewrite rule.                                                                                               | Added the Render rewrite rule and successfully retested direct route refreshing.                                                                             | Resolved           |
| UT-MS3-09 | The tax and service charge allocation panel appeared before all item assignments were complete.            | Medium   | Participant 2 found the workflow sequence slightly unclear because the charge allocation panel appeared too early.                                                              | Delay, disable, or visually separate the panel until item assignment is complete.                                                                            | Planned            |
| UT-MS3-10 | The deployed OCR upload flow returned the mock demo receipt instead of parsing the uploaded receipt image. | High     | The LionCity Bistro receipt image produced Chicken Rice and Iced Lemon Tea as the detected items.                                                                               | Improved the parser for real OCR layouts and identified that the backend Render deployment must use `OCR_ENGINE=paddleocr`.                                  | In progress        |

---

## 13. Severity Guide

| Severity | Definition                                                 |
| -------- | ---------------------------------------------------------- |
| High     | Prevents the user from completing a key task               |
| Medium   | Causes confusion or difficulty, but the user can continue  |
| Low      | Represents a minor wording, layout, or visual-polish issue |

---

## 14. Evidence to Capture

The following evidence should be captured for the Milestone 3 documentation:

* Screenshot of the group detail page.
* Screenshot of the OCR receipt upload flow.
* Screenshot of the OCR review table.
* Screenshot of the item assignment interface.
* Screenshot of the tax and service charge split preview.
* Screenshot of the settlement summary.
* Screenshot of the member balance summary.
* Screenshot of the improved Debts page states.
* Screenshot of the corrected bottom navigation active state.
* Screenshot demonstrating that refreshed deployed routes work correctly.
* Screenshot of passing GitHub Actions checks.
* Terminal output showing that the frontend checks passed.
* Terminal output showing that the backend tests passed.
* Screenshot or testing notes showing the LionCity OCR regression and the expected parser fix.

---

## 15. Notes for the Final Report

When preparing the final README or Milestone 3 report:

* State clearly that two participant testing sessions were completed on 23 July 2026.
* Record the OCR regression identified on 25 July 2026 as an internal pre-test rather than external user testing.
* Keep internal developer testing separate from confirmed external user testing.
* Report both successfully completed tasks and observed moments of confusion.
* Clearly distinguish between completed fixes and planned improvements.
* Mention the frontend timeout adjustment, navigation active-state correction, Debts page state-handling improvements, Render rewrite rule, and OCR parser fixes.
* Do not claim that the real OCR backend deployment is complete until Render has been configured with `OCR_ENGINE=paddleocr`.
* Use screenshots that do not expose secrets, passwords, or private database URLs.
