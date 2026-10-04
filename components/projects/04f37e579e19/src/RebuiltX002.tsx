import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';
import type {Overrides} from './index';
const v=(f:number,p:number[][])=>interpolate(f,p.map(q=>q[0]),p.map(q=>q[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
// Independent source-native ingress tracks; the eight movie layers never remount on settle.
const slots=[
 {box:[42,49,230,403],axis:'x',track:[[35,-240],[36,-230],[38,-201],[39,-162],[40,-93],[41,-40],[42,-1],[43,25],[44,40],[45,42]]},
 {box:[338,49,485,277],axis:'y',track:[[35,-280],[36,-277],[37,-239],[38,-200],[39,-163],[40,-127],[41,-92],[42,-60],[43,-32],[44,-9],[45,11],[46,26],[47,37],[48,44],[49,48],[50,49]]},
 {box:[338,367,234,311],axis:'y',track:[[31,725],[32,720],[34,690],[36,506],[37,476],[38,449],[39,425],[40,405],[41,391],[42,380],[43,372],[44,368],[45,367]]},
 {box:[881,214,355,144],axis:'x',track:[[36,1280],[37,1270],[38,1170],[39,1086],[40,1017],[41,964],[42,925],[43,900],[44,885],[45,881]]},
 {box:[845,385,391,293],axis:'y',track:[[40,725],[41,709],[42,672],[43,635],[44,597],[45,561],[46,526],[47,494],[48,466],[49,442],[50,423],[51,408],[52,397],[53,390],[54,386],[55,385]]},
 {box:[624,360,179,318],axis:'y',track:[[45,720],[46,684],[47,647],[48,610],[49,572],[50,536],[51,501],[52,469],[53,441],[54,417],[55,398],[56,383],[57,372],[58,365],[59,361],[60,360]]},
 {box:[43,479,265,199],axis:'x',track:[[52,-265],[53,-259],[54,-153],[55,-84],[56,-31],[57,8],[58,34],[59,43],[60,43]]},
 {box:[881,49,355,144],axis:'y',track:[[54,-144],[55,-123],[56,-89],[57,-57],[58,-29],[59,-5],[60,14],[61,29],[62,40],[63,47],[64,49]]},
];
export function RebuiltX002({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8',words=overrides.words??['算力','显存'];
 const wash=v(f,[[0,0],[26,0],[28,.20],[30,.38],[32,.58],[34,.75],[36,.9],[38,.98],[40,1]]);
 const slip=v(f,[[0,0],[26,0],[28,78],[30,235],[32,415],[34,530]]);
 return <AbsoluteFill style={{background:'white'}}>
  {f<40&&<AbsoluteFill><OffthreadVideo muted src={staticFile(overrides.assets?.backdrop??'calibration-b/slot-9.mp4')} playbackRate={.65} style={{width:'100%',height:'100%',objectFit:'cover',filter:'blur(9px) brightness(.6)'}}/><AbsoluteFill style={{background:'white',opacity:wash}}/></AbsoluteFill>}
  {f<35&&words.slice(0,2).map((word,i)=><div key={i} style={{position:'absolute',left:([199,750][i]+slip*(i?1:-1))*1.5,top:252*1.5,width:328*1.5,height:216*1.5,borderRadius:40,background:i?'black':accent,color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'MiSans',fontWeight:900,fontSize:168,boxShadow:'14px 15px 18px #0004'}}>{word}</div>)}
  {slots.map((slot,i)=>{if(f<slot.track[0][0])return null;const [x,y,width,height]=slot.box,offset=v(f,slot.track);return <div key={i} style={{position:'absolute',left:(slot.axis==='x'?offset:x)*1.5,top:(slot.axis==='y'?offset:y)*1.5,width:width*1.5,height:height*1.5,borderRadius:[21,21,17,12,22,13,14,12][i],overflow:'hidden',boxShadow:'28px 14px 19px #0004'}}><OffthreadVideo muted playbackRate={.65} src={staticFile(overrides.assets?.[`video${i}`]??`calibration-b/slot-${i+1}.mp4`)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>})}
 </AbsoluteFill>;
}
