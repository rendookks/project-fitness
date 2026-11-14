import { useState } from 'react';
import { View } from 'react-native';
import { exerciseById } from '../domain/exercises';
import { Routine } from '../domain/models';
import { makeId } from '../domain/repository';
import { editableWeight, parseReps, parseWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Card, Chip, Field, Row, Txt } from '../ui';
import { Sheet } from '../ui/sheet';
import { ExerciseLibrary } from './exercise-library';

export function RoutineEditor({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const { repository, run, pending, settings } = useApp();
  const [name, setName] = useState(routine.name);
  const [entries, setEntries] = useState(routine.exercises.map(e => ({ ...e, sets: e.sets.map(s => ({ ...s, weight: s.weightGrams === null ? '' : editableWeight(s.weightGrams, settings.unit), repsText: String(s.reps) })) })));
  const [library, setLibrary] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [discard, setDiscard] = useState(false);
  const [error, setError] = useState('');
  const close = () => { if (!pending) { if (dirty) setDiscard(true); else onClose(); } };
  return <><Sheet visible={!library} title={discard ? 'Discard routine edits?' : 'Edit routine'} onClose={close}>
    {discard ? <><Txt tone="muted">The saved routine and workout history will stay as they are.</Txt><Button title="Discard edits" variant="danger" onPress={onClose} /><Button title="Keep editing" variant="secondary" onPress={() => setDiscard(false)} /></> : <>
      <Field label="Routine name" value={name} maxLength={80} onChangeText={v => { setName(v); setDirty(true); }} />
      <Txt tone="muted" style={{ fontSize: 12 }}>A reusable plan. Sessions get their own copy. Previous completed working sets take priority over planned values when you start.</Txt>
      {entries.map((entry, i) => <Card key={entry.id} style={{ padding: 12, borderRadius: 14 }}>
        <Txt style={{ fontFamily: fonts.bold }}>{exerciseById(entry.exerciseId).name}</Txt>
        <Row><Button title="Move up" accessibilityLabel={`Move exercise ${i + 1} up`} variant="secondary" disabled={pending || i === 0} onPress={() => { const next = [...entries]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; setEntries(next); setDirty(true); }} /><Button title="Move down" accessibilityLabel={`Move exercise ${i + 1} down`} variant="secondary" disabled={pending || i === entries.length - 1} onPress={() => { const next = [...entries]; [next[i], next[i + 1]] = [next[i + 1], next[i]]; setEntries(next); setDirty(true); }} /></Row>
        {entry.sets.map((set, index) => <View key={index} style={{ gap: 8 }}><Row>
          <Field label={`Planned ${settings.unit}`} accessibilityLabel={`Planned ${settings.unit} exercise ${i + 1} set ${index + 1}`} value={set.weight} placeholder="Previous / 0" keyboardType="decimal-pad" onChangeText={v => { setEntries(entries.map(e => e.id === entry.id ? { ...e, sets: e.sets.map((s, j) => j === index ? { ...s, weight: v } : s) } : e)); setDirty(true); }} />
          <Field label="Target reps" accessibilityLabel={`Target reps exercise ${i + 1} set ${index + 1}`} value={set.repsText} keyboardType="number-pad" maxLength={3} onChangeText={v => { setEntries(entries.map(e => e.id === entry.id ? { ...e, sets: e.sets.map((s, j) => j === index ? { ...s, repsText: v } : s) } : e)); setDirty(true); }} />
        </Row><Row style={{ flexWrap: 'wrap' }}><Chip label={set.kind === 'working' ? 'Working' : 'Warm-up'} selected={set.kind === 'working'} onPress={() => { setEntries(entries.map(e => e.id === entry.id ? { ...e, sets: e.sets.map((s, j) => j === index ? { ...s, kind: s.kind === 'working' ? 'warmup' : 'working' } : s) } : e)); setDirty(true); }} /><Button title="Remove set" accessibilityLabel={`Remove planned set ${index + 1} exercise ${i + 1}`} variant="danger" disabled={pending || entry.sets.length === 1} onPress={() => { setEntries(entries.map(e => e.id === entry.id ? { ...e, sets: e.sets.filter((_, j) => j !== index) } : e)); setDirty(true); }} /></Row></View>)}
        <Button title="Add planned set" accessibilityLabel={`Add planned set exercise ${i + 1}`} variant="secondary" disabled={pending} onPress={() => { setEntries(entries.map(e => e.id === entry.id ? { ...e, sets: [...e.sets, { ...e.sets[e.sets.length - 1] }] } : e)); setDirty(true); }} />
        <Button title="Remove exercise" accessibilityLabel={`Remove ${exerciseById(entry.exerciseId).name} from routine`} variant="danger" disabled={pending} onPress={() => { setEntries(entries.filter(e => e.id !== entry.id)); setDirty(true); }} />
      </Card>)}
      <Button title="Add routine exercise" variant="secondary" icon="plus" disabled={pending} onPress={() => setLibrary(true)} />
      {error ? <Txt accessibilityRole="alert" style={{ color: colors.danger }}>{error}</Txt> : null}
      <Button title="Save routine" disabled={pending || !name.trim() || !entries.length} onPress={() => {
        try {
          const next: Routine = { ...routine, name, exercises: entries.map(e => ({ id: e.id, exerciseId: e.exerciseId, exerciseSnapshot: e.exerciseSnapshot, sets: e.sets.map(s => ({ kind: s.kind, reps: parseReps(s.repsText), weightGrams: s.weight.trim() === '' ? null : s.weight === (s.weightGrams === null ? '' : editableWeight(s.weightGrams, settings.unit)) ? s.weightGrams : parseWeight(s.weight, settings.unit) })) })) };
          void run(() => repository.saveRoutine(next)).then(ok => { if (ok) onClose(); });
        } catch (e) { setError((e as Error).message); }
      }} />
      <Button title="Cancel routine editing" variant="secondary" disabled={pending} onPress={close} />
    </>}
  </Sheet>{library && <ExerciseLibrary added={entries.map(e => e.exerciseId)} busy={pending} onClose={() => setLibrary(false)} onAdd={id => { setEntries([...entries, { id: makeId(), exerciseId: id, exerciseSnapshot: exerciseById(id), sets: Array.from({ length: 3 }, () => ({ kind: 'working' as const, reps: 8, repsText: '8', weightGrams: null, weight: '' })) }]); setDirty(true); setLibrary(false); }} />}</>;
}
