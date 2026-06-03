# Dashboard & Toolchain — Implementation Plan

**Status:** Dashboard built with 3 tabs, all 12 tools integrated. Tool analysis complete. Mock data generated for 7 missing tools. Next: aesthetic fixes, responsive polish, edge cases.
**Last updated:** 2026-06-02 (end of day)

## Purpose of this exercise

1. **Discovery** — Figure out what a client actually needs to see. What data matters? What insights are actionable? What's missing from our current toolchain?
2. **Delivery** — Build a data-driven dashboard showing real scan results, not marketing narrative.

---

## Current Dashboard State

`dashboard.html` — 3 tabs with side navigation:

| Tab | Content | Data source |
|-----|---------|-------------|
| Dashboard | KPI cards + donut ring + PQC benchmark bar chart + top findings table + HNDL exposure table | pqcscan, Surveyor, PQC Scanner |
| Inventory | TLS endpoints table + code crypto table + liboqs performance table — all with drill-down evidence | surveyor-scan.json, cbom.json, liboqs |
| Actions | Remediation backlog (P0-P2) + regulatory deadlines table | Derived from real findings |

Top bar: client name, assessment date, version, PDF export button.
Common: side nav switches tab content. KPI row always visible (Readiness Score, Critical Findings, TLS Endpoints, Cost of Delay).

**To fix:**
- [ ] Audit every number against tool output files — remove anything not backed by scan data
- [ ] Fix KPI card values to match actual tool results
- [ ] Add coverage indicators (which layers scanned vs not)
- [ ] Better chart-data interactions (click benchmark bar → highlight TLS row in Inventory tab)
- [ ] Remove PQC Adoption Trend chart — no time-series data exists

---

## Quantum threat taxonomy — ALL the problems quantum creates

### Time horizons

| Horizon | When | What's at risk |
|---------|------|---------------|
| Right now (HNDL active) | Today | Encrypted data crossing networks is being harvested |
| Immediate (0-2 years) | 2026-2028 | CNSA 2.0 Phase 1 deadlines. PQC migration must begin |
| Near-term (2-5 years) | 2028-2031 | NIST deprecation of RSA/ECDSA. Enterprise PQC migration window |
| Medium-term (5-10 years) | 2031-2036 | NIST removal of classical algorithms. CRQC expected |
| Systemic (anytime) | Ongoing | Supply chain, insurance, M&A liability, regulatory penalties |

### Threat categories

1. **Cryptographic Compromise** — RSA/ECDSA/ECDH/DH broken by Shor. Symmetric halved by Grover. Hash weakened.
2. **Harvest Now, Decrypt Later** — TLS sessions, VPN, SSH, backups, email — recorded today, decrypted later. Window: ~2015-2035.
3. **PKI & Trust Collapse** — Root CA keys broken, code signing forgeable, DNSSEC vulnerable, CT logs exposed.
4. **Supply Chain Exposure** — Vendors/SaaS/cloud with no PQC roadmap extend client quantum exposure.
5. **Regulatory & Compliance** — CNSA 2.0, DORA, NIS2, PCI DSS, HIPAA, GDPR quantum implications.
6. **Insurance & Liability** — Cyber exclusion, D&O liability, M&A inherited risk, breach notification.
7. **Strategic & Competitive** — First-mover advantage, vendor leverage, talent scarcity, patent/IP exposure.
8. **Quantum Networking Maturity** — QKD trusted nodes, repeater timeline, NSA/NCSC guidance, implementation attacks.
9. **Optimization Investment Risk** — Overestimated advantage, vendor lock-in, error correction overhead, talent drain.
10. **Assessment Integrity** — False negatives, false positives, scope blind spots, legal liability.

---

## HNDL — central urgency message

```
2015 — Harvesting begins — 2026 (TODAY) — PQC migration — 2035 — CRQC arrives
                                   |                        |
                                   v                        v
                           Encrypted data              Window closes:
                           being collected             PQC is universal
                           RIGHT NOW
```

