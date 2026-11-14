import { suggestProgression } from '../src/domain/progression';
import { formatWeight, toGrams } from '../src/domain/units';
import { set, workout } from './fixtures';
const session=(id:string,date:string,weightGrams=60000,reps=8)=>workout({id,routineId:'push',completedAt:date,exercises:[{id:'e',exerciseId:'bench',sets:[set({id:'a',reps,weightGrams}),set({id:'b',reps,weightGrams})]}]});
const earlier=session('a','2026-11-12T12:00:00Z');const latest=session('b','2026-11-14T12:00:00Z');
test('no history and one session explain insufficient evidence',()=>{
  expect(suggestProgression([],'bench').kind).toBe('insufficient');
  expect(suggestProgression([latest],'bench',{targetReps:8})).toMatchObject({kind:'repeat',target:{weightGrams:60000,reps:8}});
  expect(suggestProgression([latest],'bench').reason).toContain('Only one');
});
test('two comparable sessions plus an explicit goal permit a bounded optional load increase',()=>{
  const result=suggestProgression([latest,earlier],'bench',{routineId:'push',targetReps:8});
  expect(result.kind).toBe('add-load');expect(result.target).toEqual({weightGrams:61000,reps:8});
  expect(result.evidence).toContain('Both latest sessions');expect(result.reason).toContain('otherwise repeat');
  expect(suggestProgression([latest,earlier],'bench').kind).toBe('repeat');
});
test('warmups, unfinished sessions, incomplete sets and single outliers never trigger progression',()=>{
  const warmup=session('warm','2026-11-16T12:00:00Z',100000);warmup.exercises[0].sets.forEach(s=>s.kind='warmup');
  const active=session('active','2026-11-17T12:00:00Z',100000);active.status='active';active.completedAt=null;
  const incomplete=session('incomplete','2026-11-18T12:00:00Z',100000);incomplete.exercises[0].sets.forEach(s=>s.completed=false);
  expect(suggestProgression([warmup,active,incomplete],'bench').kind).toBe('insufficient');
  expect(suggestProgression([session('outlier','2026-11-19T12:00:00Z',90000),latest,earlier],'bench',{targetReps:8}).kind).toBe('repeat');
});
test('bodyweight progression preserves zero load, and units never change canonical targets',()=>{
  const body=suggestProgression([session('a','2026-11-12T12:00:00Z',0),session('b','2026-11-14T12:00:00Z',0)],'bench',{targetReps:8});
  expect(body).toMatchObject({kind:'add-rep',target:{weightGrams:0,reps:9}});
  const grams=toGrams(135,'lb');
  const result=suggestProgression([session('a','2026-11-12T12:00:00Z',grams),session('b','2026-11-14T12:00:00Z',grams)],'bench',{targetReps:8});
  expect(result.previous?.weightGrams).toBe(61235);expect(result.target!.weightGrams-grams).toBeLessThanOrEqual(1000);
  expect(formatWeight(result.target!.weightGrams,'lb')).toBeDefined();expect(result.target!.weightGrams).toBe(62235);
});
test('routine context cannot use another routine to invent repeated evidence; changed set counts repeat',()=>{
  const other={...earlier,routineId:'other'};
  expect(suggestProgression([latest,other],'bench',{routineId:'push',targetReps:8}).kind).toBe('repeat');
  const changed=structuredClone(latest);changed.exercises[0].sets.pop();
  expect(suggestProgression([changed,earlier],'bench',{targetReps:8}).kind).toBe('repeat');
  const boundary=[session('a','2026-11-12T12:00:00Z',2000000),session('b','2026-11-14T12:00:00Z',2000000)];
  expect(suggestProgression(boundary,'bench',{targetReps:8}).kind).toBe('repeat');
});
