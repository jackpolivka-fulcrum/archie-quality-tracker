require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { requireApiKey } = require('./middleware/auth');
const captureRoute = require('./routes/capture');

const missingEnv = ['GOOGLE_SHEET_ID', 'API_KEY'].filter((k) => !process.env[k]);
if (missingEnv.length) {
  console.error(`Missing required env vars: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const hasGoogleCreds =
  process.env.GOOGLE_CREDENTIALS_JSON ||
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY);
if (!hasGoogleCreds) {
  console.error(
    'No Google credentials configured. Set GOOGLE_APPLICATION_CREDENTIALS (file path) or GOOGLE_CREDENTIALS_JSON (inline JSON).'
  );
  process.exit(1);
}

const allowedOriginsRaw = process.env.ALLOWED_ORIGINS;
if (!allowedOriginsRaw) {
  console.warn('ALLOWED_ORIGINS not set — CORS will accept any origin');
}
const corsOptions =
  !allowedOriginsRaw || allowedOriginsRaw === '*'
    ? {}
    : { origin: allowedOriginsRaw.split(',').map((s) => s.trim()).filter(Boolean) };

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/capture', requireApiKey, captureRoute);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`archie-quality-tracker listening on :${port}`);
});
