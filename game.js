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
  animation = { playerAction, botAction, start: performance.now() };

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

function drawArena(now) {
  Arena.draw(context, state, animation, now);
  requestAnimationFrame(drawArena);
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
requestAnimationFrame(drawArena);