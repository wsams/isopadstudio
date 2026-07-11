# IsoPad Studio Pro

**Professional** chord, scale, mode, and progression charts for pad controllers and string instruments — see exactly which pads or frets to play, then tune with a free chromatic mic tuner. Powerful studio tools, free on GitHub Pages: **no ads, no account, no fuss.**

Built for people with gear like:

- **Akai** MPD218, MPD226, LPD8, MPC pads, and similar 4×4 / 2×4 controllers  
- **Korg** nanoPAD / nanoPAD2  
- Other MPC-style and grid pad controllers with 8 or 16 pads  

…and also for **string players**: guitar, bass, ukulele, mandolin, banjo, violin, viola, cello, and double bass.

The idea is simple. Many of these instruments are *isomorphic* — once you learn a shape, you can move it to play in another key. IsoPad Studio Pro shows those shapes as charts you can hear, save into songs, and print. New to that idea? Browse a chord or scale and click to hear it. Already deep into theory? There’s a large library of qualities, modes, and stock progressions by genre.

---

### [▶ Open IsoPad Studio Pro — live in your browser](https://wsams.github.io/isopadstudio/index.html)

**Nothing to install.** Works in Chrome, Firefox, Safari, or Edge.

Need to tune before you play? Hit **Tuner** in the header — a chromatic mic tuner runs entirely in your browser on this free GitHub Pages site. **No ads. No account. No fuss.** Audio never leaves your machine.

