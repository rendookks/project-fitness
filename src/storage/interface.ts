import { AppSettings, UserProfile, WorkoutSession } from '../domain/models';

/** Asynchronous, local-only storage. Writes resolve only after persistence succeeds. */
export interface FitnessStorage {
  saveOnboarding(profile: UserProfile, settings: AppSettings): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getWorkouts(): Promise<WorkoutSession[]>;
  saveWorkout(workout: WorkoutSession): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  reset(): Promise<void>;
}
