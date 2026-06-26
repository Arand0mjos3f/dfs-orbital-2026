# O(n) Debtor

**O(n) Debtor** is a mobile-first shared-expense web application developed for **NUS Orbital 2026**. It helps small groups split receipt items fairly, assign items to members, calculate debts, and track settlement status from payment to confirmation.

The project focuses on item-level expense splitting rather than only equal splitting. This makes it better suited for real group meals where different people order different items, some dishes are shared, and one person may pay for the whole receipt first.

> **Milestone:** Milestone 2 - Prototyping
> **Team:** 6634
> **Project Name:** O(n) Debtor
> **Target Level of Achievement:** Apollo 11
> **Team Members:** Chen Sixian and Sun Jingyi

---

## 1. Project Description

O(n) Debtor is a shared-expense management application for small groups such as friends, roommates, project groups, classmates, and dining groups.

The current Milestone 2 prototype supports the following main user flow:

```text
Login
-> Create group
-> Add member
-> Create expense
-> Create receipt
-> Add receipt items
-> Assign items to members
-> Calculate settlement
-> Mark paid
-> Confirm received
```

At this stage, the application is a working prototype. The frontend focuses on a manual receipt-entry workflow, while the backend includes additional OCR infrastructure for future receipt-upload features.

---

## 2. Team Information

| Field        | Details                                                       |
| ------------ | ------------------------------------------------------------- |
| Project Name | O(n) Debtor                                                   |
| Team Number  | 6634                                                          |
| Target Level | Apollo 11                                                     |
| Milestone    | Milestone 2 - Prototyping                                     |
| Team Members | Chen Sixian, Sun Jingyi                                       |
| Main Focus   | Mobile-first shared-expense splitting and settlement tracking |

---

## 3. Milestone 2 Status Summary

For Milestone 2, we moved from the planning and design stage into a functional prototype. The main goal was to implement a realistic end-to-end expense-splitting workflow and establish a stable technical foundation for Milestone 3.

Current prototype progress includes:

* Mobile-first frontend prototype built with React, Vite, Tailwind CSS, Zustand, Axios, and React Router.
* FastAPI backend with PostgreSQL-backed models, SQLAlchemy ORM, Alembic migrations, Pydantic schemas, CRUD helpers, and service modules.
* Manual receipt creation and manual item entry.
* Item assignment to selected group members.
* Receipt total validation feedback.
* Settlement calculation and debt lifecycle workflow.
* Backend OCR infrastructure with mock OCR by default and optional PaddleOCR integration.
* Automated frontend and backend tests for key logic and workflow behavior.
* API-level smoke-test script for validating the Milestone 2 workflow.

The prototype is not yet a production system. Authentication is currently simplified for demonstration, OCR is not yet the main polished frontend flow, and the project has not yet been deployed to the cloud.

---

## 4. Problem Motivation

Group dining and shared expenses are common, but splitting them fairly can be difficult.

In real group meals:

* Different people order different items.
* Some dishes are shared by only a subset of the group.
* Tax and service charges may need to be distributed.
* One person may pay first, while others settle later.
* People may forget who has paid and who has confirmed receipt.

Existing split apps often focus on equal splitting. However, equal splitting is not always fair for group meals because people may consume different items or share only selected dishes.

O(n) Debtor aims to make shared-expense calculation more accurate by supporting item-level receipt splitting, member assignment, and settlement status tracking.

---

## 5. Target Users

The proposed users are small groups who frequently share expenses, especially meals and receipts.

Examples include:

| User Group          | Example Use Case                                             |
| ------------------- | ------------------------------------------------------------ |
| Friends             | Splitting dinner, drinks, shared snacks, or group activities |
| Roommates           | Splitting household purchases or shared groceries            |
| Classmates          | Splitting project expenses or group meals                    |
| Project Groups      | Tracking shared costs for materials or meetings              |
| Small Social Groups | Handling repeated shared expenses over time                  |

The current prototype is designed for small-group use rather than large-scale enterprise accounting.

---

## 6. Core Features

