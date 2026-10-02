import React from 'react';
import {AbsoluteFill,Img,staticFile,interpolate,Easing,delayRender,continueRender,cancelRender} from 'remotion';
import manifest from '../manifest.json';
import {WorkBuddyBrandVisible} from './BrandVisibility';

const M=manifest.characterOpening, W=M.words, G=M.geometry, C=M.cues, P=M.palette;
const loadFonts=()=>Promise.all([
  new FontFace('EpisodeSans',`url(${staticFile(M.assets.font)})`,{weight:'600'}).load(),
  new FontFace('EpisodeSans',`url(${staticFile(M.assets.mediumFont)})`,{weight:'500'}).load(),
  new FontFace('MiSans',`url(${staticFile(M.assets.font)})`,{weight:'600'}).load(),
]).then(fonts=>fonts.forEach(font=>document.fonts.add(font)));
const move=(f:number,range:number[],from=0,to=1)=>interpolate(f,range,[from,to],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.22,1,.36,1)});
const box:React.CSSProperties={position:'absolute',background:P.paper,borderRadius:32,boxShadow:'0 12px 27px rgba(20,25,25,0.14),0 2px 7px rgba(20,25,25,0.045)',border:'1px solid #ededed'};
const textStyle:React.CSSProperties={fontWeight:600,lineHeight:1.15,whiteSpace:'nowrap',letterSpacing:0};
const Label:React.FC<{text:string;size:number;x:number;y:number;color?:string;progress?:number}>=({text,size,x,y,color=P.ink,progress=1})=><div style={{position:'absolute',left:x,top:y,overflow:'hidden',height:size*1.25,width:'max-content',maxWidth:1100}}><div style={{...textStyle,fontSize:size,color,transform:`translateY(${(1-progress)*115}%)`}}>{text}</div></div>;
const Brand:React.FC<{x:number;y:number;size?:number;dark?:boolean}>=({x,y,size=52,dark=false})=>{
 const visible=React.useContext(WorkBuddyBrandVisible);
 if(!visible)return null;
 return <div style={{position:'absolute',left:x,top:y,display:'flex',alignItems:'center',gap:size*.18,padding:dark?'10px 17px':'0',background:dark?'#181818':'transparent',borderRadius:23}}><Img src={staticFile(M.assets.logo)} style={{width:size,height:size,borderRadius:size*.22}}/><span style={{fontSize:size*.64,fontWeight:600,letterSpacing:-.7,color:dark?'#fff':P.ink}}>{W.brand}</span></div>;
};
const Lines:React.FC<{x:number;y:number;width:number;count?:number;gap?:number}>=({x,y,width,count=4,gap=22})=><div style={{position:'absolute',left:x,top:y}}>{Array.from({length:count},(_,i)=><div key={i} style={{height:i===0?13:8,width:width*(i===0?1:i%2===0?.73:.88),background:i===0?'#a8abaa':'#d9dcdb',marginBottom:gap-(i===0?13:8),borderRadius:2}}/>)}</div>;
const Heart=()=> <svg viewBox="0 0 64 64" width="62" height="62"><path d="M32 56C26 50 6 37 5 23C4 5 25 3 32 17C40 3 61 6 59 24C58 38 39 51 32 56Z" fill={P.heart}/></svg>;
const Comment=()=> <svg viewBox="0 0 64 64" width="53" height="53"><path d="M13 10H51Q57 10 57 17V42Q57 49 50 49H29L15 58V49H13Q7 49 7 42V17Q7 10 13 10Z" fill="none" stroke="#777f7c" strokeWidth="4.5" strokeLinejoin="round"/><path d="M19 24H45M19 35H38" stroke="#777f7c" strokeWidth="4" strokeLinecap="round"/></svg>;

