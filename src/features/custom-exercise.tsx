import { useState } from 'react';
import { View } from 'react-native';
import { EQUIPMENT, MUSCLES } from '../domain/exercises';
import { Exercise } from '../domain/models';
import { makeId } from '../domain/repository';
import { useApp } from '../state/app-context';
import { Button, Chip, Field, Txt } from '../ui';
import { Sheet } from '../ui/sheet';

export function CustomExercise({ exercise, onClose }: { exercise?: Exercise; onClose: () => void }) {
  const { run, repository, pending } = useApp();
  const [name, setName] = useState(exercise?.name ?? '');
  const [muscle, setMuscle] = useState(exercise?.muscle ?? 'Chest');
  const [equipment, setEquipment] = useState<Exercise['equipment']>(exercise?.equipment ?? 'Dumbbells');
  const [discard, setDiscard] = useState(false);
  const dirty=name !== (exercise?.name ?? '') || muscle !== (exercise?.muscle ?? 'Chest') || equipment !== (exercise?.equipment ?? 'Dumbbells');
  const close=()=>{if(!pending){if(dirty)setDiscard(true);else onClose();}};
  return <Sheet visible title={discard ? 'Discard exercise edits?' : exercise ? 'Edit custom exercise' : 'Create custom exercise'} onClose={close}>
    {discard ? <><Button title="Discard edits" variant="danger" onPress={onClose} /><Button title="Keep editing" variant="secondary" onPress={()=>setDiscard(false)} /></> : <>
      <Field label="Exercise name" value={name} maxLength={80} onChangeText={setName} />
      <Txt tone="muted">Primary muscle</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{MUSCLES.map(m => <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(m)} />)}</View>
      <Txt tone="muted">Equipment</Txt><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{EQUIPMENT.map(e => <Chip key={e} label={e} selected={equipment === e} onPress={() => setEquipment(e)} />)}</View>
      <Txt tone="muted" style={{ fontSize: 12 }}>Completed sessions retain their original movement details. Zero external load is supported. A materially different movement should get a new identity so its strength history stays comparable.</Txt>
      <Button title="Save exercise" disabled={pending || !name.trim()} onPress={() => { void run(() => repository.saveCustomExercise({ id: exercise?.id ?? `custom-${makeId()}`, name, muscle, equipment, bodyweight: equipment === 'Bodyweight', custom: true })).then(ok => { if (ok) onClose(); }); }} />
      <Button title="Cancel exercise editing" variant="secondary" disabled={pending} onPress={close} />
    </>}
  </Sheet>;
}
