module.exports = (req, res) => {
  const t = (req.query && req.query.t) ? String(req.query.t) : "";

  const VALID_TOKENS = new Set([
    "MAZEGA_001_X9K2P7Q4"
  ]);

  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (!t) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: "missing_token" }));
  }

  if (!VALID_TOKENS.has(t)) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ ok: false, error: "invalid_token" }));
  }

  const intentId = "pi_" + Math.random().toString(36).slice(2, 10);

  res.statusCode = 200;
  return res.end(JSON.stringify({
    ok: true,
    intent_id: intentId,
    status: "AWAITING_AMOUNT"
  }));
};
