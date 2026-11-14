import { AppSettings, UserProfile, WorkoutSession } from '../domain/models';
import { FitnessStorage } from './interface';

export type SqlValue = string | number | null;
/** Minimal driver lets integration checks run these exact statements on real SQLite. */
export interface SqlDriver {
  exec(sql: string): Promise<void>;
  run(sql: string, ...params: SqlValue[]): Promise<void>;
  get<T>(sql: string, ...params: SqlValue[]): Promise<T | null>;
  all<T>(sql: string, ...params: SqlValue[]): Promise<T[]>;
  transaction(action: () => Promise<void>): Promise<void>;
}
export const SCHEMA_VERSION = 1;
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
}
function decode<T>(row: { payload: string } | null): T | null {
  if (!row) return null;
  // Do not clear corrupt records or fall back silently; let the UI offer a retry.
  try { return JSON.parse(row.payload) as T; }
  catch { throw new Error('A saved record could not be read. Your data was preserved.'); }
}
export class SqliteStorage implements FitnessStorage {
  constructor(private readonly db: SqlDriver) {}
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
  async reset() {
    await this.db.transaction(async () => {
      await this.db.exec('DELETE FROM workouts; DELETE FROM profile; DELETE FROM settings;');
    });
  }
}
