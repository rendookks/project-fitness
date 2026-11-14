import { Exercise } from './models';

export const EXERCISES: readonly Exercise[] = [
  { id: 'bench', name: 'Barbell Bench Press', muscle: 'Chest', equipment: 'Barbell', bodyweight: false },
  { id: 'incline-db', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbells', bodyweight: false },
  { id: 'pushup', name: 'Push-up', muscle: 'Chest', equipment: 'Bodyweight', bodyweight: true },
  { id: 'squat', name: 'Barbell Back Squat', muscle: 'Legs', equipment: 'Barbell', bodyweight: false },
  { id: 'goblet', name: 'Goblet Squat', muscle: 'Legs', equipment: 'Dumbbells', bodyweight: false },
  { id: 'legpress', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', bodyweight: false },
  { id: 'lunge', name: 'Dumbbell Reverse Lunge', muscle: 'Legs', equipment: 'Dumbbells', bodyweight: false },
  { id: 'rdl', name: 'Romanian Deadlift', muscle: 'Hamstrings', equipment: 'Barbell', bodyweight: false },
  { id: 'legcurl', name: 'Seated Leg Curl', muscle: 'Hamstrings', equipment: 'Machine', bodyweight: false },
  { id: 'hipthrust', name: 'Barbell Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', bodyweight: false },
  { id: 'deadlift', name: 'Conventional Deadlift', muscle: 'Back', equipment: 'Barbell', bodyweight: false },
  { id: 'row', name: 'Barbell Bent-over Row', muscle: 'Back', equipment: 'Barbell', bodyweight: false },
  { id: 'dbrow', name: 'Single-arm Dumbbell Row', muscle: 'Back', equipment: 'Dumbbells', bodyweight: false },
  { id: 'pulldown', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Cable', bodyweight: false },
  { id: 'pullup', name: 'Pull-up', muscle: 'Back', equipment: 'Bodyweight', bodyweight: true },
  { id: 'ohp', name: 'Standing Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', bodyweight: false },
  { id: 'lateral', name: 'Dumbbell Lateral Raise', muscle: 'Shoulders', equipment: 'Dumbbells', bodyweight: false },
  { id: 'facepull', name: 'Cable Face Pull', muscle: 'Shoulders', equipment: 'Cable', bodyweight: false },
  { id: 'curl', name: 'Dumbbell Biceps Curl', muscle: 'Arms', equipment: 'Dumbbells', bodyweight: false },
  { id: 'triceps', name: 'Cable Triceps Pushdown', muscle: 'Arms', equipment: 'Cable', bodyweight: false },
  { id: 'calf', name: 'Standing Calf Raise', muscle: 'Calves', equipment: 'Machine', bodyweight: false },
  { id: 'crunch', name: 'Crunch', muscle: 'Core', equipment: 'Bodyweight', bodyweight: true },
  { id: 'legraise', name: 'Hanging Knee Raise', muscle: 'Core', equipment: 'Bodyweight', bodyweight: true },
  { id: 'extension', name: 'Back Extension', muscle: 'Back', equipment: 'Bodyweight', bodyweight: true },
];
export const exerciseById = (id: string): Exercise => {
  const found = EXERCISES.find(ex => ex.id === id);
  if (!found) throw new Error('Choose an exercise from the library.');
  return found;
};
export function searchExercises(query: string, muscle = 'All', equipment = 'All') {
  const term = query.trim().toLocaleLowerCase();
  return EXERCISES.filter(ex => (muscle === 'All' || ex.muscle === muscle) && (equipment === 'All' || ex.equipment === equipment)
    && `${ex.name} ${ex.muscle} ${ex.equipment}`.toLocaleLowerCase().includes(term));
}
