/* Dashboard renderer — populates HTML from API response.
   Called by initDashboard() after auth + data fetch.
   Pure rendering — no data fetching, no auth. */

function renderDashboard(data) {
  if (!data) return;

  renderKPI(data.kpis);
  renderSections(data.sections, data.meta);
  renderBacklog(data.backlog);
  renderCharts(data);
}

/* KPI row */
function renderKPI(kpis) {
  if (!kpis) return;
  setVal('kpi-endpoints', (kpis.endpoints_scanned || 0));
  setVal('kpi-pqc', (kpis.endpoints_pqc_ready || 0));
  setVal('kpi-critical', (kpis.findings_critical || 0));
  setVal('kpi-total', (kpis.findings_total || 0));
}
function setVal(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* Section cards — locked or active */
function renderSections(sections, meta) {
  if (!sections) return;
  var names = ['network', 'code', 'infra', 'data', 'pki'];
  names.forEach(function(name) {
    var sec = sections[name] || { status: 'locked' };
    renderSection(name, sec, meta);
  });
}

function renderSection(name, section, meta) {
  var container = document.getElementById('section-' + name);
  if (!container) return;

  if (section.status === 'locked') {
    container.innerHTML = lockedCard(name);
    return;
  }

  var findings = section.findings || [];
  if (findings.length === 0) {
    container.innerHTML = emptyCard(name, section);
    return;
  }

  container.innerHTML = findingsTable(name, findings, section);
}

function lockedCard(name) {
  var labels = { network: 'Network & TLS', code: 'Code & Repos',
    infra: 'Infra & Configs', data: 'Data & Storage', pki: 'PKI & Identity' };
  return '<div class="kpi-card" style="opacity:0.4;filter:blur(2px);text-align:center;padding:40px;">' +
    '<div style="font-family:var(--font-display);font-size:1.2rem;color:var(--color-text-dim);margin-bottom:12px;">' +
    (labels[name] || name) + '</div>' +
    '<div style="font-size:0.82rem;color:var(--color-text-muted);margin-bottom:16px;">No data — run your first free scan</div>' +
    '<a href="#" class="btn btn--outline btn--small">Run Free Scan</a></div>';
}

function emptyCard(name, section) {
  var labels = { network: 'Network & TLS', code: 'Code & Repos',
    infra: 'Infra & Configs', data: 'Data & Storage', pki: 'PKI & Identity' };
  var tool = section.tool || 'Unknown tool';
  return '<div class="kpi-card" style="text-align:center;padding:40px;">' +
    '<div style="font-family:var(--font-display);font-size:1.2rem;color:var(--color-text);margin-bottom:8px;">' +
    (labels[name] || name) + '</div>' +
    '<div style="color:var(--color-green);font-size:0.82rem;">All clear — 0 findings</div>' +
    '<div style="font-size:0.72rem;color:var(--color-text-muted);margin-top:4px;">Scanned with ' + tool + '</div></div>';
}

function findingsTable(name, findings, section) {
  var labels = { network: 'Network & TLS', code: 'Code & Repos',
    infra: 'Infra & Configs', data: 'Data & Storage', pki: 'PKI & Identity' };
  var html = '<h3 class="dash-heading">' + (labels[name] || name) +
    ' <span style="font-size:0.7rem;color:var(--color-text-muted);">' +
    findings.length + ' findings</span></h3>';
  html += '<p class="dash-subheading">Source: ' + (section.tool || 'scan') + '</p>';
  html += '<table class="data-table"><thead><tr><th>Severity</th><th>Finding</th><th>Asset</th><th>Tool</th></tr></thead><tbody>';

  var sevClass = { CRITICAL: 'sev-critical', HIGH: 'sev-high', MEDIUM: 'sev-medium' };
  findings.slice(0, 20).forEach(function(f) {
    var sev = (f.severity || '').toUpperCase();
    var cls = sevClass[sev] || 'sev-medium';
    html += '<tr>' +
      '<td><span class="badge ' + cls + '">' + (f.severity || '—') + '</span></td>' +
      '<td>' + (f.title || f.id || f.algorithm || f.type || '—') + '</td>' +
      '<td>' + (f.asset || f.host || f.resource || f.domain || f.location || '—') + '</td>' +
      '<td>' + (f.tool || '—') + '</td></tr>';
  });

  html += '</tbody></table>';
  return html;
}

/* Backlog */
function renderBacklog(backlog) {
  var tbody = document.getElementById('backlogBody');
  if (!tbody || !backlog || !backlog.length) return;

  var priorityClass = { P0: 'backlog-p0', P1: 'backlog-p1', P2: 'backlog-p2', P3: 'backlog-p3' };
  var badgeClass = { P0: 'sev-critical', P1: 'sev-high', P2: 'sev-medium', P3: 'sev-medium' };
  var priorityStyle = { P3: 'border-left:2px solid var(--color-border);' };

  tbody.innerHTML = '';
  backlog.forEach(function(b) {
    var pCls = priorityClass[b.priority] || '';
    var bCls = badgeClass[b.priority] || 'sev-medium';
    var pStyle = priorityStyle[b.priority] || '';
    var row = '<tr class="' + pCls + '" style="' + pStyle + '">' +
      '<td><span class="badge ' + bCls + '">' + b.priority + '</span></td>' +
      '<td>' + (b.section || '') + '</td>' +
      '<td>' + (b.finding || '') + '</td>' +
      '<td>' + (b.action || '') + '</td>' +
      '<td>' + (b.deadline || '') + '</td>' +
      '<td>' + (b.effort || '') + '</td>' +
      '<td><span class="status-tag status-notstarted">' + (b.status || 'not started') + '</span></td></tr>';
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

/* Charts */
function renderCharts(data) {
  var kpis = data.kpis || {};
  var byLayer = kpis.by_layer || {};

  if (window._severityDonut) {
    window._severityDonut.data.datasets[0].data = [
      kpis.findings_critical || 0,
      kpis.findings_high || 0,
      Math.max(0, (kpis.findings_total || 0) - (kpis.findings_critical || 0) - (kpis.findings_high || 0))
    ];
    window._severityDonut.update();
  }

  if (window._layerBar) {
    window._layerBar.data.datasets[0].data = [
      byLayer.network || 0, byLayer.code || 0, byLayer.infra || 0,
      byLayer.data || 0, byLayer.pki || 0
    ];
    window._layerBar.update();
  }
}
