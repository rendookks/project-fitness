import { router } from 'expo-router';
import { completedWorkouts } from '../domain/calculations';
import { useApp } from '../state/app-context';
import { Button, Card, Eyebrow, Heading, Screen, Txt } from '../ui';
export default function Home() {
  const { profile, workouts } = useApp();
  const active = workouts.find(w => w.status === 'active');
  return <Screen><Eyebrow>PROJECT FITNESS</Eyebrow><Heading>Make today count.</Heading><Txt tone="muted">Your goal: {profile?.goal}</Txt><Card><Txt>{active ? `Ready when you are: ${active.name}` : 'Your next strong session starts here.'}</Txt><Button title={active ? 'Resume workout' : 'Start workout'} icon="play" onPress={() => router.push('/(tabs)/train')} /></Card><Card><Txt>{completedWorkouts(workouts).length} completed workouts</Txt><Txt tone="muted">Active sessions are saved locally and excluded from statistics.</Txt><Button title="View workout history" variant="secondary" onPress={() => router.push('/history')} /></Card></Screen>;
}
