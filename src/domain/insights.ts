import { completedWorkouts, personalRecord, weeklyConsistency, workingSets } from './calculations';
import { exerciseFromHistory } from './exercises';
import { WeightUnit, WorkoutSession } from './models';
import { formatWeight } from './units';

export function latestWeightRecord(workouts: readonly WorkoutSession[]) {
  const chronological = completedWorkouts(workouts).sort((a,b) => a.completedAt!.localeCompare(b.completedAt!));
  const best = new Map<string,number>();
  let latest: { exerciseId: string; grams: number; previous: number | null; date: string } | null = null;
  for (const workout of chronological) {
    for (const {exerciseId,set} of workingSets(workout)) {
      const previous=best.get(exerciseId);
      if (set.weightGrams > 0 && (previous === undefined || set.weightGrams > previous)) {
        best.set(exerciseId,set.weightGrams); latest={exerciseId,grams:set.weightGrams,previous:previous ?? null,date:workout.completedAt!};
      }
    }
  }
  return latest;
}
export interface Insight { id: string; title: string; evidence: string; note: string }
export function buildInsights(workouts: readonly WorkoutSession[], target: number, unit: WeightUnit, now = new Date()): Insight[] {
  const saved=completedWorkouts(workouts); const consistency=weeklyConsistency(saved,target,now); const current=consistency.weeks[3];
  const result: Insight[] = [{ id:'week',title:`You completed ${current.count} ${current.count === 1 ? 'workout' : 'workouts'} this week.`,evidence:`${current.count} / ${target} weekly target · Monday-start calendar week.`,note:current.count >= target ? 'You have reached your selected target. Activity above it is still counted.' : 'Your next saved workout adds to this count.' },
    {id:'consistency',title:`Your four-week consistency is ${Number(consistency.percent.toFixed(1))}%.`,evidence:`${consistency.total} completed workouts / ${4*target} planned across this week and the previous three.`,note:'This is a record of completed sessions, not a measure of fitness or recovery.'}];
  const record=latestWeightRecord(workouts);
  if(record) result.push({id:'record',title:`${exerciseFromHistory(record.exerciseId, workouts).name}: ${record.previous === null ? 'your first working-set record' : 'a heavier working set'}.`,evidence:`${formatWeight(record.grams,unit)} ${unit}${record.previous === null ? '' : `, previously ${formatWeight(record.previous,unit)} ${unit}`} · ${new Date(record.date).toLocaleDateString()}.`,note:'Only completed working sets in saved workouts qualify. Heaviest weight is separate from Estimated 1RM.'});
  const exerciseIds=[...new Set(saved.flatMap(w=>w.exercises.map(e=>e.exerciseId)))];
  const withHistory=exerciseIds.filter(id=>saved.filter(w=>workingSets(w).some(s=>s.exerciseId===id)).length>=2);
  result.push({id:'history',title:withHistory.length ? 'Compare sessions, one exercise at a time.' : 'Not enough history to identify a reliable trend.',evidence:`${saved.length} saved ${saved.length===1?'session':'sessions'} · ${withHistory.length} exercises with working sets in at least two sessions.`,note:'Session comparisons describe your log; they do not establish muscle growth or the cause of a change.'});
  return result;
}
export function exerciseTimeline(workouts: readonly WorkoutSession[], exerciseId: string) {
  return completedWorkouts(workouts).filter(w=>workingSets(w).some(s=>s.exerciseId===exerciseId))
    .sort((a,b)=>a.completedAt!.localeCompare(b.completedAt!)).map(w=>({workout:w,record:personalRecord([w],exerciseId)}));
}
