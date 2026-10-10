#!/bin/bash

# Meetora Startup Script
# This script helps you start all Meetora services

set -e

echo "🚀 Starting Meetora..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! systemctl is-active --quiet postgresql; then
    echo -e "${YELLOW}PostgreSQL is not running. Starting...${NC}"
    sudo systemctl start postgresql
fi
echo -e "${GREEN}✓ PostgreSQL is running${NC}"
echo ""

# Check if database exists
echo -e "${BLUE}Checking database...${NC}"
if PGPASSWORD=meetora123 psql -U meetora -d meetora -h localhost -c "\dt" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Cannot connect to database${NC}"
    echo "Please ensure the meetora database and user are created."
    exit 1
fi
echo ""

# Check if Prisma Client is generated
echo -e "${BLUE}Checking Prisma Client...${NC}"
if [ -d "backend/node_modules/.prisma/client" ]; then
    echo -e "${GREEN}✓ Prisma Client is generated${NC}"
else
    echo -e "${YELLOW}Generating Prisma Client...${NC}"
    cd backend && npx prisma generate && cd ..
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
fi
echo ""

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}   All prerequisites met!${NC}"
echo -e "${GREEN}===========================================${NC}"
echo ""

echo "To start Meetora, open 2 terminals:"
echo ""
echo -e "${BLUE}Terminal 1 - Backend:${NC}"
echo "  cd ~/Desktop/liveproject/backend"
echo "  npm run start:dev"
echo ""
echo -e "${BLUE}Terminal 2 - Frontend:${NC}"
echo "  cd ~/Desktop/liveproject/frontend"
echo "  npm run dev"
echo ""
echo -e "${BLUE}Optional - Prisma Studio:${NC}"
echo "  cd ~/Desktop/liveproject/backend"
echo "  npx prisma studio"
echo ""
echo -e "${GREEN}Then open:${NC} http://localhost:3000"
echo ""
