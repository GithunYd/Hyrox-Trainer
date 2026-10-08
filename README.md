# Phoenix · Your first HYROX

Mobile-first static training companion for a 21-week beginner plan, October 5, 2026 through February 28, 2027. Independent of HYROX.

## Use

Open https://githunyd.github.io/Hyrox-Trainer/ in Safari on iPhone, then Share → Add to Home Screen. Wait for “Offline ready” before disconnecting. Checkoffs are device/browser-local; backup/restore moves them between devices. No accounts, analytics, external fonts or tracking.

All 147 dated workouts and the station guide are in the HTML. If JavaScript fails, expand the weeks and read/check workouts; checkoffs won’t persist and the countdown stays as a target date. With JavaScript, native checkboxes gain saved progress, a countdown, backup/restore and offline access.

## Plan and sources

The available referenced conversation specified features but contained no detailed coach-authored schedule. This repository contains an original general beginner plan, not a reproduction of an unavailable plan. Five training days, Thursday rest and optional Sunday recovery; recovery weeks 4/8/12/16, two-week taper. Run/walk, effort-based loads and substitutions included. A generally healthy beginner able to brisk-walk 30 minutes is the assumed starting point; reduce or repeat weeks as needed.

Phoenix officially runs February 25–28, 2027. The app targets February 28 as requested. Actual division dates and wave times come from the athlete’s ticket; taper dates must move if their race is earlier.

Station distances, loads and target heights checked October 8, 2026 against the official **2026/27 Singles rulebook** at https://maintain.hyrox.com/rulebooks/HYROX_RulebookSingles_EN.pdf (linked from https://hyrox.com/rulebook/). Official event: https://hyrox.com/event/inbody-hyrox-phoenix-26-27/. Loads are kg; sled values include the sled. Guidance is summarized; official rules and judges govern racing. No individual training guarantee is made.

## Development

Requires Node.js 20+; no install or dependencies required.

```
npm run build
npm test
npm start
```

Edit `scripts/plan.mjs` for workouts; `scripts/build.mjs` generates `docs/index.html`, `docs/plan.json`, and the manifest. Styles, browser enhancements, icons and service worker live in `docs/`. Serve at http://127.0.0.1:4173/Hyrox-Trainer/. Do not serve the repository root. Bump the service worker cache version when changing shell assets. Existing tabs finish on their current version; close all tabs and reopen to activate updates. Local progress is independent of the service-worker cache.

## Deployment

GitHub Pages serves the `main` branch `/docs` directory. Generated files are committed so GitHub’s native Pages build can deploy without workflow permissions or dependency downloads. All asset URLs are relative for the project subpath. Manifest scope/id/start URL and service-worker scope stay within `/Hyrox-Trainer/`.
