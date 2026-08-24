<style>
  @import url('https://raw.githubusercontent.com/jasonm23/markdown-css-themes/refs/heads/gh-pages/markdown1.css');
</style>

# Q-Readiness KPI Definitions

**Version:** 1.0 | **May 2026**

## Overview

Q-Readiness measures quantum cryptographic susceptibility across 14 enterprise layers. Each KPI is derived directly from automated tool output — no estimates, no industry averages, no external data. Every number traces to a specific JSON or CSV file in `tools/results/`.

## KPI Categories

### Category 1: HNDL Urgency (P0)

Metrics that answer: *"Is data being harvested under this key today?"*

| KPI | Definition | Calculation | Source | Meaning |
|-----|-----------|-------------|--------|---------|
| **P0 Items — Act Now** | Keys protecting data with >5yr retention crossing public networks | Count of findings where algorithm is quantum-vulnerable AND protects long-lived data in transit or at rest | acdi, DB scan, testssl.sh | HNDL-urgent. Data encrypted under these keys is being harvested NOW. Must remediate within 3 months. |
| **P0 Layers Affected** | Which infrastructure layers contain HNDL-urgent findings | Distinct count of layers (Secrets, Database, TLS) with at least one P0 finding | Cross-tool aggregation | Breadth of immediate exposure. P0 in multiple layers = systemic harvesting risk. |

### Category 2: Cryptographic Inventory (P1-P3)

Metrics that answer: *"Where is our quantum-vulnerable cryptography?"*

| KPI | Definition | Calculation | Source | Meaning |
|-----|-----------|-------------|--------|---------|
| **TLS Endpoints Vulnerable** | Endpoints presenting quantum-vulnerable certificates or running deprecated protocols | Count of endpoints with severity HIGH or CRITICAL / total endpoints scanned | Surveyor, testssl.sh, PQC Scanner | Surface area of transport-layer exposure. 7 endpoints scanned. |
| **PQC Key Exchange Adoption** | Services that have deployed PQC key exchange algorithms | Count with PQC KEX detected / total services benchmarked | pqcscan | Industry migration progress. 4/8 (50%) have PQC KEX. 0/8 have PQC certificates. |
| **Certificate Identity Gap** | Services with PQC key exchange but classical certificate signatures | Count with PQC KEX AND classical cert / total services | pqcscan + PQC Scanner | The two-phase migration gap. Phase 1 (KEX) started. Phase 2 (certificates) not started anywhere. |
| **Findings by Layer** | Distribution of quantum-vulnerable assets across infrastructure layers | Count of findings grouped by layer (TLS, Code, Secrets, PKI, Database, DNSSEC, Email) | All tools | Identifies concentration risk. TLS (15) and Code (9) dominate. |
| **Secrets & PKI Exposure** | Key management infrastructure using quantum-vulnerable algorithms | Count of Vault mounts, KMS keys, CI/CD secrets with RSA/ECDSA algorithms | acdi, Vault audit | Compromise here cascades — these keys protect other keys. |
| **Database Encryption Exposure** | Databases with quantum-vulnerable TDE key wrapping or connection TLS | Count of databases where TDE key wrapping uses RSA/ECDSA or connection TLS uses deprecated versions | DB Crypto Scan | Data-at-rest HNDL risk. Long retention (30yr PHI) + RSA wrapping = P0. |

### Category 3: Scanner Performance

Metrics that answer: *"Can we trust these findings?"*

| KPI | Definition | Calculation | Source | Meaning |
|-----|-----------|-------------|--------|---------|
| **False Positive Rate** | Scanner findings that are regex artifacts, not real crypto | False positive count / total findings per tool | pqaudit, CryptoScan | 83-100% on our codebase. AI classification pipeline reduces this before human review. |
| **Layer Coverage** | Infrastructure layers with completed cryptographic inventory | Count of layers with at least one tool scan completed / 14 total layers | Tool inventory | Currently 12 tool outputs across 7 layers. 4 layers pending tool deployment. |

### Category 4: Performance Impact

Metrics that answer: *"Will PQC migration slow down our systems?"*

| KPI | Definition | Calculation | Source | Meaning |
|-----|-----------|-------------|--------|---------|
| **PQC TLS Overhead** | Additional latency from PQC key encapsulation in TLS handshake | ML-KEM-768 keygen + encaps time / total TLS handshake time | liboqs, PQC-LEO | 22µs (0.04% of 50ms handshake). Negligible. |
| **PQC vs Classical Throughput** | TLS connections per second with PQC vs RSA-2048 baseline | PQC connections/sec / classical connections/sec | PQC-LEO | ML-KEM-768 at 97.1% of RSA-2048 throughput. Session reuse: 4.2x speedup for all algorithms. |
| **ML-KEM KeyGen Speed** | Key generation operations per second | Operations completed in 3-second benchmark window | liboqs | 285,015 ops/sec. 95x faster than RSA-2048 signing. |

## Priority Classification

| Priority | Time Horizon | Trigger | Example |
|----------|-------------|---------|---------|
| **P0** | 3 months | Data with >5yr retention encrypted under quantum-vulnerable key, crossing public networks | KMS wrapping PHI with RSA-2048, DB TDE with RSA-2048 for 30yr retention data |
| **P1** | 18 months (CNSA 2.0) | Software/firmware signing, defense contractor systems, financial keys with regulatory deadlines | Vault Intermediate CA, GCP KMS for payment processing keys |
| **P2** | 4 years (NIST deprecation) | Internal PKI, SSH CAs, code signing, internal certificates | Vault Root CA, Cosign signing keys, DNSSEC ZSKs |
| **P3** | 9 years (NIST removal) | Short-lived tokens, DNSSEC, internal-only services with normal refresh cycles | JWT signing keys, DKIM keys, ephemeral session keys |

## Data Provenance

Every KPI value in the Q-Readiness dashboard traces to a specific tool output file:

| Tool | Version | Output File | What It Measures |
|------|---------|-------------|-----------------|
| Surveyor | 1.0.0 | `surveyor-scan.json` | TLS endpoint classification |
| pqcscan | 0.8.0 | (live scan) | PQC algorithm detection in TLS/SSH |
| PQC Network Scanner | v2.0 CLI | `pqc-network-scan-*.json` | Certificate chain analysis |
| pqaudit | 0.5.0 | `pqaudit-results.json`, `cbom.json` | Code-level crypto inventory |
| CryptoScan | 1.3.0 | `cryptoscan-results.json` | Code-level crypto discovery |
| liboqs | 0.15.0 | (benchmark output) | Algorithm performance |
| PQC-LEO | 0.5.0 | `pqcleo-tls-bench-*.csv` | TLS handshake benchmarks |
| acdi | 0.5.0 | `acdi-cbom-*.json` | IaC, secrets, PKI, code signing |
| testssl.sh | 3.3 | `testssl-*.json` | TLS vulnerability assessment |
| Vault Audit | 1.0 | `vault-audit-*.json` | Secrets management |
| DB Crypto Scan | — | _no scanner shipped_ | Database encryption — custom script removed; awaiting a real open-source tool (see `quantum/CLAUDE.md` HARD RULE) |
| DNSSEC Scanner | 1.0 | `dnssec-scan-*.json` | DNSSEC algorithm audit |
