// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Media as SharedMedia} from './Media';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
type Media = {src:string;type?:'image'|'video';fit?:'cover'|'contain';position?:string};
export type BatchAProps={media?:Media[]};
const defaults:Media[]=[{src:'shared/screen.mp4',type:'video'},{src:'shared/portrait-1.png'},{src:'shared/portrait-2.png'},{src:'shared/portrait-3.png'},{src:'shared/landscape-1.mp4',type:'video'},{src:'shared/landscape-2.mp4',type:'video'},{src:'shared/portrait-4.png'},{src:'shared/landscape-3.mp4',type:'video'}];
const at=(media:Media[]|undefined,n:number)=>(media?.length?media:defaults)[n%(media?.length||defaults.length)];
const v=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const ease=(t:number,a:number,b:number)=>{const p=v(t,a,b);return p*p*(3-2*p)};
const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
const time=()=>{const f=useCurrentFrame(),{fps}=useVideoConfig();return f/fps};
const Asset:React.FC<{m:Media;style?:React.CSSProperties}>=({m,style})=><SharedMedia src={m.src} fit={m.fit||'cover'} style={{objectPosition:m.position||'50% 50%',...style}}/>;
const Card:React.FC<{m:Media;x:number;y:number;w:number;h:number;r?:number;style?:React.CSSProperties}>=({m,x,y,w,h,r=28,style})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r,overflow:'hidden',background:'#141618',boxShadow:'13px 10px 22px #0005',...style}}><Asset m={m}/></div>;
const Stage:React.FC<React.PropsWithChildren>=({children})=><AbsoluteFill style={{background:'#fff',overflow:'hidden',fontFamily:'FredHeavy,FredRegular,sans-serif'}}>{children}</AbsoluteFill>;
const BlurScreen:React.FC<{m:Media;blur:number;opacity?:number}>=({m,blur,opacity=1})=><Card m={m} x={24} y={14} w={1232} h={688} r={14} style={{filter:`blur(${blur}px)`,opacity}}/>;
const Green:React.FC<{children:React.ReactNode;x?:number;y?:number;opacity?:number;scale?:number}>=({children,x=0,y=280,opacity=1,scale=1})=><div style={{position:'absolute',left:x,top:y,width:1280,textAlign:'center',color:'#8960ca',fontSize:103,fontWeight:900,letterSpacing:8,opacity,transform:`scale(${scale})`,textShadow:'2px 4px 5px #0006'}}>{children}</div>;

