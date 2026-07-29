# Q-Readiness — Current State & Next Steps

**Updated: 2026-06-11**

## What's deployed (front-end)

| Page | Status | Notes |
|------|--------|-------|
| `index.html` | Live | Hero, 5 BOM cards, How It Works, Who We Are, Pricing teaser, i18n-ready |
| `pricing.html` | Live | 5-tier matrix (Free→Custom) |
| `faq.html` | Live | 14 new Q&As |
| `dashboard.html` | Live | 3-tab data dashboard, 12 tools, P0-P3, PDF export |
| `standards.html` | Live | US/EU/China/Japan |
| `news.html` | Live | 7 articles |
| `quantum-status.html` | Live | Timeline |
| `js/i18n.js` | Live | Translation engine, language dropdown on all pages |
| `locales/en.json` | Live | English strings |
| `locales/ja.json` | Live | Japanese strings |

**Known issues:** Styling errors from rapid changes, overlay navs missing Pricing link, responsive breakpoints untested.

## What's NOT built (infrastructure)

| Priority | Component | Status |
|----------|-----------|--------|
| P0 | Firebase Auth + Firestore setup | Not started |
| P0 | Frontend: login/signup pages | Not started |
| P0 | Cloud Run: FastAPI ingestion backend | Not started |
| P0 | Scanner skill integration with token | SKILL.md built, needs Firestore ID token |
| P1 | Two-path upload (structured + raw) | Not started |
| P1 | Auto-detection processors (14 tools) | Schemas documented, code not written |
| P1 | Dashboard API (Firestore → dashboard) | Partially built — needs API integration |
| P1 | MCP server for AI integration | Not started |
| P2 | Docker image (all 14 tools) | Future |
| P2 | Payment integration (Stripe/Paddle) | Skipped for beta |
| P2 | Email alert system | Skipped for beta |
| P2 | Newsletter engine | Skipped for beta |
| P2 | ONNX fine-tuned model (V2) | Future |

## Backend architecture (Firebase + Cloud Run)

### Why this stack

- **Firebase Auth** — SOC 2 / ISO 27001 certified. No custom auth to audit.
- **Firestore** — Serverless, free tier, same certified infra.
- **Cloud Run** — FastAPI container, free tier, scales to zero.
- **All free tier.** One bill: $0 until meaningful scale.

### Stack

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Frontend    │────▶│  Firebase    │◀────│  Cloud Run      │
│  (static)    │     │  Auth +      │     │  (FastAPI)      │
│              │     │  Firestore   │     │                 │
│  login/      │     │              │     │  POST /ingest   │
│  signup/     │     │  users/      │     │  GET /dashboard │
│  dashboard   │     │  scans/      │     │                 │
│              │     │  results/    │     │  processors/    │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                                         │
       │              ┌─────────────┐             │
       └──────────────│  Skill +    │◀────────────┘
                      │  MCP server │   POST /scan/upload
                      │  (GitHub)   │   POST /scan/upload-raw
                      └─────────────┘
```

### Directory

```
quantum/
├── web/                  # Frontend (already built)
├── backend/              # Cloud Run FastAPI service
│   ├── app.py            # Entry point
│   ├── routes/
│   │   ├── ingest.py     # POST /scan/upload (structured) + /scan/upload-raw (unstructured)
│   │   └── dashboard.py  # GET /api/dashboard → Firestore results
│   ├── processors/       # Auto-detect + normalize tool output
│   │   ├── __init__.py   # Dispatch: try all processors, find match
│   │   ├── surveyor.py
│   │   ├── pqcscan.py
│   │   ├── testssl.py
│   │   ├── cryptoscan.py
│   │   └── ...           # One per tool (14 total)
│   ├── firebase_config.py
│   ├── Dockerfile
│   └── requirements.txt
├── qreadiness-skill/     # Users download this (public)
│   ├── SKILL.md
│   └── tools.json
├── scanner-skeleton/     # Public GitHub repo (built)
└── docker/               # Future: all tools in one image
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/scan/upload` | AI-guided — validated JSON, instant processing |
| POST | `/scan/upload-raw` | Manual/Docker — any format, auto-detection |
| GET | `/api/dashboard` | Dashboard data from Firestore |
| GET | `/api/dashboard/{section}` | Per-section results |

Auth: Firebase ID token in `Authorization: Bearer <token>` header. Cloud Run validates it against Firebase Auth.

### Two-path ingestion

```
PATH A (AI-guided)                 PATH B (Manual/Docker)
Structured JSON                    ZIP of mixed tool outputs
→ Schema validated                 → Auto-detection engine
→ Instant store                    → Each file: try all processors
→ Firestore                        → First match wins → normalize
                                   → No match → manual review queue
                                   → Firestore
```

### Auto-detection engine

Each file tested against every processor's `try_match()`:
- surveyor → matches `schema_version: "1.0"` + `report_kind: "tls_scan"`
- pqcscan → matches TLS/SSH PQC algorithm fields
- testssl → matches `scanResult` array with `id`/`severity`/`cve`
- pqaudit → matches `findings` with `algorithm`/`confidence`/`snippet`
- cryptoscan → matches CryptoScan CBOM format
- ... (14 processors)

First match wins. All processors fail → file goes to manual review queue. Same normalized output schema regardless of source.

### Data model (Firestore)

```
users/{uid}:
  email, name, industry, questionnaire{...}, tier, created_at

users/{uid}/tokens/{token_id}:
  token, created_at, expires_at, active

users/{uid}/scans/{scan_id}:
  status, uploaded_at, source (ai/manual), file_url

users/{uid}/scans/{scan_id}/sections/{section}:
  section (network/code/infra/data/pki),
  target, findings: [...], raw_output
