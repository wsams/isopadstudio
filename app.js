(() => {
  "use strict";

  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const COLORS = [
    { id: "c1", css: "var(--c1)", hex: "#ff4d6d" },
    { id: "c2", css: "var(--c2)", hex: "#3db8ff" },
    { id: "c3", css: "var(--c3)", hex: "#f0c040" },
    { id: "c4", css: "var(--c4)", hex: "#3ecf8e" },
    { id: "c5", css: "var(--c5)", hex: "#c084fc" },
    { id: "c6", css: "var(--c6)", hex: "#fb923c" },
    { id: "c7", css: "var(--c7)", hex: "#67e8f9" },
    { id: "c8", css: "var(--c8)", hex: "#f472b6" },
  ];

  /** @type {Record<string, {category: string, intervals: number[], short?: string}>} */
  const CHORDS = {
    // Triads
    Major: { category: "Triads", intervals: [0, 4, 7], short: "maj" },
    Minor: { category: "Triads", intervals: [0, 3, 7], short: "m" },
    Diminished: { category: "Triads", intervals: [0, 3, 6], short: "dim" },
    Augmented: { category: "Triads", intervals: [0, 4, 8], short: "aug" },
    Sus2: { category: "Triads", intervals: [0, 2, 7], short: "sus2" },
    Sus4: { category: "Triads", intervals: [0, 5, 7], short: "sus4" },

    // Sixths
    "Major 6": { category: "Sixths", intervals: [0, 4, 7, 9], short: "6" },
    "Minor 6": { category: "Sixths", intervals: [0, 3, 7, 9], short: "m6" },
    "Major 6/9": { category: "Sixths", intervals: [0, 4, 7, 9, 14], short: "6/9" },
    "Minor 6/9": { category: "Sixths", intervals: [0, 3, 7, 9, 14], short: "m6/9" },

    // Sevenths
    "Major 7": { category: "Sevenths", intervals: [0, 4, 7, 11], short: "maj7" },
    "Minor 7": { category: "Sevenths", intervals: [0, 3, 7, 10], short: "m7" },
    "Dominant 7": { category: "Sevenths", intervals: [0, 4, 7, 10], short: "7" },
    "Diminished 7": { category: "Sevenths", intervals: [0, 3, 6, 9], short: "dim7" },
    "Half-diminished (m7♭5)": { category: "Sevenths", intervals: [0, 3, 6, 10], short: "m7♭5" },
    "Minor-Major 7": { category: "Sevenths", intervals: [0, 3, 7, 11], short: "m(maj7)" },
    "Augmented 7": { category: "Sevenths", intervals: [0, 4, 8, 10], short: "7♯5" },
    "Major 7♯5": { category: "Sevenths", intervals: [0, 4, 8, 11], short: "maj7♯5" },
    "Major 7♭5": { category: "Sevenths", intervals: [0, 4, 6, 11], short: "maj7♭5" },
    "7sus4": { category: "Sevenths", intervals: [0, 5, 7, 10], short: "7sus4" },
    "Dominant 7♭5": { category: "Sevenths", intervals: [0, 4, 6, 10], short: "7♭5" },

    // Add / ninths
    Add9: { category: "Ninths & adds", intervals: [0, 4, 7, 14], short: "add9" },
    "Minor add9": { category: "Ninths & adds", intervals: [0, 3, 7, 14], short: "madd9" },
    "Major 9": { category: "Ninths & adds", intervals: [0, 4, 7, 11, 14], short: "maj9" },
    "Minor 9": { category: "Ninths & adds", intervals: [0, 3, 7, 10, 14], short: "m9" },
    "Dominant 9": { category: "Ninths & adds", intervals: [0, 4, 7, 10, 14], short: "9" },
    "Dominant 7♭9": { category: "Ninths & adds", intervals: [0, 4, 7, 10, 13], short: "7♭9" },
    "Dominant 7♯9": { category: "Ninths & adds", intervals: [0, 4, 7, 10, 15], short: "7♯9" },
    "Minor 9♭5": { category: "Ninths & adds", intervals: [0, 3, 6, 10, 14], short: "m9♭5" },

    // Elevens / thirteens — compound tones folded onto the board
    "Dominant 11": { category: "Jazz extensions", intervals: [0, 4, 7, 10, 14, 5], short: "11" },
    "Minor 11": { category: "Jazz extensions", intervals: [0, 3, 7, 10, 14, 5], short: "m11" },
    "Major 11": { category: "Jazz extensions", intervals: [0, 4, 7, 11, 14, 5], short: "maj11" },
    "Dominant 13": { category: "Jazz extensions", intervals: [0, 4, 7, 10, 14, 9], short: "13" },
    "Major 13": { category: "Jazz extensions", intervals: [0, 4, 7, 11, 14, 9], short: "maj13" },
    "Minor 13": { category: "Jazz extensions", intervals: [0, 3, 7, 10, 14, 9], short: "m13" },
    "7♯11": { category: "Jazz extensions", intervals: [0, 4, 7, 10, 6], short: "7♯11" },
    "maj7♯11": { category: "Jazz extensions", intervals: [0, 4, 7, 11, 6], short: "maj7♯11" },
    "9♯11": { category: "Jazz extensions", intervals: [0, 4, 7, 10, 14, 6], short: "9♯11" },

    // Altered / specialty
    "7alt (7♯5♯9)": { category: "Altered", intervals: [0, 4, 8, 10, 15], short: "7alt" },
    "7♭5♭9": { category: "Altered", intervals: [0, 4, 6, 10, 13], short: "7♭5♭9" },
    "7♯5♭9": { category: "Altered", intervals: [0, 4, 8, 10, 13], short: "7♯5♭9" },
    "Power chord (5)": { category: "Specialty", intervals: [0, 7], short: "5" },
    "Major add♯11": { category: "Specialty", intervals: [0, 4, 7, 6], short: "add♯11" },
    Quartal: { category: "Specialty", intervals: [0, 5, 10, 15], short: "quartal" },
  };

  /** @type {Record<string, {category: string, intervals: number[], short?: string}>} */
  const SCALES = {
    // Major modes
    "Major / Ionian": { category: "Major modes", intervals: [0, 2, 4, 5, 7, 9, 11], short: "Ionian" },
    Dorian: { category: "Major modes", intervals: [0, 2, 3, 5, 7, 9, 10], short: "Dorian" },
    Phrygian: { category: "Major modes", intervals: [0, 1, 3, 5, 7, 8, 10], short: "Phrygian" },
    Lydian: { category: "Major modes", intervals: [0, 2, 4, 6, 7, 9, 11], short: "Lydian" },
    Mixolydian: { category: "Major modes", intervals: [0, 2, 4, 5, 7, 9, 10], short: "Mixo" },
    "Natural Minor / Aeolian": { category: "Major modes", intervals: [0, 2, 3, 5, 7, 8, 10], short: "Aeolian" },
    Locrian: { category: "Major modes", intervals: [0, 1, 3, 5, 6, 8, 10], short: "Locrian" },

    // Minor family
    "Harmonic Minor": { category: "Minor family", intervals: [0, 2, 3, 5, 7, 8, 11], short: "Harm min" },
    "Melodic Minor": { category: "Minor family", intervals: [0, 2, 3, 5, 7, 9, 11], short: "Mel min" },
    "Dorian ♭2": { category: "Minor family", intervals: [0, 1, 3, 5, 7, 9, 10], short: "Dor ♭2" },
    "Lydian Augmented": { category: "Minor family", intervals: [0, 2, 4, 6, 8, 9, 11], short: "Lyd+ " },
    "Lydian Dominant": { category: "Minor family", intervals: [0, 2, 4, 6, 7, 9, 10], short: "Lyd Dom" },
    "Mixolydian ♭6": { category: "Minor family", intervals: [0, 2, 4, 5, 7, 8, 10], short: "Mix ♭6" },
    "Locrian ♮2": { category: "Minor family", intervals: [0, 2, 3, 5, 6, 8, 10], short: "Loc ♮2" },
    "Altered / Super Locrian": { category: "Minor family", intervals: [0, 1, 3, 4, 6, 8, 10], short: "Alt" },

    // Pentatonics & blues
    "Major Pentatonic": { category: "Pentatonic & blues", intervals: [0, 2, 4, 7, 9], short: "Maj pent" },
    "Minor Pentatonic": { category: "Pentatonic & blues", intervals: [0, 3, 5, 7, 10], short: "Min pent" },
    "Blues Scale": { category: "Pentatonic & blues", intervals: [0, 3, 5, 6, 7, 10], short: "Blues" },
    "Major Blues": { category: "Pentatonic & blues", intervals: [0, 2, 3, 4, 7, 9], short: "Maj blues" },
    "Egyptian / Suspended Pent": { category: "Pentatonic & blues", intervals: [0, 2, 5, 7, 10], short: "Egypt" },
    "Hirajoshi": { category: "Pentatonic & blues", intervals: [0, 2, 3, 7, 8], short: "Hirajoshi" },

    // Symmetric
    "Whole Tone": { category: "Symmetric", intervals: [0, 2, 4, 6, 8, 10], short: "WT" },
    "Diminished (W/H)": { category: "Symmetric", intervals: [0, 2, 3, 5, 6, 8, 9, 11], short: "Dim WH" },
    "Diminished (H/W)": { category: "Symmetric", intervals: [0, 1, 3, 4, 6, 7, 9, 10], short: "Dim HW" },
    Chromatic: { category: "Symmetric", intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], short: "Chrom" },
    Augmented: { category: "Symmetric", intervals: [0, 3, 4, 7, 8, 11], short: "Aug sc" },

    // Bebop & jazz
    "Bebop Dominant": { category: "Bebop & jazz", intervals: [0, 2, 4, 5, 7, 9, 10, 11], short: "Bebop Dom" },
    "Bebop Major": { category: "Bebop & jazz", intervals: [0, 2, 4, 5, 7, 8, 9, 11], short: "Bebop Maj" },
    "Bebop Dorian": { category: "Bebop & jazz", intervals: [0, 2, 3, 4, 5, 7, 9, 10], short: "Bebop Dor" },
    "Bebop Melodic Minor": { category: "Bebop & jazz", intervals: [0, 2, 3, 5, 7, 8, 9, 11], short: "Bebop Mel" },

    // World / exotic
    "Phrygian Dominant": { category: "World & exotic", intervals: [0, 1, 4, 5, 7, 8, 10], short: "Phry Dom" },
    "Hungarian Minor": { category: "World & exotic", intervals: [0, 2, 3, 6, 7, 8, 11], short: "Hung min" },
    "Double Harmonic": { category: "World & exotic", intervals: [0, 1, 4, 5, 7, 8, 11], short: "Dbl harm" },
    "Neapolitan Minor": { category: "World & exotic", intervals: [0, 1, 3, 5, 7, 8, 11], short: "Neap min" },
    "Neapolitan Major": { category: "World & exotic", intervals: [0, 1, 3, 5, 7, 9, 11], short: "Neap maj" },
    Enigmatic: { category: "World & exotic", intervals: [0, 1, 4, 6, 8, 10, 11], short: "Enigmatic" },
    Persian: { category: "World & exotic", intervals: [0, 1, 4, 5, 6, 8, 11], short: "Persian" },
  };

  const LAYOUTS = {
    "4x4": {
      id: "4x4",
      cols: 4,
      rows: 4,
      pads: 16,
      brand: "16",
      label: "4×4 · 16 pads",
      devices: "MPD218, MPC pads, and similar",
    },
    "2x4": {
      id: "2x4",
      cols: 4,
      rows: 2,
      pads: 8,
      brand: "8",
      label: "2×4 · 8 pads",
      devices: "LPD8, nanoPAD, and similar",
    },
  };

  const STORAGE_KEY = "isopadstudio.songs.v2";
  const ACTIVE_KEY = "isopadstudio.activeSongId";
  const LAYOUT_KEY = "isopadstudio.layout";
  const INSTRUMENT_KEY = "isopadstudio.instrument";
  const PADMAP_KEY = "isopadstudio.padMaps.v1";
  const TUNING_KEY = "isopadstudio.tunings.v1";
  const LEGACY_KEYS = {
    songs: ["isopadstudio.songs.v1", "chromapad.songs.v1", "mpc16chords.songs.v1"],
    active: ["chromapad.activeSongId", "mpc16chords.activeSongId"],
    layout: ["chromapad.layout"],
    padMaps: ["chromapad.padMaps.v1"],
  };

  const SECTION_ROLES = ["Intro", "Verse", "Pre-Chorus", "Chorus", "Bridge", "Solo", "Outro", "Custom"];
  const DEFAULT_TEMPO = 100;
  const M = globalThis.IsoPadMusic;
  const S = globalThis.IsoPadStrings;
  if (!M) {
    throw new Error("IsoPadMusic failed to load — include lib/music.js before app.js");
  }
  if (!S) {
    throw new Error("IsoPadStrings failed to load — include lib/strings.js before app.js");
  }

  const {
    midiToLabel,
    labelToMidi,
    midiParts,
    defaultPadMap,
    normalizePadMap,
    getActivePads: resolveActivePads,
    sortPadsByPitch: sortPadsByPitchOnMap,
    midiToFreq,
    DEFAULT_START_MIDI,
  } = M;

  const OCTAVES = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];

  function loadSavedInstrument() {
    const fromInst = localStorage.getItem(INSTRUMENT_KEY);
    if (fromInst && (LAYOUTS[fromInst] || S.isStringInstrument(fromInst))) return fromInst;
    const raw = localStorage.getItem(LAYOUT_KEY) || LEGACY_KEYS.layout.map((k) => localStorage.getItem(k)).find(Boolean);
    return LAYOUTS[raw] ? raw : "4x4";
  }

  function isStringMode() {
    return S.isStringInstrument(state.instrument);
  }

  function currentLayout() {
    if (isStringMode()) return null;
    return LAYOUTS[state.instrument] || LAYOUTS["4x4"];
  }

  function currentStringInstrument() {
    return S.getInstrument(state.instrument);
  }

  function padCount() {
    const layout = currentLayout();
    return layout ? layout.pads : 0;
  }

  function loadPadMaps() {
    try {
      let raw = localStorage.getItem(PADMAP_KEY);
      if (!raw) {
        for (const key of LEGACY_KEYS.padMaps) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      const parsed = JSON.parse(raw || "{}");
      return {
        "4x4": normalizePadMap(parsed["4x4"], "4x4"),
        "2x4": normalizePadMap(parsed["2x4"], "2x4"),
      };
    } catch {
      return { "4x4": defaultPadMap("4x4"), "2x4": defaultPadMap("2x4") };
    }
  }

  function loadTunings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(TUNING_KEY) || "{}");
      const out = {};
      S.listInstruments().forEach((inst) => {
        out[inst.id] = S.normalizeTuning(parsed[inst.id], inst.id);
      });
      return out;
    } catch {
      const out = {};
      S.listInstruments().forEach((inst) => {
        out[inst.id] = S.defaultTuning(inst.id);
      });
      return out;
    }
  }

  function persistPadMaps() {
    localStorage.setItem(PADMAP_KEY, JSON.stringify(state.padMaps));
  }

  function persistTunings() {
    localStorage.setItem(TUNING_KEY, JSON.stringify(state.tunings));
  }

  function persistInstrument() {
    localStorage.setItem(INSTRUMENT_KEY, state.instrument);
    if (!isStringMode()) localStorage.setItem(LAYOUT_KEY, state.instrument);
  }

  function getPadMap() {
    if (isStringMode()) return [];
    return state.padMaps[state.instrument] || defaultPadMap(state.instrument);
  }

  function getTuning() {
    const id = state.instrument;
    if (!S.isStringInstrument(id)) return [];
    return state.tunings[id] || S.defaultTuning(id);
  }

  function getChordCapo() {
    const song = activeSong();
    if (song && Number.isFinite(song.chordCapo)) return S.clampCapo(song.chordCapo);
    return S.clampCapo(document.getElementById("library-capo")?.value ?? 0);
  }

  function getScaleCapo() {
    const song = activeSong();
    if (song && Number.isFinite(song.scaleCapo)) return S.clampCapo(song.scaleCapo);
    return S.clampCapo(document.getElementById("library-capo")?.value ?? 0);
  }

  // --- Audio ---
  let audioCtx = null;

  function ensureAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(padIndex, when, duration, opts = {}) {
    const ctx = ensureAudio();
    const map = getPadMap();
    const transpose = opts.transpose ?? Number(document.getElementById("player-transpose")?.value || 0);
    const wave = opts.wave ?? (document.getElementById("player-wave")?.value || "triangle");
    const midi =
      opts.midi != null
        ? Number(opts.midi) + transpose
        : (map[padIndex] ?? 60) + transpose;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = wave;
    osc.frequency.value = midiToFreq(midi);
    filter.type = "lowpass";
    filter.frequency.value = 2400;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const peak = opts.peak ?? 0.18;
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.start(when);
    osc.stop(when + duration + 0.02);
  }

  function playMidis(midis, { sequential = false, noteDur = null, gap = null, chordDur = null } = {}) {
    const step = chordSeconds();
    const beat = beatSeconds();
    const ctx = ensureAudio();
    const now = ctx.currentTime + 0.02;
    const ordered = [...midis].sort((a, b) => a - b);
    if (sequential) {
      // One scale degree per beat — not packed into a single chord duration
      const g = gap ?? beat;
      const nd = noteDur ?? Math.min(beat * 0.9, g * 0.9);
      ordered.forEach((midi, i) => playTone(0, now + i * g, nd, { midi }));
    } else {
      ordered.forEach((midi) => playTone(0, now, chordDur ?? step * 0.9, { midi }));
    }
  }

  function sortPadsByPitch(pads) {
    return sortPadsByPitchOnMap(pads, getPadMap());
  }

  function playPads(pads, { sequential = false, noteDur = null, gap = null, chordDur = null } = {}) {
    const step = chordSeconds();
    const beat = beatSeconds();
    const ctx = ensureAudio();
    const now = ctx.currentTime + 0.02;
    const ordered = sequential ? sortPadsByPitch(pads) : [...pads];
    if (sequential) {
      const g = gap ?? beat;
      const nd = noteDur ?? Math.min(beat * 0.9, g * 0.9);
      ordered.forEach((pad, i) => playTone(pad, now + i * g, nd));
    } else {
      ordered.forEach((pad) => playTone(pad, now, chordDur ?? step * 0.9));
    }
  }

  // --- Looping playback (tempo-aware) ---
  const playback = {
    key: null,
    stopFlag: false,
    timeoutId: null,
  };

  function getTempo() {
    const inputs = [
      document.getElementById("library-tempo"),
      document.getElementById("song-tempo"),
    ];
    for (const input of inputs) {
      if (!input) continue;
      const fromUi = Number(input.value);
      if (Number.isFinite(fromUi) && fromUi >= 40 && fromUi <= 240) return fromUi;
    }
    const song = activeSong();
    return song?.tempo || DEFAULT_TEMPO;
  }

  function beatSeconds() {
    return 60 / getTempo();
  }

  function chordSeconds() {
    // Two beats per chord/bar at the current tempo
    return beatSeconds() * 2;
  }

  function syncTempoInputs(bpm) {
    const v = String(bpm);
    const lib = document.getElementById("library-tempo");
    const song = document.getElementById("song-tempo");
    if (lib && lib.value !== v) lib.value = v;
    if (song && song.value !== v) song.value = v;
  }

  function setTempo(raw) {
    let bpm = Number(raw);
    if (!Number.isFinite(bpm)) bpm = DEFAULT_TEMPO;
    bpm = Math.max(40, Math.min(240, Math.round(bpm)));
    const active = ensureActiveSong();
    active.tempo = bpm;
    persistSongs();
    syncTempoInputs(bpm);
    return bpm;
  }

  function stopPlayback() {
    playback.stopFlag = true;
    if (playback.timeoutId) {
      clearTimeout(playback.timeoutId);
      playback.timeoutId = null;
    }
    playback.key = null;
    updatePlayButtons();
  }

  function isPlaying(key) {
    return playback.key === key;
  }

  function updatePlayButtons() {
    const songBtn = document.getElementById("btn-play-song");
    if (songBtn) {
      songBtn.textContent = isPlaying("song") ? "⏹ Stop" : "▶ Play song";
      songBtn.classList.toggle("playing", isPlaying("song"));
    }
    document.querySelectorAll("[data-play-key]").forEach((btn) => {
      const key = btn.getAttribute("data-play-key");
      const playing = isPlaying(key);
      btn.textContent = playing ? "⏹ Stop" : btn.dataset.idleLabel || "▶ Preview";
      btn.classList.toggle("playing", playing);
    });
    document.querySelectorAll("[data-section-play]").forEach((btn) => {
      const key = btn.getAttribute("data-section-play");
      const playing = isPlaying(key);
      btn.textContent = playing ? "⏹" : "▶";
      btn.title = playing ? "Stop" : "Preview section (loops)";
      btn.classList.toggle("playing", playing);
    });
  }

  function scheduleBars(bars, onDone) {
    if (!bars.length) {
      onDone();
      return;
    }
    const ctx = ensureAudio();
    const step = chordSeconds();
    let t = ctx.currentTime + 0.05;
    bars.forEach((bar) => {
      if (bar.midis?.length) {
        if (bar.isScale) {
          const sorted = [...bar.midis].sort((a, b) => a - b);
          const noteGap = beatSeconds();
          sorted.forEach((midi, i) => playTone(0, t + i * noteGap, noteGap * 0.9, { midi }));
          t += sorted.length * noteGap;
        } else {
          bar.midis.forEach((midi) => playTone(0, t, step * 0.9, { midi }));
          t += step;
        }
        return;
      }
      if (bar.isScale) {
        const sorted = sortPadsByPitch(bar.pads);
        const noteGap = beatSeconds();
        sorted.forEach((pad, i) => playTone(pad, t + i * noteGap, noteGap * 0.9));
        t += sorted.length * noteGap;
      } else {
        const voicing = bar.primaryPads?.length ? bar.primaryPads : bar.pads;
        voicing.forEach((pad) => playTone(pad, t, step * 0.9));
        t += step;
      }
    });
    const waitMs = Math.max(0, (t - ctx.currentTime) * 1000);
    playback.timeoutId = setTimeout(onDone, waitMs);
  }

  function toggleLoopPlay(key, getBars) {
    if (isPlaying(key)) {
      stopPlayback();
      return;
    }
    stopPlayback();
    playback.stopFlag = false;
    playback.key = key;
    updatePlayButtons();

    const run = () => {
      if (playback.stopFlag || playback.key !== key) return;
      const bars = getBars();
      if (!bars?.length) {
        stopPlayback();
        return;
      }
      scheduleBars(bars, () => {
        if (playback.stopFlag || playback.key !== key) return;
        run();
      });
    };
    run();
  }

  function flattenSongBars(song) {
    if (!song?.sections?.length) return [];
    return song.sections.flatMap((s) =>
      (s.bars || []).map((bar) => reresolveBar(bar, song))
    );
  }

  function addCurrentToSong() {
    const song = ensureActiveSong();
    const section = ensureTargetSection(song);
    const entry = getDict(state.kind)[state.formula];
    const isScale = state.kind === "scale";
    const bar = {
      title: displayTitle(state.root, state.formula, entry),
      color: state.color,
      isScale,
      root: state.root,
      formula: state.formula,
      kind: state.kind,
    };
    if (isStringMode()) {
      const capo = isScale ? song.scaleCapo ?? 0 : song.chordCapo ?? 0;
      const diagram = resolveStringChart(state.root, entry.intervals, { isScale, capo });
      Object.assign(bar, {
        diagram,
        midis: diagram.midis,
        pads: [],
        primaryPads: [],
        rootIndex: null,
      });
    } else {
      const { pads, primaryPads, rootIndex } = getActivePads(state.root, entry.intervals, {
        fillBoard: isScale,
      });
      Object.assign(bar, { pads, primaryPads, rootIndex });
    }
    section.bars.push(bar);
    persistSongs();
    const btn = document.getElementById("btn-add-song");
    const prev = btn.textContent;
    btn.textContent = "Added ✓";
    setTimeout(() => (btn.textContent = prev), 900);
  }

  // --- Music helpers ---
  function getDict(kind) {
    return kind === "scale" ? SCALES : CHORDS;
  }

  function categoriesFor(kind) {
    const dict = getDict(kind);
    const set = new Set(Object.values(dict).map((x) => x.category));
    return ["All", ...set];
  }

  function formulasInCategory(kind, category) {
    const dict = getDict(kind);
    return Object.entries(dict)
      .filter(([, v]) => category === "All" || v.category === category)
      .map(([name, v]) => ({ name, ...v }));
  }

  function getActivePads(root, intervals, opts = {}) {
    return resolveActivePads(root, intervals, getPadMap(), opts);
  }

  function noteNamesForPads(pads) {
    const map = getPadMap();
    return pads.map((p) => midiToLabel(map[p] ?? 60));
  }

  function formatShort(root, short) {
    // Scales / modes get a space; chord symbols glue to the root
    const scaleLike =
      /Ionian|Dorian|Phrygian|Lydian|Mixo|Aeolian|Locrian|Harm|Mel|Alt|Bebop|Blues|pent|Egypt|Hirajoshi|WT|Dim |Chrom|Aug sc|Hung|Neap|Pers|Enigmatic|Dbl|Dor |Lyd|Mix |Loc |Phry|Super/i.test(
        short
      );
    if (scaleLike) return `${root} ${short}`;
    return `${root}${short}`;
  }

  function displayTitle(root, entryName, entry) {
    if (entry.short) return formatShort(root, entry.short);
    return `${root} ${entryName}`;
  }

  const PROGRESSIONS =
    window.ISOPAD_PROGRESSIONS || window.CHROMAPAD_PROGRESSIONS || window.MPC16_PROGRESSIONS || [];

  function progressionGenres() {
    const set = new Set(PROGRESSIONS.map((p) => p.genre));
    return ["All", ...set];
  }

  function resolveProgressionBars(prog, key) {
    const keyIndex = NOTES.indexOf(key);
    const colorMap = new Map();
    let colorIdx = 0;
    return prog.chords.map((c) => {
      const root = NOTES[(keyIndex + c.o + 120) % 12];
      const entry = CHORDS[c.q];
      if (!entry) {
        console.warn("Unknown chord quality:", c.q);
        return null;
      }
      const uniq = `${root}|${c.q}`;
      if (!colorMap.has(uniq)) {
        colorMap.set(uniq, COLORS[colorIdx % COLORS.length].hex);
        colorIdx += 1;
      }
      const base = {
        title: displayTitle(root, c.q, entry),
        color: colorMap.get(uniq),
        isScale: false,
        root,
        formula: c.q,
        kind: "chord",
      };
      if (isStringMode()) {
        const diagram = resolveStringChart(root, entry.intervals, { isScale: false });
        return { ...base, diagram, midis: diagram.midis, pads: [], primaryPads: [], rootIndex: null };
      }
      const { pads, primaryPads, rootIndex } = getActivePads(root, entry.intervals);
      return { ...base, pads, primaryPads, rootIndex };
    }).filter(Boolean);
  }

  function uniqueChordLabels(bars) {
    const seen = [];
    const set = new Set();
    bars.forEach((b) => {
      if (!set.has(b.title)) {
        set.add(b.title);
        seen.push({ title: b.title, color: b.color });
      }
    });
    return seen;
  }

  // --- State ---
  const state = {
    instrument: loadSavedInstrument(),
    padMaps: loadPadMaps(),
    tunings: loadTunings(),
    kind: "chord",
    category: "All",
    formula: "Major 7",
    root: "C",
    color: COLORS[0].hex,
    songs: [],
    activeSongId: null,
    showAllRoots: false,
    progKey: "C",
    progGenre: "All",
    progSearch: "",
  };

  function normalizeSong(song) {
    if (!song || typeof song !== "object") return null;
    if (!Array.isArray(song.sections)) {
      const legacyBars = Array.isArray(song.bars) ? song.bars : [];
      song.sections = legacyBars.length
        ? [
            {
              id: uid(),
              name: song.name || "Main",
              role: "Verse",
              genre: "",
              bars: legacyBars,
            },
          ]
        : [];
    }
    delete song.bars;
    if (!Number.isFinite(song.tempo) || song.tempo < 40 || song.tempo > 240) {
      song.tempo = DEFAULT_TEMPO;
    }
    song.chordCapo = S.clampCapo(song.chordCapo ?? 0);
    song.scaleCapo = S.clampCapo(song.scaleCapo ?? 0);
    song.sections = (song.sections || []).map((section) => normalizeSection(section));
    if (!song.overlay) {
      song.overlay = { root: "C", formula: "", enabled: false };
    }
    return song;
  }

  function normalizeSection(section) {
    return {
      id: section.id || uid(),
      name: section.name || "Section",
      role: SECTION_ROLES.includes(section.role) ? section.role : "Custom",
      genre: section.genre || "",
      sourceKey: section.sourceKey || "",
      bars: Array.isArray(section.bars) ? section.bars : [],
    };
  }

  function makeSection({ name = "Section", role = "Custom", genre = "", sourceKey = "", bars = [] } = {}) {
    return {
      id: uid(),
      name,
      role,
      genre,
      sourceKey,
      bars: bars.map((b) => ({ ...b })),
    };
  }

  function nextSectionRole(song) {
    const defaults = ["Verse", "Chorus", "Bridge", "Verse", "Chorus", "Outro"];
    return defaults[song.sections.length] || "Custom";
  }

  function loadSongs() {
    try {
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        for (const key of LEGACY_KEYS.songs) {
          raw = localStorage.getItem(key);
          if (raw) break;
        }
      }
      const parsed = JSON.parse(raw || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeSong).filter(Boolean);
    } catch {
      return [];
    }
  }

  function persistSongs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.songs));
    if (state.activeSongId) localStorage.setItem(ACTIVE_KEY, state.activeSongId);
  }

  state.songs = loadSongs();
  state.activeSongId =
    localStorage.getItem(ACTIVE_KEY) ||
    LEGACY_KEYS.active.map((k) => localStorage.getItem(k)).find(Boolean) ||
    null;

  function activeSong() {
    return state.songs.find((s) => s.id === state.activeSongId) || null;
  }

  function uid() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function ensureActiveSong() {
    if (activeSong()) return activeSong();
    const song = {
      id: uid(),
      name: "Untitled Song",
      tempo: DEFAULT_TEMPO,
      chordCapo: 0,
      scaleCapo: 0,
      sections: [],
      overlay: { root: "C", formula: "Major / Ionian", enabled: false },
    };
    state.songs.push(song);
    state.activeSongId = song.id;
    persistSongs();
    return song;
  }

  function ensureTargetSection(song) {
    if (!song.sections.length) {
      song.sections.push(makeSection({ name: "Main", role: "Verse" }));
    }
    return song.sections[song.sections.length - 1];
  }

  // --- DOM helpers ---
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "html") node.innerHTML = v;
      else if (k === "value") node.value = v == null ? "" : String(v);
      else if (v === false || v == null) return;
      else node.setAttribute(k, v === true ? "" : String(v));
    });
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function buildGrid(pads, color, {
    rootIndex = null,
    primaryPads = [],
    interactive = false,
    onPad = null,
    size = "normal",
  } = {}) {
    const layout = currentLayout();
    if (!layout) return el("div", { class: "grid" });
    const map = getPadMap();
    const primarySet = new Set(primaryPads);
    const grid = el("div", {
      class: `${size === "big" ? "big-grid" : "grid"} rows-${layout.rows}`,
    });
    for (let row = layout.rows - 1; row >= 0; row--) {
      for (let col = 0; col < layout.cols; col++) {
        const padIndex = row * layout.cols + col;
        const on = pads.includes(padIndex);
        const primary = primarySet.has(padIndex);
        const pad = el(
          "div",
          {
            class: `pad${on ? " on" : ""}${primary ? " primary" : ""}${rootIndex === padIndex ? " root-mark" : ""}`,
            style: on ? { background: color, boxShadow: `0 0 14px ${hexToRgba(color, 0.45)}` } : {},
            title: primary
              ? `Pad ${padIndex + 1} · primary chord tone`
              : `Pad ${padIndex + 1}`,
            ...(interactive
              ? {
                  onClick: (e) => onPad && onPad(padIndex, e),
                }
              : {}),
          },
          midiToLabel(map[padIndex] ?? 60)
        );
        if (interactive) pad.dataset.pad = String(padIndex);
        grid.appendChild(pad);
      }
    }
    return grid;
  }

  function hexToRgba(hex, a) {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function buildFretboard(diagram, { color = "#ff4d6d", isScale = false } = {}) {
    const inst = currentStringInstrument() || S.getInstrument(diagram.instrumentId);
    if (!inst) return el("div", { class: "fretboard" });
    const style = inst.style || "fretted";
    const stringCount = inst.strings;
    // Same 4-fret frame for chords and scales
    const fretsShown = diagram.fretsShown || 4;
    const baseFret = diagram.baseFret || 1;
    const capo = diagram.capo || 0;

    const board = el("div", {
      class: `fretboard ${style}${isScale ? " scale" : " chord"}`,
      style: { "--strings": String(stringCount), "--frets": String(fretsShown) },
    });

    const meta = el("div", { class: "fret-meta" });
    if (capo > 0) meta.appendChild(el("span", { class: "fret-capo-badge" }, `Capo ${capo}`));
    if (baseFret > 1) meta.appendChild(el("span", { class: "fret-base-label" }, `${baseFret}fr`));
    if (meta.childNodes.length) board.appendChild(meta);

    const grid = el("div", { class: "fret-grid" });
    for (let s = 0; s < stringCount; s++) {
      const stringRow = el("div", { class: "fret-string-row", "data-string": String(s) });
      stringRow.appendChild(el("span", { class: "fret-string-name" }, inst.stringNames[s] || ""));

      // Nut column: ○ open, × muted (chords), blank if unused — same for scales (○ = open scale tone)
      let nutMark = "";
      if (isScale && diagram.dots) {
        const openHit = diagram.dots.find((d) => d.string === s && d.fret === 0);
        if (openHit) nutMark = "○";
      } else if (diagram.frets) {
        const f = diagram.frets[s];
        if (f == null) nutMark = "×";
        else if (f === 0) nutMark = "○";
      }
      stringRow.appendChild(el("span", { class: "fret-nut-mark" }, nutMark));

      const cells = el("div", { class: "fret-cells" });
      for (let fretPos = 1; fretPos <= fretsShown; fretPos++) {
        const cell = el("div", { class: "fret-cell" });
        if (isScale && diagram.dots) {
          const hit = diagram.dots.find((d) => d.string === s && d.fret === fretPos);
          if (hit) {
            cell.appendChild(
              el("span", {
                class: `fret-dot${hit.isRoot ? " root" : ""}`,
                style: {
                  background: hit.isRoot ? "#fff" : color,
                  color: hit.isRoot ? "#111" : "#fff",
                },
              }, hit.isRoot ? "R" : "")
            );
          }
        } else if (diagram.frets) {
          const f = diagram.frets[s];
          if (f === fretPos) {
            cell.appendChild(
              el("span", {
                class: `fret-dot${diagram.barre === f ? " barre" : ""}`,
                style: { background: color },
              })
            );
          }
        }
        cells.appendChild(cell);
      }
      stringRow.appendChild(cells);
      grid.appendChild(stringRow);
    }
    board.appendChild(grid);
    return board;
  }

  function resolveStringChart(root, intervals, { isScale = false, capo = null } = {}) {
    const id = state.instrument;
    const tuning = getTuning();
    if (isScale) {
      return S.resolveScaleDiagram(id, root, intervals, capo != null ? capo : getScaleCapo(), tuning);
    }
    return S.resolveChordShape(id, root, intervals, capo != null ? capo : getChordCapo(), tuning);
  }

  function makeCard({
    title,
    pads = [],
    primaryPads = [],
    color,
    rootIndex,
    isScale,
    actions,
    barNum,
    onPlay,
    midis = null,
    diagram = null,
  }) {
    const useStrings = Boolean(diagram && (diagram.frets || diagram.dots));
    let notes = "";
    let playPayload;

    if (useStrings) {
      const playMidisList = midis?.length ? midis : diagram.midis || [];
      notes = playMidisList.map((m) => midiToLabel(m)).join(" · ");
      playPayload = playMidisList;
    } else {
      const playPadsList = isScale ? pads : primaryPads.length ? primaryPads : pads;
      notes = noteNamesForPads(playPadsList).join(" · ");
      playPayload = playPadsList;
    }

    const card = el("div", {
      class: "card clickable song-card",
      onClick: (e) => {
        if (e.target.closest("button")) return;
        if (useStrings) onPlay(playPayload, { midis: true });
        else onPlay(playPayload);
      },
    });
    if (barNum != null) card.appendChild(el("span", { class: "bar-num" }, String(barNum)));
    card.appendChild(
      el("div", { class: "card-title", style: { color } }, [
        el("span", {}, title),
        el("span", { class: "notes" }, notes),
      ])
    );
    if (useStrings) {
      card.appendChild(buildFretboard(diagram, { color, isScale: !!isScale }));
    } else {
      card.appendChild(buildGrid(pads, color, { rootIndex, primaryPads: isScale ? [] : primaryPads }));
    }
    if (actions) card.appendChild(actions);
    return card;
  }

  // --- Render: Library ---
  function fillRootSelect(select) {
    select.innerHTML = "";
    NOTES.forEach((n) => {
      const opt = el("option", { value: n }, n);
      if (n === state.root) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function renderColorRow(container, selected, onPick) {
    container.innerHTML = "";
    COLORS.forEach((c) => {
      container.appendChild(
        el("button", {
          type: "button",
          class: `swatch${selected === c.hex ? " selected" : ""}`,
          style: { background: c.hex },
          title: c.id,
          onClick: () => onPick(c.hex),
        })
      );
    });
  }

  function renderLibraryChrome() {
    const catSelect = document.getElementById("category-select");
    const cats = categoriesFor(state.kind);
    if (!cats.includes(state.category)) state.category = "All";
    catSelect.innerHTML = "";
    cats.forEach((c) => {
      const opt = el("option", { value: c }, c);
      if (c === state.category) opt.selected = true;
      catSelect.appendChild(opt);
    });

    const chips = document.getElementById("category-chips");
    chips.innerHTML = "";
    cats.forEach((c) => {
      chips.appendChild(
        el(
          "button",
          {
            type: "button",
            class: `chip${c === state.category ? " active" : ""}`,
            onClick: () => {
              state.category = c;
              const list = formulasInCategory(state.kind, state.category);
              if (!list.find((x) => x.name === state.formula)) state.formula = list[0]?.name;
              renderLibrary();
            },
          },
          c
        )
      );
    });

    renderColorRow(document.getElementById("library-colors"), state.color, (hex) => {
      state.color = hex;
      renderLibrary();
    });
  }

  function renderLibrary() {
    renderLibraryChrome();
    syncTempoInputs(getTempo());
    const list = formulasInCategory(state.kind, state.category);
    if (!list.find((x) => x.name === state.formula) && list[0]) state.formula = list[0].name;

    const formulaList = document.getElementById("formula-list");
    formulaList.innerHTML = "";
    list.forEach((item) => {
      formulaList.appendChild(
        el(
          "button",
          {
            type: "button",
            class: `formula-item${item.name === state.formula ? " active" : ""}`,
            onClick: () => {
              state.formula = item.name;
              renderLibrary();
            },
          },
          [el("span", {}, item.name), el("span", { class: "badge" }, item.short || "")]
        )
      );
    });

    const entry = getDict(state.kind)[state.formula];
    const title = displayTitle(state.root, state.formula, entry);
    const preview = document.getElementById("library-preview");
    preview.innerHTML = "";

    const libCapoField = document.getElementById("library-capo-field");
    if (libCapoField) libCapoField.hidden = !isStringMode();

    if (isStringMode()) {
      const isScale = state.kind === "scale";
      const capo = isScale ? getScaleCapo() : getChordCapo();
      const diagram = resolveStringChart(state.root, entry.intervals, { isScale, capo });
      preview.appendChild(
        makeCard({
          title,
          color: state.color,
          isScale,
          diagram,
          midis: diagram.midis,
          onPlay: (list) => playMidis(list, { sequential: isScale }),
        })
      );
      const hint = document.getElementById("fit-hint");
      const missing = diagram.missing || [];
      if (missing.length) {
        hint.textContent = `Hard to cover on this tuning: ${missing.join(", ")}. Try another voicing root or edit Tuning.`;
      } else {
        hint.textContent = isScale
          ? "Scale tones on the fingerboard (capo applies to scales separately from chords in Song Builder). Click to hear ascending."
          : "Standard-style chord chart. Capo frets are relative to the capo. Click to hear the voicing.";
      }
    } else {
      const { pads, primaryPads, missing, rootIndex } = getActivePads(state.root, entry.intervals, {
        fillBoard: state.kind === "scale",
      });
      preview.appendChild(
        makeCard({
          title,
          pads,
          primaryPads,
          color: state.color,
          rootIndex,
          isScale: state.kind === "scale",
          onPlay: (list) => playPads(list, { sequential: state.kind === "scale" }),
        })
      );
      const hint = document.getElementById("fit-hint");
      if (missing.length) {
        hint.textContent = `Missing on this pad map: ${missing.join(", ")}. Assign those notes in the Pads tab, or pick a different root.`;
      } else {
        hint.textContent = state.kind === "scale"
          ? "Every pad whose note is in the scale is lit (using your Pads map). Click to hear ascending by pitch. Root pad is outlined."
          : "All chord-tone pads are lit. Bright border = primary voicing (first instance of each tone). Click to hear that voicing.";
      }
    }

    const gallery = document.getElementById("all-roots-gallery");
    if (state.showAllRoots) {
      gallery.hidden = false;
      gallery.innerHTML = "";
      NOTES.forEach((root) => {
        if (isStringMode()) {
          const isScale = state.kind === "scale";
          const diagram = resolveStringChart(root, entry.intervals, { isScale });
          if (!diagram.midis?.length) return;
          gallery.appendChild(
            makeCard({
              title: displayTitle(root, state.formula, entry),
              color: state.color,
              isScale,
              diagram,
              midis: diagram.midis,
              onPlay: (list) => playMidis(list, { sequential: isScale }),
            })
          );
        } else {
          const data = getActivePads(root, entry.intervals, { fillBoard: state.kind === "scale" });
          if (!data.pads.length) return;
          gallery.appendChild(
            makeCard({
              title: displayTitle(root, state.formula, entry),
              pads: data.pads,
              primaryPads: data.primaryPads,
              color: state.color,
              rootIndex: data.rootIndex,
              isScale: state.kind === "scale",
              onPlay: (list) => playPads(list, { sequential: state.kind === "scale" }),
            })
          );
        }
      });
    } else {
      gallery.hidden = true;
      gallery.innerHTML = "";
    }

    // Keep pad player ref in sync
    renderPlayerRef();
  }

  // --- Song ---
  function refreshSongSelect() {
    const sel = document.getElementById("song-select");
    sel.innerHTML = "";
    if (!state.songs.length) {
      sel.appendChild(el("option", { value: "" }, "— none —"));
      return;
    }
    state.songs.forEach((s) => {
      const opt = el("option", { value: s.id }, s.name);
      if (s.id === state.activeSongId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function renderOverlayControls() {
    const rootSel = document.getElementById("overlay-root");
    const formSel = document.getElementById("overlay-formula");
    fillRootSelect(rootSel);
    const song = activeSong();
    if (song?.overlay?.root) rootSel.value = song.overlay.root;

    formSel.innerHTML = "";
    formSel.appendChild(el("option", { value: "" }, "— no overlay —"));
    Object.keys(SCALES).forEach((name) => {
      const opt = el("option", { value: name }, name);
      if (song?.overlay?.formula === name && song.overlay.enabled) opt.selected = true;
      formSel.appendChild(opt);
    });
    if (!song?.overlay?.enabled) formSel.value = "";
  }

  function renderSong() {
    refreshSongSelect();
    renderOverlayControls();
    const song = activeSong();
    document.getElementById("song-name").value = song?.name || "";
    const tempoInput = document.getElementById("song-tempo");
    if (tempoInput) tempoInput.value = String(song?.tempo || DEFAULT_TEMPO);
    syncTempoInputs(song?.tempo || DEFAULT_TEMPO);

    const chordCapoField = document.getElementById("song-chord-capo-field");
    const scaleCapoField = document.getElementById("song-scale-capo-field");
    const showCapo = isStringMode();
    if (chordCapoField) chordCapoField.hidden = !showCapo;
    if (scaleCapoField) scaleCapoField.hidden = !showCapo;
    const chordCapoInput = document.getElementById("song-chord-capo");
    const scaleCapoInput = document.getElementById("song-scale-capo");
    const libCapo = document.getElementById("library-capo");
    if (chordCapoInput) chordCapoInput.value = String(song?.chordCapo ?? 0);
    if (scaleCapoInput) scaleCapoInput.value = String(song?.scaleCapo ?? 0);
    if (libCapo && song) {
      libCapo.value = String(state.kind === "scale" ? song.scaleCapo ?? 0 : song.chordCapo ?? 0);
    }

    const strip = document.getElementById("song-strip");
    strip.innerHTML = "";
    if (!song || !song.sections.length) {
      strip.appendChild(
        el("p", {
          class: "empty-state",
          html: 'No progressions yet. Open <strong>Progressions</strong> and hit <strong>Add to Song</strong>, or add chords from the Library.',
        })
      );
    } else {
      song.sections.forEach((section, sectionIndex) => {
        strip.appendChild(renderSectionBlock(song, section, sectionIndex));
      });
    }

    // Overlay
    const overlayBox = document.getElementById("overlay-preview");
    if (song?.overlay?.enabled && song.overlay.formula) {
      const entry = SCALES[song.overlay.formula];
      overlayBox.hidden = false;
      overlayBox.innerHTML = "";
      overlayBox.appendChild(el("div", { class: "hint", style: { marginBottom: "10px" } }, "Scale overlay (shown with song)"));
      if (isStringMode()) {
        const diagram = resolveStringChart(song.overlay.root, entry.intervals, {
          isScale: true,
          capo: song.scaleCapo ?? 0,
        });
        overlayBox.appendChild(
          makeCard({
            title: displayTitle(song.overlay.root, song.overlay.formula, entry),
            color: "#3db8ff",
            isScale: true,
            diagram,
            midis: diagram.midis,
            onPlay: (list) => playMidis(list, { sequential: true }),
          })
        );
      } else {
        const { pads, primaryPads, rootIndex } = getActivePads(song.overlay.root, entry.intervals, { fillBoard: true });
        overlayBox.appendChild(
          makeCard({
            title: displayTitle(song.overlay.root, song.overlay.formula, entry),
            pads,
            primaryPads,
            color: "#3db8ff",
            rootIndex,
            isScale: true,
            onPlay: (list) => playPads(list, { sequential: true }),
          })
        );
      }
    } else {
      overlayBox.hidden = true;
      overlayBox.innerHTML = "";
    }

    // Legend of colors used across all sections
    const legend = document.getElementById("song-legend");
    legend.innerHTML = "";
    const allBars = flattenSongBars(song);
    if (allBars.length) {
      const seen = new Map();
      allBars.forEach((b) => {
        if (!seen.has(b.color)) seen.set(b.color, b.title);
      });
      seen.forEach((title, color) => {
        legend.appendChild(
          el("div", { class: "legend-item" }, [
            el("span", { class: "legend-dot", style: { background: color } }),
            el("span", {}, title.split(" ")[0] || title),
          ])
        );
      });
    }

    updatePlayButtons();
  }

  function renderSectionBlock(song, section, sectionIndex) {
    const sectionKey = `section:${section.id}`;
    const block = el("article", {
      class: "song-section",
      "data-section-id": section.id,
    });

    block.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      block.classList.add("drag-over");
    });
    block.addEventListener("dragleave", () => block.classList.remove("drag-over"));
    block.addEventListener("drop", (e) => {
      e.preventDefault();
      block.classList.remove("drag-over");
      const fromId = e.dataTransfer.getData("text/section-id");
      const barPayload = e.dataTransfer.getData("text/bar-move");
      if (barPayload) {
        try {
          const { sectionId: fromSectionId, barIndex } = JSON.parse(barPayload);
          moveBarToSection(fromSectionId, barIndex, section.id, section.bars.length);
        } catch {
          /* ignore */
        }
        return;
      }
      if (fromId && fromId !== section.id) {
        reorderSection(fromId, section.id);
      }
    });

    const roleSelect = el("select", {
      class: "section-role",
      onChange: (e) => {
        section.role = e.target.value;
        persistSongs();
      },
    });
    SECTION_ROLES.forEach((role) => {
      const opt = el("option", { value: role }, role);
      if (role === section.role) opt.selected = true;
      roleSelect.appendChild(opt);
    });

    const nameInput = el("input", {
      type: "text",
      class: "section-name",
      value: section.name,
      maxlength: "60",
      onChange: (e) => {
        section.name = e.target.value.trim() || section.role;
        persistSongs();
      },
    });

    const handle = el("span", { class: "section-handle", title: "Drag to reorder", draggable: "true" }, "⠿");
    handle.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/section-id", section.id);
      e.dataTransfer.effectAllowed = "move";
      block.classList.add("dragging");
    });
    handle.addEventListener("dragend", () => block.classList.remove("dragging"));

    const header = el("div", { class: "song-section-header" }, [
      handle,
      el("span", { class: "section-index" }, String(sectionIndex + 1)),
      roleSelect,
      nameInput,
      section.genre ? el("span", { class: "section-genre" }, section.genre) : null,
      el("div", { class: "song-section-actions" }, [
        el("button", {
          type: "button",
          class: "btn ghost",
          "data-section-play": sectionKey,
          title: "Preview section (loops)",
          onClick: () =>
            toggleLoopPlay(sectionKey, () => {
              const s = activeSong()?.sections.find((x) => x.id === section.id);
              return s?.bars || [];
            }),
        }, isPlaying(sectionKey) ? "⏹" : "▶"),
        el("button", {
          type: "button",
          class: "btn",
          title: "Duplicate section",
          onClick: () => duplicateSection(sectionIndex),
        }, "⧉"),
        el("button", {
          type: "button",
          class: "btn",
          title: "Move up",
          onClick: () => moveSection(sectionIndex, -1),
        }, "↑"),
        el("button", {
          type: "button",
          class: "btn",
          title: "Move down",
          onClick: () => moveSection(sectionIndex, 1),
        }, "↓"),
        el("button", {
          type: "button",
          class: "btn danger",
          title: "Remove section",
          onClick: () => removeSection(sectionIndex),
        }, "✕"),
      ]),
    ]);

    const chords = el("div", { class: "song-section-chords" });
    if (!section.bars.length) {
      chords.appendChild(el("p", { class: "section-empty" }, "Empty — add chords from Library or drop a progression here."));
    } else {
      section.bars.forEach((bar, barIndex) => {
        chords.appendChild(renderBarCard(section, bar, barIndex));
      });
    }

    block.appendChild(header);
    block.appendChild(chords);
    return block;
  }

  function renderBarCard(section, bar, barIndex) {
    const actions = el("div", { class: "song-card-actions" }, [
      el("button", {
        type: "button",
        class: "btn",
        onClick: () => moveBar(section.id, barIndex, -1),
      }, "←"),
      el("button", {
        type: "button",
        class: "btn",
        onClick: () => moveBar(section.id, barIndex, 1),
      }, "→"),
      el("button", {
        type: "button",
        class: "btn danger",
        onClick: () => removeBar(section.id, barIndex),
      }, "✕"),
    ]);

    const cardOpts = {
      title: bar.title,
      pads: bar.pads || [],
      primaryPads: bar.primaryPads || [],
      color: bar.color,
      rootIndex: bar.rootIndex ?? null,
      isScale: !!bar.isScale,
      barNum: barIndex + 1,
      actions,
      midis: bar.midis || null,
      diagram: bar.diagram || null,
      onPlay: (list) => {
        if (bar.midis?.length || isStringMode()) {
          playMidis(list, { sequential: !!bar.isScale });
        } else {
          playPads(list, { sequential: !!bar.isScale });
        }
      },
    };

    if (isStringMode() && bar.root && bar.formula) {
      const entry = getDict(bar.kind || (bar.isScale ? "scale" : "chord"))[bar.formula];
      if (entry) {
        const song = activeSong();
        const capo = bar.isScale ? (song?.scaleCapo ?? 0) : (song?.chordCapo ?? 0);
        const diagram = resolveStringChart(bar.root, entry.intervals, {
          isScale: !!bar.isScale,
          capo,
        });
        cardOpts.diagram = diagram;
        cardOpts.midis = diagram.midis;
      }
    }

    const card = makeCard(cardOpts);
    card.classList.add("song-card");
    card.draggable = true;
    card.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      e.dataTransfer.setData(
        "text/bar-move",
        JSON.stringify({ sectionId: section.id, barIndex })
      );
      e.dataTransfer.setData("text/section-id", "");
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.add("drag-over");
    });
    card.addEventListener("dragleave", () => card.classList.remove("drag-over"));
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      card.classList.remove("drag-over");
      const payload = e.dataTransfer.getData("text/bar-move");
      if (!payload) return;
      try {
        const { sectionId: fromSectionId, barIndex: fromIndex } = JSON.parse(payload);
        moveBarToSection(fromSectionId, fromIndex, section.id, barIndex);
      } catch {
        /* ignore */
      }
    });
    return card;
  }

  function findSection(sectionId) {
    const song = activeSong();
    if (!song) return null;
    return song.sections.find((s) => s.id === sectionId) || null;
  }

  function reorderSection(fromId, beforeId) {
    const song = activeSong();
    if (!song) return;
    const from = song.sections.findIndex((s) => s.id === fromId);
    const to = song.sections.findIndex((s) => s.id === beforeId);
    if (from < 0 || to < 0 || from === to) return;
    const [item] = song.sections.splice(from, 1);
    const insertAt = song.sections.findIndex((s) => s.id === beforeId);
    song.sections.splice(insertAt < 0 ? song.sections.length : insertAt, 0, item);
    persistSongs();
    renderSong();
  }

  function moveSection(index, dir) {
    const song = activeSong();
    if (!song) return;
    const j = index + dir;
    if (j < 0 || j >= song.sections.length) return;
    const tmp = song.sections[index];
    song.sections[index] = song.sections[j];
    song.sections[j] = tmp;
    persistSongs();
    renderSong();
  }

  function duplicateSection(index) {
    const song = activeSong();
    if (!song) return;
    const src = song.sections[index];
    if (!src) return;
    const copy = makeSection({
      name: `${src.name} copy`,
      role: src.role,
      genre: src.genre,
      sourceKey: src.sourceKey,
      bars: src.bars,
    });
    song.sections.splice(index + 1, 0, copy);
    persistSongs();
    renderSong();
  }

  function removeSection(index) {
    const song = activeSong();
    if (!song) return;
    song.sections.splice(index, 1);
    persistSongs();
    renderSong();
  }

  function moveBar(sectionId, index, dir) {
    const section = findSection(sectionId);
    if (!section) return;
    const j = index + dir;
    if (j < 0 || j >= section.bars.length) return;
    const tmp = section.bars[index];
    section.bars[index] = section.bars[j];
    section.bars[j] = tmp;
    persistSongs();
    renderSong();
  }

  function removeBar(sectionId, index) {
    const section = findSection(sectionId);
    if (!section) return;
    section.bars.splice(index, 1);
    persistSongs();
    renderSong();
  }

  function moveBarToSection(fromSectionId, fromIndex, toSectionId, toIndex) {
    const song = activeSong();
    if (!song) return;
    const from = song.sections.find((s) => s.id === fromSectionId);
    const to = song.sections.find((s) => s.id === toSectionId);
    if (!from || !to || fromIndex < 0 || fromIndex >= from.bars.length) return;
    const [bar] = from.bars.splice(fromIndex, 1);
    let insertAt = toIndex;
    if (fromSectionId === toSectionId && fromIndex < toIndex) insertAt -= 1;
    insertAt = Math.max(0, Math.min(insertAt, to.bars.length));
    to.bars.splice(insertAt, 0, bar);
    persistSongs();
    renderSong();
  }

  function playSongLoop() {
    const song = activeSong();
    if (!song || !flattenSongBars(song).length) return;
    toggleLoopPlay("song", () => flattenSongBars(activeSong()));
  }

  function addEmptySection() {
    const song = ensureActiveSong();
    const role = nextSectionRole(song);
    song.sections.push(makeSection({ name: role, role }));
    persistSongs();
    renderSong();
  }

  // --- Pad / string player ---
  function renderPlayer() {
    const gridHost = document.getElementById("player-grid");
    if (!gridHost) return;
    const titleEl = document.getElementById("player-side-title");
    const descEl = document.getElementById("player-side-desc");
    const hintEl = document.getElementById("player-hint");

    if (isStringMode()) {
      const inst = currentStringInstrument();
      const tuning = getTuning();
      const board = el("div", { class: "string-player", id: "player-grid" });
      tuning.forEach((midi, i) => {
        board.appendChild(
          el(
            "button",
            {
              type: "button",
              class: "string-pluck",
              onClick: () => playTone(0, ensureAudio().currentTime, 0.55, { midi, peak: 0.22 }),
            },
            [
              el("span", { class: "string-pluck-name" }, inst.stringNames[i] || `S${i + 1}`),
              el("span", { class: "string-pluck-note" }, midiToLabel(midi)),
            ]
          )
        );
      });
      gridHost.replaceWith(board);
      if (titleEl) titleEl.textContent = "Open strings";
      if (descEl) descEl.textContent = `${inst.label} — click a string to pluck open. Edit tuning in the Tuning tab.`;
      if (hintEl) hintEl.textContent = "Pluck open strings. Library selection is shown on the right.";
    } else {
      const grid = buildGrid([], "#555", {
        size: "big",
        interactive: true,
        onPad: (padIndex) => {
          playTone(padIndex, ensureAudio().currentTime, 0.55, { peak: 0.22 });
          flashPad(padIndex);
        },
      });
      grid.id = "player-grid";
      gridHost.replaceWith(grid);
      if (titleEl) titleEl.textContent = "Live pads";
      if (descEl) {
        const map = getPadMap();
        const layout = currentLayout();
        descEl.textContent = `${layout.label} — notes come from your Pads map (Pad 1 = ${midiToLabel(map[0])}). Edit them in the Pads tab.`;
      }
      if (hintEl) hintEl.textContent = "Click pads to play their mapped notes. Library selection is highlighted.";
    }
    renderPlayerRef();
  }

  function reresolveBar(bar, song = null) {
    if (bar.root && bar.formula && bar.kind) {
      const entry = getDict(bar.kind)[bar.formula];
      if (entry) {
        if (isStringMode()) {
          const s = song || activeSong();
          const isScale = bar.kind === "scale" || !!bar.isScale;
          const capo = isScale ? (s?.scaleCapo ?? 0) : (s?.chordCapo ?? 0);
          const diagram = resolveStringChart(bar.root, entry.intervals, { isScale, capo });
          return {
            ...bar,
            diagram,
            midis: diagram.midis,
            pads: [],
            primaryPads: [],
            rootIndex: null,
          };
        }
        const { pads, primaryPads, rootIndex } = getActivePads(bar.root, entry.intervals, {
          fillBoard: bar.kind === "scale" || !!bar.isScale,
        });
        return { ...bar, pads, primaryPads, rootIndex, midis: null, diagram: null };
      }
    }
    if (isStringMode()) return { ...bar };
    return {
      ...bar,
      pads: (bar.pads || []).filter((p) => p < padCount()),
      primaryPads: (bar.primaryPads || []).filter((p) => p < padCount()),
    };
  }

  function reresolveSongsForLayout() {
    state.songs.forEach((song) => {
      song.sections = (song.sections || []).map((section) => ({
        ...section,
        bars: (section.bars || []).map((bar) => reresolveBar(bar, song)),
      }));
    });
    persistSongs();
  }

  function updateInstrumentChrome() {
    const mark = document.querySelector(".brand-mark");
    const sel = document.getElementById("instrument-select");
    if (sel && !sel.dataset.filled) {
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "" }, "— pads —"));
      S.listInstruments().forEach((inst) => {
        sel.appendChild(el("option", { value: inst.id }, inst.label));
      });
      sel.dataset.filled = "1";
    }
    if (sel) sel.value = isStringMode() ? state.instrument : "";

    document.querySelectorAll(".layout-btn").forEach((btn) => {
      const id = btn.dataset.instrument;
      btn.classList.toggle("active", !isStringMode() && id === state.instrument);
    });

    if (isStringMode()) {
      const inst = currentStringInstrument();
      if (mark) mark.textContent = String(inst.strings);
      document.body.dataset.instrument = inst.id;
      document.body.dataset.family = "strings";
      const tabPads = document.getElementById("tab-pads");
      const tabPlay = document.getElementById("tab-play");
      if (tabPads) tabPads.textContent = "Tuning";
      if (tabPlay) tabPlay.textContent = "Strings";
      const intro = document.getElementById("pads-intro");
      if (intro) {
        intro.innerHTML = `Edit open-string tuning for <strong>${inst.label}</strong>. Capo is set per song (chord vs scale). Tunings save per instrument in localStorage.`;
      }
      const padsReset = document.getElementById("pads-reset-row");
      const tuningReset = document.getElementById("tuning-reset-row");
      if (padsReset) padsReset.hidden = true;
      if (tuningReset) tuningReset.hidden = false;
      const footer = document.querySelector(".footer p");
      if (footer) {
        footer.textContent = `${inst.label} · capo & tunings editable · songs save in localStorage · serve over HTTP.`;
      }
    } else {
      const layout = currentLayout();
      if (mark) mark.textContent = layout.brand;
      document.body.dataset.instrument = layout.id;
      document.body.dataset.family = "pads";
      const tabPads = document.getElementById("tab-pads");
      const tabPlay = document.getElementById("tab-play");
      if (tabPads) tabPads.textContent = "Pads";
      if (tabPlay) tabPlay.textContent = "Pad Player";
      const intro = document.getElementById("pads-intro");
      if (intro) {
        intro.innerHTML =
          'Assign a note to each pad. Defaults are chromatic from <strong>C3</strong> (Pad 1). Piano middle C is <strong>C4</strong> — tagged when present. Maps are saved per layout (4×4 and 2×4) in localStorage.';
      }
      const padsReset = document.getElementById("pads-reset-row");
      const tuningReset = document.getElementById("tuning-reset-row");
      if (padsReset) padsReset.hidden = false;
      if (tuningReset) tuningReset.hidden = true;
      const footer = document.querySelector(".footer p");
      if (footer) {
        const map = getPadMap();
        footer.textContent = `${layout.label} · Pad 1 = ${midiToLabel(map[0])} (editable in Pads) · songs & maps save in localStorage · serve over HTTP.`;
      }
    }
  }

  function refreshAfterPadMapChange() {
    reresolveSongsForLayout();
    updateInstrumentChrome();
    renderLibrary();
    renderProgressions();
    renderSong();
    renderPlayer();
  }

  function setPadMidi(padIndex, midi) {
    const map = getPadMap();
    map[padIndex] = Math.max(0, Math.min(127, midi));
    persistPadMaps();
    refreshAfterPadMapChange();

    const cell = document.querySelector(`[data-pad-edit="${padIndex}"]`);
    if (!cell) return;
    cell.classList.toggle("middle-c", midi === 60);
    const midiLabel = cell.querySelector(".pad-edit-midi");
    if (midiLabel) midiLabel.textContent = midiToLabel(midi);
    const labelRow = cell.querySelector(".pad-edit-label");
    if (labelRow) {
      labelRow.innerHTML = "";
      labelRow.appendChild(el("span", {}, `Pad ${padIndex + 1}`));
      if (midi === 60) labelRow.appendChild(el("span", { class: "middle-c-tag" }, "middle C"));
    }
  }

  function setStringMidi(stringIndex, midi) {
    const id = state.instrument;
    if (!S.isStringInstrument(id)) return;
    state.tunings[id][stringIndex] = Math.max(0, Math.min(127, midi));
    persistTunings();
    refreshAfterPadMapChange();
    renderPadsEditor();
  }

  function resetPadMapChromatic(startMidi = DEFAULT_START_MIDI) {
    if (isStringMode()) return;
    const layoutId = state.instrument;
    state.padMaps[layoutId] = Array.from(
      { length: LAYOUTS[layoutId].pads },
      (_, i) => startMidi + i
    );
    persistPadMaps();
    refreshAfterPadMapChange();
    renderPadsEditor();
  }

  function resetTuning() {
    if (!isStringMode()) return;
    state.tunings[state.instrument] = S.defaultTuning(state.instrument);
    persistTunings();
    refreshAfterPadMapChange();
    renderPadsEditor();
  }

  function renderPadsEditor() {
    const host = document.getElementById("pads-editor");
    if (!host) return;
    host.innerHTML = "";

    if (isStringMode()) {
      const inst = currentStringInstrument();
      const tuning = getTuning();
      const grid = el("div", { class: "pads-editor-grid tuning-editor" });
      tuning.forEach((midi, stringIndex) => {
        const parts = midiParts(midi);
        const noteSel = el("select", {
          class: "pad-note-select",
          "aria-label": `String ${stringIndex + 1} note`,
          onChange: (e) => {
            const wrap = e.target.closest("[data-string-edit]");
            const oct = Number(wrap.querySelector(".pad-octave-select").value);
            setStringMidi(stringIndex, labelToMidi(e.target.value, oct));
          },
        });
        NOTES.forEach((n) => {
          const opt = el("option", { value: n }, n);
          if (n === parts.note) opt.selected = true;
          noteSel.appendChild(opt);
        });
        const octSel = el("select", {
          class: "pad-octave-select",
          "aria-label": `String ${stringIndex + 1} octave`,
          onChange: (e) => {
            const wrap = e.target.closest("[data-string-edit]");
            const note = wrap.querySelector(".pad-note-select").value;
            setStringMidi(stringIndex, labelToMidi(note, e.target.value));
          },
        });
        OCTAVES.forEach((o) => {
          const opt = el("option", { value: String(o) }, String(o));
          if (o === parts.octave) opt.selected = true;
          octSel.appendChild(opt);
        });
        grid.appendChild(
          el("div", { class: "pad-edit-cell", "data-string-edit": String(stringIndex) }, [
            el("div", { class: "pad-edit-label" }, [
              el("span", {}, `${inst.stringNames[stringIndex] || `S${stringIndex + 1}`} string`),
            ]),
            el("div", { class: "pad-edit-controls" }, [noteSel, octSel]),
            el("div", { class: "pad-edit-midi" }, midiToLabel(midi)),
            el(
              "button",
              {
                type: "button",
                class: "btn ghost pad-audition",
                onClick: () => playTone(0, ensureAudio().currentTime, 0.45, { midi, peak: 0.22 }),
              },
              "▶"
            ),
          ])
        );
      });
      host.appendChild(grid);
      return;
    }

    const layout = currentLayout();
    const map = getPadMap();
    const grid = el("div", { class: `pads-editor-grid rows-${layout.rows}` });
    for (let row = layout.rows - 1; row >= 0; row--) {
      for (let col = 0; col < layout.cols; col++) {
        const padIndex = row * layout.cols + col;
        const midi = map[padIndex];
        const parts = midiParts(midi);
        const isMiddleC = midi === 60;

        const noteSel = el("select", {
          class: "pad-note-select",
          "aria-label": `Pad ${padIndex + 1} note`,
          onChange: (e) => {
            const wrap = e.target.closest("[data-pad-edit]");
            const oct = Number(wrap.querySelector(".pad-octave-select").value);
            setPadMidi(padIndex, labelToMidi(e.target.value, oct));
          },
        });
        NOTES.forEach((n) => {
          const opt = el("option", { value: n }, n);
          if (n === parts.note) opt.selected = true;
          noteSel.appendChild(opt);
        });

        const octSel = el("select", {
          class: "pad-octave-select",
          "aria-label": `Pad ${padIndex + 1} octave`,
          onChange: (e) => {
            const wrap = e.target.closest("[data-pad-edit]");
            const note = wrap.querySelector(".pad-note-select").value;
            setPadMidi(padIndex, labelToMidi(note, e.target.value));
          },
        });
        OCTAVES.forEach((o) => {
          const opt = el("option", { value: String(o) }, String(o));
          if (o === parts.octave) opt.selected = true;
          octSel.appendChild(opt);
        });

        const cell = el("div", {
          class: `pad-edit-cell${isMiddleC ? " middle-c" : ""}`,
          "data-pad-edit": String(padIndex),
        }, [
          el("div", { class: "pad-edit-label" }, [
            el("span", {}, `Pad ${padIndex + 1}`),
            isMiddleC ? el("span", { class: "middle-c-tag" }, "middle C") : null,
          ]),
          el("div", { class: "pad-edit-controls" }, [noteSel, octSel]),
          el("div", { class: "pad-edit-midi" }, midiToLabel(midi)),
          el(
            "button",
            {
              type: "button",
              class: "btn ghost pad-audition",
              onClick: () => playTone(padIndex, ensureAudio().currentTime, 0.45, { peak: 0.22 }),
            },
            "▶"
          ),
        ]);
        grid.appendChild(cell);
      }
    }
    host.appendChild(grid);
  }

  function setInstrument(instrumentId) {
    if (!instrumentId) return;
    if (!LAYOUTS[instrumentId] && !S.isStringInstrument(instrumentId)) return;
    if (state.instrument === instrumentId) return;
    stopPlayback();
    state.instrument = instrumentId;
    persistInstrument();
    reresolveSongsForLayout();
    updateInstrumentChrome();
    renderLibrary();
    renderProgressions();
    renderSong();
    renderPlayer();
    renderPadsEditor();
  }

  function flashPad(padIndex) {
    const pad = document.querySelector(`#player-grid [data-pad="${padIndex}"]`);
    if (!pad) return;
    pad.classList.add("playing");
    pad.style.background = state.color;
    pad.style.color = "#fff";
    setTimeout(() => {
      pad.classList.remove("playing");
      // restore from library highlight if any
      renderPlayerHighlight();
    }, 180);
  }

  function renderPlayerRef() {
    const host = document.getElementById("player-chord-ref");
    if (!host) return;
    const entry = getDict(state.kind)[state.formula];
    if (!entry) {
      host.innerHTML = "";
      return;
    }
    host.innerHTML = "";
    host.appendChild(el("p", { class: "hint" }, `Library selection: ${displayTitle(state.root, state.formula, entry)}`));
    if (isStringMode()) {
      const isScale = state.kind === "scale";
      const diagram = resolveStringChart(state.root, entry.intervals, { isScale });
      host.appendChild(
        makeCard({
          title: displayTitle(state.root, state.formula, entry),
          color: state.color,
          isScale,
          diagram,
          midis: diagram.midis,
          onPlay: (list) => playMidis(list, { sequential: isScale }),
        })
      );
    } else {
      const { pads, primaryPads, rootIndex } = getActivePads(state.root, entry.intervals, {
        fillBoard: state.kind === "scale",
      });
      host.appendChild(
        makeCard({
          title: displayTitle(state.root, state.formula, entry),
          pads,
          primaryPads,
          color: state.color,
          rootIndex,
          isScale: state.kind === "scale",
          onPlay: (list) => playPads(list, { sequential: state.kind === "scale" }),
        })
      );
      renderPlayerHighlight();
    }
  }

  function renderPlayerHighlight() {
    if (isStringMode()) return;
    const entry = getDict(state.kind)[state.formula];
    if (!entry) return;
    const { pads, primaryPads } = getActivePads(state.root, entry.intervals, {
      fillBoard: state.kind === "scale",
    });
    const primarySet = new Set(state.kind === "scale" ? [] : primaryPads);
    document.querySelectorAll("#player-grid .pad").forEach((pad) => {
      const idx = Number(pad.dataset.pad);
      const on = pads.includes(idx);
      const primary = primarySet.has(idx);
      pad.classList.toggle("on", on);
      pad.classList.toggle("primary", primary);
      if (on) {
        pad.style.background = state.color;
        pad.style.boxShadow = `0 0 14px ${hexToRgba(state.color, 0.45)}`;
        pad.style.color = "#fff";
      } else {
        pad.style.background = "";
        pad.style.boxShadow = "";
        pad.style.color = "";
      }
    });
  }

  // --- Tabs ---
  function switchTab(name) {
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll(".panel").forEach((p) => {
      const on = p.id === `panel-${name}`;
      p.classList.toggle("active", on);
      p.hidden = !on;
    });
    if (name === "song") renderSong();
    if (name === "progressions") renderProgressions();
    if (name === "pads") renderPadsEditor();
    if (name === "play") {
      renderPlayerHighlight();
      renderPlayerRef();
    }
  }

  function filteredProgressions() {
    const q = state.progSearch.trim().toLowerCase();
    return PROGRESSIONS.filter((p) => {
      if (state.progGenre !== "All" && p.genre !== state.progGenre) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.aka || ""} ${p.genre} ${p.numerals}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderProgressions() {
    const keySel = document.getElementById("prog-key");
    const genreSel = document.getElementById("prog-genre");
    const chips = document.getElementById("prog-genre-chips");
    const list = document.getElementById("prog-list");
    const count = document.getElementById("prog-count");
    if (!keySel || !list) return;

    if (!keySel.options.length) {
      NOTES.forEach((n) => keySel.appendChild(el("option", { value: n }, n)));
    }
    keySel.value = state.progKey;

    const genres = progressionGenres();
    genreSel.innerHTML = "";
    genres.forEach((g) => {
      const opt = el("option", { value: g }, g);
      if (g === state.progGenre) opt.selected = true;
      genreSel.appendChild(opt);
    });

    chips.innerHTML = "";
    genres.forEach((g) => {
      chips.appendChild(
        el(
          "button",
          {
            type: "button",
            class: `chip${g === state.progGenre ? " active" : ""}`,
            onClick: () => {
              state.progGenre = g;
              renderProgressions();
            },
          },
          g === "All" ? `All (${PROGRESSIONS.length})` : g
        )
      );
    });

    const items = filteredProgressions();
    count.textContent = `Showing ${items.length} progression${items.length === 1 ? "" : "s"} in key of ${state.progKey}. Same chord types share a color when loaded.`;

    list.innerHTML = "";
    if (!items.length) {
      list.appendChild(el("p", { class: "empty-state" }, "No progressions match that filter."));
      return;
    }

    items.forEach((prog) => {
      const bars = resolveProgressionBars(prog, state.progKey);
      const uniques = uniqueChordLabels(bars);
      const playKey = `prog:${prog.name}:${state.progKey}`;
      const card = el("article", { class: "prog-card" });
      const main = el("div", { class: "prog-card-main" }, [
        el("div", { class: "prog-card-top" }, [
          el("h3", {}, prog.name),
          el("span", { class: "prog-genre-tag" }, prog.genre),
        ]),
        prog.aka ? el("p", { class: "prog-aka" }, prog.aka) : null,
        el("p", { class: "prog-numerals" }, prog.numerals),
        el(
          "div",
          { class: "prog-preview-chords" },
          uniques.map((u) =>
            el("span", { class: "prog-chip", style: { background: u.color } }, u.title)
          )
        ),
      ]);
      const actions = el("div", { class: "prog-actions" }, [
        el(
          "button",
          {
            type: "button",
            class: "btn primary",
            onClick: () => loadProgression(prog, false),
          },
          "Replace song"
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn",
            onClick: () => loadProgression(prog, true),
          },
          "Add to Song"
        ),
        el(
          "button",
          {
            type: "button",
            class: "btn ghost",
            "data-play-key": playKey,
            "data-idle-label": "▶ Preview",
            onClick: () =>
              toggleLoopPlay(playKey, () => resolveProgressionBars(prog, state.progKey)),
          },
          isPlaying(playKey) ? "⏹ Stop" : "▶ Preview"
        ),
      ]);
      card.appendChild(main);
      card.appendChild(actions);
      list.appendChild(card);
    });
  }

  function loadProgression(prog, append) {
    const bars = resolveProgressionBars(prog, state.progKey);
    const song = ensureActiveSong();
    const sectionName = `${prog.name} (${state.progKey})`;
    const section = makeSection({
      name: sectionName,
      role: append ? nextSectionRole(song) : "Verse",
      genre: prog.genre || "",
      sourceKey: state.progKey,
      bars,
    });

    if (!append) {
      song.sections = [section];
      song.name = sectionName;
      document.getElementById("song-name").value = sectionName;
    } else {
      // If appending onto an empty song, treat like first section naming
      if (!song.sections.length) {
        song.name = sectionName;
        document.getElementById("song-name").value = sectionName;
      } else if (!song.name || song.name === "Untitled Song" || song.name === "New Song") {
        song.name = sectionName;
        document.getElementById("song-name").value = sectionName;
      }
      song.sections.push(section);
    }

    const minorLean = /minor|aeolian|andalusian|phrygian|metal|neo-soul|i–|i7|im/i.test(
      `${prog.name} ${prog.numerals} ${prog.aka || ""}`
    );
    song.overlay = {
      root: state.progKey,
      formula: minorLean ? "Natural Minor / Aeolian" : "Major / Ionian",
      enabled: true,
    };
    persistSongs();
    switchTab("song");
    renderSong();
  }

  // --- Init ---
  function init() {
    updateInstrumentChrome();
    reresolveSongsForLayout();

    fillRootSelect(document.getElementById("root-select"));
    document.getElementById("root-select").value = state.root;
    document.getElementById("kind-select").value = state.kind;

    if (!state.songs.length) {
      // seed empty untitled so select isn't barren after first add
    } else if (!state.activeSongId || !activeSong()) {
      state.activeSongId = state.songs[0].id;
    }

    syncTempoInputs(activeSong()?.tempo || DEFAULT_TEMPO);

    document.querySelectorAll(".layout-btn").forEach((btn) => {
      btn.addEventListener("click", () => setInstrument(btn.dataset.instrument));
    });
    document.getElementById("instrument-select").addEventListener("change", (e) => {
      if (e.target.value) setInstrument(e.target.value);
      else if (isStringMode()) setInstrument("4x4");
    });

    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });

    document.getElementById("root-select").addEventListener("change", (e) => {
      state.root = e.target.value;
      renderLibrary();
    });
    document.getElementById("kind-select").addEventListener("change", (e) => {
      state.kind = e.target.value;
      state.category = "All";
      const list = formulasInCategory(state.kind, state.category);
      state.formula = list[0]?.name || state.formula;
      const song = activeSong();
      const libCapo = document.getElementById("library-capo");
      if (libCapo && song) {
        libCapo.value = String(state.kind === "scale" ? song.scaleCapo ?? 0 : song.chordCapo ?? 0);
      }
      renderLibrary();
    });
    document.getElementById("category-select").addEventListener("change", (e) => {
      state.category = e.target.value;
      const list = formulasInCategory(state.kind, state.category);
      if (!list.find((x) => x.name === state.formula)) state.formula = list[0]?.name;
      renderLibrary();
    });

    document.getElementById("btn-add-song").addEventListener("click", addCurrentToSong);
    document.getElementById("btn-show-all").addEventListener("click", () => {
      state.showAllRoots = !state.showAllRoots;
      document.getElementById("btn-show-all").textContent = state.showAllRoots
        ? "Hide all roots"
        : "Show all roots";
      renderLibrary();
    });

    document.getElementById("song-name").addEventListener("change", (e) => {
      const song = ensureActiveSong();
      song.name = e.target.value.trim() || "Untitled Song";
      persistSongs();
      refreshSongSelect();
    });
    document.getElementById("song-select").addEventListener("change", (e) => {
      stopPlayback();
      state.activeSongId = e.target.value || null;
      persistSongs();
      renderSong();
      renderLibrary();
    });
    document.getElementById("overlay-root").addEventListener("change", (e) => {
      const song = ensureActiveSong();
      song.overlay = song.overlay || {};
      song.overlay.root = e.target.value;
      if (song.overlay.formula) song.overlay.enabled = true;
      persistSongs();
      renderSong();
    });
    document.getElementById("overlay-formula").addEventListener("change", (e) => {
      const song = ensureActiveSong();
      song.overlay = song.overlay || { root: "C" };
      if (!e.target.value) {
        song.overlay.enabled = false;
        song.overlay.formula = "";
      } else {
        song.overlay.enabled = true;
        song.overlay.formula = e.target.value;
        song.overlay.root = document.getElementById("overlay-root").value;
      }
      persistSongs();
      renderSong();
    });

    document.getElementById("btn-save-song").addEventListener("click", () => {
      const song = ensureActiveSong();
      song.name = document.getElementById("song-name").value.trim() || "Untitled Song";
      persistSongs();
      refreshSongSelect();
      const btn = document.getElementById("btn-save-song");
      const prev = btn.textContent;
      btn.textContent = "Saved ✓";
      setTimeout(() => (btn.textContent = prev), 900);
    });
    document.getElementById("btn-new-song").addEventListener("click", () => {
      stopPlayback();
      const song = {
        id: uid(),
        name: "New Song",
        tempo: DEFAULT_TEMPO,
        chordCapo: 0,
        scaleCapo: 0,
        sections: [],
        overlay: { root: "C", formula: "", enabled: false },
      };
      state.songs.push(song);
      state.activeSongId = song.id;
      persistSongs();
      renderSong();
    });
    document.getElementById("btn-delete-song").addEventListener("click", () => {
      const song = activeSong();
      if (!song) return;
      if (!confirm(`Delete “${song.name}”?`)) return;
      stopPlayback();
      state.songs = state.songs.filter((s) => s.id !== song.id);
      state.activeSongId = state.songs[0]?.id || null;
      persistSongs();
      renderSong();
    });
    document.getElementById("btn-clear-song").addEventListener("click", () => {
      const song = activeSong();
      if (!song?.sections.length) return;
      if (!confirm("Clear all progressions in this song?")) return;
      stopPlayback();
      song.sections = [];
      persistSongs();
      renderSong();
    });
    document.getElementById("btn-play-song").addEventListener("click", playSongLoop);
    document.getElementById("btn-add-section").addEventListener("click", addEmptySection);
    document.getElementById("song-tempo").addEventListener("change", (e) => {
      setTempo(e.target.value);
    });
    document.getElementById("library-tempo").addEventListener("change", (e) => {
      setTempo(e.target.value);
    });

    function onCapoChange(which, value) {
      const song = ensureActiveSong();
      const capo = S.clampCapo(value);
      if (which === "chord") song.chordCapo = capo;
      else song.scaleCapo = capo;
      persistSongs();
      reresolveSongsForLayout();
      renderLibrary();
      renderSong();
      renderProgressions();
    }

    document.getElementById("song-chord-capo").addEventListener("change", (e) => {
      onCapoChange("chord", e.target.value);
    });
    document.getElementById("song-scale-capo").addEventListener("change", (e) => {
      onCapoChange("scale", e.target.value);
    });
    document.getElementById("library-capo").addEventListener("change", (e) => {
      onCapoChange(state.kind === "scale" ? "scale" : "chord", e.target.value);
    });

    document.getElementById("btn-print").addEventListener("click", () => {
      switchTab("song");
      setTimeout(() => window.print(), 50);
    });

    document.getElementById("btn-pads-reset-c3").addEventListener("click", () => {
      resetPadMapChromatic(48); // C3
    });
    document.getElementById("btn-pads-reset-c2").addEventListener("click", () => {
      resetPadMapChromatic(36); // C2
    });
    document.getElementById("btn-pads-reset-c4").addEventListener("click", () => {
      resetPadMapChromatic(60); // C4 / middle C
    });
    document.getElementById("btn-tuning-reset").addEventListener("click", resetTuning);

    document.getElementById("prog-key").addEventListener("change", (e) => {
      state.progKey = e.target.value;
      renderProgressions();
    });
    document.getElementById("prog-genre").addEventListener("change", (e) => {
      state.progGenre = e.target.value;
      renderProgressions();
    });
    document.getElementById("prog-search").addEventListener("input", (e) => {
      state.progSearch = e.target.value;
      renderProgressions();
    });

    // Unlock audio on first gesture
    ["pointerdown", "keydown"].forEach((evt) => {
      window.addEventListener(evt, () => ensureAudio(), { once: true });
    });

    renderLibrary();
    renderPlayer();
    renderProgressions();
    renderPadsEditor();
    renderSong();
  }

  init();
})();
