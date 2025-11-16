# BrainAll V2 - Plano de Implementação Completo

**Data:** 15 Novembro 2025  
**Autor:** Manus AI  
**Cliente:** rkoj@underall.com  
**Projeto:** Sistema de Chat AI Multi-Modelo

---

## 📊 SUMÁRIO EXECUTIVO

Este documento consolida toda a análise de infraestrutura realizada e define o plano detalhado de implementação do **BrainAll V2**, um sistema de chat AI multi-modelo com interface moderna (React/Lovable) e backend robusto distribuído na infraestrutura Hetzner.

### Progresso Atual

✅ **Fase 1-4 Completas** (Análise e Planeamento)  
🔄 **Fase 5 Em Progresso** (Implementação)  
⏳ **Fases 6-7 Pendentes** (Integração e Deployment)

---

## 🎯 OBJECTIVO DO PROJETO

Construir um sistema de chat AI completo que:

1. **Suporte múltiplos modelos LLM** (Llama, Mistral, GPT, Claude, etc.)
2. **Interface moderna e responsiva** (já desenvolvida no Lovable)
3. **Modo agente autónomo** com ferramentas (web search, code execution)
4. **Upload e processamento de ficheiros** (imagens, áudio, documentos)
5. **Transcrição de áudio** (Whisper)
6. **Histórico de conversas** persistente
7. **Autenticação de utilizadores**
8. **Escalável e distribuído** na infraestrutura existente

---

## 🏗️ ARQUITETURA FINAL APROVADA

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     HELSINKI DATACENTER (HEL1)                  │
│                     Latência interna: <1ms                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐         ┌──────────────┐                    │
│  │ GPU Server   │◄────────┤ Storage Box  │                    │
│  │ (GEX130)     │  0.48ms │ (BX21 - 5TB) │                    │
│  │              │         │              │                    │
│  │ • vLLM       │         │ • Models     │                    │
│  │ • Whisper    │         │ • Uploads    │                    │
│  │ • Embeddings │         │ • Backups    │                    │
│  │ • Redis      │         │ • Logs       │                    │
│  └──────┬───────┘         └──────────────┘                    │
│         │ 0.57ms                                              │
│         │                                                     │
│  ┌──────▼───────┐         ┌──────────────┐                    │
│  │ prox-106     │◄────────┤ prox-101     │                    │
│  │ (AX102)      │  0.57ms │ (AX102)      │                    │
│  │              │         │              │                    │
│  │ • API        │         │ • PostgreSQL │                    │
│  │ • WebSocket  │         │ • Redis      │                    │
│  │ • Workers    │         │ • Bastion    │                    │
│  │ • Nginx      │         │ • Mail       │                    │
│  └──────────────┘         └──────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Distribuição de Responsabilidades

| Componente | Servidor | Papel | Recursos |
|------------|----------|-------|----------|
| **LLM Inference** | GPU Server | Inferência multi-modelo (vLLM) | 24c CPU, 49GB VRAM, 120GB RAM |
| **Audio Transcription** | GPU Server | Whisper (transcrição) | GPU partilhada |
| **Text Embeddings** | GPU Server | Sentence transformers | GPU partilhada |
| **API Gateway** | prox-106 VM | Node.js + tRPC | 4c, 8GB RAM |
| **Backend API** | prox-106 VM | FastAPI ou Node.js | 16c, 32GB RAM |
| **Queue Workers** | prox-106 VM | BullMQ/Celery | 8c, 16GB RAM |
| **Nginx** | prox-106 VM | Reverse proxy + SSL | 4c, 8GB RAM |
| **PostgreSQL** | prox-101 VM | Database principal | 8c, 16GB RAM |
| **Redis** | prox-101 VM | Cache + sessions | 2c, 4GB RAM |
| **Storage** | Storage Box | Ficheiros centralizados | 5TB |
| **Bastion** | prox-101 VM | Sandbox de código | 8c, 16GB RAM (existente) |

---

## ✅ PROGRESSO ATÉ AGORA

### Fase 1: Análise Profunda da Infraestrutura ✅

**Completada:** 15 Nov 2025

#### Descobertas Principais

