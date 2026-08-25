# Q-Readiness Homepage — Story & Redesign Plan

**Status:** agreed in principle — not yet implemented.
**Scope:** `index.html` (copy + section consolidation) + `locales/en.json` / `ja.json`.
**Hard constraint:** do not touch `css/styles.css`, the background, the nav, the countdown
clocks, the dashboard mockup, the news cards, or the existing scroll/reveal animations.

---

## 1. Core positioning

Q-Readiness is **proactive standards alignment**, not threat defense. The message is:
*align your cryptography with post-quantum standards before the deadlines force a rushed
migration.* The urgency is the **schedule** (CNSA 2027, NIST deprecation 2030, NIST removal
2035), not an imminent attack.

Two things coexist without contradiction:

- **Harvest Now, Decrypt Later (HNDL)** is a real, present risk — it stays, but lives in
  the "why now / the stakes" section, not the hero.
- **A readiness assessment has two sides** (see §4): the **technical side** (the crypto
  inventory — what the scanners produce) and the **information side** (governance, risk,
  training, external engagement — what the questionnaire produces). Both are required for
  the assessment to be useful. *A BOM alone is data; the information side makes it a plan.*

---

## 2. The story — a journey, not a list

The page walks the visitor through their own path, first-person, with discovery and few words.

1. **Hero** — the promise: align with post-quantum standards before the deadlines.
2. **The Stakes** — the deadlines + HNDL ("why act now").
3. **Create Your Free BOM** — the five sections, open-source scanners.
4. **The Questionnaire** — the two-sides explanation + Stage-1 onboarding (skippable).
5. **Your Dashboard** — the value: score, backlog, deadlines.
6. **Stay Ready** — news & alerts (gated behind the full questionnaire).
7. **Contact** — start free (self-serve) + personalized service (white-glove).

---

## 3. Section by section — business & design decisions

| # | Section | Business decision | Design decision |
|---|---|---|---|
| 1 | **Hero** | One promise, one CTA. No HNDL, no framework list, no badge clutter. | Keep `.hero-quantum-viz` background + reveal. One headline, one line, one CTA. |
| 2 | **The Stakes** | The honest urgency: deadlines (2027/2030/2035) + HNDL as the present risk. | Keep `.countdown-clock` grid + `.hndl-callout`; fold the old 4 deadline cards into the timeline (no duplicate dates). |
| 3 | **Create Your Free BOM** | How you get the inventory: 5 sections, 16 open-source scanners, "one free scan per section", "every scanner is open-source — nothing hidden." | Keep the 5 `.evaluate-card` grid (hover lift, tool chips); tighten each card to title + one line. |
| 4 | **The Questionnaire** | Explain the two sides; Stage-1 onboarding is short and **skippable**. | Two-column: static 3-field mock + standards chips. No new components. |
| 5 | **Your Dashboard** | The payoff: "a raw inventory in a folder protects nothing; we turn it into a score, a fix-it plan, and your deadlines." | Keep `.dashboard-panel` terminal mockup (37/100, bars, priority actions) + animated bar fills; add deadline chips. |
| 6 | **Stay Ready** | Ongoing value: news & updates filtered to industry + location standards. Gated behind the full questionnaire. | Keep `.news-card` magazine layout; reframe heading. |
| 7 | **Contact** | Two paths: self-serve ("Start free") vs. white-glove ("Contact us for a personalized service"). Pricing appears only as a whisper. | Keep `.contact-form`; replace 4 service cards with the two choices. |

