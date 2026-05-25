const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#eef1e7");
  tg.setBackgroundColor("#eef1e7");
}

const storeKey = "ai-creator-save-v2";
const legacyStoreKey = "ai-creator-save-v1";

const api = {
  playerId: localStorage.getItem("ai-creator-player-id") || "",
  ready: false
};

const ranks = [
  {
    id: "rookie",
    title: "Новачок з промптом",
    min: 0,
    copy: "Перші замовлення, перші нерви, перші файли final_final_v3."
  },
  {
    id: "freelancer",
    title: "Фрилансер на нейронках",
    min: 180,
    copy: "Ти вже знаєш, що без підписок контент сам себе не згенерує."
  },
  {
    id: "creator",
    title: "AI-креатор",
    min: 430,
    copy: "Портфоліо починає продавати краще, ніж твій голосовий клієнту."
  },
  {
    id: "producer",
    title: "AI-продюсер",
    min: 780,
    copy: "Ти керуєш пайплайном, а не просто просиш модель зробити красиво."
  },
  {
    id: "studio",
    title: "Міні-студія",
    min: 1240,
    copy: "Агенти, підписки, дедлайни. Майже бізнес, тільки з мемами."
  },
  {
    id: "pro",
    title: "Профі Prompt Empire",
    min: 1800,
    copy: "Тебе вже кличуть не 'зробити пост', а 'побудувати контент-машину'."
  }
];

const subscriptions = [
  {
    id: "promptbox",
    name: "PromptBox Basic",
    cost: 35,
    credits: 90,
    unlocks: ["copy", "trend"],
    quality: 4,
    desc: "Тексти, промпти, сценарії, перші клієнтські брифи."
  },
  {
    id: "pixelforge",
    name: "Pixel Forge",
    cost: 65,
    credits: 95,
    unlocks: ["visual", "brand"],
    quality: 7,
    desc: "Зображення, каруселі, бренд-візуали і той самий 'преміум'."
  },
  {
    id: "motionlab",
    name: "Motion Lab",
    cost: 95,
    credits: 110,
    unlocks: ["video"],
    quality: 10,
    desc: "Короткі відео, рілси, заставки, анімації для клієнтів без терпіння."
  },
  {
    id: "agentcloud",
    name: "Agent Cloud",
    cost: 80,
    credits: 70,
    unlocks: ["automation"],
    quality: 6,
    desc: "Автоматизації, AI-агенти, воронки і нічні задачі без ручного копіпасту."
  }
];

const contentTypes = [
  {
    id: "trend",
    name: "Трендовий пост",
    kind: "trend",
    requiredSub: "promptbox",
    minLevel: 1,
    credits: 18,
    energy: 12,
    basePayout: 80,
    rep: 4,
    hype: 15,
    xp: 18,
    risk: 0.18,
    desc: "Швидкий контент, який або залетить, або стане скріном у чаті конкурентів."
  },
  {
    id: "copy",
    name: "Продажний лендінг",
    kind: "copy",
    requiredSub: "promptbox",
    minLevel: 2,
    credits: 26,
    energy: 16,
    basePayout: 135,
    rep: 8,
    hype: 5,
    xp: 24,
    risk: 0.14,
    desc: "Копірайтинг, офер, структура. Клієнт хоче 'як Apple', бюджет як на піцу."
  },
  {
    id: "visual",
    name: "Візуальна карусель",
    kind: "visual",
    requiredSub: "pixelforge",
    minLevel: 2,
    credits: 34,
    energy: 18,
    basePayout: 170,
    rep: 10,
    hype: 12,
    xp: 30,
    risk: 0.16,
    desc: "Карусель для Telegram/Instagram з нормальним ритмом, а не 12 однакових карток."
  },
  {
    id: "brand",
    name: "AI-брендпак",
    kind: "brand",
    requiredSub: "pixelforge",
    minLevel: 3,
    credits: 46,
    energy: 24,
    basePayout: 260,
    rep: 18,
    hype: 8,
    xp: 42,
    risk: 0.2,
    desc: "Лого-напрям, палітра, візуальний світ. Дорого, але правки теж дорогі."
  },
  {
    id: "video",
    name: "AI-відео 15 секунд",
    kind: "video",
    requiredSub: "motionlab",
    minLevel: 4,
    credits: 58,
    energy: 28,
    basePayout: 360,
    rep: 20,
    hype: 26,
    xp: 56,
    risk: 0.26,
    desc: "Відео, де рука має залишитись рукою, а не стати бізнес-рішенням."
  },
  {
    id: "automation",
    name: "AI-воронка з агентом",
    kind: "automation",
    requiredSub: "agentcloud",
    minLevel: 5,
    credits: 62,
    energy: 30,
    basePayout: 440,
    rep: 28,
    hype: 14,
    xp: 70,
    risk: 0.22,
    desc: "Бот, сценарій, автоворонка. Якщо працює з першого разу, це майже містика."
  }
];

