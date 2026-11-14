# V5 premium workout tracker delivery

## Source and delivery

Branch: `v2-workout-tracker`, created directly from the verified remote SDK 58 commit `bff649a5d544599856e28fe270173a20b321b5f5`. The final delivery SHA is reported in the chat and available through `git rev-parse HEAD`. Milestones are separate sequential commits. Normal push only; neither `main` nor `work` was modified or merged.

Runtime baseline: Node 24.22.1, Expo SDK 58, React Native 0.88.1. The existing Expo Router/TypeScript/SQLite app and design tokens are retained. No Apple identifiers changed.

## Implemented

| Area | Delivered behavior |
| --- | --- |
| Active workout | Compact inline load/reps, deliberate completion, editing completed sets, advanced classification/deletion, add/remove exercises, add sets, rename, confirmed finish/discard, resume after restart. Validated queued patches prevent dropped saves and preserve exact grams. Invalid drafts block Finish. |
| Previous performance | Copies completed working sets, preferring the same routine; source/date shown; exact underlying grams retained; autofill never completes a set. Planned warm-ups keep their own values and do not offset working-set indexing. |
| Routines | Create, name/rename, choose exercises, per-set targets/classification/optional loads, reorder/remove, duplicate, confirmed delete, start independent sessions. Today offers direct start/resume. History never changes when a plan/session changes. |
| Library | 150 coherent text-only built-ins preserving every original exercise ID; search, wrapping filters, virtualized rows, custom create/edit/archive. Snapshots keep completed custom-exercise details readable. Archives retain identity and existing routine/history references. |
| Strength progress | Logged-exercise search, independent all-time heaviest-load and Estimated 1RM records, previous-session load comparison, 4/12-week/all-time charts, load/rep history paging, recent records, restrained inline/completion PR highlights. First performances are baselines. |
| Coach | Deterministic progression with source evidence, insufficient-data explanations, conservative optional first-set targets, zero-load treatment, explicit application, and editable values. No LLM endpoint or AI key. |
| Navigation/design | Today, Train, Progress, Coach; Settings accessible from Today. Informational Fuel/Learn/Recovery remain secondary. Existing obsidian, iris, aqua, champagne, typography, and icon system retained. Bounded sheets, wrapping controls, keyboard avoidance, single iOS Done accessory, and honest empty states. |
| Backup/restore | Real-data JSON v1 export, native iOS sharing/file selection, browser download/file selection, validated preview, explicit replacement confirmation, atomic multi-table replacement/rollback. Profile, units, custom/archived exercises, routines, history, and active session included. Demo export/restore blocked. |
| Data isolation | Separate real/demo SQLite files, independent drafts/preferences/plans/custom movements, preserved seed idempotence and reset scopes. No hidden database reset on errors. |

## Architecture and preservation

Schema v3 adds routine documents; v4 adds custom-exercise documents. Both are transactional additive migrations and leave existing profile/settings/workout payloads intact. Workout documents retain stable identities, canonical integer-gram loads, old exercise references, and unfinished sessions. New entries snapshot movement details. The database unique index and repository guard maintain one active session per file.

The storage boundary, serialized repository, pure calculations/strength/progression modules, thin routes, and UI drafts remain separate. On-device operations are local and offline. Epley boundaries remain 1–12 reps with positive external load; warm-ups/incomplete/draft sets do not generate strength records. No physiological conclusions are inferred.

Backup format v1 is independent of schema version. Validation precedes mutation; the replacement transaction covers all relevant real tables. Real SQL failure injection tests rollback after destructive statements and related writes. Corrupt files, unsupported source/version, duplicate IDs, bad numeric data/references, and multiple active sessions fail safely. Settings restore selects real mode. Demo records/seed metadata are excluded.

## Verification

Baseline results are in `docs/BASELINE.md`. The inherited SDK 58 branch initially failed TypeScript and lint; these were corrected without disabling checks.

Final results on Node 24:

- `npm ci`: passed from the committed dependency lockfile.
- `npm run validate`: passed — strict TypeScript, lint, **59 unit tests in 10 suites**, real-SQLite lifecycle/reopen, calendar checks in UTC/Chicago/Berlin, two-file demo isolation, and migration/backup rollback integration.
- `npm run doctor`: **20/20 checks passed**, with no checks disabled.
- `npm run export:check -- --max-workers 2`: **iOS, Android, and web passed**.
- Full Chromium `npm run test:e2e`: **9/9 journeys passed** (2.7 minutes). The backup case was then strengthened to restore an edited active set through in-app navigation and reload; it passed. After final routine-control presentation changes, **3/3 targeted backup/routine/screenshot journeys passed** (48.9 seconds).
- Final `git diff --check`: passed. All ten updated browser screenshot files were reviewed; loading-frame captures were replaced and crowded Progress/routine controls were compacted.
- **Physical iPhone verification: pending**, including native file APIs and accessibility.

Commands:

```sh
npm ci
npm run validate
npm run doctor
npm run export:check -- --max-workers 2
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Cloud-only environment variables use a writable npm cache/Expo CLI home in `/tmp`; Doctor honors the inherited proxy using `NODE_USE_ENV_PROXY=1`. Browser tests use actual Expo SQLite WASM, not the memory fake. SQL tests use the exact adapter with Node 24 SQLite on disk, not the iOS module. No checks were disabled.

## Known limitations and deferred scope

- Physical iPhone acceptance is pending for this feature branch, including Expo Go launch with the added file APIs, keyboard/Done behavior, native force-close persistence, VoiceOver, Dynamic Type, iOS share sheet and document providers, and final visual approval. Founder-reported launch of the SDK 58 base is separate evidence.
- Workout documents still load into memory. Large personal histories and native responsiveness have not been benchmarked. The library is virtualized and displayed exercise history is paged; this is not a complete query/pagination redesign.
- Backups are manual, unencrypted, and limited to 25 MB. Dismissing sharing does not prove a file was saved. This is not cloud sync or automatic remote protection.
- Routines are edited explicitly; a session does not offer a copy-changes-back prompt. Optional starter templates and optional notes/RPE are deferred. Progression currently requires uniform planned rep goals; equipment-aware increments/rep ranges are future work.
- No timers, supersets, social feed, nutrition tracking, Health integration, accounts, paywalls, subscriptions, or conversational AI were added.
- Browser screenshots/checks do not establish iPhone runtime correctness or iOS accessibility behavior. The scaffold launcher icon remains pending permanent branding.

## Screenshots and phone acceptance

See `docs/screenshots/README.md` for updated Today, Train, active workout, Progress/chart, Coach, routine editor, library, and empty-state browser captures. Populated captures explicitly use fictional demo records. `DEVICE_TEST_CHECKLIST.md` provides the full physical iPhone acceptance procedure, all pending.

For Windows/Expo Go launch, use the exact PowerShell commands in README.md. No global native toolchain or new account is required.

## V2.1 recommendations

1. Complete physical iPhone acceptance first, especially upgraded user databases, keyboard/one-tap logging, accessibility, force-close persistence, and Files backup/restore.
2. Benchmark substantial histories on a real iPhone; add repository pagination/query summaries based on measured bottlenecks while preserving snapshot/migration integrity.
3. Add explicit rep ranges and equipment-aware progression increments, building on validated comparable performance rather than expanding into generative coaching or social features.
