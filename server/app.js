require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

const { requireApiKey } = require('./middleware/auth');
const captureRoute = require('./routes/capture');

const missingEnv = ['GOOGLE_SHEET_ID', 'API_KEY'].filter((k) => !process.env[k]);
if (missingEnv.length) {
  throw new Error(`Missing required env vars: ${missingEnv.join(', ')}`);
}

const hasGoogleCreds =
  process.env.GOOGLE_CREDENTIALS_JSON ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
if (!hasGoogleCreds) {
  throw new Error(
    'No Google credentials configured. Set GOOGLE_CREDENTIALS_JSON (inline JSON) or GOOGLE_APPLICATION_CREDENTIALS (file path).'
  );
}

const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;
const corsOptions =
  !allowedOriginsRaw || allowedOriginsRaw === '*'
    ? {}
    : { origin: allowedOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean) };

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/capture', requireApiKey, captureRoute);
app.use('/plugin', express.static(path.join(__dirname, '..', 'plugin')));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
