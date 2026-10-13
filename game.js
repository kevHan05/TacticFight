const canvas = document.querySelector("#arena");
const context = canvas.getContext("2d");
const ui = {
  round: document.querySelector("#round-number"),
  playerHealth: document.querySelector("#player-health"),
  playerHealthText: document.querySelector("#player-hp-text"),
  botHealth: document.querySelector("#bot-health"),
  botHealthText: document.querySelector("#bot-hp-text"),
  playerMeter: document.querySelector(".player-status .health-track"),
  botMeter: document.querySelector(".bot-status .health-track"),
  playerBoost: document.querySelector("#player-boost"),
  botBoost: document.querySelector("#bot-boost"),
  ultimate: document.querySelector("#ultimate-button"),
  ultimateDetail: document.querySelector("#ultimate-detail"),
  message: document.querySelector("#combat-message"),
  restart: document.querySelector("#restart-button"),
  sound: document.querySelector("#sound-toggle"),
  actions: [...document.querySelectorAll(".action-button")]
};

const baseDamage = 15;
const ultimateDamage = baseDamage * 2;
let state;
let animation = null;

function freshState() {
  return {
    playerHealth: 100,
    botHealth: 100,
    playerBoost: false,
    botBoost: false,
    playerCooldown: 3,
    botCooldown: 3,
    completedRounds: 0,
    previousPlayerActions: [],
    finished: false
  };
}

function setMessage(text) {
  ui.message.textContent = text;
}

function clampHealth(value) {
  return Math.max(0, Math.min(100, value));
}

function updateUI() {
  const roundNumber = state.completedRounds + 1;
  ui.round.textContent = String(roundNumber).padStart(2, "0");
  ui.playerHealth.style.width = `${state.playerHealth}%`;
  ui.botHealth.style.width = `${state.botHealth}%`;
  ui.playerHealthText.textContent = state.playerHealth;
  ui.botHealthText.textContent = state.botHealth;
  ui.playerMeter.setAttribute("aria-valuenow", state.playerHealth);
  ui.botMeter.setAttribute("aria-valuenow", state.botHealth);
  ui.playerBoost.hidden = !state.playerBoost;
  ui.botBoost.hidden = !state.botBoost;

  const ultimateReady = playerUltimateReady();
  ui.ultimate.disabled = !ultimateReady || state.finished;
  ui.ultimateDetail.textContent = ultimateReady ? "30 DAMAGE" : `CHARGES IN ${state.playerCooldown}`;
  ui.actions[0].disabled = state.finished;
  ui.actions[1].disabled = state.finished;
  ui.restart.hidden = !state.finished;
  drawArena();
}

function playerUltimateReady() {
  return state.completedRounds >= 3 && state.playerCooldown === 0;
}

function updateSoundToggle() {
  const muted = Sound.isMuted();
  ui.sound.setAttribute("aria-pressed", String(!muted));
  ui.sound.textContent = muted ? "SOUND OFF" : "SOUND ON";
}

function playRoundSounds(playerAction, botAction, playerStartsBoosted, botStartsBoosted, ultimateWasReady) {
  const ultimateInPlay = playerAction === "ultimate" || botAction === "ultimate";
  // Hits land on the ultimate's blast when one is thrown, otherwise right after the swing.
  const hit = ultimateInPlay ? 0.38 : 0.14;

  if (playerAction === "ultimate") Sound.play("ultimate", 0, "player");
  if (botAction === "ultimate") Sound.play("ultimate", 0.02, "bot");
  if (playerAction === "attack") Sound.play("swing", hit - 0.14);
  if (botAction === "attack") Sound.play("swing", hit - 0.1);

  if (playerAction === "block" && botAction === "block") {
    Sound.play("standoff");
  } else if (playerAction === "block" || botAction === "block") {
    const blocker = playerAction === "block" ? "player" : "bot";
    Sound.play("clang", hit, blocker === "player" ? 1 : 0.8);
    Sound.play("powerUp", hit + 0.3, blocker);
  } else {
    const boostedHit = (playerAction === "attack" && playerStartsBoosted) || (botAction === "attack" && botStartsBoosted);
    Sound.play("impact", hit, boostedHit || ultimateInPlay);
    if (boostedHit) Sound.play("crackle", hit);
    Sound.play("rookHurt", hit + 0.05);
    Sound.play("byteHurt", hit + 0.08);
  }

  if (state.finished) {
    Sound.play("ko", hit + 0.15);
    Sound.play(state.playerHealth <= 0 ? "lose" : "win", hit + 0.9);
  } else if (!ultimateWasReady && playerUltimateReady()) {
    Sound.play("ultimateReady", hit + 0.6);
  }
}

