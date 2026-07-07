# Updating to v1.3.6

## Certificate Update

This version switches the certificate generation to an image-based template.

The package now includes:

- `apps-script/CertificateTemplate.gs` — embedded blank certificate image
- `apps-script/Code.gs` — generates the PDF using the embedded image background
- `apps-script/Config.gs` — includes the name overlay settings

## Files to replace in Apps Script

Replace or add these files:

- `Code.gs`
- `Config.gs`
- `CertificateTemplate.gs`

You do not need to upload the certificate image separately to Google Drive.

## Then do this

1. Save the Apps Script project.
2. Run:

```javascript
createCertificatePreview()
```

3. Check the preview PDF in Google Drive.
4. If the name needs slight repositioning, adjust `NAME_BOX` in `Config.gs`.
5. Redeploy Apps Script:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep the same `/exec` URL.
