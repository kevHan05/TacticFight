// Stage definitions for the arena. Each stage paints a static background once and
// animates on top of it every frame, behind the fighters.
//
// `h` is the helper kit graphics.js passes in:
//   h.rect(ctx, x, y, w, h, color)            filled rect, x/y rounded
//   h.disc(ctx, cx, cy, radius, color)        filled pixel circle
//   h.text(ctx, string, x, y, colorForRow, scale = 1, vertical = false)  3x5 pixel font
//   h.seeded(seed)                           deterministic random () => [0,1)
//   h.WIDTH (320), h.HEIGHT (140)
//
// Everything is drawn with integer rects so the 3x upscale stays crisp. The only
// state kept between calls is a few lazily built, seeded lists (crowds, LEDs,
// petals...) that never change once made.
const Stages = (() => {
  const W = 320;
  const H = 140;

  // ---------------------------------------------------------------------------
  // Shared helpers.

  // Integer hash -> [0,1). Used for per-frame "random" that stays deterministic.
  function hash(n) {
    n = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
    n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  function painter(ctx, h) {
    return (x, y, w, hh, color) => {
      const width = Math.round(w);
      const height = Math.round(hh);
      if (width > 0 && height > 0) h.rect(ctx, x, y, width, height, color);
    };
  }

  // Hard colour bands, checkerboard-dithered at each seam (same recipe as the street sky).
  function bands(ctx, h, list, y0, y1, x0 = 0, width = W) {
    for (let y = y0; y < y1; y += 1) {
      let index = 0;
      while (index + 1 < list.length && y >= list[index + 1][0]) index += 1;
      h.rect(ctx, x0, y, width, 1, list[index][1]);
      const next = list[index + 1];
      if (next && next[0] - y <= 2) {
        const step = next[0] - y === 1 ? 2 : 4;
        for (let x = x0 + (y % 2); x < x0 + width; x += step) h.rect(ctx, x, y, 1, 1, next[1]);
      }
    }
  }

  // Floor perspective: lines converge on (160, 40), like the street.
  function persX(bottomX, y) {
    return 160 + (bottomX - 160) * ((y - 40) / (H - 40));
  }

  function seams(ctx, h, y0, spacing, count, color) {
    for (let i = -count; i <= count; i += 1) {
      for (let y = y0; y < H; y += 1) h.rect(ctx, persX(160 + i * spacing, y), y, 1, 1, color);
    }
  }

  // Pixel line stepped with 1px (or `size`px) rects - no canvas paths.
  function line(ctx, h, x0, y0, x1, y1, color, size = 1) {
    const steps = Math.max(1, Math.round(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let i = 0; i <= steps; i += 1) {
      h.rect(ctx, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, size, size, color);
    }
  }

  function oval(ctx, h, cx, cy, rx, ry, color) {
    for (let dy = -ry; dy <= ry; dy += 1) {
      const half = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)));
      h.rect(ctx, cx - half, cy + dy, half * 2 + 1, 1, color);
    }
  }

  function lazy(make) {
    let value = null;
    return h => value || (value = make(h));
  }

  // ===========================================================================
  // ROOK - "Neon District": the dusk street, ported unchanged from graphics.js.
  const NEAR_TOWERS = [[-2, 24, 58], [30, 20, 40], [54, 26, 48], [80, 34, 76], [124, 22, 34], [150, 28, 62], [236, 30, 70], [270, 22, 46], [294, 28, 60]];

  const rookCrowd = lazy(h => {
    const rand = h.seeded(42);
    const pick = list => list[Math.floor(rand() * list.length)];
    const people = [];
    [0, 1].forEach(row => {
      for (let x = 2 + row * 5; x < W; x += 9 + Math.floor(rand() * 5)) {
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
  });

  function rookNeonOn(now, seed) {
    return Math.sin(now * 0.0021 + seed * 7) + Math.sin(now * 0.0137 + seed * 3) > -1.75;
  }

  const rook = {
    name: "Neon District",
    build(b, h) {
      const rect = h.rect;
      const WIDTH = W;
      const HEIGHT = H;
      const rand = h.seeded(7);

      // Sky in hard colour bands, checkerboard-dithered at each seam.
      const bandList = [[0, "#1b1f3d"], [12, "#29295a"], [23, "#423468"], [33, "#653d6f"], [42, "#8f466c"], [50, "#bd5866"], [57, "#e0745e"], [63, "#f39a62"], [69, "#ffc27c"]];
      for (let y = 0; y < 90; y += 1) {
        let index = 0;
        while (index + 1 < bandList.length && y >= bandList[index + 1][0]) index += 1;
        rect(b, 0, y, WIDTH, 1, bandList[index][1]);
        const next = bandList[index + 1];
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
    },
    animate(g, h, now, excitement) {
      const rect = h.rect;
      const WIDTH = W;

      // Neon signs flicker now and then; their glow reflects off the wet street.
      const signs = [
        { x: 86, y: 11, w: 7, h: 33, label: "FIGHT", vertical: true, color: "#ff4f9a", glow: "#ffd6ec", seed: 1 },
        { x: 241, y: 30, w: 15, h: 9, label: "BAR", vertical: false, color: "#3fd8ff", glow: "#d8faff", seed: 2 },
        { x: 300, y: 32, w: 15, h: 9, label: "24H", vertical: false, color: "#ffb43a", glow: "#fff0c0", seed: 3 }
      ];
      signs.forEach(sign => {
        const on = rookNeonOn(now, sign.seed);
        rect(g, sign.x, sign.y, sign.w, sign.h, "#140e1c");
        const color = on ? sign.color : "#4a2c44";
        rect(g, sign.x, sign.y, sign.w, 1, color);
        rect(g, sign.x, sign.y + sign.h - 1, sign.w, 1, color);
        rect(g, sign.x, sign.y, 1, sign.h, color);
        rect(g, sign.x + sign.w - 1, sign.y, 1, sign.h, color);
        h.text(g, sign.label, sign.x + 2, sign.y + 2, () => (on ? sign.glow : "#5a3a50"), 1, sign.vertical);
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

      // Crowd.
      rookCrowd(h).forEach(person => {
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

      // Railing.
      for (let x = 4; x < WIDTH; x += 20) rect(g, x, 76, 2, 8, "#4c4e63");
      rect(g, 0, 76, WIDTH, 2, "#7c7f98");
      rect(g, 0, 76, WIDTH, 1, "#a7aac0");
      rect(g, 0, 80, WIDTH, 1, "#55576d");
    }
  };

  // ===========================================================================
  // BYTE - "Data Center": cold blue server hall, scrolling code wall, drones.
  const RACKS = [2, 27, 52, 245, 270, 295];
  const RACK_TOP = 22;
  const RACK_W = 23;
  const SCREEN = { x: 124, y: 18, w: 72, h: 46 };
  const VENTS = [[55, 96, -1], [265, 96, 1]];

  const byteLeds = lazy(h => {
    const rand = h.seeded(303);
    const leds = [];
    RACKS.forEach(x => {
      for (let y = RACK_TOP + 4; y < 80; y += 4) {
        const count = 1 + Math.floor(rand() * 3);
        for (let k = 0; k < count; k += 1) {
          const roll = rand();
          leds.push({
            x: x + RACK_W - 5 - k * 2,
            y: y + 1,
            color: roll < 0.6 ? "#4cff7a" : roll < 0.85 ? "#5fe0e8" : roll < 0.95 ? "#ffb43a" : "#ff4a4a",
            rate: 120 + Math.floor(rand() * 900),
            seed: Math.floor(rand() * 100000)
          });
        }
      }
    });
    return leds;
  });

  function drone(ctx, h, x, y, now, excitement, phase) {
    const R = painter(ctx, h);
    const dy = Math.round(Math.sin(now / 520 + phase) * 1.5 + excitement * Math.sin(now / 85 + phase) * 3);
    const dx = Math.round(excitement * Math.sin(now / 140 + phase) * 3);
    x += dx;
    y += dy;
    const spin = Math.floor(now / 45 + phase) % 2;
    R(x - 6, y - 1, 3, 1, "#3a4a60");
    R(x + 4, y - 1, 3, 1, "#3a4a60");
    R(spin ? x - 8 : x - 6, y - 2, spin ? 6 : 2, 1, "#8aa8c0");
    R(spin ? x + 3 : x + 5, y - 2, spin ? 6 : 2, 1, "#8aa8c0");
    R(x - 4, y, 9, 3, "#2a3a50");
    R(x - 4, y, 9, 1, "#5a7a98");
    R(x - 3, y + 3, 7, 1, "#1a2638");
    const flash = excitement > 0.3 && Math.floor(now / 90 + phase) % 2;
    R(x - 1, y + 1, 3, 1, excitement > 0.3 ? (flash ? "#ffffff" : "#ff4a4a") : "#5fe0e8");
    if (excitement > 0.3 && flash) {
      ctx.globalAlpha = 0.25;
      R(x - 3, y - 1, 7, 5, "#ff4a4a");
      ctx.globalAlpha = 1;
    }
  }

  function robotArm(ctx, h, bx, dir, now, excitement, phase) {
    const R = painter(ctx, h);
    const by = 77;
    const a1 = -Math.PI / 2 + dir * (0.35 + Math.sin(now / 1400 + phase) * 0.15 + excitement * Math.sin(now / 110 + phase) * 0.5);
    const j1x = bx + Math.cos(a1) * 18;
    const j1y = by + Math.sin(a1) * 18;
    const a2 = a1 + dir * (1.0 + Math.sin(now / 900 + phase) * 0.25 + excitement * Math.sin(now / 95 + phase) * 0.7);
    const j2x = j1x + Math.cos(a2) * 13;
    const j2y = j1y + Math.sin(a2) * 13;
    line(ctx, h, bx, by, j1x, j1y, "#2a4260", 3);
    line(ctx, h, bx, by, j1x, j1y, "#5a7a98", 1);
    line(ctx, h, j1x, j1y, j2x, j2y, "#2a4260", 2);
    h.disc(ctx, j1x + 1, j1y + 1, 1, "#ffb43a");
    R(j2x - 1, j2y - 1, 4, 4, "#1a2a40");
    R(j2x - 2, j2y + 2, 1, 2, "#8aa8c0");
    R(j2x + 3, j2y + 2, 1, 2, "#8aa8c0");
    R(j2x, j2y, 2, 1, excitement > 0.3 && Math.floor(now / 100) % 2 ? "#ff4a4a" : "#5fe0e8");
    R(bx - 5, 80, 11, 4, "#1a2a40");
    R(bx - 5, 80, 11, 1, "#3a5674");
    R(bx - 3, 77, 7, 3, "#24384f");
  }

  const byte = {
    name: "Data Center",
    build(ctx, h) {
      const R = painter(ctx, h);
      const rand = h.seeded(101);

      // Back wall, cold and dark.
      bands(ctx, h, [[0, "#04070e"], [14, "#070d18"], [28, "#0a1424"], [46, "#0d1a2e"], [64, "#102036"]], 0, 84);

      // Far row of racks, dim, across the whole hall for depth.
      for (let x = -3; x < W; x += 13) {
        R(x, 36, 11, 48, "#0a1322");
        R(x, 36, 11, 1, "#16283e");
        R(x, 36, 1, 48, "#0f1c30");
        for (let y = 40; y < 82; y += 3) {
          R(x + 2, y, 7, 1, "#070e1a");
          if (rand() < 0.3) R(x + 8, y, 1, 1, rand() < 0.5 ? "#1d5a4a" : "#1d3f5c");
        }
      }

      // Ceiling grid and cool light strips with stepped light wash.
      R(0, 0, W, 13, "#03060b");
      for (let x = 0; x < W; x += 32) R(x, 0, 1, 13, "#0a1322");
      R(0, 6, W, 1, "#0a1322");
      const strips = [[20, 60], [130, 60], [240, 60]];
      strips.forEach(([x, w]) => {
        for (let i = 0; i < 5; i += 1) {
          ctx.globalAlpha = 0.07 - i * 0.012;
          R(x - i * 6, 14 + i * 8, w + i * 12, 8, "#5fe0e8");
        }
        ctx.globalAlpha = 1;
        R(x - 1, 1, w + 2, 1, "#1a3040");
        R(x, 2, w, 2, "#c8f8ff");
        R(x, 4, w, 1, "#5aa8b8");
      });
      R(0, 13, W, 1, "#1c3048");

      // Front racks with drive bays, vents and (unlit) LED sockets.
      RACKS.forEach(x => {
        R(x, RACK_TOP, RACK_W, 84 - RACK_TOP, "#121e30");
        R(x, RACK_TOP, RACK_W, 1, "#3a5674");
        R(x, RACK_TOP, 1, 62, "#2a4260");
        R(x + RACK_W - 1, RACK_TOP, 1, 62, "#070d18");
        R(x + 1, RACK_TOP + 1, RACK_W - 2, 2, "#1a2a40");
        for (let y = RACK_TOP + 4; y < 80; y += 4) {
          R(x + 2, y, RACK_W - 4, 3, "#0b1422");
          R(x + 2, y, RACK_W - 4, 1, "#1e3048");
          const kind = rand();
          if (kind < 0.4) for (let vx = x + 3; vx < x + RACK_W - 9; vx += 2) R(vx, y + 1, 1, 1, "#050a12");
          else if (kind < 0.7) R(x + 3, y + 1, 9, 1, "#24384f");
          else for (let vx = x + 3; vx < x + 14; vx += 3) R(vx, y + 1, 2, 1, "#2a4260");
          for (let k = 0; k < 3; k += 1) R(x + RACK_W - 5 - k * 2, y + 1, 1, 1, "#0a1c16");
        }
        R(x, 80, RACK_W, 4, "#0a1220");
        R(x + 5, 13, 2, RACK_TOP - 13, "#0e1a2a");
        R(x + 13, 13, 1, RACK_TOP - 13, "#2a5a7a");
      });

      // Big wall screen (content animates).
      const S = SCREEN;
      R(S.x - 2, S.y - 2, S.w + 4, S.h + 4, "#070d18");
      R(S.x - 1, S.y - 1, S.w + 2, S.h + 2, "#3a5674");
      R(S.x - 1, S.y + S.h, S.w + 2, 1, "#1a2a40");
      R(S.x, S.y, S.w, S.h, "#02140c");
      for (let y = S.y; y < S.y + S.h; y += 2) R(S.x, y, S.w, 1, "#031a10");
      R(S.x, S.y + 33, S.w, 1, "#0d4a2a");
      R(S.x + 2, S.y + 40, S.w - 4, 1, "#0a3a3a");
      R(140, 13, 2, 3, "#2a4260");
      R(178, 13, 2, 3, "#2a4260");
      R(140, 66, 40, 7, "#0a1220");
      R(140, 66, 40, 1, "#24384f");
      h.text(ctx, "BYTE.SYS", 145, 67, () => "#5fe0e8");

      // Low cooling unit below the screen.
      R(130, 75, 60, 9, "#16263c");
      R(130, 75, 60, 1, "#3a5674");
      for (let y = 77; y < 83; y += 2) R(132, y, 56, 1, "#0a1424");

      // Cable bundles sagging from the ceiling.
      [[0, 60, 7, "#0e1a2a"], [40, 130, 9, "#1a3048"], [100, 170, 6, "#2a5a7a"], [150, 230, 8, "#0e1a2a"],
        [200, 320, 10, "#1a3048"], [60, 110, 5, "#6a2a4a"], [210, 270, 6, "#2a6a4a"], [262, 320, 7, "#0e1a2a"], [-10, 40, 5, "#2a5a7a"]]
        .forEach(([x0, x1, sag, color]) => {
          for (let x = x0; x <= x1; x += 1) {
            const t = (x - x0) / (x1 - x0);
            R(x, 13 + Math.round(sag * 4 * t * (1 - t)), 1, 2, color);
          }
        });

      // Raised floor: checker tiles in perspective with vent tiles.
      const rows = [84, 87, 91, 96, 102, 109, 117, 127, 141];
      for (let y = 84; y < H; y += 1) {
        let r = 0;
        while (y >= rows[r + 1]) r += 1;
        for (let i = -12; i < 12; i += 1) {
          const x0 = Math.round(persX(160 + i * 34, y));
          const x1 = Math.round(persX(160 + (i + 1) * 34, y));
          const vent = r === 3 && (i === -4 || i === 3);
          let color = (r + i) & 1 ? "#182a42" : "#14233a";
          if (vent) color = "#0f1a2c";
          R(x0, y, x1 - x0, 1, color);
          if (vent && y % 2 === 0) for (let x = x0 + 1 + (y % 4 === 0 ? 1 : 0); x < x1 - 1; x += 2) R(x, y, 1, 1, "#060c16");
        }
      }
      seams(ctx, h, 86, 34, 12, "#0a1424");
      rows.slice(1, -1).forEach(y => {
        R(0, y, W, 1, "#0a1424");
        R(0, y + 1, W, 1, "#1e3450");
      });
      // Screen reflection on the polished tiles.
      ctx.globalAlpha = 0.1;
      for (let y = 90; y < 122; y += 3) R(128, y, 64, 1, "#3aff7a");
      ctx.globalAlpha = 1;
      R(0, 84, W, 1, "#6fb0c8");
      R(0, 85, W, 1, "#2a4a66");
      R(0, 86, W, 1, "#081020");
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);
      const S = SCREEN;

      // Rack status LEDs.
      const frantic = excitement > 0.4;
      byteLeds(h).forEach(led => {
        const rate = frantic ? led.rate / 4 : led.rate;
        const threshold = led.color === "#ff4a4a" ? 0.75 : 0.35;
        if (hash(led.seed + Math.floor(now / rate)) > threshold) R(led.x, led.y, 1, 1, led.color);
      });

      // Scrolling code.
      const scroll = Math.floor(now / 70);
      const first = Math.floor(scroll / 4);
      const off = scroll % 4;
      let lastY = S.y + 2;
      let lastX = S.x + 3;
      for (let r = 0; r < 9; r += 1) {
        const y = S.y + 2 + r * 4 - off;
        if (y < S.y + 1 || y > S.y + 30) continue;
        const id = (first + r) * 13;
        let x = S.x + 3 + Math.floor(hash(id) * 4) * 4;
        const parts = 1 + Math.floor(hash(id + 1) * 4);
        for (let k = 0; k < parts; k += 1) {
          const w = 3 + Math.floor(hash(id + 2 + k) * 12);
          if (x + w > S.x + S.w - 3) break;
          const roll = hash(id + 7 + k);
          R(x, y, w, 2, roll < 0.2 ? "#b8ffd0" : roll < 0.6 ? "#3aff7a" : "#1fa04a");
          x += w + 2;
        }
        lastY = y;
        lastX = x;
      }
      if (Math.floor(now / 400) % 2 && lastX < S.x + S.w - 5) R(lastX, lastY, 3, 2, "#b8ffd0");

      // Waveform.
      const cy = S.y + 40;
      const amp = 1.5 + excitement * 3.5;
      for (let i = 0; i < S.w - 4; i += 1) {
        const v = Math.round(Math.sin(i * 0.4 - now / 110) * amp * (0.55 + 0.45 * Math.sin(i * 0.09 + now / 700)));
        R(S.x + 2 + i, cy - v, 1, 1, "#5fe0e8");
      }
      if (excitement > 0.5 && Math.floor(now / 180) % 2) {
        R(S.x + 21, S.y + 12, 29, 9, "#3a0a0a");
        R(S.x + 21, S.y + 12, 29, 1, "#ff5a5a");
        R(S.x + 21, S.y + 20, 29, 1, "#ff5a5a");
        h.text(ctx, "ALERT!", S.x + 24, S.y + 14, () => "#ff8a8a");
      }

      // Cold mist drifting up from the floor vents.
      VENTS.forEach(([cx, cy2, drift], v) => {
        for (let k = 0; k < 5; k += 1) {
          const p = (now / 3200 + k / 5 + v * 0.37) % 1;
          ctx.globalAlpha = 0.16 * (1 - p);
          h.disc(ctx, cx + Math.sin(p * 6 + k) * 3 + p * 8 * drift, cy2 - p * 36, 2 + Math.round(p * 5), "#a8e8f0");
        }
      });
      ctx.globalAlpha = 1;

      // Spectators: maintenance drones and robot arms.
      robotArm(ctx, h, 14, 1, now, excitement, 0);
      robotArm(ctx, h, 306, -1, now, excitement, 2);
      drone(ctx, h, 66, 30, now, excitement, 0);
      drone(ctx, h, 254, 30, now, excitement, 2.1);
      drone(ctx, h, 30, 16, now, excitement, 4.2);
      drone(ctx, h, 290, 17, now, excitement, 1.3);
    }
  };

  // ===========================================================================
  // BOBBIE - "Macalanger Gym": warm brick boxing gym with a ring and locals.
  const LAMPS = [40, 160, 280];
  const BAGS = [[70, 0], [250, 1.7]];

  const gymCrowd = lazy(h => {
    const rand = h.seeded(77);
    const pick = list => list[Math.floor(rand() * list.length)];
    const people = [];
    [0, 1].forEach(row => {
      for (let x = 4 + row * 7; x < W; x += row ? 13 + Math.floor(rand() * 8) : 9 + Math.floor(rand() * 5)) {
        people.push({
          x,
          row,
          height: row ? 13 + Math.floor(rand() * 3) : 14 + Math.floor(rand() * 4),
          shirt: pick(row ? ["#d8a03a", "#3a7ac8", "#c83a3a", "#e8e0d0", "#3a9a5a", "#e86a2a"] : ["#6a2a2a", "#2a3a5a", "#5a4a2a", "#3a2a3a", "#2a4a3a", "#7a5a3a"]),
          skin: pick(["#e0a07a", "#a8735a", "#7a4e3c", "#c48d6c", "#5c3a2e"]),
          hair: pick(["#1a1214", "#3a2420", "#8a6a3a", "#1c1a2a", "#c8a050"]),
          cap: row && rand() < 0.4 ? pick(["#c8201a", "#2a5ad8", "#e8e0d0"]) : null,
          phase: rand() * Math.PI * 2,
          cheers: rand() < 0.7,
          sign: false
        });
      }
    });
    const kids = people.filter(p => p.row === 1);
    if (kids.length > 4) {
      kids[2].sign = "GO!";
      kids[kids.length - 3].sign = "POW";
    }
    return people;
  });

  function poster(R, ctx, h, x, y, w, hh, bg, edge) {
    R(x, y, w, hh, bg);
    R(x, y + hh - 1, w, 1, edge);
    R(x + w - 1, y, 1, hh, edge);
    R(x + 1, y + 1, 1, 1, "#d8d8d0");
    R(x + w - 2, y + 1, 1, 1, "#d8d8d0");
  }

  const bobbie = {
    name: "Macalanger Gym",
    build(ctx, h) {
      const R = painter(ctx, h);
      const rand = h.seeded(55);

      // Brick wall.
      R(0, 0, W, 84, "#3a160f");
      const bricks = ["#7a3424", "#70301f", "#843a28", "#6a2c22", "#7e3626"];
      for (let r = 0, y = 8; y < 84; r += 1, y += 5) {
        const off = r % 2 ? 5 : 0;
        for (let x = -off; x < W; x += 11) {
          R(x, y, 10, 4, bricks[Math.floor(rand() * bricks.length)]);
          R(x, y, 10, 1, "#94482f");
          R(x, y + 3, 10, 1, "#5a2418");
          if (rand() < 0.12) R(x + 2 + Math.floor(rand() * 6), y + 1, 2, 1, "#4a1c14");
        }
      }
      // Ceiling, joists, hard shadow bands under the ceiling.
      R(0, 0, W, 8, "#1a0e0c");
      for (let x = 6; x < W; x += 24) R(x, 0, 3, 7, "#2a1712");
      R(0, 6, W, 2, "#2e1a14");
      ctx.globalAlpha = 0.4;
      R(0, 8, W, 5, "#120806");
      ctx.globalAlpha = 0.22;
      R(0, 13, W, 6, "#120806");
      ctx.globalAlpha = 1;

      // Light cones from the lamps (static; lamps drawn on top).
      LAMPS.forEach(x => {
        ctx.globalAlpha = 0.06;
        for (let y = 15; y < 84; y += 1) {
          const half = 3 + Math.floor((y - 15) * 0.42);
          R(x - half, y, half * 2 + 1, 1, "#ffd98a");
        }
        ctx.globalAlpha = 0.05;
        for (let y = 15; y < 84; y += 1) {
          const half = 2 + Math.floor((y - 15) * 0.22);
          R(x - half, y, half * 2 + 1, 1, "#fff0c0");
        }
        ctx.globalAlpha = 1;
      });

      // Painted gym sign.
      R(126, 16, 68, 11, "#1a3022");
      R(127, 17, 66, 9, "#24402e");
      R(126, 16, 68, 1, "#3a5a44");
      R(126, 26, 68, 1, "#10201a");
      const gold = ["#fff0c0", "#f0d890", "#e8c870", "#d8b060", "#c89a50"];
      h.text(ctx, "MACALANGER GYM", 133, 19, row => gold[row]);

      // Fight posters.
      poster(R, ctx, h, 122, 32, 21, 26, "#e8c060", "#a8803a");
      h.text(ctx, "FIGHT", 123, 34, () => "#a8201a");
      h.text(ctx, "NITE", 125, 40, () => "#2a1010");
      h.disc(ctx, 132, 49, 2, "#2a1010");
      R(129, 52, 7, 5, "#2a1010");
      R(127, 50, 2, 3, "#a8201a");
      R(136, 49, 2, 3, "#a8201a");
      R(122, 56, 2, 2, "#7a3424");

      poster(R, ctx, h, 177, 32, 23, 26, "#b8302a", "#7a1a16");
      h.text(ctx, "CHAMP", 179, 34, () => "#fff0c0");
      const star = "#ffd04a";
      R(187, 41, 3, 9, star);
      R(184, 44, 9, 3, star);
      R(185, 49, 2, 2, star);
      R(190, 49, 2, 2, star);
      h.text(ctx, "1987", 181, 51, () => "#f0d8b0");
      R(198, 32, 2, 3, "#7a3424");

      // Side posters (mobile only).
      poster(R, ctx, h, 4, 30, 19, 24, "#2a4a8a", "#1a2a5a");
      h.text(ctx, "BOX", 7, 33, () => "#f0e8d0");
      h.disc(ctx, 13, 45, 3, "#c8302a");
      R(13, 45, 2, 1, "#ff7a6a");
      poster(R, ctx, h, 296, 30, 20, 24, "#e8e0d0", "#a8a090");
      h.text(ctx, "JAB!", 298, 33, () => "#1a1a1a");
      R(300, 41, 12, 1, "#c8302a");
      h.text(ctx, "HOOK", 298, 44, () => "#c8302a");

      // Championship belt in a display case.
      R(146, 33, 28, 22, "#3a2010");
      R(147, 34, 26, 20, "#4a2a18");
      R(148, 35, 24, 17, "#1c2a2e");
      R(148, 35, 24, 1, "#3a5a60");
      R(150, 42, 20, 4, "#141010");
      R(150, 42, 20, 1, "#3a3030");
      h.disc(ctx, 160, 43, 4, "#c8902a");
      h.disc(ctx, 160, 43, 3, "#e8b84a");
      h.disc(ctx, 160, 43, 1, "#ffe08a");
      R(160, 43, 1, 1, "#c8201a");
      R(151, 42, 3, 4, "#e8b84a");
      R(166, 42, 3, 4, "#e8b84a");
      for (let i = 0; i < 6; i += 1) R(162 + i, 36 + i * 2, 1, 2, "#5a7a80");
      R(144, 54, 32, 2, "#2a160a");
      R(144, 54, 32, 1, "#5a3a20");

      // Lamps.
      LAMPS.forEach(x => {
        R(x, 0, 1, 10, "#120806");
        R(x - 3, 10, 7, 1, "#1a3a2a");
        R(x - 4, 11, 9, 1, "#2a5a3a");
        R(x - 5, 12, 11, 2, "#2a5a3a");
        R(x - 4, 11, 3, 1, "#4a8a5a");
        R(x - 2, 14, 5, 1, "#fff4c0");
      });

      // Ring canvas.
      bands(ctx, h, [[84, "#6e6250"], [88, "#7a6c58"], [94, "#857660"], [104, "#8e7e66"], [118, "#96866c"]], 84, 140);
      seams(ctx, h, 86, 64, 6, "#706450");
      LAMPS.forEach(x => {
        ctx.globalAlpha = 0.12;
        oval(ctx, h, x, 100, x === 160 ? 46 : 30, 7, "#ffe8b0");
        ctx.globalAlpha = 1;
      });
      oval(ctx, h, 160, 110, 40, 9, "#8a3a30");
      oval(ctx, h, 160, 110, 37, 7, "#93836a");
      h.text(ctx, "MAC", 149, 106, () => "#8a3a30", 2);
      R(0, 84, W, 1, "#c8b898");
      R(0, 85, W, 1, "#5a4e3e");
      R(0, 131, W, 1, "#a89878");
      R(0, 132, W, 8, "#7a1e1a");
      R(0, 132, W, 1, "#a8302a");
      h.text(ctx, "MACALANGER GYM", 133, 134, () => "#f0e0c0");

      // Front corner posts (screen edges).
      [[0, 1], [314, -1]].forEach(([x]) => {
        R(x, 68, 6, 72, "#b8b8c0");
        R(x + (x ? 0 : 5), 68, 1, 72, "#6a6a74");
        [[76, "#c8201a"], [92, "#f0ece0"], [108, "#2a5ad8"]].forEach(([y, c]) => R(x - 1, y, 8, 7, c));
      });
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);

      // Heavy bags sway; hard after a hit.
      BAGS.forEach(([bx, phase]) => {
        const angle = Math.sin(now / 1100 + phase) * 0.04 + excitement * Math.sin(now / 170 + phase) * 0.22;
        const s = Math.sin(angle);
        line(ctx, h, bx, 8, bx + s * 18, 26, "#8a8a90");
        for (let row = 0; row < 27; row += 1) {
          const y = 26 + row;
          const cx = Math.round(bx + s * (18 + row));
          const half = row === 0 || row === 26 ? 3 : row === 1 || row === 25 ? 4 : 5;
          R(cx - half, y, half * 2, 1, row === 0 ? "#2a0a08" : "#8a1a16");
          if (row > 1 && row < 25) {
            R(cx - half + 1, y, 1, 1, "#d84a3a");
            R(cx + half - 2, y, 2, 1, "#4a0e0c");
          }
          if (row === 12 || row === 13) R(cx - half, y, half * 2, 1, "#e8e0d0");
        }
      });

      // Locals and kids behind the ring.
      gymCrowd(h).forEach(person => {
        const wobble = Math.sin(now / 95 + person.phase);
        const jump = excitement > 0.05 ? Math.round(Math.abs(wobble) * (person.row ? 4 : 3) * excitement) : Math.sin(now / 700 + person.phase) > 0.75 ? 1 : 0;
        const top = 84 - (person.row ? 0 : 6) - person.height - jump;
        const { x, shirt, skin, hair } = person;
        const armsUp = excitement > 0.25 && person.cheers;
        if (person.sign && excitement > 0.2) {
          R(x - 1, top - 4, 1, 4, "#5a3a20");
          R(x - 7, top - 11, 13, 7, "#f0e8d0");
          h.text(ctx, person.sign, x - 6, top - 10, () => "#c8201a");
        } else if (armsUp) {
          const wave = Math.round(wobble);
          R(x - 4, top - 2 + wave, 1, 7, shirt);
          R(x + 4, top - 2 - wave, 1, 7, shirt);
          R(x - 5, top - 4 + wave, 2, 2, person.row ? skin : "#c8201a");
          R(x + 4, top - 4 - wave, 2, 2, person.row ? skin : "#c8201a");
        }
        R(x - 3, top + 5, 7, person.height - 5, shirt);
        R(x - 2, top + 4, 5, 1, shirt);
        R(x - 2, top, 4, 4, skin);
        if (person.cap) {
          R(x - 2, top - 1, 4, 2, person.cap);
          R(x + 2, top, 2, 1, person.cap);
        } else {
          R(x - 2, top, 4, 1, hair);
          R(x - 2, top + 1, 1, 1, hair);
        }
        if (excitement > 0.4) R(x, top + 3, 1, 1, "#3a1010");
      });

      // Back ropes (they buzz after a hit) and back corner posts.
      const buzz = excitement > 0.3 ? Math.round(Math.sin(now / 30) * excitement) : 0;
      [[58, "#d8302a", "#ff7a6a", "#7a1612"], [66, "#e8e4d8", "#ffffff", "#9a968a"], [74, "#2a5ad8", "#6a9aff", "#14307a"]].forEach(([y, c, hi, lo], i) => {
        const yy = y + (i % 2 ? -buzz : buzz);
        R(0, yy, W, 2, c);
        R(0, yy, W, 1, hi);
        R(0, yy + 2, W, 1, lo);
      });
      [8, 309].forEach(x => {
        R(x, 52, 4, 32, "#9a9aa4");
        R(x, 52, 1, 32, "#d8d8e0");
        R(x - 1, 51, 6, 2, "#5a5a64");
        [[57, "#c8201a"], [65, "#f0ece0"], [73, "#2a5ad8"]].forEach(([y, c]) => R(x - 1, y, 6, 4, c));
      });

      // One lamp has a loose bulb.
      if (hash(Math.floor(now / 90)) < 0.06) R(278, 14, 5, 1, "#5a4a2a");
    }
  };

  // ===========================================================================
  // ROCKY - "Lab 7": gunmetal test lab with three bull-shaped holes.
  // Head-on charging bull: legs, chest, shoulders, head, ears and upturned horns.
  const BULL = [[-10, -9, 5, 9], [5, -9, 5, 9], [-11, -22, 22, 14], [-14, -21, 28, 10], [-13, -23, 26, 2], [-6, -29, 12, 15],
    [-11, -27, 5, 3], [6, -27, 5, 3], [-16, -31, 10, 2], [-18, -36, 3, 6], [6, -31, 10, 2], [15, -36, 3, 6]];
  const LAB_WINDOWS = [40, 240];
  const BEACONS = [[121, 0], [199, 1.6]];
  const CABLES = [[138, 142, 21], [214, 208, 19]];

  const labCrew = lazy(h => {
    const rand = h.seeded(909);
    const crew = [];
    LAB_WINDOWS.forEach(wx => {
      [7, 20, 34].forEach(dx => {
        crew.push({
          x: wx + dx + Math.floor(rand() * 3) - 1,
          hair: ["#e8e8e8", "#9a9a9a", "#5a3a2a", "#c8a050", "#2a2020"][Math.floor(rand() * 5)],
          skin: ["#e0a07a", "#a8735a", "#c48d6c", "#7a4e3c"][Math.floor(rand() * 4)],
          tie: ["#5a8ab8", "#c84a3a", "#3a9a5a"][Math.floor(rand() * 3)],
          phase: rand() * Math.PI * 2,
          clipboard: rand() < 0.35
        });
      });
    });
    return crew;
  });

  function bullPieces(cx, bottom, s) {
    return BULL.map(([x, y, w, hh]) => [cx + Math.round(x * s), bottom + Math.round(y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(hh * s))]);
  }

  function bullHole(ctx, h, cx, bottom, s, edge, rand, inner = null) {
    const R = painter(ctx, h);
    const pieces = bullPieces(cx, bottom, s);
    pieces.forEach(([x, y, w, hh]) => R(x - 2, y - 2, w + 4, hh + 4, edge));
    if (inner) pieces.forEach(([x, y, w, hh]) => R(x - 1, y - 1, w + 2, hh + 2, inner));
    pieces.forEach(([x, y, w, hh]) => {
      for (let k = 0; k < (inner ? 3 : 0); k += 1) {
        const side = Math.floor(rand() * 4);
        const px = side < 2 ? x + rand() * w : side === 2 ? x - 3 : x + w + 1;
        const py = side >= 2 ? y + rand() * hh : side === 0 ? y - 3 : y + hh + 1;
        R(px, py, 2 + Math.floor(rand() * 2), 2, edge);
      }
    });
    ctx.save();
    ctx.beginPath();
    pieces.forEach(([x, y, w, hh]) => ctx.rect(x, y, w, hh));
    ctx.clip();
  }

  function hazard(R, y0, y1) {
    R(0, y0, W, y1 - y0, "#14161a");
    for (let y = y0 + 1; y < y1 - 1; y += 1) {
      for (let x = (y % 10) - 10; x < W; x += 10) R(x, y, 5, 1, "#ff8a1a");
    }
    R(0, y0, W, 1, "#4a5864");
    R(0, y1 - 1, W, 1, "#0c0e10");
  }

  const rocky = {
    name: "Lab 7",
    build(ctx, h) {
      const R = painter(ctx, h);
      const rand = h.seeded(717);

      // Gunmetal wall panels with seams, rivets and rust streaks.
      R(0, 0, W, 84, "#262e36");
      for (let x = 0; x < W; x += 32) {
        R(x, 14, 1, 62, "#161b20");
        R(x + 1, 14, 1, 62, "#3a444e");
        [17, 29, 35, 53, 61, 73].forEach(y => {
          R(x + 4, y, 1, 1, "#5a6874");
          R(x + 28, y, 1, 1, "#5a6874");
        });
        if (rand() < 0.6) R(x + 4, 18, 1, 6 + Math.floor(rand() * 10), "#3a2a24");
      }
      [32, 58].forEach(y => {
        R(0, y, W, 1, "#161b20");
        R(0, y + 1, W, 1, "#3a444e");
      });
      ctx.globalAlpha = 0.3;
      R(0, 14, W, 5, "#0a0c0e");
      ctx.globalAlpha = 1;

      // Ceiling with pipes and brackets.
      R(0, 0, W, 9, "#121619");
      R(0, 2, W, 3, "#3a444e");
      R(0, 2, W, 1, "#5a6874");
      R(0, 5, W, 1, "#1a2026");
      R(0, 6, W, 2, "#5a3a2a");
      R(0, 6, W, 1, "#7a5a44");
      for (let x = 12; x < W; x += 40) R(x, 1, 2, 8, "#1a2026");
      hazard(R, 9, 14);
      hazard(R, 76, 84);

      // Observation windows (scientists animate inside) and control consoles.
      LAB_WINDOWS.forEach(x => {
        R(x - 2, 24, 48, 28, "#4a5864");
        R(x - 2, 24, 48, 1, "#6a7a88");
        R(x - 1, 25, 46, 26, "#14181c");
        R(x, 26, 44, 24, "#2a4a5a");
        R(x, 26, 44, 1, "#5a8a9a");
        R(x, 31, 44, 1, "#1e3a48");
        for (let i = 0; i < 6; i += 1) R(x + 3 + i * 7, 29, 2, 2, ["#9fe8ff", "#ff8a1a", "#7aff8a"][i % 3]);
        R(x - 3, 50, 50, 3, "#5a6874");
        R(x - 3, 50, 50, 1, "#8a98a4");
        R(x, 56, 42, 20, "#1a2026");
        R(x, 56, 42, 1, "#3a444e");
        [[4, 58], [22, 58]].forEach(([dx, dy]) => {
          R(x + dx - 1, dy - 1, 16, 12, "#0e1012");
          R(x + dx, dy, 14, 10, "#0a2a5a");
        });
        for (let k = 0; k < 8; k += 1) R(x + 4 + k * 4, 72, 2, 1, ["#ff4a4a", "#7aff8a", "#ffd04a"][k % 3]);
      });

      // Cracks spreading from the hole.
      [[132, 30, 120, 22, 112, 24], [186, 34, 196, 28, 204, 30], [134, 60, 124, 66, 120, 64], [187, 64, 196, 70, 200, 68]].forEach(([a, b, c, d, e, f]) => {
        line(ctx, h, a, b, c, d, "#14181c");
        line(ctx, h, c, d, e, f, "#14181c");
      });

      // Three walls smashed through in a row: each hole bull-shaped, nested.
      bullHole(ctx, h, 160, 84, 1.6, "#7a7e82", rand, "#4a4f55");
      R(120, 20, 80, 64, "#1e252c");
      for (let x = 126; x < 200; x += 18) R(x, 20, 1, 50, "#0f1317");
      R(120, 50, 80, 1, "#0f1317");
      R(120, 70, 80, 4, "#14161a");
      for (let x = 118; x < 200; x += 6) R(x, 71, 3, 2, "#a85a12");
      R(120, 74, 80, 10, "#252b31");
      R(120, 74, 80, 1, "#3e4852");
      bullHole(ctx, h, 160, 77, 0.95, "#3a424a", rand);
      R(130, 30, 60, 50, "#0d1013");
      R(130, 69, 60, 7, "#171b1f");
      R(130, 69, 60, 1, "#2a3036");
      bullHole(ctx, h, 160, 72, 0.5, "#22262a", rand);
      R(140, 40, 40, 40, "#14205a");
      R(140, 46, 40, 6, "#1a2a6a");
      R(140, 66, 40, 14, "#0e2412");
      R(140, 66, 40, 1, "#2a5a2a");
      R(154, 55, 1, 1, "#ffffff");
      R(166, 58, 1, 1, "#9fb8ff");
      R(163, 51, 2, 2, "#f0e8b8");
      ctx.restore();
      ctx.restore();
      ctx.restore();
      // Bent rebar sticking out of the first hole.
      [[137, 54, 131, 50, 129, 52], [183, 52, 189, 49, 192, 51], [138, 36, 133, 32, 130, 33], [182, 36, 187, 32, 190, 33]].forEach(([a, b, c, d, e, f]) => {
        line(ctx, h, a, b, c, d, "#8a4a2a");
        line(ctx, h, c, d, e, f, "#8a4a2a");
      });

      // Warning sign next to the hole.
      R(186, 60, 19, 14, "#14161a");
      R(187, 61, 17, 12, "#e8b81a");
      h.text(ctx, "KEEP", 188, 62, () => "#14161a");
      h.text(ctx, "OUT", 190, 68, () => "#14161a");
      h.text(ctx, "LAB 7", 151, 15, () => "#ff8a1a");

      // Beacon brackets and cables.
      BEACONS.forEach(([x]) => {
        R(x - 3, 26, 7, 2, "#1a2026");
        R(x - 1, 24, 3, 2, "#3a444e");
        R(x - 3, 24, 7, 1, "#4a5864");
      });
      CABLES.forEach(([x0, x1, y1]) => {
        line(ctx, h, x0, 8, x0 + (x1 - x0) * 0.4, 14, "#3a2a6a", 2);
        line(ctx, h, x0 + (x1 - x0) * 0.4, 14, x1, y1, "#3a2a6a", 2);
        R(x1 - 1, y1 + 1, 4, 1, "#d8883a");
        R(x1, y1 + 2, 1, 1, "#d8883a");
        R(x1 + 2, y1 + 2, 1, 1, "#d8883a");
      });

      // Broken containment chamber (left) and smashed console (right).
      R(4, 18, 26, 6, "#3a444e");
      R(4, 18, 26, 1, "#6a7a88");
      h.text(ctx, "07", 13, 19, () => "#ff8a1a");
      R(6, 24, 22, 46, "#0e1a24");
      R(6, 24, 22, 46, "#0e1a24");
      for (let x = 6; x < 28; x += 1) {
        const top = 2 + Math.floor(rand() * 9);
        const bot = 2 + Math.floor(rand() * 12);
        R(x, 24, 1, top, x % 3 ? "#4a8aa8" : "#9fe8ff");
        R(x, 70 - bot, 1, bot, x % 4 ? "#4a8aa8" : "#9fe8ff");
      }
      R(4, 70, 26, 6, "#3a444e");
      R(4, 70, 26, 1, "#6a7a88");
      R(292, 60, 26, 16, "#2a3238");
      R(292, 60, 26, 1, "#4a5864");
      R(295, 62, 18, 9, "#0a1a3a");
      line(ctx, h, 297, 63, 304, 70, "#9fb8d8");
      line(ctx, h, 304, 64, 308, 69, "#9fb8d8");

      // Metal grated floor.
      R(0, 84, W, 56, "#1c2126");
      for (let y = 88; y < H; y += 3) {
        for (let x = (y % 2) * 1; x < W; x += 3) R(x, y, 2, 1, "#111417");
      }
      seams(ctx, h, 87, 48, 9, "#3a434c");
      [92, 102, 116, 134].forEach(y => {
        R(0, y, W, 1, "#3a434c");
        R(0, y + 1, W, 1, "#0c0f12");
      });
      oval(ctx, h, 44, 104, 16, 2, "#1a3a5a");
      R(36, 103, 10, 1, "#3a6a9a");
      R(0, 84, W, 1, "#7a8894");
      R(0, 85, W, 1, "#4a5560");
      R(0, 86, W, 1, "#0c0f12");

      // Rubble from the smash.
      for (let i = 0; i < 26; i += 1) {
        const x = 124 + Math.floor(rand() * 72);
        const y = 83 + Math.floor(rand() * 7);
        const s = 1 + Math.floor(rand() * 3);
        R(x, y, s + 1, s, rand() < 0.5 ? "#4a5058" : "#6a7078");
        R(x, y, s + 1, 1, "#8a9098");
      }
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);

      // Scientists peeking (and panicking) behind the observation glass.
      labCrew(h).forEach((sci, i) => {
        const wx = sci.x < 160 ? 40 : 240;
        ctx.save();
        ctx.beginPath();
        ctx.rect(wx, 26, 44, 24);
        ctx.clip();
        const peek = Math.sin(now / 1300 + sci.phase) > 0.55 ? 3 : 0;
        const jitter = Math.abs(Math.sin(now / 70 + sci.phase)) * excitement * 4;
        const visible = 7 + peek + Math.round(excitement * 9 + jitter);
        const x = sci.x + Math.round(Math.sin(now / 45 + sci.phase) * excitement * 1.5);
        const top = 50 - visible;
        if (excitement > 0.3) {
          const wave = Math.round(Math.sin(now / 60 + i) * 2);
          R(x - 6, top - 1 + wave, 2, 9, "#e8ecf0");
          R(x + 5, top - 1 - wave, 2, 9, "#e8ecf0");
          R(x - 6, top - 2 + wave, 2, 2, sci.skin);
          R(x + 5, top - 2 - wave, 2, 2, sci.skin);
        }
        R(x - 4, top + 5, 9, 30, "#e8ecf0");
        R(x + 3, top + 5, 2, 30, "#b8c0c8");
        R(x, top + 5, 1, 30, sci.tie);
        if (sci.clipboard && excitement <= 0.3) R(x - 4, top + 7, 4, 5, "#a8804a");
        R(x - 2, top, 5, 5, sci.skin);
        R(x - 3, top - 1, 7, 2, sci.hair);
        if (excitement > 0.3) {
          R(x - 3, top - 2, 1, 1, sci.hair);
          R(x + 3, top - 2, 1, 1, sci.hair);
        }
        R(x - 2, top + 2, 2, 1, "#e8f8ff");
        R(x + 1, top + 2, 2, 1, "#e8f8ff");
        R(x, top + 2, 1, 1, "#2a2a2a");
        if (excitement > 0.3) R(x, top + 4, 1, 1, "#3a1010");
        ctx.restore();
      });
      ctx.globalAlpha = 0.14;
      LAB_WINDOWS.forEach(x => {
        for (let k = 0; k < 10; k += 1) R(x + 6 + k * 2, 47 - k * 2, 2, 2, "#ffffff");
        for (let k = 0; k < 7; k += 1) R(x + 26 + k * 2, 47 - k * 2, 1, 2, "#ffffff");
      });
      ctx.globalAlpha = 1;

      // Monitors.
      LAB_WINDOWS.forEach((x, w) => {
        [4, 22].forEach((dx, m) => {
          const sx = x + dx;
          const sy = 58;
          if (excitement > 0.4 && Math.floor(now / 150 + m) % 2) {
            R(sx, sy, 14, 10, "#5a0a0a");
            h.text(ctx, "ERR", sx + 2, sy + 3, () => "#ff6a6a");
            return;
          }
          for (let i = 0; i < 6; i += 1) {
            const hgt = 1 + Math.floor((Math.sin(now / 300 + i * 1.3 + sx) + 1) * 3);
            R(sx + 1 + i * 2, sy + 9 - hgt, 1, hgt, m ? "#3a8cff" : "#9fe8ff");
          }
          R(sx, sy + (Math.floor(now / 90 + w * 3) % 10), 14, 1, "#2a5aa0");
        });
      });

      // Rotating orange beacons.
      BEACONS.forEach(([cx, ph]) => {
        const ang = now / 300 + ph;
        const facing = Math.sin(ang) > 0;
        R(cx - 2, 20, 5, 4, facing ? "#ff8a1a" : "#a84a10");
        R(cx + Math.round(Math.cos(ang) * 2), 20, 1, 4, "#ffd08a");
        if (facing) {
          const dir = Math.cos(ang) > 0 ? 1 : -1;
          ctx.globalAlpha = 0.22;
          R(cx - 5, 17, 11, 10, "#ff8a1a");
          ctx.globalAlpha = 0.07;
          for (let i = 0; i < 8; i += 1) {
            const w = 6;
            R(dir > 0 ? cx + 3 + i * w : cx - 3 - (i + 1) * w, 22 - i, w, 1 + i * 2, "#ff8a1a");
          }
          ctx.globalAlpha = 1;
        }
      });

      // Sparks from the torn cables.
      CABLES.forEach(([, ex, ey], c) => {
        const period = 1300 + c * 500;
        const local = excitement > 0.3 ? now % 450 : now % period;
        const burst = excitement > 0.3 ? Math.floor(now / 450) : Math.floor(now / period);
        if (local > 450) return;
        const seed = burst * 31 + c * 977;
        if (local < 70) {
          R(ex - 2, ey + 2, 5, 1, "#ffffff");
          R(ex, ey, 1, 5, "#ffffff");
          ctx.globalAlpha = 0.3;
          R(ex - 3, ey - 1, 7, 7, "#ffe36a");
          ctx.globalAlpha = 1;
        }
        for (let k = 0; k < 8; k += 1) {
          if (local > 450 * (0.4 + hash(seed + k * 7) * 0.6)) continue;
          const vx = (hash(seed + k) - 0.5) * 0.09;
          const vy = -hash(seed + k * 3 + 1) * 0.05;
          R(ex + vx * local, ey + 2 + vy * local + 0.0002 * local * local, 1, 1, k % 3 ? "#ffe36a" : "#ffffff");
        }
      });

      // Steam puffing from pipe joints.
      [[104, -1], [216, 1]].forEach(([vx, dir], v) => {
        if (Math.sin(now / 2100 + v * 2) < -0.3) return;
        for (let k = 0; k < 5; k += 1) {
          const p = (now / 2400 + k / 5 + v * 0.5) % 1;
          ctx.globalAlpha = 0.24 * (1 - p);
          h.disc(ctx, vx + p * 14 * dir, 9 + p * 12, 1 + Math.round(p * 5), "#c8d0d8");
        }
        ctx.globalAlpha = 1;
      });
    }
  };

  // ===========================================================================
  // NINJA - "Hidden Dojo": moonlit dojo, shoji walls, lanterns, petals.
  const DOJO_LANTERNS = [[136, 9, 0], [184, 9, 1.4], [40, 6, 2.6], [280, 6, 3.7]];
  const SHOJI_HOLES = [[28, 44, 0], [48, 60, 1], [268, 42, 2], [298, 58, 3]];
  const SHADOWS = [[16, 0, 1], [36, 1.7, 0.8], [282, 3.1, 1], [306, 4.4, 0.8]];

  const petals = lazy(h => {
    const rand = h.seeded(1234);
    const list = [];
    for (let i = 0; i < 28; i += 1) {
      list.push({
        x0: rand() * 340,
        y0: rand() * 150,
        vx: -(0.008 + rand() * 0.014),
        vy: 0.007 + rand() * 0.012,
        phase: rand() * 6.28,
        color: ["#ff9ac8", "#ffd0e6", "#e870a8"][i % 3],
        big: rand() < 0.4
      });
    }
    return list;
  });

  function shuriken(R, x, y) {
    R(x - 2, y, 5, 1, "#a8b0c0");
    R(x, y - 2, 1, 5, "#a8b0c0");
    R(x - 1, y - 1, 1, 1, "#d8e0f0");
    R(x + 1, y + 1, 1, 1, "#6a7080");
    R(x, y, 1, 1, "#2a2e3a");
  }

  function roof(R, x, y, w, color, wall, lit) {
    R(x + 3, y + 2, w - 6, 80 - y - 2, wall);
    if (lit) R(x + Math.floor(w / 2) - 2, y + 5, 4, 3, "#ffb05a");
    R(x, y, w, 2, color);
    R(x - 1, y - 1, 2, 1, color);
    R(x + w - 1, y - 1, 2, 1, color);
    R(x + 2, y - 2, w - 4, 2, color);
    R(x + 5, y - 4, w - 10, 2, color);
  }

  const ninja = {
    name: "Hidden Dojo",
    build(ctx, h) {
      const R = painter(ctx, h);
      const rand = h.seeded(808);

      // Night sky (visible through the opening).
      bands(ctx, h, [[0, "#07061a"], [14, "#0d0b24"], [30, "#141032"], [46, "#1c1640"], [62, "#261c4a"]], 0, 84);
      for (let i = 0; i < 40; i += 1) R(120 + Math.floor(rand() * 80), 18 + Math.floor(rand() * 44), 1, 1, rand() < 0.3 ? "#ffffff" : "#8a80c0");
      // Moon with a dithered halo.
      for (let y = 18; y <= 62; y += 1) {
        for (let x = 138; x <= 182; x += 1) {
          const d = Math.hypot(x - 160, y - 40);
          if (d > 17 && d < 21 && (x + y) % 2 === 0) R(x, y, 1, 1, d < 19 ? "#4a3e78" : "#2e2656");
        }
      }
      h.disc(ctx, 161, 41, 17, "#c8bc94");
      h.disc(ctx, 160, 40, 16, "#f4ecc8");
      h.disc(ctx, 154, 35, 2, "#ddd0a8");
      h.disc(ctx, 166, 46, 3, "#ddd0a8");
      R(163, 33, 2, 2, "#ddd0a8");
      R(151, 44, 2, 1, "#ddd0a8");
      R(126, 46, 30, 1, "#3a2e5a");
      R(132, 47, 42, 2, "#2e2450");
      R(168, 28, 26, 1, "#3a2e5a");
      R(174, 29, 18, 1, "#2e2450");

      // Cherry branch in the corner of the opening.
      line(ctx, h, 200, 26, 186, 30, "#1a0e10", 2);
      line(ctx, h, 190, 29, 180, 24, "#1a0e10");
      line(ctx, h, 194, 28, 188, 36, "#1a0e10");
      [[180, 23], [184, 26], [187, 30], [190, 27], [186, 36], [196, 25], [178, 26], [192, 33]].forEach(([x, y]) => {
        R(x - 1, y - 1, 3, 3, "#e870a8");
        R(x, y - 1, 1, 1, "#ffd0e6");
      });

      // Old marketplace rooftops beyond.
      roof(R, 118, 64, 30, "#0a0816", "#120e22", true);
      roof(R, 160, 61, 34, "#0a0816", "#120e22", false);
      roof(R, 140, 69, 26, "#06050f", "#0c0a18", true);
      roof(R, 186, 67, 24, "#06050f", "#0c0a18", false);

      // Shoji walls left and right of the opening.
      [[0, 112], [208, 112]].forEach(([wx, ww]) => {
        R(wx, 16, ww, 68, "#2a1a10");
        for (let px = wx + 2; px < wx + ww - 4; px += 28) {
          const near = (wx === 0 && px > 80) || (wx > 0 && px < 220);
          R(px, 20, 24, 54, near ? "#928670" : "#857860");
          R(px, 20, 24, 1, "#6a5e4a");
          for (let lx = px + 6; lx < px + 24; lx += 6) R(lx, 20, 1, 54, "#3a2618");
          for (let ly = 29; ly < 74; ly += 9) R(px, ly, 24, 1, "#3a2618");
        }
      });
      // Torn holes in the paper.
      SHOJI_HOLES.forEach(([x, y], i) => {
        const s = i % 2 ? 3 : 4;
        R(x - s, y - s + 1, s * 2 + 1, s * 2 - 1, "#140e1c");
        R(x - s + 1, y - s, s * 2 - 1, s * 2 + 1, "#140e1c");
        R(x - s - 1, y - 1, 1, 3, "#140e1c");
        R(x + s + 1, y - 2, 1, 2, "#140e1c");
        R(x - s - 1, y - s, 2, 1, "#c8bca0");
        R(x + s, y + s, 2, 1, "#c8bca0");
        R(x + s + 1, y - s + 1, 1, 2, "#c8bca0");
        R(x - s, y + s + 1, 1, 1, "#c8bca0");
      });

      // Wall scroll.
      R(250, 17, 1, 5, "#1a100c");
      R(245, 22, 12, 1, "#3a2418");
      R(247, 23, 8, 36, "#e8dcc0");
      R(247, 23, 1, 36, "#8a2a2a");
      R(254, 23, 1, 36, "#8a2a2a");
      h.text(ctx, "KIAI", 249, 27, () => "#1a1010", 1, true);
      R(245, 59, 12, 2, "#3a2418");
      R(250, 53, 2, 2, "#c8201a");

      // Ceiling, rafters and the lintel beam.
      R(0, 0, W, 12, "#140c08");
      for (let x = 6; x < W; x += 28) R(x, 0, 4, 12, "#22140c");
      R(0, 12, W, 5, "#4a2e1c");
      R(0, 12, W, 1, "#6a442a");
      R(0, 16, W, 1, "#24160c");

      // Pillars framing the opening, edge posts and baseboards.
      [[112, 8], [200, 8], [0, 3], [317, 3]].forEach(([x, w]) => {
        R(x, 12, w, 72, "#4a2e1c");
        R(x, 12, 1, 72, "#6a442a");
        R(x + w - 1, 12, 1, 72, "#24160c");
        if (w > 4) R(x + 3, 20, 1, 50, "#3e2616");
      });
      R(0, 74, 112, 10, "#3a2418");
      R(208, 74, 112, 10, "#3a2418");
      R(0, 74, 112, 1, "#5a3a24");
      R(208, 74, 112, 1, "#5a3a24");
      // Veranda rail in the opening.
      R(120, 72, 80, 2, "#4a2e1c");
      R(120, 72, 80, 1, "#6a442a");
      for (let x = 122; x < 200; x += 9) R(x, 74, 2, 10, "#3a2418");
      R(120, 82, 80, 2, "#2a1a10");

      // Training dummy.
      R(68, 40, 5, 44, "#6a4a2a");
      R(68, 40, 1, 44, "#8a6a3a");
      R(60, 52, 8, 2, "#5a3a20");
      R(73, 48, 8, 2, "#5a3a20");
      R(66, 34, 9, 8, "#8a6a3a");
      R(66, 34, 9, 1, "#a8884a");
      R(66, 42, 9, 1, "#3a2418");
      R(67, 60, 7, 2, "#c8b080");
      R(67, 46, 7, 1, "#c8b080");

      // Practice shuriken stuck everywhere except the dummy... and one in it.
      shuriken(R, 204, 30);
      shuriken(R, 203, 41);
      shuriken(R, 205, 47);
      shuriken(R, 203, 60);
      shuriken(R, 150, 14);
      shuriken(R, 72, 37);
      shuriken(R, 248, 56);

      // Wooden plank floor in perspective.
      const plankColors = ["#5a3a24", "#634028", "#56361f", "#6a452b", "#5e3c22"];
      for (let y = 84; y < H; y += 1) {
        for (let i = -30; i < 30; i += 1) {
          const x0 = Math.round(persX(160 + i * 20, y));
          const x1 = Math.round(persX(160 + (i + 1) * 20, y));
          R(x0, y, x1 - x0, 1, plankColors[Math.floor(hash(i + 50) * plankColors.length)]);
        }
      }
      seams(ctx, h, 85, 20, 30, "#2a1a10");
      for (let i = -30; i < 30; i += 1) {
        [88 + Math.floor(hash(i + 7) * 14), 104 + Math.floor(hash(i + 99) * 30)].forEach(y => {
          const x0 = Math.round(persX(160 + i * 20, y));
          const x1 = Math.round(persX(160 + (i + 1) * 20, y));
          R(x0 + 1, y, x1 - x0 - 1, 1, "#2a1a10");
        });
      }
      ctx.globalAlpha = 0.3;
      R(0, 86, W, 4, "#0a0610");
      ctx.globalAlpha = 0.15;
      R(0, 90, W, 5, "#0a0610");
      ctx.globalAlpha = 0.09;
      for (let y = 86; y < 132; y += 1) {
        const spread = Math.floor((y - 84) * 0.7);
        R(120 - spread, y, 80 + spread * 2, 1, "#c8c0ff");
      }
      ctx.globalAlpha = 1;
      R(0, 84, W, 1, "#9a6a40");
      R(0, 85, W, 1, "#3a2418");
      shuriken(R, 38, 128);
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);

      // Students' shadows cast on the shoji paper, bouncing with excitement.
      ctx.globalAlpha = 0.32;
      SHADOWS.forEach(([x, phase, size]) => {
        const jump = excitement > 0.05 ? Math.round(Math.abs(Math.sin(now / 110 + phase)) * 6 * excitement) : Math.sin(now / 800 + phase) > 0.8 ? 1 : 0;
        const top = Math.round(74 - 26 * size) - jump;
        h.disc(ctx, x, top + 3, 3, "#1a1028");
        R(x - 1, top - 2, 2, 2, "#1a1028");
        R(x - 4, top + 7, 9, 74 - top - 7, "#1a1028");
        if (excitement > 0.3) {
          const wave = Math.round(Math.sin(now / 90 + phase));
          R(x - 6, top + wave, 2, 9, "#1a1028");
          R(x + 5, top - wave, 2, 9, "#1a1028");
        }
      });
      ctx.globalAlpha = 1;

      // Eyes peeking through the torn holes.
      SHOJI_HOLES.forEach(([x, y, k]) => {
        const cycle = 2400 + k * 330;
        const t = (now + k * 911) % cycle;
        if (t < 140) return;
        const bob = excitement > 0.2 ? Math.round(Math.sin(now / 100 + k) * 1.5 * excitement) : 0;
        if (hash(Math.floor((now + k * 911) / cycle) * 5 + k) > 0.7 + excitement) return;
        R(x - 2, y + bob, 1, 1, "#f0f0ff");
        R(x + 1, y + bob, 1, 1, "#f0f0ff");
      });

      // Students peeking around the pillars, a cat on the rooftops.
      [[121, 1, 0], [199, -1, 1.9]].forEach(([px, dir, phase]) => {
        const lean = 1 + (Math.sin(now / 1500 + phase) > 0.6 ? 2 : 0) + Math.round(excitement * 3);
        const jump = Math.round(Math.abs(Math.sin(now / 120 + phase)) * 3 * excitement);
        const cx = px + dir * lean;
        const top = 58 - jump;
        R(cx - 2, top, 5, 5, "#0e0a1a");
        R(cx - 3, top + 5, 7, 14, "#0e0a1a");
        R(cx - 2, top - 1, 4, 1, "#0e0a1a");
        R(cx + dir, top + 2, 1, 1, "#f0f0ff");
        R(cx + dir * 2, top + 2, 1, 1, "#f0f0ff");
        if (excitement > 0.3) R(cx + dir * 3, top + 4 - jump, 2, 2, "#0e0a1a");
      });
      const catUp = excitement > 0.2 ? Math.round(Math.abs(Math.sin(now / 130)) * 2) : 0;
      const cy = 57 - catUp;
      R(174, cy, 5, 4, "#05040c");
      R(174, cy - 3, 4, 3, "#05040c");
      R(174, cy - 4, 1, 1, "#05040c");
      R(177, cy - 4, 1, 1, "#05040c");
      if (Math.floor(now / 3000) % 4 !== 1 || (now % 3000) > 160) {
        R(175, cy - 2, 1, 1, "#ffe85a");
        R(177, cy - 2, 1, 1, "#ffe85a");
      }
      const tail = Math.round(Math.sin(now / 400) * 1.5);
      R(179, cy + 1 + tail, 1, 3, "#05040c");
      R(180, cy + tail, 1, 2, "#05040c");

      // Paper lanterns: gentle sway and flicker.
      DOJO_LANTERNS.forEach(([ax, len, phase]) => {
        const sway = Math.sin(now / 1100 + phase) * 1.2 + excitement * Math.sin(now / 150 + phase) * 1.5;
        const bx = Math.round(ax + sway);
        const top = 17 + len;
        const glow = 0.13 + 0.05 * Math.sin(now / 90 + phase) + 0.03 * Math.sin(now / 37 + phase * 3);
        ctx.globalAlpha = glow;
        h.disc(ctx, bx, top + 5, 9, "#ffb05a");
        ctx.globalAlpha = glow * 0.8;
        h.disc(ctx, bx, top + 5, 13, "#ff8a3a");
        ctx.globalAlpha = 1;
        line(ctx, h, ax, 17, bx, top, "#1a100c");
        R(bx - 2, top, 5, 1, "#1a100c");
        [5, 7, 7, 7, 7, 7, 5].forEach((w, row) => {
          R(bx - Math.floor(w / 2), top + 1 + row, w, 1, row === 2 || row === 4 ? "#8a1a16" : "#c8302a");
        });
        R(bx - 2, top + 2, 1, 5, "#ff7a50");
        R(bx - 1, top + 3, 3, 3, glow > 0.15 ? "#ffd08a" : "#ffb05a");
        R(bx - 2, top + 8, 5, 1, "#1a100c");
        R(bx, top + 9, 1, 2, "#e8b84a");
      });

      // Drifting cherry blossom petals.
      petals(h).forEach(p => {
        const x = (((p.x0 + now * p.vx) % 340) + 340) % 340 - 10 + Math.sin(now / 600 + p.phase) * 3;
        const y = ((p.y0 + now * p.vy) % 150) - 6;
        const flip = Math.floor(now / 260 + p.phase) % 2;
        if (p.big) R(x, y, flip ? 2 : 1, flip ? 1 : 2, p.color);
        else R(x, y, 1, 1, p.color);
      });
    }
  };

  // ===========================================================================
  // ZOOMBIE - "Night Safari": abandoned research reserve under a green moon.
  const zooEyes = lazy(h => {
    const rand = h.seeded(4242);
    const spots = [[8, 82], [34, 86], [62, 80], [90, 83], [118, 81], [146, 86], [174, 82], [206, 85], [232, 81], [258, 86], [286, 83], [310, 80], [16, 126], [300, 128], [150, 79]];
    return spots.map(([x, y], k) => ({
      x,
      y,
      k,
      color: ["#ffe85a", "#a8ff5a", "#ff6a3a", "#ffe85a"][Math.floor(rand() * 4)],
      gap: rand() < 0.3 ? 3 : 2
    }));
  });

  const fireflies = lazy(h => {
    const rand = h.seeded(5151);
    const list = [];
    for (let i = 0; i < 16; i += 1) list.push({ x: 10 + rand() * 300, y: 40 + rand() * 70, phase: rand() * 6.28 });
    return list;
  });

  const frontGrass = lazy(h => {
    const rand = h.seeded(6161);
    const list = [];
    for (let x = 1; x < W; x += 5 + Math.floor(rand() * 6)) {
      list.push({ x, height: 5 + Math.floor(rand() * 6) + Math.floor(Math.abs(x - 160) / 22), lean: rand() < 0.5 ? -1 : 1 });
    }
    return list;
  });

  function acacia(ctx, h, x, gy, s, rand) {
    const R = painter(ctx, h);
    const c = "#040a07";
    R(x - 1, gy - 24 * s, Math.max(2, Math.round(3 * s)), 24 * s, c);
    line(ctx, h, x, gy - 14 * s, x - 9 * s, gy - 25 * s, c, s > 0.8 ? 2 : 1);
    line(ctx, h, x, gy - 16 * s, x + 10 * s, gy - 26 * s, c, s > 0.8 ? 2 : 1);
    line(ctx, h, x, gy - 18 * s, x + 2 * s, gy - 27 * s, c);
    [[-32, 12], [-31, 22], [-30, 30], [-29, 34], [-28, 36], [-27, 32], [-26, 22]].forEach(([dy, w]) => {
      const half = Math.round((w * s) / 2);
      const jitter = Math.round((rand() - 0.5) * 3 * s);
      R(x - half + jitter, gy + dy * s, half * 2, Math.max(1, Math.round(s)), c);
    });
    for (let i = 0; i < 8 * s; i += 1) R(x - 14 * s + rand() * 28 * s, gy - 25 * s, 1, 1 + Math.floor(rand() * 2), c);
  }

  const zoombie = {
    name: "Night Safari",
    build(ctx, h) {
      const R = painter(ctx, h);
      const rand = h.seeded(3030);

      // Sky and stars.
      bands(ctx, h, [[0, "#030807"], [14, "#06100d"], [28, "#0a1813"], [42, "#0e2018"], [54, "#13291d"], [66, "#193222"]], 0, 84);
      for (let i = 0; i < 60; i += 1) {
        const x = Math.floor(rand() * W);
        const y = Math.floor(rand() * 56);
        if (Math.hypot(x - 170, y - 36) < 24) continue;
        R(x, y, 1, 1, rand() < 0.3 ? "#d8f0d8" : "#5a8a6a");
      }
      // Big moon with halo, craters and cloud strips.
      for (let y = 12; y <= 60; y += 1) {
        for (let x = 146; x <= 194; x += 1) {
          const d = Math.hypot(x - 170, y - 36);
          if (d > 18 && d < 23 && (x + y) % 2 === 0) R(x, y, 1, 1, d < 20 ? "#2e5a3e" : "#1c3a28");
        }
      }
      h.disc(ctx, 171, 37, 18, "#a8b88c");
      h.disc(ctx, 170, 36, 17, "#e4ecc4");
      h.disc(ctx, 163, 30, 3, "#cfd8b0");
      h.disc(ctx, 176, 42, 2, "#cfd8b0");
      h.disc(ctx, 160, 42, 2, "#cfd8b0");
      R(173, 27, 2, 2, "#cfd8b0");
      R(140, 47, 44, 1, "#2a4434");
      R(150, 48, 50, 2, "#1e3628");
      R(184, 25, 30, 1, "#2a4434");
      R(190, 26, 20, 1, "#1e3628");

      // Hills.
      for (let x = 0; x < W; x += 1) {
        const far = 62 + Math.round(Math.sin(x * 0.03) * 3 + Math.sin(x * 0.011 + 1) * 4);
        R(x, far, 1, 84 - far, "#0c1a13");
        const near = 72 + Math.round(Math.sin(x * 0.05 + 2) * 2 + Math.sin(x * 0.017) * 3);
        R(x, near, 1, 84 - near, "#09140f");
      }

      // Acacia silhouettes.
      acacia(ctx, h, 40, 82, 1.3, rand);
      acacia(ctx, h, 130, 74, 0.55, rand);
      acacia(ctx, h, 300, 80, 1.0, rand);
      acacia(ctx, h, 214, 72, 0.4, rand);

      // Observation tower.
      const tc = "#0a1410";
      line(ctx, h, 52, 82, 55, 30, tc, 2);
      line(ctx, h, 72, 82, 69, 30, tc, 2);
      line(ctx, h, 54, 44, 70, 60, tc);
      line(ctx, h, 70, 44, 54, 60, tc);
      line(ctx, h, 53, 64, 71, 78, tc);
      R(48, 28, 30, 3, "#0c1612");
      R(48, 22, 1, 6, tc);
      R(77, 22, 1, 6, tc);
      R(48, 22, 30, 1, tc);
      R(51, 14, 24, 12, tc);
      R(48, 11, 30, 3, "#06100c");
      R(51, 9, 24, 2, "#06100c");
      R(69, 9, 4, 2, "#0a1813");
      R(57, 17, 7, 5, "#030806");
      R(75, 14, 1, 12, "#1e3226");
      R(78, 28, 1, 3, "#1e3226");
      line(ctx, h, 76, 82, 74, 31, tc);
      for (let y = 36; y < 82; y += 5) R(73, y, 4, 1, tc);

      // Abandoned research jeep, rusting, one flat tyre.
      const jx = 266;
      R(jx - 3, 70, 3, 8, "#0c0c0a");
      R(jx, 71, 44, 8, "#5a3a1e");
      R(jx + 28, 69, 16, 3, "#6a4424");
      R(jx, 71, 44, 1, "#8a5a30");
      R(jx + 28, 69, 16, 1, "#9a6a3a");
      [[jx + 6, 74, 4], [jx + 18, 72, 3], [jx + 34, 75, 3]].forEach(([x, y, w]) => R(x, y, w, 2, "#7a3a1a"));
      R(jx + 12, 76, 6, 1, "#3a2410");
      R(jx + 24, 61, 2, 10, "#3a2a14");
      R(jx + 24, 61, 9, 1, "#3a2a14");
      R(jx + 27, 63, 2, 2, "#4a6a5a");
      R(jx + 42, 72, 2, 2, "#2a2a1a");
      h.disc(ctx, jx + 8, 80, 4, "#0c0c0a");
      R(jx + 7, 79, 2, 2, "#4a4a3a");
      R(jx + 31, 80, 10, 4, "#0c0c0a");
      R(jx + 34, 81, 3, 1, "#4a4a3a");
      h.text(ctx, "RS", jx + 4, 73, () => "#a89870");

      // Broken "RESEARCH STATION" sign, sagging toward the snapped post.
      R(146, 58, 2, 26, "#3a2a18");
      R(146, 58, 1, 26, "#5a4428");
      R(176, 72, 2, 12, "#3a2a18");
      R(177, 70, 1, 2, "#5a4428");
      const tilt = c => 56 + Math.floor(c * 0.7);
      for (let c = 0; c < 10; c += 1) {
        const bx = 140 + c * 4;
        R(bx, tilt(c), 4, 15, "#4a3a22");
        R(bx, tilt(c), 4, 1, "#6a5432");
        R(bx, tilt(c) + 14, 4, 1, "#2a1e10");
      }
      [..."RESEARCH"].forEach((ch, i) => {
        const x = 144 + i * 4;
        h.text(ctx, ch, x, tilt(Math.floor((x - 140) / 4)) + 2, () => "#b8a878");
      });
      [..."STATI N"].forEach((ch, i) => {
        const x = 146 + i * 4;
        h.text(ctx, ch, x, tilt(Math.floor((x - 140) / 4)) + 8, () => "#b8a878");
      });
      h.text(ctx, "O", 185, 82, () => "#8a7a58");

      // Savanna ground.
      bands(ctx, h, [[80, "#0b170e"], [84, "#0f1d11"], [90, "#132313"], [98, "#172915"], [110, "#1b2f17"], [124, "#1f3519"]], 84, 140);
      [118, 136, 184, 202].forEach(bx => {
        for (let y = 86; y < H; y += 1) R(persX(bx, y), y, 2, 1, "#262c18");
      });
      for (let i = 0; i < 80; i += 1) {
        const x = Math.floor(rand() * W);
        const y = 88 + Math.floor(rand() * 36);
        const c = rand() < 0.5 ? "#2a4420" : "#203818";
        R(x, y - 2, 1, 2, c);
        R(x - 1, y - 1, 1, 1, c);
        R(x + 1, y - 3, 1, 3, c);
        R(x + 1, y - 3, 1, 1, "#3e5e2a");
      }
      // Back grass edge where things hide.
      for (let x = 0; x < W; x += 1) {
        const hgt = 2 + Math.floor(rand() * 5);
        R(x, 85 - hgt, 1, hgt, x % 3 ? "#0a160d" : "#0e1c10");
      }
      R(0, 84, W, 1, "#0a160d");
      // Front grass.
      for (let x = 0; x < W; x += 2) {
        const hgt = 3 + Math.floor(rand() * 6) + Math.floor(Math.abs(x - 160) / 20);
        R(x, 140 - hgt, 1, hgt, "#081208");
        R(x, 140 - hgt, 1, 1, "#2a4a20");
      }
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);
      const sil = "#1c2a26";
      const rim = "#5a7a66";
      const spot = "#121c18";

      // Elephant (left): ear flaps, trunk trumpets with excitement.
      const flap = Math.round(Math.abs(Math.sin(now / (excitement > 0.2 ? 120 : 700))) * 2);
      oval(ctx, h, 24, 68, 14, 9, sil);
      R(13, 74, 5, 8, sil);
      R(21, 74, 5, 8, sil);
      R(29, 74, 5, 8, sil);
      h.disc(ctx, 39, 64, 6, sil);
      R(30 - flap, 58, 6 + flap, 12, sil);
      R(30 - flap, 58, 1, 12, rim);
      R(11, 61, 12, 1, rim);
      const raise = excitement > 0.3;
      if (raise) {
        line(ctx, h, 44, 64, 49, 56, sil, 2);
        R(49, 54, 3, 2, sil);
      } else {
        line(ctx, h, 44, 66, 46, 80, sil, 2);
      }
      R(43, 68, 2, 1, "#a8b098");
      R(41, 62, 1, 1, "#ffe85a");

      // Giraffe (right): neck nods, bobs harder with excitement.
      const nod = Math.round(Math.sin(now / 1500) * 1 + excitement * Math.sin(now / 120) * 3);
      R(246, 50, 17, 9, sil);
      [247, 251, 257, 261].forEach(x => R(x, 59, 2, 23, sil));
      line(ctx, h, 247, 51, 242, 28 + nod, sil, 3);
      R(236, 24 + nod, 8, 4, sil);
      R(238, 21 + nod, 1, 3, sil);
      R(242, 21 + nod, 1, 3, sil);
      R(244, 25 + nod, 2, 1, sil);
      R(239, 25 + nod, 1, 1, "#ffe85a");
      R(246, 50, 17, 1, rim);
      R(236, 24 + nod, 6, 1, rim);
      line(ctx, h, 245, 50, 240, 28 + nod, rim);
      [[249, 53], [255, 52], [259, 55], [252, 56], [244, 44], [243, 37]].forEach(([x, y]) => R(x, y, 2, 2, spot));

      // Meerkats popping out of the grass.
      [[124, 0], [129, 1], [134, 2], [190, 3], [195, 4]].forEach(([x, k]) => {
        const idle = hash(Math.floor(now / 2200) * 11 + k) > 0.55 ? 6 : 1;
        let up = excitement > 0.15 ? 6 + Math.round(excitement * 2 + Math.abs(Math.sin(now / 90 + k)) * 2 * excitement) : idle;
        up = Math.max(1, up);
        const top = 84 - up;
        R(x - 1, top, 3, up, "#2a3a24");
        R(x - 1, top, 3, 1, "#4a6a3a");
        if (up > 3) {
          R(x - 1, top + 1, 1, 1, "#0a0a08");
          R(x + 1, top + 1, 1, 1, "#0a0a08");
          if (excitement > 0.3) R(x - 2, top + 3, 1, 2, "#2a3a24");
        }
        R(x - 2, 82, 1, 2, "#0a160d");
        R(x + 2, 83, 1, 1, "#0a160d");
      });

      // Glowing eyes blinking in the grass.
      zooEyes(h).forEach(eye => {
        const cycle = 2600 + eye.k * 370;
        const t = (now + eye.k * 977) % cycle;
        if (t < 150) return;
        if (hash(Math.floor((now + eye.k * 977) / cycle) * 7 + eye.k) > 0.55 + excitement * 0.45) return;
        R(eye.x, eye.y, 1, 1, eye.color);
        R(eye.x + eye.gap, eye.y, 1, 1, eye.color);
      });

      // Eerie green fog drifting low across the field.
      ctx.globalAlpha = 0.13 + excitement * 0.05;
      for (let k = 0; k < 10; k += 1) {
        const speed = 0.004 + (k % 4) * 0.002;
        const w = 60 + ((k * 37) % 50);
        const span = W + w + 40;
        const x = ((k * 97 + now * speed) % span) - w - 20;
        const y = 72 + ((k * 11) % 30);
        R(x + 6, y - 1, w - 12, 1, "#6aff96");
        R(x, y, w, 2, "#6aff96");
        R(x + 4, y + 2, w - 8, 1, "#6aff96");
      }
      ctx.globalAlpha = 1;

      // Fireflies.
      fireflies(h).forEach(f => {
        const x = f.x + Math.sin(now / 1700 + f.phase) * 10 + Math.sin(now / 530 + f.phase * 2) * 3;
        const y = f.y + Math.sin(now / 1300 + f.phase * 1.7) * 6;
        if (Math.sin(now / 260 + f.phase * 5) > 0.2) {
          ctx.globalAlpha = 0.25;
          R(x - 1, y - 1, 3, 3, "#c8ff6a");
          ctx.globalAlpha = 1;
          R(x, y, 1, 1, "#f0ffb0");
        } else {
          R(x, y, 1, 1, "#3a5a2a");
        }
      });

      // The tower window flickers now and then.
      if (Math.sin(now / 2700) > 0.4 && hash(Math.floor(now / 110)) < 0.5) {
        R(58, 18, 5, 3, "#3aff6a");
        ctx.globalAlpha = 0.2;
        R(55, 15, 11, 9, "#3aff6a");
        ctx.globalAlpha = 1;
      }

      // Front grass blades swaying.
      frontGrass(h).forEach(blade => {
        const tip = Math.round(Math.sin(now / 700 + blade.x * 0.3) * 1.5) + blade.lean;
        line(ctx, h, blade.x, 139, blade.x + tip, 140 - blade.height, "#0c1a0c");
        R(blade.x + tip, 140 - blade.height, 1, 1, "#3a5a2a");
      });
    }
  };

  // BANANAS - the supermarket produce aisle, with a suspicious fruit-salad display.
  const bananas = {
    name: "Produce Aisle",
    build(ctx, h) {
      const R = painter(ctx, h);
      bands(ctx, h, [[0, "#243c4a"], [10, "#385d64"], [21, "#638477"], [34, "#9aab83"], [48, "#c5c69a"], [63, "#d9d1a3"], [77, "#8f9d71"]], 0, 84);

      // Fluorescent ceiling and the store's very proud produce sign.
      R(0, 0, W, 7, "#18232a");
      [24, 98, 198, 272].forEach(x => {
        R(x, 9, 30, 2, "#f8f0c6");
        R(x + 3, 11, 24, 1, "#f4d97c");
      });
      R(121, 13, 78, 19, "#1e302c");
      R(123, 15, 74, 15, "#477746");
      R(123, 15, 74, 1, "#c6d789");
      h.text(ctx, "PRODUCE", 146, 20, () => "#fff0a8");

      // End-cap shelves frame the fighters and leave the centre aisle open.
      [[0, 72], [248, 72]].forEach(([x, width]) => {
        R(x, 37, width, 3, "#31443e");
        R(x, 40, width, 2, "#bfd09a");
        R(x, 60, width, 3, "#31443e");
        R(x, 63, width, 2, "#bfd09a");
      });
      [[8, 43], [258, 39], [26, 66], [278, 65]].forEach(([x, y], index) => {
        const fruit = index % 2 ? "#d74632" : "#f47718";
        [[0, 0], [7, 2], [14, 0], [21, 2], [28, 0]].forEach(([dx, dy], k) => {
          h.disc(ctx, x + dx, y + dy, 4, k % 2 ? fruit : "#e9bd45");
          R(x + dx, y + dy - 5, 1, 2, "#477746");
        });
      });

      // A low display of orange crates, plus the cart that started it all.
      [[7, 72], [265, 72]].forEach(([x, y]) => {
        R(x, y, 47, 11, "#764b2c");
        R(x, y, 47, 2, "#b5793b");
        for (let dx = 4; dx < 45; dx += 8) R(x + dx, y + 3, 2, 7, "#a66b35");
      });
      R(41, 76, 21, 2, "#78838a");
      R(43, 78, 17, 2, "#b6c0bd");
      h.disc(ctx, 45, 82, 3, "#344047");
      h.disc(ctx, 59, 82, 3, "#344047");
      h.text(ctx, "2 FOR 1", 9, 56, () => "#fff0a8");

      // Pale green supermarket tiles in perspective.
      bands(ctx, h, [[84, "#7b8b68"], [91, "#8b9b72"], [103, "#738565"], [116, "#879671"], [129, "#6d7e62"]], 84, H);
      seams(ctx, h, 85, 26, 16, "#53644d");
      for (let y = 91; y < H; y += 10) {
        const offset = Math.floor(y / 10) % 2 ? 10 : 0;
        for (let x = offset; x < W; x += 52) R(x, y, 1, 1, "#a4ae7d");
      }
      R(0, 84, W, 2, "#d5d5a5");
      R(0, 86, W, 1, "#52604b");
    },
    animate(ctx, h, now, excitement) {
      const R = painter(ctx, h);
      const flicker = Math.floor(now / 520) % 4 === 0;
      if (flicker) {
        ctx.globalAlpha = 0.18;
        R(121, 13, 78, 19, "#f8efbd");
        ctx.globalAlpha = 1;
      }
      const bob = Math.round(Math.sin(now / 105) * (1 + excitement * 2));
      [[17, 46], [287, 43], [36, 68], [269, 67]].forEach(([x, y], index) => {
        const dx = index % 2 ? -bob : bob;
        R(x + dx, y - 5, 1, 2, "#477746");
        R(x + dx - 1, y - 6, 3, 1, "#79b04a");
      });
      if (excitement > 0.12) {
        const spark = Math.floor(now / 70) % 2;
        R(89 + spark * 3, 82, 2, 1, "#fff0a8");
        R(229 - spark * 3, 80, 2, 1, "#fff0a8");
      }
    }
  };

  return { rook, byte, bobbie, rocky, ninja, zoombie, bananas };
})();
