import { ExerciseSet, UserProfile, WorkoutSession } from '../src/domain/models';
export const profile: UserProfile = { id: 'local', goal: 'Get stronger', experience: 'Some experience', weeklyTarget: 3, equipment: ['Barbell'], onboardingCompletedAt: '2026-03-04T12:00:00.000Z' };
export const set = (patch: Partial<ExerciseSet> = {}): ExerciseSet => ({ id: 'set-1', kind: 'working', completed: true, reps: 5, weightGrams: 60_000, ...patch });
export const workout = (patch: Partial<WorkoutSession> = {}): WorkoutSession => ({ id: 'workout-1', name: 'Strength session', status: 'completed', startedAt: '2026-03-04T12:00:00.000Z', completedAt: '2026-03-04T13:00:00.000Z', exercises: [{ id: 'exercise-1', exerciseId: 'bench', sets: [set()] }], ...patch });
