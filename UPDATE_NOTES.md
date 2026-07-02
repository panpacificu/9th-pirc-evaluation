# Updating from v1.1.0 to v1.2.0

## 1. Preserve Your Live Values

Copy these before replacing files:

From Apps Script `Config.gs`:

```javascript
SPREADSHEET_ID
EMAIL.REPLY_TO
EMAIL.SENDER_NAME
```

From GitHub `config.js`:

```javascript
ENDPOINT_URL
```

The `ADMIN_KEY` is stored in Script Properties and remains unchanged.

## 2. Replace Apps Script Files

Replace:

- `Code.gs`
- `Config.gs`

Restore your live Spreadsheet ID and email settings.

Run:

```javascript
setupProject()
```

This adds:

```text
Certificate Status
Certificate Error
```

Existing response rows are not deleted.

## 3. Authorize Certificate Creation

Run:

```javascript
createCertificatePreview()
```

Approve Slides and Drive access. Review the generated preview in Google Drive.

## 4. Redeploy

Use:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep the same `/exec` URL.

## 5. Replace GitHub Files

Upload or replace:

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `admin.js`
- `admin.css`

Also upload:

```text
assets/speakers/
```

Restore the live `ENDPOINT_URL` in `config.js`.

## 6. Test

Confirm that Batch 2 is disabled, the three speakers appear, and the confirmation email includes a personalized certificate PDF.
