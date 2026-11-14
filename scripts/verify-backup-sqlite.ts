import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { WorkoutRepository } from '../src/domain/repository';
import { migrate, SqliteStorage } from '../src/storage/sqlite';
import { nodeDriver } from './verify-sqlite';
import { profile, set } from '../tests/fixtures';

async function main(){
  const dir=mkdtempSync(join(tmpdir(),'fitness-backup-'));const path=join(dir,'real.db');let db=new DatabaseSync(path);
  const demoDB=new DatabaseSync(join(dir,'demo.db'));
  try{
    await migrate(nodeDriver(db));await migrate(nodeDriver(demoDB));
    let storage=new SqliteStorage(nodeDriver(db));let repo=new WorkoutRepository(storage);
    const demo=new WorkoutRepository(new SqliteStorage(nodeDriver(demoDB),'demo'));
    await repo.onboard(profile,{unit:'lb'});const legacy=await repo.createWorkout('Legacy active session');await repo.addExercise(legacy.id,'bench');
    const before=await repo.load();
    // Simulate a populated v2 installation, then fail after executing the v4 migration SQL.
    db.exec('DROP TABLE routines; DROP TABLE custom_exercises; PRAGMA user_version=2;');
    const driver=nodeDriver(db);const exec=driver.exec;driver.exec=async sql=>{await exec(sql);if(sql.includes('CREATE TABLE custom_exercises'))throw new Error('migration interrupted');};
    await assert.rejects(()=>migrate(driver),/migration interrupted/);
    assert.equal((db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version,3);
    assert.equal(db.prepare("SELECT name FROM sqlite_master WHERE name='custom_exercises'").get(),undefined);
    await migrate(nodeDriver(db));assert.deepEqual(await repo.load(),before);
    await repo.deleteWorkout(legacy.id);
    await repo.saveCustomExercise({id:'custom-restore',name:'My press',muscle:'Chest',equipment:'Dumbbells',bodyweight:false,custom:true});
    await repo.saveRoutine({id:'push',name:'Push Day',updatedAt:new Date().toISOString(),exercises:[{id:'plan',exerciseId:'custom-restore',sets:[{kind:'working',reps:8,weightGrams:61235}]}]});
    const first=await repo.startRoutine('push');await repo.updateSet(first.id,first.exercises[0].id,first.exercises[0].sets[0].id,{completed:true});await repo.finishWorkout(first.id);
    await repo.startRoutine('push');const backup=await repo.createBackup();
    await demo.createWorkout('Demo stays independent');const demoBefore=await demo.load();
    await repo.renameWorkout((await repo.load()).workouts.find(w=>w.status==='active')!.id,'Keep me on failure');await repo.setUnit('kg');
    const original=await repo.load();
    db.exec("CREATE TRIGGER fail_restore BEFORE INSERT ON workouts BEGIN SELECT RAISE(ABORT, 'restore interrupted'); END;");
    await assert.rejects(()=>repo.restoreBackup(JSON.stringify(backup)),/restore interrupted/);
    assert.deepEqual(await repo.load(),original);assert.deepEqual(await demo.load(),demoBefore);
    db.exec('DROP TRIGGER fail_restore');
    await repo.restoreBackup(JSON.stringify(backup));
    db.close();db=new DatabaseSync(path);await migrate(nodeDriver(db));storage=new SqliteStorage(nodeDriver(db));repo=new WorkoutRepository(storage);
    const restored=await repo.load();assert.deepEqual(restored.workouts,backup.workouts);assert.deepEqual(restored.routines,backup.routines);assert.deepEqual(restored.customExercises,backup.customExercises);assert.equal(restored.settings.unit,'lb');
    assert.equal(restored.workouts.find(w=>w.status==='active')!.exercises[0].sets[0].weightGrams,61235);
    await assert.rejects(()=>repo.restoreBackup('{broken'),/JSON/);assert.deepEqual(await repo.load(),restored);
    await assert.rejects(()=>demo.restoreBackup(JSON.stringify(backup)),/real/);assert.deepEqual(await demo.load(),demoBefore);
    await assert.rejects(()=>demo.createBackup(),/real/);
    // Adding another ordinary set after restore verifies that repository state remains usable.
    const active=restored.workouts.find(w=>w.status==='active')!;await repo.addSet(active.id,active.exercises[0].id,set({id:'after-restore',completed:false}));
    console.log('PASS: populated v2/v3 migration interruption/retry without data loss; atomic restore rollback across all tables; exact-gram active/history/custom/routine reopen; corrupt-file failure; real/demo isolation.');
  }finally{db.close();demoDB.close();rmSync(dir,{recursive:true,force:true});}
}
void main().catch(e=>{console.error(e);process.exitCode=1;});
