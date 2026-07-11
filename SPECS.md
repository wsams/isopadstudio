# IsoPad Studio — project specifications

**Audience:** future coding agents and human contributors.

**Mandatory for agents**

1. **Read this file** before changing product behavior, architecture, UI chrome, persistence, music math, or docs.
2. **Update this file in the same change** whenever you alter behavior, data shapes, instruments, storage keys, UI contracts, or invariants described here.
3. Prefer editing this living spec over inventing parallel docs. Keep [README.md](README.md) short; keep [MANUAL.md](MANUAL.md) user-facing; keep **SPECS.md** as the agent/architecture source of truth.
4. Do **not** modify sibling GarageBand / Logic / other music projects under the parent folder unless the user explicitly asks. This repo is **`isopadstudio/` only**.

---

## What the product is

**IsoPad Studio** is a static, dependency-free browser app for looking up **chords, scales/modes, and progressions**, then seeing **which pads or frets to play**.

- **Live app:** https://wsams.github.io/isopadstudio/index.html  
- **Source:** https://github.com/wsams/isopadstudio  
- **License:** MIT  
- **No build step** to run the app. Serve the folder over HTTP (`python3 -m http.server 8000`). Do not rely on `file://` (audio / storage often break).

Two instrument families:

| Family | UI | Typical gear |
|---|---|---|
| **Pads** | Chromatic pad grid charts | Akai MPD218 / LPD8, Korg nanoPAD, MPC-style |
| **Strings** | Fretboard / fingerboard charts | Guitar, bass, uke, mando, banjo, violin family |

Core idea: **isomorphic shapes** — learn a shape, move it to another key. Charts are clickable (Web Audio), savable into songs, and printable.

---

## Repository layout

```
isopadstudio/
├── index.html          # Shell, panels, header instrument switch
├── app.css             # All styles (dark theme, fretboard, print)
├── app.js              # App state, UI, playback, persistence (IIFE)
├── lib/
│   ├── music.js        # Pad maps, MIDI helpers, getActivePads (browser + Node)
│   └── strings.js      # String instruments, tunings, capo, chord/scale diagrams
├── progressions.js     # Stock progressions (window.ISOPAD_PROGRESSIONS)
├── screenshots/        # MANUAL.md gallery (+ one hero in README)
├── test/               # node:test suites
├── README.md           # Overview + run instructions
├── MANUAL.md           # User walkthroughs + screenshots
├── SPECS.md            # THIS FILE — agent/architecture contract
├── CONTRIBUTING.md
├── CHANGELOG.md        # semantic-release
├── package.json        # tests + semantic-release only
├── .releaserc.json
└── .github/workflows/pages.yml   # Deploy whole repo root to GitHub Pages
```

**Script load order** (required): `lib/music.js` → `lib/strings.js` → `progressions.js` → `app.js`.

Globals: `IsoPadMusic`, `IsoPadStrings`, `ISOPAD_PROGRESSIONS` (with legacy aliases for older progression globals).

---

## Architecture

### Style

- Vanilla JS IIFE in `app.js` — no React/Vue/bundler.
- Shared math in `lib/*` works in browser and Node (`module.exports` / `globalThis`).
- Prefer small, focused edits. Avoid drive-by refactors and new heavy dependencies unless discussed.

### Runtime state (`app.js`)

Important fields:

- `instrument` — pad layout id (`4x4` \| `2x4`) **or** string instrument id (`guitar6`, …)
- `lastPadInstrument` / `lastStringInstrument` — restore when toggling Pads ↔ Strings
- `padMaps` — `{ "4x4": number[], "2x4": number[] }` MIDI per pad
- `tunings` — `{ [instrumentId]: number[] }` open MIDI low→high
- Library: `kind` (`chord`\|`scale`), `category`, `formula`, `root`, `color`, `showAllRoots`
- Songs: `songs[]`, `activeSongId`
- Progressions UI: `progKey`, `progGenre`, `progSearch`

### Mode detection

- `isStringMode()` ↔ `IsoPadStrings.isStringInstrument(state.instrument)`
- Pad layouts live in `LAYOUTS` inside `app.js`; string instruments live in `lib/strings.js` `INSTRUMENTS`.

### Rendering pipeline

1. User picks root / formula / instrument.
2. **Pads:** `getActivePads(root, intervals, padMap, { fillBoard })` → pad indices → `buildGrid` / `makeCard`.
3. **Strings:** `resolveStringChart` → `resolveChordShape` or `resolveScaleDiagram` (with capo + live tuning) → `buildFretboard` / `makeCard`.
4. Playback: `playPads` / `playMidis` via Web Audio oscillators.

Songs re-resolve bars when layout/instrument/tuning/capo/pad map changes (`reresolveSongsForLayout`).

---

## UI structure

### Header (must stay stable)

**Row 1 (static height — do not nest growing option lists here):**

