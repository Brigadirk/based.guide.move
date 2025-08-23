# Backend Tester - BasedGuide API Testing Tool

A simple Next.js application designed to test all backend API endpoints for debugging and development.

## 🎯 Purpose

This tool helps debug backend API communication issues by providing:
- ✅ Direct testing of all backend endpoints
- ✅ Editable mock data for each request
- ✅ Real-time response display
- ✅ Railway internal network testing

## 🚀 Quick Start

### Local Development
```bash
# From repository root
pnpm dev:tester

# App runs on http://localhost:3001
```

### Railway Deployment

#### Quick Setup:
1. **Create Railway Service:**
   ```bash
   railway create basedguide-backend-tester
   ```

2. **Configure Service:**
   - **Repository**: Connect to your GitHub repository
   - **Root Directory**: `apps/backend-tester`
   - **Environment Variables**: `NODE_ENV=production` (automatically set)

3. **Deploy:**
   ```bash
   cd apps/backend-tester
   railway up
   ```

#### Railway Configuration:
The `railway.json` file provides optimal settings:
- **Docker builder** with monorepo dockerfile path
- **Health checks** on `/` endpoint
- **Auto-restart** on failure with 3 retry attempts
- **Watch patterns** for automatic rebuilds on code changes

## 📋 Tested Endpoints

### Health & System
- `GET /health` - Backend health check
- `GET /api/v1/ping` - API ping test

### Section Stories
- `POST /api/v1/section/personal-information`
- `POST /api/v1/section/education`
- `POST /api/v1/section/residency-intentions`
- `POST /api/v1/section/finance`
- `POST /api/v1/section/social-security-pensions`
- `POST /api/v1/section/tax-deductions-credits`
- `POST /api/v1/section/future-financial-plans`
- `POST /api/v1/section/additional-information`
- `POST /api/v1/section/summary`

### Advanced Features
- `POST /api/v1/tax-advice`
- `POST /api/v1/custom-prompt`
- `POST /api/v1/generate-full-story`
- `POST /api/v1/perplexity-analysis`

### Exchange Rate Features
- `GET /api/v1/exchange-rates` - Get latest USD-based exchange rates
- `POST /api/v1/exchange-rates/refresh` - Force refresh from OpenExchangeRates API
- **Currency Converter** - Interactive tool to convert between currencies

## 🔧 Configuration

### Environment Detection
- **Development**: Connects to `http://localhost:5001`
- **Production**: Uses Railway internal URL `http://bonobo-backend.railway.internal`

### Mock Data
Each endpoint includes realistic mock data that can be edited in real-time through the web interface.

## 🐛 Debugging Features

### Request Testing
1. Click any endpoint button to test
2. Edit the JSON payload in the textarea
3. View response status and data
4. Check console for detailed logs

### Exchange Rate Features
1. **Get Exchange Rates**: View all USD-based exchange rates with metadata
2. **Currency Converter**: Interactive tool to convert between any supported currencies
3. **Refresh Rates**: Force fetch fresh rates from OpenExchangeRates API
4. **Visual Display**: Clean grid layout showing currency rates with timestamps

### Error Analysis
- Clear success/error indicators
- HTTP status codes displayed
- Full error messages shown
- Request/response logging

## 💡 Usage Tips

1. **Test Health First**: Always start with `/health` to verify backend connectivity
2. **Edit Payloads**: Modify the JSON data to test different scenarios
3. **Check Console**: Browser dev tools show detailed request/response logs
4. **Compare Responses**: Test same endpoint with different data to isolate issues

## 🔗 Railway Internal Testing

When deployed on Railway, this tool automatically uses the internal backend URL, allowing you to:
- Test backend without exposing it publicly
- Verify internal network communication
- Debug CORS and authentication issues
- Test all endpoints in production environment

Perfect for isolating backend issues separate from your main frontend application!
