# based.guide.move

Second iteration of based.guide

TODO:
- Add special economic zones like prospera
- Add immigration process info (where get?)
- Check the scrape for accuracy on 10 different countries (why is significant developments and invididual same)
- Chat with Mr. Pro Bonobo.
- Accurate conversion rates.

IDEAS:
- Auto tweet each time one of our tax source websites puts in an update

## Quick Start

The easiest way to start development is to use the provided development script:

```bash
# Make the script executable (first time only)
chmod +x dev.sh

# Start both frontend and backend servers
./dev.sh
```

The script will:
- Automatically manage Python virtual environment
- Install all required dependencies
- Start both frontend and backend servers
- Handle process management and cleanup
- Provide clear status messages and URLs

## Project Structure

This is a monorepo containing:
- `backend/`: Python backend service
- `frontend/`: Next.js frontend application

## Backend Tech Stack

Our backend is built with modern Python technologies:

### Core Technologies
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **Pydantic** - Data validation using Python type annotations
- **uvicorn** - Lightning-fast ASGI server

### Authentication & Security
- **JWT** - JSON Web Tokens for session management
- **bcrypt** - Password hashing
- **passlib** - Password hashing library
- **python-jose** - JavaScript Object Signing and Encryption implementation

### Database
- **PostgreSQL** - Primary database
- **psycopg2** - PostgreSQL adapter for Python

### Development Tools
- **python-dotenv** - Environment variable management
- **email-validator** - Email validation library

## Frontend Development

## Frontend Tech Stack

Our frontend is built with modern web technologies:

### Core Technologies
- **Next.js 14** - React framework with server and client components
- **TypeScript** - For type-safe code
- **Tailwind CSS** - Utility-first CSS framework for styling

### UI Components
- **shadcn/ui** - Reusable component library built on Radix UI
- **Lucide Icons** - Modern icon set

### Authentication & Security
- **JWT** - JSON Web Tokens for session management
- **bcrypt** - Password hashing
- **PostgreSQL** - Database for user management
- **Prisma** - Type-safe ORM for database operations

### Data Management & API
- **React Query** - For server state management and data fetching
- **Axios** - HTTP client for API requests

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality
