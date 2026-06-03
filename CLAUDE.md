# CLAUDE.md

## Core business

Q-Readiness assesses quantum susceptibility across 14 cryptographic layers. Three domains: PQC, Quantum Networking, Optimization & ML. Deliverable: readiness score, findings, remediation backlog — NIST-aligned, CNSA 2.0 compliant, 2.5 weeks.

## HNDL — the central risk

Harvest Now, Decrypt Later. Adversaries collecting encrypted data since ~2015. Window closes ~2035. Every month of delay = more captured data. The business urgency.

## Quantum timeline — priority rubric (HARD RULE)

- P0 (HNDL-urgent, 3 months): Keys protecting data with >5yr retention crossing public networks. KMS wrapping PHI, DB TDE with long retention, TLS for sensitive data in transit.
- P1 (CNSA 2.0, Jan 2027): Software/firmware signing, defense contractor systems.
- P2 (NIST deprecation, Jan 2030): Internal PKI, code signing, SSH CAs, internal certs.
- P3 (NIST removal, Jan 2035): DNSSEC, short-lived tokens, internal-only. Normal refresh cycles.
- NEVER label P0 just because algorithm is quantum-vulnerable. Ask: "Is data being harvested under this key today?"

## Data inventory

Real scan data (tools we ran, May 2026): `../web-swarm/website-swarm/tools/results/`
- `surveyor-scan.json` — 4 TLS endpoints
- `pqc-network-scan-20260506-193303.json` — 4 certificate chains
- `cbom.json` — 6 code crypto findings (5 false positive, 1 safe)
- `pqaudit-results.json` — 9 pqaudit findings
- `cryptoscan-results.json` — 150+ CryptoScan findings

Mock data (matching real tool output schemas):
- `acdi-cbom-20260506.json` — 12 findings (IaC, JWT, PKI, code signing)
- `testssl-20260506.json` — 3 endpoints, 20 findings, 15+ CVE checks
- `pqcleo-tls-bench-20260506.csv` — 6 algorithm combinations, connections/sec
- `db-crypto-scan-20260506.json` — 4 databases, 3 engines, TDE + column encryption
- `vault-audit-20260506.json` — 6 Vault mount points, key algorithms
- `dnssec-scan-20260506.json` — 3 domains, KSK/ZSK algorithms

Tool catalog: `../web-swarm/website-swarm/TOOLS-MISSING.md`

## Dashboard rules (NON-NEGOTIABLE)

- Dashboard is a data tool. NOT a consulting report. NOT a marketing page.
- NO callout boxes. NO explanatory prose. NO countdown clocks. NO emoji.
- Every data point MUST trace to a file in `tools/results/` with tool name + version.
- Every chart backed by tool data. No internet/external data in graphs.
- KPIs show N (sample size) and severity distribution. Never a single aggregate number.
- Three tabs via side nav: Dashboard, Inventory, Actions. KPI row always visible. PDF export.
- Use CSS classes from `css/styles.css`. Design tokens only. No raw hex/rgba.
- Source tool attribution on every section.

## Behavioral rules

- Edit existing files with Edit tool. Write only for new files from scratch.
- Ask before any change spanning more than 50 lines.
- One change per turn. Confirm before continuing.
- NEVER change `css/styles.css` or `index.html` design without explicit approval.

## Reference files

- `TODO.md` — current state, next actions, 14-layer map, DB discovery queries
- `README.md` — full knowledge base, sibling directory map
- `concept.md` — design rationale, compliance (no newsletter, no Chicago references)
- `../web-swarm/website-swarm/TOOLS-MISSING.md` — missing tools, deploy instructions
- `../web-swarm/website-swarm/TOOLS.md` — deployed tools, what each detects
