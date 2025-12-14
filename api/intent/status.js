function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(obj));
}

async function kvGet(key) {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("Missing UPSTASH_KV env vars");

  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("KV get failed: " + JSON.stringify(j));
  return j; // { result: "..." } ou { result: null }
}

module.exports = async (req, res) => {
  try {
    const u = new URL(req.url, "http://localhost");
    const i = u.searchParams.get("i") || "";

    if (!i) return send(res, 400, { ok: false, error: "missing_intent" });

    const j = await kvGet(`intent:${i}`);
    if (!j || !j.result) return send(res, 404, { ok: false, error: "intent_not_found" });

    const intent = JSON.parse(j.result);
    return send(res, 200, { ok: true, intent });

  } catch (e) {
    return send(res, 500, { ok: false, error: "status_crashed", detail: String(e) });
  }
};
