import Feather from '@expo/vector-icons/Feather';
import { ComponentProps, PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextProps, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors as c, fonts } from '../theme/tokens';

export function Txt({ style, tone = 'normal', ...props }: TextProps & { tone?: 'normal' | 'muted' | 'accent' }) {
  return <Text {...props} style={[s.text, tone === 'muted' && { color: c.muted }, tone === 'accent' && { color: c.iris }, style]} />;
}
export function Heading({ children }: PropsWithChildren) { return <Txt accessibilityRole="header" style={s.heading}>{children}</Txt>; }
export function Eyebrow({ children }: PropsWithChildren) { return <Txt style={s.eyebrow}>{children}</Txt>; }
export function Icon({ name, color = c.muted, size = 20 }: { name: ComponentProps<typeof Feather>['name']; color?: string; size?: number }) {
  return <Feather name={name} color={color} size={size} accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" />;
}
export function Button({ title, onPress, variant = 'primary', disabled, icon, testID }: {
  title: string; onPress: () => void; variant?: 'primary' | 'secondary' | 'danger'; disabled?: boolean;
  icon?: ComponentProps<typeof Feather>['name']; testID?: string;
}) {
  const color = variant === 'primary' ? c.ink : variant === 'danger' ? c.danger : c.text;
  return <Pressable testID={testID} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [s.button, variant === 'primary' ? { backgroundColor: c.iris } : { backgroundColor: c.elevated }, { opacity: disabled ? 0.45 : pressed ? 0.75 : 1 }]}>
    {icon && <Icon name={icon} color={color} />}<Txt style={{ fontFamily: fonts.bold, color, textAlign: 'center' }}>{title}</Txt>
  </Pressable>;
}
export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) { return <View style={[s.card, style]}>{children}</View>; }
export function Row({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) { return <View style={[s.row, style]}>{children}</View>; }
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={{ gap: 8, flex: 1 }}><Txt style={s.label}>{label}</Txt><TextInput accessibilityLabel={label} placeholderTextColor={c.muted} selectionColor={c.iris} {...props} style={[s.input, props.style]} /></View>;
}
export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: !!selected }} onPress={onPress} style={({ pressed }) => [s.chip, selected && { backgroundColor: c.iris, borderColor: c.iris }, pressed && { opacity: .75 }]}>
    <Txt style={{ fontSize: 14, fontFamily: fonts.bold, color: selected ? c.ink : c.muted }}>{label}</Txt>
  </Pressable>;
}
export function Screen({ children }: PropsWithChildren) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={s.screen}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>{children}</ScrollView></SafeAreaView>;
}
export function Loading({ message = 'Opening your training space…' }: { message?: string }) {
  return <SafeAreaView style={[s.screen, s.center]}><ActivityIndicator color={c.iris} /><Txt tone="muted">{message}</Txt></SafeAreaView>;
}
export function Empty({ title, detail }: { title: string; detail: string }) {
  return <Card><Icon name="activity" color={c.iris} /><Txt style={{ fontSize: 20, fontFamily: fonts.bold }}>{title}</Txt><Txt tone="muted">{detail}</Txt></Card>;
}
const s = StyleSheet.create({
  text: { color: c.text, fontSize: 16, lineHeight: 24, fontFamily: fonts.regular, fontVariant: ['tabular-nums'] },
  heading: { fontSize: 30, lineHeight: 38, fontFamily: fonts.extra, letterSpacing: -1 },
  eyebrow: { color: c.muted, fontFamily: fonts.bold, fontSize: 12, letterSpacing: 2, lineHeight: 18 },
  label: { fontSize: 12, color: c.muted, fontFamily: fonts.bold },
  button: { minHeight: 52, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 },
  card: { padding: 20, borderRadius: 24, backgroundColor: c.surface, gap: 12, borderWidth: 1, borderColor: c.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' },
  input: { minHeight: 52, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.background, color: c.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, fontFamily: fonts.medium },
  chip: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: c.border, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, backgroundColor: c.background },
  content: { padding: 20, paddingBottom: 40, gap: 24, width: '100%', maxWidth: 720, alignSelf: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
});
