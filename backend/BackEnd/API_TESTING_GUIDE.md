# Authentication API Testing Guide

This document provides examples for testing the authentication endpoints using various tools.

## Base URL
```
http://localhost:5000/api
```

## Endpoints

### 1. Register User (Signup)

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@university.edu",
  "password": "password123",
  "role": "staff",
  "phone": "+1234567890",
  "department": "IT"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "password": "password123",
    "role": "staff",
    "phone": "+1234567890",
    "department": "IT"
  }'
```

**Success Response (201):**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "65f123...",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "role": "staff",
      "status": "active",
      "phone": "+1234567890",
      "department": "IT",
      "createdAt": "2026-01-27T12:00:00.000Z",
      "updatedAt": "2026-01-27T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully",
  "success": true
}
```

**Error Response (409 - User already exists):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

---

### 2. Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john.doe@university.edu",
  "password": "password123"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@university.edu",
    "password": "password123"
  }'
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "65f123...",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "role": "staff",
      "status": "active",
      "lastLogin": "2026-01-27T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful",
  "success": true
}
```

**Error Response (401 - Invalid credentials):**
```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /auth/me`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Command:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "65f123...",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "role": "staff",
      "status": "active"
    }
  },
  "message": "User retrieved successfully",
  "success": true
}
```

---

### 4. Logout

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Success Response (200):**
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logout successful",
  "success": true
}
```

---

### 5. Verify Token

**Endpoint:** `POST /auth/verify-token`

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_JWT_TOKEN"
  }'
```

---

## User Management Endpoints (Admin Only)

### 6. Get All Users

**Endpoint:** `GET /users?page=1&limit=10&role=staff&search=john`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**cURL Command:**
```bash
curl -X GET "http://localhost:5000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Update User

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN (Admin only)
```

**Request Body:**
```json
{
  "name": "John Updated",
  "role": "manager",
  "status": "active"
}
```

**cURL Command:**
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "role": "manager"
  }'
```

---

### 8. Change Password

**Endpoint:** `POST /users/change-password`

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**cURL Command:**
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'
```

---

## Validation Rules

### Registration
- **name**: Required, 2-100 characters
- **email**: Required, valid email format
- **password**: Required, minimum 6 characters
- **role**: Optional, one of: admin, manager, staff, viewer (default: staff)
- **phone**: Optional, valid phone format
- **department**: Optional, max 100 characters

### Login
- **email**: Required, valid email format
- **password**: Required

### Update User
- **name**: Optional, 2-100 characters
- **email**: Optional, valid email format
- **role**: Optional, one of: admin, manager, staff, viewer
- **status**: Optional, one of: active, inactive, suspended
- **phone**: Optional, valid phone format
- **department**: Optional, max 100 characters

### Change Password
- **currentPassword**: Required
- **newPassword**: Required, minimum 6 characters

---

## Testing with Postman

1. **Import Collection:**
   - Create a new collection named "Inventory Management"
   - Add all endpoints above

2. **Set Environment Variables:**
   - `baseUrl`: http://localhost:5000/api
   - `token`: (will be set after login)

3. **Test Flow:**
   - Register a new user
   - Login with credentials
   - Save the token from response
   - Use token for authenticated requests

---

## Testing with Browser Console

```javascript
// Register
fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test@university.edu',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@university.edu',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => {
  console.log(data);
  localStorage.setItem('token', data.data.token);
});
```

---

## Common Error Codes

- **400**: Bad Request - Validation error
- **401**: Unauthorized - Invalid credentials or token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **409**: Conflict - Resource already exists
- **500**: Internal Server Error

---

## Notes

1. All passwords are hashed using bcrypt before storage
2. JWT tokens expire in 7 days by default
3. Admin role required for user management operations
4. Email must be unique across all users
5. Passwords must be at least 6 characters
