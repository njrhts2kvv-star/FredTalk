import React from 'react';
import {AbsoluteFill,Sequence} from 'remotion';
import motion from '../native/N023-motion.json';
import {Media,rect} from '../common';
// N023 native 30fps measured window expansion, remapped after actual prop reference.
export function WeaponCompare({frame}:{frame:number}){
 const nf=Math.min(110,Math.max(0,(frame-290)*.45)),a=Math.floor(nf),b=Math.min(125,a+1);const q=motion[a][0]+(motion[b][0]-motion[a][0])*(nf-a);
 if(frame<125)return <Media id="weapon-before"/>;
 if(frame<290)return <Media id="hammer"/>;
 return <AbsoluteFill style={{background:'#fff'}}>{['weapon-before','weapon-after'].map((id,i)=>{const w=i?520+(864-520)*q:1920+(864-1920)*q;const x=i?1370+(1016-1370)*q:40*q;const y=i?760+(290-760)*q:290*q;return <div key={id} style={{...rect(x,y,w,w*9/16),borderRadius:30*q,overflow:'hidden',boxShadow:'0 16px 28px #0003'}}><Media id={id}/></div>})}</AbsoluteFill>
}