function chooseBotAction() {
  const ultimateReady = state.completedRounds >= 3 && state.botCooldown === 0;
  if (ultimateReady && Math.random() < 0.28) return "ultimate";

  const recent = state.previousPlayerActions.slice(-3);
  const playerAttacksOften = recent.filter(action => action === "attack" || action === "ultimate").length;
  const playerBlocksOften = recent.filter(action => action === "block").length;
  const roll = Math.random();
  if (playerAttacksOften >= 2 && roll < 0.52) return "block";
  if (playerBlocksOften >= 2 && roll < 0.58) return "attack";
  if (roll < 0.48) return "attack";
  if (roll < 0.82) return "block";
  return "attack";
}

function attackDamage(boosted) {
  return Math.round(baseDamage * (boosted ? 1.5 : 1));
}

function resolveRound(playerAction) {
  if (state.finished) return;

  const botAction = chooseBotAction();
  const playerStartsBoosted = state.playerBoost;
  const botStartsBoosted = state.botBoost;
  const ultimateWasReady = playerUltimateReady();
  const messages = [];

  if (playerAction === "attack") state.playerBoost = false;
  if (botAction === "attack") state.botBoost = false;

  if (playerAction === "block" && botAction === "block") {
    messages.push("Both fighters guarded. Nobody gives ground.");
  } else if (playerAction === "block" || botAction === "block") {
    if (playerAction === "block") {
      const blockedName = botAction === "ultimate" ? "ultimate" : "attack";
      state.playerBoost = true;
      messages.push(`Rook blocked Byte's ${blockedName}. Rook's next attack is powered up.`);
    } else {
      const blockedName = playerAction === "ultimate" ? "ultimate" : "attack";
      state.botBoost = true;
      messages.push(`Byte blocked Rook's ${blockedName}. Byte's next attack is powered up.`);
    }
  } else {
    const playerDamage = playerAction === "ultimate" ? ultimateDamage : attackDamage(playerStartsBoosted);
    const botDamage = botAction === "ultimate" ? ultimateDamage : attackDamage(botStartsBoosted);
    state.botHealth = clampHealth(state.botHealth - playerDamage);
    state.playerHealth = clampHealth(state.playerHealth - botDamage);

    const playerLabel = playerAction === "ultimate" ? "ULTIMATE" : `${playerDamage} damage`;
    const botLabel = botAction === "ultimate" ? "ULTIMATE" : `${botDamage} damage`;
    messages.push(`Rook dealt ${playerLabel}. Byte dealt ${botLabel}.`);
  }

  state.previousPlayerActions.push(playerAction);
  state.previousPlayerActions = state.previousPlayerActions.slice(-5);
  state.playerCooldown = playerAction === "ultimate" ? 3 : Math.max(0, state.playerCooldown - 1);
  state.botCooldown = botAction === "ultimate" ? 3 : Math.max(0, state.botCooldown - 1);
  state.completedRounds += 1;
  animation = { playerAction, botAction, until: performance.now() + 620 };

  if (state.playerHealth <= 0) {
    state.finished = true;
    setMessage("YOU LOSE! Byte takes the match.");
  } else if (state.botHealth <= 0) {
    state.finished = true;
    setMessage("YOU WIN! Byte is down. The district is yours.");
  } else {
    setMessage(messages.join(" "));
  }
  playRoundSounds(playerAction, botAction, playerStartsBoosted, botStartsBoosted, ultimateWasReady);
  updateUI();
}

function pixel(x, y, width, height, color) {
  context.fillStyle = color;
  context.fillRect(x, y, width, height);
}

