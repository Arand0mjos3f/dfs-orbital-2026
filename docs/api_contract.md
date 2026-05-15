# DFS API Contract Draft

## Purpose

This document defines the initial API contract between the frontend and backend of the DFS project.

The goal is to make sure both sides use consistent end point names, request formats, response formats, and status codes.

This is a draft for the first version of API Contract and will be updated as the project develops.

---

## Base URL

All API endpoints are prefixed with:

```text
/api/v1
```

Example:

```text
GET /api/v1/health
POST /api/v1/groups
POST /api/v1/expenses/{expense_id}/receipts
```

---

## General Rules

- Use JSON for request and response bodies.
- Use `snake_case` for field names.
- Use IDs such as `user_id`, `group_id`, `expense_id`, `receipt_id`, and `item_id` instead of user-facing names.
- User-facing names such as `username`, `group_name`, and `item_name` are mainly for display.
- Money-related fields should use decimal values rounded to two decimal places.
- Time fields should use ISO 8601 datetime strings.
- API responses should return enough information for the frontend to update the UI without immediately making another request.
- Each receipt has exactly one payer. If multiple people paid separately, they should be represented as multiple receipts under the same expense.

---

## Common Response Format

### Success Respons


```json
{
  "success": true,
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

---

## Common Status Codes

| Status Code | Meaning |
|---|---|
| `200 OK` | Request succeeded |
| `201 Created` | Resource created successfully |
| `400 Bad Request` | Request data is logically invalid |
| `401 Unauthorized` | User is not authenticated |
| `403 Forbidden` | User does not have permission |
| `404 Not Found` | Requested resource does not exist |
| `422 Validation Error` | Request format is invalid |
| `500 Internal Server Error` | Unexpected backend error |

---

## Endpoint Overview

### Health

- `GET /api/v1/health`

### Auth / Users

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`

### Groups

- `POST /api/v1/groups`
- `GET /api/v1/groups`
- `GET /api/v1/groups/{group_id}`
- `POST /api/v1/groups/{group_id}/members`
- `GET /api/v1/groups/{group_id}/members`

### Expenses

- `POST /api/v1/groups/{group_id}/expenses`
- `GET /api/v1/groups/{group_id}/expenses`
- `GET /api/v1/expenses/{expense_id}`
- `PATCH /api/v1/expenses/{expense_id}`

### Receipts

- `POST /api/v1/expenses/{expense_id}/receipts`
- `GET /api/v1/expenses/{expense_id}/receipts`
- `GET /api/v1/receipts/{receipt_id}`
- `PATCH /api/v1/receipts/{receipt_id}`

### Items

- `POST /api/v1/receipts/{receipt_id}/items`
- `GET /api/v1/receipts/{receipt_id}/items`
- `PATCH /api/v1/items/{item_id}`
- `DELETE /api/v1/items/{item_id}`

### Item Shares

- `POST /api/v1/items/{item_id}/shares`
- `GET /api/v1/items/{item_id}/shares`
- `PATCH /api/v1/item-shares/{item_share_id}`
- `DELETE /api/v1/item-shares/{item_share_id}`

### Debts

- `POST /api/v1/expenses/{expense_id}/debts/calculate`
- `GET /api/v1/groups/{group_id}/debts`
- `PATCH /api/v1/debts/{debt_id}/mark-paid`
- `PATCH /api/v1/debts/{debt_id}/confirm-received`

---

## Data Rules

### Money Fields

Money-related fields should be stored and returned as decimal values with two decimal places.

Examples:

```json
{
  "subtotal_amount": 24.00,
  "tax_amount": 2.16,
  "service_charge_amount": 2.40,
  "total_amount": 28.56
}
```

### Receipt Payer Rule

Each receipt must have exactly one `payer_id`.

If multiple users paid separately in the same expense session, the frontend should create multiple receipts under the same `expense_id`.

Example:

```text
Expense: Friday Hotpot

Receipt 1:
payer_id = Alice

Receipt 2:
payer_id = Bob
```

### Item Share Rule

Each item can be split among multiple users.

The final user-level payment amount should include:

- item price portion
- tax portion
- service charge portion
- final total amount

Expected fields:

```text
item_share_amount
tax_share_amount
service_charge_share_amount
total_share_amount
```

### Debt Status Rule

Debt status should support the following values:

```text
pending
marked_paid
confirmed_received
cancelled
```

Meaning:

