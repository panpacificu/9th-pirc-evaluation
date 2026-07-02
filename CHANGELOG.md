# Changelog


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
