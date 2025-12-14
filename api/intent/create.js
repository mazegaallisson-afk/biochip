function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function readJsonBody(req) {
  // alguns runtimes já colocam req.body
  if (req.body && typeof req.body === "object") return req.body;

  const text = await new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });

  try { return JSON.parse(text || "{}"); } catch { return {}; }
}

async function kvSet(key, valueObj) {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing UPSTASH_KV env vars");

  const value = encodeURIComponent(JSON.stringify(valueObj));
  const r = await fetch(`${url}/set/${encodeURIComponent(key)}/${value}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("KV set failed: " + JSON.stringify(j));
  return j;
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") {
      return send(res, 405, { ok: false, error: "method_not_allowed" });
    }

    const data = await readJsonBody(req);
    const token = String(data.token || "");
    const amount = Number(String(data.amount || "").replace(",", "."));

    if (!token) return send(res, 400, { ok: false, error: "missing_token" });
    if (!Number.isFinite(amount) || amount <= 0) {
      return send(res, 400, { ok: false, error: "invalid_amount" });
    }

    const intentId = "pi_" + Math.random().toString(36).slice(2, 10);

    const record = {
      intent_id: intentId,
      token,
      amount,
      status: "CREATED",
      created_at: new Date().toISOString()
    };

    await kvSet(`intent:${intentId}`, record);
    return send(res, 200, { ok: true, intent_id: intentId });

  } catch (e) {
    return send(res, 500, { ok: false, error: "create_crashed", detail: String(e) });
  }
};