What the dashboard must show about HNDL:
- Which data types are at risk (by retention period)
- Estimated volume exposed (records × years of harvesting)
- Probability-weighted risk: retention × quantum arrival × breach cost
- Cost of each month of delay

---

## Three assessment domains — finding types

| Domain | Finding type | Urgency driver | Action verb |
|--------|-------------|----------------|-------------|
| PQC | Vulnerability | HNDL + regulatory deadlines | Replace, migrate, re-wrap, upgrade |
| Quantum Networking | Readiness gap | Technology maturity + vendor availability | Evaluate, assess, simulate, plan |
| Optimization & ML | Suitability verdict | Hardware roadmap + business ROI | Screen, benchmark, compare, train |

### PQC domain findings (vulnerabilities)

Examples:
- RSA-2048 on production TLS endpoints → replace with ML-KEM
- ECDSA-256 certificates → replace with ML-DSA
- TDE master key wrapped with RSA-2048 → re-wrap with ML-KEM
- JWT tokens signed with RS256 → migrate to ML-DSA

Data sources: pqaudit, CryptoScan, Surveyor, pqcscan, PQC Scanner, liboqs, database queries, KMS API queries, IdP config.

### Quantum Networking findings (readiness gaps)

Examples:
- No QKD feasibility assessment — unclear if fiber supports quantum signals
- Dark fiber identified — suitable for QKD pilot, loss budget within tolerance
- PTP not deployed — required for quantum network synchronization
- NSA/NCSC guidance not reviewed — QKD not recommended for most use cases

Data sources: NetSquid, fiber documentation, PTP audit, team skills, vendor questionnaires.

### Optimization & ML findings (suitability verdicts)

Examples:
- Supply chain optimization — QAOA candidate, 50+ qubits for advantage over Gurobi
- Classical baseline not established — cannot measure quantum advantage
- No quantum talent in-house — hybrid workflow requires quantum-aware engineer
- Vendor lock-in risk — workloads tied to Qiskit, migrate to hardware-agnostic framework

Data sources: SQOUT, Cirq/PennyLane, Gurobi/CPLEX baselines, hardware roadmaps, team skills.

---

## 14-Layer Crypto Inventory Map

| Layer | Currently covered? | What to discover | How to discover |
|-------|-------------------|------------------|-------------------|
| Code | Yes (pqaudit, CryptoScan) | Algorithm calls, library imports, hardcoded keys, IaC | Static analysis, regex, AST |
| TLS/SSH endpoints | Yes (Surveyor, pqcscan) | TLS version, cipher suites, PQC support, SSH KEX | Active probing, passive capture |
| Certificates | Yes (PQC Scanner) | Certificate chains, key algorithms, expiry, PQC OIDs | Chain analysis |
| Algorithm benchmarks | Yes (liboqs) | PQC ops/sec on client hardware | liboqs speed_kem, speed_sig |
| Database encryption | No | TDE status, column encryption, connection TLS, backup encryption, master key location | Custom SQL per engine |
| Data at rest | No | File/disk encryption (BitLocker, LUKS), backup/archive encryption, object storage | OS commands, cloud APIs |
| Secrets management | No | KMS keys/algorithms, HSM models/firmware, Vault storage, CI/CD secrets | Cloud API, pkcs11-tool, Vault API |
| Identity & IAM | No | JWT signing, SAML assertion encryption, OAuth, Kerberos, LDAP, RADIUS | IdP config, AD PS, klist, ldapsearch |
| Network infra | Partial | VPN ciphers, load balancer TLS, API gateway mTLS, service mesh, Wi-Fi, SD-WAN | Device configs, cloud APIs |
| Email & communication | No | DKIM keys/algorithms, S/MIME inventory, PGP audit, SMTP TLS, VoIP SRTP | DNS TXT, mail configs, PGP keyserver |
| Code signing & supply chain | No | Code signing certs/algorithms, container signing, package signing, firmware signing | CI/CD config, GitHub API, Sigstore |
| Hardware & embedded | No | HSM firmware/algorithms, smart card/YubiKey, TPM version, IoT crypto | Vendor APIs, HSM console, tpm2_getcap |
| Cloud infrastructure | No | KMS policies, load balancer TLS, CDN edge, object encryption, PaaS encryption | Cloud API (read-only), Terraform state |
| Third-party vendors | No | SaaS crypto questionnaire, payment processor TLS, IdP signing, CDN/WAF PQC | Vendor questionnaires, SSL Labs, crt.sh |
| Data classification | No | Retention schedules, regulatory tags (PCI, PHI, CUI, ITAR, GDPR) | CMDB export, DPO interview |

