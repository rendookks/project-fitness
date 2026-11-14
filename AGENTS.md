# Engineering instructions

- Keep Expo SDK 58 and Expo Go compatibility; use Expo's version-aware installer.
- Keep TypeScript strict and route components thin. Domain logic must not depend on React Native.
- Store weight as integer grams; change units only at input/display boundaries.
- Count only completed working sets in completed workouts. Preserve the locked PR and Epley rules documented in ARCHITECTURE.md.
- All user records stay local. Never silently delete data after an error.
- Run `npm run validate`, `npm run doctor`, and `npm run export:check` at stage checkpoints, update ROADMAP.md, then commit. Preserve history and unrelated work.
- Distinguish fake storage tests, real SQL integration, browser runtime checks, and phone verification in reports.
- The V5.0 master brief authorizes the premium tracker milestone, including routines, custom exercises, progression, navigation, and local backup/restore. Keep later social, billing, and generative AI work deferred.
