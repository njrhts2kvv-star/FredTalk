import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../../../../surface-purple.ts";
import {Document014} from './ReferenceInterfaces';
import {Workflow026} from './Workflow026';
import r015 from '../../../../specs/R015.json';
import {SearchPhone014} from './SearchPhone014';
import r024 from '../../../../specs/R024.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
import React,{useEffect,useState} from 'react';
import {delayRender,continueRender,cancelRender} from 'remotion';
import r016 from '../../../../specs/R016.json';
import {Media as SharedMedia} from './Media';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
type Media = {startFrame?:number;src:string;type?:'image'|'video';fit?:'cover'|'contain';position?:string};
export type BatchAProps={media?:Media[]};
const video=(name:string):Media=>({src:`revision/${name}.mp4`,type:'video',fit:'contain'});
const still=(name:string):Media=>({src:`revision/${name}.jpg`,fit:'contain'});
const landscapeMedia:Media[]=[video('fred-mic-magnet'),video('fred-conversation'),video('fred-team-meeting'),video('fred-family'),video('fred-mic-power'),video('fred-mic-clip'),video('fred-conversation'),video('fred-family')];
const portraitMedia:Media[]=[video('fred-conversation'),video('fred-walk-portrait'),video('fred-meeting-portrait'),video('fred-street-portrait'),still('fred-walk-portrait'),still('fred-meeting-portrait'),{src:'revision/note-0.svg',fit:'contain'},still('fred-street-portrait')];
const defaults=portraitMedia;
const at=(media:Media[]|undefined,n:number)=>(media?.length?media:defaults)[n%(media?.length||defaults.length)];
const v=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ease=(t:number,a:number,b:number)=>{const p=v(t,a,b);return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const time=()=>{const f=useCurrentFrame(),{fps}=useVideoConfig();return f/fps};
const Asset:React.FC<{m:Media;style?:React.CSSProperties}>=({m,style})=><SharedMedia startFrame={m.startFrame} src={m.src} fit={m.fit||'cover'} style={{objectPosition:m.position||'50% 50%',...style}}/>;
const Card:React.FC<{m:Media;x:number;y:number;w:number;h:number;r?:number;style?:React.CSSProperties}>=({m,x,y,w,h,r=28,style})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r,overflow:'hidden',background:'#141618',boxShadow:'13px 10px 22px #0005',...style}}><Asset m={m}/></div>;
const Stage:React.FC<React.PropsWithChildren>=({children})=><AbsoluteFill style={{background:'#fff',overflow:'hidden',fontFamily:'FredHeavy,FredRegular,sans-serif'}}>{children}</AbsoluteFill>;
const BlurScreen:React.FC<{m:Media;blur:number;opacity?:number}>=({m,blur,opacity=1})=><Card m={m} x={24} y={14} w={1232} h={688} r={14} style={{filter:`blur(${blur}px)`,opacity}}/>;
const Green:React.FC<{children:React.ReactNode;x?:number;y?:number;opacity?:number;scale?:number;color?:string}>=({children,x=0,y=280,opacity=1,scale=1,color="#ffffff"})=><div style={{position:'absolute',left:x,top:y,width:1280,textAlign:'center',color,fontSize:103,fontWeight:900,letterSpacing:8,opacity,transform:`scale(${scale})`,textShadow:'0 3px 10px #000c',WebkitTextStroke:'1px #0008'}}>{children}</div>;

