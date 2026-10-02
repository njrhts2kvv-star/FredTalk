import React from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame} from 'remotion';
import {measuredSample} from './RebuiltGrid';
import spec from '../../../../specs/T08.json';
import uiSpec from '../../../../specs/W05.json';
import {PhoneUI} from './RebuiltW05';
export const RebuiltT08:React.FC=()=>{const f=useCurrentFrame(),win=spec.objects.window;const x=measuredSample(spec.tracks,'window',f)[0];return <AbsoluteFill style={{background:'white'}}>{spec.objects.cards.map((card,i)=>{const[x,y,w,h]=measuredSample(spec.tracks,card.track,f);return y+h<=0?null:<div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:card.radius,boxShadow:'28px 17px 24px #0004',overflow:'hidden'}}><div style={{transform:`scale(${w/uiSpec.objects.cards[i].rect[2]},${h/922})`,transformOrigin:'0 0'}}><PhoneUI index={i}/></div></div>})}<div style={{position:'absolute',left:x,top:win.y,width:win.width,height:win.height,borderRadius:win.radius,overflow:'hidden',background:win.fill,boxShadow:'30px 20px 29px #0005'}}><div style={{height:win.headerHeight,background:win.headerFill}}/>{win.controls.map((color,i)=><div key={i} style={{position:'absolute',left:53+i*46,top:35,width:24,height:24,borderRadius:'50%',background:color}}/>)}</div></AbsoluteFill>};