**GPU Server (65.21.33.83)**
```yaml
Hardware:
  CPU: Intel Xeon Gold 5412U (24c/48t)
  GPU: NVIDIA RTX 6000 Ada (49GB VRAM)
  RAM: 126 GB (120GB disponível)
  Disco: 1.8TB NVMe (1.6TB livre)
  
Rede:
  IP Público: 65.21.33.83
  IP vSwitch: 192.168.100.130
  Latência Storage Box: 0.48ms
  
Serviços Ativos:
  - Ollama (57.6GB RAM - ineficiente!)
  - brain-api (Python)
  - Caddy (reverse proxy)
  
Modelos LLM (60GB):
  - llama3.3:70b (42GB)
  - mistral-nemo (7.1GB)
  - llama3.1:8b (4.9GB)
```

**Proxmox Cluster**
```yaml
prox-101 (AX102):
  CPU: AMD Ryzen 9 7950X3D (16c/32t)
  RAM: 125GB (56GB livre)
  Disco: 1.8TB NVMe
  Localização: Helsinki (HEL1-DC7)
  VMs: 9 ativas (bastion, mail, staging, etc.)
  
prox-106 (AX102):
  CPU: AMD Ryzen 9 7950X3D (16c/32t)
  RAM: 124GB (118GB livre) ⭐ MAIS RECURSOS
  Disco: 1.8TB NVMe
  Localização: Helsinki (HEL1-DC7)
  VMs: Poucas (ideal para BrainAll)
  
prox-102 (Server Auction):
  CPU: AMD Ryzen 9 3900 (12c/24t)
  RAM: 62GB (49GB livre)
  Localização: Frankfurt (FSN1-DC7) ⚠️ 25ms latência
  Uso: Ceph OSD + backups (não real-time)
```

**Storage Box**
```yaml
Modelo: BX21
Capacidade: 5TB (0% usado - vazio!)
Localização: Helsinki (HEL1-BX46)
Latência: 0.483ms (MELHOR de todos!)
Protocolos: SSH/SFTP, SMB/CIFS, WebDAV, rsync
Custo: €10.90/mês
```

#### Problemas Identificados

1. ❌ **Disco GPU 100% cheio** (1.5TB brain_memory corrompido)
2. ❌ **Ollama ineficiente** (57GB RAM para 1 modelo)
3. ⚠️ **Ceph HEALTH_WARN** (placement groups)
4. ⚠️ **Segurança** (PostgreSQL público, portas expostas)
5. ⚠️ **Bastion disco cheio** (6.7GB livres)

#### Ações Tomadas

✅ Apagado brain_memory corrompido (1.5TB libertados)  
✅ Parado brain_api antigo  
✅ Limpo cache (143GB libertados)  
✅ **Total libertado: 1.6TB** (disco agora a 7%)

---

### Fase 2: Estratégia e Integração do Storage Box ✅

**Completada:** 15 Nov 2025

#### Ações Realizadas

1. ✅ **Password do Storage Box resetada**
   - Nova password: `nNnä7Z_/@kfS~°u`
   - Acesso SSH testado e funcional

2. ✅ **SSHFS instalado no GPU server**
   ```bash
   apt-get install -y sshfs
   ```

3. ✅ **Storage Box montado**
   ```bash
   Mount point: /mnt/storagebox
   Latência: 0.48ms
   Status: Montado e funcional
   ```

4. ✅ **Estrutura de diretórios criada**
   ```
   /mnt/storagebox/
   ├── models/       # Modelos LLM (60GB+)
   ├── uploads/      # Uploads de utilizadores
   ├── backups/      # Backups automáticos
   ├── logs/         # Logs centralizados
   └── datasets/     # Datasets de treino
   ```

5. 🔄 **Migração de modelos Ollama em progresso**
   ```
   Origem: /usr/share/ollama/.ollama (60GB)
   Destino: /mnt/storagebox/models/ollama/
   Velocidade: ~1.43 GB/s
   Progresso: 34% (em background)
   ETA: ~10-15 minutos
   ```

---

### Fase 3: Benchmarking de Servidores ✅

**Completada:** 15 Nov 2025

#### Resultados de Latência

