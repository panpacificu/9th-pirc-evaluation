# Updating from v1.2.1 to v1.2.2

This release fixes the false error:

```text
Please complete the valid speaker evaluation questions.
```

The backend no longer compares browser-submitted speaker names character-for-character. It now validates only the three required speaker ratings and uses the official speaker names from `Config.gs`.

## Update Steps

1. Replace `Code.gs` with the v1.2.2 file.
2. Save the project.
3. Go to **Deploy → Manage deployments → Edit**.
4. Select **New version** and deploy.
5. Keep the same `/exec` URL.

You do not need to run `setupProject()` again, and no Sheet columns need to be changed.
