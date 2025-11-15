# Análise Profunda da Infraestrutura - BrainAll V2

**Data:** 15 Novembro 2025  
**Status:** Mapeamento Completo  
**Autor:** Manus AI

---

## 📊 RESUMO EXECUTIVO

Infraestrutura mapeada com sucesso:
- **1 GPU Server** (Hetzner Finlândia)
- **3 Proxmox Nodes** em cluster (Hetzner Finlândia)
- **Ceph Storage Cluster** (4.4TB distribuído)
- **vSwitch VLAN 4000** (192.168.100.0/24)
- **11 VMs** em execução
- **1 Bastion VM** identificado

---

## 🖥️ SERVIDORES FÍSICOS

### 1. GPU Server (gpu-node-130)

**Localização:** Hetzner Finlândia  
**IP Público:** 65.21.33.83  
**IP vSwitch:** 192.168.100.130  
**Hostname:** gpu-node-130

#### Hardware
```yaml
CPU:
  Model: Intel Xeon Gold 5412U
  Cores: 24 physical / 48 threads
  Base Clock: 2.1 GHz
  Max Clock: 5.7 GHz (estimado)
  
GPU:
  Model: NVIDIA RTX 6000 Ada Generation
  VRAM: 49 GB (48.14 GB usável)
  CUDA: 12.8
  Driver: 570.195.03
  
RAM:
  Total: 126 GB
  Used: 5.4 GB (sistema)
  Free: 60 GB
  Cache: 60 GB
  
Storage:
  Type: NVMe SSD
  Total: 1.8 TB
  Used: 111 GB (7%)
  Free: 1.6 TB (93%)
  
OS:
  Distribution: Ubuntu 22.04 LTS
  Kernel: 6.8.0-85-generic
```

#### Serviços Ativos
```yaml
Ollama:
  Status: Running (2 semanas uptime)
  Port: 11434
  Memory: 57.6 GB
  Models:
    - llama3.3:70b (42 GB)
    - mistral-nemo:latest (7.1 GB)
    - llama3.1:8b (4.9 GB)
  Storage: /usr/share/ollama/.ollama/models (60 GB)

Brain API:
  Status: Running
  Port: 8000
  Runtime: Python
  Service: brain-api.service

Caddy:
  Status: Running
  Ports: 80, 443
  SSL: Let's Encrypt
  Config: /etc/caddy/Caddyfile
  Domain: brain.underall.com
  Frontend: /var/www/brain-all/dist

Docker:
  Status: Running
  Bridge: 172.17.0.1/16
```

#### Rede
```yaml
Interfaces:
  - lo: 127.0.0.1/8
  - eno1: 65.21.33.83/32 (público)
  - eno1.4000: 192.168.100.130/24 (vSwitch VLAN 4000)
  - docker0: 172.17.0.1/16

Routes:
  - default via 65.21.33.65 (público)
  - 192.168.100.0/24 via eno1.4000 (vSwitch)
```

---

### 2. prox-server-101 (AX102 #1)

**Localização:** Hetzner Finlândia  
**IP Público:** 37.27.128.90  
**IP vSwitch:** 192.168.100.1  
**Hostname:** prox-server-101

#### Hardware
```yaml
CPU:
  Model: AMD Ryzen 9 7950X3D
  Cores: 16 physical / 32 threads
  Base Clock: 4.2 GHz
  Max Clock: 5.7 GHz
  Architecture: Zen 4 (3D V-Cache)
  
RAM:
  Total: 125 GB DDR5
  Used: 69 GB
  Free: 9.3 GB
  Cache: 47 GB
  Available: 55 GB
  
Storage:
  Type: NVMe SSD
  Total: 1.8 TB
  Used: 38 GB (3%)
  Free: 1.6 TB
  
OS:
  Distribution: Proxmox VE 8.4.1
  Kernel: Linux
  Uptime: 29 semanas 6 horas
```

