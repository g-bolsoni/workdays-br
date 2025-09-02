# 🚀 Guia de Deploy para Produção

## 📋 Índice

1. [Preparação para Produção](#preparação-para-produção)
2. [Opções de Hospedagem](#opções-de-hospedagem)
3. [Deploy Automático com GitHub Actions](#deploy-automático)
4. [Configuração de Ambiente](#configuração-de-ambiente)
5. [Monitoramento e Logs](#monitoramento-e-logs)
6. [Backup e Segurança](#backup-e-segurança)

## 🛠️ Preparação para Produção

### 1. Configuração de Variáveis de Ambiente

```bash
# backend/.env.production
NODE_ENV=production
PORT=3001
API_BASE_URL=https://brasilapi.com.br/api/v1
CORS_ORIGIN=https://seu-dominio.com
LOG_LEVEL=info
CACHE_TTL=86400
```

### 2. Otimização do Backend

```javascript
// backend/src/config/Config.js - Configuração para produção
class Config {
  static get() {
    return {
      port: process.env.PORT || 3001,
      nodeEnv: process.env.NODE_ENV || 'production',
      corsOrigin: process.env.CORS_ORIGIN || '*',
      apiBaseUrl: process.env.API_BASE_URL || 'https://brasilapi.com.br/api/v1',
      logLevel: process.env.LOG_LEVEL || 'info',
      cacheTtl: parseInt(process.env.CACHE_TTL) || 86400, // 24 horas
      rateLimitWindow: 15 * 60 * 1000, // 15 minutos
      rateLimitMax: 100, // requests por window
      enableHttps: process.env.ENABLE_HTTPS === 'true',
      sslCert: process.env.SSL_CERT_PATH,
      sslKey: process.env.SSL_KEY_PATH
    }
  }
}
```

### 3. Build do Frontend

```bash
# frontend/vite.config.js - Configuração de produção
export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['axios']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://seu-backend.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
})
```

## 🌐 Opções de Hospedagem

### 1. 🥇 **Vercel** (Recomendado para Frontend)

#### Frontend (Gratuito)
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Build do frontend
cd frontend
npm run build

# 3. Deploy
vercel --prod
```

#### Configuração Vercel
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://seu-backend.herokuapp.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "https://seu-backend.herokuapp.com"
  }
}
```

### 2. 🚀 **Heroku** (Backend)

#### Preparação
```bash
# 1. Instalar Heroku CLI
# Ubuntu/Debian
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# 2. Login
heroku login

# 3. Criar app
heroku create calculadora-dias-uteis-api

# 4. Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set PORT=3001
heroku config:set CORS_ORIGIN=https://seu-frontend.vercel.app
```

#### Procfile
```bash
# backend/Procfile
web: npm start
```

#### Deploy
```bash
cd backend
git init
git add .
git commit -m "Deploy inicial"
heroku git:remote -a calculadora-dias-uteis-api
git push heroku main
```

### 3. 🐳 **Railway** (Full-Stack)

```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
healthcheckTimeout = 300

[env]
NODE_ENV = "production"
```

### 4. ☁️ **DigitalOcean App Platform**

```yaml
# .do/app.yaml
name: calculadora-dias-uteis
services:
- name: backend
  source_dir: /backend
  github:
    repo: seu-usuario/calculadora-dias-uteis
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    value: "8080"

- name: frontend
  source_dir: /frontend
  github:
    repo: seu-usuario/calculadora-dias-uteis
    branch: main
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

### 5. 🔥 **Firebase** (Full-Stack)

```json
// firebase.json
{
  "hosting": {
    "public": "frontend/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "backend",
    "runtime": "nodejs18"
  }
}
```

## 🤖 Deploy Automático com GitHub Actions

### Workflow Completo

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: |
          backend/package-lock.json
          frontend/package-lock.json

    - name: Test Backend
      run: |
        cd backend
        npm ci
        npm test

    - name: Test Frontend
      run: |
        cd frontend
        npm ci
        npm run build

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3

    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "calculadora-dias-uteis-api"
        heroku_email: "seu-email@gmail.com"
        appdir: "backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json

    - name: Build Frontend
      run: |
        cd frontend
        npm ci
        npm run build
      env:
        VITE_API_URL: ${{secrets.VITE_API_URL}}

    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{secrets.VERCEL_TOKEN}}
        vercel-org-id: ${{secrets.ORG_ID}}
        vercel-project-id: ${{secrets.PROJECT_ID}}
        working-directory: frontend
        vercel-args: '--prod'
```

## ⚙️ Configuração de Ambiente

### 1. Package.json Scripts de Produção

```json
// backend/package.json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "echo 'No build needed for Node.js'",
    "postinstall": "npm audit fix",
    "health": "curl -f http://localhost:$PORT/health || exit 1"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
```

```json
// frontend/package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "echo 'No tests yet'",
    "deploy": "npm run build && vercel --prod"
  }
}
```

### 2. Dockerfile (Opcional)

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

USER node

CMD ["npm", "start"]
```

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

## 📊 Monitoramento e Logs

### 1. Health Check Endpoint

```javascript
// backend/src/controllers/HealthController.js
class HealthController {
  static health(req, res) {
    const status = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV
    }

    res.status(200).json(status)
  }
}
```

### 2. Logging Estruturado

```javascript
// backend/src/utils/Logger.js
const winston = require('winston')

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'business-day-calculator' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

module.exports = logger
```

### 3. Métricas com PM2

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'business-day-calculator',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    log_file: './logs/combined.log',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
}
```

## 🔒 Backup e Segurança

### 1. Rate Limiting

```javascript
// backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

module.exports = limiter
```

### 2. HTTPS e Certificados

```bash
# Usar Certbot para SSL gratuito
sudo certbot --nginx -d seu-dominio.com
```

### 3. Backup de Configurações

```bash
#!/bin/bash
# scripts/backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/$DATE"

mkdir -p $BACKUP_DIR

# Backup de configurações
cp -r .env* $BACKUP_DIR/
cp package*.json $BACKUP_DIR/
cp vercel.json $BACKUP_DIR/
cp Procfile $BACKUP_DIR/

echo "Backup criado em: $BACKUP_DIR"
```

## 🎯 Checklist de Deploy

### Pré-Deploy
- [ ] Testes passando
- [ ] Variáveis de ambiente configuradas
- [ ] Logs estruturados implementados
- [ ] Health check funcionando
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente

### Deploy
- [ ] Backend deployado e funcionando
- [ ] Frontend buildado e deployado
- [ ] DNS configurado
- [ ] HTTPS habilitado
- [ ] Monitoramento ativo

### Pós-Deploy
- [ ] Testar endpoints de produção
- [ ] Verificar logs
- [ ] Configurar alertas
- [ ] Documentar URLs de produção
- [ ] Fazer backup das configurações

## 🏆 Recomendação Final

**Para começar rapidamente:**

1. **Frontend**: Vercel (gratuito, fácil)
2. **Backend**: Railway ou Heroku (planos gratuitos disponíveis)
3. **Monitoramento**: Usar health checks nativos
4. **CI/CD**: GitHub Actions

**Para produção séria:**

1. **Frontend**: Vercel Pro ou Netlify
2. **Backend**: DigitalOcean App Platform ou AWS
3. **Banco**: PostgreSQL ou MongoDB Atlas
4. **Monitoramento**: Datadog ou New Relic
5. **CDN**: Cloudflare

Esta aplicação está pronta para produção e pode escalar conforme necessário! 🚀
