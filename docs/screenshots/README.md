# UI evidence

The `v2-*` files are Chromium captures at 390 × 844 CSS pixels using actual Expo SQLite WASM. The screenshot journey is `e2e/screenshots.spec.ts`. They are browser evidence, not native iPhone screenshots. Populated screens use a separate fictional demo database and display the DEMO MODE banner; empty states use a new real database with no fabricated workouts.

| View | File |
| --- | --- |
| Today, saved-routine start | [v2-today-web.png](v2-today-web.png) |
| Train, routine management | [v2-train-web.png](v2-train-web.png) |
| Active inline logging | [v2-active-workout-web.png](v2-active-workout-web.png) |
| Routine editor | [v2-routine-web.png](v2-routine-web.png) |
| Searchable library | [v2-exercise-library-web.png](v2-exercise-library-web.png) |
| Progress overview | [v2-progress-web.png](v2-progress-web.png) |
| Strength chart/comparison | [v2-progress-chart-web.png](v2-progress-chart-web.png) |
| Coach with evidence | [v2-coach-web.png](v2-coach-web.png) |
| Empty Today | [v2-empty-today-web.png](v2-empty-today-web.png) |
| Empty Progress | [v2-empty-progress-web.png](v2-empty-progress-web.png) |

The routine editor and library scroll; the chart capture shows a scrolled position. Final visual review checks content has loaded, essential controls are reachable, filters and labels are not clipped, and the data hierarchy is legible. The 320px enlarged-text browser journey produces supplementary captures under ignored `test-results/`; it does not establish iOS Dynamic Type behavior. Physical safe areas, keyboard, VoiceOver, native text scaling, and founder approval remain pending in DEVICE_TEST_CHECKLIST.md.

`demo-today-web.png` and `demo-progress-web.png` are retained historical prototype screenshots, not the current UI.
