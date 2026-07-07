# Updating to v1.3.5

## Fix

This patch addresses the error:

```text
Please complete all required rating questions.
```

The common cause is a mismatch between the updated Apps Script backend and an older cached GitHub frontend file.

This patch adds:

1. Cache-busting query strings in `index.html`:
   - `styles.css?v=1.3.5`
   - `config.js?v=1.3.5`
   - `app.js?v=1.3.5`

2. A clearer backend error that lists the exact missing rating questions.

## Files to Replace

Replace these on GitHub:

- `index.html`
- `app.js`
- `config.js`
- `styles.css`

Replace this in Apps Script:

- `Code.gs`
- `Config.gs`

## After Updating

1. Save all files.
2. Run:

```javascript
setupProject()
```

3. Redeploy Apps Script:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep the same `/exec` URL.

4. Open the public form in an incognito/private browser tab and test again.

## Important

Make sure the public form shows version:

```text
v1.3.5
```

If it still shows an older version, the browser or GitHub Pages is still serving cached files.
