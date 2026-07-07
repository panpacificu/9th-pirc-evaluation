(() => {
  "use strict";

  const CONFIG = window.PIRC_CONFIG;
  const SESSION_KEY = "pircAdminKey";

  const loginPanel = document.getElementById("loginPanel");
  const dashboard = document.getElementById("dashboard");
  const loginForm = document.getElementById("loginForm");
  const adminKeyInput = document.getElementById("adminKey");
  const loginButton = document.getElementById("loginButton");
  const loginMessage = document.getElementById("loginMessage");
  const togglePassword = document.getElementById("togglePassword");
  const refreshButton = document.getElementById("refreshButton");
  const logoutButton = document.getElementById("logoutButton");
  const sheetLink = document.getElementById("sheetLink");
  const lastUpdated = document.getElementById("lastUpdated");
  const kpiGrid = document.getElementById("kpiGrid");
  const campusBreakdown = document.getElementById("campusBreakdown");
  const batchBreakdown = document.getElementById("batchBreakdown");
  const schoolBreakdown = document.getElementById("schoolBreakdown");
  const emailBreakdown = document.getElementById("emailBreakdown");
  const ratingAverages = document.getElementById("ratingAverages");
  const latestResponses = document.getElementById("latestResponses");
  const recentComments = document.getElementById("recentComments");
  const formOpenToggle = document.getElementById("formOpenToggle");
  const formStatusTitle = document.getElementById("formStatusTitle");
  const formStatusDescription = document.getElementById("formStatusDescription");
  const closedMessageInput = document.getElementById("closedMessageInput");
  const saveStatusButton = document.getElementById("saveStatusButton");
  const statusMessage = document.getElementById("statusMessage");
  const dashboardMessage = document.getElementById("dashboardMessage");

  let adminKey = sessionStorage.getItem(SESSION_KEY) || "";
  let currentData = null;

  function isEndpointConfigured() {
    return Boolean(
      CONFIG.ENDPOINT_URL &&
      !CONFIG.ENDPOINT_URL.includes("PASTE_") &&
      /^https:\/\/script\.google\.com\/macros\/s\//.test(CONFIG.ENDPOINT_URL)
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setButtonLoading(button, loading, loadingText, defaultText) {
    button.disabled = loading;
    button.classList.toggle("is-loading", loading);
    const label = button.querySelector(".button-label");

    if (label) {
      label.textContent = loading ? loadingText : defaultText;
    }
  }

  function setMessage(element, message = "", type = "error") {
    element.className = message ? `form-message is-${type}` : "form-message";
    element.textContent = message;
  }

  async function api(action, extra = {}) {
    if (!isEndpointConfigured()) {
      throw new Error("The Apps Script Web App URL is missing from config.js.");
    }

    const response = await fetch(CONFIG.ENDPOINT_URL, {
      method: "POST",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({
        action,
        adminKey,
        ...extra
      })
    });

    if (!response.ok) {
      throw new Error(`Request failed with HTTP ${response.status}.`);
    }

    const result = await response.json();

    if (!result.ok) {
      const error = new Error(result.message || "The admin request failed.");
      error.unauthorized = result.unauthorized === true;
      throw error;
    }

    return result;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return escapeHtml(value);

    return new Intl.DateTimeFormat("en-PH", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(date);
  }

  function renderKpis(data) {
    const items = [
      {
        label: "Total Responses",
        value: data.totalResponses,
        note: "All recorded submissions"
      },
      {
        label: "Today",
        value: data.todayResponses,
        note: "Responses received today"
      },
      {
        label: "Overall Average",
        value: data.overallAverage ? `${data.overallAverage.toFixed(2)} / 4` : "—",
        note: "Across all rating questions"
      },
      {
        label: "Satisfied",
        value: `${data.satisfactionRate.toFixed(1)}%`,
        note: "Ratings of 3 or 4"
      },
      {
        label: "Emails Sent",
        value: data.emailSent,
        note: `${data.emailNotSent} not sent`
      },
      {
        label: "Certificates Sent",
        value: data.certificateSent,
        note: `${data.certificateNotSent} not delivered`
      },
      {
        label: "Form Status",
        value: data.formStatus.isOpen ? "OPEN" : "CLOSED",
        note: data.formStatus.isOpen ? "Accepting responses" : "Submissions blocked"
      }
    ];

    kpiGrid.innerHTML = items.map((item) => `
      <article class="kpi-card">
        <span class="kpi-label">${escapeHtml(item.label)}</span>
        <strong class="kpi-value">${escapeHtml(item.value)}</strong>
        <span class="kpi-note">${escapeHtml(item.note)}</span>
      </article>
    `).join("");
  }

  function renderBars(element, items, total) {
    if (!items || items.length === 0) {
      element.innerHTML = '<div class="empty-admin-state">No data available yet.</div>';
      return;
    }

    const safeTotal = Math.max(Number(total) || 0, 1);

    element.innerHTML = items.map((item) => {
      const value = Number(item.value) || 0;
      const percentage = Math.min(100, (value / safeTotal) * 100);

      return `
        <div class="bar-item">
          <div class="bar-meta">
            <span>${escapeHtml(item.label)}</span>
            <strong>${value}</strong>
          </div>
          <div class="bar-track" aria-hidden="true">
            <div class="bar-fill" style="width:${percentage.toFixed(2)}%"></div>
          </div>
        </div>
      `;
    }).join("");
  }

  function renderRatingAverages(items) {
    if (!items || items.length === 0) {
      ratingAverages.innerHTML = '<div class="empty-admin-state">No ratings have been submitted yet.</div>';
      return;
    }

    ratingAverages.innerHTML = items.map((item) => `
      <div class="rating-summary-item">
        <div class="rating-summary-label">
          <strong title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</strong>
          <small>${item.count} rating${item.count === 1 ? "" : "s"}</small>
        </div>
        <span class="rating-score">${Number(item.average).toFixed(2)}</span>
      </div>
    `).join("");
  }

  function renderLatest(items) {
    if (!items || items.length === 0) {
      latestResponses.innerHTML = `
        <tr><td colspan="6"><div class="empty-admin-state">No submissions yet.</div></td></tr>
      `;
      return;
    }

    latestResponses.innerHTML = items.map((item) => `
      <tr>
        <td>${escapeHtml(formatDate(item.timestamp))}</td>
        <td>
          <span class="table-primary">${escapeHtml(item.fullName)}</span>
          <span class="table-secondary">${escapeHtml(item.email)}</span>
        </td>
        <td>${escapeHtml(item.campus)}</td>
        <td>${escapeHtml(item.batch)}</td>
        <td>${escapeHtml(item.school)}</td>
        <td><span class="score-badge">${item.average ? Number(item.average).toFixed(2) : "—"}</span></td>
      </tr>
    `).join("");
  }

  function renderComments(items) {
    if (!items || items.length === 0) {
      recentComments.innerHTML = '<div class="empty-admin-state">No comments or suggestions yet.</div>';
      return;
    }

    recentComments.innerHTML = items.map((item) => `
      <article class="comment-card">
        <p>${escapeHtml(item.comment)}</p>
        <div class="comment-meta">
          <span>${escapeHtml(item.fullName)}</span>
          <span>•</span>
          <span>${escapeHtml(item.batch)}</span>
          <span>•</span>
          <span>${escapeHtml(formatDate(item.timestamp))}</span>
        </div>
      </article>
    `).join("");
  }

  function renderFormStatus(status) {
    formOpenToggle.checked = status.isOpen;
    closedMessageInput.value = status.closedMessage || "";

    if (status.isOpen) {
      formStatusTitle.textContent = "Accepting responses";
      formStatusDescription.textContent = "The public evaluation form is open.";
    } else {
      formStatusTitle.textContent = "Responses are closed";
      formStatusDescription.textContent = "The public form is blocked from accepting submissions.";
    }
  }

  function renderDashboard(data) {
    currentData = data;
    loginPanel.hidden = true;
    dashboard.hidden = false;

    lastUpdated.textContent = `Last refreshed ${formatDate(data.generatedAt)}`;
    sheetLink.href = data.spreadsheetUrl || "#";
    sheetLink.hidden = !data.spreadsheetUrl;

    renderKpis(data);
    renderBars(campusBreakdown, data.campusCounts, data.totalResponses);
    renderBars(batchBreakdown, data.batchCounts, data.totalResponses);
    renderBars(schoolBreakdown, data.schoolCounts, data.totalResponses);
    renderBars(emailBreakdown, [
      { label: "Sent", value: data.emailSent },
      { label: "Not Sent", value: data.emailNotSent },
      { label: "Pending", value: data.emailPending }
    ], data.totalResponses);
    renderRatingAverages(data.ratingAverages);
    renderLatest(data.latestResponses);
    renderComments(data.recentComments);
    renderFormStatus(data.formStatus);
  }

  async function loadDashboard({ fromLogin = false } = {}) {
    setMessage(dashboardMessage);
    setMessage(loginMessage);

    if (fromLogin) {
      setButtonLoading(loginButton, true, "Opening...", "Open Dashboard");
    } else {
      refreshButton.disabled = true;
      refreshButton.textContent = "Refreshing...";
    }

    try {
      const result = await api("adminDashboard");
      sessionStorage.setItem(SESSION_KEY, adminKey);
      renderDashboard(result.data);
    } catch (error) {
      console.error(error);

      if (error.unauthorized) {
        sessionStorage.removeItem(SESSION_KEY);
        adminKey = "";
        dashboard.hidden = true;
        loginPanel.hidden = false;
        setMessage(loginMessage, error.message || "Invalid admin key.");
        adminKeyInput.focus();
      } else if (fromLogin) {
        setMessage(loginMessage, error.message);
      } else {
        setMessage(dashboardMessage, error.message);
      }
    } finally {
      if (fromLogin) {
        setButtonLoading(loginButton, false, "Opening...", "Open Dashboard");
      } else {
        refreshButton.disabled = false;
        refreshButton.textContent = "Refresh";
      }
    }
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    adminKey = adminKeyInput.value.trim();

    if (!adminKey) {
      setMessage(loginMessage, "Enter the admin key first.");
      return;
    }

    loadDashboard({ fromLogin: true });
  });

  togglePassword.addEventListener("click", () => {
    const showing = adminKeyInput.type === "text";
    adminKeyInput.type = showing ? "password" : "text";
    togglePassword.textContent = showing ? "Show" : "Hide";
  });

  refreshButton.addEventListener("click", () => loadDashboard());

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem(SESSION_KEY);
    adminKey = "";
    adminKeyInput.value = "";
    dashboard.hidden = true;
    loginPanel.hidden = false;
    setMessage(loginMessage);
    adminKeyInput.focus();
  });

  formOpenToggle.addEventListener("change", () => {
    renderFormStatus({
      isOpen: formOpenToggle.checked,
      closedMessage: closedMessageInput.value
    });
  });

  saveStatusButton.addEventListener("click", async () => {
    setMessage(statusMessage);
    setButtonLoading(saveStatusButton, true, "Saving...", "Save Form Status");

    try {
      const result = await api("setFormStatus", {
        isOpen: formOpenToggle.checked,
        closedMessage: closedMessageInput.value.trim()
      });

      renderFormStatus(result.formStatus);
      setMessage(
        statusMessage,
        result.formStatus.isOpen
          ? "The evaluation form is now accepting responses."
          : "The evaluation form is now closed.",
        "success"
      );

      await loadDashboard();
    } catch (error) {
      console.error(error);
      setMessage(statusMessage, error.message);
    } finally {
      setButtonLoading(saveStatusButton, false, "Saving...", "Save Form Status");
    }
  });

  document.getElementById("adminVersion").textContent = `v${CONFIG.VERSION}`;
  document.getElementById("adminFooterVersion").textContent = `Version ${CONFIG.VERSION}`;

  if (!isEndpointConfigured()) {
    setMessage(
      loginMessage,
      "Add your deployed Apps Script /exec URL to config.js before using the dashboard."
    );
    loginButton.disabled = true;
  } else if (adminKey) {
    adminKeyInput.value = adminKey;
    loadDashboard({ fromLogin: true });
  }
})();
