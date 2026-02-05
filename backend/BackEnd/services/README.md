# Services Layer

This directory contains the business logic layer of the application. Services handle all business operations and coordinate between controllers and data access.

## Architecture Pattern

Following the **Separation of Concerns** principle:

```
Routes → Controllers → Services → Models → Database
```

## Services

### authService.js
Handles authentication operations:
- User registration
- User login
- JWT token generation
- Token verification

### userService.js
Handles user management operations:
- Create user
- Find user by email/ID
- Get all users with pagination
- Update user
- Delete user
- Change password
- Update last login

## Service Responsibilities

Services are responsible for:
1. **Business Logic** - All business rules and validations
2. **Data Orchestration** - Coordinating multiple data operations
3. **Error Handling** - Catching and formatting errors
4. **Logging** - Recording important operations
5. **Event Emission** - Triggering events for notifications (future)

## Usage Example

```javascript
import authService from '../services/authService.js';

// In a controller
const result = await authService.login(email, password);
```

## Best Practices

1. Keep services stateless
2. Don't include HTTP-specific code
3. Use dependency injection where possible
4. Log all important operations
5. Handle all errors gracefully
6. Never expose sensitive data
