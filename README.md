# Q-Readiness — Web Portal Knowledge Base

## What this project is

Public-facing website for Q-Readiness, a premium quantum readiness assessment consulting service. The site serves as both marketing and a client portal. Target audience: enterprise decision-makers (CISOs, CTOs, security architects) at regulated enterprises, defense contractors, healthcare systems, and financial institutions.

## Project structure

```
web/
├── index.html             Main landing page (hero, evaluate, dashboard preview, methodology, timeline, intel, contact)
├── dashboard.html         Client data dashboard (3 tabs: Dashboard, Inventory, Actions)
├── quantum-status.html    Full quantum timeline page with countdown clocks and timeline visualization
├── css/styles.css         Complete design system (~1900 lines, BEM naming, CSS custom properties)
├── js/main.js             Shared vanilla JS IIFE (~770 lines, 14 feature modules)
├── js/dashboard-data.js   Data model for dashboard (real scan data + computed KPIs)
├── concept.md             Design rationale document (typography, color, motion philosophy)
├── CLAUDE.md              Guidance for AI agents working in this repo
├── README.md              This file
└── TODO.md                Implementation plan for dashboard restoration
```

## Sibling directories

- `../course/` — Quantum engineering course materials (PQC, TLS/X.509, QKD, quantum networking, etc.)
- `../web-swarm/website-swarm/` — Business plans, methodology docs, assessment protocols, pricing, proposals, tools, and the original swarm-based design process. Key documents:
  - `Q-READINESS-MASTER-PROPOSAL.md` — Service offerings, pricing, industry matrix
  - `QUANTUM-RISK-CLASSIFICATION.md` — Tier 0-4 risk framework (the core intellectual framework)
  - `ASSESSMENT-PROTOCOLS.md` — Per-environment scan procedures (air-gapped, cloud, legacy, gov, startup)
  - `ANALYSIS-AND-STRATEGY.md` — Real benchmark data, visualizations, deliverable specs
  - `RESULTS-GUIDE.md` — How tool outputs aggregate into client reports
  - `TOOLS.md` — The 7 open-source scanners and what they detect
  - `METHODOLOGY.md` — Assessment methodology documentation
  - `tools/results/` — Real scan output files (cbom.json, surveyor-*.json, etc.)

## Design system (non-negotiable)

- **Fonts:** Cormorant Garamond (headings, `--font-display`), Inter (body, `--font-body`)
- **Colors:** Dark navy base `#0A0E17`, gold accent `#D4A043`, text hierarchy `#E8E4DA` → `#9A9585` → `#6B6658`
- **Motion:** All transitions use `cubic-bezier(0.65, 0, 0.35, 1)` (the "luxury curve"), 700-800ms reveals, 1.2s dashboard bar animations
- **Always respect:** `prefers-reduced-motion: reduce` — zero out all transitions and animations
- **Borders:** 0.5px gold-tinted dividers, `var(--color-border)` = `rgba(212, 160, 67, 0.15)`
- **Cards:** `var(--color-surface)` background (`#121826`), subtle borders, hover lift with shadow
- **Section backgrounds:** `--dark` (base), `--darker` (alt), `--deep` (darkest), plus `--grid` (dot pattern), `--striped` (diagonal), `--glow` (radial)
- **No emoji** in headers or content — undermines the premium consulting aesthetic
- **No raw CSS values** — always use design tokens (`var(--color-*)`, `var(--radius-*)`, `var(--transition-*)`, `var(--luxury-curve)`)
- **No newsletter language** — portal access is the delivery mechanism, not email subscriptions

## JS architecture

Single IIFE in `js/main.js` shared across all pages. Each feature module gates on DOM element presence. Key modules: countdown clocks, scroll-triggered nav, reveal animations (IntersectionObserver), dashboard bar animations, timeline visualization, mobile menu, contact form validation, smooth scroll, news card toggles, side navigation rail, sector selector, scroll-to-top button, urgency bar.

Dashboard-specific JS should be minimal — data rendering, print trigger, and chart rendering only. Do not duplicate nav/scroll/reveal logic.

## Business context for the dashboard

### The Q-Readiness assessment delivers to clients:

1. **Overall Quantum Readiness Score** (0-100 weighted composite)
2. **Domain scores** for PQC, Quantum Networking, and Optimization/ML
3. **Critical findings** — detailed vulnerability descriptions with affected assets, risk ratings, tool attribution
4. **Prioritized remediation backlog** — ranked by risk severity with effort estimates and target dates
5. **Compliance timeline** — countdown to regulatory deadlines

### Risk classification (Tier 0-4):

- **Tier 4:** Existential (nuclear C2, state root keys) — immediate action
- **Tier 3:** Strategic (IP, trade secrets, genetic data, defense/classified) — 6-18 months
- **Tier 2:** Material (PII, financial transactions, legal docs) — 12-36 months
- **Tier 1:** Cosmetic (credentials, documentation, email) — normal refresh
- **Tier 0:** Already expired (session keys, ephemeral) — no action

### Key differentiators:

- Fully open-source auditable toolchain (7 scanners, all on GitHub)
- Data stays in client environment
- AI classification eliminates 80-95% of false positives
- Air-gap capable (Q-Appliance with physically cut TX trace)
- 2.5 weeks vs. traditional 3 months
- NIST-aligned, CNSA 2.0 compliant

## Dashboard design intent

The dashboard is a **static strategic report** — a client-facing assessment deliverable that reads like a premium consulting document. It is NOT an interactive data explorer or BI tool.

**Core narrative flow:** HNDL urgency → Readiness Score → Where does my risk come from? (3 domains) → What are the specific problems? (Findings across PQC, Networking, Optimization) → What about my supply chain? (Vendor exposure) → What do I do? (Remediation backlog) → When are my deadlines? (Regulatory countdown) → What can't I fix yet? (Watch list) → What didn't we scan? (Assessment limitations)

**The dashboard covers three assessment domains, ~10 threat categories, and 14+ discovery layers.** Every technical term has an information icon with a tooltip definition. Every finding has drill-down evidence. The full section structure is documented in `TODO.md`.

**Current state:** The working copy of `dashboard.html` was rewritten by a previous AI agent and lost the original architecture. The `TODO.md` file documents the complete restoration and expansion plan.

## Quantum threat landscape (summary)

| Threat category | Domain | Time horizon | Dashboard section |
|----------------|--------|-------------|-------------------|
| Harvest Now, Decrypt Later | Cross-cutting | Right now | HNDL Callout (section 2) |
| Cryptographic Compromise | PQC | Now-2035 | Crypto Inventory (5), TLS Exposure (6) |
| PKI & Trust Collapse | PQC | Now-2035 | PKI & Trust (7) |
| Supply Chain Exposure | PQC | Ongoing | Supply Chain (8) |
| Regulatory Non-compliance | PQC | 2027-2035 | Regulatory Countdown (13) |
| Insurance & Liability | PQC | Ongoing | Insurance Note (16) |
| Quantum Networking Maturity | QN | 2028+ | QN Readiness (10) |
| Optimization Investment Risk | OM | 2028+ | OM Readiness (11) |
| Assessment Blind Spots | All | Ongoing | Scope & Limitations (17) |
