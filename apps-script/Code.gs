const SHEET_HEADERS = Object.freeze([
  'Timestamp',
  'Submission ID',
  'Full Name',
  'Email Address',
  'Campus',
  'Batch',
  'School',
  'Speaker 1 Name',
  'Speaker 1 Rating (1-4)',
  'Speaker 2 Name',
  'Speaker 2 Rating (1-4)',
  'Speaker 3 Name',
  'Speaker 3 Rating (1-4)',
  'Speaker 4 Name',
  'Speaker 4 Rating (1-4)',
  'Round Table Discussion - Professionals (1-4)',
  'Round Table Discussion - Students (1-4)',
  'Faculty Presentations (1-4)',
  'Live Student Presentations (1-4)',
  'Student Video Presentations (1-4)',
  'Poster Presentation (1-4)',
  'Socialization Activities (1-4)',
  'Venue (1-4)',
  'Food (1-4)',
  'Program Flow (1-4)',
  'Organization (1-4)',
  'Communication (1-4)',
  'Value for Money (1-4)',
  'Comments and Suggestions',
  'Email Status',
  'Email Error',
  'User Agent',
  'Page URL',
  'Certificate Status',
  'Certificate Error'
]);

const FORM_PROPERTY_KEYS = Object.freeze({
  OPEN: 'FORM_OPEN',
  CLOSED_MESSAGE: 'FORM_CLOSED_MESSAGE',
  ADMIN_KEY: 'ADMIN_KEY'
});

function doGet(e) {
  const action = cleanText_(
    e && e.parameter ? e.parameter.action : '',
    50
  ).toLowerCase();

  if (action === 'status') {
    const status = getFormStatus_();

    return jsonResponse_({
      ok: true,
      isOpen: status.isOpen,
      closedMessage: status.closedMessage,
      version: APP_CONFIG.VERSION
    });
  }

  return jsonResponse_({
    ok: true,
    service: '9th PIRC Evaluation Form',
    version: APP_CONFIG.VERSION,
    formStatus: getFormStatus_()
  });
}

function doPost(e) {
  try {
    const request = parseJsonBody_(e);
    const action = cleanText_(request.action, 50);

    if (action) {
      return handleAdminAction_(action, request);
    }

    return handleEvaluationSubmission_(request);
  } catch (error) {
    console.error(error);

    return jsonResponse_({
      ok: false,
      message: 'An unexpected server error occurred. Please try again.',
      error: String(error && error.message ? error.message : error)
    });
  }
}

function handleEvaluationSubmission_(request) {
  const formStatus = getFormStatus_();

  if (!formStatus.isOpen) {
    return jsonResponse_({
      ok: false,
      formClosed: true,
      message: formStatus.closedMessage,
      closedMessage: formStatus.closedMessage
    });
  }

  const payload = parseSubmissionPayload_(request);
  const validation = validatePayload_(payload);

  if (!validation.ok) {
    return jsonResponse_({
      ok: false,
      message: validation.message
    });
  }

  applyCanonicalSpeakerData_(payload);

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  let sheet;
  let rowNumber;

  try {
    const lockedStatus = getFormStatus_();

    if (!lockedStatus.isOpen) {
      return jsonResponse_({
        ok: false,
        formClosed: true,
        message: lockedStatus.closedMessage,
        closedMessage: lockedStatus.closedMessage
      });
    }

    sheet = getOrCreateSheet_();

    if (isDuplicateSubmissionId_(payload.submissionId)) {
      return jsonResponse_({
        ok: true,
        duplicate: true,
        reference: payload.submissionId,
        message: 'This submission was already received.'
      });
    }

    if (
      APP_CONFIG.ENFORCE_ONE_RESPONSE_PER_EMAIL_AND_BATCH &&
      hasExistingEmailBatch_(sheet, payload.email, payload.batch)
    ) {
      return jsonResponse_({
        ok: false,
        message: 'A response and certificate for this email address and batch have already been recorded. Only one certificate can be issued per participant email.'
      });
    }

    const row = buildRow_(payload);
    rowNumber = sheet.getLastRow() + 1;
    sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);

    CacheService.getScriptCache().put(
      `submission:${payload.submissionId}`,
      'received',
      21600
    );
  } finally {
    lock.releaseLock();
  }

  if (APP_CONFIG.HIGH_TRAFFIC_MODE) {
    sheet.getRange(rowNumber, 30, 1, 2).setValues([[
      'Queued',
      ''
    ]]);

    sheet.getRange(rowNumber, 34, 1, 2).setValues([[
      'Pending',
      ''
    ]]);

    return jsonResponse_({
      ok: true,
      reference: payload.submissionId,
      highTrafficMode: true,
      emailSent: false,
      certificateSent: false,
      message:
        APP_CONFIG.HIGH_TRAFFIC_MESSAGE ||
        'Your evaluation response has been recorded. Your certificate will be emailed after the event.'
    });
  }

  const deliveryResult = sendConfirmationEmail_(payload);

  sheet.getRange(rowNumber, 30, 1, 2).setValues([[
    deliveryResult.emailSent ? 'Sent' : 'Not Sent',
    deliveryResult.emailError || ''
  ]]);

  sheet.getRange(rowNumber, 34, 1, 2).setValues([[
    deliveryResult.certificateStatus,
    deliveryResult.certificateError || ''
  ]]);

  return jsonResponse_({
    ok: true,
    reference: payload.submissionId,
    emailSent: deliveryResult.emailSent,
    certificateSent: deliveryResult.certificateStatus === 'Sent',
    message: deliveryResult.emailSent
      ? 'Response recorded. Confirmation email and certificate processing completed.'
      : 'Response recorded, but the confirmation email could not be sent.'
  });
}

