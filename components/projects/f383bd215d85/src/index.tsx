import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,useVideoConfig} from 'remotion';
import manifest from '../manifest.json';
import {useFonts} from './fonts';
import {BatchA} from './BatchA';
import {BatchB} from './BatchB';
import {BatchC} from './BatchC';
import {RebuiltX017} from './RebuiltX017';
export type Overrides={words?:string[];assets?:Record<string,string>;accent?:string;highlightWords?:string[];actorFraming?:{scale?:number;x?:number;y?:number}};
export function FredClip({id,overrides={}}:{id:string;overrides?:Overrides}) {
 useFonts(); const f=useCurrentFrame(); const {fps}=useVideoConfig();
 const item=manifest.clips.find(c=>c.id===id); if(!item)throw new Error('Unknown clip '+id);
 const Component=id==='X017'?RebuiltX017:item.sourceIndex<=3?BatchA:item.sourceIndex<=6?BatchB:BatchC;
 return <AbsoluteFill style={{background:'#fff',color:'#171719',fontFamily:'MiSans',fontWeight:500,overflow:'hidden'}}><Component id={id} t={f/fps} duration={item.durationInFrames/fps} overrides={overrides}/></AbsoluteFill>;
}
function Root(){return <>{manifest.clips.map(c=><Composition key={c.id} id={c.id} component={FredClip} width={1920} height={1080} fps={60} durationInFrames={c.durationInFrames} defaultProps={{id:c.id,overrides:{}}}/>)}</>}
registerRoot(Root);
