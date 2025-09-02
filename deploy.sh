#!/bin/bash

# 🚀 Script de Deploy Automatizado
# Calculadora de Dias Úteis

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se os comandos necessários estão instalados
check_dependencies() {
    log_info "Verificando dependências..."
    
    local deps=("node" "npm" "git")
    for dep in "${deps[@]}"; do
        if ! command -v $dep &> /dev/null; then
            log_error "$dep não está instalado!"
            exit 1
        fi
    done
    
    log_success "Todas as dependências estão instaladas!"
}

# Verificar se estamos na branch main
check_branch() {
    local current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        log_warning "Você não está na branch main (atual: $current_branch)"
        read -p "Continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deploy cancelado."
            exit 1
        fi
    fi
}

# Executar testes
run_tests() {
    log_info "Executando testes..."
    
    # Backend tests
    cd backend
    if npm test; then
        log_success "Testes do backend passaram!"
    else
        log_warning "Testes do backend falharam ou não existem"
    fi
    cd ..
    
    # Frontend build test
    cd frontend
    if npm run build; then
        log_success "Build do frontend executado com sucesso!"
    else
        log_error "Build do frontend falhou!"
        exit 1
    fi
    cd ..
}

# Deploy para Heroku (Backend)
deploy_backend_heroku() {
    log_info "Fazendo deploy do backend para Heroku..."
    
    if ! command -v heroku &> /dev/null; then
        log_error "Heroku CLI não está instalado!"
        log_info "Instale com: curl https://cli-assets.heroku.com/install-ubuntu.sh | sh"
        exit 1
    fi
    
    cd backend
    
    # Verificar se o app Heroku existe
    if ! heroku apps:info $HEROKU_APP_NAME &> /dev/null; then
        log_info "Criando app Heroku: $HEROKU_APP_NAME"
        heroku create $HEROKU_APP_NAME
    fi
    
    # Configurar variáveis de ambiente
    log_info "Configurando variáveis de ambiente..."
    heroku config:set NODE_ENV=production --app $HEROKU_APP_NAME
    heroku config:set CORS_ORIGIN=$FRONTEND_URL --app $HEROKU_APP_NAME
    
    # Deploy
    git add .
    git commit -m "Deploy: $(date)" || true
    git push heroku main
    
    # Verificar saúde
    sleep 30
    if curl -f https://$HEROKU_APP_NAME.herokuapp.com/health; then
        log_success "Backend deployado com sucesso!"
        export BACKEND_URL="https://$HEROKU_APP_NAME.herokuapp.com"
    else
        log_error "Deploy do backend falhou!"
        exit 1
    fi
    
    cd ..
}

# Deploy para Vercel (Frontend)
deploy_frontend_vercel() {
    log_info "Fazendo deploy do frontend para Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI não está instalado!"
        log_info "Instale com: npm i -g vercel"
        exit 1
    fi
    
    cd frontend
    
    # Configurar variável de ambiente
    echo "VITE_API_URL=$BACKEND_URL" > .env.production.local
    
    # Build e deploy
    npm run build
    vercel --prod --confirm
    
    log_success "Frontend deployado com sucesso!"
    cd ..
}

# Deploy via Docker
deploy_docker() {
    log_info "Fazendo deploy com Docker..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    # Build das imagens
    log_info "Construindo imagens Docker..."
    docker-compose build
    
    # Iniciar serviços
    log_info "Iniciando serviços..."
    docker-compose up -d
    
    # Verificar saúde
    sleep 30
    if curl -f http://localhost:3001/health; then
        log_success "Deploy Docker executado com sucesso!"
        log_info "Frontend: http://localhost"
        log_info "Backend: http://localhost:3001"
    else
        log_error "Deploy Docker falhou!"
        exit 1
    fi
}

# Mostrar menu de opções
show_menu() {
    echo "======================================"
    echo "🚀 Deploy - Calculadora de Dias Úteis"
    echo "======================================"
    echo "1) Deploy para Heroku + Vercel"
    echo "2) Deploy local com Docker"
    echo "3) Apenas testes"
    echo "4) Sair"
    echo "======================================"
}

# Configurações
HEROKU_APP_NAME="${HEROKU_APP_NAME:-calculadora-dias-uteis-api}"
FRONTEND_URL="${FRONTEND_URL:-https://calculadora-dias-uteis.vercel.app}"
BACKEND_URL=""

# Main
main() {
    check_dependencies
    
    show_menu
    read -p "Escolha uma opção (1-4): " choice
    
    case $choice in
        1)
            log_info "Iniciando deploy para produção..."
            check_branch
            run_tests
            deploy_backend_heroku
            deploy_frontend_vercel
            log_success "Deploy completo!"
            echo "Frontend: $FRONTEND_URL"
            echo "Backend: $BACKEND_URL"
            ;;
        2)
            log_info "Iniciando deploy Docker local..."
            run_tests
            deploy_docker
            ;;
        3)
            log_info "Executando apenas testes..."
            run_tests
            log_success "Testes concluídos!"
            ;;
        4)
            log_info "Saindo..."
            exit 0
            ;;
        *)
            log_error "Opção inválida!"
            exit 1
            ;;
    esac
}

# Verificar se é um source ou execução direta
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
