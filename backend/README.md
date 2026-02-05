<<<<<<< HEAD
# amazoneInventryManagement
=======
# Shielder Backend API

Enterprise-grade backend API for the Shielder Digital Platform - Industrial Filters Management System.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Multilingual Support**: Arabic and English support at the database level
- **Enterprise Architecture**: Modular, scalable, and maintainable codebase
- **Type Safety**: Full TypeScript implementation with Prisma ORM
- **Security**: Helmet, CORS, input validation, password hashing
- **Logging & Monitoring**: Structured logging with request tracking
- **Database**: PostgreSQL with Prisma ORM
- **API Documentation**: RESTful API design with clear endpoints

## 📋 Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 15
- npm >= 9.0.0

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Generate Prisma Client**
```bash
npm run prisma:generate
```

5. **Run database migrations**
```bash
npm run prisma:migrate
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Using Docker
```bash
cd docker
docker-compose up -d
```

## 📡 API Endpoints

### Health Check
- `GET /health` - API health check

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/me` - Get current user (protected)
- `POST /api/v1/auth/logout` - Logout user (protected)
- `GET /api/v1/auth/verify-email/:token` - Verify email

## 🗄️ Database Schema

The application uses PostgreSQL with the following main models:
- **Users**: User accounts with authentication
- **UserProfiles**: User profile information with locale preferences
- **Products**: Product catalog with multilingual support
- **ProductTranslations**: Product translations (en, ar)
- **Categories**: Product categories with hierarchy
- **CategoryTranslations**: Category translations
- **Orders**: Order management
- **OrderItems**: Order line items
- **AuditLogs**: Activity tracking

## 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention with Prisma
- Rate limiting (planned)

## 📦 Deployment

### Railway Deployment

1. Create a new project on Railway
2. Add PostgreSQL service
3. Add environment variables from `.env.example`
4. Deploy from GitHub repository

### Environment Variables

Required environment variables:
```
NODE_ENV=production
PORT=5000
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
```

## 🧪 Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 📝 Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/                # Configuration files
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication module
│   │   ├── users/            # User management
│   │   ├── products/         # Product catalog
│   │   └── orders/           # Order management
│   ├── common/               # Shared utilities
│   │   ├── middleware/       # Express middleware
│   │   ├── errors/           # Error classes
│   │   ├── logger/           # Logging utility
│   │   └── utils/            # Helper functions
│   ├── database/
│   │   └── prisma/           # Prisma schema and migrations
│   └── types/                # TypeScript type definitions
├── docker/                   # Docker configuration
├── package.json
└── tsconfig.json
```

## 🤝 Contributing

Please follow the coding standards defined in `.cursorrules`.

## 📄 License

MIT License - Shielder Digital Platform
>>>>>>> 8a6668f (feat: implement signup and login with hashed passwords and multi-device session management)
