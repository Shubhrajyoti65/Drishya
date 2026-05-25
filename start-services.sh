#!/bin/bash
# Drishya Full Stack Startup Script
# Run both backend and AI service

echo "🎬 Starting Drishya Full Stack..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Please install Node.js 16+${NC}"
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo -e "${YELLOW}Python not found. Please install Python 3.9+${NC}"
    exit 1
fi

echo -e "${BLUE}✓ Node.js found: $(node --version)${NC}"
echo -e "${BLUE}✓ Python found: $(python --version)${NC}"
echo ""

# Start Backend
echo -e "${GREEN}Starting Node.js Backend...${NC}"
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
echo "  → http://localhost:8000"
echo "  → MongoDB: Check your connection string"
echo ""

# Wait a moment for backend to start
sleep 3

# Start AI Service
echo -e "${GREEN}Starting FastAPI AI Service...${NC}"
cd ai-service

# Activate Python virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    echo -e "${GREEN}✓ Virtual environment activated${NC}"
else
    echo -e "${YELLOW}⚠ Virtual environment not found. Creating...${NC}"
    python -m venv venv
    source venv/bin/activate 2>/dev/null || . venv/Scripts/activate 2>/dev/null
    pip install -r requirements.txt
fi

echo ""
python main.py &
AI_PID=$!
echo -e "${GREEN}✓ AI Service started (PID: $AI_PID)${NC}"
echo "  → http://localhost:8001"
echo "  → Docs: http://localhost:8001/api/docs"
echo ""

# Go back to root
cd ..

# Display summary
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎬 Drishya Full Stack is Running!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Backend Service:${NC}"
echo "  URL: http://localhost:8000"
echo "  Endpoints: /api/v1/*"
echo ""
echo -e "${BLUE}AI Service:${NC}"
echo "  URL: http://localhost:8001"
echo "  Docs: http://localhost:8001/api/docs"
echo "  Endpoints: /api/v1/generate/*"
echo ""
echo -e "${BLUE}MongoDB:${NC}"
echo "  Database: videotube"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $AI_PID

# Cleanup on exit
trap "kill $BACKEND_PID $AI_PID 2>/dev/null; echo 'Services stopped'" EXIT
