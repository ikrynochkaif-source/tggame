const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#eef1e7");
  tg.setBackgroundColor("#eef1e7");
}

const storeKey = "ai-creator-save-v1";
const api = {
  playerId: localStorage.getItem("ai-creator-player-id") || "",
  ready: false
};

const missions = [
  {
    title: "Зібрати вірусний AI-ролик",
    copy: "Клієнт хоче 7 секунд магії, 3 правки і щоб воно виглядало дорожче за бюджет.",
    viral: 42
  },
  {
    title: "Запустити агента для продажів",
    copy: "Агент має продавати курс, але поки що він продає тільки ідею переписати CRM.",
    viral: 36
  },
  {
    title: "Врятувати стартап за вечір",
    copy: "У фаундера вже є домен, логотип і впевненість. Не вистачає лише продукту.",
    viral: 51
  },
  {
    title: "Зробити брендбук для AI-кав'ярні",
    copy: "Потрібно сучасно, тепло, технологічно і щоб бариста не боявся кнопки Deploy.",
    viral: 33
  },
  {
    title: "Підготувати Telegram-воронку",
    copy: "Три повідомлення, один бот і жодної фрази 'ми використовуємо інновації'.",
    viral: 47
  }
];

const trends = [
  "У 2026 всі знову роблять агентів, тільки тепер з бюджетом на UX.",
  "Короткі відео перемогли лонгріди, але лонгріди не здалися і стали каруселями.",
  "Prompt engineer перейменувався на AI creative director і підняв чек.",
  "Клієнти просять 'живий AI', а мають на увазі кнопку, яка не ламається.",
  "Найкращий moat тижня: нормальна документація."
];

const outcomes = [
  {
    title: "Вірусність пішла вгору",
    text: "Алгоритм подумав, що це контент. Рідкісний момент згоди між людьми й машинами.",
    money: 130,
    hype: 18,
    rep: 6,
    energy: -14,
    xp: 22
  },
  {
    title: "Клієнт сказав 'майже'",
    text: "Це означає ще 5 правок, але без технічного завдання. Класика жанру.",
    money: 70,
    hype: 7,
    rep: 4,
    energy: -10,
    xp: 14
  },
  {
    title: "Модель вигадала API",
    text: "Документація не підтвердила, зате впевненість була на рівні TED Talk.",
    money: 20,
    hype: 3,
    rep: -3,
    energy: -16,
    xp: 9
  },
  {
    title: "Пост залетів у нішевий чат",
    text: "Там 412 людей, але кожен має думку, мікрофон і друга з агентством.",
    money: 95,
    hype: 13,
    rep: 5,
    energy: -12,
    xp: 18
  },
  {
    title: "Автоматизація зекономила день",
    text: "Ти натиснув одну кнопку. Всі вирішили, що це була архітектура.",
    money: 120,
    hype: 9,
    rep: 8,
    energy: -8,
    xp: 20
  }
];

const agents = [
  {
    id: "prompt-comedian",
    name: "Prompt Comedian",
    desc: "+7 Hype за хід. Пише промпти так, ніби стендап завтра.",
    cost: 220,
    bonus: { hype: 7 }
  },
  {
    id: "taste-director",
    name: "Taste Director",
    desc: "+6 репутації за хід. Видаляє зайві градієнти без жалю.",
    cost: 320,
    bonus: { rep: 6 }
  },
  {
    id: "ops-agent",
    name: "Ops Agent",
    desc: "+80 грошей за хід. Пам'ятає, що інвойс теж частина продукту.",
    cost: 420,
    bonus: { money: 80 }
  }
];

const strategyMods = {
  fast: { money: 0, hype: 9, rep: -1, energy: -6, xp: 4, risk: 0.2 },
  taste: { money: 35, hype: 0, rep: 8, energy: -4, xp: 7, risk: -0.08 },
  auto: { money: 20, hype: 3, rep: 2, energy: 4, xp: 5, risk: 0.02 }
};

