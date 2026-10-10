# Meetora Repair Plan

**Status:** Ready to Execute  
**Estimated Time:** 1 hour for critical repairs  
**Goal:** Get project into runnable, verifiable state

---

## Phase 1: Critical Blockers (Required Before Testing)

### Task 1.1: Fix Frontend Tailwind CSS Error ⛔

**Issue:** `border-border` class doesn't exist, preventing all builds

**Root Cause Analysis:**
```css
/* globals.css line 23 */
@layer base {
  * {
    @apply border-border;  /* ← References undefined CSS variable */
  }
}
```

- Tailwind 3.4.1 installed (correct)
- No `border` color defined in theme
- No `--border` CSS variable defined

**Solution Options:**

**Option A: Remove the utility (RECOMMENDED)**
- Simple, no side effects
- Border styles can be applied where needed
- Follows Tailwind best practices

**Option B: Define border color in config**
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      border: 'hsl(var(--border))',
    }
  }
}
```
- Requires adding CSS variable
- More complexity
- Not needed for current features

**Chosen Solution:** Option A - Remove unused utility

**Files to Modify:**
- `frontend/src/app/globals.css`

**Verification:**
```bash
cd frontend && npm run build
# Should succeed without errors
```

---

### Task 1.2: Setup PostgreSQL Database ⛔

**Issue:** Database user and database don't exist

**Current State:**
- PostgreSQL 18.6 installed ✅
- User `meetora` doesn't exist ❌
- Database `meetora` doesn't exist ❌
- Cannot connect to database ❌

**Commands to Execute:**
```sql
-- Connect as postgres superuser
sudo -u postgres psql

-- Create user
CREATE USER meetora WITH PASSWORD 'meetora123';

-- Create database
CREATE DATABASE meetora OWNER meetora;

-- Grant privileges (PostgreSQL 15+ syntax)
GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;

-- Connect to database and grant schema privileges
\c meetora
GRANT ALL ON SCHEMA public TO meetora;

-- Exit
\q
```

**Verification:**
```bash
# Test connection
psql -U meetora -d meetora -c "SELECT version();"
# Should show PostgreSQL version
```

**Security Note:**
- Password `meetora123` is weak but acceptable for local development
- Production deployment MUST use strong password
- Store production credentials in secret manager, not .env

---

### Task 1.3: Generate Prisma Client and Run Migrations ⛔

**Issue:** Prisma client not generated, no migrations exist

**Commands to Execute:**
```bash
cd backend

# 1. Generate Prisma client
npx prisma generate

# 2. Create initial migration
npx prisma migrate dev --name initial_user_model

# 3. Verify migration applied
npx prisma migrate status
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ The following migration(s) have been created and applied:
  migrations/
    └─ 20241210_initial_user_model/
       └─ migration.sql
```

**What This Does:**
1. Generates TypeScript types for database access
2. Creates migration SQL file from schema
3. Applies migration to database
4. Creates `users` table with all auth fields

**Verification:**
```bash
# Check table exists
psql -U meetora -d meetora -c "\dt"
# Should show: users table

# Check schema
psql -U meetora -d meetora -c "\d users"
# Should show all columns
```

---

### Task 1.4: Verify Backend Starts

**Commands:**
```bash
cd backend
npm run start:dev
```

**Expected Output:**
```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] INFO [RoutesResolver] AuthController {/api/auth}:
[Nest] INFO [RouterExplorer] Mapped {/api/auth/register, POST}
...
🚀 Meetora API running on http://localhost:3001/api
```

**Test Endpoint:**
```bash
# Test health/registration endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
# Should return 201 with user object or validation error
```

---

## Phase 2: Verification (Required Before Claiming Complete)

### Task 2.1: Run Backend Tests

```bash
cd backend

# Run unit tests
npm test

# Run E2E tests (requires running database)
npm run test:e2e

# Generate coverage
npm run test:cov
```

**Expected:** Tests should pass or show specific failures to fix

### Task 2.2: Manual Feature Testing

Follow VERIFICATION.md steps 1-10:
1. Start backend
2. Start frontend
3. Test registration
4. Check email in console
5. Test email verification
6. Test login
7. Test dashboard access
8. Test logout
9. Test password reset
10. Test change password

**Document:** Any failures, errors, or unexpected behavior

### Task 2.3: Security Audit

```bash
# Check for vulnerabilities
cd backend && npm audit
cd ../frontend && npm audit

# Check secrets in git
git log --all --full-history -- "*.env"
# Should be empty

# Verify JWT secret
grep JWT_SECRET backend/.env
# Should be long, random string in production
```

---

## Phase 3: Documentation Correction

### Task 3.1: Update README

Remove or qualify "✅ Complete" claims until verification passes.

Change:
```markdown
- [x] **Module 1: Authentication & Security** ✅ Complete
```

To:
```markdown
- [x] **Module 1: Authentication & Security** 🔄 Implementation Complete, Verification In Progress
```

### Task 3.2: Create Honest Completion Report

Replace MODULE_1_REPORT.md with actual test results:
- Tests run: [list]
- Tests passing: X/Y
- Manual testing results: [details]
- Known issues: [list]
- Security findings: [list]

---

## Success Criteria

Phase 1 Complete When:
- [ ] Frontend builds without errors
- [ ] Backend connects to database
- [ ] Migrations applied successfully
- [ ] Backend starts without errors
- [ ] Can make API request successfully

Phase 2 Complete When:
- [ ] Unit tests executed (pass or documented failures)
- [ ] E2E tests executed (pass or documented failures)
- [ ] Manual testing of all auth flows completed
- [ ] Security audit completed
- [ ] All findings documented

Phase 3 Complete When:
- [ ] README reflects actual status
- [ ] Completion report has real evidence
- [ ] Known issues documented
- [ ] Next steps clear

---

## Execution Order

1. Fix Tailwind CSS (5 min)
2. Setup PostgreSQL (10 min)
3. Run Prisma migrations (5 min)
4. Test backend startup (5 min)
5. Test frontend startup (5 min)
6. Run unit tests (10 min)
7. Run E2E tests (10 min)
8. Manual testing (30 min)
9. Security audit (15 min)
10. Update documentation (15 min)

**Total: ~2 hours for complete verification**

---

## Risk Assessment

**Low Risk:**
- Tailwind fix (just removing a line)
- Database setup (standard PostgreSQL)
- Running migrations (Prisma handles it)

**Medium Risk:**
- Tests might fail and need fixes
- Manual testing might reveal bugs
- Security audit might find issues

**High Risk:**
- None identified (no data loss, no security breaches)

---

## Rollback Plan

If anything goes wrong:

**Frontend:**
```bash
git checkout frontend/src/app/globals.css
```

**Database:**
```bash
# Drop and recreate
sudo -u postgres psql
DROP DATABASE meetora;
DROP USER meetora;
# Re-run setup
```

**Migrations:**
```bash
cd backend
npx prisma migrate reset
# Re-run migrations
```

---

## Ready to Execute

All tasks are clearly defined, low risk, and reversible.

Proceed with Phase 1?
