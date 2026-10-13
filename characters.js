// Fighter roster and the turn-based rules engine.
//
// Every fighter has three or four moves. The last one is the ultimate: it
// unlocks after three rounds and recharges three rounds after use.
//
// Move fields:
//   damage, hits, chance  Offensive moves deal `damage` per hit, each hit landing with `chance`.
//   guard                 "block"   stops a strike and powers up the next one (area strikes are halved).
//                         "dodge"   evades single-target strikes.
//                         "shuffle" like dodge, but only half the time.
//                         "armor"   takes 40% damage.
//                         "smoke"   evades every strike.
//                         "vanish"  evades every strike unless the user is spotted.
//   area                  Cannot be dodged; a block only halves it.
//   breaksGuard           Goes straight through a block.
//   interrupt             When both fighters strike, the opponent's damage drops 30%.
//   risky                 If blocked, evaded or missed, the user is exposed (takes 1.5x) next round.
//   stagger               If every hit lands, the opponent's next strike is halved.
//   counter               Damage dealt back when a dodge succeeds.
//   momentum              A successful dodge powers up the next strike.
//   blind                 The opponent's next strike has a 50% chance to miss.
//   fortify               Damage taken next round is also halved.
//   track                 Reveals the CPU's next move; the user's next strike cannot be evaded.
//   cooldown              Rounds before the move can be used again.
//   anim                  Animation key used by graphics.js and the sound cues.
const ULTIMATE_CHARGE = 3;

const ROSTER = [
  {
    id: "rook",
    name: "ROOK",
    title: "Vanguard",
    role: "All-rounder",
    hp: 100,
    voice: "rookHurt",
    moves: [
      { id: "attack", name: "Attack", damage: 15, anim: "punch", detail: "15 DAMAGE" },
      { id: "block", name: "Block", guard: "block", anim: "block", detail: "GUARD + COUNTER" },
      { id: "blaze", name: "Blaze Ball", ultimate: true, damage: 30, anim: "fireball", detail: "30 DAMAGE" }
    ]
  },
  {
    id: "byte",
    name: "BYTE",
    title: "Combat Unit",
    role: "All-rounder",
    hp: 100,
    voice: "byteHurt",
    moves: [
      { id: "attack", name: "Attack", damage: 15, anim: "punch", detail: "15 DAMAGE" },
      { id: "block", name: "Block", guard: "block", anim: "block", detail: "GUARD + COUNTER" },
      { id: "plasma", name: "Plasma Bolt", ultimate: true, damage: 30, anim: "plasma", detail: "30 DAMAGE" }
    ]
  },
  {
    id: "bobbie",
    name: "BOBBIE",
    title: "The Street Champ",
    role: "Boxer",
    hp: 100,
    voice: "rookHurt",
    moves: [
      { id: "punch", name: "Macalanger Punch", damage: 17, anim: "punch", detail: "17 DAMAGE" },
      { id: "dash", name: "Sneaker Dash", guard: "dodge", momentum: true, anim: "dash", detail: "DODGE + POWER UP" },
      { id: "combo", name: "Three-Piece Combo", damage: 6, hits: 3, stagger: true, risky: true, anim: "combo", detail: "3x6 + STAGGER, RISKY" },
      { id: "uppercut", name: "Championship Uppercut", ultimate: true, damage: 34, risky: true, anim: "uppercut", detail: "34 DAMAGE, RISKY" }
    ]
  },
  {
    id: "rocky",
    name: "R.O.C.K.Y",
    title: "The Iron Bull",
    role: "Tank",
    hp: 110,
    voice: "byteHurt",
    moves: [
      { id: "rush", name: "Bull Rush", damage: 12, breaksGuard: true, anim: "rush", detail: "12, BREAKS GUARD" },
      { id: "fist", name: "Steel Fist", damage: 14, interrupt: true, anim: "punch", detail: "14, INTERRUPTS" },
      { id: "fortress", name: "Fortress Mode", guard: "armor", fortify: true, cooldown: 3, anim: "fortress", detail: "-60% DMG, 2 ROUNDS" },
      { id: "overdrive", name: "Full Charge Overdrive", ultimate: true, damage: 26, breaksGuard: true, area: true, anim: "overdrive", detail: "26, UNSTOPPABLE" }
    ]
  },
  {
    id: "ninja",
    name: "NINJA MAIN",
    title: "Beginner Assassin",
    role: "Agile fighter",
    hp: 80,
    voice: "ninjaHurt",
    moves: [
      { id: "step", name: "Shadow Step", guard: "dodge", counter: 8, anim: "dash", detail: "DODGE + 8 COUNTER" },
      { id: "shuriken", name: "Rookie Shuriken", damage: 7, hits: 3, chance: 0.65, anim: "shuriken", detail: "3x7, 65% EACH" },
      { id: "smoke", name: "Smoke Panic", guard: "smoke", blind: true, cooldown: 2, anim: "smoke", detail: "EVADE ALL + BLIND" },
      { id: "vanish", name: "Almost Invisible", ultimate: true, damage: 28, guard: "vanish", breaksGuard: true, anim: "vanish", detail: "EVADE + 28 SURPRISE" }
    ]
  },
  {
    id: "zoombie",
    name: "ZOO-MBIE",
    title: "Undead Safari Guide",
    role: "Bruiser",
    hp: 115,
    voice: "zombieHurt",
    moves: [
      { id: "swing", name: "Rotten Swing", damage: 16, area: true, anim: "swing", detail: "16, CAN'T BE DODGED" },
      { id: "shuffle", name: "Undead Shuffle", damage: 10, guard: "shuffle", anim: "shuffle", detail: "10 + 50% EVADE" },
      { id: "senses", name: "Safari Senses", track: true, cooldown: 2, anim: "senses", detail: "READ NEXT MOVE" },
      { id: "stampede", name: "Zombie Stampede", ultimate: true, damage: 7, hits: 4, area: true, anim: "stampede", detail: "4x7, CAN'T BE DODGED" }
    ]
  }
];