// 014: desktop -> single phone -> phone/portrait/social row -> vertical blur exit.
export const Clip014:React.FC<BatchAProps>=({media})=>{
 const t=time(),swap=ease(t,.7,1.15),pair=ease(t,4.78,5.5),avatar=ease(t,5.05,5.45),exit=ease(t,7.15,7.7);
 return <Stage><div style={{position:'absolute',inset:-70,filter:'blur(17px)',transform:`translateX(${-t*32}px) scale(1.15)`}}><Asset m={at(media,0)}/></div>
 <div style={{position:'absolute',inset:0,background:'#fff4'}}/>
 <div style={{position:'absolute',inset:0,transform:`translateY(${exit*-850}px)`,filter:`blur(${exit*22}px)`}}>
 <div style={{position:'absolute',left:66-swap*1430,top:38,width:1148,height:646,borderRadius:44,overflow:'hidden',boxShadow:'14px 14px 20px #0004'}}><Document014/></div>
 <div style={{position:'absolute',left:mix(476,85.33,pair)+(1-swap)*900,top:16,width:326.67,height:672,borderRadius:62,border:'10px solid #101010',boxSizing:'border-box',background:'#fff',overflow:'hidden',boxShadow:'10px 9px 20px #0006'}}>
 <SearchPhone014 seconds={t}/><div style={{position:'absolute',top:12,left:86,width:124,height:27,borderRadius:20,background:'#000'}}/>
 </div>
 <div style={{position:'absolute',left:768,top:228,width:152,height:152,borderRadius:'50%',border:'7px solid white',overflow:'hidden',opacity:ease(t,5.05,5.25),transform:`scale(${avatar})`}}><Asset m={at(media,1)}/></div>
 {[0,1,2].map((i)=><div key={i} style={{position:'absolute',top:480,left:590+i*220,opacity:ease(t,5.25+i*.15,5.55+i*.15),transform:`scale(${mix(.4,1,ease(t,5.25+i*.15,5.55+i*.15))})`,color:'#8960CA',fontSize:72}}><svg width="76" height="76" viewBox="0 0 24 24" fill="currentColor"><path d={i===0?'M2 10h4v12H2z M8 10l5-8c3 0 2 4 1 6h6c2 0 2 2 1 5l-2 7H8z':i===1?'M14 2l9 8-9 8v-5C6 13 3 17 1 22 1 12 5 7 14 7z':'M12 1l3.5 7.1 7.8 1.1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.4-7.8L.7 9.2l7.8-1.1z'}/></svg></div>)}
 </div><div style={{position:'absolute',inset:0,background:'#000',opacity:ease(t,7.33,7.7)}}/><div style={{position:'absolute',left:88,top:mix(690,430,ease(t,7.15,7.52)),width:1104,height:18,borderRadius:'50%',background:'#edffff',boxShadow:'0 0 14px 7px #bfffff,0 0 38px 14px #58bfd999',filter:`blur(${2+10*ease(t,7.42,7.65)}px)`,opacity:ease(t,7.02,7.16)*(1-ease(t,7.5,7.69))}}/></Stage>;
};

// 015: a constant large media window, lateral media handoffs, original overlay cadence.
export const Clip015:React.FC<BatchAProps>=({media=landscapeMedia})=>{
 const t=time();
 const [gate]=useState(()=>delayRender('R015 selected font'));
 useEffect(()=>{const font=new FontFace('SourceHanR015',`url(${staticFile(r015.fonts[0].file)})`,{weight:'900'});font.load().then(a=>{document.fonts.add(a);continueRender(gate)}).catch(cancelRender)},[gate]);
 const scenes=[{start:0,end:2.4,idx:0},{start:2.4,end:4.1,idx:4},{start:4.1,end:5.7,idx:5},{start:5.7,end:8.3,idx:1},{start:8.3,end:12.7,idx:2},{start:12.7,end:14.45,idx:3},{start:14.45,end:16.1,idx:6},{start:16.1,end:24.5,idx:0}];
 const blur=(ease(t,10.7,11)*(1-ease(t,13.08,13.35))+ease(t,20.13,20.35)*(1-ease(t,22.35,22.5)))*13;
 return <Stage>{scenes.map((s,i)=>{
 if(t<s.start-.35||t>s.end+.35)return null;
 const entrance=i?ease(t,s.start-.15,s.start+.15):1,leave=i===7?0:ease(t,s.end-.15,s.end+.15);
 const shift=i===6?1280*ease(t,15.85,16.2):i===7?-1280*(1-ease(t,15.85,16.2)):0;
 return <Card key={i} m={{...at(media,s.idx),startFrame:Math.round(s.start*60)}} x={98+shift} y={56-650*(1-ease(t,0,.35))} w={1084} h={608} r={28} style={{opacity:entrance*(1-leave),filter:`blur(${blur}px)`}}/>;
 })}
 {r015.objects.labels.map((label,i)=>{const[cx,top,opacity]=measured(r015 as ClipSpec,`label${i}`,t*60);return <div key={i} style={{position:'absolute',left:cx/1.5,top:(top-31)/1.5,transform:'translateX(-50%)',fontFamily:'SourceHanR015',fontSize:110,fontWeight:900,letterSpacing:14,whiteSpace:'nowrap',color:'#8960ca',lineHeight:1.2,textShadow:'6px 8px 5px #0008',opacity}}>{label}</div>})}
 </Stage>;
};

