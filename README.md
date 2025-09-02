# 🇧🇷 Calculadora de Dias Úteis - Business Day Calculator

Um sistema completo para calcular datas finais considerando dias úteis e feriados nacionais brasileiros.

## 📁 Estrutura do Projeto

```
├── backend/              # API REST em Node.js + Express
│   ├── src/             # Código fonte refatorado
│   │   ├── calculators/ # Lógica de cálculo de dias úteis
│   │   ├── controllers/ # Controladores HTTP
│   │   ├── services/    # Integração com APIs externas
│   │   ├── utils/       # Utilitários de data
│   │   └── config/      # Configurações
│   ├── tests/           # Testes unitários
│   ├── server.js        # Entry point da aplicação
│   └── README.md        # Documentação do backend
│
├── frontend/            # Interface web com Vite
│   ├── index.html      # Interface principal
│   ├── main.js         # Lógica do frontend
│   ├── vite.config.js  # Configuração do Vite
│   └── README.md       # Documentação do frontend
│
└── REFACTORING_SUMMARY.md # Documentação das melhorias

```

## 🏗️ Arquitetura do Sistema

```mermaid
graph TB
    subgraph "Frontend (Vite + Vanilla JS)"
        UI[Interface HTML]
        JS[main.js]
        DateUtils[DateUtils]
        UI --> JS
        JS --> DateUtils
    end

    subgraph "Backend (Node.js + Express)"
        Server[server.js]
        App[App.js]
        Controller[BusinessDayController]
        Calculator[BusinessDayCalculator]
        HolidayService[HolidayService]
        DateUtilsBackend[DateUtils]
        
        Server --> App
        App --> Controller
        Controller --> Calculator
        Calculator --> HolidayService
        Calculator --> DateUtilsBackend
    end

    subgraph "External APIs"
        BrasilAPI[BrasilAPI - Feriados]
    end

    JS -->|HTTP POST /calculate| Controller
    HolidayService -->|GET /feriados| BrasilAPI
    Controller -->|JSON Response| JS

    style UI fill:#e1f5fe
    style BrasilAPI fill:#fff3e0
    style Calculator fill:#e8f5e8
```

## 🔄 Fluxo de Dados

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend
    participant API as BrasilAPI

    U->>F: Seleciona data (calendário)
    F->>F: Converte para formato brasileiro
    U->>F: Insere dias úteis
    U->>F: Clica "Calcular"
    
    F->>F: Converte data brasileira para ISO
    F->>B: POST /calculate {startDate, businessDays}
    
    B->>API: GET /feriados/{year}
    API->>B: Lista de feriados
    B->>B: Cache dos feriados
    
    B->>B: Calcula dias úteis
    B->>B: Pula fins de semana
    B->>B: Pula feriados
    
    B->>F: JSON {success, data: {startDate, endDate}}
    F->>F: Converte datas para formato brasileiro
    F->>U: Exibe resultado formatado
```

## 🚀 Quick Start

### 1. Backend (API)
```bash
cd backend/
npm install
npm start
```
API estará disponível em: http://localhost:3001

### 2. Frontend (Interface)
```bash
cd frontend/
npm install
npm run dev
```
Interface estará disponível em: http://localhost:5173

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development Environment"
        DevFE[Frontend Dev Server<br/>:5173]
        DevBE[Backend Dev Server<br/>:3001]
        DevFE -.->|Proxy| DevBE
    end

    subgraph "Production Environment"
        LoadBalancer[Load Balancer]
        Frontend[Static Files<br/>Nginx/CDN]
        Backend[Node.js API<br/>PM2/Docker]
        Database[(Cache/Redis)]
        
        LoadBalancer --> Frontend
        LoadBalancer --> Backend
        Backend --> Database
    end

    subgraph "External Services"
        BrasilAPI[BrasilAPI<br/>Holidays Data]
        CDN[CDN<br/>Static Assets]
    end

    Frontend --> CDN
    Backend --> BrasilAPI
    
    style DevFE fill:#e1f5fe
    style DevBE fill:#e8f5e8
    style Frontend fill:#e1f5fe
    style Backend fill:#e8f5e8
    style BrasilAPI fill:#fff3e0
```

## 🌟 Funcionalidades

