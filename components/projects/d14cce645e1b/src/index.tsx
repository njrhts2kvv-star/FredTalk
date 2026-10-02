import {mapFrame} from './timing';
import {Scene7,Scene8,Scene9,Scene10,Scene11,Scene12} from './scenes';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,Easing,Img,Sequence,continueRender,delayRender,interpolate,registerRoot,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import manifest from '../manifest.json';
import assets from '../assets.json';

// Episode-original business presentation. BranchThree/TreeFlow were read and copied
// to references; only their branch-before-focus / group-to-flow logic is borrowed.
// No frozen library source is modified or represented as a mounted full component.
const ink='#171719',muted='#77777e',accent='#7954ad';
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.65,0,.25,1)});
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const pos=(x:number,y:number,w?:number,h?:number):React.CSSProperties=>({position:'absolute',left:x,top:y,width:w,height:h});
const cue=(s:number,id:number)=>manifest.pages[s-7].cues.find(c=>c.id==='srt-'+String(id).padStart(3,'0'))!.startFrame;
type Props={segment:number;upstreamTail?:string;upstreamTailSha256?:string;upstreamVideoSha256?:string;upstreamSourceFrame?:number;mute?:boolean};
const Text:React.FC<{x:number;y:number;w?:number;size?:number;opacity?:number;children:React.ReactNode;style?:React.CSSProperties}>=({x,y,w=1600,size=86,opacity=1,children,style})=><div style={{...pos(x,y,w),fontSize:size,lineHeight:1.28,letterSpacing:-1.5,fontWeight:600,opacity,...style}}>{children}</div>;
const Paper:React.FC<{x:number;y:number;w:number;h:number;children:React.ReactNode;style?:React.CSSProperties}>=({x,y,w,h,children,style})=><div style={{...pos(x,y,w,h),background:'white',border:'1.5px solid #dedee3',borderRadius:22,boxShadow:'0 16px 45px #0000000b',boxSizing:'border-box',...style}}>{children}</div>;
const Edge:React.FC<{d:string;progress?:number;selected?:boolean;opacity?:number}>=({d,progress=1,selected=false,opacity=1})=>progress<=0?null:<svg width="1920" height="1080" style={{...pos(0,0),overflow:'visible',opacity}}><path d={d} pathLength={1} stroke={selected?accent:'#c8c8cf'} strokeWidth={selected?5:3} fill="none" strokeDasharray="1" strokeDashoffset={1-progress} strokeLinecap="round"/></svg>;
const Parcel:React.FC<{x:number;y:number;scale?:number;opacity?:number}>=({x,y,scale=1,opacity=1})=><div style={{...pos(x,y,94,76),transform:`scale(${scale})`,opacity,background:'#ebe9e5',border:'1.5px solid #c5c1ba',borderRadius:5}}><div style={{...pos(43,0,9,76),background:'#d5d0c8'}}/><div style={{...pos(10,37,22,16),background:'white',border:'1px solid #ddd'}}/></div>;
const Message:React.FC<{x?:number;y?:number;scale?:number;lines?:number;opacity?:number;selected?:boolean}>=({x=410,y=300,scale=1,lines=3,opacity=1,selected=false})=><div style={{...pos(x,y,1100,420),transform:`scale(${scale})`,transformOrigin:'top left',opacity}}><Paper x={0} y={0} w={1100} h={420} style={{borderColor:selected?accent:'#dedee3'}}>{['电脑坏了','昨天刚买的','想赶紧换一个'].map((line,i)=><Text key={line} x={72} y={52+i*104} w={960} size={84} opacity={Math.max(0,Math.min(1,lines-i))}>{line}</Text>)}</Paper></div>;
const Targets:React.FC<{reveal?:number[];selected?:number;focus?:number;opacity?:number}>=({reveal=[1,1,1],selected=-1,focus=-1,opacity=1})=><div style={{opacity}}>{['售后','退款','物流'].map((label,i)=><Paper key={label} x={1330} y={270+i*204+25*(1-reveal[i])} w={400} h={138} style={{opacity:reveal[i],background:selected===i?ink:'white',borderColor:focus===i?accent:'#dedee3',boxShadow:selected===i?'0 16px 36px #00000016':'none',color:selected===i?'white':ink}}><Text x={0} y={22} w={400} size={72} style={{textAlign:'center'}}>{label}</Text></Paper>)}</div>;
const MapScene:React.FC<{selected?:number;reveal?:number[];focus?:number;jev?:number;messageTravel?:number;urgent?:number}>=({selected=-1,reveal=[1,1,1],focus=-1,jev=0,messageTravel=0,urgent=0})=><>
 {reveal.map((v,i)=><Edge key={i} d={`M 924 510 C 1105 510 1145 ${339+i*204} 1328 ${339+i*204}`} progress={v} selected={selected===i} opacity={selected>=0&&selected!==i?.35:1}/>)}
 <Message x={mix(155,1390,messageTravel)} y={mix(350,292,messageTravel)} scale={mix(.70,.22,messageTravel)} selected={selected>=0}/>
 <Targets reveal={reveal} selected={selected} focus={focus}/>
 <Text x={925} y={235} w={350} size={90} opacity={jev} style={{textAlign:'center'}}>Jev</Text>
 <Text x={164} y={700} w={700} size={54} opacity={urgent*(1-messageTravel)} style={{color:accent}}>紧急</Text>
