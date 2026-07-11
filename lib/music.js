/**
 * Pure music / pad-map helpers for IsoPad Studio.
 * Works in the browser (global) and in Node (module.exports).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IsoPadMusic = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const DEFAULT_START_MIDI = 48; // C3
  const LAYOUT_PAD_COUNTS = { "4x4": 16, "2x4": 8, "2x6": 12, "2x8": 16 };

  function midiPitchClass(midi) {
    return ((midi % 12) + 12) % 12;
  }

  function midiToLabel(midi) {
    return `${NOTES[midiPitchClass(midi)]}${Math.floor(midi / 12) - 1}`;
  }

  function labelToMidi(note, octave) {
    const pc = NOTES.indexOf(note);
    if (pc < 0) throw new Error(`Unknown note: ${note}`);
    return (Number(octave) + 1) * 12 + pc;
  }

  function midiParts(midi) {
    return {
      note: NOTES[midiPitchClass(midi)],
      octave: Math.floor(midi / 12) - 1,
    };
  }

  function defaultPadMap(layoutId) {
    const n = LAYOUT_PAD_COUNTS[layoutId];
    if (!n) throw new Error(`Unknown layout: ${layoutId}`);
    return Array.from({ length: n }, (_, i) => DEFAULT_START_MIDI + i);
  }

  function normalizePadMap(arr, layoutId) {
    const n = LAYOUT_PAD_COUNTS[layoutId];
    if (!n) throw new Error(`Unknown layout: ${layoutId}`);
    if (!Array.isArray(arr) || arr.length !== n) return defaultPadMap(layoutId);
    return arr.map((v) => {
      const midi = Number(v);
      if (!Number.isFinite(midi)) return DEFAULT_START_MIDI;
      return Math.max(0, Math.min(127, Math.round(midi)));
    });
  }

  /**
   * Resolve chord/scale tones onto a pad map.
   * - `pads`: every pad whose pitch class is in the chord/scale
   * - `primaryPads`: one pad per interval (nearest to rootMidi + interval) —
   *   the main voicing / first instances (special border in the UI)
   *
   * @param {string} root note name
   * @param {number[]} intervals semitone offsets from root
   * @param {number[]} map MIDI note per pad index
   * @param {{ fillBoard?: boolean }} [opts] kept for callers; all matching pads are always returned
   */
  function getActivePads(root, intervals, map, { fillBoard = false } = {}) {
    void fillBoard;
    const rootPc = NOTES.indexOf(root);
    if (rootPc < 0) throw new Error(`Unknown root: ${root}`);
    if (!Array.isArray(map) || !map.length) {
      return {
        pads: [],
        primaryPads: [],
        missing: intervals.map((iv) => NOTES[(rootPc + ((iv % 12) + 12) % 12) % 12]),
        rootIndex: null,
      };
    }

    const tonePcs = new Set(
      intervals.map((iv) => (rootPc + ((iv % 12) + 12) % 12) % 12)
    );

    let rootPad = -1;
    let rootMidi = Infinity;
    map.forEach((midi, i) => {
      if (midiPitchClass(midi) === rootPc && midi < rootMidi) {
        rootMidi = midi;
        rootPad = i;
      }
    });

    const pads = [];
    map.forEach((midi, i) => {
      if (tonePcs.has(midiPitchClass(midi))) pads.push(i);
    });

    if (rootPad < 0) {
      return {
        pads,
        primaryPads: [],
        missing: intervals.map((iv) => NOTES[(rootPc + ((iv % 12) + 12) % 12) % 12]),
        rootIndex: null,
      };
    }

    const primaryPads = [];
    const missing = [];
    const used = new Set();

    intervals.forEach((interval) => {
      const targetPc = (rootPc + ((interval % 12) + 12) % 12) % 12;
      const ideal = rootMidi + interval;
      let best = -1;
      let bestScore = Infinity;
      map.forEach((midi, i) => {
        if (used.has(i)) return;
        if (midiPitchClass(midi) !== targetPc) return;
        const score = Math.abs(midi - ideal) + (midi < rootMidi - 0.5 ? 80 : 0);
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      });
      if (best >= 0) {
        primaryPads.push(best);
        used.add(best);
      } else {
        missing.push(NOTES[targetPc]);
      }
    });

    return {
      pads,
      primaryPads,
      missing,
      rootIndex: rootPad,
    };
  }

  function sortPadsByPitch(pads, map) {
    return [...pads].sort((a, b) => (map[a] - map[b]) || (a - b));
  }

  function midiToFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  return {
    NOTES,
    DEFAULT_START_MIDI,
    LAYOUT_PAD_COUNTS,
    midiPitchClass,
    midiToLabel,
    labelToMidi,
    midiParts,
    defaultPadMap,
    normalizePadMap,
    getActivePads,
    sortPadsByPitch,
    midiToFreq,
  };
});
