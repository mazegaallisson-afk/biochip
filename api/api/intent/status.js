let intents = global.__INTENTS__;
if (!intents) {
  intents = new Map();
  global.__INTENTS__ = intents;
}

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const i = req.query && req.query.i ? String(req.query.i) : "";
  if (!i) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: "missing_intent" }));
  }

  const it = intents.get(i);
  if (!it) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ ok: false, error: "intent_not_found" }));
  }

  res.statusCode = 200;
  return res.end(JSON.stringify({ ok: true, intent: it }));
};