// 016: one window establishes four media; background then defocuses behind two claims.
export const Clip016:React.FC<BatchAProps>=({media=[video('fred-conversation'),video('fred-mic-clip'),video('fred-mic-magnet'),video('fred-mic-power'),video('fred-family'),video('fred-team-meeting')]})=>{
 const t=time(),f=t*60,p=ease(t,0,.42),blur=measured(r016 as ClipSpec,'blur',f)[0];
 const [gate]=useState(()=>delayRender('R016 selected font'));
 useEffect(()=>{const font=new FontFace('SourceHanR016',`url(${staticFile(r016.fonts[0].file)})`,{weight:'900'});font.load().then(a=>{document.fonts.add(a);continueRender(gate)}).catch(cancelRender)},[gate]);
 const loc=[[39.33,15.33],[664.67,15.33],[39.33,380.67],[664.67,380.67]];
 return <Stage><div style={{position:'absolute',inset:0,filter:`blur(${blur/1.5}px)`}}>{loc.map(([x,y],i)=><Card key={i} m={{...at(media,[4,0,5,1][i]),fit:'cover'}} x={mix(101.33,x,p)} y={mix(55.33,y,p)} w={mix(1079.33,576,p)} h={mix(608,324,p)} r={16} style={{opacity:i===1?1:p}}/>)}</div>
 {['随身记录','留下真实经历'].map((label,i)=>{const[opacity,top]=measured(r016 as ClipSpec,`title${i}`,f);return <div key={i} style={{position:'absolute',left:0,top:(top-31)/1.5,width:1280,textAlign:'center',fontFamily:'SourceHanR016',fontSize:110,fontWeight:900,letterSpacing:14,color:'#8960ca',lineHeight:1.2,textShadow:'6px 8px 5px #0008',opacity}}>{label}</div>})}
 </Stage>;
};

const prompt='请整理 Mic Pro 的会议录音，\n把真实记录交给我的 Codex。\n按下面的结构生成会议笔记：\n- 主题：本次讨论的核心问题\n- 结论：已确认的决定和原因\n- 待办：负责人、事项和时间\n- 线索：保留关键原话与时间戳\n区分已经确认和仍待讨论的内容。\n不要补写录音中没有的信息。\n保存到我的 Obsidian 知识库，\n方便后续检索和继续推进。';
export const Clip017:React.FC<BatchAProps>=()=>{
 const t=time(),entry=ease(t,0,.4),replace=ease(t,1.88,2.35),title=ease(t,2.4,2.95);
 return <Stage><div style={{position:'absolute',left:171,top:mix(-725,24,entry),width:938,height:666,borderRadius:17,overflow:'hidden',background:'#1f2527',boxShadow:'16px 12px 19px #0005',border:'3px solid #45494a'}}>
 <div style={{height:52,background:'#141a1c',display:'flex',alignItems:'center',paddingLeft:30,gap:13}}>{['#ed656c','#e4c246','#9a74dd'].map(c=><span key={c} style={{width:13,height:13,borderRadius:'50%',background:c}}/>)}</div>
 <div style={{position:'absolute',left:65,top:107,whiteSpace:'pre-line',fontSize:41,lineHeight:1.08,fontWeight:900,letterSpacing:1,color:DARK_PURPLE,opacity:1-replace}}>{prompt}</div>
 <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:86,fontWeight:900,letterSpacing:8,color:DARK_PURPLE,opacity:title}}>声音记录 + Codex</div>
 </div></Stage>;
};

