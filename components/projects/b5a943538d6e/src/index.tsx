import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,Freeze,Img,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender,registerRoot} from 'remotion';
import manifest from '../manifest.json';
import {Scene} from './Scene';
import {SmileySubtitle} from './SmileySubtitle';
import {Media} from './library/SelectedMotion';
import {R6StageLead,R6_STAGE_LEAD_SECONDS} from './R6EarlyMotion';
import {R7OpeningTextHandoff} from './R7OpeningMotion';
let fontPromise:Promise<unknown>|undefined;
const transitionFrames=20;
const progress=(frame:number,duration:number)=>{
  const p=Math.min(1,Math.max(0,frame/duration));
  return p*p*(3-2*p);
};
function IncomingScene({page,transition}:{page:Parameters<typeof Scene>[0]['page'];transition:boolean}){
  const frame=useCurrentFrame(),p=transition?progress(frame,transitionFrames):1;
  const vertical=['S03','S10','S11','S15','S21','S22','S23','S24','S25'].includes(page.stableId);
  const clip=vertical?`inset(${100*(1-p)}% 0 0 0)`:`inset(0 ${100*(1-p)}% 0 0)`;
  const cue=(i:number)=>(page.motionEvents[Math.min(i,page.motionEvents.length-1)].cueFrame-page.startFrame)/60;
  return <AbsoluteFill style={{clipPath:clip}}><Scene page={page}/>
    {page.stableId==='S04'&&frame<9&&<R7OpeningTextHandoff t={frame/60} n={page.durationInFrames/60} c={cue}/>}
  </AbsoluteFill>;
}
function MediaOverlay({src,duration}:{src:string;duration:number}){
  const frame=useCurrentFrame();
  const opacity=progress(frame,16)*(1-progress(frame-duration+16,16));
  return <AbsoluteFill style={{opacity}}><Media src={src} fit='cover'/></AbsoluteFill>;
}
function StageLead(){
  const frame=useCurrentFrame();
  const page=manifest.pages.find(p=>p.stableId==='S05')!;
  const cue=(index:number)=>(page.motionEvents[index].cueFrame-page.startFrame)/60;
  return <R6StageLead t={frame/60} n={page.durationInFrames/60} c={cue}/>;
}
function Film(){
  const frame=useCurrentFrame(),filmTimeSeconds=frame/manifest.timelineFps;
  const [fontHandle]=useState(()=>delayRender('Load episode V3 canonical fonts'));
  useEffect(()=>{
    fontPromise??=Promise.all([['MiSans','MiSans-Regular.otf','400'],['MiSans','MiSans-Semibold.otf','600'],['MiSans','MiSans-Bold.otf','700'],['RuiZi','RuiZi.ttf','700'],['SourceHanHeavy','SourceHanSansSC-Heavy.otf','900'],['OfficialShuHei','AlimamaShuHei.ttf','700']].map(async([family,file,weight])=>{
      const face=await new FontFace(family,`url(${staticFile('fonts/'+file)})`,{weight}).load();(document.fonts as FontFaceSet & {add:(f:FontFace)=>void}).add(face);
    }));
    fontPromise.then(()=>continueRender(fontHandle)).catch(cancelRender);
  },[fontHandle]);
  const page=manifest.pages.find(p=>frame>=p.startFrame&&frame<p.startFrame+p.durationInFrames);
  const localTime=page?(frame-page.startFrame)/60:0;
  const overlays=(manifest as typeof manifest & {mediaOverlays:{id:string;startFrame:number;durationInFrames:number;src:string}[]}).mediaOverlays;
  const definitionVideo=page?.stableId==='S04'&&frame>=page.motionEvents[2].cueFrame;
  const sourcePlaying=definitionVideo||overlays.some(o=>frame>=o.startFrame&&frame<o.startFrame+o.durationInFrames);
  const dark=(page?.stableId==='S12'&&localTime<9.75)||(page?.stableId==='S11'&&localTime<2.55);
  return <AbsoluteFill style={{background:'#fff'}}>
    <Audio src={staticFile('media/voice.wav')}/>
    {manifest.pages.map((p,i)=>{
      const previous=manifest.pages[i-1];
      const continuous=overlays.some(o=>o.startFrame<p.startFrame&&o.startFrame+o.durationInFrames>p.startFrame);
      const transition=i>0&&!continuous&&!['S04','S05'].includes(p.stableId);
      return <React.Fragment key={p.stableId}>
        {transition&&<Sequence from={p.startFrame} durationInFrames={transitionFrames}><Freeze frame={previous.durationInFrames-1}><Scene page={previous}/></Freeze></Sequence>}
        <Sequence from={p.startFrame} durationInFrames={p.durationInFrames}><IncomingScene page={p} transition={transition}/></Sequence>
      </React.Fragment>;
    })}
    <Sequence from={manifest.pages.find(p=>p.stableId==='S05')!.startFrame-Math.round(R6_STAGE_LEAD_SECONDS*60)} durationInFrames={Math.round(R6_STAGE_LEAD_SECONDS*60)}><StageLead/></Sequence>
    {overlays.map(o=><Sequence key={o.id} from={o.startFrame} durationInFrames={o.durationInFrames}><MediaOverlay src={o.src} duration={o.durationInFrames}/></Sequence>)}
    {page?.brandCorner.enabled&&!sourcePlaying&&<Img src={staticFile(dark?'brand/dark.png':'brand/light.png')} style={{position:'absolute',left:dark?1554.5:1549.5,top:dark?41:36,width:dark?335:345.5,height:dark?75:85,zIndex:900}}/>}
    <SmileySubtitle cues={manifest.subtitles.cues} timeSeconds={filmTimeSeconds}/>
  </AbsoluteFill>;
}
function FilmScaled(){
  const {width}=useVideoConfig();
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left'}}>
      <Film/>
    </div>
  </AbsoluteFill>;
}
const Root=()=> <>
  <Composition id='EP107V3-R7-4K' component={FilmScaled} durationInFrames={manifest.durationInFrames} fps={60} width={3840} height={2160}/>
</>;
registerRoot(Root);
