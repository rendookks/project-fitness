# Roadmap

## Current milestone — premium workout tracker

Feature branch `v2-workout-tracker`, based on verified `sdk-58-upgrade` (bff649a). All seven implementation groups are delivered; final automated checks and browser screenshot review passed. Physical iPhone acceptance remains pending for this branch. See docs/DELIVERY.md for scope, limitations, and validation evidence.

## V5 premium tracker milestone

- Stage 0: remote SDK 58 base verified; baseline recorded in docs/BASELINE.md. Compatibility fixes address TypeScript 6 ambient types and nullable tab icon colors; SDK 58 lint initialization issue fixed without disabling a check.
- Stage 1: compact inline weight/reps, deliberate completion, advanced set details, exact previous-load add-set defaults, queued patch persistence, iOS keyboard Done accessory. `validate`: 41 unit tests plus SQLite/calendar/demo checks passed; Doctor 20/20; iOS/Android/web export passed; Chromium SQLite workout journey passed. Browser testing caught and fixed a saving-status layout shift that cancelled taps, plus missing web checked-state semantics. iPhone checks pending.
- Stage 2: saved routines with naming, ordered exercises, default sets, reps, optional loads, warm-up classification, duplication, confirmed deletion, and independent session copies. Same-routine exact-gram autofill and resume guard tested. `validate`: 44 unit tests plus on-disk routine reopen and existing SQLite/calendar/demo checks passed; Doctor 20/20; all-platform export passed; routine journey passed in Chromium (135 lb × 8, restart, plan edit, autofill, immutable history). Fixed bounded sheet scrolling found by browser automation. Phone verification pending.
- Stage 3: 150 built-ins, custom creation/edit/search/archive, durable movement snapshots, virtualized library and wrapping filters. `validate`: 47 tests plus real-SQLite custom reopen/archive and legacy populated migration passed; Doctor 20/20 and all-platform exports passed. Custom create/log/edit/archive/history browser journey passed; workout and routine journeys also passed before the final history-label refinement. Physical phone acceptance pending.
- Stage 4: exercise-first Progress with range selection, separate record metrics, comparisons, history paging, recent records, inline and saved-session PR highlights. `validate`: 49 tests and all SQLite/calendar/isolation checks passed; Doctor 20/20; iOS/Android/web export passed; both analytics/unit/reset and 320px/enlarged-text browser journeys passed. No measured 1RM, readiness, or phone-runtime claims.
- Stage 5: transparent rule-based Coach, conservative progression with evidence and insufficient-history handling, bodyweight treatment, optional editable targets in workouts. `validate`: 54 unit tests plus all persistence/timezone/isolation checks passed; Doctor 20/20; all-platform export passed. Browser progression journey completed two routines, inspected evidence, applied a suggested target, edited it, and verified reload persistence. Existing analytics/narrow-screen journeys also passed. No AI endpoint, account, or paid feature added.
- Stage 6: Today prioritizes resume/routine start, primary tabs are Today/Train/Progress/Coach, Settings links secondary previews. `validate`: 54 unit tests and all SQL/calendar/isolation checks passed; Doctor 20/20; all-platform export passed; analytics, narrow-screen navigation, and full demo-mode browser journeys passed (3). Moved informational previews to stack routes after browser checks identified inaccessible hidden-tab URLs. Native visual/accessibility acceptance remains pending.

- Stage 7: real-data v1 backup/validated preview/confirmed transactional restore, rollback and migration fault injection, final inline/keyboard/autofill hardening, documentation, Windows instructions, and ten reviewed browser screenshots. Clean `npm ci`; `validate` with 59 unit tests and all SQLite/calendar/isolation/backup checks; Doctor 20/20; iOS/Android/web export; full browser suite 9/9; strengthened backup check and final targeted browser reruns 3/3 passed. Physical iPhone acceptance remains pending.


## Next — V2.1

1. Physical iPhone acceptance and repair of any native keyboard, accessibility, persistence, or file-sharing defects.
2. Device benchmarks with substantial histories, followed by measured query/pagination improvements.
3. Explicit rep ranges and equipment-aware progression increments.

## Deliberately deferred

Session-to-routine copy-back prompts; optional starter templates; optional notes/RPE; timers; supersets; advanced programming; nutrition; Apple Health; social feeds; cloud accounts/sync; billing; conversational AI. No current screen claims these are working features.

## Prototype history

The original four stages established foundation, the workout loop, dashboards/insights, and isolated demo mode. The last prototype checkpoint had 40 passing unit tests, real-SQLite/calendar/demo checks, and four browser journeys. V5 baseline defects after the SDK 58 upgrade are recorded separately in docs/BASELINE.md. Original decisions remain in DECISIONS.md with explicit supersession notes.
