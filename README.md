# AI-Creator: Prompt Empire

Playable MVP for a humorous 2026 Telegram Mini App game about building an AI creator empire.

## Run locally

```powershell
npm run dev
```

Open `http://localhost:5173`.

## What is already included

- Telegram Mini App bootstrap via `telegram-web-app.js`
- Daily mission loop
- Strategy selection
- Career ranks from beginner to professional creator
- Weekly AI subscription economy
- AI credits required for content generation
- Skill upgrades and rank-gated agents
- Random events with Ukrainian humor
- Basic economy: money, hype, reputation, energy, XP, level
- Character creator with gender/style, skin, hair, outfit, and accessories
- AI-agent hiring
- Local and server leaderboard
- `localStorage` save state plus backend sync in Telegram
- Built-in Node backend with Telegram `initData` validation
- Telegram bot polling for `/start` and `/play`
- Responsive mobile-first UI

## Next production steps

- Deploy to a public HTTPS URL and set `WEB_APP_URL`
- Replace the JSON database with PostgreSQL
- Add server-side missions and seasonal events
- Add Telegram Stars purchases for cosmetic agents and energy bundles