const avatarOptions = {
  gender: {
    label: "Стиль",
    items: [
      { id: "feminine", label: "Креаторка" },
      { id: "masculine", label: "Креатор" },
      { id: "neutral", label: "Вільний" }
    ]
  },
  skin: {
    label: "Шкіра",
    items: [
      { id: "porcelain", label: "Світла", color: "oklch(86% 0.045 62)" },
      { id: "warm", label: "Тепла", color: "oklch(72% 0.08 58)" },
      { id: "bronze", label: "Бронза", color: "oklch(58% 0.09 55)" },
      { id: "deep", label: "Глибока", color: "oklch(43% 0.075 48)" }
    ]
  },
  hairStyle: {
    label: "Зачіска",
    items: [
      { id: "crop", label: "Кроп" },
      { id: "bob", label: "Боб" },
      { id: "waves", label: "Хвилі" },
      { id: "buzz", label: "Buzz" }
    ]
  },
  hair: {
    label: "Волосся",
    items: [
      { id: "black", label: "Чорне", color: "oklch(21% 0.02 70)" },
      { id: "brown", label: "Каштан", color: "oklch(36% 0.055 55)" },
      { id: "blonde", label: "Блонд", color: "oklch(78% 0.095 86)" },
      { id: "pink", label: "Рожеве", color: "oklch(68% 0.16 8)" },
      { id: "mint", label: "М'ята", color: "oklch(74% 0.12 168)" }
    ]
  },
  outfit: {
    label: "Одяг",
    items: [
      { id: "hoodie", label: "Худі", color: "oklch(58% 0.14 153)" },
      { id: "blazer", label: "Блейзер", color: "oklch(35% 0.08 260)" },
      { id: "jacket", label: "Куртка", color: "oklch(58% 0.13 28)" },
      { id: "tee", label: "Футболка", color: "oklch(72% 0.13 78)" }
    ]
  },
  accessory: {
    label: "Аксесуар",
    items: [
      { id: "none", label: "Без" },
      { id: "glasses", label: "Окуляри" },
      { id: "earring", label: "Сережка" },
      { id: "both", label: "Все" }
    ]
  }
};

const defaultCharacter = {
  gender: "neutral",
  skin: "warm",
  hairStyle: "crop",
  hair: "black",
  outfit: "hoodie",
  accessory: "glasses"
};

const defaultState = {
  day: 1,
  money: 300,
  hype: 12,
  rep: 10,
  energy: 100,
  xp: 0,
  level: 1,
  viral: 38,
  ownedAgents: [],
  character: { ...defaultCharacter },
  feed: [
    {
      title: "Старт сезону",
      text: "Ти відкрив AI-студію в Telegram. Перший клієнт вже питає, чи можна дешевше."
    }
  ]
};

let state = loadState();

const els = {
  trendText: document.querySelector("#trendText"),
  missionTitle: document.querySelector("#missionTitle"),
  missionCopy: document.querySelector("#missionCopy"),
  dayLabel: document.querySelector("#dayLabel"),
  viralValue: document.querySelector("#viralValue"),
  viralBar: document.querySelector("#viralBar"),
  moneyValue: document.querySelector("#moneyValue"),
  hypeValue: document.querySelector("#hypeValue"),
  repValue: document.querySelector("#repValue"),
  energyValue: document.querySelector("#energyValue"),
  levelValue: document.querySelector("#levelValue"),
  xpBar: document.querySelector("#xpBar"),
  eventFeed: document.querySelector("#eventFeed"),
  agentList: document.querySelector("#agentList"),
  agentCount: document.querySelector("#agentCount"),
  leaderboard: document.querySelector("#leaderboard"),
  shipButton: document.querySelector("#shipButton"),
  restButton: document.querySelector("#restButton"),
  resetButton: document.querySelector("#resetButton"),
  randomAvatarButton: document.querySelector("#randomAvatarButton"),
  customizerGrid: document.querySelector("#customizerGrid"),
  avatarSummary: document.querySelector("#avatarSummary"),
  avatarBody: document.querySelector("#avatarBody"),
  avatarJacket: document.querySelector("#avatarJacket"),
  avatarNeck: document.querySelector("#avatarNeck"),
  avatarHead: document.querySelector("#avatarHead"),
  avatarHairBack: document.querySelector("#avatarHairBack"),
  avatarHair: document.querySelector("#avatarHair"),
  avatarMouth: document.querySelector("#avatarMouth"),
  avatarGlasses: document.querySelector("#avatarGlasses"),
  avatarEarring: document.querySelector("#avatarEarring"),
  eventTemplate: document.querySelector("#eventTemplate")
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey));
    return {
      ...defaultState,
      ...saved,
      character: { ...defaultCharacter, ...(saved?.character || {}) }
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(storeKey, JSON.stringify(state));
  syncState();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function currentMission() {
  return missions[(state.day - 1) % missions.length];
}

function selectedStrategy() {
  return document.querySelector("input[name='strategy']:checked")?.value || "fast";
}

function formatMoney(value) {
  return `$${Math.round(value)}`;
}

async function requestJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (api.playerId) {
    headers["X-Player-Id"] = api.playerId;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  return response.json();
}

async function authTelegramPlayer() {
  if (!tg?.initData) {
    return;
  }

  try {
    const data = await requestJson("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ initData: tg.initData })
    });

    if (!data.ok || !data.player) {
      pushEvent("Telegram auth", "Сервер не впізнав сесію. Локальний режим живий, але рейтинг не синхронізується.");
      render();
      return;
    }

    api.playerId = data.player.id;
    api.ready = true;
    localStorage.setItem("ai-creator-player-id", api.playerId);
    state = { ...state, ...data.player, character: { ...defaultCharacter, ...(data.player.character || state.character) } };
    saveState();
    await loadServerLeaderboard();
  } catch {
    pushEvent("Backend дрімає", "Гра працює локально. Коли сервер прокинеться, прогрес піде в хмару.");
    render();
  }
}

