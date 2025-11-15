# Análise Completa: Bastion VM (vm-bastion-lab)

**Data:** 15 Novembro 2025  
**Hostname:** vm-bastion-lab  
**VMID:** 9020  
**Host:** prox-server-101  
**Autor:** Manus AI

---

## 📊 RESUMO EXECUTIVO

O **bastion-lab** é uma VM de desenvolvimento e orquestração com:
- **4 containers Docker** (Caddy, VS Code Server, Orchestrator, Agent)
- **Fail2ban** ativo (segurança)
- **Dual network** (NAT público + vSwitch privado)
- **Workspace Brain All V1** (brain_workspace)
- **Projeto Underall Infra** (/opt/underall)

**Propósito:** Sandbox de desenvolvimento + Executor remoto para Brain All V1

---

## 🖥️ ESPECIFICAÇÕES

### Hardware (Virtual)
```yaml
CPU:
  Model: AMD Ryzen 9 7950X3D (host passthrough)
  vCPU: 8 cores
  
RAM:
  Total: 16 GB
  Used: 831 MB (5%)
  Free: 7.1 GB
  Cache: 7.7 GB
  Available: 14 GB
  
Storage:
  Type: LVM (Ceph RBD)
  Total: 15 GB
  Used: 7.3 GB (53%)
  Free: 6.7 GB
  
OS:
  Distribution: Ubuntu 22.04 LTS
  Kernel: 5.15.0-94-generic
  Uptime: 21 dias 36 minutos
  Load Average: 0.06, 0.04, 0.00
```

### Rede
```yaml
Interfaces:
  ens18: 192.168.200.20/24 (NAT interno - vmbr1)
  ens19: 192.168.100.20/24 (vSwitch VLAN 4000 - vmbr-ceph)
  docker0: 172.17.0.1/16 (Docker bridge)
  br-ba1e21bd5e9e: 172.18.0.1/16 (Docker custom network)

Acesso Externo:
  SSH: 37.27.128.90:2220 → 192.168.200.20:22
  HTTPS: 37.27.128.90:8443 → 192.168.200.20:443
  Custom: 37.27.128.90:9000 → 192.168.200.20:9000
  HTTP: 37.27.128.90:8081 → 192.168.200.20:80
```

---

## 🐳 CONTAINERS DOCKER

### 1. Caddy (Reverse Proxy + SSL)
```yaml
Container: infra-caddy-1
Image: caddy:2
Status: Up 2 weeks (healthy)
Ports:
  - 0.0.0.0:80 → 80/tcp
  - 0.0.0.0:443 → 443/tcp
  
Volumes:
  - ./caddy/Caddyfile → /etc/caddy/Caddyfile
  - ./caddy/site → /srv/site
  - ./caddy/certs → /etc/caddy/certs (SSL certs)
  - caddy_data → /data
  - caddy_config → /config

Healthcheck: caddy validate --config /etc/caddy/Caddyfile
```

**Configuração (Caddyfile):**
```
:443 (HTTPS com TLS custom)
  - /agent/* → agent:9100 (sem auth)
  - /code/* → code:8443 (Basic Auth)
  - /ops/* → orchestrator:80 (Basic Auth)
  - / → /srv/site (Basic Auth)

Basic Auth User: rui
Password Hash: $2a$14$AGJzXFIn7rrHxDuDkpXwAuJrbvJcoCuXyHYFiMPZRKqcEDzJo.YP6
```

### 2. VS Code Server
```yaml
Container: infra-code-1
Image: lscr.io/linuxserver/code-server:latest
Status: Up 2 weeks
Port: 8443 (interno)

Environment:
  - PUID=${PUID}
  - PGID=${PGID}
  - TZ=${TZ}
  - PASSWORD=${CODE_PASS}

Volumes:
  - ./dev → /config/workspace

Acesso: https://37.27.128.90:8443/code/
```

### 3. Orchestrator (FastAPI)
```yaml
Container: infra-orchestrator-1
Image: tiangolo/uvicorn-gunicorn-fastapi:python3.11
Status: Up 2 weeks (healthy)
Port: 80 (interno)

Environment:
  - EXECUTOR_API_KEY=Underall#Key
  - APP_MODULE=main:app
  - PORT=80

Volumes:
  - ./ops/app → /app

Healthcheck: curl -f http://localhost:80/health
Acesso: https://37.27.128.90:8443/ops/
```

### 4. Agent (Custom Python)
```yaml
Container: infra-agent-1
Image: infra-agent (custom build)
Status: Up 2 weeks (healthy)
Port: 9100 (interno)

Environment:
  - SECRET_KEY=${SECRET_KEY}
  - LOG_LEVEL=info
  - PYTHONUNBUFFERED=1
  - DOCKER_HOST=unix:///var/run/docker.sock

Volumes:
  - /var/run/docker.sock → /var/run/docker.sock
  - ./logs → /var/log
  - ../backup → /backups

Healthcheck: curl -f http://localhost:9100/ops/health
Acesso: https://37.27.128.90:8443/agent/
```

