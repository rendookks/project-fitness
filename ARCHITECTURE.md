# Architecture

## Runtime and boundaries

Expo SDK 58 / React Native 0.88 / Expo Router / React 19, with strict TypeScript and Node 24 development tooling. Routes in `app/` compose `src/features/`. Pure domain modules have no React Native dependency. Shared controls and existing obsidian/iris/aqua/champagne tokens remain in `src/ui/` and `src/theme/`. Fonts are locally bundled Manrope. Primary navigation: Today, Train, Progress, Coach; Settings and informational previews use stack routes.

`WorkoutRepository` serializes mutations. The provider queues UI operations, refreshes only after persistence succeeds, and shows failures without resetting storage. Inline fields keep possibly invalid local text; only validated patches cross the repository boundary on blur/Done/completion. Completion saves current numeric values and its flag together. Patch merging preserves concurrent completion flags. Structural actions are disabled while saving. Saving status floats without moving a control mid-tap. A target or advanced edit refreshes only its row's numeric draft. Unsaved invalid text is not promised to survive termination.

## Canonical training data

Nonnegative integer grams are canonical; 1 lb = 453.59237 g. Input converts once and rounds to whole grams. Display rounds to 0.01 units, and unchanged weight text retains the original gram value. Unit changes never rewrite workout/routine payloads. Zero external load is valid; body mass/per-side doubling is never inferred. Reps are whole 1–999; load is at most 2,000,000 grams.

Only completed working sets in explicitly completed workouts count for records, working volume, or strength totals. Warm-ups and incomplete sets remain in history. A completed warm-up-only session can count as a workout while contributing no strength records. Estimated 1RM uses recorded load at one rep, Epley for 2–12, and no estimate above 12 reps or at zero load. It is an estimate, not a measured maximum. Completion instants are UTC; calendar weeks use device-local Monday midnight through calendar arithmetic.

## SQLite and migrations

`FitnessStorage` has Expo SQLite and in-memory test adapters. A minimal SQL driver allows the exact adapter statements to run against Node 24 SQLite on disk. SQLite enables WAL and foreign keys. Parameterized writes save complete workout documents atomically; a unique partial index enforces one active workout per file. Future schema versions and unreadable JSON fail visibly without data deletion.

Migrations advance `PRAGMA user_version` in a transaction for each version:

- v1: singleton profile/settings and indexed workout documents.
- v2: demo seed metadata.
- v3: `routines(id, payload)`.
- v4: `custom_exercises(id, payload)`.

Additive v3/v4 migrations never rewrite existing workout/profile/settings rows. Interrupted upgrades roll back the affected version and retry from the last valid version. Reset is an explicit, confirmed operation. No startup repair resets a database.

`project_fitness.db` and `project_fitness_demo.db` have independent records, plans, movements, units, and drafts. Only the selected-mode preference lives in real settings. Destination initialization/read succeeds before a switch persists; demo seeding is guarded by adapter identity and an idempotent metadata marker. Resetting demo replaces only its records; resetting real restarts onboarding. No runtime network or account is required.

## Routines and identities

A routine is an ordered reusable plan with per-set classification, target reps, and optional gram load. A session is an independent performance snapshot. Starting a routine copies structure into fresh session/exercise/set identities and records `routineId`. Previous completed working sets prefer that routine, then the latest appropriate exercise session. Exact gram values copy directly and completion stays false. Planned warm-ups keep their own values. Routine edits/deletion never cascade into sessions; session-to-plan updates are not automatic.

All original 24 exercise IDs remain within the 150-movement catalog. New session entries store exercise snapshots. Historical rendering prefers those snapshots; legacy built-ins resolve through stable IDs. Custom edits do not rewrite sessions, and archival hides selection rows while retaining identity and existing plan/history references. Different movements should use different IDs to avoid mixing strength histories. The library uses FlatList and wrapping filter controls.

## Strength and coaching

Progress searches logged exercises, separates all-time load and Estimated 1RM records, filters charts/history by explicit time ranges, and pages history display. `strength.ts` distinguishes baselines from genuine improvements and keeps the two record metrics independent. Recent record review excludes incomplete/warm-up data. Maxima are reduced iteratively rather than using potentially oversized spread arguments.

`progression.ts` is deterministic and unit-independent. Sparse history suggests repeating. A small optional increase needs two comparable completed sessions at the same load, at least two working sets each, matching set counts, and an explicit uniform routine rep goal of 1–12 reached by every set. Loaded increases are at most 2.5% and 1,000 grams; zero-load progression may add one first-set rep up to 12. It provides evidence and caveats, never infers recovery or changes a plan automatically. Native text and SVG charts have textual summaries; there is no animation requirement or heavy UI framework.

## Backup boundary

Backup format v1 is independent of SQLite schema v4: a real-source envelope, timestamp, profile, settings, custom exercises (including archives), routines, and completed/active sessions. Selection is parsed as untrusted input: file limit, envelope/version, scalar types/bounds, timestamps, unique identities, snapshots, exercise references, and one-active-session constraint are validated before storage mutation. Unknown fields are dropped; selected demo mode is not restored. An explicit preview/confirmation precedes replacement. All related tables replace in one SQLite transaction, with rollback on any failure. Export/restore refuse demo adapters. Demo seed metadata is not exported.

Native file selection/cache/share use SDK-aware installations of Expo DocumentPicker, FileSystem, and Sharing, verified against official SDK 58 docs and installed declarations. Web uses a local JSON download and file input. These are manual file backups, not cloud sync. SQLite and files are not encrypted.

## Evidence and limits

Unit tests use the memory fake. SQL scripts use the exact adapter on disk, reopen files, simulate legacy versions, and inject migration/restore failures. Chromium exercises actual Expo SQLite WASM, persistence, navigation, inline input, plans, custom archival, progression, backup downloads/file selection, and demo isolation. Exports validate bundling for iOS/Android/web; Doctor checks SDK alignment. None establish iPhone keyboard, VoiceOver, Dynamic Type, force-close timing, share-sheet behavior, or native performance. Those remain in DEVICE_TEST_CHECKLIST.md. The provider still loads workout documents into memory; production-scale histories have not been benchmarked.
