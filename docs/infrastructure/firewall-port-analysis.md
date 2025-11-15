# Radiografia Completa: Firewall e Portas - prox-server-101

**Data:** 15 Novembro 2025  
**Servidor:** prox-server-101.underall.com (37.27.128.90)  
**Autor:** Manus AI

---

## 📋 RESUMO EXECUTIVO

O prox-server-101 está configurado como **gateway NAT** para múltiplas VMs internas, com port forwarding extensivo para:
- Mail server (VM 192.168.200.50)
- Bastion VM (VM 192.168.200.20)
- Database VM (VM 192.168.200.11)
- Web services (VM 192.168.200.10)

**Total de regras NAT:** 18 DNAT + 8 MASQUERADE  
**Portas públicas expostas:** 15+ portas

---

## 🔥 REGRAS NAT (PREROUTING)

### Mail Server (192.168.200.50) - VM MX01

```yaml
Porta Pública → VM Interna
25   (SMTP)     → 192.168.200.50:25    # 24K packets
465  (SMTPS)    → 192.168.200.50:465   # 6.6K packets
587  (Submission) → 192.168.200.50:587 # 7.3K packets
993  (IMAPS)    → 192.168.200.50:993   # 6.4K packets
80   (HTTP)     → 192.168.200.50:80    # 24K packets
443  (HTTPS)    → 192.168.200.50:443   # 520K packets
2223 (SSH)      → 192.168.200.50:22    # 53K packets

Status: ✅ Mail server totalmente funcional
Tráfego: Alto (520K packets em HTTPS)
```

### Bastion VM (192.168.200.20)

```yaml
Porta Pública → VM Interna
2220 (SSH)      → 192.168.200.20:22    # 182 packets
8443 (HTTPS)    → 192.168.200.20:443   # 4.2K packets
9000 (Custom)   → 192.168.200.20:9000  # 413 packets
8080 (HTTP)     → 192.168.200.20:80    # 0 packets (duplicado)
8081 (HTTP)     → 192.168.200.20:80    # 2.2K packets

Status: ✅ SSH acessível via porta 2220
Nota: Múltiplas regras para mesma VM (limpeza recomendada)
```

### Database VM (192.168.200.11)

```yaml
Porta Pública → VM Interna
2222 (SSH)      → 192.168.200.11:22    # 1.7M packets
54321 (PostgreSQL) → 192.168.200.11:5432 # 99K packets

Status: ✅ PostgreSQL exposto publicamente
Atenção: ⚠️ Database diretamente acessível da internet
```

### Web Service (192.168.200.10)

```yaml
Porta Pública → VM Interna
8080 (HTTP)     → 192.168.200.10:80    # 194K packets

Status: ✅ Funcional
```

### WireGuard VPN

```yaml
Porta Pública → Ação
443/UDP         → Redirect to 51820    # 525 packets

Status: ✅ WireGuard configurado
Nota: Usa porta 443/UDP (disfarçado)
```

---

## 🌐 PORTAS PÚBLICAS EXPOSTAS

### Mapeamento Completo

| Porta | Protocolo | Destino | Serviço | Tráfego |
|-------|-----------|---------|---------|---------|
| **22** | TCP | Proxmox host | SSH (Proxmox) | Host |
| **25** | TCP | 192.168.200.50 | SMTP (Mail) | 24K pkts |
| **80** | TCP | 192.168.200.50 | HTTP (Mail webmail) | 24K pkts |
| **443** | TCP | 192.168.200.50 | HTTPS (Mail webmail) | 520K pkts |
| **443** | UDP | WireGuard | VPN | 525 pkts |
| **465** | TCP | 192.168.200.50 | SMTPS (Mail) | 6.6K pkts |
| **587** | TCP | 192.168.200.50 | Submission (Mail) | 7.3K pkts |
| **993** | TCP | 192.168.200.50 | IMAPS (Mail) | 6.4K pkts |
| **2220** | TCP | 192.168.200.20 | SSH (Bastion) | 182 pkts |
| **2222** | TCP | 192.168.200.11 | SSH (Database) | 1.7M pkts |
| **2223** | TCP | 192.168.200.50 | SSH (Mail) | 53K pkts |
| **8006** | TCP | Proxmox host | Proxmox Web UI | Host |
| **8080** | TCP | 192.168.200.10 | HTTP (Web) | 194K pkts |
| **8081** | TCP | 192.168.200.20 | HTTP (Bastion) | 2.2K pkts |
| **8443** | TCP | 192.168.200.20 | HTTPS (Bastion) | 4.2K pkts |
| **9000** | TCP | 192.168.200.20 | Custom (Bastion) | 413 pkts |
| **54321** | TCP | 192.168.200.11 | PostgreSQL | 99K pkts |

---

## 🔒 REGRAS FIREWALL (FORWARD CHAIN)

### Mail Server (192.168.200.50)