#### VMs em Execução (7 running, 2 stopped)
```yaml
Running:
  - bastion-lab (9020): 8 vCPU, 16 GB RAM, 32 GB disk
  - vm-whisper-001 (601): 8 vCPU, 16 GB RAM, 40 GB disk
  - vm-stage-db (401): 16 vCPU, 32 GB RAM, 750 GB disk
  - vm-stage-api (402): 16 vCPU, 32 GB RAM, 750 GB disk
  - vm-stage-frontend (403): 16 vCPU, 32 GB RAM, 750 GB disk
  - VM-MX01 (305): 6 vCPU, 12 GB RAM, 300 GB disk
  - vm-postgis (301): 4 vCPU, 16 GB RAM, 100 GB disk

Stopped:
  - ubuntu-cloudinit-base (9001): Template
  - vm-ceph-test (9000): Test VM
```

#### Rede
```yaml
Bridges:
  vmbr0:
    Type: Public bridge
    IP: 37.27.128.90/26
    Gateway: 37.27.128.65
    IPv6: 2a01:4f9:3071:1064::2/64
    
  vmbr-ceph:
    Type: Private bridge (VLAN 4000)
    IP: 192.168.100.1/24
    Purpose: Ceph cluster + vSwitch
    
  vmbr1:
    Type: NAT bridge
    IP: 192.168.200.1/24
    Purpose: Internal NAT for VMs
```

---

### 3. prox-server-102 (EK41)

**Localização:** Hetzner Finlândia  
**IP vSwitch:** 192.168.100.2  
**Hostname:** prox-server-102

#### Hardware
```yaml
CPU:
  Model: AMD Ryzen 9 3900
  Cores: 12 physical / 24 threads
  Base Clock: 3.1 GHz
  Max Clock: 4.3 GHz
  Architecture: Zen 2
  
RAM:
  Total: 62 GB DDR4
  Used: 13 GB
  Free: 29 GB
  Cache: 19 GB
  Available: 48 GB
  
Storage:
  Type: NVMe SSD
  Total: 933 GB
  Used: 13 GB (2%)
  Free: 873 GB
  
OS:
  Distribution: Proxmox VE 8.4.1
  Uptime: 29 semanas 7 horas
```

#### VMs em Execução (1 running, 1 stopped)
```yaml
Running:
  - vm-qgis-server (302): 4 vCPU, 8 GB RAM, 50 GB disk

Stopped:
  - gis-core.underall.com (602): 4 vCPU, 8 GB RAM
```

---

### 4. prox-server-106 (AX102 #2)

**Localização:** Hetzner Finlândia  
**IP vSwitch:** 192.168.100.6  
**Hostname:** prox-server-106

#### Hardware
```yaml
CPU:
  Model: AMD Ryzen 9 7950X3D
  Cores: 16 physical / 32 threads
  Base Clock: 4.2 GHz
  Max Clock: 5.7 GHz
  Architecture: Zen 4 (3D V-Cache)
  
RAM:
  Total: 124 GB DDR5
  Used: 6.7 GB
  Free: 109 GB
  Cache: 10 GB
  Available: 118 GB
  
Storage:
  Type: RAID (md3)
  Total: 1.8 TB
  Used: 11 GB (1%)
  Free: 1.7 TB
  
OS:
  Distribution: Proxmox VE 8.4.1
  Uptime: 10 semanas 2 dias 8 horas
```

#### VMs em Execução (0 running, 2 stopped)
```yaml
Stopped:
  - vm-api-backend (303): 2 vCPU, 8 GB RAM, 50 GB disk
  - vm-web-frontend (304): 2 vCPU, 4 GB RAM, 30 GB disk
```

---

## 🗄️ CEPH STORAGE CLUSTER