const strategies = {
  fast: {
    label: "Швидко в тренд",
    payout: 0.92,
    hype: 11,
    rep: -2,
    energy: -3,
    risk: 0.12,
    quality: -5
  },
  taste: {
    label: "Зробити зі смаком",
    payout: 1.08,
    hype: 2,
    rep: 10,
    energy: 3,
    risk: -0.1,
    quality: 10
  },
  auto: {
    label: "Автоматизувати пайплайн",
    payout: 1,
    hype: 4,
    rep: 4,
    energy: 8,
    risk: -0.04,
    quality: 2
  }
};

const upgrades = [
  {
    id: "prompting",
    name: "Prompting",
    desc: "Менше галюцинацій, більше керованого результату.",
    baseCost: 120,
    max: 5
  },
  {
    id: "taste",
    name: "Taste",
    desc: "Піднімає якість і репутацію, прибирає зайву 'нейромагію'.",
    baseCost: 140,
    max: 5
  },
  {
    id: "marketing",
    name: "Marketing",
    desc: "Краще продає контент, додає hype і гроші.",
    baseCost: 130,
    max: 5
  },
  {
    id: "ops",
    name: "Ops",
    desc: "Знижує витрати енергії і ризик дедлайнів.",
    baseCost: 150,
    max: 5
  }
];

const agents = [
  {
    id: "brief-cleaner",
    name: "Brief Cleaner",
    desc: "-8% ризику. Перекладає 'зроби вау' людською мовою.",
    cost: 360,
    minRank: "freelancer",
    bonus: { risk: -0.08 }
  },
  {
    id: "taste-director",
    name: "Taste Director",
    desc: "+8 якості. Не дає інтерфейсу виглядати як презентація з 2019.",
    cost: 520,
    minRank: "creator",
    bonus: { quality: 8 }
  },
  {
    id: "sales-agent",
    name: "Sales Agent",
    desc: "+14% до виплат. Інвойс летить швидше за правки.",
    cost: 680,
    minRank: "producer",
    bonus: { payout: 0.14 }
  },
  {
    id: "ops-agent",
    name: "Ops Agent",
    desc: "-6 енергії за складні задачі. Пам'ятає, де лежить дедлайн.",
    cost: 760,
    minRank: "studio",
    bonus: { energy: 6 }
  }
];

const trends = [
  "У 2026 клієнти хочуть AI-агента, але спершу питають, чи можна без підписки.",
  "Короткі відео знову перемогли лонгріди. Лонгріди перейменувались у каруселі.",
  "Prompt engineer став AI creative director і тепер продає не промпти, а спокій.",
  "Ринок любить швидкість, але платить за результат, який не соромно показати мамі.",
  "Найкращий moat тижня: нормальна документація і своєчасно сплачена підписка."
];

const events = [
  {
    title: "Алгоритм прокинувся",
    text: "Платформа раптом вирішила показати твій контент людям, а не лише трьом знайомим.",
    money: 40,
    hype: 10,
    rep: 2
  },
  {
    title: "Клієнт приніс голосове",
    text: "4 хвилини брифу, 0 конкретики, 12 разів слово 'вайб'.",
    money: 0,
    hype: 0,
    rep: -2,
    energy: -6
  },
  {
    title: "Референс врятував день",
    text: "Ти знайшов приклад, і вся команда зробила вигляд, що так і бачила з початку.",
    money: 30,
    hype: 3,
    rep: 5
  },
  {
    title: "Модель впевнено вигадала функцію",
    text: "API не існує, зате відповідь була дуже переконлива.",
    money: -20,
    hype: 0,
    rep: -4,
    energy: -4
  }
];

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
  version: 2,
  day: 1,
  week: 1,
  money: 220,
  credits: 40,
  hype: 8,
  rep: 6,
  energy: 100,
  xp: 0,
  level: 1,
  portfolio: 0,
  selectedContent: "trend",
  activeSubs: [],
  suspendedSubs: [],
  ownedAgents: [],
  skills: { prompting: 1, taste: 1, marketing: 1, ops: 1 },
  character: { ...defaultCharacter },
  feed: [
    {
      title: "Старт студії",
      text: "У тебе $220, 40 AI-кредитів і велика віра, що підписки окупляться до кінця тижня."
    }
  ]
};

