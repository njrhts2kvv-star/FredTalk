import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, interpolate, Easing} from 'remotion';
import x003 from './timelines/X003.json';
import x008 from './timelines/X008.json';
import x009 from './timelines/X009.json';
import x025 from './timelines/X025.json';
import x027 from './timelines/X027.json';
import b008 from './timelines/B008.json';
import t01 from './timelines/T01.json';
import t03 from './timelines/T03.json';
import r007 from './timelines/R007.json';
import b062 from './timelines/B062.json';
import native from './x-native-b.json';
import rising from './N049-motion.json';
import comparison from './N023-motion.json';

export const INK = '#111114';
export const ACCENT = '#8554E8';
export const LIGHT = '#D6BEFF';
export const clamp = (v:number) => Math.min(1, Math.max(0,v));
export const mix = (a:number,b:number,p:number) => a+(b-a)*p;
export const phase = (t:number,a:number,b:number) => interpolate(t,[a,b],[0,1],{
  easing:Easing.bezier(.22,1,.36,1),extrapolateLeft:'clamp',extrapolateRight:'clamp',
});
const sample = (f:number, rows:readonly (readonly number[])[], col=1) => interpolate(f,
  rows.map(r=>r[0]),rows.map(r=>r[col]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const track = (spec:unknown, name:string, f:number) => {
  const rows=(spec as {tracks:Record<string,{samples:number[][]}>}).tracks[name].samples;
  return rows[0].slice(1).map((_,i)=>sample(f,rows,i+1));
};
const measuredWidth = (s:string) => [...s].reduce((n,c)=>n+(/[\u0000-\u00ff]/.test(c)?.58:1),0);
export const fitSize = (s:string,width:number,cap=134) => Math.min(cap,width/Math.max(1,measuredWidth(s)));
export const textStyle:React.CSSProperties = {fontFamily:'MiSans',fontWeight:700,letterSpacing:0,fontSynthesis:'none'};

export function Media({src,fit='contain',rate=1,start=0,style={}}:{src:string;fit?:'contain'|'cover';rate?:number;start?:number;style?:React.CSSProperties}){
  const css:React.CSSProperties={width:'100%',height:'100%',objectFit:fit,...style};
  return /\.(mp4|webm)$/.test(src)
    ? <OffthreadVideo src={staticFile('media/'+src)} muted playbackRate={rate} startFrom={start} style={css}/>
    : <Img src={staticFile('media/'+src)} style={css}/>;
}

// R007's centered media-window takeover, with the source playing in one persistent node.
export function MediaWindow({children,t=3,full=false,zoom=1,origin='50% 50%',dark=false}:{children:React.ReactNode;t?:number;full?:boolean;zoom?:number;origin?:string;dark?:boolean}){
  const enter=phase(t,0,.56),p=full?1:enter;
  const [rx,ry,rw,rh]=track(r007,'window',t*60);
  const w=full?1920:rw,h=full?1080:Math.min(870,rh);
  return <AbsoluteFill style={{background:dark?INK:'#fff'}}><div style={{position:'absolute',left:full?0:rx,top:full?0:Math.min(ry,42),width:w,height:h,
    borderRadius:full?0:mix(38,28,p),overflow:'hidden',boxShadow:full?undefined:'18px 20px 35px #0003',
    opacity:mix(.55,1,enter),transform:`translateY(${(1-enter)*65}px)`}}>
    <div style={{width:'100%',height:'100%',transform:`scale(${zoom})`,transformOrigin:origin}}>{children}</div>
  </div></AbsoluteFill>;
}

// B008: preserve black enclosure and internal-camera relationship, remove all sample UI.
export function WorkbenchWindow({children,t,camera=1,origin='50% 50%'}:{children:React.ReactNode;t:number;camera?:number;origin?:string}){
  const [sx,sy,sw,sh]=track(b008,'window',Math.min(140,t*60));
  const nativeCamera=track(b008,'camera',t*60);
  const p=phase(t,0,.6),width=mix(1900,1770,p),height=mix(1060,880,p);
  const zoom=camera+(nativeCamera[0]-1)*.06;
  return <AbsoluteFill style={{background:'#fff'}}><div style={{position:'absolute',left:mix(10,(1920-width)/2,p),top:mix(0,35,p),width,height,
    background:'#151515',borderRadius:mix(0,22,p),overflow:'hidden',boxShadow:'20px 21px 30px #0003',
    transform:`perspective(3000px) rotateX(${(1-p)*8}deg)`}}>
    <div style={{height:48,display:'flex',gap:12,paddingLeft:28,alignItems:'center'}}>{['#d32a91','#ffba35','#487eff'].map(c=><i key={c} style={{width:12,height:12,borderRadius:'50%',background:c}}/>)}</div>
    <div style={{position:'absolute',left:10,right:10,top:48*sh/1008,bottom:10,overflow:'hidden',borderRadius:12,background:'#fff'}}>
      <div style={{width:'100%',height:'100%',transform:`translate(${nativeCamera[1]*.014}px,${nativeCamera[2]*.014}px) scale(${zoom})`,transformOrigin:origin}}>{children}</div>
    </div>
  </div></AbsoluteFill>;
}

export function FocusLayer({t,at,until=99,children,dark=false,opacity=.8}:{t:number;at:number;until?:number;children?:React.ReactNode;dark?:boolean;opacity?:number}){
  const p=phase(t,at,at+.5)*(1-phase(t,until,until+.4));
  return <AbsoluteFill style={{pointerEvents:'none',opacity:p,background:dark?`rgba(15,15,18,${opacity})`:`rgba(255,255,255,${opacity})`,backdropFilter:`blur(${p*18}px)`}}>{children}</AbsoluteFill>;
}

// X003 native circle -> long capsule -> letter reveal, recentered for this episode's words.
export function X003Capsule({text,t,at=0,y=410,width=1560,cap=126,color=LIGHT,centerRevealedPrefix}:{text:string;t:number;at?:number;y?:number;width?:number;cap?:number;color?:string;centerRevealedPrefix?:string}){
  const f=Math.min(180,Math.max(0,(t-at)*50)),w0=sample(f,x003.shell,3),h=sample(f,x003.shell,4)*1.5;
  const w=w0/1124*width,opacity=t<at?0:1;
  const font=fitSize(text,width-110,cap),chars=[...text];
  const glyphs=chars.map((c,i)=>{
    const slot=Math.min(x003.letterStarts.length-1,Math.floor(i/chars.length*x003.letterStarts.length));
    return <span key={i} style={{opacity:phase(f,x003.letterStarts[slot],x003.letterStarts[slot]+8)}}>{c}</span>;
  });
  const prefixLength=centerRevealedPrefix&&text.startsWith(centerRevealedPrefix)?[...centerRevealedPrefix].length:0;
  const prefixShift=f<=114?50:50*(1-clamp((w0-778)/(1124-778)));
  return <div data-component='X003' style={{position:'absolute',left:(1920-w)/2,top:y-h/2,width:w,height:h,borderRadius:sample(f,x003.radius),background:INK,
    opacity,boxShadow:'25px 22px 24px #0004',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
    <div data-qc-text style={{...textStyle,fontSize:font,lineHeight:1.18,color,whiteSpace:'nowrap',...(prefixLength?{position:'relative'}:{})}}>{prefixLength?<>
      <span aria-hidden style={{visibility:'hidden'}}>{text}</span>
      {/* Paired percentages use actual glyph widths, avoiding font-metric guesses. */}
      <div style={{position:'absolute',left:0,top:0,width:'100%',transform:`translateX(${prefixShift}%)`}}>
        <span style={{position:'relative',display:'inline-block',transform:`translateX(${-prefixShift}%)`}}>
          <span>{glyphs.slice(0,prefixLength)}</span>
          <span style={{position:'absolute',left:'100%',top:0}}>{glyphs.slice(prefixLength)}</span>
        </span>
      </div>
    </>:glyphs}</div>
  </div>;
}

// T03 uses the measured circle/pill and per-glyph tracks. Reading tail is held, not looped.
export function DotCapsule({text,t,at=0,y=438,color=LIGHT,cap=124}:{text:string;t:number;at?:number;y?:number;color?:string;cap?:number}){
  const f=Math.max(0,(t-at)*82),[x,ny,w,h,r]=track(t03,'pill',f),chars=[...text];
  const top=y-h/2;
  return <div data-component='T03' style={{position:'absolute',left:x,top,width:w,height:h,opacity:t<at?0:1,
    borderRadius:r,background:INK,boxShadow:'25px 21px 25px #0004',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
    <div data-qc-text style={{...textStyle,fontSize:fitSize(text,Math.max(0,w-130),cap),lineHeight:1.18,color,whiteSpace:'nowrap'}}>{chars.map((c,i)=><span key={i} style={{opacity:clamp(track(t03,`glyph${Math.min(7,Math.floor(i*8/chars.length))}`,f)[0])}}>{c}</span>)}</div>
  </div>;
}

// X008's second pill grows behind the first and takes over its reading position.
export function LayeredCapsules({texts,t,at=0,swap=3,y=430}:{texts:[string,string];t:number;at?:number;swap?:number;y?:number}){
  const f=t<swap?Math.min(120,41+Math.max(0,t-at)*76):Math.min(275,120+Math.max(0,t-swap)*100);
  const val=(rows:number[][],col:number)=>sample(f,rows,col);
  const curves=x008.curves as Record<string,number[][]>;
  return <AbsoluteFill data-component='X008'>
    {[0,1].map(i=>{
      const rows=i===0?x008.firstShell:x008.secondShell;
      if((i===0&&f>=281)||(i===1&&f<205))return null;
      const x=val(rows,1),ny=val(rows,2),w=val(rows,3),h=val(rows,4),radius=val(rows,5);
      const top=i===0?(ny-373)*.46+y-167:(ny-318)*.5+y-60;
      return <div key={i} style={{position:'absolute',left:x,top,width:w,height:h,borderRadius:radius,background:INK,
        boxShadow:'25px 20px 25px #0004',zIndex:i===1&&f>=276?3:2,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        <span data-qc-text style={{...textStyle,fontSize:fitSize(texts[i],Math.max(0,w-110),130),lineHeight:1.18,whiteSpace:'nowrap',color:LIGHT}}>{[...texts[i]].map((c,j,chars)=>{
          const slot=Math.min(i===0?5:6,Math.floor(j/chars.length*(i===0?6:7)));
          const alpha=i===0?sample(f,curves[`firstIn${slot}`])*sample(f,curves[`firstOut${slot}`]):sample(f,curves[`second${slot}`]);
          return <span key={j} style={{opacity:clamp(alpha)}}>{c}</span>;
        })}</span>
      </div>;
    })}
  </AbsoluteFill>;
}

// N049's staggered upward headline motion; real media replaces the original sample home page.
export function RisingTitle({lines,t,at=0,dark=false,cap=145,exit=99}:{lines:string[];t:number;at?:number;dark?:boolean;cap?:number;exit?:number}){
  const index=Math.min(76,Math.max(0,Math.round((t-at)*90)));
  const m=rising[index],p=phase(t,at,at+.4),leave=phase(t,exit,exit+.4);
  return <AbsoluteFill data-component='N049' style={{opacity:p*(1-leave),transform:`translateY(${-leave*220}px)`}}>
    {lines.map((line,i)=>{
      const nativeY=(m.wordsY[i%2]-444)*.38;
      return <div key={i} data-qc-text style={{...textStyle,position:'absolute',left:140,width:1640,top:240+i*230+nativeY,
        fontFamily:'SourceHanHeavy',fontWeight:900,fontSize:fitSize(line,1590,cap),lineHeight:1.16,textAlign:'center',color:i===0?(dark?'white':INK):(dark?LIGHT:ACCENT),
        opacity:phase(t,at+i*.3,at+i*.3+.35),textShadow:dark?'6px 8px 7px #0006':'6px 8px 7px #0002'}}>{line}</div>;
    })}
  </AbsoluteFill>;
}

// X025: same real paper, same ROI and measured source camera pulse during focus.
export function ReadingEmail({t,focus='quota',carry=false}:{t:number;focus?:'quota'|'credits'|'dot';carry?:boolean}){
  const p=carry?1:phase(t,0,.68),roi=focus==='credits'?616:focus==='dot'?909:482;
  const measured=x025.frames[Math.min(x025.frames.length-1,Math.max(0,Math.round(t*60)))];
  const width=mix(580,1450,p),scale=width/828,top=mix(20,154,p),scroll=roi*p;
  const highlight=phase(t,1.2,2.2);
  const ranges=focus==='credits'?[[540,676,187,23]]:focus==='dot'?[[41,1038,690,22]]:[[41,516,730,23]];
  return <AbsoluteFill data-component='X025' style={{background:'#fff'}}>
    <div style={{position:'absolute',left:(1920-width)/2,top,width,height:carry?790:mix(838,720,p),overflow:'hidden',borderRadius:8,
      boxShadow:'12px 18px 38px #0002',transform:`translateY(${(measured.scale-.9933774834437086)*12}px)`}}>
      <div style={{width:828,height:1196,position:'relative',transform:`scale(${scale}) translateY(${-scroll}px)`,transformOrigin:'0 0'}}>
        <Media src='email.png'/>
        {ranges.map(([x,y,w,h],i)=><div key={i} style={{position:'absolute',left:x,top:y,width:w*highlight,height:h,background:LIGHT,opacity:.62,mixBlendMode:'multiply'}}/>)}
      </div>
    </div>
  </AbsoluteFill>;
}

// X019 actual black rules window and cursor typing, fitted to the protected subtitle band.
export function RulesWindow({lines,t,cues}:{lines:string[];t:number;cues:number[]}){
  const f=Math.min(539,Math.max(0,Math.round(t*60))),row=native.X019[f],p=phase(t,0,.55);
  const x=mix(1960,200,p)+(row[1]-native.X019[Math.min(140,f)][1])*.04;
  return <div data-component='X019' style={{position:'absolute',left:x,top:70,width:1520,height:804,borderRadius:36,overflow:'hidden',background:'#212123',boxShadow:'-25px 18px 35px #0003'}}>
    <div style={{height:72,background:'#161618',display:'flex',gap:18,alignItems:'center',paddingLeft:40}}>{[ACCENT,'#aaa','#eee'].map(c=><i key={c} style={{width:19,height:19,borderRadius:20,background:c}}/>)}</div>
    {lines.map((line,i)=>{
      const at=cues[i],duration=i===0?.46:.66,count=Math.floor(clamp((t-at)/duration)*[...line].length);
      const cursor=t>=at&&t<at+duration+.16;
      return <div key={i} data-qc-text style={{position:'absolute',left:55,top:142+i*153,width:1410,fontFamily:'RuiZi',fontWeight:700,fontSynthesis:'none',fontSize:fitSize(line,1340,i===0?132:86),lineHeight:1.2,textAlign:'center',letterSpacing:0,color:'white',textShadow:'6px 8px 5px #0005',whiteSpace:'nowrap'}}>
        {[...line].slice(0,count).join('')}{cursor&&<span style={{display:'inline-block',width:16,height:i===0?130:90,background:'#bdbdbd',verticalAlign:'middle',marginLeft:8}}/>}
      </div>;
    })}
  </div>;
}

// X022 keeps the selected glyph family, vertical squash and focus sequence without decorative balls.
export function FocusWords({words,t,cues}:{words:string[];t:number;cues:number[]}){
  return <AbsoluteFill data-component='X022'>{words.map((word,i)=>{
    const p=phase(t,cues[i],cues[i]+.44);
    return <div key={i} data-qc-text style={{position:'absolute',left:190,top:160+i*242-(1-p)*125,width:1540,height:210,
      fontFamily:'RuiZi',fontWeight:700,fontSynthesis:'none',fontSize:fitSize(word,1500,166),lineHeight:1.2,textAlign:'center',letterSpacing:0,
      color:i===2?ACCENT:INK,textShadow:'6px 8px 5px #0003',opacity:p,filter:`blur(${(1-p)*15}px)`,transform:`scaleY(${mix(.2,1,p)})`}}>{word}</div>;
  })}</AbsoluteFill>;
}

export function NumberedList({words,t,cues,collapseAt}:{words:string[];t:number;cues:number[];collapseAt:number}){
  const collapse=phase(t,collapseAt,collapseAt+.54),enter=phase(t,0,.4);
  return <div data-component='X009' style={{position:'absolute',left:140,top:82,width:1640,height:784,borderRadius:48,background:INK,boxShadow:'25px 22px 30px #0003',
    transform:`translateY(${(1-enter)*90-collapse*115}px) scale(${mix(1,.67,collapse)})`,opacity:enter*(1-collapse),transformOrigin:'50% 50%'}}>
    {words.map((word,i)=>{
      const p=phase(t,cues[i],cues[i]+.55),chars=[...`${i+1}. ${word}`],rows=x009.rows[i];
      return <div key={i} data-qc-text style={{...textStyle,position:'absolute',left:130,top:130+i*219,width:1380,fontSize:112,lineHeight:1.15,whiteSpace:'nowrap',color:'white'}}>
        {chars.map((c,j)=>{const slot=Math.min(rows.length-1,Math.floor(j/(chars.length-1)*(rows.length-1)));return <span key={j} style={{opacity:Math.min(p,clamp(sample((t-cues[i])*98+rows[slot].alpha[0][0],rows[slot].alpha)))}}>{c}</span>})}
      </div>;
    })}
  </div>;
}

// T01 measured cards exchange prominence; source background is supplied by the scene, never looped.
export function SwappingCapsules({words,t,swapAt=2.5,thirdAt=5.2}:{words:string[];t:number;swapAt?:number;thirdAt?:number}){
  const f=t<swapAt?Math.min(160,t*90):t<thirdAt?200+(t-swapAt)*65:350+(t-thirdAt)*72;
  return <AbsoluteFill data-component='T01'>{t01.objects.cards.map((card,i)=>{
    if(!words[i])return null;
    const [x,ny,w,h,alpha]=track(t01,card.track,f),size=fitSize(words[i],Math.max(0,w-65),Math.min(124,h*.52));
    return <div key={i} style={{position:'absolute',left:x,top:ny*.8+25,width:w,height:h*.85,borderRadius:Math.min(w/2,h*.38),background:INK,
      display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',boxShadow:'12px 15px 20px #0003'}}>
      <span data-qc-text style={{...textStyle,fontSize:size,lineHeight:1.18,color:i===1?LIGHT:'white',whiteSpace:'nowrap',opacity:clamp(alpha)}}>{words[i]}</span>
    </div>;
  })}</AbsoluteFill>;
}

export function Advantages({words,t,cues}:{words:string[];t:number;cues:number[]}){
  return <AbsoluteFill data-component='X027'>{words.map((word,i)=>{
    const bounds=x027.bounds[i].filter((b):b is number[]=>b!==null);
    const p=phase(t,cues[i],cues[i]+.5),f=Math.min(bounds.length-1,Math.round(Math.max(0,t-cues[i])*60));
    const delta=(bounds[f][0]-bounds[0][0])*.1;
    return <div key={i} data-qc-text style={{...textStyle,position:'absolute',left:140,width:1640,top:180+i*222,
      fontFamily:'SourceHanHeavy',fontWeight:900,fontSize:fitSize(word,1580,152),lineHeight:1.15,textAlign:'center',color:i===0?INK:ACCENT,
      opacity:p,transform:`translateX(${(1-p)*(i%2?500:-500)+delta}px)`,textShadow:'6px 9px 6px #0003'}}>{word}</div>;
  })}</AbsoluteFill>;
}

export function ComparisonWindows({left,right,t,at=0}:{left:React.ReactNode;right:React.ReactNode;t:number;at?:number}){
  const nativeFrame=Math.max(0,Math.min(76,Math.round((t-at)*60))),p=comparison[nativeFrame][0];
  const w=mix(1760,864,p),rightWidth=mix(520,864,p);
  return <AbsoluteFill data-component='N023'>
    <div style={{position:'absolute',left:mix(80,40,p),top:mix(35,184,p),width:w,height:mix(855,680,p),borderRadius:32,overflow:'hidden',boxShadow:'18px 19px 28px #0003'}}>{left}</div>
    <div style={{position:'absolute',left:mix(1370,1016,p),top:mix(640,184,p),width:rightWidth,height:mix(292,680,p),borderRadius:32,overflow:'hidden',boxShadow:'18px 19px 28px #0003'}}>{right}</div>
  </AbsoluteFill>;
}

// N018's tilted directory and stationary focus marker, using only explicitly illustrative choices.
export function ChoiceDirectory({t,at=0}:{t:number;at?:number}){
  const q=phase(t,at,at+1.2),selected=mix(2,1,q),words=['给定选项','快速判断','返回结果'];
  return <AbsoluteFill data-component='N018' style={{opacity:phase(t,at,at+.3)}}>
    <div style={{position:'absolute',left:265,top:352,width:1390,height:244,border:`10px solid ${ACCENT}`,borderRadius:22}}/>
    <div style={{position:'absolute',left:298,top:396,fontSize:110,fontWeight:700}}>→</div>
    {words.map((word,i)=>{const d=i-selected;return <div key={word} data-qc-text style={{...textStyle,position:'absolute',left:480+Math.abs(d)*8,top:399+d*218,width:1150,
      fontSize:140,lineHeight:1.1,opacity:Math.max(.24,1-Math.abs(d)*.5),filter:`blur(${Math.abs(d)*5}px)`,transform:`perspective(1400px) rotateX(${d*7}deg) rotate(${d*4}deg)`}}>{word}</div>})}
  </AbsoluteFill>;
}

// B062's quantitative comparison re-timed to the two real Pro tiers.
export function QuotaComparison({t,cues}:{t:number;cues:number[]}){
  const drop=phase(t,cues[1]+1.75,cues[1]+2.3),second=phase(t,cues[2],cues[2]+.55),grow=phase(t,cues[3],cues[3]+.55);
  const nativeA=track(b062,'barA',Math.min(216,t*100)),nativeB=track(b062,'barB',216+grow*108);
  const levelA=mix(20,10,drop),heightA=levelA*19,heightB=25*19*grow;
  return <AbsoluteFill data-component='B062'>
    <div style={{...textStyle,position:'absolute',left:120,top:50,width:1680,fontSize:54,textAlign:'center'}}>同一 Plus 基准</div>
    {[0,1].map(i=>{
      const x=i===0?480:1120,h=i===0?heightA:heightB,shown=i===0?phase(t,cues[1],cues[1]+.5):second;
      return <div key={i} style={{position:'absolute',left:x,top:208,width:320,height:610,opacity:shown}}>
        <div data-qc-text style={{...textStyle,position:'absolute',top:-83,width:320,fontSize:48,textAlign:'center'}}>{i===0?'$200 / 月':'$500 / 月'}</div>
        <div style={{position:'absolute',left:0,bottom:0,width:320,height:h,borderRadius:'22px 22px 0 0',background:i===0?INK:ACCENT,
          transform:`scaleX(${i===0?nativeA[2]/292:nativeB[2]/292})`,transformOrigin:'center bottom'}}/>
        <div data-qc-text style={{...textStyle,position:'absolute',width:320,bottom:h+20,fontSize:112,textAlign:'center',color:INK}}>{i===0?Math.round(levelA)+'×':'25×'}</div>
      </div>;
    })}
    <div style={{position:'absolute',left:350,top:820,width:1220,height:3,background:'#bbb'}}/>
  </AbsoluteFill>;
}

export const SelectedMotion = {MediaWindow,WorkbenchWindow,X003Capsule,DotCapsule,LayeredCapsules,RisingTitle,
  ReadingEmail,RulesWindow,FocusWords,NumberedList,SwappingCapsules,Advantages,ComparisonWindows,ChoiceDirectory,QuotaComparison};
