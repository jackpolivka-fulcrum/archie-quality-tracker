# Apps Script deployment

The `/capture` backend runs as a Google Apps Script web app bound to the quality-tracker sheet. This folder holds the source so it lives in git; the running version is whatever's pasted into Apps Script.

## First-time setup

1. Open the Google Sheet that backs this tool.
2. **Extensions → Apps Script** — opens a new project bound to the sheet.
3. Rename the project to `archie-quality-tracker`.
4. In the editor, replace the default `Code.gs` contents with the contents of [Code.gs](Code.gs) in this folder.
5. Edit the two constants at the top:
   - `SHEET_ID` → the long ID from the sheet URL.
   - `API_KEY` → a long random string. Generate with `openssl rand -hex 32`. This must match the `apiKey` in [../plugin/index.html](../plugin/index.html).
6. **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (the API key gates writes; you can't restrict to "anyone in your domain" because the plugin runs as the end user's session inside Front and we want it to work without an extra Google sign-in)
7. Click **Deploy**, authorize, copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).
8. Paste that URL into [../plugin/index.html](../plugin/index.html) as `CONFIG.apiUrl`.

## Updating the script

Apps Script web apps are versioned. After editing `Code.gs`:

1. Paste the new contents into the Apps Script editor.
2. **Deploy → Manage deployments → ✏️ pencil on the active deployment → Version: New version → Deploy.**
3. The URL stays the same; no plugin change needed.

If you only change `SHEET_ID` / `API_KEY` you still need to redeploy a new version for the changes to take effect.

## Smoke test

```bash
curl -s -X POST '<YOUR_WEB_APP_URL>' \
  -H 'Content-Type: text/plain;charset=utf-8' \
  -d '{
    "api_key":"<API_KEY>",
    "conversation_id":"test-001",
    "customer_email":"smoketest@example.com",
    "agent_name":"Smoke Test",
    "email_body":"hello",
    "ai_prompt":"p","ai_output":"o",
    "could_archie_resolve":"Yes",
    "what_should_be_updated":["Prompt"],
    "notes":"smoke"
  }'
```

Expected response: `{"ok":true}` and a new row in the sheet.
