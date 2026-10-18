// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React, {CSSProperties} from 'react';
import videoManifest from '../public/shared/videos.json';
import {AbsoluteFill, Img, OffthreadVideo, Loop, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type MediaB = {src:string; type?:'image'|'video'; fit?:'cover'|'contain'; position?:string; cutout?:boolean};
export type BatchBProps = {media?:MediaB[]; backdrop?:MediaB; cutouts?:MediaB[]};
const defaults:MediaB[] = [1,2,3,4].map(i=>({src:`shared/portrait-${i}.png`}));
const portraits:MediaB[]=[1,2,3].map(i=>({src:`shared/portrait-${i}.mp4`,type:'video'}));
const landscapes:MediaB[]=[1,2,3].map(i=>({src:`shared/landscape-${i}.mp4`,type:'video'}));
const photos:MediaB[]=[...defaults,{src:'shared/product.png'},{src:'shared/interface.png'},{src:'shared/landscape-2.mp4.jpg'},{src:'shared/landscape-1.mp4.jpg'}];
const pick=(list:MediaB[],i:number)=>list[((i%list.length)+list.length)%list.length];
const p=(t:number,a:number,b:number)=>Math.min(1,Math.max(0,(t-a)/(b-a)));
const e=(t:number,a:number,b:number)=>{const q=p(t,a,b);return q*q*(3-2*q)};
const mix=(a:number,b:number,q:number)=>a+(b-a)*q;
const font='FredHeavy';
const useTime=()=>{const f=useCurrentFrame();return f/useVideoConfig().fps};
const Media:React.FC<{asset:MediaB;style?:CSSProperties}>=({asset,style})=>{
 const {fps}=useVideoConfig();
 const duration=videoManifest.find(v=>v.file===asset.src)?.duration??5;
 const css:CSSProperties={width:'100%',height:'100%',objectFit:asset.fit??'cover',objectPosition:asset.position??'center',display:'block',...(asset.cutout?{height:'auto',aspectRatio:'1',position:'absolute',top:'50%',transform:'translateY(-50%)',clipPath:'circle(44% at 50% 50%)'}:{}),...style};
 return asset.type==='video'?<Loop durationInFrames={Math.max(1,Math.floor(duration*fps))}><OffthreadVideo muted src={staticFile(asset.src)} style={css}/></Loop>:<Img src={staticFile(asset.src)} style={css}/>;
};
const Stage:React.FC<React.PropsWithChildren>=({children})=><AbsoluteFill style={{background:'#fff',overflow:'hidden'}}><style>{`@font-face{font-family:FredHeavy;src:url('${staticFile('shared/MiSans-Heavy.otf')}')}`}</style>{children}</AbsoluteFill>;
const Card:React.FC<{asset:MediaB;x:number;y:number;w:number;h:number;r?:number;opacity?:number;style?:CSSProperties}>=({asset,x,y,w,h,r=30,opacity=1,style})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r,overflow:'hidden',opacity,boxShadow:'14px 10px 20px rgba(0,0,0,.22)',...style}}><Media asset={asset}/></div>;

/** Opaque cylindrical unroll for the portrait page. Forty vertical texture
 * slices shorten towards the curled right edge; content never fades in. */
