# Inventory Management System API Documentation

## 🚀 Complete Backend Implementation

All backend routes for Amazon-style inventory management system are now complete!

---

## 📋 Table of Contents

1. [Authentication & Users](#authentication--users)
2. [Products Management](#products-management)
3. [Suppliers Management](#suppliers-management)
4. [Transactions (Stock In/Out)](#transactions-stock-inout)
5. [Dashboard & Reports](#dashboard--reports)

---

## 🔐 Authentication & Users

### Auth Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| POST | `/api/auth/verify-token` | Verify JWT token | Public |

### User Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin, Manager |
| GET | `/api/users/:id` | Get user by ID | Admin, Manager |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PATCH | `/api/users/:id/role` | Update user role | Admin |

---

## 📦 Products Management

### Product Routes (`/api/products`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **POST** | `/api/products` | Create new product | Admin, Manager |
| **GET** | `/api/products` | Get all products (with filters) | All authenticated |
| **GET** | `/api/products/:id` | Get product by ID | All authenticated |
| **PUT** | `/api/products/:id` | Update product | Admin, Manager |
| **DELETE** | `/api/products/:id` | Delete product | Admin |
| **PATCH** | `/api/products/:id/stock` | Update product stock | Admin, Manager |
| **GET** | `/api/products/low-stock` | Get low stock products | All authenticated |
| **GET** | `/api/products/categories` | Get all categories | All authenticated |
| **GET** | `/api/products/supplier/:supplierId` | Get products by supplier | All authenticated |

#### Create Product Request Body:
```json
{
  "name": "Product Name",
  "sku": "PROD-001",
  "description": "Product description",
  "category": "Electronics",
  "price": 299.99,
  "quantity": 100,
  "minimumStock": 10,
  "supplier": "supplier_id_here",
  "status": "in-stock"
}
```

#### Get Products Query Parameters:
```
?page=1&limit=10&search=laptop&category=Electronics&status=in-stock&minPrice=100&maxPrice=500&sortBy=price&sortOrder=asc
```

#### Update Stock Request Body:
```json
{
  "quantity": 50,
  "type": "add"  // or "subtract" or "set"
}
```

---

## 🏭 Suppliers Management

### Supplier Routes (`/api/suppliers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **POST** | `/api/suppliers` | Create new supplier | Admin, Manager |
| **GET** | `/api/suppliers` | Get all suppliers (with filters) | All authenticated |
| **GET** | `/api/suppliers/active` | Get active suppliers | All authenticated |
| **GET** | `/api/suppliers/:id` | Get supplier by ID | All authenticated |
| **PUT** | `/api/suppliers/:id` | Update supplier | Admin, Manager |
| **DELETE** | `/api/suppliers/:id` | Delete supplier | Admin |

#### Create Supplier Request Body:
```json
{
  "name": "John Doe",
  "company": "ABC Suppliers Inc",
  "email": "supplier@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "isActive": true
}
```

---

## 📊 Transactions (Stock In/Out)

### Transaction Routes (`/api/transactions`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **POST** | `/api/transactions` | Create new transaction | Admin, Manager |
| **GET** | `/api/transactions` | Get all transactions (with filters) | All authenticated |
| **GET** | `/api/transactions/stats` | Get transaction statistics | All authenticated |
| **GET** | `/api/transactions/:id` | Get transaction by ID | All authenticated |
| **GET** | `/api/transactions/product/:productId` | Get transactions by product | All authenticated |
| **DELETE** | `/api/transactions/:id` | Delete transaction (reverses stock) | Admin |

#### Create Transaction Request Body:

**Stock In:**
```json
{
  "product": "product_id_here",
  "quantity": 50,
  "type": "stock-in",
  "supplier": "supplier_id_here",
  "reference": "PO-12345",
  "notes": "Received shipment from supplier"
}
```

**Stock Out:**
```json
{
  "product": "product_id_here",
  "quantity": 25,
  "type": "stock-out",
  "reference": "SO-67890",
  "notes": "Sold to customer"
}
```

#### Get Transactions Query Parameters:
```
?page=1&limit=10&type=stock-in&product=prod_id&supplier=supp_id&startDate=2026-01-01&endDate=2026-01-31
```

---

## 📈 Dashboard & Reports

### Dashboard Routes (`/api/dashboard`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **GET** | `/api/dashboard/stats` | Get dashboard overview | All authenticated |
| **GET** | `/api/dashboard/alerts/low-stock` | Get low stock alerts | All authenticated |
| **GET** | `/api/dashboard/reports/inventory` | Get inventory report | All authenticated |
| **GET** | `/api/dashboard/reports/transactions` | Get transaction report | All authenticated |
| **GET** | `/api/dashboard/reports/stock-movement` | Get stock movement report | All authenticated |
| **GET** | `/api/dashboard/reports/suppliers` | Get supplier performance report | All authenticated |

#### Dashboard Stats Response:
```json
{
  "overview": {
    "totalProducts": 250,
    "totalSuppliers": 15,
    "totalUsers": 8,
    "lowStockProducts": 12,
    "outOfStockProducts": 3,
    "stockValue": {
      "totalValue": 125000.50,
      "totalQuantity": 5000
    }
  },
  "recentTransactions": [...],
  "productsByCategory": [...]
}
```

#### Inventory Report Query Parameters:
```
?category=Electronics&status=in-stock&minStock=0&maxStock=100
```

#### Transaction Report Query Parameters:
```
?startDate=2026-01-01&endDate=2026-01-31&type=stock-in
```

#### Stock Movement Report Query Parameters:
```
?days=30  // Default is 30 days
```

---

## 🔑 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Or token can be sent in cookies (httpOnly cookie named `token`).

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all operations |
| **Manager** | Create, read, update products, suppliers, transactions |
| **Staff** | Read products, create transactions |
| **Viewer** | Read-only access |

---

## 📝 Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ]
}
```

---

## 🚀 Quick Start

1. **Start the server:**
```bash
cd BackEnd
npm run dev
```

2. **Server will run on:**
```
http://localhost:3001
```

3. **Test the API:**
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@university.edu","password":"admin123"}'
```

---

## 📊 Features Implemented

### ✅ Product Management
- Complete CRUD operations
- Advanced search and filtering
- Pagination support
- Stock level tracking
- Low stock alerts
- Category management
- Supplier association

### ✅ Supplier Management
- Complete CRUD operations
- Active/inactive status
- Search functionality
- Supplier performance tracking

### ✅ Transaction Management
- Stock in/out operations
- Transaction history
- Stock level auto-update
- Transaction statistics
- Delete with stock reversal

### ✅ Dashboard & Analytics
- Real-time statistics
- Inventory value calculation
- Product category analysis
- Recent transaction tracking
- Low stock alerts

### ✅ Reports
- Inventory reports with filters
- Transaction reports by date range
- Stock movement analysis (30 days)
- Supplier performance metrics
- Exportable data format

### ✅ Security
- JWT authentication
- Role-based access control
- Input validation (Joi)
- Password hashing (bcrypt)
- MongoDB injection protection

### ✅ Code Quality
- Layered architecture (Routes → Controllers → Services → Models)
- Error handling middleware
- Request logging
- API response standardization
- DRY, KISS, YAGNI principles

---

## 🎯 Next Steps

**Frontend Integration:**
1. Connect product pages to `/api/products`
2. Connect supplier pages to `/api/suppliers`
3. Connect stock-in/out pages to `/api/transactions`
4. Connect dashboard to `/api/dashboard/stats`
5. Connect reports page to dashboard report endpoints

**Admin Can Perform:**
- ✅ Manage products (add, edit, delete, view)
- ✅ Manage suppliers (add, edit, delete, view)
- ✅ Record stock in transactions
- ✅ Record stock out transactions
- ✅ View inventory statistics
- ✅ Generate reports
- ✅ Manage users
- ✅ View low stock alerts
- ✅ Track transaction history

---

## 📞 Support

For issues or questions, check the logs in `BackEnd/logs/` directory.

**Your complete Amazon-style inventory management backend is ready!** 🎉
