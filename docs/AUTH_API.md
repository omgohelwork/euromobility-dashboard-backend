# Admin Auth API – Payload & Response (for Frontend)

Single admin: created at **seed** with **username:** `admin`, **password:** `Admin@123`.  
After login, the admin can change the password via the change-password endpoint.

---

## 1. Login

**Endpoint:** `POST /api/auth/login`

**Headers:**  
`Content-Type: application/json`

**Request body (payload):**

```json
{
  "username": "admin",
  "password": "Admin@123"
}
```

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "username": "admin"
    }
  }
}
```

**Error response – invalid credentials (401):**

```json
{
  "success": false,
  "error": "Username o password non validi"
}
```

**Error response – validation (400):**

```json
{
  "success": false,
  "error": "Username obbligatorio",
  "details": [...]
}
```

**Frontend usage:** Store `data.token` (e.g. in memory or localStorage) and send it on protected requests as `Authorization: Bearer <token>`.

---

## 2. Change password (protected)

**Endpoint:** `PATCH /api/auth/change-password`

**Headers:**  
`Content-Type: application/json`  
`Authorization: Bearer <token>`  ← use the token from login

**Request body (payload):**

```json
{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecure@456"
}
```

**Validation rules for `newPassword`:**
- Minimum 8 characters
- At least one uppercase letter, one lowercase letter, one number, one special character from `@$!%*?&`

**Success response (200):**

```json
{
  "success": true,
  "data": {
    "message": "Password aggiornata"
  }
}
```

**Error response – wrong current password (400):**

```json
{
  "success": false,
  "error": "Password attuale non corretta"
}
```

**Error response – invalid/missing token (401):**

```json
{
  "success": false,
  "error": "Token mancante o non valido"
}
```

or

```json
{
  "success": false,
  "error": "Token non valido o scaduto"
}
```

**Error response – new password validation (400):**

```json
{
  "success": false,
  "error": "La nuova password deve contenere maiuscola, minuscola, numero e carattere speciale (@$!%*?&)",
  "details": [...]
}
```

---

## Summary

| Action           | Method | Endpoint                  | Auth header      |
|-----------------|--------|---------------------------|------------------|
| Login           | POST   | `/api/auth/login`         | No               |
| Change password | PATCH  | `/api/auth/change-password` | `Bearer <token>` |

Default admin after seed: **username** `admin`, **password** `Admin@123`. Change password after first login via the change-password API.
