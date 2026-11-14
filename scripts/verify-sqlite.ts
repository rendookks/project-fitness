import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WorkoutRepository } from '../src/domain/repository';
import { profile, set } from '../tests/fixtures';
import { personalRecord, workoutVolume } from '../src/domain/calculations';
import { migrate, SqlDriver, SqliteStorage, SqlValue } from '../src/storage/sqlite';

export function nodeDriver(db: DatabaseSync): SqlDriver {
  return {
    exec: async sql => { db.exec(sql); },
    run: async (sql, ...params: SqlValue[]) => { db.prepare(sql).run(...params); },
    get: async <T>(sql: string, ...params: SqlValue[]) => (db.prepare(sql).get(...params) as T | undefined) ?? null,
    all: async <T>(sql: string, ...params: SqlValue[]) => db.prepare(sql).all(...params) as T[],
    transaction: async action => {
      db.exec('BEGIN IMMEDIATE');
      try { await action(); db.exec('COMMIT'); }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
}
async function main() {
  const folder = mkdtempSync(join(tmpdir(), 'project-fitness-sql-'));
  const filename = join(folder, 'project_fitness.db');
  let db = new DatabaseSync(filename);
  try {
    await migrate(nodeDriver(db));
    let storage = new SqliteStorage(nodeDriver(db));
    let repo = new WorkoutRepository(storage);
    await repo.onboard(profile, { unit: 'lb' });
    const session = await repo.createWorkout("Push'; DROP TABLE workouts; --");
    await repo.renameWorkout(session.id, 'Upper strength');
    const added = await repo.addExercise(session.id, 'bench'); const ex = added.exercises[0];
    await repo.addSet(session.id, ex.id, set({ id: 'working', completed: false, weightGrams: 61235 }));
    await repo.addSet(session.id, ex.id, set({ id: 'warmup', kind: 'warmup', weightGrams: 100000 }));
    await repo.addSet(session.id, ex.id, set({ id: 'remove', weightGrams: 99999 }));
    await repo.removeSet(session.id, ex.id, 'remove');
    await migrate(nodeDriver(db));
    // A related-write failure must roll back both profile and settings.
    db.exec("CREATE TRIGGER reject_profile BEFORE UPDATE ON profile BEGIN SELECT RAISE(ABORT, 'injected failure'); END;");
    await assert.rejects(() => storage.saveOnboarding({ ...profile, weeklyTarget: 5 }, { unit: 'kg' }), /injected failure/);
    assert.equal((await storage.getSettings()).unit, 'lb');
    assert.equal((await storage.getProfile())!.weeklyTarget, 3);
    db.exec('DROP TRIGGER reject_profile');
    db.close(); db = new DatabaseSync(filename);
    await migrate(nodeDriver(db)); storage = new SqliteStorage(nodeDriver(db)); repo = new WorkoutRepository(storage);
    let restored = await repo.load();
    assert.equal(restored.settings.unit, 'lb'); assert.deepEqual(restored.profile, profile);
    assert.equal(restored.workouts[0].status, 'active');
    assert.equal(restored.workouts[0].exercises[0].sets.length, 2);
    assert.equal(restored.workouts[0].exercises[0].sets[0].weightGrams, 61235);
    const resumed = await repo.createWorkout('Must resume'); assert.equal(resumed.id, session.id);
    await assert.rejects(() => storage.saveWorkout({ ...restored.workouts[0], id: 'second-active' }), /UNIQUE/);
    await repo.editSet(session.id, ex.id, set({ id: 'working', weightGrams: 61235, reps: 8 }));
    await repo.finishWorkout(session.id); await repo.finishWorkout(session.id);
    for(let i=0;i<10;i++){await repo.setUnit('kg');await repo.setUnit('lb');}
    db.close(); db = new DatabaseSync(filename);
    await migrate(nodeDriver(db)); storage = new SqliteStorage(nodeDriver(db)); repo = new WorkoutRepository(storage);
    restored = await repo.load();
    assert.equal(restored.workouts.length, 1); assert.equal(restored.workouts[0].status, 'completed');
    assert.equal(workoutVolume(restored.workouts[0]), 489880);
    assert.equal(personalRecord(restored.workouts,'bench').heaviestGrams, 61235);
    await repo.deleteWorkout(session.id); assert.deepEqual((await repo.load()).workouts, []);
    await storage.reset(); assert.equal(await storage.getProfile(), null); assert.deepEqual(await storage.getSettings(), { unit: 'kg' });
    db.exec('PRAGMA user_version = 99');
    await assert.rejects(() => migrate(nodeDriver(db)), /newer version/);
    console.log('PASS: real SQLite migrations, atomic onboarding rollback, full workout lifecycle, unfinished/completed reopen, uniqueness, parameterization, unit stability, deletion/reset, and future-version protection.');
  } finally { db.close(); rmSync(folder, { recursive: true, force: true }); }
}
if (process.argv[1]?.endsWith('verify-sqlite.ts')) void main().catch(error => { console.error(error); process.exitCode = 1; });
