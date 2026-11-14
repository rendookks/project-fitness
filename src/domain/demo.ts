import { shiftWeeks, startOfWeek } from './calculations';
import { WorkoutSession } from './models';
import { DemoSeed } from '../storage/interface';

/** Same input instant produces the same seed. Persisted once; never shifts on restart. */
export function createDemoSeed(now = new Date()): DemoSeed {
  const monday=startOfWeek(now); const workouts:WorkoutSession[]=[];
  const plans=[{name:'Upper strength',ids:['bench','row','ohp'],weights:[50000,40000,25000]},
    {name:'Lower strength',ids:['squat','rdl','calf'],weights:[65000,55000,40000]},
    {name:'Full body practice',ids:['bench','pullup','goblet'],weights:[47500,0,20000]}];
  for(let week=0;week<4;week++) {
    const start=shiftWeeks(monday,week-3); const count=week===3?2:3;
    for(let session=0;session<count;session++) {
      const plan=plans[session]; const date=new Date(start);
      date.setDate(start.getDate()+(week===3?0:session*2)); date.setHours(8+session,0,0,0);
      const completed=new Date(Math.min(date.getTime(),now.getTime()));
      const id=`demo-v1-${week}-${session}`;
      workouts.push({id,name:`Demo · ${plan.name}`,status:'completed',startedAt:new Date(completed.getTime()-45*60_000).toISOString(),completedAt:completed.toISOString(),
        exercises:plan.ids.map((exerciseId,e)=>{
          const weight=plan.weights[e]===0?0:plan.weights[e]+week*2500;
          return {id:`${id}-ex-${e}`,exerciseId,sets:[{id:`${id}-${e}-warm`,kind:'warmup',weightGrams:Math.round(weight*.5),reps:10,completed:true},
            ...[0,1,2].map(s=>({id:`${id}-${e}-${s}`,kind:'working' as const,weightGrams:weight,reps:8-s,completed:true}))]};
        })});
    }
  }
  return {version:1,profile:{id:'local',goal:'Get stronger',experience:'Some experience',weeklyTarget:3,equipment:['Barbell','Dumbbells','Bodyweight','Machine'],onboardingCompletedAt:workouts[0].startedAt},settings:{unit:'kg'},workouts};
}
