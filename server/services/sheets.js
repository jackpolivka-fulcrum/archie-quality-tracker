const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

let cachedClient = null;

function buildAuth() {
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    });
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    return new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: SCOPES,
    });
  }
  throw new Error(
    'No Google credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS (file path) or GOOGLE_CREDENTIALS_JSON (inline JSON).'
  );
}

function getSheetsClient() {
  if (cachedClient) return cachedClient;
  cachedClient = google.sheets({ version: 'v4', auth: buildAuth() });
  return cachedClient;
}

async function appendRow(values) {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) throw new Error('Missing GOOGLE_SHEET_ID');

  const sheetName = process.env.SHEET_NAME || 'Sheet1';
  const range = `'${sheetName.replace(/'/g, "''")}'!A:I`;

  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
  return res.data;
}

module.exports = { appendRow };
