# 🚀 Guia Rápido de Configuração

## 1. Heroku (Backend) - GRATUITO

### Passo a passo:

```bash
# 1. Instalar Heroku CLI
curl https://cli-assets.heroku.com/install-ubuntu.sh | sh

# 2. Login
heroku login

# 3. Criar aplicação
heroku create calculadora-dias-uteis-api

# 4. Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=https://seu-frontend.vercel.app

# 5. Deploy
cd backend
git init
git add .
git commit -m "Initial commit"
heroku git:remote -a calculadora-dias-uteis-api
git push heroku main
```

### URL do Backend:
`https://calculadora-dias-uteis-api.herokuapp.com`

---

## 2. Vercel (Frontend) - GRATUITO

### Passo a passo:

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Configurar projeto
cd frontend
echo "VITE_API_URL=https://calculadora-dias-uteis-api.herokuapp.com" > .env.production

# 4. Deploy
npm run build
vercel --prod
```

### URL do Frontend:
`https://calculadora-dias-uteis.vercel.app`

---

## 3. Railway (Full-Stack) - GRATUITO

### Configuração simples:

1. Acesse [railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Deploy automático configurado!

---

## 4. DigitalOcean App Platform

### Custo: ~$5/mês

1. Acesse [DigitalOcean](https://digitalocean.com)
2. Crie uma App
3. Conecte o repositório
4. Configure as variáveis de ambiente

---

## 🔧 Configuração Rápida (Recomendado)

Para começar rapidamente, use o script automatizado:

```bash
./deploy.sh
```

Escolha a opção 1 e siga as instruções!

---

## 💡 Dicas Importantes

### Variáveis de Ambiente:

**Backend (Heroku):**
- `NODE_ENV=production`
- `CORS_ORIGIN=https://seu-frontend.vercel.app`

**Frontend (Vercel):**
- `VITE_API_URL=https://seu-backend.herokuapp.com`

### URLs de Exemplo:
- **Frontend**: https://calculadora-dias-uteis.vercel.app
- **Backend**: https://calculadora-dias-uteis-api.herokuapp.com
- **API**: https://calculadora-dias-uteis-api.herokuapp.com/calculate

### Teste a API:
```bash
curl -X POST https://calculadora-dias-uteis-api.herokuapp.com/calculate \
  -H "Content-Type: application/json" \
  -d '{"startDate": "2025-11-17", "businessDays": 5}'
```

---

## ⚡ Deploy em 5 minutos

1. **Clone o projeto**
2. **Configure Heroku**: `heroku create nome-da-sua-app`
3. **Configure Vercel**: `vercel`
4. **Execute**: `./deploy.sh`
5. **Pronto!** 🎉

Sua aplicação estará online e funcionando!
