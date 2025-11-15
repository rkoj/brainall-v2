# 📚 Guia de Organização do Notion - BrainAll V2

Este documento contém toda a estrutura e conteúdo para organizares manualmente no Notion.

---

## 🏠 PÁGINA PRINCIPAL

**Título:** 🚀 BrainAll V2 - Sistema de Chat AI Multi-Modelo

### Conteúdo:

# 📊 Visão Geral do Projeto

Sistema de chat AI multi-modelo com interface moderna React + Vite (Lovable), backend Node.js/Python escalável e inferência em GPU dedicada (vLLM).

---

## 🎯 Objectivo

Construir um sistema completo de chat AI que suporte:

- Múltiplos modelos LLM (Llama, Mistral, GPT)
- Transcrição de áudio (Whisper)
- Upload e processamento de ficheiros
- Execução de código em sandbox
- Streaming em tempo real (WebSocket)

---

## 📈 Progresso Atual: 40%

- ✅ Fase 1: Análise Profunda da Infraestrutura (100%)
- ✅ Fase 2: Integração do Storage Box (100%)
- ✅ Fase 3: Benchmarking (100%)
- ✅ Fase 4: Arquitetura Final (100%)
- 🔄 Fase 5: Configuração vLLM (80%)
- ⏳ Fase 6: Implementação do Backend (0%)
- ⏳ Fase 7: Integração do Frontend (0%)
- ⏳ Fase 8: Deployment e Monitorização (0%)

---

## 🔗 Links Importantes

📦 **GitHub:** https://github.com/rkoj/brainall-v2  
🎨 **Frontend (Lovable):** https://github.com/rkoj/page-navigator  
🌐 **Site Atual:** https://brain.underall.com

---

## 📂 Documentação

(Criar as seguintes sub-páginas abaixo desta página principal)

---
---

## 📄 SUB-PÁGINA 1: 📐 Arquitetura do Sistema

### Conteúdo:

# Stack Tecnológica

## Frontend

- React 18 + TypeScript
- Vite (bundler)
- shadcn/ui + Tailwind CSS
- TanStack Query (state management)
- React Router (navegação)

## Backend

- API Gateway: Node.js + tRPC (type-safe)
- AI Service: Python + FastAPI
- WebSocket: Socket.io (streaming)
- Queue: BullMQ (job processing)

## AI & ML

- vLLM: Inferência multi-modelo (GPU)
- Whisper: Transcrição de áudio (GPU)
- LangChain: Orquestração de LLMs

## Database & Storage

- PostgreSQL: Dados relacionais
- Redis: Cache + Sessions
- Storage Box (5TB): Modelos + Uploads

---

# Distribuição de Serviços

## GPU Server (65.21.33.83)

- vLLM (porta 8001)
- Whisper
- Redis (cache local)

## prox-106 (Helsinki)

- Backend API (Node.js + tRPC)
- AI Service (Python + FastAPI)
- Workers (BullMQ)
- Nginx (reverse proxy + SSL)

## prox-101 (Helsinki)

- PostgreSQL
- Redis (principal)
- Bastion VM

## Storage Box (Helsinki)

- Modelos LLM (60GB+)
- Uploads de utilizadores
- Backups automáticos

---

# Fluxo de Dados

```
User → Nginx (prox-106) → API Gateway (Node.js)
                              ↓
                         AI Service (Python)
                              ↓
                         vLLM (GPU Server)
                              ↓
                         Response Stream
```

---

# Segurança

- SSL/TLS em todas as conexões
- Autenticação JWT
- Rate limiting
- Firewall configurado
- Secrets em variáveis de ambiente
- Backups automáticos diários

---
---

## 📄 SUB-PÁGINA 2: 🖥️ Infraestrutura e Benchmarks

### Conteúdo:

# Servidores Disponíveis

## GPU Server (GEX130)

**Localização:** Helsinki (HEL1-DC3)  
**IP:** 65.21.33.83

**Specs:**
- CPU: Intel Xeon Gold 5412U (24c/48t)
- RAM: 126GB
- GPU: NVIDIA RTX 6000 Ada (49GB VRAM)
- Disco: 1.8TB NVMe (1.6TB livres)
- OS: Ubuntu 22.04

**Estado:**
- ✅ Disco limpo (1.6TB livres)
- ✅ vLLM instalado e configurado
- ✅ Storage Box montado em /mnt/storagebox
- 🔄 Modelo Mistral-Nemo a carregar

---

## prox-101 (AX102)

**Localização:** Helsinki (HEL1-DC7)  
**IP:** 37.27.128.90

