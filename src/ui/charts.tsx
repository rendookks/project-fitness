import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
import { colors as c, fonts } from '../theme/tokens';
import { Txt } from './index';

export function TargetRing({ count, target }: { count: number; target: number }) {
  const radius=37; const circumference=2*Math.PI*radius;
  return <View accessible accessibilityLabel={`${count} of ${target} workouts this week`} style={{ width: 96, height: 96, alignItems: 'center', justifyContent: 'center' }}>
    <Svg width={96} height={96} style={{position:'absolute'}} aria-hidden>
      <Circle cx={48} cy={48} r={radius} stroke={c.border} strokeWidth={6} fill="none" />
      <Circle cx={48} cy={48} r={radius} stroke={c.aqua} strokeWidth={6} strokeLinecap="round" fill="none" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={circumference*(1-Math.min(count/target,1))} rotation={-90} origin="48, 48" />
    </Svg><Txt style={{fontSize:26,lineHeight:32,fontFamily:fonts.extra}}>{count}<Txt tone="muted" style={{fontSize:14}}>/{target}</Txt></Txt><Txt tone="muted" style={{fontSize:10,lineHeight:14}}>THIS WEEK</Txt>
  </View>;
}
export function WeekBars({ weeks }: { weeks: { start: Date; count: number; target: number }[] }) {
  const max=Math.max(1,...weeks.map(w=>Math.max(w.count,w.target)))*1.2;
  return <View style={{gap:12}}>
    <View style={{flexDirection:'row',gap:12,alignItems:'flex-end',paddingTop:12}}>{weeks.map((w,i)=><View key={w.start.toISOString()} style={{flex:1,gap:10,alignItems:'center'}} accessible accessibilityLabel={`Week of ${w.start.toLocaleDateString()}: ${w.count} of ${w.target} workouts`}>
      <Txt style={{fontFamily:fonts.bold,color:i===3?c.iris:c.text}}>{w.count}<Txt tone="muted" style={{fontSize:12}}>/{w.target}</Txt></Txt>
      <View style={{height:96,width:'100%',backgroundColor:c.elevated,borderRadius:8,justifyContent:'flex-end',overflow:'hidden'}}><View style={{position:'absolute',bottom:96*w.target/max,height:1,width:'100%',backgroundColor:c.muted,opacity:.5}} /><View style={{height:96*w.count/max,width:'100%',backgroundColor:i===3?c.iris:c.aqua,borderRadius:8}} /></View>
      <Txt tone="muted" style={{fontSize:11,lineHeight:16}}>{w.start.toLocaleDateString(undefined,{month:'short',day:'numeric'})}</Txt>
    </View>)}</View><Txt tone="muted" style={{fontSize:12}}>Week of Monday · Line marks your weekly target</Txt>
  </View>;
}
export function TrendChart({ points, unit, label }: { points: { label: string; value: number }[]; unit: string; label: string }) {
  const [width,setWidth]=useState(300);
  const height=190; const left=42; const right=width-16; const top=24; const bottom=155;
  const max=Math.max(1,...points.map(p=>p.value))*1.15;
  const x=(i:number)=>points.length===1?(left+right)/2:left+i*(right-left)/(points.length-1);
  const y=(n:number)=>bottom-n/max*(bottom-top);
  const path=points.map((p,i)=>`${i?'L':'M'} ${x(i)} ${y(p.value)}`).join(' ');
  return <View onLayout={event=>setWidth(Math.max(220,event.nativeEvent.layout.width))} accessible accessibilityLabel={`${label}. ${points.map(p=>`${p.label}: ${Number(p.value.toFixed(2))} ${unit}`).join('; ')}`}>
    <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {[0,.5,1].map(f=><ViewlessGrid key={f} x={left} right={right} y={y(max*f)} text={`${Number((max*f).toFixed(0))}`} />)}
      {points.length>1 && <Path d={`${path} L ${x(points.length-1)} ${bottom} L ${x(0)} ${bottom} Z`} fill={c.aqua} fillOpacity={.06} />}
      <Path d={path} stroke={c.aqua} strokeWidth={2.5} fill="none" />
      {points.map((p,i)=><Circle key={`p-${i}`} cx={x(i)} cy={y(p.value)} r={4} fill={c.aqua} stroke={c.surface} strokeWidth={2} />)}
      {points.map((p,i)=><SvgText key={`t-${i}`} x={x(i)} y={180} textAnchor="middle" fill={c.muted} fontSize={10}>{p.label}</SvgText>)}
    </Svg>
  </View>;
}
function ViewlessGrid({x,right,y,text}:{x:number;right:number;y:number;text:string}) {
  return <><Line x1={x} y1={y} x2={right} y2={y} stroke={c.border} strokeDasharray="3 5" /><SvgText x={x-8} y={y+4} textAnchor="end" fill={c.muted} fontSize={10}>{text}</SvgText></>;
}