const Courseware:React.FC<{frame:number}>=({frame:f})=>{
 const expansion=move(f,C.expand),compact=move(f,C.compact),engage=move(f,C.engagement);
 const b=G.bundle;
 const x=interpolate(compact,[0,1],[interpolate(expansion,[0,1],[b.firstX,b.x]),b.compactX]);
 const y=interpolate(compact,[0,1],[interpolate(expansion,[0,1],[b.firstY,b.y]),b.compactY]);
 const exit=move(f,C.stackExit),scale=interpolate(compact,[0,1],[1,b.compactScale])*(1-.22*exit);
 const h=interpolate(expansion,[0,1],[b.firstH,b.h]);
 if(exit===1)return null;
 return <div style={{position:'absolute',left:x-950*exit,top:y,width:b.w,height:h,transform:`scale(${scale})`,transformOrigin:'0 0'}}>
   {expansion>0&&<>
    <div style={{...box,left:-105*expansion,top:48*expansion,width:342,height:462,transform:`rotate(${-8*expansion}deg)`}}>
     <div style={{position:'absolute',left:40,top:46,width:253,height:164,background:P.orange,borderRadius:13}}/>
     <Lines x={40} y={242} width={230} count={8}/>
    </div>
    <div style={{...box,left:372*expansion,top:70*expansion,width:435,height:420,transform:`rotate(${8*expansion}deg)`}}><Lines x={35} y={42} width={350} count={4}/><div style={{position:'absolute',left:35,top:162,width:350,height:200,background:'#f3f4f3',borderRadius:13}}><Lines x={23} y={25} width={270} count={6}/></div></div>
    <div style={{...box,left:242*expansion,top:36*expansion,width:298,height:480}}><Lines x={33} y={55} width={225} count={9}/></div>
   </>}
   {compact<1&&<div style={{position:'absolute',left:0,top:-150,width:430,height:150,clipPath:`inset(0 0 ${compact*100}% 0)`}}><Brand x={38*expansion} y={20+48*expansion} size={52}/></div>}
   <div style={{...box,left:0,top:0,width:b.w,height:h}}>
    <Label text={W.previous} x={48} y={45} size={49}/>
    <Label text={W.courseware} x={48} y={110} size={75}/>
    <div style={{position:'absolute',left:50,top:205,width:318,height:29+expansion*20,borderRadius:12,background:'#f0f1f0',boxShadow:expansion>.5?'0 3px 6px #00000013':'none',overflow:'hidden'}}>
     {expansion>.4&&<div style={{display:'flex',alignItems:'center',gap:17,padding:'8px 12px',fontSize:21,fontWeight:500,whiteSpace:'nowrap',transform:`translateY(${(1-expansion)*75}px)`}}>{W.courseware}<span style={{color:'#929793'}}>→</span>{W.popular}</div>}
    </div>
    {expansion>.2&&<div style={{...box,left:155,top:273,width:241,height:218,borderRadius:19,transform:`translateY(${(1-expansion)*190}px)`,overflow:'hidden'}}><Lines x={22} y={22} width={185} count={2}/><div style={{position:'absolute',top:83,left:22,width:174,height:10,background:P.orange,borderRadius:3}}/><div style={{position:'absolute',top:115,left:22,width:193,height:60,border:'1px solid #ddd',borderRadius:8}}><Lines x={12} y={16} width={153} count={2} gap={20}/></div><Lines x={22} y={191} width={178} count={1}/></div>}
   </div>
   {f>=C.engagement[0]&&<div style={{...box,left:374+130*(1-engage),top:112+145*(1-engage),width:380,height:374,transform:`scale(${.85+.15*engage})`,transformOrigin:'center',overflow:'hidden'}}>
    <Label text={W.popular} x={28} y={35} size={60} progress={move(f,C.popular)}/>
    <div style={{position:'absolute',left:32,top:139,display:'flex',alignItems:'center',gap:20}}><Heart/><div><div style={{fontSize:37,fontWeight:600,lineHeight:1.1}}>{M.engagement.likes??M.engagement.unconfirmedDisplay}</div><div style={{fontSize:21,color:'#898e8b',marginTop:6}}>{W.likes}</div></div></div>
    <div style={{position:'absolute',left:29,top:241,width:320,height:102,background:'#f5f6f5',borderRadius:15,display:'flex',alignItems:'center',gap:24,padding:'0 15px',boxSizing:'border-box'}}><Comment/><div><div style={{fontSize:34,fontWeight:600,lineHeight:1}}>{M.engagement.comments??M.engagement.unconfirmedDisplay}</div><div style={{fontSize:20,color:'#898e8b',marginTop:7}}>{W.comments}</div></div></div>
   </div>}
 </div>;
};

