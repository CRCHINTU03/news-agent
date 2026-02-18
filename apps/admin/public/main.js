const API = "http://localhost:4000";
const state = {
  token: localStorage.getItem("news_agent_admin_token") || "",
  email: localStorage.getItem("news_agent_admin_email") || ""
};

const statusBox = document.getElementById("status-box");
const authLabel = document.getElementById("auth-label");

function log(message, level = "INFO") {
  statusBox.textContent = `[${new Date().toISOString()}] ${level}: ${message}\n${statusBox.textContent}`;
}

function setAuth(token, email) {
  state.token = token || "";
  state.email = email || "";
  localStorage.setItem("news_agent_admin_token", state.token);
  localStorage.setItem("news_agent_admin_email", state.email);
  authLabel.textContent = state.email ? `Signed in: ${state.email}` : "Not signed in";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.message || `Request failed: ${res.status}`);
  return body;
}

function renderOverview(overview) {
  const grid = document.getElementById("overview-grid");
  const digestSent = (overview.digestsByStatus || []).find((x) => x.status === "sent")?.count || 0;
  const digestPending = (overview.digestsByStatus || []).find((x) => x.status === "pending")?.count || 0;
  const delivered24h = (overview.emailEvents24h || []).find((x) => x.event_type === "delivered")?.count || 0;
  grid.innerHTML = `
    <article class="metric"><h3>Active Sources</h3><p>${overview.activeSources}</p></article>
    <article class="metric"><h3>Articles (24h)</h3><p>${overview.recentArticles24h}</p></article>
    <article class="metric"><h3>Digests Sent</h3><p>${digestSent}</p></article>
    <article class="metric"><h3>Digests Pending</h3><p>${digestPending}</p></article>
    <article class="metric"><h3>Delivered (24h)</h3><p>${delivered24h}</p></article>
  `;
}

function renderRows(id, rows, cols) {
  const tbody = document.querySelector(`#${id} tbody`);
  tbody.innerHTML = "";
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = cols.map((c) => `<td>${row[c] ?? ""}</td>`).join("");
    tbody.appendChild(tr);
  }
}

async function loadDashboard() {
  if (!state.token) return;

  const [overview, sources, digests, jobs, events] = await Promise.all([
    api("/admin/overview"),
    api("/admin/sources"),
    api("/admin/digests"),
    api("/admin/email-jobs"),
    api("/admin/email-events")
  ]);

  renderOverview(overview.overview);
  renderRows("sources-table", sources.sources, ["name", "type", "last_fetched_at", "is_active"]);
  renderRows("digests-table", digests.digests, ["id", "email", "status", "sent_at"]);
  renderRows("jobs-table", jobs.jobs, ["id", "digest_id", "status", "attempts", "last_error"]);
  renderRows("events-table", events.events, ["event_type", "user_id", "digest_id", "event_timestamp"]);
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: formData.get("email"), password: formData.get("password") })
    });
    setAuth(data.token, data.user.email);
    await loadDashboard();
    log("Admin login successful");
  } catch (error) {
    log(error.message, "ERROR");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  setAuth("", "");
  log("Logged out");
});

(async function init() {
  setAuth(state.token, state.email);
  if (state.token) await loadDashboard();
  log("Admin app ready");
})();
