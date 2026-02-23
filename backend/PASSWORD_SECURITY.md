# Password Security Guidelines

## 🔐 Critical Security Rules

### ⚠️ NEVER DO THIS:
```typescript
// ❌ WRONG - Storing plain text password
await prisma.user.update({
  where: { id: userId },
  data: { passwordHash: 'MyPassword123' }
});

// ❌ WRONG - Direct database update
UPDATE users SET password_hash = 'MyPassword123' WHERE email = 'user@example.com';
```

### ✅ ALWAYS DO THIS:
```typescript
// ✅ CORRECT - Use bcrypt hashing
import { hashPassword } from '@/common/utils/password.utils';

const hashedPassword = await hashPassword('MyPassword123');
await prisma.user.update({
  where: { id: userId },
  data: { passwordHash: hashedPassword }
});
```

---

## 📚 Password Operations

### 1. User Changes Their Own Password
**Location:** [`backend/src/modules/auth/auth.service.ts`](src/modules/auth/auth.service.ts)

```typescript
// Use the AuthService.changePassword method
await AuthService.changePassword(userId, {
  oldPassword: 'OldPass123!',
  newPassword: 'NewPass456!'
});
```

**Frontend Usage:**
```typescript
// In settings or profile page
await authService.changePassword({
  oldPassword: formData.oldPassword,
  newPassword: formData.newPassword
});
```

---

### 2. Admin Resets User Password
**Location:** [`backend/src/modules/admin/admin.service.ts`](src/modules/admin/admin.service.ts)

```typescript
// Admin can reset passwords for regular users
await adminService.resetUserPassword(
  userId,
  'NewPassword123!',
  adminId,
  'ADMIN'
);
```

---

### 3. Super Admin Updates Any User
**Location:** [`backend/src/modules/super-admin/super-admin.service.ts`](src/modules/super-admin/super-admin.service.ts)

```typescript
// Super admin can update any user including password
await superAdminService.updateUser(userId, {
  password: 'NewPassword123!'
}, superAdminId);
```

---

### 4. Password Reset via Email
**Location:** [`backend/src/modules/auth/auth.service.ts`](src/modules/auth/auth.service.ts)

```typescript
// Step 1: Request reset token
await AuthService.forgotPassword({ email: 'user@example.com' });

// Step 2: Reset with token
await AuthService.resetPassword({
  token: 'reset-token-from-email',
  newPassword: 'NewPassword123!'
});
```

---

### 5. Reset Superadmin Password (Emergency)
**Location:** [`backend/src/scripts/reset-superadmin.ts`](src/scripts/reset-superadmin.ts)

```bash
# Run this script to reset superadmin password
cd backend
npx tsx src/scripts/reset-superadmin.ts
```

**How to change the password:**
1. Edit the script and update the `password` variable
2. The script automatically hashes it with bcrypt (12 rounds)
3. Run the script to apply changes

---

## 🛡️ Password Hashing Standards

### Bcrypt Configuration
- **Algorithm:** bcrypt
- **Salt Rounds:** 12 (recommended for 2026 hardware)
- **Hash Time:** ~200ms on modern hardware
- **Storage:** 60 characters (bcrypt hash format)

### Why Bcrypt?
- **Adaptive:** Can increase rounds as hardware improves
- **Salted:** Each password gets a unique salt
- **Slow:** Intentionally slow to prevent brute force attacks
- **Industry Standard:** Used by major platforms

---

## 🔧 Utility Functions

### Import Password Utils
```typescript
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword
} from '@/common/utils/password.utils';
```

### Hash a Password
```typescript
const hashedPassword = await hashPassword('MySecurePass123!');
// Returns: $2a$12$randomSaltAndHash...
```

### Verify a Password
```typescript
const isValid = await verifyPassword(
  userInput,
  user.passwordHash
);
```

### Validate Password Strength
```typescript
try {
  validatePasswordStrength('weak'); // Throws error
  validatePasswordStrength('Strong@123'); // Passes
} catch (error) {
  console.error(error.message);
}
```

### Generate Secure Password
```typescript
const tempPassword = generateSecurePassword(16);
// Returns: "Xj9@mK2pLq7!Zr8v"
```

---

## 📋 Password Requirements

All passwords must meet these criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*...)

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid credentials" after password change

**Cause:** Password was updated in database without bcrypt hashing

**Solution:**
```bash
# Use reset script to properly hash and update
cd backend
npx tsx src/scripts/reset-superadmin.ts
```

---

### Issue: Old password hash format (10 rounds instead of 12)

**Cause:** Old seed script used bcrypt.hash(password, 10)

**Solution:** User's next password change will automatically use 12 rounds

---

## 🔍 Audit Trail

All password changes are logged in the audit system:

```typescript
// Automatic audit logging in AuthService
await AuditService.log({
  userId: user.id,
  action: 'PASSWORD_CHANGED',
  entityType: 'USER',
  entityId: user.id,
  ipAddress: req.ip
});
```

---

## 📞 Emergency Access

If you're locked out of the superadmin account:

1. **Navigate to backend:**
   ```bash
   cd backend
   ```

2. **Edit reset script** (`src/scripts/reset-superadmin.ts`):
   ```typescript
   const password = 'YourNewPassword123!';
   ```

3. **Run reset script:**
   ```bash
   npx tsx src/scripts/reset-superadmin.ts
   ```

4. **Login with new credentials:**
   - Email: `superadmin@shielder.com`
   - Password: (the one you set in step 2)

---

## 📝 Development Notes

- All password operations go through bcrypt
- SALT_ROUNDS constant ensures consistency
- Password changes invalidate all refresh tokens
- Email notifications sent on password changes
- Audit logs track all password modifications

---

**Last Updated:** February 22, 2026  
**Security Version:** 1.0  
**Bcrypt Version:** 2.4.3
