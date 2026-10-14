const canvas = document.querySelector("#arena");
const context = canvas.getContext("2d");
const $ = selector => document.querySelector(selector);
const ui = {
  home: $("#home-button"),
  round: $("#round-number"),
  playerName: $("#player-name"),
  botName: $("#bot-name"),
  playerHealth: $("#player-health"),
  playerLag: $("#player-lag"),
  playerHealthText: $("#player-hp-text"),
  botHealth: $("#bot-health"),
  botLag: $("#bot-lag"),
  botHealthText: $("#bot-hp-text"),
  playerMeter: $(".player-status .health-track"),
  botMeter: $(".bot-status .health-track"),
  playerTags: $("#player-tags"),
  botTags: $("#bot-tags"),
  actionRow: $("#action-row"),
  tooltip: $("#move-tooltip"),
  tooltipName: $("#tooltip-name"),
  tooltipDetail: $("#tooltip-detail"),
  tooltipInfo: $("#tooltip-info"),
  announcement: $("#screen-announcement"),
  announcementText: $("#announcement-text"),
  result: $("#result-panel"),
  resultKicker: $("#result-kicker"),
  resultTitle: $("#result-title"),
  resultDetail: $("#result-detail"),
  resultActions: $("#result-actions"),
  dialogue: $("#dialogue"),
  dialogueLeft: $("#dialogue-left"),
  dialogueRight: $("#dialogue-right"),
  dialogueSpeaker: $("#dialogue-speaker"),
  dialogueText: $("#dialogue-text"),
  dialogueNext: $("#dialogue-next"),
  dialogueSkip: $("#dialogue-skip"),
  title: $("#title-screen"),
  endlessBest: $("#endless-best"),
  codeForm: $("#code-form"),
  codeInput: $("#code-input"),
  codeMessage: $("#code-message"),
  select: $("#character-select"),
  selectMode: $("#select-mode"),
  selectGrid: $("#select-grid"),
  selectBack: $("#select-back"),
  detail: $("#fighter-detail"),
  detailPortrait: $("#detail-portrait"),
  detailTitle: $("#detail-title"),
  detailName: $("#detail-name"),
  detailHp: $("#detail-hp"),
  detailStory: $("#detail-story"),
  detailMoves: $("#detail-moves"),
  detailProgress: $("#detail-progress"),
  detailBack: $("#detail-back"),
  detailFight: $("#detail-fight"),
  sound: $("#sound-toggle"),
  fullscreen: $("#fullscreen-toggle"),
  pause: $("#pause-menu"),
  pauseResume: $("#pause-resume"),
  pauseTitle: $("#pause-title-button"),
  installHint: $("#install-hint")
};

const STATUS_LABELS = {
  boost: "POWER UP +50%",
  exposed: "EXPOSED",
  staggered: "STAGGERED",
  blinded: "BLINDED",
  fortified: "FORTIFIED",
  tracking: "TRACKING"
};
const MODE_NAMES = { campaign: "CAMPAIGN", endless: "ENDLESS", quick: "QUICK FIGHT" };
const CAMPAIGN_KEY = "tactic-fight-campaign";
const ENDLESS_KEY = "tactic-fight-endless-best";
const UNLOCK_KEY = "tactic-fight-unlocked";
const SECRET_ID = "prophet";

let screenName = "title";
let mode = "quick";
let run = null;
let state = newMatch("rook", "byte");
let animation = null;
let busyUntil = 0;
let moveButtons = [];
let selectedId = null;
let timers = [];
let dialogueState = null;
let lastPortraitDraw = 0;
let pendingFinish = null;
let paused = false;

// ---------------------------------------------------------------------------
// Helpers.
function load(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked; progress then lasts for this visit only.
  }
}

function later(ms, callback) {
  timers.push(setTimeout(callback, ms));
}

function clearTimers() {
  timers.forEach(clearTimeout);
  timers = [];
}

function music(track) {
  if (typeof Music !== "undefined") Music.play(track);
}

function fighterInfo(id) {
  return Rules.character(id);
}

function opponentOf(side) {
  return side === "player" ? "bot" : "player";
}

