import { AppSettings, Exercise, Routine, UserProfile, WorkoutSession } from '../domain/models';
import { DatabaseKind, DemoSeed, FitnessStorage } from './interface';

function copy<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
/** Test double only; not used as an application persistence fallback. */
export class MemoryStorage implements FitnessStorage {
  private seeded = false;
  constructor(readonly kind: DatabaseKind = 'real') {}
  async initializeDemo(seed: DemoSeed, replace = false) {
    if (this.kind !== 'demo') throw new Error('Demo seeding is forbidden in the real database.');
    if (this.seeded && !replace) return;
    if (replace) await this.reset();
    this.profile = copy(seed.profile); this.settings = copy(seed.settings);
    for (const workout of seed.workouts) this.workouts.set(workout.id, copy(workout));
    this.seeded = true;
  }
  private profile: UserProfile | null = null;
  private settings: AppSettings = { unit: 'kg' };
  private customExercises = new Map<string, Exercise>();
  private routines = new Map<string, Routine>();
  private workouts = new Map<string, WorkoutSession>();
  async saveOnboarding(profile: UserProfile, settings: AppSettings) { this.profile = copy(profile); this.settings = copy(settings); }
  async getProfile() { return copy(this.profile); }
  async saveProfile(profile: UserProfile) { this.profile = copy(profile); }
  async getSettings() { return copy(this.settings); }
  async saveSettings(settings: AppSettings) { this.settings = copy(settings); }
  async getWorkouts() { return copy([...this.workouts.values()].sort((a,b) => b.startedAt.localeCompare(a.startedAt))); }
  async saveWorkout(workout: WorkoutSession) {
    if (workout.status === 'active' && [...this.workouts.values()].some(w => w.status === 'active' && w.id !== workout.id)) {
      throw new Error('Finish or resume the active workout first.');
    }
    this.workouts.set(workout.id, copy(workout));
  }
  async deleteWorkout(id: string) { this.workouts.delete(id); }
  async getCustomExercises() { return copy([...this.customExercises.values()]); }
  async saveCustomExercise(exercise: Exercise) { this.customExercises.set(exercise.id, copy(exercise)); }
  async getRoutines() { return copy([...this.routines.values()]); }
  async saveRoutine(routine: Routine) { this.routines.set(routine.id, copy(routine)); }
  async deleteRoutine(id: string) { this.routines.delete(id); }
  async reset() { this.customExercises.clear(); this.routines.clear(); this.profile = null; this.settings = { unit: 'kg' }; this.workouts.clear(); this.seeded = false; }
}
