# Cache Service

**Arquivo:** `ai-service/app/services/cache_service.py`  
**Versão:** 1.0.0  
**Data:** 16 Nov 2025

---

## O Que Faz

O Cache Service armazena respostas de queries frequentes em **SQLite persistente** para retornar instantaneamente (<0.1s) sem precisar chamar RAG ou LLM.

**Problemas resolvidos:**
- Latência alta para FAQs (10-15s → 0.02s)
- Custo computacional desnecessário
- Sobrecarga no vLLM
- Cache perdido em restarts (RAM)

**Resultado:** **481x mais rápido** para queries em cache

---

## Como Funciona

### Arquitetura

```
Query
  ↓
Hash (SHA256)
  ↓
SQLite Lookup
  ├─ Hit → Return cached response (0.02s)
  └─ Miss → Process normally → Save to cache
```

### Schema SQLite

```sql
CREATE TABLE cache (
    key TEXT PRIMARY KEY,        -- SHA256 hash da query
    value TEXT NOT NULL,         -- Response (JSON)
    created_at TIMESTAMP,        -- Data de criação
    expires_at TIMESTAMP,        -- Data de expiração
    hits INTEGER DEFAULT 0       -- Contador de acessos
)
```

### TTL (Time To Live)

**Default:** 24 horas

```python
expires_at = now + timedelta(hours=24)
```

**Após expiração:**
- Entry é removido automaticamente no próximo cleanup
- Nova query gera novo cache

---

## Como Usar

### Inicialização

```python
from app.services.cache_service import cache_service

# Singleton - já inicializado automaticamente
# DB: ./data/cache.db
```

### Get (Buscar)

```python
query = "O que é o BrainAll V2?"

# Buscar no cache
cached_response = cache_service.get(query)

if cached_response:
    # ✅ Cache hit (0.02s)
    return cached_response
else:
    # ❌ Cache miss - processar normalmente
    response = process_query(query)
    cache_service.set(query, response)
    return response
```

### Set (Salvar)

```python
# Salvar resposta no cache
cache_service.set(
    key=query,
    value=response  # Pode ser string ou dict
)

# TTL default: 24h
# Expira automaticamente
```

### Stats (Estatísticas)

```python
stats = cache_service.get_stats()

# Retorna:
{
    "total_entries": 10,
    "active_entries": 8,
    "expired_entries": 2,
    "total_hits": 45,
    "avg_hits_per_entry": 5.6,
    "top_queries": [
        {"query": "O que é BrainAll?", "hits": 15},
        {"query": "Como configurar Proxmox?", "hits": 12},
        ...
    ]
}
```

### Clear (Limpar)

```python
# Limpar cache completo
cache_service.clear()

# Limpar apenas expirados
cache_service._cleanup_expired()
```

---

## Integração no Sistema

### No Orchestrator

```python
# orchestrator.py

def decide_strategy(self, query: str, history: List) -> str:
    # 1. Verificar cache primeiro
    cached = cache_service.get(query)
    if cached:
        return "cache"
    
    # 2. Classificar estratégia
    if self._is_simple_greeting(query):
        return "direct"
    elif self._is_faq(query):
        return "rag"  # Será cached após primeira execução
    # ...
```

### No Endpoint de Chat

```python
@app.post("/v1/chat")
async def chat(request: ChatRequest):
    query = request.messages[-1].content
    
    # 1. Tentar cache
    cached = cache_service.get(query)
    if cached:
        return {
            "response": cached,
            "sources": ["cache"],
            "strategy": "cache"
        }
    
    # 2. Processar normalmente
    response = await process_query(query)
    
    # 3. Salvar no cache
    cache_service.set(query, response)
    
    return response
```

---

## Métricas e Resultados

### Performance

**Latência:**
- Cache hit: **0.02s** (média)
- Cache miss: 10-15s (RAG + LLM)
- **Speedup: 481x**

**Throughput:**
- Cache hits: ~50 req/s (limitado por I/O)
- Cache misses: ~0.1 req/s (limitado por LLM)

### Hit Rate

**Produção (16 Nov, 12:30):**
- Total requests: 25
- Cache hits: 10
- Cache misses: 15
- **Hit rate: 40%**

**Expectativa:**
- Primeiras 24h: 20-30%
- Após 1 semana: 50-60%
- Após 1 mês: 70-80%

### Exemplos Reais

**Teste: FAQ Repetida**

| Execução | Latência | Status |
|----------|----------|--------|
| 1ª | 9.63s | Cache miss |
| 2ª | **0.02s** | Cache hit ✅ |
| 3ª | **0.00s** | Cache hit ✅ |

**Melhoria: 481x (9.63s → 0.02s)**

---

## Configuração

### TTL (Time To Live)