let syncTimer = null;

function syncState() {
  if (!api.ready || !api.playerId) return;

  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      await requestJson("/api/player/state", {
        method: "POST",
        body: JSON.stringify({ state })
      });
      await loadServerLeaderboard();
    } catch {
      api.ready = false;
    }
  }, 250);
}

function pushEvent(title, text) {
  state.feed = [{ title, text }, ...state.feed].slice(0, 7);
}

function ownedBonus() {
  return state.ownedAgents.reduce(
    (total, id) => {
      const agent = agents.find((item) => item.id === id);
      if (!agent) return total;

      return {
        money: total.money + (agent.bonus.money || 0),
        hype: total.hype + (agent.bonus.hype || 0),
        rep: total.rep + (agent.bonus.rep || 0)
      };
    },
    { money: 0, hype: 0, rep: 0 }
  );
}

function applyDelta(delta) {
  state.money = Math.max(0, state.money + (delta.money || 0));
  state.hype = Math.max(0, state.hype + (delta.hype || 0));
  state.rep = Math.max(0, state.rep + (delta.rep || 0));
  state.energy = clamp(state.energy + (delta.energy || 0), 0, 100);
  state.xp += delta.xp || 0;

  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
    state.energy = 100;
    pushEvent("Новий рівень", `Рівень ${state.level}. Тепер можна впевненіше казати: “це не баг, це roadmap”.`);
  }
}

function shipProject() {
  if (state.energy < 12) {
    pushEvent("Потрібна кава", "Енергії мало. Навіть AI-агент почав відповідати коротко і сухо.");
    render();
    return;
  }

  const strategy = strategyMods[selectedStrategy()];
  const base = outcomes[Math.floor(Math.random() * outcomes.length)];
  const bonus = ownedBonus();
  const riskRoll = Math.random();
  const risky = riskRoll < Math.max(0.05, 0.18 + strategy.risk);
  const riskDelta = risky
    ? { money: -35, hype: -5, rep: -4, energy: -4, xp: 3 }
    : { money: 0, hype: 0, rep: 0, energy: 0, xp: 0 };

  applyDelta({
    money: base.money + strategy.money + bonus.money + riskDelta.money,
    hype: base.hype + strategy.hype + bonus.hype + riskDelta.hype,
    rep: base.rep + strategy.rep + bonus.rep + riskDelta.rep,
    energy: base.energy + strategy.energy + riskDelta.energy,
    xp: base.xp + strategy.xp + riskDelta.xp
  });

  state.day += 1;
  state.viral = clamp(
    currentMission().viral + Math.round(state.hype * 0.18 + state.rep * 0.12 + Math.random() * 18),
    8,
    100
  );

  if (risky) {
    pushEvent("Продакшн здивувався", "Збірка пройшла з другого разу. Команда зробила вигляд, що так і планувалось.");
  }

  pushEvent(base.title, base.text);
  saveState();
  render();
}

