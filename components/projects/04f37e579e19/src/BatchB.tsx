import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import {XScenesB} from './XScenesB';
import {RootTextScenes} from './RootTextScenes';
import React, {CSSProperties} from 'react';
import calibration from './calibration-b.json';
import {RemainingB} from './RemainingB';
import {MediaScenesB} from './MediaScenesB';
import {AbsoluteFill, Img} from 'remotion';

type Props={id:string;t:number;duration:number;overrides?:{words?:string[];assets?:Record<string,string>;accent?:string}};
const ink='#171719';
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x)};
const p=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const mix=(a:number,b:number,v:number)=>a+(b-a)*v;
const pos=(x:number,y:number,w:number,h:number):CSSProperties=>({position:'absolute',left:x,top:y,width:w,height:h});
const shadow='0 20px 55px rgba(0,0,0,.12)';
const label=(s:string,t:number,start:number,speed=15)=>s.slice(0,Math.max(0,Math.floor((t-start)*speed)));
const defaultImages=['41-room.jpg','41-car.jpg','41-ancient.jpg','41-beads.jpg','26-a.jpg','26-b.jpg','26-c.jpg','27-a.jpg','27-b.jpg','27-c.jpg'];
const resolve=(name:string,o:Props['overrides'])=>staticFile(o?.assets?.[name]||`group-b/${name}`);
const Photo=({name,o,style={}}:{name:string;o:Props['overrides'];style?:CSSProperties})=><Img src={resolve(name,o)} style={{width:'100%',height:'100%',objectFit:'cover',...style}}/>;
const Film=({n=0,o,style={}}:{n?:number;o:Props['overrides'];style?:CSSProperties})=><OffthreadVideo src={resolve(`46-motion${n%2+1}.mp4`,o)} muted style={{width:'100%',height:'100%',objectFit:'cover',...style}}/>;
const Character=({t,o}:{t:number;o:Props['overrides']})=><Img src={o?.assets?.character?staticFile(o.assets.character):staticFile(`group-b/character/${String(Math.min(151,Math.floor(t*30)+1)).padStart(4,'0')}.png`)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>;
const Dots=()=> <div style={{height:44,display:'flex',alignItems:'center',gap:9,paddingLeft:22,background:'#121214'}}>{['#aaa','#777','#8554E8'].map(c=><span key={c} style={{width:10,height:10,borderRadius:20,background:c}}/>)}</div>;
const Frame=({children,style={}}:{children:React.ReactNode;style?:CSSProperties})=><div style={{borderRadius:24,overflow:'hidden',boxShadow:shadow,background:'#fff',...style}}>{children}</div>;
const Doc=({dark=false,accent='#8554E8',title='把想法变成作品',scroll=0}:{dark?:boolean;accent?:string;title?:string;scroll?:number})=><div style={{height:'100%',background:dark?'#202023':'#fff',color:dark?'#f6f6f6':ink,padding:'55px 64px',overflow:'hidden'}}><div style={{transform:`translateY(${-scroll}px)`}}><div style={{fontSize:38,fontWeight:600,marginBottom:30}}>{title}</div>{['01  明确目标与任务','02  让素材成为上下文','03  形成可执行的方案','04  完成作品并持续调整','05  保存结果与工作过程'].map((x,i)=><div key={x} style={{marginBottom:36}}><div style={{fontSize:27,fontWeight:600,marginBottom:13,color:i===2?accent:undefined}}>{x}</div><div style={{fontSize:20,lineHeight:1.8,opacity:.78}}>从真实需求出发，理解当前场景与约束。将每个步骤拆解为明确的动作，让内容、结构与表达保持一致。</div><div style={{fontSize:20,lineHeight:1.8,opacity:.68}}>记录过程，比较结果，再根据反馈完成下一轮调整。</div></div>)}</div></div>;
const Desktop=({accent,children,style={}}:{accent:string;children?:React.ReactNode;style?:CSSProperties})=><Frame style={{...pos(130,85,1660,900),border:'1px solid #dedee4',...style}}><div style={{height:56,borderBottom:'1px solid #eee',display:'flex',alignItems:'center',padding:'0 25px',fontSize:20,fontWeight:600}}>Fred Workspace <span style={{marginLeft:'auto',color:accent}}>●</span></div><div style={{...pos(0,56,240,844),background:'#f6f6f8',padding:'42px 27px',boxSizing:'border-box'}}>{['新建项目','最近使用','我的素材','工作记录'].map((s,i)=><div key={s} style={{fontSize:21,marginBottom:34,color:i===0?accent:'#888'}}>{s}</div>)}</div><div style={{...pos(240,56,1420,844)}}>{children||<><div style={{textAlign:'center',paddingTop:225,fontSize:52,fontWeight:600}}>今天，想完成什么？</div><div style={{textAlign:'center',fontSize:24,color:'#999',marginTop:24}}>从一个想法开始，生成你的下一个作品</div></>}</div></Frame>;
const Input=({text,accent,children,style={}}:{text:string;accent:string;children?:React.ReactNode;style?:CSSProperties})=><div style={{background:'#fff',border:'1px solid #ddd',borderRadius:24,padding:'30px 34px',boxSizing:'border-box',boxShadow:shadow,...style}}>{children}<div style={{fontSize:24,lineHeight:1.7,minHeight:48}}>{text}</div><div style={{marginTop:18,display:'flex',alignItems:'center',fontSize:23,color:'#999'}}><span>＋</span><span style={{marginLeft:24,fontSize:19}}>添加素材</span><span style={{marginLeft:'auto',color:'#fff',background:accent,width:44,height:44,borderRadius:30,textAlign:'center',lineHeight:'44px'}}>↑</span></div></div>;
const Phone=({t,accent,style={},keyboard=false,words}:{t:number;accent:string;style?:CSSProperties;keyboard?:boolean;words?:string[]})=><div style={{width:430,height:930,background:'#111',borderRadius:68,padding:12,boxSizing:'border-box',boxShadow:shadow,...style}}><div style={{height:'100%',background:'#f7f7f8',borderRadius:57,overflow:'hidden',position:'relative'}}><div style={{height:75,padding:'22px 24px',boxSizing:'border-box',fontSize:18,fontWeight:600}}>9:41 <span style={{float:'right'}}>••• ▰</span><div style={{position:'absolute',top:15,left:135,width:140,height:29,borderRadius:30,background:'#111'}}/></div><div style={{padding:'20px 24px',background:'#fff',fontSize:25,borderBottom:'1px solid #eee'}}>‹ <strong style={{marginLeft:55}}>Fred 助手</strong></div><div style={{padding:26,fontSize:22,lineHeight:1.6}}><div style={{background:'#eee',padding:20,borderRadius:15}}>{words?.[0]||'你好，我可以帮助你处理资料、整理内容和创建作品。'}</div>{t>1.5&&<div style={{marginTop:22,marginLeft:50,padding:20,borderRadius:15,background:accent,color:'#fff',opacity:p(t,1.5,1.8)}}>{words?.[1]||'帮我整理这份资料'}</div>}{t>3&&<div style={{marginTop:22,padding:20,borderRadius:15,background:'#fff',opacity:p(t,3,3.25)}}>{label(words?.[2]||'好的，我会先提炼主要信息，再给出清晰的行动步骤。',t,3,14)}</div>}</div><div style={{position:'absolute',bottom:keyboard?250:24,left:20,right:20,height:49,borderRadius:14,background:'#fff',border:'1px solid #e0e0e0',fontSize:18,padding:'10px 18px',boxSizing:'border-box'}}>{keyboard?label('帮我整理这份资料',t,.8,6):'发消息…'}<span style={{float:'right',color:accent}}>＋</span></div>{keyboard&&<div style={{position:'absolute',bottom:0,left:0,right:0,height:225,background:'#dedee3',padding:'16px 9px',boxSizing:'border-box'}}>{['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((row,i)=><div key={row} style={{display:'flex',gap:5,justifyContent:'center',marginBottom:9}}>{[...row].map(k=><span key={k} style={{background:'#fff',borderRadius:5,padding:'9px 7px',fontSize:17}}>{k}</span>)}</div>)}</div>}</div></div>;
const MediaBox=({x,y,w,h,video=false,n=0,o,opacity=1,scale=1}:{x:number;y:number;w:number;h:number;video?:boolean;n?:number;o:Props['overrides'];opacity?:number;scale?:number})=><Frame style={{...pos(x,y,w,h),opacity,transform:`scale(${scale})`}}>{video?<Film n={n} o={o}/>:<Photo name={defaultImages[n%defaultImages.length]} o={o}/>}</Frame>;


// Monotone interpolation through observed native-frame anchors. No global spring substitutes for measured events.
const sampleMeasured=(frame:number,keys:number[][])=>{
 if(frame<=keys[0][0])return keys[0][1];
 for(let i=1;i<keys.length;i++)if(frame<=keys[i][0]){
  const [x0,y0]=keys[i-1],[x1,y1]=keys[i];
  return mix(y0,y1,(frame-x0)/(x1-x0));
 }
 return keys[keys.length-1][1];
};
const CalibratedFilm=({slot,o,camera={}}:{slot:number;o:Props['overrides'];camera?:CSSProperties})=><div style={{width:'100%',height:'100%',...camera}}><OffthreadVideo src={staticFile(o?.assets?.[`slot-${slot}`]||`calibration-b/slot-${slot}.mp4`)} muted playbackRate={.65} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:slot>=4&&slot<=6?'50% 20%':'50% 50%'}}/></div>;

export const BatchB:React.FC<Props>=({id,t,duration,overrides:o})=>{
 if(id==='X025'||id==='X027')return <RootTextScenes id={id} t={t} duration={duration} overrides={o}/>;
 if(['X019','X020','X022','X023','X024','X029'].includes(id))return <XScenesB id={id} t={t} overrides={o}/>;
 const a=o?.accent||'#8554E8';const words=o?.words;const txt=(i:number,s:string)=>words?.[i]??s;
 if(['N038','N040','N043','N044','N045','N046'].includes(id))return <MediaScenesB id={id} t={t} overrides={o}/>;
 if(['N014','N016','N018'].includes(id))return <RemainingB id={id} t={t} overrides={o}/>;
 const shell=(children:React.ReactNode)=><AbsoluteFill style={{background:'#fff',color:ink,overflow:'hidden'}}>{children}</AbsoluteFill>;
 if(id==='N010'){
  const f=Math.round(t*60),data=calibration.N010,windowState=data.denseWindows[Math.min(168,f)];
  const window=(slot:number,x:number,w:number)=>{
   const scale=slot===2?(f>=66?1.8:1):mix(1,1.22,p(t,50/60,125/60));
   return <Frame key={slot} style={{...pos(x,540-w*9/32,w,w*9/16),borderRadius:Math.min(72,w*.04),boxShadow:'12px 10px 20px rgba(0,0,0,.18)'}}><CalibratedFilm slot={slot} o={o} camera={{transform:`scale(${scale})`,transformOrigin:slot===2?'90% 62%':'55% 48%'}}/></Frame>;
  };
  const docY=sampleMeasured(f,data.document.denseScroll1080),heights=data.document.rowHeights640.map(h=>h*3);
  const yOf=(i:number)=>heights.slice(0,i).reduce((sum,h)=>sum+h,0);
  const prompts=[
   '电影级写实人物设定图，年轻的内容创作者 Fred，身穿简洁的黑色上衣，佩戴眼镜，神情自然专注，站在安静明亮的工作空间中。背景保留书架、绿植和柔和的窗外光线，构图干净，人物与环境关系清楚，中近景取景，真实材质，细节自然，画面留有适度空间，避免无关装饰。',
   '电影级写实人物设定图，工作中的创作者与同伴正在交流，坐在桌面整洁的办公空间内，面前放着电脑、笔记本和参考资料。人物姿态放松，视线与对话对象保持联系，自然侧光照亮面部，背景包含真实的生活细节，镜头保留人物上半身与桌面，强调交流关系和动作的连续性。',
   '电影级写实工作室场景，空间明亮、布局简洁，桌面放置电脑、键盘、笔记和水杯，背景保留书架与绿植。自然光从侧面进入，墙面和木质家具呈现真实质感。广角中景构图，空间层次清晰，主体位置明确，画面干净，适合承接人物交流与内容创作的连续镜头。'
  ];
  const lines=(i:number)=>[
   'Fred 坐在工作台前，面向屏幕整理当前资料；同伴坐在旁边，关注正在展示的内容。',
   '两人保持自然的交流姿态，镜头先交代人物、桌面与环境之间的空间关系。',
   '0–2 秒｜固定中景，两人同时入框。Fred 指向当前资料，同伴顺着手势看向屏幕；桌面的笔记与文件保持原位，镜头保留视线方向和自然的动作关系。',
   '2–5 秒｜镜头缓慢推近，落在当前讲话者的面部。焦点清晰地转移到眼睛与表情，背景保留自然层次；说话者稍微抬头，停顿后继续说明当前的判断。',
   `台词（Fred）：${txt(i+3,'我们先把目标说清楚，再把每一步变成看得见的结果。')}`,
   '5–8 秒｜镜头越过同伴的肩膀，转向另一人的回应。动作与上一镜的视线方向衔接，镜头缓慢停稳；同伴看向当前资料，理解后点头，保留自然的交流节奏。',
   '台词（同伴）：好的，先记录关键步骤，然后比较这一次的结果。',
   '8–10 秒｜回到两人同框的中景，视线落回屏幕。人物完成当前动作后短暂停留，画面关系保持稳定；最后让焦点转向下一份资料，自然接入后续内容。'
  ].slice(0,i===3?8:i===4?6:7);
  return shell(<>
   {f>=132&&<><AbsoluteFill style={{clipPath:`inset(${Math.max(0,sampleMeasured(f,data.document.viewportTop1080))}px 0 0 0)`}}><div style={{...pos(578,docY,1300,4200),background:'#fff'}}>
    <div style={{...pos(0,-106,1250,45),fontSize:30,fontWeight:600}}>案例一：从参考画面到创作结果</div>
    <div style={{...pos(0,-42,1300,42),border:'1px solid #eaeaea',boxSizing:'border-box',fontSize:16,padding:'10px 7px'}}>提示词<span style={{position:'absolute',left:936}}>输出结果</span></div>
    {heights.map((h,i)=><div key={i} style={{...pos(0,yOf(i),1300,h),boxSizing:'border-box',border:'1px solid #eaeaea',borderTop:i===0?'1px solid #eaeaea':0}}>
     <div style={{...pos(7,9,912,h-15),fontSize:15.75,lineHeight:'25.5px',color:'#333',overflow:'hidden'}}>
      {i<3?txt(i,prompts[i]):lines(i).map((line,j)=><div key={j} style={{marginBottom:4}}>{line}</div>)}
     </div>
     <div style={{...pos(926,0,374,h),borderLeft:'1px solid #eaeaea'}}/>
     <div style={{...pos(i<3?1026:937,9,i<2?172:i===2?190:353,i<2?h-18:i===2?h-18:199),overflow:'hidden',borderRadius:i<3?0:9}}>
      <Img src={staticFile(`calibration-b/slot-${i%9+1}.jpg`)} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:i<2?'50% 20%':'50% 50%'}}/>
      {i>=3&&<><div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:60,height:60,borderRadius:30,background:'rgba(0,0,0,.45)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,color:'#fff'}}>▶</div><span style={{position:'absolute',right:7,bottom:5,fontSize:11,color:'#fff',background:'#3339'}}>0:07</span></>}
     </div>
    </div>)}
   </div></AbsoluteFill><div style={{...pos(12,sampleMeasured(f,[[132,1160],[140,990],[145,858],[150,583],[155,346],[160,190],[166,67],[170,39],[175,23],[180,18],[347,18]]),540,125),fontSize:16,lineHeight:'31px',background:'#fff'}}><span style={{color:'#888'}}>《</span><br/>创作过程参考<br/><span style={{color:a,fontWeight:600}}>案例一：从参考画面到创作结果 →</span><br/>案例二：让资料成为可执行的步骤</div></>}
   {f<169&&<>{window(1,windowState.leftX,900)}{window(2,windowState.rightX,windowState.rightW)}</>}
  </>);
 }
 if(id==='N011'){
  const f=Math.round(t*60),rows=calibration.N011.rows;
  return shell(<>{[0,1,2].flatMap(row=>[0,1,2].map(col=>{
   const data=row===0?rows.top:rows.bottom;
   const opening=calibration.N011.opening[Math.min(30,f)];
   const x=row===1?opening.x[col]/3:calibration.N011.denseTopX640[col][Math.max(0,f-(row===2?108:0))];
   const y=row===1?(col<2?opening.y/3:117):data.y;
   const w=row===1&&col<2?opening.width:672;
   const slot=row===0?[4,5,3][col]:row===1?[1,2,6][col]:[8,9,7][col];
   let zoom=1,origin='50% 40%',pan=0;
   if(row===0&&col===0&&f>=330){zoom=1.8;origin='52% 67%';}
   if(row===1&&col===0){zoom=f>=356?1.7:mix(1,1.28,p(t,150/60,210/60));pan=f>=356?0:(zoom-1)*mix(125,-160,p(t,150/60,300/60));origin='50% 20%';}
   if(row===1&&col===1&&f>=264){zoom=1.65;origin='65% 25%';}
   if(row===1&&col===2){zoom=f>=436?1.2:f>=306?1.85:f>=166?1.4:1;origin=f>=306?'72% 25%':'38% 35%';}
   if(row===2&&col===0&&f>=428){zoom=1.65;origin='50% 38%';}
   if(row===2&&col===1&&f>=410){zoom=1.75;origin='55% 35%';}
   if(row===2&&col===2&&f>=424){zoom=2;origin='40% 30%';}
   return <Frame key={slot} style={{...pos(x*3,y*3,w,w*9/16),borderRadius:15,boxShadow:'10px 7px 16px rgba(0,0,0,.19)'}}><CalibratedFilm slot={slot} o={o} camera={{transform:`translateX(${pan}px) scale(${zoom})`,transformOrigin:origin}}/></Frame>;
  }))}</>);
 }
 if(id==='N014'){
  const q=p(t,.2,.7),out=p(t,3.9,4.6);return shell(<><div style={{opacity:1-out}}><div style={{...pos(130,225,500,550)}}><Doc accent={a} title={txt(0,'一个输入，三种结果')}/></div><svg style={pos(650,0,1100,1080)}>{[280,570,860].map(y=><path key={y} d={`M0 540 C230 540 220 ${y} 400 ${y}`} fill="none" stroke="#ddd" strokeWidth="3"/>)}</svg></div>{[0,1,2].map(n=>{const nx=mix(80,1090,q),ny=mix(65,60+n*305,q),nw=mix(1760,690,q),nh=mix(950,265,q);return <MediaBox key={n} x={mix(nx,n===0?40:n===1?995:515,out)} y={mix(ny,n===2?565:45,out)} w={mix(nw,890,out)} h={mix(nh,470,out)} video n={n} o={o} opacity={n===0?1:q}/>})}</>);
 }
 if(id==='N016'){
  const q=p(t,.65,1.5);return shell(<><div style={{opacity:1-q,filter:`blur(${q*12}px)`}}><Desktop accent={a}/>{[0,1,2].map(n=><MediaBox key={n} x={500+n*340} y={160+n*160} w={200} h={310} n={n} o={o}/>)}</div><MediaBox x={mix(1080,90,q)} y={mix(480,75,q)} w={mix(210,650,q)} h={mix(310,920,q)} n={0} o={o}/><MediaBox x={mix(1300,790,q)} y={mix(490,160,q)} w={mix(360,1050,q)} h={mix(210,590,q)} video o={o}/><div style={{...pos(830,790,960,140),fontSize:112,fontWeight:600,letterSpacing:-3,opacity:p(t,2.1,2.55),transform:`translateY(${(1-p(t,2.1,2.55))*35}px)`}}><span style={{color:a}}>F</span> Fred Studio</div></>);
 }
 if(id==='N017'){
  const extract=p(t,3.05,3.6),aside=p(t,3.65,4.15);return shell(<Frame style={{...pos(220,80,1480,920),background:'#222225'}}><Dots/><div style={{...pos(35,75,1410,795),opacity:1-extract}}><Film o={o}/></div><div style={{...pos(mix(550,1040,aside),mix(140,165,aside),mix(440,330,aside),mix(650,480,aside)),opacity:p(t,.15,.7),filter:`drop-shadow(3px 0 0 white) drop-shadow(-3px 0 0 white)`,transform:`translateY(${-extract*30}px)`}}><Character t={t} o={o}/></div><div style={{...pos(100,175,940,640),fontSize:54,lineHeight:1.75,color:'#fff',fontWeight:500}}>{[txt(0,'姓名：Fred'),txt(1,'角色：创作者'),txt(2,'职责：把想法变成作品'),txt(3,'特性：清晰、自由、独立')].map((s,i)=><div key={i}>{label(s,t,4+i*.45,20)}</div>)}</div></Frame>);
 }
 if(id==='N018'||id==='X023'){
  const items=['Agent','工作空间','Agent World','邮箱','长期记忆','文件管理','定时任务','云电脑','云手机','技能商店','API 接口','扣子空间'];
  const special=id==='N018';const sel=special?mix(5,3,p(t,0,.65))-p(t,1.45,1.85):2+[.73,1.52,2.25,3.12,3.78,4.5,5.23,5.95].reduce((v,x)=>v+p(t,x,x+.13),0);const fade=special?p(t,3.15,3.6):0;
  return shell(<><div style={{opacity:special?1-p(t,3.15,3.32):1}}><div style={{...pos(335,450,1250,155),border:special?`5px solid ${a}`:'none',borderRadius:7}}/><div style={{position:'absolute',left:355,top:438,fontSize:115}}>→</div>{items.map((s,i)=>{const d=i-sel;return <div key={s} style={{position:'absolute',left:535+Math.abs(d)*18,top:455+d*150,fontSize:99,fontWeight:600,opacity:Math.max(.15,1-Math.abs(d)*.24),filter:`blur(${Math.min(4,Math.abs(d)*1.2)}px)`,transform:`perspective(1500px) rotateX(${Math.max(-50,Math.min(50,d*13))}deg) rotate(${Math.max(-14,Math.min(14,d*5))}deg)`,transformOrigin:'0 50%'}}>{txt(i,s)}</div>})}</div>{special&&<div style={{...pos(160,400,1600,200),display:'flex',alignItems:'center',justifyContent:'center',gap:40,fontSize:115,fontWeight:600,opacity:p(t,3.32,3.6),transform:`translateY(${p(t,7.55,7.8)*560}px)`}}><div style={{width:330,textAlign:'center',color:t>4.7?a:ink,opacity:Math.abs(1-2*p(t,4.6,4.85)),filter:`blur(${(1-Math.abs(1-2*p(t,4.6,4.85)))*10}px)`}}>{t<4.65?txt(12,'邮箱'):txt(14,'身份')}</div><span style={{color:'#888'}}>＋</span><div style={{width:mix(900,330,p(t,5.4,5.9)),textAlign:'center',color:t>5.6?a:ink,fontSize:mix(115,140,p(t,5.5,5.9)),opacity:Math.abs(1-2*p(t,5.4,5.7)),filter:`blur(${(1-Math.abs(1-2*p(t,5.4,5.7)))*10}px)`}}>{t<5.55?txt(13,'Agent World'):txt(15,'自由')}</div></div>}{special&&<div style={{...pos(745,mix(-1020,-370,p(t,7.55,7.8)),430,930)}}><Phone t={0} accent={a}/></div>}</>);
 }
 if(id==='N038'){
  const spread=p(t,3.65,4.55),zoom=p(t,.1,3.5);return shell(<>{Array.from({length:8},(_,i)=>{const x=[340,670,940,1250,410,770,1110,1380][i],y=[160,330,110,280,650,710,590,740][i],w=[300,330,410,280,270,350,320,300][i],h=[440,430,270,420,350,300,370,260][i];const side=i%2===0?-1:1;return <Frame key={i} style={{...pos(mix(960+(x-960)*mix(.65,1.1,zoom),x+side*900,spread),mix(540+(y-540)*mix(.65,1.1,zoom),y+(y<500?-900:900),spread),w,h),opacity:p(t,i*.12,i*.12+.5),transform:`translate(-50%,-50%) scale(${mix(.5,1.12,zoom)})`,zIndex:i}}><Photo name={`art-${i%6}.jpg`} o={o}/></Frame>})}<div style={{...pos(150,390,1620,280),display:'flex',alignItems:'center',justifyContent:'center',fontSize:180,fontWeight:600,color:a,opacity:p(t,4.45,5.55),filter:`blur(${(1-p(t,4.45,5.55))*18}px)`,transform:`scale(${mix(.8,1,p(t,4.45,5.55))})`,zIndex:20}}>{txt(0,'免费工具')}</div></>);
 }
 if(id==='N040'){
  const lift=p(t,.35,.85),back=p(t,3.4,3.85),q=lift*(1-back);return shell(<><div style={{filter:`blur(${q*5}px)`}}><Desktop accent={a}/></div><AbsoluteFill style={{background:'#171719',opacity:q*.27}}/><Input accent={a} text={label(txt(0,'帮我完成一个清晰的内容方案，并生成可直接使用的结果。'),t,.7,25)} style={{...pos(mix(580,360,q),mix(735,420,q),mix(1080,1200,q),195),transform:`translateX(${-back*200}px)`}}/>{back>0&&<div style={{...pos(1330,220,300,650),opacity:back,transform:`translateY(${(1-back)*60}px) scale(.62)`,transformOrigin:'top left'}}><Phone t={t-3} accent={a}/></div>}</>);
 }
 if(id==='N043'){
  const cover=p(t,0,.95),expand=p(t,.4,1.3),front=p(t,2.1,2.6);return shell(<><div style={{opacity:1-cover,...pos(745,70,430,930)}}><Phone t={4} accent={a}/></div><div style={{...pos(mix(1920,0,cover),0,mix(1150,1920,expand),1080),display:'flex',filter:`blur(${front*9}px)`}}>{[0,1,2].map(i=><div key={i} style={{width:'33.333%',minWidth:550}}><Doc dark accent={a} title={txt(i,['角色设定','工作流程','输出规则'][i])}/></div>)}</div><div style={{...pos(745,mix(1150,65,front),430,930),opacity:front}}><Phone t={t+1.4} accent={a} keyboard={t<2.65} words={words?.slice(3)}/></div></>);
 }
 if(id==='N044'){
  const attach=p(t,.45,.88),lift=p(t,.75,1.35),menu=p(t,1.5,1.7)*(1-p(t,2.1,2.3));return shell(<><div style={{filter:'blur(5px)'}}><Desktop accent={a}/></div><Input accent={a} text={label(txt(0,'使用这两张商品图，生成简洁自然的产品展示。'),t,2.3,33)} style={{...pos(mix(590,340,lift),mix(700,490,lift),mix(1030,1240,lift),260)}}><div style={{height:65}}/></Input>{[0,1].map(i=><MediaBox key={i} x={mix(420+i*590,mix(625,375,lift)+i*80,attach)} y={mix(220,mix(725,515,lift),attach)} w={mix(450,62,attach)} h={mix(480,62,attach)} n={i===0?4:5} o={o}/>)}<Frame style={{...pos(375,370,380,180),opacity:menu,padding:24,fontSize:25,lineHeight:1.9,transform:`translateY(${(1-menu)*20}px)`}}>上传图片<br/>选择素材库<br/><span style={{color:a}}>添加参考文件</span></Frame></>);
 }
 if(id==='N045') return shell(<><div style={{filter:'blur(6px)',opacity:.5}}><Desktop accent={a}/></div>{[0,1,2].map(i=><MediaBox key={i} x={170+i*550} y={mix(100,-900,p(t,i*.23,.65+i*.23))} w={470} h={840} n={i} o={o}/>)}{[0,1].map(i=><MediaBox key={'new'+i} x={mix(i===0?-550:1920,400+i*600,p(t,.88+i*.35,1.22+i*.35))+(i===0?-1:1)*p(t,2.8,3.15)*1100} y={110} w={500} h={840} n={i+2} o={o} opacity={p(t,.88+i*.35,1.22+i*.35)}/>)}</>);
 if(id==='N046'){
  const q=p(t,0,.9),scroll=p(t,1.65,2.6);return shell(<><div style={{filter:`blur(${(1-q)*8}px)`}}><Desktop accent={a}><div style={{...pos(250,-scroll*480,1050,1400)}}><Doc accent={a} title={txt(0,'已为你生成产品展示方案')}/></div></Desktop></div><Frame style={{...pos(mix(230,700,q),mix(110,480,q)-scroll*550,mix(1460,690,q),mix(820,388,q)),opacity:1-p(t,2.35,2.75)}}><div style={{display:'flex',height:'100%'}}>{[0,1].map(i=><div key={i} style={{width:'50%',position:'relative'}}><Photo name={defaultImages[i]} o={o}/><div style={{position:'absolute',bottom:30,left:25,right:25,color:'#fff',fontSize:mix(37,22,q),fontWeight:600,textShadow:'0 2px 5px #000'}}>{txt(i+1,['让空间安静下来','让细节自然发光'][i])}</div></div>)}</div></Frame></>);
 }
 if(id==='X017') return shell(<><div style={{filter:'blur(10px)',opacity:.3}}><Desktop accent={a}/></div>{['视频生成','图像生成','智能编排'].map((s,i)=>{const enter=p(t,[.15,1.45,5.05][i],[.55,1.85,5.45][i]);return <div key={s} style={{...pos(340,130+i*275,1300,190),display:'flex',alignItems:'center',gap:48,opacity:enter,transform:`translateY(${(1-enter)*35}px)`}}><div style={{width:150,height:150,borderRadius:28,background:i===1?ink:a,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:74,boxShadow:shadow,transform:`perspective(700px) rotateY(${(1-enter)*-95}deg)`}}>{['▶','◇','⌘'][i]}</div><div style={{fontSize:98,fontWeight:600,color:i===1?a:ink,filter:`blur(${(1-enter)*10}px)`}}>{txt(i,s)}</div></div>})}</>);
 if(id==='X019'){
  const enter=p(t,.5,1.15);return shell(<><div style={{filter:`blur(${enter*8}px)`,opacity:.4}}><Desktop accent={a}/></div><Frame style={{...pos(mix(1980,255,enter),65,1410,945),background:'#202024'}}><Dots/><div style={{padding:'95px 70px',color:'#fff',textAlign:'center'}}><div style={{height:150,fontWeight:600,fontSize:106}}>{label(txt(0,'使用规则'),t,1.35,8)}</div>{[txt(1,'每次聚焦一个明确目标'),txt(2,'保留素材与完整制作过程'),txt(3,'根据反馈，持续调整作品')].map((s,i)=><div key={i} style={{fontSize:52,lineHeight:1.5,marginTop:44,fontWeight:600}}>{label(s,t,2.15+i*1.25,14)}</div>)}</div></Frame></>);
 }
 if(id==='X020') return shell(<><div style={{filter:'blur(15px)',opacity:.2}}><Desktop accent={a}/></div>{[0,1,2,3].map(i=>{const enter=i<2?1:p(t,[0,0,1.95,5.05][i],[0.02,.02,2.45,5.4][i]);return <MediaBox key={i} x={(i%2===0?35:985)+(i<2?0:(1-enter)*(i===2?-1000:1000))} y={i<2?30:555} w={900} h={495} video n={i} o={o} opacity={enter} scale={mix(.78,1,enter)}/>})}</>);
 if(id==='X022'||id==='X027'){
  const character=id==='X022',lines=character?['身份认可','思想解放','自由权利']:['快速测品','无需实拍','批量出图'];return shell(<><div style={{filter:`blur(${mix(3,11,p(t,0,.8))}px)`,opacity:character?.3:.38}}>{character?<><div style={pos(130,310,390,640)}><Character t={t} o={o}/></div><div style={{...pos(1370,310,390,640),transform:'scaleX(-1)'}}><Character t={t} o={o}/></div></>:<Desktop accent={a}/>}</div>{lines.map((s,i)=>{const enter=p(t,character?i*.7-.15:[-.5,.48,1.52][i],character?i*.7+.15:[-.1,.82,1.9][i]),exit=character?0:p(t,3.25+i*.1,3.63+i*.1);return <div key={s} style={{...pos(200+exit*1900*(i===1?-1:1)+(character?0:(1-enter)*(i===1?1900:-1900)),120+i*275,1520,180),textAlign:'center',fontSize:148,fontWeight:600,letterSpacing:mix(28,9,enter),color:i===2?a:ink,opacity:enter,transform:`translateY(${(1-enter)*65}px)`,filter:`blur(${(1-enter)*7}px)`}}>{txt(i,s)}</div>})}</>);
 }
 if(id==='X024'){
  const z=1-p(t,0,.5);return shell(<div style={{...pos(745,60+z*170,430,930),transform:`scale(${1+z*.4})`,transformOrigin:'50% 20%'}}><Phone t={t} accent={a} keyboard={t>.76&&t<2.73} words={words}/></div>);
 }
 if(id==='X025'){
  const zoom=p(t,5.1,5.7);return shell(<><div style={{...pos(300,90,1320,1300),filter:'blur(10px)',opacity:.1}}><Doc title="Agent 工作指南"/></div><Frame style={{...pos(350-zoom*110,100-zoom*190,1220,1450),transform:`scale(${1+zoom*.22})`,transformOrigin:'50% 20%'}}><Dots/><Doc dark accent={a} title={txt(0,'Agent World · 使用指南')} scroll={p(t,0,6.6)*180}/><div style={{...pos(65,400+zoom*390,1050,4),background:a,transform:`scaleX(${p(t,.7,1.2)})`,transformOrigin:'left'}}/></Frame></>);
 }
 if(id==='X029') return shell(<><div style={{filter:'blur(9px)',opacity:.3}}><Desktop accent={a}/></div>{[0,1,2].map(i=>{const enter=p(t,[.25,1.75,2.62][i],[.7,2.2,3.1][i]);const swap=p(t,[4.7,5.32,5.88][i],[5.08,5.67,6.23][i]);return <Frame key={i} style={{...pos(170+i*550,mix(200,95,enter),470,870),opacity:enter}}><Photo name={defaultImages[4+i]} o={o}/><div style={{position:'absolute',inset:0,opacity:swap,transform:`scale(${mix(1.05,1,swap)})`}}><Photo name={defaultImages[7+i]} o={o}/></div></Frame>})}</>);
 return shell(<div style={{margin:'auto',fontSize:80}}>Unknown component {id}</div>);
};
