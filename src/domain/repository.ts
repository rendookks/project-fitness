import { exerciseById } from './exercises';
import { AppSettings, ExerciseSet, UserProfile, WorkoutSession } from './models';
import { MAX_WEIGHT_GRAMS } from './units';
import { FitnessStorage } from '../storage/interface';

let sequence = 0;
export function makeId() { return `${Date.now().toString(36)}-${(++sequence).toString(36)}-${Math.random().toString(36).slice(2, 11)}`; }
export function validateProfile(profile: UserProfile) {
  if (!['Build muscle', 'Get stronger', 'Lose fat', 'Build consistency'].includes(profile.goal)
    || !['New to training', 'Some experience', 'Experienced'].includes(profile.experience)
    || !Number.isInteger(profile.weeklyTarget) || profile.weeklyTarget < 1 || profile.weeklyTarget > 7
    || !profile.equipment.length || profile.equipment.some(e => !['Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Cable'].includes(e))
    || !Number.isFinite(Date.parse(profile.onboardingCompletedAt))) throw new Error('Choose your goal, experience, equipment, and a weekly target from 1–7.');
}
export function validateSet(set: ExerciseSet) {
  if (!Number.isInteger(set.weightGrams) || set.weightGrams < 0 || set.weightGrams > MAX_WEIGHT_GRAMS
    || !Number.isInteger(set.reps) || set.reps < 1 || set.reps > 999
    || !['working', 'warmup'].includes(set.kind) || typeof set.completed !== 'boolean') throw new Error('Sets need 1–999 reps and a nonnegative whole-gram weight up to 2,000 kg.');
}
/** Serializes read/modify/write, making repeated create/finish operations safe. */
export class WorkoutRepository {
  private tail: Promise<unknown> = Promise.resolve();
  constructor(readonly storage: FitnessStorage, private readonly now = () => new Date(), private readonly id = makeId) {}
  private queue<T>(action: () => Promise<T>): Promise<T> {
    const result = this.tail.then(action); this.tail = result.catch(() => undefined); return result;
  }
  async load() {
    await this.tail;
    const [profile, settings, workouts] = await Promise.all([this.storage.getProfile(), this.storage.getSettings(), this.storage.getWorkouts()]);
    return { profile, settings, workouts };
  }
  onboard(profile: UserProfile, settings: AppSettings) {
    return this.queue(async () => {
      validateProfile(profile); if (!['kg', 'lb'].includes(settings.unit)) throw new Error('Choose kg or lb.');
      await this.storage.saveOnboarding(profile, settings);
    });
  }
  createWorkout(name: string): Promise<WorkoutSession> {
    return this.queue(async () => {
      const all = await this.storage.getWorkouts();
      const active = all.find(w => w.status === 'active'); if (active) return active;
      const cleaned = name.trim(); if (!cleaned || cleaned.length > 80) throw new Error('Give your workout a name of 1–80 characters.');
      const workout: WorkoutSession = { id: this.id(), name: cleaned, status: 'active', startedAt: this.now().toISOString(), completedAt: null, exercises: [] };
      await this.storage.saveWorkout(workout); return workout;
    });
  }
  private mutate(workoutId: string, action: (workout: WorkoutSession) => void): Promise<WorkoutSession> {
    return this.queue(async () => {
      const workout = (await this.storage.getWorkouts()).find(w => w.id === workoutId);
      if (!workout) throw new Error('This workout no longer exists.');
      if (workout.status !== 'active') throw new Error('Saved workouts are read-only.');
      action(workout); await this.storage.saveWorkout(workout); return workout;
    });
  }
  renameWorkout(id: string, name: string) {
    return this.mutate(id, w => { if (!name.trim() || name.trim().length > 80) throw new Error('Use a workout name of 1–80 characters.'); w.name = name.trim(); });
  }
  addExercise(id: string, exerciseId: string) {
    return this.mutate(id, w => { exerciseById(exerciseId); if (!w.exercises.some(e => e.exerciseId === exerciseId)) w.exercises.push({ id: this.id(), exerciseId, sets: [] }); });
  }
  removeExercise(id: string, exerciseInstanceId: string) {
    return this.mutate(id, w => { w.exercises = w.exercises.filter(e => e.id !== exerciseInstanceId); });
  }
  addSet(id: string, exerciseInstanceId: string, set: ExerciseSet) {
    return this.mutate(id, w => {
      validateSet(set);
      const ex = w.exercises.find(e => e.id === exerciseInstanceId); if (!ex) throw new Error('Exercise not found.');
      if (!ex.sets.some(s => s.id === set.id)) ex.sets.push({ ...set });
    });
  }
  editSet(id: string, exerciseInstanceId: string, set: ExerciseSet) {
    return this.mutate(id, w => {
      validateSet(set);
      const ex = w.exercises.find(e => e.id === exerciseInstanceId); const index = ex?.sets.findIndex(s => s.id === set.id) ?? -1;
      if (!ex || index < 0) throw new Error('Set not found.'); ex.sets[index] = { ...set };
    });
  }
  updateSet(id: string, exerciseInstanceId: string, setId: string, patch: Partial<ExerciseSet>) {
    return this.mutate(id, w => {
      const ex = w.exercises.find(e => e.id === exerciseInstanceId);
      const index = ex?.sets.findIndex(s => s.id === setId) ?? -1;
      if (!ex || index < 0) throw new Error('Set not found.');
      const next = { ...ex.sets[index], ...patch, id: setId };
      validateSet(next); ex.sets[index] = next;
    });
  }
  removeSet(id: string, exerciseInstanceId: string, setId: string) {
    return this.mutate(id, w => { const ex = w.exercises.find(e => e.id === exerciseInstanceId); if (!ex) throw new Error('Exercise not found.'); ex.sets = ex.sets.filter(s => s.id !== setId); });
  }
  finishWorkout(id: string): Promise<WorkoutSession> {
    return this.queue(async () => {
      const workout = (await this.storage.getWorkouts()).find(w => w.id === id);
      if (!workout) throw new Error('Workout not found.');
      if (workout.status === 'completed') return workout;
      if (!workout.exercises.some(e => e.sets.some(s => s.completed))) throw new Error('Complete at least one set before finishing.');
      workout.status = 'completed'; workout.completedAt = this.now().toISOString();
      await this.storage.saveWorkout(workout); return workout;
    });
  }
  deleteWorkout(id: string) { return this.queue(() => this.storage.deleteWorkout(id)); }
  setUnit(unit: AppSettings['unit']) {
    return this.queue(async () => { if (!['kg', 'lb'].includes(unit)) throw new Error('Choose kg or lb.'); const current = await this.storage.getSettings(); await this.storage.saveSettings({ ...current, unit }); });
  }
  reset() { return this.queue(() => this.storage.reset()); }
}