### 📅 **Cálculo Inteligente**
- Considera apenas dias úteis (segunda a sexta-feira)
- Exclui automaticamente feriados nacionais brasileiros
- Integração com BrasilAPI para dados atualizados

### 🎯 **Interface Brasileira**
- Seleção de data via calendário nativo
- Exibição em formato brasileiro (dd/mm/aaaa)
- Conversões automáticas e transparentes
- Validação inteligente de datas

### 🏗️ **Arquitetura Limpa**
- Princípios SOLID aplicados
- Separação clara de responsabilidades
- Código testável e manutenível
- Documentação completa

## 📋 Endpoints da API

### Health Check
```http
GET /health
```

### Calcular Dias Úteis
```http
POST /calculate
Content-Type: application/json

{
  "startDate": "2025-11-17",
  "businessDays": 5
}
```

### Legacy (Português)
```http
POST /calcular
Content-Type: application/json

{
  "dataInicial": "2025-11-17",
  "diasUteis": 5
}
```

## 💡 Exemplo de Uso

**Input:** 17/11/2025 + 5 dias úteis  
**Output:** 24/11/2025  

*Considerando que 20/11/2025 é feriado (Consciência Negra)*

## 🧮 Business Logic Flow

```mermaid
flowchart TD
    Start[Início: Data + Dias Úteis]
    
    Start --> CheckStart{Data inicial é dia útil?}
    CheckStart -->|Sim| Count1[Contador = 1]
    CheckStart -->|Não| Count0[Contador = 0]
    
    Count1 --> CheckComplete1{Contador = Meta?}
    Count0 --> NextDay[Próximo dia]
    CheckComplete1 -->|Sim| End[Retorna data atual]
    CheckComplete1 -->|Não| NextDay
    
    NextDay --> CheckWeekend{É fim de semana?}
    CheckWeekend -->|Sim| NextDay
    CheckWeekend -->|Não| CheckHoliday{É feriado?}
    
    CheckHoliday -->|Sim| NextDay
    CheckHoliday -->|Não| Increment[Contador++]
    
    Increment --> CheckComplete2{Contador = Meta?}
    CheckComplete2 -->|Sim| End
    CheckComplete2 -->|Não| NextDay
    
    style Start fill:#e1f5fe
    style End fill:#e8f5e8
    style CheckHoliday fill:#fff3e0
```

## 📊 System Components

```mermaid
mindmap
  root((Business Day Calculator))
    Frontend
      Calendar Input
      Brazilian Display
      Date Conversion
      User Interface
    Backend
      Express Server
      Clean Architecture
        Controllers
        Business Logic
        Services
        Utils
      Holiday Integration
    External
      BrasilAPI
      National Holidays
      Caching System
    Features
      Weekend Detection
      Holiday Exclusion
      Brazilian Format
      Responsive Design
```

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **BrasilAPI** - Dados de feriados nacionais
- **ESModules** - Sistema de módulos moderno

### Frontend  
- **Vite** - Build tool e dev server
- **Vanilla JavaScript** - Sem frameworks pesados
- **CSS3** - Styling moderno e responsivo
- **HTML5** - Semântica e acessibilidade

## 📖 Documentação Detalhada

- [Backend README](./backend/README.md) - API, arquitetura e endpoints
- [Frontend README](./frontend/README.md) - Interface, UX e conversões
- [Refactoring Summary](./REFACTORING_SUMMARY.md) - Melhorias e boas práticas

## ✨ Características Destacadas

- 🇧🇷 **100% Brasileiro**: Formato de datas, feriados e interface
- 📱 **Responsivo**: Funciona perfeitamente em mobile
- ⚡ **Rápido**: Cache de feriados e otimizações
- 🔒 **Confiável**: Validação completa e tratamento de erros
- 🧪 **Testado**: Testes unitários e validação
- 📚 **Documentado**: README completo e JSDoc

## 🎯 Status do Projeto

- ✅ **Backend**: Produção-ready com Clean Architecture
- ✅ **Frontend**: Interface moderna e acessível  
- ✅ **Integração**: BrasilAPI para feriados atualizados
- ✅ **Testes**: Cobertura de casos principais
- ✅ **Documentação**: Completa e atualizada

---

**Desenvolvido com ❤️ para facilitar o cálculo de prazos no Brasil** 🇧🇷
