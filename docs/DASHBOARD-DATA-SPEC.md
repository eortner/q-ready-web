# Dashboard Data Specification

**Version:** 1.0
**Date:** 2026-08-11
**Audience:** Backend developers, frontend developers, data engineers

## Overview

This document defines the exact data contract between the Q-Readiness ingestion pipeline and the client dashboard. Every field, every type, every expected value is specified.

## Architecture

```
PROCESSOR OUTPUT → WRITER → FIRESTORE → DASHBOARD API → PORTAL UI
                      ↑           ↑            ↑
                 KPI Engine    Per-user      Auth token
                 Stable IDs    isolation     validation
```

Data flows one way: processors normalize tool output → writer stores sections in Firestore → KPI engine computes metrics → dashboard API reads and returns to portal. The portal never reads Firestore directly.

## API Endpoint

`GET /api/dashboard` — returns the complete dashboard payload for the authenticated user.

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Response shape:**

```json
{
  "meta": {},
  "kpis": {},
  "sections": {},
  "backlog": [],
  "standards": {}
}
```

---

## Section 1: `meta`

Metadata about the scan and user.

| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `scan_id` | string or null | `"abc123-def456"` | UUID of latest scan, null if never scanned |
| `scan_date` | string or null | `"2026-08-11T10:30:00Z"` | ISO 8601, null if never scanned |
| `user_tier` | string | `"free"` | free \| starter \| pro \| enterprise \| custom |

**Example:**
```json
{
  "meta": {
    "scan_id": "abc123-def456",
    "scan_date": "2026-08-11T10:30:00Z",
    "user_tier": "free"
  }
}
```

---

## Section 2: `kpis`

Cross-section aggregate metrics. Computed by `kpi_engine.aggregate_cross_section_kpis()`.

| Field | Type | Example | Source |
|-------|------|---------|--------|
| `findings_total` | integer | 42 | Sum of all section findings |
| `critical` | integer | 5 | Count of severity=CRITICAL |
| `high` | integer | 12 | Count of severity=HIGH |
| `by_layer` | object | `{"network":15, "code":9, ...}` | Finding count per section |

**Example:**
```json
{
  "kpis": {
    "findings_total": 42,
    "critical": 5,
    "high": 12,
    "by_layer": { "network": 15, "code": 9, "infra": 6, "data": 7, "pki": 5 }
  }
}
```

---

## Section 3: `sections`

Object with 5 keys: `network`, `code`, `infra`, `data`, `pki`. Each section is independent. Sections that have never been scanned return `{"status": "locked"}`.

### Section status values

| Value | Meaning | Dashboard behavior |
|-------|---------|-------------------|
| `locked` | Never scanned | Blurred card with "Run free scan" CTA |
| `scanned` | Has data | Active card with KPIs and findings |

### 3.1 Network

```json
{
  "network": {
    "status": "scanned",
    "tool": "sslyze",
    "hosts": [
      {
        "host": "api.example.com",
        "port": 443,
        "tls_version": "TLS 1.3",
        "cert_algorithm": "ECDSA-256",
        "pqc_status": "hybrid",
        "quantum_risk": "HIGH"
      }
    ],
    "findings": [
      {
        "id": "net:api.example.com:443:ecdsa-256",
        "severity": "HIGH",
        "title": "ECDSA-256 certificate on TLS endpoint",
        "host": "api.example.com",
        "port": 443,
        "cve": null,
        "tool": "sslyze"
      }
    ],
    "kpis": {
      "tls13_rate": 0.71,
      "pqc_kex_rate": 0.29,
      "classical_tls_rate": 0.29,
      "cert_vulnerable_rate": 1.0,
      "cve_critical_count": 0,
      "endpoints_scanned": 7
    }
  }
}
```

**KPI definitions:**

| KPI | Type | Range | Formula |
|-----|------|-------|---------|
| `tls13_rate` | float | 0.0-1.0 | hosts with TLS 1.3 / total hosts |
| `pqc_kex_rate` | float | 0.0-1.0 | hosts with ML-KEM or hybrid / total hosts |
| `classical_tls_rate` | float | 0.0-1.0 | hosts with TLS < 1.3 or no PQC / total hosts |
| `cert_vulnerable_rate` | float | 0.0-1.0 | hosts with RSA/ECDSA certs / total hosts |
| `cve_critical_count` | integer | 0+ | findings with CVE and severity CRITICAL/HIGH |
| `endpoints_scanned` | integer | 0+ | total unique host:port |

### 3.2 Code