The core features of O(n) Debtor are:

1. **Group Management**

   * Create groups.
   * View groups.
   * Edit or delete groups.
   * Add members to a group.

2. **Expense Management**

   * Create expenses within groups.
   * View expense lists.

3. **Receipt Management**

   * Create receipts manually.
   * Add receipt items manually.
   * Validate receipt totals against item totals.

4. **Item Assignment**

   * Assign each receipt item to one or more group members.
   * Preview how item costs are split.

5. **Debt Calculation**

   * Calculate debts based on item assignments.
   * Recalculate debts when needed.

6. **Settlement Tracking**

   * Mark debts as paid.
   * Confirm received payments.
   * Track debt status through a state-based workflow.

7. **OCR Infrastructure**

   * Backend-supported receipt image upload endpoint.
   * OCR service abstraction.
   * Mock OCR engine for stable local development.
   * Optional PaddleOCR integration for future OCR-based receipt extraction.

---

## 7. User Stories

The following user stories were identified in Milestone 1 and continue to guide the Milestone 2 prototype.

| Role        | User Story                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- |
| User        | As a user, I want to create a group so that I can manage shared expenses.                     |
| Group Owner | As a group owner, I want to add members so that everyone involved can be included.            |
| User        | As a user, I want to create an expense so that I can record a shared bill.                    |
| User        | As a user, I want to enter receipt items so that the bill can be split by actual consumption. |
| User        | As a user, I want to assign items to members so that shared items can be divided fairly.      |
| User        | As a user, I want the system to calculate debts so that I know who should pay whom.           |
| Debtor      | As a debtor, I want to mark a debt as paid.                                                   |
| Receiver    | As a receiver, I want to confirm that payment was received.                                   |

---

## 8. Tech Stack

### Frontend

| Technology       | Purpose                                       |
| ---------------- | --------------------------------------------- |
| React            | Component-based frontend UI                   |
| Vite             | Fast frontend development and build tooling   |
| Tailwind CSS     | Utility-first styling and mobile-first layout |
| Zustand          | Lightweight client-side state management      |
| Axios            | API requests to backend                       |
| React Router     | Page routing and protected routes             |
| Node Test Runner | Frontend unit testing                         |

### Backend

| Technology | Purpose                              |
| ---------- | ------------------------------------ |
| FastAPI    | Backend API framework                |
| SQLAlchemy | ORM and database model layer         |
| Alembic    | Database migration management        |
| PostgreSQL | Relational database                  |
| Pydantic   | Request and response validation      |
| pytest     | Backend unit and integration testing |

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

### Frontend Architecture

The frontend is organized around reusable components, pages, API modules, and shared state.

```text
frontend/
├── src/
│   ├── api/              # Axios API modules
│   ├── assets/           # Static frontend assets
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature-specific modules such as auth
│   ├── layouts/          # Shared page layouts
│   ├── pages/            # Route-level pages
│   ├── store/            # Zustand stores
│   ├── utils/            # Shared utility functions
│   ├── App.jsx           # React Router configuration
│   └── main.jsx          # React entry point
└── tests/                # Frontend unit tests
```

The frontend uses an API module pattern so that page components do not directly contain raw request logic. This helps separate UI behavior from backend communication.

### Backend Architecture

The backend is organized into models, schemas, CRUD helpers, API endpoints, and service modules.

```text
backend/
├── app/
│   ├── api/              # FastAPI route handlers
│   ├── core/             # Configuration and shared settings
│   ├── crud/             # Database access helpers
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic and OCR service layer
│   └── main.py           # FastAPI application entry point
├── alembic/              # Database migrations
├── tests/                # Backend tests
└── scripts/              # Smoke-test scripts
```

This layered structure is intended to keep endpoint handling, validation, persistence, and business logic separate.

---

## 10. Data Model

The main database entities are:

