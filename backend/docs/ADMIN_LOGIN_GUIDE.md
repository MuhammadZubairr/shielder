# Admin Login & Panel Access Guide

## ✅ How Admin Login Works

### 1. **Admin Credentials**
Your current admin account details:
- **Email**: Check your `setup-single-admin.js` file or the credentials you set
- **Default** (if using seed.js): 
  - Email: `admin@university.edu`
  - Password: `admin123`

### 2. **Login Flow**

#### Step 1: Open Login Page
- Open `FrontEnd/login.html` in your browser
- Or navigate to: `http://localhost:5000` (if using a server)

#### Step 2: Enter Admin Credentials
- Enter your admin email
- Enter your admin password
- Click "Login" button

#### Step 3: Automatic Validation & Redirect
The system will:
1. ✅ Validate your email format and password length
2. ✅ Send credentials to backend (`POST /api/auth/login`)
3. ✅ Backend verifies credentials against MongoDB
4. ✅ Backend returns JWT token + user data
5. ✅ Frontend stores token in localStorage
6. ✅ Frontend checks user role
7. ✅ **If role is 'admin' or 'manager'** → Redirects to `admin.html`
8. ✅ **If role is other** → Redirects to `dashboard.html`

#### Step 4: Admin Panel Protection
Once redirected to `admin.html`:
1. ✅ `admin-auth.js` automatically checks authentication
2. ✅ Verifies you have admin/manager privileges
3. ✅ Displays your name and role in navbar
4. ✅ Shows all admin features

### 3. **Admin Panel Features**

After successful login, admin can access:

- **Dashboard** - Overview of inventory statistics
- **Manage Products** - Add, edit, delete products
- **Manage Suppliers** - Handle supplier information
- **Stock In** - Record incoming inventory
- **Stock Out** - Record outgoing inventory
- **Reports** - Generate inventory reports
- **Manage Users** - Create and manage user accounts

### 4. **Security Features**

✅ **Authentication Protection**
- Admin panel checks for valid token on load
- Redirects to login if no token found
- Verifies token with backend API

✅ **Role-Based Access**
- Only 'admin' and 'manager' roles can access admin panel
- Other roles are denied access

✅ **Session Management**
- Token stored securely in localStorage
- Logout button clears all session data
- Auto-redirect on session expiry

### 5. **Testing the Flow**

#### Option A: Using Browser
1. Make sure backend is running: `cd BackEnd && npm run dev`
2. Open `FrontEnd/login.html` directly in browser
3. Enter admin credentials and login

#### Option B: Using Live Server (Recommended)
1. Install Live Server extension in VS Code
2. Right-click `login.html` → "Open with Live Server"
3. Enter admin credentials and login

### 6. **Troubleshooting**

#### "Login failed" error
- ✅ Check if backend server is running (`npm run dev`)
- ✅ Verify admin credentials in database
- ✅ Check browser console for errors
- ✅ Verify MongoDB connection

#### "Access denied" error
- ✅ Make sure user role is 'admin' or 'manager'
- ✅ Run `npm run setup-admin` to recreate admin account

#### Redirect not working
- ✅ Check browser console for JavaScript errors
- ✅ Verify `login.js` is loaded correctly
- ✅ Check that form has `id="loginForm"`

#### "Session expired" error
- ✅ Token may have expired or been invalidated
- ✅ Login again to get a new token

### 7. **Code Files Involved**

**Frontend:**
- `login.html` - Login form UI
- `admin.html` - Admin panel UI
- `assets/js/login.js` - Login logic & API calls
- `assets/js/admin-auth.js` - Admin authentication guard

**Backend:**
- `routes/authRoutes.js` - Authentication routes
- `controllers/authController.js` - Login/register handlers
- `services/authService.js` - Authentication business logic
- `models/User.js` - User schema with password hashing

### 8. **API Endpoints Used**

```javascript
POST /api/auth/login
  Body: { email, password }
  Response: { token, user: { name, email, role, ... } }

POST /api/auth/verify-token
  Headers: { Authorization: "Bearer <token>" }
  Body: { token }
  Response: { user: { ... } }

POST /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: "Logged out successfully" }
```

---

## 🎯 Quick Test Checklist

- [ ] Backend server running on port 5000
- [ ] MongoDB connected successfully
- [ ] Admin user exists in database
- [ ] Open login.html in browser
- [ ] Enter admin credentials
- [ ] Click Login button
- [ ] See "Login successful! Redirecting..." message
- [ ] Automatically redirected to admin.html
- [ ] See admin name in navbar
- [ ] See role badge (Admin/Manager)
- [ ] Logout button works

---

## 🔐 Security Notes

- Never commit `.env` file with real credentials
- Always use strong passwords in production
- JWT tokens should have expiration time
- Use HTTPS in production
- Implement rate limiting for login attempts
- Add CSRF protection for forms

---

**Your admin login system is now fully functional!** 🎉