```yaml
Cluster ID: cf978330-20f9-4a40-886f-d2ac94da811d

Health: HEALTH_WARN
  Issue: 1 pool has too many placement groups

Services:
  Monitors: 3 daemons
    - prox-server-101
    - prox-server-102
    - prox-server-106
  
  Manager: prox-server-101 (active)
    Standbys: prox-server-102, prox-server-106
  
  OSDs: 3 OSDs
    Status: 3 up, 3 in
    
Storage:
  Pools: 2 pools, 65 placement groups
  Objects: 58,080 objects
  Data: 222 GB (logical)
  Used: 433 GB (with replication)
  Total: 4.4 TB
  Available: 4.0 TB
  
Performance:
  Read: 0 B/s
  Write: 43 KB/s
  Read Ops: 0 op/s
  Write Ops: 7 op/s
```

**Storage Pool:**
- Name: `underall-ceph-store`
- Type: RBD (RADOS Block Device)
- Replication: 3x (assumido)
- Shared: Yes (cluster-wide)

---

## 🌐 REDE E CONECTIVIDADE

### vSwitch VLAN 4000 (192.168.100.0/24)

```yaml
Gateway: 192.168.100.1 (prox-server-101)

Active Hosts:
  - 192.168.100.1   → prox-server-101 (gateway)
  - 192.168.100.2   → prox-server-102
  - 192.168.100.6   → prox-server-106
  - 192.168.100.130 → gpu-node-130

Latency Tests:
  - prox-101 ↔ prox-102: ~25ms (cross-datacenter?)
  - prox-101 ↔ prox-106: ~0.6ms (same rack)
  - prox-101 ↔ GPU: ~0.8ms (same rack)
  - GPU ↔ bastion-lab: ~0.8ms (VM on prox-101)
```

### Bastion VM (bastion-lab)

```yaml
VMID: 9020
Host: prox-server-101
Status: Running
Uptime: 21 dias (1,815,831 segundos)

Resources:
  vCPU: 8 cores
  RAM: 16 GB
  Disk: 32 GB (Ceph RBD)
  
Network:
  net0: vmbr1 (192.168.200.x) - NAT interno
  net1: vmbr-ceph (192.168.100.x) - vSwitch VLAN 4000
  MAC: BC:24:11:A3:39:FF
  
Config:
  Agent: QEMU Guest Agent enabled
  CPU: host passthrough
  SCSI: virtio-scsi-pci
  Boot: scsi0
  Parent: bastion-base-v1 (snapshot)
```

**Nota:** Bastion não responde a SSH via 192.168.100.20 (credenciais diferentes ou firewall).

---

## 📈 ANÁLISE DE RECURSOS

### Capacidade Total do Cluster

```yaml
CPU:
  Total Cores: 88 cores / 176 threads
    - prox-101: 16c/32t (Ryzen 9 7950X3D)
    - prox-102: 12c/24t (Ryzen 9 3900)
    - prox-106: 16c/32t (Ryzen 9 7950X3D)
    - GPU: 24c/48t (Xeon Gold 5412U)
  
  Used (VMs): 78 vCPUs allocated
  Available: ~98 cores free
  
RAM:
  Total: 437 GB
    - prox-101: 125 GB
    - prox-102: 62 GB
    - prox-106: 124 GB
    - GPU: 126 GB
  
  Used (VMs): ~150 GB allocated
  Available: ~287 GB free
  
Storage:
  Local NVMe: 6.3 TB total
    - prox-101: 1.8 TB (3% used)
    - prox-102: 933 GB (2% used)
    - prox-106: 1.8 TB (1% used)
    - GPU: 1.8 TB (7% used)
  
  Ceph Cluster: 4.4 TB total (433 GB used)
  
  Total Available: ~10 TB
```

### Utilização Atual

```yaml
prox-server-101:
  CPU Load: 0.32%
  RAM Used: 69 GB / 125 GB (55%)
  VMs: 7 running
  
prox-server-102:
  CPU Load: 0.12%
  RAM Used: 13 GB / 62 GB (21%)
  VMs: 1 running
  
prox-server-106:
  CPU Load: 0.15%
  RAM Used: 6.7 GB / 124 GB (5%)
  VMs: 0 running
  
GPU Server:
  CPU Load: Low
  RAM Used: 5.4 GB (sistema) + 57.6 GB (Ollama) = 63 GB / 126 GB (50%)
  GPU VRAM: 610 MB / 49 GB (1.2%)
```