| Entity      | Purpose                                                   |
| ----------- | --------------------------------------------------------- |
| User        | Represents an application user                            |
| Group       | Represents a shared-expense group                         |
| GroupMember | Connects users to groups and supports membership logic    |
| Expense     | Represents a shared bill or expense event                 |
| Receipt     | Represents a receipt attached to an expense               |
| Item        | Represents an individual receipt item                     |
| ItemShare   | Represents which members share which items                |
| Debt        | Represents calculated money owed from one user to another |

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

The data model is designed to support item-level splitting first, then debt calculation based on the resulting item shares.

---

## 11. Implemented Backend Features

The backend currently includes the following implemented features.

### User APIs

* User registration.
* User listing.

### Group APIs

* Group creation.
* Group listing.
* Group editing.
* Group deletion.
* Group membership APIs.
* Owner-only member management logic.

### Expense APIs

* Expense creation.
* Expense listing.
* Expense retrieval for group workflows.

### Receipt APIs

* Manual receipt creation.
* Receipt image upload endpoint.
* Receipt total fields for validation and calculation.
* Receipt-related item workflows.

### OCR and Parsing APIs

* OCR service abstraction.
* Mock OCR engine for stable local development and tests.
* Optional PaddleOCR engine using:

```bash
OCR_ENGINE=paddleocr
```

* Receipt text parser for extracting items, tax, service charge, and totals from OCR-like text.

### Item APIs

* Manual item creation.
* Item listing.
* Item share APIs.
* Equal item split endpoint.

### Financial Calculation APIs

* Receipt tax/service-charge allocation endpoint.
* Debt calculation endpoint.
* Debt recalculation endpoint.
* Debt payment lifecycle endpoints.

### Debt Lifecycle APIs

* Mark pending debt as paid.
* Confirm marked payment as received.
* Maintain debt status through a controlled workflow.

---

## 12. Implemented Frontend Features

The frontend currently includes the following implemented features.

### Authentication and Routing

* Prototype login for Sixian and Jingyi demo users.
* Protected routes.
* Logged-in user context used for dashboard and settlement actions.

> Current authentication is for prototype demonstration only. It is not production authentication.

### Dashboard

* Shows amounts owed by the logged-in user.
* Shows amounts owed to the logged-in user.
* Provides a quick overview of the user’s current settlement state.

### Group Management

* Create groups.
* List groups.
* Edit groups.
* Delete groups.
* View group detail page.
* View group member list.
* Owner-only add member control.

### Expense Management

* Create expenses.
* List expenses under relevant group workflows.

### Receipt and Item Workflow

* Manual receipt creation.
* Manual item creation.
* Receipt total validation feedback.
* Item assignment to selected group members.
* Split preview before settlement calculation.

### Settlement Workflow

* Settlement calculation button.
* Debts page with group selector.
* Selected debt group persists after browser refresh.
* Mark paid action for debtor.
* Confirm received action for receiver.

---

## 13. OCR and Receipt Parsing

The backend includes OCR infrastructure, but the Milestone 2 frontend mainly focuses on manual receipt entry.

### Current OCR Status

| Area                                  | Status                            |
| ------------------------------------- | --------------------------------- |
| Backend receipt image upload endpoint | Implemented                       |
| OCR service abstraction               | Implemented                       |
| Mock OCR engine                       | Implemented and used by default   |
| Optional PaddleOCR engine             | Implemented behind configuration  |
| Receipt text parser                   | Implemented                       |
| Polished frontend OCR upload flow     | Not yet the main Milestone 2 flow |

The default local OCR engine is mock OCR. This makes local development and automated tests more stable because tests do not depend on external OCR behavior or local machine OCR setup.

The optional PaddleOCR engine can be enabled with:

```bash
OCR_ENGINE=paddleocr
```

However, OCR upload should be understood as backend-supported and prototype-supported at this stage, not as a fully polished user-facing Milestone 2 flow.

### Receipt Parser Coverage

The receipt parser is tested for:

* Item extraction.
* Tax parsing.
* Service-charge parsing.
* Total parsing.
* Cases where there is no explicit total.
* Ignored non-item lines.
* Multiline table parsing.

---

## 14. Settlement Workflow

The settlement workflow uses a state-based debt lifecycle:

```text
pending -> marked_paid -> confirmed_received
```

### Debt Statuses

| Status             | Meaning                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| pending            | A calculated debt exists, but the debtor has not marked it as paid.           |
| marked_paid        | The debtor says the payment has been made.                                    |
| confirmed_received | The receiver confirms that payment was received.                              |
| cancelled          | A previous debt has been cancelled, usually because settlement was recalculated. |

### Permission Rules

The workflow includes role-based restrictions.

| Action                   | Permission Rule                                    |
| ------------------------ | -------------------------------------------------- |
| Add group member         | Only group owners can add members.                 |
| View group-specific data | Non-members should not access group-specific data. |
| Mark debt as paid        | Only the debtor can mark a pending debt as paid.   |
| Confirm payment received | Only the receiver can confirm a marked payment.    |

This prevents one user from incorrectly completing another user’s payment step.

---

## 15. Design Principles and Patterns

### Separation of Concerns

The project separates frontend UI, API communication, backend endpoints, data validation, database persistence, and service-level logic.

This makes the codebase easier to test and modify because different layers have clearer responsibilities.

### Component-Based Frontend Design

The frontend uses React components to organize reusable UI behavior. Page-level components handle route-level workflows, while smaller components handle repeated interface patterns.

### API Module Pattern

Frontend API calls are organized into API modules rather than being written directly inside UI components. This reduces duplication and makes backend communication easier to update.

### Layered Backend Architecture

The backend follows a layered structure:

```text
Endpoints -> Schemas -> CRUD Helpers -> Models -> Services
```

This supports clearer responsibilities:

* Endpoints handle HTTP requests and responses.
* Schemas validate request and response data.
* CRUD helpers manage database access.
* Models define database tables and relationships.
* Services handle business logic such as OCR and calculation behavior.

### State-Based Workflow for Debts

Debt settlement is represented as a controlled state transition:

```text
pending -> marked_paid -> confirmed_received
```

This makes settlement status explicit and prevents unclear payment states.

### Role-Based Access Control

The prototype includes permission rules based on user role and relationship to the data:

* Group owner.
* Group member.
* Debtor.
* Receiver.

These permission checks are important because financial data should only be changed by the relevant users.

### Single Source of Truth for Financial Calculations

Financial calculations are handled on the backend. The frontend may show previews and validation feedback, but the backend remains the source of truth for settlement calculation.

This reduces the risk of inconsistent financial results between client and server.

### Validation Before Settlement

The receipt workflow includes validation before settlement calculation. For example, receipt item totals can be compared against the expected receipt total so that users can catch mistakes before debts are calculated.

---

## 16. Testing Strategy

The testing strategy combines frontend unit tests, backend unit tests, backend integration tests, parser tests, OCR service tests, and manual workflow testing.

The goal is to test both isolated logic and full workflow behavior.

### Testing Goals

| Area                         | Testing Goal                                                         |
| ---------------------------- | -------------------------------------------------------------------- |
| Frontend calculation helpers | Ensure displayed receipt total differences are calculated correctly. |
| Frontend build               | Ensure the React app builds successfully.                            |
| Frontend linting             | Catch code quality and formatting issues.                            |
| Backend APIs                 | Ensure core API workflows behave correctly.                          |
| Debt lifecycle               | Ensure mark-paid and confirm-received transitions work correctly.    |
| OCR service                  | Ensure mock OCR and parsed OCR output work in stable local tests.    |
| Receipt parser               | Ensure receipt text parsing handles common receipt patterns.         |
| Full workflow                | Validate API-level Milestone 2 flow with smoke-test script.          |

---

## 17. Automated Test Evidence

### Frontend Commands

```bash
npm test
npm run lint
npm run build
```

### Frontend Test Coverage

Frontend unit tests currently cover:

* Receipt item total calculation.
* Receipt difference calculation.

These tests support the receipt validation workflow, where the application compares entered item totals against the receipt total.

### Backend Commands

```bash
python -m pytest -v
```

### Backend Test Coverage

