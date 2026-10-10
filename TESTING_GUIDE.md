# Meetora Testing Guide

**Purpose:** Step-by-step instructions for testing all authentication features after database setup.

---

## Prerequisites

Before testing, ensure:
- ✅ Database setup complete (`./setup-database.sh` ran successfully)
- ✅ Backend running on http://localhost:3001/api
- ✅ Frontend running on http://localhost:3000

---

## Test Suite 1: User Registration

### Test 1.1: Valid Registration

**Steps:**
1. Navigate to http://localhost:3000
2. Click "Sign Up" button
3. Fill in the form:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@example.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
4. Click "Create Account"

**Expected Result:**
- ✅ Success message: "Registration successful. Please check your email..."
- ✅ User object returned (no password hash visible)
- ✅ Backend console shows email verification link
- ✅ Redirects or shows success state

**Backend Console Output:**
```
📧 Email sent (console mode):
To: john.doe@example.com
Subject: Verify your Meetora account
HTML: <verification link with token>
```

**Copy the token from the link for next test.**

---

### Test 1.2: Duplicate Email Registration

**Steps:**
1. Try to register with same email: `john.doe@example.com`
2. Use different name and password

**Expected Result:**
- ❌ Error: "Email already registered"
- ❌ Status code: 409 Conflict
- ✅ No user created in database

---

### Test 1.3: Invalid Email Format

**Steps:**
1. Try to register with email: `invalid-email`
2. Fill other fields correctly

**Expected Result:**
- ❌ Validation error: "Invalid email address"
- ❌ Form shows error before submission
- ✅ Request blocked by frontend validation

---

### Test 1.4: Weak Password

**Steps:**
1. Try to register with password: `weak`
2. Fill other fields correctly

**Expected Result:**
- ❌ Validation error: "Password must be at least 8 characters"
- ❌ Error: "Password must contain uppercase, lowercase, number, and special character"
- ✅ Form validation prevents submission

---

### Test 1.5: Password Mismatch

**Steps:**
1. Password: `Test123!@#`
2. Confirm Password: `Different123!@#`

**Expected Result:**
- ❌ Validation error: "Passwords do not match"
- ✅ Cannot submit form

---

## Test Suite 2: Email Verification

### Test 2.1: Valid Verification Token

**Steps:**
1. Get token from backend console (registration email)
2. Navigate to: `http://localhost:3000/auth/verify-email?token={TOKEN}`

**Expected Result:**
- ✅ Loading spinner briefly appears
- ✅ Success message: "Email Verified!"
- ✅ Green checkmark icon displayed
- ✅ "Go to Sign In" button appears
- ✅ Database: `emailVerified` = true
- ✅ Database: `emailVerificationToken` = null

**Database Verification:**
```bash
cd ~/Desktop/liveproject/backend
npx prisma studio
# Check users table, emailVerified should be true
```

---

### Test 2.2: Invalid Verification Token

**Steps:**
1. Navigate to: `http://localhost:3000/auth/verify-email?token=invalid-token-12345`

**Expected Result:**
- ❌ Error message: "Invalid or expired verification token"
- ❌ Red X icon displayed
- ✅ "Back to Sign In" button appears

---

### Test 2.3: Expired Verification Token

**Steps:**
1. Register a user
2. Wait 24+ hours (or manually update database to expire token)
3. Try to verify

**Expected Result:**
- ❌ Error: "Invalid or expired verification token"
- ✅ Token expiration enforced

---

## Test Suite 3: User Login

### Test 3.1: Valid Login

**Steps:**
1. Navigate to http://localhost:3000/auth/sign-in
2. Email: `john.doe@example.com`
3. Password: `Test123!@#`
4. Click "Sign In"

**Expected Result:**
- ✅ Success message or immediate redirect
- ✅ Redirects to http://localhost:3000/dashboard
- ✅ Dashboard shows user information
- ✅ Cookie `access_token` set (check DevTools)

**Browser DevTools Check:**
```
Application → Cookies → http://localhost:3000
Cookie Name: access_token
HttpOnly: ✓
SameSite: Strict
```

---

### Test 3.2: Wrong Password