const Foreground:React.FC<{frame:number;handoff:number}>=({frame:f,handoff})=>{
 const q=G.comment,original=G.final,enter=move(f,C.commentEnter),wipe=move(f,C.titleWipe);
 const p=handoff*handoff*(3-2*handoff);
 const t={x:original.x+(362.6666666667-original.x)*p,y:original.y+(213.3333333333-original.y)*p,w:original.w+(586.6666666667-original.w)*p,h:original.h+(362.6666666667-original.h)*p};
 const leave=move(handoff,[0,.48]);
 return <>
  {f>=C.commentEnter[0]&&f<C.titleWipe[1]&&<div style={{...box,left:q.x+(t.x-q.x)*wipe,top:q.y+(t.y-q.y)*wipe+70*(1-enter),width:q.w,height:q.h+(t.h-q.h)*wipe,transform:`scale(${.9+.1*enter})`,transformOrigin:'55% 50%',overflow:'hidden',clipPath:wipe>0?`inset(-45px ${wipe*100}% -45px -45px round 32px)`:'none'}}>
   <div style={{position:'absolute',left:43,top:50,width:79,height:79,borderRadius:'50%',background:'#b9bcba'}}/>
   <Label text={W.comment} x={143} y={54} size={49} progress={enter}/>
   <Label text={W.question} x={143} y={125} size={60} progress={move(f,C.question)}/>
  </div>}
  {f>=C.titleWipe[0]&&<div style={{position:'absolute',left:t.x,top:t.y,width:t.w,height:t.h,clipPath: f<C.titleWipe[1]?`inset(-70px 0 -45px ${(1-wipe)*100}% round 32px)`:'none'}}>
   <div style={{...box,left:0,top:0,width:t.w,height:t.h,borderRadius:32+(34.1333333333-32)*p,background:`rgb(${5+4*p},${5+4*p},${5+4*p})`,border:'none',boxShadow:`0 15px 25px rgba(0,0,0,${.075*(1-p)})`}}/>
   <div style={{position:'absolute',inset:'-70px 0 0',clipPath:`inset(0 0 ${leave*100}% 0)`,transform:`translateY(${-35*leave}px)`}}><div style={{position:'absolute',left:0,top:70}}>
   <div style={{position:'absolute',left:45,top:-38,width:390,height:98,transform:`translateY(${(1-move(f,C.titleText))*65}px)`,clipPath:'inset(0)'}}><Brand x={0} y={0} size={72} dark/></div>
   <Label text={W.topic} x={49} y={76} size={118} color="#fff" progress={move(f,C.titleText)}/>
   <div style={{position:'absolute',left:52,top:220,width:546*move(f,C.arrival),height:3,background:'#2d302e'}}/>
   <Label text={W.arrival} x={51} y={243} size={66} color="#fff" progress={move(f,C.arrival)}/>
   </div></div>
  </div>}
 </>;
};

export const WorkBuddyOpening:React.FC<{frame:number;handoff?:number}>=({frame:f,handoff=0})=>{
 const [fontReady]=React.useState(()=>delayRender('Opening component fonts'));
 React.useEffect(()=>{loadFonts().then(()=>continueRender(fontReady)).catch(cancelRender);},[fontReady]);
 const entry=move(f,C.characterEnter),exit=move(handoff,[0,.9]);
 const characterFrame=Math.min(C.characterFreeze,Math.max(1,Math.floor(f-C.characterStart+C.characterTrim)+1));
 return <AbsoluteFill style={{background:P.background,fontFamily:'EpisodeSans',color:P.ink}}>
  <div style={{position:'absolute',left:M.stage.offsetX,top:0,width:M.stage.width,height:M.stage.height,transform:`scale(${M.stage.scale})`,transformOrigin:'0 0'}}>
   <Courseware frame={f}/>
   <Foreground frame={f} handoff={handoff}/>
   {f>=C.characterEnter[0]&&exit<1&&<Img src={staticFile(`${M.assets.character}/${String(characterFrame).padStart(4,'0')}.png`)} style={{position:'absolute',left:G.character.x-115*(1-entry)-850*exit,top:G.character.y,width:G.character.w,height:G.character.w,clipPath:`inset(0 0 0 ${100*(1-entry)}%)`}}/>}
  </div>
 </AbsoluteFill>;
};
