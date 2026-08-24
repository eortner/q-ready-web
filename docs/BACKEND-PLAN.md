# Backend Plan — KPIs, Personalization, Ingestion

**Date:** 2026-08-10

---

## 1. KPIs per section — country-switchable

KPIs are the same metrics across countries. The referenced standard and urgency change per region. User's `questionnaire_answers.region` controls which column to display.

### Supported regions

| Region | Standards body | Key deadline | Migration target |
|--------|---------------|-------------|-----------------|
| USA | NIST / NSA | CNSA 2.0 Phase 1: Jan 2027 | NIST removal: 2035 |
| Japan | CRYPTREC / NCO | Formal PQC roadmap: May 2027 | Full transition: 2035 |
| EU | ENISA / ETSI | DORA enforcement: 2027 | Coordinated roadmap |
| China | CCN | GB/T standards: 2026-2029 | Independent PQC path |

### Network (6 KPIs)

| # | KPI | USA standard | Japan standard | EU standard | China standard |
|---|-----|-------------|---------------|-------------|---------------|
| 1 | TLS 1.3 adoption rate | NIST SP 800-52 Rev 2 | CRYPTREC Ciphers List | ENISA TLS guidelines | MIIT TLS mandate |
| 2 | PQC key exchange rate | NIST FIPS 203 (ML-KEM) | CRYPTREC ML-KEM eval | EU CS Roadmap (hybrid) | GB/T (TBD) |
| 3 | Certificate quantum risk | NIST IR 8547 | CRYPTREC Ciphers List | ETSI TS 119 312 | CCN algorithm list |
| 4 | CNSA-equivalent gap | CNSA 2.0 (2027) | NCO 2035 (2027 roadmap) | DORA (2027) | CCN deadline |
| 5 | CVE exposure score | NIST NVD (CVSS v4) | JVN (Japan Vuln Notes) | EU NIS2 CVSS | CNNVD |
| 6 | Protocol deprecation | SP 800-52 (no SSLv3/TLS1.0) | CRYPTREC deprecated list | ENISA deprecated | MIIT guidance |

### Code (6 KPIs)

| # | KPI | USA standard | Japan standard | EU standard | China standard |
|---|-----|-------------|---------------|-------------|---------------|
| 1 | Quantum-vulnerable calls / 1K LOC | NIST FIPS 203/204 | CRYPTREC List | EU CS Roadmap | GB/T compliance |
| 2 | PQC library readiness | CNSA 2.0 approved list | CRYPTREC approved list | ENISA recommended | CCN approved |
| 3 | False positive ratio | NIST SP 800-53 (audit) | IPA/SEC guidelines | ISO 27001 | GB/T 22239 |
| 4 | CNSA algorithm gap | CNSA 2.0 non-approved count | CRYPTREC non-approved | EU CS non-approved | CCN non-approved |
| 5 | Hardcoded secret density | PCI DSS 4.0 (Req 3.3) | FISC (Japan financial) | DORA Art 12 | GB/T 39786 |
| 6 | CI/CD signing coverage | NIST SP 800-218 (SSDF) | IPA CI/CD guidelines | EU CSA | GB/T CI/CD |

### Infra (6 KPIs)

| # | KPI | USA standard | Japan standard | EU standard | China standard |
|---|-----|-------------|---------------|-------------|---------------|
| 1 | KMS key algorithm risk | NIST FIPS 203 | CRYPTREC | EU CS | CCN |
| 2 | HSM FIPS 140-3 readiness | FIPS 140-3 L3 | JCMVP (ISO 19790) | EU CS SOG-IS | GB/T HSM |
| 3 | IaC crypto exposure | CNSA 2.0 | CRYPTREC | DORA | CCN |
| 4 | Container CVSS score | NIST NVD | JVN | EU NIS2 | CNNVD |
| 5 | Vault auto-unseal risk | CNSA 2.0 | CRYPTREC | ENISA KMS guidance | CCN KMS |
| 6 | Service mesh mTLS posture | NIST SP 800-207 (ZT) | IPA ZT guidelines | ENISA ZT | GB/T ZT |

### Data (6 KPIs)

