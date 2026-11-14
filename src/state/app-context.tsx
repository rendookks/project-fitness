import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { AppSettings, UserProfile, WorkoutSession } from '../domain/models';
import { WorkoutRepository } from '../domain/repository';
import { openStorage } from '../storage/open';
import { colors } from '../theme/tokens';
import { Button, Heading, Loading, Screen, Txt } from '../ui';

interface Data { profile: UserProfile | null; settings: AppSettings; workouts: WorkoutSession[] }
interface AppContext extends Data {
  repository: WorkoutRepository;
  pending: boolean;
  run: (action: () => Promise<unknown>) => Promise<boolean>;
}
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: PropsWithChildren) {
  const [repository, setRepository] = useState<WorkoutRepository | null>(null);
  const [data, setData] = useState<Data | null>(null);
  const [initialError, setInitialError] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const saving = useRef(false);
  const initialize = useCallback(() => {
    setInitialError('');
    void openStorage().then(async storage => {
      const repo = new WorkoutRepository(storage); const loaded = await repo.load();
      setRepository(repo); setData(loaded);
    }).catch((e: Error) => setInitialError(e.message));
  }, []);
  useEffect(initialize, [initialize]);
  const run = useCallback(async (action: () => Promise<unknown>) => {
    if (!repository || saving.current) return false;
    saving.current = true; setPending(true); setError('');
    try { await action(); setData(await repository.load()); return true; }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save. Your previously saved data is preserved.'); return false; }
    finally { saving.current = false; setPending(false); }
  }, [repository]);
  if (initialError) return <Screen><Heading>We couldn’t open your data.</Heading><Txt tone="muted">{initialError}</Txt><Txt>Your records have not been reset.</Txt><Button title="Retry opening database" onPress={initialize} /></Screen>;
  if (!repository || !data) return <Loading />;
  return <Context.Provider value={{ ...data, repository, run, pending }}>
    {error ? <View accessibilityRole="alert" style={{ padding: 16, backgroundColor: colors.elevated, gap: 8 }}><Txt style={{ color: colors.danger }}>{error}</Txt><Button title="Dismiss message" variant="secondary" onPress={() => setError('')} /></View> : null}
    {pending ? <View accessibilityLiveRegion="polite" style={{ backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 4 }}><Txt style={{ fontSize: 12 }} tone="accent">Saving locally…</Txt></View> : null}
    {children}
  </Context.Provider>;
}
export function useApp() {
  const context = useContext(Context); if (!context) throw new Error('AppProvider is required.'); return context;
}
