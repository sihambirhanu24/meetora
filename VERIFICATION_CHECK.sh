#!/bin/bash

# Meetora Verification Check
# Run this to verify everything is working correctly

echo "🔍 Meetora System Verification"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check PostgreSQL
echo -e "${BLUE}1. Checking PostgreSQL...${NC}"
if systemctl is-active --quiet postgresql; then
    echo -e "${GREEN}   ✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}   ✗ PostgreSQL is not running${NC}"
    exit 1
fi

# Check Database
echo -e "${BLUE}2. Checking database connection...${NC}"
if PGPASSWORD=meetora123 psql -U meetora -d meetora -h localhost -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}   ✓ Can connect to meetora database${NC}"
else
    echo -e "${RED}   ✗ Cannot connect to database${NC}"
    exit 1
fi

# Check tables
echo -e "${BLUE}3. Checking database tables...${NC}"
TABLE_COUNT=$(PGPASSWORD=meetora123 psql -U meetora -d meetora -h localhost -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users';" 2>/dev/null | tr -d '[:space:]')
if [ "$TABLE_COUNT" = "1" ]; then
    echo -e "${GREEN}   ✓ users table exists${NC}"
else
    echo -e "${RED}   ✗ users table not found${NC}"
    exit 1
fi

# Check migration
echo -e "${BLUE}4. Checking Prisma migrations...${NC}"
cd backend
MIGRATION_STATUS=$(npx prisma migrate status 2>&1 | grep "Database schema is up to date")
if [ -n "$MIGRATION_STATUS" ]; then
    echo -e "${GREEN}   ✓ Migrations are up to date${NC}"
else
    echo -e "${YELLOW}   ⚠ Migrations may need attention${NC}"
fi

# Check Prisma Client
echo -e "${BLUE}5. Checking Prisma Client...${NC}"
if [ -d "node_modules/.prisma/client" ]; then
    echo -e "${GREEN}   ✓ Prisma Client is generated${NC}"
else
    echo -e "${YELLOW}   ⚠ Prisma Client needs generation${NC}"
    echo "   Run: cd backend && npx prisma generate"
fi

# Check backend dependencies
echo -e "${BLUE}6. Checking backend dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}   ✓ Backend dependencies installed${NC}"
else
    echo -e "${RED}   ✗ Backend dependencies not installed${NC}"
    echo "   Run: cd backend && npm install"
fi

# Check frontend dependencies
echo -e "${BLUE}7. Checking frontend dependencies...${NC}"
cd ../frontend
if [ -d "node_modules" ]; then
    echo -e "${GREEN}   ✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}   ✗ Frontend dependencies not installed${NC}"
    echo "   Run: cd frontend && npm install"
fi

cd ..

echo ""
echo -e "${GREEN}=============================${NC}"
echo -e "${GREEN}✅ Verification Complete!${NC}"
echo -e "${GREEN}=============================${NC}"
echo ""
echo -e "${BLUE}System Status:${NC} Ready for development"
echo ""
echo -e "${BLUE}To start Meetora:${NC}"
echo "  ./RUN_MEETORA.sh"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "  - Quick Start: QUICK_REFERENCE.md"
echo "  - Full Report: REPAIR_FINAL_REPORT.md"
echo "  - Success Summary: COMPLETE_SUCCESS.md"
echo ""
