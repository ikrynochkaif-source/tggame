import { existsSync, readFileSync } from "node:fs";

if (existsSync(".env")) {
  const lines = readFileSync(".env", "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const index = trimmed.indexOf("=");
    if (index === -1) continue;

    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export const config = {
  botToken: process.env.BOT_TOKEN || "",
  webAppUrl: process.env.WEB_APP_URL || `http://localhost:${process.env.PORT || 5173}`,
  port: Number(process.env.PORT || 5173),
  polling: process.env.BOT_POLLING === "true"
};
