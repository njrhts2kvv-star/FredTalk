// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Loop, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
const cap=(v:number)=>Math.min(1,Math.max(0,v));
const e=(t:number,a:number,b:number)=>{const p=cap((t-a)/(b-a));return p*p*(3-2*p)};
const m=(a:number,b:number,p:number)=>a+(b-a)*p;
const videoFiles=['shared/landscape-1.mp4','shared/landscape-2.mp4','shared/landscape-3.mp4','shared/screen.mp4'];
const pageFiles=['batch-c/report-1.png','batch-c/report-2.png','batch-c/report-3.png'];
const alphaFiles=['shared/product.png','shared/product.png','shared/product.png'];
const media=(id:number)=>videoFiles[id%videoFiles.length];
const LocalVideo:React.FC<{src:string}>=({src})=>{const {fps}=useVideoConfig();const duration=src.includes('screen')?9.36:5.1;return <Loop durationInFrames={Math.floor(duration*fps)}><OffthreadVideo muted src={staticFile(src)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Loop>};
const Page:React.FC<{id:number;x:number;y?:number;w:number;h:number;scroll?:number;shadow?:number;opacity?:number}> = ({id,x,y=0,w,h,scroll=0,shadow=0,opacity=1}) => <div style={{position:'absolute',left:x,top:y,width:w,height:h,overflow:'hidden',background:'white',borderRadius:shadow?28:0,boxShadow:shadow?`${shadow}px ${shadow}px ${shadow*2}px #0004`:undefined,opacity}}><Img src={staticFile(pageFiles[id%3])} style={{width:'100%',height:'auto',transform:`translateY(${-scroll}px)`}}/></div>;
const Movie:React.FC<{id:number;x:number;y:number;w:number;h:number;opacity?:number;rotate?:number;src?:string}> = ({id,x,y,w,h,opacity=1,rotate=0,src}) => <div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:30,overflow:'hidden',boxShadow:'16px 15px 20px #0003',opacity,transform:`perspective(1000px) rotateY(${rotate}deg)`,transformOrigin:'left center'}}><LocalVideo src={src||media(id)}/></div>;
const useSeconds=()=>{const f=useCurrentFrame();return f/useVideoConfig().fps};
export const batchCMetadata=[{id:'048',fps:30,durationInFrames:420},{id:'049',fps:60,durationInFrames:480},{id:'051',fps:30,durationInFrames:240},{id:'052',fps:30,durationInFrames:300}].map(x=>({...x,width:1280,height:720}));

export const Clip048:React.FC=()=>{
 const t=useSeconds(); const initial=e(t,.05,.42); const travel=e(t,4.2,6.45); const foreground=e(t,7.4,8.0);
 return <AbsoluteFill style={{background:'white',overflow:'hidden'}}>
  <Img src={staticFile('shared/interface.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',opacity:1-initial}}/><div style={{opacity:initial*(1-foreground)}}>{[0,1,2,3,4].map((id)=><Page key={id} id={id} x={m(id===0?0:1280,40+id*414,initial)-travel*830} w={m(id===0?1280:390,390,initial)} h={720} scroll={m(0,100,e(t,3,6))}/>)}</div>
  {t>4.4&&t<5.5&&[0,1].map(i=><div key={'mark'+i} style={{position:'absolute',left:60+i*414,top:185,width:360,height:345,border:'3px solid #e2a1b5',opacity:e(t,4.4,4.55)*(1-e(t,5.2,5.5))}}/>)}
  {t>6.4&&t<7.5&&<div style={{position:'absolute',left:866,top:68,width:350,height:348,border:'3px solid #e2a1b5',opacity:e(t,6.4,6.65)*(1-e(t,7.1,7.5))}}/>}
  <div style={{opacity:foreground}}>
   <Page id={1} x={m(65,55,foreground)} y={10} w={585} h={695} shadow={12} scroll={m(0,320,e(t,8.15,13.5))}/>
   <Page id={2} x={m(645,632,foreground)} y={10} w={585} h={695} shadow={12} scroll={m(0,320,e(t,8.6,13.8))}/>
  </div>
 </AbsoluteFill>;
};

