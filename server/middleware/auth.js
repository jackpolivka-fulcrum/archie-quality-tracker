function requireApiKey(req, res, next) {
  const provided = req.get('x-api-key');
  const expected = process.env.API_KEY;

  if (!expected) {
    return res.status(500).json({ error: 'Server misconfigured: API_KEY not set' });
  }
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}

module.exports = { requireApiKey };
