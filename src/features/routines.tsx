import { useState } from 'react';
import { View } from 'react-native';
import { Routine } from '../domain/models';
import { makeId } from '../domain/repository';
import { useApp } from '../state/app-context';
import { fonts } from '../theme/tokens';
import { Button, Card, Eyebrow, Row, Txt } from '../ui';
import { Confirm } from '../ui/sheet';
import { RoutineEditor } from './routine-editor';

export function Routines() {
  const { routines, workouts, repository, pending, run } = useApp();
  const [editing, setEditing] = useState<Routine | null>(null);
  const [deleting, setDeleting] = useState<Routine | null>(null);
  const active = workouts.some(w => w.status === 'active');
  return <View style={{ gap: 12 }}><Row><Eyebrow>SAVED ROUTINES</Eyebrow><Txt tone="muted" style={{ fontSize: 12 }}>{routines.length} {routines.length===1?'plan':'plans'}</Txt></Row>
    {!routines.length && <Card><Txt style={{ fontFamily: fonts.bold }}>Your next workout, ready to go.</Txt><Txt tone="muted" style={{ fontSize: 14 }}>Build a Push, Pull, Legs, or your own split. Save exercises and targets once; start training in a tap.</Txt></Card>}
    {routines.map(r => <Card key={r.id} style={{ padding: 16, borderRadius: 18 }}><Txt style={{ fontFamily: fonts.bold, fontSize: 20 }}>{r.name}</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{r.exercises.length} {r.exercises.length===1?'exercise':'exercises'} · {r.exercises.reduce((n, e) => n + e.sets.length, 0)} planned sets</Txt>
      <Button title={`Start routine · ${r.name}`} icon="play" disabled={pending || active || !r.exercises.length} onPress={() => { void run(() => repository.startRoutine(r.id)); }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}><Button title="Edit" accessibilityLabel={`Edit ${r.name}`} variant="secondary" disabled={pending} onPress={() => setEditing(r)} /><Button title="Duplicate" accessibilityLabel={`Duplicate ${r.name}`} variant="secondary" disabled={pending} onPress={() => { void run(() => repository.duplicateRoutine(r.id)); }} /><Button title="Delete" accessibilityLabel={`Delete ${r.name}`} variant="danger" disabled={pending} onPress={() => setDeleting(r)} /></View>
    </Card>)}
    <Button title="Create routine" icon="plus" variant="secondary" disabled={pending} onPress={() => setEditing({ id: makeId(), name: '', updatedAt: new Date().toISOString(), exercises: [] })} />
    {editing && <RoutineEditor routine={editing} onClose={() => setEditing(null)} />}
    <Confirm visible={!!deleting} title="Delete routine?" detail={`${deleting?.name ?? 'This plan'} will be removed. Your completed workouts and active session are preserved.`} busy={pending} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting) void run(() => repository.deleteRoutine(deleting.id)).then(ok => { if (ok) setDeleting(null); }); }} />
  </View>;
}