Backend tests currently cover:

* User creation as part of the settlement integration workflow.
* Group creation and membership.
* Expense creation.
* Receipt creation.
* Item creation.
* Item-share creation.
* Debt calculation.
* Mark-paid lifecycle transition.
* Confirm-received lifecycle transition.

### OCR Service Tests

OCR service tests cover:

* Mock OCR engine behavior.
* Parsed OCR result behavior.

The mock engine is used by default to keep local development and automated testing stable.

### Receipt Parser Tests

Receipt parser tests cover:

* Item extraction.
* Tax parsing.
* Service charge parsing.
* Total parsing.
* Missing explicit total.
* Ignored non-item lines.
* Multiline table parsing.

### PaddleOCR Integration Test

A PaddleOCR integration test exists but is disabled by default. It can be enabled with:

```bash
RUN_PADDLEOCR_TESTS=1
```

This avoids requiring all local development environments to install and configure PaddleOCR.

### Full Workflow Smoke Test

A full workflow smoke-test script exists for API-level Milestone 2 validation.

The smoke test is intended to verify the newer backend receipt/OCR workflow:

```text
Upload receipt image
-> Extract OCR items
-> Confirm parsed items
-> Create equal item shares
-> Allocate receipt tax and service charges
-> Recalculate debts
-> List group debts
```

---

## 18. Manual and System Testing Checklist

The following checklist summarizes the manual testing performed or intended for Milestone 2 prototype validation.

| Test Area              | Manual Test Case                              | Expected Result                                   | Status                                    |
| ---------------------- | --------------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Login                  | Log in as Sixian demo user                    | User enters protected app pages                   | Implemented                               |
| Login                  | Log in as Jingyi demo user                    | User enters protected app pages                   | Implemented                               |
| Protected Routes       | Access app page without login                 | User should be redirected or blocked              | Implemented                               |
| Group Creation         | Create a new group                            | Group appears in group list                       | Implemented                               |
| Group Editing          | Edit group details                            | Updated group information is shown                | Implemented                               |
| Group Deletion         | Delete group                                  | Group is removed from list                        | Implemented                               |
| Add Member             | Owner adds group member                       | Member appears in group detail page               | Implemented                               |
| Add Member Permission  | Non-owner attempts owner-only action          | Action should be restricted                       | Implemented / under continued testing     |
| Expense Creation       | Create expense inside group workflow          | Expense appears in relevant list                  | Implemented                               |
| Receipt Creation       | Create manual receipt                         | Receipt is stored and shown                       | Implemented                               |
| Item Creation          | Add receipt items manually                    | Items appear under receipt                        | Implemented                               |
| Receipt Validation     | Item total differs from receipt total         | Difference feedback is shown                      | Implemented                               |
| Item Assignment        | Assign item to selected members               | Split preview updates                             | Implemented                               |
| Settlement Calculation | Click settlement calculation button           | Debts are calculated                              | Implemented                               |
| Debt Group Persistence | Refresh browser on selected debt group        | Selected group remains selected                   | Implemented                               |
| Mark Paid              | Debtor marks debt as paid                     | Debt status becomes marked_paid                   | Implemented                               |
| Confirm Received       | Receiver confirms payment                     | Debt status becomes confirmed_received            | Implemented                               |
| Non-member Access      | Non-member accesses group-specific data       | Access should be denied                           | Backend rule included / continued testing |
| OCR Upload             | Upload receipt image through backend endpoint | Backend can process through configured OCR engine | Backend-supported prototype               |

---

## 19. Problems Encountered and Solutions

### Problem 1: Financial Logic Can Become Inconsistent Across Frontend and Backend

**Issue:**
Receipt splitting involves item prices, shared items, tax, service charge, and settlement calculation. If the frontend and backend both independently calculate final debt amounts, inconsistencies may occur.

**Solution:**
We treat the backend as the single source of truth for financial calculations. The frontend can provide validation feedback and previews, but final settlement calculation is performed by backend endpoints.

---

### Problem 2: OCR Can Be Unstable During Local Development

