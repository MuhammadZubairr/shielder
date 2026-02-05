# Deployment Guide - Inventory Management System

## 🚀 Deployment Overview

This project uses:
- **Backend**: Railway (Node.js + Express + MongoDB)
- **Frontend**: Vercel (Static HTML/CSS/JS)

---

## 📦 Backend Deployment (Railway)

### 1. Railway Setup
1. Go to [Railway.app](https://railway.app)
2. Create a new project from your GitHub repository
3. Select **BackEnd** as the root directory
4. Railway will auto-detect Node.js

### 2. Environment Variables (Railway)
Add these in Railway's **Variables** section:

```env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://zubairm1815_db_user:7t7ciPVavIPaUmQ3@backend-api-inventory.gpbnqus.mongodb.net/?appName=Backend-Api-Inventory
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=1d
CORS_ORIGIN=https://your-frontend-name.vercel.app
```

⚠️ **Important**: Replace `https://your-frontend-name.vercel.app` with your actual Vercel URL after frontend deployment.

### 3. Build & Start Commands
Railway should auto-detect these, but verify:
- **Build Command**: `npm install`
- **Start Command**: `npm start` or `node index.js`

### 4. Get Your Railway URL
After deployment, copy your Railway URL:
```
https://inventory-management-system-production-30b1.up.railway.app
```

---

## 🌐 Frontend Deployment (Vercel)

### 1. Vercel Project Settings
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. **IMPORTANT**: Set **Root Directory** to `FrontEnd`
4. **Framework Preset**: Other (static HTML)
5. **Build Command**: Leave empty (no build needed)
6. **Output Directory**: Leave as default

### 2. Environment Configuration
Your `config.js` is already configured to automatically detect:
- **Local**: `http://localhost:3001/api`
- **Production**: `https://inventory-management-system-production-30b1.up.railway.app/api`

No environment variables needed on Vercel!

### 3. Deploy
Click **Deploy** and wait for Vercel to build.

### 4. Get Your Vercel URL
After deployment, copy your Vercel URL:
```
https://your-project-name.vercel.app
```

---

## 🔄 Post-Deployment Steps

### Update Railway CORS
Go back to Railway and update the `CORS_ORIGIN` variable with your Vercel URL:
```env
CORS_ORIGIN=https://your-project-name.vercel.app
```

Then **redeploy** the Railway backend.

---

## ✅ Testing Your Deployment

1. **Open your Vercel URL**: `https://your-project-name.vercel.app`
2. **Check Browser Console** (F12):
   - Should see: `🌐 Environment: Production`
   - Should see: `🔗 API Base URL: https://...railway.app/api`
3. **Try logging in** with your admin credentials
4. **Check Network tab**: API calls should go to Railway URL

---

## 🐛 Troubleshooting

### Problem: "CORS Error"
**Solution**: Update Railway's `CORS_ORIGIN` to match your Vercel URL exactly.

### Problem: "Cannot read API_BASE_URL"
**Solution**: Ensure `config.js` is loaded BEFORE other scripts in HTML files.

### Problem: "404 Not Found on API"
**Solution**: Check that Railway backend is running and URL is correct.

### Problem: "Name not showing in navbar"
**Solution**: 
1. Clear browser localStorage
2. Login again
3. Check browser console for errors

---

## 📝 File Structure

```
Inventory/
├── BackEnd/                 # Railway deployment
│   ├── index.js
│   ├── package.json
│   └── ...
└── FrontEnd/                # Vercel deployment
    ├── vercel.json         # Vercel configuration
    ├── pages/
    │   ├── login.html
    │   ├── admin.html
    │   └── ...
    └── assets/
        └── js/
            ├── config.js   # Auto-detects environment
            ├── login.js
            ├── navbar.js
            └── ...
```

---

## 🔐 Security Notes

1. Never commit `.env` files to GitHub
2. Change `JWT_SECRET` to a strong random value in production
3. Use HTTPS for all production URLs
4. Enable Vercel's security headers
5. Regularly update MongoDB connection password

---

## 🎉 You're Done!

Your Inventory Management System is now live:
- **Frontend**: https://your-project-name.vercel.app
- **Backend API**: https://...railway.app/api

---

## 📧 Need Help?

Check the logs:
- **Vercel**: Dashboard → Your Project → Deployments → View Logs
- **Railway**: Dashboard → Your Project → Deployments → View Logs
