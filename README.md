# PROJECT FITNESS — Premium Workout Tracker

A local-first iPhone workout tracker built with Expo Go SDK 58, Expo Router, strict TypeScript, and SQLite. Node.js **24 LTS** is the development baseline. Feature branch: **`v2-workout-tracker`**, based directly on verified `sdk-58-upgrade` commit `bff649a`.

## Run on Windows and iPhone

Install Node.js 24 LTS, Git for Windows, and an Expo Go release that supports SDK 58. In PowerShell:

```powershell
git clone --branch v2-workout-tracker https://github.com/rendookks/project-fitness.git
cd project-fitness
node --version
npm ci
npx expo start --go --lan
```

For an existing clean checkout:

```powershell
cd C:\path\to\project-fitness
git fetch origin
git switch v2-workout-tracker
git pull --ff-only origin v2-workout-tracker
npm ci
npx expo start --go --lan
```

Keep Windows and iPhone on the same Wi-Fi; allow Node through Windows Firewall on your private network. Scan the QR code with iPhone Camera and open it in Expo Go. If LAN is blocked, stop Metro with Ctrl+C and run `npx expo start --go --tunnel`, accepting the optional ngrok tool installation if prompted. Tunnel service availability depends on that provider. The app itself works offline after its bundle is loaded. Do not discard local Git changes to follow these instructions.

## Training loop

1. In **Train**, create a routine, choose exercises, and save planned sets, reps, and optional loads.
2. Start it from **Today** or **Train**. There is one resumable active session per database.
3. Edit load/reps directly in a row; blur or keyboard Done saves valid edits. Tap the check once to complete the current values. Tap the set number for classification, numeric details, or deletion. Warm-ups remain in history but are excluded from strength calculations.
4. Finish with confirmation. Review load/rep history, separate heaviest-load and Estimated 1RM records, and genuine improvements in **Progress**.
5. Start again to get previous completed working-set values, preferring the same routine. Loads copy exact integer grams. Editing a routine or session never rewrites completed history.
6. **Coach** explains conservative rule-based, optional first-set targets. No chatbot, AI key, recovery assessment, account, payment, or cloud sync.

The catalog contains 150 movements and supports custom creation/editing/archiving. Archived identities and stored exercise snapshots keep old sessions readable. A substantially different movement should receive a new identity.

## Protect your data

In **Today → Settings**, export a real-data JSON backup and save it using iOS sharing/Save to Files. Restore chooses a file, validates it, shows counts, and requires confirmation before replacing all real records, including the active session. Replacement uses a SQLite transaction; a failed restore rolls back. Backup format v1 includes profile, units, custom movements, routines, completed history, and the active session. Maximum file size: 25 MB. Browser verification uses a downloaded file and file picker; iOS uses Expo's native file/share APIs.

Demo mode uses `project_fitness_demo.db`; real data uses `project_fitness.db`. Fictional demo fitness records never enter ordinary backups. Return to real mode to export or restore. Reset actions affect only the selected database. Files and SQLite are not encrypted; protect exported copies. Uninstalling Expo Go, clearing its storage, or resetting real data can remove local records. This is manual backup, not automatic remote protection.

## Verification

```powershell
npm run validate
npm run doctor
npm run export:check
npx playwright install chromium
npm run test:e2e
```

`validate` covers strict TypeScript, lint, unit tests, exact-adapter on-disk SQLite, migration/reopen/rollback, backup/restore, three-timezone calendar checks, and two-file demo isolation. Browser tests require an export first and exercise actual Expo SQLite WASM. They do not run native iOS SQLite.

Cloud uses a writable npm cache and Expo CLI home under `/tmp`, `NODE_USE_ENV_PROXY=1` for Doctor, `--max-workers 2` for export, and `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` for browser checks. Laptop commands need none of these overrides.

See [delivery and validation](docs/DELIVERY.md), [architecture](ARCHITECTURE.md), [decisions](DECISIONS.md), [roadmap](ROADMAP.md), and [physical iPhone acceptance](DEVICE_TEST_CHECKLIST.md). Updated screenshots are in `docs/screenshots/v2-*`; they are browser evidence. **Physical iPhone acceptance remains pending for this feature branch.** The founder-reported SDK 58 launch preceded these changes.
