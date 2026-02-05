# � How to Access Suppliers and Products Pages

## ⚠️ CRITICAL: Why Pages Are Not Showing Data

**The pages ARE WORKING!** The issue is **you're not logged in**.

Both `suppliers.html` and `products.html` **require authentication**. Without a login token, the JavaScript automatically redirects you to the login page.

---

## ✅ CORRECT WAY to View Data:

### **Step 1: Start Backend Server**

```bash
cd /Users/mzubair/Desktop/Inventory/BackEnd
npm start
```

Wait for:
```
🚀 Server is running on http://localhost:3001
MongoDB Connected: ...
```

---

### **Step 2: Open Browser and Login**

**IMPORTANT:** Use the server URL, not file paths!

**Option A - Type in browser:**
```
http://localhost:3001
```

**Option B - Terminal command:**
```bash
open http://localhost:3001
```

This will redirect you to: `http://localhost:3001/login.html`

---

### **Step 3: Login with Admin Credentials**

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

Click "Login" button.

After successful login:
- Token is stored in `sessionStorage`
- You're redirected to dashboard
- Now you can access protected pages

---

### **Step 4: Navigate to Suppliers or Products**

**For Suppliers Page:**
```
http://localhost:3001/suppliers.html
```
Or click "Suppliers" in the sidebar menu.

**For Products Page:**
```
http://localhost:3001/products.html
```
Or click "Products" in the sidebar menu.

---

## 📊 What You Should See:

### **Suppliers Page (2 suppliers in database):**
```
┌─────────────┬──────────────────┬───────────────┬──────────────────────┬──────────────┬────────┐
│ Code        │ Supplier Name    │ Contact Person│ Email                │ Phone        │ Status │
├─────────────┼──────────────────┼───────────────┼──────────────────────┼──────────────┼────────┤
│ SUP-TEST    │ Test Supplier Co │ N/A           │ test@supplier.com    │ +1234567890  │ Active │
│ SUP-002     │ ABC Supplies Ltd │ Jane Smith    │ info@abcsupplies.com │ +1-555-0123  │ Active │
└─────────────┴──────────────────┴───────────────┴──────────────────────┴──────────────┴────────┘
```

### **Products Page (2 products in database):**
```
┌──────────┬─────────────────┬─────────────┬──────────┬──────────┬───────────┬──────────────────┐
│ SKU      │ Name            │ Category    │ Quantity │ Price    │ Status    │ Supplier         │
├──────────┼─────────────────┼─────────────┼──────────┼──────────┼───────────┼──────────────────┤
│ PROD-002 │ Laptop Computer │ Electronics │ 25       │ $1299.99 │ Available │ Test Supplier Co │
│ PROD-001 │ Test Product    │ Electronics │ 50       │ $99.99   │ Available │ Test Supplier Co │
└──────────┴─────────────────┴─────────────┴──────────┴──────────┴───────────┴──────────────────┘
```

---

## 🔍 How to Check You're on the Right URL

Look at your browser's address bar:

❌ **WRONG:** `file:///Users/mzubair/Desktop/Inventory/FrontEnd/suppliers.html`  
✅ **CORRECT:** `http://localhost:3001/suppliers.html`

The first one won't work because:
1. No authentication token (file:// can't use sessionStorage properly)
2. Cannot make API calls from `file://` to `http://`
3. Browser security blocks cross-origin requests

---

## 🐛 Troubleshooting:

### **Problem: Page redirects to login immediately**

**Cause:** You're not logged in (no token in sessionStorage)

**Solution:**
1. Go to `http://localhost:3001/login.html`
2. Login with: `admin@gmail.com` / `admin123`
3. Then navigate to suppliers or products page

---

### **Problem: Page shows "Loading..." forever**

**Causes:**
1. Backend not running
2. Not logged in
3. Token expired

**Solutions:**

**Check backend is running:**
```bash
curl http://localhost:3001/health
```

**Check if logged in:**
- Open DevTools (F12 or Cmd+Option+I)
- Go to "Application" tab
- Click "Session Storage" → `http://localhost:3001`
- Look for "token" key
- If missing: You need to login!

**Check console for errors:**
- F12 → Console tab
- Look for red errors
- Common: `401 Unauthorized` = Not logged in

---

### **Problem: Network error / Cannot fetch**

**Cause:** Backend not running

**Solution:**
```bash
cd /Users/mzubair/Desktop/Inventory/BackEnd
npm start
```

---

## 🧪 Quick API Test (Verify Data Exists):

```bash
# Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['token'])")

# Get suppliers
curl -s http://localhost:3001/api/suppliers \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool

# Get products
curl -s http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

---

## ✅ Step-by-Step Checklist:

- [ ] Backend running on port 3001
- [ ] MongoDB connected (check server logs)
- [ ] Browser open to `http://localhost:3001`
- [ ] Logged in with `admin@gmail.com` / `admin123`
- [ ] Token stored in sessionStorage (check DevTools)
- [ ] Navigate to `http://localhost:3001/suppliers.html` or `http://localhost:3001/products.html`
- [ ] Data displays in table

---

## 🎯 Why This Happens:

Both `suppliers.js` and `products.js` have this code at the top:

```javascript
function checkAuth() {
    const token = sessionStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';  // <-- Redirects if no token!
    }
}
checkAuth();
```

This is **security by design**. It prevents unauthorized access to your inventory data.

---

## 🚀 Quick Start (Copy-Paste):

```bash
# 1. Start backend
cd /Users/mzubair/Desktop/Inventory/BackEnd && npm start

# 2. Open browser (Mac)
open http://localhost:3001

# 3. Login with:
#    Email: admin@gmail.com
#    Password: admin123

# 4. Click "Suppliers" or "Products" in sidebar

# ✅ Done! Data should appear.
```

---

## 💡 Pro Tip:

Keep browser DevTools open (F12) and check:
- **Console tab**: See API calls and errors
- **Network tab**: Monitor requests (should see `/api/suppliers` or `/api/products`)
- **Application tab → Session Storage**: Verify token exists

This helps debug issues instantly!

---

## 📋 Current Database Status:

**Suppliers:** 2
- SUP-TEST: Test Supplier Co
- SUP-002: ABC Supplies Ltd

**Products:** 2  
- PROD-001: Test Product
- PROD-002: Laptop Computer

**Users:** 1
- admin@gmail.com (Admin role)

All verified working via API! 🎉
