# IsoPad Studio manual

Step-by-step guide with current screenshots. For a short overview, see [README.md](README.md). For architecture and agent contracts, see [SPECS.md](SPECS.md).

**Open the app:** [https://wsams.github.io/isopadstudio/index.html](https://wsams.github.io/isopadstudio/index.html) — nothing to install.

Header layout (same on every tab):

1. **Pads | Strings** — family toggle (stays put)
2. Main tabs — Library, Progressions, Song Builder, then Pads/Tuning and Pad Player/Strings
3. **Tuner** — chromatic microphone tuner (popup)
4. **Options tray** — layout chips (4×4 / 2×4 / 2×6 / 2×8) or instrument chips (Guitar, Ukulele, …)

---

## Contents

1. [Library — pad chords](#library--pad-chords)
2. [Library — 2×4 pads](#library--2x4-pads)
3. [Library — string chords](#library--string-chords)
4. [Library — scales on pads](#library--scales-on-pads)
5. [Library — scales on strings](#library--scales-on-strings)
6. [Tuning](#tuning)
7. [Tuner](#tuner)
8. [Strings player](#strings-player)
9. [Progressions](#progressions)
10. [Song Builder](#song-builder)
11. [Screenshot index](#screenshot-index)

---

## Library — pad chords

![G major on a 4×4 pad grid](screenshots/01-library-pads-4x4-chord.png)

**Pads** mode · **Library** · layout **4×4** · root **G** · **Major**

1. Choose **Root**, **Kind** (Chords), and a formula from the list.
2. Every pad whose note is a chord tone lights up; a **bright border** marks the primary voicing (here G3 · B3 · D4).
3. Click the chart to hear the voicing. **Add to Song** sends it to Song Builder.
4. Tip under the chart: open **Pad Player** — this selection stays highlighted so you can tap each tone separately.

---

## Library — 2×4 pads

![G major on a 2×4 pad grid with missing B](screenshots/02-library-pads-2x4-chord.png)

Same **Gmaj**, but layout **2×4** (8 pads). Only G3 and D3 fit on this map, so the app reports **Missing on this pad map: B**. Fix that in the **Pads** tab (assign B somewhere) or pick another root/layout.

---

## Library — string chords

### Guitar

![G major guitar chord chart](screenshots/03-library-guitar-chord.png)

**Strings** · **Guitar** · **Gmaj** · capo **0**

- Charts are fretboards. Badge shows tuning (**EADGBE**) and **high ↑** (high string at the top of the diagram).
- Finger numbers on fretted dots; ○ = open; × = muted.
- Capo appears in Library only in string mode.

### Mandolin

![G major mandolin chord chart](screenshots/04-library-mandolin-chord.png)

Same Library flow on **Mando** (GDAE). Open G and D, finger 1 on A string — a compact four-string voicing.

---

## Library — scales on pads

### 2×4

![G Mixolydian on 2×4 pads](screenshots/05-library-pads-2x4-scale.png)

**Kind → Scales & Modes** · **Mixolydian** · tempo **100 BPM** (tempo shows for scales, not single chords).

On a small map, some scale degrees may be missing (here A and B). Lit pads are in-scale tones on your current pad map.

### 4×4

![A Blues on 4×4 pads](screenshots/20-library-pads-4x4-blues.png)

**Kind → Scales & Modes** · category **Pentatonic & blues** · **Blues Scale** · root **A**. Every in-scale pad lights. Click to hear the scale **ascending**, one note per beat at the Library tempo. Tip: **Pad Player** keeps the scale highlighted for individual practice.

---

## Library — scales on strings

### Guitar blues / pentatonic

![A Blues on guitar](screenshots/21-library-guitar-blues.png)

Category **Pentatonic & blues** · **Blues Scale** · root **A** · standard **EADGBE**. Scale tones as dots, **R** = root. Same Library controls as Mixolydian; color tints the chart.

### Violin Mixolydian

![G Mixolydian on violin](screenshots/08-library-violin-scale.png)

**Violin** uses a fingerboard-style chart (GDAE, high string at top). Same Library controls.

---

## Tuning

![Guitar Tuning tab with Drop D](screenshots/10-tuning-drop-d.png)

In string mode the **Pads** tab becomes **Tuning**.

1. Pick a preset (**Drop D · DADGBE** here) or edit each open string (note + octave, ±1 semitone).
2. Order is **low → high, left → right** (String 1 = lowest).
3. Charts update immediately. Capo stays per song, not on this tab.

After Drop D, Library charts follow the new open notes:

![A minor pentatonic in Drop D](screenshots/11-library-guitar-drop-d-scale.png)

Badge reads **DADGBE**; low string label is **D** instead of E.

---

## Tuner

![Chromatic tuner popup](screenshots/22-tuner.png)

Click **Tuner** in the header (any tab). Allow microphone access when prompted.

- Chromatic display: note + octave, cents needle (−50 … +50), and Hz
- Green when within about ±5 cents of the nearest pitch (A4 = 440 Hz)
- Pluck **one** string in a quiet room; laptop mics are weaker on very low bass
- Close the dialog (or press Esc) to stop the mic — audio never leaves the browser
- Free on the GitHub Pages site: no ads, no account

---

## Strings player

In string mode **Pad Player** becomes **Strings**.

### Guitar

![Strings player with Drop D guitar](screenshots/12-strings-player-guitar.png)

- Left: click open strings to pluck (transpose / tone available).
- Right: current **Library selection** stays visible (here A minor pentatonic) so you can practice open strings against the chart.

### Banjo

![Strings player with banjo](screenshots/13-strings-player-banjo.png)

Same player for **Banjo (5)** — five open-string buttons plus the Library chart on the right. Tone menu: Soft / Pure / Bright / Square.

---

## Progressions

### Browse all

![Progressions browser showing 64 forms](screenshots/14-progressions-all.png)

**Progressions** tab (here with **Uke** selected — charts will use that instrument when you load into a song).

1. Set **Key** and optionally **Genre** or search.
2. Each card shows colored chord chips for the key.
3. **Preview** loops; **Add to Song** appends a section; **Replace song** starts fresh.

### Filter by genre

![Latin progressions in C](screenshots/15-progressions-latin.png)

Genre chip **Latin** narrows the list (Andalusian, montuno, salsa/bossa turns, etc.). Same Add / Replace / Preview actions.

---

## Song Builder

### Ukulele song with overlay

![Song Builder on ukulele with C Aeolian overlay](screenshots/16-song-builder-uke.png)

- Song name, tempo, **chord capo** / **scale capo** (strings).
- **Scale overlay** (here C Aeolian) draws above the sections for lead practice.
- Sections (Verse, …) hold chord cards with fret diagrams; drag handle, duplicate, reorder, play section.

### Multiple sections

![Song Builder verse, empty chorus, and bridge](screenshots/17-song-builder-sections.png)

Verse filled from a Latin progression; empty Chorus waiting for content; Bridge with another progression. Empty sections show a drop hint.

### Same song on 2×4 pads

![Song Builder sections on 2×4 pads](screenshots/18-song-builder-pads-2x4.png)

Flip to **Pads** · **2×4** — the same sections re-render as pad charts (notes that fit the eight-pad map).

### Guitar Drop D song view

![Song Builder on guitar in Drop D](screenshots/19-song-builder-guitar-drop-d.png)

Overlay and chord cards use **DADGBE** diagrams when that tuning is active — Song Builder always follows the current instrument and tuning.

---

## Screenshot index

| File | What it shows |
|---|---|
| `01-library-pads-4x4-chord.png` | Library · Pads 4×4 · Gmaj |
| `02-library-pads-2x4-chord.png` | Library · Pads 2×4 · Gmaj (missing B) |
| `03-library-guitar-chord.png` | Library · Guitar · Gmaj |
| `04-library-mandolin-chord.png` | Library · Mandolin · Gmaj |
| `05-library-pads-2x4-scale.png` | Library · Pads 2×4 · G Mixolydian |
| `06-library-pads-4x4-scale.png` | Library · Pads 4×4 · G Mixolydian |
| `07-library-guitar-scale.png` | Library · Guitar · G Mixolydian |
| `08-library-violin-scale.png` | Library · Violin · G Mixolydian |
| `09-library-guitar-pentatonic.png` | Library · Guitar · A minor pentatonic |
| `10-tuning-drop-d.png` | Tuning · Guitar Drop D |
| `11-library-guitar-drop-d-scale.png` | Library after Drop D · A min pent |
| `12-strings-player-guitar.png` | Strings player · Guitar |
| `13-strings-player-banjo.png` | Strings player · Banjo |
| `14-progressions-all.png` | Progressions · all genres |
| `15-progressions-latin.png` | Progressions · Latin filter |
| `16-song-builder-uke.png` | Song Builder · Uke + overlay |
| `17-song-builder-sections.png` | Song Builder · multi-section |
| `18-song-builder-pads-2x4.png` | Song Builder · Pads 2×4 |
| `19-song-builder-guitar-drop-d.png` | Song Builder · Guitar Drop D |
| `20-library-pads-4x4-blues.png` | Library · Pads 4×4 · A Blues (also README) |
| `21-library-guitar-blues.png` | Library · Guitar · A Blues (also README) |
| `22-tuner.png` | Tuner popup · A♯3 (also README) |

When adding new shots, prefer `NN-kebab-name.png` and extend this table plus a short section above.
