import { EQUIPMENT, EXERCISES, MUSCLES } from './exercises';
import { AppSettings, Exercise, ExerciseSet, Routine, UserProfile, WorkoutSession } from './models';
import { MAX_WEIGHT_GRAMS } from './units';

export const BACKUP_VERSION = 1;
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;
export interface UserData { profile: UserProfile | null; settings: AppSettings; customExercises: Exercise[]; routines: Routine[]; workouts: WorkoutSession[] }
export interface DataBackup extends UserData { format: 'project-fitness-backup'; version: 1; source: 'real'; createdAt: string }
const bad = (detail: string): never => { throw new Error(`Invalid backup: ${detail}. No records were replaced.`); };
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string,unknown> : bad('expected an object');
const text = (value: unknown, label: string, max = 160): string => typeof value === 'string' && value.trim().length > 0 && value.length <= max ? value : bad(label);
const number = (value: unknown, min: number, max: number): number => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : bad('numeric range or precision');
const bool = (value: unknown): boolean => typeof value === 'boolean' ? value : bad('expected a boolean');
const date = (value: unknown): string => { const result=text(value,'timestamp',80);return Number.isFinite(Date.parse(result)) ? result : bad('timestamp'); };
const list = (value: unknown, max: number): unknown[] => Array.isArray(value) && value.length <= max ? value : bad('collection size or type');
function unique<T extends {id: string}>(rows: T[]): T[] { if(new Set(rows.map(r=>r.id)).size!==rows.length)bad('duplicate record identities');return rows; }
function exercise(value: unknown): Exercise {
  const x=object(value); const equipment=text(x.equipment,'equipment') as Exercise['equipment'];
  const muscle=text(x.muscle,'muscle',80);
  if(!EQUIPMENT.includes(equipment)||![...MUSCLES,'Arms','Legs','Other'].some(m=>m===muscle))bad('exercise classification');
  const result: Exercise={id:text(x.id,'exercise identity'),name:text(x.name,'exercise name',80),muscle,equipment,bodyweight:bool(x.bodyweight)};
  if(x.custom!==undefined)result.custom=bool(x.custom);
  if(x.archived!==undefined)result.archived=bool(x.archived);
  if(x.secondaryMuscles!==undefined)result.secondaryMuscles=list(x.secondaryMuscles,20).map(m=>text(m,'secondary muscle',80));
  return result;
}
function set(value: unknown): ExerciseSet {
  const s=object(value);if(s.kind!=='working'&&s.kind!=='warmup')bad('set classification');
  return {id:text(s.id,'set identity'),kind:s.kind as ExerciseSet['kind'],weightGrams:number(s.weightGrams,0,MAX_WEIGHT_GRAMS),reps:number(s.reps,1,999),completed:bool(s.completed)};
}
export function validateBackup(value: unknown): DataBackup {
  const root=object(value);
  if(root.format!=='project-fitness-backup'||root.version!==BACKUP_VERSION||root.source!=='real')throw new Error('Unsupported backup format, version, or data source. Choose a real-user Project Fitness v1 backup. No records were replaced.');
  let profile: UserProfile|null=null;
  if(root.profile!==null){
    const p=object(root.profile);
    if(p.id!=='local'||!['Build muscle','Get stronger','Lose fat','Build consistency'].includes(String(p.goal))||!['New to training','Some experience','Experienced'].includes(String(p.experience)))bad('profile');
    const equipment=list(p.equipment,5).map(e=>{if(!EQUIPMENT.some(v=>v===e))bad('profile equipment');return e as Exercise['equipment'];});
    if(!equipment.length)bad('profile equipment');
    profile={id:'local',goal:p.goal as UserProfile['goal'],experience:p.experience as UserProfile['experience'],weeklyTarget:number(p.weeklyTarget,1,7),equipment,onboardingCompletedAt:date(p.onboardingCompletedAt)};
  }
  const settings=object(root.settings);if(settings.unit!=='kg'&&settings.unit!=='lb')bad('weight unit');
  const customExercises=unique(list(root.customExercises,10000).map(exercise));
  if(customExercises.some(e=>!e.id.startsWith('custom-')||!e.custom||EXERCISES.some(b=>b.id===e.id)))bad('custom exercise identity');
  const catalog=new Set([...EXERCISES,...customExercises].map(e=>e.id));
  function reference(entry: Record<string,unknown>) {
    const exerciseId=text(entry.exerciseId,'exercise reference');
    const snapshot=entry.exerciseSnapshot===undefined?undefined:exercise(entry.exerciseSnapshot);
    if(snapshot&&snapshot.id!==exerciseId)bad('exercise snapshot identity');
    if(!catalog.has(exerciseId))bad('missing exercise reference');
    return {exerciseId,...(snapshot?{exerciseSnapshot:snapshot}:{})};
  }
  const routines=unique(list(root.routines,10000).map(value=>{
    const r=object(value);return {id:text(r.id,'routine identity'),name:text(r.name,'routine name',80),updatedAt:date(r.updatedAt),exercises:unique(list(r.exercises,100).map(value=>{
      const e=object(value);const sets=list(e.sets,50).map(value=>{const s=object(value);if(s.kind!=='working'&&s.kind!=='warmup')bad('planned classification');return {kind:s.kind as ExerciseSet['kind'],reps:number(s.reps,1,999),weightGrams:s.weightGrams===null?null:number(s.weightGrams,0,MAX_WEIGHT_GRAMS)};});
      if(!sets.length)bad('routine needs planned sets');
      return {id:text(e.id,'planned exercise identity'),...reference(e),sets};
    }))} satisfies Routine;
  }));
  const workouts=unique(list(root.workouts,100000).map(value=>{
    const w=object(value);if(w.status!=='active'&&w.status!=='completed')bad('session status');
    const startedAt=date(w.startedAt);const completedAt=w.status==='completed'?date(w.completedAt):null;
    if(w.status==='active'&&w.completedAt!==null)bad('active completion date');
    if(completedAt&&Date.parse(completedAt)<Date.parse(startedAt))bad('session date order');
    return {id:text(w.id,'session identity'),name:text(w.name,'session name',80),status:w.status as WorkoutSession['status'],startedAt,completedAt,...(w.routineId===undefined?{}:{routineId:text(w.routineId,'routine reference')}),exercises:unique(list(w.exercises,100).map(value=>{const e=object(value);return {id:text(e.id,'session exercise identity'),...reference(e),sets:unique(list(e.sets,500).map(set))};}))} satisfies WorkoutSession;
  }));
  if(workouts.filter(w=>w.status==='active').length>1)bad('more than one active workout');
  return {format:'project-fitness-backup',version:1,source:'real',createdAt:date(root.createdAt),profile,settings:{unit:settings.unit as AppSettings['unit'],demoEnabled:false},customExercises,routines,workouts};
}
export function parseBackup(text: string): DataBackup {
  let bytes=0;
  for(let i=0;i<text.length;i++){
    const code=text.charCodeAt(i);
    if(code<128)bytes++;else if(code<2048)bytes+=2;else if(code>=0xD800&&code<=0xDBFF&&i+1<text.length&&text.charCodeAt(i+1)>=0xDC00&&text.charCodeAt(i+1)<=0xDFFF){bytes+=4;i++;}else bytes+=3;
    if(bytes>MAX_BACKUP_BYTES)bad('file exceeds 25 MB');
  }
  let value:unknown;try{value=JSON.parse(text);}catch{bad('file is not valid JSON');}
  return validateBackup(value);
}