[![Open live app](https://img.shields.io/badge/Open_IsoPad_Studio_Pro-wsams.github.io-ff4d6d?style=for-the-badge&logo=github&logoColor=white)](https://wsams.github.io/isopadstudio/index.html)

Source and issues: [github.com/wsams/isopadstudio](https://github.com/wsams/isopadstudio)

---

| Mode | Good for |
|---|---|
| **4×4 (16 pads)** | Akai MPD218 / MPD226, MPC-style pads, and similar |
| **2×4 (8 pads)** | Akai LPD8, single nanoPAD bank |
| **2×6 (12 pads)** | Wide 2-row pad controllers |
| **2×8 (dual 2×4)** | Korg nanoPAD2 — two 2×4 banks side by side (same 16 notes as 4×4) |
| **Strings** | Guitar, bass, uke, mando, banjo, violin family, plus Chinese (pipa, erhu, zhongruan, guzheng), Japanese (shamisen, koto), and Middle Eastern (oud, bağlama, setar, tar) |

Pick your instrument in the header. Pads light up on a grid; strings show fretboard / fingerboard charts. Map your own pad notes or open-string tuning. Songs can use a **chord capo** and a separate **scale capo**.

For walkthroughs and more screenshots, see the **[User manual](MANUAL.md)**.

For architecture, data shapes, UI contracts, and agent instructions, see **[SPECS.md](SPECS.md)** (keep it updated when behavior changes).

## Screenshots

![A Blues on a 4×4 pad grid in the Library](screenshots/readme-pads-4x4.png)

![A Blues on 6-string guitar (standard EADGBE) in the Library](screenshots/readme-guitar.png)

![Chromatic tuner popup showing A♯3](screenshots/readme-tuner.png)

Same scale on **Pads · 4×4**, then **Strings · Guitar**, plus the **Tuner** popup (mic stays in your browser). More walkthroughs: **[User manual](MANUAL.md)**.

## Professional features

- **Tuner** — free chromatic mic tuner in the header (A4 = 440 Hz); no ads, mic stays in the browser
- **Pads editor** — assign note + octave to every pad (defaults: chromatic from **C3**; piano middle C is **C4**)
- **String instruments** — guitar, basses, uke, mandolin, banjo, violin family; fretboard charts + editable tuning
- **Capo** — song-level chord capo; separate scale capo for leads / overlay
- **Chord library** — triads through jazz extensions; pad lights or fret diagrams
- **Scales & modes** — lights every in-scale pad, or a scale box on the fingerboard
- **Progressions** — 60+ stock progressions grouped by genre
- **Song Builder** — sections of progressions, tempo, looping preview, scale overlay, print
- **Pad / string player** — Library selection loads on the live grid so you can play each note; optional transpose
- **Pad layouts** — 4×4, 2×4, 2×6, and dual 2×8 (nanoPAD2); each keeps its own pad map

## Requirements

A modern browser (Chrome, Firefox, Safari, or Edge). That’s it if you’re using the [hosted app](https://wsams.github.io/isopadstudio/index.html).

To run a local copy from this repo, serve the folder over HTTP (don’t open `index.html` as a `file://` URL — browsers often block audio or storage that way).

## Run locally (optional)

```bash
cd isopadstudio
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000). Stop with `Ctrl+C`.

## Run on each platform

### macOS

```bash
cd /path/to/isopadstudio
python3 -m http.server 8000
```

Visit [http://localhost:8000](http://localhost:8000). Install Python from [python.org](https://www.python.org/downloads/) or `brew install python` if needed.

### Windows

```powershell
cd path\to\isopadstudio
python -m http.server 8000
```

If that fails, try `py -m http.server 8000`. Visit [http://localhost:8000](http://localhost:8000).

### Linux

```bash
cd /path/to/isopadstudio
python3 -m http.server 8000
```

### Other servers

```bash
npx --yes serve -l 8000
php -S localhost:8000
ruby -run -ehttpd . -p8000
```

Or host the folder on Apache, nginx, GitHub Pages, Netlify, etc. — no backend or build step.

## How to use

See the **[User manual](MANUAL.md)** for screenshots and walkthroughs. Short version:

### Layout toggle

Use **4×4** / **2×4** in the header. The badge shows `16` or `8`. Pick a string instrument from the dropdown when you want fretboard charts.

### Pads (important)

Open the **Pads** tab and set what each pad plays. Maps are stored **per layout** in `localStorage`. In string mode this tab is **Tuning**.

### Library → Pad Player

1. Choose root, Chords or Scales, and a formula; click the chart to hear it.
2. Open **Pad Player** — that selection stays highlighted so you can tap each note on the live grid.
3. **Add to Song** when you want it in a progression.

### Progressions & Song Builder

Preview looping progressions, add them as sections, set tempo, overlay a scale, save and print.

## Project layout

```
isopadstudio/
├── index.html
├── app.css
├── app.js
├── lib/music.js      # Shared pad/chord math (tested)
├── lib/strings.js    # String instruments, capo, fingerings
├── progressions.js
├── screenshots/      # Used by MANUAL.md and README hero shots
├── test/             # node:test suite (`npm test`)
├── README.md
├── MANUAL.md         # User guide + screenshot gallery
├── SPECS.md          # Architecture + agent contracts (update with code)
├── LICENSE
└── CONTRIBUTING.md
```

## Development

```bash
npm test          # unit + smoke tests (required before release)
npm run release   # tests, then semantic-release (CI does this on main)
```

## Default map reminder

With the factory chromatic-from-C3 map on **4×4**:

```
C4 C#4 D4 D#4     ← top
E3 F3  F#3 G3
G#3 A3 A#3 B3
C3 C#3 D3  D#3    ← Pad 1 = C3 (bottom-left)
```

**2×4** is the bottom two rows of that idea (C3–G3 by default).

You can replace any of those assignments in the Pads tab — they do not have to be chromatic or contiguous.

## Privacy

Songs, layout choice, and pad maps stay in your browser (`localStorage`). Nothing is uploaded.

## License

MIT — see [LICENSE](LICENSE).

## Releases

Pushes to `main` run [semantic-release](https://github.com/semantic-release/semantic-release) via GitHub Actions. Use [Conventional Commits](https://www.conventionalcommits.org/):

| Commit prefix | Release |
|---|---|
| `fix:` | patch |
| `feat:` | minor |
| `feat!:` / `BREAKING CHANGE:` | major |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