- Brand + `brand-mark` (shows `16` / `8` for pads, or string count for strings)
- Compact **Pads | Strings** family toggle (`#instrument-switch`)
- Main tabs: Library · Progressions · Song Builder · Pads/Tuning · Pad Player/Strings

**Row 2 (options tray — content swaps; reserved min-height so the page does not jump):**

- Pads: layout chips **4×4** / **2×4**
- Strings: instrument chips (Guitar, Bass 4, …)

Switching family restores `lastPadInstrument` / `lastStringInstrument`.

### Tabs / panels

| Tab id | Pads label | Strings label | Role |
|---|---|---|---|
| `library` | Library | Library | Chord/scale browser + preview |
| `progressions` | Progressions | Progressions | Stock loops by genre/key |
| `song` | Song Builder | Song Builder | Sections, tempo, capo, overlay, print |
| `pads` | Pads | Tuning | Pad MIDI map **or** open-string tuning |
| `play` | Pad Player | Strings | Live grid **or** open-string pluck + Library ref |

### Library UX rules

- **Capo inputs:** strings only (Library + Song). Hidden on pads. CSS must honor `[hidden]` on `.field` (`display: none !important`) because `.field { display: flex }` otherwise overrides HTML `hidden`.
- **Tempo (Library):** shown only for **scales**, not single chords. Song Builder / progressions keep tempo.
- **Pad Player tip:** Library selection stays highlighted on Pad Player so users can tap individual tones.
- Chords play as a voicing (simultaneous); scales play **sequential**, one note per beat at current tempo.

### Song Builder

- Songs are lists of **sections** (verse/chorus/…); each section has **bars** (chord/scale entries).
- Drag/reorder sections; duplicate; tempo; looping preview until stop.
- **chordCapo** and **scaleCapo** are separate (strings).
- Optional **scale overlay** for lead practice above the song.
- Print stylesheet hides chrome and shows the song panel.

---

## Pads family

### Layouts

| Id | Grid | Pads | Brand mark |
|---|---|---|---|
| `4x4` | 4×4 | 16 | `16` |
| `2x4` | 2×4 | 8 | `8` |

Grid rendering draws **bottom row first visually** (pad 1 bottom-left) to match typical controller orientation.

### Pad maps

- Default: chromatic from **C3** (MIDI 48) on Pad 1.
- Piano **middle C = C4** (MIDI 60); UI tags middle C when present.
- Maps stored **per layout** in `localStorage`.
- Reset presets: chromatic from C3 / C2 / C4.
- Changing the map updates Library, progressions, songs, and player.

### Chord vs scale lighting

- **Chord:** all chord-tone pads lit; **primary voicing** gets bright border (first instance of each tone).
- **Scale:** `fillBoard: true` — every in-scale pad on the map lights.

---

## Strings family

### Instruments (`lib/strings.js`)

| Id | Short | Style | Notes |
|---|---|---|---|
| `guitar6` | Guitar | fretted | Presets: Standard, Drop D, DADGAD, Open G |
| `bass4` | Bass 4 | fretted | |
| `bass5` | Bass 5 | fretted | |
| `uke4` | Uke | fretted | Re-entrant GCEA — do not “fix” order like guitar |
| `mandolin` | Mando | fretted | |
| `banjo5` | Banjo | fretted | |
| `violin` | Violin | fingerboard | |
| `viola` | Viola | fingerboard | |
| `cello` | Cello | fingerboard | |
| `doublebass` | D. bass | fingerboard | |

### Tuning model

- Open MIDI arrays are always stored **low → high** (guitar Standard = E2 A2 D3 G3 B3 E4 → summary `EADGBE`).
- Tuning tab UI: low → high **left → right**; presets, ±1 semitone, note/octave selects.
- `coerceTuningOrder` repairs reversed saved tunings (e.g. `EBGDAE` → `EADGBE`) except re-entrant uke.
- Charts must use **live** `getTuning()`, not a stale `diagram.openMidi` for labels.

### Fretboard chart orientation (critical UX)

- **Display:** **high string at top**, low string at bottom (standard published chord charts).
- For guitar Standard, labels top→bottom read like `E B G D A E`, while the tuning name **EADGBE** is still low→high and reads **bottom → top** on screen.
- Do not “fix” this by reversing stored tunings; reverse **render order** only (`for (s = stringCount - 1; s >= 0; s--)`).

### Chord / scale resolution

- Guitar **standard tuning** uses curated open/barre shapes when available; otherwise (and for other tunings/instruments) `searchVoicing`.
- Chord dots may show **finger numbers** (1–4); open = ○, muted = × (muted rows slightly dimmed).
- Scales: box of open + ~4 frets; open scale tones as ○ at the nut.
- Capo: frets relative to capo; sounding pitch = open + capo + fret.

### Capo

