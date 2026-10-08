import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile} from 'remotion';
import {FullscreenVideoWindow} from '../shared/FullscreenVideoWindow';
import {fullscreenVideoWindowGeometry} from '../shared/fullscreen-video-window-geometry';

const ACCENT='#D6BEFF';
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const smooth=(v:number)=>{const p=clamp(v);return p*p*(3-2*p);};
const phase=(t:number,a:number,b:number)=>smooth((t-a)/(b-a));
const visible=(t:number,a:number,b:number,inDuration=.24,outDuration=.24)=>phase(t,a,a+inDuration)*(1-phase(t,b,b+outDuration));
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
type Box=[number,number,number,number];
type State={id:string;time:number;transition:number;grid:Box;gridAlpha:number;gridBlur:number;video:Box;videoAlpha:number;};
const fullWindow=fullscreenVideoWindowGeometry();
const fullWindowBox:Box=[fullWindow.left,fullWindow.top,fullWindow.width,fullWindow.height];
// The nine selected still states become one continuously interpolated scene.
const states:State[]=[
 {id:'01-nine-shots',time:0,transition:0,grid:[240,128,1440,810],gridAlpha:1,gridBlur:0,video:[260,80,1400,787.5],videoAlpha:0},
 {id:'02-grid-and-continuity',time:.85,transition:.32,grid:[70,190,980,551.25],gridAlpha:1,gridBlur:0,video:[260,80,1400,787.5],videoAlpha:0},
 {id:'03-result-center',time:2.04,transition:.30,grid:[45,332,520,292.5],gridAlpha:.25,gridBlur:8,video:[260,80,1400,787.5],videoAlpha:1},
 {id:'04-planning-and-generation',time:3.646667,transition:.34,grid:[60,350,740,416.25],gridAlpha:1,gridBlur:0,video:[905,320,945,531.5625],videoAlpha:1},
 {id:'05-complete-context',time:5.20,transition:.32,grid:[60,350,740,416.25],gridAlpha:0,gridBlur:0,video:[0,0,1920,1080],videoAlpha:1},
 {id:'06-planning-retreats',time:6.446667,transition:.30,grid:[40,430,320,180],gridAlpha:.30,gridBlur:4,video:[415,230,1090,613.125],videoAlpha:1},
 {id:'07-continuous-video-takeover',time:7.65,transition:.32,grid:[-600,410,600,337.5],gridAlpha:0,gridBlur:4,video:[0,0,1920,1080],videoAlpha:1},
 {id:'08-model-capability',time:8.806667,transition:.32,grid:[-600,410,600,337.5],gridAlpha:0,gridBlur:4,video:[240,230,1440,810],videoAlpha:1},
 {id:'09-near-full-result',time:12.025667,transition:.32,grid:[-600,410,600,337.5],gridAlpha:0,gridBlur:4,video:fullWindowBox,videoAlpha:1},
];
function pose(t:number){
 const i=states.reduce((last,s,index)=>t>=s.time?index:last,0),s=states[i],previous=states[Math.max(0,i-1)];
 const p=i===0?1:phase(t,s.time,s.time+s.transition);
 const blend=(a:Box,b:Box):Box=>a.map((v,j)=>mix(v,b[j],p)) as Box;
 return {grid:blend(previous.grid,s.grid),video:blend(previous.video,s.video),gridAlpha:mix(previous.gridAlpha,s.gridAlpha,p),gridBlur:mix(previous.gridBlur,s.gridBlur,p),videoAlpha:mix(previous.videoAlpha,s.videoAlpha,p),stateId:s.id};
}
const boxStyle=([left,top,width,height]:Box):React.CSSProperties=>({position:'absolute',left,top,width,height});
function ShotGrid({box,src,opacity,blur}:{box:Box;src:string;opacity:number;blur:number}){
 const [,,width,height]=box;
 return <div style={{...boxStyle(box),opacity,filter:`blur(${blur}px)`,borderRadius:24,overflow:'hidden'}}>
  <Img src={staticFile(src)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>
  {Array.from({length:9},(_,i)=><span key={i} style={{position:'absolute',left:(i%3)*width/3+width*.012,top:Math.floor(i/3)*height/3+height*.013,color:'#fff',fontSize:56*width/1500,lineHeight:1,fontWeight:900,textShadow:'2px 2px 5px #000c'}}>{String(i+1).padStart(2,'0')}</span>)}
 </div>;
}
function Underline({left,top,width,opacity=1}:{left:number;top:number;width:number;opacity?:number}){
 return <div style={{position:'absolute',left,top,width,height:10,borderRadius:5,background:ACCENT,opacity}}/>;
}
/** Fred explicitly selected direction-A.png: exact nine-state composition adapted to the real episode media. */
export function ChosenModelStoryboard({t,src='media/positive-preview-1080p.mp4',gridSrc='media/storyboard-grid.png'}:{t:number;src?:string;gridSrc?:string}){
 // Keep the spoken state cues; reveal foreground only after its carrier clears the reading area.
 const p=pose(t),explain=visible(t,1.17,2.04,.16),compare=visible(t,3.646667,5.20),context=visible(t,5.20,6.446667,.24,.20),retreat=visible(t,6.446667,7.65),model=visible(t,9.126667,12.025667,.16,.18);
 const fullscreenShape=phase(t,12.025667,12.345667),fullscreenAlpha=phase(t,12.345667,12.425667);
 return <AbsoluteFill data-component="EP109-S20-chosen-direction-A" data-storyboard-state={p.stateId} style={{background:'radial-gradient(ellipse at 55% 50%,#181819 0%,#080809 80%)',fontFamily:'Fred MiSans',fontWeight:900,fontSynthesis:'none',overflow:'hidden'}}>
  <ShotGrid box={p.grid} src={gridSrc} opacity={p.gridAlpha} blur={p.gridBlur}/>
  {/* Both fixed media layers start at local frame0. They show the same source time; only visibility transfers after the carrier reaches the approved window geometry. */}
  <div style={{...boxStyle(p.video),border:'none',overflow:'hidden',background:'#000',borderRadius:24,boxShadow:`0 ${16*fullscreenShape}px ${25*fullscreenShape}px 0 rgba(0,0,0,${2/15*fullscreenShape})`,opacity:p.videoAlpha*(1-fullscreenAlpha)}}>
   <OffthreadVideo key='continuous-source-from-zero' src={staticFile(src)} muted startFrom={0} playbackRate={1} style={{width:'100%',height:'100%',objectFit:'contain',objectPosition:'center'}}/>
  </div>
  <AbsoluteFill style={{opacity:fullscreenAlpha}}>
   <FullscreenVideoWindow key='approved-source-from-zero' src={staticFile(src)} objectFit='cover' videoProps={{muted:true,startFrom:0,playbackRate:1}}/>
  </AbsoluteFill>
  <div style={{position:'absolute',left:1160,top:190,width:680,opacity:explain,color:'#fff',fontSize:106,lineHeight:1.18}}>从分镜<br/>到连续画面</div>
  <div style={{position:'absolute',left:60,top:128,width:740,textAlign:'center',fontSize:104,lineHeight:1.1,color:'#fff',opacity:compare}}>分镜规划</div>
  <Underline left={315} top={259} width={230} opacity={compare}/>
  <div style={{position:'absolute',left:905,top:128,width:945,textAlign:'center',fontSize:104,lineHeight:1.1,color:'#fff',opacity:compare}}>连续生成</div>
  <Underline left={1262.5} top={259} width={230} opacity={compare}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(0,0,0,.86) 0%,rgba(0,0,0,.66) 32%,rgba(0,0,0,0) 76%)',opacity:context}}/>
  <div style={{position:'absolute',left:85,top:267,fontSize:142,lineHeight:1.1,color:'#fff',opacity:context}}>完整的</div>
  <div style={{position:'absolute',left:78,top:432,width:670,height:174,paddingLeft:7,boxSizing:'border-box',background:ACCENT,color:'#030304',fontSize:150,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'flex-start',whiteSpace:'nowrap',opacity:context}}>人物 场景</div>
  <div style={{position:'absolute',left:85,top:635,fontSize:140,lineHeight:1.1,color:'#fff',opacity:context}}>动作关系</div>
  <Underline left={85} top={824} width={310} opacity={context}/>
  <div style={{position:'absolute',left:40,top:320,width:320,textAlign:'center',fontSize:64,lineHeight:1.1,color:'#fff',opacity:retreat*.30}}>分镜规划</div>
  <Underline left={85} top={405} width={230} opacity={retreat*.30}/>
  <div style={{position:'absolute',left:415,top:84,width:1090,textAlign:'center',fontSize:112,lineHeight:1.1,color:'#fff',opacity:retreat}}>连续生成</div>
  <div style={{position:'absolute',left:370,top:66,width:1180,textAlign:'center',fontSize:120,lineHeight:1.1,color:'#fff',opacity:model}}>Seedance <span style={{color:ACCENT}}>2.5</span></div>
 </AbsoluteFill>;
}
