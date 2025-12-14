async function kvSet(key, valueObj) {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_KV env vars missing");

  const value = encodeURIComponent(JSON.stringify(valueObj));
  const r = await fetch(`${url}/set/${encodeURIComponent(key)}/${value}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await r.json();
}

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: "method_not_allowed" }));
  }

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
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

    const record = {
      intent_id: intentId,
      token,
      amount,
      status: "CREATED",
      created_at: new Date().toISOString()
    };

    try {
      await kvSet(`intent:${intentId}`,
