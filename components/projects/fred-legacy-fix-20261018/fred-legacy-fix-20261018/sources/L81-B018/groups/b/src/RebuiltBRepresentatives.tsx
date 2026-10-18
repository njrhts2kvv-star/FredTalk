// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,OffthreadVideo,Sequence,Loop,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import b9 from '../../../specs/B009.json';
import b11 from '../../../specs/B011.json';
import b18 from '../../../specs/B018.json';
import b19 from '../../../specs/B019.json';
import {measured,ClipSpec} from '../../../runtime/clip-spec';
import {cleanStaticFile} from './clean-assets';
import {SmoothLoopVideo} from './SmoothLoopVideo';
type Data=typeof b9;
// patch-b1：B018 黑白反转扫线进度（f92–136，smoothstep）
const B018_WIPE=(frame:number)=>{const v=Math.max(0,Math.min(1,(frame-92)/44));return v*v*(3-2*v)};
// patch-b1：B018 结尾两张卡的文字（原 scenes/summary-wide.svg、scenes/review-wide.svg 里的同一份 Fred 文案）
const B018_CARDS=[{title:'会议摘要',lines:['确认讨论目标','记录已达成的结论','保留尚未解决的问题']},{title:'回顾记录',lines:['这次讨论了什么？','当时为什么这样决定？','下一步需要做什么？']}];
function B018Card({title,lines}:{title:string;lines:string[]}){return <div style={{width:'100%',height:'100%',background:'#fff',borderRadius:24,boxShadow:'0 16px 25px 0 rgba(0,0,0,.1333)',padding:'40px 36px',boxSizing:'border-box',fontFamily:'MiSans',fontSynthesis:'none',color:'#121214'}}><div style={{fontSize:56,fontWeight:700,lineHeight:1.16}}>{title}</div>{lines.map((l,j)=><div key={j} style={{marginTop:j?22:30,paddingLeft:26,position:'relative',fontSize:38,fontWeight:500,lineHeight:1.3,whiteSpace:'nowrap'}}><span style={{position:'absolute',left:0}}>•</span>{l}</div>)}</div>}
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function Media({name,style,smoothFrame}:{name:string;style?:React.CSSProperties;smoothFrame?:number}){const src=cleanStaticFile(`batch1/${name}.jpg`);return /\.mp4$/.test(src)&&smoothFrame!==undefined?<SmoothLoopVideo src={src} frame={smoothFrame} durationInFrames={src.includes('fred-mic-power')?350:300} style={{width:'100%',height:'100%',objectFit:'cover',...style}}/>:/\.mp4$/.test(src)?<Loop durationInFrames={src.includes('fred-mic-power')?350:300} layout="none"><OffthreadVideo muted src={src} style={{width:'100%',height:'100%',objectFit:'cover',...style}}/></Loop>:<Img src={src} style={{width:'100%',height:'100%',objectFit:'cover',...style}}/>;}
export function RebuiltBRepresentatives({number,frame}:{number:number;frame:number}){
 const data=({9:b9,11:b11,18:b18,19:b19} as any)[number] as any;
 const spec=data as ClipSpec;const val=(n:string)=>measured(spec,n,frame);
 const [keywordOrigins,setKeywordOrigins]=useState<{x:number;y:number;width:number}[]>([]);
 const [handle]=useState(()=>delayRender(`B${number} measured font`));
 useEffect(()=>{const font=data.fonts[0];new FontFace(font.family,`url(${staticFile(font.file)})`).load().then(f=>{document.fonts.add(f);
 if(number===9){
  const o=data.objects;
  const lines=(data.content.texts as string[]).flatMap((text,i)=>{const cuts=o.body.lineBreaks?.[i]||[];return [0,...cuts].map((start,j)=>text.slice(start,[...cuts,text.length][j]))});
  const canvas=document.createElement('canvas');const context=canvas.getContext('2d');
  if(!context)throw new Error('B009 keyword font measurement unavailable');
  context.font=`400 ${o.body.fontSize}px "${font.family}"`;
  setKeywordOrigins(o.keywords.texts.map((keyword:string)=>{
   const row=lines.findIndex(line=>line.includes(keyword));
   if(row<0)throw new Error(`B009 keyword absent from body: ${keyword}`);
   const prefix=lines[row].slice(0,lines[row].indexOf(keyword));
   return {x:o.body.x+context.measureText(prefix).width,y:o.body.y+row*o.body.fontSize*o.body.lineHeight,width:context.measureText(keyword).width};
  }));
 }
 continueRender(handle)}).catch(cancelRender);},[number,handle]);
 const font=data.fonts[0].family;const words=data.content.texts as string[];const accent=data.content.accent;
 const textStyle:React.CSSProperties={fontFamily:font,fontWeight:400,fontSynthesis:'none',color:accent};
 if(number===9){const o=data.objects;const bodyLines=words.flatMap((text,i)=>{const cuts=o.body.lineBreaks?.[i]||[];return [0,...cuts].map((start,j)=>text.slice(start,[...cuts,text.length][j]))});const [blur]=val('blur');const [focus]=val('focus');const [opacity]=val('textOpacity');const [wy]=val('windowY');return <AbsoluteFill style={{background:'white'}}>
 {frame<34&&[0,1,2,3].map(i=><div key={i} style={{position:'absolute',left:(i%2)*994+(i%2?1:-1)*frame*32,top:Math.floor(i/2)*570,width:930,height:500,borderRadius:22,overflow:'hidden'}}><Media name={`prior-nine-${i}`}/></div>)}
 <div style={{position:'absolute',left:o.window.x,top:wy,width:o.window.width,height:o.window.height,background:o.window.fill,borderRadius:o.window.radius,filter:`blur(${blur}px)`,boxShadow:'35px 14px 30px #0004',overflow:'hidden'}}><div style={{height:o.window.headerHeight,background:'#121617',display:'flex',gap:30,paddingLeft:55,alignItems:'center'}}>{['#d92c89','#f6b444','#397df5'].map(c=><div key={c} style={{width:25,height:25,borderRadius:'50%',background:c}}/>)}</div><div style={{position:'absolute',left:o.body.x-o.window.x,top:o.body.y-38,width:o.body.width,...textStyle,fontSize:o.body.fontSize,lineHeight:o.body.lineHeight}}>{bodyLines.map((t,i)=>{const entry=o.glyphEntry;const row=entry&&frame>=entry.startFrame&&frame<=entry.endFrame?entry.values[Math.floor(frame)-entry.startFrame][Math.round(i*(entry.rows-1)/Math.max(1,bodyLines.length-1))]:null;return <div key={i} style={{whiteSpace:'nowrap'}}>{Array.from(t).map((char,j)=><span key={j} style={{opacity:row?row[Math.round(j*(row.length-1)/Math.max(1,t.length-1))]:frame<entry.startFrame?0:1}}>{char}</span>)}</div>})}</div></div>
 {frame>=210&&frame<=590&&keywordOrigins.map((origin,i)=>{
  const progress=val('keywordDisplacement')[0];
  const centerX=o.keywords.centerX-origin.width/2;
  const centerY=o.keywords.y+i*o.keywords.fontSize*o.keywords.lineHeight;
  // Match line-box baseline while transferring between the two line heights.
  const lineHeight=o.body.lineHeight+(o.keywords.lineHeight-o.body.lineHeight)*progress;
  return <div key={i} style={{position:'absolute',left:origin.x+(centerX-origin.x)*progress,top:origin.y+(centerY-origin.y)*progress,whiteSpace:'nowrap',...textStyle,fontSize:o.keywords.fontSize,lineHeight,opacity:clamp((frame-210)/3)*clamp((590-frame)/3)}}>{o.keywords.texts[i]}</div>;
 })}
 </AbsoluteFill>}
 if(number===11){const [focus]=val('focus');const [fg]=val('foreground');const o=data.objects;return <AbsoluteFill style={{background:'white'}}><AbsoluteFill style={{filter:`blur(${focus*20}px)`}}>{[0,1,2,3].map(i=>{const progress=clamp((frame-o.cards.entryFrames[i])/25);return <div key={i} style={{position:'absolute',left:o.cards.x[i],top:o.cards.y[i],width:o.cards.width,height:o.cards.height,borderRadius:o.cards.radius,overflow:'hidden',transform:`perspective(1500px) rotateY(${(1-progress)*90}deg)`,visibility:frame<o.cards.entryFrames[i]?'hidden':'visible'}}>{(()=>{const variant=frame<600?0:frame<720?1:2;const file=o.cards.playbackMedia[i][variant];return file?<Sequence from={Math.max(o.cards.entryFrames[i],variant===0?0:variant===1?600:720)} layout="none"><Loop durationInFrames={o.cards.playbackFrames[i][variant]} layout="none"><OffthreadVideo muted src={staticFile(file)} style={{width:'100%',height:'100%',objectFit:'cover'}}/></Loop></Sequence>:<Media name={`grid-11-${i}-${variant}`}/>})()}<div style={{position:'absolute',inset:0,background:o.focusLuminance[i].overlay,opacity:focus*o.focusLuminance[i].alpha}}/></div>})}</AbsoluteFill><div style={{position:'absolute',left:o.text.x,top:o.text.y,width:o.text.width,...textStyle,fontSize:o.text.fontSize,lineHeight:o.text.lineHeight,textShadow:o.text.shadow,WebkitTextStroke:o.text.stroke,opacity:frame>=360&&frame<=610?fg:0}}>{words.map((t,i)=><div key={i}>{t}</div>)}</div></AbsoluteFill>}
 if(number===18){const [black]=val('ink');const [label]=val('label');const [scale,angle]=val('carrier');
 // patch-b1：原版 f88–127 整屏由黑渐变到白、f95–136 胶囊由白渐变到黑，中途是整屏灰底和三档灰胶囊。
 // 改为同一条竖线从左向右扫过（f92–136，原两段渐变的总时窗）：线左侧白底黑胶囊、右侧黑底白胶囊，任何一帧只有黑白。
 const edge=B018_WIPE(frame)*1920;const swap=frame>=92;
 return <AbsoluteFill style={{background:frame<42?'white':swap?'#000':`rgb(${val('backgroundGray')[0]},${val('backgroundGray')[0]},${val('backgroundGray')[0]})`}}>{swap&&<div style={{position:'absolute',inset:0,background:'#fff',clipPath:`inset(0 ${1920-edge}px 0 0)`}}/>}{frame<42&&<div style={{position:'absolute',inset:0,background:'#000',filter:'blur(3px)',clipPath:`polygon(${data.objects.carrierPolygons[Math.floor(frame)].map((p:number[])=>`${p[0]/1920*100}% ${p[1]/1080*100}%`).join(',')})`}}/>}{[0,1,2,3].map(i=>{const [x,y,w,h]=val('pill'+i);const shade=swap?(edge>=1920?0:255):Math.round(255*(1-val('ink'+i)[0]));const fill=swap&&edge<1920?Math.max(0,Math.min(w,edge-x)):0;return <div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,background:`rgb(${shade},${shade},${shade})`,borderRadius:58,boxShadow:(swap?edge>x+w/2:black>.5)?'30px 14px 20px #0004':undefined,display:'flex',alignItems:'center',justifyContent:'center',...textStyle,fontSize:142,overflow:'hidden'}}>{fill>0&&<div style={{position:'absolute',left:0,top:0,width:fill,height:'100%',background:'#000'}}/>}{i===0&&<span style={{opacity:label,position:'relative'}}>{words[0]}</span>}</div>})}{frame>=177&&frame<330&&<div style={{position:'absolute',left:val('workflowBox')[0],top:val('workflowBox')[1],width:1098,height:600,borderRadius:48,overflow:'hidden'}}><Media name="workflow-eighteen" smoothFrame={frame}/></div>}{frame>=310&&frame<462&&<div style={{position:'absolute',left:val('infoMotion')[0],top:val('infoMotion')[1],width:920,...textStyle,fontSize:220,opacity:val('infoMotion')[2]}}>{words[1]}</div>}{[0,1].map(i=>frame>(i?552:488)&&<div key={i} style={{position:'absolute',left:i?1320:120,top:430,width:480,height:390,transform:`scale(${clamp((frame-(i?552:488))/24)})`}}>{/* patch-b1：原为 1600×900 的 SVG 缩进 480 宽（条目实际约 13px、带“FRED / 示例记录”眉题、浅紫灰底）。改为同位置 480×390 白卡：去眉题，标题 56px、条目 38px，墨色圆点，kit 软阴影 */}<B018Card {...B018_CARDS[i]}/></div>)}</AbsoluteFill>}
 const [x,y,w,h]=val('card');const [op,ty,ts]=val('title');const o=data.objects;return <AbsoluteFill style={{background:'white'}}>{[0,1,2].map(i=>{const [cardX,cardY,cardW,cardH]=val('card'+i);const replace=clamp((frame-o.replaceFrames[i])/o.replacementTransitionFrames);return <div key={i} style={{position:'absolute',left:cardX,top:cardY,width:cardW,height:cardH,borderRadius:o.card.radius*cardW/468,background:'#969696',overflow:'hidden',boxShadow:'30px 16px 22px #0004'}}><div style={{width:'100%',height:'100%',opacity:clamp((frame-[22,-8,60][i])/24)}}><Media name={`category-${i}`}/></div><div style={{position:'absolute',inset:0,background:'black',opacity:replace}}/><div style={{position:'absolute',top:'50%',left:0,width:'100%',transform:'translateY(-50%)',...textStyle,color:'white',fontSize:o.card.textSize*cardW/468,textAlign:'center',lineHeight:1.08,opacity:clamp((frame-[22,-8,60][i])/24)}}><span style={{opacity:1-replace}}>{words[i]}</span><span style={{position:'absolute',left:0,top:'50%',transform:'translateY(-50%)',width:'100%',fontSize:o.card.replacementTextSize*cardW/468,opacity:replace}}>{words[6+i].slice(0,2)}<br/>{words[6+i].slice(2)}</span></div></div>})}{(()=>{const [lx,ly,size,reveal]=val('titleLeft');const [rx,ry,rightOpacity]=val('titleRight');const [joinScale,joinAngle,joinY]=val('titleJoin');return <>
 <div style={{position:'absolute',left:lx+(760+(1392-760)*(size-126)/(210-126))/2,top:ly,transform:'translateX(-50%)',...textStyle,fontSize:size,lineHeight:1,whiteSpace:'nowrap',clipPath:`inset(0 ${(1-reveal)*100}% 0 0)`}}>{words[3]}</div>
 <div style={{position:'absolute',left:rx+300,top:ry,transform:'translateX(-50%)',...textStyle,fontSize:126,lineHeight:1,whiteSpace:'nowrap',opacity:rightOpacity}}>{words[4]}</div>
 <div style={{position:'absolute',left:882,top:joinY,width:210,...textStyle,fontSize:140,lineHeight:1,textAlign:'center',transform:`scale(${joinScale}) rotate(${joinAngle}deg)`}}>{words[5]}</div>
 </>})()}{frame>=o.endHandoff.headingOnsetOutputFrame&&<><div style={{position:'absolute',left:400,top:18,width:1120,textAlign:'center',...textStyle,fontSize:110,opacity:clamp((frame-o.endHandoff.headingOnsetOutputFrame)/20),textShadow:'4px 4px 7px #0008'}}>{words[6]}</div>{[0,1].map(i=><div key={i} style={{position:'absolute',left:i?1390:280,top:998,width:260,textAlign:'center',...textStyle,fontSize:64,transform:`scale(${.4+.6*clamp((frame-753)/25)})`,transformOrigin:'center bottom',textShadow:'3px 3px 5px #0007'}}>{words[i?4:3]}</div>)}{frame>=776&&[0,1].map(i=><div key={i} style={{position:'absolute',left:i?1920-clamp((frame-776)/3)*8:-520+clamp((frame-776)/3)*8,top:170,width:520,height:740,borderRadius:40,overflow:'hidden'}}><Media name={`category-${i?2:0}`}/></div>)}</>}</AbsoluteFill>
}