**Issue:**
OCR engines may require heavy dependencies and can behave differently across machines. This can make testing unstable and difficult for team members.

**Solution:**
We implemented an OCR service abstraction. The default local OCR engine is a mock engine, which allows stable development and testing. PaddleOCR is available as an optional engine through configuration.

```bash
OCR_ENGINE=paddleocr
```

PaddleOCR integration tests are disabled by default and only run when explicitly enabled.

---

### Problem 3: Receipt Parsing Has Many Edge Cases

**Issue:**
Real receipts can contain item lines, totals, tax, service charge, table formatting, and irrelevant non-item lines. A simple parser may incorrectly treat non-item lines as receipt items.

**Solution:**
We added parser tests for common cases including item extraction, tax/service/total parsing, missing explicit total, ignored non-item lines, and multiline table parsing. The parser remains a prototype component and will need more real receipt testing in Milestone 3.

---

### Problem 4: Debt Settlement Requires Clear User Permissions

**Issue:**
Without permission rules, the wrong user could mark another person’s debt as paid or confirm a payment that they did not receive.

**Solution:**
We implemented role-based rules for the debt lifecycle:

* Only the debtor can mark a pending debt as paid.
* Only the receiver can confirm a marked payment.
* Only group owners can add members.
* Non-members should not access group-specific data.

---

### Problem 5: Maintaining Frontend State Across Refreshes

**Issue:**
The Debts page includes a group selector. Without persistence, refreshing the browser could lose the selected group and interrupt the user flow.

**Solution:**
The selected debt group persists after browser refresh, improving continuity in the prototype workflow.

---

### Problem 6: Building a Mobile-First Workflow with Many Steps

**Issue:**
The main workflow contains many steps: group creation, member management, expense creation, receipt creation, item creation, item assignment, settlement calculation, and payment confirmation. On a small screen, this can become confusing.

**Solution:**
We designed the frontend as a mobile-first prototype with route-based pages and focused workflows. The UI is still a prototype, but the current structure helps separate each major user task.

---

## 20. Software Engineering Evidence

The project includes several forms of software engineering evidence for Milestone 2.

### 1. Requirements and User Stories

The project is guided by user stories from Milestone 1, including group creation, member management, receipt item entry, item assignment, debt calculation, and settlement tracking.

### 2. Modular Architecture

The codebase is organized into separate frontend and backend layers. Within each layer, responsibilities are separated further.

Frontend evidence:

* Component-based React structure.
* API modules for backend communication.
* Zustand store for shared state.
* React Router for page-level navigation.
* Protected route handling.

Backend evidence:

* FastAPI endpoints.
* Pydantic schemas.
* SQLAlchemy models.
* CRUD helper modules.
* Service modules for OCR and business logic.
* Alembic migrations for database evolution.

### 3. Testing

The project includes automated tests for both frontend and backend behavior.

Evidence includes:

* Frontend unit tests.
* Frontend linting.
* Frontend production build.
* Backend pytest suite.
* Backend integration workflow test.
* OCR service tests.
* Receipt parser tests.
* Optional PaddleOCR integration test.
* Full workflow smoke-test script.

### 4. Validation and Error Feedback

The frontend provides receipt total validation feedback before settlement calculation. This supports the principle of validating financial data before producing final debts.

### 5. Controlled State Transitions

Debt settlement follows a controlled lifecycle:

```text
pending -> marked_paid -> confirmed_received
```

This avoids ambiguous settlement status and supports clearer payment tracking.

### 6. Access Control

The project includes role-based access-control examples:

* Group owner permissions for member management.
* Debtor-only permission for marking debts as paid.
* Receiver-only permission for confirming payments.
* Group member restrictions for group-specific data.

### 7. Development Practicality

Mock OCR is used by default so that development and testing remain stable across machines. Optional PaddleOCR support is kept behind configuration rather than required for all environments.

---

## 21. Setup Instructions

> The commands below assume separate frontend and backend directories. Adjust folder names if your local repository structure differs.

### Prerequisites

Install the following:

