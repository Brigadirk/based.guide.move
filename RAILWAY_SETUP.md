# Railway Deployment Setup Guide

## 🚂 Railway Environment Variables Configuration

### Automatic Variables (Railway provides these automatically)

Railway automatically sets these environment variables - **DO NOT set them manually**:

```bash
RAILWAY_PROJECT_NAME=your-project-name
RAILWAY_ENVIRONMENT_NAME=production
RAILWAY_SERVICE_NAME=backend
RAILWAY_PROJECT_ID=abc123...
RAILWAY_ENVIRONMENT_ID=def456...
RAILWAY_SERVICE_ID=ghi789...
RAILWAY_PRIVATE_DOMAIN=backend-production-abc123.up.railway.app
PORT=3000
```

### Required Variables (Set these in Railway Dashboard)

#### Backend Service Variables

```bash
# API Keys (REQUIRED)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPEN_EXCHANGE_API_KEY=your_open_exchange_api_key_here

# Security (REQUIRED)
SECRET_KEY=your-super-secure-secret-key-min-32-characters

# CORS Configuration (REQUIRED)
ALLOWED_ORIGINS=https://your-frontend-domain.up.railway.app,https://your-custom-domain.com
```

#### Frontend Service Variables

```bash
# Backend API URL (REQUIRED)
NEXT_PUBLIC_API_URL=https://your-backend-domain.up.railway.app/api/v1

# Environment
NODE_ENV=production
```

### Optional Variables (Override defaults if needed)

#### Backend Optional Variables

```bash
# Application Configuration
ENVIRONMENT=production
HOST=0.0.0.0

# Perplexity Configuration
PERPLEXITY_MODEL=sonar-deep-research
PERPLEXITY_FALLBACK_MODEL=sonar
PERPLEXITY_TEMPERATURE=0.2
PERPLEXITY_TOP_P=1

# Exchange Rates Configuration
EXCHANGE_UPDATE_INTERVAL_HOURS=24

# Storage Configuration (Railway handles this automatically)
RAILWAY_VOLUME_MOUNT_PATH=/app/data
```

## 🚀 Deployment Steps

### 1. Backend Deployment

1. **Create Railway Backend Service**:
   ```bash
   railway create basedguide-backend
   railway link [your-project-id]
   ```

2. **Set Environment Variables**:
   ```bash
   railway env set PERPLEXITY_API_KEY="your_key_here"
   railway env set OPEN_EXCHANGE_API_KEY="your_key_here"  
   railway env set SECRET_KEY="your_secret_key_here"
   railway env set ALLOWED_ORIGINS="https://your-frontend-domain.com"
   ```

3. **Deploy Backend**:
   ```bash
   cd apps/backend
   railway up
   ```

### 2. Frontend Deployment

1. **Create Railway Frontend Service**:
   ```bash
   railway create basedguide-frontend
   railway link [your-project-id]
   ```

2. **Set Environment Variables**:
   ```bash
   railway env set NEXT_PUBLIC_API_URL="https://your-backend-domain.up.railway.app/api/v1"
   railway env set NODE_ENV="production"
   ```

3. **Deploy Frontend**:
   ```bash
   cd apps/frontend
   railway up
   ```

### 3. Volume Configuration (Backend)

Railway automatically provides persistent storage. Your backend is configured to:

- **Development**: Store exchange rates in `apps/backend/src/services/exchange_rates/`
- **Railway**: Store exchange rates in `/app/data/exchange_rates/`
- **Custom Volume**: Use `RAILWAY_VOLUME_MOUNT_PATH` if configured

## 🔍 Health Check & Monitoring

### Backend Health Endpoint

Your backend includes a comprehensive health check at `/health`:

```bash
curl https://your-backend-domain.up.railway.app/health
```

Response includes:
- Railway environment information
- Exchange rates status  
- Volume accessibility
- Service configuration

### Frontend Health

Check frontend at the root URL:
```bash
curl https://your-frontend-domain.up.railway.app/
```

## 🔧 Configuration Verification

Your code automatically detects Railway environment:

```python
# Backend - apps/backend/src/config.py
Config.is_railway()        # True if running on Railway
Config.is_production()     # True if production environment
Config.get_service_url()   # Returns proper service URL
```

## 📊 Environment Examples

### Development Environment
```bash
RAILWAY_ENVIRONMENT_NAME=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:5001/api/v1
```

### Production Environment  
```bash
RAILWAY_ENVIRONMENT_NAME=production
ALLOWED_ORIGINS=https://basedguide.com,https://app.basedguide.com
NEXT_PUBLIC_API_URL=https://api.basedguide.com/api/v1
```

## 🚨 Security Considerations

1. **Never commit real API keys** to the repository
2. **Use Railway's secure environment variables** for all secrets
3. **Configure CORS properly** with your actual frontend domains
4. **Use HTTPS** in production (Railway handles this automatically)
5. **Rotate SECRET_KEY** regularly

## 🔄 CI/CD Integration

Your GitHub Actions are configured to deploy automatically:

- **Backend**: Deploys when `apps/backend/` changes
- **Frontend**: Deploys when `apps/frontend/` changes

Required GitHub Secrets:
```bash
RAILWAY_TOKEN=your_railway_token
RAILWAY_BACKEND_SERVICE_ID=your_backend_service_id  
RAILWAY_FRONTEND_SERVICE_ID=your_frontend_service_id
```

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Update `ALLOWED_ORIGINS` with your frontend domain
2. **API Not Found**: Check `NEXT_PUBLIC_API_URL` points to backend
3. **Exchange Rates**: Volume path `/app/data` should be writable
4. **Health Check Fails**: Verify all required environment variables are set

### Debug Commands

```bash
# Check Railway environment
railway env

# Check service logs
railway logs

# Check service status
railway status
```
