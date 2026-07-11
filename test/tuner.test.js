const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const T = require("../lib/tuner.js");

describe("hzToNote", () => {
  it("maps A4 = 440 Hz to A4 with 0 cents", () => {
    const n = T.hzToNote(440);
    assert.equal(n.note, "A");
    assert.equal(n.octave, 4);
    assert.equal(n.midi, 69);
    assert.equal(n.cents, 0);
    assert.equal(n.label, "A4");
  });

  it("maps middle C near 261.63 Hz", () => {
    const n = T.hzToNote(261.625565);
    assert.equal(n.note, "C");
    assert.equal(n.octave, 4);
    assert.equal(n.midi, 60);
    assert.ok(Math.abs(n.cents) <= 1);
  });

  it("reports flat/sharp cents", () => {
    // A4 + 10 cents ≈ 440 * 2^(10/1200)
    const sharp = T.hzToNote(440 * Math.pow(2, 10 / 1200));
    assert.equal(sharp.note, "A");
    assert.ok(sharp.cents >= 9 && sharp.cents <= 11);

    const flat = T.hzToNote(440 * Math.pow(2, -15 / 1200));
    assert.equal(flat.note, "A");
    assert.ok(flat.cents <= -14 && flat.cents >= -16);
  });

  it("returns null for invalid Hz", () => {
    assert.equal(T.hzToNote(0), null);
    assert.equal(T.hzToNote(-1), null);
    assert.equal(T.hzToNote(NaN), null);
  });
});

describe("detectPitchYin", () => {
  function sineBuffer(hz, sampleRate, seconds = 0.1) {
    const n = Math.floor(sampleRate * seconds);
    const buf = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      buf[i] = Math.sin((2 * Math.PI * hz * i) / sampleRate);
    }
    return buf;
  }

  it("detects a 440 Hz sine near A4", () => {
    const sr = 44100;
    const hz = T.detectPitchYin(sineBuffer(440, sr, 0.12), sr);
    assert.ok(hz != null);
    assert.ok(Math.abs(hz - 440) < 2, `got ${hz}`);
  });

  it("detects guitar low E (~82.4 Hz)", () => {
    const sr = 48000;
    const target = 82.41;
    const hz = T.detectPitchYin(sineBuffer(target, sr, 0.2), sr);
    assert.ok(hz != null);
    assert.ok(Math.abs(hz - target) < 1.5, `got ${hz}`);
  });

  it("returns null for silence", () => {
    const buf = new Float32Array(2048);
    assert.equal(T.detectPitchYin(buf, 44100), null);
  });
});

describe("createPitchSmoother", () => {
  it("smooths consecutive readings and resets on large jumps", () => {
    const s = T.createPitchSmoother({ alpha: 0.5, jumpRatio: 1.12 });
    assert.equal(s.push(440), 440);
    const mid = s.push(442);
    assert.ok(mid > 440 && mid < 442);
    const jumped = s.push(220);
    assert.equal(jumped, 220);
  });
});
