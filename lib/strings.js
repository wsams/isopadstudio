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
   * voicing: "search" (default) | "open" — open lights matching open strings only
   *   (for many-string zithers where fretted search is impractical).
   */
  const INSTRUMENTS = {
    guitar6: {
      id: "guitar6",
      label: "Guitar",
      family: "strings",
      style: "fretted",
      strings: 6,
      openMidi: [40, 45, 50, 55, 59, 64], // E2 A2 D3 G3 B3 E4
      stringNames: ["E", "A", "D", "G", "B", "E"],
      presets: {
        standard: {
          id: "standard",
          label: "Standard",
          detail: "EADGBE",
          openMidi: [40, 45, 50, 55, 59, 64],
        },
        dropD: {
          id: "dropD",
          label: "Drop D",
          detail: "DADGBE",
          openMidi: [38, 45, 50, 55, 59, 64], // D2 A2 D3 G3 B3 E4
        },
        dadgad: {
          id: "dadgad",
          label: "DADGAD",
          detail: "DADGAD",
          openMidi: [38, 45, 50, 55, 57, 62], // D2 A2 D3 G3 A3 D4
        },
        openG: {
          id: "openG",
          label: "Open G",
          detail: "DGDGBD",
          openMidi: [38, 43, 50, 55, 59, 62], // D2 G2 D3 G3 B3 D4
        },
      },
    },
    bass4: {
      id: "bass4",
      label: "Bass (4-string)",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [28, 33, 38, 43], // E1 A1 D2 G2
      stringNames: ["E", "A", "D", "G"],
    },
    bass5: {
      id: "bass5",
      label: "Bass (5-string)",
      family: "strings",
      style: "fretted",
      strings: 5,
      openMidi: [23, 28, 33, 38, 43], // B0 E1 A1 D2 G2
      stringNames: ["B", "E", "A", "D", "G"],
    },
    uke4: {
      id: "uke4",
      label: "Ukulele",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [67, 60, 64, 69], // G4 C4 E4 A4 re-entrant
      stringNames: ["G", "C", "E", "A"],
    },
    mandolin: {
      id: "mandolin",
      label: "Mandolin",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [55, 62, 69, 76], // G3 D4 A4 E5
      stringNames: ["G", "D", "A", "E"],
    },
    banjo5: {
      id: "banjo5",
      label: "Banjo (5-string)",
      family: "strings",
      style: "fretted",
      strings: 5,
      // Display order low→high for chart: D3 G3 B3 D4 + short 5th G4 at top visually as last
      // Standard chart often shows 5th string on top; we keep low→high: D G B D g
      openMidi: [50, 55, 59, 62, 67], // D3 G3 B3 D4 G4
      stringNames: ["D", "G", "B", "D", "G"],
      shortFifth: true,
    },
    violin: {
      id: "violin",
      label: "Violin",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [55, 62, 69, 76], // G3 D4 A4 E5
      stringNames: ["G", "D", "A", "E"],
    },
    viola: {
      id: "viola",
      label: "Viola",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [48, 55, 62, 69], // C3 G3 D4 A4
      stringNames: ["C", "G", "D", "A"],
    },
    cello: {
      id: "cello",
      label: "Cello",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [36, 43, 50, 57], // C2 G2 D3 A3
      stringNames: ["C", "G", "D", "A"],
    },
    doublebass: {
      id: "doublebass",
      label: "Double bass",
      family: "strings",
      style: "fingerboard",
      strings: 4,
      openMidi: [28, 33, 38, 43], // E1 A1 D2 G2
      stringNames: ["E", "A", "D", "G"],
    },

    // —— Chinese ——
    pipa: {
      id: "pipa",
      label: "Pipa",
      region: "Chinese",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [45, 50, 52, 57], // A2 D3 E3 A3 (common modern)
      stringNames: ["A", "D", "E", "A"],
    },
    erhu: {
      id: "erhu",
      label: "Erhu",
      region: "Chinese",
      family: "strings",
      style: "fingerboard",
      strings: 2,
      openMidi: [62, 69], // D4 A4
      stringNames: ["D", "A"],
    },
    zhongruan: {
      id: "zhongruan",
      label: "Zhongruan",
      region: "Chinese",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [43, 50, 57, 64], // G2 D3 A3 E4
      stringNames: ["G", "D", "A", "E"],
    },
    guzheng: {
      id: "guzheng",
      label: "Guzheng",
      region: "Chinese",
      family: "strings",
      style: "fingerboard",
      voicing: "open",
      strings: 21,
      // 21-string D major pentatonic (D E F# A B ×4 + D)
      openMidi: [38, 40, 42, 45, 47, 50, 52, 54, 57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86],
      stringNames: ["D", "E", "F#", "A", "B", "D", "E", "F#", "A", "B", "D", "E", "F#", "A", "B", "D", "E", "F#", "A", "B", "D"],
      presets: {
        dPent: {
          id: "dPent",
          label: "D pentatonic",
          detail: "D E F♯ A B",
          openMidi: [38, 40, 42, 45, 47, 50, 52, 54, 57, 59, 62, 64, 66, 69, 71, 74, 76, 78, 81, 83, 86],
        },
        gPent: {
          id: "gPent",
          label: "G pentatonic",
          detail: "G A B D E",
          openMidi: [43, 45, 47, 50, 52, 55, 57, 59, 62, 64, 67, 69, 71, 74, 76, 79, 81, 83, 86, 88, 91],
        },
        cPent: {
          id: "cPent",
          label: "C pentatonic",
          detail: "C D E G A",
          openMidi: [36, 38, 40, 43, 45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72, 74, 76, 79, 81, 84],
        },
      },
    },

    // —— Japanese ——
    shamisen: {
      id: "shamisen",
      label: "Shamisen",
      region: "Japanese",
      family: "strings",
      style: "fretted",
      strings: 3,
      openMidi: [50, 55, 62], // D3 G3 D4 hon-chōshi
      stringNames: ["D", "G", "D"],
      presets: {
        honchoshi: {
          id: "honchoshi",
          label: "Hon-chōshi",
          detail: "DGD",
          openMidi: [50, 55, 62],
        },
        niagari: {
          id: "niagari",
          label: "Ni-agari",
          detail: "DAD",
          openMidi: [50, 57, 62], // D3 A3 D4
        },
        sansagari: {
          id: "sansagari",
          label: "San-sagari",
          detail: "DGC",
          openMidi: [50, 55, 60], // D3 G3 C4
        },
      },
    },
    koto: {
      id: "koto",
      label: "Koto",
      region: "Japanese",
      family: "strings",
      style: "fingerboard",
      voicing: "open",
      strings: 13,
      // 13-string hira-joshi (approx. equal temperament)
      openMidi: [50, 55, 57, 58, 62, 63, 67, 69, 70, 74, 75, 79, 81],
      stringNames: ["D", "G", "A", "A#", "D", "D#", "G", "A", "A#", "D", "D#", "G", "A"],
      presets: {
        hirajoshi: {
          id: "hirajoshi",
          label: "Hira-joshi",
          detail: "D G A B♭ …",
          openMidi: [50, 55, 57, 58, 62, 63, 67, 69, 70, 74, 75, 79, 81],
        },
      },
    },

    // —— Middle Eastern ——
    oud: {
      id: "oud",
      label: "Oud",
      region: "Middle Eastern",
      family: "strings",
      style: "fingerboard",
      strings: 6,
      openMidi: [36, 41, 45, 50, 55, 60], // C2 F2 A2 D3 G3 C4 (Arabic courses)
      stringNames: ["C", "F", "A", "D", "G", "C"],
      presets: {
        arabic: {
          id: "arabic",
          label: "Arabic",
          detail: "CFADGC",
          openMidi: [36, 41, 45, 50, 55, 60],
        },
        turkish: {
          id: "turkish",
          label: "Turkish",
          detail: "DAB EAD",
          openMidi: [38, 45, 47, 52, 57, 62], // D2 A2 B2 E3 A3 D4
        },
      },
    },
    baglama: {
      id: "baglama",
      label: "Bağlama",
      region: "Middle Eastern",
      family: "strings",
      style: "fretted",
      strings: 3,
      openMidi: [43, 50, 57], // G2 D3 A3 (common bozuk-style)
      stringNames: ["G", "D", "A"],
      presets: {
        bozuk: {
          id: "bozuk",
          label: "Bozuk",
          detail: "GDA",
          openMidi: [43, 50, 57],
        },
        bozukCGD: {
          id: "bozukCGD",
          label: "Bozuk (C G D)",
          detail: "CGD",
          openMidi: [36, 43, 50], // C2 G2 D3
        },
      },
    },
    setar: {
      id: "setar",
      label: "Setar",
      region: "Middle Eastern",
      family: "strings",
      style: "fretted",
      strings: 4,
      openMidi: [48, 60, 55, 60], // C3 C4 G3 C4 (Persian setar string order)
      stringNames: ["C", "C", "G", "C"],
    },
    tar: {
      id: "tar",
      label: "Tar",
      region: "Middle Eastern",
      family: "strings",
      style: "fretted",
      strings: 6,
      openMidi: [48, 48, 55, 55, 60, 60], // C3 C3 G3 G3 C4 C4 (three double courses)
      stringNames: ["C", "C", "G", "G", "C", "C"],
    },
  };

  const PAD_LAYOUT_IDS = new Set(["4x4", "2x4", "2x6", "2x8"]);

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

  /**
   * Open strings are stored low → high. If a saved tuning is exactly the reverse of
   * the instrument default or a preset (common chart-orientation mixup), flip it back.
   * Skips re-entrant ukulele.
   */
  function coerceTuningOrder(arr, instrumentId) {
    const norm = normalizeTuning(arr, instrumentId);
    if (instrumentId === "uke4") return norm;

    const reversed = norm.slice().reverse();
    const candidates = [defaultTuning(instrumentId), ...listPresets(instrumentId).map((p) => p.openMidi)];
    const reverseMatchesKnown = candidates.some((c) => tuningsEqual(reversed, c));
    const forwardMatchesKnown = candidates.some((c) => tuningsEqual(norm, c));
    if (reverseMatchesKnown && !forwardMatchesKnown) return reversed;

    // Strictly descending pitch (non-reentrant) → treat as high→low and flip
    let descending = norm.length > 1;
    for (let i = 1; i < norm.length; i++) {
      if (norm[i] >= norm[i - 1]) {
        descending = false;
        break;
      }
    }
    if (descending) return reversed;

    return norm;
  }

  function tuningsEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((v, i) => Number(v) === Number(b[i]));
  }

  function isStandardTuning(instrumentId, tuning) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) return false;
    return tuningsEqual(normalizeTuning(tuning, instrumentId), inst.openMidi);
  }

  function listPresets(instrumentId) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst?.presets) return [];
    return Object.values(inst.presets);
  }

  function getPreset(instrumentId, presetId) {
    return INSTRUMENTS[instrumentId]?.presets?.[presetId] || null;
  }

  function applyPreset(instrumentId, presetId) {
    const preset = getPreset(instrumentId, presetId);
    if (!preset) throw new Error(`Unknown preset: ${instrumentId}/${presetId}`);
    return preset.openMidi.slice();
  }

  /** Pitch-class letters for the current open tuning, e.g. ["E","A","D","G","B","E"] */
  function tuningNoteNames(tuning) {
    return (tuning || []).map((midi) => NOTES[midiPitchClass(midi)]);
  }

  /** Compact label like "EADGBE" or "DADGBE" */
  function tuningSummary(tuning) {
    return tuningNoteNames(tuning).join("");
  }

  function matchPresetId(instrumentId, tuning) {
    const presets = listPresets(instrumentId);
    const norm = normalizeTuning(tuning, instrumentId);
    const hit = presets.find((p) => tuningsEqual(p.openMidi, norm));
    return hit ? hit.id : null;
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
   * frets: null = muted, 0 = open; fingers: 1–4 (index–pinky), null = open/mute.
   */
  const GUITAR_SHAPES = {
    // Major triad
    "0:0,4,7": { frets: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null] }, // C
    "2:0,4,7": { frets: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2] }, // D
    "4:0,4,7": { frets: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null] }, // E
    "5:0,4,7": { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1] }, // F
    "7:0,4,7": { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3] }, // G
    "9:0,4,7": { frets: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null] }, // A
    "11:0,4,7": { frets: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1] }, // B
    // Minor
    "0:0,3,7": { frets: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1] }, // Cm
    "2:0,3,7": { frets: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1] }, // Dm
    "4:0,3,7": { frets: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null] }, // Em
    "5:0,3,7": { frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1] }, // Fm
    "7:0,3,7": { frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1] }, // Gm
    "9:0,3,7": { frets: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null] }, // Am
    "11:0,3,7": { frets: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1] }, // Bm
    // Dominant 7
    "0:0,4,7,10": { frets: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null] }, // C7
    "2:0,4,7,10": { frets: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3] }, // D7
    "4:0,4,7,10": { frets: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null] }, // E7
    "5:0,4,7,10": { frets: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1] }, // F7
    "7:0,4,7,10": { frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1] }, // G7
    "9:0,4,7,10": { frets: [null, 0, 2, 0, 2, 0], fingers: [null, null, 1, null, 3, null] }, // A7
    "11:0,4,7,10": { frets: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4] }, // B7
    // Maj7
    "0:0,4,7,11": { frets: [null, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null] }, // Cmaj7
    "2:0,4,7,11": { frets: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3] }, // Dmaj7
    "4:0,4,7,11": { frets: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null] }, // Emaj7
    "7:0,4,7,11": { frets: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1] }, // Gmaj7
    "9:0,4,7,11": { frets: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null] }, // Amaj7
    // m7
    "0:0,3,7,10": { frets: [null, 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1] }, // Cm7
    "2:0,3,7,10": { frets: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1] }, // Dm7
    "4:0,3,7,10": { frets: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null] }, // Em7
    "7:0,3,7,10": { frets: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1] }, // Gm7
    "9:0,3,7,10": { frets: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null] }, // Am7
    // sus2 / sus4 / power
    "0:0,2,7": { frets: [null, 3, 0, 0, 1, 3], fingers: [null, 3, null, null, 1, 4] },
    "0:0,5,7": { frets: [null, 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1] },
    "4:0,5,7": { frets: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null] },
    "9:0,5,7": { frets: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 3, null] },
    "0:0,7": { frets: [null, 3, null, 0, 1, 3], fingers: [null, 3, null, null, 1, 4] },
    "4:0,7": { frets: [0, 2, 2, null, 0, 0], fingers: [null, 1, 2, null, null, null] },
    "7:0,7": { frets: [3, null, 0, 0, 3, 3], fingers: [1, null, null, null, 3, 4] },
    "9:0,7": { frets: [null, 0, 2, 2, null, 0], fingers: [null, null, 1, 2, null, null] },
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

  /** Assign 1–4 when no curated fingering exists (barre → 1, then ascending frets). */
  function assignFingers(frets) {
    const fingers = frets.map(() => null);
    const barre = detectBarre(frets);
    const claimed = new Set();
    if (barre != null) {
      frets.forEach((f, i) => {
        if (f === barre) {
          fingers[i] = 1;
          claimed.add(i);
        }
      });
    }
    const rest = [];
    frets.forEach((f, i) => {
      if (f != null && f > 0 && !claimed.has(i)) rest.push({ i, f });
    });
    rest.sort((a, b) => a.f - b.f || a.i - b.i);
    let next = barre != null ? 2 : 1;
    rest.forEach(({ i }) => {
      if (next <= 4) {
        fingers[i] = next;
        next += 1;
      }
    });
    return fingers;
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
    return {
      frets: shape.frets.slice(),
      fingers: shape.fingers ? shape.fingers.slice() : assignFingers(shape.frets),
    };
  }

  function normalizeFretsForDiagram(frets, fingers = null) {
    const pressed = frets.filter((f) => f != null && f > 0);
    const fingerOut = fingers ? fingers.slice() : assignFingers(frets);
    if (!pressed.length) {
      return { frets: frets.slice(), fingers: fingerOut, baseFret: 1, barre: null };
    }
    const min = Math.min(...pressed);
    const max = Math.max(...pressed);
    if (max <= 4) {
      return {
        frets: frets.slice(),
        fingers: fingerOut,
        baseFret: 1,
        barre: detectBarre(frets),
      };
    }
    const baseFret = min;
    const shifted = frets.map((f) => (f == null || f === 0 ? f : f - baseFret + 1));
    return {
      frets: shifted,
      fingers: fingerOut,
      baseFret,
      barre: detectBarre(shifted),
    };
  }

  function openStringVoicing(tuning, capo, tonePcs) {
    const c = clampCapo(capo);
    return tuning.map((open) => (tonePcs.has(midiPitchClass(open + c)) ? 0 : null));
  }

  /**
   * @returns {{ frets: (number|null)[], fingers: (number|null)[], baseFret: number, barre: number|null, midis: number[], missing: string[] }}
   */
  function resolveChordShape(instrumentId, root, intervals, capo = 0, tuning = null) {
    const inst = INSTRUMENTS[instrumentId];
    if (!inst) throw new Error(`Unknown instrument: ${instrumentId}`);
    const c = clampCapo(capo);
    const openMidi = normalizeTuning(tuning || inst.openMidi, instrumentId);
    const rootPc = noteToPc(root);
    const tonePcs = new Set(intervals.map((iv) => (rootPc + ((iv % 12) + 12) % 12) % 12));

    let frets = null;
    let fingers = null;
    if (inst.voicing === "open") {
      frets = openStringVoicing(openMidi, c, tonePcs);
    } else if (instrumentId === "guitar6" && isStandardTuning(instrumentId, openMidi)) {
      const curated = guitarCurated(rootPc, intervals, c);
      if (curated) {
        frets = curated.frets;
        fingers = curated.fingers;
      }
    }
    if (!frets) {
      frets = searchVoicing(openMidi, c, rootPc, intervals, {
        maxFret: inst.style === "fingerboard" ? 7 : 5,
      });
    }
    if (!frets) {
      frets = openMidi.map(() => null);
    }

    if (inst.voicing !== "open" && !coversTones(frets, openMidi, c, tonePcs)) {
      const wider = searchVoicing(openMidi, c, rootPc, intervals, { maxFret: 8 });
      if (wider && scoreShape(wider, openMidi, c, rootPc, tonePcs) < scoreShape(frets, openMidi, c, rootPc, tonePcs)) {
        frets = wider;
        fingers = null;
      }
    }

    if (!fingers) fingers = assignFingers(frets);

    const midis = shapeMidiNotes(frets, openMidi, c);
    const have = new Set(midis.map(midiPitchClass));
    const missing = [...tonePcs].filter((pc) => !have.has(pc)).map((pc) => NOTES[pc]);
    const diagram = normalizeFretsForDiagram(frets, fingers);

    return {
      frets: diagram.frets,
      fingers: diagram.fingers,
      absoluteFrets: frets,
      baseFret: diagram.baseFret,
      barre: diagram.barre,
      midis,
      missing,
      capo: c,
      instrumentId,
      openMidi: openMidi.slice(),
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
      openMidi: openMidi.slice(),
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
    coerceTuningOrder,
    tuningsEqual,
    isStandardTuning,
    listPresets,
    getPreset,
    applyPreset,
    tuningNoteNames,
    tuningSummary,
    matchPresetId,
    clampCapo,
    effectiveOpenMidi,
    resolveChordShape,
    resolveScaleDiagram,
    intervalsKey,
    midiPitchClass,
    noteToPc,
  };
});
