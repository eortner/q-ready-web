---
paths: ["dashboard*.html", "js/dashboard*.js"]
---
# Dashboard Rules

- Dashboard is a data tool. NOT a consulting report. NOT a marketing page.
- NO callout boxes (<div class="hndl-callout">). NO explanatory paragraphs after data.
- NO countdown clocks. Deadlines are data fields in a table, not animated widgets.
- NO emoji anywhere.
- Every number MUST trace to a specific JSON/CSV file in `tools/results/`.
- Every chart MUST be backed by data from a tool output file.
- KPIs show N (sample size) and severity distribution. Never a single aggregate.
- Three tabs: Dashboard, Inventory, Actions. Side nav. KPI row always visible.
- Use CSS classes from `styles.css`. Design tokens only. No raw hex/rgba.
- Source tool attribution on every section: "Source: acdi 0.5.0, May 2026"
- Every table row with a finding has <details> drill-down to raw tool evidence.
- PDF export via html2pdf CDN (already loaded).