**Steps:**
1. Email: `john.doe@example.com`
2. Password: `WrongPassword123!`
3. Click "Sign In"

**Expected Result:**
- ❌ Error: "Invalid credentials" (generic message)
- ❌ No redirect
- ❌ No cookie set
- ✅ Status: 401 Unauthorized

---

### Test 3.3: Non-existent Email

**Steps:**
1. Email: `nonexistent@example.com`
2. Password: `Test123!@#`
3. Click "Sign In"

**Expected Result:**
- ❌ Error: "Invalid credentials" (same as wrong password)
- ✅ No information about whether email exists (security)

---

### Test 3.4: Unverified Email Login

**Steps:**
1. Register new user but don't verify email
2. Try to login with those credentials

**Expected Result:**
- ✅ Login succeeds (current implementation allows unverified login)
- ℹ️ Note: Email verification is tracked but not enforced for login

**Optional Security Enhancement:**
If you want to block unverified users from logging in:
```typescript
// In backend/src/auth/auth.service.ts login method, add:
if (!user.emailVerified) {
  throw new UnauthorizedException('Please verify your email before logging in');
}
```

---

## Test Suite 4: Protected Routes

### Test 4.1: Access Dashboard While Authenticated

**Steps:**
1. Login first (Test 3.1)
2. Navigate to http://localhost:3000/dashboard

**Expected Result:**
- ✅ Dashboard loads successfully
- ✅ Shows user info: name, email, verification status
- ✅ "Logout" button visible

---

### Test 4.2: Access Dashboard Without Authentication

**Steps:**
1. Clear cookies or use incognito window
2. Navigate directly to http://localhost:3000/dashboard

**Expected Result:**
- ❌ Cannot access dashboard
- ✅ Automatically redirects to http://localhost:3000/auth/sign-in
- ✅ Loading spinner shown briefly

---

### Test 4.3: API Access Without Token

**Steps:**
```bash
curl -X GET http://localhost:3001/api/auth/me
```

**Expected Result:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### Test 4.4: API Access With Valid Token

**Steps:**
1. Login via browser (get cookie)
2. Extract token from cookie
3. Make API request:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: access_token=YOUR_TOKEN_HERE"
```

**Expected Result:**
```json
{
  "id": "uuid-here",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "emailVerified": true,
  "accountStatus": "active",
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Should NOT contain:**
- ❌ passwordHash
- ❌ passwordResetToken
- ❌ emailVerificationToken

---

## Test Suite 5: Logout

### Test 5.1: Successful Logout

**Steps:**
1. Login first
2. Go to dashboard
3. Click "Logout" button

**Expected Result:**
- ✅ Redirects to http://localhost:3000/auth/sign-in
- ✅ Cookie `access_token` cleared
- ✅ Cannot access dashboard anymore

**Verification:**
```bash
# Try to access protected endpoint
curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: access_token=EXPIRED_TOKEN"
```
Expected: 401 Unauthorized

---

## Test Suite 6: Password Reset

### Test 6.1: Request Password Reset

**Steps:**
1. Navigate to http://localhost:3000/auth/forgot-password
2. Enter email: `john.doe@example.com`
3. Click "Send Reset Link"

**Expected Result:**
- ✅ Success message: "If an account exists, password reset instructions have been sent"
- ✅ Backend console shows reset email with token
- ✅ Generic message (no indication if email exists - security)

**Backend Console Output:**
```
📧 Email sent (console mode):
Subject: Reset your Meetora password
HTML: <reset link with token>
```

**Copy the token for next test.**

---

### Test 6.2: Request Reset for Non-existent Email

**Steps:**
1. Enter email: `nonexistent@example.com`
2. Click "Send Reset Link"

**Expected Result:**
- ✅ Same success message as Test 6.1
- ✅ No email sent (check backend console)
- ✅ No indication email doesn't exist (prevents enumeration)

---

### Test 6.3: Reset Password with Valid Token

**Steps:**
1. Get reset token from backend console
2. Navigate to: `http://localhost:3000/auth/reset-password?token={TOKEN}`
3. New Password: `NewTest123!@#`
4. Confirm Password: `NewTest123!@#`
5. Click "Reset Password"

**Expected Result:**
- ✅ Success message: "Password reset successfully"
- ✅ Redirects to sign-in after 2 seconds
- ✅ Database: passwordResetToken cleared
- ✅ Old password no longer works
- ✅ New password works for login

**Verification:**
```bash
# Try old password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"Test123!@#"}'
# Expected: 401 Unauthorized

# Try new password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@example.com","password":"NewTest123!@#"}'
# Expected: 200 OK with user object
```

---

### Test 6.4: Reset with Invalid Token

**Steps:**
1. Navigate to: `http://localhost:3000/auth/reset-password?token=invalid-token`
2. Try to reset password

**Expected Result:**
- ❌ Error: "Invalid or expired reset token"
- ❌ Cannot reset password

---

### Test 6.5: Reset with Expired Token

**Steps:**
1. Request password reset
2. Wait 1+ hours (or manually update database)
3. Try to use expired token

**Expected Result:**
- ❌ Error: "Invalid or expired reset token"
- ✅ Token expiration enforced (1 hour timeout)

---

### Test 6.6: Reuse Reset Token

**Steps:**
1. Use reset token successfully
2. Try to use same token again

**Expected Result:**
- ❌ Error: "Invalid or expired reset token"
- ✅ Token is single-use (cleared after successful reset)

---

## Test Suite 7: Change Password

### Test 7.1: Change Password While Authenticated

**Steps:**
1. Login to get valid session
2. Make API request:
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "currentPassword": "NewTest123!@#",
    "newPassword": "AnotherTest123!@#"
  }'
