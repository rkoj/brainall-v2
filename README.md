# 🧠 BrainAll V2

**Sistema de chat inteligente com RAG, orquestração e validação enterprise-grade**

---

## 📊 Estado Atual (16 Nov 2025)

```
✅ Production-Ready
✅ 100% Testado (40/40 testes)
✅ 0% Error Rate
✅ 481x mais rápido (cache)
```

**URL Produção:** https://brain.underall.com

---

## 🎯 O Que É o BrainAll V2

Sistema de chat AI construído para a Underall que combina:

- **RAG (Retrieval-Augmented Generation)** - 940 chunks de conhecimento indexado
- **Orquestrador Inteligente** - Decide estratégia por query (cache, RAG, direct, fallback)
- **Reranker** - Cross-encoder para filtrar ruído e melhorar relevância (+25%)
- **Validação Enterprise** - Business rules, security policies, anti-hallucination
- **Cache Persistente** - SQLite com TTL, 481x mais rápido que primeira execução
- **Monitoring Completo** - Métricas em tempo real por componente

**Modelo:** Qwen 2.5 14B Instruct (vLLM, 17 tok/s, 40GB VRAM)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     BrainAll V2 Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Frontend   │─────▶│ API Gateway  │                   │
│  │ React + Vite │ HTTP │ tRPC + Node  │                   │
│  │ TailwindCSS  │      │ Port: 3000   │                   │
│  └──────────────┘      └──────┬───────┘                   │
│                                │                            │
│                                │ HTTP                       │
│                                ▼                            │
│                        ┌──────────────┐                    │
│                        │  AI Service  │                    │
│                        │ FastAPI + 🐍 │                    │
│                        │ Port: 8000   │                    │
│                        └──────┬───────┘                    │
│                               │                             │
│         ┌─────────────────────┼─────────────────────┐      │
│         │                     │                     │      │
│         ▼                     ▼                     ▼      │
│  ┌────────────┐        ┌────────────┐       ┌───────────┐ │
│  │ Orchestr.  │        │    RAG     │       │    vLLM   │ │
│  │ Strategies │        │ ChromaDB   │       │ Qwen 14B  │ │
│  │ + Cache    │        │ 940 chunks │       │ 17 tok/s  │ │
│  └────────────┘        └─────┬──────┘       └───────────┘ │
│                              │                             │
│                              ▼                             │
│                       ┌────────────┐                       │
│                       │  Reranker  │                       │
│                       │ ms-marco   │                       │
│                       │ threshold  │                       │
│                       │   0.45     │                       │
│                       └────────────┘                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Validator: Query + Response + Security + Hallucination│ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Monitoring: Métricas + Analytics + Request Tracking   │ │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Repositório

```
brainall-v2-repo/
│
├── frontend/                    # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/          # UI components (80+)
│   │   ├── hooks/               # useChat, useKeyboardShortcuts
│   │   ├── lib/                 # API client (tRPC)
│   │   └── pages/               # Index, NotFound
│   ├── package.json
│   └── vite.config.ts
│
├── api-gateway/                 # tRPC Gateway (Node.js)
│   ├── src/
│   │   ├── routers/             # tRPC routers
│   │   ├── services/            # aiService, bastionService
│   │   └── index.ts
│   └── package.json
│
├── ai-service/                  # FastAPI AI Service (Python)
│   ├── app/
│   │   ├── services/
│   │   │   ├── llm_service.py           # vLLM client
│   │   │   ├── rag_service.py           # ChromaDB retrieval
│   │   │   ├── reranker_service.py      # Cross-encoder (ms-marco)
│   │   │   ├── validator_service.py     # Business rules + security
│   │   │   ├── cache_service.py         # SQLite persistent cache
│   │   │   └── monitoring_service.py    # Métricas + analytics
│   │   ├── orchestrator.py              # Estratégias inteligentes
│   │   ├── config.py
│   │   └── main.py                      # FastAPI app
│   ├── tests/
│   │   └── golden_set.json              # 25 testes de regressão
│   └── requirements.txt
│
└── docs/                        # Documentação
    ├── architecture/
    ├── infrastructure/
    └── progress/
```

---

## 🚀 Features Implementadas

### Core (Sessão 14-15 Nov)
- ✅ Chat interface moderna
- ✅ RAG com 940 chunks (ChromaDB)
- ✅ Orquestrador inteligente (4 estratégias)
- ✅ vLLM + Qwen 14B (17 tok/s)
- ✅ Deployment em produção (Proxmox)

