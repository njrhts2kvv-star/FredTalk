import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, interpolate, Easing} from 'remotion';
import type {Overrides} from './index';
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const linear=(f:number,a:number,b:number)=>clamp((f-a)/(b-a));
const eased=(f:number,a:number,b:number)=>Easing.bezier(.42,0,.58,1)(linear(f,a,b));
const sample=(f:number,points:number[][])=>interpolate(f,points.map(p=>p[0]),points.map(p=>p[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
// Exact source display family is unresolved; this explicit Fred fallback is not marked matched.
const DISPLAY='MiSans';
const queueMotion=[[-1,0.0,1.0,0.0,0.0],[0,0.03789362928497667,0.9987536142377177,2.1336683703911103,-2.583825516037726],[1,-0.4127572033220575,0.9971758453748062,-0.4803174942129715,2.126122255760092],[2,-0.6993865225526832,1.000788942342934,-8.71986699924233,-7.9913025438630205],[3,-0.9708433255562965,1.0012562865199215,-13.554282126771218,-27.742759679095418],[4,-2.4367087599001183,1.0010349549980688,-28.60933380430386,-35.68890112454096],[5,-4.077518851917904,0.9968230769263742,-40.78103139097926,-66.06970762652884],[6,-6.3355505516009645,0.9950609406438038,-61.636963405598514,-104.80922334928853],[7,-7.845345566333614,0.9925635112289396,-73.56178042758508,-139.0438720555106],[8,-8.987810981013673,0.9927500785856572,-84.49829956713715,-154.67261062324462],[9,-9.739431148732377,0.9895559532843522,-86.01727170330948,-160.4607028211934],[10,-10.175517473563048,0.9891206246221523,-88.82557595770884,-164.04750432571564],[11,-10.068834819362445,0.9891835065453383,-89.21982041799444,-174.4343863727995],[12,-10.188255125721989,0.989350030482283,-90.1952965612458,-173.4799850796164]];
const longQueueMotion=[[-1,0.0,1.0,0.0,0.0],[0,0.2220229598099765,0.9996847773249583,2.3047667412806607,-8.45822596067452],[1,0.48364354421053823,0.9992018733333352,2.9788272523572696,-23.166773957787107],[2,-0.1408948068558957,1.0038713271285573,-15.080880577085834,-23.556631308142983],[3,-1.148598285499351,1.0024591127706404,-29.695753686876603,-21.76806320684847],[4,-2.0222345530909314,0.9984721128671721,-44.1107628681267,-41.491687381793675],[5,-3.524052446431858,0.9946496842235962,-72.61654923707621,-73.47616998716586],[6,-5.644847174930316,0.9941705149699056,-117.59276924129098,-112.79830951138102],[7,-7.3704081270370025,0.990471869795727,-146.20303112499454,-138.18920038792282],[8,-8.437571911414263,0.9930277636647717,-171.30088397264964,-154.5780808552452],[9,-9.068163085623455,0.9918811635391094,-181.24117472483772,-163.08677440663817],[10,-9.357104560184268,0.9941887040437042,-191.49986911679161,-170.66620949733291],[11,-9.534774308434715,0.993693002322528,-194.02554162643293,-173.24134703026024],[12,-9.588003684522548,0.9936463904311368,-194.93177473765036,-173.74513315346852]];
const shadow='7px 9px 12px rgba(0,0,0,.48)';
const black='#080808';

// Every cue below is indexed in the 30 fps source; 60 fps output samples at half-frame intervals.
export function CalibratedN002({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8';
 const labels=overrides.words??['教程视频能不能做','工具演示能不能做','知识点视频能不能做','产品介绍能不能做','口播视频能不能做','直播视频能不能做'];
 const starts=[11,49,87,125,163,200];
 return <AbsoluteFill style={{background:'white'}}>
 {f<6&&<OffthreadVideo muted transparent src={staticFile(overrides.assets?.actor??'group-a/actor.webm')} style={{position:'absolute',left:420,top:0,width:1080,height:1080,objectFit:'contain',opacity:.36*(1-linear(f,0,5))}}/>}
 {labels.slice(0,6).map((text,i)=>{
  const a=starts[i];if(f<a-2)return null;
  const chars=Array.from(text);const offsets=chars.length===9?[0,2,3,11,12,14,14,21,22]:[0,2,3,12,13,15,15,23];
  const count=offsets.filter(v=>f>=a+v).length;
  // Successive queue steps act on the entire older line, preserving the source's cumulative rotation.
  let ma=1,mb=0,mc=0,md=1,me=0,mf=0;
  for(let k=i;k<5;k++){
   const q=f-(44+k*38);if(q<0)continue;
   const motion=i===2&&k===2?longQueueMotion:queueMotion;
   const rad=sample(q,motion.map(row=>[row[0],row[1]]))*Math.PI/180;const scale=sample(q,motion.map(row=>[row[0],row[2]]));const c=Math.cos(rad)*scale,s=Math.sin(rad)*scale,tx=sample(q,motion.map(row=>[row[0],row[3]])),ty=sample(q,motion.map(row=>[row[0],row[4]]));
   [ma,mb,mc,md,me,mf]=[c*ma-s*mb,s*ma+c*mb,c*mc-s*md,s*mc+c*md,c*me-s*mf+tx,s*me+c*mf+ty];
  }
  const moved=linear(f,44+i*38,56+i*38);const x=i===2?52:32;
  return <div key={i} style={{position:'absolute',inset:0,transform:`matrix(${ma},${mb},${mc},${md},${me},${mf})`,transformOrigin:'0 0'}}>

   <div style={{position:'absolute',left:x,top:459,fontFamily:DISPLAY,fontWeight:700,fontSize:167,lineHeight:1,whiteSpace:'nowrap',color:`rgb(${Math.round(70*moved)},${Math.round(70*moved)},${Math.round(70*moved)})`,textShadow:shadow}}>{chars.slice(0,count).join('')}{f>=a+23&&<span style={{color:accent}}>？</span>}</div>
   {f<a+23&&<div style={{position:'absolute',left:x+(count===0?66:count*167+10),top:448,width:78,height:176,background:'#fff'}}/>}
  </div>;
 })}
 </AbsoluteFill>;
}
function EditorBackdrop(){return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans',color:'#707580',fontSize:19}}>
 <div style={{position:'absolute',left:0,top:0,width:432,height:1080,borderRight:'1px solid #eee',padding:'30px 26px',boxSizing:'border-box'}}><b style={{color:'#444'}}>Files</b><div style={{height:40}}/>{['FredTalk','src','compositions','components','Card.tsx','Chapter.tsx','Text.tsx','media','fonts','package.json','README.md','render.config.ts',...Array.from({length:11},(_,i)=>`scene-${i+1}.tsx`)].map((v,i)=><div key={i} style={{height:43,paddingLeft:i>2?30:0,color:i===7?'#8554E8':'#6b7380',background:i===7?'#efedf5':undefined}}><span style={{color:'#a0bddf',marginRight:18}}>▧</span>{v}</div>)}</div>
 <div style={{position:'absolute',left:470,top:22,right:35}}><div style={{color:'#8299b6',height:62}}>FredTalk / src / compositions / motion.tsx</div>{Array.from({length:24},(_,i)=><div key={i} style={{height:41,whiteSpace:'nowrap'}}><span style={{color:'#ccc',marginRight:35}}>{i+1}</span>{['// FredTalk 可复用动画组件','import {AbsoluteFill, interpolate} from "remotion";','','export function MotionScene({frame, words, assets}) {','  const progress = interpolate(frame, [0, 60], [0, 1]);','  return (','    <AbsoluteFill style={{background: "white"}}>','      <Chapter title={words.title} progress={progress} />','      <MediaCards assets={assets} />','    </AbsoluteFill>','  );','}'][i%12]}</div>)}</div>
 </AbsoluteFill>}
function Cursor({f}:{f:number}){
 if(f<61||f>97)return null;
 const x=f<=79?sample(f,[[61,1931],[79,323]]):f<=83?323:sample(f,[[83,323],[97,1999]]);
 const y=f<=79?sample(f,[[61,676],[79,257]]):f<=83?257:sample(f,[[83,257],[97,792]]);
 const scale=sample(f,[[79,1],[81,.76],[83,1]]);
 return <svg width={77} height={118} viewBox="0 0 77 118" style={{position:'absolute',left:x,top:y,transform:`scale(${scale})`,transformOrigin:'50% 50%',zIndex:8}}><path d="M5 5 V103 L24 84 L38 114 L54 107 L41 78 L73 78 Z" fill="white" stroke="black" strokeWidth="5" strokeLinejoin="miter"/></svg>
}
const nativeLines=['在这段视频稿中，用@素材的方式锁','住所有的：人物造型、环境光线，人','物动作、声音节奏、画面构图等相关','的指定参考信息。'];
export function CalibratedN006({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*30,accent=overrides.accent??'#8554E8';
 const bg=sample(f,[[169,0],[170,3],[175,27],[180,52],[185,84],[190,115],[195,150],[200,185],[205,224],[210,255]]);
 const cards=Array.from({length:6},(_,i)=>{
  const launch=19+i*5,morph=24+i*5;const col=i%3,row=Math.floor(i/3);const cx=335+col*625,targetY=row?865:215;
  const fly=i===1||i===4?linear(f,launch,morph):sample(f,[[launch,0],[launch+1,.12],[launch+2,.32],[launch+3,.68],[launch+4,.88],[morph,1]]);
  const mp=sample(f,[[morph,0],[morph+1,.12],[morph+2,.32],[morph+3,.68],[morph+4,.88],[morph+5,1]]);
  const seed=sample(f,[[0,0],[5,194],[10,284],[15,314],[16,314],[19,304]]);
  const size=f<19?seed:304;
  const w=mix(size,500,mp),h=mix(size,400,mp);let x=mix(960,cx,fly)-w/2,y=mix(540,mix(targetY,row?790:290,mp),fly)-h/2;
  let width=w,height=h,r=mix(size/2,100,mp);
  if(i===0&&f>=83){const right=sample(f,[[83,585],[84,629],[85,676],[86,729],[87,789],[88,858],[89,939],[90,1040],[91,1167],[92,1321],[93,1475],[94,1602],[95,1703],[96,1785],[97,1854],[98,1913],[99,1964]]);const d=right-585;x=85-d*.15;y=90-d*.253;width=right-x;height=490+d*.586-y;r=100}
  return {x,y,width,height,r,visible:i===0||f>=launch,behind:i===0?3:2};
 });
 const titleX=sample(f,[[99,413],[105,412],[108,373],[110,307],[112,184],[115,61],[118,28],[120,21]]);
 const titleY=sample(f,[[99,410],[105,405],[108,369],[110,304],[112,181],[115,59],[118,23],[120,18]]);
 const titleH=sample(f,[[99,263],[105,261],[108,243],[110,210],[112,149],[115,89],[118,71],[120,69]]);
 const titleSize=titleH/0.905;
 const bodyLines=overrides.words?.[1]!==undefined?overrides.words[1].split('\n'):nativeLines;
 const full=bodyLines.join('');const reveal=[132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189];const count=reveal.filter(at=>f>=at).length;
 const fill=sample(f,[[159,255],[162,245],[165,227],[168,206],[171,189],[174,170],[177,148],[180,129],[183,114],[186,90],[189,70],[192,50],[195,33],[198,14],[201,0]]);const highlightProgress=linear(f,200,210);
 const ar=parseInt(accent.slice(1,3),16),ag=parseInt(accent.slice(3,5),16),ab=parseInt(accent.slice(5,7),16);
 const terms=overrides.highlightWords??['@素材','人物造型、','环境光线，','人物动作、','声音节奏、','画面构图'];
 const highlight=new Set<number>();for(const term of terms){let start=full.indexOf(term);while(start>=0){for(let j=0;j<term.length;j++)highlight.add(start+j);start=full.indexOf(term,start+term.length)}}
 let index=0;
 return <AbsoluteFill style={{background:'white'}}>
  <div style={{position:'absolute',inset:0,filter:`blur(${mix(0,9,linear(f,0,5))}px)`}}><EditorBackdrop/></div>
  {f>=19&&f<44&&<div style={{position:'absolute',left:808,top:388,width:304,height:304,borderRadius:152,background:black,boxShadow:'35px 28px 32px rgba(0,0,0,.43)',zIndex:1}}/>}
  {f<99&&cards.map((c,i)=>c.visible?<div key={i} style={{position:'absolute',left:c.x,top:c.y,width:c.width,height:c.height,borderRadius:c.r,background:black,boxShadow:'35px 28px 32px rgba(0,0,0,.43)',zIndex:c.behind}}/>:null)}
  {f>=99&&<AbsoluteFill style={{background:`rgb(${bg},${bg},${bg})`,zIndex:3}}/>}
  {f>=87&&<div style={{position:'absolute',left:titleX,top:titleY-titleSize*.08,fontFamily:DISPLAY,fontSize:titleSize,fontWeight:700,lineHeight:1,whiteSpace:'nowrap',color:accent,zIndex:5,opacity:linear(f,87,99),textShadow:f>170?shadow:undefined}}>{overrides.words?.[0]??'一、定义'}</div>}
  {f>=132&&<div style={{position:'absolute',left:76,top:266,zIndex:6,fontFamily:'MiSans',fontWeight:900,fontSize:108,lineHeight:'138px',letterSpacing:0,textShadow:f>170?shadow:undefined}}>{bodyLines.map((line,i)=><div key={i} style={{height:138,whiteSpace:'nowrap'}}>{Array.from(line).map((char,j)=>{const at=index++;return <span key={j} style={{fontFamily:char==='@'?'Arial':undefined,fontStyle:char==='@'?'italic':undefined,visibility:at<count?'visible':'hidden',color:highlight.has(at)?`rgb(${mix(fill,ar,highlightProgress)},${mix(fill,ag,highlightProgress)},${mix(fill,ab,highlightProgress)})`:`rgb(${fill},${fill},${fill})`}}>{char}</span>})}</div>)}</div>}
  <Cursor f={f}/>
 </AbsoluteFill>
}
