# Physical iPhone acceptance — pending on this feature branch

Cloud export, Doctor, real SQL scripts, Chromium, and browser screenshots do not mark native checks passed. The founders reported an SDK 58 Expo Go launch before the feature work; this branch has not been exercised on a physical iPhone by this agent.

Record tester, date, iPhone model/iOS version, Expo Go version, branch/SHA, and screenshots. Use disposable real test records for destructive confirmation tests. Save a backup before testing resets/restores.

- [ ] On Windows with Node 24, follow README's `v2-workout-tracker` instructions, run `npm ci`, and launch `npx expo start --go --lan`. Verify installed Expo Go supports SDK 58 and scan using iPhone Camera.
- [ ] Open an existing installation with saved real history, profile, settings, and an unfinished session. Verify all survive the additive v3/v4 upgrade; check original exercise identities and exact loads. Never reset to resolve an error.
- [ ] Complete onboarding in a new installation; reopen and verify preferences persist. Reach Settings from Today.
- [ ] Create **Push Day** with **Barbell Bench Press**, two working sets, 8 target reps, and a planned 135 lb load. Save, rename, reorder exercises, duplicate, cancel deletion, and confirm deletion of only the duplicate.
- [ ] Start Push Day from Today in one tap. Edit 135 to 140 lb and reps inline, then complete with one deliberate tap. Confirm correct check state and no dropped tap when a field blurs. Edit a completed set without opening a mandatory modal.
- [ ] Enter blank, malformed, negative, fractional reps, comma decimals, 0 external load, and maximum values. Invalid drafts must show errors and block finishing; zero external load must remain valid. Correct values and save normally.
- [ ] On decimal-pad/number-pad, verify Done, active-field visibility, scrolling, keyboard avoidance, and reachable controls. Tap set number for working/warm-up details and confirmed deletion. Verify warm-ups remain in history without creating records.
- [ ] Add/remove an exercise, add sets, rename the session, cancel/confirm discard, and cancel/confirm finish. Ensure no accidental workout finish and no duplicate records from rapid taps.
- [ ] Leave/reopen a session, navigate away/back, background the app, and force-close **after Saving locally clears**. Verify order, classification, exact load, reps, completion, and name resume correctly. Repeat in both real and demo mode.
- [ ] Finish Push Day; verify history/volume and separate load/Estimated 1RM records. Start it again; previous completed working sets should prefill as incomplete. Warm-ups must not offset working-set autofill.
- [ ] Edit a routine and a new session; verify completed history is unchanged. Switching kg/lb repeatedly and editing only reps must retain exact underlying load. Planned loads must also stay stable.
- [ ] Create a custom movement, search/filter it, add it to a routine/session, finish, then rename and archive it. Original session details must remain readable and existing plans usable.
- [ ] Check Progress ranges, chart units/dates, paged history, previous-session comparisons, genuine independent PRs, and empty/bodyweight states. Test 1, 12, and 13 reps; an estimate must not appear for zero load or above 12 reps.
- [ ] Check Coach with zero/one/two sessions and explicit routine goals. Two comparable working-set sessions may support a small target; warm-ups/outliers must not. Inspect evidence, apply a target, edit it, and verify it stays incomplete until deliberately checked. No readiness/medical/AI claims.
- [ ] Confirm exactly four primary tabs: Today, Train, Progress, Coach. Reach Fuel/Learn/Recovery previews through Settings and return. Verify these are informational.
- [ ] With a real completed workout and an active session, enable demo. Check the DEMO MODE banner on screens/sheets, independent plans/custom movements/units/drafts, persistence of demo edits, and unchanged real records after switching back.
- [ ] Cancel and confirm demo reset using disposable demo edits; verify exactly 11 fictional samples return once and real data is unaffected. Cancel and confirm real reset only after backing up; verify onboarding restarts and demo data survives.
- [ ] Export real data via iOS share sheet → **Save to Files**. Verify an actual JSON file exists. Cancel sharing once and confirm the app does not claim a file was saved. Demo mode must offer no ordinary export/restore action.
- [ ] Choose the saved file. Review counts/units/date/active-session replacement notice; cancel and verify no changes. Confirm replacement and verify profile, movements, routines, history, exact grams, and active session survive restart.
- [ ] Choose malformed, unsupported-version, wrong-source, and oversized backups; verify a useful failure and unchanged data. Inspect behavior if sharing/document provider is unavailable or canceled.
- [ ] Review 390px/smaller iPhones, safe areas/home indicator, long names, large Dynamic Type, contrast, VoiceOver labels/checked state, reduced motion, focus, and keyboard controls. Browser enlarged text is not native Dynamic Type.
- [ ] Review scrolling and mutation responsiveness with a substantial real history. No phone performance benchmark or final founder visual approval is claimed.

Valid inline edits persist on blur, keyboard Done, or completion. Invalid/unsaved text is not committed. Wait for persistence to finish before expecting termination to retain an action.
