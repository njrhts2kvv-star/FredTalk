import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Media, mix, progress, rect} from '../common';
import assets from '../assets.json';
import {Batch1} from '../library/retained-scenes/src/batch1';
import {AssetsV8} from './MajorRevisionV8';
import {PLAYBACK_BOX_V7, PlaybackWindowV7, PixelCrop} from './MediaRevisionV7';

type Box=[number,number,number,number];
const source=(id:string)=>(assets as Record<string,{src:string}>)[id].src;
const place=(a:Box,b:Box,t:number)=>a.map((v,i)=>mix(v,b[i],t)) as Box;
function Window({children}:{children:React.ReactNode}){
 return <AbsoluteFill style={{background:'#fff'}}><PlaybackWindowV7><div style={{...rect(0,0,1920,1080),transform:`scale(${PLAYBACK_BOX_V7[2]/1920})`,transformOrigin:'top left',overflow:'hidden'}}>{children}</div></PlaybackWindowV7></AbsoluteFill>;
}
function Context({scene=false,dim=.45,blur=0}:{scene?:boolean;dim?:number;blur?:number}){
 return <><Img src={staticFile(scene?source('scene-canvas-v7'):'stills/characters.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',filter:`blur(${blur}px)`,transform:blur?'scale(1.035)':'none'}}/><AbsoluteFill style={{background:'#000',opacity:dim}}/></>;
}
function Tag({text,x,y,w=290}:{text:string;x:number;y:number;w?:number}){
 return <div style={{...rect(x,y,w,67),borderRadius:17,background:'#080808',color:'#fff',fontSize:42,fontWeight:900,textAlign:'center',lineHeight:'67px'}}>{text}</div>;
}
function Photo({id,file,box,focus=false}:{id?:string;file?:string;box:Box;focus?:boolean}){
 return <div style={{...rect(...box),borderRadius:24,overflow:'hidden',outline:focus?'5px solid #BDA0FF':'none',boxShadow:focus?'0 0 22px #8554e877':'none'}}>{id?<Media id={id} style={{objectFit:'cover'}}/>:<Img src={staticFile(file!)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}</div>;
}

/** Fred's supplied S07 nine-grid: authentic canvas remains the shared context. */
export function AssetsReferenceV8({frame:f}:{frame:number}){
 // Preserve the earlier recording and B011 character/prop grouping revisions.
 if(f<660||f>=1940||(f>=1368&&f<1540))return <AssetsV8 frame={f}/>;
 if(f<900){
  const q=progress(f,660,710),pair=progress(f,755,800),out=progress(f,865,900);
  const a=place([150,310,284,203],[280,140,400,650],q*(1-out));
  const b=place([1280,636,278,207],[790,140,400,650],pair*(1-out));
  return <Window><Context dim={.25+q*.32}/>
   <Photo id="tan-single" box={a} focus/>
   {pair>0&&<div style={{...rect(...b),borderRadius:24,overflow:'hidden',outline:'5px solid #BDA0FF',boxShadow:'0 0 22px #8554e877'}}><PixelCrop file="v8-generated/hammer-wide-v8.png" roi={[70,0,395,941]} native={[1672,941]} box={[0,0,b[2],b[3]]}/></div>}
   <div style={{opacity:q*(1-out)}}><Tag text="谭警官" x={a[0]+55} y={a[1]+a[3]-20}/></div>
   <div style={{opacity:pair*(1-out)}}><Tag text="红绿灯武器" x={b[0]+35} y={b[1]+b[3]-20} w={330}/></div>
  </Window>;
 }
 if(f<1368){
  const bindings:Record<string,string>={};
  const names=['v8-generated/tan-character-wide-v8.png','v8-proof/tan-shot-0.jpg','v8-proof/tan-shot-1.jpg','v8-proof/tan-shot-2.jpg'];
  for(let i=0;i<4;i++)for(let state=0;state<3;state++)bindings[`grid-11-${i}-${state}`]=names[i];
  return <Window><Context dim={.50} blur={12}/><Batch1 number={11} t={Math.min(6.08,(f-900)/60*2)} duration={14} overrides={{assets:bindings,words:[],background:'transparent',ink:'#fff',accent:'#8554e8'}}/></Window>;
 }
 const ids=['scene-e04','scene-e02','scene-e01'];
 const words=['巷口场景','货车场景','高架路场景'];
 const nodes:Box[]=[[355,190,250,145],[680,190,250,145],[1005,190,250,145]];
 const group:Box[]=[[70,250,560,315],[680,250,560,315],[1290,250,560,315]];
 const inspection:Box[]=[[1490,175,345,194],[1490,475,345,194],[270,135,1150,647]];
 const enter=progress(f,1540,1580),focus=progress(f,1661,1700),back=progress(f,1852,1940);
 return <Window><Context scene dim={(1-back)*.55}/>
  {ids.map((id,i)=>{
   const box=place(nodes[i],place(group[i],inspection[i],focus),enter*(1-back));
   return <React.Fragment key={id}><Photo id={id} box={box} focus={i===2&&focus>.5}/><div style={{opacity:enter*(1-back)}}><Tag text={words[i]} x={box[0]+(box[2]-290)/2} y={box[1]+box[3]-10}/></div></React.Fragment>;
  })}
 </Window>;
}
