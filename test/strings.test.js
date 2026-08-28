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

describe("upright bass / Simandl", () => {
  it("marks double bass as an upright chart and leaves electric bass horizontal", () => {
    assert.equal(S.isUprightChart("doublebass"), true);
    assert.equal(S.isUprightChart("bass4"), false);
    assert.equal(S.isUprightChart("cello"), false);
    assert.equal(S.getInstrument("doublebass").chart, "upright");
    assert.equal(S.getInstrument("doublebass").neckFrets, 19);
  });

  it("registers Simandl as a pluggable method (Rabbath can share the same shape)", () => {
    const methods = S.listBassMethods("doublebass");
    assert.equal(methods.length, 1);
    assert.equal(methods[0].id, "simandl");
    assert.equal(S.defaultBassMethodId("doublebass"), "simandl");
    const simandl = S.getBassMethod("simandl");
    assert.equal(simandl.fingering, "1-2-4");
    assert.equal(simandl.positions.length, 12);
    simandl.positions.forEach((pos) => {
      assert.equal(pos.fingers[2], pos.fingers[1] + 1);
      assert.equal(pos.fingers[4], pos.fingers[1] + 2);
    });
  });

  it("places Simandl I 1st finger a whole step above the open string", () => {
    const I = S.getBassMethod("simandl").positions.find((p) => p.id === "I");
    assert.equal(I.fingers[1], 2);
    assert.equal(I.fingers[2], 3);
    assert.equal(I.fingers[4], 4);
    const half = S.getBassMethod("simandl").positions.find((p) => p.id === "half");
    assert.equal(half.fingers[1], 1);
    const vii = S.getBassMethod("simandl").positions.find((p) => p.id === "VII");
    assert.equal(vii.fingers[1], 12);
  });

  it("uses shrinking 12-TET fret spacing toward the bridge", () => {
    const nutTo12 = S.fretDistanceFromNut(12);
    assert.ok(Math.abs(nutTo12 - 0.5) < 1e-10);
    assert.ok(S.fretCellRatio(1) > S.fretCellRatio(7));
    assert.ok(S.fretCellRatio(7) > S.fretCellRatio(12));
    const ratios = S.fretCellRatios(1, 12);
    assert.equal(ratios.length, 12);
    for (let i = 1; i < ratios.length; i++) {
      assert.ok(ratios[i] < ratios[i - 1], `fret ${i + 1} should be shorter than fret ${i}`);
    }
  });

  it("crops the neck to enabled Simandl positions", () => {
    const method = S.getBassMethod("simandl");
    const firsts = S.neckRangeForPositions(method, ["half", "I"], 14);
    assert.equal(firsts.startFret, 0);
    assert.equal(firsts.endFret, 4);
    const seventh = S.neckRangeForPositions(method, ["VII"], 14);
    assert.equal(seventh.startFret, 11);
    assert.equal(seventh.endFret, 14);
    const empty = S.neckRangeForPositions(method, [], 19);
    assert.equal(empty.startFret, 0);
    assert.equal(empty.endFret, 19);
  });

  it("defaults to a full-neck view so one position still shows the whole board", () => {
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
    });
    assert.equal(diag.view, "full");
    assert.equal(diag.startFret, 0);
    assert.equal(diag.endFret, 19);
    const inI = diag.dots.filter((d) => d.inPosition && d.fret > 0);
    const outside = diag.dots.filter((d) => !d.inPosition && d.fret > 0);
    assert.ok(inI.length >= 1);
    assert.ok(outside.length >= 1);
    assert.ok(inI.every((d) => d.fret >= 2 && d.fret <= 4));
  });

  it("focus view crops to the enabled Simandl positions", () => {
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
      view: "focus",
    });
    assert.equal(diag.view, "focus");
    assert.equal(diag.startFret, 0);
    assert.equal(diag.endFret, 4);
  });

  it("splits Simandl into neck (½–VII) and thumb (octave and above)", () => {
    const regions = S.methodRegions(S.getBassMethod("simandl"), 19);
    assert.deepEqual(
      regions.map((r) => r.id),
      ["neck", "thumb"]
    );
    assert.equal(regions[0].endFret, 12);
    assert.equal(regions[1].startFret, 12);
    const onlyI = { startFret: 0, endFret: 4 };
    assert.ok(S.clipFretRange(regions[0], onlyI));
    assert.equal(S.clipFretRange(regions[1], onlyI), null);
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
    });
    assert.deepEqual(
      diag.regions.map((r) => r.id),
      ["neck", "thumb"]
    );
  });

  it("defaults unknown view to full and unknown board layout to split", () => {
    assert.equal(S.normalizeBassView(), "full");
    assert.equal(S.normalizeBassView("focus"), "focus");
    assert.equal(S.normalizeBassView("nope"), "full");
    assert.equal(S.normalizeBassBoardLayout(), "split");
    assert.equal(S.normalizeBassBoardLayout("one"), "one");
    assert.equal(S.normalizeBassBoardLayout("nope"), "split");
  });

  it("maps C major chord tones in Simandl I with 1–2–4 fingering", () => {
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
    });
    assert.equal(diag.chart, "upright");
    assert.equal(diag.methodId, "simandl");
    assert.deepEqual(diag.missing, []);
    // A string (index 1): I position 2nd finger = C
    const cOnA = diag.dots.find((d) => d.string === 1 && d.fret === 3);
    assert.ok(cOnA);
    assert.equal(cOnA.isRoot, true);
    assert.equal(cOnA.finger, 2);
    assert.equal(cOnA.inPosition, true);
    assert.equal(cOnA.note, "C");
    // D string (index 2): I 1st finger = E
    const eOnD = diag.dots.find((d) => d.string === 2 && d.fret === 2);
    assert.ok(eOnD);
    assert.equal(eOnD.finger, 1);
    // G string open G (chord fifth)
    const openG = diag.dots.find((d) => d.string === 3 && d.fret === 0);
    assert.ok(openG);
    assert.equal(openG.inPosition, true);
    // III-position C on the G string is outside I
    const cOnG = diag.dots.find((d) => d.string === 3 && d.fret === 5);
    assert.ok(!cOnG || !cOnG.inPosition);
    const pcs = new Set(diag.midis.map(S.midiPitchClass));
    assert.ok(pcs.has(S.noteToPc("C")));
    assert.ok(pcs.has(S.noteToPc("E")));
    assert.ok(pcs.has(S.noteToPc("G")));
    assert.equal(diag.midis.length, pcs.size);
  });

  it("keeps scale tones on the upright neck so progressions can overlay a scale", () => {
    const diag = S.resolveUprightDiagram(
      "doublebass",
      "G",
      [0, 2, 4, 5, 7, 9, 11],
      0,
      null,
      { methodId: "simandl", activePositions: ["half", "I", "II", "III"], isScale: true }
    );
    assert.ok(diag.dots.length >= 8);
    assert.ok(diag.dots.some((d) => d.isRoot && d.inPosition));
    assert.ok(diag.pcNames.includes("G"));
    assert.ok(diag.pcNames.includes("D"));
    assert.equal(diag.isScale, true);
    // Isolated I vs full low positions — fewer emphasized notes when one position is on
    const onlyI = S.resolveUprightDiagram("doublebass", "G", [0, 2, 4, 5, 7, 9, 11], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
    });
    const inI = onlyI.dots.filter((d) => d.inPosition && d.fret > 0).length;
    const inLow = diag.dots.filter((d) => d.inPosition && d.fret > 0).length;
    assert.ok(inI < inLow);
  });

  it("omits disabled strings from the upright chart", () => {
    const disabled = [true, false, false, false];
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: ["I"],
      disabledStrings: disabled,
    });
    assert.ok(diag.dots.every((d) => d.string !== 0));
    assert.deepEqual(diag.disabledStrings, disabled);
  });

  it("allows turning every Simandl position off (full neck, no finger numbers)", () => {
    const diag = S.resolveUprightDiagram("doublebass", "C", [0, 4, 7], 0, null, {
      methodId: "simandl",
      activePositions: [],
    });
    assert.equal(diag.startFret, 0);
    assert.equal(diag.endFret, 19);
    assert.ok(diag.dots.every((d) => d.finger == null));
    assert.ok(diag.positions.every((p) => p.enabled === false));
  });

  it("includes orchestra and solo tunings", () => {
    assert.equal(S.tuningSummary(S.defaultTuning("doublebass")), "EADG");
    const solo = S.applyPreset("doublebass", "solo");
    assert.equal(S.tuningSummary(solo), "F#BEA");
    assert.equal(S.matchPresetId("doublebass", solo), "solo");
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
    assert.ok(diag.dots.every((d) => typeof d.note === "string" && d.note.length > 0));
    const roots = diag.dots.filter((d) => d.isRoot);
    assert.ok(roots.length >= 1);
    assert.ok(roots.every((d) => d.note === "C"));
    const eDots = diag.dots.filter((d) => d.note === "E");
    assert.ok(eDots.length >= 1);
    assert.ok(eDots.every((d) => !d.isRoot));
  });

  it("labels violin Mixolydian dots with pitch-class names", () => {
    const diag = S.resolveScaleDiagram("violin", "G", [0, 2, 4, 5, 7, 9, 10], 0);
    assert.ok(diag.dots.every((d) => d.note));
    assert.ok(diag.dots.some((d) => d.isRoot && d.note === "G"));
    assert.ok(diag.dots.some((d) => d.note === "F" && !d.isRoot));
  });

  it("labels F# blues roots with the sharp name", () => {
    const diag = S.resolveScaleDiagram("guitar6", "F#", [0, 3, 5, 6, 7, 10], 0);
    assert.ok(diag.dots.some((d) => d.isRoot && d.note === "F#"));
    assert.ok(diag.dots.some((d) => d.note === "A" && !d.isRoot));
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

describe("disabled strings / treble sets", () => {
  it("normalizes boolean masks and index lists", () => {
    assert.deepEqual(S.normalizeDisabledStrings([true, false, true], 3), [true, false, true]);
    assert.deepEqual(S.normalizeDisabledStrings([0, 2], 4), [true, false, true, false]);
    assert.deepEqual(S.normalizeDisabledStrings(null, 2), [false, false]);
  });

  it("matches guitar treble presets", () => {
    assert.equal(S.matchStringSetId("guitar6", S.applyStringSet("guitar6", "treble3")), "treble3");
    assert.equal(S.matchStringSetId("guitar6", S.applyStringSet("guitar6", "treble4")), "treble4");
    assert.equal(S.matchStringSetId("guitar6", S.applyStringSet("guitar6", "all")), "all");
  });

  it("voices C major on treble 3 (G·B·E only)", () => {
    const disabled = S.applyStringSet("guitar6", "treble3");
    const shape = S.resolveChordShape("guitar6", "C", [0, 4, 7], 0, null, { disabledStrings: disabled });
    assert.deepEqual(shape.absoluteFrets.slice(0, 3), [null, null, null]);
    assert.ok(shape.absoluteFrets.slice(3).every((f) => f != null));
    assert.deepEqual(shape.missing, []);
    assert.deepEqual(shape.disabledStrings, disabled);
  });

  it("voices G major triad on treble 3 without using bass strings", () => {
    const disabled = S.applyStringSet("guitar6", "treble3");
    const shape = S.resolveChordShape("guitar6", "G", [0, 4, 7], 0, null, { disabledStrings: disabled });
    assert.ok(shape.absoluteFrets[0] == null && shape.absoluteFrets[1] == null && shape.absoluteFrets[2] == null);
    const pcs = new Set(shape.midis.map(S.midiPitchClass));
    assert.ok(pcs.has(S.noteToPc("G")));
    assert.ok(pcs.has(S.noteToPc("B")));
    assert.ok(pcs.has(S.noteToPc("D")));
    assert.deepEqual(shape.missing, []);
  });

  it("covers C7 on treble 4 (D·G·B·E)", () => {
    const disabled = S.applyStringSet("guitar6", "treble4");
    const shape = S.resolveChordShape("guitar6", "C", [0, 4, 7, 10], 0, null, { disabledStrings: disabled });
    assert.equal(shape.absoluteFrets[0], null);
    assert.equal(shape.absoluteFrets[1], null);
    assert.deepEqual(shape.missing, []);
    const pcs = new Set(shape.midis.map(S.midiPitchClass));
    assert.ok(pcs.has(S.noteToPc("C")));
    assert.ok(pcs.has(S.noteToPc("E")));
    assert.ok(pcs.has(S.noteToPc("G")));
    assert.ok(pcs.has(S.noteToPc("A#")));
  });

  it("omits disabled strings from scale diagrams", () => {
    const disabled = S.applyStringSet("guitar6", "treble3");
    const diag = S.resolveScaleDiagram("guitar6", "C", [0, 2, 4, 5, 7, 9, 11], 0, null, {
      disabledStrings: disabled,
    });
    assert.ok(diag.dots.every((d) => d.string >= 3));
    assert.ok(diag.dots.length >= 3);
  });

  it("still returns curated full-neck shapes when no strings are disabled", () => {
    const shape = S.resolveChordShape("guitar6", "C", [0, 4, 7], 0, null, {
      disabledStrings: [false, false, false, false, false, false],
    });
    assert.deepEqual(shape.absoluteFrets, [null, 3, 2, 0, 1, 0]);
  });
});

describe("capo helpers", () => {
  it("clamps capo to 0–12", () => {
    assert.equal(S.clampCapo(-1), 0);
    assert.equal(S.clampCapo(99), 12);
    assert.equal(S.clampCapo(3.7), 4);
  });
});