| Origem | Destino | Latência | Avaliação |
|--------|---------|----------|-----------|
| GPU | prox-101 | 0.568ms | ⭐⭐⭐⭐⭐ |
| GPU | prox-106 | 0.844ms | ⭐⭐⭐⭐⭐ |
| GPU | bastion | 0.638ms | ⭐⭐⭐⭐⭐ |
| GPU | Storage Box | **0.483ms** | ⭐⭐⭐⭐⭐ MELHOR |
| GPU | prox-102 | 25.673ms | ⚠️ Aceitável |

**Conclusão:** Toda a infraestrutura em Helsinki tem latência <1ms (excelente para real-time).

#### Resultados de I/O

| Servidor | Write | Read | Avaliação |
|----------|-------|------|-----------|
| GPU Server NVMe | 1.2 GB/s | 3.7 GB/s | ⭐⭐⭐⭐⭐ |
| prox-101 NVMe | 1.2 GB/s | 2.7 GB/s | ⭐⭐⭐⭐⭐ |
| Ceph Cluster | ~400 MB/s | ~700 MB/s | ⭐⭐⭐⭐ |

**Conclusão:** NVMe local muito rápido, Ceph funcional mas mais lento (esperado).

---

### Fase 4: Desenho da Arquitetura Final ✅

**Completada e Aprovada:** 15 Nov 2025

#### Decisões Arquitecturais

1. **Concentrar em Helsinki (HEL1)**
   - GPU, prox-101, prox-106, Storage Box
   - Latência <1ms entre todos
   - prox-102 (Frankfurt) apenas para backups

2. **Migrar de Ollama para vLLM**
   - Libertar 57GB RAM
   - Melhor performance
   - Suporte multi-modelo simultâneo

3. **Stack Tecnológico**
   - **Frontend:** React + Vite (Lovable - já pronto)
   - **API Gateway:** Node.js + tRPC (type-safe)
   - **AI Service:** Python + FastAPI
   - **Database:** PostgreSQL + Redis
   - **Queue:** BullMQ (Node.js)
   - **Inference:** vLLM (GPU)
   - **Transcription:** Whisper (GPU)
   - **Storage:** MinIO S3-compatible (Storage Box)

4. **Distribuição de VMs**
   - **prox-106:** Backend (API, Workers, Nginx) - 118GB RAM livre!
   - **prox-101:** Database (PostgreSQL, Redis) - já tem várias VMs
   - **prox-102:** Backups e batch processing - Frankfurt

---

## 🚀 FASE 5: IMPLEMENTAÇÃO (EM PROGRESSO)

**Iniciada:** 15 Nov 2025  
**Status:** 20% completo

### 5.1 Preparação da Infraestrutura

#### 5.1.1 Storage Box ✅

- [x] Reset password
- [x] Instalar SSHFS no GPU server
- [x] Montar Storage Box
- [x] Criar estrutura de diretórios
- [🔄] Migrar modelos Ollama (em progresso)
- [ ] Configurar mount automático (/etc/fstab)
- [ ] Testar performance de I/O
- [ ] Configurar backups automáticos

#### 5.1.2 GPU Server - vLLM

- [ ] Parar Ollama (libertar 57GB RAM)
- [ ] Instalar vLLM
  ```bash
  pip install vllm
  ```
- [ ] Configurar vLLM multi-modelo
  ```python
  # Carregar modelos do Storage Box
  models = [
      "llama3.3:70b",  # 40GB VRAM
      "mistral-nemo",  # 7GB VRAM
  ]
  ```
- [ ] Criar API endpoint
- [ ] Testar inferência
- [ ] Configurar como serviço systemd
- [ ] Monitorização (Prometheus)

#### 5.1.3 GPU Server - Whisper

- [ ] Instalar Whisper
  ```bash
  pip install openai-whisper
  ```
- [ ] Criar API endpoint
- [ ] Testar transcrição
- [ ] Integrar com vLLM (partilha GPU)

#### 5.1.4 Proxmox - Criar VMs

**prox-106 (Backend)**

VM 1: **vm-brainall-api**
```yaml
vCPU: 16 cores
RAM: 32 GB
Disco: 100 GB (Ceph)
OS: Ubuntu 24.04 LTS
IP: 192.168.100.50
Serviços: Node.js + tRPC, WebSocket
```

