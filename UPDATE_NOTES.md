# Updating from v1.2.0 to v1.2.1

## Fixed Errors

This version fixes:

```text
TypeError: shape.getBorder(...).getLineFill(...).setTransparent is not a function
```

The corrected Slides method is:

```javascript
shape.getBorder().setTransparent();
```

It also includes explicit Google Drive and Google Slides authorization scopes.

## Installation

1. Replace your Apps Script `Code.gs` with the v1.2.1 file.
2. Open **Project Settings** in Apps Script.
3. Enable **Show "appsscript.json" manifest file in editor**.
4. Open `appsscript.json`.
5. Replace its contents with `apps-script/appsscript.json` from this package.
6. Save the project.
7. Run:

```javascript
createCertificatePreview()
```

8. Approve all requested access, including Google Drive and Google Slides.
9. When the preview succeeds, update the Web App through:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep your current `/exec` URL.

## If Google Does Not Ask Again

If the Drive permission error remains without showing a new authorization prompt, remove the project's existing Google Account access and run `createCertificatePreview()` again.