function drawBuilding(x, y, width, height, color, windowColor) {
  pixel(x, y, width, height, color);
  pixel(x + 10, y - 11, width - 20, 11, color);
  for (let row = y + 14; row < y + height - 9; row += 22) {
    for (let column = x + 11; column < x + width - 10; column += 22) {
      if ((row + column) % 3 !== 0) pixel(column, row, 8, 8, windowColor);
    }
  }
}

function drawBackground() {
  const sky = context.createLinearGradient(0, 0, 0, 420);
  sky.addColorStop(0, "#38616a");
  sky.addColorStop(0.56, "#e37d60");
  sky.addColorStop(1, "#f0b171");
  pixel(0, 0, 960, 420, "#29474e");
  context.fillStyle = sky;
  context.fillRect(0, 0, 960, 280);

  pixel(606, 52, 114, 114, "#ffd58b");
  pixel(618, 40, 90, 12, "#ffd58b");
  pixel(618, 166, 90, 12, "#ffd58b");
  pixel(594, 64, 12, 90, "#ffd58b");
  pixel(720, 64, 12, 90, "#ffd58b");

  drawBuilding(10, 97, 133, 192, "#28464b", "#638074");
  drawBuilding(155, 132, 118, 157, "#314e50", "#d28a68");
  drawBuilding(281, 82, 147, 207, "#29494d", "#be785f");
  drawBuilding(438, 119, 126, 170, "#345255", "#e0a36e");
  drawBuilding(571, 89, 124, 200, "#2b494d", "#d8906c");
  drawBuilding(704, 128, 111, 161, "#355252", "#e0a36e");
  drawBuilding(824, 101, 125, 188, "#29464a", "#bd785f");

  pixel(0, 289, 960, 131, "#283c3d");
  pixel(0, 289, 960, 9, "#dd936e");
  for (let x = 0; x < 960; x += 80) {
    pixel(x, 303, 35, 4, "#48605a");
    pixel(x + 30, 326, 29, 3, "#344b49");
    pixel(x + 8, 382, 38, 4, "#344b49");
  }
  pixel(0, 401, 960, 19, "#1b3033");
  pixel(0, 397, 960, 4, "#7e7161");
}