function handleAdminAction_(action, request) {
  const normalizedAction = action.toLowerCase();

  if (!['admindashboard', 'setformstatus'].includes(normalizedAction)) {
    return jsonResponse_({
      ok: false,
      message: 'Unknown API action.'
    });
  }

  const authentication = verifyAdminKey_(request.adminKey);

  if (!authentication.ok) {
    Utilities.sleep(350);

    return jsonResponse_({
      ok: false,
      unauthorized: true,
      message: authentication.message
    });
  }

  if (normalizedAction === 'admindashboard') {
    return jsonResponse_({
      ok: true,
      data: getAdminDashboardData_()
    });
  }

  const formStatus = setFormStatus_(
    request.isOpen === true || String(request.isOpen) === 'true',
    cleanText_(request.closedMessage, 500)
  );

  return jsonResponse_({
    ok: true,
    formStatus: formStatus
  });
}

function setupProject() {
  const sheet = getOrCreateSheet_();
  formatHeader_(sheet);

  const properties = PropertiesService.getScriptProperties();

  if (properties.getProperty(FORM_PROPERTY_KEYS.OPEN) === null) {
    properties.setProperty(FORM_PROPERTY_KEYS.OPEN, 'true');
  }

  if (!properties.getProperty(FORM_PROPERTY_KEYS.CLOSED_MESSAGE)) {
    properties.setProperty(
      FORM_PROPERTY_KEYS.CLOSED_MESSAGE,
      APP_CONFIG.DEFAULT_CLOSED_MESSAGE
    );
  }

  Logger.log(`Setup complete: ${sheet.getName()}`);

  if (!properties.getProperty(FORM_PROPERTY_KEYS.ADMIN_KEY)) {
    Logger.log(
      'Admin key is not configured. Add ADMIN_KEY under Project Settings > Script properties.'
    );
  }
}

/**
 * Run this once after installing v1.2.0.
 * It requests Slides and Drive permissions and creates a certificate preview.
 */
function createCertificatePreview() {
  const previewData = {
    fullName: 'Juan D. Dela Cruz',
    submissionId: 'PIRC-PREVIEW',
    batch: 'Batch 1',
    campus: 'Urdaneta',
    school: 'Panpacific University'
  };

  const certificateBlob = generateCertificatePdf_(previewData);
  const file = DriveApp.createFile(certificateBlob);
  Logger.log(`Certificate preview: ${file.getUrl()}`);
  return file.getUrl();
}

function parseJsonBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('No request payload was received.');
  }

  return JSON.parse(e.postData.contents);
}

function parseSubmissionPayload_(data) {
  return {
    submissionId: cleanText_(data.submissionId, 80),
    startedAt: cleanText_(data.startedAt, 60),
    fullName: cleanText_(data.fullName, 100),
    email: cleanText_(data.email, 150).toLowerCase(),
    campus: cleanText_(data.campus, 30),
    batch: cleanText_(data.batch, 30),
    school: cleanText_(data.school, 180),
    speaker1Name: cleanText_(data.speaker1Name, 180),
    speaker1Rating: cleanText_(data.speaker1Rating, 1),
    speaker2Name: cleanText_(data.speaker2Name, 180),
    speaker2Rating: cleanText_(data.speaker2Rating, 1),
    speaker3Name: cleanText_(data.speaker3Name, 180),
    speaker3Rating: cleanText_(data.speaker3Rating, 1),
    speaker4Name: cleanText_(data.speaker4Name, 180),
    speaker4Rating: cleanText_(data.speaker4Rating, 1),
    roundTableProfessionals: cleanText_(data.roundTableProfessionals, 1),
    roundTableStudents: cleanText_(data.roundTableStudents, 1),
    facultyPresentations: cleanText_(data.facultyPresentations, 1),
    liveStudentPresentations: cleanText_(data.liveStudentPresentations, 1),
    studentVideoPresentations: cleanText_(data.studentVideoPresentations, 1),
    posterSession: cleanText_(data.posterSession, 1),
    socializationActivities: cleanText_(data.socializationActivities, 1),
    venue: cleanText_(data.venue, 1),
    food: cleanText_(data.food, 1),
    programFlow: cleanText_(data.programFlow, 1),
    organization: cleanText_(data.organization, 1),
    communication: cleanText_(data.communication, 1),
    valueForMoney: cleanText_(data.valueForMoney, 1),
    comments: cleanText_(data.comments, 2000),
    website: cleanText_(data.website, 200),
    userAgent: cleanText_(data.userAgent, 500),
    pageUrl: cleanText_(data.pageUrl, 500)
  };
}

