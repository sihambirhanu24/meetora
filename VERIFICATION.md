# Module 1 Verification Guide

This guide walks through the complete verification process for the Authentication & Security module.

## Prerequisites

Before starting, ensure you have:
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- npm or yarn package manager

## Quick Start

### 1. Run Setup Script

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Create PostgreSQL database and user
- Install backend dependencies
- Run Prisma migrations
- Install frontend dependencies
- Create environment files

### 2. Start Backend

```bash
cd backend
npm run start:dev
```

Expected output:
```
🚀 Meetora API running on http://localhost:3001/api
```

### 3. Start Frontend

In a new terminal:
```bash
cd frontend
npm run dev
```

Expected output:
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

## Manual Verification Steps

### Step 1: Register a User

1. Open http://localhost:3000
2. Click "Sign Up"
3. Fill in the registration form:
   - First Name: John
   - Last Name: Doe
   - Email: john@example.com
   - Password: Password123!
   - Confirm Password: Password123!
4. Click "Create Account"

**Expected Result:**
- Success message: "Registration successful. Please check your email..."
- Email logged to backend console with verification link

### Step 2: Verify Email

1. Check the backend console for the verification email
2. Copy the verification token from the link
3. Open: http://localhost:3000/auth/verify-email?token={TOKEN}

**Expected Result:**
- Success message: "Email verified successfully"
- Option to sign in

### Step 3: Login

1. Go to http://localhost:3000/auth/sign-in
2. Enter credentials:
   - Email: john@example.com
   - Password: Password123!
3. Click "Sign In"

**Expected Result:**
- Redirect to dashboard at /dashboard
- User information displayed
- Email verified badge shown

### Step 4: Access Protected Route

1. While logged in, verify you can access:
   - http://localhost:3000/dashboard

2. Log out by clicking "Logout"

3. Try to access http://localhost:3000/dashboard again

**Expected Result:**
- After logout: Redirected to /auth/sign-in
- Cannot access dashboard without authentication

### Step 5: Test GET /api/auth/me

**While logged in:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  --cookie "access_token=YOUR_JWT_TOKEN"
```

**Expected:** 200 OK with user data

**While logged out:**
```bash
curl -X GET http://localhost:3001/api/auth/me
```

**Expected:** 401 Unauthorized

### Step 6: Test Password Reset Flow

1. Go to http://localhost:3000/auth/forgot-password
2. Enter email: john@example.com
3. Click "Send Reset Link"

**Expected Result:**
- Generic success message
- Reset email logged to backend console

4. Copy reset token from backend console
5. Open: http://localhost:3000/auth/reset-password?token={TOKEN}
6. Enter new password: NewPassword123!
7. Confirm password
8. Click "Reset Password"

**Expected Result:**
- Success message
- Redirect to sign-in
- Can login with new password
- Old password no longer works

### Step 7: Test Change Password

1. Login to dashboard
2. Use API to change password:

```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  --cookie "access_token=YOUR_JWT_TOKEN" \
  -d '{
    "currentPassword": "NewPassword123!",
    "newPassword": "AnotherPassword123!"
  }'
```

**Expected Result:**
- 200 OK
- Message: "Password changed successfully"
- Can login with new password

### Step 8: Test Validation

Try registering with invalid data:

**Weak password:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "weak"
  }'
```

**Expected:** 400 Bad Request with validation error

**Invalid email:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "invalid-email",
    "password": "Password123!"
  }'
```

**Expected:** 400 Bad Request with validation error

**Duplicate email:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

**Expected:** 409 Conflict

### Step 9: Test Rate Limiting

Run the same request multiple times rapidly:

```bash
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
```

**Expected Result:**
- First 10 requests: 401 Unauthorized (rate limit not hit)
- Requests 11+: 429 Too Many Requests

### Step 10: Test Error Handling

**Invalid JWT:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  --cookie "access_token=invalid.jwt.token"
```

**Expected:** 401 Unauthorized with proper error format

**Invalid endpoint:**
```bash
curl -X GET http://localhost:3001/api/nonexistent
```

**Expected:** 404 Not Found with proper error format

## Running Automated Tests

### Backend Unit Tests

```bash
cd backend
npm test
```

**Expected:** All tests pass
- Registration tests
- Login tests
- Email verification tests
- Password reset tests

### Backend E2E Tests

```bash
cd backend
npm run test:e2e
```

**Expected:** All integration tests pass
- Registration flow
- Login flow
- Protected routes
- Logout flow

### Backend Test Coverage

```bash
cd backend
npm run test:cov
```

**Expected:** Coverage report generated in `coverage/` directory

## Build Verification

### Backend Build

```bash
cd backend
npm run build
```

