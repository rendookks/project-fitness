import { router } from 'expo-router';
import { useState } from 'react';
import { DataBackup, parseBackup } from '../domain/backup';
import { pickBackupFile, saveBackupFile } from '../platform/backup-files';
import { useApp } from '../state/app-context';
import { colors } from '../theme/tokens';
import { Button, Card, Eyebrow, Txt } from '../ui';
import { Confirm } from '../ui/sheet';

export function BackupPanel() {
  const {repository,mode,run,pending}=useApp();const [preview,setPreview]=useState<DataBackup|null>(null);
  const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
  const perform=async(action:()=>Promise<void>)=>{if(busy||pending)return;setBusy(true);setError('');setMessage('');try{await action();}catch(e){setError((e as Error).message);}finally{setBusy(false);}};
  return <Card><Eyebrow>LOCAL BACKUP & RESTORE</Eyebrow><Txt tone="muted" style={{fontSize:14}}>Save a versioned file containing your real profile, units, custom movements, routines, history, and active session. This is a manual backup, not cloud sync. Keep the file somewhere you trust.</Txt>
    {mode==='demo'?<Txt tone="muted">Return to real data to back up or restore. Fictional demo records are excluded.</Txt>:<>
      <Button title="Export real-data backup" icon="download" variant="secondary" disabled={busy||pending} onPress={()=>{void perform(async()=>{let text='';const ok=await run(async()=>{text=JSON.stringify(await repository.createBackup(),null,2);});if(!ok)throw new Error('Could not prepare the backup. Try again.');await saveBackupFile(text);setMessage('Backup file prepared. Keep the saved file to restore later; dismissing sharing does not save a copy.');});}} />
      <Button title="Choose backup to restore" icon="upload" variant="secondary" disabled={busy||pending} onPress={()=>{void perform(async()=>{const text=await pickBackupFile();if(text!==null)setPreview(parseBackup(text));});}} />
    </>}
    {message&&<Txt accessibilityLiveRegion="polite" style={{color:colors.aqua,fontSize:13}}>{message}</Txt>}
    {error&&<Txt accessibilityRole="alert" style={{color:colors.danger,fontSize:13}}>{error}</Txt>}
    <Confirm visible={!!preview} title="Replace real data from backup?" detail={preview?`File created ${new Date(preview.createdAt).toLocaleString()}: ${preview.workouts.filter(w=>w.status==='completed').length} saved workouts, ${preview.workouts.filter(w=>w.status==='active').length} active workout, ${preview.routines.length} routines, ${preview.customExercises.length} custom movements. Profile ${preview.profile?'included':'empty'}, units ${preview.settings.unit}. This replaces ALL current real records, including an unfinished session. Export your current data first if you want to keep it. Demo data is unaffected. Nothing is merged.`:''} confirmLabel="Replace real data" busy={pending} onCancel={()=>setPreview(null)} onConfirm={()=>{if(preview)void run(()=>repository.restoreBackup(JSON.stringify(preview))).then(ok=>{if(ok){setPreview(null);setMessage('Real data restored successfully.');router.replace(preview.profile?'/(tabs)':'/onboarding');}});}} />
  </Card>;
}