```bash
# SMTP (25)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:25
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:25 → 0.0.0.0/0

# SMTPS (465)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:465
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:465 → 0.0.0.0/0

# Submission (587)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:587
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:587 → 0.0.0.0/0

# IMAPS (993)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:993
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:993 → 0.0.0.0/0

# HTTP (80)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:80
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:80 → 0.0.0.0/0

# HTTPS (443)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:443
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:443 → 0.0.0.0/0

# SSH (22)
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.50:22
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.50:22 → 0.0.0.0/0
```

### Bastion VM (192.168.200.20)

```bash
# SSH (22)
ACCEPT tcp -- * → *  0.0.0.0/0 → 192.168.200.20:22  # 182 packets

# HTTPS (443)
ACCEPT tcp -- * → *  0.0.0.0/0 → 192.168.200.20:443  # 1 packet
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.20:443
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.20:443 → 0.0.0.0/0

# HTTP (80) - Duplicado
ACCEPT tcp -- vmbr0 → vmbr1  0.0.0.0/0 → 192.168.200.20:80
ACCEPT tcp -- vmbr1 → vmbr0  192.168.200.20:80 → 0.0.0.0/0
```

---

## 🔍 BASTION VM - ACESSO SSH

### Como Aceder ao Bastion

```bash
# Via porta pública 2220
ssh -p 2220 root@37.27.128.90

# Ou via IP interno (do prox-101)
ssh root@192.168.200.20
```

**Porta NAT:** 2220 (público) → 22 (interno)  
**IP Interno:** 192.168.200.20  
**Tráfego:** 182 packets (baixo uso)

### Outras Portas do Bastion

```yaml
8443: HTTPS (4.2K packets) - Possível web interface
9000: Custom service (413 packets) - Desconhecido
8081: HTTP (2.2K packets) - Possível API
```

---

## 🛡️ MASQUERADE (POSTROUTING)

```bash
# NAT para todas as VMs em vmbr1
MASQUERADE  * → vmbr0  192.168.200.0/24 → 0.0.0.0/0  # 6.3M packets

# Regras específicas para bastion (redundantes)
MASQUERADE  * → vmbr0  192.168.200.20 → 0.0.0.0/0
MASQUERADE  * → vmbr0  192.168.200.20 → 0.0.0.0/0
MASQUERADE  * → vmbr0  192.168.200.20 → 0.0.0.0/0
MASQUERADE  * → vmbr0  192.168.200.20 → 0.0.0.0/0

# NAT para VPN
MASQUERADE  * → vmbr0  10.10.0.0/16 → 192.168.200.0/24
```

**Nota:** Múltiplas regras MASQUERADE redundantes para bastion (limpeza recomendada).

---

## 🖥️ PORTAS LOCAIS (PROXMOX HOST)

### Serviços Internos

```yaml
Proxmox:
  8006: Proxmox Web UI (HTTPS)
  3128: SPICE Proxy (VNC/SPICE para VMs)
  85:   PVE Daemon (interno)

Ceph Cluster (192.168.100.1):
  3300: Ceph Monitor (v2)
  6789: Ceph Monitor (v1)
  6800-6809: Ceph Manager + OSD

FRRouting (BGP/Zebra):
  2601: Zebra daemon
  2605: BGP daemon
  2616: Static routing daemon
  2617: BFD daemon
  2623: Management daemon

DNS:
  53: dnsmasq (local DNS)

SSH:
  22: SSH (Proxmox host)
```

---

## ⚠️ ANÁLISE DE SEGURANÇA

### 🔴 Riscos Críticos

1. **PostgreSQL Exposto Publicamente**
   ```
   Porta: 54321 → 192.168.200.11:5432
   Risco: Database diretamente acessível da internet
   Recomendação: Mover para VPN ou restringir IPs
   ```

2. **Múltiplas Portas SSH Expostas**
   ```
   2220 → Bastion
   2222 → Database VM
   2223 → Mail Server
   Risco: Múltiplos pontos de entrada
   Recomendação: Consolidar via bastion apenas
   ```

3. **WireGuard em Porta 443/UDP**
   ```
   Porta: 443/UDP → 51820
   Risco: Pode confundir com HTTPS
   Recomendação: OK se intencional (stealth VPN)
   ```

### 🟡 Avisos

1. **Regras Duplicadas**
   - Múltiplas regras para bastion (192.168.200.20)
   - Regras MASQUERADE redundantes
   - Recomendação: Limpar iptables

2. **Portas HTTP/HTTPS Partilhadas**
   - Porta 80/443 usada por mail server
   - Porta 8080/8081/8443 para outros serviços
   - Recomendação: Usar reverse proxy (Nginx/Caddy)

3. **Sem Rate Limiting**
   - Nenhuma regra de rate limiting visível
   - Risco: Brute force em SSH
   - Recomendação: Adicionar fail2ban ou iptables rate limit

### ✅ Pontos Positivos

1. **NAT Bem Configurado**
   - MASQUERADE funcional
   - Port forwarding correto
   - Tráfego alto (6.3M packets) = estável

2. **Firewall FORWARD Restritivo**
   - Apenas portas específicas permitidas
   - Stateful firewall (ESTABLISHED,RELATED)

3. **Separação de Redes**
   - vmbr0: Público
   - vmbr1: NAT interno
   - vmbr-ceph: Cluster privado