**Specs:**
- CPU: AMD Ryzen 9 7950X3D (16c/32t)
- RAM: 125GB (69GB usado)
- Disco: 1.8TB NVMe
- OS: Proxmox VE 8.4.1

**VMs:**
- bastion-lab (VMID 9020)
- vm-whisper-001
- vm-stage-db, vm-stage-api, vm-stage-frontend
- VM-MX01 (mail server)
- vm-postgis

---

## prox-106 (AX102)

**Localização:** Helsinki (HEL1-DC7)  
**IP:** 37.27.174.95

**Specs:**
- CPU: AMD Ryzen 9 7950X3D (16c/32t)
- RAM: 124GB (**118GB livres!** ⭐)
- Disco: 1.8TB NVMe
- OS: Proxmox VE 8.4.1

**Estado:**
- ✅ Recursos abundantes disponíveis
- ✅ Ideal para backend do BrainAll V2

---

## prox-102 (Server Auction)

**Localização:** Frankfurt (FSN1-DC7)  
**IP:** 5.9.63.252

**Specs:**
- CPU: AMD Ryzen 9 3900 (12c/24t)
- RAM: 62GB
- Disco: 1.8TB NVMe

**Nota:** Latência mais alta (25ms) - usar para backups

---

## Storage Box (BX21)

**Localização:** Helsinki (HEL1-BX46)  
**Capacidade:** 5TB (vazio)  
**Custo:** €10.90/mês

**Specs:**
- Username: u503462
- Server: u503462.your-storagebox.de
- Protocolos: SSH/SFTP, SMB/CIFS, WebDAV, rsync

**Estado:**
- ✅ Configurado e montado no GPU server
- ✅ 60GB de modelos Ollama migrados
- ✅ Latência: 0.48ms ⭐⭐⭐⭐⭐

---

# Benchmarks de Performance

## Latência de Rede (Helsinki)

| Origem | Destino | Latência | Avaliação |
|--------|---------|----------|-----------|
| GPU | prox-101 | 0.568ms | ⭐⭐⭐⭐⭐ |
| GPU | prox-106 | 0.844ms | ⭐⭐⭐⭐⭐ |
| GPU | Storage Box | **0.483ms** | ⭐⭐⭐⭐⭐ |
| GPU | prox-102 (Frankfurt) | 25.673ms | ⚠️ |

**Conclusão:** Infraestrutura Helsinki tem latência excelente (<1ms)

---

## I/O de Disco

| Servidor | Read | Write |
|----------|------|-------|
| GPU NVMe | 3.7 GB/s | 1.2 GB/s |
| prox-101 NVMe | 2.7 GB/s | 1.2 GB/s |

**Migração de modelos:** 1.43 GB/s (60GB em ~42 segundos)

---

## Recursos Libertados

| Item | Antes | Depois | Ganho |
|------|-------|--------|-------|
| Disco GPU | 0 GB (100%) | 1.6 TB (93%) | +1.6 TB |
| RAM GPU | 119 GB | 122 GB | +3 GB |
| Ollama RAM | 57 GB | 0 GB | +57 GB |

---

# Ceph Cluster

**Status:** HEALTH_WARN (placement groups)  
**Capacidade:** 4.4TB total, 433GB usado  
**OSDs:** 3 ativos

**Nota:** Precisa de atenção para resolver warnings

---
---

## 📄 SUB-PÁGINA 3: 📅 Progresso e Próximos Passos

### Conteúdo:

# Sessão 15 Nov 2025 - Conquistas

**Duração:** ~12 horas  
**Progresso:** 40%

---

## ✅ Completado

1. Análise completa da infraestrutura (GPU, Proxmox, Storage Box)
2. 1.6TB de disco libertados no GPU server
3. Storage Box configurado (5TB, latência 0.48ms)
4. 60GB de modelos Ollama migrados para Storage Box
5. Ollama parado, vLLM instalado e configurado
6. Benchmarking completo de rede e I/O
7. Arquitetura aprovada e documentada
8. Plano de implementação de 3 semanas criado
9. Repositório GitHub criado
10. Documentação organizada no Notion

---

## 🔄 Em Progresso

- vLLM a carregar modelo Mistral-Nemo (31GB RAM, 24.5GB VRAM)

---

# Próximos Passos

## Imediatos (Quando vLLM completar)

- [ ] Testar API vLLM com chat completion
- [ ] Habilitar serviço vLLM no boot
- [ ] Configurar Caddy para proxy reverso

## Curto Prazo (Esta Semana)

- [ ] Aceitar termos Llama no HuggingFace
- [ ] Criar VMs no prox-106 (API, Workers, Nginx)
- [ ] Criar VM no prox-101 (Database)
- [ ] Instalar PostgreSQL + Redis
- [ ] Configurar Nginx + SSL

