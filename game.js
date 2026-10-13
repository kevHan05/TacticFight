const canvas = document.querySelector("#arena");
const context = canvas.getContext("2d");
const ui = {
  round: document.querySelector("#round-number"),
  playerName: document.querySelector("#player-name"),
  botName: document.querySelector("#bot-name"),
  playerHealth: document.querySelector("#player-health"),
  playerHealthText: document.querySelector("#player-hp-text"),
  botHealth: document.querySelector("#bot-health"),
  botHealthText: document.querySelector("#bot-hp-text"),
  playerMeter: document.querySelector(".player-status .health-track"),
  botMeter: document.querySelector(".bot-status .health-track"),
  playerTags: document.querySelector("#player-tags"),
  botTags: document.querySelector("#bot-tags"),
  actionRow: document.querySelector("#action-row"),
  announcement: document.querySelector("#screen-announcement"),
  announcementText: document.querySelector("#announcement-text"),
  restartArea: document.querySelector(".console-bottom"),
  restart: document.querySelector("#restart-button"),
  change: document.querySelector("#change-button"),
  select: document.querySelector("#character-select"),
  selectGrid: document.querySelector("#select-grid"),
  sound: document.querySelector("#sound-toggle")
};

const STATUS_LABELS = {
  boost: "POWER UP +50%",
  exposed: "EXPOSED",
  staggered: "STAGGERED",
  blinded: "BLINDED",
  fortified: "FORTIFIED",
  tracking: "TRACKING"
};

let state;
let animation = null;
let moveButtons = [];
let portraits = [];
let lastPortraitDraw = 0;

function newMatch(playerId, botId) {
  return {
    player: Rules.newFighter(playerId),
    bot: Rules.newFighter(botId),
    completedRounds: 0,
    history: [],
    revealed: null,
    finished: false
  };
}

function announce(text, type) {
  ui.announcement.dataset.state = type;
  ui.announcementText.textContent = text;
  ui.announcement.hidden = false;
}

function clearAnnouncement() {
  ui.announcement.hidden = true;
}

function playerMoves() {
  return Rules.character(state.player.id).moves;
}

function playerUltimateReady() {
  const ultimate = playerMoves().find(move => move.ultimate);
  return Rules.available(state.player, ultimate.id);
}

function statusTags(fighter) {
  return Object.keys(STATUS_LABELS).filter(key => fighter[key]).map(key => STATUS_LABELS[key]);
}

function updateUI() {
  const roundNumber = state.completedRounds + 1;
  ui.round.textContent = String(roundNumber).padStart(2, "0");
  [["player", ui.playerName, ui.playerHealth, ui.playerHealthText, ui.playerMeter, ui.playerTags], ["bot", ui.botName, ui.botHealth, ui.botHealthText, ui.botMeter, ui.botTags]].forEach(([side, name, bar, text, meter, tags]) => {
    const fighter = state[side];
    name.textContent = Rules.character(fighter.id).name;
    bar.style.width = `${(fighter.hp / fighter.maxHp) * 100}%`;
    text.textContent = fighter.hp;
    meter.setAttribute("aria-valuenow", fighter.hp);
    meter.setAttribute("aria-valuemax", fighter.maxHp);
    const labels = statusTags(fighter);
    if (side === "bot" && state.revealed) labels.push(`NEXT: ${Rules.move(state.bot, state.revealed).name.toUpperCase()}`);
    tags.textContent = labels.join(" / ");
    tags.parentElement.hidden = labels.length === 0;
  });

  playerMoves().forEach((move, index) => {
    const button = moveButtons[index];
    const cooldown = state.player.cooldowns[move.id];
    button.disabled = state.finished || cooldown > 0;
    const detail = button.querySelector("small");
    if (cooldown > 0) detail.textContent = move.ultimate ? `CHARGES IN ${cooldown}` : `READY IN ${cooldown}`;
    else detail.textContent = move.detail;
  });
  ui.restart.hidden = !state.finished;
  ui.restartArea.hidden = !state.finished;
  canvas.setAttribute("aria-label", `${Rules.character(state.player.id).name} and ${Rules.character(state.bot.id).name} face off in a pixel art city arena`);
}

