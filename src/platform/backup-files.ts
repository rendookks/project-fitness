import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { MAX_BACKUP_BYTES } from '../domain/backup';

export async function saveBackupFile(text: string): Promise<void> {
  if (!await Sharing.isAvailableAsync()) throw new Error('File sharing is not available on this device. Your local records are unchanged.');
  const file = new File(Paths.cache, `project-fitness-${Date.now()}.json`);
  file.create({ overwrite: true });file.write(text);
  try { await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Save Project Fitness backup' }); }
  finally { if(file.exists)file.delete(); }
}
export async function pickBackupFile(): Promise<string | null> {
  const result=await DocumentPicker.getDocumentAsync({type:['application/json','text/plain'],copyToCacheDirectory:true,multiple:false});
  if(result.canceled)return null;
  const file=new File(result.assets[0].uri);
  if(file.size>MAX_BACKUP_BYTES)throw new Error('Choose a backup smaller than 25 MB. No records were replaced.');
  return file.text();
}
