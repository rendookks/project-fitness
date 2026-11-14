import { useState } from 'react';
import { View } from 'react-native';
import { ExerciseSet, WeightUnit } from '../domain/models';
import { editableWeight, parseReps, parseWeight } from '../domain/units';
import { colors, fonts } from '../theme/tokens';
import { Button, Chip, Field, Row, Txt } from '../ui';
import { Sheet } from '../ui/sheet';

export function SetEditor({ set, unit, exerciseName, busy, onClose, onSave }: {
  set: ExerciseSet; unit: WeightUnit; exerciseName: string; busy: boolean; onClose: () => void;
  onSave: (set: ExerciseSet) => Promise<boolean>;
}) {
  const initialWeight = editableWeight(set.weightGrams, unit);
  const [weight, setWeight] = useState(initialWeight);
  const [reps, setReps] = useState(String(set.reps));
  const [kind, setKind] = useState(set.kind);
  const [completed, setCompleted] = useState(set.completed);
  const [error, setError] = useState('');
  const [discard, setDiscard] = useState(false);
  const dirty = weight !== initialWeight || reps !== String(set.reps) || kind !== set.kind || completed !== set.completed;
  const close = () => { if (!busy) { if (dirty) setDiscard(true); else onClose(); } };
  return <Sheet visible title={discard ? 'Discard these edits?' : 'Edit set'} onClose={close}>
    {discard ? <><Txt tone="muted">The previously saved set will be preserved.</Txt><Button title="Discard edits" variant="danger" onPress={onClose} /><Button title="Keep editing" variant="secondary" onPress={() => setDiscard(false)} /></> : <>
      <Txt tone="muted">{exerciseName}</Txt>
      <Row><Field label={`Weight (${unit})`} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" selectTextOnFocus maxLength={12} /><Field label="Repetitions" value={reps} onChangeText={setReps} keyboardType="number-pad" selectTextOnFocus maxLength={3} /></Row>
      <Txt tone="muted" style={{ fontSize: 12 }}>For bodyweight sets, record 0 external load. Record only the load you use; no automatic per-side doubling.</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Chip label="Working set" selected={kind === 'working'} onPress={() => setKind('working')} /><Chip label="Warm-up" selected={kind === 'warmup'} onPress={() => setKind('warmup')} /></View>
      <Chip label={completed ? '✓ Completed' : 'Not completed yet'} selected={completed} onPress={() => setCompleted(!completed)} />
      {error ? <Txt accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Txt> : null}
      <Button title="Save set" icon="check" disabled={busy} onPress={() => {
        try {
          const weightGrams = weight === initialWeight ? set.weightGrams : parseWeight(weight, unit);
          const next = { ...set, weightGrams, reps: parseReps(reps), kind, completed };
          void onSave(next).then(ok => { if (ok) onClose(); });
        } catch (e) { setError((e as Error).message); }
      }} />
      <Button title="Cancel editing" variant="secondary" disabled={busy} onPress={close} />
      <Txt style={{ color: colors.muted, fontSize: 12, fontFamily: fonts.medium }}>Warm-up sets stay in your log but never count toward working volume or records.</Txt>
    </>}
  </Sheet>;
}
