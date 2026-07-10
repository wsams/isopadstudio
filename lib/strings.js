/**
 * String-instrument registry, capo math, and fretboard chord/scale resolvers.
 * Works in the browser (global) and in Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IsoPadStrings = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

  function midiPitchClass(midi) {
    return ((midi % 12) + 12) % 12;
  }

  function noteToPc(note) {
    const pc = NOTES.indexOf(note);
    if (pc < 0) throw new Error(`Unknown note: ${note}`);
    return pc;
  }

  function clampCapo(capo) {
    const n = Number(capo);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(12, Math.round(n)));
  }

  /**
   * Open MIDI per string, low → high.
   * style: "fretted" | "fingerboard"
   */
  const INSTRUMENTS = {
    guitar6: {
      id: "guitar6",
      label: "Guitar (6)",
      short: "Guitar",
      family: "strings",
      style: "fretted",
      strings: 6,
      openMidi: [40, 45, 50, 55, 59, 64], // E2 A2 D3 G3 B3 E4
      stringNames: ["E", "A", "D", "G", "B", "e"],
    },
    bass4: {
      id: "bass4",
      label: "Bass (4)",
      short: "Bass 4",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [28, 33, 38, 43], // E1 A1 D2 G2
      stringNames: ["E", "A", "D", "G"],
    },
    bass5: {
      id: "bass5",
      label: "Bass (5)",
      short: "Bass 5",
      family: "strings",
      style: "fretted",
      strings: 5,
      openMidi: [23, 28, 33, 38, 43], // B0 E1 A1 D2 G2
      stringNames: ["B", "E", "A", "D", "G"],
    },
    uke4: {
      id: "uke4",
      label: "Ukulele",
      short: "Uke",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [67, 60, 64, 69], // G4 C4 E4 A4 re-entrant
      stringNames: ["G", "C", "E", "A"],
    },
    mandolin: {
      id: "mandolin",
      label: "Mandolin",
      short: "Mando",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [55, 62, 69, 76], // G3 D4 A4 E5
      stringNames: ["G", "D", "A", "E"],
    },
    banjo5: {
      id: "banjo5",
      label: "Banjo (5)",
      short: "Banjo",
      family: "strings",
      style: "fretted",
      strings: 5,
      // Display order low→high for chart: D3 G3 B3 D4 + short 5th G4 at top visually as last
      // Standard chart often shows 5th string on top; we keep low→high: D G B D g
      openMidi: [50, 55, 59, 62, 67], // D3 G3 B3 D4 G4
      stringNames: ["D", "G", "B", "D", "g"],
      shortFifth: true,
    },
    violin: {
      id: "violin",
      label: "Violin",
      short: "Violin",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [55, 62, 69, 76], // G3 D4 A4 E5
      stringNames: ["G", "D", "A", "E"],
    },
    viola: {
      id: "viola",
      label: "Viola",
      short: "Viola",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [48, 55, 62, 69], // C3 G3 D4 A4
      stringNames: ["C", "G", "D", "A"],
    },
    cello: {
      id: "cello",
      label: "Cello",
      short: "Cello",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [36, 43, 50, 57], // C2 G2 D3 A3
      stringNames: ["C", "G", "D", "A"],
    },
    doublebass: {
      id: "doublebass",
      label: "Double bass",
      short: "D. bass",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [28, 33, 38, 43], // E1 A1 D2 G2
      stringNames: ["E", "A", "D", "G"],
    },
  };

  const PAD_LAYOUT_IDS = new Set(["4x4", "2x4"]);

  function isPadLayout(id) {
    return PAD_LAYOUT_IDS.has(id);
  }

  function isStringInstrument(id) {
    return Boolean(INSTRUMENTS[id]);
  }

  function getInstrument(id) {
    return INSTRUMENTS[id] || null;
  }

  function defaultTuning(instrumentId) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) throw new Error(`Unknown instrument: ${instrumentId}`);
    return inst.openMidi.slice();
  }

  function normalizeTuning(arr, instrumentId) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) throw new Error(`Unknown instrument: ${instrumentId}`);
    if (!Array.isArray(arr) || arr.length !== inst.strings) return defaultTuning(instrumentId);
    return arr.map((v, i) => {
      const midi = Number(v);
      if (!Number.isFinite(midi)) return inst.openMidi[i];
      return Math.max(0, Math.min(127, Math.round(midi)));
    });
  }

  function effectiveOpenMidi(tuning, capo) {
    const c = clampCapo(capo);
    return tuning.map((m) => m + c);
  }

  function intervalsKey(intervals) {
    return [...intervals]
      .map((iv) => ((iv % 12) + 12) % 12)
      .sort((a, b) => a - b)
      .join(",");
  }

  /**
   * Curated open/near-open guitar shapes keyed by root PC + interval signature.
   * Frets are absolute from the nut (capo applied by looking up transposed root).
   * null = muted.
   */
  const GUITAR_SHAPES = {
    // Major triad
    "0:0,4,7": [null, 3, 2, 0, 1, 0], // C
    "2:0,4,7": [null, null, 0, 2, 3, 2], // D
    "4:0,4,7": [0, 2, 2, 1, 0, 0], // E
    "5:0,4,7": [1, 3, 3, 2, 1, 1], // F
    "7:0,4,7": [3, 2, 0, 0, 0, 3], // G
    "9:0,4,7": [null, 0, 2, 2, 2, 0], // A
    "11:0,4,7": [null, 2, 4, 4, 4, 2], // B (A-shape barre)
    // Minor
    "0:0,3,7": [null, 3, 5, 5, 4, 3], // Cm
    "2:0,3,7": [null, null, 0, 2, 3, 1], // Dm
    "4:0,3,7": [0, 2, 2, 0, 0, 0], // Em
    "5:0,3,7": [1, 3, 3, 1, 1, 1], // Fm
    "7:0,3,7": [3, 5, 5, 3, 3, 3], // Gm
    "9:0,3,7": [null, 0, 2, 2, 1, 0], // Am
    "11:0,3,7": [null, 2, 4, 4, 3, 2], // Bm
    // Dominant 7
    "0:0,4,7,10": [null, 3, 2, 3, 1, 0], // C7
    "2:0,4,7,10": [null, null, 0, 2, 1, 2], // D7
    "4:0,4,7,10": [0, 2, 0, 1, 0, 0], // E7
    "5:0,4,7,10": [1, 3, 1, 2, 1, 1], // F7
    "7:0,4,7,10": [3, 2, 0, 0, 0, 1], // G7
    "9:0,4,7,10": [null, 0, 2, 0, 2, 0], // A7
    "11:0,4,7,10": [null, 2, 1, 2, 0, 2], // B7
    // Maj7
    "0:0,4,7,11": [null, 3, 2, 0, 0, 0], // Cmaj7
    "2:0,4,7,11": [null, null, 0, 2, 2, 2], // Dmaj7
    "4:0,4,7,11": [0, 2, 1, 1, 0, 0], // Emaj7
    "7:0,4,7,11": [3, 2, 0, 0, 0, 2], // Gmaj7
    "9:0,4,7,11": [null, 0, 2, 1, 2, 0], // Amaj7
    // m7
    "0:0,3,7,10": [null, 3, 5, 3, 4, 3], // Cm7
    "2:0,3,7,10": [null, null, 0, 2, 1, 1], // Dm7
    "4:0,3,7,10": [0, 2, 0, 0, 0, 0], // Em7
    "7:0,3,7,10": [3, 5, 3, 3, 3, 3], // Gm7
    "9:0,3,7,10": [null, 0, 2, 0, 1, 0], // Am7
    // sus2 / sus4 / power
    "0:0,2,7": [null, 3, 0, 0, 1, 3], // Csus2-ish
    "0:0,5,7": [null, 3, 3, 0, 1, 1], // Csus4
    "4:0,5,7": [0, 2, 2, 2, 0, 0], // Esus4
    "9:0,5,7": [null, 0, 2, 2, 3, 0], // Asus4
    "0:0,7": [null, 3, null, 0, 1, 3], // C5-ish
    "4:0,7": [0, 2, 2, null, 0, 0], // E5
    "7:0,7": [3, null, 0, 0, 3, 3], // G5
    "9:0,7": [null, 0, 2, 2, null, 0], // A5
  };

  function detectBarre(frets) {
    const pressed = frets.filter((f) => f != null && f > 0);
    if (pressed.length < 3) return null;
    const min = Math.min(...pressed);
    if (min < 1) return null;
    const atBarre = frets.filter((f) => f === min).length;
    if (atBarre < 2) return null;
    return min;
  }

  function shapeMidiNotes(frets, openMidi, capo) {
    const opens = effectiveOpenMidi(openMidi, capo);
    const notes = [];
    frets.forEach((f, i) => {
      if (f == null || f < 0) return;
      notes.push(opens[i] + f);
    });
    return notes;
  }

  function coversTones(frets, openMidi, capo, tonePcs) {
    const pcs = new Set(shapeMidiNotes(frets, openMidi, capo).map(midiPitchClass));
    for (const pc of tonePcs) {
      if (!pcs.has(pc)) return false;
    }
    return true;
  }

  function scoreShape(frets, openMidi, capo, rootPc, tonePcs) {
    const notes = shapeMidiNotes(frets, openMidi, capo);
    if (!notes.length) return Infinity;
    const pcs = new Set(notes.map(midiPitchClass));
    let missing = 0;
    tonePcs.forEach((pc) => {
      if (!pcs.has(pc)) missing += 1;
    });
    const pressed = frets.filter((f) => f != null && f > 0);
    const span = pressed.length ? Math.max(...pressed) - Math.min(...pressed) : 0;
    const muted = frets.filter((f) => f == null).length;
    const maxFret = pressed.length ? Math.max(...pressed) : 0;
    const openBonus = frets.filter((f) => f === 0).length;
    const hasRoot = notes.some((m) => midiPitchClass(m) === rootPc);
    const lowest = Math.min(...notes);
    const rootLowBonus = midiPitchClass(lowest) === rootPc ? 0 : 8;
    return (
      missing * 100 +
      span * 6 +
      muted * 3 +
      maxFret * 1.5 +
      (hasRoot ? 0 : 25) +
      rootLowBonus -
      openBonus * 2
    );
  }

  function candidatesForString(openMidi, capo, tonePcs, maxFret) {
    const open = openMidi + capo;
    const out = [null]; // mute
    for (let f = 0; f <= maxFret; f++) {
      if (tonePcs.has(midiPitchClass(open + f))) out.push(f);
    }
    return out;
  }

  function searchVoicing(tuning, capo, rootPc, intervals, opts = {}) {
    const maxFret = opts.maxFret ?? 5;
    const tonePcs = intervals.map((iv) => (rootPc + ((iv % 12) + 12) % 12) % 12);
    const toneSet = new Set(tonePcs);
    const opens = tuning;
    const n = opens.length;

    // Prefer fewer mutes on higher instruments; allow mutes for guitar-like
    let best = null;
    let bestScore = Infinity;

    function dfs(i, frets) {
      if (i === n) {
        const sc = scoreShape(frets, opens, capo, rootPc, toneSet);
        if (sc < bestScore) {
          bestScore = sc;
          best = frets.slice();
        }
        return;
      }
      const cands = candidatesForString(opens[i], capo, toneSet, maxFret);
      for (const c of cands) {
        frets[i] = c;
        // prune: if pressed frets already span > 4, skip
        const pressed = frets.slice(0, i + 1).filter((f) => f != null && f > 0);
        if (pressed.length >= 2) {
          const span = Math.max(...pressed) - Math.min(...pressed);
          if (span > 4) continue;
        }
        dfs(i + 1, frets);
      }
    }

    dfs(0, new Array(n));
    return best;
  }

  function transposeShapeRoot(shapeRootPc, capo) {
    // Shape stored for concert root; with capo, play shape of (sounding - capo)
    return (shapeRootPc - clampCapo(capo) + 120) % 12;
  }

  function guitarCurated(soundingRootPc, intervals, capo) {
    const shapeRoot = transposeShapeRoot(soundingRootPc, capo);
    const key = `${shapeRoot}:${intervalsKey(intervals)}`;
    const shape = GUITAR_SHAPES[key];
    if (!shape) return null;
    // Shapes are nut-relative for open chords. With capo, frets are relative to capo
    // for the transposed shape — curated shapes are already "as played", so return as-is
    // (they describe frets above the effective nut / capo).
    return shape.slice();
  }

  function normalizeFretsForDiagram(frets) {
    const pressed = frets.filter((f) => f != null && f > 0);
    if (!pressed.length) {
      return { frets: frets.slice(), baseFret: 1, barre: null };
    }
    const min = Math.min(...pressed);
    const max = Math.max(...pressed);
    // If everything fits in frets 0–4, show from nut (baseFret 1)
    if (max <= 4) {
      return { frets: frets.slice(), baseFret: 1, barre: detectBarre(frets) };
    }
    // Shift display so lowest pressed fret is at position 1 of a 4-fret window
    const baseFret = min;
    const shifted = frets.map((f) => (f == null || f === 0 ? f : f - baseFret + 1));
    return {
      frets: shifted,
      baseFret,
      barre: detectBarre(shifted),
    };
  }

  /**
   * @returns {{ frets: (number|null)[], baseFret: number, barre: number|null, midis: number[], missing: string[] }}
   */
  function resolveChordShape(instrumentId, root, intervals, capo = 0, tuning = null) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) throw new Error(`Unknown instrument: ${instrumentId}`);
    const c = clampCapo(capo);
    const openMidi = normalizeTuning(tuning || inst.openMidi, instrumentId);
    const rootPc = noteToPc(root);
    const tonePcs = new Set(intervals.map((iv) => (rootPc + ((iv % 12) + 12) % 12) % 12));

    let frets = null;
    if (instrumentId === "guitar6") {
      frets = guitarCurated(rootPc, intervals, c);
    }
    if (!frets) {
      frets = searchVoicing(openMidi, c, rootPc, intervals, {
        maxFret: inst.style === "fingerboard" ? 7 : 5,
      });
    }
    if (!frets) {
      frets = openMidi.map(() => null);
    }

    // Widen search if coverage is poor
    if (!coversTones(frets, openMidi, c, tonePcs)) {
      const wider = searchVoicing(openMidi, c, rootPc, intervals, { maxFret: 8 });
      if (wider && scoreShape(wider, openMidi, c, rootPc, tonePcs) < scoreShape(frets, openMidi, c, rootPc, tonePcs)) {
        frets = wider;
      }
    }

    const midis = shapeMidiNotes(frets, openMidi, c);
    const have = new Set(midis.map(midiPitchClass));
    const missing = [...tonePcs].filter((pc) => !have.has(pc)).map((pc) => NOTES[pc]);
    const diagram = normalizeFretsForDiagram(frets);

    return {
      frets: diagram.frets,
      absoluteFrets: frets,
      baseFret: diagram.baseFret,
      barre: diagram.barre,
      midis,
      missing,
      capo: c,
      instrumentId,
    };
  }

  /**
   * Scale box in the same frame as chord charts: open + 4 frets.
   * Open scale tones use fret 0 (rendered as ○ at the nut); fretted tones are dots.
   * @returns {{ dots: { string: number, fret: number, midi: number, isRoot: boolean }[], baseFret: number, fretsShown: number }}
   */
  function resolveScaleDiagram(instrumentId, root, intervals, capo = 0, tuning = null, opts = {}) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) throw new Error(`Unknown instrument: ${instrumentId}`);
    const c = clampCapo(capo);
    const openMidi = normalizeTuning(tuning || inst.openMidi, instrumentId);
    const rootPc = noteToPc(root);
    const tonePcs = new Set(intervals.map((iv) => (rootPc + ((iv % 12) + 12) % 12) % 12));
    // Match chord diagrams: 4 frets past the nut/capo (positions 1–4), plus open (0)
    const fretsShown = opts.fretsShown ?? 4;
    const start = opts.startFret ?? 0;

    const dots = [];
    openMidi.forEach((open, stringIndex) => {
      const base = open + c;
      for (let f = start; f <= start + fretsShown; f++) {
        const midi = base + f;
        const pc = midiPitchClass(midi);
        if (!tonePcs.has(pc)) continue;
        // Display fret: 0 = open/nut; 1..fretsShown = cells (shift if start > 0)
        const displayFret = f === 0 ? 0 : f - start;
        dots.push({
          string: stringIndex,
          fret: displayFret,
          midi,
          isRoot: pc === rootPc,
        });
      }
    });

    return {
      dots,
      baseFret: start > 0 ? start : 1,
      fretsShown,
      capo: c,
      instrumentId,
      midis: dots.map((d) => d.midi).sort((a, b) => a - b),
    };
  }

  function listInstruments() {
    return Object.values(INSTRUMENTS);
  }

  return {
    NOTES,
    INSTRUMENTS,
    PAD_LAYOUT_IDS,
    isPadLayout,
    isStringInstrument,
    getInstrument,
    listInstruments,
    defaultTuning,
    normalizeTuning,
    clampCapo,
    effectiveOpenMidi,
    resolveChordShape,
    resolveScaleDiagram,
    intervalsKey,
    midiPitchClass,
    noteToPc,
  };
});
