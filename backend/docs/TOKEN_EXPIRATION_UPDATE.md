# Token Expiration & Server Restart Configuration

## Changes Implemented

### 1. Token Expiration Reduced to 1 Day
**File**: `/BackEnd/.env`
```
JWT_EXPIRES_IN=1d
```
- Changed from 7 days to 1 day
- Tokens now expire after 24 hours

### 2. Server Instance ID System
**Purpose**: Automatically invalidate all tokens when server restarts

#### How It Works:
1. **Server Generates Unique ID** - On each restart, a unique timestamp-based ID is created
2. **ID Stored in Token** - Every JWT token includes the server instance ID (`sid`)
3. **Validation on Each Request** - Middleware checks if token's `sid` matches current server's `sid`
4. **Auto-Logout on Restart** - If server restarts, all old tokens are invalidated

### 3. Files Modified

#### A. `/BackEnd/index.js`
```javascript
// Generate unique server instance ID on each restart
global.SERVER_INSTANCE_ID = Date.now().toString();
console.log('🔄 Server Instance ID:', global.SERVER_INSTANCE_ID);
```

#### B. `/BackEnd/services/authService.js`
**generateToken() method**:
```javascript
const payload = {
  id: user._id,
  email: user.email,
  role: user.role,
  sid: global.SERVER_INSTANCE_ID, // Server Instance ID
};
```

**verifyToken() method**:
```javascript
// Check if token was issued by current server instance
if (decoded.sid !== global.SERVER_INSTANCE_ID) {
  throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please login again.');
}
```

#### C. `/BackEnd/middleware/auth.js`
**authenticate() middleware**:
```javascript
// Check if token was issued by current server instance
if (decoded.sid !== global.SERVER_INSTANCE_ID) {
  logger.warn('Token from previous server instance detected');
  throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please login again.');
}
```

### 4. Behavior

#### Before Changes:
- ❌ Tokens valid for 7 days
- ❌ Users stay logged in even after server restart
- ❌ Old tokens remain valid indefinitely (until expiration)

#### After Changes:
- ✅ Tokens valid for 1 day only
- ✅ All users automatically logged out when server restarts
- ✅ Users must re-login after server restart
- ✅ Enhanced security with automatic session invalidation

### 5. User Experience

**When Server Restarts**:
1. User tries to access any protected page/endpoint
2. Frontend sends old token (with old `sid`)
3. Backend validates token and detects mismatched `sid`
4. Backend returns: `401 Unauthorized - "Session expired. Please login again."`
5. Frontend automatically redirects to login page
6. User must login again with credentials

**When Token Expires (24 hours)**:
1. Same as above - 401 Unauthorized
2. User redirected to login page
3. Must re-authenticate

### 6. Security Benefits

✅ **Automatic Session Cleanup** - No stale sessions after deployment/restart
✅ **Reduced Attack Window** - Tokens expire in 1 day instead of 7
✅ **Server-Side Control** - Server restart invalidates all sessions
✅ **Audit Trail** - Server instance ID logged for debugging
✅ **Zero Config** - No database cleanup needed for old tokens

### 7. Testing

**Test 1: Token Expiration**
1. Login to application
2. Wait 24+ hours
3. Try to access any page
4. Should be redirected to login

**Test 2: Server Restart**
1. Login to application
2. Restart backend server (`npm start`)
3. Try to access any page or make API call
4. Should be redirected to login
5. Check browser console - should see "Session expired" error

**Test 3: Normal Flow**
1. Login to application
2. Use system normally within 24 hours
3. System should work without re-login
4. Token auto-refreshes on each request (if implemented)

### 8. Current Server Instance

```
Server Instance ID: 1769653032123
Started: 2026-01-29 07:17:12
```

All tokens issued before this restart are now invalid.

### 9. Future Enhancements (Optional)

- [ ] Implement token refresh mechanism (extend session without re-login)
- [ ] Add "Remember Me" option (longer expiration for specific users)
- [ ] Store active sessions in Redis for better control
- [ ] Add session management UI in admin panel
- [ ] Implement graceful logout notification before expiration

---

## Summary

Your application now has:
- ✅ **1-day token expiration**
- ✅ **Automatic logout on server restart**
- ✅ **Enhanced security**
- ✅ **Server instance tracking**

All existing sessions are invalidated. Users must re-login to continue using the system.
