import { config } from "./config.js";
import { configureTelegramBot } from "./telegramBot.js";

if (!config.botToken) {
  console.error("BOT_TOKEN is missing. Add it to .env first.");
  process.exit(1);
}

if (!config.webAppUrl.startsWith("https://")) {
  console.warn("WEB_APP_URL is not HTTPS. Commands can be configured, but Telegram Mini App menu needs a public HTTPS URL.");
}

await configureTelegramBot();
console.log("Telegram bot configuration finished.");
