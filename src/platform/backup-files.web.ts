import { MAX_BACKUP_BYTES } from '../domain/backup';

export async function saveBackupFile(text: string): Promise<void> {
  const blob=new Blob([text],{type:'application/json'});const url=URL.createObjectURL(blob);
  const link=document.createElement('a');link.href=url;link.download=`project-fitness-${Date.now()}.json`;document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export async function pickBackupFile(): Promise<string | null> {
  return new Promise((resolve,reject)=>{
    const input=document.createElement('input');input.type='file';input.accept='.json,application/json,text/plain';input.setAttribute('aria-label','Select backup file');input.style.display='none';document.body.appendChild(input);
    const cleanup=()=>input.remove();
    input.addEventListener('cancel',()=>{cleanup();resolve(null);},{once:true});
    input.addEventListener('change',()=>{
      const file=input.files?.[0];cleanup();if(!file){resolve(null);return;}
      if(file.size>MAX_BACKUP_BYTES){reject(new Error('Choose a backup smaller than 25 MB. No records were replaced.'));return;}
      void file.text().then(resolve,reject);
    },{once:true});input.click();
  });
}
