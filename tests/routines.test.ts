import { previousPerformance } from '../src/domain/calculations';
import { Routine } from '../src/domain/models';
import { WorkoutRepository } from '../src/domain/repository';
import { MemoryStorage } from '../src/storage/memory';
import { set, workout } from './fixtures';

export const routine = (): Routine => ({ id: 'push', name: 'Push Day', updatedAt: '2026-11-14T12:00:00Z', exercises: [{ id: 'plan-bench', exerciseId: 'bench', sets: [{ kind: 'working', reps: 8, weightGrams: 61235 }] }] });
test('routine lifecycle copies structure, preserves history and prepopulates exact grams', async () => {
  const storage = new MemoryStorage(); const repo = new WorkoutRepository(storage);
  await repo.saveRoutine(routine());
  const first = await repo.startRoutine('push'); const ex = first.exercises[0];
  expect(ex.sets[0]).toMatchObject({ weightGrams: 61235, reps: 8, completed: false });
  await repo.updateSet(first.id, ex.id, ex.sets[0].id, { completed: true });
  const finished = await repo.finishWorkout(first.id);
  const edited = routine(); edited.name = 'Upper'; edited.exercises[0].sets[0].weightGrams = 80000;
  await repo.saveRoutine(edited);
  const second = await repo.startRoutine('push');
  expect(second.exercises[0].sets[0]).toMatchObject({ weightGrams: 61235, reps: 8, completed: false });
  await repo.updateSet(second.id, second.exercises[0].id, second.exercises[0].sets[0].id, { weightGrams: 65000 });
  expect((await repo.load()).workouts.find(w => w.id === first.id)).toEqual(finished);
  expect((await repo.load()).routines[0].exercises[0].sets[0].weightGrams).toBe(80000);
  const duplicate = await repo.duplicateRoutine('push'); expect(duplicate.id).not.toBe('push');
  await repo.deleteRoutine('push'); expect((await repo.load()).workouts).toHaveLength(2);
  expect((await new WorkoutRepository(storage).load()).workouts.find(w => w.id === second.id)?.status).toBe('active');
  expect((await repo.startRoutine(duplicate.id)).id).toBe(second.id);
});
test('autofill prefers the same routine and ignores warmups, drafts and unrelated exercises', () => {
  const same = workout({ id: 'same', routineId: 'push' });
  const recent = workout({ id: 'recent', completedAt: '2026-11-14T12:00:00Z', exercises: [{ id: 'ex', exerciseId: 'bench', sets: [set({ weightGrams: 80000 })] }] });
  const warmup = workout({ id: 'warmup', routineId: 'push', completedAt: '2026-11-15T12:00:00Z', exercises: [{ id: 'ex', exerciseId: 'bench', sets: [set({ kind: 'warmup', weightGrams: 200000 })] }] });
  expect(previousPerformance([recent, same, warmup], 'bench', 'push')?.workoutId).toBe('same');
  expect(previousPerformance([recent, same, warmup], 'bench', 'missing')?.workoutId).toBe('recent');
  expect(previousPerformance([recent], 'squat', 'push')).toBeNull();
});
test('rejects invalid plans without replacing the saved one', async () => {
  const repo = new WorkoutRepository(new MemoryStorage()); await repo.saveRoutine(routine());
  const bad = routine(); bad.exercises[0].sets[0].reps = 0;
  await expect(repo.saveRoutine(bad)).rejects.toThrow();
  expect((await repo.load()).routines[0]).toMatchObject({ name: 'Push Day', exercises: [{ sets: [{ reps: 8 }] }] });
});