let state = loadState();
let syncTimer = null;

const els = {
  trendText: document.querySelector("#trendText"),
  rankTitle: document.querySelector("#rankTitle"),
  rankCopy: document.querySelector("#rankCopy"),
  nextRankLabel: document.querySelector("#nextRankLabel"),
  rankScoreValue: document.querySelector("#rankScoreValue"),
  rankBar: document.querySelector("#rankBar"),
  missionTitle: document.querySelector("#missionTitle"),
  missionCopy: document.querySelector("#missionCopy"),
  dayLabel: document.querySelector("#dayLabel"),
  forecastValue: document.querySelector("#forecastValue"),
  forecastBar: document.querySelector("#forecastBar"),
  contentList: document.querySelector("#contentList"),
  moneyValue: document.querySelector("#moneyValue"),
  creditsValue: document.querySelector("#creditsValue"),
  hypeValue: document.querySelector("#hypeValue"),
  repValue: document.querySelector("#repValue"),
  portfolioValue: document.querySelector("#portfolioValue"),
  energyValue: document.querySelector("#energyValue"),
  levelValue: document.querySelector("#levelValue"),
  xpBar: document.querySelector("#xpBar"),
  weeklyCostValue: document.querySelector("#weeklyCostValue"),
  subscriptionList: document.querySelector("#subscriptionList"),
  skillSummary: document.querySelector("#skillSummary"),
  upgradeList: document.querySelector("#upgradeList"),
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
  const saved = safeParse(localStorage.getItem(storeKey)) || safeParse(localStorage.getItem(legacyStoreKey));
  return normalizeState(saved || {});
}

function normalizeState(saved) {
  const merged = {
    ...defaultState,
    ...saved,
    skills: { ...defaultState.skills, ...(saved.skills || {}) },
    character: { ...defaultCharacter, ...(saved.character || {}) },
    activeSubs: Array.isArray(saved.activeSubs) ? saved.activeSubs : [],
    suspendedSubs: Array.isArray(saved.suspendedSubs) ? saved.suspendedSubs : [],
    ownedAgents: Array.isArray(saved.ownedAgents) ? saved.ownedAgents : [],
    feed: Array.isArray(saved.feed) && saved.feed.length ? saved.feed : [...defaultState.feed]
  };

  merged.version = 2;
  merged.money = Math.max(0, Number(merged.money) || 0);
  merged.credits = Math.max(0, Number(merged.credits) || 0);
  merged.hype = Math.max(0, Number(merged.hype) || 0);
  merged.rep = Math.max(0, Number(merged.rep) || 0);
  merged.energy = clamp(Number(merged.energy) || 0, 0, 100);
  merged.level = Math.max(1, Number(merged.level) || 1);
  merged.xp = clamp(Number(merged.xp) || 0, 0, 99);
  merged.portfolio = Math.max(0, Number(merged.portfolio) || 0);
  merged.day = Math.max(1, Number(merged.day) || 1);
  merged.week = Math.max(1, Math.ceil(merged.day / 7));

  if (!contentTypes.some((content) => content.id === merged.selectedContent)) {
    merged.selectedContent = "trend";
  }

  return merged;
}