function rest() {
  state.energy = clamp(state.energy + 24, 0, 100);
  state.hype = Math.max(0, state.hype - 2);
  pushEvent("Кава-брейк", "Ти відновив енергію. Hype трохи впав, бо інтернет не чекає нікого.");
  saveState();
  render();
}

function buyAgent(agentId) {
  const agent = agents.find((item) => item.id === agentId);
  if (!agent || state.ownedAgents.includes(agent.id) || state.money < agent.cost) return;

  state.money -= agent.cost;
  state.ownedAgents.push(agent.id);
  pushEvent("Новий агент", `${agent.name} у команді. Тепер хаос хоча б частково делегований.`);
  saveState();
  render();
}

function optionById(group, id) {
  return avatarOptions[group].items.find((item) => item.id === id) || avatarOptions[group].items[0];
}

function updateCharacter(key, value) {
  state.character[key] = value;
  saveState();
  renderCharacter();
}

function randomizeCharacter() {
  Object.entries(avatarOptions).forEach(([key, group]) => {
    const option = group.items[Math.floor(Math.random() * group.items.length)];
    state.character[key] = option.id;
  });

  pushEvent("Новий образ", "Персонаж оновив стиль. Тепер можна брати дорожче за консультацію.");
  saveState();
  render();
}

function resetGame() {
  state = {
    ...defaultState,
    character: { ...defaultCharacter },
    feed: [...defaultState.feed],
    ownedAgents: []
  };
  saveState();
  render();
}

function renderCustomizer() {
  els.customizerGrid.innerHTML = "";

  Object.entries(avatarOptions).forEach(([key, group]) => {
    const field = document.createElement("fieldset");
    field.className = "avatar-control";
    field.innerHTML = `<legend>${group.label}</legend>`;

    const list = document.createElement("div");
    list.className = key === "skin" || key === "hair" || key === "outfit" ? "swatch-list" : "chip-list";

    group.items.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.active = String(state.character[key] === option.id);
      button.setAttribute("aria-pressed", String(state.character[key] === option.id));
      button.addEventListener("click", () => updateCharacter(key, option.id));

      if (option.color) {
        button.className = "swatch-button";
        button.style.setProperty("--swatch", option.color);
        button.innerHTML = `<span aria-hidden="true"></span><strong>${option.label}</strong>`;
      } else {
        button.className = "chip-button";
        button.textContent = option.label;
      }

      list.append(button);
    });

    field.append(list);
    els.customizerGrid.append(field);
  });
}

function renderCharacter() {
  const skin = optionById("skin", state.character.skin).color;
  const hair = optionById("hair", state.character.hair).color;
  const outfit = optionById("outfit", state.character.outfit).color;
  const gender = optionById("gender", state.character.gender).label;
  const hairStyle = optionById("hairStyle", state.character.hairStyle).label;
  const accessory = state.character.accessory;

  els.avatarSummary.textContent = `${gender}, ${hairStyle}`;
  els.avatarHead.style.fill = skin;
  els.avatarNeck.style.fill = skin;
  els.avatarBody.style.fill = outfit;
  els.avatarJacket.style.fill = outfit;
  els.avatarGlasses.dataset.visible = String(accessory === "glasses" || accessory === "both");
  els.avatarEarring.dataset.visible = String(accessory === "earring" || accessory === "both");

  const hairShapes = {
    crop: {
      back: "",
      front: "M70 101c2-35 20-55 45-55 24 0 39 16 43 47-15-10-32-13-51-10-15 2-27 8-37 18Z"
    },
    bob: {
      back: "M63 128c-4-42 14-83 49-83s53 41 49 83c-2 24-17 42-49 42s-47-18-49-42Z",
      front: "M69 106c0-35 18-59 45-59 22 0 38 17 43 48-18-5-34-8-48-7-17 1-30 7-40 18Z"
    },
    waves: {
      back: "M59 130c-2-47 19-85 53-85 35 0 55 38 53 85-9 11-19 18-31 21 6-32-1-53-22-63-23 10-31 31-24 63-12-3-22-10-29-21Z",
      front: "M66 101c10-35 30-54 59-50 22 3 34 19 36 43-21-9-37-9-49 1-14-6-29-4-46 6Z"
    },
    buzz: {
      back: "",
      front: "M72 96c4-30 19-47 40-47s36 17 40 47c-24-12-52-12-80 0Z"
    }
  };

  const shape = hairShapes[state.character.hairStyle] || hairShapes.crop;
  els.avatarHairBack.setAttribute("d", shape.back);
  els.avatarHairBack.style.fill = hair;
  els.avatarHair.setAttribute("d", shape.front);
  els.avatarHair.style.fill = hair;

  const mouthShapes = {
    feminine: "M99 132c8 8 18 8 26 0",
    masculine: "M101 134c7 4 16 4 23 0",
    neutral: "M100 132c7 6 17 6 24 0"
  };
  els.avatarMouth.setAttribute("d", mouthShapes[state.character.gender] || mouthShapes.neutral);

  renderCustomizer();
}

