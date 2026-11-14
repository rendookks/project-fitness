import { AppSettings, UserProfile, WorkoutSession } from '../domain/models';
import { FitnessStorage } from './interface';

function copy<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
/** Test double only; not used as an application persistence fallback. */
export class MemoryStorage implements FitnessStorage {
  private profile: UserProfile | null = null;
  private settings: AppSettings = { unit: 'kg' };
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
  async reset() { this.profile = null; this.settings = { unit: 'kg' }; this.workouts.clear(); }
}
