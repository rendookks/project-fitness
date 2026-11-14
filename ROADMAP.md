# Roadmap

## Current build

- Stage 1 — Foundation: completed. Strict TypeScript, ESLint, 2 Jest tests, on-disk SQLite initialization/reopen checks, Expo Doctor 18/18, and iOS/Android/web export all passed. Native phone runtime remains unverified.
- Stage 2 — Core workout loop: completed. Onboarding, searchable/filterable 24-exercise library, persistent active session, set editing/classification/completion/deletion, session saving, history, previous performance. 31 Jest tests, full real-SQLite lifecycle/rollback/reopen checks, DST checks in three timezones, browser journey with actual Expo SQLite reloads, Doctor 18/18, and iOS/Android/web export passed. Physical-device restart remains unverified.
- Stage 3 — Product experience: completed. Premium Today, real-record charts and exercise history, units/settings, confirmed reset, rule-based insights, and informational Fuel/Learn/Recovery. 34 Jest tests, real-SQLite and timezone checks, 3 browser journeys, Doctor 18/18, and iOS/Android/web export passed. Reviewed 390px charts/Today and 320px enlarged-text browser screenshots; stacked the small-screen hero to prevent narrow word wrapping. Native text scaling, keyboard, and founder visual approval remain unverified.
- Stage 4 — Isolated demo mode: completed. Separate named SQLite files, guarded seed initialization, persistent mode selection, visible banner including sheets, deterministic fictional history, independent profiles/units/drafts, and explicit per-database reset. 40 Jest tests, two-file real-SQLite migration/reopen/rollback/isolation checks, 4 browser journeys, Doctor 18/18, and all-platform export passed. Labeled demo browser screenshots are in docs/screenshots. No physical-device validation was performed.

Physical-device validation is pending until the founders test an iPhone.

## Future milestones (not implemented in this build)

Full nutrition tracking; AI-powered food assistance; automatic steps; sleep/activity integrations; adaptive training programs; personalized AI coaching; interactive Fitness Academy; progress experiments; anatomical muscle visualization; social challenges; shareable reports; professional trainer tools; subscriptions; secure backend sync; research into wearable muscle-activity sensors. These require separate product, privacy, and compatibility review.

## Next smallest milestone

Native iPhone acceptance and hardening: run DEVICE_TEST_CHECKLIST.md on the founders’ actual Expo Go version, repair any reproducible keyboard/safe-area/text-scaling/VoiceOver defects, and verify force-close persistence and isolation after saves complete. Acceptance requires the full workout journey and both reset scopes to pass on a phone, with screenshots reviewed by the founders. Keep all current automated gates passing before expanding feature scope.

## V5 premium tracker milestone

- Stage 0: remote SDK 58 base verified; baseline recorded in docs/BASELINE.md. Compatibility fixes address TypeScript 6 ambient types and nullable tab icon colors; SDK 58 lint initialization issue fixed without disabling a check.
- Stage 1: compact inline weight/reps, deliberate completion, advanced set details, exact previous-load add-set defaults, queued patch persistence, iOS keyboard Done accessory. `validate`: 41 unit tests plus SQLite/calendar/demo checks passed; Doctor 20/20; iOS/Android/web export passed; Chromium SQLite workout journey passed. Browser testing caught and fixed a saving-status layout shift that cancelled taps, plus missing web checked-state semantics. iPhone checks pending.
- Stage 2: saved routines with naming, ordered exercises, default sets, reps, optional loads, warm-up classification, duplication, confirmed deletion, and independent session copies. Same-routine exact-gram autofill and resume guard tested. `validate`: 44 unit tests plus on-disk routine reopen and existing SQLite/calendar/demo checks passed; Doctor 20/20; all-platform export passed; routine journey passed in Chromium (135 lb × 8, restart, plan edit, autofill, immutable history). Fixed bounded sheet scrolling found by browser automation. Phone verification pending.
- Stage 3: 150 built-ins, custom creation/edit/search/archive, durable movement snapshots, virtualized library and wrapping filters. `validate`: 47 tests plus real-SQLite custom reopen/archive and legacy populated migration passed; Doctor 20/20 and all-platform exports passed. Custom create/log/edit/archive/history browser journey passed; workout and routine journeys also passed before the final history-label refinement. Physical phone acceptance pending.
