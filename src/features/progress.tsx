import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { completedWorkouts, personalRecord, weeklyConsistency, workingSets } from '../domain/calculations';
import { EXERCISES, exerciseById } from '../domain/exercises';
import { exerciseTimeline } from '../domain/insights';
import { formatWeight, fromGrams } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Card, Chip, Empty, Eyebrow, Heading, Row, Screen, Txt } from '../ui';
import { TrendChart, WeekBars } from '../ui/charts';

export default function Progress() {
  const {workouts,profile,settings}=useApp(); const [choice,setChoice]=useState('bench');
  const saved=completedWorkouts(workouts); const totalSets=saved.flatMap(workingSets).length;
  const loggedIds=new Set(saved.flatMap(w=>workingSets(w).map(s=>s.exerciseId)));
  const available=EXERCISES.filter(e=>loggedIds.has(e.id));
  const selected=available.some(e=>e.id===choice)?choice:available[0]?.id??'bench';
  const record=personalRecord(workouts,selected); const timeline=exerciseTimeline(workouts,selected);
  const points=timeline.filter(p=>p.record.estimated1RMGrams!==null).slice(-6).map(p=>({label:new Date(p.workout.completedAt!).toLocaleDateString(undefined,{month:'numeric',day:'numeric'}),value:fromGrams(p.record.estimated1RMGrams!,settings.unit)}));
  const consistency=weeklyConsistency(workouts,profile!.weeklyTarget);
  return <Screen><Eyebrow>PROGRESS / THE BIGGER PICTURE</Eyebrow><Heading>Proof of your effort.</Heading><Txt tone="muted">Every session tells part of the story.</Txt>
    <Row style={{alignItems:'stretch'}}><Card style={{flex:1,padding:16}}><Eyebrow>WORKOUTS</Eyebrow><Txt style={{fontSize:36,lineHeight:44,fontFamily:fonts.extra}}>{saved.length}</Txt><Txt tone="muted" style={{fontSize:12}}>completed, all time</Txt></Card><Card style={{flex:1,padding:16}}><Eyebrow>WORKING SETS</Eyebrow><Txt style={{fontSize:36,lineHeight:44,fontFamily:fonts.extra,color:c.aqua}}>{totalSets}</Txt><Txt tone="muted" style={{fontSize:12}}>completed, all time</Txt></Card></Row>
    <Card><Eyebrow>SHOWING UP</Eyebrow><Row style={{alignItems:'baseline',flexWrap:'wrap'}}><Txt style={{fontSize:30,lineHeight:38,fontFamily:fonts.extra}}>{Number(consistency.percent.toFixed(1))}%</Txt><Txt tone="muted" style={{fontSize:12}}>four-week consistency</Txt></Row><WeekBars weeks={consistency.weeks} /><Txt tone="muted" style={{fontSize:12}}>{consistency.total} / {4*profile!.weeklyTarget} planned workouts · Counts and percentages include activity above your target.</Txt></Card>
    <View style={{gap:12}}><Txt accessibilityRole="header" style={{fontFamily:fonts.bold,fontSize:20}}>Strength, over time.</Txt><Txt tone="muted" style={{fontSize:14}}>Exercise records and completed working-set history.</Txt>{available.length>0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8}}>{available.map(e=><Chip key={e.id} label={e.name} selected={e.id===selected} onPress={()=>setChoice(e.id)} />)}</ScrollView>}</View>
    {!available.length?<Empty title="A baseline comes first" detail="Save a workout with a completed working set to see exercise history, load records, and an Estimated 1RM chart." />:<>
      <Txt style={{fontFamily:fonts.bold,fontSize:20}}>{exerciseById(selected).name}</Txt>
      <Row style={{alignItems:'stretch',flexWrap:'wrap'}}><Card style={{flex:1,minWidth:140,padding:16}}><Eyebrow>HEAVIEST WEIGHT</Eyebrow><Txt style={{fontSize:24,lineHeight:32,color:c.champagne,fontFamily:fonts.bold}}>{record.heaviestGrams===0&&exerciseById(selected).bodyweight?'Bodyweight':record.heaviestGrams!==null?`${formatWeight(record.heaviestGrams,settings.unit)} ${settings.unit}`:'—'}</Txt></Card><Card style={{flex:1,minWidth:140,padding:16}}><Eyebrow>Estimated 1RM</Eyebrow><Txt style={{fontSize:24,lineHeight:32,fontFamily:fonts.bold,color:c.aqua}}>{record.estimated1RMGrams!==null?`${formatWeight(record.estimated1RMGrams,settings.unit)} ${settings.unit}`:'—'}</Txt></Card></Row>
      <Card><Eyebrow>Estimated 1RM · {settings.unit.toUpperCase()}</Eyebrow>{points.length?<><TrendChart points={points} unit={settings.unit} label={`${exerciseById(selected).name} Estimated 1RM`} /><Txt tone="muted" style={{fontSize:12}}>Up to six latest qualifying sessions. Each point is the highest Estimated 1RM for that session.</Txt></>:<Txt tone="muted">No qualifying estimate yet. An estimate needs external load greater than zero and 1–12 completed working-set repetitions.</Txt>}<Txt tone="muted" style={{fontSize:12}}>1 rep uses recorded load; 2–12 use Epley. Estimates are not a tested maximum.</Txt></Card>
      <View style={{gap:16}}><Eyebrow>EXERCISE HISTORY</Eyebrow>{[...timeline].reverse().map(({workout:w,record:r})=><View key={w.id} style={{gap:8,borderBottomWidth:1,borderColor:c.border,paddingBottom:16}}><Row style={{flexWrap:'wrap'}}><Txt style={{fontFamily:fonts.bold}}>{new Date(w.completedAt!).toLocaleDateString()}</Txt><Txt tone="muted" style={{fontSize:12}}>{w.name}</Txt></Row>{workingSets(w).filter(s=>s.exerciseId===selected).map(({set:s})=><Txt key={s.id} tone="muted" style={{fontSize:14}}>{formatWeight(s.weightGrams,settings.unit)} {settings.unit} × {s.reps} reps</Txt>)}<Txt style={{fontSize:12,color:c.aqua}}>Estimated 1RM: {r.estimated1RMGrams===null?'Not available':`${formatWeight(r.estimated1RMGrams,settings.unit)} ${settings.unit}`}</Txt></View>)}</View>
    </>}
    <Txt tone="muted" style={{fontSize:12}}>Drafts, warm-ups, and incomplete sets are excluded from strength records, volume, and working-set totals. Workouts count only when explicitly finished and saved.</Txt>
  </Screen>;
}
