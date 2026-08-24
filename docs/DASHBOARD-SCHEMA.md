# Dashboard Data Schema

**Version:** 1.0 | **Date:** 2026-08-05

Contract between backend ingestion pipeline and frontend dashboard. Every section is independent — scanned sections show data, unscanned sections show locked state.

## 13 Tools → 5 Sections → 1 Dashboard

| Section | Tools | What each produces |
|---------|-------|-------------------|
| **Network** | sslyze, certigo, testssl, cryptolyzer | Per-host: TLS versions, cert algorithm, CVE findings, protocol support |
| **Code** | semgrep, pqaudit, acdi | Per-file: algorithm, severity, location, false-positive flag |
| **Infra** | vault_audit, trivy | Per-resource: key algorithm, risk level, container vulnerabilities |
| **Data** | db_crypto | Per-server: engine, TDE status, key wrapping, connection TLS |
| **PKI** | certigo-offline, dnssec, jwt_scan | Per-cert/domain/JWT: algorithm, expiry, quantum risk |

## Unified Finding Schema

Every processor outputs a normalized finding with these fields:

```json
{
  "tool": "sslyze",
  "section": "network",
  "source_file": "sslyze-scan.json",
  "findings": [
    {
      "severity": "HIGH",
      "category": "tls",
      "title": "TLS 1.2 with RSA-2048 certificate",
      "asset": "api.example.com:443",
      "algorithm": "RSA-2048",
      "quantum_risk": "HIGH",
      "evidence": "TLS 1.2 handshake, cert RSA-2048, SHA-256 signature",
      "remediation": "Upgrade to TLS 1.3 with ML-KEM-768 key exchange",
      "deadline": "2030"
    }
  ],
  "kpis": {
    "hosts_scanned": 3,
    "tls_1_3_count": 2,
    "pqc_ready": 1,
    "cert_vulnerable": 3
  }
}
```

## Section Data Shape

### Network
```json
{
  "status": "scanned",
  "hosts": [
    { "host": "api.example.com", "port": 443, "tls_version": "TLS 1.3", "cert_algorithm": "ECDSA-256", "pqc_status": "classical", "quantum_risk": "HIGH" }
  ],
  "findings": [...],
  "kpis": { "endpoints_scanned": 7, "tls13": 5, "pqc_ready": 2, "cert_vulnerable": 7, "classical_tls": 3 }
}
```

### Code
```json
{
  "status": "scanned",
  "findings": [
    { "severity": "MEDIUM", "algorithm": "3DES", "location": "src/auth.js:42", "is_false_positive": true, "tool": "semgrep" }
  ],
  "kpis": { "repos_scanned": 1, "findings_total": 12, "false_positives": 5 }
}
```

### Infra
```json
{
  "status": "scanned",
  "findings": [
    { "resource": "vault:pki/", "algorithm": "RSA-4096", "risk_level": "HIGH", "tool": "vault_audit" }
  ],
  "kpis": { "assets_scanned": 8, "vulnerable_keys": 4, "containers_scanned": 3 }
}
```

### Data
```json
{
  "status": "scanned",
  "databases": [
    { "host": "db-prod-01", "engine": "PostgreSQL 16", "tde_enabled": true, "key_wrapping": "RSA-2048", "conn_tls": "TLS 1.2", "encrypted_columns": 3 }
  ],
  "kpis": { "servers_scanned": 4, "tde_enabled": 2, "rsa_wrapped": 3 }
}
```

### PKI
```json
{
  "status": "scanned",
  "certificates": [
    { "domain": "example.com", "algorithm": "ECDSA-256", "expiry": "2027-03-15", "quantum_risk": "HIGH" }
  ],
  "findings": [
    { "type": "dnssec", "domain": "internal.example.com", "zsk_algorithm": "RSA-1024", "risk": "HIGH", "tool": "dnssec" }
  ],
  "kpis": { "certs_scanned": 12, "vulnerable": 12, "expiring_30d": 3 }
}
```

## Full Dashboard API Response

`GET /api/dashboard` → `Authorization: Bearer <firebase-id-token>`

```json
{
  "meta": { "scan_id": "uuid", "scan_date": "2026-08-05", "user_tier": "free" },
  "kpis": {
    "endpoints_scanned": 7,
    "endpoints_pqc_ready": 2,
    "findings_critical": 5,
    "findings_high": 12,
    "findings_total": 42
  },
  "sections": {
    "network": { ... },
    "code": { ... },
    "infra": { ... },
    "data": { ... },
    "pki": { ... }
  },
  "backlog": [
    { "priority": "P0", "section": "network", "finding": "TLS 1.2 with RSA-2048 on api.example.com", "action": "Upgrade to TLS 1.3 + ML-KEM", "deadline": "2027", "effort": "4h", "status": "not_started" }
  ]
}
```

## Dashboard Display Per Section

| Section status | What the user sees |
|---------------|-------------------|
| `locked` | Blurred card: "Run your first free scan →" with download link to skill |
| `scanned` (0 findings) | "No issues found — all clear ✓" with tool attribution |
| `scanned` (has findings) | KPI numbers + findings table with drill-down evidence |
| Tier limit reached | "Upgrade to scan more →" with link to pricing |

## Data Isolation

- Firestore rules: `users/{uid}` accessible only by owner
- Dashboard API: validates Firebase ID token, reads only that user's data
- Client: never constructs queries — always goes through backend API
