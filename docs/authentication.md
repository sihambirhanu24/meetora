# Meetora — Authentication & Security

> Module 1 implementation documentation.  
> This document explains **why** the architecture is built this way, not just what files exist.

---

## Table of Contents

1. [Overview](#overview)
2. [Registration Flow](#registration-flow)
3. [Email Verification](#email-verification)
4. [Login Flow](#login-flow)
5. [Authentication Architecture](#authentication-architecture)
6. [Password Hashing](#password-hashing)
7. [Token & Session Strategy](#token--session-strategy)
8. [Protected Routes](#protected-routes)
9. [Password Reset](#password-reset)
10. [Change Password](#change-password)
11. [Logout](#logout)
12. [Security Decisions](#security-decisions)
13. [API Reference](#api-reference)
14. [Extension Points (Google OAuth & 2FA)](#extension-points)

---

## Overview

Meetora's authentication system is built as a layered, security-first foundation. The design separates concerns clearly:

```
Request → Controller (HTTP) → Service (business logic) → Database (Prisma)
                              ↓
                          EmailService (side effects)
```

Sensitive operations (password hashing, token generation) never live in controllers. Controllers handle HTTP shape; services own correctness.

---

## Registration Flow

```
Frontend form
   ↓
React Hook Form validation (client-side, UX only)
   ↓
POST /api/auth/register
   ↓
ThrottlerGuard (5 req/min)
   ↓
ValidationPipe + RegisterDto (server-side validation)
   ↓
AuthService.register()
   ↓
Normalize email to lowercase (prevents duplicate accounts with different casing)
   ↓
Check for existing user (throws 409 Conflict if found)
   ↓
bcrypt.hash(password, 12) — NEVER store plaintext
   ↓
crypto.randomBytes(32).toString('hex') — 256-bit verification token
   ↓
prisma.user.create({ ... }) — verification token stored in DB
   ↓
EmailService.sendVerificationEmail()
   ↓
Return sanitized user (passwordHash stripped)
```

**Why email normalization?** `John@Example.COM` and `john@example.com` are the same address. We normalize before all lookups and storage so the uniqueness constraint is effective.

**Why not auto-verify?** Auto-verifying email allows throwaway addresses. Requiring verification reduces spam registrations and confirms the user controls the inbox.

**Why 256-bit tokens?** A 32-byte random token (hex-encoded to 64 chars) has 2^256 possible values — brute-forcing is computationally infeasible.

---

## Email Verification

```
User clicks link in email → /auth/verify-email?token=<hex>
   ↓
Frontend reads token from query param
   ↓
POST /api/auth/verify-email { token }
   ↓
prisma.user.findFirst({ where: { emailVerificationToken: token, expiresAt: { gte: now } } })
   ↓
If not found → 400 Bad Request (covers both invalid AND expired — no info leak)
   ↓
prisma.user.update({ emailVerified: true, token: null, expiresAt: null })
```

**Why clear the token after use?** Tokens must be single-use. If an attacker intercepts a used token, it must not work again.

**Why check expiration in the DB query?** Combining the token lookup with the expiry check in one query means expired tokens and invalid tokens return the same error. This prevents timing-based enumeration (an attacker cannot distinguish "expired" from "never existed").

**Local development**: When `EMAIL_PROVIDER=console`, emails are logged to stdout instead of sent. The verification link is printed and usable immediately.

---

## Login Flow

```
POST /api/auth/login { email, password }
   ↓
ThrottlerGuard (10 req/min)
   ↓
Normalize email
   ↓
prisma.user.findUnique({ email })
   ↓
If null → UnauthorizedException("Invalid credentials") — same error as wrong password
   ↓
Check accountStatus === "active" — suspended/deleted accounts cannot log in
   ↓
bcrypt.compare(submittedPassword, user.passwordHash)
   ↓
If false → UnauthorizedException("Invalid credentials")
   ↓
jwtService.sign({ sub: userId, email }) → accessToken
   ↓
response.cookie("access_token", token, { httpOnly: true, ... })
   ↓
Return { user: sanitizedUser, message: "Login successful" }
```

**Why the same error for "user not found" and "wrong password"?** Different errors allow user enumeration — an attacker could detect which emails are registered. `"Invalid credentials"` reveals nothing.

**Why an HTTP-only cookie instead of `localStorage`?** `localStorage` is accessible to any JavaScript on the page, making it vulnerable to XSS. An HTTP-only cookie cannot be read by JavaScript — the browser sends it automatically but JS cannot steal it.

---

## Authentication Architecture

### JWT Strategy (Passport)

The JWT strategy (`JwtStrategy`) is registered as a Passport strategy. It:

1. Extracts the token from the HTTP-only cookie first, falls back to `Authorization: Bearer` header
2. Verifies the JWT signature using `JWT_SECRET`
3. Checks expiration
4. Calls `AuthService.validateUser(payload.sub)` to confirm the user still exists and is active

This two-step validation (JWT signature + live DB check) means:
- Suspended accounts are blocked even if their token hasn't expired yet
- Deleted accounts cannot authenticate with old tokens

### JwtAuthGuard

```typescript
@UseGuards(JwtAuthGuard)  // Apply to any endpoint that requires authentication
```

The guard calls Passport's `AuthGuard('jwt')`. If validation fails, NestJS automatically returns `401 Unauthorized`. The guard is **not** responsible for authorization (roles/permissions) — that is a separate concern for Module 2+.

### CurrentUser Decorator

```typescript
@Get('me')
@UseGuards(JwtAuthGuard)
async getCurrentUser(@CurrentUser() user: SafeUser) {
  return user;
}
```

The `@CurrentUser()` decorator reads `request.user` (populated by the JWT strategy after successful validation). This keeps controllers clean — no manual JWT parsing anywhere.

---

## Password Hashing

**Algorithm:** bcrypt with work factor 12.

**Why bcrypt?** bcrypt is an adaptive hashing algorithm designed specifically for passwords. Its key properties:
- **Slow by design**: bcrypt at factor 12 takes ~250ms per hash — fast enough for login UX, too slow for bulk cracking
- **Salted**: bcrypt automatically generates and stores a unique salt per hash, preventing rainbow table attacks
- **Adaptive**: the work factor can be increased as hardware improves, without re-hashing existing passwords

**Why factor 12?** Factor 12 is the current OWASP recommendation for bcrypt. Factor 10 (default) is too fast on modern hardware; factor 14+ causes perceptible login delays.

```typescript
// Hash (registration, password change/reset)
const hash = await bcrypt.hash(password, 12);

// Verify (login, change-password current-password check)  
const isValid = await bcrypt.compare(submittedPassword, storedHash);
```

**Rules enforced:**
- Minimum 8 characters
- At least one uppercase letter
- At least one special character (`@$!%*?&`)

---

## Token & Session Strategy

| Property | Value |
|---|---|
| Token type | JWT (JSON Web Token) |
| Storage | HTTP-only cookie (`access_token`) |
| Expiration | 7 days |
| Signing algorithm | HS256 (HMAC-SHA256) |
| Secret source | `JWT_SECRET` env var |

**JWT payload:**
```json
{ "sub": "<userId>", "email": "<email>", "iat": ..., "exp": ... }
```

No sensitive data (passwordHash, tokens, PII beyond email) is embedded in the JWT.

**Cookie settings:**
```typescript
{
  httpOnly: true,          // JS cannot read
  secure: true,            // HTTPS only (production)
  sameSite: 'none',        // Cross-domain requests (production)
  maxAge: 7 * 24 * 60 * 60 * 1000
}
```

In development, `secure: false` and `sameSite: 'lax'` are used because localhost uses HTTP.

---

## Protected Routes

Any NestJS endpoint decorated with `@UseGuards(JwtAuthGuard)` requires a valid authenticated session:

```
GET  /api/auth/me           ← requires auth
POST /api/auth/logout       ← requires auth
POST /api/auth/change-password ← requires auth
```

Unauthenticated requests receive:
```json
{ "statusCode": 401, "message": "Unauthorized" }
```

**Frontend protection**: The `useAuth` hook's `useQuery(['currentUser'])` fetches `/api/auth/me` on mount. If it fails (401), the app knows the user is not authenticated and redirects to sign-in.

---

## Password Reset

```
POST /api/auth/forgot-password { email }
   ↓
ThrottlerGuard (3 req/min — stricter limit)
   ↓
Normalize email
   ↓
Look up user (but ALWAYS return the same message regardless)
   ↓
If user found:
   - Generate 256-bit reset token
   - Set expiry: now + 1 hour
   - Store token in passwordResetToken field
   - Send email with link: /auth/reset-password?token=<hex>
   ↓
Return: "If an account exists, password reset instructions have been sent."
```

```
POST /api/auth/reset-password { token, newPassword }
   ↓
findFirst({ passwordResetToken: token, expiresAt: { gte: now } })
   ↓
If null → 400 (invalid or expired — same error)
   ↓
bcrypt.hash(newPassword, 12)
   ↓
Update: { passwordHash, passwordResetToken: null, passwordResetExpiresAt: null }
```

**Why the generic forgot-password response?** Telling the user "no account with that email" reveals which emails are registered. Generic responses prevent enumeration attacks where an attacker probes millions of addresses.

**Why 1-hour expiry?** Password reset tokens are high-privilege (they let anyone who has one reset the password). Short expiry limits the window of exploitation if the email is intercepted.

**Why clear the token after use?** Reset tokens must be single-use. After a successful reset, the old token is invalidated — it cannot be reused.

---

## Change Password

```
POST /api/auth/change-password   ← Requires authentication
{ currentPassword, newPassword }
   ↓
JwtAuthGuard → confirms authenticated user
   ↓
AuthService.changePassword(user.id, dto)
   ↓
Fetch user from DB by ID
   ↓
bcrypt.compare(currentPassword, user.passwordHash)
   ↓
If false → 401 Unauthorized
   ↓
bcrypt.hash(newPassword, 12)
   ↓
prisma.user.update({ passwordHash: newHash })
```

**Why verify current password?** Anyone who gets hold of an authenticated session (stolen cookie) could change the password without knowing the original. Requiring the current password adds a second factor — only the real user knows it.

---

## Logout

```
POST /api/auth/logout
   ↓
JwtAuthGuard (must be authenticated to logout)
   ↓
response.clearCookie("access_token", { ...same options as set })
   ↓
Return { message: "Logout successful" }
```

After logout, `GET /api/auth/me` returns `401` because the cookie is gone and no valid token is sent.

**Why require auth for logout?** This prevents CSRF-driven logout attacks where a third-party page forces a logout request. The user must already hold the cookie for the guard to pass.

---

## Security Decisions

| Threat | Mitigation |
|---|---|
| Plaintext password storage | bcrypt with factor 12 |
| Token leakage via XSS | HTTP-only cookie |
| CSRF | `sameSite` cookie attribute; auth required for logout |
| User enumeration | Identical error messages for "not found" vs "wrong password" |
| Weak passwords | DTO validation: length, uppercase, special char |
| Brute force login | Throttler: 10 req/min on login |
| Brute force reset | Throttler: 3 req/min on forgot-password |
| Sensitive data in API responses | `sanitizeUser()` strips all secret fields before every return |
| Insecure CORS | Explicit allowlist in `main.ts`, credentials required |
| Secrets in codebase | All secrets in `.env`, `.env` in `.gitignore` |
| Account takeover after suspension | JWT strategy re-validates `accountStatus` on every request |
| Stale sessions after password reset | JWT tokens are stateless — future: add token blacklist or rotation |

---

## API Reference

| Method | Path | Auth | Rate Limit | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | 5/min | Create account |
| POST | `/api/auth/verify-email` | No | 10/min | Verify email token |
| POST | `/api/auth/login` | No | 10/min | Login, sets cookie |
| POST | `/api/auth/logout` | **Yes** | — | Clear auth cookie |
| GET  | `/api/auth/me` | **Yes** | — | Current user info |
| POST | `/api/auth/forgot-password` | No | 3/min | Request password reset |
| POST | `/api/auth/reset-password` | No | 5/min | Submit reset token + new password |
| POST | `/api/auth/change-password` | **Yes** | 5/min | Change password (requires current) |

---

## Extension Points

The architecture is designed to cleanly accept these future additions **without** changing existing code:

### Google OAuth

The `GoogleStrategy` and `GoogleAuthGuard` stubs are already in place:

```
backend/src/auth/strategies/google.strategy.ts
backend/src/auth/guards/google-auth.guard.ts
```

`AuthService.googleLogin()` exists and handles both new Google users and existing accounts. To activate:
1. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` in `.env`
2. Enable the guard on the Google routes in `auth.controller.ts`
3. No other changes required

### Two-Factor Authentication (2FA)

The `User` model has spare fields available. To add 2FA:
1. Add `twoFactorSecret String?` and `twoFactorEnabled Boolean @default(false)` to the Prisma schema
2. Create `TwoFactorService` using `speakeasy` or `otplib`
3. Add a `POST /api/auth/2fa/setup` and `POST /api/auth/2fa/verify` endpoint
4. The login flow can be extended: after password check passes, if `twoFactorEnabled`, return a partial token that only grants access to the 2FA verify endpoint

### Role-Based Authorization

The `JwtAuthGuard` currently only checks authentication (is the user logged in?). Authorization (can this user do this action?) is a separate layer. When workspaces and teams are introduced:
1. Create a `RolesGuard` that reads roles from the workspace membership
2. Create a `@Roles(...)` decorator
3. The existing `JwtAuthGuard` remains unchanged — compose the guards
