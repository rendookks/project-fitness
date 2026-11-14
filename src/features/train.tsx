import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { previousPerformance } from '../domain/calculations';
import { exerciseById } from '../domain/exercises';
import { ExerciseSet } from '../domain/models';
import { setRecordLabels } from '../domain/strength';
import { makeId } from '../domain/repository';
import { formatWeight } from '../domain/units';
import { useApp } from '../state/app-context';
import { colors as c, fonts } from '../theme/tokens';
import { Button, Card, Empty, Eyebrow, Field, Heading, Icon, Row, Screen, Txt } from '../ui';
import { Confirm, Sheet } from '../ui/sheet';
import { ExerciseLibrary } from './exercise-library';
import { SetEditor } from './set-editor';
import { ProgressionCard } from './progression-card';
import { Routines } from './routines';
import { InlineSet } from './inline-set';

type Confirmation = { title: string; detail: string; label?: string; action: () => Promise<unknown> };
export default function Train() {
  const { workouts, repository, settings, run, pending, customExercises } = useApp();
  const active = workouts.find(w => w.status === 'active');
  const [name, setName] = useState('Strength session');
  const [invalidSets, setInvalidSets] = useState<Record<string, boolean>>({});
  const hasInvalid = active?.exercises.some(e => e.sets.some(s => invalidSets[s.id]));
  const [draftVersions, setDraftVersions] = useState<Record<string, number>>({});
  const refreshDraft = (id: string) => { setInvalidSets(v => ({...v, [id]: false}));setDraftVersions(v => ({...v, [id]: (v[id] ?? 0) + 1})); };
  const [library, setLibrary] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [editing, setEditing] = useState<{ exId: string; exerciseName: string; set: ExerciseSet } | null>(null);
  const [confirm, setConfirm] = useState<Confirmation | null>(null);
  const completedCount = active?.exercises.reduce((n,e) => n + e.sets.filter(s => s.completed).length, 0) ?? 0;
  const totalCount = active?.exercises.reduce((n,e) => n + e.sets.length, 0) ?? 0;
  return <Screen><Row><Eyebrow>TRAIN / WORKOUT LOG</Eyebrow><Icon name="activity" color={c.iris} /></Row><Heading>{active ? active.name : 'Ready to train.'}</Heading>
    {!active ? <><Routines /><Txt tone="muted">Your space to train with intention. Build a session one exercise at a time.</Txt><Card><Field label="Workout name" value={name} maxLength={80} onChangeText={setName} /><Button title="Start workout" testID="start-workout" icon="play" disabled={pending || !name.trim()} onPress={() => { void run(() => repository.createWorkout(name)); }} /></Card><Empty title="Ready for your next session" detail="Sets save on this device. You can leave and resume an unfinished session later." /><Button title="View workout history" variant="secondary" onPress={() => router.push('/history')} /></> : <>
      <Row><Txt tone="muted">{completedCount} / {totalCount} sets completed</Txt><Pressable accessibilityRole="button" accessibilityLabel="Rename workout" disabled={pending} onPress={() => { setName(active.name); setRenaming(true); }} style={{ minHeight: 44, justifyContent: 'center', padding: 8 }}><Icon name="edit-2" color={c.iris} /></Pressable></Row>
      <Txt tone="muted" style={{ fontSize: 12 }}>Session saved locally · Statistics update when you finish</Txt>
      {active.exercises.length === 0 && <Empty title="Build your session" detail="Add an exercise from the library, then log your first set." />}
      {active.exercises.map((entry, index) => {
        const exercise = exerciseById(entry.exerciseId, customExercises, entry.exerciseSnapshot);
        const previous = previousPerformance(workouts, exercise.id, active.routineId);
        return <Card key={entry.id} style={{ padding: 16 }}>
          <Row style={{ alignItems: 'flex-start' }}><View style={{ flex: 1, gap: 4 }}><Eyebrow>EXERCISE {String(index + 1).padStart(2, '0')}</Eyebrow><Txt accessibilityRole="header" style={{ fontFamily: fonts.bold, fontSize: 20, lineHeight: 27 }}>{exercise.name}</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{exercise.muscle} · {exercise.equipment}</Txt></View><Pressable accessibilityRole="button" accessibilityLabel={`Remove ${exercise.name}`} disabled={pending} onPress={() => setConfirm({ title: 'Remove exercise?', detail: `${exercise.name} and its sets will be removed from this session.`, action: () => repository.removeExercise(active.id, entry.id) })} style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}><Icon name="x" /></Pressable></Row>
          <View style={{ backgroundColor: c.elevated, padding: 8, borderRadius: 10, gap: 4 }}><Txt style={{ fontSize: 12, color: c.aqua, fontFamily: fonts.bold }}>LAST SESSION</Txt><Txt tone="muted" style={{ fontSize: 12 }}>{previous ? `${new Date(previous.date).toLocaleDateString()} · ${previous.workoutName} · ${`${formatWeight(previous.sets[0].weightGrams, settings.unit)} ${settings.unit} × ${previous.sets[0].reps} · ${previous.sets.length} working sets`}` : 'Your first completed working set will start the story.'}</Txt></View>
          <ProgressionCard exerciseId={exercise.id} routineId={active.routineId} compact onApply={entry.sets.find(s=>s.kind==='working') && !entry.sets.find(s=>s.kind==='working')!.completed ? target => { const first=entry.sets.find(s=>s.kind==='working')!;void run(()=>repository.updateSet(active.id,entry.id,first.id,target)).then(ok=>{if(ok)refreshDraft(first.id);}); } : undefined} />
          <Row style={{ gap: 8 }}><Txt tone="muted" style={{ width: 44, fontSize: 10 }}>SET</Txt><Txt tone="muted" style={{ flex: 1, fontSize: 10 }}>{settings.unit.toUpperCase()}</Txt><Txt tone="muted" style={{ flex: 1, fontSize: 10 }}>REPS</Txt><Txt tone="muted" style={{ width: 44, fontSize: 10 }}>DONE</Txt></Row>
          {entry.sets.map((set, i) => <InlineSet key={`${set.id}-${settings.unit}-${draftVersions[set.id] ?? 0}`} set={set} index={i} exerciseName={exercise.name} unit={settings.unit} onValidity={valid => setInvalidSets(v => v[set.id] === !valid ? v : {...v, [set.id]: !valid})} record={setRecordLabels(set, workouts, exercise.id).join(' · ')} onSave={patch => run(() => repository.updateSet(active.id, entry.id, set.id, patch))} onDetails={() => setEditing({ exId: entry.id, exerciseName: exercise.name, set })} />)}
          <Button title={`Add set · ${exercise.name}`} variant="secondary" icon="plus" disabled={pending} onPress={() => {
            const working = entry.sets.filter(s=>s.kind==='working');
            const last = previous?.sets[working.length] ?? working[working.length - 1] ?? previous?.sets[previous.sets.length - 1];
            const set: ExerciseSet = { id: makeId(), reps: last?.reps ?? 8, weightGrams: last?.weightGrams ?? 0, kind: 'working', completed: false };
            void run(() => repository.addSet(active.id, entry.id, set));
          }} />
        </Card>;
      })}
      <Button title="Add exercise" variant="secondary" icon="plus" disabled={pending} onPress={() => setLibrary(true)} />
      {hasInvalid && <Txt accessibilityRole="alert" style={{color:c.danger,fontSize:13}}>Correct invalid set values before finishing.</Txt>}
      <Button title="Finish workout" icon="check-circle" disabled={pending || !completedCount || hasInvalid} onPress={() => setConfirm({ title: 'Finish and save?', detail: `${completedCount} completed sets will be saved. ${totalCount - completedCount} incomplete sets remain in history but do not count toward statistics. Warm-ups are excluded from working volume and records.`, label: 'Save workout', action: async () => { await repository.finishWorkout(active.id); } })} />
      <Button title="Discard workout" variant="danger" disabled={pending} onPress={() => setConfirm({ title: 'Discard this workout?', detail: 'The entire unfinished session will be deleted. This cannot be undone.', action: () => repository.deleteWorkout(active.id) })} />
      {library && <ExerciseLibrary added={active.exercises.map(e => e.exerciseId)} busy={pending} onClose={() => setLibrary(false)} onAdd={exerciseId => { void run(() => repository.addExercise(active.id, exerciseId)).then(ok => { if (ok) setLibrary(false); }); }} />}
      {editing && <SetEditor onDelete={() => { setEditing(null); setConfirm({ title: 'Delete this set?', detail: 'This set will be removed from this session.', action: () => repository.removeSet(active.id, editing.exId, editing.set.id) }); }} key={`${editing.set.id}-${settings.unit}`} set={editing.set} exerciseName={editing.exerciseName} unit={settings.unit} busy={pending} onClose={() => setEditing(null)} onSave={async set => { const ok=await run(() => repository.editSet(active.id, editing.exId, set));if(ok)refreshDraft(set.id);return ok; }} />}
      <Sheet visible={renaming} title="Name your session" onClose={() => { if (!pending) setRenaming(false); }}><Field label="Workout name" value={name} onChangeText={setName} maxLength={80} /><Button title="Save name" disabled={pending || !name.trim()} onPress={() => { void run(() => repository.renameWorkout(active.id, name)).then(ok => { if (ok) setRenaming(false); }); }} /><Button title="Cancel" variant="secondary" disabled={pending} onPress={() => setRenaming(false)} /></Sheet>
    </>}
    {!active && <Button title="Browse exercise library" variant="secondary" onPress={() => setLibrary(true)} />}
    {!active && library && <ExerciseLibrary added={[]} busy={pending} onClose={() => setLibrary(false)} />}
    <Confirm visible={!!confirm} title={confirm?.title ?? ''} detail={confirm?.detail ?? ''} confirmLabel={confirm?.label} busy={pending} onCancel={() => setConfirm(null)} onConfirm={() => {
      if (!confirm) return; const captured = confirm;
      void run(captured.action).then(ok => { if (ok) { setConfirm(null); if (captured.label === 'Save workout' && active) router.push({ pathname: '/workout/[id]', params: { id: active.id } }); } });
    }} />
  </Screen>;
}
