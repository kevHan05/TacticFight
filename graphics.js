// 16-bit arcade renderer for the arena. The scene is drawn at 320x140, close to
// the resolution of early-90s arcade boards, then scaled up 3x with hard pixel
// edges. Fighters are posed from a skeleton, snapped to a fixed palette and
// given a dark outline so they read like hand-pixelled sprites.
const Arena = (() => {
  const WIDTH = 320;
  const HEIGHT = 140;
  const SCALE = 3;
  const PLAYER_X = 100;
  const BOT_X = 219;
  const SPRITE_W = 120;
  const SPRITE_H = 100;
  const FOOT_X = 60;
  const FOOT_Y = 94;
  const OUTLINE = [20, 14, 22];
  const FLASH = [255, 246, 232];

  const screen = makeCanvas(WIDTH, HEIGHT);
  const g = screen.getContext("2d");
  const sprite = makeCanvas(SPRITE_W, SPRITE_H);
  const sg = sprite.getContext("2d", { willReadFrequently: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 621px)");

  function makeCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function seeded(seed) {
    return () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function rect(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }

  function disc(ctx, cx, cy, radius, color) {
    ctx.fillStyle = color;
    for (let dy = -radius; dy <= radius; dy += 1) {
      const half = Math.floor(Math.sqrt(radius * radius - dy * dy + radius * 0.8));
      ctx.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1);
    }
  }

  function clamp01(value) {
    return Math.max(0, Math.min(1, value));
  }

  // Smoothstep progress of `elapsed` through the window [start, end].
  function phase(elapsed, start, end) {
    const t = clamp01((elapsed - start) / (end - start));
    return t * t * (3 - 2 * t);
  }

  function hexToRgb(hex) {
    const value = parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  // ---------------------------------------------------------------------------
  // Pixel font (3x5) for neon signs and the K.O. banner.
  const GLYPHS = {
    A: ["010", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"], C: ["011", "100", "100", "100", "011"],
    D: ["110", "101", "101", "101", "110"], E: ["111", "100", "110", "100", "111"], F: ["111", "100", "110", "100", "100"],
    G: ["011", "100", "101", "101", "011"], H: ["101", "101", "111", "101", "101"], I: ["111", "010", "010", "010", "111"],
    J: ["001", "001", "001", "101", "010"], K: ["101", "101", "110", "101", "101"], L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "111", "101", "101"], N: ["110", "101", "101", "101", "101"], O: ["111", "101", "101", "101", "111"],
    P: ["110", "101", "110", "100", "100"], Q: ["010", "101", "101", "110", "011"], R: ["110", "101", "110", "101", "101"],
    S: ["011", "100", "010", "001", "110"], T: ["111", "010", "010", "010", "010"], U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"], W: ["101", "101", "111", "111", "101"], X: ["101", "101", "010", "101", "101"],
    Y: ["101", "101", "010", "010", "010"], Z: ["111", "001", "010", "100", "111"],
    0: ["111", "101", "101", "101", "111"], 1: ["010", "110", "010", "010", "111"], 2: ["110", "001", "010", "100", "111"],
    3: ["110", "001", "010", "001", "110"], 4: ["101", "101", "111", "001", "001"], 5: ["111", "100", "110", "001", "110"],
    6: ["011", "100", "110", "101", "010"], 7: ["111", "001", "010", "010", "010"], 8: ["010", "101", "010", "101", "010"],
    9: ["010", "101", "011", "001", "110"],
    "-": ["000", "000", "111", "000", "000"], ".": ["000", "000", "000", "000", "010"], "!": ["010", "010", "010", "000", "010"],
    "?": ["110", "001", "010", "000", "010"], "+": ["000", "010", "111", "010", "000"]
  };


  function text(ctx, string, x, y, colorForRow, scale = 1, vertical = false) {
    [...string].forEach((char, index) => {
      const glyph = GLYPHS[char];
      if (!glyph) return;
      const left = vertical ? x : x + index * 4 * scale;
      const top = vertical ? y + index * 6 * scale : y;
      glyph.forEach((row, rowIndex) => {
        [...row].forEach((bit, column) => {
          if (bit === "1") rect(ctx, left + column * scale, top + rowIndex * scale, scale, scale, colorForRow(rowIndex));
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Fighter skeleton. Poses face right with the feet at (0, 0); y grows down.
  const POSES = {
    idle: { head: [3, -55], chest: [1, -41], hip: [-1, -27], fElbow: [10, -36], fHand: [16, -44], bElbow: [4, -33], bHand: [12, -40], fKnee: [9, -14], fFoot: [13, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    attack: { head: [8, -54], chest: [5, -41], hip: [0, -27], fElbow: [19, -46], fHand: [31, -47], bElbow: [-4, -34], bHand: [2, -31], fKnee: [12, -14], fFoot: [17, 0], bKnee: [-8, -13], bFoot: [-16, 0] },
    jab: { head: [7, -54], chest: [4, -41], hip: [0, -27], fElbow: [8, -40], fHand: [12, -48], bElbow: [16, -43], bHand: [28, -45], fKnee: [12, -14], fFoot: [17, 0], bKnee: [-8, -13], bFoot: [-16, 0] },
    block: { head: [0, -54], chest: [-1, -41], hip: [-2, -27], fElbow: [10, -40], fHand: [9, -54], bElbow: [6, -38], bHand: [6, -52], fKnee: [8, -13], fFoot: [13, 0], bKnee: [-9, -13], bFoot: [-15, 0] },
    hurt: { head: [-7, -52], chest: [-5, -40], hip: [-2, -27], fElbow: [4, -34], fHand: [10, -28], bElbow: [-12, -44], bHand: [-16, -52], fKnee: [8, -13], fFoot: [12, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    charge: { head: [-1, -51], chest: [-2, -38], hip: [-1, -24], fElbow: [-4, -30], fHand: [-9, -31], bElbow: [-6, -33], bHand: [-10, -29], fKnee: [12, -12], fFoot: [17, 0], bKnee: [-10, -12], bFoot: [-18, 0] },
    release: { head: [8, -51], chest: [5, -38], hip: [0, -24], fElbow: [16, -41], fHand: [27, -40], bElbow: [14, -38], bHand: [25, -37], fKnee: [13, -12], fFoot: [19, 0], bKnee: [-10, -12], bFoot: [-19, 0] },
    crouch: { head: [2, -46], chest: [0, -34], hip: [-1, -21], fElbow: [6, -26], fHand: [10, -32], bElbow: [-2, -28], bHand: [6, -30], fKnee: [11, -11], fFoot: [15, 0], bKnee: [-9, -11], bFoot: [-15, 0] },
    uppercut: { head: [6, -58], chest: [4, -44], hip: [0, -29], fElbow: [12, -52], fHand: [14, -68], bElbow: [-3, -36], bHand: [3, -32], fKnee: [9, -15], fFoot: [14, 0], bKnee: [-7, -12], bFoot: [-14, 0] },
    ram: { head: [15, -40], chest: [6, -36], hip: [-2, -27], fElbow: [12, -30], fHand: [18, -34], bElbow: [2, -28], bHand: [8, -30], fKnee: [12, -13], fFoot: [18, 0], bKnee: [-10, -12], bFoot: [-20, 0] },
    swingBack: { head: [0, -55], chest: [-1, -41], hip: [-1, -27], fElbow: [-6, -50], fHand: [-14, -56], bElbow: [6, -34], bHand: [10, -28], fKnee: [9, -14], fFoot: [13, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    swing: { head: [10, -51], chest: [6, -39], hip: [0, -26], fElbow: [18, -40], fHand: [30, -32], bElbow: [-4, -34], bHand: [-8, -26], fKnee: [12, -13], fFoot: [18, 0], bKnee: [-9, -13], bFoot: [-17, 0] },
    throw: { head: [6, -54], chest: [3, -41], hip: [0, -27], fElbow: [16, -48], fHand: [27, -51], bElbow: [-6, -38], bHand: [-11, -44], fKnee: [12, -14], fFoot: [17, 0], bKnee: [-8, -13], bFoot: [-16, 0] },
    dodge: { head: [-6, -46], chest: [-6, -35], hip: [-3, -23], fElbow: [3, -36], fHand: [8, -42], bElbow: [-10, -31], bHand: [-6, -38], fKnee: [8, -12], fFoot: [12, 0], bKnee: [-12, -10], bFoot: [-16, 0] },
    fortress: { head: [1, -50], chest: [0, -37], hip: [0, -24], fElbow: [11, -32], fHand: [5, -41], bElbow: [-6, -32], bHand: [6, -38], fKnee: [12, -12], fFoot: [19, 0], bKnee: [-12, -12], bFoot: [-19, 0] },
    flourish: { head: [0, -57], chest: [0, -43], hip: [0, -29], fElbow: [8, -51], fHand: [4, -62], bElbow: [-9, -47], bHand: [-14, -55], fKnee: [8, -27], fFoot: [3, -19], bKnee: [-2, -14], bFoot: [-2, 0] },
    roar: { head: [-3, -57], chest: [-2, -42], hip: [0, -27], fElbow: [12, -50], fHand: [21, -58], bElbow: [-12, -48], bHand: [-21, -56], fKnee: [9, -14], fFoot: [14, 0], bKnee: [-8, -14], bFoot: [-15, 0] },
    senses: { head: [5, -55], chest: [2, -41], hip: [-1, -27], fElbow: [11, -46], fHand: [9, -56], bElbow: [-3, -34], bHand: [0, -27], fKnee: [9, -14], fFoot: [13, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    smoke: { head: [4, -52], chest: [2, -39], hip: [-1, -26], fElbow: [10, -34], fHand: [15, -23], bElbow: [-4, -35], bHand: [-7, -42], fKnee: [10, -13], fFoot: [14, 0], bKnee: [-9, -13], bFoot: [-15, 0] },
    victory: { head: [0, -56], chest: [0, -42], hip: [0, -28], fElbow: [6, -56], fHand: [5, -66], bElbow: [-6, -32], bHand: [-4, -24], fKnee: [5, -14], fFoot: [7, 0], bKnee: [-5, -14], bFoot: [-8, 0] },
    cheer: { head: [0, -56], chest: [0, -42], hip: [0, -28], fElbow: [8, -56], fHand: [10, -66], bElbow: [-8, -56], bHand: [-10, -66], fKnee: [5, -14], fFoot: [8, 0], bKnee: [-5, -14], bFoot: [-8, 0] },
    dance: { head: [-4, -54], chest: [-2, -41], hip: [1, -27], fElbow: [10, -46], fHand: [14, -56], bElbow: [-10, -36], bHand: [-14, -30], fKnee: [10, -17], fFoot: [11, -5], bKnee: [-6, -14], bFoot: [-10, 0] },
    dance2: { head: [5, -54], chest: [3, -41], hip: [0, -27], fElbow: [12, -36], fHand: [16, -28], bElbow: [-8, -46], bHand: [-12, -56], fKnee: [8, -14], fFoot: [12, 0], bKnee: [-4, -17], bFoot: [-9, -5] },
    ko: { head: [-30, -5], chest: [-17, -6], hip: [-3, -5], fElbow: [-14, -2], fHand: [-6, -1], bElbow: [-24, -1], bHand: [-30, -1], fKnee: [10, -8], fFoot: [22, -2], bKnee: [10, -4], bFoot: [24, 0] }
  };
  const UPPER_BODY = ["head", "chest", "fElbow", "fHand", "bElbow", "bHand"];

  // Each fighter's guard, layered over the shared idle pose, and body size.
  const STANCES = {
    bobbie: { fElbow: [9, -38], fHand: [13, -50], bElbow: [3, -36], bHand: [8, -48] },
    rocky: { fElbow: [12, -34], fHand: [16, -40], bElbow: [-4, -32], bHand: [2, -28], fKnee: [10, -14], fFoot: [16, 0], bKnee: [-10, -14], bFoot: [-17, 0] },
    ninja: { head: [4, -52], chest: [2, -39], hip: [-1, -25], fElbow: [12, -36], fHand: [20, -40], bElbow: [-4, -32], bHand: [-8, -26], fKnee: [11, -13], fFoot: [17, 0], bKnee: [-10, -12], bFoot: [-17, 0] },
    zoombie: { head: [9, -53], chest: [4, -41], hip: [-1, -27], fElbow: [11, -31], fHand: [14, -19], bElbow: [1, -31], bHand: [3, -19] }
  };
  const SCALES = { rocky: 1.1, ninja: 0.93, zoombie: 1.06 };

  function blend(a, b, t) {
    if (t <= 0) return a;
    const out = {};
    for (const key in a) out[key] = [a[key][0] + (b[key][0] - a[key][0]) * t, a[key][1] + (b[key][1] - a[key][1]) * t];
    return out;
  }

  function shift(pose, keys, dx, dy) {
    const out = { ...pose };
    keys.forEach(key => { out[key] = [out[key][0] + dx, out[key][1] + dy]; });
    return out;
  }

  // Idle animations follow the character spec: Bobbie bounces and shadowboxes,
  // R.O.C.K.Y breathes slowly, Ninja Main keeps trying a dramatic pose and
  // wobbles, ZOO-mbie sways with dangling arms.
  function idlePose(id, now, side) {
    const pose = { ...POSES.idle, ...STANCES[id] };
    const seed = side === "bot" ? 1.7 : 0;
    if (id === "bobbie") {
      const bounce = Math.abs(Math.sin(now / 190 + seed)) > 0.5 ? 2 : 0;
      const bounced = shift(pose, [...UPPER_BODY, "hip", "fKnee", "bKnee"], 0, bounce);
      return now % 2600 < 220 ? blend(bounced, POSES.jab, 0.7) : bounced;
    }
    if (id === "rocky") return shift(pose, UPPER_BODY, 0, Math.sin(now / 420 + seed) > 0 ? 1 : 0);
    if (id === "ninja") {
      const cycle = (now + seed * 900 + 2000) % 4200;
      if (cycle < 900) {
        const wobble = Math.round(Math.sin(cycle / 45) * (cycle > 450 ? 2 : 0));
        const weight = Math.min(1, Math.sin((cycle / 900) * Math.PI) * 1.4);
        return shift(blend(pose, POSES.flourish, weight), UPPER_BODY, wobble, 0);
      }
      return shift(pose, UPPER_BODY, 0, Math.sin(now / 260 + seed) > 0 ? 1 : 0);
    }
    if (id === "zoombie") {
      const sway = Math.sin(now / 520 + seed) * 1.5;
      const dangle = Math.sin(now / 380 + seed) * 2;
      return shift(shift(pose, ["head", "chest"], sway, 0), ["fHand", "bHand"], dangle, 0);
    }
    return shift(pose, UPPER_BODY, 0, Math.sin(now / 280 + seed) > 0 ? 1 : 0);
  }

  function victoryPose(id, now) {
    if (id === "bobbie") return shift(POSES.cheer, ["fHand", "bHand"], 0, Math.sin(now / 160) > 0 ? 2 : 0);
    if (id === "rocky") return POSES.fortress;
    if (id === "ninja") return shift(POSES.flourish, UPPER_BODY, Math.round(Math.sin(now / 60)), 0);
    if (id === "zoombie") return Math.floor(now / 320) % 2 ? POSES.dance : POSES.dance2;
    return POSES.victory;
  }

  // Converts a pose to sprite coordinates and derives neck, shoulders and hips
  // from the torso direction so lying-down poses still connect properly.
  function joints(pose, scale = 1) {
    const j = {};
    for (const key in pose) j[key] = [FOOT_X + pose[key][0] * scale, FOOT_Y + pose[key][1] * scale];
    const ux = j.chest[0] - j.hip[0];
    const uy = j.chest[1] - j.hip[1];
    const length = Math.hypot(ux, uy) || 1;
    j.u = [ux / length, uy / length];
    j.perp = [-j.u[1], j.u[0]];
    j.neck = along(j, j.chest, 0, 6 * scale);
    j.fShoulder = along(j, j.neck, 2 * scale, -1);
    j.bShoulder = along(j, j.neck, -2.5 * scale, -1);
    j.fHip = along(j, j.hip, 1.5 * scale, 0);
    j.bHip = along(j, j.hip, -1.5 * scale, 0);
    return j;
  }

  // A point offset from `base` by `forward` along the facing and `up` along the spine.
  function along(j, base, forward, up) {
    return [base[0] + j.perp[0] * forward + j.u[0] * up, base[1] + j.perp[1] * forward + j.u[1] * up];
  }

  function at(point, dx, dy) {
    return [point[0] + dx, point[1] + dy];
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  }

  // A tapered limb: a chain of circles from radius r1 at `a` to r2 at `b`.
  function capsule(a, b, r1, r2, color) {
    sg.fillStyle = color;
    sg.beginPath();
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      const r = Math.max(0.6, r1 + (r2 - r1) * t);
      sg.moveTo(x + r, y);
      sg.arc(x, y, r, 0, Math.PI * 2);
    }
    sg.fill();
  }

  // Shadow, base and highlight passes, lit from the upper front.
  function shaded(a, b, r1, r2, tones) {
    capsule(a, b, r1, r2, tones[0]);
    capsule(at(a, 0.6, -0.8), at(b, 0.6, -0.8), r1 - 1.1, r2 - 1.1, tones[1]);
    if (tones[2]) capsule(at(a, 1.3, -1.5), at(b, 1.3, -1.5), r1 * 0.38, r2 * 0.38, tones[2]);
  }

  // Back limbs sit in shadow, like the far side of a classic fighting sprite.
  function dim(tones) {
    return [tones[0], tones[0], tones[1]];
  }

  function line(a, b, color) {
    sg.fillStyle = color;
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      sg.fillRect(Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), 1, 1);
    }
  }

  function px(point, dx, dy, color, width = 1) {
    sg.fillStyle = color;
    sg.fillRect(Math.round(point[0] + dx), Math.round(point[1] + dy), width, 1);
  }

  function polygon(origin, points, color) {
    sg.fillStyle = color;
    sg.beginPath();
    points.forEach(([x, y], index) => (index ? sg.lineTo : sg.moveTo).call(sg, origin[0] + x, origin[1] + y));
    sg.closePath();
    sg.fill();
  }

  // Rook: a street brawler in a sleeveless red gi, headband and hand wraps.
  const ROOK = {
    skin: ["#8c4a2f", "#d9895b", "#f7c28f"],
    gi: ["#7d1d22", "#d13a2f", "#ff7550"],
    pants: ["#1d2140", "#353d6b", "#56619a"],
    belt: ["#141018", "#2e2834"],
    wrap: ["#9a958c", "#ece6d6"],
    hair: ["#1a1214", "#3e2c2e"],
    band: ["#9e1f2a", "#ff4f4f"],
    trim: "#f1c95a",
    eye: "#ffffff"
  };

  const rookParts = {
    arm(shoulder, elbow, hand, back) {
      const skin = back ? dim(ROOK.skin) : ROOK.skin;
      shaded(shoulder, elbow, 3.6, 2.9, skin);
      shaded(elbow, hand, 2.9, 2.4, skin);
      shaded(mix(elbow, hand, 0.6), mix(elbow, hand, 0.86), 2.6, 2.5, back ? dim(ROOK.wrap) : ROOK.wrap);
      shaded(hand, hand, 3.2, 3.2, back ? dim(ROOK.band) : ROOK.band);
    },
    leg(hip, knee, foot, back) {
      const pants = back ? dim(ROOK.pants) : ROOK.pants;
      shaded(hip, knee, 4.8, 3.9, pants);
      shaded(knee, at(foot, 0, -3), 3.9, 3.6, pants);
      shaded(at(foot, -1.5, -0.8), at(foot, 4, -0.6), 1.7, 1.4, back ? dim(ROOK.skin) : ROOK.skin);
    },
    torso(j) {
      shaded(j.hip, j.neck, 6.4, 7.6, ROOK.gi);
      shaded(along(j, j.chest, 3, 1), along(j, j.neck, 3.5, -1), 2.6, 2.2, ROOK.skin);
      line(along(j, j.chest, 1.5, 0), along(j, j.neck, 1.5, -1.5), ROOK.trim);
      shaded(along(j, j.hip, 0, 1), along(j, j.hip, 0, 3), 6.8, 6.9, ROOK.belt);
      line(along(j, j.hip, 6, 2), along(j, j.hip, 7.5, -6), ROOK.belt[0]);
      line(along(j, j.hip, 5, 2), along(j, j.hip, 5.5, -5), ROOK.belt[0]);
    },
    head(j, time) {
      const h = j.head;
      const flutter = Math.sin(time / 80) * 1.5;
      shaded(at(j.neck, 0, 1), at(h, 0.5, 4), 3.1, 2.7, ROOK.skin);
      capsule(at(h, -5, -3), at(h, -12, -1 + flutter), 1.2, 0.9, ROOK.band[0]);
      capsule(at(h, -5, -2), at(h, -10, 3 + flutter * 0.6), 1, 0.8, ROOK.band[0]);
      shaded(at(h, -1.5, -1), at(h, -1.5, -1), 5.6, 5.6, ROOK.hair);
      shaded(at(h, 0.8, -1.2), at(h, 1.8, 2), 4.8, 3.8, ROOK.skin);
      polygon(h, [[-6, 1], [-9, -3], [-6, -4], [-8, -8], [-4, -6], [-4, -11], [-1, -7], [2, -11], [3, -6.5], [6, -8], [5.5, -4], [3, -3], [-3, -3], [-5, 0]], ROOK.hair[0]);
      polygon(h, [[-3, -6], [-1, -9], [0, -6]], ROOK.hair[1]);
      capsule(at(h, -5.5, -3.2), at(h, 5, -3.6), 1.3, 1.2, ROOK.band[1]);
      px(h, -1, 0, ROOK.skin[0]);
      px(h, 3, 0, ROOK.eye);
      px(h, 4, 0, ROOK.hair[0]);
      px(h, 5, 1, ROOK.skin[0]);
      px(h, 3, 3, ROOK.skin[0], 2);
    }
  };

  // Byte: a combat robot with plated armour, a visor and a glowing core.
  const BYTE = {
    armor: ["#164d40", "#2f9a74", "#7fdca4"],
    plate: "#c2f078",
    metal: ["#262e33", "#56636a", "#a3b4b6"],
    visor: ["#0b1716", "#c2f078", "#f4ffd2"],
    core: ["#e9ff8a", "#ffffff"],
    light: "#ff5a4f"
  };

  const byteParts = {
    arm(shoulder, elbow, hand, back) {
      const metal = back ? dim(BYTE.metal) : BYTE.metal;
      const armor = back ? dim(BYTE.armor) : BYTE.armor;
      shaded(shoulder, elbow, 2.7, 2.4, metal);
      shaded(elbow, elbow, 2.9, 2.9, metal);
      shaded(mix(elbow, hand, 0.25), hand, 3.1, 3.8, armor);
      shaded(hand, hand, 3.4, 3.4, metal);
      shaded(at(shoulder, -1, 0.5), at(shoulder, 1, -0.5), 4.8, 4.2, armor);
      if (!back) line(at(shoulder, -2, -3), at(shoulder, 2, -4), BYTE.plate);
    },
    leg(hip, knee, foot, back) {
      const metal = back ? dim(BYTE.metal) : BYTE.metal;
      const armor = back ? dim(BYTE.armor) : BYTE.armor;
      shaded(hip, knee, 3.8, 3.2, metal);
      shaded(knee, at(foot, 0, -3), 4.2, 3.8, armor);
      shaded(at(knee, 1, -0.5), at(knee, 1, -0.5), 3.3, 3.3, armor);
      shaded(at(foot, -3, -1.2), at(foot, 4, -1.2), 2.3, 2.1, metal);
    },
    torso(j, time) {
      shaded(along(j, j.hip, 0, 0), along(j, j.hip, 0, 7), 5.4, 5.6, BYTE.metal);
      [3, 5].forEach(k => line(along(j, j.hip, -5, k), along(j, j.hip, 5, k), BYTE.metal[0]));
      shaded(along(j, j.chest, 0, -1), j.neck, 6.6, 8, BYTE.armor);
      line(along(j, j.chest, 5, -1), along(j, j.neck, 5, -2), BYTE.plate);
      const pulse = Math.sin(time / 150) > 0;
      const core = along(j, j.chest, 3.5, 2);
      shaded(core, core, 2.4, 2.4, [BYTE.metal[0], pulse ? BYTE.core[0] : BYTE.plate]);
      px(core, 0, 0, pulse ? BYTE.core[1] : BYTE.core[0]);
    },
    head(j, time) {
      const h = j.head;
      shaded(at(j.neck, 0, 1), at(h, 0, 4), 2.5, 2.3, BYTE.metal);
      line(at(h, -3, -5), at(h, -6, -12), BYTE.metal[1]);
      capsule(at(h, -6, -12), at(h, -6, -12), 1.1, 1.1, Math.floor(time / 400) % 2 ? BYTE.light : BYTE.metal[0]);
      shaded(at(h, -0.5, -1), at(h, 0.5, 1.5), 6, 5.4, BYTE.armor);
      capsule(at(h, -4, -6.5), at(h, 2, -7), 1.2, 1, BYTE.plate);
      shaded(at(h, 2.5, 2.5), at(h, 4.5, 3), 2.4, 2, BYTE.metal);
      shaded(at(h, -2, 0.5), at(h, -2, 0.5), 1.9, 1.9, BYTE.metal);
      capsule(at(h, 0.5, -0.8), at(h, 5.8, -0.8), 1.4, 1.4, BYTE.visor[0]);
      line(at(h, 1.5, -1), at(h, 5.5, -1), BYTE.visor[1]);
      px(h, 1.5 + (Math.floor(time / 90) % 5), -1, BYTE.visor[2]);
    }
  };


  // Bobbie Macalanger: a boxer with a big afro, red tank top, gold chain,
  // oversized gloves and bright high-top sneakers.
  const BOBBIE = {
    skin: ["#3e2418", "#7a4a30", "#a86e48"],
    afro: ["#0c0a0c", "#262024", "#3e363c"],
    top: ["#7d1d22", "#d13a2f", "#ff7550"],
    shorts: ["#141018", "#2e2834", "#4c4454"],
    glove: ["#8e1a1a", "#e0302a", "#ff8a6a"],
    white: ["#9a958c", "#f4f0e6"],
    gold: ["#a8741a", "#f1c95a", "#fff0a0"]
  };

  const bobbieParts = {
    arm(shoulder, elbow, hand, back) {
      const skin = back ? dim(BOBBIE.skin) : BOBBIE.skin;
      shaded(shoulder, elbow, 3.9, 3.1, skin);
      shaded(elbow, hand, 3.1, 2.7, skin);
      const cuff = mix(elbow, hand, 0.78);
      shaded(cuff, cuff, 3, 3, back ? dim(BOBBIE.white) : BOBBIE.white);
      shaded(hand, hand, 4.4, 4.4, back ? dim(BOBBIE.glove) : BOBBIE.glove);
    },
    leg(hip, knee, foot, back) {
      shaded(hip, mix(hip, knee, 0.72), 5.1, 4.5, back ? dim(BOBBIE.shorts) : BOBBIE.shorts);
      shaded(mix(hip, knee, 0.7), at(foot, 0, -4), 3.6, 2.8, back ? dim(BOBBIE.skin) : BOBBIE.skin);
      const white = back ? dim(BOBBIE.white) : BOBBIE.white;
      shaded(at(foot, -1, -5), at(foot, -1, -2.5), 3.1, 3.1, white);
      shaded(at(foot, -2, -1.6), at(foot, 5, -1.6), 2.6, 2.4, white);
      line(at(foot, -4, 0.6), at(foot, 7, 0.6), BOBBIE.shorts[1]);
      px(foot, 1, -3, BOBBIE.glove[1], 3);
    },
    torso(j) {
      shaded(j.hip, j.neck, 6.8, 8.2, BOBBIE.top);
      line(along(j, j.chest, -6, 2), along(j, j.hip, -5.5, 3), BOBBIE.white[1]);
      shaded(along(j, j.hip, 0, -1), along(j, j.hip, 0, 2), 6.6, 6.8, BOBBIE.shorts);
      line(along(j, j.hip, -6, 2), along(j, j.hip, 6, 2), BOBBIE.top[1]);
      line(along(j, j.neck, -2, -1.5), along(j, j.chest, 3, 2), BOBBIE.gold[1]);
      line(along(j, j.neck, 4, -1.5), along(j, j.chest, 3, 2), BOBBIE.gold[1]);
      px(along(j, j.chest, 3, 1), 0, 0, BOBBIE.gold[2], 2);
    },
    head(j) {
      const h = j.head;
      shaded(at(j.neck, 0, 1), at(h, 0.5, 4), 3.4, 3, BOBBIE.skin);
      shaded(at(h, -2, -5), at(h, -2, -5), 8.6, 8.6, BOBBIE.afro);
      shaded(at(h, 0.8, -1), at(h, 1.8, 2), 4.8, 4.2, BOBBIE.skin);
      shaded(at(h, -3, -5), at(h, 4, -5.6), 2.4, 1.9, BOBBIE.afro);
      px(h, -1, 0, BOBBIE.skin[0]);
      px(h, 2, -2, BOBBIE.afro[0], 3);
      px(h, 3, -1, BOBBIE.white[1]);
      px(h, 4, -1, BOBBIE.afro[0]);
      px(h, 2, 2, BOBBIE.white[1], 3);
      px(h, 2, 3, BOBBIE.skin[0], 3);
    }
  };

  // R.O.C.K.Y: a massive gunmetal robot bull with huge horns, a blue power
  // core, hazard stripes, a reinforced fist and a mechanical claw.
  const ROCKY = {
    steel: ["#1e2328", "#4a535c", "#8a96a0"],
    piston: ["#0e1114", "#23282e", "#4a535c"],
    blue: ["#1a6fd0", "#3fc0ff", "#c8f4ff"],
    orange: ["#a84a10", "#ff8a1e"],
    horn: ["#5a5f68", "#c2c8d0", "#f0f2f5"],
    paint: "#f4f0e6"
  };

  const rockyParts = {
    arm(shoulder, elbow, hand, back) {
      const steel = back ? dim(ROCKY.steel) : ROCKY.steel;
      shaded(shoulder, elbow, 3.2, 3, back ? dim(ROCKY.piston) : ROCKY.piston);
      shaded(mix(elbow, hand, 0.1), hand, 4.2, 4.8, steel);
      if (back) {
        line(hand, at(hand, 5, -3), ROCKY.piston[1]);
        line(hand, at(hand, 6, 0), ROCKY.piston[1]);
        line(hand, at(hand, 5, 3), ROCKY.piston[1]);
        shaded(hand, hand, 3.2, 3.2, steel);
      } else {
        shaded(hand, hand, 4.8, 4.8, steel);
        line(at(hand, 3, -3), at(hand, 3, 2), ROCKY.orange[1]);
      }
      shaded(at(shoulder, -1, 0.5), at(shoulder, 1, -0.5), 6.4, 5.8, steel);
      if (!back) {
        for (let k = -4; k <= 4; k += 3) line(at(shoulder, k, -4), at(shoulder, k + 2, -2), ROCKY.orange[1]);
        px(shoulder, -2, 1, ROCKY.paint);
        px(shoulder, 2, 1, ROCKY.paint);
        px(shoulder, -1, 3, ROCKY.paint, 3);
      }
    },
    leg(hip, knee, foot, back) {
      shaded(hip, knee, 4.4, 4, back ? dim(ROCKY.piston) : ROCKY.piston);
      shaded(knee, at(foot, 0, -4), 5.2, 4.6, back ? dim(ROCKY.steel) : ROCKY.steel);
      px(knee, 0, 0, ROCKY.blue[1], 2);
      shaded(at(foot, -4, -2), at(foot, 5, -2), 3, 3, back ? dim(ROCKY.steel) : ROCKY.steel);
      line(at(foot, -6, 0.6), at(foot, 7, 0.6), ROCKY.piston[0]);
    },
    torso(j, time) {
      shaded(along(j, j.hip, 0, 0), along(j, j.hip, 0, 6), 6.6, 6.6, ROCKY.piston);
      shaded(along(j, j.chest, 0, -1), j.neck, 8.6, 9.8, ROCKY.steel);
      line(along(j, j.chest, -7, -4), along(j, j.chest, -3, -4), ROCKY.orange[1]);
      const core = along(j, j.chest, 4, 2);
      shaded(core, core, 3.4, 3.4, [ROCKY.piston[0], ROCKY.blue[0], ROCKY.blue[1]]);
      px(core, 0, 0, Math.sin(time / 180) > 0 ? ROCKY.blue[2] : ROCKY.blue[1]);
    },
    head(j) {
      const h = j.head;
      shaded(at(j.neck, 0, 1), at(h, 0, 4), 3.2, 3, ROCKY.piston);
      const backHorn = [at(h, -3, -3), at(h, -9, -6), at(h, -9, -12), at(h, -5, -16)];
      const frontHorn = [at(h, 2, -3), at(h, 8, -6), at(h, 11, -11), at(h, 9, -16)];
      [[backHorn, dim(ROCKY.horn)], [frontHorn, ROCKY.horn]].forEach(([points, tones]) => {
        shaded(points[0], points[1], 2.8, 2.2, tones);
        shaded(points[1], points[2], 2.2, 1.6, tones);
        shaded(points[2], points[3], 1.6, 0.9, tones);
      });
      line(frontHorn[1], frontHorn[2], ROCKY.blue[1]);
      shaded(h, at(h, 1, 1.5), 5.4, 5, ROCKY.steel);
      capsule(at(h, 1.5, -0.5), at(h, 5.4, -0.5), 1.2, 1.2, ROCKY.piston[0]);
      px(h, 3, -1, ROCKY.blue[1], 2);
      line(at(h, 2, 3), at(h, 5, 3), ROCKY.piston[0]);
    }
  };

  // Ninja Main: a slim beginner in a pointed black hood and oversized mask,
  // purple outfit, a red scarf, mismatched armour and a wooden practice sword.
  const NINJA = {
    cloth: ["#100c16", "#2a2236", "#4a3d60"],
    purple: ["#2c1840", "#5a3680", "#8a62b8"],
    red: ["#5a1a22", "#a83a42", "#d0606a"],
    silver: ["#5e6670", "#b8c0c8", "#eef2f6"],
    skin: ["#8c5a3c", "#e0a77a"],
    wood: ["#5a3a1e", "#a8763e"],
    eye: "#ffffff",
    scroll: "#e8dcb0"
  };

  const ninjaParts = {
    behind(j, time) {
      capsule(along(j, j.hip, -6, 4), along(j, j.neck, -7, 7), 1.2, 1.2, NINJA.wood[1]);
      const flutter = Math.sin(time / 90) * 1.5;
      capsule(along(j, j.neck, -3, 0), at(j.neck, -14, 4 + flutter), 1.4, 0.9, NINJA.red[1]);
    },
    arm(shoulder, elbow, hand, back) {
      shaded(shoulder, elbow, 2.8, 2.4, back ? dim(NINJA.purple) : NINJA.purple);
      shaded(elbow, hand, 2.4, 2.1, back ? dim(NINJA.cloth) : NINJA.cloth);
      shaded(hand, hand, 2.1, 2.1, NINJA.skin);
      if (!back) shaded(at(shoulder, -0.5, 0), at(shoulder, 0.5, -0.5), 3.4, 3, NINJA.silver);
    },
    leg(hip, knee, foot, back) {
      shaded(hip, knee, 3.9, 3.3, back ? dim(NINJA.cloth) : NINJA.cloth);
      shaded(knee, at(foot, 0, -2.5), 3.2, 2.6, back ? dim(NINJA.purple) : NINJA.cloth);
      if (!back) shaded(at(knee, 1, 2), at(knee, 1, 6), 1.6, 1.4, NINJA.silver);
      shaded(at(foot, -1.5, -1), at(foot, 3.5, -1), 1.6, 1.4, NINJA.cloth);
    },
    torso(j) {
      shaded(j.hip, j.neck, 5.2, 6.2, NINJA.purple);
      line(along(j, j.neck, -3, -1), along(j, j.hip, 4, 3), NINJA.cloth[2]);
      shaded(along(j, j.hip, 0, 1), along(j, j.hip, 0, 2.5), 5.6, 5.6, NINJA.red);
      const scroll = along(j, j.hip, -5, 1.5);
      shaded(scroll, scroll, 1.7, 1.7, [NINJA.wood[0], NINJA.scroll]);
      px(along(j, j.hip, 3, 0), 0, 0, NINJA.silver[2]);
      px(along(j, j.hip, 4, -1), 0, 0, NINJA.red[2]);
    },
    head(j, time) {
      const h = j.head;
      shaded(at(j.neck, 0, 1), at(h, 0, 4), 2.6, 2.4, NINJA.cloth);
      capsule(at(h, -4, 0), at(h, -9, 2 + Math.sin(time / 110) * 1.2), 1, 0.8, NINJA.cloth[1]);
      shaded(at(h, -0.5, -0.5), at(h, 0.5, 1.5), 5.4, 5, NINJA.cloth);
      polygon(h, [[-5, -3], [-3, -11], [1, -5]], NINJA.cloth[1]);
      capsule(at(h, 1, -1.5), at(h, 4.6, -1.5), 1.6, 1.6, NINJA.skin[1]);
      px(h, 2, -2, NINJA.eye, 2);
      px(h, 2, -1, NINJA.eye);
      px(h, 3, -1, NINJA.cloth[0]);
      shaded(at(h, 2, 1.5), at(h, 4, 1.5), 2.4, 2.1, NINJA.purple);
      px(h, 0, -3, NINJA.wood[0]);
      px(h, -1, -4, NINJA.wood[0]);
    }
  };

  // ZOO-mbie: a hunched zombie safari guide with patchy green skin, a crooked
  // sun hat, torn khaki shirt, field vest, mismatched shoes and twigs in his hair.
  const ZOO = {
    skin: ["#2a4420", "#5e8a3a", "#93b85a"],
    rot: "#24381a",
    hair: ["#3a2a1a", "#6a4a2a"],
    leaf: "#4fa83a",
    shirt: ["#6a5a3a", "#b0a070", "#d8cc9a"],
    vest: ["#3a2a1a", "#6a4a2a", "#8a6a3e"],
    shorts: ["#4a3c22", "#7a6844"],
    boot: ["#2a1a10", "#5a3a20"],
    shoe: ["#2a2a30", "#6a6a78"],
    hat: ["#6a5a30", "#c8b480", "#e8dcb0"],
    eyeYellow: "#e8e070",
    eyeOrange: "#ff8a1e",
    teeth: "#e8e0c0",
    bone: "#d8d0b8"
  };

  const zoombieParts = {
    arm(shoulder, elbow, hand, back) {
      const skin = back ? dim(ZOO.skin) : ZOO.skin;
      shaded(shoulder, mix(shoulder, elbow, 0.5), 3.3, 3.1, back ? dim(ZOO.shirt) : ZOO.shirt);
      shaded(mix(shoulder, elbow, 0.5), elbow, 2.5, 2.3, skin);
      shaded(elbow, hand, 2.3, 2.1, skin);
      px(mix(elbow, hand, 0.5), 0, 0, ZOO.rot);
      shaded(hand, hand, 3.6, 3.6, skin);
      line(hand, at(hand, 1, 4), ZOO.skin[0]);
      line(at(hand, 2, 0), at(hand, 3, 4), ZOO.skin[0]);
    },
    leg(hip, knee, foot, back) {
      shaded(hip, mix(hip, knee, 0.8), 4.5, 4.1, back ? dim(ZOO.shorts) : ZOO.shorts);
      shaded(mix(hip, knee, 0.75), at(foot, 0, -3), 2.8, 2.4, back ? dim(ZOO.skin) : ZOO.skin);
      if (back) {
        shaded(at(foot, -1.5, -1.2), at(foot, 4, -1.2), 1.8, 1.6, ZOO.shoe);
      } else {
        shaded(at(foot, -1, -4), at(foot, -1, -2), 2.6, 2.6, ZOO.boot);
        shaded(at(foot, -2, -1.5), at(foot, 4, -1.5), 2.4, 2.1, ZOO.boot);
      }
    },
    torso(j) {
      shaded(j.hip, j.neck, 6, 7, ZOO.shirt);
      shaded(along(j, j.hip, -2.5, 2), along(j, j.neck, -2.5, -2), 5, 5.4, ZOO.vest);
      px(along(j, j.hip, 5, 1), 0, 0, ZOO.skin[1], 2);
      px(along(j, j.chest, 4, 1), 0, 0, ZOO.hat[2], 2);
      line(along(j, j.hip, 3, 3), along(j, j.chest, 5, 0), ZOO.leaf);
      const binoculars = along(j, j.chest, 6, -3);
      shaded(binoculars, binoculars, 1.6, 1.6, ZOO.shoe);
    },
    head(j) {
      const h = j.head;
      shaded(at(j.neck, 0, 1), at(h, 0.5, 4), 2.7, 2.5, ZOO.skin);
      shaded(at(h, 0.5, -0.5), at(h, 1.5, 2.5), 5, 4.4, ZOO.skin);
      px(h, -1, 2, ZOO.rot, 2);
      px(h, 4, 1, ZOO.bone);
      shaded(at(h, -2.5, -3), at(h, 1, -4.5), 3.7, 3.1, ZOO.hair);
      px(h, -4, -5, ZOO.leaf);
      line(at(h, -7, -5), at(h, 7, -7.5), ZOO.hat[0]);
      line(at(h, -7, -6), at(h, 7, -8.5), ZOO.hat[1]);
      shaded(at(h, -2, -9), at(h, 2, -10), 2.9, 2.6, ZOO.hat);
      line(at(h, -4, -8), at(h, 4, -9), ZOO.hat[0]);
      px(h, 2, -1, ZOO.eyeYellow);
      px(h, 2, -2, ZOO.skin[0]);
      px(h, 4, -1, ZOO.eyeOrange);
      px(h, 2, 2, ZOO.teeth, 3);
      px(h, 3, 2, ZOO.skin[0]);
      px(h, 2, 3, ZOO.skin[0], 2);
    }
  };

  function paletteOf(look) {
    const colors = new Set();
    Object.values(look).flat().forEach(color => colors.add(color));
    return [...colors].map(hexToRgb);
  }
  const FIGHTERS = {
    rook: { parts: rookParts, palette: paletteOf(ROOK) },
    byte: { parts: byteParts, palette: paletteOf(BYTE) },
    bobbie: { parts: bobbieParts, palette: paletteOf(BOBBIE) },
    rocky: { parts: rockyParts, palette: paletteOf(ROCKY) },
    ninja: { parts: ninjaParts, palette: paletteOf(NINJA) },
    zoombie: { parts: zoombieParts, palette: paletteOf(ZOO) }
  };

  // Snaps the anti-aliased drawing to the palette and adds a 1px outline.
  function pixelate(palette, flash) {
    const image = sg.getImageData(0, 0, SPRITE_W, SPRITE_H);
    const data = image.data;
    const solid = new Uint8Array(SPRITE_W * SPRITE_H);
    for (let p = 0; p < solid.length; p += 1) {
      const i = p * 4;
      if (data[i + 3] < 120) {
        data[i + 3] = 0;
        continue;
      }
      solid[p] = 1;
      let best = palette[0];
      let bestDistance = Infinity;
      for (const color of palette) {
        const distance = (data[i] - color[0]) ** 2 + (data[i + 1] - color[1]) ** 2 + (data[i + 2] - color[2]) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = color;
        }
      }
      if (flash) best = best.map((channel, index) => Math.round((channel + FLASH[index]) / 2));
      data[i] = best[0];
      data[i + 1] = best[1];
      data[i + 2] = best[2];
      data[i + 3] = 255;
    }
    for (let y = 0; y < SPRITE_H; y += 1) {
      for (let x = 0; x < SPRITE_W; x += 1) {
        const p = y * SPRITE_W + x;
        if (solid[p]) continue;
        const edge = (x > 0 && solid[p - 1]) || (x < SPRITE_W - 1 && solid[p + 1]) || (y > 0 && solid[p - SPRITE_W]) || (y < SPRITE_H - 1 && solid[p + SPRITE_W]);
        if (!edge) continue;
        const i = p * 4;
        data[i] = OUTLINE[0];
        data[i + 1] = OUTLINE[1];
        data[i + 2] = OUTLINE[2];
        data[i + 3] = 255;
      }
    }
    sg.putImageData(image, 0, 0);
  }


  function renderSprite(id, pose, now, flash) {
    const { parts, palette } = FIGHTERS[id];
    const j = joints(pose, SCALES[id] || 1);
    sg.clearRect(0, 0, SPRITE_W, SPRITE_H);
    if (parts.behind) parts.behind(j, now);
    parts.arm(j.bShoulder, j.bElbow, j.bHand, true);
    parts.leg(j.bHip, j.bKnee, j.bFoot, true);
    parts.torso(j, now);
    parts.leg(j.fHip, j.fKnee, j.fFoot, false);
    parts.head(j, now);
    parts.arm(j.fShoulder, j.fElbow, j.fHand, false);
    pixelate(palette, flash);
  }

  function blitSprite(x, y, dir, alpha = 1) {
    g.save();
    g.globalAlpha = alpha;
    g.translate(Math.round(x) + (dir < 0 ? FOOT_X : -FOOT_X), Math.round(y) - FOOT_Y);
    if (dir < 0) g.scale(-1, 1);
    g.drawImage(sprite, 0, 0);
    g.restore();
  }

  function drawFighterSprite(frame, now, floorY) {
    if (frame.alpha <= 0) return;
    renderSprite(frame.id, frame.pose, now, frame.flash);
    for (let k = frame.ghosts; k > 0; k -= 1) blitSprite(frame.x + frame.dir * k * 9, floorY - frame.lift, frame.dir, 0.22);
    blitSprite(frame.x, floorY - frame.lift, frame.dir, frame.alpha);
  }

  // ---------------------------------------------------------------------------
  // Move animations. `lead` is the time in ms from wind-up to contact; every
  // strike in a round is timed to land at the same moment.
  const ANIMS = {
    punch: { lead: 140, melee: "attack", reach: 31 },
    combo: { lead: 140, melee: "attack", reach: 31, flurry: true },
    uppercut: { lead: 380, melee: "uppercut", windup: "crouch", reach: 16 },
    rush: { lead: 260, melee: "ram", windup: "crouch", reach: 21 },
    overdrive: { lead: 460, melee: "ram", windup: "fortress", reach: 21 },
    swing: { lead: 220, melee: "swing", windup: "swingBack", reach: 30 },
    shuffle: { lead: 260, melee: "attack", reach: 28, jerky: true },
    fireball: { lead: 390, projectile: "fire" },
    plasma: { lead: 390, projectile: "plasma" },
    shuriken: { lead: 330, projectile: "shuriken" },
    stampede: { lead: 640, projectile: "stampede" },
    vanish: { lead: 560, vanish: true, reach: 31 },
    block: {},
    dash: {},
    fortress: {},
    smoke: {},
    senses: {}
  };
  const SIDES = ["player", "bot"];
  const LANDED = ["hit", "broke", "chipped", "armored"];
  // Rounds play out one fighter at a time, slowed down so each move reads clearly.
  const SLOW = 1.8;

  function opposite(side) {
    return side === "player" ? "bot" : "player";
  }

  function isStrikeMove(move) {
    return (move.damage || 0) > 0;
  }

  // The round's script: set-up moves (guards, senses) go first, then strikes;
  // ties go to the player. Times are in ms from the start of the round.
  function timing(report, ids) {
    const order = SIDES.slice().sort((a, b) => Number(isStrikeMove(report[a].move)) - Number(isStrikeMove(report[b].move)));
    const phases = [];
    let cursor = 0;
    order.forEach(actor => {
      const move = report[actor].move;
      const strike = isStrikeMove(move);
      const lead = strike ? Math.max(150, ANIMS[move.anim].lead + 10) : 320;
      const hold = strike ? (move.anim === "stampede" ? 900 : 720) : 620;
      const start = cursor;
      const hit = start + lead * SLOW;
      cursor = hit + hold * SLOW;
      phases.push({ actor, start, hit, end: cursor, lead, strike });
    });
    const gap = BOT_X - PLAYER_X;
    const lunge = {};
    SIDES.forEach(side => { lunge[side] = gap - 10 - (ANIMS[report[side].move.anim].reach || 0) * (SCALES[ids[side]] || 1); });
    return { phases, end: cursor, lunge, gap, koAt: phases[1].hit + 300 * SLOW };
  }

  // A phase's local clock: `e` runs in unslowed animation time and `H` is when its move connects.
  function clockFor(plan, side, elapsed) {
    const p = plan.phases.find(candidate => candidate.actor === side);
    return { e: (elapsed - p.start) / SLOW, H: p.lead, active: elapsed >= p.start && elapsed < p.end, phase: p };
  }

  // The fighter performing its own move.
  function actMotion(frame, mine, plan, c, idle) {
    const anim = ANIMS[mine.move.anim];
    const { e, H } = c;
    const start = H - (anim.lead || 0);
    const scale = frame.scale;
    let pose = idle;
    let offset = 0;

    if (anim.melee) {
      if (anim.windup) pose = blend(idle, POSES[anim.windup], phase(e, start, H - 130) * (1 - phase(e, H - 130, H - 60)));
      const hold = anim.flurry ? 260 : 140;
      const t = phase(e, H - 130, H - 10) * (1 - phase(e, H + hold, H + hold + 280));
      pose = blend(pose, POSES[anim.melee], t);
      if (anim.flurry && e >= H && e < H + 260) pose = blend(pose, Math.floor((e - H) / 100) % 2 ? POSES.jab : POSES.attack, t);
      offset = plan.lunge[frame.side] * t;
      if (anim.jerky && e < H) offset += Math.round(Math.sin(e / 35) * 3) * t;
    } else if (anim.projectile === "stampede") {
      pose = blend(idle, POSES.roar, phase(e, start, start + 200) * (1 - phase(e, H + 250, H + 500)));
    } else if (anim.projectile === "shuriken") {
      const release = start + anim.lead * 0.55;
      pose = blend(blend(idle, POSES.charge, phase(e, start, release - 60)), POSES.throw, phase(e, release - 60, release));
      pose = blend(pose, idle, phase(e, H + 150, H + 400));
    } else if (anim.projectile) {
      pose = blend(blend(idle, POSES.charge, phase(e, start, start + 170)), POSES.release, phase(e, start + 170, start + 240));
      pose = blend(pose, idle, phase(e, H + 170, H + 430));
    } else if (anim.vanish) {
      const flourish = phase(e, start, start + 150) * (1 - phase(e, start + 260, start + 300));
      pose = shift(blend(idle, POSES.flourish, flourish), UPPER_BODY, flourish > 0.9 ? Math.round(Math.sin(e / 40)) : 0, 0);
      const hidden = (e >= start + 280 && e < H - 120) || (e >= H + 220 && e < H + 330);
      if (hidden) frame.alpha = mine.spotted ? (Math.floor(e / 60) % 2 ? 0.75 : 0.35) : 0;
      if (e >= H - 120 && e < H + 220) {
        pose = blend(idle, POSES.attack, phase(e, H - 120, H - 10));
        offset = plan.gap - (anim.reach * scale + 12);
      }
    } else {
      ({ pose, offset } = guardMotion(frame, mine.move, c, idle));
    }

    // Shadow Step's counter-slash catches the attacker in its own phase.
    if (mine.counter > 0) {
      const recoil = phase(e, H + 150, H + 200) * (1 - phase(e, H + 350, H + 550));
      pose = blend(pose, POSES.hurt, recoil);
      offset -= 6 * recoil;
      if (e >= H + 150 && e < H + 200) frame.flash = true;
    }
    return { pose, offset };
  }

  // Guard poses, used both to set a guard up and to answer a strike.
  function guardMotion(frame, move, c, idle) {
    const { e, H } = c;
    let pose = idle;
    let offset = 0;
    if (move.guard === "block") {
      pose = blend(idle, POSES.block, phase(e, H - 150, H - 50) * (1 - phase(e, H + 280, H + 480)));
    } else if (move.anim === "dash") {
      const t = phase(e, H - 130, H - 40) * (1 - phase(e, H + 180, H + 420));
      pose = blend(idle, POSES.dodge, t);
      offset = -24 * t;
      frame.lift = Math.round(Math.sin(clamp01((e - (H - 130)) / 260) * Math.PI) * 6);
      if (t > 0.1 && t < 0.95 && e < H + 100) frame.ghosts = 2;
    } else if (move.anim === "fortress") {
      pose = blend(idle, POSES.fortress, phase(e, H - 220, H - 90) * (1 - phase(e, H + 420, H + 640)));
    } else if (move.anim === "smoke") {
      pose = blend(idle, POSES.smoke, phase(e, H - 240, H - 150) * (1 - phase(e, H + 300, H + 500)));
      if (e >= H - 150 && e < H + 300) frame.alpha = Math.floor(e / 70) % 2 ? 0.45 : 0.2;
      offset = -10 * phase(e, H - 150, H) * (1 - phase(e, H + 300, H + 500));
    } else if (move.anim === "senses") {
      pose = blend(idle, POSES.senses, phase(e, H - 220, H - 120) * (1 - phase(e, H + 320, H + 520)));
    }
    return { pose, offset };
  }

  // The fighter on the receiving end of the opponent's strike.
  function reactMotion(frame, mine, theirs, plan, c, idle, dead) {
    const { e, H } = c;
    let pose = idle;
    let offset = 0;
    const guard = mine.move.guard;
    if (guard && guard !== "shuffle" && guard !== "vanish") ({ pose, offset } = guardMotion(frame, mine.move, c, idle));
    if (guard === "vanish" && theirs.result === "evaded" && e >= H - 70 && e < H + 200) frame.alpha = 0;
    if (guard === "shuffle" && theirs.result === "evaded") offset -= 12 * phase(e, H - 60, H) * (1 - phase(e, H + 200, H + 400));
    if (mine.move.anim === "dash" && theirs.result === "evaded" && theirs.counter > 0) {
      const counter = phase(e, H + 60, H + 140) * (1 - phase(e, H + 260, H + 450));
      pose = blend(pose, POSES.attack, counter);
      offset += (plan.gap - 31 * frame.scale - 12 + 24) * counter;
    }
    if (mine.move.guard === "block" && (theirs.result === "blocked" || theirs.result === "chipped")) {
      offset -= 4 * phase(e, H, H + 40) * (1 - phase(e, H + 120, H + 400));
    }

    if (LANDED.includes(theirs.result) && theirs.damage > 0) {
      const weight = theirs.result === "armored" ? 0.35 : 1;
      const recoil = phase(e, H, H + 50) * (dead ? 1 : 1 - phase(e, H + 260, H + 480)) * weight;
      pose = blend(pose, POSES.hurt, recoil);
      offset -= 7 * recoil;
      const spacing = theirs.move.anim === "stampede" ? 70 : 100;
      for (let k = 0; k < (theirs.landed || 1); k += 1) if (e >= H + k * spacing && e < H + k * spacing + 50) frame.flash = true;
      if (theirs.move.anim === "uppercut") frame.lift += Math.round(18 * Math.sin(clamp01((e - H) / 460) * Math.PI));
    }
    return { pose, offset };
  }

  function fighterFrame(side, state, animation, plan, elapsed, now) {
    const fighter = state[side];
    const id = fighter.id;
    const dir = side === "player" ? 1 : -1;
    const baseX = side === "player" ? PLAYER_X : BOT_X;
    const scale = SCALES[id] || 1;
    const idle = idlePose(id, now, side);
    const frame = { side, id, dir, x: baseX, lift: 0, pose: idle, flash: false, alpha: 1, ghosts: 0, scale };
    if (!animation) return frame;

    const mine = animation.report[side];
    const theirs = animation.report[opposite(side)];
    const own = clockFor(plan, side, elapsed);
    const other = clockFor(plan, opposite(side), elapsed);
    const dead = state.finished && fighter.hp <= 0;
    let motion = { pose: idle, offset: 0 };
    if (own.active) motion = actMotion(frame, mine, plan, own, idle);
    else if (other.active) motion = reactMotion(frame, mine, theirs, plan, other, idle, dead);
    else if (dead && elapsed >= plan.end) motion = { pose: POSES.hurt, offset: -7 };
    let { pose, offset } = motion;

    if (dead) {
      const fall = phase(elapsed, plan.koAt, plan.koAt + 300 * SLOW);
      pose = blend(pose, POSES.ko, fall);
      offset -= 16 * fall;
      frame.alpha = Math.max(frame.alpha, fall);
      frame.down = fall > 0.5;
    } else if (state.finished) {
      const win = phase(elapsed, plan.koAt + 700 * SLOW, plan.koAt + 950 * SLOW);
      pose = blend(pose, victoryPose(id, now), win);
      if (win > 0) frame.alpha = Math.max(frame.alpha, win);
    }

    frame.pose = pose;
    frame.x = baseX + dir * offset;
    return frame;
  }

  // ---------------------------------------------------------------------------
  // Effects.
  function drawShadow(x, floorY, scale) {
    g.globalAlpha = 0.45;
    [[18, 0], [24, 1], [18, 2]].forEach(([width, dy]) => rect(g, x - (width * scale) / 2, floorY - 1 + dy, Math.round(width * scale), 1, "#0a0814"));
    g.globalAlpha = 1;
  }

  function drawBoost(frame, now, floorY) {
    for (let k = 0; k < 6; k += 1) {
      const rise = (now / 700 + k / 6) % 1;
      const ox = Math.round(Math.sin(k * 2.4 + now / 300) * 13);
      rect(g, frame.x + ox, floorY - 6 - rise * 56, 1, 2, k % 2 ? "#eaff7a" : "#fff6c8");
    }
  }

  function puff(x, y, radius, alpha) {
    g.globalAlpha = alpha;
    disc(g, x, y, radius, "#8a8498");
    disc(g, x - 1, y - 1, Math.max(1, radius - 2), "#c4bece");
    g.globalAlpha = 1;
  }

  // Character flavour that plays all the time: R.O.C.K.Y vents steam, a fly
  // circles ZOO-mbie's head.
  function drawAmbient(frame, now, floorY) {
    if (frame.alpha <= 0 || frame.down) return;
    const headY = floorY - frame.lift - 58 * frame.scale;
    if (frame.id === "rocky") {
      const cycle = now % 2600;
      if (cycle < 700) for (let k = 0; k < 3; k += 1) puff(frame.x - frame.dir * (8 + k * 2), headY + 8 - cycle / 35 - k * 4, 2 + k, 0.5 - cycle / 1600);
    }
    if (frame.id === "zoombie") {
      const fx = frame.x + frame.dir * 2 + Math.sin(now / 170) * 9;
      const fy = headY - 8 + Math.cos(now / 130) * 4;
      rect(g, fx, fy, 1, 1, "#140e16");
      if (Math.floor(now / 40) % 2) rect(g, fx - 1, fy - 1, 3, 1, "#c8d0d8");
    }
  }

  function drawProjectile(kind, x, y, dir, now) {
    if (kind === "fire") {
      const flicker = Math.floor(now / 50) % 2;
      disc(g, x - dir * 8, y, 2, "#c8402a");
      disc(g, x - dir * 4, y, 3, "#ff7a3a");
      disc(g, x, y, 5 + flicker, "#ff7a3a");
      disc(g, x, y, 4, "#ffd36b");
      disc(g, x + dir, y, 2, "#ffffff");
    } else if (kind === "plasma") {
      const tail = x - dir * 14;
      const left = Math.min(tail, x);
      rect(g, left, y - 2, 15, 5, "#2f9a74");
      rect(g, left, y - 1, 15, 3, "#c2f078");
      rect(g, left, y, 15, 1, "#ffffff");
      disc(g, x, y, 3, "#c2f078");
      disc(g, x, y, 1, "#ffffff");
      for (let k = 0; k < 3; k += 1) rect(g, x - dir * (19 + k * 5), y - 2 + k * 2, 3, 1, "#7fdca4");
    } else if (kind === "star") {
      const spin = Math.floor(now / 45) % 2;
      const arms = spin ? [[0, -2], [0, 2], [-2, 0], [2, 0]] : [[-2, -2], [2, 2], [-2, 2], [2, -2]];
      arms.forEach(([dx, dy]) => rect(g, x + dx / 2, y + dy / 2, 1, 1, "#b8c0c8"));
      arms.forEach(([dx, dy]) => rect(g, x + dx, y + dy, 1, 1, "#5e6670"));
      rect(g, x, y, 1, 1, "#eef2f6");
    }
  }

  // Infected wildlife: boar, rhino, gazelle and hyena silhouettes with glowing eyes.
  function drawAnimal(kind, x, y, dir, now) {
    const shapes = { boar: [7, 3, 4], rhino: [9, 4, 4], gazelle: [6, 2, 6], hyena: [7, 3, 5] };
    const [rx, ry, legs] = shapes[kind];
    const bodyY = y - legs - ry;
    const step = Math.floor(now / 70) % 2;
    [[-rx + 2, step], [-rx + 4, 1 - step], [rx - 3, 1 - step], [rx - 1, step]].forEach(([lx, phaseOffset]) => {
      rect(g, x + dir * lx, bodyY + ry, 1, legs - phaseOffset, "#14200f");
    });
    for (let dy = -ry; dy <= ry; dy += 1) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / (ry + 0.5)) ** 2));
      rect(g, x - half, bodyY + dy, half * 2 + 1, 1, dy < 0 ? "#3e6a2a" : "#1e3018");
    }
    const headX = x + dir * (rx + 2);
    const headY = kind === "gazelle" ? bodyY - 4 : bodyY - 1;
    disc(g, headX, headY, kind === "rhino" ? 3 : 2, "#1e3018");
    rect(g, headX + dir, headY - 1, 1, 1, "#a8ff60");
    if (kind === "rhino") rect(g, headX + dir * 3, headY - 3, 1, 3, "#d8d0b8");
    if (kind === "boar") rect(g, headX + dir * 2, headY + 1, 1, 1, "#d8d0b8");
    if (kind === "gazelle") {
      rect(g, headX - dir, headY - 5, 1, 4, "#d8d0b8");
      rect(g, headX, headY - 6, 1, 4, "#d8d0b8");
    }
  }

  function drawSpark(x, y, age, colors, size = 1) {
    const frame = Math.min(2, Math.floor(age / 60));
    const reach = [5, 9, 12][frame] * size;
    for (let k = 0; k < 8; k += 1) {
      const angle = k * Math.PI / 4 + 0.3;
      const length = reach * (k % 2 ? 0.55 : 1);
      for (let s = frame; s <= length; s += 1) {
        rect(g, x + Math.cos(angle) * s, y + Math.sin(angle) * s, 1, 1, s > length * 0.6 ? colors[0] : colors[1]);
      }
    }
    disc(g, x, y, Math.max(1, Math.round([3, 2, 1][frame] * size)), colors[2]);
  }

  const HIT_COLORS = ["#ff7a2a", "#ffe36a", "#ffffff"];
  const GUARD_COLORS = ["#3a8cff", "#9fe8ff", "#ffffff"];

  // Effects for `side`'s move. In "act" mode the move is being performed in its
  // own phase; in "react" mode a guard is answering the opponent's strike.
  function drawMoveEffects(side, frames, animation, clock, now, floorY, mode) {
    const mine = animation.report[side];
    const theirs = animation.report[opposite(side)];
    const me = frames[side];
    const anim = ANIMS[mine.move.anim];
    const dir = me.dir;
    const H = clock.H;
    const e = clock.e;

    if (mode === "act") drawStrikeEffects(side, frames, animation, clock, now, floorY);
    if (mode === "react" && mine.move.guard === "vanish" && theirs.result === "evaded") {
      const age = e - (H - 70);
      if (age >= 0 && age < 220) {
        for (let k = 0; k < 5; k += 1) puff(me.x + Math.cos(k * 1.3) * (4 + age / 25), floorY - 26 - Math.sin(k * 1.3) * (6 + age / 30), 3, 0.7 - age / 320);
      }
    }

    // Guards, shown when set up and again when they answer a strike.
    if (mine.move.anim === "smoke" && e >= H - 160 && e < H + 420) {
      const age = e - (H - 160);
      for (let k = 0; k < 9; k += 1) {
        const angle = k * 0.7;
        const radius = 4 + Math.min(14, age / 18) + (k % 3) * 2;
        puff(me.x + Math.cos(angle) * radius, floorY - 26 + Math.sin(angle) * radius * 0.8 - age / 60, 4 + (k % 3), Math.min(0.9, 1.1 - age / 520));
      }
    }
    if (mine.move.anim === "fortress" && e >= H - 90 && e < H + 420) {
      const x = me.x + dir * 17;
      const top = floorY - 62 * me.scale;
      g.globalAlpha = 0.35 + (Math.floor(e / 80) % 2) * 0.2;
      for (let y = top; y < floorY - 4; y += 2) rect(g, x + Math.round(Math.sin(y / 5) * 1.5), y, 2, 1, "#3fc0ff");
      rect(g, x - 1, top, 4, 1, "#c8f4ff");
      g.globalAlpha = 1;
    }
  }

  function drawStrikeEffects(side, frames, animation, clock, now, floorY) {
    const mine = animation.report[side];
    const me = frames[side];
    const target = frames[opposite(side)];
    const anim = ANIMS[mine.move.anim];
    const dir = me.dir;
    const H = clock.H;
    const start = H - (anim.lead || 0);
    const e = clock.e;
    const fromX = side === "player" ? PLAYER_X : BOT_X;
    const toX = side === "player" ? BOT_X : PLAYER_X;
    const chestY = floorY - 38 * me.scale;

    // Wind-up and travel.
    if (anim.projectile === "fire" || anim.projectile === "plasma") {
      if (e >= start && e < start + 240) {
        const radius = 20 * (1 - (e - start) / 240);
        const colors = anim.projectile === "fire" ? ["#ffd36b", "#ffffff"] : ["#c2f078", "#ffffff"];
        for (let k = 0; k < 10; k += 1) {
          const angle = k * 0.63 + e / 90;
          rect(g, me.x - dir * 8 + Math.cos(angle) * radius, chestY + 7 + Math.sin(angle) * radius * 0.7, 1, 1, colors[k % 2]);
        }
      }
      const travel = (e - (start + 230)) / (H - start - 230);
      if (travel >= 0 && travel < 1) {
        const startX = fromX + dir * 28;
        const endX = toX - dir * 8;
        drawProjectile(anim.projectile, startX + (endX - startX) * travel, chestY, dir, now);
      }
    }
    if (anim.projectile === "shuriken") {
      const release = start + anim.lead * 0.55;
      [-5, 0, 4].forEach((lane, k) => {
        const t = (e - release - k * 25) / (H - release);
        if (t < 0) return;
        const hits = k < mine.landed && !["evaded", "missed"].includes(mine.result);
        if (hits && t >= 1) return;
        const startX = fromX + dir * 26;
        const endX = toX - dir * 6;
        const x = startX + (endX - startX) * t;
        if ((x - fromX) * dir > 330) return;
        drawProjectile("star", x, chestY - 10 + lane + (hits ? 0 : lane * t * 2), dir, now);
      });
    }
    if (anim.projectile === "stampede") {
      const kinds = ["boar", "rhino", "gazelle", "hyena"];
      kinds.forEach((kind, k) => {
        const leave = start + 250 + k * 70;
        const arrive = H + k * 70;
        if (e < leave) return;
        const t = (e - leave) / (arrive - leave);
        const x = fromX + dir * (10 + (toX - fromX) * dir * t);
        if ((x - fromX) * dir > 340) return;
        drawAnimal(kind, x, floorY + 1 - (k % 2) * 3, dir, now + k * 35);
        if (k % 2 === 0) puff(x - dir * 10, floorY - 2, 2, 0.35);
      });
    }
    if (anim.melee === "ram" && e >= H - 130 && e < H) {
      for (let k = 0; k < 3; k += 1) puff(me.x - dir * (10 + k * 6), floorY - 2 - k, 2 + k, 0.4);
    }
    if (mine.move.anim === "overdrive" && e >= start && e < H + 120) {
      for (let k = 0; k < 7; k += 1) {
        const angle = k * 0.9 + e / 70;
        const radius = 18 + Math.sin(e / 40 + k) * 3;
        const x = me.x + Math.cos(angle) * radius * 0.7;
        const y = floorY - 34 * me.scale + Math.sin(angle) * radius;
        rect(g, x, y, 2, 1, k % 2 ? "#3fc0ff" : "#c8f4ff");
        rect(g, x + 1, y + 1, 1, 1, "#1a6fd0");
      }
    }
    if (mine.move.anim === "uppercut" && e >= H - 40 && e < H + 160) {
      for (let k = 0; k < 10; k += 1) rect(g, me.x + dir * 15 + (k % 3) - 1, floorY - me.lift - 40 - k * 3, 1, 2, k % 2 ? "#ffe36a" : "#ffffff");
    }
    if (anim.vanish) {
      [start + 270, H - 130, H + 210].forEach(at => {
        const age = e - at;
        if (age < 0 || age > 220) return;
        const x = at === start + 270 ? fromX : me.x;
        for (let k = 0; k < 5; k += 1) puff(x + Math.cos(k * 1.3) * (4 + age / 25), floorY - 26 - Math.sin(k * 1.3) * (6 + age / 30), 3, 0.7 - age / 320);
      });
    }

    if (mine.move.anim === "senses" && e >= H - 160 && e < H + 500) {
      const eyeX = me.x + dir * 8;
      const eyeY = floorY - 56 * me.scale;
      for (let ring = 0; ring < 3; ring += 1) {
        const radius = ((e - (H - 160)) / 5 + ring * 16) % 48;
        for (let a = -0.5; a <= 0.5; a += 0.12) rect(g, eyeX + dir * Math.cos(a) * radius, eyeY + Math.sin(a) * radius, 1, 1, "#e8e070");
      }
      if (e > H) text(g, "!", target.x - 1, floorY - 74 * target.scale, () => "#ffe36a", 2);
    }

    // Contact.
    const age = e - H;
    if (age >= 0 && age < 420) {
      const contactX = toX - dir * 10;
      const contactY = floorY - 44 * target.scale;
      if (mine.result === "blocked" && age < 180) drawSpark(contactX, contactY - 6, age, GUARD_COLORS);
      if (mine.result === "armored" && age < 180) drawSpark(target.x + dir * -14, contactY, age, GUARD_COLORS, 0.7);
      if (["hit", "broke", "chipped"].includes(mine.result)) {
        const multi = mine.move.anim === "combo" || mine.move.anim === "stampede" || mine.move.anim === "shuriken";
        const spacing = mine.move.anim === "stampede" ? 70 : 100;
        const count = multi ? mine.landed : 1;
        for (let k = 0; k < count; k += 1) {
          const local = age - k * spacing;
          if (local >= 0 && local < 180) drawSpark(contactX + (k % 2) * 3 * dir, contactY + (k - 1) * 4 + (mine.move.anim === "stampede" ? 30 : 0), local, mine.result === "chipped" ? GUARD_COLORS : HIT_COLORS, multi ? 0.75 : 1);
        }
      }
    }
    if (mine.counter > 0) {
      const local = e - H - 150;
      if (local >= 0 && local < 180) drawSpark(me.x + dir * 6, floorY - 44 * me.scale, local, ["#c8d0ff", "#ffffff", "#ffffff"], 0.8);
    }
  }

  // ---------------------------------------------------------------------------
  // Floating text: the move name over each fighter, then the result.
  function outlinedText(string, centerX, y, color, scale = 1) {
    const width = string.length * 4 * scale - scale;
    const left = Math.round(centerX - width / 2);
    [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]].forEach(([dx, dy]) => text(g, string, left + dx, y + dy, () => "#140e16", scale));
    text(g, string, left, y, typeof color === "function" ? color : () => color, scale);
  }

  function resultLabel(outcome) {
    switch (outcome.result) {
      case "hit": return [`-${outcome.damage}`, "#ffe36a"];
      case "broke": return [`BREAK -${outcome.damage}`, "#ff9a4a"];
      case "chipped": return [`CHIP -${outcome.damage}`, "#9fe8ff"];
      case "armored": return [`ARMOR -${outcome.damage}`, "#9fe8ff"];
      case "blocked": return ["BLOCK", "#9fe8ff"];
      case "evaded": return ["EVADE", "#ffffff"];
      case "missed": return ["MISS", "#c8c2d0"];
      default: return null;
    }
  }

  // The acting fighter's move name, large across the top, then the result over the target.
  function drawCallouts(frames, animation, plan, elapsed, floorY) {
    plan.phases.forEach(p => {
      const side = p.actor;
      const mine = animation.report[side];
      const c = clockFor(plan, side, elapsed);
      const shown = elapsed - p.start;
      const color = Rules.character(frames[side].id).color;
      if (shown >= 0 && shown < Math.min(p.end - p.start, 1500)) outlinedText(mine.move.name.toUpperCase(), 160, 24, color, 2);
      if (mine.spotted && c.e > c.H - 280 && c.e < c.H + 600) outlinedText("SPOTTED!", side === "player" ? PLAYER_X : BOT_X, 36, "#ff9a4a");

      const label = resultLabel(mine);
      const age = elapsed - p.hit;
      if (label && age >= 0 && age < 1200) {
        const target = frames[opposite(side)];
        const targetX = side === "player" ? BOT_X : PLAYER_X;
        outlinedText(label[0], targetX, floorY - 40 * target.scale - age / 90, label[1], 2);
      }
      const counterAge = age - 150 * SLOW;
      if (mine.counter > 0 && counterAge >= 0 && counterAge < 1200) {
        outlinedText(`COUNTER -${mine.counter}`, frames[side].x, floorY - 40 * frames[side].scale - counterAge / 90, "#c8d0ff");
      }
    });
  }

  // Safari Senses: the CPU's next move hangs over its head in rotten, dripping letters.
  function drawReveal(state, frames, now, floorY) {
    const move = Rules.move(state.bot, state.revealed);
    const label = move.name.toUpperCase();
    const scale = 2;
    const width = label.length * 4 * scale - scale;
    const left = Math.round(Math.max(4 + width / 2, Math.min(WIDTH - 4 - width / 2, frames.bot.x)) - width / 2);
    const top = Math.max(30, Math.round(floorY - 92 * frames.bot.scale));
    const wobble = Math.round(Math.sin(now / 260));
    outlinedText("NEXT MOVE", left + width / 2, top - 9, "#c8e85a");
    const rot = row => (row < 1 ? "#d8f07a" : row < 3 ? "#8ab83a" : "#4a6a22");
    [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]].forEach(([dx, dy]) => text(g, label, left + dx, top + wobble + dy, () => "#140e16", scale));
    text(g, label, left, top + wobble, rot, scale);
    for (let i = 0; i < label.length; i += 1) {
      if (label[i] === " " || (i * 7) % 3 === 0) continue;
      const x = left + i * 4 * scale + ((i * 5) % 3) * scale;
      const length = Math.floor(((now / 420 + i * 0.37) % 1) * 6);
      rect(g, x, top + wobble + 5 * scale, 1, length, "#6a9a2a");
      rect(g, x, top + wobble + 5 * scale + length, 1, 1, "#a8d040");
    }
  }

  function drawKO(elapsed, koAt) {
    const shown = elapsed - koAt;
    if (shown < 0 || (shown < 1200 && Math.floor(shown / 160) % 2)) return;
    const shade = row => (row < 2 ? "#fff3a0" : row < 4 ? "#ffb43a" : "#e8402a");
    [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]].forEach(([dx, dy]) => text(g, "K.O.", 136 + dx, 40 + dy, () => "#140e16", 3));
    text(g, "K.O.", 136, 40, shade, 3);
  }

  // ---------------------------------------------------------------------------
  const STAGE_KIT = { rect, disc, text, seeded, WIDTH, HEIGHT };
  const stageCache = {};

  function drawStage(stageId, now, excitement) {
    const stage = Stages[stageId] || Stages.rook;
    if (!stageCache[stageId]) {
      const canvas = makeCanvas(WIDTH, HEIGHT);
      stage.build(canvas.getContext("2d"), STAGE_KIT);
      stageCache[stageId] = canvas;
    }
    g.drawImage(stageCache[stageId], 0, 0);
    stage.animate(g, STAGE_KIT, now, excitement);
    g.globalAlpha = 1;
  }

  function draw(context, state, animation, now) {
    const floorY = wideLayout.matches ? 92 : 126;
    const ids = { player: state.player.id, bot: state.bot.id };
    const plan = animation ? timing(animation.report, ids) : null;
    const elapsed = animation ? now - animation.start : 0;
    const hits = plan ? plan.phases.filter(p => p.strike && elapsed >= p.hit).map(p => p.hit) : [];
    const sinceHit = hits.length ? elapsed - Math.max(...hits) : Infinity;
    let excitement = Math.max(0, 1 - sinceHit / 1400);
    if (state.finished && plan && elapsed >= plan.koAt) excitement = Math.max(excitement, 0.7);

    drawStage(state.stage || state.bot.id, now, excitement);

    const frames = {
      player: fighterFrame("player", state, animation, plan, elapsed, now),
      bot: fighterFrame("bot", state, animation, plan, elapsed, now)
    };
    SIDES.forEach(side => { if (frames[side].alpha > 0.3) drawShadow(frames[side].x, floorY, frames[side].scale); });
    drawFighterSprite(frames.bot, now, floorY);
    drawFighterSprite(frames.player, now, floorY);
    SIDES.forEach(side => {
      drawAmbient(frames[side], now, floorY);
      if (state[side].boost && frames[side].alpha > 0.3) drawBoost(frames[side], now, floorY);
    });
    if (animation) {
      plan.phases.forEach(p => {
        const side = p.actor;
        const other = opposite(side);
        drawMoveEffects(side, frames, animation, clockFor(plan, side, elapsed), now, floorY, "act");
        if (p.strike && animation.report[other].move.guard) drawMoveEffects(other, frames, animation, clockFor(plan, side, elapsed), now, floorY, "react");
      });
      drawCallouts(frames, animation, plan, elapsed, floorY);
      if (state.finished) drawKO(elapsed, plan.koAt);
    }
    if (state.revealed && !state.finished && (!plan || elapsed >= plan.end)) drawReveal(state, frames, now, floorY);

    const calm = reducedMotion.matches;
    let shockAt = null;
    if (plan) {
      plan.phases.forEach(p => {
        const outcome = animation.report[p.actor];
        if (outcome.move.ultimate && LANDED.includes(outcome.result) && outcome.damage > 0) shockAt = p.hit;
      });
      if (state.finished) shockAt = plan.koAt;
    }
    const sinceShock = shockAt === null ? Infinity : elapsed - shockAt;
    if (!calm && sinceShock >= 0 && sinceShock < 60) {
      g.globalAlpha = 0.3;
      rect(g, 0, 0, WIDTH, HEIGHT, "#fffae6");
      g.globalAlpha = 1;
    }
    const shaking = !calm && sinceShock >= 0 && sinceShock < 300;
    const shakeX = shaking ? Math.round(Math.sin(elapsed * 0.9) * 4) : 0;
    const shakeY = shaking ? Math.round(Math.cos(elapsed * 1.3) * 3) : 0;

    context.imageSmoothingEnabled = false;
    context.fillStyle = "#120d16";
    context.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
    context.drawImage(screen, shakeX, shakeY, WIDTH * SCALE, HEIGHT * SCALE);
  }

  // Idle sprite for menus, scaled up on a transparent canvas.
  function portrait(canvas, id, now = 0, mirrored = false) {
    const ctx = canvas.getContext("2d");
    renderSprite(id, idlePose(id, now, "player"), now, false);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const zoom = Math.floor(Math.min(canvas.width / 70, canvas.height / 78));
    const x = Math.round(canvas.width / 2 - FOOT_X * zoom);
    const y = Math.round(canvas.height - 4 * zoom - FOOT_Y * zoom);
    ctx.save();
    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(sprite, x, y, SPRITE_W * zoom, SPRITE_H * zoom);
    ctx.restore();
  }

  return { draw, portrait, timing, SLOW };
})();
