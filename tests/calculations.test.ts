import { completedWorkouts, estimated1RM, personalRecord, previousPerformance, shiftWeeks, startOfWeek, weeklyConsistency, workingSets, workoutVolume } from '../src/domain/calculations';
import { editableWeight, fromGrams, parseReps, parseWeight, toGrams } from '../src/domain/units';
import { set, workout } from './fixtures';

describe('canonical unit boundaries', () => {
  test('kg, exact pound factor, nearest gram, and zero', () => {
    expect(toGrams(12.3456, 'kg')).toBe(12346);
    expect(toGrams(1, 'lb')).toBe(454);
    expect(toGrams(135, 'lb')).toBe(61235);
    expect(toGrams(0, 'lb')).toBe(0);
  });
  test.each(['kg', 'lb'] as const)('unrounded %s conversion round trips within a gram', unit => {
    for (const grams of [0, 1, 454, 61235, 999999]) expect(toGrams(fromGrams(grams, unit), unit)).toBe(grams);
  });
  test('unit display never mutates storage and text is locale-independent for input', () => {
    const grams = 61235;
    for (let i=0; i<100; i++) { editableWeight(grams, 'lb'); editableWeight(grams, 'kg'); }
    expect(grams).toBe(61235); expect(editableWeight(grams,'lb')).toBe('135');
    expect(parseWeight('20,5', 'kg')).toBe(20500);
  });
  test.each(['', '-1', 'NaN', '1e3', '1.2.3'])('rejects malformed weight %s', text => expect(() => parseWeight(text, 'kg')).toThrow());
  test('rejects nonfinite, oversized weights and fractional reps', () => {
    expect(() => toGrams(Infinity,'kg')).toThrow(); expect(() => toGrams(2001,'kg')).toThrow();
    for (const r of ['0', '-1', '3.5', '1000', '']) expect(() => parseReps(r)).toThrow();
    expect(parseReps('12')).toBe(12);
  });
});
describe('records and training calculations', () => {
  test.each([2,5,12])('Epley at %i reps', reps => expect(estimated1RM(60000,reps)).toBeCloseTo(60000 * (1 + reps/30)));
  test('single rep is actual load; invalid and bodyweight estimates omitted', () => {
    expect(estimated1RM(60000,1)).toBe(60000);
    for (const reps of [0,13,20,1.5]) expect(estimated1RM(60000,reps)).toBeNull();
    expect(estimated1RM(0,10)).toBeNull();
  });
  test('only completed working sets in explicitly completed workouts qualify', () => {
    const mixed = workout({ exercises: [{ id:'ex',exerciseId:'bench',sets:[set(),set({id:'warm',kind:'warmup',weightGrams:100000}),set({id:'incomplete',completed:false,weightGrams:200000}),set({id:'bw',weightGrams:0,reps:10})] }] });
    expect(workingSets(mixed)).toHaveLength(2);
    expect(workoutVolume(mixed)).toBe(300000);
    expect(workoutVolume({...mixed,status:'active',completedAt:null})).toBe(0);
    expect(completedWorkouts([mixed,{...mixed,status:'active'}])).toHaveLength(1);
  });
  test('heaviest and estimated 1RM are independent, exercise-specific metrics', () => {
    const w = workout({ exercises:[{id:'ex',exerciseId:'bench',sets:[set({weightGrams:100000,reps:1}),set({id:'epley',weightGrams:90000,reps:12}),set({id:'high',weightGrams:110000,reps:13})]},{id:'other',exerciseId:'squat',sets:[set({weightGrams:200000})]}] });
    expect(personalRecord([w],'bench')).toEqual({heaviestGrams:110000,estimated1RMGrams:126000});
    expect(personalRecord([w],'squat').heaviestGrams).toBe(200000);
    expect(personalRecord([w],'missing')).toEqual({heaviestGrams:null,estimated1RMGrams:null});
  });
  test('unweighted bodyweight reps remain recorded without zero estimated 1RM', () => {
    const w=workout({exercises:[{id:'ex',exerciseId:'pushup',sets:[set({weightGrams:0,reps:12})]}]});
    expect(workingSets(w)[0].set.reps).toBe(12); expect(workoutVolume(w)).toBe(0);
    expect(personalRecord([w],'pushup')).toEqual({heaviestGrams:0,estimated1RMGrams:null});
  });
  test('previous performance ignores warmups and drafts', () => {
    const old = workout(); const draft = workout({id:'draft',status:'active',completedAt:null});
    expect(previousPerformance([old,draft],'bench')?.sets).toEqual([set()]);
    expect(previousPerformance([old],'squat')).toBeNull();
  });
});
describe('local Monday weeks and four-week consistency', () => {
  test('Monday midnight is inclusive and Sunday belongs to prior week', () => {
    const mon = new Date(2026,2,9,0,0,0,0);
    expect(startOfWeek(new Date(2026,2,15,23,59))).toEqual(mon);
    expect(startOfWeek(mon)).toEqual(mon);
    expect(startOfWeek(new Date(2026,2,8,23,59))).toEqual(new Date(2026,2,2));
  });
  test('calendar shift preserves local midnight', () => {
    const date = new Date(2026,2,9); expect(shiftWeeks(date,-1)).toEqual(new Date(2026,2,2));
    expect(date.getDate()).toBe(9);
  });
  test('counts all four weeks and does not cap above-target counts', () => {
    const now = new Date(2026,2,11,12); const mon = startOfWeek(now);
    const sessions = [-3,-2,-1,0,0,0,0].map((offset,i) => workout({id:String(i),completedAt:shiftWeeks(mon,offset).toISOString()}));
    sessions.push(workout({id:'too-old',completedAt:shiftWeeks(mon,-4).toISOString()}));
    const consistency = weeklyConsistency(sessions,1,now);
    expect(consistency.weeks.map(w=>w.count)).toEqual([1,1,1,4]);
    expect(consistency.total).toBe(7); expect(consistency.percent).toBe(175);
    expect(() => weeklyConsistency([],0)).toThrow();
  });
});
