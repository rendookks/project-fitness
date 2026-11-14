import { completedWorkouts, personalRecord, workoutVolume } from '../src/domain/calculations';
import { searchExercises } from '../src/domain/exercises';
import { WorkoutRepository } from '../src/domain/repository';
import { MemoryStorage } from '../src/storage/memory';
import { profile, set } from './fixtures';

function fixture() {
  const storage = new MemoryStorage(); let next = 0;
  const repo = new WorkoutRepository(storage, () => new Date('2026-03-04T12:00:00.000Z'), () => String(++next));
  return { storage, repo };
}
async function session(repo: WorkoutRepository) {
  const w = await repo.createWorkout('Push day');
  const added = await repo.addExercise(w.id, 'bench'); const ex = added.exercises[0];
  return { w, ex };
}
test('onboarding persists once across repository restarts', async () => {
  const {repo,storage}=fixture(); await repo.onboard(profile,{unit:'lb'});
  const restored=await new WorkoutRepository(storage).load();
  expect(restored.profile).toEqual(profile); expect(restored.settings.unit).toBe('lb');
  await expect(repo.onboard({...profile,weeklyTarget:0},{unit:'kg'})).rejects.toThrow();
  expect((await repo.load()).profile).toEqual(profile);
});
test('full workout lifecycle, previous state restoration, edit, remove, complete, history', async () => {
  const { repo, storage } = fixture(); const {w,ex} = await session(repo);
  await repo.renameWorkout(w.id,'Upper strength');
  await repo.addSet(w.id,ex.id,set({id:'a',completed:false}));
  await repo.addSet(w.id,ex.id,set({id:'b',kind:'warmup'}));
  await repo.addSet(w.id,ex.id,set({id:'delete',weightGrams:100000}));
  await repo.removeSet(w.id,ex.id,'delete');
  let restored = await new WorkoutRepository(storage).load();
  expect(restored.workouts[0].name).toBe('Upper strength');
  expect(restored.workouts[0].exercises[0].sets).toHaveLength(2);
  expect(completedWorkouts(restored.workouts)).toHaveLength(0);
  await repo.editSet(w.id,ex.id,set({id:'a',reps:8,weightGrams:61235,completed:true}));
  const saved = await repo.finishWorkout(w.id);
  expect(saved.status).toBe('completed'); expect(workoutVolume(saved)).toBe(489880);
  restored = await new WorkoutRepository(storage).load();
  expect(completedWorkouts(restored.workouts)).toHaveLength(1);
  expect(personalRecord(restored.workouts,'bench').heaviestGrams).toBe(61235);
  await expect(repo.editSet(w.id,ex.id,set())).rejects.toThrow('read-only');
  await repo.deleteWorkout(w.id); expect((await repo.load()).workouts).toEqual([]);
});
test('rapid creates, duplicate exercise/set requests, repeated finishes do not duplicate', async () => {
  const {repo}=fixture(); const created=await Promise.all([repo.createWorkout('A'),repo.createWorkout('B')]);
  expect(created[0].id).toBe(created[1].id);
  const id=created[0].id;
  await Promise.all([repo.addExercise(id,'bench'),repo.addExercise(id,'bench')]);
  const ex=(await repo.load()).workouts[0].exercises[0];
  await Promise.all([repo.addSet(id,ex.id,set()),repo.addSet(id,ex.id,set())]);
  await Promise.all([repo.finishWorkout(id),repo.finishWorkout(id)]);
  const data=await repo.load(); expect(data.workouts).toHaveLength(1);
  expect(data.workouts[0].exercises).toHaveLength(1); expect(data.workouts[0].exercises[0].sets).toHaveLength(1);
});
test('rejects invalid data and recovers queue after validation failure', async () => {
  const {repo}=fixture(); await expect(repo.createWorkout('  ')).rejects.toThrow();
  const {w,ex}=await session(repo);
  await expect(repo.addExercise(w.id,'unknown')).rejects.toThrow();
  for (const bad of [set({reps:0}),set({weightGrams:-1}),set({weightGrams:1.5}),set({reps:1.5})]) await expect(repo.addSet(w.id,ex.id,bad)).rejects.toThrow();
  await expect(repo.finishWorkout(w.id)).rejects.toThrow('at least one');
  await repo.addSet(w.id,ex.id,set({completed:false}));
  await expect(repo.finishWorkout(w.id)).rejects.toThrow('at least one');
  await repo.editSet(w.id,ex.id,set({completed:true})); await repo.finishWorkout(w.id);
});
test('repeated unit switching never rewrites canonical workout payloads', async () => {
  const {repo}=fixture(); const {w,ex}=await session(repo); await repo.addSet(w.id,ex.id,set({weightGrams:61235}));
  for(let i=0;i<20;i++){await repo.setUnit('lb');await repo.setUnit('kg');}
  expect((await repo.load()).workouts[0].exercises[0].sets[0].weightGrams).toBe(61235);
});
test('exercise removal, discard, and reset affect stored data', async () => {
  const {repo}=fixture(); await repo.onboard(profile,{unit:'lb'}); const {w,ex}=await session(repo);
  await repo.addSet(w.id,ex.id,set()); await repo.removeExercise(w.id,ex.id);
  expect((await repo.load()).workouts[0].exercises).toEqual([]);
  await repo.deleteWorkout(w.id); expect((await repo.load()).workouts).toEqual([]);
  await repo.reset(); expect((await repo.load()).profile).toBeNull(); expect((await repo.load()).settings.unit).toBe('kg');
});
test('failed storage write preserves the previous snapshot and queue remains usable', async () => {
  const {repo,storage}=fixture(); const {w,ex}=await session(repo);
  const original=storage.saveWorkout.bind(storage);
  storage.saveWorkout=jest.fn().mockRejectedValueOnce(new Error('Disk full')).mockImplementation(original);
  await expect(repo.addSet(w.id,ex.id,set())).rejects.toThrow('Disk full');
  expect((await repo.load()).workouts[0].exercises[0].sets).toEqual([]);
  await repo.addSet(w.id,ex.id,set()); expect((await repo.load()).workouts[0].exercises[0].sets).toHaveLength(1);
});
test('library searches names, muscles and equipment with combined filters',()=>{
  expect(searchExercises('bench').map(e=>e.id)).toEqual(['bench']);
  expect(searchExercises('','Chest','Bodyweight').map(e=>e.id)).toEqual(['pushup']);
  expect(searchExercises('no such exercise')).toEqual([]);
});