function shuffled(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function newMatch(playerId, botId) {
  const player = Rules.newFighter(playerId);
  const bot = Rules.newFighter(botId);
  return {
    player,
    bot,
    shown: { player: player.hp, bot: bot.hp },
    completedRounds: 0,
    history: [],
    revealed: null,
    finished: false,
    stage: botId,
    // Fighters stay off screen during dialogue and walk on in `startFight`.
    hideFighters: true,
    entrance: null
  };
}

// ---------------------------------------------------------------------------
// Screens.
function showScreen(name) {
  screenName = name;
  setPaused(false);
  ui.title.hidden = name !== "title";
  ui.select.hidden = name !== "select" && name !== "detail";
  ui.detail.hidden = name !== "detail";
  ui.dialogue.hidden = name !== "dialogue";
  ui.result.hidden = name !== "result";
  document.body.dataset.screen = name;
  hideTooltip();
}

function goToTitle() {
  clearTimers();
  clearAnnouncement();
  animation = null;
  pendingFinish = null;
  run = null;
  // A clean scene behind the title, so nothing from the last fight lingers.
  state = newMatch("rook", "byte");
  updateUI();
  ui.codeMessage.textContent = "";
  const best = load(ENDLESS_KEY, 0);
  ui.endlessBest.textContent = best ? `BEST STREAK: ${best}` : "";
  showScreen("title");
  music("title");
  const first = ui.title.querySelector("button");
  if (first) first.focus();
}

function chooseMode(next) {
  mode = next;
  ui.selectMode.textContent = MODE_NAMES[mode];
  buildSelectScreen();
  showScreen("select");
  music("select");
  const first = ui.selectGrid.querySelector("button");
  if (first) first.focus();
}

function campaignProgress() {
  return load(CAMPAIGN_KEY, {});
}

function campaignFor(id) {
  return typeof STORY !== "undefined" && STORY.campaign ? STORY.campaign[id] : null;
}

function campaignOrder(id) {
  const campaign = campaignFor(id);
  return campaign ? campaign.order : ROSTER.filter(fighter => fighter.id !== id).map(fighter => fighter.id);
}

// PROPHET unlocks when every other fighter's campaign is cleared, or with the code.
function storyFighters() {
  return ROSTER.filter(fighter => !fighter.secret);
}

function allCampaignsCleared() {
  const progress = campaignProgress();
  return storyFighters().every(fighter => progress[fighter.id] && progress[fighter.id].cleared);
}

function isUnlocked(id) {
  const fighter = fighterInfo(id);
  if (!fighter || !fighter.secret) return true;
  return Boolean(load(UNLOCK_KEY, {})[id]) || allCampaignsCleared();
}

function unlockFighter(id) {
  const unlocked = load(UNLOCK_KEY, {});
  unlocked[id] = true;
  save(UNLOCK_KEY, unlocked);
}

// Quick Fight and Endless only send PROPHET at you once he is unlocked.
function opponentPool(id) {
  return ROSTER.filter(fighter => fighter.id !== id && isUnlocked(fighter.id));
}

function buildSelectScreen() {
  const progress = campaignProgress();
  ui.selectGrid.replaceChildren(...ROSTER.map((fighter, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "fighter-card";
    card.innerHTML = '<span class="card-number"></span><span class="card-name"></span><span class="card-role"></span><span class="card-progress"></span>';
    card.querySelector(".card-number").textContent = index + 1;
    if (!isUnlocked(fighter.id)) {
      card.classList.add("locked");
      card.disabled = true;
      card.setAttribute("aria-label", "Locked fighter");
      card.querySelector(".card-name").textContent = "???";
      card.querySelector(".card-role").textContent = "LOCKED";
      return card;
    }
    card.style.setProperty("--fighter", fighter.color);
    card.querySelector(".card-name").textContent = fighter.name;
    card.querySelector(".card-role").textContent = fighter.role;
    if (mode === "campaign") {
      const entry = progress[fighter.id] || {};
      card.querySelector(".card-progress").textContent = entry.cleared ? "CLEARED" : entry.index ? `${entry.index}/${campaignOrder(fighter.id).length}` : "";
    }
    card.addEventListener("click", () => openDetail(fighter.id));
    card.addEventListener("mouseenter", () => Sound.playIfUnlocked("hover"));
    return card;
  }));
}

function openDetail(id) {
  selectedId = id;
  const fighter = fighterInfo(id);
  ui.detail.style.setProperty("--fighter", fighter.color);
  ui.detailTitle.textContent = `${fighter.title} / ${fighter.role}`;
  ui.detailName.textContent = fighter.name;
  ui.detailHp.textContent = `${fighter.hp} HP`;
  ui.detailStory.textContent = typeof STORY !== "undefined" && STORY.backstories ? STORY.backstories[id] || "" : "";
  ui.detailMoves.replaceChildren(...fighter.moves.map(move => {
    const row = document.createElement("div");
    row.className = "detail-move";
    const icon = document.createElement("canvas");
    icon.className = "move-icon";
    MoveIcons.draw(icon, move.anim);
    const copy = document.createElement("div");
    copy.innerHTML = "<strong></strong><small></small><p></p>";
    copy.querySelector("strong").textContent = move.ultimate ? `${move.name} (ULTIMATE)` : move.name;
    copy.querySelector("small").textContent = move.detail;
    copy.querySelector("p").textContent = move.info;
    row.append(icon, copy);
    return row;
  }));

  ui.detailProgress.textContent = "";
  if (mode === "campaign") {
    const entry = campaignProgress()[id] || {};
    const campaign = campaignFor(id);
    const titleText = campaign ? `"${campaign.title}" ` : "";
    ui.detailProgress.textContent = entry.cleared ? `${titleText}CLEARED. Play it again from the start.` : `${titleText}PROGRESS: ${entry.index || 0}/${campaignOrder(id).length}`;
    ui.detailFight.textContent = entry.index && !entry.cleared ? "CONTINUE" : "START CAMPAIGN";
  } else {
    ui.detailFight.textContent = mode === "endless" ? "START ENDLESS" : "FIGHT!";
  }
  Arena.portrait(ui.detailPortrait, id, performance.now());
  showScreen("detail");
  ui.detailFight.focus();
}

function startWithSelected() {
  const id = selectedId;
  if (mode === "quick") {
    const opponents = opponentPool(id);
    run = { fighter: id };
    beginMatch(id, opponents[Math.floor(Math.random() * opponents.length)].id);
  } else if (mode === "endless") {
    run = { fighter: id, streak: 0, queue: [] };
    nextEndlessFight();
  } else {
    const progress = campaignProgress();
    const entry = progress[id] || {};
    const index = entry.cleared ? 0 : entry.index || 0;
    run = { fighter: id, index };
    const campaign = campaignFor(id);
    if (index === 0 && campaign && campaign.intro) {
      state = newMatch(id, campaignOrder(id)[0]);
      animation = null;
      updateUI();
      playDialogue(campaign.intro, id, campaignOrder(id)[0], () => campaignFight());
    } else {
      campaignFight();
    }
  }
}

function nextEndlessFight() {
  if (!run.queue.length) run.queue = shuffled(opponentPool(run.fighter).map(fighter => fighter.id));
  beginMatch(run.fighter, run.queue.shift());
}

function campaignFight() {
  const opponent = campaignOrder(run.fighter)[run.index];
  const campaign = campaignFor(run.fighter);
  const before = campaign && campaign.fights[opponent] ? campaign.fights[opponent].before : null;
  beginMatch(run.fighter, opponent, before);
}

// Sets the stage, plays the pre-fight dialogue, then rings the bell.
function beginMatch(playerId, botId, lines) {
  clearTimers();
  pendingFinish = null;
  state = newMatch(playerId, botId);
  animation = null;
  buildMoveButtons();
  updateUI();
  const banter = lines || (typeof STORY !== "undefined" && STORY.banter ? STORY.banter[`${playerId}>${botId}`] : null);
  if (banter && banter.length) playDialogue(banter, playerId, botId, startFight);
  else startFight();
}

function startFight() {
  showScreen("fight");
  music(state.stage);
  // Both fighters make their entrance, then the bell rings.
  state.hideFighters = false;
  state.entrance = { start: performance.now() };
  busyUntil = performance.now() + Arena.ENTRANCE + 600;
  updateUI();
  later(Arena.ENTRANCE, () => {
    state.entrance = null;
    Sound.play("bell");
    announce("Start Fight!", "start", 3000);
  });
  later(Arena.ENTRANCE + 600, unlockInput);
}

// ---------------------------------------------------------------------------
// Dialogue, Mortal Kombat style: portraits either side and a typewriter box.
function playDialogue(lines, leftId, rightId, done) {
  clearTimers();
  // A post-fight talk must not keep the K.O. banner and "YOU WIN!" up behind it.
  clearAnnouncement();
  animation = null;
  state.hideFighters = true;
  dialogueState = { lines, index: -1, leftId, rightId, done, typed: 0, full: "" };
  showScreen("dialogue");
  music("story");
  advanceDialogue();
}

function advanceDialogue() {
  const d = dialogueState;
  if (!d) return;
  d.index += 1;
  if (d.index >= d.lines.length) {
    finishDialogue();
    return;
  }
  const [speaker, line] = d.lines[d.index];
  d.full = line;
  d.typed = 0;
  d.speaker = speaker;
  const info = speaker === "narrator" ? null : fighterInfo(speaker);
  ui.dialogueSpeaker.textContent = info ? info.name : "";
  ui.dialogue.dataset.speaker = speaker === d.leftId ? "left" : speaker === d.rightId ? "right" : "narrator";
  ui.dialogue.style.setProperty("--speaker", info ? info.color : "#c9c2ae");
  ui.dialogueText.textContent = "";
  Sound.playIfUnlocked("hover");
}

function finishDialogue() {
  const d = dialogueState;
  dialogueState = null;
  if (d) d.done();
}

function typeDialogue(now) {
  const d = dialogueState;
  if (!d || d.typed >= d.full.length) return;
  if (!d.lastType || now - d.lastType > 24) {
    d.lastType = now;
    d.typed += 1;
    ui.dialogueText.textContent = d.full.slice(0, d.typed);
  }
}

// ---------------------------------------------------------------------------
// Fight UI.
function announce(text, type, duration = 0) {
  ui.announcement.dataset.state = type;
  ui.announcementText.textContent = text;
  ui.announcement.classList.remove("leaving");
  ui.announcement.hidden = false;
  void ui.announcement.offsetWidth;
  if (duration) {
    later(duration - 450, () => ui.announcement.classList.add("leaving"));
    later(duration, clearAnnouncement);
  }
}

function clearAnnouncement() {
  ui.announcement.hidden = true;
  ui.announcement.classList.remove("leaving");
}

function playerMoves() {
  return fighterInfo(state.player.id).moves;
}

function playerUltimateReady() {
  const ultimate = playerMoves().find(move => move.ultimate);
  return Rules.available(state.player, ultimate.id);
}

function busy() {
  return performance.now() < busyUntil;
}

// Timers can fire a hair before performance.now() reaches busyUntil, which
// would leave the move buttons disabled for good, so end the lock explicitly.
function unlockInput() {
  busyUntil = 0;
  updateUI();
}

function updateUI() {
  ui.round.textContent = String(state.completedRounds + 1).padStart(2, "0");
  [["player", ui.playerName, ui.playerHealth, ui.playerLag, ui.playerHealthText, ui.playerMeter, ui.playerTags], ["bot", ui.botName, ui.botHealth, ui.botLag, ui.botHealthText, ui.botMeter, ui.botTags]].forEach(([side, name, bar, lag, text, meter, tags]) => {
    const fighter = state[side];
    const shown = state.shown[side];
    const info = fighterInfo(fighter.id);
    name.textContent = info.name;
    meter.parentElement.style.setProperty("--fighter", info.color);
    bar.style.width = `${(shown / fighter.maxHp) * 100}%`;
    lag.style.width = bar.style.width;
    meter.classList.toggle("danger", shown > 0 && shown / fighter.maxHp <= 0.25);
    text.textContent = shown;
    meter.setAttribute("aria-valuenow", shown);
    meter.setAttribute("aria-valuemax", fighter.maxHp);
    const labels = busy() ? [] : Object.keys(STATUS_LABELS).filter(key => fighter[key]).map(key => STATUS_LABELS[key]);
    tags.textContent = labels.join(" / ");
    tags.parentElement.hidden = labels.length === 0;
  });

  const locked = state.finished || busy() || paused || screenName !== "fight";
  playerMoves().forEach((move, index) => {
    const button = moveButtons[index];
    if (!button) return;
    const cooldown = state.player.cooldowns[move.id];
    button.disabled = locked || cooldown > 0;
    button.querySelector(".move-cooldown").textContent = cooldown > 0 ? (move.ultimate ? `CHARGES IN ${cooldown}` : `READY IN ${cooldown}`) : move.ultimate ? "ULTIMATE" : "";
  });
  canvas.setAttribute("aria-label", `${fighterInfo(state.player.id).name} and ${fighterInfo(state.bot.id).name} face off in a pixel art arena`);
}

function buildMoveButtons() {
  const fighter = fighterInfo(state.player.id);
  ui.actionRow.style.setProperty("--fighter", fighter.color);
  moveButtons = fighter.moves.map((move, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `move-button${move.ultimate ? " ultimate" : ""}`;
    button.setAttribute("aria-label", `${move.name}: ${move.info}`);
    button.innerHTML = '<span class="move-key"></span><canvas class="move-icon" aria-hidden="true"></canvas><span class="move-name"></span><span class="move-cooldown"></span>';
    button.querySelector(".move-key").textContent = index + 1;
    button.querySelector(".move-name").textContent = move.name;
    MoveIcons.draw(button.querySelector(".move-icon"), move.anim);
    button.addEventListener("click", () => resolveRound(move.id));
    button.addEventListener("mouseenter", () => {
      showTooltip(button, move);
      if (!button.disabled) Sound.playIfUnlocked("hover");
    });
    button.addEventListener("focus", () => showTooltip(button, move));
    button.addEventListener("mouseleave", hideTooltip);
    button.addEventListener("blur", hideTooltip);
    return button;
  });
  ui.actionRow.replaceChildren(...moveButtons);
  ui.actionRow.style.setProperty("--moves", moveButtons.length);
}

function showTooltip(button, move) {
  ui.tooltipName.textContent = move.ultimate ? `${move.name} (ULTIMATE)` : move.name;
  ui.tooltipDetail.textContent = move.detail;
  ui.tooltipInfo.textContent = move.info;
  ui.tooltip.style.setProperty("--fighter", fighterInfo(state.player.id).color);
  ui.tooltip.hidden = false;
  const box = button.getBoundingClientRect();
  const tip = ui.tooltip.getBoundingClientRect();
  const left = Math.min(window.innerWidth - tip.width - 8, Math.max(8, box.left + box.width / 2 - tip.width / 2));
  ui.tooltip.style.left = `${left}px`;
  ui.tooltip.style.top = `${Math.max(8, box.top - tip.height - 10)}px`;
}

function hideTooltip() {
  ui.tooltip.hidden = true;
}

function updateSoundToggle() {
  const muted = Sound.isMuted();
  ui.sound.setAttribute("aria-pressed", String(!muted));
  const label = muted ? "Turn sound on" : "Mute sound";
  ui.sound.setAttribute("aria-label", label);
  ui.sound.title = `${label} (M)`;
  if (typeof Music !== "undefined") Music.setMuted(muted);
}

// ---------------------------------------------------------------------------
// Sound cues, timed to each fighter's turn.
function playMoveCue(outcome, start, hit, lead) {
  switch (outcome.move.anim) {
    case "punch":
    case "shuffle":
    case "citrusKick":
      Sound.play("swing", hit - 0.14);
      break;
    case "combo":
      [0, 0.1, 0.2].forEach(offset => Sound.play("swing", hit - 0.14 + offset * Arena.SLOW));
      break;
    case "swing":
      Sound.play("swing", hit - 0.3);
      Sound.play("swing", hit - 0.16);
      break;
    case "uppercut":
      Sound.play("uppercut", hit - 0.32);
      break;
    case "rush":
      Sound.play("rush", hit - 0.32);
      break;
    case "overdrive":
      Sound.play("overdrive", start);
      Sound.play("rush", hit - 0.32);
      break;
    case "fireball":
      Sound.play("ultimate", hit - 0.39, "player");
      break;
    case "plasma":
      Sound.play("ultimate", hit - 0.39, "bot");
      break;
    case "shuriken":
      Sound.play("shuriken", start + lead * 0.55);
      break;
    case "stampede":
      Sound.play("roar", start);
      Sound.play("stampede", hit - 0.5);
      break;
    case "vanish":
      Sound.play("vanish", start);
      if (outcome.spotted) Sound.play("boing", start + 0.5);
      break;
    case "dash":
      Sound.play("dodge", hit - 0.13);
      break;
    case "orangeBounce":
      Sound.play("boing", hit - 0.2);
      break;
    case "peelOut":
      Sound.play("rush", start);
      Sound.play("boing", hit - 0.12);
      break;
    case "fruitNuclear":
      Sound.play("fruitNuclear", start);
      break;
    case "novaPalm":
      Sound.play("nova", hit - 0.3);
      Sound.play("swing", hit - 0.14);
      break;
    case "wormhole":
      Sound.play("warp", hit - 0.3);
      break;
    case "prophecy":
      Sound.play("prophecy", start);
      break;
    case "bigBang":
      Sound.play("bigBang", hit - 1.1);
      break;
    case "fortress":
      Sound.play("armor", hit - 0.2);
      break;
    case "smoke":
      Sound.play("smoke", hit - 0.25);
      break;
    case "senses":
      Sound.play("senses", hit - 0.25);
      break;
    case "block":
      Sound.play("clang", hit - 0.1, 1.3);
      break;
    default:
      break;
  }
}

// What happened to `side`'s strike: impacts, clangs, whooshes and the target's voice.
function playOutcome(report, side, hit) {
  const other = opponentOf(side);
  const mine = report[side];
  const defense = report[other].move;
  const voice = fighterInfo(state[other].id).voice;
  const multi = ["combo", "stampede", "shuriken", "fruitNuclear"].includes(mine.move.anim);
  const spacing = (mine.move.anim === "stampede" ? 0.07 : 0.1) * Arena.SLOW;

  if (["hit", "broke", "chipped", "armored"].includes(mine.result)) {
    const heavy = mine.move.ultimate || mine.damage >= 20;
    for (let k = 0; k < (multi ? mine.landed : 1); k += 1) Sound.play("impact", hit + k * spacing, heavy);
    if (mine.result === "broke") {
      Sound.play("clang", hit, 0.7);
      Sound.play("crackle", hit);
    }
    if (mine.result === "chipped") {
      Sound.play("clang", hit, 0.9);
      Sound.play("powerUp", hit + 0.4, other);
    }
    if (mine.result === "armored") Sound.play("clang", hit, 0.45);
    if (mine.damage > 0) Sound.play(voice, hit + 0.05);
  } else if (mine.result === "blocked") {
    Sound.play("clang", hit, other === "player" ? 1 : 0.8);
    Sound.play("powerUp", hit + 0.4, other);
  } else if (mine.result === "evaded") {
    Sound.play("dodge", hit - 0.12);
    if (defense.momentum) Sound.play("powerUp", hit + 0.4, other);
  }
  if (mine.counter > 0) {
    const at = hit + 0.15 * Arena.SLOW;
    Sound.play("swing", at - 0.14);
    Sound.play("impact", at);
    Sound.play(fighterInfo(state[side].id).voice, at + 0.05);
  }
}

function playRoundSounds(report, plan, ultimateWasReady) {
  plan.phases.forEach(p => {
    const hit = p.hit / 1000;
    const lead = ((Arena.SLOW * p.lead) / 1000);
    playMoveCue(report[p.actor], hit - lead, hit, lead);
    if (p.strike) playOutcome(report, p.actor, hit);
  });
  if (state.finished) {
    Sound.play("ko", plan.koAt / 1000);
    Sound.play(state.player.hp <= 0 ? "lose" : "win", plan.koAt / 1000 + 0.9);
  } else if (!ultimateWasReady && playerUltimateReady()) {
    Sound.play("ultimateReady", plan.end / 1000);
  }
}

// ---------------------------------------------------------------------------
// A round: both fighters commit, then the turns play out one at a time.
function resolveRound(moveId) {
  if (screenName !== "fight" || state.finished || busy() || paused) return;
  if (!Rules.available(state.player, moveId)) return;
  clearAnnouncement();
  hideTooltip();

  const botMoveId = state.revealed || Rules.chooseMove(state.bot, state.history);
  state.revealed = null;
  const ultimateWasReady = playerUltimateReady();
  state.shown = { player: state.player.hp, bot: state.bot.hp };
  const report = Rules.resolve(state.player, moveId, state.bot, botMoveId);

  state.history.push(Rules.isStrike(report.player.move) ? "offense" : "defense");
  state.history = state.history.slice(-5);
  state.completedRounds += 1;
  animation = { report, start: performance.now() };
  const plan = Arena.timing(report, { player: state.player.id, bot: state.bot.id });
  busyUntil = animation.start + plan.end;

  if (state.player.hp <= 0 || state.bot.hp <= 0) state.finished = true;
  else if (state.player.tracking) state.revealed = Rules.chooseMove(state.bot, state.history);

  // Health bars drop when each blow lands, not all at once.
  plan.phases.forEach(p => {
    later(p.hit, () => {
      const other = opponentOf(p.actor);
      state.shown[other] = Math.max(0, state.shown[other] - report[p.actor].damage);
      state.shown[p.actor] = Math.max(0, state.shown[p.actor] - report[p.actor].counter);
      updateUI();
    });
  });
  later(plan.end, () => {
    state.shown = { player: state.player.hp, bot: state.bot.hp };
    unlockInput();
  });
  if (state.finished) {
    const won = state.bot.hp <= 0 && state.player.hp > 0;
    pendingFinish = { won, at: animation.start + plan.koAt + 2600 };
    later(plan.koAt + 500, () => announce(won ? "YOU WIN!" : "YOU LOSE!", won ? "win" : "lose"));
    later(plan.koAt + 2600, finishPending);
  }
  playRoundSounds(report, plan, ultimateWasReady);
  updateUI();
}

// Runs the K.O. follow-up exactly once, whether the timer or the watchdog gets there first.
function finishPending() {
  if (!pendingFinish) return;
  const { won } = pendingFinish;
  pendingFinish = null;
  finishMatch(won);
}

// ---------------------------------------------------------------------------
// After the K.O.: what happens next depends on the mode.
function resultButton(label, action, primary = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = primary ? "big-button" : "big-button secondary";
  button.textContent = label;
  button.addEventListener("click", action);
  return button;
}

function showResult(kicker, title, detail, actions, track) {
  clearTimers();
  clearAnnouncement();
  dialogueState = null;
  animation = null;
  busyUntil = 0;
  ui.resultKicker.textContent = kicker;
  ui.resultTitle.textContent = title;
  ui.resultDetail.textContent = detail;
  ui.resultActions.replaceChildren(...actions);
  ui.result.style.setProperty("--fighter", fighterInfo(state.player.id).color);
  showScreen("result");
  music(track);
  actions[0].focus();
}

function finishMatch(won) {
  const playerId = state.player.id;
  const botId = state.bot.id;
  const botName = fighterInfo(botId).name;
  const menu = resultButton("MAIN MENU", goToTitle);

  if (mode === "quick") {
    showResult(MODE_NAMES.quick, won ? "YOU WIN!" : "YOU LOSE!", won ? `${botName} is down.` : `${botName} takes the match.`, [
      resultButton("PLAY AGAIN", () => beginMatch(playerId, botId), true),
      resultButton("NEW FIGHTER", () => chooseMode("quick")),
      menu
    ], won ? "victory" : "defeat");
    return;
  }

  if (mode === "endless") {
    if (won) {
      run.streak += 1;
      showResult(MODE_NAMES.endless, `${run.streak} DOWN!`, `Health restored. Next challenger incoming.`, [
        resultButton("NEXT FIGHT", nextEndlessFight, true),
        resultButton("QUIT RUN", () => endEndless())
      ], "victory");
    } else {
      endEndless();
    }
    return;
  }

  // Campaign.
  const total = campaignOrder(playerId).length;
  if (!won) {
    showResult(`${MODE_NAMES.campaign} ${run.index + 1}/${total}`, "YOU LOSE!", `${botName} wins this one. Shake it off and try again.`, [
      resultButton("TRY AGAIN", () => campaignFight(), true),
      menu
    ], "defeat");
    return;
  }
  const campaign = campaignFor(playerId);
  const after = campaign && campaign.fights[botId] ? campaign.fights[botId].after : null;
  run.index += 1;
  const wasUnlocked = isUnlocked(SECRET_ID);
  const progress = campaignProgress();
  const cleared = run.index >= total;
  progress[playerId] = { index: cleared ? 0 : run.index, cleared: cleared || Boolean(progress[playerId] && progress[playerId].cleared) };
  save(CAMPAIGN_KEY, progress);

  const next = () => {
    if (cleared) {
      const ending = campaign && campaign.ending;
      const unlockedNow = !wasUnlocked && isUnlocked(SECRET_ID);
      if (unlockedNow) unlockFighter(SECRET_ID);
      const detail = `${fighterInfo(playerId).name} beat all ${total} rivals.${unlockedNow ? ` Every campaign cleared: ${fighterInfo(SECRET_ID).name} is now playable!` : ""}`;
      const done = () => showResult(MODE_NAMES.campaign, unlockedNow ? "PROPHET UNLOCKED!" : "CAMPAIGN CLEAR!", detail, [
        resultButton("PLAY ANOTHER", () => chooseMode("campaign"), true),
        menu
      ], "victory");
      if (ending && ending.length) playDialogue(ending, playerId, botId, done);
      else done();
      return;
    }
    const upcoming = fighterInfo(campaignOrder(playerId)[run.index]).name;
    showResult(`${MODE_NAMES.campaign} ${run.index}/${total}`, "YOU WIN!", `Next up: ${upcoming}.`, [
      resultButton("NEXT FIGHT", () => campaignFight(), true),
      menu
    ], "victory");
  };
  if (after && after.length) playDialogue(after, playerId, botId, next);
  else next();
}

function endEndless() {
  const best = Math.max(load(ENDLESS_KEY, 0), run.streak);
  save(ENDLESS_KEY, best);
  const fighter = run.fighter;
  showResult(MODE_NAMES.endless, "GAME OVER", `Streak: ${run.streak}. Best: ${best}.`, [
    resultButton("TRY AGAIN", () => {
      run = { fighter, streak: 0, queue: [] };
      nextEndlessFight();
    }, true),
    resultButton("NEW FIGHTER", () => chooseMode("endless")),
    resultButton("MAIN MENU", goToTitle)
  ], "defeat");
}

// ---------------------------------------------------------------------------
function drawArena(now) {
  // Watchdog: if the K.O. timer was ever lost, still move on from the K.O. screen.
  if (pendingFinish && screenName === "fight" && performance.now() > pendingFinish.at + 1500) finishPending();
  Arena.draw(context, state, animation, now);
  typeDialogue(now);
  if (now - lastPortraitDraw > 90) {
    lastPortraitDraw = now;
    if (screenName === "detail") Arena.portrait(ui.detailPortrait, selectedId, now);
    if (screenName === "dialogue" && dialogueState) {
      Arena.portrait(ui.dialogueLeft, dialogueState.leftId, now);
      Arena.portrait(ui.dialogueRight, dialogueState.rightId, now, true);
    }
  }
  requestAnimationFrame(drawArena);
}

// Pause menu. Timers keep running underneath, so a K.O. still moves on to the
// result screen (which closes the menu) instead of getting stuck.
function setPaused(value) {
  paused = value;
  ui.pause.hidden = !value;
  document.body.classList.toggle("is-paused", value);
}

function openPause() {
  if (screenName !== "fight") return;
  hideTooltip();
  setPaused(true);
  ui.pauseResume.focus();
}

function closePause() {
  setPaused(false);
  updateUI();
}

ui.home.addEventListener("click", openPause);
ui.pauseResume.addEventListener("click", closePause);
ui.pauseTitle.addEventListener("click", goToTitle);
ui.pause.addEventListener("click", event => {
  if (event.target === ui.pause) closePause();
});
ui.title.querySelectorAll(".mode-button").forEach(button => {
  button.addEventListener("click", () => chooseMode(button.dataset.mode));
  button.addEventListener("mouseenter", () => Sound.playIfUnlocked("hover"));
});
ui.selectBack.addEventListener("click", goToTitle);

// Cheat codes typed on the title screen.
function enterCode(raw) {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  ui.codeMessage.dataset.state = "error";
  if (!code) {
    ui.codeMessage.textContent = "Type a code first.";
    Sound.play("denied");
  } else if (code === "PROPHET") {
    ui.codeMessage.dataset.state = "ok";
    if (isUnlocked(SECRET_ID)) {
      ui.codeMessage.textContent = "PROPHET is already unlocked. He knew you'd try that.";
    } else {
      unlockFighter(SECRET_ID);
      ui.codeMessage.textContent = "CODE ACCEPTED! PROPHET is now playable.";
      Sound.play("ultimateReady");
    }
  } else {
    ui.codeMessage.textContent = `"${code.slice(0, 16)}" is not a valid code. Try again!`;
    Sound.play("denied");
  }
  ui.codeInput.value = "";
}
ui.codeForm.addEventListener("submit", event => {
  event.preventDefault();
  enterCode(ui.codeInput.value);
});
ui.detailBack.addEventListener("click", () => {
  showScreen("select");
  const card = ui.selectGrid.querySelectorAll("button")[ROSTER.findIndex(fighter => fighter.id === selectedId)];
  if (card) card.focus();
});
ui.detailFight.addEventListener("click", startWithSelected);
ui.dialogueNext.addEventListener("click", advanceDialogue);
ui.dialogueSkip.addEventListener("click", finishDialogue);
ui.dialogue.addEventListener("click", event => {
  if (event.target === ui.dialogue) advanceDialogue();
});
ui.sound.addEventListener("click", () => {
  Sound.toggleMuted();
  updateSoundToggle();
});

// ---------------------------------------------------------------------------
// Full screen. Turning a phone sideways goes full screen on the next tap
// (browsers only allow it after a tap); turning it back upright leaves it.
// iPhone Safari has no fullscreen API, so there the hint suggests adding the
// game to the home screen, which opens it without browser bars.
const touchScreen = window.matchMedia("(pointer: coarse)");
const landscape = window.matchMedia("(orientation: landscape)");
let autoFullscreen = true;
let enteredAutomatically = false;

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function canFullscreen() {
  const root = document.documentElement;
  return Boolean((document.fullscreenEnabled || document.webkitFullscreenEnabled) && (root.requestFullscreen || root.webkitRequestFullscreen));
}

function enterFullscreen(automatic = false) {
  if (!canFullscreen() || fullscreenElement()) return;
  const root = document.documentElement;
  try {
    const request = root.requestFullscreen ? root.requestFullscreen({ navigationUI: "hide" }) : root.webkitRequestFullscreen();
    enteredAutomatically = automatic;
    if (request && request.catch) request.catch(() => { enteredAutomatically = false; });
  } catch {
    enteredAutomatically = false;
  }
}

function exitFullscreen() {
  if (!fullscreenElement()) return;
  try {
    const exit = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
    if (exit && exit.catch) exit.catch(() => {});
  } catch {
    // Already leaving full screen.
  }
}

function updateFullscreenToggle() {
  const active = Boolean(fullscreenElement());
  ui.fullscreen.hidden = !canFullscreen();
  ui.fullscreen.setAttribute("aria-pressed", String(active));
  ui.fullscreen.textContent = active ? "EXIT" : "FULL";
  ui.fullscreen.setAttribute("aria-label", active ? "Exit full screen" : "Full screen");
  document.body.classList.toggle("is-fullscreen", active);
}

ui.fullscreen.addEventListener("click", () => {
  autoFullscreen = false;
  if (fullscreenElement()) exitFullscreen();
  else enterFullscreen();
});
["fullscreenchange", "webkitfullscreenchange"].forEach(name => document.addEventListener(name, () => {
  // Leaving full screen by hand while sideways means "stop doing that".
  if (!fullscreenElement() && enteredAutomatically && landscape.matches) autoFullscreen = false;
  if (!fullscreenElement()) enteredAutomatically = false;
  updateFullscreenToggle();
}));
window.addEventListener("pointerup", event => {
  if (event.target.closest && event.target.closest("#fullscreen-toggle, input")) return;
  if (autoFullscreen && touchScreen.matches && landscape.matches) enterFullscreen(true);
});
landscape.addEventListener("change", () => {
  if (landscape.matches) autoFullscreen = true;
  else if (enteredAutomatically) exitFullscreen();
});

// iPhone and iPad Safari: offer the home-screen route, and give it a pixel-art icon drawn in code.
function setUpHomeScreenApp() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches;
  ui.installHint.hidden = !(ios && !standalone && !canFullscreen());
  const icon = document.createElement("canvas");
  icon.width = 180;
  icon.height = 180;
  const ctx = icon.getContext("2d");
  ctx.fillStyle = "#0d1a1d";
  ctx.fillRect(0, 0, 180, 180);
  ctx.fillStyle = "#ec5139";
  ctx.fillRect(22, 22, 136, 136);
  ctx.fillStyle = "#f3ead5";
  // "TF" in chunky pixels, 11px per pixel on a 16x16 grid.
  [[4, 5, 4, 1], [5.5, 6, 1, 5], [9, 5, 3, 1], [9, 6, 1, 5], [10, 7.5, 1.5, 1]].forEach(([x, y, w, h]) => ctx.fillRect(x * 11 + 2, y * 11 + 2, w * 11, h * 11));
  try {
    const link = document.createElement("link");
    link.rel = "apple-touch-icon";
    link.href = icon.toDataURL("image/png");
    document.head.append(link);
  } catch {
    // No icon: the home screen falls back to a page snapshot.
  }
}