const CurlCard028:React.FC<{asset:MediaB;x:number;y:number;w:number;h:number;progress:number;opacity:number;id:string}>=({asset,x,y,w,h,progress,opacity,id})=>{
 if(progress<=0)return null;
 if(progress>=1||asset.type==='video')return <Card asset={asset} x={x} y={y} w={w} h={h} r={26} opacity={opacity}/>;
 const visibleWidth=w*(.11+.89*progress),lift=h*.9*(1-progress),slices=40;
 const imageSrc=staticFile(asset.src);const tw=1000,th=1500;
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,opacity,filter:'drop-shadow(12px 10px 11px #0004)'}}>
  <Img src={imageSrc} style={{width:1,height:1,position:'absolute',opacity:0}}/>
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
   <defs><linearGradient id={`shade-${id}`}><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".7" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity={.34*(1-progress)}/></linearGradient><clipPath id={`edge-${id}`}><rect width={visibleWidth} height={h} rx={26}/></clipPath></defs>
   <path d={`M 0 ${h} Q ${visibleWidth*.58} ${h-lift*.13} ${visibleWidth} ${h-lift} L ${visibleWidth+lift*.13} ${h-lift*.12} L ${visibleWidth*.83} ${h+2} Z`} fill="#bdbab3"/>
   <g clipPath={`url(#edge-${id})`}>{Array.from({length:slices},(_,i)=>{
    const u=i/slices,curve=Math.sin(u*Math.PI*.48)/Math.sin(Math.PI*.48),next=Math.sin((i+1)/slices*Math.PI*.48)/Math.sin(Math.PI*.48);
    const dx=visibleWidth*(progress*u+(1-progress)*curve),dw=visibleWidth*(progress/slices+(1-progress)*(next-curve))+.5;
    return <svg key={i} x={dx} y={0} width={dw} height={h-lift*u*u} viewBox={`${i*tw/slices} 0 ${tw/slices} ${th}`} preserveAspectRatio="none"><image href={imageSrc} width={tw} height={th} preserveAspectRatio="xMidYMid slice"/></svg>;
   })}<rect width={visibleWidth} height={h} fill={`url(#shade-${id})`}/></g>
  </svg>
 </div>;
};

export const batchBMetadata={
 '028':{width:1280,height:720,fps:60,durationInFrames:1078},
 '033':{width:1280,height:720,fps:30,durationInFrames:450},
 '041':{width:1280,height:720,fps:30,durationInFrames:180},
 '042':{width:1280,height:720,fps:30,durationInFrames:360},
 '044':{width:1280,height:720,fps:30,durationInFrames:210},
 '045':{width:1280,height:720,fps:30,durationInFrames:210},
};

/** A workflow stays as context. A circle stretches into the low explanation bar;
 * three independent flip-in media cards merge into one result, across three cycles. */
export const Clip028:React.FC<BatchBProps>=({media=photos,backdrop})=>{
 const t=useTime();
 const barOpen=e(t,.46,.78),barStretch=e(t,.87,1.65);
 const sentence=t<7.7?'让图1的人物拿着图2的产品 站在图3的场景中':t<12.45?'让图1的人物抱着图2的人物站在图3的场景中':'让图1的汽车替换为图2的车放在图3的场景中';
 const chars=Math.floor(sentence.length*p(t,t<7.7?2.98:t<12.45?8.06:12.62,t<7.7?4.82:t<12.45?9.05:13.52));
 const cycle=(start:number,enter:number[],merge:number,finish:number,offset:number)=>{
  if(t<start||t>=finish)return null;
  const mergeP=e(t,merge,merge+.42),resultP=e(t,merge+.18,merge+.62);
  const small=start===7.76;const inputW=small?264:314;const resultW=start===12.33?350:264;
  return <React.Fragment key={start}>{enter.map((cue,i)=>{
   const appear=small&&i===1?1:e(t,cue,cue+.68);const x=mix(small?154+i*354:72+i*411,640-resultW/2,mergeP);const y=54;
   return <CurlCard028 key={i} id={`028-${start}-${i}`} asset={pick(media,small&&i===1?3:offset+i)} x={x} y={y} w={mix(inputW,resultW,mergeP)} h={470} progress={appear} opacity={1-resultP}/>;
  })}<Card asset={pick(media,offset+3)} x={640-resultW/2} y={54} w={resultW} h={470} r={26} opacity={resultP}/></React.Fragment>;
 };
 return <Stage><div style={{position:'absolute',inset:'12px 20px 24px',borderRadius:5,overflow:'hidden',filter:`blur(${e(t,.82,1.8)*6}px)`,boxShadow:'0 0 13px #777'}}><Media asset={backdrop??{src:'shared/interface.png'}}/></div>
 {cycle(3.28,[3.28,4.15,5.12],6.35,7.76,0)}
 {cycle(7.76,[7.76,7.04,9.17],10.68,12.33,4)}
 {cycle(12.33,[12.33,13.39,14.35],15.72,18,0)}
 <div style={{position:'absolute',left:640,top:mix(350,589,barStretch),width:mix(160,970,barStretch),height:mix(160,98,barStretch),transform:`translate(-50%,-50%) scale(${barOpen})`,borderRadius:55,background:'#101d00',border:'4px solid #a3a697',boxShadow:'0 3px 12px #444',display:'flex',alignItems:'center',justifyContent:'flex-start',padding:'0 38px',boxSizing:'border-box',overflow:'hidden'}}><span style={{fontFamily:font,fontSize:43,color:'white',whiteSpace:'nowrap'}}>{sentence.slice(0,chars)}</span></div>
 </Stage>;
};

