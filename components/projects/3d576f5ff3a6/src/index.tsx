import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,Composition,registerRoot,delayRender,continueRender,cancelRender} from 'remotion';

const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const ease=(t:number,a:number,d:number)=>{const x=clamp((t-a)/d);return 1-Math.pow(1-x,3)};
const mix=(a:number,b:number,v:number)=>a+(b-a)*v;
const looks=Array.from({length:6},(_,i)=>`reference/look-${i+1}.jpg`);

const picture=(file:string,x:number,y:number,w:number,h:number,style:React.CSSProperties={})=><Img src={staticFile(file)} style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:22,objectFit:'cover',boxShadow:'8px 10px 15px #0006',...style}}/>;
const windowFrame=(top:number,children:React.ReactNode)=><div style={{position:'absolute',left:200,top,width:1520,height:990,borderRadius:28,background:'#202426',boxShadow:'13px 17px 20px #0005',overflow:'hidden'}}><div style={{height:75,background:'#121617',display:'flex',gap:18,paddingLeft:64,alignItems:'center'}}>{['#e40091','#ffbf50','#318cff'].map(c=><div key={c} style={{width:19,height:19,background:c,borderRadius:12}}/>)}</div>{children}</div>;

function B072(){
 const f=useCurrentFrame(),t=f/60;
 const [handle]=useState(()=>delayRender('B072 MiSans'));
 useEffect(()=>{new FontFace('B072UI',`url(${staticFile('font-candidates/MiSans-Regular.otf')})`).load().then(face=>{document.fonts.add(face);continueRender(handle)}).catch(cancelRender)},[handle]);
 const enter=ease(t,.08,.35),exit=ease(t,16.42,.38),input=ease(t,.43,.4),left=ease(t,1.35,.4);
 const focus=ease(t,6.28,.42)*(1-ease(t,14.65,.36));
 const swap=ease(t,10.96,.56),next=ease(t,16.92,.35);
 const lensOpacity=focus*ease(t,7.7,.4)*(1-ease(t,10.72,.28));
 const grid=<>
  {picture('reference/input.jpg',mix(510,175,left),mix(1050,96,input),410,728)}
  {looks.map((src,i)=>picture(src,740+(i%3)*218,mix(i<3?-430:1050,96+Math.floor(i/3)*380,ease(t,1.82+i*.12,.38)),178,318))}
  {t>=3.5&&t<4.8&&<div style={{position:'absolute',left:650,top:855,width:400,height:80,background:'#328bff',borderRadius:24,color:'white',fontSize:44,fontWeight:800,display:'grid',placeItems:'center',transform:`scale(${ease(t,3.5,.2)})`}}>开始制作</div>}
 </>;
 return <AbsoluteFill style={{background:'#fff',fontFamily:'B072UI',overflow:'hidden'}}>
  <div style={{filter:`blur(${focus*14}px)`}}>{windowFrame(mix(1150,48,enter)+1150*exit,grid)}</div>
  {focus>0&&<>
   <div style={{position:'absolute',inset:0,background:`rgba(255,255,255,${.12*focus})`}}/>
   {[0,1].map(row=><div key={row} style={{position:'absolute',inset:0,opacity:focus,transform:`translateY(${row===0?-1100*swap:1100*(1-swap)}px)`}}>{[0,1,2].map(i=>picture(looks[i+row*3],125+i*594,120+row*100,480,850))}{row===0&&lensOpacity>0&&[0,1,2].map(i=><div key={`lens-${i}`} style={{position:'absolute',left:158+i*594,top:456,width:438,height:438,border:'2px solid #343434',borderRadius:'50%',overflow:'hidden',opacity:lensOpacity,boxSizing:'border-box',boxShadow:'0 1px 2px #0004'}}><Img src={staticFile(looks[i])} style={{position:'absolute',left:-33,top:-336,width:480,height:850,objectFit:'cover',transform:'scale(1.12)',transformOrigin:'240px 600px'}}/></div>)}</div>)}
  </>}
  {t>=16.92&&windowFrame(mix(1150,48,next),picture('reference/end-card.jpg',565,mix(1050,95,ease(t,17.18,.35)),410,728))}
 </AbsoluteFill>;
}

registerRoot(()=><Composition id="B072" component={B072} width={1920} height={1080} fps={60} durationInFrames={1080}/>);
