---
paths: ["index.html", "quantum-status.html"]
---
# Marketing Pages Rules

- These are marketing pages. Dashboard rules do NOT apply here.
- Preserve existing design patterns:
  - `.section--dark`, `.section--darker`, `.section--deep` backgrounds
  - `.section--grid`, `.section--striped`, `.section--glow` effects
  - 0.5px gold dividers via `::after` pseudo-elements
  - `.reveal` animation classes (IntersectionObserver in main.js)
  - Countdown clocks ARE allowed here (`.countdown-clock`). They are marketing elements.
  - `.hero`, `.evaluate-card`, `.news-card`, `.countdown-clock` component patterns
- Navigation bar must stay consistent across all pages.
- Mobile overlay menu must stay consistent.
- No changes to `css/styles.css` without explicit approval.
- Callout boxes (`.hndl-callout`) ARE allowed here — they are part of the marketing narrative.
- Explanatory prose IS appropriate here — this is where we explain concepts to prospects.