| # | KPI | USA standard | Japan standard | EU standard | China standard |
|---|-----|-------------|---------------|-------------|---------------|
| 1 | Encryption-at-rest coverage | NIST SP 800-57 Pt 1 | CRYPTREC storage | EU CS storage | GB/T storage |
| 2 | Key wrapping vulnerability | NIST FIPS 203 | CRYPTREC key mgmt | ETSI key mgmt | CCN key mgmt |
| 3 | Connection TLS 1.3 rate | NIST SP 800-52 | CRYPTREC DB TLS | ENISA DB security | GB/T DB sec |
| 4 | Backup encryption gap | HIPAA 164.312 / PCI | Japan APPI | GDPR Art 32 | PIPL |
| 5 | HNDL exposure index | Derived (retention × risk) | Derived | Derived | Derived |
| 6 | Database classification coverage | NIST SP 800-60 | Japan govt classification | EU data governance | GB/T classification |

### PKI (7 KPIs)

| # | KPI | USA standard | Japan standard | EU standard | China standard |
|---|-----|-------------|---------------|-------------|---------------|
| 1 | Certificate quantum risk | NIST IR 8547 | CRYPTREC Ciphers List | ETSI QSC | CCN certs |
| 2 | Root CA algorithm posture | CNSA 2.0 PKI timeline | CRYPTREC CA guidance | eIDAS | GB/T CA |
| 3 | Certificate expiry risk | NIST SP 800-57 Pt 1 | JNSA certificate BP | ETSI EN 319 411 | GB/T expiry |
| 4 | DNSSEC algorithm hygiene | NIST SP 800-81-2 | CRYPTREC DNSSEC | ENISA DNS security | GB/T DNSSEC |
| 5 | JWT/OAuth signing compliance | CNSA 2.0 (2027) | CRYPTREC JWT guidance | EU CS OAuth profile | CCN JWT |
| 6 | OCSP/CRL availability | NIST SP 800-57 | JNSA revocation | eIDAS Art 24 | GB/T CRL |
| 7 | Certificate chain migration complexity | NIST PKI complexity | CRYPTREC migration | ETSI migration | GB/T migration |

### Overview KPIs (cross-section, country-independent)

| KPI | Source |
|-----|--------|
| Sections scanned | Count of `sections[].status == "scanned"` |
| Total findings | Sum across all sections |
| Critical + High findings | Count where severity in (CRITICAL, HIGH) |
| P0 + P1 backlog items | Count from derived backlog |
| HNDL exposure index | Aggregate across data + network sections |

### How the switch works

Dashboard loads user's `questionnaire_answers.region` → selects the matching column → displays KPI value + standard reference + deadline badge.

Example: Network KPI #2 "PQC key exchange rate: 50%"
- Region=us → "FIPS 203 · Target 2030 · On track"
- Region=jp → "CRYPTREC ML-KEM eval · Target 2035 · Ahead of schedule"
- Region=eu → "EU CS Roadmap · Target 2027 · Action needed"
- Region=cn → "GB/T pending · TBD · Monitor"

---

## 2. Questionnaire → Personalization

### What we collect
| Field | Values | Purpose |
|-------|--------|---------|
| Industry | finance, defense, healthcare, tech, telecom, energy, other | Filter news/standards by sector relevance |
| Region | us, eu, apac, latam, global | Filter by regulatory jurisdiction |
| Infrastructure | cloud, hybrid, onprem, airgapped | Recommend scanning tools and tier |
| Compliance | nist, cnsa, eu, china, japan, pci, hipaa, soc2 | Filter deadline alerts and compliance content |
| Retention | short (<3y), medium (3-10y), long (10-30y), permanent | Priority of HNDL risk scoring |

### How it drives content

**Alerts (deadline-based):**
```
IF compliance includes "cnsa" → show CNSA 2.0 Phase 1 countdown (2027)
IF compliance includes "nist" → show NIST deprecation countdown (2030)
IF compliance includes "eu" → show DORA compliance deadline (2027)
IF retention == "long" or "permanent" → HNDL critical status badge
```

**News filtering:**
```
Industry=finance → show financial services PQC articles
Industry=defense → show CNSA 2.0 / defense articles
Region=eu → prioritize EU CS / DORA articles
Region=us → prioritize NIST / US articles
```

**Dashboard behavior:**
```
Retention=permanent → all findings get +1 severity bump (MEDIUM → HIGH)
Infrastructure=airgapped → highlight Q-Appliance tier in tools tab
```

### Storage
Users' `questionnaire_answers` already saved to `users/{uid}` in Firestore. Read on portal load to personalize dashboard.

---

## 3. Ingestion Pipeline

