<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#075CAA">
  <meta name="description" content="9th Panpacific International Research Conference Evaluation Form">
  <title>9th PIRC Evaluation Form</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="styles.css">
  <script defer src="config.js"></script>
  <script defer src="app.js"></script>
</head>
<body>
  <div class="page-ribbon page-ribbon--one" aria-hidden="true"></div>
  <div class="page-ribbon page-ribbon--two" aria-hidden="true"></div>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="#top" aria-label="9th PIRC Evaluation Form">
        <span class="brand-mark" aria-hidden="true">
          <span></span><span></span><span></span>
        </span>
        <span class="brand-copy">
          <strong>9th PIRC</strong>
          <small>Panpacific International Research Conference</small>
        </span>
      </a>

      <div class="header-meta">
        <span class="header-pill">Unity &amp; Diversity</span>
        <span id="versionText" class="version-text"></span>
      </div>
    </div>

    <div class="progress-track" aria-hidden="true">
      <div id="progressBar" class="progress-bar"></div>
    </div>
  </header>

  <main id="top" class="page-shell">
    <section class="hero">
      <div class="hero-kicker">Conference Evaluation</div>
      <h1>Help us improve the <span>9th PIRC experience.</span></h1>
      <p>
        Please rate the conference activities and services based on your actual experience.
        Your responses will be treated with care and used for program improvement.
      </p>

      <div class="hero-details" aria-label="Conference details">
        <div>
          <span class="detail-label">Batch 1</span>
          <strong>July 13–14, 2026</strong>
        </div>
        <div>
          <span class="detail-label">Batch 2</span>
          <strong>July 23–24, 2026</strong>
        </div>
        <div>
          <span class="detail-label">Venue</span>
          <strong>Urdaneta City Cultural and Sports Center</strong>
        </div>
      </div>
    </section>

    <div id="setupNotice" class="setup-notice" hidden>
      <strong>Setup required:</strong>
      Add the deployed Apps Script Web App URL in <code>config.js</code> before accepting live responses.
    </div>

    <section id="formStatusLoading" class="status-panel status-panel--loading">
      <div class="status-spinner" aria-hidden="true"></div>
      <p>Checking whether the evaluation form is accepting responses...</p>
    </section>

    <section id="closedPanel" class="status-panel status-panel--closed" hidden>
      <div class="closed-icon" aria-hidden="true">—</div>
      <p class="section-eyebrow">Responses Closed</p>
      <h2>The evaluation form is currently unavailable.</h2>
      <p id="closedMessage">
        We are not currently accepting responses. Please check again later.
      </p>
    </section>

    <form id="evaluationForm" class="survey-form" novalidate hidden>
      <input type="text" name="website" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
      <input type="hidden" name="submissionId" id="submissionId">
      <input type="hidden" name="startedAt" id="startedAt">
      <input type="hidden" name="speaker1Name" id="speaker1Name">
      <input type="hidden" name="speaker2Name" id="speaker2Name">
      <input type="hidden" name="speaker3Name" id="speaker3Name">
      <input type="hidden" name="speaker4Name" id="speaker4Name">

      <section class="form-card" aria-labelledby="participantHeading">
        <div class="section-heading">
          <span class="section-number">01</span>
          <div>
            <p class="section-eyebrow">Participant Information</p>
            <h2 id="participantHeading">Tell us about yourself</h2>
          </div>
        </div>

        <div class="field-grid">
          <div class="field field--full">
            <label for="fullName">Full Name <span aria-hidden="true">*</span></label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              maxlength="100"
              autocomplete="name"
              placeholder="Juan D. Dela Cruz"
              aria-describedby="nameHelp nameError"
            >
            <p id="nameHelp" class="field-help">
              Use the format: First Name M.I. Last Name. This is how your name will appear on your e-certificate of participation.
            </p>
            <p id="nameError" class="field-error" aria-live="polite"></p>
          </div>

          <div class="field field--full">
            <label for="email">Email Address <span aria-hidden="true">*</span></label>
            <input
              id="email"
              name="email"
              type="email"
              required
              maxlength="150"
              autocomplete="email"
              placeholder="name@example.com"
            >
            <p class="field-help">Your confirmation email will be sent to this address.</p>
          </div>

          <fieldset class="field">
            <legend>Campus <span aria-hidden="true">*</span></legend>
            <div class="choice-pills choice-pills--two">
              <label><input type="radio" name="campus" value="Tayug" required><span>Tayug</span></label>
              <label><input type="radio" name="campus" value="Urdaneta" required><span>Urdaneta</span></label>
            </div>
          </fieldset>

          <fieldset class="field">
            <legend>Batch <span aria-hidden="true">*</span></legend>
            <div class="choice-pills choice-pills--two">
              <label>
                <input type="radio" name="batch" value="Batch 1" required>
                <span><strong>Batch 1</strong><small>Now available</small></span>
              </label>
              <label class="choice-disabled" aria-label="Batch 2 is not yet available">
                <input type="radio" name="batch" value="Batch 2" disabled>
                <span><strong>Batch 2</strong><small>Available later</small></span>
              </label>
            </div>
          </fieldset>

          <div id="schoolField" class="field field--full conditional-field" hidden>
            <label for="school">School <span aria-hidden="true">*</span></label>
            <select id="school" name="school" required disabled>
              <option value="">Select your school</option>
            </select>
          </div>
        </div>
      </section>

      <section class="form-card" aria-labelledby="speakerHeading">
        <div class="section-heading">
          <span class="section-number">02</span>
          <div>
            <p class="section-eyebrow">Conference Speakers</p>
            <h2 id="speakerHeading">Rate the speakers and discussion</h2>
          </div>
        </div>

        <p class="section-intro">
          Rate each Batch 1 speaker based on your conference experience.
        </p>

        <div class="scale-key" aria-label="Rating scale">
          <span><b>1</b> Very Dissatisfied</span>
          <span><b>2</b> Dissatisfied</span>
          <span><b>3</b> Satisfied</span>
          <span><b>4</b> Very Satisfied</span>
        </div>

        <div id="speakerQuestions" class="rating-list">
          <div class="empty-state">
            Select your batch first to load the speaker evaluation.
          </div>
        </div>
      </section>

      <section class="form-card" aria-labelledby="roundTableHeading">
        <div class="section-heading">
          <span class="section-number">03</span>
          <div>
            <p class="section-eyebrow">Round Table Discussions</p>
            <h2 id="roundTableHeading">Rate the discussion sessions</h2>
          </div>
        </div>

        <div id="roundTableQuestions" class="rating-list"></div>
      </section>

      <section class="form-card" aria-labelledby="presentationHeading">
        <div class="section-heading">
          <span class="section-number">04</span>
          <div>
            <p class="section-eyebrow">Presentations</p>
            <h2 id="presentationHeading">Rate the faculty and student presentations</h2>
          </div>
        </div>

        <div id="presentationQuestions" class="rating-list"></div>
      </section>

      <section class="form-card" aria-labelledby="experienceHeading">
        <div class="section-heading">
          <span class="section-number">05</span>
          <div>
            <p class="section-eyebrow">Overall Experience</p>
            <h2 id="experienceHeading">Rate the event experience</h2>
          </div>
        </div>

        <div id="experienceQuestions" class="rating-list"></div>
      </section>

      <section class="form-card" aria-labelledby="commentsHeading">
        <div class="section-heading">
          <span class="section-number">06</span>
          <div>
            <p class="section-eyebrow">Open Feedback</p>
            <h2 id="commentsHeading">Comments and suggestions</h2>
          </div>
        </div>

        <div class="field">
          <label for="comments">Share any feedback that can help improve future PIRC activities.</label>
          <textarea
            id="comments"
            name="comments"
            rows="6"
            maxlength="2000"
            placeholder="Type your comments and suggestions here..."
          ></textarea>
          <div class="textarea-meta"><span>Optional</span><span id="commentCount">0 / 2000</span></div>
        </div>
      </section>

      <section class="submit-card">
        <div>
          <p class="submit-title">Ready to submit?</p>
          <p class="submit-copy">
            Please review your answers. An automatic confirmation email will be sent after a successful submission.
          </p>
        </div>
        <button id="submitButton" class="submit-button" type="submit">
          <span class="button-label">Submit Evaluation</span>
          <span class="button-loader" aria-hidden="true"></span>
        </button>
      </section>

      <div id="formMessage" class="form-message" role="status" aria-live="polite"></div>
    </form>

    <section id="successPanel" class="success-panel" hidden>
      <div class="success-icon" aria-hidden="true">✓</div>
      <p class="section-eyebrow">Response Received</p>
      <h2>Thank you for evaluating the 9th PIRC.</h2>
      <p>
        Your response has been recorded. Please check your email for the confirmation message.
      </p>
      <div class="reference-box">
        <span>Reference Number</span>
        <strong id="successReference"></strong>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <p>Panpacific University · 9th PIRC Evaluation Form</p>
    <p id="footerVersion"></p>
  </footer>
</body>
</html>