function safeParse(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function saveState({ remote = true } = {}) {
  localStorage.setItem(storeKey, JSON.stringify(state));
  if (remote) syncState();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatMoney(value) {
  return `$${Math.round(value)}`;
}

function selectedStrategy() {
  return document.querySelector("input[name='strategy']:checked")?.value || "fast";
}

function selectedContent() {
  return contentTypes.find((content) => content.id === state.selectedContent) || contentTypes[0];
}

function subscriptionById(id) {
  return subscriptions.find((sub) => sub.id === id);
}

function activeSubscription(id) {
  return state.activeSubs.includes(id);
}

function rankScore() {
  return Math.round(state.rep * 5 + state.portfolio * 22 + state.level * 38 + state.hype * 1.4);
}

function currentRank() {
  const score = rankScore();
  return [...ranks].reverse().find((rank) => score >= rank.min) || ranks[0];
}

function nextRank() {
  const score = rankScore();
  return ranks.find((rank) => rank.min > score) || null;
}

function rankUnlocked(rankId) {
  return ranks.findIndex((rank) => rank.id === currentRank().id) >= ranks.findIndex((rank) => rank.id === rankId);
}

function weeklyCost() {
  return state.activeSubs.reduce((total, id) => total + (subscriptionById(id)?.cost || 0), 0);
}

function weeklyCredits() {
  return state.activeSubs.reduce((total, id) => total + (subscriptionById(id)?.credits || 0), 0);
}

function subscriptionQuality() {
  return state.activeSubs.reduce((total, id) => total + (subscriptionById(id)?.quality || 0), 0);
}

function agentBonus() {
  return state.ownedAgents.reduce(
    (total, id) => {
      const agent = agents.find((item) => item.id === id);
      if (!agent) return total;
      return {
        payout: total.payout + (agent.bonus.payout || 0),
        quality: total.quality + (agent.bonus.quality || 0),
        risk: total.risk + (agent.bonus.risk || 0),
        energy: total.energy + (agent.bonus.energy || 0)
      };
    },
    { payout: 0, quality: 0, risk: 0, energy: 0 }
  );
}

function forecast(content = selectedContent(), strategyKey = selectedStrategy()) {
  const strategy = strategies[strategyKey];
  const agents = agentBonus();
  const skillQuality = state.skills.prompting * 5 + state.skills.taste * 6 + state.skills.marketing * 3;
  const base = 36 + state.level * 3 + subscriptionQuality() + skillQuality + agents.quality + strategy.quality;
  const quality = clamp(Math.round(base - content.risk * 18), 5, 100);
  const risk = clamp(content.risk + strategy.risk - state.skills.prompting * 0.025 - state.skills.ops * 0.03 + agents.risk, 0.04, 0.55);
  const payout = Math.round(content.basePayout * strategy.payout * (1 + state.skills.marketing * 0.045 + agents.payout));
  const energyCost = Math.max(4, content.energy - strategy.energy - state.skills.ops * 2 - agents.energy);

  return { quality, risk, payout, energyCost };
}

function canCreate(content = selectedContent()) {
  if (!activeSubscription(content.requiredSub)) {
    return { ok: false, reason: `Потрібна підписка ${subscriptionById(content.requiredSub).name}.` };
  }
  if (state.level < content.minLevel) {
    return { ok: false, reason: `Потрібен рівень ${content.minLevel}.` };
  }
  if (state.credits < content.credits) {
    return { ok: false, reason: `Не вистачає AI-кредитів: потрібно ${content.credits}.` };
  }
  if (state.energy < forecast(content).energyCost) {
    return { ok: false, reason: "Енергії мало. Кава дешевша за вигорання." };
  }
  return { ok: true, reason: "" };
}

function pushEvent(title, text) {
  state.feed = [{ title, text }, ...state.feed].slice(0, 8);
}

function applyDelta(delta) {
  state.money = Math.max(0, Math.round(state.money + (delta.money || 0)));
  state.credits = Math.max(0, Math.round(state.credits + (delta.credits || 0)));
  state.hype = Math.max(0, Math.round(state.hype + (delta.hype || 0)));
  state.rep = Math.max(0, Math.round(state.rep + (delta.rep || 0)));
  state.energy = clamp(Math.round(state.energy + (delta.energy || 0)), 0, 100);
  state.portfolio = Math.max(0, Math.round(state.portfolio + (delta.portfolio || 0)));
  state.xp += delta.xp || 0;

  while (state.xp >= 100) {
    state.xp -= 100;
    state.level += 1;
    state.energy = 100;
    pushEvent("Новий рівень", `Рівень ${state.level}. Тепер можна впевненіше казати: "це не магія, це пайплайн".`);
  }
}

function advanceDay() {
  state.day += 1;
  const newWeek = Math.ceil(state.day / 7);

  if (newWeek > state.week) {
    state.week = newWeek;
    settleSubscriptions();
  }
}

function settleSubscriptions() {
  if (!state.activeSubs.length) {
    pushEvent("Новий тиждень", "Підписок немає, витрат теж немає. Генерувати, правда, майже нічим.");
    return;
  }

  const kept = [];
  const suspended = [];
  let paid = 0;
  let credits = 0;

  for (const id of state.activeSubs) {
    const sub = subscriptionById(id);
    if (!sub) continue;

    if (state.money >= sub.cost) {
      state.money -= sub.cost;
      paid += sub.cost;
      credits += sub.credits;
      kept.push(id);
    } else {
      suspended.push(id);
    }
  }

  state.activeSubs = kept;
  state.suspendedSubs = [...new Set([...state.suspendedSubs, ...suspended])];
  state.credits += credits;

  if (paid > 0) {
    pushEvent("Підписки списались", `Оплачено ${formatMoney(paid)}, нараховано ${credits} AI-кредитів. SaaS переміг, але ти ще тримаєшся.`);
  }

  if (suspended.length) {
    const names = suspended.map((id) => subscriptionById(id)?.name).filter(Boolean).join(", ");
    pushEvent("Підписку заморожено", `${names}. Немає грошей, немає генерацій. Сувора економіка, не баг.`);
  }
}

function shipProject() {
  const content = selectedContent();
  const check = canCreate(content);

  if (!check.ok) {
    pushEvent("Не можна здати задачу", check.reason);
    render();
    saveState();
    return;
  }

  const result = forecast(content);
  const strategy = strategies[selectedStrategy()];
  const failure = Math.random() < result.risk;
  const qualityBonus = Math.round(result.quality / 12);
  const event = events[Math.floor(Math.random() * events.length)];

  state.credits -= content.credits;
  state.energy = clamp(state.energy - result.energyCost, 0, 100);

  if (failure) {
    const loss = Math.round(result.payout * 0.28);
    applyDelta({
      money: Math.round(result.payout * 0.35) - loss,
      hype: Math.max(0, Math.round(content.hype * 0.35 + strategy.hype)),
      rep: -Math.max(2, Math.round(content.rep * 0.35)),
      xp: Math.round(content.xp * 0.55)
    });
    pushEvent("Генерація дала крен", `${content.name}: клієнт помітив дивну деталь. Ти отримав часткову оплату, але репутація скрипнула.`);
  } else {
    applyDelta({
      money: result.payout + event.money,
      hype: content.hype + strategy.hype + event.hype + state.skills.marketing * 2,
      rep: content.rep + strategy.rep + event.rep + qualityBonus,
      energy: event.energy || 0,
      portfolio: 1,
      xp: content.xp + qualityBonus
    });
    pushEvent("Проєкт здано", `${content.name}: ${formatMoney(result.payout)} доходу, якість ${result.quality}%. ${event.text}`);
  }

  advanceDay();
  saveState();
  render();
}

function toggleSubscription(id) {
  const sub = subscriptionById(id);
  if (!sub) return;

  if (activeSubscription(id)) {
    state.activeSubs = state.activeSubs.filter((subId) => subId !== id);
    pushEvent("Підписку вимкнено", `${sub.name} більше не списує гроші щотижня. Але й контент цього типу не згенеруєш.`);
  } else {
    if (state.money < sub.cost) {
      pushEvent("Не вистачає грошей", `${sub.name} коштує ${formatMoney(sub.cost)} за тиждень. Підписка любить гроші більше за творчість.`);
      render();
      return;
    }
    state.money -= sub.cost;
    state.credits += sub.credits;
    state.activeSubs.push(id);
    state.suspendedSubs = state.suspendedSubs.filter((subId) => subId !== id);
    pushEvent("Підписку активовано", `${sub.name}: -${formatMoney(sub.cost)}, +${sub.credits} AI-кредитів. Тепер можна генерувати без молитви.`);
  }

  saveState();
  render();
}

function buyUpgrade(id) {
  const upgrade = upgrades.find((item) => item.id === id);
  if (!upgrade) return;

  const current = state.skills[id] || 1;
  if (current >= upgrade.max) return;

  const cost = upgradeCost(upgrade, current);
  if (state.money < cost) {
    pushEvent("Прокачка зачекає", `${upgrade.name} коштує ${formatMoney(cost)}. Поки що бюджет сказав "може наступного спринту".`);
    render();
    return;
  }

  state.money -= cost;
  state.skills[id] = current + 1;
  pushEvent("Навичку прокачано", `${upgrade.name} рівень ${state.skills[id]}. Тепер генерації трохи менше схожі на лотерею.`);
  saveState();
  render();
}

function upgradeCost(upgrade, current) {
  return Math.round(upgrade.baseCost * (1 + current * 0.72));
}

function buyAgent(agentId) {
  const agent = agents.find((item) => item.id === agentId);
  if (!agent || state.ownedAgents.includes(agent.id)) return;

  if (!rankUnlocked(agent.minRank)) {
    pushEvent("Агент ще недоступний", `${agent.name} працює з креаторами рівня ${ranks.find((rank) => rank.id === agent.minRank)?.title}.`);
    render();
    return;
  }

  if (state.money < agent.cost) {
    pushEvent("Бюджет не зійшовся", `${agent.name} коштує ${formatMoney(agent.cost)}. Агент сказав, що exposure не приймає.`);
    render();
    return;
  }

  state.money -= agent.cost;
  state.ownedAgents.push(agent.id);
  pushEvent("Новий агент", `${agent.name} у команді. Частину хаосу тепер можна делегувати.`);
  saveState();
  render();
}

function rest() {
  state.energy = clamp(state.energy + 28, 0, 100);
  state.hype = Math.max(0, state.hype - 2);
  advanceDay();
  pushEvent("Кава-брейк", "Енергія повернулась. Hype трохи впав, бо інтернет не чекає нікого.");
  saveState();
  render();
}

function resetGame() {
  state = normalizeState({ ...defaultState, feed: [...defaultState.feed], character: { ...defaultCharacter } });
  localStorage.removeItem(legacyStoreKey);
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

async function requestJson(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (api.playerId) headers["X-Player-Id"] = api.playerId;

  const response = await fetch(path, { ...options, headers });
  return response.json();
}

async function authTelegramPlayer() {
  if (!tg?.initData) return;

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
    state = normalizeState({ ...state, ...data.player });
    saveState({ remote: false });
    render();
    await loadServerLeaderboard();
  } catch {
    pushEvent("Backend дрімає", "Гра працює локально. Коли сервер прокинеться, прогрес піде в хмару.");
    render();
  }
}

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
  }, 300);
}

