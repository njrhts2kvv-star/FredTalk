import React from 'react';
import {AbsoluteFill,Img,staticFile} from 'remotion';
import manifest from '../manifest.json';
import {q,mix,Txt,Surface,Window,Phone,Monitor,Brand,Media,Frost} from './UI';
import {accent,progress,typed,TitleWindow,Pill,Path,Person,Document,PermissionOrbit,Cursor} from './Primitives';
import {LaunchEntrance,Afternoon,SharedEditing,FollowupRepair,ValueRepair} from './Repairs';
const words=(id:string)=>manifest.pages.find(p=>p.implementationComponentId===id)!.exactScreenWords;
const frame=(children:any,bg='#fff')=><AbsoluteFill style={{background:bg,color:'#111'}}>{children}</AbsoluteFill>;

export function Launch({t}:any){
 if(t<2.566)return <LaunchEntrance t={t}/>;
 const w=words('launch'),switchIn=q(t,2.566,3.02),open=q(t,6.233,6.85);
 return frame(<>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-1100*switchIn}px)`}}>
 <LaunchEntrance t={2.566}/></div>
 {switchIn>0&&<div style={{position:'absolute',inset:0,transform:`translateY(${1100*(1-switchIn)}px)`}}><TitleWindow x={320-1750*open} y={140} w={1280} h={720}>
 {w.slice(2,5).map((s,i)=><Txt key={s} x={100} y={150+i*170} w={1080} size={i===2?112:104} style={{textAlign:'center',color:i===2?accent:'#fff'}}>{typed(s,t,[2.566,4.033,5.12][i],.36)}</Txt>)}</TitleWindow>
 {open>0&&<div style={{position:'absolute',left:mix(2130,330,open),top:0,width:1320,height:880}}><Txt x={0} y={170} w={1260} size={108}>{w[5]}</Txt>{manifest.results.map((name,i)=><Document key={name} x={i*310} y={380+35*(i%2)} w={275} h={355} title={words('results')[i+1]} kind={i===0?'table':i===3?'task':'document'}/>)}</div>}
 </div>}
 </>);
}

export function Results({t}:any){
 const w=words('results');
 const cues=[11.966,13.1,14.166,15.45];
 const focusIn=q(t,11.966,12.4),collect=q(t,16.733,17.35),exit=q(t,17.833,18.35);
 const travel=cues.slice(1).reduce((a,c)=>a+q(t,c,c+.5),0);
 const fan=q(t,7.966,10.7);
 return frame(<>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-1080*exit}px)`}}>
 <Txt x={130} y={125} w={1660} size={76} style={{textAlign:'center'}}>{w[0]}</Txt>
 {manifest.results.map((name,i)=>{
 const overviewX=140+i*423,focusX=415+(i-travel)*1380;
 const x=mix(mix(overviewX+(i-1.5)*(-48)*(1-fan),focusX,focusIn),overviewX,collect);
 const width=mix(mix(360,1090,focusIn),360,collect);
 const y=mix(mix(335+(i%2)*42-25*fan,290,focusIn),350,collect),height=mix(mix(445,540,focusIn),420,collect);
 const scale=width/1090;
 return <div key={name} style={{position:'absolute',left:x,top:y,width:1090,height:540,transform:`scale(${scale})`,transformOrigin:'top left'}}><Surface w={1090} h={height/scale} style={{borderRadius:22,overflow:'hidden'}}><Media file={'results/'+name+'.png'} x={22} y={105} w={1046} h={height/scale-125} dy={i===0?-10:-30*q(t,cues[i],cues[i]+.9)}/><div style={{position:'absolute',inset:'0 0 auto',height:86,background:'#111',color:'white',padding:'17px 30px',fontSize:43,fontWeight:600}}>{w[i+1]}</div></Surface></div>;
 })}
 {t>=16.85&&<Frost t={t} at={16.85}><div style={{fontSize:108,fontWeight:600}}>{w[7]}</div></Frost>}
 </div>
 {exit>0&&<div style={{position:'absolute',inset:0,transform:`translateY(${1080*(1-exit)}px)`}}><TimeCompression t={t} before={w[5]} after={w[6]}/></div>}
 </>);
}
function TimeCompression({t,before,after}:any){return <Afternoon t={t} before={before} after={after}/>;}
function RetiredTimeCompression({t,before,after}:any){const p=q(t,19.8,20.45);return <>
 <Txt x={140} y={195} w={1640} size={mix(128,86,p)} style={{textAlign:'center',transform:`translateX(${-540*p}px)`}}>{before}</Txt>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}><Path d="M210 540 H1710" p={1} width={4} color="#ddd"/>{Array.from({length:9},(_,i)=><g key={i} transform={`translate(${mix(220+i*180,970+i*18,p)},540)`}><rect x="-34" y="-45" width="68" height="90" rx="12" fill={i<Math.floor(9*q(t,18,19.5))?'#111':'#ddd'}/></g>)}</svg>
 <div style={{position:'absolute',left:mix(2120,790,p),top:300}}><Pill text={after} x={440} y={235} w={850} h={350} size={128} color={accent}/></div>
 </>}

