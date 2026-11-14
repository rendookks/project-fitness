import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { Equipment, Experience, FitnessGoal, WeightUnit } from '../domain/models';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Chip, Eyebrow, Heading, Icon, Screen, Txt } from '../ui';

const goals: FitnessGoal[] = ['Build muscle', 'Get stronger', 'Lose fat', 'Build consistency'];
const levels: Experience[] = ['New to training', 'Some experience', 'Experienced'];
const equipmentOptions: Equipment[] = ['Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Cable'];
export default function Onboarding() {
  const { profile, repository, run, pending } = useApp();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<FitnessGoal>('Build muscle');
  const [experience, setExperience] = useState<Experience>('Some experience');
  const [weeklyTarget, setTarget] = useState(3);
  const [equipment, setEquipment] = useState<Equipment[]>(['Bodyweight', 'Dumbbells', 'Barbell']);
  const [unit, setUnit] = useState<WeightUnit>('kg');
  if (profile) return <Redirect href="/(tabs)" />;
  return <Screen><View style={{ gap: 24 }}><Eyebrow>PROJECT FITNESS</Eyebrow><View style={{ height: 4, flexDirection: 'row', gap: 6 }}>{[0,1,2].map(i => <View key={i} style={{ flex: 1, borderRadius: 4, backgroundColor: i <= step ? colors.iris : colors.elevated }} />)}</View>
    <Txt tone="accent" style={{ fontSize: 12, fontFamily: fonts.bold }}>YOUR STARTING POINT · {step + 1} / 3</Txt>
    <Heading>{['Every stronger day\nstarts somewhere.', 'Make room\nfor your training.', 'Your tools.\nYour training.'][step]}</Heading>
    <Txt tone="muted">{['A few choices to make this space yours. Everything stays on this device.', 'Choose a target you can return to each week. Consistency starts with showing up.', 'We’ll use your preferred weight units. You can switch later without changing your records.'][step]}</Txt>
    {step === 0 && <><Card><Icon name="target" color={colors.iris} /><Txt style={{ fontFamily: fonts.bold }}>What brings you here?</Txt>{goals.map(g => <Chip key={g} label={g} selected={goal === g} onPress={() => setGoal(g)} />)}</Card><Txt style={{ fontFamily: fonts.bold }}>Training experience</Txt>{levels.map(l => <Chip key={l} label={l} selected={experience === l} onPress={() => setExperience(l)} />)}</>}
    {step === 1 && <Card><Txt tone="muted">WORKOUTS PER WEEK</Txt><Txt style={{ fontSize: 64, lineHeight: 80, fontFamily: fonts.extra, color: colors.iris }}>{weeklyTarget.toString().padStart(2, '0')}</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{[1,2,3,4,5,6,7].map(n => <Chip key={n} label={String(n)} selected={n === weeklyTarget} onPress={() => setTarget(n)} />)}</View><Txt tone="muted">Your target is a guide, not a limit.</Txt></Card>}
    {step === 2 && <><Txt style={{ fontFamily: fonts.bold }}>Available equipment</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{equipmentOptions.map(e => <Chip key={e} label={e} selected={equipment.includes(e)} onPress={() => setEquipment(old => old.includes(e) ? old.filter(x => x !== e) : [...old, e])} />)}</View><Txt style={{ fontFamily: fonts.bold }}>Preferred weight units</Txt><View style={{ flexDirection: 'row', gap: 12 }}><Chip label="Kilograms (kg)" selected={unit === 'kg'} onPress={() => setUnit('kg')} /><Chip label="Pounds (lb)" selected={unit === 'lb'} onPress={() => setUnit('lb')} /></View></>}
    <Button title={pending ? 'Saving your preferences…' : step === 2 ? 'Let’s build momentum' : 'Continue'} disabled={pending || (step === 2 && !equipment.length)} icon="arrow-right" onPress={() => {
      if (step < 2) { setStep(step + 1); return; }
      void run(() => repository.onboard({ id: 'local', goal, experience, weeklyTarget, equipment, onboardingCompletedAt: new Date().toISOString() }, { unit })).then(ok => { if (ok) router.replace('/(tabs)'); });
    }} />
    {step > 0 && <Button title="Back" variant="secondary" disabled={pending} onPress={() => setStep(step - 1)} />}
    <Txt tone="muted" style={{ fontSize: 12, textAlign: 'center' }}>Local by design. No account. No tracking SDK.</Txt>
  </View></Screen>;
}
