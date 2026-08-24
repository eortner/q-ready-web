/* Q-Readiness — Dashboard API schema and client.

   Backend returns this structure from GET /api/dashboard.
   Each section is independent — scanned ones show data, locked ones show a CTA.
   Firestore security rules ensure data isolation per user.
   Never returns mock data. Backend down = error state shown to user. */

const DASHBOARD_SCHEMA = {
  meta: {
    scan_id: "",        // latest scan UUID, null if never scanned
    scan_date: "",      // ISO date
    user_tier: "free"   // free|starter|pro|enterprise|custom
  },

  kpis: {
    endpoints_scanned: 0,
    endpoints_pqc_ready: 0,
    findings_critical: 0,
    findings_high: 0,
    findings_total: 0
  },

  sections: {
    network: {
      status: "locked",    // locked | partial | scanned
      targets_used: 0,     // how many scanned this month
      targets_limit: 1,    // tier limit
      hosts: [],           // [{host,port,tls_version,cert_algorithm,pqc_status,quantum_risk}]
      findings: [],        // [{severity,title,description,tool}]
      kpis: { endpoints_scanned:0, tls13_count:0, pqc_ready:0, cert_vulnerable:0 }
    },
    code: {
      status: "locked",
      targets_used: 0,
      targets_limit: 1,
      findings: [],        // [{algorithm,severity,location,is_false_positive,tool}]
      kpis: { repos_scanned:0, findings_total:0, false_positives:0 }
    },
    infra: {
      status: "locked",
      targets_used: 0,
      targets_limit: 1,
      findings: [],        // [{resource,algorithm,quantum_safety,tool}]
      kpis: { assets_scanned:0, vulnerable_keys:0 }
    },
    data: {
      status: "locked",
      targets_used: 0,
      targets_limit: 1,
      databases: [],       // [{host,engine,tde_enabled,key_wrapping,conn_tls,encrypted_cols}]
      kpis: { servers_scanned:0, tde_enabled:0, rsa_wrapped:0 }
    },
    pki: {
      status: "locked",
      targets_used: 0,
      targets_limit: 1,
      certificates: [],    // [{domain,algorithm,expiry,quantum_risk}]
      findings: [],        // [{type,detail,risk,tool}]
      kpis: { certs_scanned:0, vulnerable_certs:0, expiring_soon:0 }
    }
  },

  backlog: []              // [{priority,section,finding,action,deadline,effort,status}]
};

/* Fetch dashboard from backend. Throws on failure — never returns mock data. */
async function fetchDashboard(token) {
  const res = await fetch("/api/dashboard", {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error("Backend returned " + res.status);
  return await res.json();
}