function renderFeed() {
  els.eventFeed.innerHTML = "";

  state.feed.forEach((item) => {
    const node = els.eventTemplate.content.cloneNode(true);
    node.querySelector("strong").textContent = item.title;
    node.querySelector("span").textContent = item.text;
    els.eventFeed.append(node);
  });
}

function renderAgents() {
  els.agentCount.textContent = `${state.ownedAgents.length}/${agents.length}`;
  els.agentList.innerHTML = "";

  agents.forEach((agent) => {
    const owned = state.ownedAgents.includes(agent.id);
    const card = document.createElement("section");
    card.className = "agent-card";
    card.innerHTML = `
      <div>
        <h3>${agent.name}</h3>
        <p>${agent.desc}</p>
      </div>
      <button type="button" ${owned || state.money < agent.cost ? "disabled" : ""}>
        ${owned ? "У команді" : formatMoney(agent.cost)}
      </button>
    `;

    card.querySelector("button").addEventListener("click", () => buyAgent(agent.id));
    els.agentList.append(card);
  });
}

function renderLeaderboard() {
  const playerName = tg?.initDataUnsafe?.user?.first_name || "Ти";
  const score = state.money + state.hype * 12 + state.rep * 10 + state.level * 80;
  const savedBoard = state.serverLeaderboard || [];
  const rows = (savedBoard.length ? savedBoard : [
    { name: playerName, score },
    { name: "Креатор з Notion-таблицею", score: 920 },
    { name: "Prompt Baron", score: 860 },
    { name: "Студія 'Зробимо завтра'", score: 790 },
    { name: "No-Code Samurai", score: 720 }
  ]).sort((a, b) => b.score - a.score);

  els.leaderboard.innerHTML = "";

  rows.forEach((row, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<b>${index + 1}</b><strong>${row.name}</strong><span>${Math.round(row.score)}</span>`;
    els.leaderboard.append(item);
  });
}

async function loadServerLeaderboard() {
  try {
    const data = await requestJson("/api/leaderboard");
    if (data.ok && Array.isArray(data.leaderboard) && data.leaderboard.length) {
      state.serverLeaderboard = data.leaderboard;
      localStorage.setItem(storeKey, JSON.stringify(state));
      renderLeaderboard();
    }
  } catch {
    // Local leaderboard remains available when the backend is offline.
  }
}

function render() {
  const mission = currentMission();
  const trend = trends[(state.day - 1) % trends.length];

  els.trendText.textContent = trend;
  els.missionTitle.textContent = mission.title;
  els.missionCopy.textContent = mission.copy;
  els.dayLabel.textContent = `День ${state.day}`;
  els.viralValue.textContent = `${state.viral}%`;
  els.viralBar.style.width = `${state.viral}%`;
  els.moneyValue.textContent = formatMoney(state.money);
  els.hypeValue.textContent = state.hype;
  els.repValue.textContent = state.rep;
  els.energyValue.textContent = `${state.energy}%`;
  els.levelValue.textContent = state.level;
  els.xpBar.style.width = `${state.xp}%`;
  els.shipButton.disabled = state.energy < 12;

  renderCharacter();
  renderFeed();
  renderAgents();
  renderLeaderboard();
}

els.shipButton.addEventListener("click", shipProject);
els.restButton.addEventListener("click", rest);
els.resetButton.addEventListener("click", resetGame);
els.randomAvatarButton.addEventListener("click", randomizeCharacter);

render();
authTelegramPlayer();
loadServerLeaderboard();