| Status | Meaning |
|---|---|
| `pending` | The payer has not marked the debt as paid |
| `marked_paid` | The payer claims that payment has been made |
| `confirmed_received` | The receiver confirms that payment has been received |
| `cancelled` | The debt record is cancelled |

---

## Detailed API Drafts

The following detailed request and response formats will be added after the endpoint overview is agreed by both frontend and backend developers.

Priority for the next step:

1. Receipts APIs
2. Items APIs
3. Item Shares APIs
4. Expenses APIs
5. Debts APIs
6. Groups and Users APIs

## 1. Expenses APIs

### 1.1 Create Expense

`POST /api/v1/groups/{group_id}/expenses`

#### Purpose

Create a new expense session inside a group.

An expense represents one bill-splitting session, such as `Friday Hotpot`. One expense can contain multiple receipts.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group that this expense belongs to |

#### Request Body

```json
{
  "title": "Friday Hotpot",
  "description": "Dinner after class",
  "created_by_id": "user_001"
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "expense_001",
    "group_id": "group_001",
    "title": "Friday Hotpot",
    "description": "Dinner after class",
    "status": "draft",
    "created_by_id": "user_001",
    "created_at": "2026-05-14T20:00:00+08:00",
    "updated_at": "2026-05-14T20:00:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_EXPENSE_DATA` | Missing or invalid expense data |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |

#### Notes

- New expenses should start with `status = draft`.
- The frontend should use `group_id`, not group name, when creating an expense.

---

### 1.2 Get Expenses in Group

`GET /api/v1/groups/{group_id}/expenses`

#### Purpose

Get all expenses under a group.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "expense_001",
      "group_id": "group_001",
      "title": "Friday Hotpot",
      "description": "Dinner after class",
      "status": "draft",
      "created_by_id": "user_001",
      "created_at": "2026-05-14T20:00:00+08:00",
      "updated_at": "2026-05-14T20:00:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |

---

### 1.3 Get Expense Detail

`GET /api/v1/expenses/{expense_id}`

#### Purpose

Get detailed information for one expense.

This response can include receipts, items, and item shares so that the frontend can display the full bill-splitting session.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string | Yes | ID of the expense |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "expense_001",
    "group_id": "group_001",
    "title": "Friday Hotpot",
    "description": "Dinner after class",
    "status": "draft",
    "created_by_id": "user_001",
    "receipts": [],
    "created_at": "2026-05-14T20:00:00+08:00",
    "updated_at": "2026-05-14T20:00:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `EXPENSE_NOT_FOUND` | The expense does not exist |

---

### 1.4 Update Expense

`PATCH /api/v1/expenses/{expense_id}`

#### Purpose

Update basic information of an expense.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string | Yes | ID of the expense |

#### Request Body

```json
{
  "title": "Friday Hotpot Updated",
  "description": "Dinner after CS meeting",
  "status": "confirmed"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "expense_001",
    "group_id": "group_001",
    "title": "Friday Hotpot Updated",
    "description": "Dinner after CS meeting",
    "status": "confirmed",
    "created_by_id": "user_001",
    "created_at": "2026-05-14T20:00:00+08:00",
    "updated_at": "2026-05-14T20:20:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_EXPENSE_STATUS` | The provided status is invalid |
| `404 Not Found` | `EXPENSE_NOT_FOUND` | The expense does not exist |

---

## 2. Receipts APIs

### 2.1 Create Manual Receipt

`POST /api/v1/expenses/{expense_id}/receipts`

#### Purpose

Create a manual receipt under an expense.

In Milestone 1, receipts can be manually entered without OCR. In Milestone 2, this endpoint can be extended or paired with an upload endpoint for OCR-based receipt creation.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string | Yes | ID of the expense that this receipt belongs to |

#### Request Body

```json
{
  "payer_id": "user_001",
  "subtotal_amount": 24.00,
  "tax_amount": 2.16,
  "service_charge_amount": 2.40,
  "total_amount": 28.56
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "receipt_001",
    "expense_id": "expense_001",
    "payer_id": "user_001",
    "image_url": null,
    "raw_ocr_text": null,
    "subtotal_amount": 24.00,
    "tax_amount": 2.16,
    "service_charge_amount": 2.40,
    "total_amount": 28.56,
    "source_type": "manual",
    "status": "draft",
    "uploaded_at": "2026-05-14T20:05:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_RECEIPT_TOTAL` | `subtotal_amount + tax_amount + service_charge_amount` does not match `total_amount` |
