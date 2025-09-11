# 🚀 BasedGuide2 Development Guide

This guide explains how to set up and run the BasedGuide2 application for local development.

## 📋 Prerequisites

### Required
- **Node.js** (v18.18.0+ - Next.js 15 requirement) - [Download here](https://nodejs.org/)
- **Python** (v3.11+) - [Download here](https://python.org/)
- **pnpm** - Install with `npm install -g pnpm`

### Optional (for Docker setup)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

## 🚀 Quick Start Options

### Option 1: Native Development (Recommended)

The fastest way to get started:

```bash
# 1. Clone and setup
git clone <repo-url>
cd basedguide2

# 2. Install dependencies
pnpm run setup

# 3. Set up environment variables (see below)

# 4. Start everything
pnpm run dev
```

This will automatically:
- ✅ Install all dependencies
- ✅ Start the backend on http://localhost:5001
- ✅ Start the frontend on http://localhost:3000
- ✅ Set up file watching for hot reload
- ✅ Display helpful links and status

### Option 2: Docker Development

For a containerized environment with database:

```bash
# 1. Start with Docker
pnpm run dev:docker

# Or directly:
./scripts/dev-docker.sh
```

This includes:
- ✅ Backend (FastAPI)
- ✅ Frontend (Next.js) 
- ✅ PostgreSQL database
- ✅ Redis cache
- ✅ All services networked together

## 🔑 Environment Setup

### Backend Environment Variables

Create `apps/backend/.env`:

```bash
# API Keys (REQUIRED)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPEN_EXCHANGE_API_KEY=your_open_exchange_api_key_here

# Security (REQUIRED)
SECRET_KEY=your_generated_secret_key_here

# Application Configuration
ENVIRONMENT=development
HOST=0.0.0.0
PORT=5001

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Generate a secret key with:
# python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
```

### Frontend Environment Variables

Create `apps/frontend/.env.local`:

```bash
# Next.js Configuration
NEXT_PUBLIC_API_URL=http://localhost:5001

# Development
NODE_ENV=development
```

### Generate Secret Key

```bash
# Generate a secure secret key
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))"
```

## 🛠️ Available Commands

### Main Development Commands

```bash
# Start both frontend and backend
pnpm run dev

# Start with Docker (includes database)
pnpm run dev:docker

# Setup all dependencies
pnpm run setup
```

### Individual Services

```bash
# Frontend only
pnpm run dev:frontend

# Backend only  
pnpm run dev:backend

# Production start
pnpm run start:frontend
pnpm run start:backend
```

### Docker Commands

```bash
# Start all services
pnpm run docker:up

# Stop all services
pnpm run docker:down

# View logs
pnpm run docker:logs

# Restart services
pnpm run docker:restart
```

### Build & Test

```bash
# Build everything
pnpm run build

# Run all tests
pnpm run test

# Lint all code
pnpm run lint

# Format all code
pnpm run format

# Type checking
pnpm run typecheck
```

## 🌐 Service URLs

When running locally, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js web application |
| Backend API | http://localhost:5001 | FastAPI server |
| API Health | http://localhost:5001/health | Health check endpoint |
| API Docs | http://localhost:5001/docs | Swagger/OpenAPI documentation |
| PostgreSQL | localhost:5432 | Database (Docker only) |
| Redis | localhost:6379 | Cache (Docker only) |

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:5001 | xargs kill -9  # Backend
```

**Dependencies not installing:**
```bash
# Clear caches and reinstall
pnpm store prune
rm -rf node_modules apps/*/node_modules
pnpm install
```

**Backend not starting:**
```bash
# Check Python environment
python3 --version
pip3 --version

# Reinstall Python dependencies
cd apps/backend
pip3 install -r requirements.txt
```

**Environment variables not loading:**
- Ensure `.env` files are in the correct directories
- Check that variable names match exactly
- Restart services after changing env vars

### Development Scripts

The development scripts include automatic:
- ✅ Port cleanup (kills existing processes)
- ✅ Dependency checking and installation
- ✅ Environment file creation
- ✅ Service health checking
- ✅ Colored output and progress indication
- ✅ Graceful shutdown on Ctrl+C

### Docker Issues

**Docker not starting:**
- Ensure Docker Desktop is running
- Check available disk space
- Restart Docker Desktop

**Services not healthy:**
```bash
# Check service logs
docker-compose -f docker-compose.dev.yml logs backend
docker-compose -f docker-compose.dev.yml logs frontend
```

## 📁 Project Structure

```
basedguide2/
├── apps/
│   ├── backend/           # FastAPI application
│   │   ├── src/          # Source code
│   │   ├── tests/        # Tests
│   │   └── .env          # Backend environment variables
│   └── frontend/         # Next.js application
│       ├── app/          # App router pages
│       ├── components/   # React components
│       └── .env.local    # Frontend environment variables
├── scripts/              # Development and utility scripts
│   ├── dev-start.sh     # Native development script
│   ├── dev-docker.sh    # Docker development script
│   └── ...              # Other utility scripts
├── docker-compose.dev.yml # Docker services definition
└── package.json         # Root package.json with scripts
```

## 🔄 Development Workflow

1. **Start Development:** `pnpm run dev`
2. **Make Changes:** Edit files in `apps/frontend/` or `apps/backend/`
3. **Auto Reload:** Services automatically restart on file changes
4. **Test Changes:** Visit http://localhost:3000
5. **Stop Services:** Press `Ctrl+C`

## 📚 Next Steps

- Read the [API Documentation](http://localhost:5001/docs) when backend is running
- Check the [Contributing Guide](CONTRIBUTING.md) for code standards
- Review the [Railway Setup Guide](RAILWAY_SETUP.md) for deployment

---

**Need help?** Check the troubleshooting section above or create an issue in the repository.
