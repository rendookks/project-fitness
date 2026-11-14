import * as SQLite from 'expo-sqlite';
import { migrate, SqlDriver, SqliteStorage } from './sqlite';

const connections = new Map<string, Promise<SqliteStorage>>();
export function openStorage(filename = 'project_fitness.db'): Promise<SqliteStorage> {
  const existing = connections.get(filename);
  if (existing) return existing;
  const opened = (async () => {
    const db = await SQLite.openDatabaseAsync(filename);
    const driver: SqlDriver = {
      exec: sql => db.execAsync(sql),
      run: async (sql, ...params) => { await db.runAsync(sql, ...params); },
      get: (sql, ...params) => db.getFirstAsync(sql, ...params),
      all: (sql, ...params) => db.getAllAsync(sql, ...params),
      transaction: action => db.withTransactionAsync(action),
    };
    await migrate(driver);
    return new SqliteStorage(driver);
  })();
  connections.set(filename, opened);
  void opened.catch(() => connections.delete(filename));
  return opened;
}
