import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../../../../surface-purple.ts";
import {Workflow026} from './Workflow026';
import {useSourceHan} from './useSourceHan';
import {Website033} from './ReferenceInterfaces';
import {useShuHei} from './useShuHei';
import r033 from '../../../../specs/R033.json';
import r045 from '../../../../specs/R045.json';
import r041 from '../../../../specs/R041.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
import {Media as SharedMedia} from './Media';
import mediaBindings from "../media-bindings.json";
import React, {CSSProperties} from 'react';
import videoManifest from '../public/shared/videos.json';
import {AbsoluteFill, Img, OffthreadVideo, Loop, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type MediaB = {src:string; type?:'image'|'video'; fit?:'cover'|'contain'; position?:string; cutout?:boolean};
export type BatchBProps = {media?:MediaB[]; backdrop?:MediaB; cutouts?:MediaB[]};
const portraits:MediaB[]=['fred-walk-portrait','fred-meeting-portrait','fred-street-portrait'].map(id=>({src:`revision/${id}.mp4`,type:'video',fit:'contain'}));
const landscapes:MediaB[]=['fred-mic-magnet','fred-conversation','fred-team-meeting','fred-family','fred-computer-work','fred-night-review'].map(id=>({src:`revision/${id}.${['fred-computer-work','fred-night-review'].includes(id)?'jpg':'mp4'}`,type:['fred-computer-work','fred-night-review'].includes(id)?'image':'video',fit:'contain'}));
const photos:MediaB[]=[{src:'revision/fred-walk-portrait.jpg'},{src:'revision/note-0.svg'},{src:'revision/fred-meeting-portrait.jpg'},{src:'revision/note-1.svg'},{src:'revision/fred-street-portrait.jpg'},{src:'revision/note-2.svg'}];
const pick=(list:MediaB[],i:number)=>list[((i%list.length)+list.length)%list.length];
const p=(t:number,a:number,b:number)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
const e=(t:number,a:number,b:number)=>{const q=p(t,a,b);return q*q*(3-2*q)};
const mix=(a:number,b:number,q:number)=>a+(b-a)*q;
const font='FredHeavy';
const useTime=()=>{const f=useCurrentFrame();return f/useVideoConfig().fps};
const Media:React.FC<{asset:MediaB;style?:CSSProperties}>=({asset,style})=>{
 return <SharedMedia src={asset.src} fit={asset.fit??'cover'} style={{objectPosition:asset.position??'center',...style}}/>;
};
const Stage:React.FC<React.PropsWithChildren>=({children})=><AbsoluteFill style={{background:'#fff',overflow:'hidden'}}><style>{`@font-face{font-family:FredHeavy;src:url('${staticFile('shared/MiSans-Heavy.otf')}')}`}</style>{children}</AbsoluteFill>;
const Card:React.FC<{asset:MediaB;x:number;y:number;w:number;h:number;r?:number;opacity?:number;style?:CSSProperties}>=({asset,x,y,w,h,r=30,opacity=1,style})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r,overflow:'hidden',opacity,boxShadow:'14px 10px 20px rgba(0,0,0,.22)',...style}}><Media asset={asset}/></div>;

/** Opaque cylindrical unroll for the portrait page. Forty vertical texture
 * slices shorten towards the curled right edge; content never fades in. */
const CurlCard028:React.FC<{asset:MediaB;x:number;y:number;w:number;h:number;progress:number;opacity:number;id:string}>=({asset,x,y,w,h,progress,opacity,id})=>{
 if(progress<=0)return null;
 if(progress>=1||asset.type==='video')return <Card asset={asset} x={x} y={y} w={w} h={h} r={26} opacity={opacity}/>;
 const visibleWidth=w*(.11+.89*progress),lift=h*.9*(1-progress),slices=40;
 const imageSrc=staticFile(asset.src);const isProduct=(mediaBindings as Record<string,string>)[asset.src]==='product.png';const tw=isProduct?w:1000,th=isProduct?h:1500;
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,opacity,filter:'drop-shadow(12px 10px 11px #0004)'}}>
  <Img src={imageSrc} style={{width:1,height:1,position:'absolute',opacity:0}}/>
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
   <defs><linearGradient id={`shade-${id}`}><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".7" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity={.34*(1-progress)}/></linearGradient><clipPath id={`edge-${id}`}><rect width={visibleWidth} height={h} rx={26}/></clipPath></defs>
   <path d={`M 0 ${h} Q ${visibleWidth*.58} ${h-lift*.13} ${visibleWidth} ${h-lift} L ${visibleWidth+lift*.13} ${h-lift*.12} L ${visibleWidth*.83} ${h+2} Z`} fill="#bdbab3"/>
   <g clipPath={`url(#edge-${id})`}>{Array.from({length:slices},(_,i)=>{
    const u=i/slices,curve=Math.sin(u*Math.PI*.48)/Math.sin(Math.PI*.48),next=Math.sin((i+1)/slices*Math.PI*.48)/Math.sin(Math.PI*.48);
    const dx=visibleWidth*(progress*u+(1-progress)*curve),dw=visibleWidth*(progress/slices+(1-progress)*(next-curve))+.5;
    return <svg key={i} x={dx} y={0} width={dw} height={h-lift*u*u} viewBox={`${i*tw/slices} 0 ${tw/slices} ${th}`} preserveAspectRatio="none">{isProduct&&<rect width={tw} height={th} fill="#fff"/>}<image href={imageSrc} width={tw} height={th} preserveAspectRatio={isProduct?"xMidYMid meet":"xMidYMid slice"}/></svg>;
   })}<rect width={visibleWidth} height={h} fill={`url(#shade-${id})`}/></g>
  </svg>
 </div>;
};

