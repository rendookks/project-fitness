import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDemoSeed } from '../src/domain/demo';
import { DataModeController } from '../src/state/data-mode';
import { DatabaseKind } from '../src/storage/interface';
import { migrate, SqliteStorage } from '../src/storage/sqlite';
import { profile,set } from '../tests/fixtures';
import { nodeDriver } from './verify-sqlite';

async function main(){
  const folder=mkdtempSync(join(tmpdir(),'project-fitness-demo-'));
  const names={real:'project_fitness.db',demo:'project_fitness_demo.db'};
  const databases=new Map<DatabaseKind,DatabaseSync>();const stores=new Map<DatabaseKind,SqliteStorage>();
  const open=async(kind:DatabaseKind)=>{
    const previous=stores.get(kind);if(previous)return previous;
    const db=new DatabaseSync(join(folder,names[kind]));databases.set(kind,db);
    await migrate(nodeDriver(db));const store=new SqliteStorage(nodeDriver(db),kind);stores.set(kind,store);return store;
  };
  const instant=new Date('2026-11-14T12:00:00Z');
  try{
    let controller=new DataModeController(open,()=>instant);await controller.initialize();
    const real=await open('real');let state=await controller.snapshot();
    await state.repository.onboard(profile,{unit:'lb'});
    const draft=await state.repository.createWorkout('Real draft');const before=await real.getWorkouts();
    // Recreate a populated v1 database and verify the current upgrade preserves it.
    const realDB=databases.get('real')!;realDB.exec('DROP TABLE custom_exercises; DROP TABLE routines; DROP TABLE metadata; PRAGMA user_version = 1;');
    await migrate(nodeDriver(realDB));assert.deepEqual(await real.getWorkouts(),before);
    await assert.rejects(()=>real.initializeDemo(createDemoSeed(instant)),/forbidden/);
    await controller.switchMode('demo');state=await controller.snapshot();
    assert.equal(state.workouts.length,11);assert.equal(state.mode,'demo');
    const demo=await open('demo');
    await state.repository.deleteWorkout(state.workouts[0].id);
    const demoDraft=await state.repository.createWorkout('Editable demo');const added=await state.repository.addExercise(demoDraft.id,'bench');
    await state.repository.addSet(demoDraft.id,added.exercises[0].id,set());
    await state.repository.setUnit('lb');const demoBefore=await demo.getWorkouts();
    // Close every database: the new controller must read the persisted mode and preserve demo edits.
    for(const db of databases.values())db.close();databases.clear();stores.clear();
    controller=new DataModeController(open,()=>new Date('2026-12-14T12:00:00Z'));await controller.initialize();
    state=await controller.snapshot();assert.equal(state.mode,'demo');assert.deepEqual(state.workouts,demoBefore);assert.equal(state.settings.unit,'lb');
    await controller.switchMode('real');state=await controller.snapshot();assert.deepEqual(state.workouts,before);assert.equal(state.workouts[0].id,draft.id);
    await controller.switchMode('demo');
    // A failed replacement seed must roll back deletions and all related writes.
    const demoDB=databases.get('demo')!;demoDB.exec("CREATE TRIGGER fail_seed BEFORE INSERT ON workouts BEGIN SELECT RAISE(ABORT, 'seed failed'); END;");
    await assert.rejects(()=>controller.resetActive(),/seed failed/);assert.deepEqual((await controller.snapshot()).workouts,demoBefore);
    demoDB.exec('DROP TRIGGER fail_seed');
    await controller.resetActive();assert.equal((await controller.snapshot()).workouts.length,11);
    for(let i=0;i<3;i++)await controller.switchMode('demo');assert.equal((await controller.snapshot()).workouts.length,11);
    const restoredDemo=(await controller.snapshot()).workouts;
    await controller.switchMode('real');assert.deepEqual((await controller.snapshot()).workouts,before);
    await controller.resetActive();assert.deepEqual((await controller.snapshot()).workouts,[]);
    await controller.switchMode('demo');assert.deepEqual((await controller.snapshot()).workouts,restoredDemo);
    console.log('PASS: two real SQLite files, populated v1 migration, mode reopen, independent drafts/units, edit preservation, atomic failed-seed rollback, reset isolation, and idempotent reinitialization.');
  }finally{for(const db of databases.values())db.close();rmSync(folder,{recursive:true,force:true});}
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