async function loadServerLeaderboard() {
  try {
    const data = await requestJson("/api/leaderboard");
    if (data.ok && Array.isArray(data.leaderboard) && data.leaderboard.length) {
      state.serverLeaderboard = data.leaderboard;
      saveState({ remote: false });
      renderLeaderboard();
    }
  } catch {
    // Local leaderboard remains available when the backend is offline.
  }
}

function renderProgression() {
  const rank = currentRank();
  const next = nextRank();
  const score = rankScore();
  const previousMin = rank.min;
  const nextMin = next?.min || rank.min + 1;
  const progress = next ? clamp(((score - previousMin) / (nextMin - previousMin)) * 100, 0, 100) : 100;

  els.rankTitle.textContent = rank.title;
  els.rankCopy.textContent = rank.copy;
  els.rankScoreValue.textContent = score;
  els.rankBar.style.width = `${progress}%`;
  els.nextRankLabel.textContent = next ? `До "${next.title}"` : "Максимальний ранг";
}

function renderContentOptions() {
  els.contentList.innerHTML = "<legend>Що створюємо</legend>";

  contentTypes.forEach((content) => {
    const check = canCreate(content);
    const sub = subscriptionById(content.requiredSub);
    const label = document.createElement("label");
    label.className = "content-option";
    label.dataset.locked = String(!check.ok && state.selectedContent !== content.id);
    label.innerHTML = `
      <input type="radio" name="content" value="${content.id}" ${state.selectedContent === content.id ? "checked" : ""} />
      <span>
        <strong>${content.name}</strong>
        <small>${content.desc}</small>
        <em>${content.credits} кредитів · ${content.energy} енергії · ${formatMoney(content.basePayout)} база · ${sub.name}</em>
      </span>
    `;

    label.querySelector("input").addEventListener("change", () => {
      state.selectedContent = content.id;
      saveState();
      render();
    });

    els.contentList.append(label);
  });
}

