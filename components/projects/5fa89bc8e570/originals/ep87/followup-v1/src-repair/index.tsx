import React from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import manifest from '../manifest.json';
import {Clip1} from '../../continuous-v1/src/Clip1';
import {Clip2} from '../../continuous-v1/src/Clip2';
import {Clip3} from '../../continuous-v1/src/Clip3';
import {Clip4} from '../../continuous-v1/src/Clip4';
import {Bridge as OriginalBridge} from '../../continuous-v1/src/Bridges';
import {Clip5,Clip6,Clip7,Clip8} from './MaterialsTrial';
import {Clip9,Clip10,Clip11,Clip12} from './Responsibility';
import {Clip13,Clip14,Clip15,Clip16,Clip17,Clip18} from './Closing';
import {e,mix,Box} from './graphics';
const registry:any={Clip1,Clip2,Clip3,Clip4,Clip5,Clip6,Clip7,Clip8,Clip9,Clip10,Clip11,Clip12,Clip13,Clip14,Clip15,Clip16,Clip17,Clip18};
// Old and new scenes occupy disjoint regions separated by an opaque white arc.
function Handoff({before,after,frame,boundary}:any){
 const p=e(frame,boundary-30,boundary+30),edge=mix(-260,1540,p),gap=90;
 const Old=registry[before.componentId],New=registry[after.componentId];
 const oldPath=`M${edge+gap} 0 Q${edge+gap+160} 360 ${edge+gap} 720 H1800 V0 Z`;
 const newPath=`M-400 0 H${edge} Q${edge+160} 360 ${edge} 720 H-400 Z`;
 return <><clipPath id="outgoing-scene"><path d={oldPath}/></clipPath><clipPath id="incoming-scene"><path d={newPath}/></clipPath>
 <g clipPath="url(#outgoing-scene)"><Old t={(before.durationInFrames-30)/60} page={before}/></g>
 <g clipPath="url(#incoming-scene)"><New t={.5} page={after}/></g></>;
}
export function Scene({groupId}:any){const [handle]=React.useState(()=>delayRender('MiSans local font'));
React.useEffect(()=>{const f=new FontFace('MiSans',`url(${staticFile('fonts/MiSans-Semibold.otf')})`,{weight:'600'});f.load().then(font=>{document.fonts.add(font);if(!document.fonts.check('600 40px MiSans'))throw Error('Font load failed');continueRender(handle)}).catch(cancelRender)},[handle]);
const frame=useCurrentFrame(),group=manifest.groups.find(g=>g.id===groupId)!;
const index=group.pages.findIndex(p=>frame>=p.offsetFrames&&frame<p.offsetFrames+p.durationInFrames);
const page=group.pages[index],Component=registry[page.componentId];
const ji=group.pages.findIndex((p,i)=>i>0&&frame>=p.offsetFrames-30&&frame<p.offsetFrames+30);
let content;
if(ji>0){const after=group.pages[ji],before=group.pages[ji-1];if(after.index<=4){const boundary=after.offsetFrames;content=<OriginalBridge frame={frame} join={{boundaryFrame:boundary,startFrame:boundary-30,endFrame:boundary+30}} index={ji-1} components={[Clip1,Clip2,Clip3,Clip4]} pages={group.pages}/>;}else content=<Handoff frame={frame} boundary={after.offsetFrames} before={before} after={after}/>;}
else content=<Component t={(frame-page.offsetFrames)/60} page={page}/>;
return <AbsoluteFill style={{background:'#fff'}}><svg width='100%' height='100%' viewBox='0 0 1280 720' style={{fontFamily:'MiSans'}}>{content}</svg></AbsoluteFill>;
}
registerRoot(()=> <>{manifest.groups.map(g=><Composition key={g.id} id={g.id} component={Scene} defaultProps={{groupId:g.id}} width={manifest.width} height={manifest.height} fps={manifest.fps} durationInFrames={g.durationInFrames}/>)}</>);