---

## 📊 ESTATÍSTICAS DE TRÁFEGO

### Top 5 Portas por Tráfego

| Porta | Destino | Packets | Serviço |
|-------|---------|---------|---------|
| 2222 | Database VM | 1.7M | SSH |
| 443 | Mail Server | 520K | HTTPS |
| 8080 | Web Service | 194K | HTTP |
| 54321 | Database | 99K | PostgreSQL |
| 2223 | Mail Server | 53K | SSH |

### Análise

- **Database VM (2222):** Uso muito alto de SSH (1.7M packets)
  - Possível backup/sync contínuo
  - Ou acesso frequente de aplicações

- **Mail Server (443):** Tráfego HTTPS intenso (520K packets)
  - Webmail muito usado
  - Ou API de mail

- **PostgreSQL (54321):** 99K packets
  - Acesso externo à database
  - ⚠️ Risco de segurança

---

## 🎯 RECOMENDAÇÕES

### 1. Segurança Imediata

```bash
# Bloquear PostgreSQL público (mover para VPN)
iptables -D PREROUTING -t nat -p tcp --dport 54321 -j DNAT --to-destination 192.168.200.11:5432

# Adicionar rate limiting em SSH
iptables -I INPUT -p tcp --dport 22 -m state --state NEW -m recent --set
iptables -I INPUT -p tcp --dport 22 -m state --state NEW -m recent --update --seconds 60 --hitcount 4 -j DROP
```

### 2. Limpeza de Regras

```bash
# Remover regras duplicadas de MASQUERADE
iptables -t nat -D POSTROUTING 3  # Bastion duplicado
iptables -t nat -D POSTROUTING 4  # Bastion duplicado
iptables -t nat -D POSTROUTING 5  # Bastion duplicado
iptables -t nat -D POSTROUTING 6  # Bastion duplicado

# Consolidar regras de bastion
# Manter apenas 1 regra genérica para 192.168.200.0/24
```

### 3. Reverse Proxy

```bash
# Instalar Nginx/Caddy no host ou VM dedicada
# Centralizar HTTP/HTTPS em porta 80/443
# Usar SNI para rotear por domínio
```

### 4. Fail2ban

```bash
# Instalar fail2ban no host
apt install fail2ban

# Configurar para todas as portas SSH
# 22 (host), 2220 (bastion), 2222 (db), 2223 (mail)
```

### 5. Monitorização

```bash
# Instalar netdata ou prometheus
# Monitorizar:
# - Conexões por porta
# - Bandwidth por VM
# - Tentativas de login SSH
```

---

## 🔧 COMANDOS ÚTEIS

### Ver Conexões Ativas

```bash
# Todas as conexões
ss -tunap | grep ESTAB

# Por porta específica
ss -tunap | grep :2220

# Top IPs conectados
netstat -ntu | awk '{print $5}' | cut -d: -f1 | sort | uniq -c | sort -rn | head -10
```

### Testar Port Forwarding

```bash
# Do exterior
nc -zv 37.27.128.90 2220  # Bastion SSH
nc -zv 37.27.128.90 54321 # PostgreSQL

# Do host
curl -I http://192.168.200.50  # Mail webmail
ssh -p 22 root@192.168.200.20  # Bastion interno
```

### Backup de Regras

```bash
# Salvar regras atuais
iptables-save > /root/iptables-backup-$(date +%Y%m%d).rules

# Restaurar
iptables-restore < /root/iptables-backup-20251115.rules
```

---

## 📝 MAPEAMENTO DE VMs

### VMs Identificadas via NAT

| VM IP | VMID | Hostname | Serviços |
|-------|------|----------|----------|
| 192.168.200.10 | ? | Web Service | HTTP:8080 |
| 192.168.200.11 | ? | Database VM | SSH:2222, PostgreSQL:54321 |
| 192.168.200.20 | 9020 | bastion-lab | SSH:2220, HTTPS:8443, Custom:9000 |
| 192.168.200.50 | 305 | VM-MX01 | Mail Server (SMTP, IMAP, HTTP, HTTPS) |

---

## 🎯 CONCLUSÃO

O prox-server-101 está configurado como **gateway NAT robusto** com:

✅ **Pontos Fortes:**
- NAT funcional para 4+ VMs
- Mail server totalmente operacional
- Separação de redes (público/privado/cluster)
- Tráfego alto e estável (6.3M packets)

⚠️ **Pontos de Atenção:**
- PostgreSQL exposto publicamente (risco)
- Múltiplas portas SSH (aumenta superfície de ataque)
- Regras duplicadas (limpeza necessária)
- Sem rate limiting ou fail2ban

🔧 **Ações Recomendadas:**
1. Mover PostgreSQL para VPN
2. Consolidar acesso SSH via bastion
3. Limpar regras duplicadas
4. Instalar fail2ban
5. Adicionar monitorização

---

**Acesso ao Bastion Descoberto:**
```bash
ssh -p 2220 root@37.27.128.90
# Ou internamente:
ssh root@192.168.200.20
```

**Relatório gerado por:** Manus AI  
**Data:** 15 Novembro 2025
