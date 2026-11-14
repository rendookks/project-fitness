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
