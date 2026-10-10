# Meetora - Quick Reference Guide

**For Daily Development Work**

---

## 🚀 Start Development Servers

### Terminal 1: Backend
```bash
cd ~/Desktop/liveproject/backend
npm run start:dev
```
**Wait for:** `🚀 Meetora API running on http://localhost:3001/api`

---

### Terminal 2: Frontend
```bash
cd ~/Desktop/liveproject/frontend
npm run dev
```
**Wait for:** `▲ Next.js 14.1.0 - Local: http://localhost:3000`

---

### Terminal 3: Database GUI (Optional)
```bash
cd ~/Desktop/liveproject/backend
npx prisma studio
```
**Opens:** http://localhost:5555

---

## 🔧 Common Commands

### Database Commands
```bash
cd ~/Desktop/liveproject/backend

# View migration status
npx prisma migrate status

# Generate Prisma Client (after schema changes)
npx prisma generate

# Create new migration (after schema changes)
npx prisma migrate dev --name describe_your_change

# Reset database (DANGEROUS - deletes all data)
npx prisma migrate reset

# Open database GUI
npx prisma studio
```

### Backend Commands
```bash
cd ~/Desktop/liveproject/backend

# Start development server
npm run start:dev

# Build for production
npm run build

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Check TypeScript errors
npx tsc --noEmit

# Lint code
npm run lint
```

### Frontend Commands
```bash
cd ~/Desktop/liveproject/frontend

# Start development server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

---

## 📍 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application UI |
| Backend API | http://localhost:3001/api | REST API endpoints |
| Prisma Studio | http://localhost:5555 | Database viewer/editor |

---

## 🔐 Authentication Endpoints

### Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "Password123!@#"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!@#"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123!@#"
}
```

### Get Current User (Protected)
```bash
GET /api/auth/me
Cookie: access_token=<jwt-token>
```

### Logout
```bash
POST /api/auth/logout
Cookie: access_token=<jwt-token>
```

### Verify Email
```bash
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification-token-from-email"
}
```

### Change Password (Protected)
```bash
POST /api/auth/change-password
Cookie: access_token=<jwt-token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!@#",
  "newPassword": "NewPassword123!@#"
}
```

---

## 🗄️ Database Quick Access

### Connect to PostgreSQL
```bash
# Using password authentication
PGPASSWORD=meetora123 psql -U meetora -d meetora -h localhost

# Once connected, useful commands:
\dt              # List all tables
\d users         # Describe users table
\q               # Quit
```

### Quick Queries
```sql
-- View all users
SELECT email, "firstName", "lastName", "emailVerified", "accountStatus" FROM users;

-- Count users
SELECT COUNT(*) FROM users;

-- Delete test users
DELETE FROM users WHERE email LIKE '%test%';

-- View user by email
SELECT * FROM users WHERE email = 'user@example.com';
```

---

## 🐛 Troubleshooting

### "Port 3001 already in use"
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill

# Or
pkill -f "nest start"
```

### "Port 3000 already in use"
```bash
# Next.js will auto-increment to 3001, 3002, etc.
# Or manually kill:
pkill -f "next-server"
```

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
systemctl status postgresql

# If not running:
sudo systemctl start postgresql
```

### "Prisma Client needs to be regenerated"
```bash
cd ~/Desktop/liveproject/backend
npx prisma generate
```

### "Migration is not applied"
```bash
cd ~/Desktop/liveproject/backend
npx prisma migrate deploy
```

---

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://meetora:meetora123@localhost:5432/meetora"
SHADOW_DATABASE_URL="postgresql://meetora:meetora123@localhost:5432/meetora_shadow"
JWT_SECRET="meetora-secret-key-..."
JWT_EXPIRATION="7d"
NODE_ENV="development"
PORT=3001
FRONTEND_URL="http://localhost:3000"
EMAIL_PROVIDER="console"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🧪 Testing

### Test a Complete Flow
```bash
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@example.com","password":"Test123!@#"}'

# 2. Check backend console for verification token

# 3. Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  -c cookies.txt

# 4. Access protected route
curl -X GET http://localhost:3001/api/auth/me -b cookies.txt

# 5. Request password reset
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# 6. Check backend console for reset token
```

---

## 📦 Project Structure

```
liveproject/
├── backend/
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── prisma/         # Prisma service
│   │   ├── email/          # Email service
│   │   └── main.ts         # Application entry
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Migration history
│   ├── test/               # Tests
│   └── .env                # Environment variables
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   ├── features/      # Feature modules
│   │   └── lib/           # Utilities
│   └── .env.local         # Frontend env vars
└── docs/                  # Documentation
```

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT in HTTP-only cookies
- [x] CORS restricted
- [x] Rate limiting enabled
- [x] Input validation active
- [x] SQL injection prevented (Prisma ORM)
- [x] Token expiration enforced
- [ ] HTTPS (production only)
- [ ] Real email service (production)

---

## 📚 Important Files

| File | Purpose |
|------|---------|
| `REPAIR_FINAL_REPORT.md` | Complete repair documentation |
| `START_HERE.md` | Project overview |
| `QUICK_START.md` | 5-minute setup |
| `TESTING_GUIDE.md` | Comprehensive testing |
| `backend/prisma/schema.prisma` | Database structure |
| `backend/.env` | Backend configuration |
| `frontend/.env.local` | Frontend configuration |

---

## ⚡ Pro Tips

### 1. View Logs in Real-Time
Backend logs show all requests and emails sent in console mode. Watch them while testing!

### 2. Use Prisma Studio
Best way to view and edit database records visually. No SQL needed!

### 3. Check Migration Status
Before making schema changes, always check current migration status:
```bash
npx prisma migrate status
```

### 4. Clean Test Data
Regularly clean up test users:
```sql
DELETE FROM users WHERE email LIKE '%test%';
```

### 5. Backend Console Shows Emails
In development, emails are logged to backend console with tokens and links. Copy these for testing!

---

## 🎯 What Was Fixed

**Main Issue:** `The table public.users does not exist in the current database`

**Fixed By:**
1. Creating database migration
2. Applying schema to PostgreSQL
3. Generating Prisma Client

**Result:** All authentication endpoints now work correctly! ✅

---

## 📞 Need Help?

1. Read `REPAIR_FINAL_REPORT.md` for complete details
2. Check `TESTING_GUIDE.md` for test scenarios
3. View `docs/authentication.md` for architecture
4. Use Prisma Studio to inspect database

---

**Last Updated:** October 10, 2026  
**Status:** ✅ Ready for Development
