import { buildInsights, exerciseTimeline, latestWeightRecord } from '../src/domain/insights';
import { workout,set } from './fixtures';
const date=new Date('2026-03-04T13:00:00Z');
test('empty log reports honest counts and insufficient history',()=>{
  const insights=buildInsights([],3,'kg',date);
  expect(insights[0].title).toContain('0 workouts');
  expect(insights[1].title).toContain('0%');
  expect(insights.find(i=>i.id==='history')?.title).toContain('Not enough history');
  expect(insights.find(i=>i.id==='record')).toBeUndefined();
});
test('latest record is derived chronologically and excludes warmups and drafts',()=>{
  const old=workout(); const later=workout({id:'later',completedAt:'2026-03-05T13:00:00Z',exercises:[{id:'e',exerciseId:'bench',sets:[set({weightGrams:65000}),set({id:'warm',kind:'warmup',weightGrams:100000})]}]});
  const draft=workout({id:'draft',status:'active',completedAt:null,exercises:[{id:'e',exerciseId:'bench',sets:[set({weightGrams:200000})]}]});
  expect(latestWeightRecord([later,draft,old])).toEqual({exerciseId:'bench',grams:65000,previous:60000,date:later.completedAt});
  const insights=buildInsights([later,old,draft],3,'kg',date);
  expect(insights.find(i=>i.id==='record')?.evidence).toContain('65 kg, previously 60 kg');
  expect(buildInsights([later,old,draft],3,'kg',date)).toEqual(insights);
  expect(exerciseTimeline([later,draft,old],'bench').map(p=>p.workout.id)).toEqual(['workout-1','later']);
});
test('zero external load does not produce a misleading latest weight record',()=>{
  expect(latestWeightRecord([workout({exercises:[{id:'e',exerciseId:'pushup',sets:[set({weightGrams:0})]}]})])).toBeNull();
});
