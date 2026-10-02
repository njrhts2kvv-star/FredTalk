import React from 'react';
import {AbsoluteFill,useCurrentFrame} from 'remotion';
import {Scene as PreservedScene} from './SceneV2';
import * as Motion from './SemanticMotion';
import * as EarlyMotion from './R6EarlyMotion';
import * as MidMotion from './R6MidMotion';
import * as LateMotion from './R6LateMotion';
import * as R7OpeningMotion from './R7OpeningMotion';
import * as R7MidMotion from './R7MidMotion';
import * as R7LateMotion from './R7LateMotion';
import * as R7ChatRevision from './R7ChatRevision';
export type Page={stableId:string;kind:string;startFrame:number;durationInFrames:number;exactScreenWords:string[];motionEvents:{cueFrame:number;spokenCue:string}[];v3:{symbol:string;preserved:boolean}};
export function Scene({page}:{page:Page}){
  const t=useCurrentFrame()/60,n=page.durationInFrames/60;
  const c=(i:number)=>(page.motionEvents[Math.min(i,page.motionEvents.length-1)].cueFrame-page.startFrame)/60;
  if(page.v3.preserved)return <PreservedScene page={page}/>;
  const components={...Motion,...EarlyMotion,...MidMotion,...LateMotion,...R7OpeningMotion,...R7MidMotion,...R7LateMotion,...R7ChatRevision} as unknown as Record<string,React.ComponentType<Motion.MotionProps>>;
  const Component=components[page.v3.symbol];
  if(!Component)throw new Error('Missing V3 component '+page.v3.symbol);
  return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans',letterSpacing:0}}><Component t={t} n={n} c={c}/></AbsoluteFill>;
}