### Database layer — discovery queries

**PostgreSQL:**
- `SELECT * FROM pg_stat_ssl` — connection encryption
- `SELECT * FROM pg_extension WHERE extname = 'pgcrypto'` — encryption extension
- `SELECT table_schema, table_name, column_name, data_type FROM information_schema.columns WHERE column_name ~* '(encrypt|crypt|cipher|secret|key|token)' OR data_type = 'bytea'` — suspect columns
- Check `postgresql.conf` for `ssl_ciphers`

**MySQL/MariaDB:**
- `SHOW VARIABLES LIKE '%encrypt%'` — TDE, binary log encryption
- `SHOW VARIABLES LIKE '%ssl%'` — connection encryption
- `SELECT * FROM information_schema.INNODB_TABLESPACES_ENCRYPTION` — per-table encryption
- `SELECT TABLE_SCHEMA, TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE COLUMN_NAME LIKE '%encrypt%' OR DATA_TYPE IN ('VARBINARY','BLOB')` — suspect columns

**SQL Server:**
- `SELECT name, is_encrypted FROM sys.databases` — TDE status
- `SELECT t.name, c.name, c.encryption_type_desc, c.encryption_algorithm_name FROM sys.columns c JOIN sys.tables t ON c.object_id = t.object_id WHERE c.encryption_type IS NOT NULL` — Always Encrypted columns
- `SELECT encrypt_option FROM sys.dm_exec_connections WHERE session_id = @@SPID` — connection encryption
- `SELECT key_algorithm FROM sys.dm_database_encryption_keys` — TDE algorithm

**Oracle:**
- `SELECT * FROM V$ENCRYPTED_TABLESPACES` — TDE tablespaces
- `SELECT * FROM DBA_ENCRYPTED_COLUMNS` — encrypted columns
- `SELECT * FROM V$ENCRYPTION_WALLET` — wallet/master key status

---

## Tool Analysis (May 2026)

### Tools executed

| Tool | Version | What it scans | Findings | KPIs |
|------|---------|---------------|----------|------|
| pqaudit | 0.5.0 | Code + network PQC (regex/AST, 90+ patterns) | 9 findings: 7 false positives, 2 safe | FP rate: 100%. PQC Ready: true |
| pqcscan | 0.8.0 | TLS/SSH PQC algorithm detection | 8 services: 4 PQC KEX, 4 vulnerable, 0 PQC certs | PQC KEX: 50%. Cert gap: 100% |
| PQC Network Scanner | v2.0 CLI | Certificate chain analysis, PQC OID detection | 4 hosts: all HIGH risk, no PQC OIDs | Cert vulnerability: 100% |
| CryptoScan | 1.3.0 | Code-level crypto (90+ patterns, 20+ langs) | 150+ findings, ~95% false positives | Actionable: est. 5-15 after AI triage |
| Surveyor | 1.0.0 | TLS infrastructure inventory, certificate identity classification | 3 hosts: all modern_tls_classical_identity | Cert identity migration: 0% |
| liboqs | 0.15.0 | NIST PQC reference benchmarks | ML-KEM-768: 10.5µs keygen, ML-DSA-65: 102.5µs sign | PQC TLS overhead: 0.04% |
| PQC-LEO | 0.5.0 | TLS handshake benchmarks (connections/sec, full stack) | Deferred — Docker image prepared, not built | — |

### Cross-tool composite KPIs

