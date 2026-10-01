# Meetora

A production-oriented SaaS communication and video-conferencing platform.

## Project Structure

```
meetora/
├── frontend/     # Next.js frontend application
├── backend/      # NestJS backend API
├── docs/         # Documentation
└── README.md
```

## Technology Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query

### Backend
- NestJS
- TypeScript
- Prisma
- PostgreSQL

## Getting Started

### Quick Setup

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will set up the database, install dependencies, and configure environment variables.

### Manual Setup

#### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure database connection in .env
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

The API will be available at http://localhost:3001/api

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Configure API URL in .env.local
npm run dev
```

The application will be available at http://localhost:3000

### Verification

See [VERIFICATION.md](./VERIFICATION.md) for complete testing and verification instructions.

## Documentation

See the `/docs` folder for detailed documentation on:
- Authentication & Security
- API endpoints
- Development guidelines

## Development Status

- [x] **Module 1: Authentication & Security** ✅ Complete
  - User registration with email verification
  - Secure login with JWT authentication
  - Password reset functionality
  - Change password functionality
  - Protected routes and session management
  - Rate limiting and error handling
  - Comprehensive test coverage
  - Full documentation
- [ ] Module 2: TBD

## License

Proprietary
