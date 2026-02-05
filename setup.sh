#!/bin/bash

# Shielder Platform Setup Script
# This script sets up both backend and frontend for development

echo "🚀 Setting up Shielder Digital Platform..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$node_version" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be >= 18.0.0${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}📦 Setting up Backend...${NC}"
cd backend

echo "Installing backend dependencies..."
npm install

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✅ .env file created. Please update with your database credentials.${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

echo -e "${GREEN}✅ Backend setup complete!${NC}"
echo ""

# Setup Frontend
echo -e "${BLUE}📦 Setting up Frontend...${NC}"
cd ../frontend

echo "Installing frontend dependencies..."
npm install

if [ ! -f .env.local ]; then
    echo "Creating .env.local file..."
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ .env.local file created${NC}"
else
    echo -e "${GREEN}✅ .env.local file already exists${NC}"
fi

echo -e "${GREEN}✅ Frontend setup complete!${NC}"
echo ""

# Final instructions
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1️⃣  Update backend/.env with your database credentials"
echo ""
echo "2️⃣  Generate Prisma Client and run migrations:"
echo "   cd backend"
echo "   npm run prisma:generate"
echo "   npm run prisma:migrate"
echo ""
echo "3️⃣  Start the backend server:"
echo "   npm run dev"
echo "   (Backend will run on http://localhost:5000)"
echo ""
echo "4️⃣  In a new terminal, start the frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo "   (Frontend will run on http://localhost:3000)"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - Backend README: backend/README.md"
echo "   - Frontend README: frontend/README.md"
echo "   - Main README: README.md"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
