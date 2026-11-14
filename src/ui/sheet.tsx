import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDemoLayout } from '../state/mode-layout';
import { colors } from '../theme/tokens';
import { Button, Heading, Txt } from './index';

export function Sheet({ visible, title, onClose, children }: PropsWithChildren<{ visible: boolean; title: string; onClose: () => void }>) {
  const demo=useDemoLayout();
  return <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
    <SafeAreaView style={s.backdrop}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.avoid}>
        <View style={s.sheet} accessibilityViewIsModal>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.content}>
            <>{demo&&<Txt style={{fontSize:12,color:colors.champagne}}>DEMO MODE · Fictional training records</Txt>}</><Heading>{title}</Heading>{children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}
export function Confirm({ title, detail, visible, onCancel, onConfirm, confirmLabel = 'Delete', busy = false }: {
  title: string; detail: string; visible: boolean; onCancel: () => void; onConfirm: () => void; confirmLabel?: string; busy?: boolean;
}) {
  return <Sheet visible={visible} title={title} onClose={() => { if (!busy) onCancel(); }}><Txt tone="muted">{detail}</Txt><Button title={confirmLabel} variant={confirmLabel === 'Delete' || confirmLabel.includes('Reset') ? 'danger' : 'primary'} onPress={onConfirm} disabled={busy} /><Button title="Cancel" variant="secondary" onPress={onCancel} disabled={busy} /></Sheet>;
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', padding: 16 },
  avoid: { width: '100%', maxWidth: 640, maxHeight: '94%', alignSelf: 'center' },
  sheet: { backgroundColor: colors.surface, borderRadius: 24, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  content: { gap: 20, padding: 24, paddingBottom: 32 },
});
