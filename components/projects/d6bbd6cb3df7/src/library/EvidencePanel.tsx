import {approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import motion from './N054-motion.json';

// Adapted from Library N054 UsageEvidence: retain its measured evidence retreat,
// replace the illustrative usage UI with one identity-bound real source image.
export function EvidencePanel({time,src,labels,focusY=0}:{time:number;src:string;labels:string[];focusY?:number}){
 const native=Math.min(311,Math.round(time*60));
 const state=motion[native];
 const scale=Math.min(1.38,state.scale);
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',left:state.x,top:Math.min(140,state.y),width:1106,height:700,borderRadius:22,overflow:'hidden',boxShadow:'0 18px 42px #0002',transform:`scale(${scale})`,transformOrigin:'0 0'}}>
   <Img src={staticFile(src)} style={{width:1106,transform:`translateY(${-focusY}px)`}}/>
  </div>
  {labels.map((label,index)=><div key={label} style={{position:'absolute',left:1320,top:230+index*210,width:530,fontSize:72,fontWeight:700,lineHeight:1.3,color:index===labels.length-1?'#8554E8':'#111',opacity:state.alpha[Math.min(index+1,4)]}}>{label}</div>)}
 </AbsoluteFill>;
}
