import { config } from "./config.js";
import { upsertPlayer } from "./database.js";

let offset = 0;
let stopped = false;

async function telegram(method, payload) {
  if (!config.botToken) {
    throw new Error("BOT_TOKEN is missing");
  }

  const response = await fetch(`https://api.telegram.org/bot${config.botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {})
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || `Telegram ${method} failed`);
  }

  return data.result;
}

export async function configureTelegramBot() {
  if (!config.botToken) return;

  await telegram("setMyCommands", {
    commands: [
      { command: "start", description: "Відкрити AI-Creator" },
      { command: "play", description: "Грати" }
    ]
  });

  if (config.webAppUrl.startsWith("https://")) {
    await telegram("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text: "Грати",
        web_app: { url: config.webAppUrl }
      }
    });
  }
}

async function sendWelcome(chatId, user) {
  await upsertPlayer(user.id, {
    name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "AI Creator",
    username: user.username || ""
  });

  const message = {
    chat_id: chatId,
    text: config.webAppUrl.startsWith("https://")
      ? "AI-Creator готовий. Створи персонажа, запусти перший AI-проєкт і не дай тренду померти, поки ти обираєш зачіску."
      : "AI-Creator майже готовий. Потрібен публічний HTTPS URL для Mini App, бо Telegram не відкриває гру з localhost."
  };

  if (config.webAppUrl.startsWith("https://")) {
    message.reply_markup = {
      inline_keyboard: [
        [
          {
            text: "Грати в AI-Creator",
            web_app: { url: config.webAppUrl }
          }
        ]
      ]
    };
  }

  await telegram("sendMessage", message);
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message) return;

  const text = message.text || "";
  const user = message.from;

  if (!user) return;

  if (text.startsWith("/start") || text.startsWith("/play")) {
    await sendWelcome(message.chat.id, user);
  }
}

export async function startPolling() {
  if (!config.polling || !config.botToken) return;

  await configureTelegramBot();
  console.log("Telegram bot polling started");

  while (!stopped) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 25,
        allowed_updates: ["message"]
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
    } catch (error) {
      console.error(error.message);
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }
  }
}

export function stopPolling() {
  stopped = true;
}