---

## 🎯 CAPACIDADE DISPONÍVEL PARA BRAINALL V2

### Recursos Livres (Conservador)

```yaml
prox-server-101:
  vCPU: 8-12 cores disponíveis
  RAM: 30-40 GB disponíveis
  Disk: 1.6 TB local + Ceph
  Status: Pode hospedar 2-3 VMs médias
  
prox-server-102:
  vCPU: 16-20 cores disponíveis
  RAM: 40-45 GB disponíveis
  Disk: 850 GB local + Ceph
  Status: Pode hospedar 3-4 VMs médias
  
prox-server-106:
  vCPU: 24-28 cores disponíveis
  RAM: 100-110 GB disponíveis
  Disk: 1.7 TB local + Ceph
  Status: Pode hospedar 5-6 VMs grandes
  
GPU Server:
  CPU: Reservado para Ollama/vLLM
  RAM: 60 GB disponíveis
  GPU: 48 GB VRAM disponíveis
  Status: Pronto para multi-modelo
```

### Recomendação de Alocação

**Opção A: Distribuição Balanceada**
```yaml
prox-server-101:
  - Gateway API #1: 8 vCPU, 16 GB RAM
  
prox-server-102:
  - Database (PostgreSQL): 8 vCPU, 32 GB RAM
  - Redis + MinIO: 4 vCPU, 16 GB RAM
  
prox-server-106:
  - AI Service (Python): 12 vCPU, 32 GB RAM
  - Processing Workers: 8 vCPU, 24 GB RAM
  - Gateway API #2: 8 vCPU, 16 GB RAM
  
GPU Server:
  - vLLM Multi-Model: Usar recursos existentes
```

**Opção B: Concentração em prox-106 (Mais Livre)**
```yaml
prox-server-106:
  - Gateway API #1: 8 vCPU, 16 GB RAM
  - Gateway API #2: 8 vCPU, 16 GB RAM
  - AI Service: 12 vCPU, 32 GB RAM
  - Processing Workers: 8 vCPU, 24 GB RAM
  - Database: 8 vCPU, 32 GB RAM
  - Redis + MinIO: 4 vCPU, 16 GB RAM
  
Total: 48 vCPU, 136 GB RAM (dentro da capacidade)
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Ceph Cluster
```yaml
Status: HEALTH_WARN
Issue: "1 pools have too many placement groups"
Impact: Performance pode não ser ótima
Recomendação: Ajustar PG count ou criar mais pools
```

### 2. Latência entre Nodes
```yaml
prox-101 ↔ prox-102: 25ms
  → Sugere que estão em datacenters diferentes
  → Pode impactar performance do Ceph
  → Evitar VMs com alta I/O entre estes nodes
```

### 3. Bastion VM
```yaml
Status: Identificado mas SSH não funciona
IP Esperado: 192.168.100.20 (?)
Ação: Confirmar IP correto e credenciais
```

### 4. Ollama Memory Usage
```yaml
Ollama: 57.6 GB RAM usado
Modelos: 60 GB em disco
  → Ollama está a carregar modelos em RAM
  → Pode limitar recursos para outras tarefas
  → Considerar migrar para vLLM (mais eficiente)
```

### 5. prox-server-101 Alta Utilização
```yaml
RAM: 69 GB / 125 GB usado (55%)
VMs: 7 running (mais carregado)
Recomendação: Evitar adicionar VMs pesadas aqui
```

---

## 🔍 PRÓXIMAS INVESTIGAÇÕES NECESSÁRIAS

### 1. Storage Box Hetzner
```yaml
Status: Não mapeado
Informação Necessária:
  - Credenciais de acesso
  - Capacidade total
  - Protocolo (CIFS, NFS, SSH)
  - Latência para servidores
  - Como montar nos Proxmox nodes
