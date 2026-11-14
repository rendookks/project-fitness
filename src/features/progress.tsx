import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { completedWorkouts, personalRecord, weeklyConsistency, workingSets } from '../domain/calculations';
import { exerciseFromHistory } from '../domain/exercises';
import { exerciseTimeline } from '../domain/insights';
import { workoutRecords } from '../domain/strength';
import { formatWeight, fromGrams } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Chip, Empty, Eyebrow, Field, Heading, Row, Screen, Txt } from '../ui';
import { TrendChart, WeekBars } from '../ui/charts';

export default function Progress() {
  const {workouts,profile,settings,customExercises}=useApp();
  const [choice,setChoice]=useState('bench'); const [query,setQuery]=useState('');
  const [range,setRange]=useState(0); const [limit,setLimit]=useState(20);
  const saved=completedWorkouts(workouts); const totalSets=saved.flatMap(workingSets).length;
  const available=[...new Set(saved.flatMap(w=>workingSets(w).map(s=>s.exerciseId)))].map(id=>exerciseFromHistory(id,workouts,customExercises));
  const selected=available.some(e=>e.id===choice)?choice:available[0]?.id??'bench';
  const exercise=exerciseFromHistory(selected,workouts,customExercises);
  const record=personalRecord(workouts,selected); const timeline=exerciseTimeline(workouts,selected);
  const cutoff=new Date();cutoff.setDate(cutoff.getDate()-range*7);
  const visible=timeline.filter(p=>!range||new Date(p.workout.completedAt!)>=cutoff);
  const points=visible.filter(p=>p.record.estimated1RMGrams!==null).slice(-6).map(p=>({label:new Date(p.workout.completedAt!).toLocaleDateString(undefined,{month:'numeric',day:'numeric'}),value:fromGrams(p.record.estimated1RMGrams!,settings.unit)}));
  const consistency=weeklyConsistency(workouts,profile!.weeklyTarget);
  const latest=timeline[timeline.length-1];const previous=timeline[timeline.length-2];
  const delta=latest?.record.heaviestGrams!==null&&previous?.record.heaviestGrams!==null&&latest&&previous?latest.record.heaviestGrams!-previous.record.heaviestGrams!:null;
  const records=[...saved].sort((a,b)=>b.completedAt!.localeCompare(a.completedAt!)).slice(0,20).flatMap(w=>workoutRecords(workouts,w).map(r=>({...r,date:w.completedAt!}))).slice(0,5);
  return <Screen><Eyebrow>PROGRESS / STRENGTH FIRST</Eyebrow><Heading>Proof of your effort.</Heading>
    <Row><Txt tone="muted" style={{fontSize:14}}>{saved.length} workouts · {totalSets} working sets · all time</Txt><Button title="History" variant="secondary" onPress={()=>router.push('/history')} /></Row>
    <View style={{gap:10}}><Txt accessibilityRole="header" style={{fontFamily:fonts.bold,fontSize:20}}>Am I getting stronger?</Txt>
      {available.length>0&&<><Field label="Find logged exercise" placeholder="Search your strength history" value={query} onChangeText={setQuery} /><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{available.filter(e=>e.name.toLowerCase().includes(query.toLowerCase())).slice(0,8).map(e=><Chip key={e.id} label={e.name} selected={e.id===selected} onPress={()=>{setChoice(e.id);setLimit(20);}} />)}</View></>}
    </View>
    {!available.length?<Empty title="A baseline comes first" detail="Save a workout with a completed working set to see exercise history, load records, and an Estimated 1RM chart." />:<>
      <Txt accessibilityRole="header" style={{fontFamily:fonts.bold,fontSize:22,lineHeight:28}}>{exercise.name}</Txt>
      <Row style={{alignItems:'stretch',flexWrap:'wrap'}}><Card style={{flex:1,minWidth:135,padding:14,borderRadius:16}}><Eyebrow>HEAVIEST LOAD</Eyebrow><Txt style={{fontSize:22,lineHeight:30,color:c.champagne,fontFamily:fonts.bold}}>{record.heaviestGrams===0&&exercise.bodyweight?'Bodyweight':record.heaviestGrams!==null?`${formatWeight(record.heaviestGrams,settings.unit)} ${settings.unit}`:'—'}</Txt><Txt tone="muted" style={{fontSize:12}}>All-time working-set record</Txt></Card><Card style={{flex:1,minWidth:135,padding:14,borderRadius:16}}><Eyebrow>Estimated 1RM</Eyebrow><Txt style={{fontSize:22,lineHeight:30,fontFamily:fonts.bold,color:c.aqua}}>{record.estimated1RMGrams!==null?`${formatWeight(record.estimated1RMGrams,settings.unit)} ${settings.unit}`:'—'}</Txt><Txt tone="muted" style={{fontSize:12}}>All-time estimate · 1–12 reps</Txt></Card></Row>
      <Card style={{padding:14,borderRadius:16,gap:6}}><Eyebrow>LAST SESSION COMPARISON</Eyebrow><Txt style={{fontSize:14}}>{delta===null?'One session recorded. A second gives you a comparison.':delta===0?'Matched your previous session’s heaviest working load.':`${delta>0?'+':'−'}${formatWeight(Math.abs(delta),settings.unit)} ${settings.unit} heaviest load versus the previous session.`}</Txt><Txt tone="muted" style={{fontSize:12}}>Compares logged loads, without inferring recovery or muscle growth.</Txt></Card>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[[4,'4 weeks'],[12,'12 weeks'],[0,'All time']].map(([value,label])=><Chip key={value} label={String(label)} selected={range===value} onPress={()=>{setRange(Number(value));setLimit(20);}} />)}</View>
      <Card style={{padding:16,borderRadius:18}}><Eyebrow>Estimated 1RM · {settings.unit.toUpperCase()}</Eyebrow>{points.length?<><TrendChart points={points} unit={settings.unit} label={`${exercise.name} Estimated 1RM`} /><Txt tone="muted" style={{fontSize:12}}>Latest six qualifying sessions in {range?`${range} weeks`:'all time'}. Highest estimate per session.</Txt></>:<Txt tone="muted">No qualifying estimate in this range. Estimates need external load greater than zero and 1–12 completed working-set reps.</Txt>}<Txt tone="muted" style={{fontSize:12}}>1 rep uses recorded load; 2–12 use Epley. An estimate is not a tested maximum.</Txt></Card>
      <View style={{gap:12}}><Eyebrow>LOAD & REP HISTORY · {range?`${range} WEEKS`:'ALL TIME'}</Eyebrow>{!visible.length&&<Txt tone="muted">No completed working sets in this range.</Txt>}{[...visible].reverse().slice(0,limit).map(({workout:w})=><View key={w.id} style={{gap:4,borderBottomWidth:1,borderColor:c.border,paddingBottom:12}}><Row style={{flexWrap:'wrap'}}><Txt style={{fontFamily:fonts.bold,fontSize:14}}>{new Date(w.completedAt!).toLocaleDateString()}</Txt><Txt tone="muted" style={{fontSize:12}}>{w.name}</Txt></Row><Txt tone="muted" style={{fontSize:14}}>{workingSets(w).filter(s=>s.exerciseId===selected).map(({set:s})=>`${formatWeight(s.weightGrams,settings.unit)} ${settings.unit} × ${s.reps}`).join(' · ')}</Txt></View>)}{visible.length>limit&&<Button title="Show more sessions" variant="secondary" onPress={()=>setLimit(limit+20)} />}</View>
    </>}
    {records.length>0&&<Card style={{padding:16,borderRadius:18}}><Eyebrow>RECENT PERSONAL RECORDS</Eyebrow>{records.map((r,i)=><View key={i} style={{gap:2}}><Txt style={{fontFamily:fonts.bold,fontSize:14,color:c.champagne}}>{exerciseFromHistory(r.exerciseId,workouts,customExercises).name} · {r.metric}</Txt><Txt tone="muted" style={{fontSize:12}}>{formatWeight(r.grams,settings.unit)} {settings.unit} · {new Date(r.date).toLocaleDateString()}</Txt></View>)}</Card>}
    <Card style={{padding:16,borderRadius:18}}><Eyebrow>FOUR-WEEK CONSISTENCY</Eyebrow><Txt style={{fontSize:22,lineHeight:30,fontFamily:fonts.bold}}>{Number(consistency.percent.toFixed(1))}%</Txt><WeekBars weeks={consistency.weeks} /><Txt tone="muted" style={{fontSize:12}}>{consistency.total} / {4*profile!.weeklyTarget} planned workouts. Activity above your target still counts.</Txt></Card>
    <Txt tone="muted" style={{fontSize:12}}>Drafts, warm-ups, and incomplete sets are excluded from strength records, volume, and working-set totals. Workouts count only when explicitly finished.</Txt>
  </Screen>;
}
