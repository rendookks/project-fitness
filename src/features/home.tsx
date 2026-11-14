import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { completedWorkouts, weeklyConsistency, workingSets } from '../domain/calculations';
import { exerciseFromHistory } from '../domain/exercises';
import { latestWeightRecord } from '../domain/insights';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Heading, Icon, Row, Screen, Txt } from '../ui';

export default function Home() {
  const { profile, workouts, settings, routines, repository, run, pending } = useApp();
  const saved=completedWorkouts(workouts).sort((a,b)=>b.completedAt!.localeCompare(a.completedAt!));
  const active=workouts.find(w=>w.status==='active');
  const current=weeklyConsistency(workouts,profile!.weeklyTarget).weeks[3];
  const record=latestWeightRecord(workouts);const next=routines[0];
  const start=(id:string)=>{void run(()=>repository.startRoutine(id)).then(ok=>{if(ok)router.push('/(tabs)/train');});};
  return <Screen>
    <Row><View style={{gap:4}}><Eyebrow>PROJECT FITNESS</Eyebrow><Txt tone="muted" style={{fontSize:12}}>{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</Txt></View><Pressable accessibilityRole="button" accessibilityLabel="Open Settings" onPress={()=>router.push('/settings')} style={{minWidth:48,minHeight:48,borderRadius:16,backgroundColor:c.surface,alignItems:'center',justifyContent:'center'}}><Icon name="sliders" color={c.text} /></Pressable></Row>
    <Heading>Make today count.</Heading>
    <Card style={{backgroundColor:c.elevated,borderColor:'#41415F',gap:14,padding:20}}>
      <Row><Eyebrow>{active?'IN PROGRESS':'NEXT WORKOUT'}</Eyebrow><Icon name={active?'activity':'play'} color={c.iris} /></Row>
      <Txt style={{fontSize:26,lineHeight:34,fontFamily:fonts.extra,letterSpacing:-.7}}>{active?active.name:next?next.name:'Your routine starts here.'}</Txt>
      <Txt tone="muted" style={{fontSize:14}}>{active?`${active.exercises.length} ${active.exercises.length===1?'exercise':'exercises'} · ${active.exercises.reduce((n,e)=>n+e.sets.filter(s=>s.completed).length,0)} sets completed · saved locally`:next?`${next.exercises.length} ${next.exercises.length===1?'exercise':'exercises'}, ready to go. Previous performance fills in when available.`:'Choose your movements and targets once. Come back ready to lift.'}</Txt>
      <Button title={active?'Resume workout':next?`Start routine · ${next.name}`:'Create your first routine'} icon={active?'arrow-right':'play'} disabled={pending} onPress={()=>{if(active||!next)router.push('/(tabs)/train');else start(next.id);}} />
      <Button title="All routines & freestyle" variant="secondary" onPress={()=>router.push('/(tabs)/train')} />
    </Card>
    {routines.length>1&&!active&&<View style={{gap:8}}><Eyebrow>YOUR OTHER ROUTINES</Eyebrow>{routines.slice(1,4).map(r=><Button key={r.id} title={`Start routine · ${r.name}`} variant="secondary" disabled={pending} onPress={()=>start(r.id)} />)}</View>}
    <Row style={{alignItems:'stretch'}}><View style={{flex:1,gap:4}}><Eyebrow>THIS WEEK</Eyebrow><Txt style={{fontSize:28,lineHeight:36,fontFamily:fonts.extra}}>{current.count}<Txt tone="muted"> / {current.target}</Txt></Txt><Txt tone="muted" style={{fontSize:12}}>workouts completed</Txt></View><View style={{flex:1,gap:4}}><Eyebrow>ALL TIME</Eyebrow><Txt style={{fontSize:28,lineHeight:36,fontFamily:fonts.extra,color:c.aqua}}>{saved.length}</Txt><Txt tone="muted" style={{fontSize:12}}>sessions recorded</Txt></View></Row>
    <View style={{gap:10}}><Row><Txt accessibilityRole="header" style={{fontSize:20,fontFamily:fonts.bold}}>Recent training</Txt><Icon name="clock" /></Row>
      {!saved.length?<Empty title="Your baseline comes first" detail="Finish a workout to begin your strength history. No sessions or records are invented." />:saved.slice(0,3).map(w=><Pressable key={w.id} accessibilityRole="button" accessibilityLabel={`Open ${w.name}`} onPress={()=>router.push({pathname:'/workout/[id]',params:{id:w.id}})} style={{paddingVertical:12,borderBottomWidth:1,borderColor:c.border}}><Row><View style={{flex:1,gap:4}}><Txt style={{fontFamily:fonts.bold}}>{w.name}</Txt><Txt tone="muted" style={{fontSize:12}}>{new Date(w.completedAt!).toLocaleDateString(undefined,{month:'short',day:'numeric'})} · {workingSets(w).length} working sets</Txt></View><Icon name="arrow-right" size={18} /></Row></Pressable>)}
      <Button title="View workout history" variant="secondary" onPress={()=>router.push('/history')} />
    </View>
    {record&&<Card style={{padding:16,borderRadius:18,borderColor:'#584637'}}><Row><Eyebrow>{record.previous===null?'LOAD BASELINE':'LATEST LOAD RECORD'}</Eyebrow><Icon name="award" color={c.champagne} /></Row><Txt style={{color:c.champagne,fontSize:26,lineHeight:34,fontFamily:fonts.extra}}>{formatWeight(record.grams,settings.unit)} {settings.unit}</Txt><Txt style={{fontFamily:fonts.bold}}>{exerciseFromHistory(record.exerciseId,workouts).name}</Txt><Txt tone="muted" style={{fontSize:12}}>Completed working set · {new Date(record.date).toLocaleDateString()}</Txt></Card>}
    <Row style={{flexWrap:'wrap'}}><Button title="View Progress" variant="secondary" icon="trending-up" onPress={()=>router.push('/(tabs)/progress')} /><Button title="Progression targets" variant="secondary" icon="zap" onPress={()=>router.push('/(tabs)/coach')} /></Row>
  </Screen>;
}
