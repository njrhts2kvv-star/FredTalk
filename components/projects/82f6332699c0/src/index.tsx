import React,{useState,useEffect} from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,staticFile,useCurrentFrame,registerRoot,delayRender,continueRender,cancelRender} from 'remotion';
import manifest from '../manifest.json';
import {Corner} from './Corner';
import {Launch,Results,Feishu,Collab,Permission,Followup,Value,Method,Judgment} from './Scenes';
const sceneMap={launch:Launch,results:Results,feishu:Feishu,collab:Collab,permission:Permission,followup:Followup,value:Value,method:Method,judgment:Judgment};
function Output({part}:any){
 const t=useCurrentFrame()/manifest.fps;
 const [handle]=useState(()=>delayRender('MiSans fonts'));
 useEffect(()=>{Promise.all([500,600].map(async weight=>{const face=new FontFace('FredMiSans',`url(${staticFile('fonts/MiSans-'+(weight===500?'Medium':'Semibold')+'.otf')})`,{weight:String(weight)});await face.load();document.fonts.add(face);})).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 return <AbsoluteFill style={{background:'#fff',fontFamily:'FredMiSans',fontSynthesis:'none',overflow:'hidden'}}><style>{'*{box-sizing:border-box;}'}</style>{manifest.pages.filter(p=>p.part===part).map(p=>{const Scene=sceneMap[p.implementationComponentId as keyof typeof sceneMap];return <Sequence key={p.stableId} from={p.startFrame-(part===2?4080:0)} durationInFrames={p.durationInFrames}><Scene t={t}/></Sequence>})}<Corner/><Audio src={staticFile(manifest.audio)} startFrom={manifest.segments[part-1].audioOffsetFrames}/></AbsoluteFill>;
}
registerRoot(()=> <>{manifest.segments.map((s,i)=><Composition key={s.id} id={s.id} component={Output} defaultProps={{part:i+1}} durationInFrames={s.durationInFrames} fps={manifest.fps} width={manifest.width} height={manifest.height}/>)}</>);