VM 2: **vm-brainall-workers**
```yaml
vCPU: 8 cores
RAM: 16 GB
Disco: 50 GB (Ceph)
OS: Ubuntu 24.04 LTS
IP: 192.168.100.51
Serviços: BullMQ workers, file processing
```

VM 3: **vm-brainall-nginx**
```yaml
vCPU: 4 cores
RAM: 8 GB
Disco: 50 GB (Ceph)
OS: Ubuntu 24.04 LTS
IP: 192.168.100.52
Serviços: Nginx, Certbot (Let's Encrypt)
```

**prox-101 (Database)**

VM 4: **vm-brainall-db**
```yaml
vCPU: 8 cores
RAM: 16 GB
Disco: 200 GB (Ceph)
OS: Ubuntu 24.04 LTS
IP: 192.168.100.53
Serviços: PostgreSQL 16, Redis 7
```

#### 5.1.5 Rede e Firewall

- [ ] Configurar IPs estáticos (vSwitch VLAN 4000)
- [ ] Abrir portas necessárias
  - 80, 443 (Nginx)
  - 8000 (vLLM API)
  - 8001 (Whisper API)
  - 5432 (PostgreSQL - interno)
  - 6379 (Redis - interno)
- [ ] Configurar iptables/firewall
- [ ] Fechar portas expostas (PostgreSQL público)
- [ ] Consolidar acessos SSH

### 5.2 Backend API

#### 5.2.1 Estrutura do Projeto

```
brainall-v2/
├── backend/
│   ├── api/                 # API Gateway (Node.js + tRPC)
│   │   ├── src/
│   │   │   ├── routers/
│   │   │   │   ├── chat.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── files.ts
│   │   │   │   └── history.ts
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ai-service/          # AI Service (Python + FastAPI)
│   │   ├── app/
│   │   │   ├── routers/
│   │   │   │   ├── inference.py
│   │   │   │   ├── transcription.py
│   │   │   │   └── embeddings.py
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── main.py
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── workers/             # Queue Workers (Node.js + BullMQ)
│   │   ├── src/
│   │   │   ├── processors/
│   │   │   │   ├── file-processor.ts
│   │   │   │   ├── audio-processor.ts
│   │   │   │   └── image-processor.ts
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── database/            # Database schemas e migrations
│       ├── migrations/
│       ├── seeds/
│       └── schema.sql
│
├── frontend/                # Frontend (React + Vite - do Lovable)
│   └── (já existente em page-navigator)
│
├── docker-compose.yml       # Desenvolvimento local
└── README.md
```

#### 5.2.2 API Gateway (Node.js + tRPC)

**Tecnologias:**
- Node.js 22
- tRPC (type-safe API)
- Prisma (ORM)
- WebSocket (Socket.io)
- JWT (autenticação)

**Endpoints principais:**

```typescript
// Chat
POST /api/chat/send
GET  /api/chat/history
WS   /api/chat/stream

// Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

// Files
POST /api/files/upload
GET  /api/files/:id
DELETE /api/files/:id

// History
GET  /api/history/conversations
GET  /api/history/conversation/:id
DELETE /api/history/conversation/:id
```

#### 5.2.3 AI Service (Python + FastAPI)

**Tecnologias:**
- Python 3.11
- FastAPI
- vLLM (inferência)
- Whisper (transcrição)
- Sentence Transformers (embeddings)

**Endpoints principais:**

```python
# Inference
POST /v1/chat/completions  # OpenAI-compatible
POST /v1/completions
GET  /v1/models

# Transcription
POST /v1/audio/transcriptions

# Embeddings
POST /v1/embeddings
```

#### 5.2.4 Database Schema

**PostgreSQL Tables:**

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' | 'assistant' | 'system'
    content TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Files
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    size BIGINT,
    storage_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_files_user_id ON files(user_id);
