# 9th PIRC Evaluation Form

Version **1.2.1** adds the official Batch 1 speakers and automatic PDF certificate delivery.

## Batch 1 Speakers

- Phillip Clark — Kindai University, Japan
- Aurelio Agcaoili — University of Hawaii in Manoa
- Le Ha Van — FPT Ho Chi Minh, Vietnam

Each speaker includes a small image preview.

## Batch 2

Batch 2 is displayed as **Available later** and cannot be selected. The Apps Script backend also rejects Batch 2 submissions.

## Certificate Delivery

After a successful submission, Apps Script:

1. Saves the evaluation response.
2. Generates a personalized PDF Certificate of Participation.
3. Uses the participant name exactly as submitted.
4. Attaches the PDF to the confirmation email.
5. Records the delivery result in the Sheet.

New columns:

```text
Certificate Status
Certificate Error
```

The temporary certificate includes the event, participant, batch, date, venue, campus, school, submission reference, and placeholder signature lines.

## Required Authorization

After updating Apps Script, run:

```javascript
createCertificatePreview()
```

once. Approve Google Slides and Google Drive permissions. A sample certificate PDF will be saved to the script owner's Google Drive, and its URL will appear in the execution log.

## Important Update Values

Preserve your real values before replacing files:

- `SPREADSHEET_ID` in Apps Script `Config.gs`
- `EMAIL.REPLY_TO` in Apps Script `Config.gs`
- `ENDPOINT_URL` in GitHub `config.js`
- `ADMIN_KEY` remains in Apps Script Script Properties

## Files

```text
pirc-evaluation-form-v1.2.0/
├── index.html
├── styles.css
├── app.js
├── config.js
├── admin.html
├── admin.css
├── admin.js
├── assets/
│   └── speakers/
│       ├── phillip-clark.webp
│       ├── aurelio-agcaoili.webp
│       └── le-ha-van.webp
├── apps-script/
│   ├── Config.gs
│   └── Code.gs
├── README.md
├── UPDATE_NOTES.md
└── CHANGELOG.md
```

## v1.2.1 Fix

- Corrects the Slides transparent-border API call.
- Adds explicit Sheets, Mail, Slides, and Drive OAuth scopes.
- Includes an `appsscript.json` manifest for Apps Script.
