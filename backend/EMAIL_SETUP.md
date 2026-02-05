# 📧 Email Service Setup Guide

## ✅ Email Service is Now Configured!

The email service has been fully integrated into the backend. Here's what was added:

### 📁 Files Created/Updated:

1. **Email Service** (`src/common/services/email.service.ts`)
   - Professional email templates (HTML)
   - Support for multiple providers (SMTP/SendGrid/AWS SES)
   - Automatic connection verification
   
2. **Auth Service** (` src/modules/auth/auth.service.ts`)
   - Welcome email on signup
   - Email verification link
   - Password reset email with token
   - Password changed notification

3. **Environment Config** (`src/config/env.ts`)
   - Email provider settings
   - SMTP configuration
   - SendGrid/AWS SES support

4. **Environment Variables** (`.env`)
   - Email configuration template added

---

## 🚀 Quick Setup (Choose One Option)

### Option 1: Gmail SMTP (5 minutes - Easiest for Testing)

#### Step 1: Get Gmail App Password

1. Open: https://myaccount.google.com/security
2. Enable **"2-Step Verification"** (if not already enabled)
3. Search for **"App Passwords"** in Google Account settings
4. Click **"App passwords"**
5. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Enter: **"Shielder Backend"**
6. Click **"Generate"**
7. Copy the **16-character password** (format: `xxxx xxxx xxxx xxxx`)

#### Step 2: Update `.env` File

Open `backend/.env` and update these lines:

```bash
EMAIL_PROVIDER=smtp
EMAIL_FROM_NAME=Shielder Platform
EMAIL_FROM_ADDRESS=noreply@shielder.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_GMAIL@gmail.com           # ← Your Gmail address
SMTP_PASSWORD=xxxxxxxxxxxxxx              # ← App password (NO SPACES!)
```

#### Step 3: Test

Restart backend and send a test email:

```bash
# Test forgot password (will send email to your Gmail)
curl -X POST http://localhost:5001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_GMAIL@gmail.com"}'

# Check your Gmail inbox!
```

---

### Option 2: SendGrid (Production Recommended)

#### Step 1: Get SendGrid API Key

1. Sign up: https://sendgrid.com (Free tier: 100 emails/day)
2. Go to: **Settings → API Keys**
3. Click **"Create API Key"**
4. Name: **"Shielder Backend"**
5. Permissions: **Full Access**
6. Click **"Create & View"**
7. Copy the API key

#### Step 2: Update `.env` File

```bash
EMAIL_PROVIDER=sendgrid
EMAIL_FROM_NAME=Shielder Platform
EMAIL_FROM_ADDRESS=verify@yourdomain.com    # ← Must be verified in SendGrid

SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxx  # ← Your API key
```

#### Step 3: Verify Sender

In SendGrid dashboard:
- Go to **Settings → Sender Authentication**
- Click **"Verify a Single Sender"**
- Use the email address from `EMAIL_FROM_ADDRESS`

---

### Option 3: AWS SES (Enterprise)

```bash
EMAIL_PROVIDER=ses
EMAIL_FROM_NAME=Shielder Platform
EMAIL_FROM_ADDRESS=noreply@yourdomain.com

AWS_REGION=us-east-1
AWS_SES_ACCESS_KEY=AKIAXXXXXXXXXXXXXXXX
AWS_SES_SECRET_KEY=your-aws-secret-key
```

---

## 📧 Emails That Will Be Sent:

### 1. Welcome Email (On Signup)
- Sent to: New user's email
- Contains: Welcome message, platform features, login link

### 2. Email Verification (On Signup)
- Sent to: New user's email
- Contains: Verification link (expires in 24 hours)
- Link format: `http://localhost:3000/verify-email/TOKEN`

### 3. Password Reset (On Forgot Password)
- Sent to: User's email
- Contains: Reset password link (expires in 15 minutes)
- Link format: `http://localhost:3000/reset-password/TOKEN`
- **User receives the PLAIN token in their email!**

### 4. Password Changed (On Change Password)
- Sent to: User's email
- Contains: Confirmation + security warning
- Alerts user if account was compromised

### 5. Account Locked (After 5 Failed Login Attempts)
- Sent to: User's email
- Contains: Lock duration, unlock time, security tips

---

## 🧪 Testing Without Frontend

### Test 1: Signup → Receive Emails

```bash
curl -X POST http://localhost:5001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "YOUR_EMAIL@gmail.com",
    "password": "Test@1234",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

**Expected:** 2 emails in your inbox:
- ✅ Welcome to Shielder!
- ✅ Verify Your Email

---

### Test 2: Password Reset → Receive Email with Token

```bash
curl -X POST http://localhost:5001/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@gmail.com"}'
```

**Expected:** 1 email in your inbox:
- ✅ Reset Your Password
- Contains clickable link: `http://localhost:3000/reset-password/abc123def456`
- Copy the token from the link: `abc123def456`

**Then reset password:**

```bash
curl -X POST http://localhost:5001/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"abc123def456",
    "newPassword":"NewPass@5678"
  }'
```

---

### Test 3: Change Password → Receive Notification

```bash
# First login to get access token
curl -X POST http://localhost:5001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"YOUR_EMAIL@gmail.com",
    "password":"Test@1234"
  }'

# Copy the accessToken from response

# Then change password
curl -X PATCH http://localhost:5001/api/v1/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "oldPassword":"Test@1234",
    "newPassword":"NewPass@5678"
  }'
```

**Expected:** 1 email in your inbox:
- ✅ Password Changed Successfully
- Security warning if it wasn't you

---

## ⚙️ Email Service Features:

✅ **Auto-retry** on failures  
✅ **Connection verification** on startup  
✅ **Beautiful HTML templates** with responsive design  
✅ **Plain text fallback** for email clients without HTML support  
✅ **Detailed logging** for debugging  
✅ **Security warnings** in password-related emails  
✅ **Graceful degradation** - backend works even if email fails  

---

## 🔍 Troubleshooting:

### Email not sending?

1. **Check backend logs** for email errors
2. **Verify SMTP credentials** in `.env`
3. **For Gmail**: Make sure you used App Password (not regular password)
4. **For Gmail**: Check "Less secure app access" is NOT needed (App Passwords bypass this)
5. **Check spam folder** in your email

### Gmail App Password not working?

- Make sure 2-Step Verification is enabled
- Remove all spaces from the password in `.env`
- Try generating a new App Password

### Email service disabled?

- Check if `SMTP_USER` and `SMTP_PASSWORD` are set in `.env`
- Restart backend server after updating `.env`

---

## 📝 Current Status:

✅ Email service fully implemented  
✅ All authentication emails configured  
✅ Professional HTML templates created  
✅ Nodemailer package installed  
⏳ Waiting for SMTP credentials in `.env`  

---

## 🎯 Next Steps:

1. **Choose an email provider** (Gmail recommended for testing)
2. **Get credentials** (App Password for Gmail)
3. **Update `.env` file** with credentials
4. **Restart backend server**
5. **Test with your real email address**

---

## 💡 Pro Tips:

- **Use Gmail SMTP for development** - Free and easy to setup
- **Use SendGrid for production** - Better deliverability, analytics
- **Test emails go to spam?** - Check sender verification
- **Want custom domain emails?** - Use SendGrid or AWS SES with domain verification

---

**Need help?** Check backend console logs for detailed email sending information!