function drawFighter(side, action, boosted, now) {
  const isPlayer = side === "player";
  const centerX = isPlayer ? 302 : 658;
  const floorY = window.matchMedia("(min-width: 621px)").matches ? 277 : 397;
  const outfit = isPlayer ? "#e64e39" : "#79d6a0";
  const dark = isPlayer ? "#9d3030" : "#28715f";
  const highlight = isPlayer ? "#ff9971" : "#c2f078";
  const skin = isPlayer ? "#f3bc8b" : "#d6a879";
  let shiftX = 0;
  let lean = 0;
  const active = animation && now < animation.until;
  if (active && action === "attack") {
    const progress = (animation.until - now) / 620;
    shiftX = (isPlayer ? 1 : -1) * Math.round((1 - progress) * 24);
    lean = Math.round((1 - progress) * 7);
  } else if (active && action === "ultimate") {
    const pulse = Math.sin((animation.until - now) / 620 * Math.PI);
    shiftX = (isPlayer ? 1 : -1) * Math.round(pulse * 11);
  }
  if (active && action === "block") {
    lean = 4;
  }
  const x = centerX - 52 + shiftX;
  const y = floorY - 158;

  pixel(centerX - 42, floorY - 4, 84, 8, "#152a2c66");
  if (boosted) {
    pixel(centerX - 48, y + 32, 5, 6, "#d7ef76");
    pixel(centerX + 42, y + 66, 5, 6, "#d7ef76");
    pixel(centerX + 34, y + 8, 5, 6, "#d7ef76");
  }

  const bodyX = x + lean;
  pixel(bodyX + 18, y + 126, 28, 35, dark);
  pixel(bodyX + 22, y + 126, 21, 31, outfit);
  pixel(bodyX + 18, y + 153, 30, 8, "#182d31");
  pixel(bodyX + 10, y + 151, 19, 10, "#182d31");
  pixel(bodyX + 42, y + 151, 19, 10, "#182d31");
  pixel(bodyX + 18, y + 78, 42, 54, dark);
  pixel(bodyX + 22, y + 82, 34, 45, outfit);
  pixel(bodyX + 23, y + 113, 33, 8, highlight);
  pixel(bodyX + 22, y + 127, 34, 8, "#f1d779");
  pixel(bodyX + 17, y + 80, 12, 37, skin);
  pixel(bodyX + 54, y + 81, 12, 35, skin);
  pixel(bodyX + 12, y + 111, 20, 15, dark);
  pixel(bodyX + 53, y + 108, 20, 15, dark);
  pixel(bodyX + 22, y + 35, 38, 44, skin);
  pixel(bodyX + 18, y + 27, 45, 18, dark);
  pixel(bodyX + 22, y + 23, 38, 14, outfit);
  pixel(bodyX + 29, y + 49, 5, 5, "#17272a");
  pixel(bodyX + 49, y + 49, 5, 5, "#17272a");
  pixel(bodyX + 36, y + 64, 12, 4, dark);

  if (isPlayer) {
    pixel(bodyX + 17, y + 24, 48, 7, highlight);
    pixel(bodyX + 25, y + 13, 33, 13, dark);
    pixel(bodyX + 31, y + 8, 29, 10, outfit);
    pixel(bodyX + 31, y + 15, 31, 5, highlight);
    pixel(bodyX + 9, y + 81, 12, 13, highlight);
  } else {
    pixel(bodyX + 21, y + 28, 42, 9, dark);
    pixel(bodyX + 24, y + 17, 35, 16, highlight);
    pixel(bodyX + 28, y + 20, 8, 5, "#e9f4bd");
    pixel(bodyX + 45, y + 20, 8, 5, "#e9f4bd");
    pixel(bodyX + 58, y + 79, 11, 12, highlight);
  }

  if (active && action === "block") {
    pixel(bodyX + (isPlayer ? 61 : -4), y + 69, 20, 24, "#f1d779");
  }
  if (active && action === "ultimate") {
    pixel(centerX - 57, y - 8, 114, 4, highlight);
    pixel(centerX - 65, y + 20, 4, 75, highlight);
    pixel(centerX + 61, y + 20, 4, 75, highlight);
    pixel(centerX - 42, y + 4, 84, 4, "#fff2bc");
  }

  context.save();
  context.textAlign = "center";
  context.font = "bold 10px 'Space Mono', monospace";
  context.fillStyle = "#f3ead5";
  context.fillText(isPlayer ? "ROOK" : "BYTE", centerX, floorY + 17);
  context.restore();
}

function drawArena(now = performance.now()) {
  if (!context || !state) return;
  drawBackground();
  const active = animation && now < animation.until;
  drawFighter("player", active ? animation.playerAction : "idle", state.playerBoost, now);
  drawFighter("bot", active ? animation.botAction : "idle", state.botBoost, now);
  if (active) requestAnimationFrame(drawArena);
}

document.querySelector("#attack-button").addEventListener("click", () => resolveRound("attack"));
document.querySelector("#block-button").addEventListener("click", () => resolveRound("block"));
ui.ultimate.addEventListener("click", () => resolveRound("ultimate"));
ui.restart.addEventListener("click", () => {
  state = freshState();
  animation = null;
  setMessage("The bell is yours. Make the first move.");
  Sound.play("bell");
  updateUI();
});
ui.actions.forEach(button => {
  button.addEventListener("mouseenter", () => {
    if (!button.disabled) Sound.playIfUnlocked("hover");
  });
});
ui.sound.addEventListener("click", () => {
  Sound.toggleMuted();
  updateSoundToggle();
});

document.addEventListener("keydown", event => {
  if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "1" && !ui.actions[0].disabled) resolveRound("attack");
  if (event.key === "2" && !ui.actions[1].disabled) resolveRound("block");
  if (event.key === "3") {
    if (!ui.ultimate.disabled) resolveRound("ultimate");
    else if (!state.finished) Sound.play("denied");
  }
  if (event.key === "m" || event.key === "M") ui.sound.click();
});

state = freshState();
updateSoundToggle();
updateUI();