function buildMoveButtons() {
  moveButtons = playerMoves().map((move, index) => {
    const button = document.createElement("button");
    const kind = move.ultimate ? "ultimate" : Rules.isStrike(move) ? "attack" : "block";
    button.className = `action-button ${kind}-button`;
    button.type = "button";
    button.title = `${move.name} (${index + 1})`;
    button.innerHTML = '<span class="action-copy"><strong></strong><small></small></span>';
    button.querySelector("strong").textContent = move.name;
    button.addEventListener("click", () => resolveRound(move.id));
    button.addEventListener("mouseenter", () => {
      if (!button.disabled) Sound.playIfUnlocked("hover");
    });
    return button;
  });
  ui.actionRow.replaceChildren(...moveButtons);
  ui.actionRow.style.setProperty("--moves", moveButtons.length);
}

function updateSoundToggle() {
  const muted = Sound.isMuted();
  ui.sound.setAttribute("aria-pressed", String(!muted));
  const label = muted ? "Turn sound on" : "Mute sound";
  ui.sound.setAttribute("aria-label", label);
  ui.sound.title = `${label} (M)`;
}

// The wind-up cue for each move, timed so its contact lands on `hit`.
function playMoveCue(outcome, start, hit, lead) {
  switch (outcome.move.anim) {
    case "punch":
    case "shuffle":
      Sound.play("swing", hit - 0.14);
      break;
    case "combo":
      [0, 0.1, 0.2].forEach(offset => Sound.play("swing", hit - 0.14 + offset));
      break;
    case "swing":
      Sound.play("swing", hit - 0.2);
      Sound.play("swing", hit - 0.12);
      break;
    case "uppercut":
      Sound.play("uppercut", hit - 0.32);
      break;
    case "rush":
      Sound.play("rush", start);
      break;
    case "overdrive":
      Sound.play("overdrive", start);
      Sound.play("rush", hit - 0.3);
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
      Sound.play("stampede", start + 0.25);
      break;
    case "vanish":
      Sound.play("vanish", start);
      if (outcome.spotted) Sound.play("boing", start + 0.32);
      break;
    case "dash":
      Sound.play("dodge", hit - 0.13);
      break;
    case "fortress":
      Sound.play("armor", hit - 0.2);
      break;
    case "smoke":
      Sound.play("smoke", hit - 0.2);
      break;
    case "senses":
      Sound.play("senses", hit - 0.18);
      break;
    default:
      break;
  }
}

// What happened to `side`'s strike: impacts, clangs, whooshes and the target's voice.
function playOutcome(report, side, hit) {
  const other = side === "player" ? "bot" : "player";
  const mine = report[side];
  const defense = report[other].move;
  const voice = Rules.character(state[other].id).voice;
  const multi = ["combo", "stampede", "shuriken"].includes(mine.move.anim);
  const spacing = mine.move.anim === "stampede" ? 0.07 : 0.1;

  if (["hit", "broke", "chipped", "armored"].includes(mine.result)) {
    const heavy = mine.move.ultimate || mine.damage >= 20;
    for (let k = 0; k < (multi ? mine.landed : 1); k += 1) Sound.play("impact", hit + k * spacing, heavy);
    if (mine.result === "broke") {
      Sound.play("clang", hit, 0.7);
      Sound.play("crackle", hit);
    }
    if (mine.result === "chipped") {
      Sound.play("clang", hit, 0.9);
      Sound.play("powerUp", hit + 0.3, other);
    }
    if (mine.result === "armored") Sound.play("clang", hit, 0.45);
    if (mine.damage > 0) Sound.play(voice, hit + 0.05);
  } else if (mine.result === "blocked") {
    Sound.play("clang", hit, other === "player" ? 1 : 0.8);
    Sound.play("powerUp", hit + 0.3, other);
  } else if (mine.result === "evaded") {
    if (defense.anim !== "dash") Sound.play("dodge", hit - 0.02);
    if (defense.momentum) Sound.play("powerUp", hit + 0.3, other);
  }
  if (mine.counter > 0) {
    Sound.play("swing", hit + 0.06);
    Sound.play("impact", hit + 0.15);
    Sound.play(Rules.character(state[side].id).voice, hit + 0.2);
  }
}

function playRoundSounds(report, ultimateWasReady) {
  const plan = Arena.timing(report, { player: state.player.id, bot: state.bot.id });
  const hit = plan.hitAt / 1000;
  ["player", "bot"].forEach(side => {
    const lead = plan.lead[side] / 1000;
    playMoveCue(report[side], hit - lead, hit, lead);
    playOutcome(report, side, hit);
  });
  if (report.player.move.guard === "block" && report.bot.move.guard === "block") Sound.play("standoff");

  if (state.finished) {
    Sound.play("ko", hit + 0.15);
    Sound.play(state.player.hp <= 0 ? "lose" : "win", hit + 0.9);
  } else if (!ultimateWasReady && playerUltimateReady()) {
    Sound.play("ultimateReady", hit + 0.6);
  }
}

