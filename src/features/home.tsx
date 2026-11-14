import { router } from 'expo-router';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { completedWorkouts, weeklyConsistency, workingSets } from '../domain/calculations';
import { exerciseFromHistory } from '../domain/exercises';
import { latestWeightRecord } from '../domain/insights';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Heading, Icon, Row, Screen, Txt } from '../ui';
import { TargetRing } from '../ui/charts';

export default function Home() {
  const { profile, workouts, settings } = useApp();
  const {width,fontScale}=useWindowDimensions();
  const stacked=width<360||fontScale>1.2;
  const saved=completedWorkouts(workouts).sort((a,b)=>b.completedAt!.localeCompare(a.completedAt!));
  const active=workouts.find(w=>w.status==='active');
  const weeks=weeklyConsistency(workouts,profile!.weeklyTarget); const current=weeks.weeks[3];
  const record=latestWeightRecord(workouts);
  return <Screen>
    <Row><View style={{gap:4}}><Eyebrow>PROJECT FITNESS</Eyebrow><Txt tone="muted" style={{fontSize:12}}>{new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</Txt></View><Pressable accessibilityRole="button" accessibilityLabel="Open Settings" onPress={()=>router.push('/settings')} style={{minWidth:48,minHeight:48,borderRadius:16,backgroundColor:c.surface,alignItems:'center',justifyContent:'center'}}><Icon name="sliders" color={c.text} /></Pressable></Row>
    <View style={{gap:8}}><Heading>Make today count.</Heading><Txt tone="muted">Small steps. Lasting strength.</Txt></View>
    <Card style={{backgroundColor:c.elevated,borderColor:'#41415F',gap:20,padding:24}}>
      <Row style={{alignItems:'flex-start',gap:16,flexDirection:stacked?'column':'row'}}><View style={{flex:stacked?undefined:1,gap:12,width:stacked?'100%':undefined}}><Eyebrow>YOUR NEXT CHAPTER</Eyebrow><Txt style={{fontSize:26,lineHeight:33,fontFamily:fonts.extra,letterSpacing:-.7}}>{active?'Pick up where\nyou left off.':'Train with\nintention.'}</Txt></View><TargetRing count={current.count} target={current.target} /></Row>
      <Txt tone="muted" style={{fontSize:14}}>{active?active.name:`Focused on you. Your goal: ${profile!.goal.toLocaleLowerCase()}.`}</Txt>
      <Button title={active?'Resume workout':'Start workout'} icon={active?'arrow-right':'play'} onPress={()=>router.push('/(tabs)/train')} />
    </Card>
    <Row style={{alignItems:'stretch'}}><View style={{flex:1,gap:8,paddingLeft:4}}><Eyebrow>THIS WEEK</Eyebrow><Txt style={{fontSize:30,lineHeight:38,fontFamily:fonts.extra}}>{current.count}<Txt tone="muted" style={{fontSize:16}}> / {current.target}</Txt></Txt><Txt tone="muted" style={{fontSize:12}}>workouts completed</Txt></View><View style={{width:1,backgroundColor:c.border}} /><View style={{flex:1,gap:8,paddingLeft:16}}><Eyebrow>FOUR WEEKS</Eyebrow><Txt style={{fontSize:30,lineHeight:38,fontFamily:fonts.extra}}>{Number(weeks.percent.toFixed(1))}%</Txt><Txt tone="muted" style={{fontSize:12}}>{weeks.total} / {profile!.weeklyTarget*4} planned workouts</Txt></View></Row>
    <Pressable accessibilityRole="button" accessibilityLabel="View Progress" onPress={()=>router.push('/(tabs)/progress')} style={{borderBottomWidth:1,borderColor:c.border,paddingVertical:12}}><Row><Txt style={{fontFamily:fonts.bold}}>See the bigger picture</Txt><Icon name="arrow-up-right" color={c.iris} /></Row></Pressable>
    <View style={{gap:16}}><Row><Txt accessibilityRole="header" style={{fontSize:20,fontFamily:fonts.bold}}>Recent sessions</Txt><Icon name="clock" /></Row>
      {!saved.length?<Empty title="Your first chapter awaits" detail="Finish your first workout to start a history you can build on." />:saved.slice(0,3).map(w=><Pressable key={w.id} accessibilityRole="button" accessibilityLabel={`Open ${w.name}`} onPress={()=>router.push({pathname:'/workout/[id]',params:{id:w.id}})} style={{paddingVertical:12,borderBottomWidth:1,borderColor:c.border}}><Row><View style={{flex:1,gap:4}}><Txt style={{fontFamily:fonts.bold}}>{w.name}</Txt><Txt tone="muted" style={{fontSize:12}}>{new Date(w.completedAt!).toLocaleDateString(undefined,{month:'short',day:'numeric'})} · {workingSets(w).length} working sets</Txt></View><Icon name="arrow-right" size={18} /></Row></Pressable>)}
      <Button title="View workout history" variant="secondary" onPress={()=>router.push('/history')} />
    </View>
    <Card style={{borderColor:record?'#584637':c.border}}><Row><Eyebrow>LATEST WEIGHT RECORD</Eyebrow><Icon name="award" color={c.champagne} /></Row>{record?<><Txt style={{color:c.champagne,fontSize:30,lineHeight:38,fontFamily:fonts.extra}}>{formatWeight(record.grams,settings.unit)} <Txt tone="muted">{settings.unit}</Txt></Txt><Txt style={{fontFamily:fonts.bold}}>{exerciseFromHistory(record.exerciseId, workouts).name}</Txt><Txt tone="muted" style={{fontSize:12}}>Heaviest completed working set · {new Date(record.date).toLocaleDateString()}</Txt></>:<Txt tone="muted">Your first completed working set with external load will establish a record.</Txt>}</Card>
    <Card><Row><Icon name="zap" color={c.iris} /><Eyebrow>AI COACH / PROTOTYPE</Eyebrow></Row><Txt style={{fontSize:20,fontFamily:fonts.bold}}>Understand your training.</Txt><Txt tone="muted" style={{fontSize:14}}>Clear observations from your log. Deterministic rules, with the numbers behind them.</Txt><Button title="AI Coach · Rule-based Insights" variant="secondary" onPress={()=>router.push('/insights')} /></Card>
    <Button title="Explore Recovery" variant="secondary" icon="moon" onPress={()=>router.push('/recovery')} />
    <Txt tone="muted" style={{fontSize:12,textAlign:'center'}}>TRACK → UNDERSTAND → IMPROVE</Txt>
  </Screen>;
}
