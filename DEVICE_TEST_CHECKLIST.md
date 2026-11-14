# iPhone acceptance checklist — all pending

These are required manual checks. Cloud exports, Node SQLite checks, browser tests, and browser screenshots do not mark any item as passed.

- [ ] Verify the installed Expo Go can open SDK 54. If it cannot, record the exact mismatch; do not silently upgrade this repository.
- [ ] Launch using `npm ci` and `npx expo start --go --lan` on a laptop with Node 24 LTS. Connect phone and laptop to the same Wi-Fi, scan the QR with iPhone Camera, and open in Expo Go.
- [ ] Finish all three onboarding screens; verify goal, target, equipment, experience, and kg/lb preferences. Close/reopen and confirm onboarding does not repeat.
- [ ] Create and rename a workout, search/filter exercises, add exercises, and remove one with cancellation and confirmation.
- [ ] Add/edit/delete sets; record decimals and repetitions; distinguish warm-ups/working sets; toggle completion. Cancel a dirty edit and test discarding it. Verify large targets, VoiceOver labels, text scaling, focus, and small-screen wrapping.
- [ ] Verify decimal-pad/number-pad behavior, keyboard avoidance, scrolling, and Save/Cancel visibility. Comma decimal entry should work; malformed input should show a clear error.
- [ ] Force-close during an unfinished session **after Saving locally has cleared**. Reopen and confirm name, exercise order, every saved set, kind, reps, exact displayed load, and completion state.
- [ ] Finish/save the workout; check history details and previous performance in a new session. Incomplete and warm-up sets must stay out of working volume and records.
- [ ] Check Progress totals, local Monday week boundaries, consistency above 100%, heaviest weight, and Estimated 1RM. Try 1 rep, 12 reps, 13 reps, and a bodyweight set with 0 external load.
- [ ] Switch kg/lb repeatedly, reopen an unchanged set, edit reps only, and confirm original load remains stable after switching back. Display rounds to 0.01 units; storage is whole grams.
- [ ] Open Rule-based Insights, Fuel, Learn, and Recovery. Verify honest labels and navigation. No screen should imply connected health data or generated AI.
- [ ] Enable demo mode with a real saved workout and a real active session. Confirm the DEMO MODE banner throughout screens and sheets. Edit/create/delete demo records, restart, return to real, and verify both real sessions are untouched.
- [ ] Cancel demo reset; verify edits remain. Confirm demo reset; verify 11 fictional sessions return exactly once and real records remain intact. Restart/toggle repeatedly; verify no duplicates.
- [ ] In real mode, cancel reset, then confirm real reset using disposable records. Verify onboarding restarts and demo data remains independent.
- [ ] Review safe areas, tab bar/home-indicator spacing, contrast, chart labels, long exercise names, loading/error/empty states, accessibility text scaling, and visual appearance on phone.
- [ ] Review interaction/animation smoothness on the actual device. No frame-rate benchmark or final founder approval is claimed.

Work entered only in an editor and not explicitly saved is intentionally not committed. Do not terminate the app while it says Saving locally if you expect that action to have completed.
