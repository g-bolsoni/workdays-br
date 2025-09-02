# 🔧 Environment Configuration

## ⚠️ **IMPORTANT - Security Notice**

**NEVER commit `.env` files to your repository!** 

Environment files contain sensitive information like API keys, database passwords, and other secrets that should not be publicly visible.

## 📋 **Setup Instructions**

### 1. Backend Environment Variables

```bash
# Copy the example file
cp backend/.env.development.example backend/.env.development
cp backend/.env.example backend/.env.production

# Edit with your actual values
nano backend/.env.development
nano backend/.env.production
```

### 2. Frontend Environment Variables

```bash
# Copy the example file
cp frontend/.env.development.example frontend/.env.development
cp frontend/.env.example frontend/.env.production

# Edit with your actual values
nano frontend/.env.development
nano frontend/.env.production
```

## 🔒 **What's Protected**

The `.gitignore` files protect these sensitive files:

```bash
# All these are ignored by Git:
.env
.env.local
.env.development
.env.test
.env.production
.env.development.local
.env.test.local
.env.production.local
```

## 📖 **Environment Variables Documentation**

### Backend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `PORT` | Server port | `3001` |
| `API_BASE_URL` | BrasilAPI base URL | `https://brasilapi.com.br/api/v1` |
| `CORS_ORIGIN` | Frontend domain for CORS | `http://localhost:5173` |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |
| `CACHE_TTL` | Cache time in seconds | `3600` (1 hour) |

### Frontend Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |
| `VITE_APP_NAME` | Application name | `Workdays Calculator Brazil` |
| `VITE_APP_VERSION` | App version | `1.0.0` |
| `VITE_ENVIRONMENT` | Environment name | `development` |

## 🚨 **Security Best Practices**

1. **Never commit** `.env` files
2. **Always use** `.env.example` files for documentation
3. **Rotate secrets** regularly in production
4. **Use different values** for development and production
5. **Restrict access** to production environment variables

## 🛠️ **Quick Setup for Development**

```bash
# Backend
cd backend
cp .env.development.example .env.development
# Edit .env.development with your local settings

# Frontend  
cd ../frontend
cp .env.development.example .env.development
# Edit .env.development with your local settings

# Start development servers
cd ../backend && npm run dev &
cd ../frontend && npm run dev
```

## 📦 **Production Deployment**

For production deployment, set environment variables directly in your hosting platform:

### Heroku
```bash
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel
```bash
vercel env add VITE_API_URL
# Enter: https://your-backend.herokuapp.com
```

### Railway
Set variables in the Railway dashboard under "Variables" tab.

## ✅ **Verification**

To verify your setup is correct:

```bash
# Check if .env files are ignored
git status
# Should NOT show any .env files

# Check if .env.example files are tracked
git add .
git status
# Should show .env.example files but not .env files
```

Remember: **Environment files with actual values should NEVER appear in `git status`!** 🔒
