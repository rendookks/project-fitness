import { Redirect, router } from 'expo-router';
import { View } from 'react-native';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Eyebrow, Heading, Icon, Screen, Txt } from '../ui';

const content = {
  fuel: { section:'FUEL',title:'Fuel the work.',subtitle:'A more complete picture starts with what supports your training.',icon:'coffee' as const,color:c.aqua,words:['INTENTION','NOURISHMENT','CONSISTENCY'],description:'A considered space for nutrition is on the roadmap. This preview does not log food, count calories, or calculate nutrition targets.',items:[['A place for daily context','Future nutrition tools could connect food choices with the training you record.'],['Built around understanding','Food logging and AI-powered food assistance are planned for a separate milestone.']] },
  learn: { section:'LEARN',title:'Understand the why.',subtitle:'Turn curiosity into a more informed approach to training.',icon:'book-open' as const,color:c.iris,words:['TRACK','UNDERSTAND','LEARN'],description:'The future Fitness Academy is a place for structured fitness education. This preview contains no lessons, quizzes, or completion tracking.',items:[['Clarity before complexity','Future learning paths could cover training principles, nutrition basics, and interpreting your own data.'],['Your log is already a teacher','Explore your workout history and rule-based observations to see exactly what you recorded.']] },
  recovery: { section:'RECOVERY',title:'Room to rebuild.',subtitle:'Training is one part of your week. Give the rest some space.',icon:'moon' as const,color:c.champagne,words:['REST','REFLECT','RETURN'],description:'A future space for recovery context. This screen does not track sleep, steps, readiness, or physiological measurements. No health data is connected.',items:[['Context, when you need it','Sleep and activity integrations belong to a later milestone with separate permissions and validation.'],['Keep the picture honest','Your workout history records training, not recovery. No recovery score is inferred from your sessions.']] },
};
export function Information({kind}:{kind:keyof typeof content}) {
  const {profile}=useApp(); if(!profile)return <Redirect href="/onboarding" />;
  const item=content[kind];
  return <Screen>{kind==='recovery'&&<Button title="Back to Today" variant="secondary" onPress={()=>router.replace('/(tabs)')} />}<Eyebrow>{item.section} / A LOOK AHEAD</Eyebrow>
    <View style={{height:192,borderRadius:32,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
      {[160,120,80].map((size,i)=><View key={size} style={{position:'absolute',width:size,height:size,borderRadius:size/2,borderWidth:1,borderColor:item.color,opacity:.08+i*.08}} />)}<Icon name={item.icon} size={36} color={item.color} />
      <View style={{position:'absolute',bottom:18,flexDirection:'row',gap:12}}>{item.words.map(word=><Txt key={word} style={{fontSize:9,lineHeight:14,letterSpacing:1.5,color:c.muted,fontFamily:fonts.bold}}>{word}</Txt>)}</View>
    </View><Heading>{item.title}</Heading><Txt tone="muted">{item.subtitle}</Txt>
    <Card style={{borderColor:'#3A4354'}}><Txt style={{fontSize:12,fontFamily:fonts.bold,color:item.color,letterSpacing:1}}>INFORMATIONAL PREVIEW</Txt><Txt tone="muted" style={{fontSize:14}}>{item.description}</Txt></Card>
    {item.items.map(([title,description],i)=><View key={title} style={{gap:10,paddingVertical:12,borderBottomWidth:1,borderBottomColor:c.border}}><Txt style={{fontSize:12,color:item.color,fontFamily:fonts.bold}}>0{i+1}</Txt><Txt style={{fontSize:20,fontFamily:fonts.bold}}>{title}</Txt><Txt tone="muted" style={{fontSize:14}}>{description}</Txt></View>)}
    <Button title={kind==='learn'?'Explore Rule-based Insights':'Back to training'} variant="secondary" onPress={()=>router.push(kind==='learn'?'/insights':'/(tabs)/train')} />
  </Screen>;
}