function resolveRound(moveId) {
  if (state.finished || !ui.select.hidden) return;
  if (!Rules.available(state.player, moveId)) return;
  clearAnnouncement();

  const botMoveId = state.revealed || Rules.chooseMove(state.bot, state.history);
  state.revealed = null;
  const ultimateWasReady = playerUltimateReady();
  const report = Rules.resolve(state.player, moveId, state.bot, botMoveId);

  state.history.push(Rules.isStrike(report.player.move) ? "offense" : "defense");
  state.history = state.history.slice(-5);
  state.completedRounds += 1;
  animation = { report, start: performance.now() };

  if (state.player.hp <= 0) {
    state.finished = true;
    announce("YOU LOSE!", "lose");
  } else if (state.bot.hp <= 0) {
    state.finished = true;
    announce("Winner! Winner! Chicken Dinner!", "win");
  } else if (state.player.tracking) {
    // Safari Senses: the CPU commits to its next move and the player gets to see it.
    state.revealed = Rules.chooseMove(state.bot, state.history);
  }
  playRoundSounds(report, ultimateWasReady);
  updateUI();
}

function startMatch(playerId, botId) {
  const opponents = ROSTER.filter(fighter => fighter.id !== playerId);
  state = newMatch(playerId, botId || opponents[Math.floor(Math.random() * opponents.length)].id);
  animation = null;
  ui.select.hidden = true;
  buildMoveButtons();
  clearAnnouncement();
  Sound.play("bell");
  updateUI();
  announce("Start Fight!", "start");
}

function openSelect() {
  clearAnnouncement();
  ui.select.hidden = false;
  const first = ui.selectGrid.querySelector("button");
  if (first) first.focus();
}

function buildSelectScreen() {
  portraits = [];
  ui.selectGrid.replaceChildren(...ROSTER.map((fighter, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "fighter-card";
    card.title = `${fighter.name} (${index + 1})`;
    const portrait = document.createElement("canvas");
    portrait.width = 140;
    portrait.height = 156;
    portraits.push({ canvas: portrait, id: fighter.id });
    const info = document.createElement("span");
    info.className = "card-info";
    info.innerHTML = '<span class="card-name"></span><span class="card-title"></span><span class="card-hp"></span><span class="card-moves"></span>';
    info.querySelector(".card-name").textContent = fighter.name;
    info.querySelector(".card-title").textContent = `${fighter.title} / ${fighter.role}`;
    info.querySelector(".card-hp").textContent = `${fighter.hp} HP`;
    info.querySelector(".card-moves").replaceChildren(...fighter.moves.map(move => {
      const row = document.createElement("span");
      row.className = "card-move";
      row.innerHTML = "<b></b><span></span>";
      row.querySelector("b").textContent = move.ultimate ? `${move.name} (ULT)` : move.name;
      row.querySelector("span").textContent = move.detail;
      return row;
    }));
    card.append(portrait, info);
    card.addEventListener("click", () => startMatch(fighter.id));
    card.addEventListener("mouseenter", () => Sound.playIfUnlocked("hover"));
    return card;
  }));
}

function drawArena(now) {
  Arena.draw(context, state, animation, now);
  if (!ui.select.hidden && now - lastPortraitDraw > 90) {
    lastPortraitDraw = now;
    portraits.forEach(({ canvas: portrait, id }) => Arena.portrait(portrait, id, now));
  }
  requestAnimationFrame(drawArena);
}

ui.restart.addEventListener("click", () => startMatch(state.player.id, state.bot.id));
ui.change.addEventListener("click", openSelect);
ui.sound.addEventListener("click", () => {
  Sound.toggleMuted();
  updateSoundToggle();
});

document.addEventListener("keydown", event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "m" || event.key === "M") ui.sound.click();
  const number = Number(event.key);
  if (!Number.isInteger(number) || number < 1) return;
  if (!ui.select.hidden) {
    if (number <= ROSTER.length) startMatch(ROSTER[number - 1].id);
    return;
  }
  const move = playerMoves()[number - 1];
  if (!move || state.finished) return;
  if (Rules.available(state.player, move.id)) resolveRound(move.id);
  else Sound.play("denied");
});

// The classic matchup idles in the arena behind the select screen.
state = newMatch("rook", "byte");
buildMoveButtons();
buildSelectScreen();
updateSoundToggle();
updateUI();
requestAnimationFrame(drawArena);
openSelect();
