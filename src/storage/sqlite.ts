import type { UserData } from '../domain/backup';
import { AppSettings, Exercise, Routine, UserProfile, WorkoutSession } from '../domain/models';
import { DatabaseKind, DemoSeed, FitnessStorage } from './interface';

export type SqlValue = string | number | null;
/** Minimal driver lets integration checks run these exact statements on real SQLite. */
export interface SqlDriver {
  exec(sql: string): Promise<void>;
  run(sql: string, ...params: SqlValue[]): Promise<void>;
  get<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  all<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
  transaction(action: () => Promise<void>): Promise<void>;
}
export const SCHEMA_VERSION = 4;
export async function migrate(db: SqlDriver): Promise<void> {
  await db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const version = await db.get<{ user_version: number }>('PRAGMA user_version');
  if (!version || version.user_version > SCHEMA_VERSION) {
    throw new Error('This database needs a newer version of Project Fitness. Your data was preserved.');
  }
  if (version.user_version < 1) {
    await db.transaction(async () => {
      await db.exec(`
        CREATE TABLE profile (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL);
        CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK (id = 1), payload TEXT NOT NULL);
        CREATE TABLE workouts (
          id TEXT PRIMARY KEY NOT NULL,
          status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
          started_at TEXT NOT NULL,
          completed_at TEXT,
          payload TEXT NOT NULL
        );
        CREATE INDEX workouts_status_date ON workouts(status, started_at DESC);
        CREATE UNIQUE INDEX one_active_workout ON workouts(status) WHERE status = 'active';
        PRAGMA user_version = 1;
      `);
    });
  }
  if (version.user_version < 2) {
    await db.transaction(async () => {
      await db.exec('CREATE TABLE metadata (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL); PRAGMA user_version = 2;');
    });
  }
  if (version.user_version < 3) {
    await db.transaction(async () => {
      await db.exec('CREATE TABLE routines (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL); PRAGMA user_version = 3;');
    });
  }

  if (version.user_version < 4) {
    await db.transaction(async () => {
      await db.exec('CREATE TABLE custom_exercises (id TEXT PRIMARY KEY NOT NULL, payload TEXT NOT NULL); PRAGMA user_version = 4;');
    });
  }

}
function decode<T>(row: { payload: string } | null): T | null {
  if (!row) return null;
  // Do not clear corrupt records or fall back silently; let the UI offer a retry.
  try { return JSON.parse(row.payload) as T; }
  catch { throw new Error('A saved record could not be read. Your data was preserved.'); }
}
export class SqliteStorage implements FitnessStorage {
  constructor(private readonly db: SqlDriver, readonly kind: DatabaseKind = 'real') {}
  async initializeDemo(seed: DemoSeed, replace = false) {
    if (this.kind !== 'demo') throw new Error('Demo seeding is forbidden in the real database.');
    await this.db.transaction(async () => {
      const seeded = await this.db.get<{ value: string }>("SELECT value FROM metadata WHERE key = 'demo_seed_version'");
      if (seeded && !replace) return;
      if (replace) await this.db.exec('DELETE FROM custom_exercises; DELETE FROM routines; DELETE FROM workouts; DELETE FROM profile; DELETE FROM settings; DELETE FROM metadata;');
      await this.saveProfile(seed.profile); await this.saveSettings(seed.settings);
      for (const workout of seed.workouts) await this.saveWorkout(workout);
      await this.db.run("INSERT INTO metadata(key, value) VALUES ('demo_seed_version', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value", String(seed.version));
    });
  }
  async saveOnboarding(profile: UserProfile, settings: AppSettings) {
    await this.db.transaction(async () => { await this.saveSettings(settings); await this.saveProfile(profile); });
  }
  async getProfile() { return decode<UserProfile>(await this.db.get('SELECT payload FROM profile WHERE id = 1')); }
  async saveProfile(profile: UserProfile) {
    await this.db.run('INSERT INTO profile(id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', JSON.stringify(profile));
  }
  async getSettings() {
    return decode<AppSettings>(await this.db.get('SELECT payload FROM settings WHERE id = 1')) ?? { unit: 'kg' };
  }
  async saveSettings(settings: AppSettings) {
    await this.db.run('INSERT INTO settings(id, payload) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', JSON.stringify(settings));
  }
  async getWorkouts() {
    const rows = await this.db.all<{ payload: string }>('SELECT payload FROM workouts ORDER BY started_at DESC, id DESC');
    return rows.map(row => decode<WorkoutSession>(row)!);
  }
  async saveWorkout(workout: WorkoutSession) {
    await this.db.run(`INSERT INTO workouts(id, status, started_at, completed_at, payload) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, started_at=excluded.started_at,
      completed_at=excluded.completed_at, payload=excluded.payload`,
    workout.id, workout.status, workout.startedAt, workout.completedAt, JSON.stringify(workout));
  }
  async deleteWorkout(id: string) { await this.db.run('DELETE FROM workouts WHERE id = ?', id); }
  async getCustomExercises() {
    return (await this.db.all<{ payload: string }>('SELECT payload FROM custom_exercises ORDER BY rowid')).map(row => decode<Exercise>(row)!);
  }
  async saveCustomExercise(exercise: Exercise) {
    await this.db.run('INSERT INTO custom_exercises(id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', exercise.id, JSON.stringify(exercise));
  }
  async getRoutines() {
    return (await this.db.all<{ payload: string }>('SELECT payload FROM routines ORDER BY rowid')).map(row => decode<Routine>(row)!);
  }
  async saveRoutine(routine: Routine) {
    await this.db.run('INSERT INTO routines(id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload', routine.id, JSON.stringify(routine));
  }
  async deleteRoutine(id: string) { await this.db.run('DELETE FROM routines WHERE id = ?', id); }
  async replaceUserData(data: UserData) {
    if (this.kind !== 'real') throw new Error('Restore is available only for real data.');
    await this.db.transaction(async () => {
      await this.db.exec('DELETE FROM workouts; DELETE FROM routines; DELETE FROM custom_exercises; DELETE FROM profile; DELETE FROM settings;');
      if(data.profile)await this.saveProfile(data.profile);
      await this.saveSettings({...data.settings,demoEnabled:false});
      for(const ex of data.customExercises)await this.saveCustomExercise(ex);
      for(const routine of data.routines)await this.saveRoutine(routine);
      for(const workout of data.workouts)await this.saveWorkout(workout);
    });
  }
  async reset() {
    await this.db.transaction(async () => {
      await this.db.exec('DELETE FROM custom_exercises; DELETE FROM routines; DELETE FROM workouts; DELETE FROM profile; DELETE FROM settings; DELETE FROM metadata;');
    });
  }
}
