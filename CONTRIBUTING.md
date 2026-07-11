# Contributing to IsoPad Studio Pro

Thanks for helping improve this professional, free studio tool. It is a small, dependency-free static web app — keep changes focused and easy to run with `python3 -m http.server`.

**Agents and contributors:** read **[SPECS.md](SPECS.md)** before changing product behavior, and update that file in the same PR whenever specs change.

## Development setup

1. Fork and clone the repository.
2. Serve the project folder (do **not** open `index.html` as a `file://` URL):

   ```bash
   cd isopadstudio
   python3 -m http.server 8000
   ```

3. Open [http://localhost:8000](http://localhost:8000) and hard-refresh after edits (`Cmd+Shift+R` / `Ctrl+Shift+R`).
4. Run tests before opening a PR:

   ```bash
   npm test
   ```

5. If your change affects behavior described in **[SPECS.md](SPECS.md)**, update that file in the same PR.

There is no build step to run the app. Edit `index.html`, `app.css`, `app.js`, `lib/*`, and `progressions.js` directly.

## What to work on

Good contributions include:

- Additional **chords**, **scales**, or **progressions**
- Pad-map presets or editor UX improvements
- Layout polish for **4×4** and **2×4** boards
- UI clarity, accessibility, and print layout fixes
- Browser compatibility fixes
- Documentation improvements

Please avoid:

- Adding a bundler, framework, or large dependency unless there is a strong reason and discussion first
- Committing personal `localStorage` dumps or unrelated GarageBand / audio project files
- Drive-by refactors unrelated to the change you are making

## Adding a progression

Edit `progressions.js`. Each entry looks like:

```js
{
  id: "unique-kebab-id",
  name: "I–V–vi–IV",
  aka: "Short nickname",
  genre: "Pop",          // existing genre label, or a clear new one
  numerals: "I–V–vi–IV",
  chords: [
    { o: 0, q: "Major" },      // o = semitones above the chosen key tonic
    { o: 7, q: "Major" },
    { o: 9, q: "Minor" },
    { o: 5, q: "Major" },
  ],
}
```

`q` must match a key in the `CHORDS` object in `app.js` (for example `"Dominant 7"`, `"Minor 7"`, `"Major 7"`).

After adding entries, spot-check in the **Progressions** tab in a few keys (try `C` and `A`) on both **4×4** and **2×4**, and confirm **Load into Song** colors repeated chord types consistently.

## Adding a chord or scale

In `app.js`, add to `CHORDS` or `SCALES`:

```js
"My Chord": { category: "Sevenths", intervals: [0, 4, 7, 10], short: "7" },
```

Intervals are semitones from the root. Chords/scales resolve against the **current pad map** (see Pads tab), not a hard-coded chromatic index. Scales light every matching pitch class on the board; chords pick the nearest pad per chord tone from the root pad.

## Pull requests

1. Use a clear branch name (`add-gospel-progressions`, `fix-print-css`, …).
2. Keep the PR focused on one topic.
3. Use [Conventional Commits](https://www.conventionalcommits.org/) in commit messages (`feat:`, `fix:`, `docs:`, …) so semantic-release can version from `main`.
4. Describe what changed and how you tested it (browser + OS + layout size is enough).
5. Do not commit generated junk, editor swap files, or OS metadata (`.DS_Store`).

## Code style

- Match the existing vanilla JS / CSS style in the file you edit.
- Prefer small, readable functions over clever abstractions.
- Keep the app usable offline once the files are served (no required external API). Google Fonts may load when online; layout should still work if they do not.

## Reporting bugs

Open an issue with:

- Browser and OS
- Layout mode (4×4 or 2×4)
- Steps to reproduce
- What you expected vs what happened
- Whether you were using `python3 -m http.server` (or another static server)

## License

By contributing, you agree that your contributions are licensed under the MIT License (see [LICENSE](LICENSE)).
