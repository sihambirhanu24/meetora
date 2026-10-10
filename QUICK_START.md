# Meetora - Quick Start Guide

Get Meetora running in 5 minutes.

---

## Step 1: Database Setup (5 minutes)

### Automated (Recommended):
```bash
cd ~/Desktop/liveproject
./setup-database.sh
```

### Manual:
```bash
sudo -u postgres psql
CREATE USER meetora WITH PASSWORD 'meetora123';
CREATE DATABASE meetora OWNER meetora;
GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;
\c meetora
GRANT ALL ON SCHEMA public TO meetora;
\q

cd ~/Desktop/liveproject/backend
npx prisma generate
npx prisma migrate dev --name initial_user_model
```

---

## Step 2: Start Backend (30 seconds)

```bash
cd ~/Desktop/liveproject/backend
npm run start:dev
```

**Wait for:**
```
🚀 Meetora API running on http://localhost:3001/api
```

---

## Step 3: Start Frontend (30 seconds)

**Open new terminal:**

```bash
cd ~/Desktop/liveproject/frontend
npm run dev
```

**Wait for:**
```
▲ Next.js 14.1.0
- Local:        http://localhost:3000
```

---

## Step 4: Test the Application (2 minutes)

### Quick Smoke Test:

1. **Open browser:** http://localhost:3000
2. **Click:** "Sign Up"
3. **Fill form:**
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@meetora.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
4. **Submit:** Wait for success message
5. **Check backend console:** Copy verification token from email log
6. **Verify email:** Visit `http://localhost:3000/auth/verify-email?token=PASTE_TOKEN_HERE`
7. **Login:** Go to sign-in, use email/password from step 3
8. **Dashboard:** Should see your user information

### API Test:

```bash
# Test registration endpoint
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "API",
    "lastName": "Test",
    "email": "api@meetora.com",
    "password": "Test123!@#"
  }'
```

**Expected:** 201 Created with user object

---

## Common Issues

### "Cannot connect to database"
**Solution:** Run database setup (Step 1)

### "Port 3000 already in use"
**Solution:** Kill other process or use different port:
```bash
PORT=3001 npm run dev
```

### "Port 3001 already in use"  
**Solution:** Kill backend process:
```bash
pkill -f "nest start"
```

### Email verification token not showing
**Solution:** Check backend console output, it's logged there

### Cannot access dashboard after login
**Solution:** Check browser console for errors, verify cookies are enabled

---

## Useful Commands

### View Database:
```bash
cd ~/Desktop/liveproject/backend
npx prisma studio
```
Opens at http://localhost:5555

### View Backend Logs:
Backend terminal shows all requests and email logs

### Clear Database (Reset):
```bash
cd ~/Desktop/liveproject/backend
npx prisma migrate reset
```

### Run Tests:
```bash
cd ~/Desktop/liveproject/backend
npm test              # Unit tests
npm run test:e2e      # E2E tests
```

---

## What to Test

See `TESTING_GUIDE.md` for comprehensive test cases, but at minimum test:

- [x] Registration
- [x] Email verification
- [x] Login
- [x] Dashboard access
- [x] Logout
- [x] Password reset
- [x] Protected routes

---

## Next Steps

1. ✅ Complete `TESTING_GUIDE.md` test suites
2. ✅ Run automated tests (`npm test`)
3. ✅ Run security audit (`npm audit`)
4. ✅ Review `FINAL_STATUS_REPORT.md`
5. ✅ Check `docs/authentication.md` for architecture details

---

## Support

- **Documentation:** See `/docs` folder
- **Issues:** Check `FINAL_STATUS_REPORT.md` for known issues
- **Testing:** Follow `TESTING_GUIDE.md`
- **Architecture:** Read `docs/authentication.md`

---

**You're ready!** 🚀

After database setup, Meetora should be fully functional for local development and testing.
