import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { completedWorkouts, workingSets, workoutVolume } from '../domain/calculations';
import { exerciseById } from '../domain/exercises';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Heading, Row, Screen, Txt } from '../ui';
import { Confirm } from '../ui/sheet';

export default function History() {
  const { workouts, profile, settings } = useApp();
  if (!profile) return <Redirect href="/onboarding" />;
  const saved = completedWorkouts(workouts).sort((a,b) => b.completedAt!.localeCompare(a.completedAt!));
  return <Screen><Button title="Back to Today" variant="secondary" onPress={() => router.replace('/(tabs)')} /><Eyebrow>YOUR TRAINING LOG</Eyebrow><Heading>Work, recorded.</Heading><Txt tone="muted">{saved.length} completed {saved.length === 1 ? 'session' : 'sessions'}. Every one adds up.</Txt>
    {!saved.length && <Empty title="Your history starts here" detail="Finish and save a workout to see its sets and training volume here." />}
    {saved.map(w => <Card key={w.id}><Eyebrow>{new Date(w.completedAt!).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</Eyebrow><Txt style={{ fontSize: 20, fontFamily: fonts.bold }}>{w.name}</Txt><Row><Txt tone="muted">{workingSets(w).length} working sets</Txt><Txt tone="muted">{formatWeight(workoutVolume(w), settings.unit)} {settings.unit} volume</Txt></Row><Button title={`Review ${w.name}`} variant="secondary" onPress={() => router.push({ pathname: '/workout/[id]', params: { id: w.id } })} /></Card>)}
  </Screen>;
}
export function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workouts, profile, repository, run, pending, settings } = useApp();
  const [confirm, setConfirm] = useState(false);
  if (!profile) return <Redirect href="/onboarding" />;
  const workout = workouts.find(w => w.id === id);
  return <Screen><Button title="Back to history" variant="secondary" onPress={() => router.replace('/history')} />
    {!workout ? <Empty title="Workout unavailable" detail="This workout may have been deleted from this device." /> : <>
      <Eyebrow>{workout.status === 'completed' ? 'SAVED SESSION' : 'UNFINISHED SESSION'}</Eyebrow><Heading>{workout.name}</Heading><Txt tone="muted">Started {new Date(workout.startedAt).toLocaleString()}</Txt>{workout.completedAt && <Txt tone="muted">Finished {new Date(workout.completedAt).toLocaleString()}</Txt>}
      <Card><Row><View><Eyebrow>WORKING SETS</Eyebrow><Heading>{workingSets(workout).length}</Heading></View><View><Eyebrow>EXTERNAL VOLUME</Eyebrow><Txt style={{ fontFamily: fonts.bold }}>{formatWeight(workoutVolume(workout), settings.unit)} {settings.unit}</Txt></View></Row><Txt tone="muted" style={{ fontSize: 12 }}>Completed working sets only. Unweighted bodyweight sets contribute zero external-load volume.</Txt></Card>
      {workout.exercises.map(ex => <Card key={ex.id}><Txt style={{ fontFamily: fonts.bold, fontSize: 20 }}>{exerciseById(ex.exerciseId).name}</Txt>{ex.sets.length === 0 && <Txt tone="muted">No sets logged.</Txt>}{ex.sets.map((s,i) => <View key={s.id} style={{ borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 10, gap: 2 }}><Row><Txt>{i+1}. {formatWeight(s.weightGrams, settings.unit)} {settings.unit} × {s.reps}</Txt><Txt style={{ color: s.completed ? colors.aqua : colors.muted, fontSize: 12 }}>{s.completed ? 'Completed' : 'Incomplete'}</Txt></Row><Txt tone="muted" style={{ fontSize: 12 }}>{s.kind === 'warmup' ? 'Warm-up · excluded from statistics' : 'Working set'}</Txt></View>)}</Card>)}
      {workout.status === 'active' && <Button title="Resume workout" onPress={() => router.push('/(tabs)/train')} />}
      <Button title="Delete workout" variant="danger" disabled={pending} onPress={() => setConfirm(true)} />
      <Confirm visible={confirm} title="Delete saved workout?" detail="This session and all its sets will be permanently deleted. Statistics and records will be recalculated." busy={pending} onCancel={() => setConfirm(false)} onConfirm={() => { void run(() => repository.deleteWorkout(workout.id)).then(ok => { if (ok) { setConfirm(false); router.replace('/history'); } }); }} />
    </>}
  </Screen>;
}
