#!/bin/bash

# Development startup script for BasedGuide2 - ALL SERVICES
# This script starts frontend, backend, and backend-tester for local development

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[DEV-ALL]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_service() {
    local service=$1
    local message=$2
    case $service in
        "backend")
            echo -e "${PURPLE}[BACKEND]${NC} $message"
            ;;
        "frontend")
            echo -e "${CYAN}[FRONTEND]${NC} $message"
            ;;
        "tester")
            echo -e "${YELLOW}[TESTER]${NC} $message"
            ;;
        *)
            echo -e "${BLUE}[$service]${NC} $message"
            ;;
    esac
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1
}

# Function to kill processes on specific ports
kill_port() {
    if port_in_use $1; then
        print_warning "Port $1 is in use. Killing existing processes..."
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to cleanup on exit
cleanup() {
    print_status "Cleaning up all processes..."
    # Kill background jobs
    jobs -p | xargs -r kill 2>/dev/null || true
    # Kill specific ports
    kill_port 3000  # Frontend
    kill_port 3001  # Backend Tester
    kill_port 5001  # Backend
    print_success "Cleanup complete"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM EXIT

print_status "Starting BasedGuide2 FULL Development Environment..."
echo "=============================================================="

# Check required commands
print_status "Checking prerequisites..."
if ! command_exists python3.11; then
    print_warning "Python3.11 not found, trying python3..."
    if ! command_exists python3; then
        print_error "Python3 is required but not installed"
        exit 1
    fi
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python3.11"
fi
print_success "Using Python: $PYTHON_CMD"

if ! command_exists node; then
    print_error "Node.js is required but not installed"
    exit 1
fi

if ! command_exists pnpm; then
    print_warning "pnpm not found, installing..."
    npm install -g pnpm
fi

# Check if we're in the right directory
if [ ! -d "apps/backend" ] || [ ! -d "apps/frontend" ] || [ ! -d "apps/backend-tester" ]; then
    print_error "Must be run from project root (should contain apps/backend, apps/frontend, and apps/backend-tester)"
    exit 1
fi

# Clean up any existing processes
print_status "Cleaning up existing processes..."
kill_port 3000
kill_port 3001
kill_port 5001

# Function to setup backend
setup_backend() {
    print_service "backend" "Setting up backend..."
    cd apps/backend
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "Backend .env file not found!"
        if [ -f ".env.example" ]; then
            print_service "backend" "Creating .env from .env.example..."
            cp .env.example .env
            print_warning "Please edit apps/backend/.env with your API keys!"
        else
            print_service "backend" "Creating basic .env file..."
            cat > .env << EOF
# API Keys (REQUIRED - Add your actual keys)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPEN_EXCHANGE_API_KEY=your_open_exchange_api_key_here

# Security (REQUIRED)
SECRET_KEY=$($PYTHON_CMD -c "import secrets; print(secrets.token_urlsafe(32))")

# Application Configuration
ENVIRONMENT=development
HOST=0.0.0.0
PORT=5001

# CORS Configuration (Local development - includes backend tester)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
            print_warning "Created basic .env file. Please add your API keys!"
        fi
    else
        # Update CORS to include backend tester
        if ! grep -q "localhost:3001" .env; then
            print_service "backend" "Adding backend-tester to ALLOWED_ORIGINS..."
            sed -i.bak 's|ALLOWED_ORIGINS=http://localhost:3000|ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001|g' .env
        fi
    fi
    
    # Install Python dependencies
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found in apps/backend"
        cd ../..
        return 1
    fi
    
    print_service "backend" "Installing Python dependencies..."
    $PYTHON_CMD -m pip install -r requirements.txt >/dev/null 2>&1 || {
        print_warning "Failed to install with $PYTHON_CMD -m pip, trying pip3..."
        pip3 install -r requirements.txt >/dev/null 2>&1
    }
    
    cd ../..
    print_service "backend" "Setup complete"
}

# Function to setup frontend
setup_frontend() {
    print_service "frontend" "Setting up frontend..."
    cd apps/frontend
    
    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning "Frontend .env.local file not found!"
        if [ -f ".env.example" ]; then
            print_service "frontend" "Creating .env.local from .env.example..."
            cp .env.example .env.local
        else
            print_service "frontend" "Creating basic .env.local file..."
            cat > .env.local << EOF
# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1

# Development
NODE_ENV=development
EOF
        fi
    fi
    
    # Install Node dependencies
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in apps/frontend"
        cd ../..
        return 1
    fi
    
    print_service "frontend" "Installing Node.js dependencies..."
    pnpm install >/dev/null 2>&1
    
    cd ../..
    print_service "frontend" "Setup complete"
}

# Function to setup backend tester
setup_backend_tester() {
    print_service "tester" "Setting up backend-tester..."
    cd apps/backend-tester
    
    # Install Node dependencies
    if [ ! -f "package.json" ]; then
        print_error "package.json not found in apps/backend-tester"
        cd ../..
        return 1
    fi
    
    print_service "tester" "Installing Node.js dependencies..."
    pnpm install >/dev/null 2>&1
    
    cd ../..
    print_service "tester" "Setup complete"
}

# Function to start backend
start_backend() {
    print_service "backend" "Starting backend server..."
    cd apps/backend
    
    # Make sure start script is executable
    if [ -f "start-backend.sh" ]; then
        chmod +x start-backend.sh
        ./start-backend.sh &
    else
        # Fallback to direct uvicorn command
        cd src
        export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
        export PORT=5001
        export PYTHONPATH=.
        $PYTHON_CMD -m uvicorn app:app --host 0.0.0.0 --port $PORT --reload &
        cd ..
    fi
    
    BACKEND_PID=$!
    cd ../..
    
    # Wait for backend to start
    print_service "backend" "Waiting for backend to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5001/health >/dev/null 2>&1; then
            print_service "backend" "Started successfully on http://localhost:5001"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Backend failed to start after 30 seconds"
            return 1
        fi
        sleep 1
    done
}

# Function to start frontend
start_frontend() {
    print_service "frontend" "Starting frontend server..."
    cd apps/frontend
    
    pnpm dev &
    FRONTEND_PID=$!
    cd ../..
    
    # Wait for frontend to start
    print_service "frontend" "Waiting for frontend to start..."
    for i in {1..60}; do
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            print_service "frontend" "Started successfully on http://localhost:3000"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Frontend failed to start after 60 seconds"
            return 1
        fi
        sleep 1
    done
}

# Function to start backend tester
start_backend_tester() {
    print_service "tester" "Starting backend-tester server..."
    cd apps/backend-tester
    
    pnpm dev &
    TESTER_PID=$!
    cd ../..
    
    # Wait for backend tester to start
    print_service "tester" "Waiting for backend-tester to start..."
    for i in {1..60}; do
        if curl -s http://localhost:3001 >/dev/null 2>&1; then
            print_service "tester" "Started successfully on http://localhost:3001"
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Backend-tester failed to start after 60 seconds"
            return 1
        fi
        sleep 1
    done
}

# Main execution
main() {
    # Run linting checks before starting services
    print_status "Running linting checks..."
    if [ -f "lint-check.sh" ]; then
        ./lint-check.sh || {
            print_error "Linting checks failed! Fix the issues before starting development servers."
            print_status "Run './lint-check.sh --fix' to auto-fix issues, or fix manually."
            exit 1
        }
        print_success "All linting checks passed!"
    else
        print_warning "lint-check.sh not found, skipping linting checks"
    fi
    
    # Setup all services
    setup_backend || exit 1
    setup_frontend || exit 1
    setup_backend_tester || exit 1
    
    # Start all services
    start_backend || exit 1
    start_frontend || exit 1
    start_backend_tester || exit 1
    
    echo ""
    echo "=============================================================="
    print_success "🚀 FULL Development environment is ready!"
    echo ""
    echo "🔧 Backend:         http://localhost:5001"
    echo "   🏥 Health:       http://localhost:5001/health"
    echo "   📚 API Docs:     http://localhost:5001/docs"
    echo ""
    echo "📱 Frontend:        http://localhost:3000"
    echo "   🎯 Main App:     Complete BasedGuide application"
    echo ""
    echo "🧪 Backend Tester:  http://localhost:3001"
    echo "   🔍 API Testing:  All backend endpoints"
    echo "   📊 Debug Tool:   Real-time API debugging"
    echo ""
    print_status "Press Ctrl+C to stop all services"
    echo "=============================================================="
    
    # Keep script running and wait for user interrupt
    while true; do
        sleep 1
        
        # Check if processes are still running
        if ! port_in_use 5001; then
            print_error "Backend process died unexpectedly"
            break
        fi
        
        if ! port_in_use 3000; then
            print_error "Frontend process died unexpectedly"
            break
        fi
        
        if ! port_in_use 3001; then
            print_error "Backend-tester process died unexpectedly"
            break
        fi
    done
}

# Run main function
main
