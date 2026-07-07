# Updating to v1.3.4

## PanpacificU Email Restriction

This update requires participant emails to end with:

```text
@panpacificu.edu.ph
```

The email input now says:

```text
Use your PanpacificU Email.
For outsiders, please contact the organizer, pirc@panpacificu.edu.ph.
```

The backend also enforces the same rule, so users cannot bypass it through the browser.

## Files to Replace

Replace these on GitHub:

- `index.html`
- `app.js`
- `config.js`

Replace these in Apps Script:

- `Code.gs`
- `Config.gs`

## After Updating

1. Save all changes.
2. Run:

```javascript
setupProject()
```

3. Redeploy Apps Script:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep the same `/exec` URL.