function validatePayload_(data) {
  if (data.website) {
    return { ok: false, message: 'Submission rejected.' };
  }

  if (!/^PIRC-[A-Z0-9]{6,20}$/.test(data.submissionId)) {
    return { ok: false, message: 'The submission reference is invalid.' };
  }

  if (
    data.fullName.length < 4 ||
    !/^[A-Za-zÀ-ÖØ-öø-ÿÑñ.'’\-]+(?:\s+[A-Za-zÀ-ÖØ-öø-ÿÑñ.'’\-]+)+$/.test(data.fullName)
  ) {
    return { ok: false, message: 'Please enter your full name in the requested format.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { ok: false, message: 'Please enter a valid email address.' };
  }

  const allowedEmailDomain = String(APP_CONFIG.ALLOWED_EMAIL_DOMAIN || 'panpacificu.edu.ph').toLowerCase();
  const organizerEmail = APP_CONFIG.ORGANIZER_EMAIL || 'pirc@panpacificu.edu.ph';

  if (!data.email.endsWith(`@${allowedEmailDomain}`)) {
    return {
      ok: false,
      message: `Use your PanpacificU Email. For outsiders, please contact the organizer, ${organizerEmail}.`
    };
  }

  if (!APP_CONFIG.CAMPUSES.includes(data.campus)) {
    return { ok: false, message: 'Please select a valid campus.' };
  }

  if (!APP_CONFIG.ENABLED_BATCHES.includes(data.batch)) {
    return {
      ok: false,
      message: 'The selected batch is not currently accepting responses.'
    };
  }

  const allowedSchools = APP_CONFIG.BATCH_SCHOOLS[data.batch];

  if (!allowedSchools || !allowedSchools.includes(data.school)) {
    return { ok: false, message: 'Please select a valid batch and school combination.' };
  }

  const expectedSpeakers = APP_CONFIG.BATCH_SPEAKERS[data.batch] || [];
  const submittedSpeakerRatings = [
    data.speaker1Rating,
    data.speaker2Rating,
    data.speaker3Rating,
    data.speaker4Rating
  ];

  for (let index = 0; index < expectedSpeakers.length; index += 1) {
    if (!isValidRating_(submittedSpeakerRatings[index])) {
      return {
        ok: false,
        message: 'Please rate all available speakers before submitting.'
      };
    }
  }

  const fixedRatings = [
    ['Round Table Discussion — Professionals', data.roundTableProfessionals],
    ['Round Table Discussion — Students', data.roundTableStudents],
    ['Faculty Presentations', data.facultyPresentations],
    ['Live Student Presentations', data.liveStudentPresentations],
    ['Student Video Presentations', data.studentVideoPresentations],
    ['Poster Presentation', data.posterSession],
    ['Socialization Activities', data.socializationActivities],
    ['Venue', data.venue],
    ['Food', data.food],
    ['Program Flow', data.programFlow],
    ['Organization', data.organization],
    ['Communication', data.communication],
    ['Value for Money', data.valueForMoney]
  ];

  const missingFixedRatings = fixedRatings
    .filter((pair) => !isValidRating_(pair[1]))
    .map((pair) => pair[0]);

  if (missingFixedRatings.length > 0) {
    return {
      ok: false,
      message:
        'Please complete these required rating questions: ' +
        missingFixedRatings.join(', ') +
        '. If you already answered them, refresh the page or clear the browser cache.'
    };
  }

  return { ok: true };
}

function applyCanonicalSpeakerData_(data) {
  const officialSpeakers = APP_CONFIG.BATCH_SPEAKERS[data.batch] || [];
  const ratingFields = [
    'speaker1Rating',
    'speaker2Rating',
    'speaker3Rating',
    'speaker4Rating'
  ];
  const nameFields = [
    'speaker1Name',
    'speaker2Name',
    'speaker3Name',
    'speaker4Name'
  ];

  nameFields.forEach((field, index) => {
    data[field] = officialSpeakers[index] || '';

    if (!officialSpeakers[index]) {
      data[ratingFields[index]] = '';
    }
  });
}

function isValidRating_(value) {
  return ['1', '2', '3', '4'].includes(String(value));
}

function getFormStatus_() {
  const properties = PropertiesService.getScriptProperties();
  const openValue = properties.getProperty(FORM_PROPERTY_KEYS.OPEN);
  const closedMessage =
    properties.getProperty(FORM_PROPERTY_KEYS.CLOSED_MESSAGE) ||
    APP_CONFIG.DEFAULT_CLOSED_MESSAGE;

  return {
    isOpen: openValue !== 'false',
    closedMessage: closedMessage
  };
}

