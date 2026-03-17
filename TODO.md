# TODO - Melhorias do Projeto

## 🔴 Prioridade Alta (Críticos para Produção)

### 1. Cache com Expiração (HolidayService)

- [ ] Implementar TTL no cache de feriados
- [ ] Adicionar timestamp ao armazenar dados
- [ ] Verificar expiração antes de retornar cache
- **Arquivo:** `backend/src/services/HolidayService.js`

### 2. Cálculo de Anos Relevantes (DateUtils)

- [ ] Substituir threshold fixo de 200 dias
- [ ] Estimar dias calendário reais (~1.5x dias úteis)
- [ ] Garantir que todos os anos necessários sejam buscados
- **Arquivo:** `backend/src/utils/DateUtils.js`

### 3. Rate Limiting (App.js)

- [ ] Instalar `express-rate-limit`
- [ ] Configurar limite de requisições por IP
- [ ] Aplicar nos endpoints de cálculo
- **Arquivo:** `backend/src/App.js`

### 4. CORS (App.js)

- [ ] Instalar pacote `cors`
- [ ] Configurar origens permitidas via variável de ambiente
- [ ] Restringir métodos HTTP permitidos
- **Arquivo:** `backend/src/App.js`

---

## 🟡 Prioridade Média

### 5. Validação de Ano Futuro (BusinessDayCalculator)

- [ ] Adicionar validação de limite máximo de anos
- [ ] Retornar erro amigável para datas muito distantes
- [ ] Considerar limite de 2 anos no futuro
- **Arquivo:** `backend/src/calculators/BusinessDayCalculator.js`

### 6. Fallback para Feriados (HolidayService)

- [ ] Criar lista de feriados fixos nacionais
- [ ] Usar fallback quando API BrasilAPI estiver offline
- [ ] Incluir: Ano Novo, Tiradentes, Trabalho, Independência, etc.
- **Arquivo:** `backend/src/services/HolidayService.js`

---

## 🟢 Prioridade Baixa (Nice to Have)

### 7. Logging Estruturado

- [ ] Instalar biblioteca de logging (pino ou winston)
- [ ] Substituir `console.log/error` por logger estruturado
- [ ] Configurar níveis de log via variável de ambiente
- **Arquivos:** Todos os arquivos do backend

### 8. Testes de Integração

- [ ] Teste de cálculo atravessando virada de ano
- [ ] Teste com API de feriados offline (fallback)
- [ ] Teste com feriados móveis (Páscoa, Carnaval, Corpus Christi)
- [ ] Teste de edge cases (1 dia útil, 365+ dias úteis)
- **Pasta:** `backend/tests/`

---

## 📝 Notas

### Dependências a Instalar

```bash
npm install express-rate-limit cors pino
```

### Variáveis de Ambiente Sugeridas

```env
ALLOWED_ORIGINS=http://localhost:5173,https://meusite.com
LOG_LEVEL=info
CACHE_TTL_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Feriados Fixos Brasileiros

| Data  | Feriado                  |
| ----- | ------------------------ |
| 01/01 | Ano Novo                 |
| 21/04 | Tiradentes               |
| 01/05 | Dia do Trabalho          |
| 07/09 | Independência            |
| 12/10 | Nossa Senhora Aparecida  |
| 02/11 | Finados                  |
| 15/11 | Proclamação da República |
| 25/12 | Natal                    |

---

_Última atualização: Março 2026_
