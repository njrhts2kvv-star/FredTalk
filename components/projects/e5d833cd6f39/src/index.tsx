import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,Composition,Easing,Freeze,Img,OffthreadVideo,Sequence,continueRender,delayRender,cancelRender,interpolate,registerRoot,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import manifest from '../manifest.json';
import {WorkSelection} from './S15TaskSelection';
import {Decisions,Routing} from './DecisionFlow';
type Page=typeof manifest.pages[number];
const ease=Easing.bezier(.65,0,.2,1);
const p=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:ease,extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const mapTime=(f:number,map:number[][])=>interpolate(f,map.map(x=>x[0]),map.map(x=>x[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const place:React.CSSProperties={position:'absolute'};
function Fonts(){const[h]=useState(()=>delayRender('EP99 exact local MiSans'));useEffect(()=>{Promise.all([['Medium','500'],['Semibold','600'],['Bold','700']].map(async([name,weight])=>{const face=new FontFace('MiSans',`url("${staticFile('fonts/MiSans-'+name+'.otf')}")`,{weight});await face.load();document.fonts.add(face);})).then(()=>continueRender(h)).catch(cancelRender);},[h]);return null;}
function Corner({dark=false}:{dark?:boolean}){return dark?<div style={{...place,left:1554.5,top:41,width:335,height:75,overflow:'hidden'}}><Img src={staticFile('brand/fredtalk-ai-dark-transparent.png')} style={{...place,width:2172*335/1528,maxWidth:'none',left:-295*335/1528,top:-184*335/1528}}/></div>:<Img src={staticFile('brand/fredtalk-ai-corner.png')} style={{...place,left:1549.5,top:36,width:345.5,height:85}}/>;}
function Media({file,time,fill=false,mapping}:{file:string;time:number;fill?:boolean;mapping?:number[][]}){
 // Installation has baked 60px side strips. Crop those strips, then only the
 // minimum vertical surplus. Result footage retains its top edge (table intro).
 const install=file.startsWith('install-');
 const w=install?3836:3568,h=2160,cropX=install?(time<12.5?66:time<25.5?74:132):0;
 const cropW=w-2*cropX,cropH=cropW*9/16;
 const bottomFocus=install?((time>=8.2&&time<10.9)||(time>=20.6&&time<23.35)||time>=25.5):(time>=7&&time<=12);
 const cropY=bottomFocus?h-cropH:0;
 const style:React.CSSProperties=file==='browser-use.mp4'?{width:'100%',height:'100%',objectFit:fill?'cover':'contain'}:fill?{position:'absolute',maxWidth:'none',width:`${w/cropW*100}%`,height:`${h/cropH*100}%`,left:`${-cropX/cropW*100}%`,top:`${-cropY/cropH*100}%`}:{width:'100%',height:'100%',objectFit:'contain'};
 const video=(source:number,rate=1)=><OffthreadVideo startFrom={Math.round(source*60)} playbackRate={rate} src={staticFile('media/'+file)} muted style={style}/>;
 const points=mapping?.length?mapping:undefined;
 return <div style={{...place,inset:0,overflow:'hidden'}}>{points?<>
  {points.map(([from,source],i)=>{const next=points[i+1];if(!next)return <Sequence key={i} from={from} durationInFrames={1} layout="none"><Freeze frame={0}>{video(source)}</Freeze></Sequence>;
   const duration=next[0]-from,rate=(next[1]-source)*60/duration;
   return <Sequence key={i} from={from} durationInFrames={duration} layout="none">{rate===0?<Freeze frame={0}>{video(source)}</Freeze>:video(source,rate)}</Sequence>;
  })}
 </>:<Freeze frame={0}>{video(time)}</Freeze>}</div>;

}
function Copy({children,top=400,size=110,opacity=1,y=0,color='#151517'}:{children:React.ReactNode;top?:number;size?:number;opacity?:number;y?:number;color?:string}){return <div style={{...place,left:110,top,width:1700,textAlign:'center',fontSize:size,lineHeight:1.18,fontWeight:600,color,opacity,transform:`translateY(${y}px)`,whiteSpace:'nowrap'}}>{children}</div>;}

// EP98 S03.tsx Ep95Monitor is the geometry/motion source: the same media node
// grows from an explicit screen bbox into the canvas. EP99 has a different
// source aspect ratio and cue clock; it is not an approved EP98 render.
// Replace only Scene13. Existing Page, p, mix, place, Media, mapTime helpers retained.
// Real footage remains 1x. Reading frames carry explicit, short focus actions.
function Scene13({page,f}:{page:Page;f:number}){
 const z=p(f,144,174),w=mix(1404,1920,z),h=mix(790,1080,z),x=(1920-w)/2,y=mix(140,0,z),border=18;
 const siteFocus=p(f,192,224)*(1-p(f,252,276));
 const sitePan=p(f,174,202)*(1-p(f,408,438));
 const shade=p(f,500,520)*(1-p(f,610,626));
 const focusButton=p(f,574,610);
 const chapterOut=p(f,104,138),chapterIn=p(f,0,28);
 return <>
  <div style={{...place,left:x+w/2-65,top:y+h,width:130,height:92,background:'#151517'}}/>
  <div style={{...place,left:x+w/2-205,top:y+h+80,width:410,height:20,borderRadius:10,background:'#151517'}}/>
  <div style={{...place,left:x-border,top:y-border,width:w+36,height:h+36,borderRadius:26*(1-z),background:'#151517',boxShadow:'0 25px 70px #00000025'}}/>
  <div style={{...place,left:x,top:y,width:w,height:h,borderRadius:8*(1-z),overflow:'hidden',background:'white'}}>
   <div style={{...place,inset:0,transform:`translateY(${130*sitePan}px) scale(${1+.10*siteFocus})`,transformOrigin:'100% 0%'}}>
    <Media file={page.mediaFile!} time={mapTime(f,page.sourceMapping)} mapping={page.sourceMapping} fill/>
   </div>
  </div>
  {f>=500&&f<626&&[
   {id:'mail',x:700,y:390,w:1160,h:447,alpha:shade*(1-focusButton)},
   {id:'button',x:735,y:683,w:600,h:150,alpha:shade*focusButton},
  ].map(q=><svg key={q.id} width="1920" height="1080" style={{...place,inset:0,opacity:q.alpha}}>
   <defs><mask id={'ep99-mail-'+q.id}><rect width="1920" height="1080" fill="white"/><rect x={q.x} y={q.y} width={q.w} height={q.h} rx="14" fill="black"/></mask></defs>
   <rect width="1920" height="1080" fill="black" opacity=".38" mask={'url(#ep99-mail-'+q.id+')'}/>
  </svg>)}
  {f<138&&<AbsoluteFill style={{background:'white',transform:`translateY(${-1080*chapterOut}px)`,overflow:'hidden'}}>
   <div style={{...place,left:230,top:294,opacity:chapterIn,transform:`translateY(${32*(1-chapterIn)}px)`}}>
    <div style={{fontSize:76,fontWeight:500,color:'#777',marginBottom:34}}>Part.02</div>
    <div style={{fontSize:170,fontWeight:600,letterSpacing:-4}}>怎么用 Jev</div>
   </div>
  </AbsoluteFill>}
 </>;
}

function Evidence({page,f}:{page:Page;f:number}){return <AbsoluteFill style={{background:'white'}}><Media file={page.mediaFile!} time={mapTime(f,page.sourceMapping)} mapping={page.sourceMapping} fill={page.segmentNumber<=16}/></AbsoluteFill>;}

// Geometry and reveal are adapted from canonical EP87 Transition.tsx Drag:
// grow f5–37, remove drag handles f48. Only this chapter excerpt is reused.
function Chapter({f}:{f:number}){const grow=p(f,5,37),x=400,y=362,w=1148,h=323;
 return <AbsoluteFill style={{background:'#090909',color:'white'}}><div style={{...place,left:x,top:y,width:w,height:h,clipPath:`inset(0 ${100*(1-grow)}% ${100*(1-grow)}% 0)`}}><div style={{fontSize:96,fontWeight:500,lineHeight:1.15,color:'#c9c9c9',marginBottom:18}}>Part.03</div><div style={{fontSize:152,fontWeight:700,lineHeight:1.15,letterSpacing:'.012em'}}>实际效果</div></div>{f<48&&<><div style={{...place,left:x-10,top:y-8,width:w*grow,height:h*grow,border:'1.5px solid #909090'}}/>{grow>0&&[[0,0],[1,0],[0,1],[1,1]].map(([xx,yy],i)=><div key={i} style={{...place,left:x-13+w*grow*xx,top:y-11+h*grow*yy,width:6,height:6,background:'#080808',border:'1px solid #bbb'}}/>)}<svg width="42" height="52" viewBox="0 0 42 52" style={{...place,left:x-7+w*grow,top:y-5+h*grow}}><path d="M3 2 L3 38 L13 30 L22 48 L29 44 L20 26 L34 26 Z" fill="#080808" stroke="#eee" strokeWidth="2.5" strokeLinejoin="round"/></svg></>}</AbsoluteFill>;
}
function Scene15({page,f,mediaFrame}:{page:Page;f:number;mediaFrame:number}){
 const chapterOut=p(f,122,152);
 return <><WorkSelection f={f} media={<Evidence page={page} f={mediaFrame}/>}/>{f<152&&<div style={{...place,inset:0,transform:`translateY(${-1080*chapterOut}px)`}}><Chapter f={f}/></div>}</>;
}
function FullCase({time,mapping}:{time:number;mapping?:number[][]}){return <AbsoluteFill><Media file="browser-use.mp4" time={time} mapping={mapping} fill/></AbsoluteFill>;}
function Benchmark({page,f}:{page:Page;f:number}){const shade=p(f,366,390),right=p(f,556,584);return <><Evidence page={page} f={f}/><AbsoluteFill style={{background:`rgba(0,0,0,${.88*shade})`}}/><div style={{...place,inset:0,color:'white',opacity:shade}}><div style={{...place,left:150,top:340,width:670,textAlign:'center',transform:`translateY(${35*(1-shade)}px)`}}><div style={{fontSize:68,fontWeight:500,marginBottom:28}}>Jev</div><div style={{fontSize:190,fontWeight:600,letterSpacing:-5}}>83.7%</div></div><div style={{...place,left:850,top:492,width:220,textAlign:'center',fontSize:58,color:'#aaa',opacity:right}}>VS</div><div style={{...place,left:1100,top:340,width:670,textAlign:'center',opacity:right,transform:`translateY(${35*(1-right)}px)`}}><div style={{fontSize:68,fontWeight:500,marginBottom:28}}>GPT-6 Astra</div><div style={{fontSize:190,fontWeight:600,letterSpacing:-5}}>89.2%</div></div></div></>;}
function Scene19({page,f}:{page:Page;f:number}){const enter=p(f,0,26);const prior=manifest.pages.find(x=>x.segmentNumber===18)!;return <><div style={{...place,inset:0,transform:`translateX(${-1920*enter}px)`}}><Benchmark page={prior} f={prior.durationInFrames-1}/></div><div style={{...place,inset:0,transform:`translateX(${1920*(1-enter)}px)`}}><FullCase time={mapTime(f,page.sourceMapping)} mapping={page.sourceMapping}/></div></>;}

function Scene({page}:{page:Page}){const f=useCurrentFrame(),vf=mapTime(f,page.visualClock),{width}=useVideoConfig(),n=page.segmentNumber;return <AbsoluteFill style={{background:'white'}}><Fonts/><div style={{...place,left:0,top:0,width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left',fontFamily:'MiSans',fontSynthesis:'none',fontWeight:500,color:'#151517',overflow:'hidden'}}>
 {n===13?<Scene13 page={page} f={f}/>:n===15?<Scene15 page={page} f={vf} mediaFrame={f}/>:n===18?<Benchmark page={page} f={f}/>:n===19?<Scene19 page={page} f={f}/>:n===20?<Decisions f={f} background={<FullCase time={7.5166667}/>}/>:n===21?<Routing f={f}/>:<Evidence page={page} f={f}/>}
 <Corner dark={(n===15&&vf<135)||(n===18&&f>=378)||(n===19&&f<14)||(n===21&&f>=280)}/></div><Audio src={staticFile('voice.wav')} startFrom={page.globalVoiceStartFrame} volume={.93}/>{page.sounds.map((s,i)=><Sequence key={i} from={s.start} durationInFrames={s.frames} layout="none"><Audio src={staticFile(s.file)} volume={frame=>s.volume*Math.min(1,(s.frames-frame)/6)}/></Sequence>)}</AbsoluteFill>;}
registerRoot(()=> <>{manifest.pages.map(page=><Composition key={page.stableId} id={'EP99-S'+page.segmentNumber} component={Scene} defaultProps={{page}} width={1920} height={1080} fps={60} durationInFrames={page.durationInFrames}/>)}</>);