function renderSubscriptions() {
  els.weeklyCostValue.textContent = `${formatMoney(weeklyCost())}/тиждень`;
  els.subscriptionList.innerHTML = "";

  subscriptions.forEach((sub) => {
    const active = activeSubscription(sub.id);
    const card = document.createElement("section");
    card.className = "subscription-card";
    card.dataset.active = String(active);
    card.innerHTML = `
      <div>
        <h3>${sub.name}</h3>
        <p>${sub.desc}</p>
        <span>${formatMoney(sub.cost)}/тиждень · +${sub.credits} кредитів · якість +${sub.quality}</span>
      </div>
      <button type="button">${active ? "Вимкнути" : "Підключити"}</button>
    `;
    card.querySelector("button").addEventListener("click", () => toggleSubscription(sub.id));
    els.subscriptionList.append(card);
  });
}

function renderUpgrades() {
  const values = Object.values(state.skills);
  els.skillSummary.textContent = `середній рівень ${(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}`;
  els.upgradeList.innerHTML = "";

  upgrades.forEach((upgrade) => {
    const current = state.skills[upgrade.id] || 1;
    const done = current >= upgrade.max;
    const cost = upgradeCost(upgrade, current);
    const row = document.createElement("section");
    row.className = "upgrade-card";
    row.innerHTML = `
      <div>
        <h3>${upgrade.name} <span>${current}/${upgrade.max}</span></h3>
        <p>${upgrade.desc}</p>
      </div>
      <button type="button" ${done ? "disabled" : ""}>${done ? "Макс" : formatMoney(cost)}</button>
    `;
    row.querySelector("button").addEventListener("click", () => buyUpgrade(upgrade.id));
    els.upgradeList.append(row);
  });
}

