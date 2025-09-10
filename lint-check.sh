#!/bin/bash

# Local Linting Script - Runs same checks as CI/CD pipeline
# Usage: ./lint-check.sh [--fix]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if --fix flag is provided
FIX_MODE=false
if [[ "$1" == "--fix" ]]; then
    FIX_MODE=true
    echo -e "${YELLOW}🔧 Running in fix mode - will auto-fix issues where possible${NC}"
fi

echo -e "${BLUE}🧹 Starting Local Linting Checks${NC}"
echo "================================================"

# Function to print section headers
print_section() {
    echo
    echo -e "${BLUE}$1${NC}"
    echo "----------------------------------------"
}

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Function to handle success
handle_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "apps/frontend" ]] || [[ ! -d "apps/backend" ]]; then
    handle_error "Please run this script from the project root directory"
fi

# BACKEND LINTING
print_section "🐍 Backend Python Linting"

# Check if backend dependencies are available
if ! command -v python3 &> /dev/null; then
    handle_error "python3 is required but not installed"
fi

# Install ruff and black if not available
echo "Installing/updating ruff and black..."
python3 -m pip install ruff black > /dev/null 2>&1 || handle_error "Failed to install ruff and black"

cd apps/backend

# Run ruff checks
echo "Running ruff checks..."
if [[ "$FIX_MODE" == "true" ]]; then
    python3 -m ruff check src tests --fix || handle_error "Ruff check failed"
    handle_success "Ruff checks passed (with fixes applied)"
else
    python3 -m ruff check src tests || handle_error "Ruff check failed - run with --fix to auto-fix"
    handle_success "Ruff checks passed"
fi

# Run black formatting checks
echo "Running black formatting checks..."
if [[ "$FIX_MODE" == "true" ]]; then
    python3 -m black src tests || handle_error "Black formatting failed"
    handle_success "Black formatting applied"
else
    python3 -m black --check src tests --diff || handle_error "Black formatting check failed - run with --fix to auto-format"
    handle_success "Black formatting checks passed"
fi

cd ../..

# FRONTEND LINTING
print_section "⚛️  Frontend TypeScript/React Linting"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    handle_error "Node.js is required but not installed"
fi

# Determine package manager
PKG_MANAGER=""
if command -v pnpm &> /dev/null; then
    PKG_MANAGER="pnpm"
elif command -v npm &> /dev/null; then
    PKG_MANAGER="npm"
else
    handle_error "Neither pnpm nor npm is available"
fi

echo "Using package manager: $PKG_MANAGER"

cd apps/frontend

# Install dependencies if needed
if [[ ! -d "node_modules" ]]; then
    echo "Installing frontend dependencies..."
    $PKG_MANAGER install > /dev/null 2>&1 || handle_error "Failed to install frontend dependencies"
fi

# Run ESLint checks
echo "Running ESLint checks..."
if [[ "$FIX_MODE" == "true" ]]; then
    $PKG_MANAGER run lint --fix > /dev/null 2>&1 || handle_error "ESLint check failed"
    handle_success "ESLint checks passed (with fixes applied)"
else
    $PKG_MANAGER run lint > /dev/null 2>&1 || handle_error "ESLint check failed - run with --fix to auto-fix"
    handle_success "ESLint checks passed"
fi

# Run TypeScript checks
echo "Running TypeScript checks..."
if [[ "$PKG_MANAGER" == "pnpm" ]]; then
    if ! pnpm run typecheck 2>&1; then
        handle_error "TypeScript check failed - see errors above"
    fi
else
    # Try common TypeScript check commands for npm
    if npm run typecheck 2>&1; then
        true
    elif npm run type-check 2>&1; then
        true
    elif npx tsc --noEmit 2>&1; then
        true
    else
        handle_error "TypeScript check failed - see errors above"
    fi
fi
handle_success "TypeScript checks passed"

# Run Prettier checks (if available)
if $PKG_MANAGER run prettier:check > /dev/null 2>&1; then
    echo "Running Prettier checks..."
    if [[ "$FIX_MODE" == "true" ]]; then
        $PKG_MANAGER run prettier:write > /dev/null 2>&1 || handle_error "Prettier formatting failed"
        handle_success "Prettier formatting applied"
    else
        $PKG_MANAGER run prettier:check > /dev/null 2>&1 || handle_error "Prettier check failed - run with --fix to auto-format"
        handle_success "Prettier checks passed"
    fi
fi

cd ../..

# FINAL SUMMARY
print_section "📋 Summary"

if [[ "$FIX_MODE" == "true" ]]; then
    echo -e "${GREEN}🎉 All linting checks completed with auto-fixes applied!${NC}"
    echo -e "${YELLOW}📝 Review the changes and commit them if everything looks good.${NC}"
else
    echo -e "${GREEN}🎉 All linting checks passed!${NC}"
    echo -e "${BLUE}💡 Your code is ready to push to GitHub.${NC}"
fi

echo
echo -e "${BLUE}Usage:${NC}"
echo "  ./lint-check.sh          # Check only (same as CI/CD)"
echo "  ./lint-check.sh --fix    # Check and auto-fix issues"
echo
echo -e "${BLUE}Tip:${NC} Add this to your pre-commit workflow:"
echo "  git add . && ./lint-check.sh && git commit -m 'your message'"
