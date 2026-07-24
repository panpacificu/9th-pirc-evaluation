# 9th PIRC Evaluation Form

Version **1.4.3** updates the evaluation structure, speaker affiliation, and certificate template.

## Evaluation Updates

### Round Table Discussions

- Round Table Discussion — Professionals
- Round Table Discussion — Students

### Presentations

- Faculty Presentations
- Live Student Presentations
- Student Video Presentations
- Poster Presentation

### Event Experience

- Socialization Activities
- Venue
- Food
- Program Flow
- Organization
- Communication
- Value for Money

## Speaker Update

Le Ha Van is now listed as:

```text
Swinburne University of Technology, Vietnam
```

## Certificate Update

The certificate generator now follows the provided Batch 1 certificate reference more closely. The participant name uses:

```text
Alex Brush
```

For exact rendering, upload a blank certificate background PNG/JPG to Google Drive and add this optional setting inside `APP_CONFIG.CERTIFICATE` in `Config.gs`:

```javascript
TEMPLATE_IMAGE_FILE_ID: 'PASTE_DRIVE_FILE_ID_HERE',
```

When set, the script uses that image as the full-slide certificate background and overlays only the participant name.

## Required Update

Replace:

- `index.html`
- `app.js`
- `config.js`
- `styles.css`
- `Code.gs`
- `Config.gs`

Then run:

```javascript
setupProject()
```

Redeploy Apps Script as a new version and keep the same `/exec` URL.


## v1.3.1 Live Configuration

The package already includes:

```javascript
ENDPOINT_URL: "https://script.google.com/macros/s/AKfycbwQXFJyJhZnkoE8TLuZIpW3QSKid-KNcoiBvmXsDV152kYdviD2sAa10YjaXc2sz-3T/exec"
```

and:

```javascript
SPREADSHEET_ID: '1vhj7Bink6MkS5sS0S1_lKqYfQlXDd2zHnfIAfBrMgh8'
SHEET_NAME: 'Evaluation Responses'
```


## v1.3.2 Reply-To Email

The Apps Script `Config.gs` file now uses:

```javascript
REPLY_TO: 'pirc@panpacificu.edu.ph'
```


## v1.3.3 Unique Certificate Rule

The form now enforces one response/certificate per email address per batch:

```javascript
ENFORCE_ONE_RESPONSE_PER_EMAIL_AND_BATCH: true
```


## v1.3.4 Email Restriction

Only emails ending in `@panpacificu.edu.ph` are accepted.

Outsiders are instructed to contact `pirc@panpacificu.edu.ph`.


## v1.3.5 Cache Patch

The public page now loads:

```html
<link rel="stylesheet" href="styles.css?v=1.3.5">
<script defer src="config.js?v=1.3.5"></script>
<script defer src="app.js?v=1.3.5"></script>
```

This helps prevent users from submitting with old cached frontend files.


## v1.3.6 Certificate Background Update

The certificate generator now uses the official blank certificate image as the full-slide background and overlays only the participant name.

### Apps Script files added/updated

- `apps-script/CertificateTemplate.gs` — contains the embedded certificate template image
- `apps-script/Code.gs` — now reads the embedded template image
- `apps-script/Config.gs` — includes name placement settings

### Name overlay settings

```javascript
NAME_FONT: 'Alex Brush',
NAME_COLOR: '#3B762F',
NAME_BOX: { LEFT: 120, TOP: 168, WIDTH: 480, HEIGHT: 54 },
```

If you need to fine-tune name placement later, adjust `NAME_BOX` in `Config.gs`.


## v1.4.0 High Traffic Mode

This version saves responses first and queues certificates for later sending.

```javascript
HIGH_TRAFFIC_MODE: true
```

After the event, use:

```javascript
processPendingCertificates()
```

to send certificates in controlled batches.


## v1.4.2 Batch 2 + HTML Fix

This fixes the form rendering issue from v1.4.1 and keeps High Traffic Mode enabled.

Batch 2 is active with the three speaker photos included in `assets/speakers/`.


## v1.4.3 Batch 2 Unlocked

Batch 2 is now clickable in the frontend. The radio button no longer has the hardcoded `disabled` attribute.
