import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { config } from "./config.js";
import { getLeaderboard, getPlayer, savePlayerState, upsertPlayer } from "./database.js";
import { startPolling } from "./telegramBot.js";
import { validateTelegramInitData } from "./telegramAuth.js";

const root = process.cwd();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${config.port}`).pathname);
  const target = pathname === "/" ? "/index.html" : pathname;
  const filePath = normalize(join(root, target));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

function playerFromHeader(req) {
  return req.headers["x-player-id"] || null;
}

async function handleApi(req, res, url) {
  try {
    if (req.method === "POST" && url.pathname === "/api/auth/telegram") {
      const body = await readJson(req);
      const result = validateTelegramInitData(body.initData, config.botToken);

      if (!result.ok) {
        sendJson(res, 401, result);
        return;
      }

      const user = result.user;
      const player = await upsertPlayer(user.id, {
        name: [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "AI Creator",
        username: user.username || ""
      });

      sendJson(res, 200, { ok: true, player });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/player/me") {
      const playerId = playerFromHeader(req);

      if (!playerId) {
        sendJson(res, 401, { ok: false, reason: "Missing player id" });
        return;
      }

      sendJson(res, 200, { ok: true, player: getPlayer(playerId) });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/player/state") {
      const playerId = playerFromHeader(req);

      if (!playerId) {
        sendJson(res, 401, { ok: false, reason: "Missing player id" });
        return;
      }

      const body = await readJson(req);
      const player = await savePlayerState(playerId, body.state || {});
      sendJson(res, 200, { ok: true, player });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/leaderboard") {
      sendJson(res, 200, { ok: true, leaderboard: getLeaderboard() });
      return;
    }

    sendJson(res, 404, { ok: false, reason: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, reason: error.message });
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${config.port}`);

  if (url.pathname.startsWith("/api/")) {
    await handleApi(req, res, url);
    return;
  }

  const filePath = resolvePath(req.url || "/");

  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(config.port, () => {
  console.log(`AI-Creator Mini App: http://localhost:${config.port}`);
  console.log(`Public Mini App URL: ${config.webAppUrl}`);
  if (!config.webAppUrl.startsWith("https://")) {
    console.log("Set WEB_APP_URL to an HTTPS URL before connecting the menu button in Telegram.");
  }
});

startPolling().catch((error) => {
  console.error(`Telegram polling failed: ${error.message}`);
});
