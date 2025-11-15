# BrainAll V2 - Arquitetura Multi-Modelo Escalável

**Data:** 15 Novembro 2025  
**Versão:** 2.0  
**Status:** Planeamento e Design

---

## 📋 ÍNDICE

1. [Contexto e Análise](#contexto-e-análise)
2. [Infraestrutura Disponível](#infraestrutura-disponível)
3. [Comparação: Brain All V1 vs BrainAll V2](#comparação)
4. [Arquitetura Proposta](#arquitetura-proposta)
5. [Stack Tecnológica](#stack-tecnológica)
6. [Distribuição de Serviços](#distribuição-de-serviços)
7. [Roadmap de Implementação](#roadmap)

---

## 🎯 CONTEXTO E ANÁLISE

### Projeto Anterior: Brain All V1

**O que foi:**
- Agente AI autónomo privado para infraestrutura GPU e DevOps
- LLM local (Llama 3.1 70B via Ollama)
- Execução de código remoto (Python, Shell, Node.js)
- Memória persistente com RAG (ChromaDB)
- Agent loop com planeamento autónomo
- Interface 3 colunas estilo Manus

**Problemas:**
- ❌ Disco cheio (1.5TB de memória ChromaDB corrompida)
- ❌ Apenas 1 modelo LLM (Llama 3.1 70B)
- ❌ Sem multi-modelo support
- ❌ Infraestrutura não dimensionada corretamente
- ❌ Sem load balancing ou redundância

**Sucessos:**
- ✅ Agente funcionou perfeitamente
- ✅ RAG e memória funcionaram bem
- ✅ Execução remota via SSH estável
- ✅ Interface bonita e funcional
- ✅ Teste de aprendizagem autónoma bem-sucedido

---

### Novo Projeto: BrainAll V2 (page-navigator)

**O que é:**
- Sistema de chat AI multi-modelo
- Frontend moderno (React + Vite + shadcn/ui)
- Suporte para múltiplos LLMs (OpenAI, Anthropic, Llama, Mistral, etc.)
- Upload e processamento de ficheiros
- Gravação e transcrição de áudio
- Modo Agente com ferramentas
- Histórico de conversas persistente

**Estado Atual:**
- ✅ Frontend completo (apenas mock responses)
- ❌ Backend não implementado
- ❌ Sem integração com LLMs
- ❌ Sem base de dados

---

## 🖥️ INFRAESTRUTURA DISPONÍVEL

### 1. GPU Server (Hetzner Finlândia)
**Hostname:** gpu-node-130  
**IP:** 65.21.33.83  
**Specs:**
- **GPU:** NVIDIA RTX 6000 Ada Generation
  - VRAM: 49GB (48.14GB usável)
  - CUDA: 12.8
  - Driver: 570.195.03
- **CPU:** AMD EPYC (detalhes a confirmar)
- **RAM:** ~128GB (estimado)
- **Disco:** 1.8TB NVMe
  - Usado: 110GB (7%)
  - Livre: 1.6TB (93%)
- **OS:** Ubuntu 22.04 (6.8.0-85-generic)
- **Rede:** vSwitch VLAN 4000 (192.168.100.x)

**Credenciais:**
- User: root
- Password: Cl@$$UNDER2025
- SSH: `ssh root@65.21.33.83`

**Estado Atual:**
- ✅ GPU funcional e limpa
- ✅ Disco com espaço abundante
- ✅ Drivers NVIDIA atualizados
- ❌ Brain All V1 parado (processo terminado)
- ❌ Ollama status desconhecido

---

### 2. Servidor AX102 #1 (Hetzner Finlândia)
**Specs:**
- **CPU:** AMD Ryzen 9 7950X
  - 16 cores / 32 threads
  - Base: 4.5 GHz, Boost: 5.7 GHz
- **RAM:** 128 GB DDR5-4800
- **Storage:** 2x 3.84 TB NVMe SSD (RAID possível)
- **Network:** 1 Gbit/s
- **OS:** Proxmox VE (host)

**Uso Proposto:**
- Gateway API (Node.js + Express + tRPC)
- Nginx (load balancer + SSL)
- WebSocket server (streaming)
- Auth service
- File upload handler

---

### 3. Servidor AX102 #2 (Hetzner Finlândia)
**Specs:**
- **CPU:** AMD Ryzen 9 7950X (16c/32t)
- **RAM:** 128 GB DDR5-4800
- **Storage:** 2x 3.84 TB NVMe SSD
- **Network:** 1 Gbit/s
- **OS:** Proxmox VE (host)

**Uso Proposto:**
- AI Service (Python FastAPI)
- Processing workers (BullMQ/Celery)
- Whisper (transcrição de áudio)
- Image processing
- PDF extraction
- Web scraping (modo agente)

---

### 4. Servidor EK41 (Hetzner Finlândia)
**Specs:**
- **CPU:** AMD EPYC 7502P
  - 32 cores / 64 threads
  - Base: 2.5 GHz, Boost: 3.35 GHz
- **RAM:** 128 GB DDR4-3200
- **Storage:** 2x 960 GB NVMe SSD (RAID 1 recomendado)
- **Network:** 1 Gbit/s
- **OS:** Proxmox VE (host)

**Uso Proposto:**
- PostgreSQL 16 (database principal)
- Redis 7 (cache + queue)
- MinIO (S3-compatible storage)
- Backup service
- Monitoring (Prometheus + Grafana)

---

### 5. VCloud
**Specs:** A definir  
**Uso Proposto:** Frontend hosting ou redundância

---

### 6. Rede (vSwitch VLAN 4000)
**Configuração:**
- Subnet: 192.168.100.0/24
- Membros: GPU + AX102 #1 + AX102 #2 + EK41
- Latência: <1ms entre servidores
- Bandwidth: 10 Gbit/s interno

---

## 🔄 COMPARAÇÃO: Brain All V1 vs BrainAll V2

| Aspecto | Brain All V1 | BrainAll V2 (Proposto) |
|---------|--------------|------------------------|
| **Arquitetura** | Monolítico (GPU única) | Distribuída (4 servidores) |
| **LLMs** | 1 modelo (Llama 70B) | Multi-modelo (5+) |
| **Inference** | Ollama | vLLM (OpenAI-compatible) |
| **Backend** | Python FastAPI | Híbrido (Node.js + Python) |
| **Frontend** | Custom (Fase 4) | React + Vite (Lovable) |
| **Database** | ChromaDB (vector only) | PostgreSQL + Redis + ChromaDB |
| **Storage** | Local filesystem | MinIO (S3-compatible) |
| **Memória** | ChromaDB (1.5TB!) | PostgreSQL + Vector search |
| **Escalabilidade** | Vertical (GPU) | Horizontal (4 servers) |
| **Redundância** | Nenhuma | Load balancing + failover |
| **Monitoring** | Logs básicos | Prometheus + Grafana |
| **Deployment** | Manual | Docker + CI/CD |

---

## 🏗️ ARQUITETURA PROPOSTA

### Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / CLIENTS                          │
│                    (Web Browser / Mobile)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/WSS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CLOUDFLARE / CDN                            │
│                    (SSL, DDoS Protection)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (VCloud/Vercel)                      │
│                  - React 18 + TypeScript                         │
│                  - Vite 5 + Tailwind CSS                         │
│                  - shadcn/ui components                          │
│                  - page-navigator codebase                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS/WSS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOAD BALANCER (Nginx on AX102 #1)                   │
│              - SSL Termination                                   │
│              - Rate Limiting                                     │
│              - WebSocket Upgrade                                 │
└───────────┬─────────────────────────────┬───────────────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐    ┌───────────────────────┐
│   Gateway API #1      │    │   Gateway API #2      │
│   (AX102 #1 VM)       │    │   (AX102 #2 VM)       │
│   - Node.js 22        │    │   - Node.js 22        │
│   - Express + tRPC    │    │   - Express + tRPC    │
│   - Socket.io         │    │   - Socket.io         │
│   - JWT Auth          │    │   - JWT Auth          │
│   - File Upload       │    │   - File Upload       │
└───────────┬───────────┘    └───────────┬───────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  AI Service      │ │ Processing       │ │ GPU Inference    │
│  (AX102 #2 VM)   │ │ Workers          │ │ (GPU Server)     │
│  - Python FastAPI│ │ (AX102 #2 VM)    │ │ - vLLM           │
│  - LangChain     │ │ - Celery/BullMQ  │ │ - Multi-model    │
│  - Model Router  │ │ - Whisper        │ │ - OpenAI API     │
│  - Tool Executor │ │ - Image Proc     │ │ - Model Cache    │
└──────────────────┘ └──────────────────┘ └────────┬─────────┘
            │              │                        │
            └──────────────┼────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │   Database & Storage (EK41)  │
            │   - PostgreSQL 16            │
            │   - Redis 7                  │
            │   - MinIO (S3)               │
            │   - pgvector (embeddings)    │
            └──────────────────────────────┘
```

---

### Fluxo de Dados: Chat Request

```
1. User → Frontend: "Explica-me o que é RAG"
2. Frontend → Gateway API: POST /api/chat
3. Gateway → Auth: Valida JWT token
4. Gateway → AI Service: Forward request
5. AI Service → Database: Busca histórico + contexto
6. AI Service → GPU Inference: POST /v1/chat/completions
7. GPU (vLLM) → Model: Llama 3.1 70B inference
8. Model → GPU: Streaming response
9. GPU → AI Service: SSE stream
10. AI Service → Gateway: WebSocket stream
11. Gateway → Frontend: Display streaming
12. AI Service → Database: Save conversation
```

---

### Fluxo de Dados: Modo Agente

```
1. User → Frontend: "Cria um script Python que..."
2. Frontend → Gateway: POST /api/agent/task
3. Gateway → AI Service: Agent task
4. AI Service → LLM: Plan task (decompose)
5. LLM → AI Service: [Step 1, Step 2, Step 3]
6. AI Service → Processing Worker: Execute steps
7. Worker → Sandbox: SSH execute code
8. Sandbox → Worker: Output + status
9. Worker → AI Service: Results
10. AI Service → LLM: Analyze results
11. LLM → AI Service: Next action
12. (Loop until task complete)
13. AI Service → Gateway → Frontend: Final result
```

---

## 🛠️ STACK TECNOLÓGICA

### Frontend
```yaml
Framework: React 18 + TypeScript
Build: Vite 5
Styling: Tailwind CSS 3
Components: shadcn/ui
Routing: React Router 6
State: TanStack Query 5
WebSocket: native WebSocket API
Forms: React Hook Form + Zod
```

### Gateway API (Node.js)
```yaml
Runtime: Node.js 22 LTS
Framework: Express 4 ou Fastify 4
API: tRPC 11 (type-safe)
WebSocket: Socket.io 4
Auth: JWT (jose library)
Validation: Zod
ORM: Drizzle ORM
Database Client: node-postgres
Cache: ioredis
File Upload: multer
```

### AI Service (Python)
```yaml
Runtime: Python 3.11
Framework: FastAPI 0.104+
Async: asyncio + uvicorn
LLM: OpenAI SDK (multi-provider)
Orchestration: LangChain 0.1+
Embeddings: sentence-transformers
Vector DB: pgvector (PostgreSQL)
Queue: Celery 5 + Redis
HTTP Client: httpx
```

### GPU Inference
```yaml
Server: vLLM 0.2+ (OpenAI-compatible)
Models:
  - Llama 3.1 70B (quantized 4-bit) ~24GB
  - Mistral 7B Instruct (FP16) ~14GB
  - Phi-3 Medium (FP16) ~8GB
  - CodeLlama 34B (quantized) ~18GB
API: OpenAI-compatible endpoints
Quantization: AWQ ou GPTQ
```

### Database & Storage
```yaml
Database: PostgreSQL 16
  - pgvector extension (embeddings)
  - Full-text search
  - JSONB for metadata
Cache: Redis 7
  - Session storage
  - Queue backend
  - Rate limiting
Storage: MinIO (S3-compatible)
  - File uploads
  - Model cache
  - Backups
```

### DevOps & Monitoring
```yaml
Containers: Docker 24 + Docker Compose
Orchestration: Proxmox VE (VMs)
Reverse Proxy: Nginx 1.24 + Caddy 2
SSL: Let's Encrypt (auto-renewal)
Monitoring: Prometheus + Grafana
Logs: Loki + Promtail
Metrics: node_exporter, nvidia_gpu_exporter
Backup: restic + S3
```

---

## 📦 DISTRIBUIÇÃO DE SERVIÇOS

### GPU Server (65.21.33.83)

**Serviços:**
```yaml
1. vLLM Inference Server
   - Port: 8000
   - Models: 4 simultâneos
   - VRAM: ~46GB usado
   - API: OpenAI-compatible

2. Model Cache
   - Path: /models
   - Size: ~100GB
   - Format: safetensors

3. Monitoring
   - nvidia_gpu_exporter
   - node_exporter
```

**Configuração de Modelos:**
```python
# vLLM config
models = [
    {
        "name": "llama-3.1-70b-instruct",
        "path": "/models/llama-3.1-70b-awq",
        "vram": 24,  # GB
        "quantization": "awq",
    },
    {
        "name": "mistral-7b-instruct",
        "path": "/models/mistral-7b-v0.2",
        "vram": 14,
        "quantization": "fp16",
    },
    {
        "name": "phi-3-medium",
        "path": "/models/phi-3-medium-128k",
        "vram": 8,
        "quantization": "fp16",
    },
]
```

---

### AX102 #1 (Proxmox Host)

**VMs:**
```yaml
VM 1: Gateway API Primary
  - vCPU: 8 cores
  - RAM: 32GB
  - Disk: 200GB
  - Services:
    - Nginx (80, 443)
    - Node.js API (3000)
    - Socket.io (3001)

VM 2: Gateway API Secondary (Standby)
  - vCPU: 4 cores
  - RAM: 16GB
  - Disk: 100GB
  - Services: Same as VM1
```

---

### AX102 #2 (Proxmox Host)

**VMs:**
```yaml
VM 1: AI Service
  - vCPU: 12 cores
  - RAM: 48GB
  - Disk: 300GB
  - Services:
    - FastAPI (8001)
    - LangChain
    - Model Router

VM 2: Processing Workers
  - vCPU: 8 cores
  - RAM: 32GB
  - Disk: 200GB
  - Services:
    - Celery workers (4x)
    - Whisper (audio)
    - Image processing
    - PDF extraction
```

---

### EK41 (Proxmox Host)

**VMs:**
```yaml
VM 1: Database
  - vCPU: 16 cores
  - RAM: 64GB
  - Disk: 500GB (RAID 1)
  - Services:
    - PostgreSQL 16
    - pgvector
    - pg_trgm (full-text)

VM 2: Cache & Queue
  - vCPU: 8 cores
  - RAM: 32GB
  - Disk: 200GB
  - Services:
    - Redis 7 (primary)
    - Redis Sentinel

VM 3: Storage & Backup
  - vCPU: 4 cores
  - RAM: 16GB
  - Disk: 800GB
  - Services:
    - MinIO
    - restic backup
    - Monitoring (Prometheus/Grafana)
```

---

## 🚀 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Setup Infraestrutura (2-3 dias)
**Objetivo:** Preparar servidores e VMs

**Tarefas:**
- [ ] Configurar VMs no Proxmox (AX102 #1, #2, EK41)
- [ ] Setup rede vSwitch entre todos os servidores
- [ ] Instalar Docker em todas as VMs
- [ ] Configurar Nginx no AX102 #1
- [ ] Setup PostgreSQL no EK41
- [ ] Setup Redis no EK41
- [ ] Setup MinIO no EK41
- [ ] Testar conectividade entre todos os serviços

---

### Fase 2: GPU Inference Server (1-2 dias)
**Objetivo:** Configurar vLLM com multi-modelo

**Tarefas:**
- [ ] Instalar vLLM no GPU server
- [ ] Download e quantizar modelos:
  - Llama 3.1 70B (AWQ 4-bit)
  - Mistral 7B Instruct
  - Phi-3 Medium
  - CodeLlama 34B
- [ ] Configurar vLLM multi-model serving
- [ ] Testar API OpenAI-compatible
- [ ] Configurar model router
- [ ] Setup monitoring (nvidia_gpu_exporter)

---

### Fase 3: Backend Gateway (2-3 dias)
**Objetivo:** API Node.js com tRPC

**Tarefas:**
- [ ] Criar projeto Node.js + TypeScript
- [ ] Setup Express + tRPC
- [ ] Implementar JWT authentication
- [ ] Criar endpoints:
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/chat
  - WS /api/chat/stream
  - POST /api/files/upload
  - GET /api/conversations
- [ ] Integrar com PostgreSQL (Drizzle ORM)
- [ ] Integrar com Redis (cache)
- [ ] Setup Socket.io para streaming
- [ ] Testes unitários

---

### Fase 4: AI Service (3-4 dias)
**Objetivo:** Python FastAPI com LangChain

**Tarefas:**
- [ ] Criar projeto Python + FastAPI
- [ ] Setup LangChain
- [ ] Implementar model router:
  - OpenAI GPT-4
  - Anthropic Claude
  - Local vLLM models
- [ ] Implementar RAG:
  - pgvector embeddings
  - Semantic search
  - Context builder
- [ ] Implementar Agent Loop:
  - Task planner
  - Tool executor
  - Retry logic
- [ ] Integrar com GPU inference (vLLM)
- [ ] Testes unitários

---

### Fase 5: Processing Workers (2 dias)
**Objetivo:** Celery workers para tarefas assíncronas

**Tarefas:**
- [ ] Setup Celery + Redis
- [ ] Implementar workers:
  - Audio transcription (Whisper)
  - Image processing (Pillow)
  - PDF extraction (PyPDF2)
  - Web scraping (BeautifulSoup)
- [ ] Queue management
- [ ] Error handling e retry
- [ ] Monitoring

---

### Fase 6: Integração Frontend (2-3 dias)
**Objetivo:** Conectar page-navigator ao backend

**Tarefas:**
- [ ] Atualizar ChatArea.tsx (remover mock)
- [ ] Integrar com API Gateway (tRPC client)
- [ ] Implementar WebSocket streaming
- [ ] Integrar file upload com MinIO
- [ ] Integrar audio recording com Whisper
- [ ] Testar modo agente
- [ ] Ajustes de UI/UX

---

### Fase 7: Deployment & Testing (2-3 dias)
**Objetivo:** Deploy em produção e testes

**Tarefas:**
- [ ] Build frontend (Vite)
- [ ] Deploy frontend (VCloud/Vercel)
- [ ] Configure Nginx SSL (Let's Encrypt)
- [ ] Setup PM2 para backend services
- [ ] Configure systemd services
- [ ] Setup Prometheus + Grafana
- [ ] Testes end-to-end
- [ ] Load testing
- [ ] Security audit

---

### Fase 8: Documentação (1 dia)
**Objetivo:** Documentar tudo

**Tarefas:**
- [ ] README.md completo
- [ ] API documentation (Swagger)
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Architecture diagrams
- [ ] User manual

---

## 📊 ESTIMATIVA DE TEMPO

| Fase | Duração | Dependências |
|------|---------|--------------|
| 1. Infraestrutura | 2-3 dias | Nenhuma |
| 2. GPU Inference | 1-2 dias | Fase 1 |
| 3. Backend Gateway | 2-3 dias | Fase 1 |
| 4. AI Service | 3-4 dias | Fase 2, 3 |
| 5. Processing Workers | 2 dias | Fase 1, 4 |
| 6. Frontend Integration | 2-3 dias | Fase 3, 4 |
| 7. Deployment | 2-3 dias | Todas |
| 8. Documentação | 1 dia | Todas |
| **Total** | **15-21 dias** | |

**Com trabalho paralelo:** ~10-14 dias

---

## 💰 CUSTOS ESTIMADOS

### Infraestrutura (Já Existente)
- GPU Server (Hetzner): ~€150/mês
- 2x AX102 (Hetzner): ~€200/mês
- EK41 (Hetzner): ~€100/mês
- VCloud: A definir
- **Total:** ~€450/mês

### Serviços Externos (Opcional)
- OpenAI API: Pay-as-you-go (~€50-200/mês)
- Anthropic API: Pay-as-you-go (~€50-200/mês)
- Cloudflare Pro: €20/mês
- **Total:** ~€120-420/mês

### Total Mensal: €570-870/mês

**Nota:** Modelos locais (vLLM) reduzem custos de API em 90%+

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. ✅ GPU limpa e pronta (1.6TB livre)
2. ⏳ Verificar IPs dos AX102 no Proxmox
3. ⏳ Verificar estado do EK41
4. ⏳ Decidir stack (Node.js puro ou Híbrido)
5. ⏳ Começar Fase 1 (Setup Infraestrutura)

---

**Aguardando decisão do utilizador para começar implementação! 🚀**
