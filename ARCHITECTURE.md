# Architecture

Expo SDK 54, Expo Router, strict TypeScript. Routes in `app/` compose features from `src/features/`. Theme and shared controls live in `src/theme/` and `src/ui/`; pure domain types/calculations live in `src/domain/`.

Storage boundary: `FitnessStorage` provides profile, settings, and workout documents. The Expo SQLite adapter delegates to a small SQL driver so the same SQL implementation can also be verified against a real SQLite engine outside Expo. Ordinary repository unit tests use a deterministic in-memory fake; those tests alone do not establish native SQLite behavior.

Schema v1: singleton `profile`, singleton `settings`, and `workouts` with stable ID, indexed status, UTC start/completion timestamps, and a typed JSON payload containing workout exercises and sets. Each complete snapshot is saved atomically. `PRAGMA user_version` advances in a transaction; future schema versions are rejected without clearing data. Parameterized writes handle user values. Initialization completes before use. Data is local and **not encrypted**.

Canonical load is nonnegative integer grams. One pound is 453.59237 grams. Input conversion rounds to the nearest whole gram; display rounds to two decimals and never writes back merely because units change. Estimated 1RM uses actual load for one rep, Epley for 2–12, and no result above 12 or at zero external load. Only completed working sets in explicitly completed workouts count for records, volume, and working-set totals. Weeks use device-local Monday midnight through calendar arithmetic; timestamps are stored as UTC instants.
