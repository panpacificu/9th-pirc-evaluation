<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#075CAA">
  <meta name="robots" content="noindex, nofollow">
  <title>9th PIRC Admin Dashboard</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="styles.css">
  <link rel="stylesheet" href="admin.css">
  <script defer src="config.js"></script>
  <script defer src="admin.js"></script>
</head>
<body class="admin-body">
  <div class="page-ribbon page-ribbon--one" aria-hidden="true"></div>
  <div class="page-ribbon page-ribbon--two" aria-hidden="true"></div>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="Return to evaluation form">
        <span class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span class="brand-copy">
          <strong>9th PIRC Admin</strong>
          <small>Evaluation Dashboard</small>
        </span>
      </a>

      <div class="header-meta">
        <a class="admin-header-link" href="index.html">View Form</a>
        <span id="adminVersion" class="version-text"></span>
      </div>
    </div>
  </header>

  <main class="admin-shell">
    <section id="loginPanel" class="admin-login">
      <div class="login-mark" aria-hidden="true">9</div>
      <p class="section-eyebrow">Restricted Access</p>
      <h1>Admin Dashboard</h1>
      <p class="login-copy">
        Enter the admin key configured in the Apps Script project.
      </p>

      <form id="loginForm" class="login-form">
        <label for="adminKey">Admin Key</label>
        <div class="password-row">
          <input
            id="adminKey"
            name="adminKey"
            type="password"
            required
            autocomplete="current-password"
            placeholder="Enter admin key"
          >
          <button id="togglePassword" class="secondary-button" type="button">Show</button>
        </div>
        <button id="loginButton" class="submit-button" type="submit">
          <span class="button-label">Open Dashboard</span>
          <span class="button-loader" aria-hidden="true"></span>
        </button>
        <div id="loginMessage" class="form-message" role="status" aria-live="polite"></div>
      </form>
    </section>

    <section id="dashboard" class="dashboard" hidden>
      <div class="dashboard-heading">
        <div>
          <p class="section-eyebrow">Evaluation Analytics</p>
          <h1>9th PIRC Dashboard</h1>
          <p id="lastUpdated" class="dashboard-subtitle"></p>
        </div>
        <div class="dashboard-actions">
          <a id="sheetLink" class="secondary-button" href="#" target="_blank" rel="noopener">Open Sheet</a>
          <button id="refreshButton" class="secondary-button" type="button">Refresh</button>
          <button id="logoutButton" class="secondary-button secondary-button--danger" type="button">Log Out</button>
        </div>
      </div>

      <section class="admin-card form-control-card">
        <div class="form-control-copy">
          <p class="section-eyebrow">Response Control</p>
          <h2>Form availability</h2>
          <p>
            This switch is enforced by Apps Script. Turning the form off prevents new submissions even if someone bypasses the public page.
          </p>
        </div>

        <div class="form-control-panel">
          <label class="switch-row">
            <span>
              <strong id="formStatusTitle">Accepting responses</strong>
              <small id="formStatusDescription">The public evaluation form is open.</small>
            </span>
            <input id="formOpenToggle" type="checkbox">
            <span class="switch" aria-hidden="true"></span>
          </label>

          <label for="closedMessageInput">Message shown while the form is closed</label>
          <textarea
            id="closedMessageInput"
            rows="3"
            maxlength="500"
            placeholder="We are not currently accepting responses. Please check again later."
          ></textarea>

          <button id="saveStatusButton" class="submit-button admin-save-button" type="button">
            <span class="button-label">Save Form Status</span>
            <span class="button-loader" aria-hidden="true"></span>
          </button>
          <div id="statusMessage" class="form-message" role="status" aria-live="polite"></div>
        </div>
      </section>

      <section id="kpiGrid" class="kpi-grid" aria-label="Summary statistics"></section>

      <div class="admin-grid admin-grid--three">
        <section class="admin-card">
          <div class="card-heading">
            <div>
              <p class="section-eyebrow">Breakdown</p>
              <h2>By Campus</h2>
            </div>
          </div>
          <div id="campusBreakdown" class="bar-list"></div>
        </section>

        <section class="admin-card">
          <div class="card-heading">
            <div>
              <p class="section-eyebrow">Breakdown</p>
              <h2>By Batch</h2>
            </div>
          </div>
          <div id="batchBreakdown" class="bar-list"></div>
        </section>

        <section class="admin-card">
          <div class="card-heading">
            <div>
              <p class="section-eyebrow">Email Delivery</p>
              <h2>Confirmation Status</h2>
            </div>
          </div>
          <div id="emailBreakdown" class="bar-list"></div>
        </section>
      </div>

      <div class="admin-grid admin-grid--two">
        <section class="admin-card">
          <div class="card-heading">
            <div>
              <p class="section-eyebrow">Schools</p>
              <h2>Response distribution</h2>
            </div>
          </div>
          <div id="schoolBreakdown" class="bar-list bar-list--scroll"></div>
        </section>

        <section class="admin-card">
          <div class="card-heading">
            <div>
              <p class="section-eyebrow">Ratings</p>
              <h2>Average scores</h2>
            </div>
          </div>
          <div id="ratingAverages" class="rating-summary-list"></div>
        </section>
      </div>

      <section class="admin-card">
        <div class="card-heading">
          <div>
            <p class="section-eyebrow">Recent Activity</p>
            <h2>Latest responses</h2>
          </div>
        </div>
        <div class="table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Participant</th>
                <th>Campus</th>
                <th>Batch</th>
                <th>School</th>
                <th>Average</th>
              </tr>
            </thead>
            <tbody id="latestResponses"></tbody>
          </table>
        </div>
      </section>

      <section class="admin-card">
        <div class="card-heading">
          <div>
            <p class="section-eyebrow">Qualitative Feedback</p>
            <h2>Recent comments and suggestions</h2>
          </div>
        </div>
        <div id="recentComments" class="comment-list"></div>
      </section>

      <div id="dashboardMessage" class="form-message" role="status" aria-live="polite"></div>
    </section>
  </main>

  <footer class="site-footer">
    <p>Panpacific University · 9th PIRC Admin Dashboard</p>
    <p id="adminFooterVersion"></p>
  </footer>
</body>
</html>