// Browsers only start audio after a user gesture; start the music on the first one.
function unlockAudio() {
  if (typeof Music !== "undefined") Music.unlock();
  window.removeEventListener("pointerdown", unlockAudio);
  window.removeEventListener("keydown", unlockAudio);
}
window.addEventListener("pointerdown", unlockAudio);
window.addEventListener("keydown", unlockAudio);

document.addEventListener("keydown", event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  // Typing a code must not trigger the shortcuts.
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === "m" || event.key === "M") {
    ui.sound.click();
    return;
  }
  if ((event.key === "f" || event.key === "F") && canFullscreen()) {
    ui.fullscreen.click();
    return;
  }
  const number = Number(event.key);
  const digit = Number.isInteger(number) && number >= 1 ? number : null;

  if (screenName === "title" && digit && digit <= 3) {
    chooseMode(["campaign", "endless", "quick"][digit - 1]);
  } else if (screenName === "select") {
    if (digit && digit <= ROSTER.length && isUnlocked(ROSTER[digit - 1].id)) openDetail(ROSTER[digit - 1].id);
    if (event.key === "Escape") goToTitle();
  } else if (screenName === "detail") {
    if (event.key === "Escape") ui.detailBack.click();
  } else if (screenName === "dialogue") {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      advanceDialogue();
    }
    if (event.key === "Escape") finishDialogue();
  } else if (screenName === "fight" && event.key === "Escape") {
    if (paused) closePause();
    else openPause();
  } else if (screenName === "fight" && digit && !paused) {
    const move = playerMoves()[digit - 1];
    if (!move || state.finished || busy()) return;
    if (Rules.available(state.player, move.id)) resolveRound(move.id);
    else Sound.play("denied");
  }
});

updateSoundToggle();
updateFullscreenToggle();
setUpHomeScreenApp();
buildMoveButtons();
updateUI();
requestAnimationFrame(drawArena);
goToTitle();
