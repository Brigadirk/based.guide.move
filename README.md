# based.guide.move

Second iteration of based.guide

## Project Structure

This is a monorepo containing:
- `backend/`: Python backend service (maintained separately)
- `frontend/`: Next.js frontend application

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