```

**Expected Result:**
```json
{
  "message": "Password changed successfully"
}
```
- ✅ Old password no longer works
- ✅ New password works for login
- ✅ User stays logged in (JWT still valid)

---

### Test 7.2: Change Password with Wrong Current Password

**Steps:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "currentPassword": "WrongPassword123!",
    "newPassword": "AnotherTest123!@#"
  }'
```

**Expected Result:**
```json
{
  "statusCode": 401,
  "message": "Current password is incorrect"
}
```

---

### Test 7.3: Change Password Without Authentication

**Steps:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "NewTest123!@#",
    "newPassword": "AnotherTest123!@#"
  }'
```

**Expected Result:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## Test Suite 8: Input Validation

### Test 8.1: Missing Required Fields

**Test Registration without First Name:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "lastName": "Doe",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Expected Result:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "firstName",
      "errors": ["firstName should not be empty"]
    }
  ]
}
```

---

### Test 8.2: Invalid Data Types

**Test with number instead of string:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": 123,
    "lastName": "Doe",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Expected Result:**
- ❌ Validation error
- ✅ Type checking enforced

---

## Test Suite 9: Rate Limiting

### Test 9.1: Login Rate Limit

**Steps:**
```bash
# Send 15 login requests rapidly
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
  sleep 0.5
done
```

**Expected Result:**
- First 10 requests: 401 Unauthorized (wrong password)
- Requests 11-15: 429 Too Many Requests
- After 1 minute: Rate limit resets

---

### Test 9.2: Registration Rate Limit

**Similar test with registration endpoint**

**Expected Result:**
- First 5 requests: Processed (409 if duplicate)
- Requests 6+: 429 Too Many Requests

---

### Test 9.3: Password Reset Rate Limit

**Expected Result:**
- First 3 requests per minute: Processed
- Requests 4+: 429 Too Many Requests
- More restrictive than login (3 vs 10)

---

## Test Suite 10: Security Verification

### Test 10.1: Password Storage

**Check Database:**
```bash
cd ~/Desktop/liveproject/backend
npx prisma studio
# Navigate to users table
# Check passwordHash field
```

**Expected:**
- ✅ Starts with `$2b$12$` (bcrypt with 12 rounds)
- ✅ Never plaintext password visible
- ✅ Different users have different hashes even with same password

---

### Test 10.2: JWT Cookie Security

**Browser DevTools Check:**
```
Application → Cookies → http://localhost:3000
```

**Verify:**
- ✅ HttpOnly: true (JavaScript cannot access)
- ✅ SameSite: Strict (CSRF protection)
- ✅ Secure: true (in production, HTTPS only)
- ✅ Max-Age: 604800 seconds (7 days)

---

### Test 10.3: CORS Protection

**From different origin:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Origin: http://malicious-site.com" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}'
```

**Expected Result:**
- ❌ CORS error (blocked by browser)
- ✅ Only http://localhost:3000 allowed

---

### Test 10.4: SQL Injection Prevention

**Try SQL injection in email:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com OR 1=1--","password":"anything"}'
```

**Expected Result:**
- ✅ Treated as literal string
- ❌ No SQL injection (Prisma parameterizes queries)
- ✅ Returns "Invalid credentials"

---

### Test 10.5: XSS Prevention

**Try HTML/JavaScript in name:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "<script>alert(\"XSS\")</script>",
    "lastName": "Doe",
    "email": "xss@example.com",
    "password": "Test123!@#"
  }'
```

**Expected Result:**
- ✅ Stored as plain text (sanitized on display)
- ✅ When displayed in dashboard, no script execution
- ✅ React automatically escapes HTML

---

## Test Suite 11: Error Handling

### Test 11.1: Network Error Handling

**Steps:**
1. Stop backend server
2. Try to login from frontend

**Expected Result:**
- ✅ User-friendly error message
- ✅ No uncaught exceptions
- ✅ Clear indication backend is unavailable

---

### Test 11.2: Database Connection Error

**Steps:**
1. Stop PostgreSQL
2. Try to make API requests

**Expected Result:**
- ✅ 500 Internal Server Error
- ✅ Generic error message (no stack trace)
- ✅ Error logged on backend

---

## Test Results Checklist

After completing all tests, use this checklist:

### Core Functionality
- [ ] User can register
- [ ] User receives verification email
- [ ] User can verify email
- [ ] User can login
- [ ] User can logout
- [ ] User can access dashboard when authenticated
- [ ] User cannot access dashboard when not authenticated
- [ ] User can request password reset
- [ ] User can reset password
- [ ] User can change password while authenticated

### Security
- [ ] Passwords are hashed (bcrypt)
- [ ] JWT stored in HTTP-only cookie
- [ ] Protected routes require authentication
- [ ] Rate limiting prevents brute force
- [ ] CORS blocks unauthorized origins
- [ ] SQL injection prevented
- [ ] XSS prevented
- [ ] User enumeration prevented
- [ ] Tokens expire appropriately
- [ ] Tokens are single-use

### Validation
- [ ] Email format validated
- [ ] Password strength enforced
- [ ] Required fields enforced
- [ ] Type checking works
- [ ] Duplicate email prevented

### Error Handling
- [ ] Validation errors shown to user
- [ ] Network errors handled gracefully
- [ ] Generic auth errors prevent enumeration
- [ ] No sensitive info in error messages

---

## Bug Reporting Template

If you find issues during testing, document them:

```markdown
**Bug Title:** [Brief description]

**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Logs:**
[If applicable]

**Environment:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Database: PostgreSQL (version)
- Browser: [Chrome/Firefox/etc.]
```

---

## Performance Testing

### Response Time Benchmarks

**Registration:**
```bash
time curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"perf@test.com","password":"Test123!@#"}'
```
**Expected:** < 500ms (bcrypt hashing takes time)

**Login:**
```bash
time curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"perf@test.com","password":"Test123!@#"}'
```
**Expected:** < 300ms

**Get Current User:**
```bash
time curl -X GET http://localhost:3001/api/auth/me \
  -H "Cookie: access_token=TOKEN"
```
**Expected:** < 100ms

---

## Next Steps After Testing

1. **Document Results:** Fill in the checklist above
2. **Report Bugs:** Use bug template for any failures
3. **Update Tests:** Add test cases that were missed
4. **Security Audit:** Run `npm audit` on both projects
5. **Code Review:** Review authentication logic for improvements
6. **Performance:** Optimize slow endpoints if needed
7. **Documentation:** Update README with test results

---

**Testing Completion:** [ ] All tests passed  
**Date Tested:** __________  
**Tested By:** __________