```json
{
  "code": {
    "status": "scanned",
    "tool": "semgrep",
    "findings": [
      {
        "id": "code:src/auth.js:42:3des",
        "severity": "MEDIUM",
        "algorithm": "3DES",
        "location": "src/auth.js:42",
        "is_false_positive": true,
        "tool": "semgrep"
      }
    ],
    "kpis": {
      "findings_total": 9,
      "false_positives": 5,
      "false_positive_ratio": 0.556,
      "critical_high_count": 0,
      "repos_scanned": 1
    }
  }
}
```

**KPI definitions:**

| KPI | Type | Range | Formula |
|-----|------|-------|---------|
| `findings_total` | integer | 0+ | real findings (excl. false positives) |
| `false_positives` | integer | 0+ | findings flagged as false positive |
| `false_positive_ratio` | float | 0.0-1.0 | false positives / total findings |
| `critical_high_count` | integer | 0+ | real findings with severity CRITICAL/HIGH |
| `repos_scanned` | integer | 0+ | count of repositories scanned |

### 3.3 Infrastructure

```json
{
  "infra": {
    "status": "scanned",
    "tool": "vault_audit",
    "findings": [
      {
        "id": "infra:vault:pki:rsa-4096",
        "severity": "HIGH",
        "resource": "vault:pki/",
        "algorithm": "RSA-4096",
        "risk_level": "HIGH",
        "tool": "vault_audit"
      }
    ],
    "kpis": {
      "assets_scanned": 8,
      "vulnerable_keys": 4,
      "container_critical": 0
    }
  }
}
```

**KPI definitions:**

| KPI | Type | Range | Formula |
|-----|------|-------|---------|
| `assets_scanned` | integer | 0+ | sum of all scanned infra resources |
| `vulnerable_keys` | integer | 0+ | keys using RSA/ECDSA |
| `container_critical` | integer | 0+ | container findings severity CRITICAL/HIGH |

### 3.4 Data

The Data & Storage section is a **schema inventory**, not a crypto scanner: the
collector runs SchemaCrawler (read-only catalog discovery) and the backend
classifies the raw graph. TDE / key-wrapping / connection-TLS state is a
documented gap (no open-source authority) and is NOT fabricated.

```json
{
  "data": {
    "status": "scanned",
    "tools": ["db-schema-bom 1.0.0"],
    "databases": [
      {
        "host": "127.0.0.1",
        "engine": "postgresql",
        "database": "qrdb",
        "engine_version": "16.13",
        "table_count": 2,
        "column_count": 9,
        "encrypted_column_candidates": ["customers.card_number", "payments.card_number"]
      }
    ],
    "kpis": {
      "servers_scanned": 2,
      "tables_inventoried": 4,
      "columns_inventoried": 15,
      "encrypted_column_candidates": 3
    }
  }
}
```

**KPI definitions:**

| KPI | Type | Range | Formula |
|-----|------|-------|---------|
| `servers_scanned` | integer | 0+ | unique database hosts (manifest `status: ok` entries) |
| `tables_inventoried` | integer | 0+ | sum of tables across all DBs |
| `columns_inventoried` | integer | 0+ | sum of columns across all DBs |
| `encrypted_column_candidates` | integer | 0+ | columns whose type holds binary blobs (`bytea`/`varbinary`/`blob`) — candidates, not proof of encryption |

### 3.5 PKI

```json
{
  "pki": {
    "status": "scanned",
    "tool": "certigo",
    "certificates": [
      {
        "domain": "example.com",
        "algorithm": "ECDSA-256",
        "expiry": "2027-03-15",
        "quantum_risk": "HIGH"
      }
    ],
    "findings": [
      {
        "id": "pki:example.com:ecdsa-256",
        "type": "dnssec",
        "domain": "internal.example.com",
        "risk": "HIGH",
        "tool": "dnssec"
      }
    ],
    "kpis": {
      "certs_scanned": 12,
      "certs_vulnerable": 12,
      "cert_vuln_rate": 1.0,
      "expiring_30d": 3,
      "dnssec_vulnerable": 1
    }
  }
}
```

**KPI definitions:**

| KPI | Type | Range | Formula |
|-----|------|-------|---------|
| `certs_scanned` | integer | 0+ | total certificates |
| `certs_vulnerable` | integer | 0+ | certs with quantum_risk=HIGH |
| `cert_vuln_rate` | float | 0.0-1.0 | vulnerable / total certs |
| `expiring_30d` | integer | 0+ | certs expiring within 30 days |
| `dnssec_vulnerable` | integer | 0+ | DNSSEC findings with risk HIGH/CRITICAL |

