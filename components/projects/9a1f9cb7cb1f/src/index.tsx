import {mapFrame} from './timing';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,Easing,Freeze,Img,OffthreadVideo,Sequence,cancelRender,continueRender,delayRender,interpolate,registerRoot,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import manifest from '../manifest.json';
import {ChapterDrag} from './Chapter';
const abs:React.CSSProperties={position:'absolute'};
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:Easing.bezier(.65,0,.25,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const mix=(a:number,b:number,v:number)=>a+(b-a)*v;
function Fonts(){const [handle]=useState(()=>delayRender('Load exact MiSans fonts'));useEffect(()=>{Promise.all([['Medium','500'],['Semibold','600'],['Bold','700']].map(async([name,weight])=>{const font=new FontFace('MiSans',`url("${staticFile('fonts/MiSans-'+name+'.otf')}")`,{weight});await font.load();document.fonts.add(font);})).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);return null;}
function Corner({dark=false}:{dark?:boolean}){return dark?<div style={{...abs,left:1554.5,top:41,width:335,height:75,overflow:'hidden'}}><Img src={staticFile('brand/fredtalk-ai-dark-transparent.png')} style={{...abs,width:2172*335/1528,height:724*75/341,left:-295*335/1528,top:-184*75/341}}/></div>:<Img src={staticFile('brand/fredtalk-ai-corner.png')} style={{...abs,left:1549.5,top:36,width:345.5,height:85}}/>;}
function Media({name,frame}:{name:string;frame:number}){return <Freeze frame={Math.max(0,Math.floor(frame))}><OffthreadVideo src={staticFile('media/'+name+'.mp4')} muted style={{width:'100%',height:'100%',objectFit:'contain'}}/></Freeze>;}
function Knowledge({f}:{f:number}){const reveal=p(f,0,22);return <AbsoluteFill style={{background:'white'}}><div style={{...abs,left:360,top:90+70*(1-reveal),width:1200,height:900,borderRadius:44,background:'#202125',boxShadow:'0 20px 55px #00000020',border:'2px solid #777',opacity:reveal}}><div style={{...abs,left:596,top:13,width:7,height:7,borderRadius:'50%',background:'#454953'}}/><div style={{...abs,left:40,top:30,width:1120,height:840,borderRadius:18,background:'#08090a',overflow:'hidden'}}><Media name="knowledge" frame={f}/></div></div></AbsoluteFill>;}
function Definition({f}:{f:number}){const shift=p(f,120,156),quick=p(f,132,162),semantic=p(f,340,370),oldOut=p(f,424,448),question=p(f,448,472),token=p(f,604,634);
 return <AbsoluteFill style={{background:'white'}}>{f<156&&<div style={{...abs,inset:0,transform:`translateY(${-1080*shift}px)`}}><ChapterDrag f={Math.min(f,119)}/></div>}
 {f>=120&&<div style={{...abs,inset:0,background:'white',transform:`translateY(${1080*(1-shift)}px)`}}>
 <div style={{...abs,left:0,top:315-110*semantic,right:0,textAlign:'center',fontSize:164,fontWeight:600,opacity:quick*(1-oldOut),transform:`translateY(${65*(1-quick)}px)`}}>快速</div>
 <div style={{...abs,left:0,top:455,right:0,textAlign:'center',fontSize:172,fontWeight:600,clipPath:`inset(0 ${100*(1-semantic)}% 0 0)`,opacity:1-oldOut}}>语义判断</div>
 {f>=448&&<div style={{...abs,left:0,right:0,top:400-125*token,textAlign:'center',fontSize:132,fontWeight:600,opacity:question,transform:`translateX(${90*(1-question)}px)`}}>传统程序？</div>}
 {f>=604&&<div style={{...abs,left:0,right:0,top:530,textAlign:'center',fontSize:114,fontWeight:600,opacity:token,transform:`translateY(${65*(1-token)}px)`}}>还要耗 Token？</div>}
 </div>}</AbsoluteFill>;
}
// Actual EP95 Day geometry extracted and adapted: d/focus/width/x/y/overlay relationships retained.
// New native clips and SRT timing are original EP99 adaptation, not canonical component approval.
export function RoleRail({f}:{f:number}){const enter=p(f,0,36),progress=p(f,334,373)+p(f,644,683);const names=['conveyor','sorter','researcher'],starts=[0,334,644],active=[334,310,366],sourceFrames=[360,420,420];
 return <AbsoluteFill style={{background:'white'}}>{names.map((name,i)=>{const d=i-progress,focus=Math.max(0,1-Math.abs(d)),w=mix(460,1260,focus),h=w*9/16,x=960+d*1020,y=550+(i%2?1:-1)*220*(1-focus);const sourceFrame=Math.min(sourceFrames[i],Math.max(0,f-starts[i])*sourceFrames[i]/active[i]);return <div key={name} style={{...abs,left:x-w/2+1920*(1-enter),top:y-h/2,width:w,height:h,borderRadius:34,overflow:'hidden',background:'#eee',boxShadow:'0 22px 65px #00000022',zIndex:Math.round(focus*10)}}><Media name={name} frame={sourceFrame}/><div style={{...abs,inset:0,background:`rgba(0,0,0,${(1-focus)*.3})`}}/></div>})}</AbsoluteFill>;
}
function Clip({index}:{index:number}){const localFrame=mapFrame(useCurrentFrame()),{width}=useVideoConfig(),page=manifest.pages[index];const sounds=index===0?[[1,13]]:index===1?[[5,9],[120,4],[424,13]]:index===2?[[1,4],[334,13]]:[[1,13]];const dark=index===1&&localFrame<140;
return <AbsoluteFill style={{background:dark?'black':'white',overflow:'hidden'}}><Fonts/><div style={{...abs,left:0,top:0,width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left',fontFamily:'MiSans',fontSynthesis:'none',fontWeight:600,color:'#141416'}}>
{index===0?<Knowledge f={localFrame}/>:index===1?<Definition f={localFrame}/>:<RoleRail f={localFrame+(index===3?644:0)}/>}<Corner dark={dark}/></div>
<Audio src={staticFile('voice.m4a')} startFrom={page.globalStartFrame} endAt={page.globalStartFrame+page.durationInFrames} volume={.93}/>
{sounds.map(([at,id],i)=><Sequence key={i} from={at} durationInFrames={Math.min(54,page.durationInFrames-at)} layout="none"><Audio src={staticFile('sfx/'+(id===13?'13-左右滑动.wav':id===9?'09-鼠标单击.wav':'04-Woosh.wav'))} volume={f=>.30*Math.min(1,Math.max(0,(54-f)/8))}/></Sequence>)}
</AbsoluteFill>;}
registerRoot(()=> <Composition id="EP99-S05" component={Clip} defaultProps={{index:2}} width={3840} height={2160} fps={60} durationInFrames={640}/>);
