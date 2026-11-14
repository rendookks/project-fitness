import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
    await storage.saveSettings({ unit: 'lb' });
    await migrate(nodeDriver(db));
    assert.deepEqual(await storage.getSettings(), { unit: 'lb' });
    db.close(); db = new DatabaseSync(filename);
    await migrate(nodeDriver(db)); storage = new SqliteStorage(nodeDriver(db));
    assert.deepEqual(await storage.getSettings(), { unit: 'lb' });
    await storage.reset(); assert.deepEqual(await storage.getSettings(), { unit: 'kg' });
    db.exec('PRAGMA user_version = 99');
    await assert.rejects(() => migrate(nodeDriver(db)), /newer version/);
    console.log('PASS: real SQLite schema initialization, idempotence, reopen, reset, and future-version protection.');
  } finally { db.close(); rmSync(folder, { recursive: true, force: true }); }
}
if (process.argv[1]?.endsWith('verify-sqlite.ts')) void main().catch(error => { console.error(error); process.exitCode = 1; });