function setFormStatus_(isOpen, closedMessage) {
  const properties = PropertiesService.getScriptProperties();
  const finalMessage =
    closedMessage ||
    properties.getProperty(FORM_PROPERTY_KEYS.CLOSED_MESSAGE) ||
    APP_CONFIG.DEFAULT_CLOSED_MESSAGE;

  properties.setProperties({
    [FORM_PROPERTY_KEYS.OPEN]: isOpen ? 'true' : 'false',
    [FORM_PROPERTY_KEYS.CLOSED_MESSAGE]: finalMessage
  });

  return {
    isOpen: isOpen,
    closedMessage: finalMessage
  };
}

function verifyAdminKey_(providedKey) {
  const configuredKey = PropertiesService
    .getScriptProperties()
    .getProperty(FORM_PROPERTY_KEYS.ADMIN_KEY);

  if (!configuredKey) {
    return {
      ok: false,
      message:
        'The admin key has not been configured in Apps Script Project Settings.'
    };
  }

  const supplied = cleanText_(providedKey, 200);

  return {
    ok: supplied.length > 0 && supplied === configuredKey,
    message: 'The admin key is incorrect.'
  };
}

function getAdminDashboardData_() {
  const spreadsheet = SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
  const sheet = getOrCreateSheet_();
  const timezone =
    spreadsheet.getSpreadsheetTimeZone() ||
    Session.getScriptTimeZone() ||
    'Asia/Manila';
  const lastRow = sheet.getLastRow();
  const rows =
    lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, SHEET_HEADERS.length).getValues()
      : [];

  const todayKey = Utilities.formatDate(new Date(), timezone, 'yyyy-MM-dd');
  const campusCounts = {};
  const batchCounts = {};
  const schoolCounts = {};
  const ratingAggregates = {};
  let todayResponses = 0;
  let allRatingSum = 0;
  let allRatingCount = 0;
  let satisfiedCount = 0;
  let emailSent = 0;
  let emailNotSent = 0;
  let emailPending = 0;
  let certificateSent = 0;
  let certificateNotSent = 0;
  let certificatePending = 0;

  rows.forEach((row) => {
    const timestamp = normalizeDate_(row[0]);

    if (
      timestamp &&
      Utilities.formatDate(timestamp, timezone, 'yyyy-MM-dd') === todayKey
    ) {
      todayResponses += 1;
    }

    incrementCount_(campusCounts, row[4]);
    incrementCount_(batchCounts, row[5]);
    incrementCount_(schoolCounts, row[6]);

    const speakerPairs = [
      [row[7], row[8]],
      [row[9], row[10]],
      [row[11], row[12]],
      [row[13], row[14]]
    ];

    speakerPairs.forEach((pair) => {
      const name = cleanText_(pair[0], 180);
      const rating = Number(pair[1]);

      if (name && isDashboardRating_(rating)) {
        addRatingAggregate_(ratingAggregates, name, rating);
        allRatingSum += rating;
        allRatingCount += 1;
        if (rating >= 3) satisfiedCount += 1;
      }
    });

    const fixedRatings = [
      ['Round Table Discussion - Professionals', row[15]],
      ['Round Table Discussion - Students', row[16]],
      ['Faculty Presentations', row[17]],
      ['Live Student Presentations', row[18]],
      ['Student Video Presentations', row[19]],
      ['Poster Presentation', row[20]],
      ['Socialization Activities', row[21]],
      ['Venue', row[22]],
      ['Food', row[23]],
      ['Program Flow', row[24]],
      ['Organization', row[25]],
      ['Communication', row[26]],
      ['Value for Money', row[27]]
    ];

    fixedRatings.forEach((pair) => {
      const rating = Number(pair[1]);

      if (isDashboardRating_(rating)) {
        addRatingAggregate_(ratingAggregates, pair[0], rating);
        allRatingSum += rating;
        allRatingCount += 1;
        if (rating >= 3) satisfiedCount += 1;
      }
    });

    const emailStatus = cleanText_(row[29], 40).toLowerCase();

    if (emailStatus === 'sent') {
      emailSent += 1;
    } else if (emailStatus === 'not sent') {
      emailNotSent += 1;
    } else {
      emailPending += 1;
    }

    const certificateStatus = cleanText_(row[33], 80).toLowerCase();

    if (certificateStatus === 'sent') {
      certificateSent += 1;
    } else if (certificateStatus && certificateStatus !== 'pending') {
      certificateNotSent += 1;
    } else {
      certificatePending += 1;
    }
  });

  const latestResponses = rows
    .slice(-15)
    .reverse()
    .map((row) => {
      const ratings = [
        row[8], row[10], row[12], row[14], row[15], row[16], row[17],
        row[18], row[19], row[20], row[21], row[22], row[23], row[24],
        row[25], row[26], row[27]
      ]
        .map(Number)
        .filter(isDashboardRating_);

      return {
        timestamp: serializeDate_(row[0]),
        fullName: cleanText_(row[2], 100),
        email: cleanText_(row[3], 150),
        campus: cleanText_(row[4], 30),
        batch: cleanText_(row[5], 30),
        school: cleanText_(row[6], 180),
        average: ratings.length
          ? roundNumber_(
              ratings.reduce((sum, value) => sum + value, 0) / ratings.length,
              2
            )
          : null
      };
    });

  const recentComments = rows
    .filter((row) => cleanText_(row[28], 2000))
    .slice(-20)
    .reverse()
    .map((row) => ({
      timestamp: serializeDate_(row[0]),
      fullName: cleanText_(row[2], 100),
      batch: cleanText_(row[5], 30),
      comment: cleanText_(row[28], 2000)
    }));

  const ratingAverages = Object.keys(ratingAggregates)
    .map((label) => {
      const aggregate = ratingAggregates[label];

      return {
        label: label,
        average: roundNumber_(aggregate.sum / aggregate.count, 2),
        count: aggregate.count
      };
    })
    .sort((a, b) => b.average - a.average || a.label.localeCompare(b.label));

  return {
    generatedAt: new Date().toISOString(),
    spreadsheetUrl: spreadsheet.getUrl(),
    totalResponses: rows.length,
    todayResponses: todayResponses,
    overallAverage: allRatingCount
      ? roundNumber_(allRatingSum / allRatingCount, 2)
      : 0,
    satisfactionRate: allRatingCount
      ? roundNumber_((satisfiedCount / allRatingCount) * 100, 1)
      : 0,
    emailSent: emailSent,
    emailNotSent: emailNotSent,
    emailPending: emailPending,
    certificateSent: certificateSent,
    certificateNotSent: certificateNotSent,
    certificatePending: certificatePending,
    campusCounts: objectCountsToArray_(campusCounts),
    batchCounts: objectCountsToArray_(batchCounts),
    schoolCounts: objectCountsToArray_(schoolCounts),
    ratingAverages: ratingAverages,
    latestResponses: latestResponses,
    recentComments: recentComments,
    formStatus: getFormStatus_()
  };
}

