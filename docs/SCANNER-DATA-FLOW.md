# Scanner Data Flow — Collector → Backend → Dashboard

**Version:** 1.0
**Date:** 2026-08-11
**Audience:** Backend developers, frontend developers, data engineers, DevOps

## Purpose

This document answers two questions:

1. **What do the scanners actually produce?** The real output of every tool in the
   Q-Readiness collector — the JSON files that land in `scan_results/`, nothing mocked.
2. **How do we get from a raw tool output to the dashboard contract?** The exact
   ingestion pipeline (detection → normalization → storage → KPIs → API) that turns
   those files into the payload defined in
   [`DASHBOARD-DATA-SPEC.md`](./DASHBOARD-DATA-SPEC.md).

Where the pipeline does not yet deliver the full contract, this document says so
explicitly in [§6 Contract gaps](#6-contract-gaps-current-state-vs-dashboard-data-spec).
The intent is to be a reliable map of what exists today, not a wish list.

## Reference documents

| Document | Role |
|---|---|
| `web/docs/DASHBOARD-DATA-SPEC.md` | **Target contract.** What `GET /api/dashboard` must return. |
| `web/docs/DASHBOARD-SCHEMA.md` | Earlier overview of the 13→5→1 model (superseded by DATA-SPEC for detail). |
| `tools/docker/verify.py` | Shipped format gate — per-tool required fields/types/predicates enforced by `verify`. |
| `tools/scanner-test/scripts/validation/SPEC.md` | Per-tool detection spec + processor matching matrix. Dev-only, not shipped. |
| `backend/processors/*.py` | Authoritative consumers — `try_match()` defines what each tool's output is read into. |

---

## 1. Architecture

```
  COLLECTOR (air-gapped image)               BACKEND                          DASHBOARD
 ┌──────────────────────────────┐   ┌──────────────────────────────────────────┐   ┌──────────┐
 │ targets.yaml ─┐              │   │                                          │   │          │
 │               ▼              │   │   processors/   try_match() per file      │   │  portal  │
 │ 14 scanner tools run         │   │   ────────────────────────────▶ normalized│   │  (JS UI) │
 │  (real CLIs, no mocks)       │   │                                          │   │          │
 │               │              │   │   writer.py     stable IDs + section      │   │          │
 │   scan_results/<section>/*.json ────▶ KPIs → Firestore sections              │   │          │
 │    (this doc §2)             │   │                 kpi_engine.py  aggregate  │   │          │
 └──────────────────────────────┘   │                 backlog.py    remediation │   │          │
                                    │                 routes/dashboard.py  API  ────▶  GET    │
                                    └──────────────────────────────────────────┘   │          │
                                                                                   └──────────┘
```

Data flows one way. Every raw tool file is a **source of truth** for the backend;
the dashboard never reads scan files directly.

### Status of each stage

| Stage | File(s) | Status |
|---|---|---|
| Collector emits real JSON | scripts in `tools/scanner-test/scripts/` + vendored tool CLIs | ✅ live, no mocks |
| Format gate | `tools/docker/verify.py` | ✅ shipped, enforces required fields |
| Detection + normalization | `backend/processors/*.py` | ✅ all 13 shipped tools match (data section has no scanner) |
| Persist section to Firestore | `backend/writer.py` | ⚠️ persists findings + KPIs only (see §6) |
| KPI computation | `backend/kpi_engine.py` | ⚠️ field-name mismatches (see §6) |
| Dashboard API | `backend/routes/dashboard.py` | ✅ reads latest scan, sections, backlog, standards |

---

## 2. What the collector produces (the source)

Every tool writes one JSON file per run. **Single-target runs** keep the exact
filename the backend expects; **multi-target runs** slug it (`<file>-<slug>.json`)
so runs don't overwrite each other.

A tool with **no targets configured** — or an **unreachable target** — writes an
honest skipped record instead of fabricating data:

```json
{ "tool": "sslyze", "status": "skipped", "reason": "no network hosts configured" }
```

`verify` renders these as **SKIPPED** and still exits 0. Every tool emits either a
real scan or a skipped record — never canned output.

### 2.1 Network — `scan_results/network/`

| Tool | File | Real top-level shape | Key fields |
|---|---|---|---|
| **sslyze** | `sslyze-scan.json` | `server_scan_results[]` (v6) or `"host:port"` keys (legacy) | `server_location.{hostname,port,ip_address}`; `scan_result.{tls_1_0_cipher_suites … tls_1_3_cipher_suites, certificate_info, elliptic_curves, heartbleed, robot, session_renegotiation}` |
| **testssl.sh** | `testssl-scan.json` | `scanResult[]` flat or nested | flat: `{id, severity, finding, ip, port, cve}`; nested: `{targetHost, ip, port, protocols, ciphers, pretest, vulnerabilities}` |
| **certigo** | `certigo-chain.json` | `certificates[]` + `tls_connection` + `verify_result` | per cert: `pem, subject, issuer, serial, not_before, not_after, signature_algorithm, key_usage` |
| **CryptoLyzer** | `cryptolyzer-scan.json` | flat or nested | flat: `target, versions, ciphers, curves, dhparams, extensions, pubkeyreq, pubkeys, sigalgos, simulations, vulns`; nested: `results/protocols.{tls,ssh,ipsec}` |

### 2.2 Code — `scan_results/code/`

| Tool | File | Real top-level shape | Key fields |
|---|---|---|---|
| **semgrep** | `semgrep-results.json` | `{results[], version, paths, errors}` | per result: `check_id, path, start, end, extra.{message, severity, metadata}` |
| **pqaudit** | `pqaudit-results.json` | `{findings[], version, verdict}` | per finding: `algorithm, confidence, ruleId, severity, location/file, false_positive` |
| **acdi** | `acdi-code.json` | CycloneDX `{bomFormat:"CycloneDX", specVersion, metadata.tools[].name:"acdi", components[]}` | per component: `type:"cryptographic-asset", name, cryptoProperties, properties.[name=acdi:quantum_safe|acdi:hndl_risk|acdi:nist_level]` |

### 2.3 Infra — `scan_results/infra/`

| Tool | File | Real top-level shape | Key fields |
|---|---|---|---|
| **acdi** | `acdi-cbom.json` | CycloneDX (same as acdi-code) | same as above |
| **vault-audit** | `vault-audit.json` | `{scanner:"vault-audit", status, mounts, key_algorithms, auto_unseal, quantum_risk, findings}` | `mounts` dict `{path:{type,description,…}}`; `key_algorithms` `{path:{algorithm,quantum_safe}}`; `auto_unseal.{enabled,provider,kms_key_id}`; findings `{severity,finding,mount,remediation}` |
| **trivy** | `trivy-config.json` | `{Results[]}` | per result: `Target, Class, Type, MisconfSummary, Misconfigurations[]` with `{ID, Title, Severity, Description, Resolution, Status}` |

### 2.4 Data — `scan_results/data/`

**No scanner shipped.** The previous custom DB script (`db_crypto_scan.py` /
`db-crypto-scan.sh`) was removed — a hand-written client violates the HARD RULE
in `quantum/CLAUDE.md` (every scanner must be a real, open-source tool). The
Data & Storage section will run a real open-source tool when one lands
(research → validate → user sign-off → thin wrapper). Until then `scan data`
writes nothing; the backend processor for the section is deferred with it.

### 2.5 PKI — `scan_results/pki/`

| Tool | File | Real top-level shape | Key fields |
|---|---|---|---|
| **dnssec-scan** | `dnssec-scan.json` | `{results[], domains_scanned}` (new) or `{domains[]}` (legacy) | new: `{domain, dnssec_status, ksk, zsk, quantum_risk}`; legacy: `{domain, dnssec_enabled, ksk_algorithm, zsk_algorithm, quantum_risk}` |
| **certigo** | `certigo-inventory.json` | `certificates[]` (offline) | same cert fields as §2.1; **no** `tls_connection`/`verify_result` |
| **jwt-scan** | `jwt-scan.json` | `{scanner:"jwt-scan", status, algorithm_taxonomy, jwt_tokens[]}` (JWT-only; authority = jwt_tool) | jwt: `{token_source, header_algorithm, key_id, algorithm_class, quantum_risk}` |

### 2.6 Where to see real samples

- `tools/scanner-test/scan_results/` — outputs of the 13 real tools from the dev
  harness (`test-all-tools.sh`). No `data/` outputs — the DB section has no
  scanner yet.
- `web-swarm/website-swarm/tools/results/` — real scan data used by the assessment
  tools (some files predate the current schema).

---

## 3. The transform: from tool output to dashboard

### 3.1 Detection — `backend/processors/__init__.py`

Each uploaded/verify file is handed to `try_match(filepath, text)` in processor
order (`PROCESSORS`, **specific detectors first — first match wins**). A processor
returns a normalized dict or `None`; if all return `None`, the file is rejected
(`400 Unrecognized format`).

### 3.2 Normalized output per processor

Each processor maps the raw tool file to a normalized result. The writer consumes
this shape:

| Tool | Normalized result keys (what `try_match` returns) |
|---|---|
| sslyze | `tool, version, section, hosts_scanned, findings[]` (host info: `host, port, ip, tls_versions{}, certificate_info`) |
| testssl | `tool, version, section, total_checks, high_critical, findings[]` (`id, host, port, severity, finding, cve` — **HIGH/CRITICAL only**) |
| certigo | `tool, section (network|pki by filename), certificates_count, certificates[], tls_connection, verify_result` |
| cryptolyzer | `tool, section, findings[]` (raw blob wrapped in the array) |
| semgrep | `tool, version, section, findings_count, findings[]` (`check_id, path, start, end, severity, message`) |
| pqaudit | `tool, version, section, findings_count, false_positives, verdict, findings[]` (`algorithm, severity, confidence, location, notes, is_false_positive`) |
| acdi | `tool, version, section (code|infra by filename), findings_count, findings[]` (`algorithm, layer, quantum_safety, hndl_risk, file, evidence`) |
| vault-audit | `tool, version, section, mounts_count, vulnerable_mounts, data` (raw object) |
| trivy | `tool, section, findings_count, findings[]` (`id, title, severity, target, description`) |
| dnssec-scan | `tool, version, section, domains[]` (raw objects), `summary` |
| jwt-scan | `tool, version, section, status, jwt_tokens[]` (native, JWT-only) or `tokens[]`/`findings[]` (legacy) |

### 3.3 Stable finding IDs — `kpi_engine.stable_id()`

Every normalized finding gets a reproducible ID so a rescan of the same asset
produces the same ID (enables backlog status auto-transitions):

| Section | ID pattern | Example |
|---|---|---|
| network | `net:{host}:{port}:{key_algorithm}` | `net:api.example.com:443:ecdsa-p256` |
| code | `code:{location|file}:{algorithm}` | `code:src/auth.js:42:3des` |
| infra | `infra:{resource|mount}:{algorithm}` | `infra:vault:pki:rsa-2048` |
| data | `data:{host}:{engine}:{key_wrapping}` | `data:db-prod-01:PostgreSQL:rsa-2048` |
| pki | `pki:{domain|host}:{algorithm}` | `pki:example.com:ecdsa-p256` |

IDs are lower-cased and spaces become hyphens. IDs are assigned at write time in
`writer.write_section` for any finding missing one.

### 3.4 Section KPIs — `kpi_engine.compute_section_kpis()`

Computed per section at write time from the normalized result (hosts/certificates/
databases arrays **plus** findings):

| Section | KPIs | Reads |
|---|---|---|
| network | `tls13_rate, pqc_kex_rate, classical_tls_rate, cert_vulnerable_rate, cve_critical_count, endpoints_scanned` | `hosts[].{tls_version,pqc_status,cert_algorithm}`, findings w/ `cve` |
| code | `findings_total, false_positives, false_positive_ratio, critical_high_count, repos_scanned` | findings `{severity,is_false_positive}` |
| infra | `assets_scanned, vulnerable_keys, container_critical` | findings `{risk_level,algorithm,category}` |
| data | `servers_scanned, tde_coverage, rsa_wrapped_keys, conn_tls13_rate, encrypted_columns_total` | `databases[].{tde_enabled,key_wrapping,conn_tls,encrypted_columns}` |
| pki | `certs_scanned, certs_vulnerable, cert_vuln_rate, expiring_30d, dnssec_vulnerable` | `certificates[].{quantum_risk,expiry}`, findings `{type,risk}` |

Cross-section KPIs (`findings_total, critical, high, by_layer`) are summed from all
sections' findings in `aggregate_cross_section_kpis()`.

### 3.5 Storage — `writer.py`

`write_section(uid, scan_id, processor_result)`:
1. assigns stable IDs to `findings`,
2. computes section KPIs,
3. writes `sections/<section>` = `{status:"scanned", tool, findings, kpis, written_at}`,
4. appends an audit entry.

`finalize_scan()` marks the scan complete, aggregates cross-section KPIs, builds the
**backlog** from findings (`_build_backlog`: severity → priority P0–P3, stable ID,
asset, action, deadline, `status:"todo"`, history), and merges with the previous
scan's backlog to auto-transition statuses (`done`→`todo` when a finding reappears,
`todo`→`done` when it disappears).

