# HYROX Trainer

https://githunyd.github.io/Hyrox-Trainer/

Choose your race date on the first visit. That visit becomes day one; a private device-local plan runs from that day through the selected race. Reopening keeps the original start date. Supported planning window: today through 730 days after the first visit.

The opening screen shows today’s session. Exercises and whole sessions have checkboxes; finishing all exercises completes the session automatically. Day totals, weekly training progress, a gentle daily rhythm, milestone messages and a brief celebration acknowledge progress. Recovery counts too. Animation respects reduced-motion preferences. The full plan, station guide and settings are secondary, collapsible views.

## Planning

The original general beginner templates include 21 weeks of run/walk, strength, station practice, regular recovery and tapering. Shorter plans keep early foundation work rather than skipping beginners into peak workouts. The last week is light race preparation; plans of 28 days or longer have a preceding taper week. Longer plans extend stable build/recovery blocks before the race-specific finish. Race today contains race guidance only. Short timelines do not guarantee race readiness or compress months of training.

This is a general original beginner plan, not an official HYROX program or individual coaching. The assumed starting point is comfortably brisk-walking 30 minutes. Seven-day training cycles start on the user’s first day, so rest is not tied to a weekday. Use your ticket for the actual date, division and wave time.

Station standards checked October 8, 2026 against the official **2026/27 Singles rulebook**, linked from https://hyrox.com/rulebook/: https://maintain.hyrox.com/rulebooks/HYROX_RulebookSingles_EN.pdf. Loads are kg; sled weights include the sled. Official rules and judges govern racing.

## Storage and offline use

Dates, exercise checkoffs and completed sessions are stored in this browser. No accounts, analytics, remote personal-data storage or third-party fonts. Backup/restore includes dates and checklists. Cross-tab changes synchronize. Date changes retain completed past days and exercise checks for unchanged workouts. Starting a new plan requires confirmation. Previous fixed-plan storage remains untouched and can be exported from settings when present.

Open online once and wait for the offline-ready message. The worker caches the app shell, templates and planner module. Updates replace only this app’s old cache and leave progress untouched. A refresh button appears for updates. iPhone: Safari → Share → Add to Home Screen. Android: Install app. Home-screen apps may use separate storage on iOS; use backups when switching.

If JavaScript or template loading fails, all 147 starter sessions and the station guide remain accessible in HTML with temporary native checkboxes. Personal dates and persistent checkoffs require JavaScript. If storage fails, the current visit still works and can be backed up.

## Development and deployment

Node.js 20+; no application dependencies required.

```
npm run build
npm test
npm start
```

`scripts/plan.mjs` contains templates; `docs/planner.js` dates and validates personal plans; `scripts/build.mjs` generates the fallback and manifest. UI assets live in `docs/`. Preview: http://127.0.0.1:4173/Hyrox-Trainer/.

Optional browser checks use Playwright with installed Chrome: `node tests/browser.cjs`. Set `HYROX_BROWSER=msedge` for Edge or `HYROX_TEST_URL` for deployment. Tests use temporary profiles, fixed dates and synthetic progress. Coverage includes persistent first-day dates, short/long plans, exercise and session checkoffs, celebrations, race-date changes, validated backups, cross-tab sync, offline reloads, small screens, disabled storage and no-JavaScript fallback.

GitHub Pages publishes `docs` through `.github/workflows/pages.yml` on pushes to `main` after generating and validating output. Asset paths, manifest and worker scopes are relative for `/Hyrox-Trainer/`. Bump the cache version whenever shell assets change.
