import { completedWorkouts, workingSets } from './calculations';
import { WorkoutSession } from './models';
import { MAX_WEIGHT_GRAMS } from './units';

export interface ProgressionSuggestion {
  kind: 'insufficient' | 'repeat' | 'add-load' | 'add-rep';
  target: { weightGrams: number; reps: number } | null;
  previous: { weightGrams: number; reps: number } | null;
  evidence: string;
  reason: string;
  sourceWorkoutId?: string;
}
/** Unit-independent, conservative evidence rules. Suggestions never mutate plans or sessions. */
export function suggestProgression(workouts: readonly WorkoutSession[], exerciseId: string, options: { routineId?: string; targetReps?: number } = {}): ProgressionSuggestion {
  const all = completedWorkouts(workouts).filter(w => workingSets(w).some(s => s.exerciseId === exerciseId)).sort((a,b) => b.completedAt!.localeCompare(a.completedAt!));
  const same = options.routineId ? all.filter(w => w.routineId === options.routineId) : [];
  const sessions = same.length ? same : all;
  const last = sessions[0];
  if (!last) return { kind: 'insufficient', target: null, previous: null, evidence: 'No completed working-set history for this movement.', reason: 'Log a comfortable baseline first. Warm-ups, incomplete sets, and active sessions are excluded.' };
  const sets = workingSets(last).filter(s => s.exerciseId === exerciseId).map(s => s.set);
  const first = sets[0]; const previous = { weightGrams: first.weightGrams, reps: first.reps };
  const base: ProgressionSuggestion = { kind: 'repeat', target: previous, previous, sourceWorkoutId: last.id,
    evidence: `${sets.length} completed working sets in ${last.name} · ${new Date(last.completedAt!).toLocaleDateString()}. ${same.length ? 'Using this routine’s history.' : 'Using exercise history.'}`,
    reason: 'Repeat the last first-set target; adjust it yourself if needed.' };
  if (sessions.length < 2) return { ...base, reason: 'Only one qualifying session. Repeat to build comparable evidence.' };
  const goal = options.targetReps;
  if (!Number.isInteger(goal) || !goal || goal < 1 || goal > 12) return { ...base, reason: 'No uniform planned rep goal from 1–12. Repeat your previous sets; set a routine target to assess progression.' };
  const prior = workingSets(sessions[1]).filter(s => s.exerciseId === exerciseId).map(s => s.set);
  const comparable = sets.length >= 2 && prior.length === sets.length && sets.every((s,i) => s.weightGrams === first.weightGrams && prior[i].weightGrams === s.weightGrams && s.reps >= goal && prior[i].reps >= goal);
  if (!comparable) return { ...base, reason: 'The last two sessions do not both meet the same load, set count (at least two), and planned rep goal. Repeat rather than increasing from an outlier.' };
  const evidence = `${base.evidence} Both latest sessions: ${sets.length} working sets at the same load, each reaching the ${goal}-rep planned goal.`;
  if (first.weightGrams === 0) {
    if (first.reps >= 12 || prior[0].reps < first.reps) return { ...base, evidence, reason: 'Keep zero external load. Repeat while building a consistent rep baseline; no body mass or added load is inferred.' };
    return { ...base, kind: 'add-rep', target: { weightGrams: 0, reps: first.reps + 1 }, evidence, reason: 'Consider one extra rep on the first working set, with zero external load. Two comparable sessions met your goal. The remaining sets can repeat.' };
  }
  const increment = Math.min(1000, Math.floor(first.weightGrams * .025 / 100) * 100);
  if (increment < 100 || first.weightGrams + increment > MAX_WEIGHT_GRAMS) return { ...base, evidence, reason: 'No suitable small load increment within the recording bounds. Repeat your previous target.' };
  return { ...base, kind: 'add-load', target: { weightGrams: first.weightGrams + increment, reps: goal }, evidence,
    reason: 'Consider this small first-set load increase (at most 2.5% and 1 kg). Use it only if your equipment allows it and it feels appropriate; otherwise repeat. Remaining sets can stay unchanged.' };
}
