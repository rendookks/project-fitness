import { EXERCISES, searchExercises } from '../src/domain/exercises';
import { WorkoutRepository } from '../src/domain/repository';
import { MemoryStorage } from '../src/storage/memory';
import { Exercise } from '../src/domain/models';
import { set } from './fixtures';
const custom: Exercise={id:'custom-test',name:'My cable press',muscle:'Chest',equipment:'Cable',bodyweight:false,custom:true};
test('curated catalog keeps original IDs, unique names and sensible size',()=>{
  expect(EXERCISES.length).toBeGreaterThanOrEqual(100);expect(EXERCISES.length).toBeLessThanOrEqual(150);
  expect(new Set(EXERCISES.map(e=>e.id)).size).toBe(EXERCISES.length);
  expect(new Set(EXERCISES.map(e=>e.name.toLowerCase())).size).toBe(EXERCISES.length);
  for(const id of ['bench','incline-db','pushup','squat','goblet','legpress','lunge','rdl','legcurl','hipthrust','deadlift','row','dbrow','pulldown','pullup','ohp','lateral','facepull','curl','triceps','calf','crunch','legraise','extension'])expect(EXERCISES.some(e=>e.id===id)).toBe(true);
});
test('custom edits and archives preserve historic snapshots and routine use',async()=>{
  const repo=new WorkoutRepository(new MemoryStorage());await repo.saveCustomExercise(custom);
  expect(searchExercises('my cable','Chest','Cable',(await repo.load()).customExercises)).toHaveLength(1);
  const w=await repo.createWorkout('Custom day');const added=await repo.addExercise(w.id,custom.id);const ex=added.exercises[0];
  await repo.addSet(w.id,ex.id,set());const finished=await repo.finishWorkout(w.id);
  await repo.saveCustomExercise({...custom,name:'Renamed cable press'});
  expect((await repo.load()).workouts[0]).toEqual(finished);
  expect(finished.exercises[0].exerciseSnapshot?.name).toBe('My cable press');
  await repo.saveRoutine({id:'custom-plan',name:'Custom plan',updatedAt:new Date().toISOString(),exercises:[{id:'plan',exerciseId:custom.id,sets:[{reps:8,weightGrams:null,kind:'working'}]}]});
  await repo.archiveCustomExercise(custom.id);
  expect(searchExercises('Renamed','All','All',(await repo.load()).customExercises)).toHaveLength(0);
  const next=await repo.startRoutine('custom-plan');expect(next.exercises[0].exerciseSnapshot?.name).toBe('Renamed cable press');
  expect((await repo.load()).workouts.find(s=>s.id===finished.id)).toEqual(finished);
});
test('duplicate names and malformed custom exercises fail without data loss',async()=>{
  const repo=new WorkoutRepository(new MemoryStorage());await repo.saveCustomExercise(custom);
  await expect(repo.saveCustomExercise({...custom,id:'custom-second',name:'  MY CABLE PRESS '})).rejects.toThrow('already exists');
  await expect(repo.saveCustomExercise({...custom,name:'Barbell Bench Press'})).rejects.toThrow('already exists');
  await expect(repo.saveCustomExercise({...custom,id:'bench'})).rejects.toThrow();
  expect((await repo.load()).customExercises).toEqual([custom]);
});
