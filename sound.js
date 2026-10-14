// Procedural sound effects for Tactic Fight. Every sound is synthesized live with
// the Web Audio API, so there are no audio files to load and no two hits sound
// exactly alike.
const Sound = (() => {
  const storageKey = "tactic-fight-muted";
  const masterVolume = 0.55;
  let ctx = null;
  let master = null;
  let echoBus = null;
  let noiseBuffer = null;
  let muted = readMuted();

  function readMuted() {
    try {
      return localStorage.getItem(storageKey) === "1";
    } catch {
      return false;
    }
  }

  function writeMuted() {
    try {
      localStorage.setItem(storageKey, muted ? "1" : "0");
    } catch {
      // Storage can be blocked; the toggle still works for this session.
    }
  }

  function audio() {
    if (!ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      ctx = new AudioContextClass();

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -14;
      compressor.ratio.value = 6;
      compressor.connect(ctx.destination);
      master = ctx.createGain();
      master.gain.value = muted ? 0 : masterVolume;
      master.connect(compressor);

      // Shared slapback echo for the big moments: ultimates, KOs and fanfares.
      echoBus = ctx.createGain();
      const delay = ctx.createDelay(1);
      const feedback = ctx.createGain();
      delay.delayTime.value = 0.16;
      feedback.gain.value = 0.38;
      echoBus.connect(master);
      echoBus.connect(delay);
      delay.connect(feedback).connect(delay);
      delay.connect(master);

      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const samples = noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i += 1) samples[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function envelope(start, duration, volume, attack = 0.005) {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    return gain;
  }

  function tone({ type = "sine", freq, to = freq, start, duration, volume = 0.3, attack, detune = 0, out = master }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(freq, start);
    if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, start + duration);
    osc.connect(envelope(start, duration, volume, attack)).connect(out);
    osc.start(start);
    osc.stop(start + duration + 0.05);
    return osc;
  }

  function noise({ start, duration, volume = 0.3, filter = "bandpass", freq = 1000, to = freq, q = 1, attack, out = master }) {
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const biquad = ctx.createBiquadFilter();
    biquad.type = filter;
    biquad.Q.value = q;
    biquad.frequency.setValueAtTime(freq, start);
    if (to !== freq) biquad.frequency.exponentialRampToValueAtTime(to, start + duration);
    source.connect(biquad).connect(envelope(start, duration, volume, attack)).connect(out);
    source.start(start, Math.random() * 0.5);
    source.stop(start + duration + 0.05);
  }

  function vibrato(osc, start, duration, rate, depth) {
    const lfo = ctx.createOscillator();
    const amount = ctx.createGain();
    lfo.frequency.value = rate;
    amount.gain.value = depth;
    lfo.connect(amount).connect(osc.frequency);
    lfo.start(start);
    lfo.stop(start + duration + 0.05);
  }

  function vary(value, spread = 0.06) {
    return value * (1 + (Math.random() * 2 - 1) * spread);
  }

  const effects = {
    // Air being cut by a fist: a resonant noise band sweeping upward.
    swing(t) {
      noise({ start: t, duration: 0.17, volume: 0.22, freq: vary(500), to: vary(2800), q: 2.5, attack: 0.07 });
    },

    // Body blow: a pitch-dropping sine thump with a short crunch on top.
    impact(t, heavy) {
      tone({ freq: vary(150), to: 40, start: t, duration: heavy ? 0.34 : 0.22, volume: 0.75 });
      noise({ start: t, duration: 0.09, volume: 0.5, filter: "lowpass", freq: 3200, to: 300 });
      if (heavy) tone({ type: "square", freq: 90, to: 30, start: t, duration: 0.3, volume: 0.16 });
    },

    // Static discharge layered on a powered-up (1.5x) attack.
    crackle(t) {
      for (let i = 0; i < 9; i += 1) {
        const at = t + i * 0.028 + Math.random() * 0.012;
        noise({ start: at, duration: 0.02, volume: 0.1 + Math.random() * 0.25, filter: "highpass", freq: 3500 + Math.random() * 3000 });
      }
    },

    // Rook is flesh and blood: a short, breathy grunt.
    rookHurt(t) {
      tone({ type: "triangle", freq: vary(250), to: 130, start: t, duration: 0.2, volume: 0.22, attack: 0.02 });
      tone({ type: "sawtooth", freq: vary(185), to: 95, start: t, duration: 0.18, volume: 0.06, attack: 0.02 });
      noise({ start: t, duration: 0.14, volume: 0.08, freq: 900, q: 0.8, attack: 0.02 });
    },

    // Byte is a machine: its voice glitches through random stepped pitches
    // while its power dips.
    byteHurt(t) {
      const glitch = ctx.createOscillator();
      glitch.type = "square";
      for (let i = 0; i < 12; i += 1) glitch.frequency.setValueAtTime(200 + Math.random() * 1400, t + i * 0.024);
      glitch.connect(envelope(t, 0.3, 0.09)).connect(master);
      glitch.start(t);
      glitch.stop(t + 0.35);
      tone({ freq: 1400, to: 180, start: t, duration: 0.26, volume: 0.12 });
    },

    // Guard connects: inharmonic partials ring like struck sheet metal.
    clang(t, pitch = 1) {
      const base = vary(540, 0.03) * pitch;
      [1, 2.76, 5.4, 8.93].forEach((ratio, index) => {
        tone({ freq: base * ratio, start: t, duration: 0.9 / (index + 1), volume: 0.22 / (index + 1), attack: 0.002 });
      });
      noise({ start: t, duration: 0.04, volume: 0.35, filter: "highpass", freq: 5000 });
    },

    // Both fighters block: two guards scrape off each other over a tense hum.
    standoff(t) {
      effects.clang(t, 0.85);
      effects.clang(t + 0.11, 1.12);
      const hum = tone({ freq: 55, start: t, duration: 0.8, volume: 0.22, attack: 0.12 });
      vibrato(hum, t, 0.8, 6, 3);
    },

    // A successful block charges the counter. Rook gets a bright rising
    // arpeggio, Byte gets a darker, minor-key square-wave version.
    powerUp(t, side) {
      const player = side === "player";
      const notes = player ? [523, 659, 784, 1047] : [262, 311, 392, 523];
      notes.forEach((freq, index) => {
        tone({ type: player ? "triangle" : "square", freq, start: t + index * 0.055, duration: 0.2, volume: player ? 0.13 : 0.06 });
      });
    },

    // Ultimate: a 0.38s wind-up riser, then a laser blast with a sub-bass boom.
    ultimate(t, side) {
      const player = side === "player";
      tone({ type: "sawtooth", freq: player ? 110 : 82, to: player ? 1200 : 900, start: t, duration: 0.38, volume: 0.1, attack: 0.3, out: echoBus });
      if (!player) tone({ type: "square", freq: 82, to: 900, start: t, duration: 0.38, volume: 0.05, attack: 0.3, detune: 30 });
      const blast = t + 0.38;
      tone({ type: "square", freq: player ? 2200 : 1600, to: 70, start: blast, duration: 0.45, volume: 0.16, out: echoBus });
      tone({ freq: 85, to: 28, start: blast, duration: 0.75, volume: 0.85 });
      noise({ start: blast, duration: 0.6, volume: 0.45, filter: "lowpass", freq: 1400, to: 90 });
    },

    // The player's ultimate has charged: a shimmering major-seventh chime.
    ultimateReady(t) {
      [1047, 1319, 1568, 1976].forEach((freq, index) => {
        tone({ type: "triangle", freq, start: t + index * 0.07, duration: 0.9, volume: 0.07, out: echoBus });
      });
      noise({ start: t, duration: 0.5, volume: 0.06, filter: "highpass", freq: 8000, attack: 0.1 });
    },

    // Pressing Ultimate before it is ready: a low "nope" buzz.
    denied(t) {
      tone({ type: "square", freq: 140, start: t, duration: 0.07, volume: 0.1 });
      tone({ type: "square", freq: 110, start: t + 0.09, duration: 0.1, volume: 0.1 });
    },

    // Boxing ring bell: ding-ding.
    bell(t) {
      [0, 0.3].forEach(offset => {
        [1, 2.4, 3.9, 5.3].forEach((ratio, index) => {
          tone({ freq: 880 * ratio, start: t + offset, duration: 1.3 / (index + 1), volume: 0.16 / (index + 1), attack: 0.002 });
        });
      });
    },

    // Knockout: a slowed-down, echoing body drop.
    ko(t) {
      tone({ freq: 120, to: 24, start: t, duration: 1.2, volume: 0.9, out: echoBus });
      noise({ start: t, duration: 1, volume: 0.4, filter: "lowpass", freq: 800, to: 60 });
    },

    // Victory: a chiptune fanfare that resolves into a held major chord.
    win(t) {
      [523, 659, 784, 1047].forEach((freq, index) => {
        tone({ type: "square", freq, start: t + index * 0.11, duration: 0.12, volume: 0.09 });
      });
      const chord = t + 0.48;
      [1047, 1319, 1568].forEach(freq => {
        const note = tone({ type: "triangle", freq, start: chord, duration: 1.1, volume: 0.1, attack: 0.02, out: echoBus });
        vibrato(note, chord, 1.1, 5.5, freq * 0.008);
      });
      tone({ type: "square", freq: 523, start: chord, duration: 1.1, volume: 0.05, attack: 0.02 });
    },

    // Defeat: the power drains out, then a sad-trombone wah-wah.
    lose(t) {
      tone({ type: "sawtooth", freq: 440, to: 40, start: t, duration: 1.1, volume: 0.08 });
      [392, 370, 349].forEach((freq, index) => {
        tone({ type: "triangle", freq, start: t + 0.5 + index * 0.32, duration: 0.3, volume: 0.16, attack: 0.03 });
      });
      const last = tone({ type: "triangle", freq: 330, start: t + 1.46, duration: 1, volume: 0.16, attack: 0.03 });
      vibrato(last, t + 1.46, 1, 5, 9);
    },

    // Ninja Main's yelp: higher and squeakier than Rook's grunt.
    ninjaHurt(t) {
      tone({ type: "triangle", freq: vary(560), to: 300, start: t, duration: 0.16, volume: 0.2, attack: 0.01 });
      tone({ type: "sawtooth", freq: vary(420), to: 230, start: t, duration: 0.12, volume: 0.05, attack: 0.01 });
    },

    // ZOO-mbie's groan: a slow, wobbling sawtooth through rotten air.
    zombieHurt(t) {
      const groan = tone({ type: "sawtooth", freq: vary(120), to: 70, start: t, duration: 0.4, volume: 0.12, attack: 0.04 });
      vibrato(groan, t, 0.4, 7, 6);
      noise({ start: t, duration: 0.3, volume: 0.07, freq: 500, q: 1.5, attack: 0.04 });
    },

    // BANANAS' cartoon squeak: a bright chirp that wobbles on the way down.
    bananasHurt(t) {
      const squeak = tone({ type: "triangle", freq: vary(780), to: 390, start: t, duration: 0.2, volume: 0.16, attack: 0.015 });
      vibrato(squeak, t, 0.2, 12, 24);
      tone({ type: "sine", freq: 1040, to: 720, start: t + 0.04, duration: 0.11, volume: 0.07 });
    },

    // FRUIT NUCLEAR: rising citrus chirps followed by an echoing squashy boom.
    fruitNuclear(t) {
      [440, 660, 880, 1320].forEach((freq, index) => {
        tone({ type: "square", freq, to: freq * 1.3, start: t + index * 0.09, duration: 0.18, volume: 0.06, out: echoBus });
      });
      const blast = t + 0.52;
      tone({ type: "triangle", freq: 180, to: 42, start: blast, duration: 0.55, volume: 0.65, out: echoBus });
      noise({ start: blast, duration: 0.42, volume: 0.32, filter: "lowpass", freq: 1700, to: 120, attack: 0.01 });
      tone({ type: "sine", freq: 96, to: 38, start: blast, duration: 0.7, volume: 0.72 });
    },

    // Quick sidestep: a bright, short whoosh.
    dodge(t) {
      noise({ start: t, duration: 0.12, volume: 0.18, freq: vary(2000), to: 5200, q: 3, attack: 0.03 });
      tone({ type: "triangle", freq: 600, to: 1300, start: t, duration: 0.08, volume: 0.05 });
    },

    // Three thrown stars zinging out in a ragged spread.
    shuriken(t) {
      for (let i = 0; i < 3; i += 1) {
        const at = t + i * 0.06 + Math.random() * 0.02;
        tone({ freq: vary(3200), to: 1700, start: at, duration: 0.1, volume: 0.05 });
        noise({ start: at, duration: 0.03, volume: 0.08, filter: "highpass", freq: 6000 });
      }
    },

    // Smoke bomb: a pop followed by a long hiss.
    smoke(t) {
      tone({ freq: 220, to: 60, start: t, duration: 0.09, volume: 0.4 });
      noise({ start: t, duration: 0.6, volume: 0.2, freq: 1800, to: 700, q: 0.7, attack: 0.04 });
    },

    // Fortress Mode: armour plates slam shut and the hydraulics vent.
    armor(t) {
      effects.clang(t, 0.5);
      tone({ type: "square", freq: 55, start: t, duration: 0.25, volume: 0.12 });
      noise({ start: t + 0.08, duration: 0.35, volume: 0.12, filter: "highpass", freq: 3500, attack: 0.02 });
    },

    // Bull Rush: an engine revving up under heavy footsteps.
    rush(t) {
      tone({ type: "sawtooth", freq: 55, to: 170, start: t, duration: 0.3, volume: 0.1, attack: 0.05 });
      tone({ type: "square", freq: 40, to: 90, start: t, duration: 0.3, volume: 0.06, attack: 0.05 });
      [0, 0.09, 0.18].forEach(offset => tone({ freq: 90, to: 40, start: t + offset, duration: 0.08, volume: 0.4 }));
    },

    // Full Charge Overdrive: the power core surges with crackling arcs.
    overdrive(t) {
      tone({ type: "sawtooth", freq: 70, to: 1500, start: t, duration: 0.45, volume: 0.09, attack: 0.35, out: echoBus });
      tone({ type: "square", freq: 72, to: 1520, start: t, duration: 0.45, volume: 0.04, attack: 0.35, detune: 25 });
      effects.crackle(t + 0.15);
      effects.crackle(t + 0.32);
    },

    // Uppercut: a rising whoosh that ends on a heavy blow.
    uppercut(t) {
      noise({ start: t, duration: 0.32, volume: 0.2, freq: 300, to: 4200, q: 2, attack: 0.2 });
      tone({ type: "triangle", freq: 180, to: 900, start: t, duration: 0.32, volume: 0.08, attack: 0.2 });
    },

    // Safari Senses: two sonar pings echoing out.
    senses(t) {
      [0, 0.22].forEach(offset => tone({ freq: 1400, start: t + offset, duration: 0.35, volume: 0.1, attack: 0.002, out: echoBus }));
    },

    // Almost Invisible: a dramatic ta-da, then a poof.
    vanish(t) {
      tone({ type: "square", freq: 784, start: t, duration: 0.1, volume: 0.07 });
      tone({ type: "square", freq: 1047, start: t + 0.11, duration: 0.18, volume: 0.07 });
      noise({ start: t + 0.25, duration: 0.25, volume: 0.25, filter: "highpass", freq: 2500, to: 600 });
    },

    // The ninja is spotted mid-pose: a comic boing.
    boing(t) {
      const spring = tone({ freq: 220, to: 440, start: t, duration: 0.35, volume: 0.15 });
      vibrato(spring, t, 0.35, 14, 40);
    },

    // ZOO-mbie's roar calls the swarm.
    roar(t) {
      const roar = tone({ type: "sawtooth", freq: 170, to: 85, start: t, duration: 0.7, volume: 0.14, attack: 0.05 });
      vibrato(roar, t, 0.7, 9, 12);
      noise({ start: t, duration: 0.6, volume: 0.15, freq: 450, q: 1.2, attack: 0.05 });
    },

    // Infected wildlife thundering across the street.
    stampede(t) {
      noise({ start: t, duration: 1, volume: 0.3, filter: "lowpass", freq: 260, attack: 0.2 });
      for (let i = 0; i < 12; i += 1) {
        tone({ freq: vary(95), to: 40, start: t + i * 0.07 + Math.random() * 0.03, duration: 0.07, volume: 0.3 });
      }
    },

    // Tiny UI tick when hovering a move.
    hover(t) {
      tone({ type: "triangle", freq: 1800, start: t, duration: 0.03, volume: 0.04 });
    }
  };

  return {
    // Plays a named effect `delay` seconds from now. Extra arguments are passed
    // through to the effect.
    play(name, delay = 0, ...args) {
      if (muted || !audio()) return;
      effects[name](ctx.currentTime + 0.01 + delay, ...args);
    },
    // Like play, but only once the browser has unlocked audio after a user
    // gesture. Used for hover feedback, which never counts as a gesture.
    playIfUnlocked(name, ...args) {
      if (ctx && ctx.state === "running") this.play(name, 0, ...args);
    },
    isMuted() {
      return muted;
    },
    toggleMuted() {
      muted = !muted;
      writeMuted();
      if (master) master.gain.setTargetAtTime(muted ? 0 : masterVolume, ctx.currentTime, 0.02);
      return muted;
    }
  };
})();
