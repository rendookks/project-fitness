import Feather from '@expo/vector-icons/Feather';
import { Redirect, Tabs } from 'expo-router';
import { useApp } from '../../src/state/app-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors as c, fonts } from '../../src/theme/tokens';
export default function TabsLayout() {
  const { profile } = useApp();
  const insets = useSafeAreaInsets();
  if (!profile) return <Redirect href="/onboarding" />;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: c.iris, tabBarInactiveTintColor: c.muted, tabBarStyle: { backgroundColor: c.background, borderTopColor: c.border, height: 64 + Math.max(insets.bottom, 8), paddingTop: 8, paddingBottom: Math.max(insets.bottom, 8) }, tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 }, sceneStyle: { backgroundColor: c.background } }}>
    <Tabs.Screen name="index" options={{ title: 'Today', tabBarAccessibilityLabel: 'Today', tabBarIcon: ({ color }) => <Feather name="grid" size={21} color={color ?? c.muted} accessible={false} aria-hidden /> }} />
    <Tabs.Screen name="train" options={{ title: 'Train', tabBarAccessibilityLabel: 'Train', tabBarIcon: ({ color }) => <Feather name="activity" size={21} color={color ?? c.muted} accessible={false} aria-hidden /> }} />
    <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarAccessibilityLabel: 'Progress', tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={21} color={color ?? c.muted} accessible={false} aria-hidden /> }} />
    <Tabs.Screen name="fuel" options={{ title: 'Fuel', tabBarAccessibilityLabel: 'Fuel', tabBarIcon: ({ color }) => <Feather name="coffee" size={21} color={color ?? c.muted} accessible={false} aria-hidden /> }} />
    <Tabs.Screen name="learn" options={{ title: 'Learn', tabBarAccessibilityLabel: 'Learn', tabBarIcon: ({ color }) => <Feather name="book-open" size={21} color={color ?? c.muted} accessible={false} aria-hidden /> }} />
  </Tabs>;
}
