import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { previousPerformance } from '../domain/calculations';
import { exerciseById } from '../domain/exercises';
import { ExerciseSet } from '../domain/models';
import { makeId } from '../domain/repository';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Field, Heading, Icon, Row, Screen, Txt } from '../ui';
import { Confirm, Sheet } from '../ui/sheet';
import { ExerciseLibrary } from './exercise-library';
import { SetEditor } from './set-editor';

type Confirmation = { title: string; detail: string; label?: string; action: () => Promise<unknown> };
export default function Train() {
  const { workouts, repository, settings, run, pending } = useApp();
  const active = workouts.find(w => w.status === 'active');
  const [name, setName] = useState('Strength session');
  const [library, setLibrary] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState<{ exId: string; exerciseName: string; set: ExerciseSet } | null>(null);
  const [confirm, setConfirm] = useState<Confirmation | null>(null);
  const completedCount = active?.exercises.reduce((n,e) => n + e.sets.filter(s => s.completed).length, 0) ?? 0;
  const totalCount = active?.exercises.reduce((n,e) => n + e.sets.length, 0) ?? 0;
  return <Screen><Row><Eyebrow>TRAIN / WORKOUT LOG</Eyebrow><Icon name="activity" color={c.iris} /></Row><Heading>{active ? active.name : 'Show up.\nGet stronger.'}</Heading>
    {!active ? <><Txt tone="muted">Your space to train with intention. Build a session one exercise at a time.</Txt><Card><Field label="Workout name" value={name} maxLength={80} onChangeText={setName} /><Button title="Start workout" testID="start-workout" icon="play" disabled={pending || !name.trim()} onPress={() => { void run(() => repository.createWorkout(name)); }} /></Card><Empty title="Ready for your next session" detail="Sets save on this device. You can leave and resume an unfinished session later." /><Button title="View workout history" variant="secondary" onPress={() => router.push('/history')} /></> : <>
      <Row><Txt tone="muted">{completedCount} / {totalCount} sets completed</Txt><Pressable accessibilityRole="button" accessibilityLabel="Rename workout" disabled={pending} onPress={() => { setName(active.name); setRenaming(true); }} style={{ minHeight: 44, justifyContent: 'center', padding: 8 }}><Icon name="edit-2" color={c.iris} /></Pressable></Row>
      <Txt tone="muted" style={{ fontSize: 12 }}>Session saved locally · Statistics update when you finish</Txt>
      {active.exercises.length === 0 && <Empty title="Build your session" detail="Add an exercise from the library, then log your first set." />}
      {active.exercises.map((entry, index) => {
        const exercise = exerciseById(entry.exerciseId);
        const previous = previousPerformance(workouts, exercise.id);
        return <Card key={entry.id} style={{ padding: 16 }}>
          <Row style={{ alignItems: 'flex-start' }}><View style={{ flex: 1, gap: 4 }}><Eyebrow>EXERCISE {String(index + 1).padStart(2, '0')}</Eyebrow><Txt accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 20, lineHeight: 27 }}>{exercise.name}</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{exercise.muscle} · {exercise.equipment}</Txt></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${exercise.name}`} disabled={pending} onPress={() => setConfirm({ title: 'Remove exercise?', detail: `${exercise.name} and its sets will be removed from this session.`, action: () => repository.removeExercise(active.id, entry.id) })} style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="x" /></Pressable></Row>
          <View style={{ backgroundColor: c.elevated, padding: 12, borderRadius: 10, gap: 4 }}><Txt style={{ fontSize: 12, color: c.aqua, fontFamily: fonts.bold }}>PREVIOUS PERFORMANCE</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{previous ? `${new Date(previous.date).toLocaleDateString()} · ${previous.sets.map(s => `${formatWeight(s.weightGrams, settings.unit)} ${settings.unit} × ${s.reps}`).join(' / ')}` : 'Your first completed working set will start the story.'}</Txt></View>
          {entry.sets.map((set, i) => <View key={set.id} style={{ borderTopWidth: 1, borderTopColor: c.border, paddingTop: 8, gap: 2 }}>
            <Row style={{ gap: 4 }}><Pressable accessibilityRole="button" accessibilityLabel={`Edit set ${i+1} of ${exercise.name}`} disabled={pending} onPress={() => setEditing({ exId: entry.id, exerciseName: exercise.name, set })} style={{ flex: 1, minHeight: 52, justifyContent: 'center', gap: 2 }}><Txt style={{ fontSize: 12, color: set.kind === 'warmup' ? c.muted : c.iris }}>{set.kind === 'warmup' ? 'W' : String(i+1).padStart(2, '0')} · {set.kind === 'warmup' ? 'Warm-up' : 'Working'}</Txt><Txt style={{ fontFamily: fonts.bold }}>{formatWeight(set.weightGrams, settings.unit)} {settings.unit} × {set.reps} reps</Txt></Pressable>
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: set.completed, disabled: pending }} accessibilityLabel={`Complete set ${i+1} of ${exercise.name}`} disabled={pending} onPress={() => { void run(() => repository.editSet(active.id, entry.id, { ...set, completed: !set.completed })); }} style={{ width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: set.completed ? c.aqua : c.elevated, borderRadius: 12 }}><Icon name="check" color={set.completed ? c.ink : c.muted} /></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={`Delete set ${i+1} of ${exercise.name}`} disabled={pending} onPress={() => setConfirm({ title: 'Delete this set?', detail: 'This set will be permanently removed from the session.', action: () => repository.removeSet(active.id, entry.id, set.id) })} style={{ minWidth: 44, minHeight: 48, justifyContent: 'center', alignItems: 'center' }}><Icon name="trash-2" size={18} /></Pressable></Row>
          </View>)}
          <Button title={`Add set · ${exercise.name}`} variant="secondary" icon="plus" disabled={pending} onPress={() => {
            const last = entry.sets[entry.sets.length - 1];
            const set: ExerciseSet = { id: makeId(), reps: last?.reps ?? 8, weightGrams: last?.weightGrams ?? 0, kind: 'working', completed: false };
            void run(() => repository.addSet(active.id, entry.id, set)).then(ok => { if (ok) setEditing({ exId: entry.id, exerciseName: exercise.name, set }); });
          }} />
        </Card>;
      })}
      <Button title="Add exercise" variant="secondary" icon="plus" disabled={pending} onPress={() => setLibrary(true)} />
      <Button title="Finish workout" icon="check-circle" disabled={pending || !completedCount} onPress={() => setConfirm({ title: 'Finish and save?', detail: `${completedCount} completed sets will be saved. ${totalCount - completedCount} incomplete sets remain in history but do not count toward statistics. Warm-ups are excluded from working volume and records.`, label: 'Save workout', action: async () => { await repository.finishWorkout(active.id); } })} />
      <Button title="Discard workout" variant="danger" disabled={pending} onPress={() => setConfirm({ title: 'Discard this workout?', detail: 'The entire unfinished session will be deleted. This cannot be undone.', action: () => repository.deleteWorkout(active.id) })} />
      {library && <ExerciseLibrary added={active.exercises.map(e => e.exerciseId)} busy={pending} onClose={() => setLibrary(false)} onAdd={exerciseId => { void run(() => repository.addExercise(active.id, exerciseId)).then(ok => { if (ok) setLibrary(false); }); }} />}
      {editing && <SetEditor key={`${editing.set.id}-${settings.unit}`} set={editing.set} exerciseName={editing.exerciseName} unit={settings.unit} busy={pending} onClose={() => setEditing(null)} onSave={set => run(() => repository.editSet(active.id, editing.exId, set))} />}
      <Sheet visible={renaming} title="Name your session" onClose={() => { if (!pending) setRenaming(false); }}><Field label="Workout name" value={name} onChangeText={setName} maxLength={80} /><Button title="Save name" disabled={pending || !name.trim()} onPress={() => { void run(() => repository.renameWorkout(active.id, name)).then(ok => { if (ok) setRenaming(false); }); }} /><Button title="Cancel" variant="secondary" disabled={pending} onPress={() => setRenaming(false)} /></Sheet>
    </>}
    <Confirm visible={!!confirm} title={confirm?.title ?? ''} detail={confirm?.detail ?? ''} confirmLabel={confirm?.label} busy={pending} onCancel={() => setConfirm(null)} onConfirm={() => {
      if (!confirm) return; const captured = confirm;
      void run(captured.action).then(ok => { if (ok) { setConfirm(null); if (captured.label === 'Save workout' && active) router.push({ pathname: '/workout/[id]', params: { id: active.id } }); } });
    }} />
  </Screen>;
}
