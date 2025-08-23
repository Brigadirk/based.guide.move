# Backend Tester - BasedGuide API Testing Tool

A simple Next.js application designed to test all backend API endpoints for debugging and development.

## 🎯 Purpose

This tool helps debug backend API communication issues by providing:
- ✅ **Three realistic test personas** with complete profile data
- ✅ **Only real endpoints** that the frontend actually uses
- ✅ **Dynamic URL switching** between internal and public backends
- ✅ **Real-time connection status** with health check testing
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

## 👤 Test Personas

The backend tester includes three comprehensive personas with realistic data:

### 🚀 **Young Tech Professional**
- **Profile**: 28-year-old software engineer from US
- **Destination**: Portugal (D7 visa, NHR tax regime)
- **Assets**: $250k total wealth, $120k remote income
- **Scenario**: Digital nomad seeking work-life balance and tax optimization

### 👨‍👩‍👧‍👦 **Family Retirees**
- **Profile**: Retired UK couple with 2 teenage children
- **Destination**: Spain (family relocation)
- **Assets**: £850k total wealth, £3.2k monthly pension
- **Scenario**: Healthcare, education, and lifestyle-focused move

### 💼 **Serial Entrepreneur**
- **Profile**: 45-year-old German business owner
- **Destination**: Singapore (business expansion)
- **Assets**: €2.4M total wealth, €180k business income
- **Scenario**: International business expansion and tax strategy

Each persona includes complete data for all sections: personal info, education, residency intentions, finance, social security, tax deductions, future plans, and additional information.

## 📋 Tested Endpoints

### Health & System
- `GET /health` - Backend health check
- `GET /api/v1/ping` - API ping test

### Section Stories (Real Frontend Endpoints)
- `POST /api/v1/section/personal-information`
- `POST /api/v1/section/education`
- `POST /api/v1/section/residency-intentions`
- `POST /api/v1/section/finance`
- `POST /api/v1/section/social-security-pensions`
- `POST /api/v1/section/tax-deductions-credits`
- `POST /api/v1/section/future-financial-plans`
- `POST /api/v1/section/additional-information`
- `POST /api/v1/section/summary`

### Advanced Analysis
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

## 🔗 Backend URL Switching

### Dynamic URL Configuration
The backend tester allows you to switch between different backend URLs in real-time:

#### **Preset URLs:**
- **Railway Internal**: `http://bonobo-backend.railway.internal` (secure internal network)
- **Railway Public**: `https://backend-staging-71d3.up.railway.app` (public access)
- **Local Development**: `http://localhost:5001` (local backend server)
- **Custom URL**: Enter any custom backend URL

#### **Connection Status:**
- 🟢 **Connected**: Backend is reachable and responding
- 🔴 **Error**: Backend is unreachable or not responding
- ⚪ **Unknown**: Connection status not yet tested

#### **Features:**
- **Persistent Storage**: Selected URL is saved in localStorage
- **Auto-Testing**: Connection is tested when URL changes
- **Manual Testing**: Click "Test" button to check connection
- **Real-time Switching**: Change URLs without page reload

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
