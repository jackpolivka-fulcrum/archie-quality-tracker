// Archie Quality Tracker — Google Apps Script web app.
// See apps-script/README.md for deployment instructions.

const SHEET_ID = 'PASTE_GOOGLE_SHEET_ID_HERE';
const API_KEY = 'PASTE_LONG_RANDOM_STRING_HERE';
const SHEET_NAME = 'Sheet1';

const REQUIRED_FIELDS = [
  'conversation_id',
  'customer_email',
  'agent_name',
  'email_body',
  'ai_prompt',
  'ai_output',
  'could_archie_resolve',
  'what_should_be_updated',
  'notes',
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.api_key !== API_KEY) {
      return json({ error: 'Invalid or missing API key' });
    }

    const missing = REQUIRED_FIELDS.filter((f) => !(f in body));
    if (missing.length) {
      return json({ error: 'Missing fields', missing });
    }

    if (!Array.isArray(body.what_should_be_updated)) {
      return json({ error: 'what_should_be_updated must be an array' });
    }

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) {
      return json({ error: `Sheet "${SHEET_NAME}" not found` });
    }

    sheet.appendRow([
      new Date().toISOString(),
      body.conversation_id,
      body.customer_email,
      body.agent_name,
      body.email_body,
      body.ai_prompt,
      body.ai_output,
      body.could_archie_resolve,
      body.what_should_be_updated.join(', '),
      body.notes,
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ error: err.message || String(err) });
  }
}

function doGet() {
  return json({ ok: true, service: 'archie-quality-tracker' });
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