export function Feishu({t}:any){const w=words('feishu'),change=q(t,25.4,26.15),leave=q(t,27.4,28.05),team=q(t,28.1,29.1);return frame(<>
 <div style={{position:'absolute',inset:0,transform:`translateX(${-2000*change}px)`}}><Txt x={160} y={145} w={1560} size={84}>{w[0]}</Txt><Surface x={160} y={290} w={1600} h={545}><Media file="product-6.jpg" w={1600} h={545} scale={1+.12*q(t,22.266,25)} dy={-150*q(t,22.266,25)}/></Surface></div>
 {change>0&&<div style={{position:'absolute',inset:0,transform:`translateX(${2000*(1-change)}px)`}}>
 <Window x={mix(490,115,leave)} y={230} w={mix(940,630,leave)} h={575}><Txt x={50} y={38} w={700} size={60}>{w[1]}</Txt><div style={{position:'absolute',left:50,right:50,top:150,height:80,background:'#292929',borderRadius:20}}/></Window>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{[260,500,740].map((y,i)=><Path key={y} d={`M1160 520 C1390 520 1400 ${y} 1590 ${y}`} p={q(t,28.1+i*.18,28.65+i*.18)} width={6}/>)}</svg>
 <Document x={mix(610,900,leave)} y={mix(440,355,leave)} w={mix(700,590,leave)} h={360} title={w[2]} kind="table"/>
 {[260,500,740].map((y,i)=><div key={y} style={{position:'absolute',inset:0,transform:`translateX(${700*(1-q(t,28.3+i*.18,28.75+i*.18))}px)`}}><Person x={1660} y={y} size={100}/></div>)}
 <Txt x={920} y={175} w={650} size={80} style={{clipPath:`inset(0 ${100*(1-team)}% 0 0)`}}>{w[3]}</Txt>
 </div>}
 </>);}

