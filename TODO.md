# Q-Readiness — Current State & Next Steps

**Updated: 2026-08-05**

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

## What's done (infrastructure)

| Component | Status |
|-----------|--------|
| Firebase Auth (email/password) | Live — signup, login, email verification |
| Firestore | Live — test mode, security rules written (not deployed) |
| Frontend: login.html, signup.html | Live |
| Cloud Run: FastAPI backend scaffold | Built — 13 processors, 2 upload paths |
| Data schema | Defined — docs/DASHBOARD-SCHEMA.md |
| Scanner skill (qreadiness) | Built in tools/scanner-test/ |

## What's NOT built

| Priority | Component | Status |
|----------|-----------|--------|
| P0 | Dashboard → API integration (replace mock data) | Schema defined, not wired |
| P0 | Firestore security rules deployed | Written, not deployed |
| P0 | Email verification — password policy in Firebase Console | Not configured |
| P1 | Backend: processor → Firestore write path | Not built |
| P1 | Backend: dashboard API reads from Firestore | Route exists, reads nothing |
| P1 | Scanner end-to-end test | Not tested |
| P1 | Onboarding questionnaire | Not built |
| P2 | Payment (Stripe) | Skipped for beta |
| P2 | Email alerts + newsletter | Skipped for beta |

## Data architecture (current — 2026-08-05)

### Schema contract

Documented at `docs/DASHBOARD-SCHEMA.md`. 13 tools → 5 sections → 1 dashboard API response.

### Firestore structure (per user, per scan)

```
users/{uid}/
├── profile: { email, name, industry, tier, region, created_at }
└── scans/{scanId}/                    ← immutable per scan
    ├── meta: { date, status, tier }
    ├── kpis: { endpoints_scanned, pqc_ready, findings_critical... }
    ├── sections/
    │   ├── network:  { status, hosts[], findings[], kpis }
    │   ├── code:     { status, findings[], kpis }
    │   ├── infra:    { status, findings[], kpis }
    │   ├── data:     { status, databases[], kpis }
    │   └── pki:      { status, certificates[], findings[], kpis }
    └── backlog: [...]
```

### Regional split (multi-cloud)

- `europe-west1` — EU customers
- `us-central1` — Americas customers
- User `profile.region` set at signup
- Backend routes to correct regional Firestore
- No cross-region queries. No data mixing.

### Section states

| State | Dashboard shows |
|-------|----------------|
| `locked` | Blurred card, "Run free scan" CTA |
| `scanned` | Active section with findings + KPIs |
| `limit_reached` | "Upgrade to scan more" |

---

## Current sprint — Dashboard + Backend integration

### Phase 1: Backend write path (processor → Firestore)

- [x] 1.1 Write Firebase Admin SDK init in backend (service account, region routing)
- [x] 1.2 Per-section Firestore write: processor output → `users/{uid}/scans/{scanId}/sections/{section}`
- [x] 1.3 KPI aggregation: compute cross-section KPIs after all sections processed
- [x] 1.4 Backlog derivation: generate P0-P3 backlog from findings
- [ ] 1.5 Raw file backup to Cloud Storage (for audit/replay)
- [ ] 1.6 Test: upload real tool output → verify Firestore document

### Phase 2: Dashboard API (Firestore → frontend)

- [x] 2.1 `GET /api/dashboard` — reads latest scan, returns full schema
- [x] 2.2 `GET /api/dashboard/{section}` — returns single section
- [x] 2.3 Firebase ID token validation in backend (replace placeholder)
- [x] 2.4 Empty state: user has no scans → all sections return `{status: "locked"}`
- [ ] 2.5 Test: curl with real token → verify JSON matches schema

### Phase 3: Dashboard frontend (API → UI)

- [x] 3.1 Remove all mock/inline data from dashboard.html
- [x] 3.2 Section cards: locked → blurred with CTA. Scanned → active with data.
- [x] 3.3 KPI row: computed from API response (not hardcoded)
- [x] 3.4 Charts: severity donut + layer bar from real data
- [x] 3.5 Findings tables: populated from section findings array
- [x] 3.6 Backlog table: populated from API backlog array
- [x] 3.7 Error state: backend unreachable → "Data not available"
- [ ] 3.8 Test: sign up → (no scans) → dashboard shows all locked sections

### Phase 4: Security hardening

- [ ] 4.1 Deploy firestore.rules via Firebase CLI
- [ ] 4.2 Configure password policy in Firebase Console
- [ ] 4.3 Test: try reading another user's data → denied
- [x] 4.4 Remove all console.log from auth pages

### Phase 5: End-to-end

- [ ] 5.1 Sign up → verify email → see locked dashboard
- [ ] 5.2 Run scanner → upload → dashboard updates with real data
- [ ] 5.3 Second user signup → data isolated from first user
- [ ] 5.4 Backend down → dashboard shows error state, no mock data

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
