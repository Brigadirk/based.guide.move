#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a process is running on a port
check_port() {
    lsof -i:$1 >/dev/null 2>&1
}

# Function to kill process on a port
kill_port() {
    lsof -ti:$1 | xargs kill -9 2>/dev/null
}

# Store the root directory
ROOT_DIR=$(pwd)

# Clear terminal
clear

echo -e "${BLUE}🚀 Starting development environment...${NC}\n"

# Kill existing processes if running
if check_port 3000; then
    echo -e "${BLUE}Stopping existing frontend process...${NC}"
    kill_port 3000
fi

if check_port 8000; then
    echo -e "${BLUE}Stopping existing backend process...${NC}"
    kill_port 8000
fi

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source .venv/bin/activate
else
    echo -e "${RED}Virtual environment not found. Creating one...${NC}"
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
fi

# Create a temporary pyproject.toml if it doesn't exist
if [ ! -f "backend/pyproject.toml" ]; then
    echo -e "${BLUE}Creating pyproject.toml for backend...${NC}"
    cat > backend/pyproject.toml << EOL
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "backend"
version = "0.1"
EOL
fi

# Install backend in development mode
echo -e "\n${BLUE}Installing backend in development mode...${NC}"
cd backend
pip install -e .
cd $ROOT_DIR

# Start backend
echo -e "\n${BLUE}Starting backend server...${NC}"
cd backend
export PYTHONPATH="${ROOT_DIR}:${PYTHONPATH}"
python -c "import backend" 2>/dev/null || {
    echo -e "${RED}Python path is not set correctly. Trying alternative configuration...${NC}"
    export PYTHONPATH="${ROOT_DIR}/backend:${PYTHONPATH}"
}

uvicorn api:app --reload --port 8000 & 
BACKEND_PID=$!
cd $ROOT_DIR

# Start frontend
echo -e "\n${BLUE}Starting frontend server...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing frontend dependencies...${NC}"
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd $ROOT_DIR

# Wait for both processes to be ready
sleep 5

# Check if processes started successfully
if check_port 3000 && check_port 8000; then
    echo -e "\n${GREEN}✅ Development environment is ready!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Backend: http://localhost:8000${NC}"
    echo -e "\n${BLUE}Press Ctrl+C to stop both servers${NC}"
else
    echo -e "\n${RED}❌ Error starting servers${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 1
fi

# Handle Ctrl+C to gracefully shut down both processes
trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e "\n${BLUE}Shutting down servers...${NC}"; exit 0' SIGINT

# Keep script running
wait 