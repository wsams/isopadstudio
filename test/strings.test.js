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
      "pipa",
      "erhu",
      "zhongruan",
      "guzheng",
      "shamisen",
      "koto",
      "oud",
      "baglama",
      "setar",
      "tar",
    ]) {
      assert.ok(ids.includes(id), `missing ${id}`);
    }
  });

  it("uses full labels without short abbreviations", () => {
    const labels = S.listInstruments().map((i) => i.label);
    assert.ok(labels.includes("Ukulele"));
    assert.ok(labels.includes("Double bass"));
    assert.ok(labels.includes("Bağlama"));
    assert.ok(!labels.includes("Uke"));
    assert.ok(!labels.includes("D. bass"));
  });

  it("distinguishes pad layouts from string instruments", () => {
    assert.equal(S.isPadLayout("4x4"), true);
    assert.equal(S.isPadLayout("2x6"), true);
    assert.equal(S.isPadLayout("2x8"), true);
    assert.equal(S.isStringInstrument("guitar6"), true);
    assert.equal(S.isStringInstrument("guzheng"), true);
    assert.equal(S.isStringInstrument("4x4"), false);
    assert.equal(S.isPadLayout("guitar6"), false);
  });
});

describe("open-string zither voicing", () => {
  it("lights guzheng open strings that match a D major triad", () => {
    const shape = S.resolveChordShape("guzheng", "D", [0, 4, 7], 0);
    assert.ok(shape.midis.length >= 3);
    assert.deepEqual(shape.missing, []);
    assert.ok(shape.absoluteFrets.every((f) => f === 0 || f == null));
  });
});

describe("dual 2×4 pad index map", () => {
  it("maps visual cells like nanoPAD2 (upper 4×4 rows on the right)", () => {
    // Same mapping as LAYOUTS["2x8"].padAt in app.js
    function padAt(row, col) {
      if (col < 4) return row * 4 + col;
      return 8 + row * 4 + (col - 4);
    }
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 7].map((c) => padAt(0, c)),
      [0, 1, 2, 3, 8, 9, 10, 11]
    );
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5, 6, 7].map((c) => padAt(1, c)),
      [4, 5, 6, 7, 12, 13, 14, 15]
    );
  });
});

describe("resolveChordShape guitar", () => {
  it("returns open C major shape", () => {
    const shape = S.resolveChordShape("guitar6", "C", [0, 4, 7], 0);
    assert.deepEqual(shape.absoluteFrets, [null, 3, 2, 0, 1, 0]);
    assert.deepEqual(shape.fingers, [null, 3, 2, null, 1, null]);
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

describe("guitar tunings", () => {
  it("uses uppercase E for both outer strings in standard names", () => {
    const names = S.INSTRUMENTS.guitar6.stringNames;
    assert.deepEqual(names, ["E", "A", "D", "G", "B", "E"]);
  });

  it("includes Drop D and summarizes tunings", () => {
    const drop = S.applyPreset("guitar6", "dropD");
    assert.equal(S.tuningSummary(drop), "DADGBE");
    assert.equal(S.matchPresetId("guitar6", drop), "dropD");
    assert.equal(S.isStandardTuning("guitar6", drop), false);
    assert.equal(S.isStandardTuning("guitar6", S.defaultTuning("guitar6")), true);
  });

  it("coerces a reversed standard tuning back to EADGBE", () => {
    const reversed = S.defaultTuning("guitar6").slice().reverse();
    assert.equal(S.tuningSummary(reversed), "EBGDAE");
    const fixed = S.coerceTuningOrder(reversed, "guitar6");
    assert.equal(S.tuningSummary(fixed), "EADGBE");
    assert.equal(S.isStandardTuning("guitar6", fixed), true);
  });
});

describe("capo helpers", () => {
  it("clamps capo to 0–12", () => {
    assert.equal(S.clampCapo(-1), 0);
    assert.equal(S.clampCapo(99), 12);
    assert.equal(S.clampCapo(3.7), 4);
  });
});
