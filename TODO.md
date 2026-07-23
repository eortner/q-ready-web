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
| P0 | Sign-up / Auth | Not started — FastAPI + SQLite planned |
| P0 | Scanner engine (qreadiness skill) | SKILL.md built, tools.json built, not tested |
| P0 | Upload endpoint | Not started |
| P1 | Dashboard (client-facing) | Partially built — needs API integration to replace mock data |
| P1 | Payment gateway | Skipped for beta |
| P2 | Email alert system | Skipped for beta |
| P2 | Newsletter engine | Skipped for beta |

## Backend architecture (FastAPI + SQLite → Postgres)

### Stack

- **FastAPI** — async Python, OpenAPI docs built-in
- **SQLAlchemy** — ORM, works with SQLite now, Postgres via Alembic later
- **aiosqlite** — async SQLite driver
- **python-multipart** — file uploads
- **Single entry:** `uvicorn app:app` — one command

### Directory

```
quantum/
├── web/                # Frontend (already built)
├── backend/            # NEW
│   ├── app.py          # FastAPI entry point
│   ├── models.py       # SQLAlchemy models
│   ├── database.py     # DB connection, session
│   ├── routes/
│   │   ├── auth.py     # Signup, token validation
│   │   ├── scan.py     # Upload, status, results
│   │   └── config.py   # Bootstrap config download
│   └── requirements.txt
├── scanner-skeleton/   # Public GitHub repo (built)
└── scanner-test/       # Skill testing sandbox (built)
```

### API endpoints

| Method | Path | Beta | Production |
|--------|------|------|------------|
| POST | `/auth/signup` | Returns token instantly | Adds email verification |
| POST | `/auth/validate` | Checks token exists + active | Same, adds rate limiting |
| GET | `/bootstrap/config` | Returns tools.json | Encrypted for paid tiers |
| POST | `/scan/upload` | Accepts zip, stores to disk | Stores to S3 |
| GET | `/scan/{id}/status` | Returns processing status | Same |
| GET | `/scan/{id}/results` | Returns JSON for dashboard | Same |

### Data model

```
users:
  id, email, name, industry, created_at, tier (free/pro/enterprise)

tokens:
  id, user_id, token (UUID), created_at, expires_at, active (bool)

scans:
  id, user_id, token_id, status, uploaded_at, results_json

scan_sections:
  scan_id, section (network/code/infra/data/pki), target, tool_output
```

### Beta flow

```
User signs up → gets UUID token → runs qreadiness skill with token →
scans targets → uploads results → backend stores → dashboard reads API
```

## Scanner platform

| Component | Status |
|-----------|--------|
| `scanner-skeleton/` | PROMPT.md, tools.json, EULA, README built. Not pushed |
| `scanner-test/` | SKILL.md with qready-* commands. Not tested live |
| DB crypto scripts | SQL queries documented, not written |
| 5-section tools | 14 tools mapped across network/code/infra/data/pki |

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
