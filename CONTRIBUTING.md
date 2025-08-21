# Contributing to BasedGuide

Thank you for your interest in contributing to the BasedGuide Tax Migration Platform! This document provides guidelines and information for contributors.

## 🎯 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and **pnpm** 8+
- **Python** 3.11+
- **Git** configured with your GitHub account
- **PostgreSQL** 15+ (for local testing)

### Development Environment Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/basedguide2.git
   cd basedguide2
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   cd apps/backend && pip install -e ".[dev]" && cd ../..
   ```

3. **Set up environment variables**
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   # Edit the .env files with appropriate values
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd apps/backend && python src/app.py
   
   # Terminal 2: Frontend
   pnpm dev
   ```

## 📋 Code Standards

### Python (Backend)

- **Style**: Follow PEP 8
- **Type Hints**: Required for all function signatures
- **Docstrings**: Use Google-style docstrings
- **Imports**: Use absolute imports within the src module
- **Error Handling**: Use appropriate exception types and logging

```python
# Good example
from typing import Optional
from ..modules.validator import validate_data

def process_user_data(data: dict, user_id: Optional[str] = None) -> dict:
    """Process user data and return validated result.
    
    Args:
        data: Raw user input data
        user_id: Optional user identifier
        
    Returns:
        Validated and processed data dictionary
        
    Raises:
        ValidationError: If data validation fails
    """
    if not validate_data(data):
        raise ValidationError("Invalid data provided")
    
    return {"processed": True, "data": data}
```

### TypeScript (Frontend)

- **Style**: Use Prettier configuration
- **Components**: Prefer functional components with TypeScript
- **Props**: Define explicit interfaces for component props
- **Hooks**: Use custom hooks for reusable logic
- **State**: Use Zustand for global state, useState for local state

```typescript
// Good example
interface ButtonProps {
  variant: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  disabled = false,
  onClick,
  children,
}) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### Git Conventions

Use conventional commit messages:

```bash
# Format: type(scope): description

feat(backend): add user authentication endpoint
fix(frontend): resolve navigation menu accessibility
docs(readme): update installation instructions
test(backend): add unit tests for tax calculator
refactor(shared): extract common validation utilities
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `test`: Adding or updating tests
- `refactor`: Code refactoring
- `chore`: Maintenance tasks
- `perf`: Performance improvements

## 🧪 Testing Guidelines

### Backend Tests

```python
# apps/backend/tests/unit/test_validator.py
import pytest
from src.modules.validator import validate_tax_data

class TestTaxDataValidator:
    def test_valid_data_passes_validation(self):
        """Test that valid tax data passes validation."""
        valid_data = {
            "personal_information": {"name": "John Doe", "age": 30},
            "destination_country": "Portugal"
        }
        result = validate_tax_data(valid_data)
        assert result["valid"] is True
    
    def test_missing_required_field_fails_validation(self):
        """Test that missing required fields fail validation."""
        invalid_data = {"destination_country": "Portugal"}
        result = validate_tax_data(invalid_data)
        assert result["valid"] is False
        assert "personal_information" in result["message"]
```

### Frontend Tests

```typescript
// apps/frontend/__tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with correct variant classes', () => {
    render(
      <Button variant="primary" onClick={() => {}}>
        Click me
      </Button>
    )
    
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toHaveClass('bg-primary')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn()
    render(
      <Button variant="primary" onClick={handleClick}>
        Click me
      </Button>
    )
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Test Requirements

- **Unit Tests**: All new functions and methods
- **Integration Tests**: API endpoints and complex workflows
- **Component Tests**: React components with user interactions
- **Coverage**: Maintain >80% code coverage

## 🔄 Development Workflow

### 1. Planning

- Check existing issues and discussions
- Create or comment on relevant GitHub issues
- Discuss approach for significant changes

### 2. Development

```bash
# Create feature branch
git checkout -b feat/your-feature-name

# Make changes in small, logical commits
git add .
git commit -m "feat(scope): add new functionality"

# Keep branch updated
git fetch origin
git rebase origin/main
```

### 3. Testing

```bash
# Run all tests
pnpm test

# Run specific test suites
cd apps/backend && pytest tests/unit/
cd apps/frontend && pnpm test

# Check code quality
pnpm lint
pnpm typecheck
```

### 4. Documentation

- Update relevant README sections
- Add JSDoc/docstrings for new functions
- Update API documentation if adding endpoints
- Include examples for complex features

### 5. Pull Request

```bash
# Push branch
git push origin feat/your-feature-name

# Create pull request with:
# - Clear title and description
# - Reference to related issues
# - Screenshots for UI changes
# - Testing instructions
```

## 📁 Project Structure Guidelines

### Adding New Components

**Frontend Components:**
```
apps/frontend/components/
├── features/           # Feature-specific components
│   ├── auth/          # Authentication components
│   ├── finance/       # Finance-related components
│   └── analysis/      # Analysis and results
├── ui/                # Reusable UI components
└── navigation/        # Navigation components
```

**Backend Modules:**
```
apps/backend/src/
├── api/               # API routes and handlers
├── modules/           # Business logic
├── services/          # External service integrations
└── models/            # Database models (if using ORM)
```

### Shared Code

Place reusable code in appropriate packages:

- **TypeScript utilities**: `packages/ts/utils/src/`
- **UI components**: `packages/ts/ui/src/`
- **Python utilities**: `packages/python/shared_eu/`

## 🚀 Deployment

### Development Deployment

- Frontend: Automatically deployed via Railway on push to `develop`
- Backend: Automatically deployed via Railway on push to `develop`

### Production Deployment

- Only maintainers can deploy to production
- Requires approval on pull requests to `main`
- Automated via GitHub Actions

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment**: OS, Node.js version, Python version
2. **Steps to reproduce**: Clear, step-by-step instructions
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: For UI issues
6. **Logs**: Relevant error messages or console output

Use the bug report template:

```markdown
## Bug Description
Brief description of the bug

## Environment
- OS: [e.g., macOS 13.0]
- Node.js: [e.g., 18.17.0]
- Python: [e.g., 3.11.5]
- Browser: [e.g., Chrome 115.0]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** the feature would solve
3. **Propose a solution** with implementation details
4. **Consider alternatives** and their trade-offs
5. **Estimate impact** on users and codebase

## 🔒 Security

- **Never commit sensitive data** (API keys, passwords, etc.)
- **Use environment variables** for configuration
- **Follow OWASP guidelines** for web security
- **Report security issues** privately to the maintainers

## 📞 Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Reviews**: Code-specific discussions
- **Email**: Security issues and sensitive matters

## 🎉 Recognition

Contributors will be recognized in:

- **README.md**: Contributor section
- **Release Notes**: Feature attributions
- **GitHub**: Contributor graph and statistics

Thank you for contributing to BasedGuide! 🚀