export const batchBMetadata={
 '028':{width:1280,height:720,fps:60,durationInFrames:1078},
 '033':{width:1280,height:720,fps:30,durationInFrames:330},
 '041':{width:1280,height:720,fps:30,durationInFrames:180},
 '042':{width:1280,height:720,fps:30,durationInFrames:210},
 '044':{width:1280,height:720,fps:30,durationInFrames:210},
 '045':{width:1280,height:720,fps:30,durationInFrames:210},
};

/** A workflow stays as context. A circle stretches into the low explanation bar;
 * three independent flip-in media cards merge into one result, across three cycles. */
export const Clip028:React.FC<BatchBProps>=({media=photos,backdrop})=>{
 const t=useTime();
 const barOpen=e(t,.46,.78),barStretch=e(t,.87,1.65);
 const sentence=t<7.7?'留下散步灵感、会议讨论和日常交流':t<12.45?'不同场景，留下各自的真实经历':'把这些经历整理成自己的上下文';
 const chars=t<7.7?Math.floor(sentence.length*p(t,2.98,4.82)):sentence.length;
 const cycle=(start:number,enter:number[],merge:number,finish:number,offset:number)=>{
  if(t<start||t>=finish)return null;
  const mergeP=e(t,merge,merge+.42),resultP=e(t,merge+.18,merge+.62);
  const small=start===7.76;const inputW=small?264:314;const resultW=start===12.33?350:264;
  return <React.Fragment key={start}>{enter.map((cue,i)=>{
   const appear=small&&i===1?1:e(t,cue,cue+.68);const x=mix(small?154+i*354:72+i*411,640-resultW/2,mergeP);const y=54;
   return <CurlCard028 key={i} id={`028-${start}-${i}`} asset={pick(media,small&&i===1?3:offset+i)} x={x} y={y} w={mix(inputW,resultW,mergeP)} h={470} progress={appear} opacity={1-resultP}/>;
  })}<Card asset={pick(media,offset+3)} x={640-resultW/2} y={54} w={resultW} h={470} r={26} opacity={resultP}/></React.Fragment>;
 };
 return <Stage><div style={{position:'absolute',inset:'12px 20px 24px',borderRadius:5,overflow:'hidden',filter:`blur(${e(t,.82,1.8)*6}px)`,boxShadow:'0 0 13px #777'}}><Workflow026 frame={210}/></div>
 {cycle(3.28,[3.28,4.15,5.12],6.35,7.76,0)}
 {cycle(7.76,[7.76,7.04,9.17],10.68,12.33,4)}
 {cycle(12.33,[12.33,13.39,14.35],15.72,18,0)}
 <div style={{position:'absolute',left:640,top:mix(350,589,barStretch),width:mix(160,970,barStretch),height:mix(160,98,barStretch),transform:`translate(-50%,-50%) scale(${barOpen})`,borderRadius:55,background:'#18161c',border:'4px solid #a79aad',boxShadow:'0 3px 12px #444',display:'flex',alignItems:'center',justifyContent:'flex-start',padding:'0 38px',boxSizing:'border-box',overflow:'hidden'}}><span style={{fontFamily:font,fontSize:43,color:'white',whiteSpace:'nowrap'}}>{sentence.slice(0,chars)}</span></div>
 </Stage>;
};

