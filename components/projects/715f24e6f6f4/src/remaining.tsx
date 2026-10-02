import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import track6 from '../public/reassessment/SP006-device-track.json';
import track12 from '../public/reassessment/SP012-device-track.json';
import track13 from '../public/reassessment/SP013-device-track.json';
import promptTrack from '../public/reassessment/SP022-prompt-track.json';
import transcripts from './media-content.json';
import native6 from '../public/code-revision/SP006-track.json';
import native12 from '../public/code-revision/SP012-track.json';
import native13 from '../public/code-revision/SP013-track.json';
import title13 from '../public/code-revision/SP013-carrier.json';
import carrier18 from '../public/code-revision/SP018-track.json';
import ui10 from '../public/code-revision/SP010-ui.json';
import ui12 from '../public/code-revision/SP012-ui.json';
import ui13 from '../public/code-revision/SP013-ui.json';
import ui22 from '../public/review-revision03/SP022-track.json';
import review10 from '../public/review-revision03/SP010-track.json';
import grid18 from '../public/review-revision03/SP018-track.json';
import {SP012Words} from './sp012-review-words';
import {SP012Intro} from './sp012-review-intro';
import home18 from '../public/review-revision03/SP018-handoff.json';
import opacity22 from './sp022-review-opacity.json';
import opening6 from '../public/review-revision03/SP006-track.json';
export {SP001, SP011, SP014} from './comparison-scenes';
export {SP007, Q07} from './report-scenes';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const t=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],clamp);
const stage:React.CSSProperties={background:'#fff',overflow:'hidden',fontFamily:'MiSans'};
const media:React.CSSProperties={width:'100%',height:'100%',objectFit:'contain'};
const shadow='0 12px 28px #00000026';
const A:React.FC<{name:string;style?:React.CSSProperties}>=({name,style})=><Img src={staticFile(name)} style={style}/>;
const V:React.FC<{name:string;style?:React.CSSProperties;start?:number}>=({name,style,start=0})=><Sequence from={start} layout="none"><OffthreadVideo src={staticFile(name)} muted style={style}/></Sequence>;
const box=(x:number,y:number,w:number,h:number):React.CSSProperties=>({position:'absolute',left:x,top:y,width:w,height:h});

