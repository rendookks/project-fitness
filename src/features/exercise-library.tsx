import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { EXERCISES, searchExercises } from '../domain/exercises';
import { colors, fonts } from '../theme/tokens';
import { Button, Chip, Field, Icon, Row, Txt } from '../ui';
import { Sheet } from '../ui/sheet';
export function ExerciseLibrary({ onClose, onAdd, added, busy }: {
  onClose: () => void; onAdd: (id: string) => void; added: string[]; busy: boolean;
}) {
  const [query, setQuery] = useState(''); const [muscle, setMuscle] = useState('All'); const [equipment, setEquipment] = useState('All');
  const results = searchExercises(query, muscle, equipment);
  return <Sheet visible title="Exercise library" onClose={() => { if (!busy) onClose(); }}>
    <Field label="Search exercises" placeholder="Name, muscle, equipment…" value={query} onChangeText={setQuery} autoCorrect={false} />
    <Txt tone="muted" style={{ fontSize: 12 }}>MUSCLE GROUP</Txt><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['All', ...new Set(EXERCISES.map(e => e.muscle))].map(m => <Chip key={m} label={m} selected={muscle === m} onPress={() => setMuscle(m)} />)}</ScrollView>
    <Txt tone="muted" style={{ fontSize: 12 }}>EQUIPMENT</Txt><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{['All', 'Bodyweight', 'Dumbbells', 'Barbell', 'Machine', 'Cable'].map(e => <Chip key={e} label={e} selected={equipment === e} onPress={() => setEquipment(e)} />)}</ScrollView>
    <Txt tone="muted">{results.length} exercises</Txt>
    {results.map(ex => {
      const exists = added.includes(ex.id);
      return <Pressable key={ex.id} accessibilityRole="button" accessibilityLabel={`${exists ? 'Added' : 'Add'} ${ex.name}`} disabled={busy || exists} accessibilityState={{ disabled: busy || exists }} onPress={() => onAdd(ex.id)} style={({ pressed }) => ({ paddingVertical: 16, opacity: pressed ? .7 : 1, borderBottomWidth: 1, borderBottomColor: colors.border })}>
        <Row><View style={{ flex: 1, gap: 4 }}><Txt style={{ fontFamily: fonts.bold }}>{ex.name}</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{ex.muscle} · {ex.equipment}{ex.bodyweight ? ' · Bodyweight' : ''}</Txt></View><Icon name={exists ? 'check' : 'plus'} color={exists ? colors.aqua : colors.iris} /></Row>
      </Pressable>;
    })}
    {!results.length && <Txt>No matches. Try a different search or filter.</Txt>}
    <Button title="Close library" variant="secondary" disabled={busy} onPress={onClose} />
  </Sheet>;
}
