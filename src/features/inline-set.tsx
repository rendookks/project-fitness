import { useRef, useState } from 'react';
import { Keyboard, Pressable, TextInput, View } from 'react-native';
import { ExerciseSet, WeightUnit } from '../domain/models';
import { editableWeight, parseReps, parseWeight } from '../domain/units';
import { colors as c, fonts } from '../theme/tokens';
import { Icon, Row, Txt } from '../ui';

/** Local numeric drafts may be invalid; only validated values cross the storage boundary. */
export function InlineSet({ set, index, exerciseName, unit, onSave, onDetails, record }: {
  set: ExerciseSet; index: number; exerciseName: string; unit: WeightUnit;
  record?: string;
  onSave: (patch: Partial<ExerciseSet>) => Promise<boolean>; onDetails: () => void;
}) {
  const initial = editableWeight(set.weightGrams, unit);
  const [weight, setWeight] = useState(initial);
  const [reps, setReps] = useState(String(set.reps));
  const [error, setError] = useState('');
  const draft = useRef({ weight: initial, reps: String(set.reps) });
  const completing = useRef(false);
  const save = async (completed?: boolean) => {
    try {
      const weightGrams = draft.current.weight === initial ? set.weightGrams : parseWeight(draft.current.weight, unit);
      const nextReps = parseReps(draft.current.reps);
      setError('');
      const ok = await onSave({ weightGrams, reps: nextReps, ...(completed === undefined ? {} : { completed }) });
      if (!ok) setError('Could not save. Keep this screen open and try again.');
      return ok;
    } catch (e) { setError((e as Error).message); return false; }
  };
  const inputStyle = { flex: 1, minWidth: 0, minHeight: 44, borderRadius: 9, borderWidth: 1, borderColor: error ? c.danger : c.border, backgroundColor: c.background, color: c.text, paddingHorizontal: 8, paddingVertical: 8, fontSize: 16, fontFamily: fonts.bold };
  return <View style={{ gap: 4 }}>
    <Row style={{ gap: 8, borderRadius: 10, backgroundColor: set.completed ? '#15302F' : undefined }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Set ${index + 1} details of ${exerciseName}`} onPress={onDetails} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}><Txt style={{ fontSize: 13, color: set.kind === 'warmup' ? c.champagne : c.muted }}>{set.kind === 'warmup' ? 'W' : index + 1}</Txt></Pressable>
      <TextInput accessibilityLabel={`Weight (${unit}) set ${index + 1} of ${exerciseName}`} value={weight} onChangeText={value => { draft.current.weight = value; setWeight(value); }} onBlur={() => { void save(); }} onSubmitEditing={() => { void save(); Keyboard.dismiss(); }} inputAccessoryViewID="set-done" returnKeyType="done" keyboardType="decimal-pad" selectTextOnFocus maxLength={12} style={inputStyle} />
      <TextInput accessibilityLabel={`Repetitions set ${index + 1} of ${exerciseName}`} value={reps} onChangeText={value => { draft.current.reps = value; setReps(value); }} onBlur={() => { void save(); }} onSubmitEditing={() => { void save(); Keyboard.dismiss(); }} inputAccessoryViewID="set-done" returnKeyType="done" keyboardType="number-pad" selectTextOnFocus maxLength={3} style={inputStyle} />
      <Pressable accessibilityRole="checkbox" accessibilityLabel={`Complete set ${index + 1} of ${exerciseName}`} accessibilityState={{ checked: set.completed }} aria-checked={set.completed} onPress={() => {
        if (completing.current) return;
        completing.current = true;
        void save(!set.completed).finally(() => { completing.current = false; });
      }} style={{ width: 44, minHeight: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: set.completed ? c.aqua : c.elevated }}><Icon name="check" color={set.completed ? c.ink : c.muted} /></Pressable>
    </Row>
    {record && <Txt style={{fontSize:11,color:c.champagne}}>{record}</Txt>}
    {error ? <Txt accessibilityRole="alert" style={{ fontSize: 12, color: c.danger }}>{error}</Txt> : null}
  </View>;
}