const Rules = (() => {
  const byId = Object.fromEntries(ROSTER.map(fighter => [fighter.id, fighter]));

  function character(id) {
    return byId[id];
  }

  function newFighter(id) {
    const info = byId[id];
    const cooldowns = {};
    info.moves.forEach(move => { cooldowns[move.id] = move.ultimate ? ULTIMATE_CHARGE : 0; });
    return {
      id,
      hp: info.hp,
      maxHp: info.hp,
      boost: false,
      exposed: false,
      staggered: false,
      blinded: false,
      fortified: false,
      tracking: false,
      cooldowns
    };
  }

  function move(fighter, moveId) {
    return byId[fighter.id].moves.find(candidate => candidate.id === moveId);
  }

  function available(fighter, moveId) {
    return fighter.cooldowns[moveId] === 0;
  }

  function isStrike(m) {
    return (m.damage || 0) > 0;
  }

  // One fighter's strike against the other, using statuses from the start of the round.
  function strike(attacker, attackMove, defender, defendMove, spotted, random) {
    const outcome = { result: "none", damage: 0, landed: 0, counter: 0 };
    if (!isStrike(attackMove)) return outcome;

    if (attacker.blinded && random() < 0.5) {
      outcome.result = "missed";
      return outcome;
    }

    const guard = defendMove.guard;
    const canEvade = !attacker.tracking;
    const evaded = canEvade && (
      (guard === "dodge" && !attackMove.area) ||
      (guard === "shuffle" && !attackMove.area && random() < 0.5) ||
      guard === "smoke" ||
      (guard === "vanish" && !spotted)
    );
    if (evaded) {
      outcome.result = "evaded";
      outcome.counter = defendMove.counter || 0;
      return outcome;
    }

    const hits = attackMove.hits || 1;
    for (let i = 0; i < hits; i += 1) {
      if (random() < (attackMove.chance ?? 1)) outcome.landed += 1;
    }
    if (outcome.landed === 0) {
      outcome.result = "missed";
      return outcome;
    }

    let damage = attackMove.damage * outcome.landed;
    if (attacker.boost && !attackMove.ultimate) damage *= 1.5;
    outcome.result = "hit";
    if (guard === "block") {
      if (attackMove.breaksGuard) {
        outcome.result = "broke";
      } else if (attackMove.area) {
        damage *= 0.5;
        outcome.result = "chipped";
      } else {
        damage = 0;
        outcome.result = "blocked";
      }
    }
    if (guard === "armor") {
      damage *= 0.4;
      outcome.result = "armored";
    }
    if (defender.fortified) damage *= 0.5;
    if (defender.exposed) damage *= 1.5;
    if (attacker.staggered) damage *= 0.5;
    if (defendMove.interrupt && isStrike(defendMove)) damage *= 0.7;
    outcome.damage = Math.round(damage);
    return outcome;
  }

  // Resolves one simultaneous round and mutates both fighters. Returns what
  // happened on each side for the animation and sound cues.
  function resolve(player, playerMoveId, bot, botMoveId, random = Math.random) {
    const sides = {
      player: { fighter: player, move: move(player, playerMoveId) },
      bot: { fighter: bot, move: move(bot, botMoveId) }
    };
    Object.values(sides).forEach(side => {
      side.spotted = side.move.guard === "vanish" && random() < 0.2;
    });

    const report = {};
    ["player", "bot"].forEach(key => {
      const other = key === "player" ? "bot" : "player";
      const me = sides[key];
      const them = sides[other];
      report[key] = {
        move: me.move,
        spotted: me.spotted,
        ...strike(me.fighter, me.move, them.fighter, them.move, them.spotted, random)
      };
    });

    const next = {};
    ["player", "bot"].forEach(key => {
      next[key] = { exposed: false, staggered: false, blinded: false, fortified: false, tracking: false };
    });

    ["player", "bot"].forEach(key => {
      const other = key === "player" ? "bot" : "player";
      const me = sides[key];
      const mine = report[key];
      const theirs = report[other];

      if (isStrike(me.move) && !me.move.ultimate) me.fighter.boost = false;
      if (me.move.guard === "block" && (theirs.result === "blocked" || theirs.result === "chipped")) me.fighter.boost = true;
      if (me.move.momentum && theirs.result === "evaded") me.fighter.boost = true;

      if (me.move.risky && ["blocked", "evaded", "missed"].includes(mine.result)) next[key].exposed = true;
      if (me.move.stagger && mine.landed === (me.move.hits || 1) && ["hit", "broke", "chipped"].includes(mine.result)) next[other].staggered = true;
      if (me.move.blind) next[other].blinded = true;
      if (me.move.fortify) next[key].fortified = true;
      if (me.move.track) next[key].tracking = true;
    });

    ["player", "bot"].forEach(key => {
      const other = key === "player" ? "bot" : "player";
      const fighter = sides[key].fighter;
      const taken = report[other].damage + report[key].counter;
      report[key].taken = taken;
      fighter.hp = Math.max(0, fighter.hp - taken);
      Object.assign(fighter, next[key]);

      const used = sides[key].move;
      Object.keys(fighter.cooldowns).forEach(id => { fighter.cooldowns[id] = Math.max(0, fighter.cooldowns[id] - 1); });
      if (used.ultimate) fighter.cooldowns[used.id] = ULTIMATE_CHARGE;
      else if (used.cooldown) fighter.cooldowns[used.id] = used.cooldown;
    });
    return report;
  }

  // CPU opponent: reads the player's recent habits and mixes offence and defence.
  function chooseMove(fighter, playerHistory, random = Math.random) {
    const moves = byId[fighter.id].moves.filter(m => available(fighter, m.id));
    const ultimate = moves.find(m => m.ultimate);
    if (ultimate && random() < 0.3) return ultimate.id;

    const offense = moves.filter(m => isStrike(m) && !m.ultimate);
    const defense = moves.filter(m => !isStrike(m) || m.guard);
    const recent = playerHistory.slice(-3);
    const playerAttacks = recent.filter(kind => kind === "offense").length;
    const playerDefends = recent.filter(kind => kind === "defense").length;

    let defendChance = 0.4;
    if (playerAttacks >= 2) defendChance = 0.55;
    if (playerDefends >= 2) defendChance = 0.2;
    if (fighter.boost) defendChance = 0.15;

    const pool = defense.length && random() < defendChance ? defense : offense.length ? offense : moves;
    return pool[Math.floor(random() * pool.length)].id;
  }

  return { character, newFighter, move, available, isStrike, resolve, chooseMove };
})();