/** Six square thumbnails retreat independently; a circle becomes the exact
 * short title pill, then flattens. Five portrait cards build a scrolling rail. */
export const Clip033:React.FC<BatchBProps>=({media=photos,backdrop})=>{
 const t=useTime();const titleScale=e(t,.75,1.23);const widen=e(t,1.38,1.94);const flatten=1-e(t,3.16,4.02);
 const entries=[4.50,6.15,6.75,7.28,7.76];
 const railShift=entries.slice(1).reduce((v,c)=>v+e(t,c,c+.56)*198.5,0);
 return <Stage>
 {t<1.03&&Array.from({length:6},(_,i)=>{const out=e(t,.28+(5-i)*.052,.9+(5-i)*.026);const w=mix(362,0,out),h=mix(342,0,out);return <Card key={i} asset={pick(media,i)} x={mix(42+(i%3)*416,223+(i%3)*416,out)} y={mix(18+Math.floor(i/3)*362,190+Math.floor(i/3)*362,out)} w={w} h={h} r={40} opacity={1-out}/>})}
 {t>=.75&&t<4.1&&<div style={{position:'absolute',left:640,top:360,width:mix(220,548,widen),height:220,borderRadius:mix(110,58,widen),background:'#000',transform:`translate(-50%,-50%) scale(${titleScale},${titleScale*flatten})`,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontFamily:font,fontSize:120,color:'#8960ca',opacity:e(t,1.42,1.9)*(1-e(t,3.03,3.36)),whiteSpace:'nowrap'}}>文字表现</span></div>}
 {entries.map((cue,i)=>{const enter=e(t,cue,cue+.61);const x=450+i*318-railShift;return enter>0&&<Card key={i} asset={pick(media,i+1)} x={x} y={mix(-640,18,enter)} w={380} h={690} r={31} style={{transform:i===0?`scaleY(${mix(.12,1,enter)})`:undefined,transformOrigin:'center top'}}/>})}
 {t>14.15&&<div style={{position:'absolute',inset:0,opacity:e(t,14.15,14.63)}}><Media asset={backdrop??{src:'shared/interface.png'}}/></div>}
 </Stage>;
};

/** Three near-full-height video cards enter bottom-up with short stagger,
 * leave in reading order, then a circle begins the next title. */
export const Clip041:React.FC<BatchBProps>=({media=portraits,backdrop})=>{
 const t=useTime();return <Stage>
 {t<.43&&<div style={{position:'absolute',inset:0,opacity:1-e(t,.08,.39)}}><Media asset={backdrop??pick(media,0)}/></div>}
 {[.42,.62,.82].map((start,i)=>{const enter=e(t,start,start+.28),leave=e(t,4.81+i*.16,5.10+i*.16);return <Card key={i} asset={pick(media,i+1)} x={31+i*419} y={mix(760,20,enter)} w={386} h={678} r={36} opacity={1-leave}/>})}
 {t>5.48&&<div style={{position:'absolute',left:226,top:232,width:226*e(t,5.48,5.9),height:226*e(t,5.48,5.9),transform:'translate(-50%,-50%)',borderRadius:'50%',background:'#000'}}/>}
 </Stage>;
};

/** A rounded live portrait card and two unframed cutouts preserve distinct
 * surfaces. Their exit hands the canvas to two diagonal landscape windows. */
