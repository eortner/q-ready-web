---
name: qreadiness
description: Q-Readiness BOM Generator — runs open-source cryptographic discovery tools across 5 infrastructure sections (network, code, infra, data, pki). Triggers: "scan network", "run BOM", "install tools", "show help", "show status", "install surveyor", "info pqcscan", "show todo".
version: "2.0.0"
---

# Q-Readiness BOM Generator v2.0

Build a Cryptographic Bill of Materials across your organization. All tools are open-source and auditable. Free tier: 1 target per section.

## The 5 Sections

| Section | Trigger | Tools | Free tier |
|---------|---------|-------|-----------|
| Network & TLS | "scan network" | surveyor, pqcscan, PQC Scanner, testssl.sh, CryptoLyzer | 1 host:port |
| Code & Repos | "scan code" | pqaudit, cryptoscan, kybercheck, acdi (code) | 1 repository |
| Infra & Configs | "scan infra" | acdi (IaC), Vault audit | 1 Terraform file or 1 Vault mount |
| Data & Storage | "scan data" | DB crypto scan (PG/MySQL/MSSQL/Oracle) | 1 database server |
| PKI & Identity | "scan pki" | DNSSEC scan, cert chain analysis, JWT/Kerberos probes | 1 domain or 1 certificate |

## User Intent Mapping

Match these user phrases to their action:

- "scan network", "scan tls", "check endpoints" → Network & TLS section
- "scan code", "scan repo", "code scan" → Code & Repos section
- "scan infra", "scan configs", "infrastructure scan" → Infra & Configs section
- "scan data", "scan database", "db scan" → Data & Storage section
- "scan pki", "scan certs" → PKI & Identity section
- "scan all", "full scan", "run all sections" → All sections (paid only)
- "show help", "help", "what can you do" → List commands and sections
- "show status", "coverage", "what's scanned" → Section coverage overview
- "show todo", "remediation", "what to fix" → Remediation per section
- "install <tool>", "setup <tool>" → Install a specific tool by ID
- "uninstall <tool>", "remove <tool>" → Remove a tool by ID
- "info <tool>", "about <tool>" → Show tool details, source, license
- "install all", "setup everything" → Install all tools in tools.json

## Section Workflows

### Network & TLS

**Trigger:** "scan network"

**Free tier:** 1 host:port. Paid: unlimited endpoints.

**Ask the user:** "Which host:port should I scan?"

**Tools to run (in order):** surveyor, pqcscan, PQC Scanner, testssl.sh, CryptoLyzer

**Output:** `./scan_results/network/`

### Code & Repos

**Trigger:** "scan code"

**Free tier:** 1 repository. Paid: unlimited repos + CI/CD configs.

**Ask the user:** "Which repository should I scan? Provide a path or URL."

**Tools to run:** pqaudit, cryptoscan, kybercheck, acdi (code mode)

**Output:** `./scan_results/code/`

### Infrastructure & Configs

**Trigger:** "scan infra"

**Free tier:** 1 Terraform file or 1 Vault mount path. Paid: full IaC + all Vault mounts.

**Ask the user:** "What should I scan? A Terraform file path or Vault mount?"

**Tools to run:** acdi (infra mode), Vault audit

**Output:** `./scan_results/infra/`

### Data & Storage

**Trigger:** "scan data"

**Free tier:** 1 database server. Paid: all DB servers, backup encryption.

**Ask the user:** "Provide the database engine (pg/mysql/mssql/oracle), host, and read-only credentials."

**Tool to run:** DB crypto scan

**Output:** `./scan_results/data/`

### PKI & Identity

**Trigger:** "scan pki"

**Free tier:** 1 domain or 1 certificate. Paid: full PKI inventory.

**Ask the user:** "Which domain or certificate should I audit?"

**Tools to run:** DNSSEC scan, cert chain analysis

**Output:** `./scan_results/pki/`

## Status & Todo

**Trigger:** "show status" or "coverage" → Display all 5 sections with: scanned (target count), unscanned, tools available.

**Trigger:** "show todo" or "remediation" → List remediation steps across all scanned sections, prioritized by quantum urgency (P0 → P1 → P2 → P3).

## Tool Management

### Runtime Detection

Before any install, check `tools.json` for a `runtime` section. If missing or older than 24h, detect and write it:

```bash
echo "{\"detected_at\":\"$(date -Iseconds)\",\"uname\":\"$(uname -s)\",\"package_managers\":{\"cargo\":\"$(which cargo 2>/dev/null || echo missing)\",\"npm\":\"$(which npm 2>/dev/null || echo missing)\",\"pip3\":\"$(which pip3 2>/dev/null || echo missing)\",\"git\":\"$(which git 2>/dev/null || echo missing)\"}}" | python3 -c "import json,sys; t=json.load(open('tools.json')); t['runtime']=json.load(sys.stdin); json.dump(t,open('tools.json','w'),indent=2)"
```

On subsequent runs, read from `tools.json → runtime`. Only re-detect if stale or tools seem missing.

### Install / Uninstall

Read `tools.json` for each tool's `install` and `uninstall` fields. Adapt commands based on detected package managers in the runtime section.

| Tool ID | Install | Uninstall |
|---------|---------|-----------|
| surveyor | `cargo install surveyor` | `cargo uninstall surveyor` |
| pqcscan | `pip install pqcscan` | `pip uninstall pqcscan -y` |
| PQC Scanner | `pip install pqc-network-scanner` | `pip uninstall pqc-network-scanner -y` |
| testssl.sh | `git clone https://github.com/drwetter/testssl.sh.git` | `rm -rf testssl.sh` |
| CryptoLyzer | `pip install CryptoLyzer` | `pip uninstall CryptoLyzer -y` |
| pqaudit | `npm install -g pqaudit@0.5.0` | `npm uninstall -g pqaudit` |
| cryptoscan | `npm install -g cryptoscan` | `npm uninstall -g cryptoscan` |
| kybercheck | `cargo install kybercheck` | `cargo uninstall kybercheck` |
| acdi | `cargo install acdi` | `cargo uninstall acdi` |
| Vault audit | `cp scripts/vault-audit.sh /usr/local/bin/` | `rm /usr/local/bin/vault-audit.sh` |
| DB scan | `cp scripts/db-crypto-scan.sh /usr/local/bin/` | `rm /usr/local/bin/db-crypto-scan.sh` |
| DNSSEC | `cp scripts/dnssec-scan.sh /usr/local/bin/` | `rm /usr/local/bin/dnssec-scan.sh` |

### Info

**Trigger:** "info <tool>" or "about <tool>" → Show description, category, install/uninstall, source URL, license.

## Output directory

```
scan_results/
├── network/   → surveyor-scan.json, pqcscan-results.json, pqc-network-scan.json, testssl-scan.json
├── code/      → pqaudit-results.json, cryptoscan-results.json, kybercheck-results.json
├── infra/     → acdi-cbom.json, vault-audit.json
├── data/      → db-crypto-scan.json
└── pki/       → dnssec-scan.json, cert-inventory.json
```