// 014: desktop -> single phone -> phone/portrait/social row -> vertical blur exit.
export const Clip014:React.FC<BatchAProps>=({media})=>{
 const t=time(),swap=ease(t,.7,1.15),pair=ease(t,4.4,5.2),avatar=ease(t,4.27,4.8),exit=ease(t,7.15,7.7);
 return <Stage><div style={{position:'absolute',inset:-70,filter:'blur(17px)',transform:`translateX(${-t*32}px) scale(1.15)`}}><Asset m={at(media,0)}/></div>
 <div style={{position:'absolute',inset:0,background:'#fff4'}}/>
 <div style={{position:'absolute',inset:0,transform:`translateY(${exit*-850}px)`,filter:`blur(${exit*22}px)`}}>
 <Card m={at(media,0)} x={66-swap*1430} y={38} w={1148} h={646} r={44}/>
 <div style={{position:'absolute',left:mix(482,92,pair)+(1-swap)*900,top:20,width:316,height:675,borderRadius:58,border:'10px solid #101010',background:'#fff',overflow:'hidden',boxShadow:'10px 9px 20px #0006'}}>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-Math.max(0,t-2.8)*20}px) scale(1.05)`}}><Asset m={media?at(media,t<2.9?4:5):{src:'shared/phone.mp4',type:'video'}}/></div><div style={{position:'absolute',top:12,left:86,width:124,height:27,borderRadius:20,background:'#000'}}/>
 </div>
 <div style={{position:'absolute',left:768,top:250,width:148,height:148,borderRadius:'50%',border:'7px solid white',overflow:'hidden',opacity:ease(t,4.3,4.47),transform:`scale(${avatar})`}}><Asset m={at(media,1)}/></div>
 {[0,1,2].map((i)=><div key={i} style={{position:'absolute',top:480,left:590+i*220,opacity:ease(t,5.25+i*.15,5.55+i*.15),transform:`scale(${mix(.4,1,ease(t,5.25+i*.15,5.55+i*.15))})`,color:'#2869ff',fontSize:72}}><svg width="76" height="76" viewBox="0 0 24 24" fill="currentColor"><path d={i===0?'M2 10h4v12H2z M8 10l5-8c3 0 2 4 1 6h6c2 0 2 2 1 5l-2 7H8z':i===1?'M14 2l9 8-9 8v-5C6 13 3 17 1 22 1 12 5 7 14 7z':'M12 1l3.5 7.1 7.8 1.1-5.7 5.5 1.4 7.8-7-3.7-7 3.7 1.4-7.8L.7 9.2l7.8-1.1z'}/></svg></div>)}
 </div><div style={{position:'absolute',inset:0,background:'#000',opacity:ease(t,7.42,7.65)}}/></Stage>;
};

// 015: a constant large media window, lateral media handoffs, original overlay cadence.
export const Clip015:React.FC<BatchAProps>=({media})=>{
 const t=time();
 const scenes=[{start:0,end:2.4,idx:0},{start:2.4,end:4.1,idx:4},{start:4.1,end:5.7,idx:5},{start:5.7,end:8.3,idx:1},{start:8.3,end:12.7,idx:2},{start:12.7,end:14.45,idx:3},{start:14.45,end:16.1,idx:6},{start:16.1,end:24.5,idx:0}];
 const blur=(t>10.3&&t<12.7)||(t>19.3&&t<22.4)?8:0;
 return <Stage>{scenes.map((s,i)=>{
 if(t<s.start-.35||t>s.end+.35)return null;
 const entrance=i?ease(t,s.start-.15,s.start+.15):1,leave=i===7?0:ease(t,s.end-.15,s.end+.15);
 const shift=i===6?1280*ease(t,15.85,16.2):i===7?-1280*(1-ease(t,15.85,16.2)):0;
 return <Card key={i} m={at(media,s.idx)} x={98+shift} y={56-650*(1-ease(t,0,.35))} w={1084} h={608} r={28} style={{opacity:entrance*(1-leave),filter:`blur(${blur}px)`}}/>;
 })}
 {t>.8&&t<2.6&&<Green opacity={v(t,.8,1.1)*(1-v(t,2.2,2.6))}>视频？</Green>}
 {t>2.6&&t<3.6&&<Green x={mix(0,-1300,ease(t,3.15,3.6))} opacity={v(t,2.6,2.85)}>PPT？</Green>}
 {t>4.9&&t<6.2&&<Green opacity={v(t,4.9,5.15)*(1-v(t,5.85,6.2))}>程序？</Green>}
 {t>10.35&&t<12.7&&<><Green x={-210} opacity={v(t,10.35,10.65)}>找剪辑</Green><Green x={220} opacity={v(t,11.35,11.65)}>找技术</Green></>}
 {t>19.3&&t<22.5&&<><Green y={135} opacity={v(t,19.3,19.65)}>找模板</Green><Green y={295} opacity={v(t,20.1,20.45)}>找工具</Green><Green y={465} opacity={v(t,21.1,21.45)}>充会员</Green></>}
 </Stage>;
};

// 016: one window establishes four media; background then defocuses behind two claims.
export const Clip016:React.FC<BatchAProps>=({media})=>{
 const t=time(),p=ease(t,0,.42),b=ease(t,2.0,2.5)*(1-ease(t,4.75,5.2));
 const loc=[[38,16],[665,16],[38,384],[665,384]];
 return <Stage><div style={{position:'absolute',inset:0,filter:`blur(${b*10}px)`}}>{loc.map(([x,y],i)=><Card key={i} m={at(media,[4,0,5,1][i])} x={mix(98,x,p)} y={mix(56,y,p)} w={mix(1084,576,p)} h={mix(608,324,p)} r={14} style={{opacity:i===1?1:p}}/>)}</div>
 {t>=2&&t<4.08&&<Green opacity={v(t,2,2.25)*(1-v(t,3.9,4.08))} scale={mix(.93,1,ease(t,2,2.35))}>不是视频</Green>}
 {t>=4.08&&t<5.15&&<Green opacity={v(t,4.08,4.3)*(1-v(t,4.9,5.15))}>HTML代码</Green>}
 </Stage>;
};

const prompt='帮我做一个【时长】秒的HTML网页视\n频，内容是介绍【主题】。\n整体风格选【风格】，感觉要【档次】\n动效按这个来：\n- 背景：【背景效果】\n- 文字出现：【文字效果】\n- 画面切换：【转场效果】\n- 数字和图表：【数据效果】\n整体观感选【观感风格】。\n动画形式选【动画形式】。\n要求：打开就自动播放，流畅不卡。';
export const Clip017:React.FC<BatchAProps>=()=>{
 const t=time(),entry=ease(t,0,.4),replace=ease(t,1.88,2.35),title=ease(t,2.4,2.95);
 return <Stage><div style={{position:'absolute',left:171,top:mix(-725,24,entry),width:938,height:666,borderRadius:17,overflow:'hidden',background:'#212123',boxShadow:'16px 12px 19px #0005',border:'3px solid #212123'}}>
 <div style={{height:52,background:'#161618',display:'flex',alignItems:'center',paddingLeft:30,gap:13}}>{['#8554E8','#aaa','#eee'].map(c=><span key={c} style={{width:13,height:13,borderRadius:'50%',background:c}}/>)}</div>
 <div style={{position:'absolute',left:65,top:107,whiteSpace:'pre-line',fontSize:41,lineHeight:1.08,fontWeight:900,letterSpacing:1,color:'#fff',opacity:1-replace}}>{prompt.split(/(【[^】]*】)/).map((part,i)=>part.startsWith('【')?<span key={i} style={{color:'#D6BEFF'}}>{part}</span>:part)}</div>
 <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:98,fontWeight:900,letterSpacing:8,color:'#fff',opacity:title}}>提示词+<span style={{color:'#D6BEFF'}}>AI工具</span></div>
 </div></Stage>;
};

// 024: document-to-portrait focus, detail zoom, then sequential three-card editorial carousel.
export const Clip024:React.FC<BatchAProps>=({media})=>{
 const t=time(),first=ease(t,.55,1.4),zoom=ease(t,1.95,2.5)*(1-ease(t,3.65,4.4)),triple=ease(t,9.6,15.0);
 const firstX=t<9.4?448:mix(448,22,ease(t,9.4,10.2));
 const lastExit=ease(t,24.1,25.66);
 return <Stage><BlurScreen m={at(media,0)} blur={first*12}/>
 {t<11.05&&<Card m={at(media,1)} x={mix(710,firstX,first)-zoom*510} y={mix(180,10,first)-zoom*620} w={mix(250,384,first)+zoom*1040} h={mix(390,704,first)+zoom*1700} r={20} style={{opacity:first*(1-ease(t,10.7,11.05))}}/>}
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
 return <Stage><BlurScreen m={at(media,0)} blur={p*11} opacity={1-white}/>
 {[0,1,2,3].map(group=>{const alpha=group===0?1-ease(t,cuts[1],cuts[1]+.22):ease(t,cuts[group],cuts[group]+.22)*(1-ease(t,cuts[group+1],cuts[group+1]+.22));if(alpha<=0)return null;return [0,1].map(i=><Card key={`${group}-${i}`} m={at(media,1+(group*2+i)%7)} x={mix(i?1050:92,i?742:108,p)} y={mix(i?185:80,10,p)} w={mix(i?190:118,448,p)} h={mix(i?276:220,704,p)} r={43} style={{opacity:alpha*p}}/>);})}</Stage>;
};

// 027: matched portrait pair opens a central third slot; middle and right become close-up pair.
export const Clip027:React.FC<BatchAProps>=({media})=>{
 const t=time(),entry=ease(t,.1,.8),three=ease(t,1.9,2.7),two=ease(t,4.45,5.0),exit=ease(t,6.55,7.13);
 return <Stage><BlurScreen m={at(media,0)} blur={entry*12}/>
 <Card m={at(media,1)} x={mix(260,105,entry)-three*83-two*700-exit*900} y={mix(163,10,entry)} w={mix(220,400,entry)} h={mix(340,704,entry)} r={30} style={{opacity:entry}}/>
 <Card m={at(media,2)} x={mix(875,735,entry)+three*139-two*232+exit*950} y={mix(371,10,entry)} w={mix(250,400,entry)+two*218} h={mix(320,704,entry)} r={30} style={{opacity:entry}}/>
 <Card m={at(media,3)} x={mix(607,448,three)-two*428-exit*980} y={mix(360,75,three)-two*65} w={mix(55,384,three)+two*234} h={mix(70,580,three)+two*124} r={32} style={{opacity:ease(t,1.9,2.02)}}/>
 </Stage>;
};
export const batchAMetadata=[{id:'014',fps:30,durationInFrames:231},{id:'015',fps:60,durationInFrames:1437},{id:'016',fps:60,durationInFrames:378},{id:'017',fps:60,durationInFrames:235},{id:'024',fps:60,durationInFrames:1540},{id:'025',fps:60,durationInFrames:350},{id:'027',fps:60,durationInFrames:428}];