## Médio Prazo (Próximas 2 Semanas)

- [ ] Desenvolver API Gateway (Node.js + tRPC)
- [ ] Desenvolver AI Service (Python + FastAPI)
- [ ] Integrar vLLM com backend
- [ ] Sistema de upload de ficheiros
- [ ] Instalar Whisper para transcrição
- [ ] Adaptar frontend (Lovable)
- [ ] WebSocket streaming
- [ ] Testes de integração
- [ ] Deploy em produção
- [ ] Monitorização (Prometheus + Grafana)

---

# Problemas Pendentes

## Segurança ⚠️

1. PostgreSQL exposto (porta 54321) - 99K packets
2. Múltiplas portas SSH (2220, 2222, 2223)
3. Processo Python teimoso na porta 8000

## Infraestrutura ⚠️

4. Ceph em HEALTH_WARN (placement groups)
5. Bastion disco (6.7GB livres - 53% usado)
6. Llama models gated - Precisa aceitar termos

## vLLM 🔄

7. Modelo a carregar - Aguardar conclusão
8. API não testada - Aguardar modelo carregar

---

# Métricas de Progresso

```
Fase 1: Análise Profunda          ████████████████████ 100% ✅
Fase 2: Storage Box Integration   ████████████████████ 100% ✅
Fase 3: Benchmarking              ████████████████████ 100% ✅
Fase 4: Arquitetura Final         ████████████████████ 100% ✅
Fase 5: Configuração vLLM         ████████████████░░░░  80% 🔄
Fase 6: Backend Implementation    ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Fase 7: Frontend Integration      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Fase 8: Deployment                ░░░░░░░░░░░░░░░░░░░░   0% ⏳

PROGRESSO TOTAL: ████████░░░░░░░░░░░░ 40%
```

---

# Tempo Investido

| Fase | Tempo | Status |
|------|-------|--------|
| Análise de Infraestrutura | ~3h | ✅ |
| Limpeza e Optimização | ~1h | ✅ |
| Benchmarking | ~2h | ✅ |
| Desenho de Arquitetura | ~2h | ✅ |
| Storage Box Setup | ~2h | ✅ |
| vLLM Installation | ~2h | 🔄 |
| **Total Hoje** | **~12h** | **Fase 1-5** |

---

# Aprendizagens

## Descobertas Importantes

1. **Storage Box é surpreendentemente rápido**
   - Latência 0.48ms (melhor que esperado)
   - Ideal para armazenamento de modelos
   - Custo-benefício excelente (€10.90/mês por 5TB)

2. **prox-106 é ideal para backend**
   - 118GB RAM livre
   - CPU potente (Ryzen 9 7950X3D)
   - Latência <1ms para GPU

3. **vLLM é mais complexo que Ollama**
   - Requer HuggingFace token
   - Modelos gated precisam aprovação
   - Carregamento mais demorado
   - Mas: Melhor performance e multi-modelo

4. **Infraestrutura Helsinki é excelente**
   - Toda a latência <1ms
   - I/O muito rápido
   - Ideal para real-time

---

# Comandos Úteis

## Verificar vLLM

```bash
ssh root@65.21.33.83
systemctl status vllm
journalctl -u vllm -f
curl http://localhost:8001/v1/models
```

## Verificar Storage Box

```bash
df -h | grep storagebox
du -sh /mnt/storagebox/models/
```

## Verificar GPU

```bash
nvidia-smi
```

---
---

## 📄 SUB-PÁGINA 4: 📖 Documentação Técnica

### Conteúdo:

# Documentação Técnica - BrainAll V2

Todos os documentos técnicos estão versionados no GitHub.

---

## 📦 Repositório GitHub

🔗 **https://github.com/rkoj/brainall-v2**

### Estrutura do Repositório

```
brainall-v2/
├── README.md (Plano de Implementação)
├── .gitignore
└── docs/
    ├── architecture/
    │   └── brainall-v2-architecture.md
    ├── infrastructure/
    │   ├── infrastructure-deep-analysis.md
    │   ├── benchmarking-results.md
    │   ├── firewall-port-analysis.md
    │   ├── bastion-analysis.md
    │   └── storage-box-analysis.md
    └── progress/
        ├── daily-progress-15nov2025.md
        └── session-summary-final.md
```

---

## 📚 Documentos Disponíveis

### Arquitetura

1. **brainall-v2-architecture.md**
   - Stack tecnológica completa
   - Distribuição de serviços
   - Comparação V1 vs V2
   - Roadmap de implementação

### Infraestrutura