**Cut:** "How It Works" (the journey *is* the how-it-works), the pricing teaser (pricing
doesn't drive), the "Who We Are" team section (compliance violation), and the three
differentiator cards (fold the open-source line into BOM; drop the rest or keep a one-line
trust strip).

---

## 4. The questionnaire model

**Stage 1 — Free-tier onboarding (skippable).**
A couple of key questions — industry, region, environment — to personalize the basic
dashboard. You can skip it and still run the scan and get the score/backlog/deadlines.

**Stage 2 — Full readiness assessment (not skippable for News & Alerts).**
The remaining domains of the QRI (Governance, Risk Assessment, Training & Capability,
External Engagement). Must be completed to unlock the News & Alerts section, because
personalized alerts depend on the full readiness profile.

**The "two sides" framing (copy to use):**

> A quantum readiness assessment is only useful with both halves. The **technical side** is
> your cryptographic inventory — every key, certificate, and algorithm, and whether a
> quantum computer can break it. The **information side** is your governance, risk,
> training, and external dependencies — who's accountable, what your exposure is, who's
> trained, which vendors you rely on. A BOM alone is data; the information side makes it a
> plan.

Mapping: **Technology = technical side**; **Governance + Risk + Training + External =
information side.**

---

## 5. Alignment target — CSA Quantum Readiness Index (QRI)

**Source:** Singapore's Cyber Security Agency (CSA). A voluntary self-assessment
questionnaire that complements the **Quantum-Safe Migration Handbook**. Developed with
A\*STAR, evolutionQ, SGTech, SpeQtral, and the World Economic Forum. Public consultation
Oct–Dec 2025; **Quantum Readiness Index V1 released 16 July 2026.**

### The five domains (aligned with the WEF Quantum Readiness Toolkit)

1. **Governance** — institutionalise quantum risk management (policies, procedures,
   champions, resources).
   *Objectives:* formal governance structure; strategic quantum-safe roadmap; integrate
   quantum risk into existing cyber risk management; migration policies/frameworks.
2. **Risk Assessment** — identify crown jewels, prioritise critical business functions,
   support cryptographic asset management.
   *Objectives:* perform quantum risk assessments and prioritise affected assets/data;
   implement cryptographic asset management.
3. **Training and Capability** — educate stakeholders and develop competencies.
   *Objectives:* educate stakeholders on quantum risks; develop competencies to drive
   migration.
4. **External Engagement** — manage vendor/third-party/supply-chain risk, collaborate across
   the ecosystem, promote common standards.
   *Objectives:* evaluate and manage vendors; connect with ecosystem stakeholders; promote
   common standards/interoperability; contribute to the knowledge base and talent pool.
5. **Technology** — experiment and run proof-of-concepts to assess quantum-safe tech.
   *Objectives:* conduct technology experimentation and PoCs; instil agility for timely
   replacement of cryptographic algorithms.

### Readiness levels

Adapted from the **Capability Maturity Model Integration (CMMI, ISACA)**: four levels
**L0–L3**, assessed per objective. Each domain also carries a **"no-regrets" objective** as
a practical starting point. The QRI does not prescribe a minimum level — it tracks progress
and supports board-level conversations.

### The 18 questions (Annex B, verbatim)

Each question is answered on the L0–L3 scale above.

**Governance (GV)**
1. How has your organisation established leadership and oversight to institutionalise the migration to quantum safety?
2. How does your organisation plan and allocate resources for quantum-safe initiatives?
3. How does your organisation view quantum risks vis-à-vis existing cybersecurity risks?
4. What is the progress of your organisation in developing policies and frameworks for data, cryptography and quantum risk management?

**Risk Assessment (RA)**
5. How does your organisation assess quantum risks to data and cryptographic assets?
6. What is the extent of your organisation's inventory of its key systems that handle high-value data?
7. What is the extent of your organisation's inventory of its cryptographic assets (e.g. keys, certificates, algorithms, protocols)?
8. How are your organisation's cryptographic dependencies in key systems (products, applications, processes that rely on cryptography) included in cryptographic inventories?

**Training and Capability (TC)**
9. What is the extent of the organisation's awareness of the quantum threat and its impact on critical digital assets?
10. What is your organisation's progress in building awareness for quantum risks and quantum-safe migration?
11. How does your organisation identify and develop the competencies needed for quantum-safe migration?

**External Engagement (EE)**
12. How does your organisation evaluate and manage quantum risks from vendors and other third parties?
13. How does your organisation engage with external stakeholders to collectively address quantum risks?
14. How does your organisation promote the adoption of common quantum-safe standards and guidelines?
15. How does your organisation engage with ecosystem and academia to support talent pipeline development?

**Technology (TE)**
16. To what extent has your organisation conducted experimentation and PoCs for quantum-safe technologies to inform quantum-safe migration efforts?
17. Does your organisation plan ahead based on quantum-safe cryptographic algorithms?
18. How does your organisation incorporate cryptographic agility considerations into its quantum-safe migration planning?

### How Q-Readiness aligns

The QRI splits cleanly into what our **scanners** cover and what our **questionnaire** covers:

- **BOM (scanners) → Risk Assessment Q7** (inventory of cryptographic assets: keys,
  certificates, algorithms, protocols) and **Technology Q17** (plan ahead on quantum-safe
  algorithms). This is the *technical side*.
- **Questionnaire (Stage 2) → Governance (Q1–4), Risk Assessment Q5–6 & Q8, Training &
  Capability (Q9–11), External Engagement (Q12–15), Technology Q16 & Q18.** This is the
  *information side*.
- Readiness is scored **per objective on the L0–L3 scale**, giving a dashboard aligned to a
  recognized national framework — one of several regional standards (NIST, CNSA, CRYPTREC,
  ENISA/ETSI, CCN, and now CSA QRI).

> **Note:** the draft PDF (18 questions above) and the live FormSG questionnaire
> (`go.gov.sg/qri`) differ slightly in wording/structure. When we build Stage 2, use the
> final CSA V1 as the authority and treat the 18 questions here as the alignment skeleton.

### Primary sources

- [CSA — Quantum-Safe Migration Handbook and Quantum Readiness Index](https://www.csa.gov.sg/resources/publications/quantum-safe-handbook-and-quantum-readiness-index/)
- [Draft Quantum Readiness Index (Oct 2025, PDF)](https://isomer-user-content.by.gov.sg/36/949031c3-6734-4d33-985e-71331fa8ade4/Draft%20for%20Public%20Consultation%20-%20Quantum%20Readiness%20Index%20(Oct%202025).pdf)
- [postquantum.com — Singapore CSA Quantum-Safe Handbook and Readiness Index](https://postquantum.com/quantum-policy/singapore-csa-quantum-safe-handbook/)
- [PQShield — Securing Singapore: The CSA Quantum Safe Migration Framework](https://pqshield.com/securing-singapore-the-csa-quantum-safe-migration-framework/)

---

## 6. Non-negotiable design constraints

- Reuse existing tokens and components from `css/styles.css` — never raw inline styles.
- **Never modify `css/styles.css`** or the `index.html` design system without approval.
- Preserve: the `.hero-quantum-viz` background, the nav + mobile overlay, the countdown
  clocks, the dashboard mockup, the news cards, the i18n dropdown, and all scroll/reveal
  animations in `js/main.js`.
- Respect `prefers-reduced-motion` for any new animation.
- Copy lives in `locales/en.json` + `locales/ja.json` via `data-i18n`; both stay in sync.
- No "Chicago", "Fermilab", "Argonne", "newsletter", or team/about sections.

---

## 7. Open items

- [ ] Hero headline final wording (standards-alignment, two candidate options).
- [ ] Pricing: whisper on homepage vs. zero pricing on homepage (pricing.html only).
- [ ] News: keep news cards on the homepage vs. a one-line teaser linking to `news.html`.
