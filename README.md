# BasedGuide Tax Migration Platform

> A comprehensive platform for analyzing tax migration strategies and visa eligibility for digital nomads and international relocators.

## 🏗️ Architecture

This is a modern monorepo built with:

- **Frontend**: Next.js 15 with TypeScript, Tailwind CSS, and shadcn/ui
- **Backend**: FastAPI with Python 3.11, PostgreSQL, and SQLAlchemy
- **Shared Packages**: Reusable TypeScript utilities and Python modules
- **Infrastructure**: Docker, Railway deployment, GitHub Actions CI/CD

## 📁 Project Structure

```
basedguide2/
├── apps/                           # Applications
│   ├── backend/                    # FastAPI backend
│   │   ├── src/                    # Source code
│   │   │   ├── api/                # API routes and handlers
│   │   │   ├── modules/            # Business logic modules
│   │   │   ├── services/           # External services
│   │   │   ├── app.py              # FastAPI application
│   │   │   └── config.py           # Configuration
│   │   ├── tests/                  # Backend tests
│   │   ├── data/                   # Static data files
│   │   ├── schemas/                # JSON schemas
│   │   ├── pyproject.toml          # Python dependencies
│   │   ├── Dockerfile              # Container definition
│   │   ├── Procfile                # Railway deployment
│   │   └── .env.example            # Environment variables
│   │
│   ├── frontend/                   # Next.js frontend
│   │   ├── app/                    # Next.js app directory
│   │   ├── components/             # React components
│   │   ├── lib/                    # Frontend utilities
│   │   ├── public/                 # Static assets
│   │   ├── tests/                  # Frontend tests
│   │   ├── package.json            # Frontend dependencies
│   │   ├── Dockerfile              # Container definition
│   │   └── .env.example            # Environment variables
│   │
│   └── worker-exchange-rates/      # Background worker
│       ├── src/                    # Worker source code
│       ├── pyproject.toml          # Worker dependencies
│       └── Procfile                # Railway deployment
│
├── packages/                       # Shared packages
│   ├── python/                     # Shared Python utilities
│   │   └── shared_eu/              # EU-specific utilities
│   └── ts/                         # Shared TypeScript utilities
│       ├── ui/                     # Reusable UI components
│       └── utils/                  # Common utilities
│
├── config/                         # Shared configuration
│   ├── eslint/                     # ESLint configuration
│   ├── prettier/                   # Prettier configuration
│   ├── ruff/                       # Python linting
│   ├── pytest.ini                 # Python testing
│   └── mypy.ini                    # Python type checking
│
├── infra/                          # Infrastructure
│   ├── railway/                    # Railway deployment configs
│   └── docker/                     # Docker compose files
│
├── .github/workflows/              # CI/CD pipelines
├── package.json                    # Monorepo root configuration
├── pnpm-workspace.yaml             # PNPM workspace definition
└── README.md                       # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **pnpm** 8+
- **Python** 3.11+
- **PostgreSQL** 15+ (for local development)
- **Docker** (optional, for containerized development)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd basedguide2
   ```

2. **Install dependencies**
   ```bash
   # Install all workspace dependencies
   pnpm install
   
   # Install Python backend dependencies
   cd apps/backend
   pip install -e ".[dev]"
   cd ../..
   ```

3. **Set up environment variables**
   ```bash
   # Backend environment
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your values
   
   # Frontend environment
   cp apps/frontend/.env.example apps/frontend/.env.local
   # Edit apps/frontend/.env.local with your values
   ```

4. **Set up the database** (local development)
   ```bash
   # Start PostgreSQL (via Docker)
   docker run --name basedguide-postgres \
     -e POSTGRES_DB=basedguide \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 -d postgres:15
   
   # Run migrations (if available)
   cd apps/backend
   alembic upgrade head
   cd ../..
   ```

### Development

Start both applications in development mode:

```bash
# Terminal 1: Start the backend
cd apps/backend
./start-backend.sh

# Terminal 2: Start the frontend
pnpm dev
```

Or using the convenience scripts:

```bash
# Start frontend only
pnpm dev

# Run all tests
pnpm test

# Lint all code
pnpm lint

# Format all code
pnpm format
```

### Docker Development

Use Docker Compose for a fully containerized development environment:

```bash
# Start all services
docker-compose -f infra/docker/docker-compose.dev.yml up

# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# PostgreSQL: localhost:5432
```

