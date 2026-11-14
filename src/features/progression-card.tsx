import { View } from 'react-native';
import { completedWorkouts } from '../domain/calculations';
import { suggestProgression } from '../domain/progression';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Txt } from '../ui';

export function ProgressionCard({ exerciseId, routineId, compact, onApply }: { exerciseId: string; routineId?: string; compact?: boolean; onApply?: (target: { weightGrams: number; reps: number }) => void }) {
  const { workouts, routines, settings, pending } = useApp();
  const source=routineId ?? completedWorkouts(workouts).filter(w=>w.exercises.some(e=>e.exerciseId===exerciseId)).sort((a,b)=>b.completedAt!.localeCompare(a.completedAt!))[0]?.routineId;
  const planned=routines.find(r=>r.id===source)?.exercises.find(e=>e.exerciseId===exerciseId)?.sets.filter(s=>s.kind==='working');
  const targetReps=planned?.length&&planned.every(s=>s.reps===planned[0].reps)?planned[0].reps:undefined;
  const result=suggestProgression(workouts,exerciseId,{routineId:source,targetReps});
  const target=result.target;
  return <View style={{ gap: 6, padding: compact ? 10 : 0, backgroundColor: compact ? colors.elevated : undefined, borderRadius: 10 }}>
    {target ? <Txt style={{ fontFamily: fonts.bold, fontSize: compact ? 12 : 16, color: colors.aqua }}>NEXT TARGET · {result.kind==='repeat'?'Repeat ':''}{formatWeight(target.weightGrams,settings.unit)} {settings.unit} × {target.reps}</Txt> : <Txt tone="muted" style={{fontSize:14}}>No target yet · build your baseline</Txt>}
    <Txt tone="muted" style={{ fontSize: 12 }}>{result.reason}</Txt>
    {!compact&&<Txt style={{ fontSize: 12, color: colors.iris }}>{result.evidence}</Txt>}
    {onApply&&target&&<Button title="Use target for first set" variant="secondary" disabled={pending} onPress={()=>onApply(target)} />}
  </View>;
}
