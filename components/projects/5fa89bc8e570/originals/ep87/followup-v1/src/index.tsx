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
const geometry:any={
4:{end:[210,180,860,425]},
5:{start:[280,183,720,375],end:[201,101,877,525]},
6:{start:[360,150,560,410],end:[95,150,670,410]},
7:{start:[180,95,920,510],end:[90,135,1100,445]},
8:{start:[390,160,500,390],end:[189,103,905,295]},
9:{start:[240,110,800,495],end:[105,110,530,495]},
10:{start:[290,165,700,390],end:[90,215,590,345]},
11:{start:[150,110,980,490],end:[80,110,550,490]},
12:{start:[130,90,1020,520],end:[206,101,867,442]},
13:{start:[385,155,510,425],end:[95,205,435,350]},
14:{start:[330,150,630,474],end:[430,145,320,440]},
15:{start:[220,130,520,470],end:[680,130,500,470]},
16:{start:[430,100,430,490],end:[95,180,370,380]},
17:{start:[120,100,1040,500],end:[224,170,832,400]},
18:{start:[450,180,630,385],end:[100,90,1080,550]}
};
function Handoff({before,after,frame,boundary}:any){const p=(frame-boundary+30)/60,out=e(p,0,.46),enter=e(p,.54,1),m=e(p,0,1);
const a=geometry[before.index].end,b=geometry[after.index].start;
const [x,y,w,h]=a.map((v:number,i:number)=>mix(v,b[i],m)),Old=registry[before.componentId],New=registry[after.componentId];
return <><Box x={x} y={y} w={w} h={h}/><clipPath id='bridge-stage'><rect x={0} y={0} width={1280} height={720}/></clipPath><clipPath id='old-reveal'><rect x={0} y={0} width={1280} height={720*(1-out)}/></clipPath><clipPath id='new-reveal'><rect x={0} y={0} width={1280} height={720*enter}/></clipPath><g clipPath='url(#bridge-stage)'>
{p<.46&&<g clipPath='url(#old-reveal)'><Old t={(before.durationInFrames-30)/60} page={before}/></g>}
{p>.54&&<g clipPath='url(#new-reveal)'><New t={.5} page={after}/></g>}
</g></>}
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
