# SDK 58 baseline

Verified remote `sdk-58-upgrade` at `bff649a5d544599856e28fe270173a20b321b5f5` before implementation. Feature branch: `v2-workout-tracker`. Node 24.22.1, npm 11.9.0. Existing iPhone launch is founder-reported; this environment has no physical device.

- `npm ci`: passed.
- `npm run validate`: failed at TypeScript. SDK 58 tab icon colors include null; TypeScript 6 needs explicit Node/Jest ambient types.
- `npm run lint` independently: failed at synchronous setState in initialization effect.
- `npm test -- --runInBand`: 40 tests passed in five suites.
- `npm run test:sqlite`: passed, exact SQL adapter on disk.
- `npm run test:calendar`: passed in UTC, America/Chicago, Europe/Berlin.
- `npm run test:demo-sqlite`: passed, two-file migration/rollback/isolation.
- `npm run doctor`: 20/20 passed after using a writable npm cache.
- `npm run export:check`: iOS, Android, web export passed. No device runtime claim.
- Existing demo screenshots reviewed as the visual baseline. Baseline browser suite not run before UI changes.

Cloud CLI commands require `npm_config_cache=/tmp/project-fitness-npm` and `__UNSAFE_EXPO_HOME_DIRECTORY=/tmp/project-fitness-expo`; Doctor additionally uses `NODE_USE_ENV_PROXY=1`. These are development environment settings, not app requirements.