export const Clip049:React.FC=()=>{
 const t=useSeconds(); const scroll=e(t,.2,2.25); const lift=e(t,3.3,3.82); const exit=e(t,6.1,6.55); const p=lift*(1-exit);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
  {[0,1,2,3].map(id=><Page key={id} id={id} x={id*423-60} w={398} h={720} scroll={m(0,150,scroll)}/>)}
  <div style={{position:'absolute',inset:0,background:'#fff',opacity:p*.2}}/>
  {[0,1].map(id=><div key={id} style={{position:'absolute',left:m(id===0?115:870,id===0?36:710,p),top:m(id===0?370:100,id===0?125:96,p),width:m(290,id===0?620:540,p),height:m(185,id===0?480:520,p),background:'white',borderRadius:m(0,26,p),overflow:'hidden',boxShadow:`${p*13}px ${p*16}px ${p*22}px #0004`,opacity:lift*(1-e(t,6.5,6.6))}}><Img src={staticFile(`batch-c/table-${id+1}.png`)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center 35%'}}/><div style={{position:'absolute',left:16,right:16,top:id===0?105:132,bottom:18,border:'6px solid #e8a2b3',borderRadius:8,opacity:e(t,4.35,4.55)*(1-e(t,5.75,6.1))}}/></div>)}
 </AbsoluteFill>;
};

/** Cylindrical page-unroll approximation. Each vertical strip samples the same
 * source-video frame as the underlying Remotion video at the global frame. */
const CurlMovie051:React.FC<{id:number;x:number;y:number;w:number;h:number;opacity:number;start:number}>=({id,x,y,w,h,opacity,start})=>{
 const t=useSeconds(); const curlDuration=id===0?0.60:0.30;const progress=e(t,start,start+curlDuration);
 if(t<start)return null;
 if(progress>=1)return <Movie id={id} x={x} y={y} w={w} h={h} opacity={opacity}/>;
 const frame=Math.min(Math.floor(start*30)+19,Math.max(Math.round(start*30),Math.floor(t*30)));
 const imageSrc=staticFile(`batch-c/curl/${id}-${String(frame).padStart(3,'0')}.jpg`);
 const visibleWidth=w*(.13+.87*progress);
 const lift=h*.88*(1-progress);
 const slices=40;
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,opacity,filter:'drop-shadow(13px 15px 10px #0005)'}}>
  <Img src={imageSrc} style={{position:'absolute',width:1,height:1,opacity:0}}/>
  <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow:'visible'}}>
   <defs><linearGradient id={`curl-shade-${id}`}><stop offset="0" stopColor="#fff" stopOpacity="0"/><stop offset=".7" stopColor="#000" stopOpacity="0"/><stop offset="1" stopColor="#000" stopOpacity={.42*(1-progress)}/></linearGradient><clipPath id={`curl-edge-${id}`}><rect width={visibleWidth} height={h} rx={30}/></clipPath></defs>
   <path d={`M 0 ${h} Q ${visibleWidth*.58} ${h-lift*.13} ${visibleWidth} ${h-lift} L ${visibleWidth+lift*.16} ${h-lift*.13} L ${visibleWidth*.83} ${h+3} Z`} fill="#b9b9b9" opacity={1-progress}/>
   <g clipPath={`url(#curl-edge-${id})`}>{Array.from({length:slices},(_,i)=>{
    const u=i/slices; const curvedU=Math.sin(u*Math.PI*.48)/Math.sin(Math.PI*.48);
    const nextU=Math.sin((i+1)/slices*Math.PI*.48)/Math.sin(Math.PI*.48);
    const destX=visibleWidth*(progress*u+(1-progress)*curvedU);
    const destW=visibleWidth*(progress/slices+(1-progress)*(nextU-curvedU))+.6;
    const stripHeight=h-lift*u*u;
    return <svg key={i} x={destX} y={0} width={destW} height={stripHeight} viewBox={`${i*960/slices} 0 ${960/slices} 540`} preserveAspectRatio="none"><image href={imageSrc} width={960} height={540}/></svg>;
   })}<rect width={visibleWidth} height={h} fill={`url(#curl-shade-${id})`}/></g>
  </svg>
 </div>;
};

