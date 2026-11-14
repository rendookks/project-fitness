import { createDemoSeed } from '../domain/demo';
import { WorkoutRepository } from '../domain/repository';
import { DatabaseKind, FitnessStorage } from '../storage/interface';

/** Keeps the mode preference in real settings, and all demo fitness records in demo storage. */
export class DataModeController {
  private real: FitnessStorage | null = null;
  private active: WorkoutRepository | null = null;
  private selected: DatabaseKind = 'real';
  constructor(private readonly open: (kind: DatabaseKind) => Promise<FitnessStorage>, private readonly now = () => new Date()) {}
  async initialize() {
    this.real=await this.open('real');
    const preference=await this.real.getSettings();
    await this.select(preference.demoEnabled?'demo':'real',false);
  }
  private async select(kind: DatabaseKind, persist: boolean) {
    if(!this.real) throw new Error('Initialize data storage first.');
    const destination=kind==='real'?this.real:await this.open('demo');
    if(destination.kind!==kind) throw new Error('Database identity mismatch. No records were moved.');
    if(kind==='demo')await destination.initializeDemo(createDemoSeed(this.now()));
    const next=new WorkoutRepository(destination);
    // Verify destination can be read before changing the persisted preference.
    await next.load();
    if(persist) await this.real.saveSettings({...await this.real.getSettings(),demoEnabled:kind==='demo'});
    this.active=next; this.selected=kind;
  }
  async switchMode(kind: DatabaseKind) { await this.select(kind,true); }
  async snapshot() {
    if(!this.active)throw new Error('Initialize data storage first.');
    return {...await this.active.load(),repository:this.active,mode:this.selected};
  }
  async resetActive() {
    if(!this.active)throw new Error('Initialize data storage first.');
    if(this.selected==='demo') await this.active.storage.initializeDemo(createDemoSeed(this.now()),true);
    else await this.active.reset();
  }
}
