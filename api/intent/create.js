let intents = global.__INTENTS__;
if (!intents) {
  intents = new Map();
  global.__INTENTS__ = intents;
}

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    let data = {};
    try { data = JSON.parse(body || "{}"); } catch {}

    const token = String(data.token || "");
    const amount = Number(data.amount || 0);

    if (!token) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: "missing_token" }));
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ ok: false, error: "invalid_amount" }));
    }

    const intentId = "pi_" + Math.random().toString(36).slice(2, 10);
    intents.set(intentId, {
      intent_id: intentId,
      token,
      amount,
      status: "CREATED",
      created_at: new Date().toISOString()
    });

    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, intent_id: intentId }));
  });
};
