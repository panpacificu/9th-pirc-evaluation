# Changelog


## 1.3.6 — Image-Based Certificate Template

- Switched certificate generation to use the official blank certificate image as the background.
- Added `apps-script/CertificateTemplate.gs` with the embedded template image.
- Overlays only the participant name on the certificate.
- Added configurable name placement and color settings.


## 1.3.5 — Rating Validation Cache Patch

- Added cache-busting query strings for CSS, config, and app JS files.
- Updated the backend rating validation message to list exactly which questions are missing.
- Helps diagnose stale frontend files after question updates.


## 1.3.4 — PanpacificU Email Restriction

- Updated the email field label to “Use your PanpacificU Email.”
- Added frontend validation requiring emails to end with `@panpacificu.edu.ph`.
- Added backend validation requiring emails to end with `@panpacificu.edu.ph`.
- Added outsider instruction to contact `pirc@panpacificu.edu.ph`.


## 1.3.3 — One Certificate Per Email

- Enabled one response per email address per batch.
- Prevents duplicate certificate generation for the same participant email.
- Updated duplicate-submission message for certificate use.


## 1.3.2 — Official Reply-To Email

- Set confirmation email reply-to address to `pirc@panpacificu.edu.ph`.


## 1.3.1 — Live Endpoint and Sheet Values

- Inserted the live Apps Script Web App URL into `config.js`.
- Inserted the live Google Spreadsheet ID into `Config.gs`.
- Confirmed the response tab name as `Evaluation Responses`.


## 1.3.0 — Evaluation Structure and Certificate Template Update

- Split Round Table Discussions into Professionals and Students.
- Added Faculty Presentations.
- Updated student presentation labels to Live Student, Video Presentations, and Poster Presentation.
- Renamed Socialization Event to Socialization Activities.
- Added Communication to Event Experience.
- Updated Le Ha Van's designation to Swinburne University of Technology, Vietnam.
- Updated certificate generation to follow the provided Batch 1 reference.
- Added Alex Brush as the certificate participant-name font.
- Added optional certificate background image support through Drive file ID.


## 1.2.2 — Speaker Validation Fix

- Removed character-for-character speaker-name validation.
- Validates only the three required speaker ratings.
- Uses canonical speaker names from `Config.gs`.
- Clears unused Speaker 4 fields automatically.
- Fixes false valid-speaker errors.


## 1.2.1 — Certificate Preview Fix

- Corrected `getLineFill().setTransparent()` to `Border.setTransparent()`.
- Added explicit Google Sheets, Mail, Slides, and Drive OAuth scopes.
- Added Apps Script reauthorization instructions.

## 1.2.0 — Speakers and Certificate Delivery

- Added Phillip Clark — Kindai University, Japan.
- Added Aurelio Agcaoili — University of Hawaii in Manoa.
- Added Le Ha Van — FPT Ho Chi Minh, Vietnam.
- Added speaker image previews.
- Reduced Batch 1 speaker evaluations to three official speakers.
- Disabled Batch 2 in the frontend and Apps Script backend.
- Added automatic PDF Certificate of Participation generation.
- Added personalized certificate attachment to the confirmation email.
- Added Certificate Status and Certificate Error columns.
- Added certificate-delivery statistics to the admin dashboard.
- Added `createCertificatePreview()` for authorization and testing.

## 1.1.0 — Admin Dashboard and Form Control

- Added the admin dashboard and server-enforced form availability switch.

## 1.0.0 — Initial Build

- Added the responsive evaluation form, Google Sheets storage, and email confirmation.
