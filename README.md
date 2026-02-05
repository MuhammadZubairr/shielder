# Shielder Digital Platform

Enterprise-grade digital backbone for industrial filters management.

## 🏗️ Project Structure

```
shielder/
├── backend/         # Node.js + Express + Prisma + PostgreSQL
└── frontend/        # Next.js 14 + TypeScript + Tailwind CSS
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- npm >= 9.0.0

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your backend API URL
npm run dev
```

Frontend will run on http://localhost:3000

## 📚 Documentation

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

## 🌟 Features

### Implemented
- ✅ User Authentication (Register/Login/Logout)
- ✅ JWT Token Management
- ✅ Role-Based Access Control
- ✅ Multilingual Support (English/Arabic)
- ✅ Responsive Design
- ✅ Enterprise Architecture
- ✅ Type-Safe Development

### Coming Soon
- 🔄 Product Catalog Management
- 🔄 Order Management System
- 🔄 Customer Portal
- 🔄 Admin Dashboard
- 🔄 Analytics & Reporting
- 🔄 Dealer Management (Future)

## 🚢 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
4. Deploy!

### Backend (Railway)

1. Push code to GitHub
2. Create new project on Railway
3. Add PostgreSQL database
4. Set environment variables from `.env.example`
5. Deploy!

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Docker

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios (API Client)
- React Hot Toast

## 📋 API Documentation

### Authentication Endpoints

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout user (protected)
- `GET /api/v1/auth/verify-email/:token` - Verify email

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Helmet security headers
- Input validation
- SQL injection prevention with Prisma

## 📝 License

MIT License - Shielder Digital Platform

## 👥 Team

Shielder Development Team

---

**Need help?** Check the README files in backend and frontend directories for detailed setup instructions.
