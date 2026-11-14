import { useEffect, useState } from 'react';
import { openStorage } from '../src/storage/open';
import { Button, Card, Eyebrow, Heading, Loading, Screen, Txt } from '../src/ui';

export default function Foundation() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('');
  const initialize = () => {
    setState('loading');
    void openStorage().then(() => setState('ready')).catch((e: Error) => { setError(e.message); setState('error'); });
  };
  useEffect(initialize, []);
  if (state === 'loading') return <Loading />;
  return <Screen><Eyebrow>PROJECT FITNESS / FOUNDATION</Eyebrow><Heading>A stronger foundation.</Heading><Card><Txt>{state === 'ready' ? 'Your local training database is ready.' : error}</Txt><Txt tone="muted">Expo SDK 54 · Local SQLite · No cloud account</Txt>{state === 'error' && <Button title="Retry initialization" onPress={initialize} />}</Card></Screen>;
}
