import { ExerciseSet, WorkoutSession } from './models';

export function estimated1RM(weightGrams: number, reps: number): number | null {
  if (!Number.isFinite(weightGrams) || weightGrams <= 0 || !Number.isInteger(reps) || reps < 1 || reps > 12) return null;
  return reps === 1 ? weightGrams : weightGrams * (30 + reps) / 30;
}
export function completedWorkouts(workouts: readonly WorkoutSession[]) {
  return workouts.filter(w => w.status === 'completed' && w.completedAt !== null);
}
export function workingSets(workout: WorkoutSession): { exerciseId: string; set: ExerciseSet }[] {
  if (workout.status !== 'completed' || !workout.completedAt) return [];
  return workout.exercises.flatMap(ex => ex.sets.filter(s => s.completed && s.kind === 'working').map(set => ({ exerciseId: ex.exerciseId, set })));
}
export function workoutVolume(workout: WorkoutSession): number {
  return workingSets(workout).reduce((sum, { set }) => sum + set.weightGrams * set.reps, 0);
}
export function personalRecord(workouts: readonly WorkoutSession[], exerciseId: string) {
  const sets = workouts.flatMap(workingSets).filter(s => s.exerciseId === exerciseId).map(s => s.set);
  const estimates = sets.map(s => estimated1RM(s.weightGrams, s.reps)).filter((n): n is number => n !== null);
  return {
    heaviestGrams: sets.length ? Math.max(...sets.map(s => s.weightGrams)) : null,
    estimated1RMGrams: estimates.length ? Math.max(...estimates) : null,
  };
}
export function previousPerformance(workouts: readonly WorkoutSession[], exerciseId: string) {
  const previous = completedWorkouts(workouts).filter(w => workingSets(w).some(s => s.exerciseId === exerciseId))
    .sort((a,b) => b.completedAt!.localeCompare(a.completedAt!))[0];
  if (!previous) return null;
  return { date: previous.completedAt!, sets: workingSets(previous).filter(s => s.exerciseId === exerciseId).map(s => s.set) };
}
export function startOfWeek(date: Date): Date {
  const monday = new Date(date);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
  return monday;
}
export function shiftWeeks(date: Date, weeks: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + weeks * 7);
  return shifted;
}
export function weeklyConsistency(workouts: readonly WorkoutSession[], weeklyTarget: number, now = new Date()) {
  if (!Number.isInteger(weeklyTarget) || weeklyTarget <= 0) throw new Error('Weekly target must be a positive whole number.');
  const current = startOfWeek(now);
  const weeks = [-3, -2, -1, 0].map(offset => {
    const start = shiftWeeks(current, offset); const end = shiftWeeks(start, 1);
    const count = completedWorkouts(workouts).filter(w => {
      const instant = new Date(w.completedAt!); return instant >= start && instant < end;
    }).length;
    return { start, end, count, target: weeklyTarget, percent: count / weeklyTarget * 100 };
  });
  const total = weeks.reduce((sum, w) => sum + w.count, 0);
  return { weeks, total, percent: total / (4 * weeklyTarget) * 100 };
}
