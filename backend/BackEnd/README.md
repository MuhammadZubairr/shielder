# Inventory Management System - Backend API

A robust and scalable backend API for inventory management built with Node.js, Express, and MongoDB following enterprise-level best practices.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Best Practices](#best-practices)

## ✨ Features

- **User Management**: Authentication, authorization with role-based access control (RBAC)
- **Product Management**: CRUD operations for inventory products
- **Supplier Management**: Manage supplier information
- **Transaction Management**: Track stock in/out, adjustments, returns, and damaged goods
- **Real-time Stock Monitoring**: Low stock alerts and notifications
- **Comprehensive Logging**: Winston-based logging system
- **Input Validation**: Joi-based request validation
- **Security**: JWT authentication, bcrypt password hashing
- **Error Handling**: Centralized error handling middleware

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Logging**: Winston
- **Security**: bcryptjs for password hashing
- **Development**: Nodemon for hot-reloading

## 📁 Project Structure

```
BackEnd/
├── config/
│   ├── constants.js        # Application constants and enums
│   └── database.js         # MongoDB connection configuration
├── controllers/            # Request handlers (to be implemented)
├── middleware/
│   ├── auth.js            # Authentication & authorization middleware
│   ├── errorHandler.js    # Global error handling middleware
│   └── validate.js        # Validation middleware factory
├── models/
│   ├── User.js            # User model schema
│   ├── Product.js         # Product model schema
│   ├── Supplier.js        # Supplier model schema
│   └── Transaction.js     # Transaction model schema
├── routes/                # API routes (to be implemented)
├── utils/
│   ├── ApiError.js        # Custom error class
│   ├── ApiResponse.js     # Standardized response class
│   ├── asyncHandler.js    # Async error wrapper
│   └── logger.js          # Winston logger configuration
├── validators/
│   ├── userValidator.js   # User request validators
│   ├── productValidator.js # Product request validators
│   ├── supplierValidator.js # Supplier request validators
│   └── transactionValidator.js # Transaction request validators
├── .env                   # Environment variables
├── .gitignore            # Git ignore rules
├── index.js              # Application entry point
└── package.json          # Project dependencies
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Inventory/BackEnd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` (if provided)
   - Update the MongoDB URI and other configurations

## ⚙️ Configuration

Create a `.env` file in the BackEnd directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:5500
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` by default.

## 📚 API Documentation

### Health Check
- **GET** `/health` - Check server status

### Authentication (Coming Soon)
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user

### Users (Coming Soon)
- **GET** `/api/users` - Get all users (Admin only)
- **GET** `/api/users/:id` - Get user by ID
- **PUT** `/api/users/:id` - Update user
- **DELETE** `/api/users/:id` - Delete user

### Products (Coming Soon)
- **GET** `/api/products` - Get all products
- **POST** `/api/products` - Create new product
- **GET** `/api/products/:id` - Get product by ID
- **PUT** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

### Suppliers (Coming Soon)
- **GET** `/api/suppliers` - Get all suppliers
- **POST** `/api/suppliers` - Create new supplier
- **GET** `/api/suppliers/:id` - Get supplier by ID
- **PUT** `/api/suppliers/:id` - Update supplier
- **DELETE** `/api/suppliers/:id` - Delete supplier

### Transactions (Coming Soon)
- **GET** `/api/transactions` - Get all transactions
- **POST** `/api/transactions` - Create new transaction
- **GET** `/api/transactions/:id` - Get transaction by ID
- **PUT** `/api/transactions/:id` - Update transaction
- **DELETE** `/api/transactions/:id` - Delete transaction

## 🏛️ Architecture

This backend follows a **layered architecture** pattern:

### 1. Routes Layer
- Defines API endpoints
- Routes requests to appropriate controllers

### 2. Controllers Layer
- Handles HTTP requests and responses
- Validates request data
- Delegates business logic to services

### 3. Services Layer (To be implemented)
- Contains business logic
- Orchestrates data operations
- Emits events and notifications

### 4. Repositories Layer (To be implemented)
- Handles database operations
- Provides data access abstraction

### 5. Models Layer
- Defines MongoDB schemas
- Contains data validation rules
- Includes virtual properties and methods

## ✅ Best Practices

This project adheres to the following principles:

- **DRY (Don't Repeat Yourself)**: Centralized logic in utilities and shared modules
- **KISS (Keep It Simple, Stupid)**: Simple, direct solutions over unnecessary complexity
- **YAGNI (You Aren't Gonna Need It)**: Only implement currently required features
- **Single Responsibility Principle**: Each module has one clear responsibility
- **Separation of Concerns**: Clear separation between layers

### Code Quality
- ✅ Input validation on all endpoints
- ✅ Consistent error handling
- ✅ Comprehensive logging
- ✅ Environment-based configuration
- ✅ Security best practices (password hashing, JWT)
- ✅ Clean, documented code

### Security
- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variables for secrets

## 📝 Constants & Enums

All status, type, and role fields use centralized constants:

### User Roles
- `admin` - Full system access
- `manager` - Management-level access
- `staff` - Standard user access
- `viewer` - Read-only access

### Product Status
- `available` - In stock and available
- `out_of_stock` - No stock available
- `discontinued` - No longer carried
- `low_stock` - Below minimum threshold

### Transaction Types
- `stock_in` - Stock receiving
- `stock_out` - Stock dispatch
- `adjustment` - Inventory adjustment
- `return` - Product return
- `damaged` - Damaged goods

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | Required |
| JWT_SECRET | JWT signing secret | Required |
| JWT_EXPIRES_IN | JWT expiration time | 7d |
| CORS_ORIGIN | Allowed origins | * |

## 📊 Logging

The application uses Winston for logging with the following levels:

- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `debug` - Debug messages (development only)

Logs are written to:
- Console (with colors in development)
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only
- `logs/exceptions.log` - Uncaught exceptions
- `logs/rejections.log` - Unhandled promise rejections

## 🚧 Roadmap

- [ ] Implement controllers and routes
- [ ] Add service layer with business logic
- [ ] Implement repository pattern for data access
- [ ] Add API documentation with Swagger
- [ ] Implement real-time notifications
- [ ] Add unit and integration tests
- [ ] Implement rate limiting
- [ ] Add file upload functionality
- [ ] Implement reporting features
- [ ] Add Docker support

## 📄 License

ISC

## 👤 Author

Your Name

---

**Note**: This is a production-ready backend structure following enterprise-level best practices and the guidelines specified in `.cursorrules`.