### A. Structured upload (AI-guided)
```
1. qreadiness skill produces JSON per tool → each file has known format
2. POST /scan/upload with single JSON file + Firebase token
3. Backend validates token → gets user_id
4. process_file() runs the file through all 13 processors
5. First match returns normalized {tool, section, findings, kpis}
6. write_section(user_id, scan_id, result) → Firestore
7. Returns {scan_id, section, status: "written"}
```

### B. Unstructured upload (manual/Docker)
```
1. User runs tools manually → zip of mixed outputs
2. POST /scan/upload-raw with zip + Firebase token
3. Backend validates token → gets user_id
4. Unzips, walks directory, process_file() on each file
5. Each match → write_section() to Firestore
6. After all processed → finalize_scan() computes aggregate KPIs + backlog
7. Returns {scan_id, files_processed, sections_written, status}
```

### C. What happens at write_section()
```
1. Receives processor result: {tool, section, findings[], kpis{}}
2. Writes to Firestore: users/{uid}/scans/{scan_id}/sections/{section}
3. Creates scan meta document if first section
4. Returns {scan_id, section, status: "written"}
```

### D. What happens at finalize_scan()
```
1. Reads all sections for the scan from Firestore
2. Aggregates cross-section KPIs (total findings, by severity, by layer)
3. Derives P0-P3 backlog from all findings
4. Writes kpis + backlog to scan document
5. Marks scan as "complete"
```

### E. Tier enforcement (future, blocking task)
```
Before write_section():
1. Count user's current month scans for this section
2. Compare against tier limit (free=1, starter=3, pro=10, enterprise=100, custom=∞)
3. If exceeded → return 402 "Tier limit reached"
4. If within limit → proceed with write
```

---

## 4. Standards Monitoring & Alerts (dynamic)

### Standards database (Firestore collection `standards/`)

Each document = one standard, versioned, with last-checked timestamp:

```
standards/
├── nist-fips-203: { country: "us", name: "...", status: "final", effective: "2024-08", last_checked: "..." }
├── nist-cnsa-phase1: { country: "us", name: "CNSA 2.0 Phase 1", status: "pending", deadline: "2027-01-01" }
├── cryptrec-mlkem: { country: "jp", name: "CRYPTREC ML-KEM", status: "evaluated", effective: "2026-04" }
├── nco-2035: { country: "jp", name: "NCO PQC Target", status: "announced", deadline: "2035-01-01" }
├── eu-dora: { country: "eu", name: "DORA PQC", status: "active", deadline: "2027-01-01" }
├── gbt-47177: { country: "cn", name: "GB/T 47177.1", status: "approved", effective: "2026-02" }
└── ...
```

### Update pipeline

```
1. CRON job / scheduled function runs weekly
2. Checks official sources per country:
   - USA: nist.gov, csrc.nist.gov (RSS/API)
   - Japan: cryptrec.go.jp (announcements)
   - EU: enisa.europa.eu, eur-lex.europa.eu
   - China: cac.gov.cn, gbstandards.org
3. Diffs against stored version
4. Changes found → update standards/ doc + generate alert
5. Alert stored in users/{uid}/alerts/
```

### Alert types

| Type | Trigger | Example |
|------|---------|---------|
| Deadline approaching | 90/60/30 days before deadline | "CNSA 2.0 Phase 1: 90 days remaining" |
| Standard changed | Status or text changed since last check | "CRYPTREC ML-KEM moved from 'evaluating' to 'approved'" |
| New standard | New document added | "EU publishes new PQC migration guidance" |

### Alert delivery

```
User's questionnaire determines which alerts they receive:
  - region=us → gets NIST/CNSA alerts
  - region=jp → gets CRYPTREC/NCO alerts
  - compliance=nist,eu → gets only NIST + EU alerts

Alerts shown in:
  1. Portal → News tab (auto-filtered by user's region/compliance)
  2. Portal → KPI cards (badge: "Updated 3 days ago")
  3. Email (Pro+ tier, future)
```

### Dashboard refresh

When a standard changes:
1. Standards doc updated in Firestore
2. All affected users' KPI references update (standard name, deadline, urgency color)
3. Backlog items may change priority (deadline moved closer → P1 becomes P0)

This means the KPI display is not static text — it reads from `standards/` collection and computes display dynamically.

---

## Implementation order

1. **KPIs** — Document only. Processors already compute these in their return values.
2. **Personalization** — Portal already reads questionnaire from Firestore. Add filtering logic in portal.js for alerts/news display.
3. **Ingestion testing** — Upload a real tool output file through `/scan/upload`, verify Firestore document.
4. **Tier enforcement** — Add before write_section().
