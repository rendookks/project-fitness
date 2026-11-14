import { parseBackup, validateBackup } from '../src/domain/backup';
import { WorkoutRepository } from '../src/domain/repository';
import { MemoryStorage } from '../src/storage/memory';
import { profile, set } from './fixtures';
async function populated(){
  const repo=new WorkoutRepository(new MemoryStorage());await repo.onboard(profile,{unit:'lb'});
  await repo.saveCustomExercise({id:'custom-backup',name:'My press',muscle:'Chest',equipment:'Dumbbells',bodyweight:false,custom:true});
  await repo.saveRoutine({id:'push',name:'Push Day',updatedAt:new Date().toISOString(),exercises:[{id:'plan',exerciseId:'custom-backup',sets:[{kind:'working',reps:8,weightGrams:61235}]}]});
  const active=await repo.startRoutine('push');await repo.updateSet(active.id,active.exercises[0].id,active.exercises[0].sets[0].id,{completed:true});await repo.finishWorkout(active.id);
  await repo.startRoutine('push');return repo;
}
test('real data backup roundtrips profile, exact grams, custom exercises, routines, history and active sessions',async()=>{
  const source=await populated();const backup=await source.createBackup();
  expect(backup.source).toBe('real');expect(backup.settings.demoEnabled).toBe(false);
  const destination=new WorkoutRepository(new MemoryStorage());await destination.restoreBackup(JSON.stringify(backup));
  const restored=await destination.load();expect(restored.workouts).toEqual((await source.load()).workouts);
  expect(restored.customExercises).toEqual(backup.customExercises);expect(restored.routines).toEqual(backup.routines);
  expect(restored.profile).toEqual(profile);expect(restored.settings.unit).toBe('lb');
  expect(restored.workouts.find(w=>w.status==='active')?.exercises[0].sets[0].weightGrams).toBe(61235);
});
test('corrupt, unsupported, duplicate, fractional-weight, and dangling-reference files fail without mutation',async()=>{
  const repo=await populated();const backup=await repo.createBackup();const before=await repo.load();
  const invalid:unknown[]=[null,{}, {...backup,version:99},{...backup,source:'demo'},{...backup,workouts:[...backup.workouts,backup.workouts[0]]},{...backup,settings:{unit:'stones'}}];
  const fractional=JSON.parse(JSON.stringify(backup));fractional.workouts[0].exercises[0].sets[0].weightGrams=1.5;invalid.push(fractional);
  const dangling=JSON.parse(JSON.stringify(backup));dangling.customExercises=[];invalid.push(dangling);
  const multiple=JSON.parse(JSON.stringify(backup));multiple.workouts.push({...multiple.workouts.find((w:{status:string})=>w.status==='active'),id:'another-active'});invalid.push(multiple);
  for(const value of invalid){await expect(repo.restoreBackup(JSON.stringify(value))).rejects.toThrow();expect(await repo.load()).toEqual(before);}
  expect(()=>parseBackup('{broken')).toThrow('JSON');
});
test('demo exports and restores are forbidden and cannot modify real data',async()=>{
  const real=await populated();const backup=await real.createBackup();const demo=new WorkoutRepository(new MemoryStorage('demo'));
  await expect(demo.createBackup()).rejects.toThrow('real');
  await expect(demo.restoreBackup(JSON.stringify(backup))).rejects.toThrow('real');
  expect((await real.load()).workouts).toEqual(backup.workouts);
});
test('validation strips mode preference and unknown fields without accepting invalid snapshots or set flags',async()=>{
  const repo=await populated();const backup=await repo.createBackup();
  expect(validateBackup({...backup,settings:{unit:'lb',demoEnabled:true},extra:'ignored'}).settings.demoEnabled).toBe(false);
  const bad=JSON.parse(JSON.stringify(backup));bad.workouts[0].exercises[0].exerciseSnapshot.id='wrong';expect(()=>validateBackup(bad)).toThrow('snapshot');
  const flag=JSON.parse(JSON.stringify(backup));flag.workouts[0].exercises[0].sets[0].completed='yes';expect(()=>validateBackup(flag)).toThrow('boolean');
  await repo.storage.saveWorkout({...backup.workouts[0],id:'warmup-example',status:'completed',completedAt:new Date().toISOString(),exercises:[{id:'e',exerciseId:'bench',sets:[set({kind:'warmup'})]}]});
  expect((await repo.createBackup()).workouts.length).toBe(3);
});
