// Procedural 16-bit soundtrack for Tactic Fight. Like sound.js, every note is
// synthesized live with the Web Audio API. Songs are written as compact pattern
// strings (see SONGS below) and played by a small lookahead sequencer, so loops
// are sample-accurate and seamless.
const Music = (() => {
  const storageKey = "tactic-fight-muted";
  const volume = 0.18;
  const lookahead = 0.12;
  const tickMs = 25;
  const fadeTime = 0.4;
  const gate = 0.92;

  let ctx = null;
  let rig = null;
  let timer = null;
  let requested = null;
  let playing = null;
  let muted = readMuted();
  const compiled = {};

  function readMuted() {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // Songs.
  //
  // chords: one entry per bar, separated by "|". Several chords in one bar split
  //   it evenly; "." holds the previous chord.
  // lead / lead2: note names ("C5", "Bb4", "F#5"), "." holds, "-" rests. The
  //   number of tokens in a bar sets its grid: 8 = eighths, 16 = sixteenths.
  //   lead2 may also be a number: the lead transposed by that many semitones.
  // bass / arp: the same grid syntax, but tokens are chord degrees played over
  //   the current chord: 1 3 5 7 8 (chord tones), 2 4 6 b3 b6 b7 (fixed),
  //   "^" / "_" shift an octave, "*" strikes the whole chord. Patterns loop.
  // drums: one 16th-note line per drum, looping; "x" hit, "X" accent, "g" ghost.
  //   fill replaces lines in the last bar of every `fillEvery` bars.
  // ---------------------------------------------------------------------------
  const SONGS = {
    // Heroic arcade anthem in C with a mixolydian bVII lift.
    title: {
      bpm: 140, crash: 8, fillEvery: 4,
      chords: "C | Bb | F | G | C | Bb | F G | C | Am | F | C | G | Am | F | G | G",
      lead: "C5 . G4 C5 E5 . G5 . | F5 . D5 . Bb4 . D5 F5 | A5 . . G5 F5 . C5 . | D5 . . . G4 A4 B4 D5 |" +
        "C5 . G4 C5 E5 . G5 . | Bb5 . A5 . F5 . D5 . | C5 . F5 . G5 . B5 . | C6 . . . G5 . E5 . |" +
        "E5 . . D5 C5 . A4 . | F5 . E5 . C5 . A4 . | G5 . . E5 C5 . E5 G5 | D5 . . . B4 . G4 . |" +
        "E5 . A5 . G5 . E5 . | F5 . A5 . C6 . A5 . | B5 . . . G5 . . . | D6 . C6 B5 A5 . G5 .",
      lead2: -12,
      bass: "1 1 8 1 5 1 8 5",
      arp: "1 3 5 8 1 3 5 8 1 3 5 8 1 3 5 8",
      drums: { k: "x.......x.x.....", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
      fill: { s: "....X...x.x.XxXX" },
      inst: { lead: "pulse25", lead2: "square", bass: "tri", arp: "pulse12" }
    },

    // Character select: laid-back descending sequence over maj7 chords.
    select: {
      bpm: 120, fillEvery: 8,
      chords: "Fmaj7 | Em7 | Dm7 | G | Fmaj7 | Em7 | Am | Gsus4 G",
      lead: "E5 . . C5 . . A4 C5 | D5 . . B4 . . G4 B4 | C5 . . A4 . . F4 A4 | B4 . . . D5 . . . |" +
        "E5 . . C5 . . A4 C5 | D5 . . B4 . . G4 B4 | C5 . E5 . A5 . G5 . | D5 . . C5 . . B4 .",
      lead2: 12,
      bass: "1 . . 5 8 . 5 .",
      arp: "1 3 5 7 8 7 5 3",
      pad: true,
      drums: { k: "x.....x...x.....", s: "....x.......x...", h: "x.x.x.x.x.x.x.x." },
      fill: { s: "....x.......x.xx" },
      inst: { lead: "pulse12", lead2: "pluck", bass: "tri", arp: "pluck" },
      mix: { lead2: 0.05, pad: 0.04 }
    },

    // Story underscore: tiptoeing pizzicato in D minor over a clock tick-tock.
    story: {
      bpm: 90,
      chords: "Dm | Dm | Bb | A | Dm | Dm | Gm | A7",
      lead: "- - A4 - D5 - F5 - | E5 - D5 - C#5 - D5 - | - - F5 - Bb5 - A5 - | G5 - F5 - E5 . . - |" +
        "- - A4 - D5 - F5 - | G#5 - A5 - - - F5 - | D5 - - E5 F5 - G5 - | E5 - - - C#5 - A4 -",
      bass: "1 - 5 - 8 - 5 -",
      pad: true,
      drums: { k: "x...............", b: "x.......x.......", w: "....x.......x..." },
      inst: { lead: "pluck", bass: "tri" },
      mix: { lead: 0.26, pad: 0.06, drums: 0.4 }
    },

    // Rook / Neon District: driving E minor street rock.
    rook: {
      bpm: 150, crash: 8, fillEvery: 4,
      chords: "Em | D | C | D | Em | D | C | B",
      lead: "E5 . . . B4 . E5 . F#5 . G5 . . . F#5 . | E5 . D5 . . . A4 . D5 . E5 . F#5 . A5 . |" +
        "G5 . . . . . E5 . . . C5 . E5 . G5 . | F#5 . . . E5 . . . D5 . . . A4 . . . |" +
        "E5 . . . B4 . E5 . F#5 . G5 . . . B5 . | A5 . . . F#5 . . . D5 . F#5 . A5 . . . |" +
        "G5 . . . E5 . G5 . C6 . . . B5 . A5 . | B5 . . . . . . . A5 . F#5 . D#5 . . .",
      lead2: -12,
      bass: "1 . 1 1 8 . 1 1 1 . 1 1 8 . 5 .",
      arp: "1 5 8 5 1 5 8 5 1 5 8 5 1 5 8 5",
      drums: { k: "x.......x.x.....", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
      fill: { s: "....X...x.xxXXXX" },
      inst: { lead: "pulse25", lead2: "square", bass: "bassSquare", arp: "pluck" },
      mix: { arp: 0.04 }
    },

    // Byte / data centre: A minor techno with fast sixteenth arpeggios.
    byte: {
      bpm: 140, crash: 8, fillEvery: 8,
      chords: "Am | Am | F | G | Am | Am | Dm | E",
      lead: "A5 . . . E5 . G5 . | A5 . C6 . B5 . G5 . | A5 . . . F5 . C5 . | D5 . . . G5 . B5 . |" +
        "A5 . . . E5 . G5 . | A5 . C6 . E6 . D6 . | C6 . A5 . F5 . D5 . | B5 . . . G#5 . . .",
      lead2: -12,
      bass: "1 8 1 8 1 8 1 8",
      arp: "1 5 8 ^3 1 5 8 ^3 1 5 8 ^3 ^5 ^3 8 5",
      drums: { k: "x...x...x...x...", p: "....x.......x...", h: "xx..xx..xx..xx..", o: "..x...x...x...x." },
      fill: { p: "....x.......x.xx" },
      inst: { lead: "pulse12", lead2: "pulse25", bass: "bassSquare", arp: "pulse12" },
      mix: { arp: 0.07 }
    },

    // Bobbie / boxing gym: swung E minor funk with slap bass and chord stabs.
    bobbie: {
      bpm: 100, swing: 0.28, fillEvery: 8,
      chords: "Em7 | Em7 | A7 | A7 | Em7 | Em7 | C7 B7 | Em7",
      lead: "- - B4 . D5 . E5 . - - G5 - E5 . D5 - | E5 . . . - - - - B4 - D5 - E5 . - - |" +
        "- - E5 . G5 . A5 . - - C#6 - A5 . G5 - | A5 . . . - - - - E5 - G5 - A5 . - - |" +
        "- - B4 . D5 . E5 . - - G5 - E5 . D5 - | G5 . . . F#5 . E5 . D5 . . . B4 . - - |" +
        "E5 . G5 . Bb5 . . . A5 . F#5 . D#5 . . . | E5 . . . D5 . B4 . A4 . B4 . - - - -",
      lead2: -12,
      bass: "1 . - 1 8 - - 1 - 1 7 - 5 - 8 -",
      arp: "- - * - - * - - - - * - - * - -",
      drums: { k: "x.....x...x..x..", s: "....X..g.g..X..g", h: "x.x.x.x.x.x.x.x." },
      fill: { s: "....X..g.gX.XgXX" },
      inst: { lead: "pulse25", lead2: "square", bass: "slap", arp: "stab" },
      mix: { arp: 0.07, bass: 0.34 }
    },

    // Rocky / industrial lab: stomping D minor march with metal clangs.
    rocky: {
      bpm: 118, crash: 8, fillEvery: 4,
      chords: "Dm | Dm | Bb | A | Dm | Dm | Gm | A",
      lead: "D4 . . . F4 . E4 D4 | A4 . . . G4 . F4 . | F4 . Bb4 . D5 . . . | C#5 . . . A4 . . . |" +
        "D5 . . . C5 . A4 . | F4 . G4 . A4 . . . | Bb4 . A4 . G4 . D4 . | E4 . F4 . E4 . C#4 .",
      lead2: -12,
      bass: "1 . . . 1 . 1 . 1 . . . _5 . 1 .",
      drums: { k: "x...x...x...x.x.", s: "....X.......X...", c: "......x.......x." },
      fill: { s: "....X...x.x.XxXX" },
      inst: { lead: "square", lead2: "pulse25", bass: "bassSquare" },
      mix: { lead: 0.24, lead2: 0.12 }
    },

    // Ninja / abandoned dojo: D "in" scale (D Eb G A Bb) over taiko drums.
    ninja: {
      bpm: 160, fillEvery: 4,
      chords: "D5 | D5 | Eb | D5 | Gm | Gm | Eb | D5",
      lead: "D5 . Eb5 D5 A4 . D5 . | G5 . A5 . Bb5 . A5 G5 | Bb5 . . . G5 . Eb5 . | D5 . . . A4 . . . |" +
        "D6 . . Bb5 . A5 G5 . | A5 . . G5 . D5 . . | Eb5 . G5 . Bb5 . Eb6 . | D6 . . . A5 . Eb5 .",
      lead2: -12,
      bass: "1 1 8 1 5 1 8 1",
      arp: "1 5 8 5 ^5 5 8 5",
      drums: { t: "x.......x..x....", T: "....x.......x.xx", b: "x.x.x.x.x.x.x.x." },
      fill: { T: "x.x.x.x.xxxxXXXX" },
      inst: { lead: "flute", lead2: "pulse12", bass: "tri", arp: "pluck" },
      mix: { lead2: 0.07, arp: 0.05 }
    },

    // ZOO-mbie / night safari: swung A minor creep with a wobbly lead.
    zoombie: {
      bpm: 110, swing: 0.33, swingUnit: 2, fillEvery: 4,
      chords: "Am | Am | Dm | E7 | Am | F | E7 | E7",
      lead: "A4 . . C5 E5 . Eb5 . | D5 . C#5 . C5 . A4 . | D5 . . F5 A5 . Ab5 . | G#5 . F5 . E5 . D5 . |" +
        "A5 . . . E5 . C5 . | C6 . A5 . F5 . Eb5 . | D5 . . . B4 . G#4 . | E4 . F4 . F#4 . G#4 .",
      lead2: -12,
      bass: "1 . 5 . b6 . 5 .",
      drums: { t: "x.....x.x...x...", T: "....x.......x.x.", h: "..x...x...x...x.", b: "........x......." },
      fill: { T: "....x...x.x.x.x." },
      inst: { lead: "wobble", lead2: "pulse12", bass: "tri" },
      mix: { lead2: 0.06 }
    },

    // Victory: four triumphant bars with a harmony line a third below.
    victory: {
      bpm: 132, crash: 4,
      chords: "C | F | G | C",
      lead: "G5 . E5 . G5 . C6 . | A5 . . . C6 . A5 . | B5 . D6 . G6 . F6 . | E6 . . . C6 . . .",
      lead2: "E5 . C5 . E5 . G5 . | F5 . . . A5 . F5 . | G5 . B5 . D6 . D6 . | C6 . . . G5 . . .",
      bass: "1 . 8 . 5 . 8 .",
      arp: "1 3 5 8 1 3 5 8 1 3 5 8 1 3 5 8",
      drums: { k: "x...x...x...x...", s: "....X.......X...", h: "x.x.x.x.x.x.x.x." },
      inst: { lead: "pulse25", lead2: "pulse12", bass: "tri", arp: "pluck" },
      mix: { lead2: 0.12, arp: 0.05 }
    },

    // Defeat: a slow, sighing A minor loop.
    defeat: {
      bpm: 72,
      chords: "Am | F | Dm | E",
      lead: "E5 . . . D5 . C5 . | C5 . . . A4 . . . | F5 . . . E5 . D5 . | G#4 . . . B4 . . .",
      bass: "1 . . . 5 . . .",
      pad: true,
      drums: { k: "x..............." },
      inst: { lead: "soft", bass: "tri" },
      mix: { pad: 0.06, drums: 0.3 }
    }
  };

  const defaultInst = { lead: "pulse25", lead2: "square", bass: "tri", arp: "pulse12", pad: "pad" };
  const defaultMix = { lead: 0.22, lead2: 0.1, bass: 0.3, arp: 0.06, pad: 0.05, drums: 0.55 };
  const pans = { lead: 0, lead2: 0.25, bass: 0, arp: -0.3, pad: 0 };

  // ---------------------------------------------------------------------------
  // Instruments. Each voice layers two oscillators (pulse waves of different
  // duty cycles, slightly detuned) for that thick SNES / Mega Drive chorus.
  // sustain is the level the note decays toward with time constant `decay`.
  // ---------------------------------------------------------------------------
  const presets = {
    pulse25: { waves: ["p25", "p12"], mix: [1, 0.5], detune: 7, cutoff: 5200, attack: 0.008, decay: 0.35, sustain: 0.7, release: 0.08, vibrato: 16 },
    pulse12: { waves: ["p12", "p25"], mix: [1, 0.5], detune: 9, cutoff: 6000, attack: 0.006, decay: 0.3, sustain: 0.6, release: 0.07, vibrato: 14 },
    square: { waves: ["p50", "p25"], mix: [1, 0.5], detune: 6, cutoff: 3000, attack: 0.01, decay: 0.4, sustain: 0.75, release: 0.08, vibrato: 12 },
    pluck: { waves: ["p50", "p25"], mix: [1, 0.4], detune: 5, cutoff: 3800, attack: 0.004, decay: 0.09, sustain: 0.03, release: 0.06 },
    flute: { waves: ["triangle", "p50"], mix: [1, 0.3], detune: 4, cutoff: 4000, attack: 0.03, decay: 0.5, sustain: 0.85, release: 0.1, vibrato: 22 },
    soft: { waves: ["triangle", "p50"], mix: [1, 0.35], detune: 5, cutoff: 2600, attack: 0.04, decay: 0.8, sustain: 0.8, release: 0.25, vibrato: 18 },
    wobble: { waves: ["p25", "p50"], mix: [1, 0.5], detune: 12, cutoff: 3600, attack: 0.02, decay: 0.5, sustain: 0.75, release: 0.1, wobble: 45 },
    tri: { waves: ["triangle", "p50"], mix: [1, 0.22], detune: 0, cutoff: 1400, attack: 0.006, decay: 0.3, sustain: 0.8, release: 0.06 },
    bassSquare: { waves: ["p50", "p25"], mix: [1, 0.5], detune: 4, cutoff: 900, attack: 0.005, decay: 0.25, sustain: 0.7, release: 0.05 },
    slap: { waves: ["p25", "triangle"], mix: [0.7, 1], detune: 0, cutoff: 5000, sweep: [2600, 380, 0.12], attack: 0.003, decay: 0.15, sustain: 0.4, release: 0.05 },
    stab: { waves: ["p12"], mix: [1], detune: 0, cutoff: 5000, attack: 0.003, decay: 0.06, sustain: 0.05, release: 0.04 },
    pad: { waves: ["triangle", "p50"], mix: [1, 0.15], detune: 6, cutoff: 1800, attack: 0.25, decay: 1, sustain: 0.9, release: 0.5 }
  };

  // Band-limited pulse wave with the given duty cycle (Fourier series).
  function pulseWave(c, duty) {
    const size = 64;
    const real = new Float32Array(size);
    const imag = new Float32Array(size);
    for (let i = 1; i < size; i += 1) real[i] = (2 / (i * Math.PI)) * Math.sin(i * Math.PI * duty);
    return c.createPeriodicWave(real, imag);
  }

  // Output chain for one AudioContext (live or offline): input -> compressor ->
  // master gain -> speakers.
  function makeRig(c, gainValue) {
    const input = c.createGain();
    const compressor = c.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 12;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.2;
    const master = c.createGain();
    master.gain.value = gainValue;
    input.connect(compressor).connect(master).connect(c.destination);

    const noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const samples = noise.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;

    const waves = { p12: pulseWave(c, 0.125), p25: pulseWave(c, 0.25), p50: pulseWave(c, 0.5) };
    return { ctx: c, input, master, noise, waves };
  }

  // Attack, decay toward sustain, then a linear release to silence: no clicks.
  function shape(param, t, dur, peak, p) {
    const attack = Math.min(p.attack, dur * 0.5);
    const floor = peak * p.sustain;
    const atEnd = floor + (peak - floor) * Math.exp(-(dur - attack) / p.decay);
    param.setValueAtTime(0, t);
    param.linearRampToValueAtTime(peak, t + attack);
    param.setTargetAtTime(floor, t + attack, p.decay);
    param.setValueAtTime(atEnd, t + dur);
    param.linearRampToValueAtTime(0, t + dur + p.release);
  }

  function note(r, dest, p, midi, t, dur, peak) {
    const c = r.ctx;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const end = t + dur + p.release + 0.02;
    const amp = c.createGain();
    shape(amp.gain, t, dur, peak, p);

    let out = amp;
    if (p.sweep) {
      // Slap bass: the filter snaps shut right after the pluck.
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 4;
      filter.frequency.setValueAtTime(p.sweep[0], t);
      filter.frequency.exponentialRampToValueAtTime(p.sweep[1], t + p.sweep[2]);
      amp.connect(filter);
      out = filter;
    }
    out.connect(dest);

    // Vibrato fades in on long notes; the wobble lead wobbles all the time.
    let depth = null;
    if (p.wobble || (p.vibrato && dur > 0.3)) {
      const lfo = c.createOscillator();
      depth = c.createGain();
      lfo.frequency.value = p.wobble ? 6 : 5.5;
      depth.gain.setValueAtTime(p.wobble ? p.wobble : 0, t);
      if (!p.wobble) {
        depth.gain.setValueAtTime(0, t + 0.15);
        depth.gain.linearRampToValueAtTime(p.vibrato, t + 0.35);
      }
      lfo.connect(depth);
      lfo.start(t);
      lfo.stop(end);
    }

    p.waves.forEach((wave, index) => {
      const osc = c.createOscillator();
      if (r.waves[wave]) osc.setPeriodicWave(r.waves[wave]);
      else osc.type = wave;
      osc.frequency.value = freq;
      osc.detune.value = index ? p.detune : 0;
      if (depth) depth.connect(osc.detune);
      const level = c.createGain();
      level.gain.value = p.mix[index];
      osc.connect(level).connect(amp);
      osc.start(t);
      osc.stop(end);
    });
  }

  // --- Drums -----------------------------------------------------------------

  function blip(r, out, type, from, to, t, dur, vol) {
    const c = r.ctx;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6);
    const amp = c.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(vol, t + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    osc.connect(amp).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  function hiss(r, out, type, freq, q, t, dur, vol) {
    const c = r.ctx;
    const source = c.createBufferSource();
    source.buffer = r.noise;
    source.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    const amp = c.createGain();
    amp.gain.setValueAtTime(0, t);
    amp.gain.linearRampToValueAtTime(vol, t + 0.002);
    amp.gain.exponentialRampToValueAtTime(0.0005, t + dur);
    source.connect(filter).connect(amp).connect(out);
    source.start(t, Math.random() * 0.5);
    source.stop(t + dur + 0.01);
  }

  const drums = {
    // Kick: short sine pitch drop.
    k(r, o, t, v) {
      blip(r, o, "sine", 160, 42, t, 0.28, 0.95 * v);
    },
    // Snare: noise burst plus a body tone.
    s(r, o, t, v) {
      hiss(r, o, "bandpass", 1900, 0.7, t, 0.17, 0.6 * v);
      blip(r, o, "triangle", 200, 140, t, 0.09, 0.4 * v);
    },
    // Closed and open hi-hat ticks.
    h(r, o, t, v) {
      hiss(r, o, "highpass", 7500, 1, t, 0.035, 0.22 * v);
    },
    o(r, o, t, v) {
      hiss(r, o, "highpass", 6500, 1, t, 0.22, 0.16 * v);
    },
    // Clap: three ragged noise bursts.
    p(r, o, t, v) {
      [0, 0.011, 0.023].forEach(offset => hiss(r, o, "bandpass", 1300, 1.2, t + offset, offset > 0.02 ? 0.15 : 0.03, 0.5 * v));
    },
    // Crash cymbal.
    r(r, o, t, v) {
      hiss(r, o, "highpass", 4500, 0.8, t, 1.2, 0.18 * v);
    },
    // Metallic clang: inharmonic partials like struck sheet metal.
    c(r, o, t, v) {
      [1, 2.76, 5.4].forEach((ratio, index) => blip(r, o, "sine", 420 * ratio, 410 * ratio, t, 0.5 / (index + 1), (0.22 * v) / (index + 1)));
      hiss(r, o, "highpass", 5000, 1, t, 0.04, 0.25 * v);
    },
    // Big taiko and the higher shime drum.
    t(r, o, t, v) {
      blip(r, o, "sine", 105, 52, t, 0.5, 0.9 * v);
      hiss(r, o, "lowpass", 500, 1, t, 0.15, 0.35 * v);
    },
    T(r, o, t, v) {
      blip(r, o, "sine", 230, 160, t, 0.17, 0.55 * v);
      hiss(r, o, "bandpass", 1200, 1, t, 0.05, 0.25 * v);
    },
    // Wood blocks: high "tick" and low "tock".
    b(r, o, t, v) {
      blip(r, o, "triangle", 1250, 1200, t, 0.05, 0.3 * v);
      hiss(r, o, "bandpass", 3000, 2, t, 0.015, 0.15 * v);
    },
    w(r, o, t, v) {
      blip(r, o, "triangle", 830, 800, t, 0.06, 0.3 * v);
    }
  };

  // ---------------------------------------------------------------------------
  // Pattern parsing.
  // ---------------------------------------------------------------------------
  const semis = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const qualities = {
    "": [0, 4, 7], m: [0, 3, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11],
    sus4: [0, 5, 7], "5": [0, 7], dim: [0, 3, 6]
  };
  const fixedDegrees = { 1: 0, b2: 1, 2: 2, b3: 3, 4: 5, b5: 6, b6: 8, 6: 9, b7: 10, 8: 12 };

  function midiOf(name) {
    const match = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!match) return null;
    const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
    return 12 * (Number(match[3]) + 1) + semis[match[1]] + accidental;
  }

  function chordOf(name) {
    const match = /^([A-G])([#b]?)(.*)$/.exec(name);
    if (!match) return { root: 0, iv: qualities[""] };
    const accidental = match[2] === "#" ? 1 : match[2] === "b" ? -1 : 0;
    return { root: (semis[match[1]] + accidental + 12) % 12, iv: qualities[match[3]] || qualities[""] };
  }

  function splitBars(text) {
    return text.split("|").map(bar => bar.trim().split(/\s+/).filter(Boolean));
  }

  // Chord active at every 16th step of the song.
  function chordSteps(text) {
    const steps = [];
    let current = chordOf("C");
    splitBars(text).forEach(tokens => {
      tokens.forEach((token, index) => {
        if (token !== ".") current = chordOf(token);
        const from = Math.round((index * 16) / tokens.length);
        const to = Math.round(((index + 1) * 16) / tokens.length);
        for (let s = from; s < to; s += 1) steps.push(current);
      });
    });
    return steps;
  }

  // Walks a looping pattern across the song; resolve() turns a token into notes.
  function sequence(text, total, resolve) {
    const pattern = splitBars(text);
    const events = [];
    let last = null;
    for (let bar = 0; bar * 16 < total; bar += 1) {
      const tokens = pattern[bar % pattern.length];
      const len = 16 / tokens.length;
      if (16 % tokens.length) console.warn("Music: bar with " + tokens.length + " tokens in", text);
      tokens.forEach((token, index) => {
        const at = bar * 16 + Math.round(index * len);
        if (token === ".") {
          if (last) last.len += len;
          return;
        }
        last = null;
        if (token === "-") return;
        const notes = resolve(token, at);
        if (notes) {
          last = { at, len, notes };
          events.push(last);
        }
      });
    }
    return events;
  }

  function degree(token, chord, base) {
    if (token === "*") return chord.iv.map(iv => base + chord.root + iv);
    let shift = 0;
    let name = token;
    while (name[0] === "^" || name[0] === "_") {
      shift += name[0] === "^" ? 12 : -12;
      name = name.slice(1);
    }
    let iv;
    if (name === "3") iv = chord.iv.find(i => i >= 3 && i <= 5) ?? 7;
    else if (name === "5") iv = chord.iv.find(i => i >= 6 && i <= 8) ?? 7;
    else if (name === "7") iv = chord.iv.find(i => i >= 9 && i <= 11) ?? 10;
    else iv = fixedDegrees[name];
    if (iv === undefined) {
      const midi = midiOf(name);
      return midi === null ? null : [midi + shift];
    }
    return [base + chord.root + iv + shift];
  }

  // Turns a song definition into a list of events for every 16th step.
  function compile(id) {
    if (compiled[id]) return compiled[id];
    const def = SONGS[id];
    const chords = chordSteps(def.chords);
    const total = chords.length;
    const steps = Array.from({ length: total }, () => []);
    const add = (voice, events) => events.forEach(e => steps[e.at % total].push({ v: voice, notes: e.notes, len: e.len }));
    const melody = text => sequence(text, total, token => {
      const midi = midiOf(token);
      return midi === null ? null : [midi];
    });

    const lead = melody(def.lead);
    add("lead", lead);
    if (typeof def.lead2 === "number") add("lead2", lead.map(e => ({ at: e.at, len: e.len, notes: e.notes.map(n => n + def.lead2) })));
    else if (def.lead2) add("lead2", melody(def.lead2));
    if (def.bass) add("bass", sequence(def.bass, total, (token, at) => degree(token, chords[at], 12 * ((def.bassOctave || 2) + 1))));
    if (def.arp) add("arp", sequence(def.arp, total, (token, at) => degree(token, chords[at], 60)));

    // Pad: a sustained chord for every chord change.
    if (def.pad) {
      let start = 0;
      for (let s = 1; s <= total; s += 1) {
        if (s === total || chords[s] !== chords[start]) {
          add("pad", [{ at: start, len: s - start, notes: chords[start].iv.map(iv => 60 + chords[start].root + iv) }]);
          start = s;
        }
      }
    }

    const fillEvery = def.fillEvery || 0;
    const fill = def.fill || {};
    const kits = Object.keys(Object.assign({}, def.drums, fill));
    for (let s = 0; s < total; s += 1) {
      const bar = Math.floor(s / 16);
      const inFill = fillEvery && bar % fillEvery === fillEvery - 1;
      kits.forEach(kit => {
        const line = ((inFill && fill[kit]) || (def.drums || {})[kit] || "").replace(/[\s|]/g, "");
        const hit = line ? line[s % line.length] : ".";
        if (hit === ".") return;
        steps[s].push({ drum: kit, vol: hit === "X" ? 1 : hit === "g" ? 0.35 : 0.75 });
      });
      if (def.crash && s % (16 * def.crash) === 0) steps[s].push({ drum: "r", vol: 1 });
    }

    compiled[id] = {
      def, total, steps,
      stepDur: 60 / def.bpm / 4,
      inst: Object.assign({}, defaultInst, def.inst),
      mix: Object.assign({}, defaultMix, def.mix)
    };
    return compiled[id];
  }

  // ---------------------------------------------------------------------------
  // Playback.
  // ---------------------------------------------------------------------------

  // One playing copy of a song with its own fader, voice buses and lead echo.
  function createInstance(r, id, start) {
    const c = r.ctx;
    const song = compile(id);
    const out = c.createGain();
    out.gain.setValueAtTime(0, start);
    out.gain.linearRampToValueAtTime(1, start + 0.05);
    out.connect(r.input);

    // Dotted-eighth echo on the lead for that 16-bit sheen.
    const echo = c.createDelay(1);
    const feedback = c.createGain();
    const wet = c.createGain();
    echo.delayTime.value = song.stepDur * 3;
    feedback.gain.value = 0.3;
    wet.gain.value = 0.3;
    echo.connect(feedback).connect(echo);
    echo.connect(wet).connect(out);

    const voices = {};
    Object.keys(pans).forEach(voice => {
      const filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = presets[song.inst[voice]].cutoff;
      filter.Q.value = 0.7;
      const level = c.createGain();
      level.gain.value = song.mix[voice];
      filter.connect(level);
      if (pans[voice] && c.createStereoPanner) {
        const pan = c.createStereoPanner();
        pan.pan.value = pans[voice];
        level.connect(pan).connect(out);
      } else {
        level.connect(out);
      }
      if (voice === "lead") level.connect(echo);
      voices[voice] = filter;
    });
    const drumBus = c.createGain();
    drumBus.gain.value = song.mix.drums;
    drumBus.connect(out);

    return { id, rig: r, song, out, voices, drumBus, step: 0, time: start };
  }

  // Schedules the current step of an instance and moves it one 16th forward.
  function advance(instance) {
    const { song, rig: r } = instance;
    const def = song.def;
    const unit = def.swingUnit || 1;
    let time = instance.time;
    if (def.swing && instance.step % unit === 0 && (instance.step / unit) % 2 === 1) time += def.swing * unit * song.stepDur;

    song.steps[instance.step].forEach(event => {
      if (event.drum) {
        drums[event.drum](r, instance.drumBus, time, event.vol);
        return;
      }
      const preset = presets[song.inst[event.v]];
      const peak = 1 / Math.sqrt(event.notes.length);
      event.notes.forEach(midi => note(r, instance.voices[event.v], preset, midi, time, event.len * song.stepDur * gate, peak));
    });
    instance.step = (instance.step + 1) % song.total;
    instance.time += song.stepDur;
  }

  function fadeOut(instance) {
    const now = instance.rig.ctx.currentTime;
    const gain = instance.out.gain;
    gain.cancelScheduledValues(now);
    gain.setValueAtTime(gain.value, now);
    gain.linearRampToValueAtTime(0, now + fadeTime);
    setTimeout(() => instance.out.disconnect(), (fadeTime + 2) * 1000);
  }

  function tick() {
    if (!playing || ctx.state !== "running" || document.hidden) return;
    const now = ctx.currentTime;
    // After a throttled or hidden stretch, skip ahead instead of catching up.
    if (playing.time < now) playing.time = now + 0.02;
    while (playing.time < now + lookahead) {
      if (muted) {
        playing.step = (playing.step + 1) % playing.song.total;
        playing.time += playing.song.stepDur;
      } else {
        advance(playing);
      }
    }
  }

  function startRequested() {
    if (!ctx || ctx.state !== "running" || !requested) return;
    if (playing && playing.id === requested) return;
    if (playing) fadeOut(playing);
    playing = createInstance(rig, requested, ctx.currentTime + 0.05);
    if (!timer) timer = setInterval(tick, tickMs);
    tick();
  }

  return {
    // Starts looping a track, crossfading from whatever was playing. Before the
    // first user gesture the request is only remembered.
    play(track) {
      if (!SONGS[track]) return;
      if (track === requested && (playing || !ctx)) return;
      requested = track;
      startRequested();
    },
    stop() {
      requested = null;
      if (playing) fadeOut(playing);
      playing = null;
      clearInterval(timer);
      timer = null;
    },
    // Call from the first pointerdown / keydown: browsers only allow audio after
    // a user gesture.
    unlock() {
      if (!ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        ctx = new AudioContextClass();
        rig = makeRig(ctx, muted ? 0 : volume);
        ctx.onstatechange = startRequested;
      }
      if (ctx.state === "suspended") ctx.resume().then(startRequested, () => {});
      startRequested();
    },
    setMuted(value) {
      muted = Boolean(value);
      if (rig) rig.master.gain.setTargetAtTime(muted ? 0 : volume, ctx.currentTime, 0.05);
    },
    current() {
      return requested;
    },
    // Test hook: renders the first `seconds` of a track offline.
    _render(track, seconds = 4) {
      if (!SONGS[track]) return Promise.reject(new Error("Unknown track " + track));
      const rate = 44100;
      const offline = new OfflineAudioContext(2, Math.ceil(rate * seconds), rate);
      const instance = createInstance(makeRig(offline, volume), track, 0.02);
      while (instance.time < seconds) advance(instance);
      return offline.startRendering();
    }
  };
})();