| KPI | Value | Source tools |
|-----|-------|-------------|
| Endpoints scanned | 4 | Surveyor + PQC Scanner |
| Endpoints with PQC KEX | 2/4 (50%) | pqcscan |
| Endpoints with PQC certs | 0/4 (0%) | PQC Scanner + Surveyor |
| Scanner false positive rate | 83-100% | pqaudit (100%), CryptoScan (95%) |
| PQC performance overhead | 0.04% of TLS handshake | liboqs |
| Certificate identity gap | 100% across all services | PQC Scanner + Surveyor + pqcscan |
| Code-level crypto vulnerabilities | 0 critical/high on our codebase | pqaudit + CryptoScan |

### Missing tools by verification layer

See full 14-layer map above. Tools to add:

| Priority | Layer | Tool solution |
|----------|-------|---------------|
| High | Database encryption | Custom SQL scripts per engine (pg, mysql, mssql, oracle) |
| High | Secrets management | acdi (IaC KMS scanning) + Vault audit |
| High | TLS handshake benchmarks | PQC-LEO Docker build |
| Medium | Identity & IAM | acdi (JWT alg detection) + custom Kerberos/SAML scripts |
| Medium | Network infra | testssl.sh + acdi Terraform/K8s scanning |
| Medium | Cloud infra | acdi Terraform + cloud API audit scripts |
| Medium | Data at rest | Custom FS encryption audit (BitLocker, LUKS) |
| Low | Email/DNSSEC | dig + zone enumeration, DKIM record scanning |
| Low | Code signing | acdi certificate scanning + pipeline audit |
| Low | Hardware/HSM | No open source HSM key inventory tool exists |
| Low | Third-party vendors | Manual questionnaires |
| Low | Data classification | Manual, CMDB integration |

---

## Design Constraints

- **No data without tool provenance.** Every number = source file + tool version.
- **No charts backed by external/internet data.** Charts = tool output only.
- **No explanatory prose in the dashboard.** Explanations go in methodology docs or glossary.
- **No countdown clocks.** Deadlines are data fields, not animated marketing.
- **No emoji.** No callout boxes. No "Book a Call" CTAs in the dashboard.
- **Dashboard is a tool for clients to view their scan data**, not a marketing page.
- **Use design tokens from css/styles.css.** No raw hex/rgba.
- **No newsletter language.** Portal access is the delivery mechanism.
- **All motion uses `var(--luxury-curve)`, respects `prefers-reduced-motion`.**
- **0.5px gold dividers between sections.**
- **Typography: Cormorant Garamond headings, Inter body.**
- **No sliders, no filters, no interactive data changes.**

---

## Next Actions

1. [ ] Audit every data point in dashboard.html against actual tool output files
2. [ ] Remove any data not backed by tools/results/
3. [ ] Build PQC-LEO Docker image for TLS handshake benchmarks
4. [ ] Write DB crypto discovery scripts (postgres, mysql, mssql)
5. [ ] Deploy acdi for IaC/KMS scanning
6. [ ] Build missing KPIs from existing tool data
7. [ ] Add coverage layer indicator to dashboard
8. [ ] Better chart-data interactions (click benchmark bar → highlight TLS row in Inventory)

---

## References

- `../web-swarm/website-swarm/QUANTUM-RISK-CLASSIFICATION.md` — Tier 0-4 framework
- `../web-swarm/website-swarm/ASSESSMENT-PROTOCOLS.md` — Per-environment scan procedures
- `../web-swarm/website-swarm/ANALYSIS-AND-STRATEGY.md` — Standard deliverable visualizations, benchmark data
- `../web-swarm/website-swarm/RESULTS-GUIDE.md` — How tool outputs aggregate into client reports
- `../web-swarm/website-swarm/TOOLS.md` — The 7 open-source scanners and what they detect
- `../web-swarm/website-swarm/tools/results/` — Real scan output files
- NIST IR 8547 — PQC transition plan (deprecation 2030, removal 2035)
- NIST CSWP 48 — PQC migration mapped to NIST CSF 2.0 & SP 800-53
- CNSA 2.0 — National Security Systems PQC requirements and timeline