/** Six square thumbnails retreat independently; a circle becomes the exact
 * short title pill, then flattens. Five portrait cards build a scrolling rail. */
export const Clip033:React.FC<BatchBProps>=({media=photos.map(a=>({...a,src:a.src.replace(/\.jpg$/,'.mp4')})),backdrop})=>{
 useSourceHan();
 const t=useTime();const [px,py,pw,ph,pa]=measured(r033 as ClipSpec,'pill',t*60);
 const entries=[4.50,6.15,6.75,7.28,7.76];
 const railShift=entries.slice(1).reduce((v,c)=>v+e(t,c,c+.56)*198.5,0);
 return <Stage>
 {t<1.03&&Array.from({length:6},(_,i)=>{const out=e(t,.28+(5-i)*.052,.9+(5-i)*.026);const w=mix(362,0,out),h=mix(342,0,out);return <Card key={i} asset={pick(media,i)} x={mix(42+(i%3)*416,223+(i%3)*416,out)} y={mix(18+Math.floor(i/3)*362,190+Math.floor(i/3)*362,out)} w={w} h={h} r={40} opacity={1-out}/>})}
 {t>=.9&&t<4.5&&<><div style={{position:'absolute',left:px/1.5,top:py/1.5,width:pw/1.5,height:ph/1.5,borderRadius:ph/3,background:'#000',opacity:pa}}/><div style={{position:'absolute',left:0,top:296,width:1280,textAlign:'center',fontFamily:'RSourceHan',fontWeight:900,fontSize:120,color:'#8960ca',opacity:1-e(t,2.98,3.35),whiteSpace:'nowrap'}}>{Array.from("日常记录").map((char,i)=><span key={i} style={{opacity:measured(r033 as ClipSpec,"textLight",t*60)[i]}}>{char}</span>)}</div></>}

 {entries.map((cue,i)=>{const enter=i===0?e(t,cue,cue+.61):1;const x=measured(r033 as ClipSpec,'portraitRailX',t*60)[i]/1.5;return enter>0&&x<1304&&x+380>-24&&<Card key={i} asset={pick(media,i+1)} x={x} y={i===0?mix(-640,18,enter):18} w={380} h={690} r={31} style={{transformOrigin:'center top'}}/>})}
 {t>14.15&&<div style={{position:'absolute',inset:0,opacity:e(t,14.15,14.63)}}><Website033/></div>}
 </Stage>;
};

/** Three near-full-height video cards enter bottom-up with short stagger,
 * leave in reading order, then a circle begins the next title. */
export const Clip041:React.FC<BatchBProps>=({media=portraits,backdrop})=>{
 const t=useTime();return <Stage>
 {t<.58&&<div style={{position:'absolute',inset:0,opacity:measured(r041 as ClipSpec,'backdropOpacity',t*60)[0]}}><Media asset={backdrop??pick(media,0)}/></div>}
 {[0,1,2].map(i=>{const[top,opacity]=measured(r041 as ClipSpec,`card${i}`,t*60);return <Card key={i} asset={{...pick(media,i+1),fit:'cover'}} x={(43+i*628)/1.5} y={top/1.5} w={578/1.5} h={684} r={58/1.5} opacity={opacity}/>})}
 {t>5.48&&<div style={{position:'absolute',left:226,top:232,width:226*e(t,5.48,5.9),height:226*e(t,5.48,5.9),transform:'translate(-50%,-50%)',borderRadius:'50%',background:'#000'}}/>}
 </Stage>;
};

/** A rounded live portrait card and two unframed cutouts preserve distinct
 * surfaces. Their exit hands the canvas to two diagonal landscape windows. */
export const Clip042:React.FC<BatchBProps>=({media=[...portraits,...landscapes],cutouts})=>{
 const t=useTime(),out=e(t,10.00,10.39),cut=cutouts??[{src:'revision/fred-alpha-0.webm',type:'video' as const},{src:'revision/fred-alpha-1.webm',type:'video' as const}];
 return <Stage>
 {t<10.4&&<><Card asset={pick(media,0)} x={mix(18,-570,out)} y={16} w={477} h={684} r={42}/>
 <div style={{position:'absolute',left:mix(1030,515,e(t,.06,.95)),top:mix(16,765,out),width:300,height:692,borderRadius:30,overflow:'hidden',opacity:e(t,.015,.16)}}><Media asset={{...pick(cut,0),fit:'contain'}} style={{objectFit:'contain'}}/></div>
 <div style={{position:'absolute',left:mix(1320,914,e(t,.87,1.35))+out*500,top:18,width:356,height:684,borderRadius:30,overflow:'hidden'}}><Media asset={{...pick(cut,1),fit:'contain'}} style={{objectFit:'contain'}}/></div></>}
 {t>10.62&&<><Card asset={pick(media,5)} x={mix(-824,18,e(t,10.62,11.03))} y={0} w={808} h={452} r={31} style={{zIndex:2}}/><Card asset={pick(media,6)} x={mix(1310,444,e(t,10.62,11.03))} y={238} w={808} h={452} r={31}/></>}
 </Stage>;
};