```

### 5.3 Integração Frontend-Backend

#### 5.3.1 Adaptações no Frontend (Lovable)

**Ficheiros a modificar:**

1. **src/lib/api.ts** - Cliente tRPC
   ```typescript
   import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
   
   export const api = createTRPCProxyClient({
     links: [
       httpBatchLink({
         url: 'https://brain.underall.com/api/trpc',
       }),
     ],
   });
   ```

2. **src/components/ChatArea.tsx** - Substituir mock por API real
   ```typescript
   const sendMessage = async (content: string) => {
     const response = await api.chat.send.mutate({
       conversationId,
       content,
       attachments,
     });
     // Handle streaming response
   };
   ```

3. **src/hooks/useAuth.ts** - Autenticação real
   ```typescript
   export const useAuth = () => {
     const login = async (email: string, password: string) => {
       const { token } = await api.auth.login.mutate({ email, password });
       localStorage.setItem('token', token);
     };
   };
   ```

#### 5.3.2 WebSocket para Streaming

```typescript
// Frontend
const socket = io('wss://brain.underall.com');

socket.on('chat:stream', (chunk) => {
  appendToMessage(chunk.content);
});

// Backend
io.on('connection', (socket) => {
  socket.on('chat:send', async (data) => {
    const stream = await aiService.chat(data);
    for await (const chunk of stream) {
      socket.emit('chat:stream', chunk);
    }
  });
});
```

---

## 📅 CRONOGRAMA DETALHADO

### Semana 1: Infraestrutura e Serviços AI

**Dias 1-2** (16-17 Nov)
- [🔄] Migração modelos Ollama (em progresso)
- [ ] Configurar vLLM no GPU server
- [ ] Instalar Whisper
- [ ] Testar inferência e transcrição
- [ ] Criar VMs no Proxmox

**Dias 3-4** (18-19 Nov)
- [ ] Instalar PostgreSQL + Redis
- [ ] Criar schema da database
- [ ] Configurar Nginx + SSL
- [ ] Testar conectividade entre VMs

**Dias 5-7** (20-22 Nov)
- [ ] Desenvolver API Gateway (tRPC)
- [ ] Desenvolver AI Service (FastAPI)
- [ ] Integrar vLLM + Whisper
- [ ] Testes unitários

### Semana 2: Backend e Integração

**Dias 8-10** (23-25 Nov)
- [ ] Desenvolver Workers (BullMQ)
- [ ] Sistema de upload de ficheiros
- [ ] Processamento de áudio/imagem
- [ ] Integração com Storage Box

**Dias 11-13** (26-28 Nov)
- [ ] Adaptar frontend (Lovable)
- [ ] Implementar autenticação
- [ ] WebSocket streaming
- [ ] Testes de integração

**Dia 14** (29 Nov)
- [ ] Testes end-to-end
- [ ] Correção de bugs
- [ ] Optimizações

### Semana 3: Deployment e Finalização

**Dias 15-17** (30 Nov - 2 Dez)
- [ ] Deploy em produção
- [ ] Configurar monitorização
- [ ] Backups automáticos
- [ ] Documentação

**Dias 18-21** (3-6 Dez)
- [ ] Testes de carga
- [ ] Ajustes de performance
- [ ] Segurança (penetration testing)
- [ ] Handover final

---

## 💰 ESTIMATIVA DE CUSTOS

### Custos Mensais

| Item | Custo | Notas |
|------|-------|-------|
| **GPU Server (GEX130)** | €350/mês | Hetzner dedicado |
| **prox-101 (AX102)** | €120/mês | Hetzner dedicado |
| **prox-106 (AX102)** | €120/mês | Hetzner dedicado |
| **prox-102 (Auction)** | €80/mês | Hetzner dedicado |
| **Storage Box (BX21)** | €10.90/mês | 5TB |
| **APIs Externas** | €50-200/mês | OpenAI, Anthropic (opcional) |
| **Total** | **€730-880/mês** | Sem APIs: €680/mês |

### Custos de Desenvolvimento

| Fase | Horas | Custo (estimado) |
|------|-------|------------------|
| Análise e Planeamento | 40h | Completo ✅ |
| Infraestrutura | 60h | Em progresso 🔄 |
| Backend | 80h | Pendente ⏳ |
| Integração Frontend | 40h | Pendente ⏳ |
| Testes e Deployment | 40h | Pendente ⏳ |
| **Total** | **260h** | ~3-4 semanas |

---

## 🔒 SEGURANÇA

### Melhorias Necessárias

1. **Fechar PostgreSQL público**
   - Porta 54321 exposta (99K packets)
   - Mover para rede interna apenas

2. **Consolidar acessos SSH**
   - Múltiplas portas (2220, 2222, 2223)
   - Usar apenas bastion como jump host

3. **Firewall**
   - Limpar regras duplicadas
   - Configurar fail2ban
   - Rate limiting

4. **SSL/TLS**
   - Let's Encrypt (Certbot)
   - HTTPS obrigatório
   - HSTS headers

5. **Autenticação**
   - JWT tokens
   - Refresh tokens
   - Rate limiting (login attempts)

6. **Dados**
   - Encriptação em repouso (database)
   - Encriptação em trânsito (TLS)
   - Backups encriptados

---

## 📊 MONITORIZAÇÃO

### Métricas a Monitorizar

**GPU Server:**
- GPU utilization (%)
- VRAM usage (GB)
- Inference latency (ms)
- Requests per second

**Backend:**
- API response time (ms)
- Error rate (%)
- Queue length
- Active connections

**Database:**
- Query performance
- Connection pool
- Disk usage
- Replication lag

**Storage:**
- Disk usage (GB)
- I/O throughput (MB/s)
- Latency (ms)

### Ferramentas

- **Prometheus** - Métricas
- **Grafana** - Dashboards
- **Loki** - Logs centralizados
- **Alertmanager** - Alertas

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Hoje (15 Nov)

1. ✅ Aguardar conclusão da migração Ollama (~10 min)
2. [ ] Configurar mount automático Storage Box
3. [ ] Parar Ollama e libertar 57GB RAM
4. [ ] Instalar vLLM
5. [ ] Testar inferência básica

### Amanhã (16 Nov)

6. [ ] Criar VMs no prox-106
7. [ ] Instalar PostgreSQL + Redis no prox-101
8. [ ] Configurar Nginx + SSL
9. [ ] Iniciar desenvolvimento da API Gateway

---

## 📝 NOTAS E DECISÕES

### Decisões Técnicas

1. **Node.js + tRPC** escolhido por:
   - Type-safety (TypeScript end-to-end)
   - Experiência prévia do utilizador (inteligencia-v2)
   - Performance adequada
   - Ecossistema maduro

2. **Python + FastAPI** para AI Service:
   - Melhor suporte para ML/AI libraries
   - vLLM, Whisper, Transformers
   - Async/await nativo
   - OpenAI-compatible API

3. **PostgreSQL** escolhido sobre MongoDB:
   - Relações complexas (users, conversations, messages)
   - ACID compliance
   - Melhor para histórico de conversas
   - JSONB para flexibilidade

4. **vLLM** escolhido sobre Ollama:
   - Mais eficiente (menos RAM)
   - Melhor performance
   - Suporte multi-modelo simultâneo
   - API compatível com OpenAI

### Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| GPU overload | Média | Alto | Rate limiting, queue system |
| Storage Box latência | Baixa | Médio | Cache local (Redis) |
| Ceph instabilidade | Média | Médio | Backups regulares, monitorização |
| Segurança | Média | Alto | Firewall, SSL, autenticação robusta |
| Complexidade | Alta | Médio | Documentação, testes, monitorização |

---

## 📚 REFERÊNCIAS E DOCUMENTAÇÃO

### Tecnologias

- [vLLM Documentation](https://docs.vllm.ai/)
- [Whisper OpenAI](https://github.com/openai/whisper)
- [tRPC](https://trpc.io/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [BullMQ](https://docs.bullmq.io/)
- [Prisma](https://www.prisma.io/)

### Infraestrutura

- [Hetzner Docs](https://docs.hetzner.com/)
- [Proxmox VE](https://pve.proxmox.com/wiki/Main_Page)
- [Ceph Documentation](https://docs.ceph.com/)

---

**Documento gerado por:** Manus AI  
**Última atualização:** 15 Novembro 2025 - 02:00 GMT+1  
**Versão:** 1.0  
**Status:** 🔄 Em progresso - Fase 5 (20% completo)
