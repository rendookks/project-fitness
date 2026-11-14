import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Chip, Eyebrow, Heading, Row, Screen, Txt } from '../ui';
import { Confirm } from '../ui/sheet';

export default function Settings() {
  const {profile,repository,settings,run,pending}=useApp(); const [reset,setReset]=useState(false);
  if(!profile) return <Redirect href="/onboarding" />;
  return <Screen><Button title="Back to Today" variant="secondary" onPress={()=>router.replace('/(tabs)')} /><Eyebrow>SETTINGS / MAKE IT YOURS</Eyebrow><Heading>Your training space.</Heading>
    <Card><Txt style={{fontFamily:fonts.bold,fontSize:20}}>Weight units</Txt><Txt tone="muted" style={{fontSize:14}}>Your records always keep their original integer-gram values. Switching units only changes the display.</Txt><Row><View style={{flex:1}}><Chip label="Kilograms (kg)" selected={settings.unit==='kg'} onPress={()=>{if(!pending)void run(()=>repository.setUnit('kg'));}} /></View><View style={{flex:1}}><Chip label="Pounds (lb)" selected={settings.unit==='lb'} onPress={()=>{if(!pending)void run(()=>repository.setUnit('lb'));}} /></View></Row></Card>
    <Card><Eyebrow>YOUR STARTING POINT</Eyebrow><Txt style={{fontFamily:fonts.bold}}>{profile.goal}</Txt><Txt tone="muted">{profile.experience} · {profile.weeklyTarget} workouts per week</Txt><Txt tone="muted" style={{fontSize:14}}>{profile.equipment.join(' · ')}</Txt></Card>
    <Card><Eyebrow>LOCAL BY DESIGN</Eyebrow><Txt tone="muted" style={{fontSize:14}}>No account, analytics SDK, AI API, or cloud synchronization. Workout records stay on this device. Local SQLite is not encrypted. Uninstalling the app or clearing its storage can remove your data.</Txt><Txt tone="muted" style={{fontSize:14}}>Prototype 0.1.0 · Expo SDK 54</Txt><Txt tone="muted" style={{fontSize:12}}>Built for a focused training loop. AI Coach uses deterministic rules. Fuel, Learn, and Recovery are informational previews.</Txt></Card>
    <Card style={{borderColor:'#553D48'}}><Txt style={{fontFamily:fonts.bold,color:colors.danger}}>Reset real data</Txt><Txt tone="muted" style={{fontSize:14}}>Erase this device’s profile, settings, and workouts in project_fitness.db. Onboarding will start again.</Txt><Button title="Reset real database" variant="danger" disabled={pending} onPress={()=>setReset(true)} /></Card>
    <Confirm visible={reset} title="Reset real database?" detail="This permanently deletes ONLY project_fitness.db records: your profile, settings, and all real workouts on this device. This cannot be undone. Onboarding will restart." confirmLabel="Reset real data" busy={pending} onCancel={()=>setReset(false)} onConfirm={()=>{void run(()=>repository.reset()).then(ok=>{if(ok){setReset(false);router.replace('/onboarding');}});}} />
  </Screen>;
}
