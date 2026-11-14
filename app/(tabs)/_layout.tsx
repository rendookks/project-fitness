import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { useApp } from '../../src/state/app-context';
import { colors as c, fonts } from '../../src/theme/tokens';
export default function TabsLayout() {
  const { profile } = useApp();
  if (!profile) return <Redirect href="/onboarding" />;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: c.iris, tabBarInactiveTintColor: c.muted, tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border, minHeight: 70, paddingTop: 8, paddingBottom: 8 }, tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 }, sceneStyle: { backgroundColor: c.background } }}>
    <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <Feather name="grid" size={21} color={color} /> }} />
    <Tabs.Screen name="train" options={{ title: 'Train', tabBarIcon: ({ color }) => <Feather name="activity" size={21} color={color} /> }} />
  </Tabs>;
}
