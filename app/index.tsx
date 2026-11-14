import { Redirect } from 'expo-router';
import { useApp } from '../src/state/app-context';
export default function Index() {
  const { profile } = useApp(); return <Redirect href={profile ? '/(tabs)' : '/onboarding'} />;
}
