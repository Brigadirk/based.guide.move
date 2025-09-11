# Development Scripts

This directory contains all development and utility scripts for the BasedGuide project.

## Scripts Overview

### Development Scripts
- **`dev-start.sh`** - Main development script that starts both frontend and backend
- **`dev-start-all.sh`** - Extended development script with additional services
- **`dev-docker.sh`** - Docker-based development environment with database

### Utility Scripts  
- **`lint-check.sh`** - Comprehensive linting for both frontend and backend
- **`test-monorepo.sh`** - Monorepo testing utilities

## Usage

All scripts can be run from the project root using pnpm scripts:

```bash
# Main development (recommended)
pnpm run dev

# All services
pnpm run dev:all  

# Docker development
pnpm run dev:docker

# Direct script execution
./scripts/dev-start.sh
```

## Script Permissions

All scripts are executable. If you need to make a script executable:

```bash
chmod +x scripts/script-name.sh
```
