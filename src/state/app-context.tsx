import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openStorage } from '../storage/open';
import { DatabaseKind } from '../storage/interface';
import { colors } from '../theme/tokens';
import { Button, Heading, Loading, Screen, Txt } from '../ui';
import { DataModeController } from './data-mode';
import { DemoLayoutContext } from './mode-layout';

type Data = Awaited<ReturnType<DataModeController['snapshot']>>;
interface AppContext extends Data {
  pending: boolean;
  run: (action: () => Promise<unknown>) => Promise<boolean>;
  changeMode: (kind: DatabaseKind) => Promise<boolean>;
  resetActive: () => Promise<boolean>;
}
const Context = createContext<AppContext | null>(null);
export function AppProvider({ children }: PropsWithChildren) {
  const [controller,setController]=useState<DataModeController|null>(null);
  const [data,setData]=useState<Data|null>(null);
  const [initialError,setInitialError]=useState(''); const [error,setError]=useState('');
  const [pending,setPending]=useState(false); const queue=useRef<Promise<unknown>>(Promise.resolve()); const count=useRef(0);
  const initialize=useCallback(()=>{
    const next=new DataModeController(openStorage);
    void next.initialize().then(async()=>{setData(await next.snapshot());setController(next);}).catch((e:Error)=>setInitialError(e.message));
  },[]);
  useEffect(initialize,[initialize]);
  const run=useCallback(async(action:()=>Promise<unknown>)=>{
    if(!controller)return false;
    count.current++; setPending(true);
    const task=queue.current.then(async()=>{
      setError('');
      try{await action();setData(await controller.snapshot());return true;}
      catch(e){setError(e instanceof Error?e.message:'Could not save. Previously saved data is preserved.');return false;}
      finally{count.current--;if(count.current===0)setPending(false);}
    });
    queue.current=task; return task;
  },[controller]);
  if(initialError)return <Screen><Heading>We couldn’t open your data.</Heading><Txt tone="muted">{initialError}</Txt><Txt>Your records have not been reset.</Txt><Button title="Retry opening database" onPress={() => { setInitialError(''); initialize(); }} /></Screen>;
  if(!controller||!data)return <Loading />;
  return <DemoLayoutContext.Provider value={data.mode==='demo'}><Context.Provider value={{...data,pending,run,changeMode:kind=>run(()=>controller.switchMode(kind)),resetActive:()=>run(()=>controller.resetActive())}}>
    {data.mode==='demo'&&<SafeAreaView edges={['top']} style={{backgroundColor:'#282231'}}><View style={{paddingHorizontal:20,paddingVertical:8,borderBottomWidth:1,borderColor:colors.border}}><Txt style={{fontSize:12,lineHeight:18,color:colors.champagne}}>DEMO MODE · Fictional training records</Txt></View></SafeAreaView>}
    {error?<View accessibilityRole="alert" style={{padding:16,backgroundColor:colors.elevated,gap:8}}><Txt style={{color:colors.danger}}>{error}</Txt><Button title="Dismiss message" variant="secondary" onPress={()=>setError('')} /></View>:null}
    {pending?<View pointerEvents="none" accessibilityLiveRegion="polite" style={{position:'absolute',bottom:88,left:20,zIndex:50,borderRadius:8,backgroundColor:colors.surface,paddingHorizontal:12,paddingVertical:4}}><Txt style={{fontSize:12}} tone="accent">Saving locally…</Txt></View>:null}
    {children}
  </Context.Provider></DemoLayoutContext.Provider>;
}
export function useApp() {
  const context=useContext(Context);if(!context)throw new Error('AppProvider is required.');return context;
}