| `404 Not Found` | `EXPENSE_NOT_FOUND` | The expense does not exist |
| `404 Not Found` | `PAYER_NOT_FOUND` | The payer does not exist |

#### Notes

- Each receipt must have exactly one `payer_id`.
- If multiple users paid separately, the frontend should create multiple receipts under the same expense.
- For manual receipts, `source_type` should be `manual`.

---

### 2.2 Get Receipts in Expense

`GET /api/v1/expenses/{expense_id}/receipts`

#### Purpose

Get all receipts under one expense.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `expense_id` | string | Yes | ID of the expense |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "receipt_001",
      "expense_id": "expense_001",
      "payer_id": "user_001",
      "subtotal_amount": 24.00,
      "tax_amount": 2.16,
      "service_charge_amount": 2.40,
      "total_amount": 28.56,
      "source_type": "manual",
      "status": "draft",
      "uploaded_at": "2026-05-14T20:05:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `EXPENSE_NOT_FOUND` | The expense does not exist |

---

### 2.3 Get Receipt Detail

`GET /api/v1/receipts/{receipt_id}`

#### Purpose

Get detailed information for one receipt, including its items.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `receipt_id` | string | Yes | ID of the receipt |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "receipt_001",
    "expense_id": "expense_001",
    "payer_id": "user_001",
    "image_url": null,
    "raw_ocr_text": null,
    "subtotal_amount": 24.00,
    "tax_amount": 2.16,
    "service_charge_amount": 2.40,
    "total_amount": 28.56,
    "source_type": "manual",
    "status": "draft",
    "items": [],
    "uploaded_at": "2026-05-14T20:05:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `RECEIPT_NOT_FOUND` | The receipt does not exist |

---

### 2.4 Update Receipt

`PATCH /api/v1/receipts/{receipt_id}`

#### Purpose

Update receipt-level amounts or status.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `receipt_id` | string | Yes | ID of the receipt |

#### Request Body

```json
{
  "subtotal_amount": 25.00,
  "tax_amount": 2.25,
  "service_charge_amount": 2.50,
  "total_amount": 29.75,
  "status": "confirmed"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "receipt_001",
    "expense_id": "expense_001",
    "payer_id": "user_001",
    "subtotal_amount": 25.00,
    "tax_amount": 2.25,
    "service_charge_amount": 2.50,
    "total_amount": 29.75,
    "source_type": "manual",
    "status": "confirmed",
    "uploaded_at": "2026-05-14T20:05:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_RECEIPT_TOTAL` | Receipt amounts do not add up correctly |
| `400 Bad Request` | `INVALID_RECEIPT_STATUS` | The provided status is invalid |
| `404 Not Found` | `RECEIPT_NOT_FOUND` | The receipt does not exist |

---

## 3. Items APIs

### 3.1 Create Item

`POST /api/v1/receipts/{receipt_id}/items`

#### Purpose

Create an item under a receipt.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `receipt_id` | string | Yes | ID of the receipt that this item belongs to |

#### Request Body

```json
{
  "name": "Pizza",
  "quantity": 1,
  "unit_price": 24.00,
  "total_price": 24.00
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "item_001",
    "receipt_id": "receipt_001",
    "name": "Pizza",
    "quantity": 1,
    "unit_price": 24.00,
    "total_price": 24.00,
    "original_name": null,
    "original_unit_price": null,
    "original_total_price": null,
    "is_manually_edited": false,
    "created_at": "2026-05-14T20:10:00+08:00",
    "updated_at": "2026-05-14T20:10:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_ITEM_DATA` | Missing or invalid item data |
| `404 Not Found` | `RECEIPT_NOT_FOUND` | The receipt does not exist |

#### Notes

- `total_price` represents the item price before tax and service charge.
- For manually created items, original OCR fields can be `null`.

---

### 3.2 Get Items in Receipt

`GET /api/v1/receipts/{receipt_id}/items`

#### Purpose

Get all items under a receipt.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `receipt_id` | string | Yes | ID of the receipt |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "item_001",
      "receipt_id": "receipt_001",
      "name": "Pizza",
      "quantity": 1,
      "unit_price": 24.00,
      "total_price": 24.00,
      "original_name": null,
      "original_unit_price": null,
      "original_total_price": null,
      "is_manually_edited": false,
      "created_at": "2026-05-14T20:10:00+08:00",
      "updated_at": "2026-05-14T20:10:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `RECEIPT_NOT_FOUND` | The receipt does not exist |

---

### 3.3 Update Item

`PATCH /api/v1/items/{item_id}`

