export type WeightUnit = 'kg' | 'lb';
export type FitnessGoal = 'Build muscle' | 'Get stronger' | 'Lose fat' | 'Build consistency';
export type Experience = 'New to training' | 'Some experience' | 'Experienced';
export type Equipment = 'Bodyweight' | 'Dumbbells' | 'Barbell' | 'Machine' | 'Cable';
export interface UserProfile {
  id: 'local';
  goal: FitnessGoal;
  experience: Experience;
  weeklyTarget: number;
  equipment: Equipment[];
  onboardingCompletedAt: string;
}
export interface AppSettings { unit: WeightUnit; demoEnabled?: boolean }
export interface Exercise {
  id: string;
  name: string;
  muscle: string;
  equipment: Equipment;
  bodyweight: boolean;
  secondaryMuscles?: string[];
  custom?: boolean;
  archived?: boolean;
}
export interface ExerciseSet {
  id: string;
  kind: 'warmup' | 'working';
  reps: number;
  weightGrams: number;
  completed: boolean;
}
export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseSnapshot?: Exercise;
  sets: ExerciseSet[];
}
export interface WorkoutSession {
  id: string;
  name: string;
  status: 'active' | 'completed';
  startedAt: string;
  completedAt: string | null;
  routineId?: string;
  exercises: WorkoutExercise[];
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  exerciseSnapshot?: Exercise;
  sets: { kind: ExerciseSet['kind']; reps: number; weightGrams: number | null }[];
}
export interface Routine {
  id: string;
  name: string;
  updatedAt: string;
  exercises: RoutineExercise[];
}
