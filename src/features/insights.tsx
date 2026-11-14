import { Redirect } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { exerciseFromHistory } from '../domain/exercises';
import { buildInsights } from '../domain/insights';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Heading, Screen, Txt } from '../ui';
import { ProgressionCard } from './progression-card';
export default function Coach() {
  const {profile,settings,workouts,routines,customExercises}=useApp();const [limit,setLimit]=useState(8);
  if(!profile)return <Redirect href="/onboarding" />;
  const ids=[...new Set([...routines.flatMap(r=>r.exercises.map(e=>e.exerciseId)),...workouts.flatMap(w=>w.exercises.map(e=>e.exerciseId))])];
  const insights=buildInsights(workouts,profile.weeklyTarget,settings.unit);
  return <Screen><Eyebrow>COACH / RULE-BASED PROGRESSION</Eyebrow><Heading>Your next small step.</Heading><Txt tone="muted">Transparent targets from your completed working sets. Fixed rules, with the evidence behind each suggestion.</Txt>
    <Card style={{padding:16,borderRadius:18}}><Txt style={{fontFamily:fonts.bold}}>You stay in control.</Txt><Txt tone="muted" style={{fontSize:13}}>Suggestions are optional first-set targets. Two comparable sessions plus a uniform routine rep goal are required for an increase. They are not recovery, readiness, or medical assessments. Adjust loads to the equipment you actually have.</Txt></Card>
    {!ids.length&&<Empty title="Your training comes first" detail="Create a routine and complete working sets. With one session we suggest repeating; stronger evidence can support a small next step." />}
    {ids.slice(0,limit).map(id=><Card key={id} style={{padding:16,borderRadius:18}}><Txt style={{fontFamily:fonts.bold,fontSize:18}}>{exerciseFromHistory(id,workouts,customExercises).name}</Txt><ProgressionCard exerciseId={id} /></Card>)}
    {ids.length>limit&&<Button title="Show more movements" variant="secondary" onPress={()=>setLimit(limit+8)} />}
    <Eyebrow>RULE-BASED INSIGHTS</Eyebrow>{insights.map(insight=><View key={insight.id} style={{gap:6,borderBottomWidth:1,borderColor:colors.border,paddingBottom:16}}><Txt style={{fontFamily:fonts.bold}}>{insight.title}</Txt><Txt style={{fontSize:13,color:colors.aqua}}>{insight.evidence}</Txt><Txt tone="muted" style={{fontSize:12}}>{insight.note}</Txt></View>)}
  </Screen>;
}
