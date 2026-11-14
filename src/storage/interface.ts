import { AppSettings, Routine, UserProfile, WorkoutSession } from '../domain/models';

export type DatabaseKind = 'real' | 'demo';
export interface DemoSeed { version: number; profile: UserProfile; settings: AppSettings; workouts: WorkoutSession[] }

/** Asynchronous, local-only storage. Writes resolve only after persistence succeeds. */
export interface FitnessStorage {
  readonly kind: DatabaseKind;
  initializeDemo(seed: DemoSeed, replace?: boolean): Promise<void>;
  saveOnboarding(profile: UserProfile, settings: AppSettings): Promise<void>;
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  getSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  getWorkouts(): Promise<WorkoutSession[]>;
  saveWorkout(workout: WorkoutSession): Promise<void>;
  deleteWorkout(id: string): Promise<void>;
  getRoutines(): Promise<Routine[]>;
  saveRoutine(routine: Routine): Promise<void>;
  deleteRoutine(id: string): Promise<void>;
  reset(): Promise<void>;
}