```

### Beta flow

```
User visits site → logs in via Firebase Auth →
gets dashboard with "Run your first scan" CTA →
downloads qreadiness skill from GitHub →
runs scan (AI or manual) → uploads to Cloud Run →
auto-detection processes → results in Firestore →
dashboard refreshes with real data
```

## Scanner platform

| Component | Status |
|-----------|--------|
| `scanner-skeleton/` | PROMPT.md, tools.json, EULA, README built. Not pushed |
| `scanner-test/` | SKILL.md with qready-* commands. Not tested live |
| DB crypto scripts | SQL queries documented, not written |
| 5-section tools | 14 tools mapped across network/code/infra/data/pki |

## Beta build plan (ordered, 13 steps)

### Phase 1: Auth foundation

**Step 1 — Firebase project setup**
- Create project in Firebase Console
- Enable Email/Password auth
- Enable Firestore (europe-west1 or closest)
- Create Firestore indexes for queries
- Generate web app config object
- Deploy security rules (users read/write own data only)
- Owner: Claude Code — needs Firebase console access
- Est: 30 min

**Step 2 — Login + Signup pages**
- Create `login.html` with Firebase SDK
- Create `signup.html` with Firebase SDK
- On signup: create user in Firestore `users/{uid}` with email, name, industry, tier=free
- On login: redirect to dashboard
- Wire nav button "Sign Up" to `/signup.html`
- Load Firebase SDK from CDN (no bundler needed)
- Est: 2 hours

**Step 3 — Auth validation across all pages**
- Add `onAuthStateChanged` check to dashboard.html
- Unauthenticated users redirected to login
- Authenticated users see their data
- Nav shows "Sign Out" when logged in
- Est: 1 hour
- ⚠️ Wait for Step 1 Firebase config

### Phase 2: Dashboard data

**Step 4 — Dashboard reads from Firestore**
- Replace `dashboard-data.js` mock with Firestore queries
- `users/{uid}/scans/{latest_scan_id}/sections/` → renders each section
- Section exists → show data. Section missing → show locked CTA
- KPI cards computed from Firestore aggregation
- Est: 2 hours

**Step 5 — Dashboard section unlock**
- Each locked section shows "Run this scan" button
- Shows which tool(s) to run and free tier limit
- Links to download page for qreadiness skill
- Est: 1 hour

### Phase 3: Ingestion backend (Cloud Run)

**Step 6 — FastAPI scaffold**
- Create `backend/` directory
- `app.py` with Cloud Run health check
- `Dockerfile` for Cloud Run deploy
- `requirements.txt`: fastapi, uvicorn, firebase-admin, python-multipart
- Est: 1 hour

**Step 7 — Structured ingestion** (`POST /scan/upload`)
- Accepts validated JSON matching our schema
- Firebase Admin SDK: verify ID token from Authorization header
- Store to Firestore: `users/{uid}/scans/{scan_id}/sections/{section}`
- Enforce tier limits: count user's monthly units, reject if exceeded
- Est: 3 hours

**Step 8 — Unstructured ingestion** (`POST /scan/upload-raw`)
- Accepts any file (zip, JSON, CSV, mixed)
- Auto-detection engine: try each processor, first match wins
- Build processors for at least 4 tools first (surveyor, pqcscan, testssl, cryptoscan)
- Falls back to manual review queue on no match
- Est: 4 hours

**Step 9 — Dashboard API** (`GET /api/dashboard`)
- Reads from Firestore per user
- Returns same shape as current `dashboard-data.js`
- Compute KPIs: endpoints scanned, PQC adoption, severity distribution
- Est: 2 hours

**Step 10 — Deploy to Cloud Run**
- Build container, push to Artifact Registry
- `gcloud run deploy qreadiness-backend --region europe-west1 --allow-unauthenticated`
- Set env: `FIREBASE_SERVICE_ACCOUNT`, `MCP_TOKEN`
- Est: 1 hour

### Phase 4: Scanner integration

**Step 11 — Add token to qreadiness skill**
- Update SKILL.md: after scan, upload to Cloud Run with Firebase token
- Add upload commands to skill workflow
- Test manually: run scan → upload → check Firestore
- Est: 2 hours

**Step 12 — Download page for scanner**
- Create `/download.html` — how to get the skill, install instructions
- Link from dashboard locked sections
- Est: 1 hour

### Phase 5: End-to-end test

**Step 13 — Full flow test**
- Sign up → log in → dashboard shows empty locked sections
- Download skill → run network scan → upload
- Dashboard unlocks network section with real data
- Record: what broke, what needs polish
- Est: 3 hours

---

## Design issues to fix

- [ ] Styling errors from rapid homepage changes
- [ ] Overlay navs missing Pricing link on some pages
- [ ] i18n data-i18n attributes missing on new sections
- [ ] Responsive breakpoints for 5-card BOM grid

## Reference files

- `CLAUDE.md` — Behavioral rules, quantum timeline, dashboard constraints
- `README.md` — Full knowledge base, sibling directory map
- `.claude/rules/dashboard.md` — Dashboard-specific rules
- `.claude/rules/index.md` — Marketing page rules
- `.claude/skills/qreadiness/SKILL.md` — Scanner skill
- `.claude/skills/ui-ux-pro-max/` — UI/UX design intelligence
- `docs/KPI-DEFINITIONS.md` — Investor-ready KPI document
- `scanner-test/SECTIONS.md` — 5-section business model
- `scanner-test/STATUS.md` — Previous session state
- `../scanner-skeleton/` — Client-side orchestration repo
- `../web-swarm/website-swarm/TOOLS-MISSING.md` — Tools gap analysis
- `../web-swarm/website-swarm/Q-READINESS-MASTER-PROPOSAL.md` — Business model, pricing
