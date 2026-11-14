import { Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold, useFonts } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/tokens';
import { Loading } from '../src/ui';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold });
  if (!loaded && !error) return <SafeAreaProvider><Loading /></SafeAreaProvider>;
  return <SafeAreaProvider><StatusBar style="light" /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} /></SafeAreaProvider>;
}
