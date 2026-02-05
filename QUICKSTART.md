# Shielder Digital Platform - Quick Start Guide

## ✅ Installation Complete!

All dependencies have been installed successfully:
- Backend: 251 packages installed
- Frontend: 414 packages installed
- Prisma Client: Generated successfully

## 🚀 Next Steps

### 1. Configure Database (Required)

Edit `backend/.env` and update the DATABASE_URL:

```bash
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/shielder_db?schema=public"
```

### 2. Set Up PostgreSQL Database

You have two options:

#### Option A: Use Docker (Recommended)
```bash
cd backend/docker
docker-compose up -d
```
This will create a PostgreSQL database with credentials:
- User: `shielder_user`
- Password: `shielder_pass`
- Database: `shielder_db`
- Port: `5432`

#### Option B: Use Local PostgreSQL
```bash
# Create database
createdb shielder_db

# Or using psql
psql -U postgres
CREATE DATABASE shielder_db;
```

### 3. Run Database Migrations

```bash
cd backend
npm run prisma:migrate
```

This will create all tables (User, UserProfile, Product, Category, Order, etc.)

### 4. Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on: http://localhost:5000

**Test the backend:**
```bash
curl http://localhost:5000/api/v1/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### 5. Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:3000

## 🧪 Test Authentication

### Register a New User

1. Open http://localhost:3000/register
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Name: `Test User`
   - Company: `Test Company`
   - Phone: `+1234567890`
   - Language: `en` or `ar`
3. Click "Create Account"

### Login

1. Open http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!@#`
3. Click "Sign In"

You should be redirected based on your role:
- **admin** → `/admin/dashboard`
- **supplier** → `/supplier/dashboard`
- **customer** → `/customer/dashboard`

## 📝 Environment Configuration

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://shielder_user:shielder_pass@localhost:5432/shielder_db?schema=public"
JWT_ACCESS_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=Shielder Digital Platform
```

## 🔍 Available Scripts

### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run prisma:studio # Open Prisma Studio (Database GUI)
npm run prisma:migrate # Run database migrations
npm run lint         # Run ESLint
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Check TypeScript types
```

## 🛠️ Troubleshooting

### Backend won't start
- Check if PostgreSQL is running: `pg_isready`
- Verify DATABASE_URL in `backend/.env`
- Check if port 5000 is available: `lsof -i :5000`

### Frontend won't start
- Check if backend is running on port 5000
- Verify NEXT_PUBLIC_API_URL in `frontend/.env.local`
- Check if port 3000 is available: `lsof -i :3000`

### Database connection errors
- Ensure PostgreSQL is installed and running
- Check credentials in DATABASE_URL
- Try connecting manually: `psql postgresql://user:pass@localhost:5432/shielder_db`

### CORS errors
- Verify CORS_ORIGIN in `backend/.env` matches frontend URL
- Check that frontend is running on http://localhost:3000

## 🗄️ Database Management

### View Database with Prisma Studio
```bash
cd backend
npm run prisma:studio
```
Opens GUI at http://localhost:5555

### Reset Database (⚠️ Deletes all data)
```bash
cd backend
npx prisma migrate reset
```

### Create New Migration
```bash
cd backend
npx prisma migrate dev --name your_migration_name
```

## 🔐 Default User Roles

The system supports 3 roles:
- **admin**: Full system access
- **supplier**: Can manage products and orders
- **customer**: Can browse and place orders

Note: Dealer functionality is not implemented yet.

## 📦 Project Structure

```
shielder/
├── backend/          # Express.js API
│   ├── src/
│   │   ├── modules/auth/     # Authentication
│   │   ├── config/           # Configuration
│   │   ├── common/           # Utilities
│   │   └── database/prisma/  # Database schema
│   └── docker/              # Docker setup
└── frontend/         # Next.js 14 App
    └── src/
        ├── app/             # Pages & layouts
        ├── components/      # React components
        ├── services/        # API clients
        ├── store/           # State management
        └── hooks/           # Custom hooks
```

## 🚢 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel
```

### Backend (Railway)
```bash
cd backend
railway up
```

See `INSTALLATION.md` for detailed deployment instructions.

## 📚 Documentation

- Full installation guide: `INSTALLATION.md`
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review `INSTALLATION.md` for detailed instructions
3. Check terminal logs for error messages
4. Verify all environment variables are set correctly

---

**🎉 You're all set! Start the servers and begin building!**
