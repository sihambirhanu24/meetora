# 🚀 Meetora - Meeting & Collaboration Platform

Production-ready SaaS communication platform built with **NestJS** and **Next.js**.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running
- npm or yarn

### Start Development

```bash
# Run health check
./RUN_MEETORA.sh

# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

**Open:** http://localhost:3000

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Daily development commands |
| **[REPAIR_FINAL_REPORT.md](REPAIR_FINAL_REPORT.md)** | Complete repair documentation |
| **[QUICK_START.md](QUICK_START.md)** | 5-minute setup guide |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)** | Comprehensive test procedures |
| **[docs/authentication.md](docs/authentication.md)** | Architecture deep dive |

---

## 🏗️ Tech Stack

### Backend
- **NestJS** 10.4.22 - Enterprise Node.js framework
- **Prisma** 5.22.0 - Type-safe ORM
- **PostgreSQL** 18.6 - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js** 14.1.0 - React framework
- **TypeScript** 5.3.3 - Type safety
- **Tailwind CSS** 3.4.19 - Styling
- **React Query** 5.104.1 - Server state

---

## ✅ Current Status

**Module 1: Authentication & Security** - ✅ **COMPLETE**

Implemented Features:
- ✅ User registration with validation
- ✅ Email verification
- ✅ Secure login (JWT + HTTP-only cookies)
- ✅ Password reset flow
- ✅ Change password
- ✅ Protected routes
- ✅ Rate limiting
- ✅ Input validation
- ✅ CORS protection

**Database:** Configured and migrated  
**Tests:** 10/10 unit tests passing  
**Build:** Both frontend and backend compile successfully

---

## 🔐 Authentication Endpoints

- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (protected)

---

## 🛠️ Development

### Backend Commands
```bash
npm run start:dev      # Start dev server
npm test               # Run unit tests
npm run test:e2e       # Run E2E tests
npm run build          # Build for production
npx prisma studio      # Open database GUI
```

### Frontend Commands
```bash
npm run dev            # Start dev server
npm run build          # Build for production
```

### Database Commands
```bash
npx prisma migrate dev       # Create and apply migration
npx prisma generate          # Generate Prisma Client
npx prisma migrate status    # Check migration status
npx prisma studio            # Open database GUI
```

---

## 📁 Project Structure

```
liveproject/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── auth/         # Authentication module
│   │   ├── prisma/       # Database service
│   │   ├── email/        # Email service
│   │   └── main.ts       # Entry point
│   ├── prisma/
│   │   ├── schema.prisma # Database schema
│   │   └── migrations/   # Migration history
│   ├── test/             # Tests
│   └── .env              # Environment config
│
├── frontend/             # Next.js app
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── features/    # Feature modules
│   │   └── lib/         # Utilities
│   └── .env.local       # Frontend config
│
└── docs/                # Documentation
```

---

## 🗄️ Database

**PostgreSQL** database with Prisma ORM

**Tables:**
- `users` - User accounts with authentication data
- `_prisma_migrations` - Migration history

**Schema:** See `backend/prisma/schema.prisma`

**GUI:** Run `npx prisma studio` to view/edit data

---

## 🔒 Security

- ✅ **Password Hashing:** bcrypt with 12 rounds
- ✅ **JWT Tokens:** HTTP-only cookies, 7-day expiration
- ✅ **Rate Limiting:** Prevents brute force attacks
- ✅ **Input Validation:** class-validator
- ✅ **CORS:** Restricted to frontend URL
- ✅ **SQL Injection:** Prevented by Prisma ORM
- ✅ **XSS Protection:** HTTP-only cookies
- ✅ **User Enumeration:** Generic error messages

---

## 🧪 Testing

### Run Tests
```bash
cd backend
npm test              # Unit tests (10/10 passing)
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report
```

### Manual Testing
See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive test scenarios.

---

## 🌐 Deployment

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRATION="7d"
FRONTEND_URL="https://your-domain.com"
EMAIL_PROVIDER="smtp"  # or "console" for dev
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### Production Checklist
- [ ] Generate strong JWT secret (256-bit)
- [ ] Configure real email service (SMTP)
- [ ] Enable HTTPS
- [ ] Set secure cookie attributes
- [ ] Configure database backups
- [ ] Set up monitoring/logging
- [ ] Review rate limit thresholds
- [ ] Run security audit

---

## 📊 Recent Changes

**October 10, 2026** - Database & Authentication Repair
- ✅ Created initial Prisma migration
- ✅ Applied schema to PostgreSQL
- ✅ Fixed "users table does not exist" error
- ✅ Verified all authentication endpoints
- ✅ Comprehensive documentation added

See [REPAIR_FINAL_REPORT.md](REPAIR_FINAL_REPORT.md) for complete details.

---

## 🤝 Contributing

This project follows:
- **Code Style:** ESLint + Prettier
- **Git Commits:** Conventional Commits
- **Testing:** All features must have tests
- **Documentation:** Update docs with changes

---

## 📝 License

UNLICENSED - Private project

---

## 🆘 Support

**Issues?** Check troubleshooting in [QUICK_REFERENCE.md](QUICK_REFERENCE.md)

**Questions?** See detailed docs:
- Architecture: `docs/authentication.md`
- Testing: `TESTING_GUIDE.md`
- Setup: `QUICK_START.md`

---

## 🎯 Next Steps

1. **Start Development**
   ```bash
   ./RUN_MEETORA.sh  # Check prerequisites
   # Follow the terminal instructions
   ```

2. **Test Authentication**
   - Open http://localhost:3000
   - Try registration and login
   - Test password reset flow

3. **Explore Database**
   ```bash
   cd backend && npx prisma studio
   ```

4. **Read Documentation**
   - Start with `QUICK_REFERENCE.md`
   - Review `REPAIR_FINAL_REPORT.md`

---

**Built with ❤️ for learning and production deployment**

**Status:** ✅ Ready for Module 2 development  
**Last Updated:** October 10, 2026
