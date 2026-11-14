import { useState } from 'react';
import { FlatList, Pressable, useWindowDimensions, View } from 'react-native';
import { EQUIPMENT, MUSCLES, searchExercises } from '../domain/exercises';
import { Exercise } from '../domain/models';
import { useApp } from '../state/app-context';
import { colors, fonts } from '../theme/tokens';
import { Button, Chip, Field, Icon, Row, Txt } from '../ui';
import { Confirm, Sheet } from '../ui/sheet';
import { CustomExercise } from './custom-exercise';
export function ExerciseLibrary({ onClose, onAdd, added, busy }: {
  onClose: () => void; onAdd?: (id: string) => void; added: string[]; busy: boolean;
}) {
  const { customExercises, run, repository } = useApp();
  const { height } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState('All'); const [equipment, setEquipment] = useState('All');
  const [filter, setFilter] = useState<'muscle' | 'equipment' | null>(null);
  const [editing, setEditing] = useState<Exercise | 'new' | null>(null);
  const [archiving, setArchiving] = useState<Exercise | null>(null);
  const results = searchExercises(query, muscle, equipment, customExercises);
  return <><Sheet visible={!editing && !archiving} title="Exercise library" scroll={false} onClose={() => { if (!busy) onClose(); }}>
    <FlatList style={{ height: Math.min(height * .65, 620) }} keyboardShouldPersistTaps="handled" data={results} keyExtractor={e => e.id}
      ListHeaderComponent={<View style={{ gap: 12, paddingBottom: 12 }}>
        <Field label="Search exercises" placeholder="Name, muscle, equipment…" value={query} onChangeText={setQuery} autoCorrect={false} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Chip label={muscle === 'All' ? 'All muscles' : muscle} selected={filter === 'muscle'} onPress={() => setFilter(filter === 'muscle' ? null : 'muscle')} /><Chip label={equipment === 'All' ? 'All equipment' : equipment} selected={filter === 'equipment'} onPress={() => setFilter(filter === 'equipment' ? null : 'equipment')} /></View>
        {filter && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{['All', ...(filter === 'muscle' ? MUSCLES : EQUIPMENT)].map(v => <Chip key={v} label={v} selected={(filter === 'muscle' ? muscle : equipment) === v} onPress={() => { if (filter === 'muscle') setMuscle(v); else setEquipment(v); setFilter(null); }} />)}</View>}
        <Row><Txt tone="muted" style={{ fontSize: 12 }}>{results.length} movements</Txt><Button title="Custom exercise" accessibilityLabel="Create custom exercise" icon="plus" variant="secondary" disabled={busy} onPress={() => setEditing('new')} /></Row>
      </View>}
      ListEmptyComponent={<Txt tone="muted">No matches. Clear your search or change a filter.</Txt>}
      renderItem={({ item: ex }) => {
        const exists = added.includes(ex.id);
        return <View style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 6 }}>
          <Pressable accessibilityRole={onAdd ? 'button' : undefined} accessibilityLabel={onAdd ? `${exists ? 'Added' : 'Add'} ${ex.name}` : ex.name} disabled={busy || exists || !onAdd} onPress={() => onAdd?.(ex.id)} style={{ minHeight: 48, justifyContent: 'center' }}><Row><View style={{ flex: 1, gap: 2 }}><Txt style={{ fontFamily: fonts.bold, fontSize: 15 }}>{ex.name}</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{ex.muscle} · {ex.equipment}{ex.custom ? ' · Custom' : ''}</Txt></View>{onAdd && <Icon name={exists ? 'check' : 'plus'} color={exists ? colors.aqua : colors.iris} />}</Row></Pressable>
          {ex.custom && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button title="Edit movement" accessibilityLabel={`Edit ${ex.name}`} variant="secondary" disabled={busy} onPress={() => setEditing(ex)} /><Button title="Archive" accessibilityLabel={`Archive ${ex.name}`} variant="danger" disabled={busy} onPress={() => setArchiving(ex)} /></View>}
        </View>;
      }} />
    <Button title="Close library" variant="secondary" disabled={busy} onPress={onClose} />
  </Sheet>
    {editing && <CustomExercise exercise={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} />}
    <Confirm visible={!!archiving} title="Archive custom exercise?" detail="This movement will leave the selection library. Its identity, previous sessions, records, and saved routines remain available." confirmLabel="Archive exercise" busy={busy} onCancel={() => setArchiving(null)} onConfirm={() => { if (archiving) void run(() => repository.archiveCustomExercise(archiving.id)).then(ok => { if (ok) setArchiving(null); }); }} />
  </>;
}