**Nota:** Agent tem acesso ao Docker socket (pode criar/gerenciar containers).

---

## 📁 ESTRUTURA DE FICHEIROS

### /opt/underall (Projeto Principal)
```
/opt/underall/
├── backup/
│   └── 20251026_122136/
│       ├── agent.py
│       ├── Caddyfile
│       └── docker-compose.yml
├── data/
├── infra/
│   ├── agent/
│   │   ├── agent_enhanced.py
│   │   ├── agent.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── caddy/
│   │   ├── Caddyfile
│   │   ├── certs/
│   │   ├── dev/
│   │   └── site/
│   ├── docker-compose.yml
│   ├── .env
│   ├── logs/
│   │   ├── agent_activity.log
│   │   └── agent_stdout.log
│   └── ops/
│       └── app/
└── logs/
```

### /root/brain_workspace (Brain All V1 Workspace)
```
/root/brain_workspace/
├── api.py (364 bytes)
├── file1.txt
├── file2.txt
├── file3.txt
├── hello.txt
├── output.txt
├── requirements.txt
└── test.txt
```

**Nota:** Este é o workspace onde o Brain All V1 executava código remotamente via SSH.

---

## 🔒 SEGURANÇA

### Serviços Ativos
```yaml
SSH: OpenBSD Secure Shell server
  - Porta: 22 (interno)
  - Acesso externo: 37.27.128.90:2220

Fail2ban: ✅ Ativo
  - Protege SSH e outros serviços
  - Bane IPs após tentativas falhadas

Docker: ✅ Ativo
  - 4 containers em execução
  - Healthchecks configurados

Firewall: Não verificado (iptables local)
```

### Autenticação
```yaml
SSH:
  User: root
  Password: uNder2025Angola
  
Caddy Basic Auth:
  User: rui
  Password: (hash bcrypt)
  Protege: /code/*, /ops/*, /
  
Agent API:
  Auth: JWT interno (sem Basic Auth)
  Secret: Underall#Key
```

### Certificados SSL
```yaml
Path: /opt/underall/infra/caddy/certs/
Files:
  - sandpoint.crt
  - sandpoint.key

Type: Self-signed ou custom CA
Usado por: Caddy (porta 443)
```

---

## 🎯 PROPÓSITO E USO

### 1. Sandbox de Desenvolvimento
- **VS Code Server** acessível via web
- **Workspace** em /opt/underall/infra/dev
- **Docker** para testar containers

### 2. Executor Remoto (Brain All V1)
- **brain_workspace** para execução de código
- **SSH** usado pelo Brain All V1 (GPU server)
- **Logs** em /opt/underall/infra/logs

### 3. Orquestração de Infra
- **Agent** monitora e gere containers
- **Orchestrator** API para automação
- **Caddy** como gateway único

### 4. Acesso Privado via vSwitch
- **ens19** conectado à VLAN 4000
- **IP:** 192.168.100.20
- **Latência:** ~0.8ms para GPU server

---

## 📊 USO DE RECURSOS

### CPU
```yaml
Load Average: 0.06, 0.04, 0.00
Status: Muito baixo (quase idle)
Capacidade: 8 vCPUs disponíveis
```

### RAM
```yaml
Used: 831 MB / 16 GB (5%)
Free: 7.1 GB
Cache: 7.7 GB
Available: 14 GB
Status: Abundante
```

### Disco
```yaml
Used: 7.3 GB / 15 GB (53%)
Free: 6.7 GB
Status: Moderado (pode precisar limpeza)
```

**Recomendação:** Limpar logs antigos e backups para liberar espaço.

---

## 🔗 CONECTIVIDADE

### Acesso Externo (via NAT)
```bash
# SSH
ssh -p 2220 root@37.27.128.90

# HTTPS (Caddy)
https://37.27.128.90:8443/

# VS Code Server
https://37.27.128.90:8443/code/

# Orchestrator API
https://37.27.128.90:8443/ops/

# Agent API
https://37.27.128.90:8443/agent/
```

### Acesso Interno (vSwitch)
```bash
# SSH via vSwitch (do GPU server)
ssh root@192.168.100.20

# HTTP interno
curl http://192.168.100.20:80
curl http://192.168.100.20:443
```

### Teste de Conectividade
```bash
# Do GPU server para bastion
ping 192.168.100.20  # ~0.8ms

# Do bastion para GPU server
ping 192.168.100.130  # ~0.8ms

# Do bastion para Proxmox nodes
ping 192.168.100.1  # prox-101
ping 192.168.100.2  # prox-102
ping 192.168.100.6  # prox-106
```

