# Updating to v1.4.2 — Batch 2 + HTML Fix

## Fix

This version fixes the issue where the public page showed only the hero/intro section and did not render the form.

Cause: the previous package accidentally corrupted part of `index.html` during cache-busting.

## Batch 2 Enabled

Batch 2 is enabled in both:

- `config.js`
- `Config.gs`

### Batch 2 Speakers

1. Dr. Ayu Anastasya Rachman — Universitas Bina Mandiri (UBM) Gorontalo
2. Assoc. Prof. Dr. R. Vithyacharan — Red Sea Associates
3. Mary Ann Pastrana — Archipelago Philippine Ferries Corp.

## Files to replace on GitHub

Replace:

- `index.html`
- `config.js`
- `app.js`

Upload these new files:

- `assets/speakers/ayu-anastasya-rachman.webp`
- `assets/speakers/r-vithyacharan.webp`
- `assets/speakers/mary-ann-pastrana.webp`

## Files to replace in Apps Script

Replace:

- `Config.gs`

`Code.gs` does not need to be replaced if v1.4.0 High Traffic Mode is already installed.

## After updating

1. Commit/upload the GitHub files.
2. Save Apps Script after replacing `Config.gs`.
3. Redeploy Apps Script as a new version.
4. Open the form in an incognito/private window.
5. Confirm footer shows Version 1.4.2.
6. Scroll/check that the participant form appears after the hero section.
