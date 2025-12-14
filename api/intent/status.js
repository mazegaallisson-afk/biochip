async function kvGet(key) {
  const url = process.env.UPSTASH_KV_REST_API_URL;
  const token = process.env.UPSTASH_KV_REST_API_TOKEN;
  if (!url || !token) throw new Error("UPSTASH_KV env vars missing");

  const r = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return await r.json(); // { result: "..." } ou { result: null }
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const i = req.query && req.query.i ? String(req.query.i) : "";
  if (!i) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ ok: false, error: "missing_intent" }));
  }

  try {
    const j = await kvGet(`intent:${i}`);
    if (!j || !j.result) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ ok: false, error: "intent_not_found" }));
    }

    const intent = JSON.parse(j.result);
    res.statusCode = 200;
    return res.end(JSON.stringify({ ok: true, intent }));
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ ok: false, error: "kv_read_failed", detail: String(e) }));
  }
};
