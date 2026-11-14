# Architecture

Expo SDK 54, Expo Router, strict TypeScript. Routes in `app/` compose features from `src/features/`. Theme and shared controls live in `src/theme/` and `src/ui/`; pure domain types/calculations live in `src/domain/`.

Storage boundary: `FitnessStorage` provides profile, settings, and workout documents. The Expo SQLite adapter delegates to a small SQL driver so the same SQL implementation can also be verified against a real SQLite engine outside Expo. Ordinary repository unit tests use a deterministic in-memory fake; those tests alone do not establish native SQLite behavior.

Schema v1 (preserved by v2): singleton `profile`, singleton `settings`, and `workouts` with stable ID, indexed status, UTC start/completion timestamps, and a typed JSON payload containing workout exercises and sets. Each complete snapshot is saved atomically. `PRAGMA user_version` advances in a transaction; future schema versions are rejected without clearing data. Parameterized writes handle user values. Initialization completes before use. Data is local and **not encrypted**.

Canonical load is nonnegative integer grams. One pound is 453.59237 grams. Input conversion rounds to the nearest whole gram; display rounds to two decimals and never writes back merely because units change. Estimated 1RM uses actual load for one rep, Epley for 2–12, and no result above 12 or at zero external load. Only completed working sets in explicitly completed workouts count for records, volume, and working-set totals. Weeks use device-local Monday midnight through calendar arithmetic; timestamps are stored as UTC instants.

`WorkoutRepository` serializes mutations and validates input, guards a single active workout, and makes creation/finish and repeated set IDs idempotent. `AppProvider` waits for storage initialization, guards simultaneous UI saves, and refreshes its snapshot only after persistence succeeds. Onboarding profile/settings and resets use transactions. Set text edits are explicit saves; unchanged displayed weights retain exact canonical grams. Completed sessions are read-only and can be deleted with confirmation.

`tests/` uses the memory fake for deterministic business tests. `scripts/verify-sqlite.ts` uses Node 24 SQLite on disk with the exact adapter SQL, including reopen and injected-transaction failure. `scripts/verify-timezones.cjs` runs calendar checks with independent timezone processes. `e2e/` uses Chromium and Expo SQLite WASM against exported web assets, with real persistence across reloads. Browser screenshots are review evidence, not native-phone validation.

Charts use Expo-compatible `react-native-svg` plus native views with textual summaries. Four-week bars label actual counts/targets; visual fills can cap but numerical percentages never do. Exercise charts show the highest qualifying Estimated 1RM per session, up to six points. Insights are deterministic observations with evidence, never generated chat. Fuel/Learn/Recovery do not collect records.

Schema v2 adds `metadata(key, value)` for the demo seed version. `project_fitness.db` and `project_fitness_demo.db` use the same schema and never share fitness rows. Adapter identities reject seeding in real storage. `DataModeController` verifies the destination before persisting a selected-mode preference in real settings, then exposes the corresponding repository and data snapshot. Each database retains its own profile, unit preference, and unfinished session. Atomic demo replacement resets only fictional records; the real reset restarts real onboarding. Sample dates remain unchanged after the initial seed until an explicit demo reset.

## Premium tracker additions

SDK 58 supersedes the original SDK 54 target above. TypeScript remains strict on Node 24. Inline set fields keep local drafts and save validated patches on blur/Done; the completion action saves current numeric fields and the completion flag together. A provider queue prevents concurrent UI saves from being discarded, while repository mutations remain serialized. Saving status uses an overlay to avoid moving controls during pointer interactions.

Schema v3 adds `routines(id, payload)` transactionally. A plan holds ordered exercise identities and planned sets (optional integer-gram load, target reps, classification). Starting copies the plan into an independent active session, adds `routineId`, and prefills qualifying previous working sets with exact grams. Legacy session payloads remain readable. No operation edits completed workout snapshots when a routine changes.