function incrementCount_(target, value) {
  const key = cleanText_(value, 180) || 'Not Specified';
  target[key] = (target[key] || 0) + 1;
}

function objectCountsToArray_(counts) {
  return Object.keys(counts)
    .map((label) => ({
      label: label,
      value: counts[label]
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

function addRatingAggregate_(target, label, rating) {
  if (!target[label]) {
    target[label] = { sum: 0, count: 0 };
  }

  target[label].sum += rating;
  target[label].count += 1;
}

function isDashboardRating_(value) {
  return Number.isFinite(value) && value >= 1 && value <= 4;
}

function normalizeDate_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function serializeDate_(value) {
  const date = normalizeDate_(value);
  return date ? date.toISOString() : '';
}

function roundNumber_(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function getOrCreateSheet_() {
  if (
    !APP_CONFIG.SPREADSHEET_ID ||
    APP_CONFIG.SPREADSHEET_ID.includes('PASTE_')
  ) {
    throw new Error('Set APP_CONFIG.SPREADSHEET_ID in Config.gs first.');
  }

  const spreadsheet = SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(APP_CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(APP_CONFIG.SHEET_NAME);
  }

  const hasHeaders = sheet.getLastRow() > 0;

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
    formatHeader_(sheet);
  } else {
    const currentHeaders = sheet
      .getRange(1, 1, 1, SHEET_HEADERS.length)
      .getValues()[0];

    if (currentHeaders.join('|') !== SHEET_HEADERS.join('|')) {
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
      formatHeader_(sheet);
    }
  }

  return sheet;
}

function formatHeader_(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
  headerRange
    .setBackground('#075CAA')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setWrap(true);

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 44);
}

function buildRow_(data) {
  return [
    new Date(),
    data.submissionId,
    data.fullName,
    data.email,
    data.campus,
    data.batch,
    data.school,
    data.speaker1Name,
    sheetRating_(data.speaker1Rating),
    data.speaker2Name,
    sheetRating_(data.speaker2Rating),
    data.speaker3Name,
    sheetRating_(data.speaker3Rating),
    data.speaker4Name,
    sheetRating_(data.speaker4Rating),
    sheetRating_(data.roundTableProfessionals),
    sheetRating_(data.roundTableStudents),
    sheetRating_(data.facultyPresentations),
    sheetRating_(data.liveStudentPresentations),
    sheetRating_(data.studentVideoPresentations),
    sheetRating_(data.posterSession),
    sheetRating_(data.socializationActivities),
    sheetRating_(data.venue),
    sheetRating_(data.food),
    sheetRating_(data.programFlow),
    sheetRating_(data.organization),
    sheetRating_(data.communication),
    sheetRating_(data.valueForMoney),
    data.comments,
    'Pending',
    '',
    data.userAgent,
    data.pageUrl,
    'Pending',
    ''
  ];
}
function sheetRating_(value) {
  return isValidRating_(value) ? Number(value) : '';
}

function isDuplicateSubmissionId_(submissionId) {
  return CacheService
    .getScriptCache()
    .get(`submission:${submissionId}`) === 'received';
}

function hasExistingEmailBatch_(sheet, email, batch) {
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    return false;
  }

  const rows = sheet.getRange(2, 4, lastRow - 1, 3).getValues();

  return rows.some((row) =>
    String(row[0]).toLowerCase() === email &&
    String(row[2]) === batch
  );
}

function sendConfirmationEmail_(data) {
  if (!APP_CONFIG.EMAIL.ENABLED) {
    return {
      emailSent: false,
      emailError: 'Email sending is disabled in Config.gs.',
      certificateStatus: 'Not Sent',
      certificateError: 'Email sending is disabled.'
    };
  }

  let certificateBlob = null;
  let certificateError = '';

  if (APP_CONFIG.CERTIFICATE.ENABLED) {
    try {
      certificateBlob = generateCertificatePdf_(data);
    } catch (error) {
      console.error(error);
      certificateError = String(
        error && error.message ? error.message : error
      ).slice(0, 500);
    }
  }

  try {
    const email = buildConfirmationEmail_(data, Boolean(certificateBlob));

    const options = {
      to: data.email,
      subject: APP_CONFIG.EMAIL.SUBJECT,
      body: email.plainText,
      htmlBody: email.html,
      name: APP_CONFIG.EMAIL.SENDER_NAME
    };

    if (certificateBlob) {
      options.attachments = [certificateBlob];
    }

    if (
      APP_CONFIG.EMAIL.REPLY_TO &&
      !APP_CONFIG.EMAIL.REPLY_TO.includes('PASTE_')
    ) {
      options.replyTo = APP_CONFIG.EMAIL.REPLY_TO;
    }

    MailApp.sendEmail(options);

    return {
      emailSent: true,
      emailError: '',
      certificateStatus: certificateBlob
        ? 'Sent'
        : APP_CONFIG.CERTIFICATE.ENABLED
          ? 'Not Generated'
          : 'Disabled',
      certificateError: certificateError
    };
  } catch (error) {
    console.error(error);

    return {
      emailSent: false,
      emailError: String(
        error && error.message ? error.message : error
      ).slice(0, 500),
      certificateStatus: certificateBlob
        ? 'Generated - Email Failed'
        : APP_CONFIG.CERTIFICATE.ENABLED
          ? 'Not Generated'
          : 'Disabled',
      certificateError: certificateError
    };
  }
}


function generateCertificatePdf_(data) {
  const presentationName =
    `${APP_CONFIG.CERTIFICATE.FILE_PREFIX}-${data.submissionId}`;
  const presentation = SlidesApp.create(presentationName);
  const presentationId = presentation.getId();

  try {
    const slide = presentation.getSlides()[0];
    slide.getPageElements().forEach((element) => element.remove());
    slide.getBackground().setSolidFill('#FFFFFF');

    const templateBlob = getCertificateTemplateBlob_();
    slide.insertImage(templateBlob, 0, 0, 720, 405);

    const box = APP_CONFIG.CERTIFICATE.NAME_BOX || {
      LEFT: 120,
      TOP: 168,
      WIDTH: 480,
      HEIGHT: 54
    };

    const nameFont = APP_CONFIG.CERTIFICATE.NAME_FONT || 'Alex Brush';
    const nameColor = APP_CONFIG.CERTIFICATE.NAME_COLOR || '#3B762F';
    const normalizedName = String(data.fullName || '').trim();
    const nameSize =
      normalizedName.length > 42 ? 28 :
      normalizedName.length > 32 ? 33 :
      normalizedName.length > 24 ? 38 :
      42;

    addCertificateText_(
      slide,
      normalizedName,
      box.LEFT,
      box.TOP,
      box.WIDTH,
      box.HEIGHT,
      {
        fontSize: nameSize,
        bold: false,
        fontFamily: nameFont,
        color: nameColor,
        align: SlidesApp.ParagraphAlignment.CENTER
      }
    );

    presentation.saveAndClose();
    Utilities.sleep(700);

    const presentationFile = DriveApp.getFileById(presentationId);
    const safeName = sanitizeFileName_(normalizedName);
    const pdfBlob = presentationFile
      .getAs(MimeType.PDF)
      .setName(
        `${APP_CONFIG.CERTIFICATE.FILE_PREFIX}-${safeName}-${data.submissionId}.pdf`
      );

    presentationFile.setTrashed(true);
    return pdfBlob;
  } catch (error) {
    try {
      presentation.saveAndClose();
    } catch (closeError) {
      console.error(closeError);
    }

    try {
      DriveApp.getFileById(presentationId).setTrashed(true);
    } catch (trashError) {
      console.error(trashError);
    }

    throw error;
  }
}

function getCertificateTemplateBlob_() {
  if (
    typeof CERTIFICATE_TEMPLATE_IMAGE !== 'undefined' &&
    CERTIFICATE_TEMPLATE_IMAGE &&
    CERTIFICATE_TEMPLATE_IMAGE.BASE64
  ) {
    const bytes = Utilities.base64Decode(CERTIFICATE_TEMPLATE_IMAGE.BASE64);
    return Utilities.newBlob(
      bytes,
      CERTIFICATE_TEMPLATE_IMAGE.MIME_TYPE || 'image/jpeg',
      'certificate-template.jpg'
    );
  }

  const templateFileId = APP_CONFIG.CERTIFICATE.TEMPLATE_IMAGE_FILE_ID || '';

  if (templateFileId) {
    return DriveApp.getFileById(templateFileId).getBlob();
  }

  throw new Error(
    'Certificate template image is missing. Add CertificateTemplate.gs or set TEMPLATE_IMAGE_FILE_ID in Config.gs.'
  );
}

function addCertificateShape_(
  slide,
  shapeType,
  left,
  top,
  width,
  height,
  fillColor
) {
  const shape = slide.insertShape(shapeType, left, top, width, height);
  shape.getFill().setSolidFill(fillColor);
  shape.getBorder().setTransparent();
  return shape;
}

function addCertificateText_(
  slide,
  text,
  left,
  top,
  width,
  height,
  options
) {
  const shape = slide.insertTextBox(
    String(text),
    left,
    top,
    width,
    height
  );

  shape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);

  const textRange = shape.getText();
  const style = textRange.getTextStyle();

  style.setFontFamily(options.fontFamily || 'Inter');
  style.setFontSize(options.fontSize || 10);
  style.setForegroundColor(options.color || '#10243E');
  style.setBold(Boolean(options.bold));

  textRange
    .getParagraphStyle()
    .setParagraphAlignment(
      options.align || SlidesApp.ParagraphAlignment.CENTER
    );

  return shape;
}

function sanitizeFileName_(value) {
  const safe = String(value || 'Participant')
    .replace(/[\\/:*?"<>|#%{}~&]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

  return safe || 'Participant';
}


function processPendingCertificates() {
  return processPendingCertificatesBatch_(25);
}

function processPendingCertificatesSmallBatch() {
  return processPendingCertificatesBatch_(10);
}

function processPendingCertificatesLargeBatch() {
  return processPendingCertificatesBatch_(50);
}

function processPendingCertificatesBatch_(limit) {
  const sheet = getOrCreateSheet_();
  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    console.log('No responses to process.');
    return;
  }

  const rowCount = lastRow - 1;
  const values = sheet.getRange(2, 1, rowCount, SHEET_HEADERS.length).getValues();
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (let index = 0; index < values.length; index += 1) {
    if (processed >= limit) {
      break;
    }

    const row = values[index];
    const actualRowNumber = index + 2;
    const emailStatus = cleanText_(row[29], 40).toLowerCase();
    const certificateStatus = cleanText_(row[33], 80).toLowerCase();

    const alreadyDone =
      emailStatus === 'sent' ||
      certificateStatus === 'attached' ||
      certificateStatus === 'sent';

    if (alreadyDone) {
      skipped += 1;
      continue;
    }

    const data = rowToSubmissionData_(row);

    if (!data.email || !data.fullName || !data.submissionId) {
      const error = 'Missing required recipient data.';
      sheet.getRange(actualRowNumber, 30, 1, 2).setValues([['Failed', error]]);
      sheet.getRange(actualRowNumber, 34, 1, 2).setValues([['Failed', error]]);
      failed += 1;
      continue;
    }

    try {
      const deliveryResult = sendConfirmationEmail_(data);

      sheet.getRange(actualRowNumber, 30, 1, 2).setValues([[
        deliveryResult.emailSent ? 'Sent' : 'Not Sent',
        deliveryResult.emailError || ''
      ]]);

      sheet.getRange(actualRowNumber, 34, 1, 2).setValues([[
        deliveryResult.certificateStatus,
        deliveryResult.certificateError || ''
      ]]);

      processed += 1;
    } catch (error) {
      const message = String(error && error.message ? error.message : error);

      sheet.getRange(actualRowNumber, 30, 1, 2).setValues([[
        'Failed',
        message
      ]]);

      sheet.getRange(actualRowNumber, 34, 1, 2).setValues([[
        'Failed',
        message
      ]]);

      failed += 1;
    }

    Utilities.sleep(500);
  }

  console.log(
    `Pending certificate processing complete. Processed: ${processed}; skipped: ${skipped}; failed: ${failed}; limit: ${limit}.`
  );
}

function rowToSubmissionData_(row) {
  return {
    submissionId: cleanText_(row[1], 80),
    fullName: cleanText_(row[2], 120),
    email: cleanText_(row[3], 160).toLowerCase(),
    campus: cleanText_(row[4], 80),
    batch: cleanText_(row[5], 80),
    school: cleanText_(row[6], 180),
    speaker1Name: cleanText_(row[7], 180),
    speaker1Rating: cleanText_(row[8], 1),
    speaker2Name: cleanText_(row[9], 180),
    speaker2Rating: cleanText_(row[10], 1),
    speaker3Name: cleanText_(row[11], 180),
    speaker3Rating: cleanText_(row[12], 1),
    speaker4Name: cleanText_(row[13], 180),
    speaker4Rating: cleanText_(row[14], 1),
    roundTableProfessionals: cleanText_(row[15], 1),
    roundTableStudents: cleanText_(row[16], 1),
    facultyPresentations: cleanText_(row[17], 1),
    liveStudentPresentations: cleanText_(row[18], 1),
    studentVideoPresentations: cleanText_(row[19], 1),
    posterSession: cleanText_(row[20], 1),
    socializationActivities: cleanText_(row[21], 1),
    venue: cleanText_(row[22], 1),
    food: cleanText_(row[23], 1),
    programFlow: cleanText_(row[24], 1),
    organization: cleanText_(row[25], 1),
    communication: cleanText_(row[26], 1),
    valueForMoney: cleanText_(row[27], 1),
    comments: cleanText_(row[28], 2000),
    userAgent: cleanText_(row[31], 500),
    pageUrl: cleanText_(row[32], 500)
  };
}


function buildConfirmationEmail_(data, certificateIncluded) {
  const safeName = escapeHtml_(data.fullName);
  const safeBatch = escapeHtml_(data.batch);
  const safeCampus = escapeHtml_(data.campus);
  const safeSchool = escapeHtml_(data.school);
  const safeReference = escapeHtml_(data.submissionId);

  const certificateLine = certificateIncluded
    ? 'Your personalized Certificate of Participation is attached to this email as a PDF.'
    : 'Your response was recorded, but the certificate could not be attached automatically. Please contact the event secretariat if needed.';

  const plainText = [
    `Hello ${data.fullName},`,
    '',
    'Thank you for completing the 9th PIRC Evaluation Form.',
    certificateLine,
    '',
    `Reference Number: ${data.submissionId}`,
    `Batch: ${data.batch}`,
    `Campus: ${data.campus}`,
    `School: ${data.school}`,
    '',
    'Your name on the certificate was generated exactly as submitted.',
    '',
    '9th PIRC Secretariat',
    'Panpacific University'
  ].join('\n');

  const attachmentNotice = certificateIncluded
    ? `
      <div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#eef9f3;color:#17653d;font-size:13px;line-height:1.55;">
        Your personalized <strong>Certificate of Participation</strong> is attached to this email as a PDF.
      </div>
    `
    : `
      <div style="margin:18px 0;padding:14px 16px;border-radius:12px;background:#fff7e8;color:#8a5a00;font-size:13px;line-height:1.55;">
        Your response was recorded, but the certificate could not be attached automatically. Please contact the event secretariat if needed.
      </div>
    `;

  const html = `
    <div style="margin:0;padding:30px 14px;background:#f2f8fc;font-family:Arial,sans-serif;color:#10243e;">
      <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #dce7f1;border-radius:20px;background:#ffffff;">
        <div style="padding:26px 30px;background:linear-gradient(110deg,#359447,#008f8c,#075caa);color:#ffffff;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">9th PIRC</div>
          <div style="margin-top:6px;font-size:24px;font-weight:700;line-height:1.2;">Evaluation Response Received</div>
        </div>

        <div style="padding:30px;">
          <p style="margin:0 0 16px;font-size:16px;">Hello <strong>${safeName}</strong>,</p>
          <p style="margin:0;color:#52657a;line-height:1.65;">
            Thank you for completing the 9th Panpacific International Research Conference Evaluation Form.
            Your response has been successfully recorded.
          </p>

          ${attachmentNotice}

          <div style="padding:18px;border:1px solid #dce7f1;border-radius:14px;background:#f7fbff;">
            <div style="margin-bottom:11px;"><span style="color:#64748b;">Reference Number:</span><br><strong style="color:#075caa;">${safeReference}</strong></div>
            <div style="margin-bottom:11px;"><span style="color:#64748b;">Batch:</span><br><strong>${safeBatch}</strong></div>
            <div style="margin-bottom:11px;"><span style="color:#64748b;">Campus:</span><br><strong>${safeCampus}</strong></div>
            <div><span style="color:#64748b;">School:</span><br><strong>${safeSchool}</strong></div>
          </div>

          <p style="margin:20px 0 0;color:#52657a;font-size:13px;line-height:1.6;">
            The participant name used for the certificate is:
            <strong>${safeName}</strong>.
          </p>
        </div>

        <div style="padding:18px 30px;border-top:1px solid #e6eef5;color:#64748b;background:#fbfdff;font-size:12px;">
          9th PIRC Secretariat · Panpacific University
        </div>
      </div>
    </div>
  `;

  return { plainText, html };
}

function cleanText_(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, maxLength);
}

function escapeHtml_(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
