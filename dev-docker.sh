#!/bin/bash

# Docker-based development environment for BasedGuide2
# This script uses Docker Compose to run all services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[DOCKER-DEV]${NC} $1"
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

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker >/dev/null 2>&1; then
        print_error "Docker is not installed. Please install Docker Desktop."
        exit 1
    fi
    
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1 && ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is not available."
        exit 1
    fi
}

# Create environment file if it doesn't exist
create_env_file() {
    if [ ! -f ".env" ]; then
        print_warning "Creating .env file for Docker Compose..."
        cat > .env << EOF
# Generated environment file for Docker development

# Security
SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "change-this-secret-key-in-production")

# API Keys (REQUIRED - Add your actual keys)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPEN_EXCHANGE_API_KEY=your_open_exchange_api_key_here

# Database
POSTGRES_PASSWORD=dev_password_123

# Development URLs
NEXT_PUBLIC_API_URL=http://localhost:5001
EOF
        print_warning "Created .env file. Please add your API keys!"
    fi
}

# Function to handle cleanup
cleanup() {
    print_status "Stopping all services..."
    if command -v docker-compose >/dev/null 2>&1; then
        docker-compose -f docker-compose.dev.yml down
    else
        docker compose -f docker-compose.dev.yml down
    fi
    print_success "All services stopped"
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main function
main() {
    print_status "Starting BasedGuide2 Docker Development Environment..."
    echo "======================================================="
    
    # Check prerequisites
    check_docker
    
    # Create environment file
    create_env_file
    
    # Create directories if they don't exist
    mkdir -p infra/postgres
    
    # Create basic PostgreSQL init script
    if [ ! -f "infra/postgres/init.sql" ]; then
        cat > infra/postgres/init.sql << 'EOF'
-- Initialize BasedGuide2 development database
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic tables (extend as needed)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_data ON profiles USING gin(data);
EOF
    fi
    
    print_status "Building and starting services..."
    
    # Use docker-compose or docker compose based on availability
    if command -v docker-compose >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        COMPOSE_CMD="docker compose"
    fi
    
    # Build and start services
    $COMPOSE_CMD -f docker-compose.dev.yml up --build -d
    
    print_status "Waiting for services to be healthy..."
    
    # Wait for services to be ready
    for i in {1..60}; do
        if curl -s http://localhost:5001/health >/dev/null 2>&1 && \
           curl -s http://localhost:3000 >/dev/null 2>&1; then
            break
        fi
        if [ $i -eq 60 ]; then
            print_error "Services failed to start after 60 seconds"
            $COMPOSE_CMD -f docker-compose.dev.yml logs
            exit 1
        fi
        sleep 2
    done
    
    echo ""
    echo "======================================================="
    print_success "🚀 Docker development environment is ready!"
    echo ""
    echo "📱 Frontend:   http://localhost:3000"
    echo "🔧 Backend:    http://localhost:5001"
    echo "🏥 Health:     http://localhost:5001/health"
    echo "📚 API Docs:   http://localhost:5001/docs"
    echo "🐘 PostgreSQL: localhost:5432 (basedguide_dev/basedguide/dev_password_123)"
    echo "🔴 Redis:      localhost:6379"
    echo ""
    print_status "View logs: $COMPOSE_CMD -f docker-compose.dev.yml logs -f"
    print_status "Stop:      $COMPOSE_CMD -f docker-compose.dev.yml down"
    print_status "Press Ctrl+C to stop all services"
    echo "======================================================="
    
    # Follow logs
    $COMPOSE_CMD -f docker-compose.dev.yml logs -f
}

# Handle command line arguments
case "${1:-}" in
    "stop")
        cleanup
        exit 0
        ;;
    "logs")
        if command -v docker-compose >/dev/null 2>&1; then
            docker-compose -f docker-compose.dev.yml logs -f
        else
            docker compose -f docker-compose.dev.yml logs -f
        fi
        exit 0
        ;;
    "restart")
        cleanup
        sleep 2
        main
        ;;
    *)
        main
        ;;
esac