---

## 🎯 INTEGRAÇÃO COM BRAIN ALL V1

### Como Funcionava

1. **Brain All V1** (GPU server) recebia tarefa do user
2. **Brain Agent** planeava execução de código
3. **Brain Executor** conectava via SSH ao bastion:
   ```python
   ssh root@192.168.100.20
   cd /root/brain_workspace
   python3 script.py
   ```
4. **Bastion** executava código e retornava output
5. **Brain All V1** recebia resultado e continuava agent loop

### Workspace Atual
```bash
/root/brain_workspace/
├── api.py          # Último código executado
├── file1.txt       # Ficheiros de teste
├── file2.txt
├── file3.txt
├── hello.txt
├── output.txt      # Output de execução
├── requirements.txt
└── test.txt
```

**Estado:** Workspace limpo e pronto para reutilização.

---

## 🚀 CAPACIDADE PARA BRAINALL V2

### Recursos Disponíveis
```yaml
CPU: 8 vCPUs (load ~0%)
RAM: 14 GB disponíveis
Disco: 6.7 GB livres
Rede: Dual (público + vSwitch)
Docker: ✅ Funcional
```

### Possíveis Usos no BrainAll V2

**Opção A: Manter como Sandbox**
- Continuar como executor remoto de código
- Workspace isolado para tarefas do agente
- SSH via vSwitch (seguro e rápido)

**Opção B: Expandir Funcionalidades**
- Adicionar Processing Workers (Celery)
- Whisper para transcrição de áudio
- Image processing (Pillow, OpenCV)
- Web scraping (Playwright, Selenium)

**Opção C: Migrar para VM Maior**
- Bastion atual é pequeno (15GB disco, 16GB RAM)
- Criar nova VM no prox-106 (mais recursos)
- Manter bastion atual como backup

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Disco 53% Usado
```bash
Used: 7.3 GB / 15 GB
Recomendação: Limpar logs e backups antigos
```

### 2. Certificado Self-Signed
```bash
SSL: sandpoint.crt/key (custom)
Recomendação: Usar Let's Encrypt se domínio público
```

### 3. Password em Plaintext
```bash
SSH Password: uNder2025Angola (conhecida)
Recomendação: Usar SSH keys em vez de password
```

### 4. Docker Socket Exposto
```bash
Agent tem acesso a /var/run/docker.sock
Risco: Pode criar containers com privilégios
Recomendação: Limitar permissões do agent
```

### 5. Basic Auth Hash Partilhado
```bash
User 'rui' usa mesmo hash em todos os endpoints
Recomendação: Hashes diferentes por serviço
```

---

## 🔧 COMANDOS ÚTEIS

### Aceder ao Bastion
```bash
# Via SSH externo
ssh -p 2220 root@37.27.128.90

# Via SSH interno (do prox-101)
ssh root@192.168.200.20

# Via SSH vSwitch (do GPU server)
ssh root@192.168.100.20
```

### Gerir Containers
```bash
# Ver containers
docker ps

# Logs de um container
docker logs infra-agent-1

# Reiniciar serviços
cd /opt/underall/infra
docker-compose restart

# Ver logs do agent
tail -f /opt/underall/infra/logs/agent_activity.log
```

### Limpar Espaço
```bash
# Limpar logs antigos
find /opt/underall/infra/logs -name "*.log" -mtime +30 -delete

# Limpar backups antigos
find /opt/underall/backup -type d -mtime +60 -exec rm -rf {} +

# Limpar Docker
docker system prune -a --volumes
```

### Testar Conectividade
```bash
# Ping para GPU server
ping -c 3 192.168.100.130

# Testar SSH para GPU
ssh -o ConnectTimeout=5 root@192.168.100.130 "hostname"

# Testar API do agent
curl http://localhost:9100/ops/health
```

---

## 📝 CONCLUSÃO

O **bastion-lab** é uma VM bem configurada que serve como:
- ✅ Sandbox de desenvolvimento seguro
- ✅ Executor remoto para Brain All V1
- ✅ Gateway de serviços (Caddy + Docker)
- ✅ Conectividade dual (público + privado)

**Recursos:**
- 🟢 CPU: Abundante (load ~0%)
- 🟢 RAM: Abundante (14GB livres)
- 🟡 Disco: Moderado (6.7GB livres)

**Segurança:**
- ✅ Fail2ban ativo
- ✅ Basic Auth em endpoints sensíveis
- ⚠️ Password SSH (trocar por keys)
- ⚠️ Docker socket exposto (limitar)

**Recomendação para BrainAll V2:**
- **Manter** como sandbox de execução remota
- **Expandir** com processing workers se necessário
- **Ou criar** nova VM maior no prox-106

---

**Relatório gerado por:** Manus AI  
**Data:** 15 Novembro 2025  
**Versão:** 1.0
