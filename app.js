(() => {
  "use strict";

  const CONFIG = window.PIRC_CONFIG;
  const form = document.getElementById("evaluationForm");
  const batchInputs = [...document.querySelectorAll('input[name="batch"]')];
  const schoolField = document.getElementById("schoolField");
  const schoolSelect = document.getElementById("school");
  const speakerQuestions = document.getElementById("speakerQuestions");
  const presentationQuestions = document.getElementById("presentationQuestions");
  const experienceQuestions = document.getElementById("experienceQuestions");
  const comments = document.getElementById("comments");
  const commentCount = document.getElementById("commentCount");
  const submitButton = document.getElementById("submitButton");
  const formMessage = document.getElementById("formMessage");
  const successPanel = document.getElementById("successPanel");
  const successReference = document.getElementById("successReference");
  const progressBar = document.getElementById("progressBar");
  const setupNotice = document.getElementById("setupNotice");
  const fullName = document.getElementById("fullName");
  const nameError = document.getElementById("nameError");

  const ratingLabels = [
    { value: "1", label: "Very Dissatisfied" },
    { value: "2", label: "Dissatisfied" },
    { value: "3", label: "Satisfied" },
    { value: "4", label: "Very Satisfied" }
  ];

  const presentationItems = [
    { name: "liveStudentPresentations", label: "Live Student Presentations" },
    { name: "studentVideoPresentations", label: "Student Video Presentations" },
    { name: "posterSession", label: "Poster Session" }
  ];

  const experienceItems = [
    { name: "socializationEvent", label: "Socialization Event" },
    { name: "venue", label: "Venue" },
    { name: "food", label: "Food" },
    { name: "programFlow", label: "Program Flow" },
    { name: "organization", label: "Organization" },
    { name: "valueForMoney", label: "Value for Money" }
  ];

  function createSubmissionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return `PIRC-${window.crypto.randomUUID().split("-")[0].toUpperCase()}`;
    }

    const fallback = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `PIRC-${fallback}`;
  }

  function isEndpointConfigured() {
    return Boolean(
      CONFIG.ENDPOINT_URL &&
      !CONFIG.ENDPOINT_URL.includes("PASTE_") &&
      /^https:\/\/script\.google\.com\/macros\/s\//.test(CONFIG.ENDPOINT_URL)
    );
  }

  function escapeText(value) {
    const temp = document.createElement("div");
    temp.textContent = value;
    return temp.innerHTML;
  }

  function ratingRow({ name, label }) {
    const options = ratingLabels.map(({ value, label: ratingLabel }) => `
      <label class="rating-option">
        <input
          type="radio"
          name="${escapeText(name)}"
          value="${value}"
          required
          aria-label="${escapeText(label)} — ${escapeText(ratingLabel)}"
        >
        <span><em>${value}</em>${escapeText(ratingLabel)}</span>
      </label>
    `).join("");

    return `
      <div class="rating-row">
        <div class="rating-question">${escapeText(label)}</div>
        ${options}
      </div>
    `;
  }

  function renderStaticQuestions() {
    presentationQuestions.innerHTML = presentationItems.map(ratingRow).join("");
    experienceQuestions.innerHTML = experienceItems.map(ratingRow).join("");
  }

  function renderBatchFields(batch) {
    const schools = CONFIG.SCHOOLS[batch] || [];
    const speakers = CONFIG.SPEAKERS[batch] || [];

    schoolSelect.innerHTML = `
      <option value="">Select your school</option>
      ${schools.map((school) => `<option value="${escapeText(school)}">${escapeText(school)}</option>`).join("")}
    `;
    schoolSelect.disabled = false;
    schoolField.hidden = false;

    const speakerItems = speakers.map((label, index) => ({
      name: `speaker${index + 1}Rating`,
      label
    }));

    speakerItems.push({
      name: "roundTableDiscussion",
      label: "Round Table Discussion"
    });

    speakerQuestions.innerHTML = speakerItems.map(ratingRow).join("");

    speakers.slice(0, 4).forEach((speaker, index) => {
      document.getElementById(`speaker${index + 1}Name`).value = speaker;
    });

    updateProgress();
  }

  function validateNameField() {
    const value = fullName.value.trim().replace(/\s+/g, " ");
    fullName.value = value;

    const validCharacters = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ.'’\-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿÑñ.'’\-]+)+$/;
    const hasAtLeastTwoParts = value.split(" ").length >= 2;
    const valid = value.length >= 4 && hasAtLeastTwoParts && validCharacters.test(value);

    fullName.setAttribute("aria-invalid", String(!valid && value.length > 0));
    nameError.textContent = valid || !value
      ? ""
      : "Please enter at least your first and last name using letters, spaces, hyphens, apostrophes, or periods only.";

    return valid;
  }

  function updateProgress() {
    const requiredElements = [...form.querySelectorAll("[required]:not(:disabled)")];
    const uniqueFields = new Map();

    requiredElements.forEach((element) => {
      if (!uniqueFields.has(element.name)) {
        uniqueFields.set(element.name, element);
      }
    });

    const completed = [...uniqueFields.keys()].filter((name) => {
      const matching = [...form.querySelectorAll(`[name="${CSS.escape(name)}"]`)];
      if (!matching.length) return false;

      if (matching[0].type === "radio") {
        return matching.some((input) => input.checked);
      }

      return Boolean(matching[0].value.trim());
    }).length;

    const total = uniqueFields.size || 1;
    progressBar.style.width = `${Math.round((completed / total) * 100)}%`;
  }

  function setLoading(loading) {
    submitButton.disabled = loading;
    submitButton.classList.toggle("is-loading", loading);
    submitButton.querySelector(".button-label").textContent = loading
      ? "Submitting..."
      : "Submit Evaluation";
  }

  function showMessage(message, type = "error") {
    formMessage.className = `form-message is-${type}`;
    formMessage.textContent = message;
  }

  function clearMessage() {
    formMessage.className = "form-message";
    formMessage.textContent = "";
  }

  function scrollToFirstInvalid() {
    const firstInvalid = form.querySelector(":invalid");
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => firstInvalid.focus({ preventScroll: true }), 350);
    }
  }

  function collectPayload() {
    const data = Object.fromEntries(new FormData(form).entries());
    data.userAgent = navigator.userAgent;
    data.pageUrl = window.location.href;
    data.fullName = data.fullName.trim().replace(/\s+/g, " ");
    data.email = data.email.trim().toLowerCase();
    data.comments = (data.comments || "").trim();
    return data;
  }

  async function submitEvaluation(payload) {
    const response = await fetch(CONFIG.ENDPOINT_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Submission failed with HTTP ${response.status}.`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.message || "The form could not be submitted.");
    }

    return result;
  }

  batchInputs.forEach((input) => {
    input.addEventListener("change", () => renderBatchFields(input.value));
  });

  comments.addEventListener("input", () => {
    commentCount.textContent = `${comments.value.length} / 2000`;
  });

  fullName.addEventListener("blur", validateNameField);
  form.addEventListener("input", updateProgress);
  form.addEventListener("change", updateProgress);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    if (!validateNameField()) {
      showMessage("Please correct the name format before submitting.");
      fullName.scrollIntoView({ behavior: "smooth", block: "center" });
      fullName.focus({ preventScroll: true });
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      showMessage("Please answer all required questions before submitting.");
      scrollToFirstInvalid();
      return;
    }

    if (!isEndpointConfigured()) {
      showMessage("The Apps Script Web App URL has not been added in config.js yet.");
      return;
    }

    setLoading(true);

    try {
      const payload = collectPayload();
      const result = await submitEvaluation(payload);

      localStorage.setItem("pircLastSubmissionId", payload.submissionId);
      form.hidden = true;
      successReference.textContent = result.reference || payload.submissionId;
      successPanel.hidden = false;
      progressBar.style.width = "100%";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      showMessage(
        error.message ||
        "We could not submit your response. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  });

  document.getElementById("submissionId").value = createSubmissionId();
  document.getElementById("startedAt").value = new Date().toISOString();
  document.getElementById("versionText").textContent = `v${CONFIG.VERSION}`;
  document.getElementById("footerVersion").textContent = `Version ${CONFIG.VERSION}`;
  setupNotice.hidden = isEndpointConfigured();

  renderStaticQuestions();
  updateProgress();
})();
