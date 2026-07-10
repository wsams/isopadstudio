const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.join(__dirname, "..");

describe("repository smoke", () => {
  it("has the core static app files", () => {
    for (const file of [
      "index.html",
      "app.js",
      "app.css",
      "progressions.js",
      "lib/music.js",
      "package.json",
      ".releaserc.json",
      ".github/workflows/release.yml",
    ]) {
      assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);
    }
  });

  it("loads lib/music.js before app.js in index.html", () => {
    const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
    const musicIdx = html.indexOf("lib/music.js");
    const stringsIdx = html.indexOf("lib/strings.js");
    const appIdx = html.indexOf("app.js");
    assert.ok(musicIdx >= 0, "lib/music.js script missing");
    assert.ok(stringsIdx > musicIdx, "lib/strings.js must load after music.js");
    assert.ok(appIdx > stringsIdx, "app.js must load after lib/strings.js");
  });

  it("ships string instrument library", () => {
    assert.ok(fs.existsSync(path.join(root, "lib/strings.js")));
  });

  it("package.json starts at a development version placeholder", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
    assert.equal(pkg.name, "isopadstudio");
    assert.match(pkg.version, /^\d+\.\d+\.\d+/);
  });

  it("releaserc uses replace-plugin then git commit-back", () => {
    const rc = JSON.parse(fs.readFileSync(path.join(root, ".releaserc.json"), "utf8"));
    const plugins = rc.plugins.map((p) => (Array.isArray(p) ? p[0] : p));
    assert.ok(plugins.includes("semantic-release-replace-plugin"));
    assert.ok(plugins.includes("@semantic-release/git"));
    const replaceIdx = plugins.indexOf("semantic-release-replace-plugin");
    const gitIdx = plugins.indexOf("@semantic-release/git");
    assert.ok(replaceIdx < gitIdx, "replace plugin must run before git");
  });
});

describe("progressions data", () => {
  it("references only known chord qualities from app.js", () => {
    const app = fs.readFileSync(path.join(root, "app.js"), "utf8");
    const chordBlock = app.slice(app.indexOf("const CHORDS"), app.indexOf("const SCALES"));
    const qualities = new Set();
    for (const m of chordBlock.matchAll(/^\s+(?:\"([^\"]+)\"|([A-Za-z][^:]*)): \{ category:/gm)) {
      qualities.add(m[1] || m[2]);
    }
    assert.ok(qualities.size > 20, "expected a large chord dictionary");

    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(root, "progressions.js"), "utf8"), sandbox);
    const progressions = sandbox.window.ISOPAD_PROGRESSIONS;
    assert.ok(Array.isArray(progressions));
    assert.ok(progressions.length >= 30);

    const missing = new Set();
    progressions.forEach((p) => {
      assert.ok(p.id && p.name && p.genre && Array.isArray(p.chords));
      p.chords.forEach((c) => {
        assert.equal(typeof c.o, "number");
        if (!qualities.has(c.q)) missing.add(c.q);
      });
    });
    assert.deepEqual([...missing], []);
  });
});