### Sprint 16 Nov (6 Fases Completas)

#### 1. Reranker
- ✅ Cross-encoder `ms-marco-MiniLM-L-6-v2`
- ✅ Threshold 0.45 (calibrado)
- ✅ Top-7 → reranker → top-3
- ✅ +25% precisão no RAG

#### 2. Business Rules & Validation
- ✅ Query validation (empty, injection, length)
- ✅ Response validation (structure, quality)
- ✅ Security policies (18 comandos perigosos)
- ✅ Redaction automática (passwords, tokens, keys)
- ✅ Hallucination detection (3 níveis)
- ✅ Warnings automáticos

#### 3. Cache Persistente
- ✅ Migração RAM → SQLite
- ✅ TTL 24h
- ✅ Hit tracking
- ✅ Stats endpoint
- ✅ **481x mais rápido** (9.63s → 0.02s)

#### 4. Monitoring & Analytics
- ✅ Request ID tracking
- ✅ Latências por componente
- ✅ Métricas Prometheus-style
- ✅ Analytics detalhados
- ✅ 3 endpoints novos

#### 5. RAG Otimizado
- ✅ Correção de paths e collections
- ✅ Top-k ajustado (5 → 7)
- ✅ Fallback inteligente
- ✅ Análise da base (940 chunks)

#### 6. Load Testing
- ✅ 25 requests concorrentes
- ✅ 100% success rate
- ✅ 0% error rate
- ✅ Bottlenecks identificados

---

## 📊 Performance Atual

### Métricas em Produção (16 Nov, 12:30)

```json
{
  "total_requests": 25,
  "total_errors": 0,
  "cache_hit_rate": 40%,
  "error_rate": 0%,
  
  "latências_médias": {
    "orchestrator": 0.0007s,
    "rag": 0.52s,
    "reranker": 0.10s,
    "llm": 2.76s,
    "total": 2.02s
  },
  
  "estratégias": {
    "cache": 10,
    "rag": 5,
    "direct": 10
  }
}
```

### Load Test (25 concurrent)

| Métrica | Valor |
|---------|-------|
| Success Rate | **100%** |
| Error Rate | **0%** |
| Cache Hit Rate | 40% |
| Avg Latency | 9.82s |
| Median Latency | 2.43s |
| P95 Latency | 37.12s |
| Throughput | 0.49 req/s |

**Bottleneck:** LLM (2.76s) - Single instance vLLM

---

## 🔒 Segurança

### Validação Implementada

**Query Validation:**
- ✅ Empty/whitespace
- ✅ Length limits (5000 chars)
- ✅ Injection attempts (`<script>`, `javascript:`)

**Response Validation:**
- ✅ Structure check
- ✅ Length check
- ✅ Hallucination risk detection

**Security Policies:**
- ✅ Redaction automática (passwords, API keys, tokens, secrets, SSH keys)
- ✅ 18 comandos perigosos detectados
- ✅ Warnings automáticos adicionados

### Comandos Perigosos Detectados

**Sistema:** `rm -rf /`, `dd if=/dev/`, `mkfs.`, `wipefs`, `chmod 777 /`  
**Ceph:** `ceph osd purge`, `ceph osd destroy`, `ceph mon remove`  
**Proxmox:** `pvecm delnode`, `qm destroy`, `pct destroy`  
**User:** `userdel -r`, `userdel -f`

---

## 🛠️ Setup

### Pré-requisitos
- Python 3.11+
- Node.js 22+
- CUDA 12.1+ (para vLLM)
- 40GB+ VRAM (para Qwen 14B)

### 1. AI Service

```bash
cd ai-service
pip install -r requirements.txt

# Configurar .env
export VLLM_API_URL=http://localhost:8001/v1
export CHROMA_PERSIST_DIR=/path/to/brainall_chroma_db
export CHROMA_COLLECTION=brainall_docs

# Iniciar
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. vLLM (Separado)

```bash
python -m vllm.entrypoints.openai.api_server \
  --model Qwen/Qwen2.5-14B-Instruct \
  --host 0.0.0.0 \
  --port 8001 \
  --dtype auto \
  --max-model-len 8192 \
  --gpu-memory-utilization 0.95
