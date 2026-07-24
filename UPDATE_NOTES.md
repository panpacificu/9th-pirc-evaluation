# Updating to v1.4.3 — Batch 2 Unlocked

## Fix

Batch 2 was enabled in `config.js` and `Config.gs`, but the actual Batch 2 radio button in `index.html` still had the `disabled` attribute.

This version removes that disabled state and adds a small frontend guard so the button availability follows `ENABLED_BATCHES`.

## Files to replace on GitHub

Replace:

- `index.html`
- `app.js`
- `config.js`

The Batch 2 speaker image files from v1.4.2 should remain uploaded:

- `assets/speakers/ayu-anastasya-rachman.webp`
- `assets/speakers/r-vithyacharan.webp`
- `assets/speakers/mary-ann-pastrana.webp`

## Files to replace in Apps Script

Replace:

- `Config.gs`

`Code.gs` does not need to be replaced if v1.4.0 High Traffic Mode is already installed.

## After updating

1. Upload/commit the GitHub files.
2. Save Apps Script after replacing `Config.gs`.
3. Redeploy Apps Script as a new version.
4. Open the form in an incognito/private window.
5. Confirm Batch 2 says `Now available` and is clickable.