2. **infrastructure-deep-analysis.md**
   - Análise completa de todos os servidores
   - Configuração de rede (vSwitch)
   - VMs existentes
   - Recursos disponíveis

3. **benchmarking-results.md**
   - Latência de rede entre servidores
   - I/O de disco (NVMe, Ceph)
   - Performance de migração
   - Recomendações de uso

4. **firewall-port-analysis.md**
   - Radiografia completa do firewall
   - Portas expostas
   - Regras iptables
   - Riscos de segurança identificados

5. **bastion-analysis.md**
   - Análise do bastion VM
   - Containers Docker ativos
   - Projetos existentes
   - Configuração de rede

6. **storage-box-analysis.md**
   - Detalhes do Storage Box Hetzner
   - Credenciais e acesso
   - Protocolos suportados
   - Proposta de uso

### Progresso

7. **daily-progress-15nov2025.md**
   - Progresso detalhado do dia
   - Conquistas e problemas
   - Métricas e benchmarks

8. **session-summary-final.md**
   - Resumo completo da sessão
   - Todas as conquistas
   - Próximos passos
   - Comandos úteis

---

## 🔄 Como Atualizar

Todos os documentos são Markdown e estão no GitHub. Para atualizar:

```bash
git clone https://github.com/rkoj/brainall-v2.git
cd brainall-v2
# Editar ficheiros
git add .
git commit -m "docs: atualização"
git push
```

---

## 📝 Template para Novos Documentos

Usar sempre este formato:

```markdown
# Título do Documento

**Data:** DD/MM/YYYY  
**Autor:** Nome  
**Status:** Draft/Review/Final

---

## Conteúdo

[...]

---

**Última atualização:** DD/MM/YYYY
```

---
---

## 📄 SUB-PÁGINA 5: 🔐 Credenciais e Acessos

### Conteúdo:

# Credenciais e Acessos - BrainAll V2

⚠️ **CONFIDENCIAL** - Não partilhar publicamente

---

## 🖥️ Servidores

### GPU Server

- **IP:** 65.21.33.83
- **User:** root
- **Password:** [REDACTED]
- **SSH:** `ssh root@65.21.33.83`

### Proxmox Cluster

- **prox-101:** root@prox-server-101.underall.com
- **prox-102:** [via prox-101]
- **prox-106:** [via prox-101]
- **Password:** [REDACTED]
- **Web UI:** https://prox-server-101.underall.com:8006

### Bastion VM

- **IP:** 192.168.100.20 (interno)
- **SSH Público:** `ssh -p 2220 root@37.27.128.90`
- **User:** root
- **Password:** [REDACTED]

---

## 📦 Storage & Services

### Storage Box Hetzner

- **Server:** u503462.your-storagebox.de
- **Username:** u503462
- **Port:** 23 (SSH)
- **Password:** [REDACTED]
- **Mount:** /mnt/storagebox (no GPU server)

### HuggingFace

- **Token:** [REDACTED - stored on GPU server]
- **Account:** rkoj@underall.com
- **Uso:** Download de modelos LLM

---

## 🌐 GitHub

- **Repositório:** https://github.com/rkoj/brainall-v2
- **Frontend:** https://github.com/rkoj/page-navigator
- **Account:** rkoj

---

## 🔒 Notas de Segurança

1. **Nunca** commitar credenciais no Git
2. Usar `.env` files para secrets
3. Rodar passwords a cada 90 dias
4. Habilitar 2FA onde possível
5. Usar SSH keys em vez de passwords quando possível

---

## 📝 SSH Keys

### Gerar nova key

```bash
ssh-keygen -t ed25519 -C "brainall-v2"
```

### Adicionar ao servidor

```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@65.21.33.83
```

---

## 🔄 Rotação de Credenciais

| Item | Última Alteração | Próxima Rotação |
|------|------------------|-----------------|
| GPU Server | 15/11/2025 | 15/02/2026 |
| Storage Box | 15/11/2025 | 15/02/2026 |
| HuggingFace Token | 15/11/2025 | - |

---
---

## 🎨 DICAS DE FORMATAÇÃO NO NOTION

### Ícones Sugeridos

- 🚀 Página Principal
- 📐 Arquitetura
- 🖥️ Infraestrutura
- 📅 Progresso
- 📖 Documentação
- 🔐 Credenciais

### Cores

- **Verde:** Completado ✅
- **Amarelo:** Em Progresso 🔄
- **Cinza:** Pendente ⏳
- **Vermelho:** Problemas ⚠️

### Callouts

Usar callouts para destacar informações importantes:
- 💡 Dica
- ⚠️ Atenção
- ✅ Sucesso
- ❌ Erro

---

**FIM DO GUIA**
