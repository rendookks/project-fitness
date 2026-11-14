import { estimated1RM, personalRecord, workingSets } from './calculations';
import { ExerciseSet, WorkoutSession } from './models';

export function setRecordLabels(set: ExerciseSet, workouts: readonly WorkoutSession[], exerciseId: string) {
  if (!set.completed || set.kind !== 'working') return [];
  const previous = personalRecord(workouts, exerciseId);
  const estimate = estimated1RM(set.weightGrams, set.reps);
  const labels: string[] = [];
  if (previous.heaviestGrams !== null && set.weightGrams > previous.heaviestGrams) labels.push('Heaviest load PR');
  if (previous.estimated1RMGrams !== null && estimate !== null && estimate > previous.estimated1RMGrams) labels.push('Estimated 1RM PR');
  return labels;
}
export function workoutRecords(workouts: readonly WorkoutSession[], current: WorkoutSession) {
  if (current.status !== 'completed' || !current.completedAt) return [];
  const previous = workouts.filter(w => w.id !== current.id && w.status === 'completed' && w.completedAt && w.completedAt < current.completedAt!);
  return [...new Set(workingSets(current).map(s => s.exerciseId))].flatMap(exerciseId => {
    const before = personalRecord(previous, exerciseId); const now = personalRecord([current], exerciseId);
    const events: { exerciseId: string; metric: 'Heaviest load' | 'Estimated 1RM'; grams: number; previousGrams: number }[] = [];
    if (before.heaviestGrams !== null && now.heaviestGrams !== null && now.heaviestGrams > before.heaviestGrams) events.push({ exerciseId, metric: 'Heaviest load', grams: now.heaviestGrams, previousGrams: before.heaviestGrams });
    if (before.estimated1RMGrams !== null && now.estimated1RMGrams !== null && now.estimated1RMGrams > before.estimated1RMGrams) events.push({ exerciseId, metric: 'Estimated 1RM', grams: now.estimated1RMGrams, previousGrams: before.estimated1RMGrams });
    return events;
  });
}
