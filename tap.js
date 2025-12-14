export default function handler(req, res) {
  const { t } = req.query;

  // Lista de tokens válidos (MVP). Depois vamos colocar em banco de dados.
  const VALID_TOKENS = new Set([
    "SEU_TOKEN_AQUI"
  ]);

  if (!t) {
    return res.status(400).json({ ok: false, error: "missing_token" });
  }

  if (!VALID_TOKENS.has(String(t))) {
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }

  // Simula criação de intent
  const intentId = "pi_" + Math.random().toString(36).slice(2, 10);

  return res.status(200).json({
    ok: true,
    intent_id: intentId,
    status: "AWAITING_AMOUNT"
  });
}
