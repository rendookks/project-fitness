import { MemoryStorage } from '../src/storage/memory';
import { migrate, SqlDriver } from '../src/storage/sqlite';

test('storage defaults and defensive copies', async () => {
  const store = new MemoryStorage();
  expect(await store.getProfile()).toBeNull();
  expect(await store.getWorkouts()).toEqual([]);
  await store.saveSettings({ unit: 'lb' });
  const settings = await store.getSettings(); settings.unit = 'kg';
  expect(await store.getSettings()).toEqual({ unit: 'lb' });
  await store.reset(); expect(await store.getSettings()).toEqual({ unit: 'kg' });
});
test('migration never resets a newer database', async () => {
  const exec = jest.fn();
  const db = { exec, get: async () => ({ user_version: 99 }) } as unknown as SqlDriver;
  await expect(migrate(db)).rejects.toThrow('newer version');
  expect(exec).toHaveBeenCalledTimes(1);
  expect(exec.mock.calls[0][0]).not.toMatch(/DELETE|DROP/);
});