* Python 3.10 or later recommended
* Node.js 18 or later recommended
* PostgreSQL
* npm
* Git

Clone the repository:

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

For Windows PowerShell:

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file if required by the local setup. Example:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
OCR_ENGINE=mock
```

Run database migrations:

```bash
alembic upgrade head
```

Start the FastAPI development server:

```bash
python -m uvicorn main:app --reload
```

The backend should be available at:

```text
http://localhost:8000
```

FastAPI Swagger documentation should be available at:

```text
http://localhost:8000/docs
```

---

## 23. How to Run the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a frontend environment file if required. Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

The frontend should be available at the local Vite development URL shown in the terminal, commonly:

```text
http://localhost:5173
```

---

## 24. How to Run Tests

### Frontend Tests

From the frontend directory:

```bash
npm test
npm run lint
npm run build
```

These commands check frontend unit tests, linting, and production build readiness.

### Backend Tests

From the backend directory:

```bash
python -m pytest -v
```

### Optional PaddleOCR Tests

PaddleOCR tests are disabled by default. To run them:

```bash
RUN_PADDLEOCR_TESTS=1 python -m pytest -v
```

Only run these tests in an environment where PaddleOCR and its dependencies are properly installed.

### Smoke Test

A full workflow smoke-test script exists for API-level validation of the Milestone 2 workflow:

From the backend directory:

```bash
python scripts/ms2_full_workflow_smoke_test.py
```

The script expects an existing expense, group, payer, participant users, and receipt image path through environment variables:

```bash
API_BASE_URL=http://127.0.0.1:8000/api/v1 \
EXPENSE_ID=<expense_id> \
GROUP_ID=<group_id> \
PAYER_ID=<payer_user_id> \
PARTICIPANT_USER_IDS=<user_id_1>,<user_id_2> \
RECEIPT_IMAGE_PATH=tmp/test_receipts/real_receipt.jpg \
python scripts/ms2_full_workflow_smoke_test.py
```

The smoke test checks receipt upload, OCR item extraction, item confirmation, equal item shares, receipt charge allocation, debt recalculation, and group debt listing.

---

## 25. Known Limitations

The current prototype has the following limitations:

1. **Prototype Authentication**

   * Login is currently based on prototype/demo users.
   * It is not production-ready authentication.

2. **OCR Frontend Flow Not Fully Polished**

   * The backend supports OCR infrastructure and optional PaddleOCR integration.
   * The Milestone 2 frontend mainly focuses on manual receipt entry.
   * OCR upload should be treated as backend-supported/prototype-supported rather than a polished user-facing feature.

3. **No Cloud Deployment Yet**

   * The project currently runs locally.
   * Cloud deployment is planned for a later stage.

4. **No Payment Provider Integration**

   * The app tracks payment status.
   * It does not process real payments through PayNow, Stripe, bank transfer APIs, or other payment providers.

5. **No Offline Mode**

   * The application currently assumes an active backend connection.

6. **Mobile-First Prototype UI**

   * The interface is designed as a mobile-first prototype.
   * More UI polish and usability testing are planned.

7. **Limited Real-World Receipt Testing**

   * The parser has automated test coverage for several cases.
   * More testing with real receipt formats is needed.

8. **More Edge Cases Needed for Milestone 3**

   * Future work should include more edge-case testing for rounding, partial settlement, deleted members, edited receipts, and recalculation behavior.

---

## 26. Milestone 3 Plan

For Milestone 3, we plan to improve the prototype in the following areas.

### 1. Improve OCR User Flow

* Build a clearer frontend OCR upload flow.
* Connect uploaded receipt images to parsed item suggestions.
* Allow users to review and correct OCR-parsed items before saving.
* Test with more real receipt formats.

### 2. Improve UI and User Experience

* Refine mobile-first page layout.
* Improve navigation between group, expense, receipt, assignment, and debt pages.
* Add clearer loading, empty, and error states.
* Improve visual feedback for validation and settlement status.

### 3. Strengthen Authentication and Authorization

* Replace prototype login with a more realistic authentication flow if time permits.
* Continue strengthening group-level and debt-level permission checks.
* Add more tests for unauthorized access.

### 4. Expand Testing

* Add more frontend tests for page workflows.
* Add more backend tests for edge cases.
* Add tests for tax/service-charge allocation and rounding behavior.
* Expand smoke testing for full user journeys.

### 5. Prepare Deployment

* Prepare deployment configuration.
* Set up environment variables for production-like settings.
* Deploy frontend and backend if feasible within the Milestone 3 timeline.

### 6. Improve Settlement Features

* Improve debt visualization.
* Add clearer settlement history.
* Improve recalculation behavior after receipt or item changes.
* Consider export features such as CSV or PDF if time permits.

---

## 27. Project Log Summary

The project log is maintained separately in the required Orbital format. A condensed summary is included here for README context.

| Stage                   | Focus                                   | Summary                                                                                                                                                   |
| ----------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Milestone 1 Planning    | Problem definition and feature planning | Defined target users, problem motivation, core user stories, proposed workflow, and initial technical direction.                                          |
| Early Prototype Setup   | Frontend and backend foundation         | Set up React/Vite frontend, FastAPI backend, routing, API communication, and database-backed backend structure.                                           |
| UI/UX Prototyping       | Mobile-first workflow                   | Designed mobile-first screens for dashboard, group management, receipt workflows, item assignment, and debts.                                             |
| Backend Development     | Core API implementation                 | Implemented users, groups, memberships, expenses, receipts, items, item shares, debts, OCR abstraction, parser, and settlement endpoints.                 |
| Frontend Development    | End-to-end prototype flow               | Implemented prototype login, protected routes, dashboard, group workflows, expense and receipt workflows, item assignment, split preview, and debts page. |
| Testing and Validation  | Automated and manual testing            | Added frontend unit tests, backend integration tests, OCR tests, parser tests, and workflow smoke-test script.                                            |
| Milestone 2 Preparation | Documentation and evidence              | Prepared README, screenshots/evidence placeholders, testing evidence, and summary of limitations and Milestone 3 plan.                                    |

---

## 28. Screenshots and Evidence Placeholders

Screenshots should be added under `docs/images/` before final submission.

| Evidence | Suggested File | Purpose |
| --- | --- | --- |
| Login page | `docs/images/login.png` | Shows prototype demo login. |
| Group detail workflow | `docs/images/group-detail.png` | Shows member list, expenses, and add member control. |
| Receipt item assignment | `docs/images/item-assignment.png` | Shows receipt items, assignment, split preview, and validation feedback. |
| Debts page | `docs/images/debts.png` | Shows group selector, settlement list, mark-paid, and confirm-received actions. |
| Swagger API documentation | `docs/images/swagger.png` | Shows backend API endpoints. |
| Test results | `docs/images/test-results.png` | Shows frontend and backend test commands passing. |

## 29. Current Milestone 2 Prototype Flow

The current prototype supports the main intended workflow:

```text
1. User logs in with prototype demo account.
2. User creates or selects a group.
3. Group owner adds members.
4. User creates an expense.
5. User creates a manual receipt.
6. User adds receipt items manually.
7. User assigns items to selected group members.
8. User checks receipt total validation feedback.
9. User calculates settlement.
10. Debtor marks debt as paid.
11. Receiver confirms payment as received.
```

This completes the core Milestone 2 prototype goal of demonstrating item-level splitting and settlement tracking.

---

## 30. Conclusion

For Milestone 2, O(n) Debtor has progressed from a planned shared-expense idea into a working mobile-first prototype with both frontend and backend implementation.

The prototype demonstrates the core value of the project: splitting real group expenses by receipt items, assigning those items to the correct members, calculating debts, and tracking whether debts have been paid and confirmed.

The current version is still a prototype. Authentication, OCR user experience, deployment, payment integration, UI polish, and wider edge-case handling remain future work. For Milestone 3, the main focus will be improving reliability, usability, OCR flow, testing coverage, and deployment readiness.
