require("dotenv").config();
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Verify Telegram Mini App initData on the server before trusting user identity.
// The bot token must remain in .env and must never be sent to the browser.
function verifyTelegramInitData(initData, botToken) {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");
  const a = Buffer.from(calculated, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const authDate = Number(params.get("auth_date") || 0);
  if (!authDate || Date.now() / 1000 - authDate > 86400) return null;
  try {
    return JSON.parse(params.get("user") || "null");
  } catch {
    return null;
  }
}

app.post("/api/session", (req, res) => {
  const user = verifyTelegramInitData(req.body?.initData, process.env.BOT_TOKEN);
  if (!user) return res.status(401).json({ ok: false, error: "Invalid Telegram session" });
  res.json({ ok: true, user: { id: user.id, first_name: user.first_name } });
});

// Plug a licensed music provider into this endpoint when you have API credentials.
// Do not scrape Spotify or stream copyrighted tracks without permission.
app.get("/api/search", async (req, res) => {
  const q = String(req.query.q || "").trim().slice(0, 100);
  res.json({
    provider: "demo",
    query: q,
    tracks: [],
    message: "Connect a licensed music catalogue provider to enable global search."
  });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Ml1 Music running at http://localhost:${PORT}`));
