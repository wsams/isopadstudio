/**
 * Chromatic tuner helpers: YIN pitch detection + Hz → note/cents.
 * Works in the browser (global) and in Node (module.exports).
 *
 * YIN based on de Cheveigné & Kawahara (2002) / Aubio-style implementation.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.IsoPadTuner = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const A4_HZ = 440;
  const A4_MIDI = 69;

  /**
   * Detect fundamental frequency (Hz) with YIN.
   * @param {Float32Array|number[]} float32AudioBuffer
   * @param {number} sampleRate
   * @param {{ threshold?: number, probabilityThreshold?: number }} [opts]
   * @returns {number|null}
   */
  function detectPitchYin(float32AudioBuffer, sampleRate, opts = {}) {
    const threshold = opts.threshold ?? 0.15;
    const probabilityThreshold = opts.probabilityThreshold ?? 0.1;
    const sr = Number(sampleRate);
    if (!Number.isFinite(sr) || sr <= 0) return null;
    if (!float32AudioBuffer || float32AudioBuffer.length < 64) return null;

    // Largest power of two ≤ buffer length
    let bufferSize = 1;
    while (bufferSize * 2 <= float32AudioBuffer.length) bufferSize *= 2;
    const yinBufferLength = bufferSize / 2;
    if (yinBufferLength < 2) return null;

    const yinBuffer = new Float32Array(yinBufferLength);

    // Difference function
    for (let t = 1; t < yinBufferLength; t++) {
      let sum = 0;
      for (let i = 0; i < yinBufferLength; i++) {
        const delta = float32AudioBuffer[i] - float32AudioBuffer[i + t];
        sum += delta * delta;
      }
      yinBuffer[t] = sum;
    }

    // Cumulative mean normalized difference
    yinBuffer[0] = 1;
    let runningSum = 0;
    for (let t = 1; t < yinBufferLength; t++) {
      runningSum += yinBuffer[t];
      yinBuffer[t] = runningSum === 0 ? 1 : (yinBuffer[t] * t) / runningSum;
    }

    // Absolute threshold
    let tau = 2;
    while (tau < yinBufferLength) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau += 1;
        }
        break;
      }
      tau += 1;
    }
    if (tau === yinBufferLength || yinBuffer[tau] >= threshold) return null;

    const probability = 1 - yinBuffer[tau];
    if (probability < probabilityThreshold) return null;

    // Parabolic interpolation
    let betterTau;
    const x0 = tau < 1 ? tau : tau - 1;
    const x2 = tau + 1 < yinBufferLength ? tau + 1 : tau;
    if (x0 === tau) {
      betterTau = yinBuffer[tau] <= yinBuffer[x2] ? tau : x2;
    } else if (x2 === tau) {
      betterTau = yinBuffer[tau] <= yinBuffer[x0] ? tau : x0;
    } else {
      const s0 = yinBuffer[x0];
      const s1 = yinBuffer[tau];
      const s2 = yinBuffer[x2];
      const denom = 2 * (2 * s1 - s2 - s0);
      betterTau = denom === 0 ? tau : tau + (s2 - s0) / denom;
    }

    if (!Number.isFinite(betterTau) || betterTau <= 0) return null;
    const hz = sr / betterTau;
    // Practical instrument range (low bass ~40 Hz through high piccolo-ish)
    if (hz < 40 || hz > 2000) return null;
    return hz;
  }

  function hzToMidi(hz, a4 = A4_HZ) {
    return 69 + 12 * Math.log2(hz / a4);
  }

  /**
   * @returns {{ note: string, octave: number, cents: number, centsExact: number, midi: number, hz: number, label: string }|null}
   */
  function hzToNote(hz, a4 = A4_HZ) {
    if (!Number.isFinite(hz) || hz <= 0) return null;
    const midiFloat = hzToMidi(hz, a4);
    const midi = Math.round(midiFloat);
    if (midi < 0 || midi > 127) return null;
    const centsExact = (midiFloat - midi) * 100;
    const cents = Math.round(centsExact);
    const note = NOTES[((midi % 12) + 12) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return {
      note,
      octave,
      cents,
      centsExact,
      midi,
      hz,
      label: `${note}${octave}`,
    };
  }

  function nowMs() {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  }

  /**
   * Exponential smoother for Hz readings. Faster attack, slower decay (falling Hz),
   * and holds the last value through brief dropouts so the needle does not twitch.
   * Resets immediately when the jump is large (new note).
   *
   * @param {{ alpha?: number, alphaAttack?: number, alphaDecay?: number, jumpRatio?: number, holdMs?: number }} [opts]
   *   `alpha` sets both attack and decay (legacy). Prefer `alphaAttack` / `alphaDecay`.
   *   Lower alpha = muddier needle. `holdMs` keeps the last Hz when YIN misses a frame.
   */
  function createPitchSmoother(opts = {}) {
    const alphaAttack = opts.alphaAttack ?? opts.alpha ?? 0.12;
    const alphaDecay = opts.alphaDecay ?? opts.alpha ?? 0.04;
    const jumpRatio = opts.jumpRatio ?? 1.12; // ~2 semitones
    const holdMs = opts.holdMs ?? 400;
    let prev = null;
    let lastGoodAt = 0;
    return {
      push(hz, t = nowMs()) {
        if (!Number.isFinite(hz) || hz <= 0) {
          if (prev != null && t - lastGoodAt < holdMs) return prev;
          prev = null;
          return null;
        }
        lastGoodAt = t;
        if (prev == null) {
          prev = hz;
          return hz;
        }
        const ratio = hz > prev ? hz / prev : prev / hz;
        if (ratio > jumpRatio) {
          prev = hz;
          return hz;
        }
        const alpha = hz < prev ? alphaDecay : alphaAttack;
        prev = prev * (1 - alpha) + hz * alpha;
        return prev;
      },
      reset() {
        prev = null;
        lastGoodAt = 0;
      },
    };
  }

  /** RMS amplitude — skip detection when too quiet */
  function bufferRms(buf) {
    if (!buf || !buf.length) return 0;
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  }

  return {
    NOTES,
    A4_HZ,
    A4_MIDI,
    detectPitchYin,
    hzToMidi,
    hzToNote,
    createPitchSmoother,
    bufferRms,
  };
});
