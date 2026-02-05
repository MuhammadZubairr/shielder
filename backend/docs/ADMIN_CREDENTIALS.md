# Admin Login Credentials

## Default Admin Account

An admin user has been created in your MongoDB Atlas database.

### Login Credentials

```
📧 Email: admin@university.edu
🔑 Password: admin123
👤 Role: Admin
```

## How to Login

### Option 1: Using the Frontend
1. Open `FrontEnd/login.html` in your browser
2. Enter the credentials above
3. Click "Login"
4. You will be redirected to `admin.html`

### Option 2: Using API (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@university.edu",
    "password": "admin123"
  }'
```

### Option 3: Using Browser Console
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@university.edu',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Security Notes

⚠️ **IMPORTANT**: This is a default password for development/testing purposes.

### For Production:
1. Change the admin password immediately after first login
2. Use strong passwords (minimum 12 characters, mix of letters, numbers, symbols)
3. Don't share admin credentials
4. Consider implementing 2FA (Two-Factor Authentication) in the future

## How to Change Password

### Option 1: Using the API
```bash
curl -X POST http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "your_new_secure_password"
  }'
```

### Option 2: Add a "Change Password" page in the frontend (recommended)

## Creating Additional Users

As an admin, you can create additional users with different roles:

### Create Manager User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manager User",
    "email": "manager@university.edu",
    "password": "manager123",
    "role": "manager"
  }'
```

### Create Staff User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Staff User",
    "email": "staff@university.edu",
    "password": "staff123",
    "role": "staff"
  }'
```

## User Roles

- **Admin**: Full system access, can manage all users and data
- **Manager**: Can manage users and inventory
- **Staff**: Can manage inventory (default role)
- **Viewer**: Read-only access

## Re-creating Admin User

If you need to re-create the admin user or create additional admins:

```bash
cd BackEnd
npm run seed
```

This script will:
- Check if admin already exists
- Create a new admin if none exists
- Display the credentials

## Stored Location

- **Database**: MongoDB Atlas
- **Collection**: `users`
- **Password**: Hashed with bcrypt (10 salt rounds)
- **Never stored in plain text**

## Token Storage (Frontend)

After successful login:
- JWT token stored in `localStorage` as 'token'
- User data stored in `localStorage` as 'user'
- Cookie set with HttpOnly flag (for API requests)

To clear session (logout):
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
// Or simply click logout button
```