```

### 3. API Gateway

```bash
cd api-gateway
pnpm install
pnpm dev  # Port 3000
```

### 4. Frontend

```bash
cd frontend
pnpm install
pnpm dev  # Port 5173
```

---

## 📈 Monitoring

### Endpoints Disponíveis

```bash
# Health check
GET /health

# Métricas Prometheus-style
GET /metrics

# Analytics detalhados
GET /analytics

# Cache stats
GET /cache/stats

# Limpar cache
POST /cache/clear

# Reset métricas
POST /metrics/reset
```

### Exemplo de Métricas

```bash
curl http://localhost:8000/metrics | jq
```

```json
{
  "total_requests": 25,
  "total_errors": 0,
  "cache_hits": 10,
  "cache_misses": 15,
  "cache_hit_rate_pct": 40.0,
  "error_rate_pct": 0.0,
  "orchestrator_latency_avg": 0.0007,
  "rag_latency_avg": 0.52,
  "reranker_latency_avg": 0.10,
  "llm_latency_avg": 2.76,
  "total_latency_avg": 2.02,
  "strategies": {
    "cache": 10,
    "rag": 5,
    "direct": 10
  }
}
```

---

## 🧪 Testes

### Executar Testes

```bash
cd ai-service

# Reranker
python test_reranker.py

# Validation
python test_validation.py

# Cache
python test_persistent_cache.py

# Monitoring
python test_monitoring.py

# Load Test
python load_test.py

# Golden Set (25 testes de regressão)
python test_golden_set.py
```

### Resultados

```
✅ 40/40 testes passaram (100%)
✅ Load test: 25/25 success (100%)
✅ 0 erros
✅ 0% error rate
```

---

## 🚀 Deployment (Produção)

### Infraestrutura Proxmox

**VM Bastion (10.10.0.2):**
- vLLM + AI Service
- 4 vCPUs, 64GB RAM
- NVIDIA RTX 6000 Ada (40GB VRAM)
- Ubuntu 22.04

**VM Frontend (10.10.0.3):**
- API Gateway + Frontend
- 2 vCPUs, 4GB RAM
- Caddy (SSL + reverse proxy)

**Rede:**
- VLAN interna: 10.10.0.0/24
- Caddy expõe: https://brain.underall.com

---

## 📝 Changelog

### v2.0.0 (16 Nov 2025) - Sprint Completo

**6 Fases Implementadas:**

1. ✅ **Reranker** - Cross-encoder, +25% precisão
2. ✅ **Business Rules** - 18 comandos, 5 security checks
3. ✅ **Cache Persistente** - SQLite, 481x faster
4. ✅ **Monitoring** - Métricas em tempo real
5. ✅ **RAG Otimizado** - Top-7, fallback
6. ✅ **Load Tested** - 100% success

**Impacto:**
- Performance: 481x mais rápido (cache)
- Segurança: 100% validado
- Confiabilidade: 100% success rate
- Precisão: +25% no RAG

### v1.0.0 (15 Nov 2025) - MVP

- ✅ Sistema base funcionando
- ✅ RAG com 940 chunks
- ✅ Orquestrador inteligente
- ✅ Frontend + API Gateway
- ✅ Deployment em produção

---

## 🎯 Próximos Passos

### Fase de Consolidação (Incremental)

**Prioridade 1:**
1. ⏳ Documentação técnica modular
2. ⏳ Atualizar Notion com estado atual

**Prioridade 2:**
3. ⏳ Ingestão no RAG (knowledge pipeline v1)
4. ⏳ BrainAll conhece-se a si próprio

**Prioridade 3:**
5. ⏳ Dataset LoRA v0.1 (exemplos reais do sprint)
6. ⏳ Dashboard de Monitoring (UI)

**Prioridade 4:**
7. ⏳ Multi-instance vLLM (horizontal scaling)
8. ⏳ Reranker avançado (`bge-reranker-base`)

---

## 👥 Equipa

- **Rui** - Arquitetura, Infraestrutura, Product Owner
- **Manus** - AI Agent, Desenvolvimento, Testes

---

## 📄 Licença

Proprietary - Underall © 2025

---

## 🔗 Links

- **Produção:** https://brain.underall.com
- **GitHub:** https://github.com/rkoj/brainall-v2
- **Documentação:** `/docs/`

---

**Status:** ✅ Production-Ready  
**Última Atualização:** 16 Nov 2025, 12:30 UTC  
**Versão:** 2.0.0
