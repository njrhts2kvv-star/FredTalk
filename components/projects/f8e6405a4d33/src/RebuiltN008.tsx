import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../surface-purple.ts";
import React from 'react';
import {AbsoluteFill,Img,interpolate,staticFile} from 'remotion';
import type {Overrides} from './index';
import cues from './timelines/N008.json';
const sample=(f:number,p:number[][])=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ramp=(f:number,a:number,b:number)=>Math.max(0,Math.min(1,(f-a)/(b-a)));
// The source is 60 fps. Window entry intentionally holds paired source frames;
// product travel, glyph rolling and result spread have independent timelines.
export function RebuiltN008({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=t*60,accent=overrides.accent??'#8554E8',w=overrides.words??[];
 const product=staticFile(overrides.assets?.product??'group-a/fred-product.png');
 const productX=f<364?sample(f,cues.productEntry):sample(f,cues.productExit);
 const windowX=sample(f,cues.window),spread=sample(f,cues.resultsSpread);
 const productImage=(style:React.CSSProperties={})=><Img src={product} style={{width:'100%',height:'100%',objectFit:'contain',filter:'grayscale(1)',mixBlendMode:'multiply',...style}}/>;
 return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans',fontWeight:900}}>
  {f<411&&<div style={{position:'absolute',left:productX,top:275,width:460,height:518,opacity:sample(f,cues.productOpacity)}}>{productImage()}</div>}
  {f>=48&&f<255&&<div style={{position:'absolute',left:windowX,top:99,width:843,height:906,background:'#202325',borderRadius:30,overflow:'hidden',boxShadow:'22px 20px 22px #0004'}}>
   <div style={{height:82,background:'#151718',display:'flex',alignItems:'center',gap:18,paddingLeft:32}}>{[accent,'#96969b','#e5e5e8'].map((c,i)=><div key={i} style={{width:24,height:24,borderRadius:30,background:c}}/>)}</div>
   {['讲给谁？','怎么讲？','重点是？'].map((label,i)=><div key={i} style={{position:'absolute',left:150,top:163+i*232,fontSize:138,lineHeight:1,letterSpacing:14,whiteSpace:'nowrap',color:i===0?'white':purpleOnDark(accent),opacity:sample(f,cues.questionAlpha[i])}}>{w[i]??label}</div>)}
  </div>}
  {['内容研究员','撰稿师','设计师'].map((label,i)=>{
   const start=[260,292,322][i],age=f-start;if(age<0||f>391)return null;
   const words=Array.from(w[i+3]??label),left=[931,803,1330][i],top=[324,635,635][i];
   return <div key={i} style={{position:'absolute',left,top,width:i===0?700:440,height:170,whiteSpace:'nowrap',fontSize:138,lineHeight:1,color:accent,opacity:(1-ramp(f,366,391)),textShadow:'2px 4px 1px #16141955'}}>
    {words.map((char,j)=>{const a=age-j*.24,settle=ramp(a,0,20),y=settle<1?Math.sin(a*1.17)*28*(1-settle):0;return <span key={j} style={{display:'inline-block',position:'relative',opacity:ramp(a,0,9),transform:`translateY(${y}px) scaleY(${.83+.17*settle})`,filter:`blur(${(1-settle)*3.5}px)`}}>{char}{a>5&&a<17&&<span style={{position:'absolute',left:0,top:y>0?-100:100,opacity:(1-settle)*.6}}>{char}</span>}</span>})}
   </div>;
  })}
  {f>=416&&Array.from({length:4},(_,i)=>{
   const endX=[338,1145,338,1145][i],endY=[45,45,599,599][i],s=.90+.10*spread;
   return <div key={i} style={{position:'absolute',left:741+(endX-741)*spread,top:321+(endY-321)*spread,width:438,height:438,transform:`scale(${s})`,opacity:ramp(f,416,435),borderRadius:20,overflow:'hidden',background:i%2?'#f1f0f4':'#161618',boxShadow:'24px 12px 22px #0006',color:i%2?'#171719':'white'}}>
    <div style={{position:'absolute',top:20,left:20,right:20,fontSize:21,textAlign:'center',fontWeight:700}}>{w[i+6]??['灵感，随时记录','清晰表达每个想法','让创作保持专注','Fred · 为表达而生'][i]}</div>
    <div style={{position:'absolute',left:i===3?45:58,top:i===3?65:80,width:i===3?385:322,height:i===3?385:320,transform:`rotate(${[0,-13,13,-22][i]}deg)`}}>{productImage({mixBlendMode:i%2?'multiply':'normal',borderRadius:'50%'})}</div>
   </div>;
  })}
 </AbsoluteFill>;
}