---

## Section 4: `backlog`

Prioritized remediation items. Each item has a stable ID, status, and status history.

```json
{
  "backlog": [
    {
      "id": "net:api.example.com:443:ecdsa-256",
      "priority": "P1",
      "section": "network",
      "finding": "ECDSA-256 certificate on TLS endpoint",
      "asset": "api.example.com:443",
      "action": "Upgrade to TLS 1.3 with ML-KEM-768 key exchange",
      "deadline": "Q4 2027",
      "effort": "4h",
      "status": "todo",
      "history": [
        {
          "status": "todo",
          "time": "2026-08-11T10:30:00Z",
          "reason": "Initial finding"
        }
      ]
    }
  ]
}
```

**Status values and their meaning:**

| Status | Meaning | How it changes |
|--------|---------|---------------|
| `todo` | Not yet addressed | Initial state for new findings |
| `in_progress` | Being worked on | User clicks "Start" in portal |
| `done` | Remediated | User clicks "Mark Done" or auto-set when rescan shows finding gone |

**Status auto-transitions on rescan:**

| Old status | Rescan result | New status | Note |
|-----------|--------------|------------|------|
| `done` | Finding still present | `todo` | "Remediation may have failed" |
| `todo` | Finding not present | `done` | "No longer detected" |
| `in_progress` | Finding still present | `in_progress` | Unchanged |
| — | New finding | `todo` | "Initial finding" |

**Priority definitions:**

| Priority | Severity trigger | Time horizon |
|----------|-----------------|-------------|
| P0 | CRITICAL | Act within 3 months |
| P1 | HIGH | Plan this year (CNSA 2027) |
| P2 | MEDIUM | NIST deprecation (2030) |
| P3 | LOW | NIST removal (2035) |

---

## Section 5: `standards`

Country-specific compliance context. Stored in Firestore `standards/` collection, editable from Firebase Console. Read at API time based on user's `questionnaire_answers.region`.

```json
{
  "standards": {
    "country": "United States",
    "body": "NIST / NSA",
    "key_deadline": "2027-01-01",
    "migration_target": "2035-01-01",
    "references": {
      "pqc_key_exchange": "NIST FIPS 203 (ML-KEM)",
      "cert_quantum_risk": "NIST IR 8547",
      "tls_version": "NIST SP 800-52 Rev 2"
    }
  }
}
```

**Supported regions:**

| Code | Country | Body | Key deadline |
|------|---------|------|-------------|
| `us` | United States | NIST / NSA | 2027-01-01 (CNSA 2.0) |
| `jp` | Japan | CRYPTREC / NCO | 2027-05-01 (Formal roadmap) |
| `eu` | European Union | ENISA / ETSI | 2027-01-01 (DORA) |
| `cn` | China | CCN | 2026-01-01 (GB/T 47177) |

---

## Stable finding ID format

Every finding gets a reproducible key. Same asset scanned twice = same ID. Enables rescan comparison.

| Section | ID pattern | Example |
|---------|-----------|---------|
| Network | `net:{host}:{port}:{algorithm}` | `net:api.example.com:443:ecdsa-256` |
| Code | `code:{file}:{algorithm}` | `code:src/auth.js:42:3des` |
| Infra | `infra:{resource}:{algorithm}` | `infra:vault:pki:rsa-4096` |
| Data | `data:{host}:{engine}:{key_wrap}` | `data:db-prod-01:pg16:rsa-2048` |
| PKI | `pki:{domain}:{algorithm}` | `pki:example.com:ecdsa-p256` |

---

## Firestore structure (reference)

```
users/{uid}/
├── profile: {email, name, industry, tier, questionnaire_answers, created_at}
└── scans/{scan_id}/
    ├── meta: {scan_id, scan_date, status, sections_written}
    ├── audit: [{stage, time, section, tool, findings_count, computed_kpis}]
    ├── kpis: {findings_total, critical, high, by_layer}
    ├── backlog: [{id, priority, section, finding, asset, action, deadline, effort, status, history}]
    └── sections/
        ├── network: {status, tool, hosts[], findings[], kpis{}}
        ├── code: {status, tool, findings[], kpis{}}
        ├── infra: {status, tool, findings[], kpis{}}
        ├── data: {status, tool, databases[], kpis{}}
        └── pki: {status, tool, certificates[], findings[], kpis{}}

standards/ (global, not per-user)
├── us: {country, body, key_deadline, migration_target, references{}}
├── jp: ...
├── eu: ...
└── cn: ...
```
