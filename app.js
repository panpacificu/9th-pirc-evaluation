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
  const formStatusLoading = document.getElementById("formStatusLoading");
  const closedPanel = document.getElementById("closedPanel");
  const closedMessage = document.getElementById("closedMessage");

  let formIsOpen = true;

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
    temp.textContent = value ?? "";
    return temp.innerHTML;
  }

  function buildQuestionContent(item) {
    if (!item.image) {
      return escapeText(item.label);
    }

    return `
      <div class="speaker-question">
        <img
          class="speaker-avatar"
          src="${escapeText(item.image)}"
          alt=""
          loading="lazy"
        >
        <div class="speaker-copy">
          <strong>${escapeText(item.label)}</strong>
          <small>${escapeText(item.designation)}</small>
        </div>
      </div>
    `;
  }

  function ratingRow(item) {
    const options = ratingLabels.map(({ value, label: ratingLabel }) => `
      <label class="rating-option">
        <input
          type="radio"
          name="${escapeText(item.name)}"
          value="${value}"
          required
          aria-label="${escapeText(item.label)} — ${escapeText(ratingLabel)}"
        >
        <span><em>${value}</em>${escapeText(ratingLabel)}</span>
      </label>
    `).join("");

    return `
      <div class="rating-row ${item.image ? "rating-row--speaker" : ""}">
        <div class="rating-question">${buildQuestionContent(item)}</div>
        ${options}
      </div>
    `;
  }

  function renderStaticQuestions() {
    presentationQuestions.innerHTML = presentationItems.map(ratingRow).join("");
    experienceQuestions.innerHTML = experienceItems.map(ratingRow).join("");
  }

  function clearSpeakerHiddenFields() {
    for (let index = 1; index <= 4; index += 1) {
      const field = document.getElementById(`speaker${index}Name`);
      if (field) field.value = "";
    }
  }

  function renderBatchFields(batch) {
    if (!CONFIG.ENABLED_BATCHES.includes(batch)) {
      return;
    }

    const schools = CONFIG.SCHOOLS[batch] || [];
    const speakers = CONFIG.SPEAKERS[batch] || [];

    schoolSelect.innerHTML = `
      <option value="">Select your school</option>
      ${schools.map((school) => `<option value="${escapeText(school)}">${escapeText(school)}</option>`).join("")}
    `;
    schoolSelect.disabled = false;
    schoolField.hidden = false;

    const speakerItems = speakers.map((speaker, index) => ({
      name: `speaker${index + 1}Rating`,
      label: speaker.name,
      designation: speaker.designation,
      image: speaker.image
    }));

    speakerItems.push({
      name: "roundTableDiscussion",
      label: "Round Table Discussion"
    });

    speakerQuestions.innerHTML = speakerItems.map(ratingRow).join("");

    clearSpeakerHiddenFields();

    speakers.slice(0, 4).forEach((speaker, index) => {
      document.getElementById(`speaker${index + 1}Name`).value =
        `${speaker.name} — ${speaker.designation}`;
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

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      redirect: "follow",
      cache: "no-store",
      ...options
    });

    if (!response.ok) {
      throw new Error(`Request failed with HTTP ${response.status}.`);
    }

    return response.json();
  }

  async function loadFormStatus() {
    if (!isEndpointConfigured()) {
      setupNotice.hidden = false;
      formStatusLoading.hidden = true;
      form.hidden = false;
      return;
    }

    try {
      const separator = CONFIG.ENDPOINT_URL.includes("?") ? "&" : "?";
      const status = await requestJson(
        `${CONFIG.ENDPOINT_URL}${separator}action=status&_=${Date.now()}`
      );

      formIsOpen = status.isOpen !== false;
      formStatusLoading.hidden = true;

      if (formIsOpen) {
        form.hidden = false;
        closedPanel.hidden = true;
      } else {
        form.hidden = true;
        closedPanel.hidden = false;
        closedMessage.textContent =
          status.closedMessage ||
          "We are not currently accepting responses. Please check again later.";
      }
    } catch (error) {
      console.error("Unable to verify form status:", error);
      formStatusLoading.hidden = true;
      form.hidden = false;
      showMessage(
        "The form status could not be verified. You may continue, but submission will still be checked by the server.",
        "error"
      );
    }
  }

  async function submitEvaluation(payload) {
    const result = await requestJson(CONFIG.ENDPOINT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!result.ok) {
      if (result.formClosed) {
        formIsOpen = false;
        form.hidden = true;
        closedPanel.hidden = false;
        closedMessage.textContent =
          result.closedMessage ||
          result.message ||
          "We are not currently accepting responses.";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

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

    if (!formIsOpen) {
      showMessage("The evaluation form is no longer accepting responses.");
      return;
    }

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

      if (formIsOpen) {
        showMessage(
          error.message ||
          "We could not submit your response. Please check your internet connection and try again."
        );
      }
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
  loadFormStatus();
})();