export function Collab({t}:any){const w=words('collab');
 if(t>=40.333)return <>{t<40.8&&<Collab t={40.332}/>}<SharedEditing t={t}/></>;
 const merge=q(t,35.333,36.1),share=q(t,37.2,38),shrink=q(t,39.266,39.52),orbit=Math.max(0,Math.min(1,(t-39.52)/.78)),canvas=q(t,40.333,41.05),team=q(t,43.833,44.55),end=q(t,51.2,51.9);
 return frame(<>
 {canvas<1&&<div style={{position:'absolute',inset:0,transform:`translateY(${-1050*canvas}px)`}}>
 <div style={{position:'absolute',inset:0,transform:`scale(${mix(1,.76,shrink)})`,transformOrigin:'960px 525px'}}><Surface x={mix(120,260,merge)} y={mix(340,245,merge)} w={mix(1680,1400,merge)} h={mix(400,560,merge)} dark style={{borderRadius:mix(50,105,merge)}}/></div>
 <Txt x={t>=39.266?710:120} y={t>=39.266?85:145} w={t>=39.266?500:1680} size={78} style={{textAlign:'center',background:'#fff',zIndex:2}}>{t<37.2?w[0]:t<39.266?w[7]:w[8]}</Txt>
 {merge<1&&w.slice(1,6).map((s,i)=>{const enter=q(t,manifest.contextCues[i],manifest.contextCues[i]+.3);return enter>0&&<Document key={s} x={160+i*327} y={mix(465,mix(385,455,merge),enter)} w={290} h={280} title={s} kind={i===2?'document':i===4?'task':'table'} style={{transform:`scale(${1-merge})`,transformOrigin:'center',clipPath:`inset(0 0 ${100*(1-enter)}% 0)`}}/>})}
 {merge>0&&<div style={{position:'absolute',inset:0,transform:`scale(${merge*mix(1,.76,shrink)})`,transformOrigin:'960px 525px'}}><Document x={mix(565,420,share)} y={340} w={mix(790,720,share)} h={360} title={w[6]} kind="table"/>{share>0&&<><Document x={mix(700,1210,share)} y={400} w={300} h={245} title={w[7]} kind="table"/><Person x={340} y={520} size={120}/></>}</div>}
 <PermissionOrbit p={orbit}/>
 </div>}
 {canvas>0&&<div style={{position:'absolute',inset:0,transform:`translateY(${1050*(1-canvas)}px)`}}>
 <Txt x={100} y={125} w={1720} size={82} style={{textAlign:'center'}}>{w[9]}</Txt>
 <div style={{position:'absolute',inset:0,transform:`translateX(${-470*end}px) scale(${mix(1,.72,end)})`,transformOrigin:'960px 500px'}}>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{[[180,355],[1740,355],[1740,710]].map(([x,y],i)=><Path key={i} d={`M${x} ${y} L${i===0?435:1475} 530`} p={q(t,40.6+i*.12,41.1+i*.12)} width={5}/>)}</svg>
 <Surface x={400} y={300} w={1120} h={510} style={{border:'3px solid #111',borderRadius:44}}>
 <Txt x={55} y={40} w={1010} size={54}>{t<46.133?w[6]:t<48.133?w[13]:t<49.7?w[14]:w[15]}</Txt>
 <Document x={50} y={145} w={490} h={310} title={t<48.133?w[13]:w[14]} kind={t<48.133?'table':'document'} active={q(t,41,41.6)}/>
 <Document x={580} y={145} w={490} h={310} title={w[15]} kind="task" active={q(t,46.2,50.2)}/>
 </Surface>
 <Person x={180} y={355} label={team>0?w[10]:''} size={116}/><Person x={1740} y={355} label={team>0?w[11]:''} size={116}/><Person x={1740} y={700} label={team>0?w[12]:''} size={116}/>
 <Cursor x={mix(620,770,q(t,40.6,41.4))} y={mix(750,535,q(t,40.6,41.4))} label={w[10]}/><Cursor x={mix(1350,1240,q(t,41.1,42))} y={mix(760,600,q(t,41.1,42))} label={w[11]}/>
 </div>
 {end>0&&<Txt x={mix(2060,1120,end)} y={410} w={690} size={92}>{w[16]}</Txt>}
 </div>}
 </>);}

export function Permission({t}:any){const p=q(t,53.833,56.8);return frame(<Surface x={140} y={140} w={1640} h={705} style={{borderRadius:28}}><Media file="product-7.jpg" w={1640} h={705} scale={mix(1,1.12,p)} dx={mix(0,-65,p)} dy={mix(-50,-130,p)}/></Surface>);}

