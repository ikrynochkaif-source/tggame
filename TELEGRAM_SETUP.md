# Telegram Setup

## Local preview

Run:

```powershell
npm run dev
```

Open:

```text
http://localhost:5173
```

For a real Telegram Mini App, the URL must be HTTPS. During development you can expose the local server with a tunnel such as Cloudflare Tunnel, ngrok, or a temporary VPS URL.

## Environment

Create `.env` from `.env.example`:

```env
BOT_TOKEN=your_bot_token
WEB_APP_URL=https://your-domain.example
PORT=5173
BOT_POLLING=true
```

Use `BOT_POLLING=false` when you only want to preview the web app locally.

## BotFather checklist

1. Create a bot with `/newbot`.
2. Open `/mybots`, choose the bot, then `Bot Settings`.
3. Set the menu button to the HTTPS URL of this Mini App.
4. Add a short description: `AI-Creator: гумористична гра про AI-креаторів, агентів і віральний хаос 2026 року.`
5. Add a bot command:

```text
start - Відкрити AI-Creator
```

## Configure with code

After `WEB_APP_URL` is a public HTTPS URL, run:

```powershell
npm run bot:setup
```

This configures bot commands and the Telegram menu button.

## Deploy on Render

1. Push this project to GitHub.
2. Create a new Render Web Service from the repository.
3. Render can use the included `render.yaml`.
4. Add environment variables:

```env
BOT_TOKEN=your_bot_token
WEB_APP_URL=https://your-render-service.onrender.com
BOT_POLLING=true
PORT=5173
```

5. Deploy.
6. Run locally after updating `.env`, or use Render shell:

```powershell
npm run bot:setup
```

After that, `/start` and the bot menu button open the Mini App.

## Run bot polling

Set:

```env
BOT_POLLING=true
```

Then run:

```powershell
npm run start
```

The bot will respond to `/start` and `/play` with a Mini App button.

## Backend checklist

When moving beyond this local MVP:

- validate Telegram `initData` on the backend;
- store player progress server-side;
- calculate leaderboard server-side;
- move mission and event content into an admin-editable table;
- add anti-cheat checks for money, hype, XP, and purchases.

## Suggested first backend endpoints

```text
POST /auth/telegram
GET /player/me
POST /game/ship
POST /game/rest
POST /agents/buy
GET /leaderboard
GET /content/season
```