function renderAgents() {
  els.agentCount.textContent = `${state.ownedAgents.length}/${agents.length}`;
  els.agentList.innerHTML = "";

  agents.forEach((agent) => {
    const owned = state.ownedAgents.includes(agent.id);
    const unlocked = rankUnlocked(agent.minRank);
    const card = document.createElement("section");
    card.className = "agent-card";
    card.innerHTML = `
      <div>
        <h3>${agent.name}</h3>
        <p>${agent.desc}</p>
      </div>
      <button type="button" ${owned || !unlocked || state.money < agent.cost ? "disabled" : ""}>
        ${owned ? "У команді" : unlocked ? formatMoney(agent.cost) : "Згодом"}
      </button>
    `;
    card.querySelector("button").addEventListener("click", () => buyAgent(agent.id));
    els.agentList.append(card);
  });
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

function renderLeaderboard() {
  const playerName = tg?.initDataUnsafe?.user?.first_name || "Ти";
  const score = Math.round(state.money + state.hype * 12 + state.rep * 10 + state.level * 80 + state.portfolio * 40);
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
      front: "M69 106c0-35 18-59 45-59 22 0 38 17 43 48-18-5-34-8-48-7-17 1-30-7-40 18Z"
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

function render() {
  const content = selectedContent();
  const result = forecast(content);
  const check = canCreate(content);

  els.trendText.textContent = trends[(state.day - 1) % trends.length];
  els.missionTitle.textContent = content.name;
  els.missionCopy.textContent = content.desc;
  els.dayLabel.textContent = `День ${state.day} · Тиждень ${state.week}`;
  els.forecastValue.textContent = `${result.quality}% · ${formatMoney(result.payout)}`;
  els.forecastBar.style.width = `${result.quality}%`;
  els.moneyValue.textContent = formatMoney(state.money);
  els.creditsValue.textContent = state.credits;
  els.hypeValue.textContent = state.hype;
  els.repValue.textContent = state.rep;
  els.portfolioValue.textContent = state.portfolio;
  els.energyValue.textContent = `${state.energy}%`;
  els.levelValue.textContent = state.level;
  els.xpBar.style.width = `${state.xp}%`;
  els.shipButton.disabled = !check.ok;
  els.shipButton.textContent = check.ok ? "Згенерувати і здати" : check.reason;

  renderProgression();
  renderCharacter();
  renderContentOptions();
  renderSubscriptions();
  renderUpgrades();
  renderFeed();
  renderAgents();
  renderLeaderboard();
}

els.shipButton.addEventListener("click", shipProject);
els.restButton.addEventListener("click", rest);
els.resetButton.addEventListener("click", resetGame);
els.randomAvatarButton.addEventListener("click", randomizeCharacter);
document.querySelectorAll("input[name='strategy']").forEach((input) => {
  input.addEventListener("change", render);
});

render();
authTelegramPlayer();
loadServerLeaderboard();