</>;
const Research:React.FC<{f?:number;detail?:number;opacity?:number}>=({f=0,detail=2,opacity=1})=><div style={{opacity}}><Paper x={280} y={235} w={1360} h={590} style={{background:ink,color:'white',borderColor:'#28282d',boxShadow:'0 24px 55px #00000020'}}><Text x={70} y={55} w={620} size={90}>Codex</Text><Text x={70} y={182} w={610} size={66} style={{color:'#c4c4ca'}}>研究分析</Text><div style={{...pos(675,75,1,405),background:'#45454b'}}/><Text x={745} y={195+30*(1-Math.min(1,detail))} w={540} size={62} opacity={Math.min(1,detail)}>发生了什么</Text><Text x={745} y={338+30*(1-Math.max(0,detail-1))} w={540} size={62} opacity={Math.max(0,detail-1)}>哪些值得优化</Text></Paper></div>;

const soundFrames:Record<number,number[]>={7:[152,360,666],8:[186],9:[138],10:[156,584,780],11:[252,584],12:[200]};
export const EpisodeScene:React.FC<Props>=({segment,upstreamTail,upstreamTailSha256,upstreamVideoSha256,upstreamSourceFrame,mute=false})=>{
 const f=mapFrame(useCurrentFrame()),{width}=useVideoConfig();const [handle]=useState(()=>delayRender('MiSans fonts'));
 useEffect(()=>{Promise.all([['Medium','500'],['Semibold','600']].map(async([name,weight])=>{const font=new FontFace('MiSans',`url("${staticFile('fonts/MiSans-'+name+'.otf')}")`,{weight});await font.load();document.fonts.add(font);})).then(()=>continueRender(handle));},[handle]);
 if(segment===7&&(!upstreamTail||!upstreamTailSha256||!upstreamVideoSha256||upstreamSourceFrame===undefined))throw new Error('S07 blocked: bind actual S06 tail path, image/video hashes and source frame.');
 const page=manifest.pages[segment-7],d=assets.brand.variants.lightBackground.destination;
 const body=segment===7?<Scene7 f={f} tail={upstreamTail!}/>:segment===8?<Scene8 f={f}/>:segment===9?<Scene9 f={f}/>:segment===10?<Scene10 f={f}/>:segment===11?<Scene11 f={f}/>:<Scene12 f={f}/>;
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans',fontWeight:500,color:ink,overflow:'hidden'}}><div style={{...pos(0,0,1920,1080),transform:`scale(${width/1920})`,transformOrigin:'top left'}}>{body}{(()=>{const dark=segment===8?p(f,186,231):segment===9||segment===10?1:segment===11?1-p(f,0,40):0;return <><Img src={staticFile('brand/fredtalk-ai-corner.png')} style={{...pos(d.x/2,d.y/2,d.width/2,d.height/2),zIndex:40,opacity:1-dark}}/><div style={{...pos(1554.5,41,335,75),overflow:'hidden',zIndex:41,opacity:dark}}><Img src={staticFile('brand/fredtalk-ai-dark-transparent.png')} style={{position:'absolute',width:335*2172/1528,left:-335*295/1528,top:-75*184/341,height:75*724/341}}/></div></>})()}</div>{!mute&&<><Audio src={staticFile('voice.m4a')} startFrom={page.globalStartFrame} volume={.93}/>{soundFrames[segment].map((at,i)=><Sequence key={at} from={at} durationInFrames={42} layout="none"><Audio src={staticFile(i%2?'sfx/09-鼠标单击.wav':'sfx/13-左右滑动.wav')} volume={.15}/></Sequence>)}</>}</AbsoluteFill>;
};
registerRoot(()=> <Composition id="EP99-S09" component={EpisodeScene} defaultProps={{segment:9,mute:true}} width={3840} height={2160} fps={60} durationInFrames={408}/>);
