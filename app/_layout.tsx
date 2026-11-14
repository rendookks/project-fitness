import { InputAccessoryView, Keyboard, Platform, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Manrope_400Regular } from '@expo-google-fonts/manrope/400Regular';
import { Manrope_500Medium } from '@expo-google-fonts/manrope/500Medium';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { Manrope_800ExtraBold } from '@expo-google-fonts/manrope/800ExtraBold';
import { AppProvider } from '../src/state/app-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/tokens';
import { Button, Loading } from '../src/ui';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold });
  if (!loaded && !error) return <SafeAreaProvider><Loading /></SafeAreaProvider>;
  return <SafeAreaProvider><StatusBar style="light" /><AppProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />{Platform.OS === 'ios' && <InputAccessoryView nativeID="set-done"><View style={{padding:8,backgroundColor:colors.elevated}}><Button title="Done editing" onPress={Keyboard.dismiss} /></View></InputAccessoryView>}</AppProvider></SafeAreaProvider>;
}
