# Updating to v1.4.1 — Batch 2 Enabled

## What changed

Batch 2 is now enabled in both the frontend and backend.

### Batch 2 speakers added

1. Dr. Ayu Anastasya Rachman  
   Universitas Bina Mandiri (UBM) Gorontalo

2. Assoc. Prof. Dr. R. Vithyacharan  
   Red Sea Associates

3. Mary Ann Pastrana  
   Archipelago Philippine Ferries Corp.

Their photos were added under:

```text
assets/speakers/
```

## Files to replace on GitHub

Replace:

- `config.js`
- `app.js`
- `index.html`
- `assets/speakers/ayu-anastasya-rachman.webp`
- `assets/speakers/r-vithyacharan.webp`
- `assets/speakers/mary-ann-pastrana.webp`

## Files to replace in Apps Script

Replace:

- `Config.gs`

`Code.gs` does not need to be replaced if you already installed v1.4.0 High Traffic Mode.

## After updating Apps Script

Save and redeploy:

**Deploy → Manage deployments → Edit → New version → Deploy**

Keep the same `/exec` URL.

## Important certificate note

The current embedded certificate image is still the Batch 1 certificate background dated 13–14 July 2026. Since High Traffic Mode queues certificates for later, responses can be collected now safely. Before sending Batch 2 certificates, update the certificate template image if the Batch 2 certificate needs different dates/details.