/** The first large media window physically becomes the first grid cell.
 * Remaining cells enter in reading order; the six then leave together. */
export const Clip044:React.FC<BatchBProps>=({media=landscapes.map(a=>({...a,src:a.src.replace(/\.jpg$/,'.mp4')}))})=>{
 const t=useTime();const shrink=e(t,.19,.62);const fade=1-e(t,5.86,6.42);
 return <Stage>
 <Card asset={pick(media,0)} x={mix(66,-82,shrink)} y={mix(30,30,shrink)} w={mix(1144,448,shrink)} h={mix(664,264,shrink)} r={mix(48,18,shrink)} opacity={fade}/>
 {[.34,.74,1.70,1.94,2.18].map((start,i)=>{const cell=i+1;const a=e(t,start,start+.35);return <Card key={cell} asset={pick(media,cell)} x={[-82,414,914][cell%3]} y={cell<3?30:377} w={448} h={264} r={18} opacity={a*fade} style={{transform:`scale(${mix(.96,1,a)})`}}/>;})}
 {t>6.51&&<Card asset={portraits[0]} x={mix(-400,52,e(t,6.51,6.85))} y={14} w={380} h={674} r={22}/>}
 </Stage>;
};

/** Title exits upwards as a staggered masonry wall becomes opaque. Each column
 * keeps independent tile heights and upward travel; no screenshot wall. */
export const Clip045:React.FC<BatchBProps>=({media=[...portraits,...landscapes.map(a=>({...a,src:a.src.replace(/\.jpg$/,'.mp4')}))]})=>{
 useShuHei();
 const t=useTime();const [tx,ty,tw,th,ta]=measured(r045 as ClipSpec,'pill',t*60);const wall=e(t,1.94,2.46);
 const heights=[[309,520,315,540,430,370],[429,520,280,478,430,370],[209,154,270,500,400,360],[209,361,350,480,410,350],[89,481,310,510,360,490],[89,181,510,310,490,360]];
 return <Stage>
 {t<.19&&<Card asset={pick(media,7)} x={80} y={mix(-314,-780,e(t,0,.19))} w={1110} h={624} r={44} style={{zIndex:4}}/>}
 {heights.map((col,c)=>{let y=-700;return [700,...col,520,440,600].map((h,r)=>{const py=y;y+=h;const top=py-(t-3)*350;if(wall<=0||top+h<-24||top>744)return null;return <Card key={`${c}-${r}`} asset={{...pick(media.filter(a=>!a.src.includes('fred-mic-magnet')),c*3+r),fit:'cover'}} x={-168.667+c*270} y={top} w={270} h={h} r={0} opacity={wall} style={{boxShadow:'none',border:'1px solid #181818',boxSizing:'border-box'}}/>})})}
 <div style={{position:'absolute',left:372,top:658,width:548,height:48,borderRadius:26,background:'rgba(57,55,63,.74)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',gap:16,padding:'0 17px',boxSizing:'border-box',color:'#ddd',opacity:wall,fontFamily:'FredRegular',fontSize:18}}>{['▧','▱','▥','⚙'].map((icon,i)=><span key={i} style={{width:28,textAlign:'center'}}>{icon}</span>)}<span style={{marginLeft:'auto',borderRadius:25,padding:'6px 12px',background:'#ffffff24'}}>✦ 10</span></div>
 {t<2.47&&<div style={{position:'absolute',left:tx/1.5,top:ty/1.5,width:tw/1.5,height:th/1.5,borderRadius:84,background:'#000',boxShadow:'16px 10px 18px #0003',opacity:ta,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}><span style={{fontFamily:'OfficialShuHei',fontWeight:700,fontSize:148,color:DARK_PURPLE,whiteSpace:'nowrap'}}> {Array.from('声音记忆').map((char,i)=><span key={i} style={{opacity:measured(r045 as ClipSpec,'textLight',t*60)[i]}}>{char}</span>)}</span></div>}
 </Stage>;
};