export const Clip042:React.FC<BatchBProps>=({media=[...portraits,...landscapes],cutouts})=>{
 const t=useTime(),out=e(t,10.00,10.39),cut=cutouts??[{src:'shared/product.png',cutout:true},{src:'shared/product.png',cutout:true}];
 return <Stage>
 {t<10.4&&<><Card asset={pick(media,0)} x={mix(18,-570,out)} y={16} w={477} h={684} r={42}/>
 <div style={{position:'absolute',left:mix(1030,515,e(t,.06,.95)),top:mix(16,765,out),width:300,height:692,opacity:e(t,.015,.16)}}><Media asset={{...pick(cut,0),fit:'contain'}} style={{objectFit:'contain'}}/></div>
 <div style={{position:'absolute',left:mix(1320,914,e(t,.87,1.35))+out*500,top:18,width:356,height:684}}><Media asset={{...pick(cut,1),fit:'contain'}} style={{objectFit:'contain'}}/></div></>}
 {t>10.62&&<><Card asset={pick(media,5)} x={mix(-824,18,e(t,10.62,11.03))} y={0} w={808} h={452} r={31} style={{zIndex:2}}/><Card asset={pick(media,6)} x={mix(1310,444,e(t,10.62,11.03))} y={238} w={808} h={452} r={31}/></>}
 </Stage>;
};

/** The first large media window physically becomes the first grid cell.
 * Remaining cells enter in reading order; the six then leave together. */
export const Clip044:React.FC<BatchBProps>=({media=landscapes})=>{
 const t=useTime();const shrink=e(t,.19,.62);const fade=1-e(t,5.86,6.42);
 return <Stage>
 <Card asset={pick(media,0)} x={mix(66,-82,shrink)} y={mix(30,30,shrink)} w={mix(1144,448,shrink)} h={mix(664,264,shrink)} r={mix(48,18,shrink)} opacity={fade}/>
 {[.34,.74,1.70,1.94,2.18].map((start,i)=>{const cell=i+1;const a=e(t,start,start+.35);return <Card key={cell} asset={pick(media,cell)} x={[-82,414,914][cell%3]} y={cell<3?30:377} w={448} h={264} r={18} opacity={a*fade} style={{transform:`scale(${mix(.96,1,a)})`}}/>;})}
 {t>6.51&&<Card asset={pick(media,6)} x={mix(-400,52,e(t,6.51,6.85))} y={14} w={380} h={674} r={22}/>}
 </Stage>;
};

/** Title exits upwards as a staggered masonry wall becomes opaque. Each column
 * keeps independent tile heights and upward travel; no screenshot wall. */
export const Clip045:React.FC<BatchBProps>=({media=photos})=>{
 const t=useTime();const title=e(t,0,.47);const wall=e(t,1.84,2.64);
 const heights=[[395,520,315,540,430,370],[600,280,480,350,580,280],[320,480,310,500,400,360],[500,270,340,540,410,350],[295,410,510,310,490,360]];
 return <Stage>
 {t<.19&&<Card asset={pick(media,7)} x={80} y={mix(-314,-780,e(t,0,.19))} w={1110} h={624} r={44} style={{zIndex:4}}/>}
 {heights.map((col,c)=>{let y=-160-(c%2)*175;return col.map((h,r)=>{const py=y;y+=h;return <Card key={`${c}-${r}`} asset={pick(media,c*3+r)} x={c*268-24} y={py-Math.max(0,t-2.0)*(145+c*12)} w={268} h={h} r={0} opacity={wall} style={{boxShadow:'none'}}/>})})}
 {t<2.47&&<div style={{position:'absolute',left:640,top:mix(360,-180,e(t,2.060,2.43)),width:mix(220,660,title),height:mix(220,286,title),borderRadius:mix(110,88,title),background:'#000',boxShadow:'16px 10px 18px #0003',transform:'translate(-50%,-50%)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}><span style={{fontFamily:font,fontSize:142,color:'#8960ca',whiteSpace:'nowrap',opacity:e(t,.08,.5)}}>文生视频</span></div>}
 </Stage>;
};