```

### 2. Bastion VM
```yaml
Status: Identificado mas não acessível
Informação Necessária:
  - IP correto na vSwitch
  - Credenciais SSH
  - Serviços instalados
  - Configuração atual
```

### 3. VCloud
```yaml
Status: Mencionado mas não mapeado
Informação Necessária:
  - Specs (CPU, RAM, disco)
  - Localização
  - Acesso (SSH, painel)
  - Uso pretendido
```

### 4. Hetzner Robot/Console
```yaml
Informação Útil:
  - Acesso ao painel Hetzner
  - Configuração de rede dos servidores
  - Specs exatas dos AX102/EK41
  - Storage Box details
```

---

## 📊 COMPARAÇÃO: Specs Reais vs Assumidas

| Componente | Assumido Inicialmente | Real Descoberto | Diferença |
|------------|----------------------|-----------------|-----------|
| **GPU Server CPU** | AMD EPYC | Intel Xeon Gold 5412U | ❌ Diferente |
| **GPU Server RAM** | ~128 GB | 126 GB | ✅ Correto |
| **GPU VRAM** | 48 GB | 49 GB | ✅ Correto |
| **prox-101 CPU** | Ryzen 9 7950X | Ryzen 9 7950X3D | ⚠️ Melhor (3D V-Cache) |
| **prox-102 CPU** | Ryzen 9 7950X | Ryzen 9 3900 | ❌ Mais fraco |
| **prox-102 RAM** | 128 GB | 62 GB | ❌ Metade |
| **prox-106 CPU** | EPYC 7502P | Ryzen 9 7950X3D | ❌ Diferente |
| **Ceph Storage** | Não assumido | 4.4 TB cluster | ✅ Bonus |
| **Bastion VM** | Não assumido | Identificado | ✅ Existe |

---

## 🎯 CONCLUSÕES

### Pontos Fortes
1. ✅ **Cluster Proxmox robusto** com 3 nodes e Ceph
2. ✅ **GPU server potente** com 49GB VRAM e modelos LLM já instalados
3. ✅ **Recursos abundantes** em prox-106 (118GB RAM livre)
4. ✅ **vSwitch funcional** conectando todos os servidores
5. ✅ **Bastion VM já existe** e está a correr
6. ✅ **Brain All V1 funcional** em produção

### Pontos Fracos
1. ⚠️ **prox-102 mais fraco** que esperado (Ryzen 9 3900, 62GB RAM)
2. ⚠️ **Latência alta** entre prox-101 e prox-102 (25ms)
3. ⚠️ **Ceph em HEALTH_WARN** (placement groups)
4. ⚠️ **Ollama usa 57GB RAM** (pode limitar recursos)
5. ❌ **Storage Box não mapeado** ainda
6. ❌ **Bastion SSH não funciona** (credenciais?)

### Recomendações Imediatas
1. **Usar prox-106 como node principal** para BrainAll V2 (mais recursos livres)
2. **Migrar de Ollama para vLLM** (mais eficiente, menos RAM)
3. **Resolver acesso ao Bastion** (confirmar IP e credenciais)
4. **Mapear Storage Box** para storage de ficheiros
5. **Corrigir Ceph HEALTH_WARN** (ajustar PG count)

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Infraestrutura Proxmox mapeada
2. ⏳ Aceder ao Bastion VM
3. ⏳ Mapear Storage Box Hetzner
4. ⏳ Decidir arquitetura final baseada em recursos reais
5. ⏳ Criar VMs para BrainAll V2
6. ⏳ Configurar vLLM no GPU server
7. ⏳ Implementar backend e serviços

---

**Relatório gerado por:** Manus AI  
**Data:** 15 Novembro 2025  
**Versão:** 1.0
