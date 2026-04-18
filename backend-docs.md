# Document Tracking System - Backend API Docs

This document lists all currently exposed backend endpoints and the exact parameters your frontend needs to send.

## 1) Base API Info

- Base URL: `http://localhost:5000`
- API Prefixes:
	- Auth: `/api/auth`
	- Documents: `/api/documents`
- Auth Type: Bearer JWT
- Default protected header:

```http
Authorization: Bearer <token>
```

## 2) Common Enums and IDs

- User roles: `employee`, `manager`, `admin`
- Document status: `Submitted`, `Under Review`, `Approved`, `Rejected`
- `id`, `docId`, `assignedTo`: MongoDB ObjectId strings

## 3) Authentication Endpoints

### POST /api/auth/register

Create a new user.

- Auth required: No
- Content-Type: `application/json`

Request body:

| Field | Type | Required | Notes |
|---|---|---|---|
| name | string | Yes | Required by User schema |
| email | string | Yes | Required, unique |
| password | string | Yes | Required; hashed before save |
| role | string | No | One of `employee`, `manager`, `admin`; defaults to `employee` |
| department | string | No | Defaults to empty string |

Example body:

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "secret123",
	"role": "employee",
	"department": "HR"
}
```

Success response: `201 Created`

```json
{
	"_id": "...",
	"name": "John Doe",
	"email": "john@example.com",
	"role": "employee",
	"department": "HR",
	"token": "<jwt>"
}
```

Common errors:

- `400`: `{"message":"User already exists"}`
- `500`: Server error message

---

### POST /api/auth/login

Log in an existing user.

- Auth required: No
- Content-Type: `application/json`

Request body:

| Field | Type | Required |
|---|---|---|
| email | string | Yes |
| password | string | Yes |

Example body:

```json
{
	"email": "john@example.com",
	"password": "secret123"
}
```

Success response: `200 OK`

```json
{
	"_id": "...",
	"name": "John Doe",
	"email": "john@example.com",
	"role": "employee",
	"department": "HR",
	"token": "<jwt>"
}
```

Common errors:

- `401`: `{"message":"Invalid credentials"}`
- `500`: Server error message

---

### GET /api/auth/profile

Get currently logged-in user profile.

- Auth required: Yes
- Headers: `Authorization: Bearer <token>`
- Request body: None
- Query params: None

Success response: `200 OK`

```json
{
	"_id": "...",
	"name": "John Doe",
	"email": "john@example.com",
	"role": "employee",
	"department": "HR",
	"createdAt": "...",
	"updatedAt": "..."
}
```

Common errors:

- `401`: Missing/invalid token

---

### GET /api/auth/users

Get all users (admin only).

- Auth required: Yes
- Headers: `Authorization: Bearer <token>`
- Role: `admin` only
- Request body: None
- Query params: None

Success response: `200 OK` (array of users without password)

Common errors:

- `401`: Missing/invalid token
- `403`: `{"message":"Access denied: admin only"}`

## 4) Document Endpoints

All endpoints below require:

- Header: `Authorization: Bearer <token>`

### POST /api/documents

Create/upload a new document.

- Auth required: Yes
- Content-Type: `multipart/form-data`

Form-data fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| file | file | Yes | Must use key name `file`; max size 5MB |
| title | string | Yes | Required |
| description | string | No | Defaults to empty |
| department | string | No | Defaults to empty |

Allowed file types:

- pdf, doc, docx, png, jpg, jpeg

Success response: `201 Created` (Document object)

Common errors:

- `400`: `{"message":"Title is required"}`
- `400`: `{"message":"File is required"}`
- `400`: `{"message":"Only pdf, doc, docx, png, jpg, jpeg files are allowed"}`
- `400`: `{"message":"File size exceeds 5MB"}`

---

### GET /api/documents

Get documents list.

- Auth required: Yes
- Request body: None
- Query params: None

Behavior by role:

- `employee`: only documents uploaded by current user
- `manager` / `admin`: all documents

Success response: `200 OK` (array)

Each item includes document fields + nested `workflow` object:

```json
{
	"_id": "...",
	"title": "Policy File",
	"description": "...",
	"fileUrl": "/uploads/1700000000000-file.pdf",
	"uploadedBy": {
		"_id": "...",
		"name": "John Doe",
		"email": "john@example.com",
		"role": "employee",
		"department": "HR"
	},
	"department": "HR",
	"status": "Submitted",
	"remarks": "",
	"workflow": {
		"_id": "...",
		"documentId": "...",
		"currentStage": "Submitted",
		"assignedTo": null
	}
}
```

---

### GET /api/documents/:id

Get one document by document ID.

- Auth required: Yes
- Path params:

| Param | Required | Notes |
|---|---|---|
| id | Yes | Document ID |

Access rule:

- `employee` can only access their own uploaded document

Success response: `200 OK` (single document object + `workflow`)

Common errors:

- `403`: Access denied
- `404`: `{"message":"Document not found"}`

---

### GET /api/documents/:docId/logs

Get audit logs for a document.

- Auth required: Yes
- Path params:

| Param | Required | Notes |
|---|---|---|
| docId | Yes | Document ID |

Access rule:

- `employee` can only view logs for own uploaded document

Success response: `200 OK` (array sorted latest first)

Log item shape:

```json
{
	"_id": "...",
	"documentId": "...",
	"updatedBy": {
		"_id": "...",
		"name": "Manager Name",
		"email": "manager@example.com",
		"role": "manager",
		"department": "Operations"
	},
	"action": "Status updated to Approved",
	"timestamp": "2026-01-01T10:00:00.000Z"
}
```

Common errors:

- `403`: Access denied
- `404`: `{"message":"Document not found"}`

---

### PUT /api/documents/:id

Update document status/remarks/workflow assignment.

- Auth required: Yes
- Role required: `manager` or `admin`
- Content-Type: `application/json`
- Path params:

| Param | Required | Notes |
|---|---|---|
| id | Yes | Document ID |

Request body (all optional; send only what you want to update):

| Field | Type | Required | Notes |
|---|---|---|---|
| status | string | No | One of `Submitted`, `Under Review`, `Approved`, `Rejected` |
| remarks | string | No | Use empty string to clear remarks |
| assignedTo | string/null | No | User ID to assign reviewer; send `null` or `""` to unassign |

Example body:

```json
{
	"status": "Under Review",
	"remarks": "Needs manager approval",
	"assignedTo": "6637fce0f3a2b6910f2c1111"
}
```

Success response: `200 OK` (updated document object + `workflow`)

Common errors:

- `403`: `{"message":"Access denied: manager or admin only"}`
- `404`: `{"message":"Document not found"}`

---

### DELETE /api/documents/:id

Delete a document.

- Auth required: Yes
- Path params:

| Param | Required | Notes |
|---|---|---|
| id | Yes | Document ID |

Access rule:

- Allowed for uploader (owner) or `admin`

Success response: `200 OK`

```json
{
	"message": "Document deleted successfully"
}
```

Common errors:

- `403`: Access denied
- `404`: `{"message":"Document not found"}`

## 5) Utility/Public Endpoints

### GET /

Health check endpoint.

- Auth required: No
- Response: `200 OK`

```json
{
	"message": "Document Tracking API is running"
}
```

---

### GET /uploads/:filename

Serves uploaded files publicly via static route.

- Auth required: No
- Use `fileUrl` from document response to build full URL:
	- `http://localhost:5000` + `fileUrl`
	- Example: `http://localhost:5000/uploads/1700000000000-file.pdf`

## 6) Frontend Integration Checklist

1. Store JWT token from login/register response.
2. Send `Authorization: Bearer <token>` for all `/api/documents/*`, `/api/auth/profile`, `/api/auth/users`.
3. For upload API, use `FormData` and key name `file`.
4. Use `fileUrl` to render links/previews (prefix backend base URL).
5. Handle role-based UI:
	 - `employee`: read own docs, cannot update status.
	 - `manager`/`admin`: can update status.
	 - `admin`: can fetch all users.
6. Handle backend error messages from `message` field in JSON responses.

## 7) Notes

- The codebase has `workflowController.js` and `logController.js`, but no routes are currently registered for those controllers in `server.js`.
- So the endpoint list above reflects all active/exposed endpoints in the running backend.
