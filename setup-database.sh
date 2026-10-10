#!/bin/bash

# Meetora Database Setup Script
# Run this script to create PostgreSQL user and database

set -e  # Exit on error

echo "🔧 Meetora Database Setup"
echo "========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "Checking PostgreSQL status..."
if ! systemctl is-active --quiet postgresql; then
    echo -e "${RED}✗ PostgreSQL is not running${NC}"
    echo "Start it with: sudo systemctl start postgresql"
    exit 1
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check if user already exists
echo "Checking if user 'meetora' exists..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='meetora'" | grep -q 1; then
    echo -e "${YELLOW}⚠ User 'meetora' already exists${NC}"
else
    echo "Creating PostgreSQL user 'meetora'..."
    sudo -u postgres psql -c "CREATE USER meetora WITH PASSWORD 'meetora123';"
    echo -e "${GREEN}✓ User created${NC}"
fi
echo ""

# Check if database already exists
echo "Checking if database 'meetora' exists..."
if sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='meetora'" | grep -q 1; then
    echo -e "${YELLOW}⚠ Database 'meetora' already exists${NC}"
else
    echo "Creating database 'meetora'..."
    sudo -u postgres psql -c "CREATE DATABASE meetora OWNER meetora;"
    echo -e "${GREEN}✓ Database created${NC}"
fi
echo ""

# Grant privileges
echo "Granting privileges..."
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE meetora TO meetora;"
sudo -u postgres psql -d meetora -c "GRANT ALL ON SCHEMA public TO meetora;"
echo -e "${GREEN}✓ Privileges granted${NC}"
echo ""

# Test connection
echo "Testing database connection..."
if PGPASSWORD=meetora123 psql -U meetora -d meetora -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    exit 1
fi
echo ""

# Generate Prisma client
echo "Generating Prisma client..."
cd backend
npx prisma generate
echo -e "${GREEN}✓ Prisma client generated${NC}"
echo ""

# Run migrations
echo "Running database migrations..."
npx prisma migrate dev --name initial_user_model
echo -e "${GREEN}✓ Migrations complete${NC}"
echo ""

# Verify migration status
echo "Verifying migrations..."
npx prisma migrate status
echo ""

echo -e "${GREEN}✅ Database setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd backend && npm run start:dev"
echo "2. Start frontend: cd frontend && npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "Optional:"
echo "- Prisma Studio: cd backend && npx prisma studio"