- Song-level **`chordCapo`** and **`scaleCapo`** (0–12).
- Library capo field syncs to the active song’s chord or scale capo depending on Library kind.
- Capo UI is **strings-only**.

---

## Progressions

- Data: `progressions.js` → `window.ISOPAD_PROGRESSIONS`.
- Each entry: id, name, aka, genre, numerals, chords as `{ o: scaleDegreeOffset, q: chordQualityKey }`.
- Qualities must exist as keys in `CHORDS` inside `app.js`.
- Preview loops at current tempo; Add to Song / Replace song create sections.

---

## Song data model

```ts
Song = {
  id: string,
  name: string,
  tempo: number,          // default 100; clamp ~40–240
  chordCapo: number,      // 0–12
  scaleCapo: number,      // 0–12
  sections: Section[],
  overlay?: { root, formula, enabled }
}

Section = {
  id, name, role, genre, sourceKey?,
  bars: Bar[]
}

Bar = {
  title, color, root, formula, kind, // kind: chord|scale
  isScale?: boolean,                 // legacy
  // pads mode:
  pads?, primaryPads?, rootIndex?,
  // strings mode:
  diagram?, midis?
}
```

Legacy: songs with top-level `bars` migrate into a single section on load (`normalizeSong`). Storage key is **v2**.

---

## Persistence (`localStorage`)

| Key | Purpose |
|---|---|
| `isopadstudio.songs.v2` | Songs array |
| `isopadstudio.activeSongId` | Active song |
| `isopadstudio.instrument` | Current instrument / layout id |
| `isopadstudio.layout` | Last pad layout (also written when on pads) |
| `isopadstudio.lastPad` | Last pad layout for family toggle |
| `isopadstudio.lastString` | Last string instrument for family toggle |
| `isopadstudio.padMaps.v1` | `{ "4x4", "2x4" }` MIDI maps |
| `isopadstudio.tunings.v1` | Open tunings per string instrument |

Legacy read fallbacks exist for older ChromaPad / mpc16chords keys (songs, active, layout, padMaps). Prefer writing only current keys.

---

## Audio / tempo

- Web Audio `OscillatorNode` + gain envelope; optional lowpass.
- Default tempo **100 BPM**.
- Library tempo control: **scales only**; Song Builder tempo for songs/progressions.
- Scale playback: **one note per beat**.
- Progression/song chord bars: roughly **two beats per bar** at current tempo; loops until stop.
- `library-tempo` and `song-tempo` stay synced via `syncTempoInputs` / `setTempo`.

---

## CSS / theming notes

- Dark UI; accent coral/red (`--accent`); avoid introducing generic “AI slop” purple/cream themes on branded surfaces.
- `.field[hidden] { display: none !important; }` — required for capo/tempo field hiding.
- Print: hide header controls, library, etc.; show song panel.

---

## Testing & release

- `npm test` → `node --test test/**/*.test.js` (`music`, `strings`, `repo`, progressions quality checks).
- semantic-release on `main` updates `CHANGELOG.md` + `package.json` version.
- GitHub Pages workflow deploys repository root on push to `main`.

When changing music math or string resolution, **add/adjust tests** in `test/`.

---

## Documentation roles

| File | Role |
|---|---|
| **SPECS.md** | Architecture + product contracts for agents (update with code) |
| **README.md** | Short overview, run instructions, one hero screenshot |
| **MANUAL.md** | End-user walkthroughs + screenshot gallery |
| **CONTRIBUTING.md** | PR / progression contribution guide |

New screenshots: prefer `screenshots/NN-kebab-name.png`, document them in [MANUAL.md](MANUAL.md) (section + index table), and keep a single hero shot linked from [README.md](README.md). When replacing the gallery, remove obsolete files from `screenshots/` so links do not go stale.

---

## Invariants checklist (do not break casually)

1. Static app — no required bundler for runtime.
2. Pads vs strings are separate renderers (grid vs fretboard), not a fake “pads as strings” hack.
3. Tuning storage = low→high; chart display = high-at-top.
4. Capo UI only in string mode; tempo in Library only for scales.
5. Header row 1 stays fixed; options live in the tray under it (no layout jump).
6. Pad maps and tunings persist per layout / instrument.
7. Family toggle remembers last pad layout and last string instrument.
8. Library selection feeds Pad Player / Strings reference panel.
9. Update **SPECS.md** when any of the above changes.

---

## Historical names

Earlier iterations / forks in the wider workspace included names like **MPC16 Chords** and **ChromaPad**. Current product name is **IsoPad Studio**; storage keys and globals use the `isopadstudio` / `IsoPad*` prefix, with legacy key reads for migration.

---

## When unsure

1. Re-read the relevant section of this file.
2. Check `lib/music.js` / `lib/strings.js` tests.
3. Prefer matching existing patterns in `app.js` over new abstractions.
4. Ask the user only when product intent is ambiguous — then record the decision here.
