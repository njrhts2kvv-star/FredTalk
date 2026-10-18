// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,interpolate,Easing} from 'remotion';
type Overrides={words?:string[];accent?:string;assets?:Record<string,string>};
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
  const count=Math.min(chars.length,Math.floor(Math.max(0,f-a)/2)+1);
  // Successive queue steps act on the entire older line, preserving the source's cumulative rotation.
  let ma=1,mb=0,mc=0,md=1,me=0,mf=0;
  for(let k=i;k<Math.min(5,labels.length-1);k++){
   const q=f-(44+k*38);if(q<0)continue;
   const motion=i===2&&k===2?longQueueMotion:queueMotion;
   const rad=sample(q,motion.map(row=>[row[0],row[1]]))*Math.PI/180;const scale=sample(q,motion.map(row=>[row[0],row[2]]));const c=Math.cos(rad)*scale,s=Math.sin(rad)*scale,tx=sample(q,motion.map(row=>[row[0],row[3]])),ty=sample(q,motion.map(row=>[row[0],row[4]]));
   [ma,mb,mc,md,me,mf]=[c*ma-s*mb,s*ma+c*mb,c*mc-s*md,s*mc+c*md,c*me-s*mf+tx,s*me+c*mf+ty];
  }
  const moved=linear(f,44+i*38,56+i*38);const x=i===2?52:32;
  return <div key={i} style={{position:'absolute',inset:0,transform:`matrix(${ma},${mb},${mc},${md},${me},${mf})`,transformOrigin:'0 0'}}>

   <div style={{position:'absolute',left:x,top:410,fontFamily:DISPLAY,fontWeight:700,fontSize:138,lineHeight:1,whiteSpace:'nowrap',color:`rgb(${Math.round(70*moved)},${Math.round(70*moved)},${Math.round(70*moved)})`,textShadow:'none'}}>{chars.slice(0,count).join('')}{f>=a+23&&<span style={{color:accent}}>？</span>}</div>
   {f<a+23&&<div style={{position:'absolute',left:x+(count===0?66:count*167+10),top:448,width:78,height:176,background:'#fff'}}/>}
  </div>;
 })}
 </AbsoluteFill>;
}
