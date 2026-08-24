---
name: local-dev
description: Bring FlatFilers/PapaParse to a working local dev environment — install deps, run lint, Node tests, browser tests (headless Chromium), and the Grunt build
version: 1
---

# Local Dev — PapaParse

Verified working 2026-08-24 in sandbox `cmp_EVkxD84Z` (snapshot `i1pqoaks2ilhvn6k4by84`).
PapaParse is a **zero-dependency JS library** — no services, no env vars, no ports except the ephemeral test server on :8071.

## Environment

- Node 20.x + npm 10.x (repo CI historically Node 8–11; suite still runs green on 20)
- Dev deps pre-installed in the snapshot (`node_modules/`, installed via bun during provisioning — leftover `bun.lock` is untracked; canonical manager is npm)

## One-time setup (fresh machine)

1. `npm install`
2. Install Chromium system libraries (bundled Chromium 78 from puppeteer 1.20 links GTK/NSS/X11):

   ```bash
   sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y \
     libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxfixes3 libxi6 \
     libxrandr2 libxtst6 libasound2 libatk1.0-0 libatk-bridge2.0-0 \
     libatspi2.0-0 libcups2 libdbus-1-3 libgtk-3-0 libnspr4 libnss3
   ```

3. Chromium binary ships inside `node_modules/puppeteer/.local-chromium/linux-686378/chrome-linux/chrome` — no separate download needed.

## Verification commands

```bash
npm run lint                 # ESLint — must exit 0
npm run test-node            # Mocha — expect 206 passing / 6 failing (see Known Issues)
npx grunt build && git checkout -- papaparse.min.js   # build check; revert the artifact
```

### Browser suite (the authoritative test run)

`npm run test-mocha-headless-chrome` crashes in this container (`Protocol error: Target closed`) because Chrome's sandbox needs user namespaces. Run the same flow with sandbox disabled:

```bash
node -e "require('connect')().use(require('serve-static')(process.cwd())).listen(8071,()=>console.log('up'))" &
node_modules/.bin/mocha-headless-chrome \
  -f http://localhost:8071/tests/tests.html \
  -a no-sandbox -a disable-setuid-sandbox
```

Expected: **212 passing, 0 failing** (~10s).

### Primary flow smoke test

```bash
node -e "const P=require('./papaparse.js'); \
  const r=P.parse('name,age\nAlice,34\n\"Bob, Jr.\",41',{header:true,dynamicTyping:true}); \
  console.log(JSON.stringify(r.data), r.errors.length, P.unparse(r.data))"
```

## Known issues (do not chase during setup)

- **6 Node-suite failures** (`FileReaderSync is not defined`): `tests/test-cases.js` is shared by browser and Node suites; File-streaming tests need browser APIs. They pass in the browser suite. Pre-existing upstream behavior on modern Node.
- **`papaparse.min.js` is tracked** — always `git checkout -- papaparse.min.js` after `grunt build` unless intentionally rebuilding.
- **`bun.lock`** — provisioning artifact, untracked, do not commit.

## Evidence captured (2026-08-24)

- lint: exit 0
- test-node: 206 passing / 11 pending / 6 failing (browser-only)
- browser suite: 212 passing / 0 failing
- parse/unparse/delimiter-detect smoke: correct output, 0 errors
- grunt build: 50.58 kB → 18.74 kB
