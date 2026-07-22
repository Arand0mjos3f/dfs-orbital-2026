# O(n) Debtor

**O(n) Debtor** is a mobile-first shared-expense web application developed for **NUS Orbital 2026**. It helps small groups split receipt items fairly, assign items to individual members, allocate tax and service charges, calculate debts, and track settlement statuses from payment to confirmation.

The project focuses on **item-level expense splitting** rather than relying solely on equal splitting. This makes it more suitable for real-world group meals, where different people may order different items, certain dishes may be shared by only a subset of the group, and one person may pay for the bill upfront.

> **Milestone:** Milestone 3 – Extensions
> **Team:** 6634
> **Project Name:** O(n) Debtor
> **Target Level of Achievement:** Apollo 11
> **Team Members:** Chen Sixian and Sun Jingyi

---

## Deployed Links

| Component                 | Link                                       | Status |
| ------------------------- | ------------------------------------------ | ------ |
| Frontend Application      | https://dfs-orbital-frontend.onrender.com  | Live   |
| Backend API               | https://dfs-orbital-2026.onrender.com      | Live   |
| Backend API Documentation | https://dfs-orbital-2026.onrender.com/docs | Live   |

---

## Table of Contents

1. [Project Description](#1-project-description)
2. [Team Information](#2-team-information)
3. [Milestone 3 Status Summary](#3-milestone-3-status-summary)
4. [Problem Motivation](#4-problem-motivation)
5. [Target Users](#5-target-users)
6. [Core Features](#6-core-features)
7. [User Stories](#7-user-stories)
8. [Tech Stack](#8-tech-stack)
9. [System Architecture](#9-system-architecture)
10. [Data Model](#10-data-model)
11. [Backend Features](#11-backend-features)
12. [Frontend Features](#12-frontend-features)
13. [OCR-Assisted Receipt Review](#13-ocr-assisted-receipt-review)
14. [Fair Split and Settlement Workflow](#14-fair-split-and-settlement-workflow)
15. [Design Principles and Patterns](#15-design-principles-and-patterns)
16. [Testing Strategy](#16-testing-strategy)
17. [Automated Test Evidence](#17-automated-test-evidence)
18. [Manual and System Testing](#18-manual-and-system-testing)
19. [User Testing](#19-user-testing)
20. [Deployment Plan](#20-deployment-plan)
21. [Setup Instructions](#21-setup-instructions)
22. [How to Run the Backend](#22-how-to-run-the-backend)
23. [How to Run the Frontend](#23-how-to-run-the-frontend)
24. [How to Run Tests](#24-how-to-run-tests)
25. [Screenshots and Evidence Placeholders](#25-screenshots-and-evidence-placeholders)
26. [Team Contributions](#26-team-contributions)
27. [Project Log and Hours](#27-project-log-and-hours)
28. [Known Limitations](#28-known-limitations)
29. [Future Work](#29-future-work)
30. [Conclusion](#30-conclusion)

---

## 1. Project Description

O(n) Debtor is a shared-expense management application designed for small groups such as friends, roommates, classmates, project teams, and dining groups.

The application supports the following realistic shared-meal workflow:

```text
Login
-> Create group
-> Add members
-> Create expense
-> Upload or create receipt
-> Review receipt items
-> Assign items to members
-> Allocate tax and service charges
-> Preview split
-> Calculate or recalculate settlement
-> Mark paid
-> Confirm received
```

The main design goal is to make group expense splitting more accurate and less tedious. Instead of assuming that every bill should be divided equally among all members, O(n) Debtor allows users to assign each receipt item to the people who actually shared it.

---

## 2. Team Information

| Field        | Details                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| Project Name | O(n) Debtor                                                               |
| Team Number  | 6634                                                                      |
| Target Level | Apollo 11                                                                 |
| Milestone    | Milestone 3 – Extensions                                                  |
| Team Members | Chen Sixian, Sun Jingyi                                                   |
| Main Focus   | Mobile-first, item-level shared-expense splitting and settlement tracking |

---

## 3. Milestone 3 Status Summary

For Milestone 3, we extended the Milestone 2 prototype into a more complete and practical shared-expense management system.

### Milestone 3 Improvements

* Added an OCR-assisted receipt upload and review workflow to the frontend.
* Enabled users to review and edit OCR-parsed items before saving them into the standard bill workflow.
* Added backend-supported equal item sharing to keep financial calculation logic centralized.
* Added proportional tax and service charge allocation across item shares.
* Added a receipt-level split preview displaying item subtotals, tax shares, service charge shares, and final member totals.
* Added a debt recalculation workflow for updated expense data.
* Added a group debt summary endpoint and frontend member balance display.
* Added GitHub Actions CI for frontend and backend checks.
* Expanded backend tests for charge allocation and group debt summaries.
* Documented the testing strategy and user testing plan.
* Prepared the project for public Milestone 3 deployment.

### Remaining Milestone 3 Submission Tasks

* Add final deployment links.
* Add final screenshots.
* Complete the poster.
* Complete the video.
* Conduct final README polishing.
* Update the final project log and cumulative hours.

---

## 4. Problem Motivation

Group dining and shared expenses are common, but dividing them fairly can be difficult.

During real group meals:

* Different people order different items.
* Some dishes are shared only by a subset of the group.
* Tax and service charges must be distributed fairly.
* One person may pay for the bill upfront.
* Other members may settle their debts later.
* Group members may forget who has paid and whether the payment has been confirmed.

Existing expense-splitting applications often focus on equal splitting. Although equal splitting is simple, it is not always fair when group members consume different items.

O(n) Debtor aims to make shared-expense calculations more accurate by supporting item-level receipt splitting, member assignment, tax and service charge allocation, and settlement status tracking.

---

## 5. Target Users

The intended users are small groups that frequently share expenses, particularly meals and receipt-based purchases.

| User Group          | Example Use Case                                      |
| ------------------- | ----------------------------------------------------- |
| Friends             | Splitting dinner, drinks, snacks, or group activities |
| Roommates           | Splitting groceries or shared household purchases     |
| Classmates          | Splitting project expenses or group meals             |
| Project Groups      | Tracking shared meeting or material costs             |
| Small Social Groups | Managing repeated informal shared expenses            |

The current application is designed for small-group use rather than enterprise accounting.

---

## 6. Core Features

### 6.1 Group Management

* Create groups.
* View existing groups.
* Edit or delete groups.
* Add members to a group.
* Restrict member-management actions to group owners.

### 6.2 Expense Management

* Create expenses within groups.
* View expenses associated with each group.
* Connect expenses to receipts, items, and debts.

### 6.3 Receipt Management

* Create receipts manually.
* Upload receipt images.
* Store receipt subtotals, tax, service charges, and total amounts.
* Validate receipt totals against item totals.

### 6.4 OCR-Assisted Receipt Review

* Upload a receipt image.
* Send the receipt image to the backend OCR endpoint.
* Display parsed receipt items.
* Allow users to review and edit parsed items.
* Allow users to add or delete rows before saving.
* Save reviewed items into the standard bill-splitting workflow.

### 6.5 Item Assignment

* Assign each receipt item to one or more group members.
* Use backend equal-share logic to divide shared items.
* Preview item-sharing results.

### 6.6 Tax and Service Charge Allocation

* Allocate receipt-level tax and service charges across item shares.
* Display each member’s item subtotal, tax share, service charge share, and final total.
* Keep the backend as the source of truth for financial calculations.

### 6.7 Debt Calculation and Recalculation

* Calculate debts based on item shares.
* Recalculate debts when expense data changes.
* Cancel previous debts during recalculation to prevent stale settlement records.

### 6.8 Settlement Tracking

* Mark debts as paid.
* Confirm received payments.
* Track each debt through a controlled settlement lifecycle.

### 6.9 Group Debt Summary

* Display the total outstanding amount.
* Display outstanding and settled transaction counts.
* Display per-member balances.
* Help users understand who owes money and who is owed money.

### 6.10 Continuous Integration and Testing

* Run GitHub Actions workflows for frontend and backend checks.
* Run frontend linting, tests, and production builds.
* Run the backend `pytest` suite.
* Include focused tests for OCR, parsing, settlement lifecycles, charge allocation, and group summaries.

---

## 7. User Stories

| Role        | User Story                                                                                          |
| ----------- | --------------------------------------------------------------------------------------------------- |
| User        | As a user, I want to create a group so that I can manage shared expenses with others.               |
| Group Owner | As a group owner, I want to add members so that everyone involved can be included.                  |
| User        | As a user, I want to create an expense so that I can record a shared bill.                          |
| User        | As a user, I want to upload a receipt image so that the system can help extract receipt items.      |
| User        | As a user, I want to review OCR-parsed items so that I can correct mistakes before saving them.     |
| User        | As a user, I want to assign items to members so that shared items can be divided fairly.            |
| User        | As a user, I want tax and service charges to be allocated fairly so that final totals are accurate. |
| User        | As a user, I want to preview the split before settlement so that I can verify the result.           |
| User        | As a user, I want the system to calculate debts so that I know who should pay whom.                 |
| Debtor      | As a debtor, I want to mark a debt as paid so that others know the payment has been made.           |
| Receiver    | As a receiver, I want to confirm that payment was received so that the debt can be settled.         |

---

## 8. Tech Stack

### Frontend

| Technology       | Purpose                                     |
| ---------------- | ------------------------------------------- |
| React            | Component-based frontend user interface     |
| Vite             | Fast frontend development and build tooling |
| Tailwind CSS     | Utility-first, mobile-first styling         |
| Zustand          | Lightweight client-side state management    |
| Axios            | API communication with the backend          |
| React Router     | Page routing and protected routes           |
| Node Test Runner | Frontend unit testing                       |

### Backend

| Technology | Purpose                              |
| ---------- | ------------------------------------ |
| FastAPI    | Backend API framework                |
| SQLAlchemy | ORM and database model layer         |
| Alembic    | Database migration management        |
| PostgreSQL | Relational database                  |
| Pydantic   | Request and response validation      |
| pytest     | Backend unit and integration testing |
| Uvicorn    | ASGI server for FastAPI              |

### Deployment

| Component              | Planned Platform   |
| ---------------------- | ------------------ |
| Backend API            | Render Web Service |
| Backend Database       | Render PostgreSQL  |
| Frontend               | Vercel or Netlify  |
| Source Control         | GitHub             |
| Continuous Integration | GitHub Actions     |

---

## 9. System Architecture

The project follows a client-server architecture.

```text
Frontend: React + Vite
        |
        | Axios API calls
        v
Backend: FastAPI
        |
        | SQLAlchemy ORM
        v
Database: PostgreSQL
```

The frontend handles user interactions and visual workflows. The backend handles validation, data persistence, OCR-related processing, financial calculations, and settlement state transitions.

---

## 10. Data Model

The main database entities are listed below.

| Entity      | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| User        | Represents an application user                         |
| Group       | Represents a shared-expense group                      |
| GroupMember | Connects users to groups and supports membership logic |
| Expense     | Represents a shared bill or expense event              |
| Receipt     | Represents a receipt attached to an expense            |
| Item        | Represents an individual receipt item                  |
| ItemShare   | Represents how an item is shared among users           |
| Debt        | Represents money owed from one user to another         |

### Simplified Relationship Overview

```text
User
 ├── owns Groups
 ├── belongs to Groups through GroupMember
 ├── owes Debts as debtor
 └── receives Debts as receiver

Group
 ├── has GroupMembers
 ├── has Expenses
 └── has Debts

Expense
 └── has Receipts

Receipt
 └── has Items

Item
 └── has ItemShares

Debt
 ├── debtor: User
 ├── receiver: User
 └── belongs to Group
```

The data model is designed to support item-level splitting first, followed by debt calculation based on the resulting item shares.

---

## 11. Backend Features

The backend currently includes:

* User APIs.
* Group APIs.
* Group membership APIs.
* Expense APIs.
* Receipt APIs.
* A receipt image upload endpoint.
* An OCR service abstraction.
* A mock OCR engine.
* An optional PaddleOCR engine.
* A receipt text parser.
* Item APIs.
* Item share APIs.
* An equal item share endpoint.
* A receipt tax and service charge allocation endpoint.
* Debt calculation and recalculation endpoints.
* Debt lifecycle endpoints.
* A group debt summary endpoint.
* Alembic migration support.
* Backend `pytest` coverage.

### Backend Financial Logic

The backend is treated as the source of truth for financial results.

Important backend responsibilities include:

* Splitting item amounts equally among selected members.
* Allocating tax and service charges proportionally.
* Rounding monetary values to two decimal places.
* Creating debt records from member balances.
* Recalculating debt records when data changes.
* Preventing invalid debt state transitions.

---

## 12. Frontend Features

The frontend currently includes:

* A prototype login flow.
* Protected routes.
* A dashboard.
* A group list.
* A group detail page.
* Member display and owner-only add-member controls.
* Expense creation.
* Receipt creation.
* OCR receipt uploads.
* An OCR review interface.
* Manual item creation.
* Item assignment.
* A split preview.
* Tax and service charge allocation displays.
* A settlement summary.
* A group debt summary.
* A debts page.
* Mark-paid and confirm-received actions.

Current authentication is intended for prototype demonstration only. It is not production-grade authentication.

---

## 13. OCR-Assisted Receipt Review

Milestone 3 transforms OCR from a backend-only capability into a user-facing workflow.

The OCR-assisted process is as follows:

```text
Choose payer
-> Upload receipt image
-> Backend creates receipt draft
-> Backend parses OCR item candidates
-> Frontend displays OCR review rows
-> User edits item names and prices
-> User adds or deletes rows if needed
-> User saves reviewed items
-> Items enter the normal assignment workflow
```

This improves the project by making receipt splitting less manual. Users no longer need to enter every item from scratch when OCR can provide a useful starting point.

The current OCR system uses a mock OCR engine by default for stability. Optional PaddleOCR support is available for more realistic OCR testing.

---

## 14. Fair Split and Settlement Workflow

The settlement workflow is designed around item-level fairness.

### Item Assignment

Users select the members who shared each item. The backend equal-share endpoint then creates item shares for the selected users.

### Tax and Service Charge Allocation

Receipt-level charges are allocated across item shares. The frontend displays each member’s final total after item subtotals, tax shares, and service charge shares have been included.

### Debt Lifecycle

Debt settlement follows a controlled status workflow:

```text
pending -> marked_paid -> confirmed_received
```

| Status               | Meaning                                                                              |
| -------------------- | ------------------------------------------------------------------------------------ |
| `pending`            | A calculated debt exists, but the debtor has not marked it as paid.                  |
| `marked_paid`        | The debtor indicates that the payment has been made.                                 |
| `confirmed_received` | The receiver confirms that the payment was received.                                 |
| `cancelled`          | A previous debt has been cancelled, usually because the settlement was recalculated. |

### Permission Rules

| Action                   | Permission Rule                                  |
| ------------------------ | ------------------------------------------------ |
| Add group member         | Only group owners can add members.               |
| View group-specific data | The user should be a member of the group.        |
| Mark debt as paid        | Only the debtor can mark a pending debt as paid. |
| Confirm payment received | Only the receiver can confirm a marked payment.  |

---

## 15. Design Principles and Patterns

### Separation of Concerns

The project separates the frontend interface, API communication, backend endpoints, data validation, database persistence, and service-level logic.

### Component-Based Frontend Design

The frontend uses React components to organize reusable interface behavior. Page-level components manage route workflows, while smaller components manage repeated interface patterns.

### API Module Pattern

Frontend API calls are organized into dedicated API modules rather than being written directly inside UI components. This makes backend communication easier to maintain and update.

### Layered Backend Architecture

The backend follows a layered structure:

```text
Endpoints -> Schemas -> CRUD Helpers -> Models -> Services
```

### Backend as the Source of Truth

Financial calculations are performed by backend endpoints. The frontend displays previews and feedback, but the backend logic remains authoritative.

### Controlled State Transitions

Debt settlement uses explicit status transitions so that payment states remain clear and auditable.

### Testable OCR Design

The OCR engine is abstracted so that a stable mock engine can be used during testing, while optional PaddleOCR support remains available.

---

## 16. Testing Strategy

The testing strategy combines:

* Frontend linting.
* Frontend unit tests.
* Frontend production builds.
* Backend unit tests.
* Backend integration tests.
* OCR service tests.
* Receipt parser tests.
* Financial logic tests.
* Manual workflow testing.
* A user testing plan.

### Testing Goals

| Area                   | Testing Goal                                                      |
| ---------------------- | ----------------------------------------------------------------- |
| Frontend helpers       | Ensure receipt total and difference calculations are correct.     |
| Frontend build         | Ensure the React application builds successfully.                 |
| Frontend linting       | Identify code quality issues.                                     |
| Backend APIs           | Ensure core API workflows behave correctly.                       |
| OCR service            | Ensure mock OCR and parsed output remain stable.                  |
| Receipt parser         | Ensure receipt text parsing handles common receipt patterns.      |
| Charge allocation      | Ensure tax and service charges are allocated correctly.           |
| Settlement lifecycle   | Ensure mark-paid and confirm-received transitions work correctly. |
| Group debt summary     | Ensure group-level balances and transaction counts are correct.   |
| Continuous integration | Ensure checks run automatically on pull requests.                 |

---

## 17. Automated Test Evidence

### Frontend Commands

```bash
cd frontend
npm run lint
npm test
npm run build
```

Current frontend verification results:

```text
npm run lint: passed
npm test: 4 passed
npm run build: passed
```

Frontend unit tests cover:

* Receipt item total calculation.
* Empty receipt item totals.
* Receipt difference calculation.
* Matching receipt and item totals.

### Backend Commands

```bash
cd backend
python -m pytest -v
```

Current backend verification results:

```text
11 passed, 1 skipped
```

Backend tests cover:

* OCR service behavior.
* Mock OCR engine behavior.
* Receipt parser behavior.
* Tax and service charge parsing.
* Multiline receipt parsing.
* Settlement calculation.
* Debt payment lifecycle.
* Receipt charge allocation.
* Group debt summaries.

### Continuous Integration

The project includes GitHub Actions CI for:

* Frontend linting.
* Frontend tests.
* Frontend builds.
* The backend `pytest` suite.

This addresses the Milestone 2 feedback that tests were previously executed manually without continuous integration.

---

## 18. Manual and System Testing

Manual testing focuses on validating end-to-end user workflows.

| Test Area              | Manual Test Case                        | Expected Result                                      | Status      |
| ---------------------- | --------------------------------------- | ---------------------------------------------------- | ----------- |
| Login                  | Log in as a demo user                   | The user enters protected application pages          | Implemented |
| Group Creation         | Create a new group                      | The group appears in the group list                  | Implemented |
| Add Member             | Owner adds a group member               | The member appears on the group detail page          | Implemented |
| Expense Creation       | Create an expense inside a group        | The expense appears under the group                  | Implemented |
| Manual Receipt         | Create a manual receipt                 | The receipt is stored and displayed                  | Implemented |
| OCR Upload             | Upload a receipt image                  | An OCR review draft appears                          | Implemented |
| OCR Review             | Edit parsed item rows                   | Edited values are saved                              | Implemented |
| Add/Delete OCR Row     | Add and remove review rows              | The review table updates correctly                   | Implemented |
| Item Assignment        | Assign an item to members               | The split preview updates                            | Implemented |
| Tax/Service Allocation | Apply charges to item shares            | Final totals include the allocated charges           | Implemented |
| Settlement Calculation | Calculate the settlement                | Debts are generated                                  | Implemented |
| Debt Summary           | View the group summary                  | Outstanding totals and member balances are displayed | Implemented |
| Mark Paid              | Debtor marks a debt as paid             | The status becomes `marked_paid`                     | Implemented |
| Confirm Received       | Receiver confirms the payment           | The status becomes `confirmed_received`              | Implemented |
| Deployment             | Open the public application link        | The application loads publicly                       | TODO        |
| User Testing           | External user completes the task script | Observations are recorded                            | TODO        |

---

## 19. User Testing

User testing is planned for Milestone 3.

The user testing plan is documented in:

```text
docs/user_testing_ms3.md
```

### Planned User Testing Tasks

1. Create or enter a group.
2. Add members.
3. Create an expense.
4. Upload or create a receipt.
5. Review OCR-parsed items.
6. Assign items to members.
7. Apply tax and service charge allocation.
8. Calculate the settlement.
9. Interpret the group debt summary.
10. Mark and confirm a payment.

### Metrics to Record

* Whether the user can complete each task.
* Where the user hesitates.
* Whether interface labels are clear.
* Whether the split preview is understandable.
* Whether the user trusts the settlement results.
* Suggestions for improvement.

> **TODO:** Add completed user testing observations before the final Milestone 3 submission.

---

## 20. Deployment Plan

Milestone 3 requires the product to be deployed and linked from this README.

### Deployment Setup

| Component           | Platform           | Status |
| ------------------- | ------------------ | ------ |
| Backend API         | Render Web Service | Live   |
| Backend Database    | Render PostgreSQL  | Live   |
| Frontend            | Render Static Site | Live   |
| README Public Links | GitHub README      | Added  |

### Backend Deployment Configuration

```bash
pip install -r requirements.txt && alembic upgrade head
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Backend Environment Variables

```text
DATABASE_URL=<Render PostgreSQL internal database URL>
PYTHON_VERSION=3.12.13
```

Frontend environment variable used in deployment:

```text
VITE_API_BASE_URL=https://dfs-orbital-2026.onrender.com/api/v1
```

---

## 21. Setup Instructions

### Prerequisites

Install the following:

* Python 3.12 recommended.
* Node.js 18 or later.
* PostgreSQL.
* npm.
* Git.

### Clone the Repository

```bash
git clone https://github.com/Arand0mjos3f/dfs-orbital-2026.git
cd dfs-orbital-2026
```

---

## 22. How to Run the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file if needed:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
OCR_ENGINE=mock
```

Run the database migrations:

```bash
alembic upgrade head
```

Start the backend server:

```bash
python -m uvicorn main:app --reload
```

The backend should be available at:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

Health endpoint:

```text
http://localhost:8000/api/v1/health
```

---

## 23. How to Run the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install the required dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

---

## 24. How to Run Tests

### Frontend

```bash
cd frontend
npm run lint
npm test
npm run build
```

### Backend

```bash
cd backend
python -m pytest -v
```

### Optional PaddleOCR Test

```bash
cd backend
RUN_PADDLEOCR_TESTS=1 python -m pytest -v tests/test_paddleocr_engine.py
```

---

## 25. Screenshots and Evidence Placeholders

> **TODO:** Replace the placeholders with final screenshots after deployment and final manual testing.

| Screenshot                        | Purpose                                                       | Status |
| --------------------------------- | ------------------------------------------------------------- | ------ |
| Login Page                        | Show the application entry point and prototype authentication | TODO   |
| Groups Dashboard                  | Show the group overview workflow                              | TODO   |
| Group Detail Page                 | Show members, expenses, and the settlement summary            | TODO   |
| OCR Receipt Upload                | Show OCR-assisted receipt intake                              | TODO   |
| OCR Review Table                  | Show editable parsed receipt items                            | TODO   |
| Item Assignment                   | Show selected users for shared items                          | TODO   |
| Tax and Service Charge Allocation | Show the fair-allocation preview                              | TODO   |
| Group Debt Summary                | Show member balances and outstanding settlements              | TODO   |
| Debts Page                        | Show settlement lifecycle actions                             | TODO   |
| GitHub Actions                    | Show passing CI checks                                        | TODO   |
| Deployed Application              | Show the working public deployment link                       | TODO   |

### Suggested Image Paths

```text
docs/images/ms3-login.png
docs/images/ms3-groups.png
docs/images/ms3-ocr-review.png
docs/images/ms3-tax-service-preview.png
docs/images/ms3-group-summary.png
docs/images/ms3-ci-green.png
docs/images/ms3-deployed-app.png
```

---

## 26. Team Contributions

The team followed a vertical-slicing approach rather than using a strict frontend/backend division.

### Chen Sixian

**Primary vertical slice:**

```text
OCR-assisted receipt review user flow
```

**Contribution areas:**

* Frontend OCR upload and review workflow.
* Receipt review interface.
* Item assignment integration.
* Tax and service charge allocation display.
* Group summary UI integration.
* Testing and verification.
* Documentation and user testing preparation.
* Deployment coordination.

### Sun Jingyi

**Primary vertical slice:**

```text
Fair split and settlement accuracy user flow
```

**Contribution areas:**

* Backend financial calculation logic.
* Equal item share logic.
* Tax and service charge allocation.
* Debt calculation and recalculation.
* Split preview and suggested debt logic.
* Backend tests for financial correctness.
* Backend API and database support.

### Shared Contributions

* System testing.
* Pull request reviews.
* CI verification.
* Milestone report preparation.
* Poster preparation.
* Video preparation.
* Final deployment and submission readiness.

---

## 27. Project Log and Hours

Milestone 3 requires approximately 140 cumulative hours per person by the end of the milestone.

> **TODO:** Insert the final confirmed cumulative hours before submission.

### Planned Log Categories

| Category                | Examples                                                      |
| ----------------------- | ------------------------------------------------------------- |
| Planning                | Milestone planning, task slicing, and feedback analysis       |
| Frontend Implementation | OCR review UI, split preview UI, and group summary UI         |
| Backend Implementation  | OCR API, item shares, charge allocation, debts, and summaries |
| Testing                 | Unit tests, integration tests, CI, and manual testing         |
| Documentation           | README, testing documentation, and user testing documentation |
| Deployment              | Render backend, frontend deployment, and environment setup    |
| Presentation            | Poster and video preparation                                  |

---

## 28. Known Limitations

Current limitations include:

* Authentication is prototype-only and is not production-grade.
* OCR behavior depends on the configured OCR engine and receipt image quality.
* Mock OCR is used by default for stability.
* The frontend is mobile-first and may require additional desktop layout polishing.
* Deployment is still in progress.
* User testing results have not yet been finalized.
* Free hosting services may enter sleep mode after periods of inactivity.
* Payment proof is represented using URL or string fields rather than actual file storage.
* Advanced notification and reminder features have not been implemented.

---

## 29. Future Work

Potential future improvements include:

* Production-grade authentication.
* More robust OCR using real receipt datasets.
* Improved OCR confidence displays.
* Batch item-save endpoint integration.
* Dedicated split-preview endpoint integration.
* Richer payment proof uploads.
* Email or in-app payment reminders.
* Improved desktop-responsive layouts.
* More extensive user testing.
* Exportable settlement reports.
* Multi-currency support.
* More advanced permission management.
* Long-term persistent deployment.

---

## 30. Conclusion

O(n) Debtor has progressed from a basic prototype into a more complete shared-expense splitting system for Milestone 3.

The project now supports a realistic workflow for creating groups, managing expenses, uploading or manually entering receipts, reviewing OCR-parsed items, assigning items to members, allocating tax and service charges, calculating settlements, and tracking payment statuses.

The main Milestone 3 improvements address earlier feedback by making OCR user-facing, strengthening backend financial logic, expanding automated tests, adding continuous integration, improving settlement visibility, and preparing the project for deployment and final submission.

The remaining work before the final Milestone 3 submission focuses on deployment, final screenshots, user testing evidence, poster preparation, video preparation, and final README polishing.
