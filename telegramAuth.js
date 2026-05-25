import { createHmac, timingSafeEqual } from "node:crypto";

export function validateTelegramInitData(initData, botToken) {
  if (!initData || !botToken) {
    return { ok: false, reason: "Missing init data or bot token" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");

  if (!hash) {
    return { ok: false, reason: "Missing hash" };
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculated = createHmac("sha256", secret).update(dataCheckString).digest("hex");

  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(calculated, "hex");

  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "Invalid hash" };
  }

  const userRaw = params.get("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  return { ok: true, user };
}
