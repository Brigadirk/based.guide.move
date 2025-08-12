# Development Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Start development server
npm run dev
```

## 📝 Available Scripts

### Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Code Quality
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Performance
- `npm run analyze` - Analyze bundle size with interactive treemap

## 🧪 Testing

We use Jest with React Testing Library for testing:

### Writing Tests
- Place tests in `__tests__/` directories or name them `*.test.ts(x)`
- Use React Testing Library for component testing
- Follow the testing pyramid: more unit tests, fewer integration tests

### Example Test
```typescript
import { render, screen } from '@testing-library/react'
import { MyComponent } from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})
```

## 🎨 Code Style

### Prettier Configuration
- Semi-colons: disabled
- Single quotes: enabled
- Tab width: 2 spaces
- Print width: 100 characters
- Tailwind CSS class sorting: enabled

### ESLint Rules
- Next.js recommended rules
- TypeScript strict mode
- React hooks rules

## 📦 Bundle Analysis

To analyze your bundle size:

```bash
npm run analyze
```

This will:
1. Build the application
2. Generate an interactive bundle analyzer
3. Open it in your browser
4. Show you which dependencies are taking up space

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Tailwind CSS IntelliSense
- TypeScript Importer

### Git Hooks
Pre-commit hooks are automatically set up with Husky to:
- Run TypeScript checking
- Run ESLint
- Format code with Prettier
- Run tests on changed files

## 🏗️ Architecture

### State Management
- **Zustand**: Global state management
- **React Hook Form**: Form state management
- **Local State**: Component-specific state with useState/useReducer

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Reusable component library
- **CSS Modules**: For complex custom styling

### Data Fetching
- **Axios**: HTTP client for API calls
- **React Query**: Server state management (future enhancement)

## 📁 Project Structure

```
base_recommender_next_js/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── features/          # Feature-specific components
│   ├── ui/                # Reusable UI components
│   └── icons.tsx          # Centralized icon management
├── lib/                   # Utilities and business logic
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   └── utils/             # Helper functions
├── data/                  # Static data files
├── __tests__/             # Test files
└── public/                # Static assets
```

## 🔄 Common Workflows

### Adding a New Component
1. Create component in appropriate directory
2. Add to relevant index.ts for easier imports
3. Write tests for the component
4. Add Storybook story (future enhancement)

### Adding a New API Endpoint
1. Add route to backend
2. Update API client in `lib/api-client.ts`
3. Add TypeScript types
4. Write integration tests

### Performance Optimization
1. Use `npm run analyze` to identify large bundles
2. Implement code splitting with dynamic imports
3. Optimize images with Next.js Image component
4. Use React.memo for expensive components

## 🐛 Debugging

### Development Tools
- React DevTools browser extension
- Zustand DevTools for state inspection
- Next.js built-in error overlay

### Common Issues
- **Hydration errors**: Check for SSR/client differences
- **Bundle size**: Use bundle analyzer to identify large dependencies
- **Performance**: Use React Profiler to identify slow components

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] Run `npm run type-check`
- [ ] Run `npm run lint`
- [ ] Run `npm run test`
- [ ] Run `npm run build`
- [ ] Test production build locally with `npm run start`

### Environment Variables
Create `.env.local` for local development:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [shadcn/ui](https://ui.shadcn.com/)
