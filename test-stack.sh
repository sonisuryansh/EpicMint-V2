#!/bin/bash

echo "🚀 EpicMint Full Stack Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "🔍 Checking backend server..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Backend is running on port 5000${NC}"
  BACKEND_OK=1
else
  echo -e "${YELLOW}⚠️  Backend is not running (start with: cd backend && npm run dev)${NC}"
  BACKEND_OK=0
fi

echo ""

# Check if frontend is running
echo "🔍 Checking frontend server..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Frontend is running on port 3002${NC}"
  FRONTEND_OK=1
else
  echo -e "${YELLOW}⚠️  Frontend is not running (start with: cd frontend && npm run dev)${NC}"
  FRONTEND_OK=0
fi

echo ""

# Test API endpoints if backend is running
if [ $BACKEND_OK -eq 1 ]; then
  echo "🧪 Testing API Endpoints..."
  echo "---"

  # Health check
  echo "Testing: GET /health"
  RESPONSE=$(curl -s http://localhost:5000/health)
  if echo "$RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}✅ Health check passed${NC}"
  else
    echo -e "${RED}❌ Health check failed${NC}"
  fi

  echo ""

  # NFTs endpoint
  echo "Testing: GET /api/nfts"
  RESPONSE=$(curl -s http://localhost:5000/api/nfts)
  if echo "$RESPONSE" | grep -q "nfts"; then
    echo -e "${GREEN}✅ NFTs endpoint working${NC}"
  else
    echo -e "${RED}❌ NFTs endpoint failed${NC}"
  fi

  echo ""

  # Submission endpoint
  echo "Testing: POST /api/submissions"
  RESPONSE=$(curl -s -X POST http://localhost:5000/api/submissions \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","message":"test"}')
  if echo "$RESPONSE" | grep -q "success"; then
    echo -e "${GREEN}✅ Submission endpoint working${NC}"
  else
    echo -e "${RED}❌ Submission endpoint failed${NC}"
  fi
fi

echo ""
echo "=================================="
echo "📊 Test Summary"
echo "=================================="
echo -e "Backend: $([ $BACKEND_OK -eq 1 ] && echo -e "${GREEN}Running${NC}" || echo -e "${YELLOW}Not Running${NC}")"
echo -e "Frontend: $([ $FRONTEND_OK -eq 1 ] && echo -e "${GREEN}Running${NC}" || echo -e "${YELLOW}Not Running${NC}")"
echo ""

if [ $BACKEND_OK -eq 1 ] && [ $FRONTEND_OK -eq 1 ]; then
  echo -e "${GREEN}✅ Full stack is operational!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some services are not running${NC}"
  exit 1
fi
