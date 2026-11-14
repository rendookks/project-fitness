import { createDemoSeed } from '../src/domain/demo';
import { weeklyConsistency } from '../src/domain/calculations';
import { DataModeController } from '../src/state/data-mode';
import { MemoryStorage } from '../src/storage/memory';
import { DatabaseKind } from '../src/storage/interface';
import { profile,set } from './fixtures';
const instant=new Date('2026-11-14T12:00:00.000Z');
function fixture(){
  const real=new MemoryStorage('real');const demo=new MemoryStorage('demo');
  const open=async(kind:DatabaseKind)=>kind==='real'?real:demo;
  return {real,demo,controller:new DataModeController(open,()=>instant),restart:()=>new DataModeController(open,()=>new Date('2026-12-14T12:00:00Z'))};
}
test('deterministic seed has stable IDs, no future instants, and four-week activity',()=>{
  const seed=createDemoSeed(instant);expect(seed).toEqual(createDemoSeed(instant));
  expect(seed.workouts).toHaveLength(11);expect(new Set(seed.workouts.map(w=>w.id)).size).toBe(11);
  expect(seed.workouts.every(w=>Date.parse(w.completedAt!)<=instant.getTime())).toBe(true);
  expect(weeklyConsistency(seed.workouts,3,instant).weeks.map(w=>w.count)).toEqual([3,3,3,2]);
  for(const time of ['2026-11-16T00:00:00Z','2026-11-16T07:00:00Z']){
    const at=new Date(time);expect(createDemoSeed(at).workouts.every(w=>Date.parse(w.completedAt!)<=at.getTime())).toBe(true);
  }
});
test('seeding is refused in real storage',async()=>{
  await expect(new MemoryStorage().initializeDemo(createDemoSeed(instant))).rejects.toThrow('forbidden');
});
test('switching, restarts, independent units, demo edits/deletes and real draft isolation',async()=>{
  const {controller,real,demo,restart}=fixture();await controller.initialize();
  let state=await controller.snapshot();await state.repository.onboard(profile,{unit:'lb'});
  const realDraft=await state.repository.createWorkout('Real unfinished session');
  const before=await real.getWorkouts();
  await controller.switchMode('demo');state=await controller.snapshot();
  expect(state.mode).toBe('demo');expect(state.workouts).toHaveLength(11);expect(state.settings.unit).toBe('kg');
  await state.repository.deleteWorkout(state.workouts[0].id);
  const demoDraft=await state.repository.createWorkout('Demo unfinished session');
  const withExercise=await state.repository.addExercise(demoDraft.id,'bench');
  await state.repository.addSet(demoDraft.id,withExercise.exercises[0].id,set());
  await state.repository.setUnit('lb');
  const afterEdits=await demo.getWorkouts();
  const fresh=restart();await fresh.initialize();state=await fresh.snapshot();
  expect(state.mode).toBe('demo');expect(state.workouts).toEqual(afterEdits);expect(state.settings.unit).toBe('lb');
  await fresh.switchMode('real');state=await fresh.snapshot();
  expect(state.mode).toBe('real');expect(state.workouts).toEqual(before);expect(state.workouts[0].id).toBe(realDraft.id);expect(state.settings.unit).toBe('lb');
  await fresh.switchMode('demo');expect((await fresh.snapshot()).workouts).toEqual(afterEdits);
  expect(await real.getWorkouts()).toEqual(before);
});
test('demo reset restores exactly one seed and never changes real records; real reset leaves demo intact',async()=>{
  const {controller,real,demo}=fixture();await controller.initialize();
  const repo=(await controller.snapshot()).repository;await repo.onboard(profile,{unit:'kg'});await repo.createWorkout('Real draft');
  const before=await real.getWorkouts();await controller.switchMode('demo');
  const state=await controller.snapshot();await state.repository.deleteWorkout(state.workouts[0].id);
  await controller.resetActive();expect((await controller.snapshot()).workouts).toHaveLength(11);
  for(let i=0;i<3;i++)await controller.switchMode('demo');
  expect((await controller.snapshot()).workouts).toHaveLength(11);expect(await real.getWorkouts()).toEqual(before);
  const demoBefore=await demo.getWorkouts();await controller.switchMode('real');await controller.resetActive();
  expect(await real.getProfile()).toBeNull();expect(await real.getWorkouts()).toEqual([]);expect(await demo.getWorkouts()).toEqual(demoBefore);
});
test('failed destination or preference persistence leaves the current repository active',async()=>{
  const {controller,real,demo}=fixture();await controller.initialize();
  demo.getWorkouts=jest.fn().mockRejectedValueOnce(new Error('Read failed')).mockResolvedValue([]);
  await expect(controller.switchMode('demo')).rejects.toThrow('Read failed');
  expect((await controller.snapshot()).mode).toBe('real');expect((await real.getSettings()).demoEnabled).not.toBe(true);
  real.saveSettings=jest.fn().mockRejectedValue(new Error('Disk full'));
  await expect(controller.switchMode('demo')).rejects.toThrow('Disk full');
  expect((await controller.snapshot()).mode).toBe('real');
});
test('wrong database identities are rejected before seeding',async()=>{
  const real=new MemoryStorage('real');const controller=new DataModeController(async()=>real);
  await controller.initialize();await expect(controller.switchMode('demo')).rejects.toThrow('identity mismatch');
  expect(await real.getWorkouts()).toEqual([]);
});
