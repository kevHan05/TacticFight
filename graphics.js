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
  const SPRITE_W = 100;
  const SPRITE_H = 84;
  const FOOT_X = 50;
  const FOOT_Y = 80;
  const OUTLINE = [20, 14, 22];
  const FLASH = [255, 246, 232];

  const screen = makeCanvas(WIDTH, HEIGHT);
  const g = screen.getContext("2d");
  const sprite = makeCanvas(SPRITE_W, SPRITE_H);
  const sg = sprite.getContext("2d", { willReadFrequently: true });
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const wideLayout = window.matchMedia("(min-width: 621px)");
  let background = null;
  let crowd = null;

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
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    F: ["111", "100", "110", "100", "100"],
    G: ["011", "100", "101", "101", "011"],
    H: ["101", "101", "111", "101", "101"],
    I: ["111", "010", "010", "010", "111"],
    K: ["101", "101", "110", "101", "101"],
    O: ["111", "101", "101", "101", "111"],
    R: ["110", "101", "110", "101", "101"],
    T: ["111", "010", "010", "010", "010"],
    2: ["110", "001", "010", "100", "111"],
    4: ["101", "101", "111", "001", "001"],
    ".": ["000", "000", "000", "000", "010"]
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
  // Stage: a dusk street in the neon district, cached once.
  const NEAR_TOWERS = [[-2, 24, 58], [30, 20, 40], [54, 26, 48], [80, 34, 76], [124, 22, 34], [150, 28, 62], [236, 30, 70], [270, 22, 46], [294, 28, 60]];

  function buildBackground() {
    const canvas = makeCanvas(WIDTH, HEIGHT);
    const b = canvas.getContext("2d");
    const rand = seeded(7);

    // Sky in hard colour bands, checkerboard-dithered at each seam.
    const bands = [[0, "#1b1f3d"], [12, "#29295a"], [23, "#423468"], [33, "#653d6f"], [42, "#8f466c"], [50, "#bd5866"], [57, "#e0745e"], [63, "#f39a62"], [69, "#ffc27c"]];
    for (let y = 0; y < 90; y += 1) {
      let index = 0;
      while (index + 1 < bands.length && y >= bands[index + 1][0]) index += 1;
      rect(b, 0, y, WIDTH, 1, bands[index][1]);
      const next = bands[index + 1];
      if (next && next[0] - y <= 2) {
        const step = next[0] - y === 1 ? 2 : 4;
        for (let x = y % 2; x < WIDTH; x += step) rect(b, x, y, 1, 1, next[1]);
      }
    }

    // Setting sun with retro scanline gaps.
    for (let dy = -24; dy <= 24; dy += 1) {
      const y = 60 + dy;
      if ([63, 67, 70, 73, 75].includes(y)) continue;
      const half = Math.floor(Math.sqrt(24 * 24 - dy * dy));
      rect(b, 196 - half, y, half * 2 + 1, 1, dy < -8 ? "#fff1b8" : dy < 6 ? "#ffd98a" : "#ffb870");
    }

    [[18, 30, 44, "#56396a"], [140, 37, 76, "#a9536b"], [226, 45, 54, "#d86d66"], [92, 52, 40, "#e48563"], [250, 26, 34, "#4d3567"]].forEach(([x, y, width, color]) => {
      rect(b, x, y, width, 1, color);
      rect(b, x + 5, y + 1, Math.max(4, width - 12), 1, color);
      rect(b, x + 12, y - 1, Math.max(4, width - 26), 1, color);
    });

    // Far skyline.
    for (let x = -4; x < WIDTH;) {
      const width = 10 + Math.floor(rand() * 14);
      const height = 18 + Math.floor(rand() * 26);
      rect(b, x, 80 - height, width, height, "#3c2b52");
      for (let wy = 80 - height + 3; wy < 76; wy += 4) {
        for (let wx = x + 2; wx < x + width - 2; wx += 3) {
          if (rand() < 0.22) rect(b, wx, wy, 1, 1, "#c77a6a");
        }
      }
      x += width + 1;
    }

    // Near towers with window grids and rooftop details.
    NEAR_TOWERS.forEach(([x, width, height]) => {
      const top = 80 - height;
      rect(b, x, top, width, height, "#221a33");
      rect(b, x, top, 2, height, "#30254a");
      rect(b, x - 1, top, width + 2, 2, "#30254a");
      for (let wy = top + 5; wy < 74; wy += 5) {
        for (let wx = x + 4; wx < x + width - 3; wx += 5) {
          const roll = rand();
          const color = roll < 0.24 ? "#f4b56a" : roll < 0.3 ? "#86d4d9" : "#3a2c48";
          rect(b, wx, wy, 2, 3, color);
          if (color === "#f4b56a") rect(b, wx, wy, 2, 1, "#ffe0a0");
        }
      }
    });
    // Water tower on a roof.
    rect(b, 58, 25, 14, 7, "#2a2036");
    rect(b, 58, 25, 14, 1, "#46375c");
    rect(b, 57, 24, 16, 1, "#1a1426");
    [59, 64, 70].forEach(x => rect(b, x, 32, 1, 4, "#1a1426"));
    // Antenna mast.
    rect(b, 164, 4, 1, 14, "#1a1426");
    rect(b, 162, 9, 5, 1, "#1a1426");

    // Storefronts at street level.
    rect(b, 0, 58, WIDTH, 26, "#2a1f35");
    for (let x = 0; x < WIDTH; x += 40) {
      for (let stripe = 0; stripe < 34; stripe += 4) rect(b, x + 3 + stripe, 56, 2, 3, stripe % 8 ? "#e8d6c0" : "#c8443a");
      rect(b, x + 3, 59, 34, 1, "#14101c");
      rect(b, x + 6, 61, 28, 16, "#4a2f3a");
      rect(b, x + 7, 62, 26, 14, (x / 40) % 3 === 1 ? "#ffcf87" : "#e58a5c");
      rect(b, x + 7, 62, 26, 2, "#fff0c8");
      rect(b, x + 19, 62, 2, 14, "#4a2f3a");
    }

    // Street floor: alternating bands and seams converging on a vanishing point.
    for (let y = 84; y < HEIGHT; y += 1) {
      rect(b, 0, y, WIDTH, 1, Math.floor(Math.sqrt(y - 84) * 2) % 2 ? "#2a2c3b" : "#24253a");
    }
    for (let i = -12; i <= 12; i += 1) {
      const bottomX = 160 + i * 34;
      for (let y = 87; y < HEIGHT; y += 1) {
        const t = (y - 40) / (HEIGHT - 40);
        rect(b, 160 + (bottomX - 160) * t, y, 1, 1, "#34364b");
      }
    }
    rect(b, 0, 84, WIDTH, 2, "#6c6f86");
    rect(b, 0, 84, WIDTH, 1, "#9a9db3");
    rect(b, 0, 86, WIDTH, 1, "#17161f");
    return canvas;
  }

  function buildCrowd() {
    const rand = seeded(42);
    const pick = list => list[Math.floor(rand() * list.length)];
    const people = [];
    [0, 1].forEach(row => {
      for (let x = 2 + row * 5; x < WIDTH; x += 9 + Math.floor(rand() * 5)) {
        people.push({
          x,
          row,
          height: 13 + Math.floor(rand() * 5),
          shirt: pick(row ? ["#5b3a5e", "#3d4a6b", "#6b4a3a", "#2f5a55", "#7a3a48", "#4f4a62"] : ["#3a2a46", "#2c3350", "#4a3433", "#24403f"]),
          skin: pick(["#a8735a", "#7a4e3c", "#c48d6c", "#5c3a2e"]),
          hair: pick(["#1a1214", "#3a2420", "#5a4a40", "#1c1a2a"]),
          phase: rand() * Math.PI * 2,
          cheers: rand() < 0.65
        });
      }
    });
    return people;
  }

  function drawCrowd(now, excitement) {
    crowd.forEach(person => {
      const wobble = Math.sin(now / 95 + person.phase);
      const jump = excitement > 0.05 ? Math.round(Math.abs(wobble) * 3 * excitement) : Math.sin(now / 700 + person.phase) > 0.7 ? 1 : 0;
      const top = 84 - (person.row ? 0 : 3) - person.height - jump;
      const { x, shirt, skin, hair } = person;
      if (excitement > 0.25 && person.cheers) {
        const wave = Math.round(wobble);
        rect(g, x - 4, top - 2 + wave, 1, 8, shirt);
        rect(g, x + 4, top - 2 - wave, 1, 8, shirt);
        rect(g, x - 4, top - 3 + wave, 1, 1, skin);
        rect(g, x + 4, top - 3 - wave, 1, 1, skin);
      }
      rect(g, x - 3, top + 5, 7, person.height - 5, shirt);
      rect(g, x - 2, top + 4, 5, 1, shirt);
      rect(g, x + 3, top + 5, 1, 4, "#c2768a");
      rect(g, x - 2, top, 4, 4, skin);
      rect(g, x - 2, top, 4, 1, hair);
      rect(g, x - 2, top + 1, 1, 1, hair);
    });
  }

  function drawRailing() {
    for (let x = 4; x < WIDTH; x += 20) rect(g, x, 76, 2, 8, "#4c4e63");
    rect(g, 0, 76, WIDTH, 2, "#7c7f98");
    rect(g, 0, 76, WIDTH, 1, "#a7aac0");
    rect(g, 0, 80, WIDTH, 1, "#55576d");
  }

  // Neon signs flicker now and then; their glow reflects off the wet street.
  function neonOn(now, seed) {
    return Math.sin(now * 0.0021 + seed * 7) + Math.sin(now * 0.0137 + seed * 3) > -1.75;
  }

  function drawNeon(now) {
    const signs = [
      { x: 86, y: 11, w: 7, h: 33, label: "FIGHT", vertical: true, color: "#ff4f9a", glow: "#ffd6ec", seed: 1 },
      { x: 241, y: 30, w: 15, h: 9, label: "BAR", vertical: false, color: "#3fd8ff", glow: "#d8faff", seed: 2 },
      { x: 300, y: 32, w: 15, h: 9, label: "24H", vertical: false, color: "#ffb43a", glow: "#fff0c0", seed: 3 }
    ];
    signs.forEach(sign => {
      const on = neonOn(now, sign.seed);
      rect(g, sign.x, sign.y, sign.w, sign.h, "#140e1c");
      const color = on ? sign.color : "#4a2c44";
      rect(g, sign.x, sign.y, sign.w, 1, color);
      rect(g, sign.x, sign.y + sign.h - 1, sign.w, 1, color);
      rect(g, sign.x, sign.y, 1, sign.h, color);
      rect(g, sign.x + sign.w - 1, sign.y, 1, sign.h, color);
      text(g, sign.label, sign.x + 2, sign.y + 2, () => (on ? sign.glow : "#5a3a50"), 1, sign.vertical);
      if (on) {
        g.globalAlpha = 0.18;
        rect(g, sign.x - 2, sign.y - 2, sign.w + 4, sign.h + 4, sign.color);
        g.globalAlpha = 0.22;
        for (let y = 90; y < 126; y += 3) {
          const shimmer = Math.round(Math.sin(now / 160 + y) * 1.5);
          rect(g, sign.x + 1 + shimmer, y, sign.w - 2, 1, sign.color);
        }
        g.globalAlpha = 1;
      }
    });
    if (Math.floor(now / 600) % 2) rect(g, 164, 3, 1, 1, "#ff5a4f");
  }

  // ---------------------------------------------------------------------------
  // Fighter skeleton. Poses face right with the feet at (0, 0); y grows down.
  const POSES = {
    idle: { head: [3, -55], chest: [1, -41], hip: [-1, -27], fElbow: [10, -36], fHand: [16, -44], bElbow: [4, -33], bHand: [12, -40], fKnee: [9, -14], fFoot: [13, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    attack: { head: [8, -54], chest: [5, -41], hip: [0, -27], fElbow: [19, -46], fHand: [31, -47], bElbow: [-4, -34], bHand: [2, -31], fKnee: [12, -14], fFoot: [17, 0], bKnee: [-8, -13], bFoot: [-16, 0] },
    block: { head: [0, -54], chest: [-1, -41], hip: [-2, -27], fElbow: [10, -40], fHand: [9, -54], bElbow: [6, -38], bHand: [6, -52], fKnee: [8, -13], fFoot: [13, 0], bKnee: [-9, -13], bFoot: [-15, 0] },
    hurt: { head: [-7, -52], chest: [-5, -40], hip: [-2, -27], fElbow: [4, -34], fHand: [10, -28], bElbow: [-12, -44], bHand: [-16, -52], fKnee: [8, -13], fFoot: [12, 0], bKnee: [-8, -14], bFoot: [-14, 0] },
    charge: { head: [-1, -51], chest: [-2, -38], hip: [-1, -24], fElbow: [-4, -30], fHand: [-9, -31], bElbow: [-6, -33], bHand: [-10, -29], fKnee: [12, -12], fFoot: [17, 0], bKnee: [-10, -12], bFoot: [-18, 0] },
    release: { head: [8, -51], chest: [5, -38], hip: [0, -24], fElbow: [16, -41], fHand: [27, -40], bElbow: [14, -38], bHand: [25, -37], fKnee: [13, -12], fFoot: [19, 0], bKnee: [-10, -12], bFoot: [-19, 0] },
    victory: { head: [0, -56], chest: [0, -42], hip: [0, -28], fElbow: [6, -56], fHand: [5, -66], bElbow: [-6, -32], bHand: [-4, -24], fKnee: [5, -14], fFoot: [7, 0], bKnee: [-5, -14], bFoot: [-8, 0] },
    ko: { head: [-30, -5], chest: [-17, -6], hip: [-3, -5], fElbow: [-14, -2], fHand: [-6, -1], bElbow: [-24, -1], bHand: [-30, -1], fKnee: [10, -8], fFoot: [22, -2], bKnee: [10, -4], bFoot: [24, 0] }
  };
  const UPPER_BODY = ["head", "chest", "fElbow", "fHand", "bElbow", "bHand"];

  function blend(a, b, t) {
    if (t <= 0) return a;
    const out = {};
    for (const key in a) out[key] = [a[key][0] + (b[key][0] - a[key][0]) * t, a[key][1] + (b[key][1] - a[key][1]) * t];
    return out;
  }

  function idlePose(now, side) {
    const bob = Math.sin(now / 280 + (side === "bot" ? 1.7 : 0)) > 0 ? 1 : 0;
    const pose = { ...POSES.idle };
    UPPER_BODY.forEach(key => { pose[key] = [pose[key][0], pose[key][1] + bob]; });
    return pose;
  }

  // Converts a pose to sprite coordinates and derives neck, shoulders and hips
  // from the torso direction so lying-down poses still connect properly.
  function joints(pose) {
    const j = {};
    for (const key in pose) j[key] = [FOOT_X + pose[key][0], FOOT_Y + pose[key][1]];
    const ux = j.chest[0] - j.hip[0];
    const uy = j.chest[1] - j.hip[1];
    const length = Math.hypot(ux, uy) || 1;
    j.u = [ux / length, uy / length];
    j.perp = [-j.u[1], j.u[0]];
    j.neck = along(j, j.chest, 0, 6);
    j.fShoulder = along(j, j.neck, 2, -1);
    j.bShoulder = along(j, j.neck, -2.5, -1);
    j.fHip = along(j, j.hip, 1.5, 0);
    j.bHip = along(j, j.hip, -1.5, 0);
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

  function paletteOf(look) {
    const colors = new Set();
    Object.values(look).flat().forEach(color => colors.add(color));
    return [...colors].map(hexToRgb);
  }
  const FIGHTERS = {
    player: { parts: rookParts, palette: paletteOf(ROOK) },
    bot: { parts: byteParts, palette: paletteOf(BYTE) }
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

  function drawFighterSprite(frame, now, floorY) {
    const { parts, palette } = FIGHTERS[frame.side];
    const j = joints(frame.pose);
    sg.clearRect(0, 0, SPRITE_W, SPRITE_H);
    parts.arm(j.bShoulder, j.bElbow, j.bHand, true);
    parts.leg(j.bHip, j.bKnee, j.bFoot, true);
    parts.torso(j, now);
    parts.leg(j.fHip, j.fKnee, j.fFoot, false);
    parts.head(j, now);
    parts.arm(j.fShoulder, j.fElbow, j.fHand, false);
    pixelate(palette, frame.flash);

    g.save();
    g.translate(Math.round(frame.x) + (frame.dir < 0 ? FOOT_X : -FOOT_X), floorY - FOOT_Y);
    if (frame.dir < 0) g.scale(-1, 1);
    g.drawImage(sprite, 0, 0);
    g.restore();
  }

  // ---------------------------------------------------------------------------
  // Choreography. Hits land when the sound effects do: 150ms after the button
  // press for punches, 390ms when an ultimate's blast is in play.
  function choreograph(animation) {
    const { playerAction, botAction } = animation;
    const ultimateInPlay = playerAction === "ultimate" || botAction === "ultimate";
    const gap = BOT_X - PLAYER_X;
    return {
      hitAt: ultimateInPlay ? 390 : 150,
      ultimateInPlay,
      traded: playerAction !== "block" && botAction !== "block",
      lunge: playerAction === "attack" && botAction === "attack" ? (gap - 39) / 2 : gap - 41
    };
  }

  function fighterFrame(side, state, animation, plan, elapsed, now) {
    const dir = side === "player" ? 1 : -1;
    const baseX = side === "player" ? PLAYER_X : BOT_X;
    const idle = idlePose(now, side);
    const frame = { side, dir, x: baseX, pose: idle, flash: false };
    if (!animation) return frame;

    const action = animation[`${side}Action`];
    const { hitAt } = plan;
    let pose = idle;
    let offset = 0;

    if (action === "attack") {
      const t = phase(elapsed, hitAt - 140, hitAt - 10) * (1 - phase(elapsed, hitAt + 140, hitAt + 420));
      pose = blend(idle, POSES.attack, t);
      offset = plan.lunge * t;
    } else if (action === "block") {
      const t = phase(elapsed, hitAt - 150, hitAt - 50) * (1 - phase(elapsed, hitAt + 280, hitAt + 480));
      pose = blend(idle, POSES.block, t);
      if (!plan.traded) offset = -4 * phase(elapsed, hitAt, hitAt + 40) * (1 - phase(elapsed, hitAt + 120, hitAt + 400));
    } else if (action === "ultimate") {
      pose = blend(blend(idle, POSES.charge, phase(elapsed, 0, 170)), POSES.release, phase(elapsed, 170, 240));
      pose = blend(pose, idle, phase(elapsed, 560, 820));
    }

    const health = side === "player" ? state.playerHealth : state.botHealth;
    const dead = state.finished && health <= 0;
    if (plan.traded) {
      const recoil = phase(elapsed, hitAt, hitAt + 50) * (dead ? 1 : 1 - phase(elapsed, hitAt + 260, hitAt + 480));
      pose = blend(pose, POSES.hurt, recoil);
      offset -= 7 * recoil;
      frame.flash = elapsed >= hitAt && elapsed < hitAt + 50;
    }
    if (dead) {
      const fall = phase(elapsed, hitAt + 220, hitAt + 520);
      pose = blend(pose, POSES.ko, fall);
      offset -= 16 * fall;
    } else if (state.finished) {
      pose = blend(pose, POSES.victory, phase(elapsed, hitAt + 800, hitAt + 1050));
    }

    frame.pose = pose;
    frame.x = baseX + dir * offset;
    return frame;
  }

  // ---------------------------------------------------------------------------
  // Effects.
  function drawShadow(x, floorY) {
    g.globalAlpha = 0.45;
    [[18, 0], [24, 1], [18, 2]].forEach(([width, dy]) => rect(g, x - width / 2, floorY - 1 + dy, width, 1, "#0a0814"));
    g.globalAlpha = 1;
  }

  function drawBoost(frame, now, floorY) {
    for (let k = 0; k < 6; k += 1) {
      const rise = (now / 700 + k / 6) % 1;
      const ox = Math.round(Math.sin(k * 2.4 + now / 300) * 13);
      rect(g, frame.x + ox, floorY - 6 - rise * 56, 1, 2, k % 2 ? "#eaff7a" : "#fff6c8");
    }
  }

  function drawCharge(frame, elapsed, floorY) {
    const radius = 20 * (1 - elapsed / 240);
    const cx = frame.x - frame.dir * 8;
    const cy = floorY - 31;
    const colors = frame.side === "player" ? ["#ffd36b", "#ffffff"] : ["#c2f078", "#ffffff"];
    for (let k = 0; k < 10; k += 1) {
      const angle = k * 0.63 + elapsed / 90;
      rect(g, cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.7, 1, 1, colors[k % 2]);
    }
  }

  function drawProjectile(side, x, y, dir, now) {
    if (side === "player") {
      const flicker = Math.floor(now / 50) % 2;
      disc(g, x - dir * 8, y, 2, "#c8402a");
      disc(g, x - dir * 4, y, 3, "#ff7a3a");
      disc(g, x, y, 5 + flicker, "#ff7a3a");
      disc(g, x, y, 4, "#ffd36b");
      disc(g, x + dir, y, 2, "#ffffff");
    } else {
      const tail = x - dir * 14;
      const left = Math.min(tail, x);
      rect(g, left, y - 2, 15, 5, "#2f9a74");
      rect(g, left, y - 1, 15, 3, "#c2f078");
      rect(g, left, y, 15, 1, "#ffffff");
      disc(g, x, y, 3, "#c2f078");
      disc(g, x, y, 1, "#ffffff");
      for (let k = 0; k < 3; k += 1) rect(g, x - dir * (19 + k * 5), y - 2 + k * 2, 3, 1, "#7fdca4");
    }
  }

  function drawSpark(x, y, age, colors) {
    const frame = Math.min(2, Math.floor(age / 60));
    const reach = [5, 9, 12][frame];
    for (let k = 0; k < 8; k += 1) {
      const angle = k * Math.PI / 4 + 0.3;
      const length = reach * (k % 2 ? 0.55 : 1);
      for (let s = frame; s <= length; s += 1) {
        rect(g, x + Math.cos(angle) * s, y + Math.sin(angle) * s, 1, 1, s > length * 0.6 ? colors[0] : colors[1]);
      }
    }
    disc(g, x, y, [3, 2, 1][frame], colors[2]);
  }

  function drawAttacks(animation, plan, frames, elapsed, now, floorY) {
    ["player", "bot"].forEach(side => {
      const action = animation[`${side}Action`];
      if (action === "block") return;
      const target = side === "player" ? "bot" : "player";
      const dir = side === "player" ? 1 : -1;
      const from = side === "player" ? PLAYER_X : BOT_X;
      const to = side === "player" ? BOT_X : PLAYER_X;
      const blocked = animation[`${target}Action`] === "block";

      if (action === "ultimate") {
        if (elapsed < 240) drawCharge(frames[side], elapsed, floorY);
        const travel = (elapsed - 230) / (plan.hitAt - 230);
        if (travel >= 0 && travel < 1) {
          const startX = from + dir * 28;
          const endX = to - dir * 8;
          drawProjectile(side, startX + (endX - startX) * travel, floorY - 38, dir, now);
        }
      }

      const age = elapsed - plan.hitAt;
      if (age < 0 || age >= 180) return;
      if (blocked) {
        drawSpark(to - dir * 10, floorY - 50, age, ["#3a8cff", "#9fe8ff", "#ffffff"]);
      } else if (action === "ultimate") {
        drawSpark(to - dir * 8, floorY - 38, age, ["#ff7a2a", "#ffe36a", "#ffffff"]);
      } else {
        drawSpark(from + dir * (plan.lunge + 31), floorY - 47, age, ["#ff7a2a", "#ffe36a", "#ffffff"]);
      }
    });
  }

  function drawKO(elapsed, hitAt) {
    const shown = elapsed - hitAt - 400;
    if (shown < 0 || (shown < 1200 && Math.floor(shown / 160) % 2)) return;
    const shade = row => (row < 2 ? "#fff3a0" : row < 4 ? "#ffb43a" : "#e8402a");
    [[-1, 0], [1, 0], [0, -1], [0, 1], [2, 2]].forEach(([dx, dy]) => text(g, "K.O.", 136 + dx, 30 + dy, () => "#140e16", 3));
    text(g, "K.O.", 136, 30, shade, 3);
  }

  // ---------------------------------------------------------------------------
  function draw(context, state, animation, now) {
    if (!background) {
      background = buildBackground();
      crowd = buildCrowd();
    }
    const floorY = wideLayout.matches ? 92 : 126;
    const plan = animation ? choreograph(animation) : null;
    const elapsed = animation ? now - animation.start : 0;
    const sinceHit = plan ? elapsed - plan.hitAt : Infinity;
    let excitement = sinceHit >= 0 ? Math.max(0, 1 - sinceHit / 1400) : 0;
    if (state.finished && sinceHit >= 0) excitement = Math.max(excitement, 0.7);

    g.drawImage(background, 0, 0);
    drawNeon(now);
    drawCrowd(now, excitement);
    drawRailing();

    const frames = {
      player: fighterFrame("player", state, animation, plan, elapsed, now),
      bot: fighterFrame("bot", state, animation, plan, elapsed, now)
    };
    drawShadow(frames.player.x, floorY);
    drawShadow(frames.bot.x, floorY);
    drawFighterSprite(frames.bot, now, floorY);
    drawFighterSprite(frames.player, now, floorY);
    if (state.playerBoost) drawBoost(frames.player, now, floorY);
    if (state.botBoost) drawBoost(frames.bot, now, floorY);
    if (animation) drawAttacks(animation, plan, frames, elapsed, now, floorY);
    if (animation && state.finished) drawKO(elapsed, plan.hitAt);

    const calm = reducedMotion.matches;
    const bigHit = plan && plan.traded && (plan.ultimateInPlay || state.finished);
    if (bigHit && !calm && sinceHit >= 0 && sinceHit < 50) {
      g.globalAlpha = 0.3;
      rect(g, 0, 0, WIDTH, HEIGHT, "#fffae6");
      g.globalAlpha = 1;
    }
    const shaking = bigHit && !calm && sinceHit >= 0 && sinceHit < 260;
    const shakeX = shaking ? Math.round(Math.sin(elapsed * 0.9) * 4) : 0;
    const shakeY = shaking ? Math.round(Math.cos(elapsed * 1.3) * 3) : 0;

    context.imageSmoothingEnabled = false;
    context.fillStyle = "#120d16";
    context.fillRect(0, 0, WIDTH * SCALE, HEIGHT * SCALE);
    context.drawImage(screen, shakeX, shakeY, WIDTH * SCALE, HEIGHT * SCALE);
  }

  return { draw };
})();