### 3.6 Dashboard API — `routes/dashboard.py`

`GET /api/dashboard` (Bearer Firebase token) → reads the user's **latest** scan and
returns `{meta, kpis, sections, backlog, standards}`. Sections never scanned return
`{status:"locked", findings:[], kpis:{}}`. `standards` are looked up by the user's
region (`us|jp|eu|cn`) with a US fallback.

The full response contract is `web/docs/DASHBOARD-DATA-SPEC.md`.

---

## 4. Worked example — one database, end to end

**No DB scanner ships yet** (the custom `db-crypto-scan` script was removed; see
§2.4). This section will be written once the open-source DB tool lands and is
validated end to end. The backend contract for the data section (stable ID scheme
`data:{host}:{engine}:{key_wrapping}`, KPIs `servers_scanned/tde_coverage/
rsa_wrapped_keys/conn_tls13_rate/encrypted_columns_total`) remains defined in §3
for that integration.

---

## 5. Cross-cutting notes

- **Skipped records** — any tool with nothing to scan emits `{tool, status:"skipped", reason}`.
  `verify` accepts it as a pass (SKIPPED, exit 0). The backend currently **does not
  persist skipped records** (§6, G-4).
- **Traceability** — processors extract `tool` from the module name, not the data.
  A `version` field in the data is a customer-facing requirement for dashboard
  attribution; `inject_version` in the collector stamps real versions onto tools
  whose raw JSON omits one (cryptolyzer, pqaudit).