```python
# app/services/cache_service.py

# Default: 24 horas
TTL_HOURS = 24

# Ajustar se necessário
cache_service.set(query, response, ttl_hours=48)  # 48h
```

### Database Path

```python
# app/services/cache_service.py

DB_PATH = "./data/cache.db"

# Ou via env var
DB_PATH = os.getenv("CACHE_DB_PATH", "./data/cache.db")
```

### Cleanup Automático

```python
# Executado a cada operação
cache_service._cleanup_expired()

# Ou manual
cache_service._cleanup_expired()
```

---

## Endpoints

### GET /cache/stats

**Descrição:** Estatísticas do cache

**Response:**
```json
{
  "total_entries": 10,
  "active_entries": 8,
  "expired_entries": 2,
  "total_hits": 45,
  "avg_hits_per_entry": 5.6,
  "top_queries": [
    {
      "query": "O que é BrainAll V2?",
      "hits": 15,
      "created_at": "2025-11-16T10:00:00Z"
    }
  ]
}
```

### POST /cache/clear

**Descrição:** Limpar cache completo

**Response:**
```json
{
  "message": "Cache cleared",
  "entries_removed": 10
}
```

---

## Troubleshooting

### Problema: Cache não está salvando

**Sintoma:** Hit rate sempre 0%

**Diagnóstico:**
```python
# Verificar se DB existe
import os
os.path.exists("./data/cache.db")  # True?

# Verificar permissões
os.access("./data/cache.db", os.W_OK)  # True?
```

**Solução:**
1. Criar diretório `./data/`
2. Verificar permissões de escrita
3. Verificar logs de erro

### Problema: Hit rate muito baixo

**Sintoma:** Hit rate < 10% após 1 semana

**Causas possíveis:**
1. Queries muito variadas (não há repetição)
2. TTL muito curto (expira antes de reutilizar)
3. Hash não normalizado (case-sensitive)

**Solução:**
1. Normalizar queries (lowercase, trim)
2. Aumentar TTL (24h → 48h)
3. Implementar fuzzy matching

### Problema: Database muito grande

**Sintoma:** `cache.db` > 1GB

**Solução:**
```python
# Limpar entries antigas
cache_service.clear()

# Ou reduzir TTL
TTL_HOURS = 12  # 12h em vez de 24h

# Ou implementar LRU eviction
# (remover entries menos acessadas)
```

---

## Monitoramento

### Métricas Importantes

1. **Hit Rate**
   - Target: > 50% após 1 semana
   - Fórmula: `hits / (hits + misses)`

2. **Avg Hits per Entry**
   - Target: > 3
   - Indica reutilização do cache

3. **Database Size**
   - Target: < 100MB
   - Monitorar crescimento

4. **Expired Entries**
   - Target: < 10%
   - Cleanup funcionando?

### Dashboard (Futuro)

```
┌─────────────────────────────────────┐
│ Cache Performance                   │
├─────────────────────────────────────┤
│ Hit Rate: 65% ▲                     │
│ Total Entries: 150                  │
│ Avg Latency: 0.02s                  │
│ DB Size: 45MB                       │
└─────────────────────────────────────┘

Top Queries:
1. "O que é BrainAll?" - 45 hits
2. "Como configurar Proxmox?" - 32 hits
3. "vLLM performance?" - 28 hits
```

---

## Comparação: RAM vs SQLite

| Aspecto | RAM (antes) | SQLite (agora) |
|---------|-------------|----------------|
| Persistência | ❌ Perdido em restart | ✅ Persistente |
| Latência | 0.001s | 0.02s |
| Capacidade | ~1GB (limitado) | ~100GB (disco) |
| Queries | ❌ Não | ✅ SQL queries |
| Stats | ❌ Não | ✅ Built-in |
| Backup | ❌ Difícil | ✅ Copy file |

**Conclusão:** SQLite é melhor para produção (trade-off de 0.019s vale a pena)

---

## Próximos Passos

### Melhorias Planejadas

1. **Redis Migration**
   - Se hit rate > 70%
   - Se latência se tornar crítica
   - Distributed cache

2. **LRU Eviction**
   - Remover entries menos usadas
   - Limitar tamanho do DB

3. **Fuzzy Matching**
   - Queries similares → mesmo cache
   - Ex: "O que é BrainAll?" ≈ "o que e brainall"

4. **Cache Warming**
   - Pre-populate com FAQs
   - Reduzir cold start

5. **Analytics**
   - Query patterns
   - Peak hours
   - User behavior

---

## Referências

- SQLite Docs: https://www.sqlite.org/docs.html
- Python sqlite3: https://docs.python.org/3/library/sqlite3.html
- Cache Strategies: https://en.wikipedia.org/wiki/Cache_replacement_policies

---

**Última Atualização:** 16 Nov 2025  
**Autor:** Manus AI  
**Status:** ✅ Production-Ready
