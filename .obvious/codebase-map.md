# PapaParse — Codebase Map

Depth-capped at 2. PapaParse is a single-file library: all parsing logic lives in `papaparse.js`.

| Path | Type | Purpose |
|---|---|---|
| `papaparse.js` | source (1,903 lines) | **The entire library.** CSV parser core (`Papa.parse`), serializer (`Papa.unparse`), auto-detection, streamers (string/File/Readable), web-worker support, jQuery plugin hook. Entry point per `main` in package.json |
| `papaparse.min.js` | build artifact (committed) | Uglified bundle produced by `grunt build`; referenced by `browser` field in package.json. Regenerate, don't hand-edit |
| `Gruntfile.js` | build config | `uglify` task: minifies `papaparse.js` → `papaparse.min.js` with `PAPA_BROWSER_CONTEXT` global def |
| `package.json` | manifest | npm manifest — dev deps, lint/test scripts. No runtime dependencies |
| `bower.json` | manifest | Legacy Bower manifest (library predates npm-only distribution) |
| `.eslintrc.js` | lint config | ESLint 4, `eslint:recommended`, `ecmaVersion: 5` |
| `.travis.yml` | CI | Travis CI, Node 8–11 (historical) |
| `tests/` | tests | Mocha/Chai suite. `test-cases.js` (2,352 lines) — shared browser+Node cases; `node-tests.js` — Node-streaming cases; `test.js` — serves repo on :8071 and spawns mocha-headless-chrome; `tests.html` — browser harness; sample CSV fixtures (`sample.csv`, `long-sample.csv`, `verylong-sample.csv`) |
| `docs/` | docs site | GitHub Pages source for papaparse.com: `index.html` (landing), `docs.html` (API reference), `demo.html` (interactive demo), `faq.html`, `CNAME`, `Caddyfile`, `resources/` |
| `player/` | demo app | Standalone demo page (`player.html`/`player.js`/`player.css`) that parses files via PapaParse in the browser |
| `LICENSE` | license | MIT |
| `README.md` | docs | Overview, install, Node usage notes, test instructions |