type NativeTrack = {startFrame?:number; boxes:(number[] | null)[]};
// A source-native image per frame avoids decoder seeking, repeated rescaling and independent UI clocks.
const NativeLayer:React.FC<{code:string;track:NativeTrack;kind?:'ui'|'device'}>=({code,track,kind='device'})=>{
  const f=useCurrentFrame();const b=track.boxes[f-(track.startFrame||0)];
  if(!b)return null;
  return <Img src={staticFile(`code-revision/${code}${kind==='ui'?'-ui':''}/${String(f).padStart(4,'0')}.png`)}
    style={{...box(b[0],b[1],b[2],b[3]),objectFit:'fill'}}/>;
};
const Device:React.FC<{code:string;track:{startFrame:number;boxes:number[][]};opacity?:number}>=({code,track,opacity=1})=>{const f=useCurrentFrame();const i=Math.max(0,Math.min(track.boxes.length-1,f-track.startFrame));const [x,y,w,h]=track.boxes[i];return <div style={{...box(x,y,w,h),opacity,overflow:'hidden'}}><V name={`reassessment/${code}-device.mp4`} start={track.startFrame} style={{...media,objectFit:'fill'}}/><div style={{position:'absolute',top:Math.max(0,1020-y),left:0,width:w,height:40,background:'#fff'}}/></div>};
const FredOutro:React.FC<{start:number}>=({start})=>{const f=useCurrentFrame();return <Sequence from={start}><AbsoluteFill style={stage}><A name={`characters/fred07-frames/frame-${String(Math.min(60,Math.max(1,f-start+1))).padStart(3,'0')}.png`} style={{...box(420,0,1080,1080),objectFit:'contain'}}/></AbsoluteFill></Sequence>};
export const SP006:React.FC=()=>{
 const f=useCurrentFrame();const early=opening6.boxes[f];
 return <AbsoluteFill style={stage}>
  {f<9&&early&&<>
   <div style={{...box(early[0],early[1],early[2],1000),borderRadius:65,background:'#111'}}><div style={{position:'absolute',inset:12,borderRadius:55,background:'#fff'}}/></div>
   <A name={`review-revision03/SP006/${String(f).padStart(4,'0')}.png`} style={box(...early as [number,number,number,number])}/>
  </>}
  {f>=9&&<NativeLayer code="SP006" track={native6}/>}
  {f>=9&&<div style={{...box(0,1008,1920,72),background:'#fff'}}/>}
 </AbsoluteFill>;
};
export const SP010:React.FC=()=>{
  const f=useCurrentFrame();const focus=t(f,27,40)*(1-t(f,254,274));const doc=review10.boxes[f];
  return <AbsoluteFill style={stage}>
    {f<20||f>=273?<A name={`review-revision03/SP010/app-${String(f).padStart(4,'0')}.png`} style={box(0,0,1920,1020)}/>:<A name="reassessment/SP010-base.png" style={{...box(0,0,1920,1080),filter:`blur(${18*focus}px)`}}/>}
    <div style={{...box(0,1020,1920,60),background:'#fff'}}/>
    {doc&&<A name={`review-revision03/SP010/${String(f).padStart(4,'0')}.png`} style={{...box(...doc as [number,number,number,number]),opacity:1-t(f,270,273),filter:'drop-shadow(18px 12px 16px #0006)'}}/>}
  </AbsoluteFill>;
};
export const SP012:React.FC=()=>{
  const f=useCurrentFrame();
  return <AbsoluteFill style={stage}>
    <SP012Intro/>
    <SP012Words/>
    <NativeLayer code="SP012" track={native12}/>
    <NativeLayer code="SP012" track={ui12} kind="ui"/>
    <div style={{...box(0,1020,1920,60),background:'#fff'}}/>
  </AbsoluteFill>;
};
export const SP013:React.FC=()=>{
  const f=useCurrentFrame();const carrier=title13[f];
  return <AbsoluteFill style={stage}>
    {f<44&&<NativeLayer code="SP013" track={native13}/>}
    {carrier&&<div style={{...box(carrier[0],carrier[1],carrier[2],carrier[3]),background:'#050505',borderRadius:carrier[3]/2,color:'#fff',fontSize:198,fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',whiteSpace:'nowrap',overflow:'hidden'}}>
      <span style={{opacity:t(f,69,82)}}>图生<span style={{color:'#a78bfa'}}>视频</span></span>
    </div>}
    <NativeLayer code="SP013" track={ui13} kind="ui"/>
    {f>=326&&<Sequence from={326} layout="none"><OffthreadVideo src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} transparent muted
      style={{...box(interpolate(f,[326,334],[-500,80],clamp),15,720,1050),objectFit:'contain'}}/></Sequence>}
    {/* The outro recording has burned caption ascenders 12px above the usual cutoff. */}
    <div style={{...box(0,f>=326?1008:1020,1920,f>=326?72:60),background:'#fff'}}/>
  </AbsoluteFill>;
};
export const SP018:React.FC=()=>{
  const f=useCurrentFrame();const measured=carrier18.boxes[f];
  const carrier=f<16&&measured?[measured[0],measured[1]===0?measured[3]-1020:measured[1]-84,1327,1020]:[42,f>=70&&measured?measured[1]:80,1327,944];
  const opacity=t(f,6,7)*(1-t(f,71,79));
  const grid=grid18.boxes[f];const home=home18.boxes[f];
  return <AbsoluteFill style={{...stage,background:'#111'}}>
    <A name="reassessment/SP018-toolbar.png" style={box(0,0,1920,50)}/>
    {grid&&<div style={{...box(...grid as [number,number,number,number]),opacity:1-t(f,71,79),borderRadius:24,overflow:'hidden'}}><A name="review-revision03/SP018-grid.png" style={{width:'100%',height:'100%',objectFit:'fill'}}/></div>}
    <div style={{...box(carrier[0],carrier[1],carrier[2],carrier[3]),background:'#202024',borderRadius:24,overflow:'hidden',opacity}}>
      <div style={{height:86,background:'#19191d',paddingLeft:54,display:'flex',gap:14,alignItems:'center'}}>{['#a78bfa','#fff','#777'].map(c=><i key={c} style={{width:20,height:20,borderRadius:10,background:c}}/>)}</div>
      <div style={{padding:'26px 43px',color:'#fff',fontFamily:'SmileySans',fontSize:58,lineHeight:'87px',letterSpacing:11,opacity:t(f,17,29),whiteSpace:'pre-wrap'}}>{transcripts.SP018.script}</div>
    </div>
    {f>=82&&f<112&&<div style={{...box(0,630,1920,130),textAlign:'center',fontSize:34,lineHeight:'50px',color:'#fff'}}>开启全新创作之旅</div>}
    {home&&<A name={`review-revision03/SP018-handoff/${String(f).padStart(4,'0')}.png`} style={box(...home as [number,number,number,number])}/>}
  </AbsoluteFill>;
};
const prompt1='16比9的 视频 电影宽画幅，柔和的午后室内自然光，复古胶片色调，浅景深镜头\n，细腻光影层次，年轻的现代中国女性，身着粉色的吊带围裙，长相甜美，在一\n个有现代质感的厨房里切菜准备食材，氛围感安静治愈，纪实文艺电影质感，低\n饱和度调色，轻微胶片颗粒，缓慢推拉运镜，真实生活化细节，无夸张美颜';
const prompt2='电影级质感，超宽画幅，无人机航拍，动态运镜。巨型未来科幻都市坐落于活火\n山脚下——流线型摩天楼，散发冷蓝、冰白、淡紫光。背景巨型活火山喷涌赤\n红岩浆，灰白云翻腾，熔岩沿山体流淌。暗调赛博暮色天空，冷色霓虹与暖色火\n光激烈碰撞。超现实科幻美学，高动态光影，超高清画质。';
export const SP022:React.FC=()=>{
  const f=useCurrentFrame();const shape=ui22.boxes[f];
  const [firstAlpha,secondAlpha]=opacity22[f];
  return <AbsoluteFill style={stage}>
    <A name={`review-revision03/SP022/${String(f).padStart(4,'0')}.png`} style={box(0,0,1920,1080)}/>
    {shape&&<div style={{...box(shape[0]-2,shape[1]-2,shape[2]+4,shape[3]+4),background:'#050505',borderRadius:Math.min(shape[3]/2,96),overflow:'hidden',padding:'36px 58px',boxSizing:'border-box',whiteSpace:'pre',color:'#fff',fontSize:44,lineHeight:'52px',fontWeight:400}}>
      <div style={{opacity:firstAlpha}}>{prompt1}</div>
      <div style={{position:'absolute',inset:'36px 58px',opacity:secondAlpha}}>{prompt2}</div>
    </div>}
  </AbsoluteFill>;
};
const tasks=['统计出席情况','查询往返机票价格','查询住宿价格','计算总预算','整理编辑飞书文档','文档发给小陈'];const taskChecks=[55,105,250,322,410,475];
const PhoneShell:React.FC<{x:number;y:number;w:number;h:number;children:React.ReactNode}>=({x,y,w,h,children})=><div style={{...box(x,y,w,h),background:'#111',borderRadius:48,padding:12,boxSizing:'border-box',boxShadow:shadow}}><div style={{height:'100%',overflow:'hidden',borderRadius:36,background:'#fff'}}>{children}</div></div>;
export const Q02:React.FC=()=>{const f=useCurrentFrame();return <AbsoluteFill style={stage}><div style={{opacity:1-t(f,505,515)}}><PhoneShell x={795} y={90} w={400} h={866}><V name="reassessment/Q02-right-screen.mp4" style={media}/></PhoneShell><div style={{opacity:t(f,84,94)}}><PhoneShell x={280} y={100} w={390} h={850}><V name="reassessment/Q02-left-screen.mp4" start={84} style={media}/></PhoneShell></div><div style={{...box(1280,250,410,520),background:'#f4f4f4',borderRadius:40,padding:'22px 25px',boxSizing:'border-box',boxShadow:shadow}}><h2 style={{fontSize:48,fontWeight:900,margin:'0 0 14px',textAlign:'center'}}>任务列表</h2>{tasks.map((word,i)=>{const done=t(f,taskChecks[i],taskChecks[i]+6);return <div key={word} style={{position:'relative',height:68,fontFamily:'SmileySans',fontSize:39,color:done?'#888':'#111',display:'flex',alignItems:'center',gap:12,whiteSpace:'nowrap'}}><span style={{width:39,height:39,flexShrink:0,background:done?'#7c3aed':'#fff',boxShadow:'inset 0 0 0 3px #111',color:'#fff',textAlign:'center',lineHeight:'39px'}}>{done>0?'✓':''}</span>{word}<div style={{position:'absolute',left:50,top:33,width:310*done,height:4,background:'#111'}}/></div>})}</div><div style={{...box(1620,900,270,110),fontFamily:'SmileySans',fontSize:95,fontWeight:900,opacity:t(f,30,45)}}>×10</div></div><Sequence from={515}><AbsoluteFill style={stage}><OffthreadVideo transparent muted src={staticFile('characters/Fred_振作展示_1440p30_Alpha.webm')} style={{...box(420,0,1080,1080),objectFit:'contain'}}/></AbsoluteFill></Sequence></AbsoluteFill>};
export const Q13:React.FC=()=>{
 const f=useCurrentFrame();const intro=t(f,24,36),pair=t(f,120,127),out=t(f,250,263);
 const phoneXs=[392,402,434,485,544,595,627,637];
 const phoneX=phoneXs[Math.max(0,Math.min(7,f-120))]*2;
 const laptopXs=[-342,-249,-165,-90,-26,25,65,94,114,125,128];
 const laptopX=f<125?-1100:laptopXs[Math.min(10,f-125)]*2;
 return <AbsoluteFill style={stage}>
  <div style={{opacity:1-intro}}>{['无需邀请码','3端同步'].map((word,i)=><div key={word} style={{...box(610+i*90,285+i*260,700-i*180,190),background:i?'#7c3aed':'#050505',color:'#fff',borderRadius:40,fontFamily:'SmileySans',fontSize:116,textAlign:'center',lineHeight:'190px'}}>{word}</div>)}</div>
  <div style={{opacity:intro*(1-out)}}>
   <PhoneShell x={phoneX} y={176} w={352} h={720}><V name="reassessment/Q13-phone-clean-native.mp4" style={media}/></PhoneShell>
   <div style={{...box(1160,466,645,150),fontSize:74,fontFamily:'SmileySans',opacity:1-t(f,114,120)}}>Agent指挥中心</div>
   <div style={{opacity:f>=125?1:0,transform:`translateX(${laptopX-260}px)`}}>
    <div style={{...box(260,240,712,480),background:'#111',padding:'48px 16px 52px 8px',boxSizing:'border-box',borderRadius:24,boxShadow:shadow,overflow:'hidden'}}>
      {f<145?<A name="reassessment/Q13-laptop-clean-first.png" style={media}/>:<V name="reassessment/Q13-laptop-clean-v2.mp4" start={145} style={media}/>}
    </div><div style={{...box(170,724,890,30),background:'#ddd',borderRadius:'0 0 20px 20px'}}/>
   </div>
   <div style={{...box(618,-170*(1-t(f,128,140)),683,155),fontFamily:'SmileySans',fontSize:90,color:'#111',opacity:t(f,128,132)}}>随时<span style={{color:'#7c3aed'}}>远程操控</span></div>
   <svg style={{...box(970,402,285,155),opacity:t(f,127,135)}} viewBox="0 0 285 155">{[20,78,136].map(y=><path key={y} d={`M0 ${y} H285`} stroke="#7c3aed" strokeWidth="5" strokeDasharray="15 10"/>)}</svg>
  </div><Sequence from={263}><AbsoluteFill style={stage}><OffthreadVideo transparent muted src={staticFile('characters/Fred_伸手示意_1440p30_Alpha.webm')} style={{...box(420,0,1080,1080),objectFit:'contain'}}/></AbsoluteFill></Sequence>
 </AbsoluteFill>;
};
