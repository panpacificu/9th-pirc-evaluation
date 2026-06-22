# 9th PIRC Evaluation Form

A responsive evaluation form for the 9th Panpacific International Research Conference.

## Included

- Responsive GitHub Pages frontend
- Panpacific University-inspired blue, teal, green, and lime visual system
- Inter font with a lightweight, clean interface
- Batch-based school options
- Batch-based speaker placeholders
- Required 1–4 evaluation scales
- Name and email validation
- Duplicate-click protection
- Submission reference number
- Google Sheets response storage
- Automatic confirmation email
- Mobile-friendly layout
- Version footer and changelog

## Project Structure

```text
pirc-evaluation-form-v1.0.0/
├── index.html
├── styles.css
├── app.js
├── config.js
├── README.md
├── CHANGELOG.md
└── apps-script/
    ├── Config.gs
    └── Code.gs
```

## Step 1 — Prepare the Google Sheet

1. Create a blank Google Sheet.
2. Copy the spreadsheet ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

3. Open **Extensions → Apps Script**.
4. Add two script files named:
   - `Config.gs`
   - `Code.gs`
5. Copy the matching files from the `apps-script` folder.
6. In `Config.gs`, replace:

```javascript
SPREADSHEET_ID: 'PASTE_GOOGLE_SHEET_ID_HERE'
```

7. Add the official reply-to email address.
8. Run `setupProject()` once and approve the requested permissions.

## Step 2 — Deploy the Apps Script Web App

1. In Apps Script, click **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Select the access level appropriate for the respondents.
   - Use an organization-only setting when all respondents have university accounts.
   - Use **Anyone** when external respondents must be able to submit.
5. Deploy and copy the `/exec` Web App URL.

## Step 3 — Connect the Frontend

Open `config.js` and replace:

```javascript
ENDPOINT_URL: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE"
```

with the deployed Apps Script `/exec` URL.

## Step 4 — Add the Speaker Names

Update the `SPEAKERS` object in `config.js`.

```javascript
SPEAKERS: {
  "Batch 1": [
    "Official Speaker Name",
    "Official Speaker Name",
    "Official Speaker Name",
    "Official Speaker Name"
  ],
  "Batch 2": [
    "Official Speaker Name",
    "Official Speaker Name",
    "Official Speaker Name",
    "Official Speaker Name"
  ]
}
```

The exact speaker names selected on the form are also saved in the response sheet.

## Step 5 — Publish on GitHub Pages

Upload these frontend files to the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `config.js`

Then enable GitHub Pages under the repository settings.

Do not upload the `apps-script` folder as a replacement for the files in Apps Script. It is included only as a source-code copy.

## Confirmation Email

A temporary confirmation email is already included in:

```javascript
buildConfirmationEmail_(data)
```

inside `apps-script/Code.gs`.

Replace the HTML in that function when the official email design and wording are ready.

## One Response Per Participant

By default, repeat submissions are allowed because the requirement was not yet specified.

To limit each email address to one submission per batch, change this in `Config.gs`:

```javascript
ENFORCE_ONE_RESPONSE_PER_EMAIL_AND_BATCH: true
```

## Rating Scale

- `1` — Very Dissatisfied
- `2` — Dissatisfied
- `3` — Satisfied
- `4` — Very Satisfied

Numeric values are saved in Google Sheets for easier summary and analysis.

## Notes

- The form records the participant's name exactly as submitted for future e-certificate use.
- The confirmation email is sent only after the response row is stored.
- If the email quota is exhausted, the response is still saved and the Email Status column will show `Not Sent`.
- The hidden honeypot field adds basic bot protection.
- The submit button is disabled while a request is being processed.
