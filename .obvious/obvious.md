# PapaParse — Agent Guide

## Repository

- **Repo:** `FlatFilers/PapaParse` (fork of `mholt/PapaParse`)
- **What it is:** Fast, RFC 4180-compliant CSV parser for JavaScript. Converts CSV→JSON and JSON→CSV, supports streaming, web workers, and delimiter auto-detection. **Zero runtime dependencies.**
- **Version:** 5.0.1 (`package.json`)
- **Default branch:** `master`

## Stack

| Layer | Technology |
|---|---|
| Language | JavaScript (ES5 — eslint `ecmaVersion: 5`) |
| Runtime | Node.js (sandbox: v20.20.2; Travis CI historically Node 8–11) |
| Package manager | npm (dev dependencies only — the library itself has none) |
| Tests | Mocha 5 + Chai 4 — Node suite + browser suite (mocha-headless-chrome → puppeteer → bundled Chromium 78) |
| Lint | ESLint 4 (`eslint:recommended`) |
| Build | Grunt + grunt-contrib-uglify (`papaparse.js` → `papaparse.min.js`) |
| Docs site | Static HTML in `docs/` (GitHub Pages — papaparse.com) |

**No external services.** No database, no Redis, no Docker Compose, no required env vars.

## Commands

| Task | Command | Notes |
|---|---|---|
| Install dev deps | `npm install` | Already installed in the sandbox snapshot |
| Lint | `npm run lint` | ESLint over `papaparse.js`, `Gruntfile.js`, `.eslintrc.js`, `tests/**/*.js` |
| Node tests | `npm run test-node` | Mocha: 206 passing / 6 failing (browser-only tests — see Gotchas) |
| Browser tests | `npm run test-mocha-headless-chrome` | Serves repo on port 8071, runs `tests/tests.html` in headless Chromium. Needs `--no-sandbox` in this container — see Gotchas |
| Full suite | `npm test` | lint + node + browser |
| Interactive tests | `npm run test-browser` | Serves on 8071, opens tests.html in a real browser |
| Build (minify) | `npx grunt build` | Regenerates `papaparse.min.js` (50.6 kB → 18.7 kB) |
| Quick smoke | `node -e "const P=require('./papaparse.js'); console.log(JSON.stringify(P.parse('a,b\\n1,2',{header:true}).data))"` | Library's primary flow in Node |

## Codebase Map

See [codebase-map.md](codebase-map.md). The whole library lives in a single file, `papaparse.js` (~1,900 lines).

## Local Verification Summary

Verified on 2026-08-24 (sandbox snapshot `i1pqoaks2ilhvn6k4by84`):

| Check | Result | Evidence |
|---|---|---|
| `npm run lint` | PASS | exit 0, no errors |
| `npm run test-node` | PASS with known caveat | 206 passing, 11 pending, 6 failing — all 6 are `FileReaderSync is not defined` (browser-only API; see Gotchas) |
| Browser suite (mocha-headless-chrome, Chromium 78) | PASS | **212 passing, 0 failing** |
| Primary flow: parse + unparse | PASS | `Papa.parse` with header+dynamicTyping → correct typed rows, 0 errors; `Papa.unparse` round-trips; delimiter auto-detect (`;`) works |
| Build: `npx grunt build` | PASS | uglify 50.58 kB → 18.74 kB |

## Gotchas

1. **Node suite has 6 pre-existing failures.** `tests/test-cases.js` is shared between browser and Node suites; its File-streaming tests use `FileReaderSync`, a browser-only Worker API. They fail on any modern Node and pass in the browser suite (212/212). Do not "fix" this during onboarding-style changes; it is upstream behavior.
2. **Headless Chromium needs `--no-sandbox` in this container.** The npm script does not pass it, so `npm run test-mocha-headless-chrome` crashes with `Protocol error (Performance.enable): Target closed`. Run the runner directly with `-a no-sandbox -a disable-setuid-sandbox` — exact commands in [skills/local-dev/SKILL.md](skills/local-dev/SKILL.md).
3. **Chromium system libraries** must be present (bundled Chromium 78 links GTK/NSS/X11). Apt list in SKILL.md.
4. **`papaparse.min.js` is a committed build artifact.** Revert it after running `grunt build` unless a release rebuild is intended.
5. **`bun.lock`** is an untracked leftover from sandbox provisioning (`bun install`). The repo's canonical manager is npm; do not commit `bun.lock`.

## Sandbox Snapshot

- **Snapshot ID:** `i1pqoaks2ilhvn6k4by84`
- **Captured:** 2026-08-24T16:14:32.892Z
- **State:** dev deps installed, Chromium 78 + system libs working, lint/node/browser suites and build verified green
