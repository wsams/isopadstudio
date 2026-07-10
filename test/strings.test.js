const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const S = require("../lib/strings.js");

describe("instruments", () => {
  it("registers the planned string instruments", () => {
    const ids = S.listInstruments().map((i) => i.id);
    for (const id of [
      "guitar6",
      "bass4",
      "bass5",
      "uke4",
      "mandolin",
      "banjo5",
      "violin",
      "viola",
      "cello",
      "doublebass",
    ]) {
      assert.ok(ids.includes(id), `missing ${id}`);
    }
  });

  it("distinguishes pad layouts from string instruments", () => {
    assert.equal(S.isPadLayout("4x4"), true);
    assert.equal(S.isStringInstrument("guitar6"), true);
    assert.equal(S.isStringInstrument("4x4"), false);
  });
});

describe("resolveChordShape guitar", () => {
  it("returns open C major shape", () => {
    const shape = S.resolveChordShape("guitar6", "C", [0, 4, 7], 0);
    assert.deepEqual(shape.absoluteFrets, [null, 3, 2, 0, 1, 0]);
    assert.ok(shape.midis.length >= 3);
    assert.deepEqual(shape.missing, []);
  });

  it("returns open G and Em shapes", () => {
    const g = S.resolveChordShape("guitar6", "G", [0, 4, 7], 0);
    assert.deepEqual(g.absoluteFrets, [3, 2, 0, 0, 0, 3]);
    const em = S.resolveChordShape("guitar6", "E", [0, 3, 7], 0);
    assert.deepEqual(em.absoluteFrets, [0, 2, 2, 0, 0, 0]);
  });

  it("with capo 2, sounding D uses C shape frets relative to capo", () => {
    const d = S.resolveChordShape("guitar6", "D", [0, 4, 7], 2);
    // Sounding D at capo 2 → C shape
    assert.deepEqual(d.absoluteFrets, [null, 3, 2, 0, 1, 0]);
    const pcs = d.midis.map(S.midiPitchClass).sort((a, b) => a - b);
    assert.ok(pcs.includes(S.noteToPc("D")));
    assert.ok(pcs.includes(S.noteToPc("F#")));
    assert.ok(pcs.includes(S.noteToPc("A")));
  });
});

describe("resolveChordShape other instruments", () => {
  it("finds a bass voicing covering chord tones", () => {
    const shape = S.resolveChordShape("bass4", "C", [0, 4, 7], 0);
    assert.ok(shape.midis.length >= 2);
    const pcs = new Set(shape.midis.map(S.midiPitchClass));
    assert.ok(pcs.has(S.noteToPc("C")));
  });

  it("finds a ukulele C major-ish voicing", () => {
    const shape = S.resolveChordShape("uke4", "C", [0, 4, 7], 0);
    assert.ok(shape.midis.length >= 3);
    assert.deepEqual(shape.missing, []);
  });
});

describe("resolveScaleDiagram", () => {
  it("places C major scale dots on guitar", () => {
    const diag = S.resolveScaleDiagram("guitar6", "C", [0, 2, 4, 5, 7, 9, 11], 0);
    assert.equal(diag.fretsShown, 4);
    assert.ok(diag.dots.length >= 7);
    assert.ok(diag.dots.some((d) => d.isRoot));
    // Open + frets 1–4 only (same frame as chords)
    assert.ok(diag.dots.every((d) => d.fret >= 0 && d.fret <= 4));
  });

  it("scale capo shifts sounding pitches", () => {
    const open = S.resolveScaleDiagram("guitar6", "C", [0, 2, 4, 5, 7, 9, 11], 0);
    const capo2 = S.resolveScaleDiagram("guitar6", "C", [0, 2, 4, 5, 7, 9, 11], 2);
    assert.notEqual(open.midis[0], capo2.midis[0]);
  });
});

describe("capo helpers", () => {
  it("clamps capo to 0–12", () => {
    assert.equal(S.clampCapo(-1), 0);
    assert.equal(S.clampCapo(99), 12);
    assert.equal(S.clampCapo(3.7), 4);
  });
});