- **Multi-target slugging** — 2+ targets per tool produce `-<slug>.json` files;
  the exact backend filename is preserved for single targets. `verify` only
  exact-matches filenames today (§6, G-5).
- **Data & Storage** — no scanner shipped; the custom DB script was removed and
  the section awaits a real open-source tool (§2.4).

---

## 6. Contract gaps (current state vs `DASHBOARD-DATA-SPEC`)

The pipeline above is what exists today. The following are **known** discrepancies
between what runs and what the dashboard spec describes. Tracking them here keeps
the gap visible; none of these are silently masked.

| # | Gap | Where | Impact | Fix direction |
|---|---|---|---|---|
| G-1 | Writer persists **only** `findings` + `kpis` per section. The `hosts`, `databases`, `certificates`, `domains`, `mounts`, `data` arrays the processors carry are **dropped**. | `writer.py write_section` | Dashboard API cannot show `network.hosts[]`, `data.databases[]`, `pki.certificates[]` even though DATA-SPEC lists them | Persist the asset arrays alongside findings |
| G-2 | Several processors emit **no normalized `findings`** (certigo, vault-audit, dnssec, cryptolyzer, jwt native). Their rich data is wrapped (`data`/`domains`/`certificates`) instead. | `processors/*.py` | Backlog + aggregate KPIs (`findings_total`, `critical`, `high`, `by_layer`) undercount or read zero for those sections | Emit normalized findings from vault/dnssec/certigo outputs |
| G-3 | **KPI field-name mismatch.** `kpi_engine` reads flat names (`tde_enabled`, `key_wrapping`, `conn_tls`, `tls_version`, `pqc_status`, `cert_algorithm`) but the live tools emit nested names (`tde.enabled`, `column_encryption.key_wrapping`, …). | `kpi_engine.py` vs §2 | `tde_coverage`, `rsa_wrapped_keys`, `tls13_rate`, `pqc_kex_rate`, `cert_vulnerable_rate` compute to 0 despite real findings | Normalize to flat field names in the processors, or align the KPI readers |
| G-4 | **Skipped records are not persisted** by the backend processors — a `status:"skipped"` file still fails detection and drops to manual review. | `processors/*.py` | Honest "nothing to scan" becomes a dashboard gap, not a tracked state | Add a skipped-record path in the writer |
| G-5 | **Multi-target slugged files** (`acdi-cbom-<slug>.json`) are not recognized by `verify.py`'s exact-filename check. | `verify.py` | 2+ targets → tool reported MISSING (exit 1) on verify | Make verify glob the `<base>-<slug>.json` variant |
| G-6 | **Latest-scan ordering uses `meta.date`** but the writer sets `meta.scan_date`. | `routes/dashboard.py _get_latest_scan` vs `writer.py` | With multiple scans, "latest" can resolve to the wrong scan | Align the field name |
| G-7 | No data-section outputs at all — the custom DB scanner was removed and no open-source DB tool is integrated yet. | collector | `sections.data` stays empty/unscanned | Re-base Data & Storage on an open-source DB tool (research → validate → sign-off → wrapper) |

## 7. Canonical sources

- Collector scripts (single source of truth, synced into the image by `tools/docker/sync.sh`):
  `tools/scanner-test/scripts/` (`vault-audit.sh`, `jwt-scan.sh`, `dnssec-scan.sh`).
- Tool catalog (install/run/expected_output): `tools/scanner-test/tools.json`.
- Format gate: `tools/docker/verify.py`, `tools/docker/targets.schema.json`.
- Backend: `backend/processors/`, `backend/writer.py`, `backend/kpi_engine.py`,
  `backend/routes/`.
- Target contract: `web/docs/DASHBOARD-DATA-SPEC.md`.
