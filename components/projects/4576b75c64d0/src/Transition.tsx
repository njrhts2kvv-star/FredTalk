import {approvedStaticFile as staticFile} from '../material-policy';
import React from 'react';
import {AbsoluteFill, Audio, Easing, continueRender, cancelRender, delayRender, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const fontReady = delayRender('MiSans explicit weights');
Promise.all([['Medium','500'],['Semibold','600'],['Bold','700']].map(async ([name,weight]) => {
  const face = new FontFace('FredMiSans', `url(${staticFile(`fonts/MiSans-${name}.otf`)})`, {weight,style:'normal'});
  await face.load(); document.fonts.add(face);
})).then(() => continueRender(fontReady)).catch((error) => cancelRender(error));

export type Clip = {stableId:string;kind:string;width:number;titleSize:number;labelSize:number;title:string;label:string;durationInFrames:number;settleFrame:number};
const curve=Easing.bezier(0.65,0,0.2,1);
const phase=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:curve,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const layer:React.CSSProperties={position:'absolute'};
const titleStyle:React.CSSProperties={fontFamily:'FredMiSans',fontSynthesis:'none',fontWeight:600,whiteSpace:'nowrap',lineHeight:1.15,letterSpacing:0};
const labelStyle:React.CSSProperties={fontFamily:'FredMiSans',fontSynthesis:'none',fontWeight:500,whiteSpace:'nowrap',lineHeight:1.15,letterSpacing:0};

const Title:React.FC<{text:string}>=({text})=><>{text.split(/([A-Za-z]+)/).map((part,i)=><span key={i} style={{fontWeight:/[A-Za-z]/.test(part)?600:700,letterSpacing:/[\u4e00-\u9fff]/.test(part)?'0.012em':0}}>{part}</span>)}</>;

const Copy:React.FC<{clip:Clip;center?:boolean}>=({clip,center=false})=><div style={{width:clip.width,color:'#fff',textAlign:'center'}}>
  <div style={{...labelStyle,fontSize:clip.labelSize,marginBottom:18,color:'#c9c9c9'}}>{clip.label}</div>
  <div style={{...titleStyle,fontSize:clip.titleSize}}>{<Title text={clip.title}/>}</div>
</div>;

const Cursor:React.FC<{x:number;y:number}>=({x,y})=><svg width="42" height="52" viewBox="0 0 42 52" style={{...layer,left:x,top:y}}><path d="M3 2 L3 38 L13 30 L22 48 L29 44 L20 26 L34 26 Z" fill="#080808" stroke="#eee" strokeWidth="2.5" strokeLinejoin="round"/></svg>;

const Drag:React.FC<{clip:Clip;f:number}>=({clip,f})=>{
  const grow=phase(f,5,37);const x=(1920-clip.width)/2;const y=362;const w=clip.width+28;const h=clip.labelSize*1.15+18+clip.titleSize*1.15+20;
  return <><div style={{...layer,left:x,top:y,width:w,height:h,clipPath:`inset(0 ${100*(1-grow)}% ${100*(1-grow)}% 0)`}}><Copy clip={clip}/></div>
    {f<48&&<><div style={{...layer,left:x-10,top:y-8,width:w*grow,height:h*grow,border:'1.5px solid #909090'}}/>{grow>0&&[ [0,0],[1,0],[0,1],[1,1] ].map(([xx,yy],i)=><div key={i} style={{...layer,left:x-13+w*grow*xx,top:y-11+h*grow*yy,width:6,height:6,background:'#080808',border:'1px solid #bbb'}}/>)}<Cursor x={x-7+w*grow} y={y-5+h*grow}/></>}
  </>;
};
const Aperture:React.FC<{clip:Clip;f:number}>=({clip,f})=>{
 const grow=phase(f,1,44);const h=4+576*grow;
 return <div style={{...layer,left:240,top:540-h/2,width:1440,height:h,background:'#000',borderRadius:28,overflow:'hidden'}}><div style={{...layer,left:(1440-clip.width)/2,top:h/2-clip.labelSize*.575-9-clip.titleSize*.575}}><Copy clip={clip}/></div></div>;
};
const NumberHandoff:React.FC<{clip:Clip;f:number}>=({clip,f})=>{
 const move=phase(f,8,38);const enter=phase(f,24,46);const size=330+(clip.labelSize-330)*move;
 return <><div style={{...layer,top:342-4*move,left:0,width:1920,textAlign:'center',...labelStyle,fontSize:size,color:'#fff'}}>{clip.label}</div>
 <div style={{...layer,left:0,top:476,width:1920,height:clip.titleSize*1.15,overflow:'hidden'}}><div style={{...titleStyle,fontSize:clip.titleSize,textAlign:'center',transform:`translateY(${(1-enter)*110}%)`,color:'#fff'}}>{<Title text={clip.title}/>}</div></div></>;
};
const FieldPush:React.FC<{clip:Clip;f:number}>=({clip,f})=>{
 const push=phase(f,0,44);return <div style={{...layer,inset:0,background:'#000',clipPath:`inset(0 ${100*(1-push)}% 0 0)`}}><div style={{...layer,left:(1920-clip.width)/2,top:392}}><Copy clip={clip}/></div></div>;
};
const BarReveal:React.FC<{clip:Clip;f:number}>=({clip,f})=>{
 const open=phase(f,3,30);const travel=phase(f,36,68);const top=482;const h=clip.titleSize*1.15;
 const badgeWidth=clip.labelSize*3.4+24;const badgeHeight=clip.labelSize*1.15+12;
 const barWidth=clip.width+(badgeWidth-clip.width)*travel;
 const barHeight=h*open+(badgeHeight-h)*travel;
 const barTop=top+h*(1-open)+(344-top)*travel;
 const barLeft=(1920-barWidth)/2;
 const text= <><div style={{...layer,left:0,top:350,width:1920,textAlign:'center',...labelStyle,fontSize:clip.labelSize}}>{clip.label}</div>
 <div style={{...layer,left:(1920-clip.width)/2,top,width:clip.width,height:h,clipPath:`inset(${100*(1-open)}% 0 0 0)`,...titleStyle,fontSize:clip.titleSize,textAlign:'center'}}><Title text={clip.title}/></div></>;
 return <><div style={{color:'#fff'}}>{text}</div>
 <div style={{...layer,left:barLeft,top:barTop,width:barWidth,height:barHeight,background:'#e6e6e6',overflow:'hidden'}}>
 <div style={{...layer,left:-barLeft,top:-barTop,width:1920,height:1080,color:'#000'}}>{text}</div>
 </div></>;
};
export const Transition:React.FC<{clip:Clip}>=({clip})=>{
 const f=useCurrentFrame();const {width}=useVideoConfig();
 return <AbsoluteFill style={{background:clip.kind==='aperture'||clip.kind==='push'?'#fff':'#000'}}>
 <div style={{...layer,left:0,top:0,width:1920,height:1080,transform:`scale(1)`,transformOrigin:'top left'}}>
 {clip.kind==='drag'&&<Drag clip={clip} f={f}/>}{clip.kind==='aperture'&&<Aperture clip={clip} f={f}/>}{clip.kind==='number'&&<NumberHandoff clip={clip} f={f}/>}{clip.kind==='push'&&<FieldPush clip={clip} f={f}/>}{clip.kind==='reveal'&&<BarReveal clip={clip} f={f}/>}
 </div></AbsoluteFill>;
};
