# Project Fitness

Local-first Expo Go workout prototype for iPhone, pinned to Expo SDK 54. Use Node.js 24 LTS for development and the real SQLite verification script.

## Run from a laptop

```sh
git clone --branch work https://github.com/rendookks/project-fitness.git
cd project-fitness
npm ci
npx expo start --go --lan
```

If already downloaded, run the last two commands from the repository root. Use an Expo Go version compatible with SDK 54. Connect the laptop and iPhone to the same Wi-Fi and scan the terminal's QR code with the iPhone Camera, then open in Expo Go. Network connectivity depends on the local network. If LAN is blocked, Expo tunnel mode is an alternative: install the optional `@expo/ngrok` tool when prompted (or `npm install --global @expo/ngrok` on your laptop), then use `npx expo start --go --tunnel`. Tunnel availability depends on that external service.

## Verification

```sh
npm run typecheck
npm run lint
npm test -- --runInBand
npm run doctor
npm run export:check
```

SDK compatibility and bundling do not prove native runtime behavior. Physical iPhone launch, keyboard, persistence after app termination, accessibility, and visual review remain required. See ROADMAP.md for completed checkpoints and limitations. No personal fitness records leave the device; SQLite data is not encrypted. Development tools may access the network to serve the bundle.

For additional browser verification, export first with `npm run export:check`, install a Playwright Chromium using `npx playwright install chromium`, then run `npm run test:e2e`. On Cloud, the installed system Chromium is selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. The temporary verification server supplies cross-origin isolation headers for SQLite WASM and stops after the suite. These checks exercise actual Expo SQLite on web, not iOS SQLite.

## Implemented scope

Onboarding; a searchable/filterable 24-exercise library; one resumable active workout per database; explicit set edits, warm-up/working classification, completion, confirmed deletion; saved history and previous performance; Today; real-record progress charts; independent heaviest and Estimated 1RM records; kilogram/pound switching; deterministic Rule-based Insights; and confirmed local reset. Fuel, Learn, and Recovery are informational only.

Enable demo mode in Settings to explore 11 fictional completed sessions in a separate SQLite file. A DEMO MODE banner identifies every demo screen and sheet. The selected mode survives restart. Normal switching preserves demo edits and independent real/demonstration drafts. Reset demo data restores the fictional seed; reset real data clears real records and starts onboarding again. Neither reset affects the other file.

`npm run validate` includes all ordinary unit tests, exact-adapter on-disk SQLite checks, three-timezone calendar/DST checks, and separate-file demo/migration/rollback verification. Real iPhone testing has not been performed. Browser enlarged-text checks simulate CSS text enlargement; they do not verify iOS Dynamic Type or VoiceOver. No performance benchmarks or founder visual approval are claimed. Large-history performance is unmeasured; the prototype loads local sessions into memory. The launcher icon remains the scaffold asset while the permanent brand is undecided.
