const express = require('express');
const { appendRow } = require('../services/sheets');

const router = express.Router();

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

router.post('/', async (req, res) => {
  const body = req.body || {};

  const missing = REQUIRED_FIELDS.filter((f) => !(f in body));
  if (missing.length) {
    return res.status(400).json({ error: 'Missing fields', missing });
  }

  if (!Array.isArray(body.what_should_be_updated)) {
    return res.status(400).json({ error: 'what_should_be_updated must be an array' });
  }

  const row = [
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
  ];

  try {
    const result = await appendRow(row);
    res.status(201).json({ ok: true, updatedRange: result.updates?.updatedRange });
  } catch (err) {
    console.error('Failed to append row:', err);
    res.status(502).json({ error: 'Failed to write to Google Sheet' });
  }
});

module.exports = router;
