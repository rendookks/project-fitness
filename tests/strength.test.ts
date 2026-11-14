import { setRecordLabels, workoutRecords } from '../src/domain/strength';
import { set, workout } from './fixtures';
const baseline=workout({id:'baseline',completedAt:'2026-11-10T12:00:00Z',exercises:[{id:'e',exerciseId:'bench',sets:[set({weightGrams:60000,reps:10})]}]});
test('heaviest and estimated 1RM improvements are independent and never celebrate incomplete sets',()=>{
  const heavier=set({weightGrams:65000,reps:2});
  expect(setRecordLabels(heavier,[baseline],'bench')).toEqual(['Heaviest load PR']);
  expect(setRecordLabels({...heavier,completed:false},[baseline],'bench')).toEqual([]);
  expect(setRecordLabels({...heavier,kind:'warmup'},[baseline],'bench')).toEqual([]);
  expect(setRecordLabels(set({weightGrams:60000,reps:12}),[baseline],'bench')).toEqual(['Estimated 1RM PR']);
  expect(setRecordLabels(heavier,[],'bench')).toEqual([]);
});
test('completion highlights are based on earlier saved history and exclude later records',()=>{
  const current=workout({id:'current',completedAt:'2026-11-12T12:00:00Z',exercises:[{id:'e',exerciseId:'bench',sets:[set({weightGrams:65000,reps:2})]}]});
  const later=workout({id:'later',completedAt:'2026-11-14T12:00:00Z',exercises:[{id:'e',exerciseId:'bench',sets:[set({weightGrams:100000,reps:5})]}]});
  expect(workoutRecords([baseline,current,later],current)).toEqual([{exerciseId:'bench',metric:'Heaviest load',grams:65000,previousGrams:60000}]);
  expect(workoutRecords([baseline],baseline)).toEqual([]);
  expect(workoutRecords([baseline],{...current,status:'active',completedAt:null})).toEqual([]);
});