export function Followup({t}:any){return <FollowupRepair t={t}/>;}
function RetiredFollowup({t}:any){const w=words('followup'),task=q(t,58.8,59.5),phone=q(t,61.233,61.85),finish=q(t,63.633,64.25),advance=q(t,65.533,66.15);return frame(<>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-1050*finish}px)`}}>
 <Document x={mix(590,130,task)} y={330} w={mix(740,550,task)} h={450} title={w[0]} active={1}/>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}><Path d="M680 545 C770 545 770 545 860 545" p={task} width={7}/><Path d="M1340 545 H1530" p={phone} width={7}/></svg>
 {task>0&&<Surface x={mix(1990,850,task)} y={330} w={490} h={450} dark><Txt x={42} y={45} w={410} size={64}>{w[1]}</Txt><Person x={100} y={235} size={85} active/><Txt x={165} y={205} w={285} size={47} style={{color:'white'}}>{w[2]}</Txt><Txt x={45} y={335} w={410} size={41} style={{color:accent}}>{w[4]}</Txt></Surface>}
 <div style={{position:'absolute',left:mix(2050,1480,phone),top:200,transform:'scale(.76)',transformOrigin:'top left'}}><Phone><div style={{padding:'95px 32px 0',fontSize:51,fontWeight:600}}>{w[3]}</div><div style={{margin:'100px 26px 0',padding:'35px 26px',background:'#eee',borderRadius:22,fontSize:37,lineHeight:1.8,transform:`translateY(${70*(1-phone)}px)`}}>{w[2]}<br/>{w[1]}<br/><strong>{w[4]}</strong></div></Phone></div>
 </div>
 {finish>0&&<div style={{position:'absolute',inset:0,transform:`translateY(${1050*(1-finish)}px)`}}>
 <Pill text={w[5]} x={mix(960,530,advance)} y={470} w={mix(1100,680,advance)} h={245} size={mix(100,70,advance)}/>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}><Path d="M880 470 H1070" p={advance} width={10}/></svg>
 {advance>0&&<Pill text={w[6]} x={mix(2240,1450,advance)} y={470} w={730} h={320} size={82} color={accent}/>}
 </div>}
 </>);}

export function Value({t}:any){
 return <ValueRepair t={t}/>;
}
function RetiredValue({t}:any){
 const w=words('value'),zoom=q(t,.65,2),expand=q(t,2.2,3),follow=q(t,4.25,5.05),done=q(t,6.25,6.85);
 const cameraScale=mix(.88,1.43,zoom),cameraX=mix(370,15,zoom)-150*follow,cameraY=mix(130,-85,zoom);
 return frame(<>
 <div style={{position:'absolute',left:cameraX,top:cameraY,transform:`scale(${cameraScale})`,transformOrigin:'left top'}}><Monitor>
 <Brand x={60+120*follow} y={32} size={40}/>
 <Txt x={60+120*follow} y={112} w={1100} size={55}>{w[1]}</Txt>
 <div style={{position:'absolute',inset:0,transform:`translateX(${-65*follow}px)`}}>
 <Document x={mix(65,75,expand)+100*follow} y={220} w={mix(960,420,expand)} h={310} title={w[5]} kind="table" active={1}/>
 <svg width={1290} height={630} style={{position:'absolute',inset:0}}><Path d="M500 370 H635" p={expand} width={6}/><Path d="M915 370 H1050" p={follow} width={6}/></svg>
 {expand>0&&<Surface x={mix(1430,615,expand)} y={230} w={300} h={290} dark><Txt x={30} y={25} w={250} size={51}>{w[2]}</Txt><div style={{position:'absolute',left:30,top:115,width:240,height:120,background:'#fff',borderRadius:12,display:'grid',placeItems:'center',color:'#111',fontSize:36,transform:`translateY(${70*(1-q(t,3,3.7))}px)`}}>{w[6]}</div></Surface>}
 {follow>0&&<Surface x={mix(1450,1025,follow)} y={230} w={300} h={290} style={{background:accent}}><Txt x={30} y={25} w={250} size={51}>{w[3]}</Txt><Txt x={30} y={120} w={250} size={38}>{w[7]}</Txt><div style={{position:'absolute',left:30,top:193,width:240,fontSize:38,clipPath:`inset(0 ${100*(1-q(t,5.1,5.65))}% 0 0)`}}>{w[8]} <span style={{fontSize:40}}>✓</span></div></Surface>}
 </div>
 </Monitor></div>
 {done>0&&<div style={{position:'absolute',left:175,top:760,width:1570,height:100,background:'#111',color:'white',borderRadius:18,display:'grid',placeItems:'center',fontSize:59,fontWeight:600,clipPath:`inset(0 ${100*(1-done)}% 0 0)`}}>{w[4]}</div>}
 </>);
}

export function Method({t}:any){const w=words('method'),branch=q(t,10.234,11.15),save=q(t,17.4,17.88),collapse=q(t,17.4,17.58),cues=[12.234,14.4,15.834];const rootX=mix(960,420,branch),rootY=mix(470,265,branch);return frame(<>
 {branch<1&&<div style={{position:'absolute',inset:0,transform:`translateX(${-2000*branch}px)`}}><Txt x={180} y={140} w={1560} size={93}>{w[0]}</Txt>{[0,1,2].map(i=><Document key={i} x={mix(620,260+i*480,q(t,7.566,8.5))} y={330+mix(i*12,i%2*75,q(t,8.6,9.7))} w={440} h={430} title={[w[7],w[8],w[9]][i]} kind={i===0?'table':'document'} active={q(t,9+i*.2,9.4+i*.2)}/>)}</div>}
 {branch>0&&<>
 {t<17.5&&<svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{cues.map((c,i)=><Path key={i} d={`M${rootX} ${rootY+95} C${rootX} ${320+i*230} ${rootX} ${320+i*230} ${880+100*(i<2?q(t,cues[i+1],cues[i+1]+.35):0)} ${320+i*230}`} p={q(t,c-.15,c+.3)*(1-q(t,17.4,17.5))} width={10}/>)}</svg>}
 {collapse<1&&<Pill text={w[1]} x={rootX} y={rootY} w={600} h={245} size={104} color={accent} scale={branch*(1-collapse)}/>}
 {cues.map((c,i)=>{const p=q(t,c,c+.36),next=i<2?q(t,cues[i+1],cues[i+1]+.35):0,detail=q(t,c+.28,c+.85);const height=mix(225,150,next),width=mix(900,700,next),y=320+i*230-height/2;return p>0&&collapse<1?<Surface key={i} x={mix(1330-width/2,570,collapse)} y={mix(y,320,collapse)} w={width} h={height} dark style={{transform:`scale(${p*(1-collapse)})`,transformOrigin:'center',borderRadius:35}}><Txt x={40} y={mix(22,32,next)} w={width-80} size={66} style={{color:accent,textAlign:'center'}}>{w[2+i]}</Txt><div style={{position:'absolute',left:40,top:116,right:40,transform:`translateY(${120*next}px)`,clipPath:`inset(0 ${100*(1-detail)}% 0 0)`,display:'flex',alignItems:'center',justifyContent:'center',gap:26,fontSize:38,color:'#fff'}}><span>{i===0?w[7]:i===1?w[8]:w[9]}</span><span style={{fontSize:44}}>→</span><span style={{padding:'10px 20px',borderRadius:10,background:'#fff',color:'#111'}}>{w[10+i]}</span></div></Surface>:null;})}
 {save>0&&<TitleWindow x={430} y={255} w={1060} h={545} style={{transform:`scale(${.75+.25*save})`,clipPath:`inset(0 ${100*(1-save)}% 0 0)`,transformOrigin:'center'}}><Txt x={70} y={130} w={920} size={99} style={{color:accent,textAlign:'center'}}>{w[5]}</Txt><Txt x={70} y={320} w={920} size={61} style={{textAlign:'center'}}>{w[6]}</Txt></TitleWindow>}
 </>}
 </>);}

export function Judgment({t}:any){const w=words('judgment'),p=q(t,21.634,22.25);return frame(<>
 <Surface x={150} y={240} w={mix(1620,760,p)} h={530} dark style={{borderRadius:44}}><Brand x={60} y={60} dark size={63}/><Txt x={60} y={240} w={mix(1450,640,p)} size={mix(133,86,p)}>{w[1]}</Txt></Surface>
 {p>0&&<Surface x={mix(2040,1010,p)} y={240} w={760} h={530} style={{border:'4px solid #111',borderRadius:44}}><Person x={115} y={110} size={83}/><Txt x={185} y={70} w={500} size={63}>{w[2]}</Txt><Txt x={60} y={240} w={650} size={100}>{w[3]}</Txt></Surface>}
 </>);}
