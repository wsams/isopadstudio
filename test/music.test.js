const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const music = require("../lib/music.js");

const {
  NOTES,
  DEFAULT_START_MIDI,
  midiToLabel,
  labelToMidi,
  midiParts,
  defaultPadMap,
  normalizePadMap,
  getActivePads,
  sortPadsByPitch,
} = music;

describe("midi helpers", () => {
  it("maps C3 to MIDI 48 and back", () => {
    assert.equal(labelToMidi("C", 3), 48);
    assert.equal(midiToLabel(48), "C3");
    assert.deepEqual(midiParts(48), { note: "C", octave: 3 });
  });

  it("treats MIDI 60 as middle C (C4)", () => {
    assert.equal(labelToMidi("C", 4), 60);
    assert.equal(midiToLabel(60), "C4");
  });

  it("rejects unknown note names", () => {
    assert.throws(() => labelToMidi("H", 3), /Unknown note/);
  });
});

describe("pad maps", () => {
  it("builds chromatic defaults from C3", () => {
    const map16 = defaultPadMap("4x4");
    const map8 = defaultPadMap("2x4");
    assert.equal(map16.length, 16);
    assert.equal(map8.length, 8);
    assert.equal(map16[0], DEFAULT_START_MIDI);
    assert.equal(map16[15], DEFAULT_START_MIDI + 15);
    assert.equal(map8[7], DEFAULT_START_MIDI + 7);
  });

  it("normalizes bad maps back to defaults", () => {
    assert.deepEqual(normalizePadMap(null, "4x4"), defaultPadMap("4x4"));
    assert.deepEqual(normalizePadMap([1, 2], "2x4"), defaultPadMap("2x4"));
  });

  it("clamps midi values into 0–127", () => {
    const raw = Array(8).fill(0).map((_, i) => (i === 0 ? -5 : i === 1 ? 200 : 48 + i));
    const out = normalizePadMap(raw, "2x4");
    assert.equal(out[0], 0);
    assert.equal(out[1], 127);
  });
});

describe("getActivePads", () => {
  const chromatic16 = defaultPadMap("4x4");
  const chromatic8 = defaultPadMap("2x4");

  it("lights every C major tone but borders only the primary triad", () => {
    const { pads, primaryPads, missing, rootIndex } = getActivePads("C", [0, 4, 7], chromatic16);
    assert.deepEqual(pads, [0, 4, 7, 12]); // C3 E3 G3 C4
    assert.deepEqual(primaryPads, [0, 4, 7]); // pads 1, 5, 8
    assert.equal(missing.length, 0);
    assert.equal(rootIndex, 0);
  });

  it("resolves Dm7 with extras lit and primary voicing bordered", () => {
    const { pads, primaryPads, missing, rootIndex } = getActivePads("D", [0, 3, 7, 10], chromatic16);
    // All D/F/A/C pads, including the lower C on pad 1 and upper D
    assert.deepEqual(pads, [0, 2, 5, 9, 12, 14]);
    assert.deepEqual(primaryPads, [2, 5, 9, 12]);
    assert.equal(missing.length, 0);
    assert.equal(rootIndex, 2);
    assert.deepEqual(
      primaryPads.map((p) => midiToLabel(chromatic16[p])),
      ["D3", "F3", "A3", "C4"]
    );
  });

  it("fills C major across the 4×4 board through upper D", () => {
    const { pads, primaryPads } = getActivePads("C", [0, 2, 4, 5, 7, 9, 11], chromatic16, {
      fillBoard: true,
    });
    assert.deepEqual(
      pads.map((p) => midiToLabel(chromatic16[p])),
      ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4"]
    );
    assert.deepEqual(primaryPads, [0, 2, 4, 5, 7, 9, 11]);
  });

  it("fills C major on 2×4 with notes that fit", () => {
    const { pads, missing } = getActivePads("C", [0, 2, 4, 5, 7, 9, 11], chromatic8, {
      fillBoard: true,
    });
    assert.deepEqual(
      pads.map((p) => midiToLabel(chromatic8[p])),
      ["C3", "D3", "E3", "F3", "G3"]
    );
    assert.ok(missing.includes("A"));
    assert.ok(missing.includes("B"));
  });

  it("reports missing tones when the map cannot supply them", () => {
    const allC = Array(16).fill(48);
    const { pads, primaryPads, missing } = getActivePads("C", [0, 4, 7], allC);
    assert.equal(pads.length, 16);
    assert.deepEqual(primaryPads, [0]);
    assert.deepEqual(missing, ["E", "G"]);
  });

  it("uses a custom non-chromatic map", () => {
    const map = [48, 52, 55, 59, 48, 48, 48, 48];
    const { pads, primaryPads, missing } = getActivePads("C", [0, 4, 7, 11], map);
    assert.deepEqual(primaryPads, [0, 1, 2, 3]);
    assert.ok(pads.includes(4)); // extra C also lit
    assert.equal(missing.length, 0);
  });
});

describe("sortPadsByPitch", () => {
  it("orders by MIDI even if pad indices are scrambled", () => {
    const map = defaultPadMap("4x4");
    assert.deepEqual(sortPadsByPitch([12, 0, 7], map), [0, 7, 12]);
  });
});

describe("NOTES", () => {
  it("has twelve pitch classes", () => {
    assert.equal(NOTES.length, 12);
    assert.equal(NOTES[0], "C");
    assert.equal(NOTES[11], "B");
  });
});
