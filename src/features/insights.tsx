import { Redirect, router } from 'expo-router';
import { buildInsights } from '../domain/insights';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Eyebrow, Heading, Screen, Txt } from '../ui';
export default function Insights() {
  const {profile,settings,workouts}=useApp();
  if(!profile)return <Redirect href="/onboarding" />;
  const insights=buildInsights(workouts,profile.weeklyTarget,settings.unit);
  return <Screen><Button title="Back to Today" variant="secondary" onPress={()=>router.replace('/(tabs)')} /><Eyebrow>AI COACH / DETERMINISTIC PROTOTYPE</Eyebrow><Heading>Rule-based Insights</Heading><Txt tone="muted">Your log, made clearer. These observations follow fixed rules using your saved workouts. No chat, generated AI, or health assessment.</Txt>{insights.map((insight,i)=><Card key={insight.id}><Txt style={{color:colors.iris,fontFamily:fonts.bold,fontSize:12}}>OBSERVATION {String(i+1).padStart(2,'0')}</Txt><Txt style={{fontFamily:fonts.bold,fontSize:20,lineHeight:28}}>{insight.title}</Txt><Txt style={{color:colors.aqua,fontSize:14}}>{insight.evidence}</Txt><Txt tone="muted" style={{fontSize:14}}>{insight.note}</Txt></Card>)}</Screen>;
}