**Expected Result:**
- No TypeScript errors
- Compiled output in `dist/` directory

**Start production build:**
```bash
npm run start:prod
```

**Expected:** Server starts successfully

### Frontend Build

```bash
cd frontend
npm run build
```

**Expected Result:**
- No TypeScript errors
- Next.js build succeeds
- Static pages generated

**Start production build:**
```bash
npm run start
```

**Expected:** Application accessible on http://localhost:3000

## Database Verification

### Check Prisma Schema

```bash
cd backend
npx prisma studio
```

**Expected:**
- Prisma Studio opens at http://localhost:5555
- Users table visible
- Can view registered users
- All fields present and correct types

### Verify Migrations

```bash
cd backend
npx prisma migrate status
```

**Expected:** Migration status shows all migrations applied

### Check Database

```bash
psql -U meetora -d meetora -c "\dt"
```

**Expected Output:**
```
         List of relations
 Schema |  Name  | Type  |  Owner  
--------+--------+-------+---------
 public | users  | table | meetora
 public | _prisma_migrations | table | meetora
```

## Security Verification

### Check Password Hashing

1. Register a user
2. Query database:

```bash
psql -U meetora -d meetora -c "SELECT \"passwordHash\" FROM users LIMIT 1;"
```

**Expected:** Hash starts with `$2b$` (bcrypt)

### Check Cookie Security

1. Login via frontend
2. Open browser DevTools > Application > Cookies
3. Find `access_token` cookie

**Expected Attributes:**
- HttpOnly: ✓
- SameSite: Strict
- Secure: ✓ (in production)

### Check JWT Payload

Decode the JWT token (use jwt.io):

**Expected Payload:**
```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "iat": 1696147200,
  "exp": 1696752000
}
```

**Should NOT contain:**
- passwordHash
- passwordResetToken
- emailVerificationToken

### Verify CORS

Try accessing from different origin:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Origin: http://malicious.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'
```

**Expected:** CORS error or request blocked

## Checklist

Use this checklist to verify all functionality:

- [ ] PostgreSQL database created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] User registration works
- [ ] Email verification works
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes work
- [ ] GET /api/auth/me works when authenticated
- [ ] GET /api/auth/me returns 401 when not authenticated
- [ ] Password reset flow works
- [ ] Change password works
- [ ] Password validation works
- [ ] Email validation works
- [ ] Duplicate email prevented
- [ ] Rate limiting works
- [ ] Error handling works
- [ ] Backend tests pass
- [ ] Backend E2E tests pass
- [ ] Backend build succeeds
- [ ] Frontend build succeeds
- [ ] Passwords are hashed (bcrypt)
- [ ] JWT in HTTP-only cookie
- [ ] CORS configured correctly
- [ ] Email normalization works
- [ ] Tokens expire correctly
- [ ] User enumeration prevented
- [ ] Documentation complete

## Troubleshooting

### Backend won't start

**Check PostgreSQL:**
```bash
sudo systemctl status postgresql
# or on macOS:
brew services list
```

**Check .env file:**
```bash
cd backend
cat .env
```

Verify DATABASE_URL is correct.

### Frontend won't connect to backend

**Check CORS configuration:**
- Verify FRONTEND_URL in backend/.env
- Verify NEXT_PUBLIC_API_URL in frontend/.env.local

**Check both servers running:**
- Backend: http://localhost:3001/api
- Frontend: http://localhost:3000

### Database connection error

**Test connection:**
```bash
psql -U meetora -d meetora -c "SELECT 1;"
```

If fails, recreate database:
```bash
sudo -u postgres psql
DROP DATABASE IF EXISTS meetora;
CREATE DATABASE meetora;
CREATE USER meetora WITH PASSWORD 'meetora123';
GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;
\q
```

### Prisma migration error

**Reset database:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
```

### Tests fail

**Check test database:**
```bash
DATABASE_URL="postgresql://meetora:meetora123@localhost:5432/meetora_test?schema=public" npm test
```

### Build fails

**Check TypeScript errors:**
```bash
cd backend
npx tsc --noEmit

cd ../frontend
npx tsc --noEmit
```

## Success Criteria

Module 1 is successfully implemented when:

1. ✅ All manual verification steps pass
2. ✅ All automated tests pass
3. ✅ Both builds succeed without errors
4. ✅ Documentation is complete
5. ✅ Security checklist items verified
6. ✅ No TypeScript errors
7. ✅ No console errors in browser
8. ✅ Protected routes work correctly
9. ✅ All authentication flows functional
10. ✅ Rate limiting prevents abuse

---

**Last Updated:** October 1, 2026
**Module:** 1 - Authentication & Security
**Status:** Ready for Verification