## 🧪 Testing

### Backend Tests
```bash
cd apps/backend
pytest                    # Run all tests
pytest tests/unit/        # Unit tests only
pytest tests/integration/ # Integration tests only
pytest --cov             # With coverage
```

### Frontend Tests
```bash
cd apps/frontend
pnpm test                 # Run Jest tests
pnpm test:watch          # Watch mode
pnpm test:coverage       # With coverage
```

### Full Test Suite
```bash
pnpm test                # Run all tests (frontend + backend)
```

## 📝 Code Quality

### Linting and Formatting

**Frontend (TypeScript/React)**:
- ESLint with Next.js configuration
- Prettier for code formatting
- TypeScript strict mode

**Backend (Python)**:
- Ruff for fast linting
- Black for code formatting
- MyPy for type checking

```bash
# Format all code
pnpm format

# Lint all code
pnpm lint

# Type checking
pnpm typecheck
```

### Git Hooks

Pre-commit hooks are configured via Husky to:
- Run linting and formatting
- Execute type checking
- Run relevant tests

## 🚀 Deployment

### Railway (Production)

1. **Set up Railway projects**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Create projects for each service
   railway create basedguide-backend
   railway create basedguide-frontend
   railway create basedguide-worker
   ```

2. **Configure environment variables**
   
   Set up environment variables in Railway dashboard for each service using the `.env.example` files as reference.

3. **Deploy**
   
   Deployments are automated via GitHub Actions on push to `main`. Manual deployment:
   ```bash
   # Backend
   cd apps/backend
   railway up
   
   # Frontend
   cd apps/frontend
   railway up
   
   # Worker
   cd apps/worker-exchange-rates
   railway up
   ```

### Docker (Self-hosted)

Build and run production containers:

```bash
# Build images
docker build -t basedguide-backend apps/backend
docker build -t basedguide-frontend apps/frontend

# Run with environment variables
docker run -p 8000:8000 --env-file apps/backend/.env basedguide-backend
docker run -p 3000:3000 --env-file apps/frontend/.env basedguide-frontend
```

## 📚 API Documentation

### Backend API

The FastAPI backend provides:

- **Interactive docs**: `http://localhost:8000/docs` (Swagger UI)
- **Alternative docs**: `http://localhost:8000/redoc` (ReDoc)
- **OpenAPI spec**: `http://localhost:8000/openapi.json`

### Key Endpoints

- `GET /health` - Health check
- `POST /api/v1/tax-advice` - Generate tax advice
- `POST /api/v1/section/*` - Section-specific story generation
- `POST /api/v1/perplexity-analysis` - AI-powered analysis

## 🛠️ Development Workflow

### Adding New Features

1. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Develop in the appropriate app**
   - Backend changes: `apps/backend/src/`
   - Frontend changes: `apps/frontend/`
   - Shared utilities: `packages/`

3. **Add tests**
   - Backend: `apps/backend/tests/`
   - Frontend: `apps/frontend/__tests__/`

4. **Update documentation**
   - API changes: Update OpenAPI specs
   - Component changes: Update Storybook stories
   - Architecture changes: Update this README

5. **Submit a pull request**

### Code Standards

- **Python**: Follow PEP 8, use type hints, document with docstrings
- **TypeScript**: Use strict mode, prefer functional components, use proper typing
- **Git**: Use conventional commit messages
- **Testing**: Maintain >80% code coverage

## 🔧 Configuration

### Backend Configuration

Configuration is managed via environment variables and the `config.py` file:

```python
# apps/backend/src/config.py
class Config:
    DATABASE_URL = os.getenv("DATABASE_URL")
    SECRET_KEY = os.getenv("SECRET_KEY")
    PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
    # ... other configuration
```

### Frontend Configuration

Next.js configuration in `apps/frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@basedguide/ui', '@basedguide/utils'],
  // ... other configuration
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass and code is formatted
6. Submit a pull request

For detailed contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- **Documentation**: Check this README and inline code documentation
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Development**: Contact the development team for architectural questions

## 🔗 Related Projects

- [FastAPI](https://fastapi.tiangolo.com/) - Backend framework
- [Next.js](https://nextjs.org/) - Frontend framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Railway](https://railway.app/) - Deployment platform

---

Built with ❤️ by the BasedGuide team