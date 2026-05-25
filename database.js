import { mkdir, readFile, writeFile } from "node:fs/promises";

const dataDir = new URL("./data/", import.meta.url);
const dbFile = new URL("./data/db.json", import.meta.url);

const defaultDb = {
  players: {},
  leaderboard: []
};

let db = await loadDb();

async function loadDb() {
  try {
    return JSON.parse(await readFile(dbFile, "utf8"));
  } catch {
    return structuredClone(defaultDb);
  }
}

async function saveDb() {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dbFile, JSON.stringify(db, null, 2), "utf8");
}

export function getPlayer(id) {
  return db.players[String(id)] || null;
}

export async function upsertPlayer(id, patch) {
  const key = String(id);
  const current = db.players[key] || {
    id: key,
    version: 3,
    name: "AI Creator",
    username: "",
    day: 1,
    week: 1,
    money: 260,
    credits: 30,
    hype: 3,
    rep: 2,
    energy: 100,
    xp: 0,
    level: 1,
    viral: 38,
    portfolio: 0,
    selectedContent: "trend",
    activeSubs: [],
    suspendedSubs: [],
    ownedAgents: [],
    skills: { prompting: 1, taste: 1, marketing: 1, ops: 1 },
    character: {
      gender: "neutral",
      skin: "warm",
      hairStyle: "crop",
      hair: "black",
      outfit: "hoodie",
      accessory: "glasses"
    },
    updatedAt: new Date().toISOString()
  };

  db.players[key] = {
    ...current,
    ...patch,
    skills: { ...current.skills, ...(patch.skills || {}) },
    character: { ...current.character, ...(patch.character || {}) },
    updatedAt: new Date().toISOString()
  };

  await saveDb();
  return db.players[key];
}

export async function savePlayerState(id, state) {
  const player = await upsertPlayer(id, state);
  updateLeaderboard(player);
  await saveDb();
  return player;
}

export function updateLeaderboard(player) {
  const score = Math.round(
    (player.money || 0) * 0.25 +
    (player.hype || 0) * 4 +
    (player.rep || 0) * 8 +
    (player.level || 1) * 65 +
    (player.portfolio || 0) * 55 +
    (player.credits || 0) * 0.25
  );
  const existing = db.leaderboard.filter((item) => item.id !== player.id);

  db.leaderboard = [
    ...existing,
    {
      id: player.id,
      name: player.name || "AI Creator",
      username: player.username || "",
      score,
      level: player.level,
      updatedAt: new Date().toISOString()
    }
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);
}

export function getLeaderboard() {
  return db.leaderboard;
}
