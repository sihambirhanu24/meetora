# Authentication & Security Documentation

## Overview

Meetora implements a comprehensive authentication system using industry-standard security practices. This document explains the authentication architecture, security decisions, and implementation details.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Email Verification](#email-verification)
5. [Password Reset Flow](#password-reset-flow)
6. [Change Password](#change-password)
7. [Authentication Strategy](#authentication-strategy)
8. [Security Decisions](#security-decisions)
9. [API Endpoints](#api-endpoints)
10. [Frontend Integration](#frontend-integration)
11. [Testing](#testing)

---

## Architecture Overview

### Backend Stack
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Password Hashing**: bcrypt (12 rounds)
- **Authentication**: JWT with HTTP-only cookies
- **Rate Limiting**: @nestjs/throttler
- **Email**: Nodemailer with console/SMTP provider support

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **State Management**: TanStack React Query
- **Forms**: React Hook Form
- **HTTP Client**: Axios with interceptors
- **Styling**: Tailwind CSS

### Security Layers
1. **Transport Security**: HTTPS enforced in production
2. **Password Security**: bcrypt hashing with salt rounds
3. **Token Security**: Cryptographically secure random tokens
4. **Session Security**: HTTP-only cookies with SameSite protection
5. **Input Validation**: Class-validator on backend, React Hook Form on frontend
6. **Rate Limiting**: Configurable per-endpoint throttling
7. **CORS**: Restricted to configured frontend origin

---

## Registration Flow

### Process
```
1. User submits registration form (first name, last name, email, password)
2. Frontend validates input
3. POST /api/auth/register
4. Backend validates DTO
5. Check for duplicate email (case-insensitive, normalized)
6. Hash password using bcrypt (12 rounds)
7. Generate secure email verification token
8. Store user in database with emailVerified=false
9. Send verification email
10. Return success message (do not auto-login)
```

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Security Considerations
- Email normalized (lowercase, trimmed) before storage
- Password never stored in plaintext
- Verification token has 24-hour expiration
- Generic success message to prevent user enumeration
- Rate limited to 5 requests per minute

---

## Login Flow

### Process
```
1. User submits email and password
2. Frontend validates input
3. POST /api/auth/login
4. Backend finds user by normalized email
5. Check account status (must be 'active')
6. Compare password with bcrypt
7. Generate JWT token
8. Set HTTP-only cookie
9. Return user information (sanitized)
10. Frontend redirects to dashboard
```

### JWT Configuration
- **Algorithm**: HS256
- **Expiration**: 7 days (configurable)
- **Storage**: HTTP-only cookie
- **SameSite**: Strict (CSRF protection)
- **Secure**: true in production (HTTPS only)

### Security Considerations
- Rate limited to 10 requests per minute
- Account status checked before authentication
- Constant-time password comparison
- JWT stored in HTTP-only cookie (not accessible to JavaScript)
- CSRF protection via SameSite cookie attribute

---

## Email Verification

### Process
```
1. User clicks verification link from email
2. GET /auth/verify-email?token={token}
3. POST /api/auth/verify-email with token
4. Backend validates token and expiration
5. Mark emailVerified=true
6. Clear verification token
7. Redirect to success page
```

### Token Security
- Generated using crypto.randomBytes(32)
- 64-character hexadecimal string
- 24-hour expiration
- Single-use (cleared after verification)
- Not exposed in error messages

### Email Configuration
- **Development**: Logs to console
- **Production**: SMTP configuration via environment variables
- Templates include branded HTML emails
- Links include full frontend URL

---

## Password Reset Flow

### Process
```
1. User requests password reset
2. POST /api/auth/forgot-password with email
3. Backend generates secure reset token
4. Token expires in 1 hour
5. Send reset email
6. Generic response (prevent user enumeration)
7. User clicks reset link
8. Submits new password
9. POST /api/auth/reset-password
10. Validate token and expiration
11. Hash new password
12. Update user record
13. Clear reset token
14. Redirect to login
```

### Security Considerations
- Generic response prevents email enumeration
- Reset token expires in 1 hour
- Single-use token (cleared after reset)
- New password must meet strength requirements
- Old password immediately invalidated
- Rate limited to 3 requests per minute

---

## Change Password

### Process
```
1. Authenticated user requests password change
2. POST /api/auth/change-password
3. Verify current password
4. Validate new password strength
5. Hash new password
6. Update user record
7. Return success
```

### Security Considerations
- Protected endpoint (requires authentication)
- Current password verification required
- New password must meet strength requirements
- Rate limited to 5 requests per minute
- No JWT invalidation (user stays logged in)

---

## Authentication Strategy

### JWT Strategy
- Uses Passport JWT strategy
- Token extracted from HTTP-only cookie (primary) or Authorization header (fallback)
- Validates user exists and is active on each request
- Returns sanitized user object

### Auth Guard
- Applied to protected routes via `@UseGuards(JwtAuthGuard)`
- Returns 401 Unauthorized if:
  - No token provided
  - Token expired or invalid
  - User not found or inactive

### User Sanitization
Protected fields never returned in API responses:
- `passwordHash`
- `passwordResetToken`
- `emailVerificationToken`

---

## Security Decisions

### Why bcrypt?
- Industry standard for password hashing
- Built-in salt generation
- Adjustable work factor (12 rounds chosen for balance)
- Resistant to GPU/ASIC attacks

### Why HTTP-only Cookies?
- Immune to XSS attacks (JavaScript cannot access)
- Automatic inclusion in requests
- SameSite attribute prevents CSRF
- Secure flag in production enforces HTTPS

### Why 7-day JWT Expiration?
- Balance between security and user experience
- Long enough to avoid frequent re-authentication
- Short enough to limit damage from token compromise
- Can be adjusted via environment variable

### Token Generation
- `crypto.randomBytes(32)` for verification/reset tokens
- Cryptographically secure random number generator
- 64-character hexadecimal output (256 bits entropy)

### Rate Limiting
- Prevents brute force attacks
- Configurable per-endpoint
- More restrictive on sensitive endpoints (forgot-password: 3/min)
- Less restrictive on general auth (login: 10/min)

### Email Normalization
- Lowercase conversion prevents duplicate accounts
- Trim whitespace prevents user errors
- Consistent format for lookups

---

## API Endpoints

### POST /api/auth/register
**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "accountStatus": "active",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already registered
- `429 Too Many Requests`: Rate limit exceeded

---

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "accountStatus": "active",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-01T10:00:00.000Z"
  }
}
```

**Sets Cookie:** `access_token` (HTTP-only, SameSite=Strict)

**Errors:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Invalid credentials or inactive account
- `429 Too Many Requests`: Rate limit exceeded

---

### POST /api/auth/logout
**Protected Route** (requires authentication)

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

**Clears Cookie:** `access_token`

---

### GET /api/auth/me
**Protected Route** (requires authentication)

**Response (200):**
```json
{
  "id": "uuid",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "accountStatus": "active",
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-01T10:00:00.000Z"
}
```

**Errors:**
- `401 Unauthorized`: Not authenticated

---

### POST /api/auth/verify-email
**Request:**
```json
{
  "token": "64-character-hex-string"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Errors:**
- `400 Bad Request`: Invalid or expired token

---

### POST /api/auth/forgot-password
**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If an account exists, password reset instructions have been sent."
}
```

**Notes:**
- Always returns success to prevent user enumeration
- Rate limited to 3 requests per minute

---

### POST /api/auth/reset-password
**Request:**
```json
{
  "token": "64-character-hex-string",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Errors:**
- `400 Bad Request`: Invalid/expired token or validation errors

---

### POST /api/auth/change-password
**Protected Route** (requires authentication)

**Request:**
```json
{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword123!"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Current password incorrect or not authenticated

---

## Frontend Integration

### API Client
- Centralized Axios instance with:
  - Base URL from environment variable
  - `withCredentials: true` for cookies
  - Response interceptor for 401 handling
  - Automatic redirect to login on unauthorized

### React Query Integration
- `useAuth()` hook for all auth operations
- Automatic refetching and cache invalidation
- Optimistic updates
- Error state management
- Loading states

### Protected Routes
Dashboard checks authentication status:
```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/sign-in');
  }
}, [isLoading, isAuthenticated, router]);
```

### Form Validation
- React Hook Form for form state management
- Client-side validation matching backend rules
- Real-time validation feedback
- Password strength indicators

---

## Testing

### Unit Tests
Located in `backend/src/auth/auth.service.spec.ts`

**Coverage:**
- ✅ Successful registration
- ✅ Duplicate email rejection
- ✅ Valid login
- ✅ Invalid password rejection
- ✅ Unknown email rejection
- ✅ Inactive account rejection
- ✅ Email verification success
- ✅ Invalid token rejection
- ✅ Password reset success
- ✅ Expired token rejection

### E2E Tests
Located in `backend/test/auth.e2e-spec.ts`

**Coverage:**
- ✅ Registration flow
- ✅ Login flow
- ✅ Protected route access
- ✅ Logout flow
- ✅ Cookie handling

### Running Tests
```bash
# Unit tests
cd backend
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/meetora"
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRATION="7d"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
EMAIL_FROM="noreply@meetora.com"
EMAIL_PROVIDER="console"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## Future Enhancements

### Ready for Implementation
The authentication architecture is designed to cleanly support:

1. **Google OAuth**
   - Add Google strategy to Passport
   - Create OAuth callback endpoint
   - Link OAuth accounts to existing users
   - Handle account creation from OAuth

2. **Two-Factor Authentication (2FA)**
   - Add 2FA fields to User model
   - Implement TOTP generation/verification
   - Add 2FA setup/disable endpoints
   - Update login flow to check 2FA status

3. **Session Management**
   - Track active sessions per user
   - Allow users to view/revoke sessions
   - Add refresh token rotation

4. **Account Recovery**
   - Security questions
   - Backup codes
   - Account recovery flow

---

## Troubleshooting

### Common Issues

**"Invalid credentials" on correct password**
- Check password hashing is working
- Verify bcrypt comparison
- Check account status

**"Cannot set headers after they are sent"**
- Check for multiple response sends
- Verify exception handling

**CORS errors on frontend**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in main.ts
- Ensure credentials: true on both sides

**Cookies not being set**
- Check secure flag in production
- Verify sameSite configuration
- Ensure domain matches

**Email not sending**
- Check EMAIL_PROVIDER setting
- Verify SMTP credentials in production
- Check console logs in development

---

## Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT in HTTP-only cookies
- [x] Rate limiting on auth endpoints
- [x] CORS restricted to frontend origin
- [x] Input validation on all endpoints
- [x] Secure token generation
- [x] Token expiration implemented
- [x] User enumeration prevented
- [x] Error messages don't leak information
- [x] No sensitive data in JWT payload
- [x] Account status checking
- [x] Email normalization
- [x] Password strength requirements
- [x] HTTPS enforced in production
- [x] Environment variables for secrets

---

## Maintenance

### Updating JWT Secret
1. Generate new secure secret
2. Update JWT_SECRET in .env
3. Restart backend
4. All existing tokens will be invalidated
5. Users will need to log in again

### Changing Password Requirements
Update regex in:
- `backend/src/auth/dto/register.dto.ts`
- `backend/src/auth/dto/reset-password.dto.ts`
- `backend/src/auth/dto/change-password.dto.ts`
- `frontend/src/app/auth/sign-up/page.tsx`
- `frontend/src/app/auth/reset-password/page.tsx`

### Adjusting Rate Limits
Update values in:
- `backend/src/app.module.ts` (global)
- `backend/src/auth/auth.controller.ts` (per-endpoint)

---

## Support

For issues or questions about the authentication system, refer to:
- This documentation
- NestJS Authentication docs: https://docs.nestjs.com/security/authentication
- Passport JWT docs: https://www.passportjs.org/packages/passport-jwt/
- Next.js App Router docs: https://nextjs.org/docs/app

---

**Last Updated:** October 1, 2026
**Module Version:** 1.0.0
**Status:** Production Ready