#### Purpose

Update item information after user review or manual correction.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_id` | string | Yes | ID of the item |

#### Request Body

```json
{
  "name": "Chicken Rice",
  "quantity": 1,
  "unit_price": 5.50,
  "total_price": 5.50
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "item_001",
    "receipt_id": "receipt_001",
    "name": "Chicken Rice",
    "quantity": 1,
    "unit_price": 5.50,
    "total_price": 5.50,
    "original_name": "Chcken Rce",
    "original_unit_price": 5.80,
    "original_total_price": 5.80,
    "is_manually_edited": true,
    "created_at": "2026-05-14T20:10:00+08:00",
    "updated_at": "2026-05-14T20:15:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_ITEM_DATA` | Missing or invalid item data |
| `404 Not Found` | `ITEM_NOT_FOUND` | The item does not exist |

#### Notes

- If a user changes OCR-detected item information, `is_manually_edited` should become `true`.
- The original OCR fields should not be overwritten by manual correction.

---

### 3.4 Delete Item

`DELETE /api/v1/items/{item_id}`

#### Purpose

Delete an item from a receipt.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_id` | string | Yes | ID of the item |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "deleted_item_id": "item_001"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `ITEM_NOT_FOUND` | The item does not exist |

---

## 4. Item Shares APIs

### 4.1 Create Item Shares

`POST /api/v1/items/{item_id}/shares`

#### Purpose

Assign an item to one or more users and store each user's share.

This endpoint supports equal and unequal item splitting. It also stores each user's allocated tax and service charge.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_id` | string | Yes | ID of the item being split |

#### Request Body

```json
{
  "shares": [
    {
      "user_id": "user_001",
      "item_share_amount": 12.00,
      "tax_share_amount": 1.08,
      "service_charge_share_amount": 1.20,
      "total_share_amount": 14.28
    },
    {
      "user_id": "user_002",
      "item_share_amount": 12.00,
      "tax_share_amount": 1.08,
      "service_charge_share_amount": 1.20,
      "total_share_amount": 14.28
    }
  ]
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": [
    {
      "id": "item_share_001",
      "item_id": "item_001",
      "user_id": "user_001",
      "item_share_amount": 12.00,
      "tax_share_amount": 1.08,
      "service_charge_share_amount": 1.20,
      "total_share_amount": 14.28,
      "created_at": "2026-05-14T20:20:00+08:00"
    },
    {
      "id": "item_share_002",
      "item_id": "item_001",
      "user_id": "user_002",
      "item_share_amount": 12.00,
      "tax_share_amount": 1.08,
      "service_charge_share_amount": 1.20,
      "total_share_amount": 14.28,
      "created_at": "2026-05-14T20:20:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_SHARE_DATA` | Share amounts are missing or invalid |
| `400 Bad Request` | `SHARE_TOTAL_MISMATCH` | Share amounts do not match the item or receipt allocation |
| `404 Not Found` | `ITEM_NOT_FOUND` | The item does not exist |
| `404 Not Found` | `USER_NOT_FOUND` | One or more users do not exist |

#### Notes

- `item_share_amount` is the item price portion before tax and service charge.
- `tax_share_amount` is the tax portion assigned to the user.
- `service_charge_share_amount` is the service charge portion assigned to the user.
- `total_share_amount` is the final amount this user should pay for this item.
- The backend should validate that each share belongs to a user in the same group.

---

### 4.2 Get Item Shares

`GET /api/v1/items/{item_id}/shares`

#### Purpose

Get all user shares for one item.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_id` | string | Yes | ID of the item |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "item_share_001",
      "item_id": "item_001",
      "user_id": "user_001",
      "item_share_amount": 12.00,
      "tax_share_amount": 1.08,
      "service_charge_share_amount": 1.20,
      "total_share_amount": 14.28,
      "created_at": "2026-05-14T20:20:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `ITEM_NOT_FOUND` | The item does not exist |

---

### 4.3 Update Item Share

`PATCH /api/v1/item-shares/{item_share_id}`

#### Purpose

Update one user's share for an item.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_share_id` | string | Yes | ID of the item share record |

#### Request Body

```json
{
  "item_share_amount": 10.00,
  "tax_share_amount": 0.90,
  "service_charge_share_amount": 1.00,
  "total_share_amount": 11.90
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "item_share_001",
    "item_id": "item_001",
    "user_id": "user_001",
    "item_share_amount": 10.00,
    "tax_share_amount": 0.90,
    "service_charge_share_amount": 1.00,
    "total_share_amount": 11.90,
    "created_at": "2026-05-14T20:20:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_SHARE_DATA` | Share amounts are missing or invalid |
| `404 Not Found` | `ITEM_SHARE_NOT_FOUND` | The item share record does not exist |

---

### 4.4 Delete Item Share

`DELETE /api/v1/item-shares/{item_share_id}`

#### Purpose

Remove one user's share from an item.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `item_share_id` | string | Yes | ID of the item share record |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "deleted_item_share_id": "item_share_001"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `404 Not Found` | `ITEM_SHARE_NOT_FOUND` | The item share record does not exist |

## 5. Users APIs

### 5.1 Register User

`POST /api/v1/auth/register`

#### Purpose

Register a new user account.

#### Request Body

```json
{
  "username": "alice_tan",
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "username": "alice_tan",
    "email": "alice@example.com",
    "avatar_url": null,
    "created_at": "2026-05-14T19:00:00+08:00",
    "updated_at": "2026-05-14T19:00:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_USER_DATA` | Missing or invalid registration data |
| `422 Validation Error` | `EMAIL_ALREADY_EXISTS` | The email is already registered |
| `422 Validation Error` | `INVALID_EMAIL_FORMAT` | The email format is invalid |
| `422 Validation Error` | `WEAK_PASSWORD` | The password does not meet security requirements |

#### Notes

- The password should be hashed before storing in the database.
- The `password_hash` field should never be returned in any API response.
- `users.email` should be unique.

---

### 5.2 Login User

`POST /api/v1/auth/login`

#### Purpose

Authenticate a user and return an access token.

#### Request Body

```json
{
  "email": "alice@example.com",
  "password": "securePassword123"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "user_001",
      "username": "alice_tan",
      "email": "alice@example.com",
      "avatar_url": null
    }
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_CREDENTIALS` | Email or password is incorrect |
| `422 Validation Error` | `MISSING_LOGIN_DATA` | Email or password is missing |

#### Notes

- The access token should be used for authenticating subsequent API requests.
- The frontend should store the token securely and include it in the `Authorization` header.

---

### 5.3 Get Current User Profile

`GET /api/v1/users/me`

#### Purpose

Get the profile of the currently authenticated user.

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "username": "alice_tan",
    "email": "alice@example.com",
    "avatar_url": null,
    "created_at": "2026-05-14T19:00:00+08:00",
    "updated_at": "2026-05-14T19:00:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `401 Unauthorized` | `MISSING_TOKEN` | The access token is missing |

---

### 5.4 Update User Profile

`PATCH /api/v1/users/me`

#### Purpose

Update the current user's profile information.

#### Request Body

```json
{
  "username": "alice_updated",
  "avatar_url": "https://example.com/avatars/alice.jpg"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "user_001",
    "username": "alice_updated",
    "email": "alice@example.com",
    "avatar_url": "https://example.com/avatars/alice.jpg",
    "created_at": "2026-05-14T19:00:00+08:00",
    "updated_at": "2026-05-14T19:30:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_USER_DATA` | Invalid profile data |
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `422 Validation Error` | `USERNAME_TAKEN` | The username is already in use |

#### Notes

- The email field should not be updated through this endpoint.
- Password updates should use a separate endpoint with proper verification.

---

## 6. Groups APIs

### 6.1 Create Group

`POST /api/v1/groups`

#### Purpose

Create a new expense-sharing group.

#### Request Body

```json
{
  "name": "NUS Dinner",
  "description": "Weekly dinner group",
  "created_by_id": "user_001"
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "group_001",
    "name": "NUS Dinner",
    "description": "Weekly dinner group",
    "created_by_id": "user_001",
    "created_at": "2026-05-14T19:45:00+08:00",
    "updated_at": "2026-05-14T19:45:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_GROUP_DATA` | Missing or invalid group data |
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `404 Not Found` | `USER_NOT_FOUND` | The creator user does not exist |

#### Notes

- The creator should automatically be added as a group member with `role = owner`.
- The frontend should use the authenticated user's ID for `created_by_id`.

---

### 6.2 Get All Groups for Current User

`GET /api/v1/groups`

#### Purpose

Get all groups that the current user is a member of.

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "group_001",
      "name": "NUS Dinner",
      "description": "Weekly dinner group",
      "created_by_id": "user_001",
      "member_count": 3,
      "user_role": "owner",
      "created_at": "2026-05-14T19:45:00+08:00",
      "updated_at": "2026-05-14T19:45:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |

#### Notes

- The response includes `member_count` and `user_role` for frontend display convenience.
- Groups are filtered by the authenticated user's membership.

---

### 6.3 Get Group Detail

`GET /api/v1/groups/{group_id}`

#### Purpose

Get detailed information for one group.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "group_001",
    "name": "NUS Dinner",
    "description": "Weekly dinner group",
    "created_by_id": "user_001",
    "created_at": "2026-05-14T19:45:00+08:00",
    "updated_at": "2026-05-14T19:45:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `403 Forbidden` | `NOT_GROUP_MEMBER` | The user is not a member of this group |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |

---

### 6.4 Update Group

`PATCH /api/v1/groups/{group_id}`

#### Purpose

Update group information.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |

#### Request Body

```json
{
  "name": "NUS Dinner Updated",
  "description": "Weekly dinner group for CS students"
}
```

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "group_001",
    "name": "NUS Dinner Updated",
    "description": "Weekly dinner group for CS students",
    "created_by_id": "user_001",
    "created_at": "2026-05-14T19:45:00+08:00",
    "updated_at": "2026-05-14T20:00:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_GROUP_DATA` | Invalid group data |
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `403 Forbidden` | `INSUFFICIENT_PERMISSION` | Only group owners can update group information |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |

---

### 6.5 Add Member to Group

`POST /api/v1/groups/{group_id}/members`

#### Purpose

Add a user to a group.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |

#### Request Body

```json
{
  "user_id": "user_002",
  "role": "member"
}
```

#### Success Response

Status: `201 Created`

```json
{
  "success": true,
  "data": {
    "id": "member_001",
    "group_id": "group_001",
    "user_id": "user_002",
    "role": "member",
    "joined_at": "2026-05-14T20:10:00+08:00"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `400 Bad Request` | `INVALID_MEMBER_DATA` | Missing or invalid member data |
| `400 Bad Request` | `INVALID_ROLE` | The role value is not valid |
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `403 Forbidden` | `INSUFFICIENT_PERMISSION` | Only group owners can add members |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |
| `404 Not Found` | `USER_NOT_FOUND` | The user does not exist |
| `422 Validation Error` | `DUPLICATE_MEMBERSHIP` | The user is already a member of this group |

#### Notes

- Valid role values should be `owner` or `member`.
- The backend should prevent duplicate membership records for the same user in the same group.

---

### 6.6 Get Group Members

`GET /api/v1/groups/{group_id}/members`

#### Purpose

Get all members of a group.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": [
    {
      "id": "member_001",
      "group_id": "group_001",
      "user_id": "user_001",
      "username": "alice_tan",
      "avatar_url": null,
      "role": "owner",
      "joined_at": "2026-05-14T19:45:00+08:00"
    },
    {
      "id": "member_002",
      "group_id": "group_001",
      "user_id": "user_002",
      "username": "bob_lim",
      "avatar_url": null,
      "role": "member",
      "joined_at": "2026-05-14T20:10:00+08:00"
    }
  ]
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `403 Forbidden` | `NOT_GROUP_MEMBER` | The user is not a member of this group |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |

#### Notes

- The response includes user information such as `username` and `avatar_url` for frontend display convenience.
- This avoids the need for the frontend to make separate user profile requests.

---

### 6.7 Remove Member from Group

`DELETE /api/v1/groups/{group_id}/members/{user_id}`

#### Purpose

Remove a user from a group.

#### Path Parameters

| Name | Type | Required | Description |
|---|---|---|---|
| `group_id` | string | Yes | ID of the group |
| `user_id` | string | Yes | ID of the user to remove |

#### Success Response

Status: `200 OK`

```json
{
  "success": true,
  "data": {
    "removed_user_id": "user_002",
    "group_id": "group_001"
  }
}
```

#### Error Cases

| Status Code | Error Code | Meaning |
|---|---|---|
| `401 Unauthorized` | `INVALID_TOKEN` | The access token is invalid or expired |
| `403 Forbidden` | `INSUFFICIENT_PERMISSION` | Only group owners can remove members |
| `403 Forbidden` | `CANNOT_REMOVE_OWNER` | The group owner cannot be removed |
| `404 Not Found` | `GROUP_NOT_FOUND` | The group does not exist |
| `404 Not Found` | `MEMBER_NOT_FOUND` | The user is not a member of this group |

#### Notes

- Group owners cannot be removed from the group.
- Members can leave the group by removing themselves.