const originalPrompt=['电影级写实横向水平中景镜头，残破黑暗的战事圣堂内','部大厅。镜头与战士腰胸高度齐平，全程保持水平视','角，无俯仰、无倾斜。身着哑光厚重锻钢战甲的战士','站在画面正中央，怀里横抱着一个半机械改造杂兵，','像抱舞伴一样踏着轻快舞步匀速顺时针旋转。'];
export const Clip051:React.FC=()=>{
 const t=useSeconds(); const grid=e(t,4.98,5.55); const leave=e(t,7.0,7.45);
 const positions=[{x:60,y:16},{x:680,y:16},{x:60,y:360},{x:680,y:360}];
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
  <div style={{position:'absolute',left:136,zIndex:20,top:m(475,790,grid),width:1008,height:232,borderRadius:64,background:'#000',boxShadow:'14px 13px 20px #0003',padding:'24px 40px',boxSizing:'border-box',color:'#fff',fontSize:35,fontWeight:900,lineHeight:1.01,fontFamily:'FredHeavy',letterSpacing:2.5,overflow:'hidden'}}><div style={{opacity:e(t,0,.3)}}>{originalPrompt.map((line,i)=><div key={i} style={{whiteSpace:'nowrap',height:36}}>{line}</div>)}</div></div>
  {[0,1,2,3].map(id=>{const starts=[13/30,46/30,76/30,106/30];const appear=e(t,starts[id],starts[id]+.07);const shifted=e(t,starts[Math.min(3,id+1)],starts[Math.min(3,id+1)]+.45);const stack=[{x:m(282,51,shifted),y:m(20,17,shifted),w:m(730,448,shifted),h:m(412,252,shifted)},{x:m(272,780,shifted),y:17,w:m(730,448,shifted),h:m(412,252,shifted)},{x:m(282,51,shifted),y:m(20,320,shifted),w:m(730,448,shifted),h:m(412,252,shifted)},{x:390,y:85,w:633,h:356}][id];return <CurlMovie051 key={id} id={id} start={starts[id]} x={m(stack.x,positions[id].x,grid)} y={m(stack.y,positions[id].y,grid)} w={m(stack.w,540,grid)} h={m(stack.h,304,grid)} opacity={appear*(1-leave)}/>;})}
  <Movie id={0} src='shared/portrait-1.mp4' x={190} y={16} w={390} h={680} opacity={e(t,7.62,7.95)}/>
 </AbsoluteFill>;
};

export const Clip052:React.FC=()=>{
 const t=useSeconds();const arrange=e(t,.7,1.35);const appear=e(t,1.23,1.7);const exit=e(t,8.1,8.8);const web=e(t,8.7,9.15);
 return <AbsoluteFill style={{background:'white',overflow:'hidden'}}>
  <div style={{opacity:1-exit}}>
   {[0,1].map(row=><Movie key={row} id={row} opacity={row===0?1:e(t,.12,.5)} src={`shared/portrait-${row+1}.mp4`} x={m(row===0?190:700,235,arrange)} y={m(16,row===0?12:370,arrange)} w={m(390,192,arrange)} h={m(680,340,arrange)}/>)}
   {[0,1].flatMap(row=>[0,1,2].map(col=><div key={`${row}-${col}`} style={{position:'absolute',left:490+col*196,top:row===0?20:380,width:185,height:320,opacity:appear,transform:`translateY(${(1-appear)*15}px)`,filter:'drop-shadow(9px 8px 7px #0003)'}}><Img src={staticFile(alphaFiles[(col+row)%3])} style={{position:'absolute',width:185,height:185,left:0,top:67,objectFit:'contain',clipPath:'circle(44% at 50% 50%)'}}/></div>))}
  </div>
  <div style={{position:'absolute',left:70,top:35,width:1280,height:740,borderRadius:32,overflow:'hidden',boxShadow:'-8px -3px 10px #0003',transform:'perspective(1800px) rotateY(-5deg) rotateZ(2deg)',transformOrigin:'top left',opacity:web}}><Img src={staticFile('shared/interface.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
 </AbsoluteFill>;
};
