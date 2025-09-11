#!/bin/bash

echo "🧪 Testing BasedGuide Monorepo Structure"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

# Function to print section
print_section() {
    echo ""
    echo -e "${YELLOW}📋 $1${NC}"
    echo "----------------------------------------"
}

# Test 1: Directory Structure
print_section "Testing Directory Structure"

directories=(
    "apps/backend/src"
    "apps/frontend"
    "packages/python/shared_eu"
    "packages/ts/ui"
    "packages/ts/utils"
    "config/eslint"
    "config/prettier"
    "infra/docker"
    ".github/workflows"
)

for dir in "${directories[@]}"; do
    if [ -d "$dir" ]; then
        print_status 0 "Directory exists: $dir"
    else
        print_status 1 "Directory missing: $dir"
    fi
done

# Test 2: Key Files
print_section "Testing Key Files"

files=(
    "package.json"
    "pnpm-workspace.yaml"
    "apps/backend/pyproject.toml"
    "apps/backend/Procfile"
    "apps/frontend/package.json"
    "apps/frontend/railway.json"
    "README.md"
    "CONTRIBUTING.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "File exists: $file"
    else
        print_status 1 "File missing: $file"
    fi
done

# Test 3: Backend Import Test
print_section "Testing Backend Imports"

cd apps/backend
if python3.11 -c "from src.app import app; print('Backend imports successful')" 2>/dev/null; then
    print_status 0 "Backend imports work"
else
    print_status 1 "Backend imports failed"
fi
cd ../..

# Test 4: Frontend Dependencies
print_section "Testing Frontend Dependencies"

if [ -d "node_modules" ] && [ -d "apps/frontend/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_status 1 "Frontend dependencies missing"
fi

# Test 5: Backend Server Test
print_section "Testing Backend Server"

cd apps/backend
python3.11 -m src.app --host 0.0.0.0 --port 8001 &
BACKEND_PID=$!
sleep 3

if curl -s http://localhost:8001/health > /dev/null; then
    print_status 0 "Backend server responds"
else
    print_status 1 "Backend server not responding"
fi

kill $BACKEND_PID 2>/dev/null
cd ../..

# Test 6: Frontend Server Test
print_section "Testing Frontend Server"

timeout 15s pnpm --filter frontend dev > /dev/null 2>&1 &
FRONTEND_PID=$!
sleep 8

if curl -s -I http://localhost:3000 > /dev/null; then
    print_status 0 "Frontend server responds"
else
    print_status 1 "Frontend server not responding"
fi

kill $FRONTEND_PID 2>/dev/null

# Test 7: Linting and Formatting
print_section "Testing Code Quality Tools"

if command -v pnpm > /dev/null; then
    print_status 0 "pnpm available"
else
    print_status 1 "pnpm not available"
fi

if python3.11 -c "import ruff" 2>/dev/null; then
    print_status 0 "Ruff (Python linter) available"
else
    print_status 1 "Ruff (Python linter) not available"
fi

# Summary
print_section "Test Summary"

echo "🎉 Monorepo structure testing completed!"
echo ""
echo "📚 Next steps:"
echo "1. Run 'pnpm install' to install all dependencies"
echo "2. Run 'cd apps/backend && pip install -r requirements.txt' for Python deps"
echo "3. Start backend: 'cd apps/backend && python3.11 -m src.app'"
echo "4. Start frontend: 'pnpm dev'"
echo "5. Visit http://localhost:3000 for frontend"
echo "6. Visit http://localhost:8000 for backend API"
echo ""
echo "📖 See README.md for detailed setup and usage instructions"
