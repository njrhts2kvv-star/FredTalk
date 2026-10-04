import React from 'react';
import {interpolate,Easing} from 'remotion';
const phase=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{easing:Easing.bezier(.22,1,.36,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
// Library #062 Bars: common baseline, first bar changes, second enters later.
// Actual prices/allowances replace illustrative percentages and decorative icons.
export function MetricBars({time,kind}:{time:number;kind:'price'|'plans'}){
 const plans=kind==='plans';
 const first=plans?20-10*phase(time,1.35,3.6):5;
 const second=plans?25*phase(time,8.15,8.7):phase(time,9.76,10.45);
 const max=plans?25:5;
 const values=[first,second];
 return <>
  {values.map((value,index)=><div key={index} style={{position:'absolute',left:460+index*720,top:110,width:420,height:760}}>
   <div style={{position:'absolute',left:35,bottom:150,width:300,height:value/max*440,background:index?'#8554E8':'#111',borderRadius:'8px 8px 0 0'}}/>
   <div style={{position:'absolute',left:0,bottom:160+value/max*440,width:370,fontSize:112,lineHeight:1,textAlign:'center',fontWeight:700,color:index?'#8554E8':'#111'}}>{plans?`${Math.round(value)}×`:index?(second>.9?'1/5':''): 'Astra'}</div>
   <div style={{position:'absolute',left:0,bottom:50,width:370,fontSize:54,fontWeight:600,textAlign:'center',opacity:index?phase(time,plans?5.57:9.76,plans?6.1:10.1):1}}>{plans?(index?'$500 / 月':'$200 / 月'):(index?'GPT-6.1 Sol':'标准 API 价格')}</div>
  </div>)}
  <div style={{position:'absolute',left:100,top:100,fontSize:46,fontWeight:600}}>{plans?'工作 / Codex 额度 · 相同 Plus 基准':'能力接近 Astra · 标准输入 / 输出 Token 价格'}</div>
 </>;
}
