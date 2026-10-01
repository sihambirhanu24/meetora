#!/bin/bash

echo "🚀 Setting up Meetora - Module 1: Authentication & Security"
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL first."
    echo "   Ubuntu/Debian: sudo apt-get install postgresql"
    echo "   macOS: brew install postgresql"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "⚠️  Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Prerequisites check passed"
echo ""

# Setup PostgreSQL database
echo "📦 Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE meetora;" 2>/dev/null || echo "  Database already exists"
sudo -u postgres psql -c "CREATE USER meetora WITH PASSWORD 'meetora123';" 2>/dev/null || echo "  User already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;" 2>/dev/null
echo "✓ Database setup complete"
echo ""

# Setup Backend
echo "📦 Setting up backend..."
cd backend || exit

if [ ! -f ".env" ]; then
    cp .env.example .env 2>/dev/null || echo "DATABASE_URL=\"postgresql://meetora:meetora123@localhost:5432/meetora?schema=public\"
JWT_SECRET=\"meetora-secret-key-change-this-in-production\"
JWT_EXPIRATION=\"7d\"
NODE_ENV=\"development\"
PORT=3001
FRONTEND_URL=\"http://localhost:3000\"
EMAIL_FROM=\"noreply@meetora.com\"
EMAIL_PROVIDER=\"console\"" > .env
    echo "✓ Created .env file"
fi

echo "  Installing dependencies..."
npm install --silent

echo "  Running Prisma migrations..."
npx prisma generate
npx prisma migrate dev --name init

echo "✓ Backend setup complete"
cd ..
echo ""

# Setup Frontend
echo "📦 Setting up frontend..."
cd frontend || exit

if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local 2>/dev/null || echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
    echo "✓ Created .env.local file"
fi

echo "  Installing dependencies..."
npm install --silent

echo "✓ Frontend setup complete"
cd ..
echo ""

echo "✅ Setup complete!"
echo ""
echo "To start the application:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd backend"
echo "    npm run start:dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd frontend"
echo "    npm run dev"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