// 024: document-to-portrait focus, detail zoom, then sequential three-card editorial carousel.
export const Clip024:React.FC<BatchAProps>=({media})=>{
 const t=time(),first=ease(t,.55,1.4),zoom=ease(t,2.55,3.02)*(1-ease(t,5.0,5.45)),triple=ease(t,9.6,15.0);
 const firstX=t<9.4?448:mix(448,22,ease(t,9.4,10.2));
 const [detailZoom,facePan]=measured(r024 as ClipSpec,'detailCamera',t*60);
 const lastExit=ease(t,24.1,25.66);
 return <Stage><div style={{position:'absolute',left:24,top:14,width:1232,height:688,borderRadius:14,overflow:'hidden',filter:`blur(${first*12}px)`,background:'#181818'}}><div style={{position:'absolute',width:1920,height:1080,transform:'scale(.642)',transformOrigin:'0 0'}}><Workflow026 frame={210}/></div></div>
 {t<11.05&&<div style={{position:'absolute',left:mix(mix(710,firstX,first),26.667,detailZoom),top:mix(mix(180,28.667,first),0,detailZoom),width:mix(mix(250,372,first),1226.667,detailZoom),height:mix(mix(390,658,first),720,detailZoom),borderRadius:mix(36,0,detailZoom),overflow:'hidden',opacity:first*(1-ease(t,10.7,11.05))}}><div style={{position:'absolute',left:mix(0,-626.667,detailZoom),top:mix(0,mix(-1517.33,-1090.67,facePan),detailZoom),width:mix(mix(250,372,first),2400,detailZoom),height:mix(mix(390,658,first),4266.667,detailZoom)}}><Asset m={{...at(media,1),fit:'cover'}}/></div></div>}
 {t>=9.4&&t<12.7&&<Card m={at(media,2)} x={mix(1360,448,ease(t,9.4,10.2))-ease(t,11.15,11.9)*426} y={10} w={384} h={704} r={24}/>}
 {t>=11.15&&t<15&&<Card m={at(media,3)} x={mix(1360,448,ease(t,11.15,11.9))} y={10} w={384} h={704} r={24}/>}
 {t>=12.5&&t<15&&<Card m={at(media,6)} x={mix(1370,874,ease(t,12.5,13.25))} y={10} w={384} h={704} r={24}/>}
 {t>=13.2&&t<15&&<Card m={at(media,2)} x={22} y={mix(730,10,ease(t,13.2,14))} w={384} h={704} r={24}/>}
 {t>=14.5&&[0,1,2].map(i=>{
 const flip=ease(t,17.1+i*.8,17.75+i*.8),ex=lastExit*(i===1?-1:1);
 return <React.Fragment key={i}><Card m={at(media,[2,3,6][i])} x={22+i*426} y={10} w={384} h={704} r={24} style={{opacity:(1-flip)*v(t,14.5,15)}}/>
 <Card m={at(media,[4,7,5][i])} x={22+i*426} y={10+ex*900} w={384} h={704} r={24} style={{transform:`perspective(1400px) rotateY(${(1-flip)*90}deg) scale(${1-lastExit*.12})`,opacity:flip}}/></React.Fragment>;
 })}</Stage>;
};

// 025: two source cards rise from the workflow, followed by matched pair dissolves.
export const Clip025:React.FC<BatchAProps>=({media})=>{
 const t=time(),p=ease(t,.25,.85),white=ease(t,1.75,2.2);const cuts=[0,1.8,3.25,4.6,6];
 return <Stage><div style={{position:'absolute',inset:0,filter:`blur(${p*11}px)`,opacity:1-white}}><Workflow026 frame={210}/></div>
 {[0,1,2,3].map(group=>{const alpha=group===0?1-ease(t,cuts[1],cuts[1]+.22):ease(t,cuts[group],cuts[group]+.22)*(1-ease(t,cuts[group+1],cuts[group+1]+.22));if(alpha<=0)return null;return [0,1].map(i=><Card key={`${group}-${i}`} m={at(media,1+(group*2+i)%7)} x={mix(i?1050:92,i?742:108,p)} y={mix(i?185:80,10,p)} w={mix(i?190:118,448,p)} h={mix(i?276:220,704,p)} r={43} style={{opacity:alpha*p}}/>);})}</Stage>;
};

// 027: matched portrait pair opens a central third slot; middle and right become close-up pair.
export const Clip027:React.FC<BatchAProps>=({media})=>{
 const t=time(),entry=ease(t,.1,.8),three=ease(t,1.9,2.7),two=ease(t,4.45,5.0),exit=ease(t,6.55,7.13);
 return <Stage><div style={{position:'absolute',inset:0,filter:`blur(${entry*12}px)`}}><Workflow026 frame={210}/></div>
 <Card m={at(media,1)} x={mix(260,105,entry)-three*83-two*700-exit*900} y={mix(163,10,entry)} w={mix(220,400,entry)} h={mix(340,704,entry)} r={30} style={{opacity:entry}}/>
 <Card m={at(media,2)} x={mix(875,735,entry)+three*139-two*232+exit*950} y={mix(371,10,entry)} w={mix(250,400,entry)+two*218} h={mix(320,704,entry)} r={30} style={{opacity:entry}}/>
 <Card m={at(media,3)} x={mix(607,448,three)-two*428-exit*980} y={mix(360,75,three)-two*65} w={mix(55,384,three)+two*234} h={mix(70,580,three)+two*124} r={32} style={{opacity:ease(t,1.9,2.02)}}/>
 </Stage>;
};
export const batchAMetadata=[{id:'014',fps:30,durationInFrames:231},{id:'015',fps:60,durationInFrames:1437},{id:'016',fps:60,durationInFrames:378},{id:'017',fps:60,durationInFrames:235},{id:'024',fps:60,durationInFrames:1060},{id:'025',fps:60,durationInFrames:350},{id:'027',fps:60,durationInFrames:428}];
