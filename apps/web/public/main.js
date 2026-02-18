const API_BASE = "http://localhost:4000";

const state = {
  token: localStorage.getItem("news_agent_token") || "",
  userEmail: localStorage.getItem("news_agent_email") || ""
};

const statusBox = document.getElementById("status-box");
const authEmail = document.getElementById("auth-email");
const topicSelect = document.getElementById("topic-select");
const subscriptionsTable = document.querySelector("#subscriptions-table tbody");
const digestsContainer = document.getElementById("digests-container");

const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const subscriptionForm = document.getElementById("subscription-form");
const logoutBtn = document.getElementById("logout-btn");
const authTabs = [...document.querySelectorAll(".auth-tab")];
const authPanes = [...document.querySelectorAll(".auth-pane")];
const navPills = [...document.querySelectorAll(".nav-pill")];

function setStatus(message, level = "INFO") {
  statusBox.textContent = `[${new Date().toISOString()}] ${level}: ${message}\n${statusBox.textContent}`;
}

function setAuth(token, email) {
  state.token = token || "";
  state.userEmail = email || "";
  localStorage.setItem("news_agent_token", state.token);
  localStorage.setItem("news_agent_email", state.userEmail);
  authEmail.textContent = state.userEmail ? `Signed in: ${state.userEmail}` : "Not signed in";
}

async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new Error(body?.message || `Request failed: ${response.status}`);
  }

  return body;
}

async function loadTopics() {
  const data = await api("/topics", { method: "GET" });
  topicSelect.innerHTML = "";
  for (const topic of data.topics) {
    const option = document.createElement("option");
    option.value = topic.id;
    option.textContent = topic.name;
    topicSelect.appendChild(option);
  }
}

async function loadSubscriptions() {
  if (!state.token) return;

  const data = await api("/subscriptions", { method: "GET" });
  subscriptionsTable.innerHTML = "";

  for (const sub of data.subscriptions) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${sub.topic_name}</td>
      <td>${sub.locality}</td>
      <td>${sub.frequency}</td>
      <td>${sub.is_active ? "yes" : "no"}</td>
      <td>
        <button data-action="toggle" data-id="${sub.id}">${sub.is_active ? "Deactivate" : "Activate"}</button>
      </td>
    `;
    subscriptionsTable.appendChild(row);
  }
}

async function loadDigests() {
  if (!state.token) return;

  const data = await api("/digests", { method: "GET" });
  digestsContainer.innerHTML = "";

  if (!data.digests.length) {
    digestsContainer.textContent = "No sent digests yet.";
    return;
  }

  for (const digest of data.digests) {
    const card = document.createElement("article");
    card.className = "digest-card";

    const items = (digest.items || [])
      .map(
        (item) => `<li><a href="${item.url}" target="_blank" rel="noreferrer">${item.title}</a></li>`
      )
      .join("");

    card.innerHTML = `
      <h4>Digest #${digest.id}</h4>
      <p class="muted">Sent: ${digest.sentAt || "N/A"}</p>
      <ol>${items}</ol>
    `;

    digestsContainer.appendChild(card);
  }
}

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);

  try {
    await api("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        timezone: formData.get("timezone") || "UTC"
      })
    });
    setStatus("Signup successful. Please login.");
    signupForm.reset();
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);

  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    setAuth(data.token, data.user.email);
    setStatus("Login successful.");
    await Promise.all([loadSubscriptions(), loadDigests()]);
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
});

subscriptionForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!state.token) {
    setStatus("Login required before adding subscriptions.", "ERROR");
    return;
  }

  try {
    await api("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        topicId: Number(topicSelect.value),
        locality: document.getElementById("locality-input").value,
        frequency: document.getElementById("frequency-select").value
      })
    });

    setStatus("Subscription added.");
    subscriptionForm.reset();
    await loadSubscriptions();
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
});

subscriptionsTable.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLButtonElement)) {
    return;
  }

  const action = target.getAttribute("data-action");
  const id = target.getAttribute("data-id");
  if (action !== "toggle" || !id) {
    return;
  }

  try {
    const isDeactivate = target.textContent === "Deactivate";
    await api(`/subscriptions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !isDeactivate })
    });
    setStatus("Subscription updated.");
    await loadSubscriptions();
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
});

logoutBtn.addEventListener("click", async () => {
  setAuth("", "");
  subscriptionsTable.innerHTML = "";
  digestsContainer.innerHTML = "";
  setStatus("Logged out.");
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.getAttribute("data-auth");
    authTabs.forEach((t) => t.classList.remove("active"));
    authPanes.forEach((pane) => pane.classList.remove("active"));
    tab.classList.add("active");
    const nextPane = authPanes.find((pane) => pane.getAttribute("data-pane") === target);
    if (nextPane) nextPane.classList.add("active");
  });
});

navPills.forEach((pill) => {
  pill.addEventListener("click", () => {
    const target = pill.getAttribute("data-target");
    navPills.forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    if (!target) return;
    const section = document.getElementById(target);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

async function bootstrap() {
  try {
    await loadTopics();
    setAuth(state.token, state.userEmail);

    if (state.token) {
      await Promise.all([loadSubscriptions(), loadDigests()]);
    }

    setStatus("Web app ready.");
  } catch (error) {
    setStatus(error.message, "ERROR");
  }
}

bootstrap();
