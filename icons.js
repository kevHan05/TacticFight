// 12x12 pixel-art icons for the move buttons, one per animation key. Each is
// drawn with a 1px dark outline onto a 14x14 canvas that CSS scales up.
const MoveIcons = (() => {
  const OUTLINE = "#140e16";
  const ICONS = {
    punch: {
      colors: { a: "#e0302a", b: "#ff8a6a", c: "#f4f0e6" },
      rows: ["............", "...aaaaaa...", "..abaabaaa..", "..abaabaaaa.", "..aaaaaaaaa.", ".aaaaaaaaaa.", ".abbbbaaaaa.", ".aaaaaaaaaa.", "..aaaaaaaa..", "...aaaaaa...", "...cccccc...", "...cccccc..."]
    },
    combo: {
      colors: { a: "#e0302a", b: "#ffe36a" },
      rows: ["aaa.........", "aaa..b......", "aaa.bbb.....", "....aaa.....", "....aaa..b..", "....aaa.bbb.", "........aaa.", "........aaa.", "........aaa.", "..b.........", ".b.b..b.b...", "............"]
    },
    uppercut: {
      colors: { a: "#e0302a", b: "#ffe36a", c: "#f4f0e6" },
      rows: [".....bb.....", "....bbbb....", "...bbbbbb...", ".....bb.....", "...aaaaa....", "..abaabaa...", "..aaaaaaa...", "..aaaaaaa...", "..aaaaaaa...", "...aaaaa....", "...ccccc....", "...ccccc...."]
    },
    rush: {
      colors: { a: "#4a535c", b: "#c2c8d0", c: "#3fc0ff", d: "#0e1114" },
      rows: ["b..........b", "bb........bb", ".bb.aaaa.bb.", "..baaaaaab..", "...aaaaaa...", "..acaaaaca..", "..aaaaaaaa..", "...aaaaaa...", "...aaaaaa...", "....adda....", "....aaaa....", "............"]
    },
    overdrive: {
      colors: { a: "#3fc0ff", b: "#c8f4ff" },
      rows: [".......aaa..", "......aba...", ".....aba....", "....aba.....", "...aaaaaaa..", "...abbbbaa..", "......aba...", ".....aba....", "....aba.....", "...aa.......", "..aa........", ".a.........."]
    },
    swing: {
      colors: { a: "#d8f07a", b: "#8ab83a" },
      rows: ["a...a...a...", ".a...a...a..", ".a...a...a..", "..a...a...a.", "..a...a...a.", "..b...b...b.", "...b...b...b", "...b...b...b", "............", "............", "............", "............"]
    },
    shuffle: {
      colors: { a: "#93b85a", b: "#5e8a3a" },
      rows: [".......aa...", "......aaaa..", "......aaaa..", ".......aa...", "......b.b...", "............", "..aa........", ".aaaa.......", ".aaaa.......", "..aa........", ".b.b........", "............"]
    },
    fireball: {
      colors: { a: "#ff7a3a", b: "#c8402a", c: "#ffe36a" },
      rows: ["....b.......", "...bb..b....", "..bbab.bb...", ".bbaaabbab..", ".baaccaabb..", "bbacccca.b..", "baaccccab...", "baacccaab...", ".baaaaab....", "..bbbbb.....", "............", "............"]
    },
    plasma: {
      colors: { a: "#2f9a74", b: "#c2f078", c: "#ffffff" },
      rows: ["....aaaa....", "..aa....aa..", ".a..bbbb..a.", ".a.bccccb.a.", "a.bccccccb.a", "a.bccccccb.a", "a.bccccccb.a", ".a.bccccb.a.", ".a..bbbb..a.", "..aa....aa..", "....aaaa....", "............"]
    },
    shuriken: {
      colors: { a: "#5e6670", b: "#b8c0c8", c: "#eef2f6", d: "#140e16" },
      rows: [".....a......", "....aba.....", "....aba.....", "...abcba....", "aaabcdcbaaa.", ".bbcdddcbb..", "aaabcdcbaaa.", "...abcba....", "....aba.....", "....aba.....", ".....a......", "............"]
    },
    stampede: {
      colors: { a: "#5e8a3a", b: "#a8ff60" },
      rows: ["..aa....aa..", ".aaaa..aaaa.", ".aaaa..aaaa.", "..aa....aa..", "aa..aaaa..aa", "aa.aaaaaa.aa", "..aaaaaaaa..", "..aaabbaaa..", "..aaaaaaaa..", "...aaaaaa...", "....aaaa....", "............"]
    },
    citrusKick: {
      colors: { a: "#f47718", b: "#ffcc4d", c: "#3286e8", d: "#fff7db" },
      rows: ["....bb......", "..aabbaa....", ".aabbbbaa...", ".abcccbba...", ".abddcbba...", "..abbbba....", "...aaaa.....", "..aa..aa....", ".aa....aa...", "............", "............", "............"]
    },
    orangeBounce: {
      colors: { a: "#f47718", b: "#ffcc4d", c: "#3286e8", d: "#fff7db" },
      rows: [".....bb.....", "......b.....", "..aabbaa....", ".aabbbbaa...", ".abcccbba...", ".abddcbba...", "..abbbba....", "...aaaa.....", "............", "..b......b..", "............", "............"]
    },
    peelOut: {
      colors: { a: "#f47718", b: "#ffcc4d", c: "#fff7db" },
      rows: ["............", "............", "..aabbaa....", ".abbbbaa....", "abbbbbbbba..", "abbbccbbba..", "abbbccbbba..", ".abbbbaa....", "..aabbaa....", "............", "..cc..cc....", "............"]
    },
    fruitNuclear: {
      colors: { a: "#f47718", b: "#ffcc4d", c: "#fff2a8", d: "#55a83e" },
      rows: [".....d......", "....ddd.....", "...aabbaa...", "..aabbbbaa..", ".aabcccbbaa.", "aabcccccbbaa", ".aabcccbbaa.", "..aabbbbaa..", "...aabbaa...", "..a......a..", ".a........a.", "............"]
    },
    vanish: {
      colors: { a: "#2a2236", b: "#e0a77a", c: "#ffffff" },
      rows: ["....aaaa....", "..aaaaaaaa..", ".aaaaaaaaaa.", ".aaaaaaaaaa.", ".abbbbbbbba.", ".abcbbbbcba.", ".abbbbbbbba.", ".aaaaaaaaaa.", "..aaaaaaaa..", "..a.a..a.a..", "............", "............"]
    },
    block: {
      colors: { a: "#1a6fd0", b: "#9fe8ff", c: "#3a8cff" },
      rows: [".aaaaaaaaaa.", "abbbbbbbbbba", "abccccccccba", "abccbbbbccba", "abcbccccbcba", "abcbccccbcba", ".abcbccbcba.", ".abccbbccba.", "..abccccba..", "...abccba...", "....abba....", ".....aa....."]
    },
    dash: {
      colors: { a: "#f4f0e6", b: "#ffe36a", c: "#e0302a" },
      rows: ["............", "......aaa...", "......acaa..", "......aaaa..", "b...aaaaaa..", "....aaaaaaa.", "bb.aaaaaaaaa", "...aaaaaaaaa", "b..ccccccccc", "............", "............", "............"]
    },
    fortress: {
      colors: { a: "#4a535c", b: "#8a96a0", c: "#3fc0ff", d: "#0e1114" },
      rows: ["a.aa.aa.aa.a", "aaaaaaaaaaaa", ".abbbbbbbba.", ".abccbbccba.", ".abccbbccba.", ".abbbbbbbba.", ".abbbccbbba.", ".abbcddcbba.", ".abbcddcbba.", ".abbcddcbba.", ".aaaaaaaaaa.", "............"]
    },
    smoke: {
      colors: { a: "#8a8498", b: "#c4bece", c: "#ffffff" },
      rows: ["............", "....aaa.....", "...abbba....", "..abbbbbaaa.", ".aabbbbbbbba", "abbbbbbbbbba", "abbbbcbbbbba", "abbbccbbbcba", ".abbbbbbbba.", "..aaaaaaaa..", "............", "............"]
    },
    senses: {
      colors: { a: "#4a6a22", b: "#d8f07a", c: "#ff8a1e", d: "#140e16" },
      rows: ["............", "....aaaa....", "..aabbbbaa..", ".abbbccbbba.", "abbbcddcbbba", "abbbcddcbbba", ".abbbccbbba.", "..aabbbbaa..", "....aaaa....", "............", "..b..b..b...", "............"]
    }
  };

  function draw(canvas, anim) {
    const icon = ICONS[anim] || ICONS.punch;
    canvas.width = 14;
    canvas.height = 14;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 14, 14);
    const solid = (x, y) => y >= 0 && y < 12 && x >= 0 && x < 12 && icon.rows[y][x] !== ".";
    ctx.fillStyle = OUTLINE;
    for (let y = -1; y <= 12; y += 1) {
      for (let x = -1; x <= 12; x += 1) {
        if (solid(x, y)) continue;
        if (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1)) ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
    icon.rows.forEach((row, y) => {
      [...row].forEach((key, x) => {
        if (key === ".") return;
        ctx.fillStyle = icon.colors[key];
        ctx.fillRect(x + 1, y + 1, 1, 1);
      });
    });
  }

  return { draw };
})();
