import React from 'react';
import {AbsoluteFill} from 'remotion';
import manifest from '../manifest.json';
import {q,mix,Txt,Surface,Window,Phone,Monitor,Brand,Media} from './UI';
import {accent,Pill,Path,Person,Cursor} from './Primitives';
const words=(id:string)=>manifest.pages.find(p=>p.implementationComponentId===id)!.exactScreenWords;
const stage=(children:any)=><AbsoluteFill style={{background:'#fff',color:'#111'}}>{children}</AbsoluteFill>;
const smooth=(t:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*p*(p*(p*6-15)+10);};
const excerpt=manifest.recordExcerpt;

export function LaunchEntrance({t}:any){
 const enter=q(t,0,.52),split=smooth(t,.8,1.5),reveal=q(t,1.32,1.85);
 return stage(<>
 <div style={{position:'absolute',left:mix(480,150,split),top:mix(340,280,split)+100*(1-enter),width:720,height:180,whiteSpace:'nowrap',transform:`scale(${mix(.82,1,enter)})`,transformOrigin:'left center'}}><Brand size={112}/></div>
 <div style={{position:'absolute',left:150,top:455,width:612,height:180,overflow:'hidden'}}><div style={{fontSize:153,lineHeight:1.1,fontWeight:600,transform:`translateY(${190*(1-reveal)}px)`}}>{words('launch')[1]}</div></div>
 <Window x={mix(2100,870,split)} y={mix(250,195,split)} w={930} h={600} dark={false} style={{transform:`scale(${1+.025*smooth(t,1.5,2.56)})`,transformOrigin:'center'}}><Media file="product-2.jpg" w={930} h={540} scale={1.06} dy={-15}/></Window>
 </>);
}

export function Afternoon({t,before,after}:any){
 const collect=smooth(t,19.8,20.35),done=q(t,20.6,21.1),w=words('results');
 return <>
 <div style={{position:'absolute',left:100,top:140,width:1720,textAlign:'center',fontSize:112,fontWeight:600,transform:`translateY(${-400*collect}px)`}}>{before}</div>
 {w.slice(1,5).map((s,i)=>{const p=q(t,18.05+i*.19,18.5+i*.19);return <Surface key={s} x={mix(155+i*403,560,collect)} y={mix(380+90*(1-p),325,collect)} w={mix(380,800,collect)} h={mix(350,350,collect)} style={{transform:`scale(${1-.22*collect})`,borderRadius:22,background:i%2?'#111':'#f3f3f3',color:i%2?'#fff':'#111'}}><Txt x={30} y={35} w={320} size={44}>{s}</Txt><div style={{position:'absolute',left:35,top:150,fontSize:98,fontWeight:600,color:i%2?accent:'#111'}}>{String(i+1).padStart(2,'0')}</div></Surface>;})}
 {collect>0&&<Surface x={560} y={325} w={800} h={350} dark style={{transform:`scale(${collect})`,transformOrigin:'center',borderRadius:30}}><Txt x={40} y={75} w={720} size={118} style={{textAlign:'center',color:accent}}>{after}</Txt><svg width={90} height={90} style={{position:'absolute',left:355,top:225}}><Path d="M14 44 L36 66 L79 16" p={done} color="#fff" width={8}/></svg></Surface>}
 </>;
}

function RecordText({x,y,w=650,h=440,compact=false,highlight=0}:any){return <Surface x={x} y={y} w={w} h={h} style={{borderRadius:20,background:'#f8f8f8',boxShadow:'none'}}>
 <Txt x={35} y={28} w={w-70} size={compact?40:49}>{words('followup')[0]}</Txt>
 <div style={{position:'absolute',left:35,right:35,top:100,fontSize:compact?27:32,lineHeight:1.65}}>
 <div style={{borderBottom:'2px solid #ddd',paddingBottom:12}}>{excerpt[2]}：{excerpt[3]}</div>
 <div style={{fontSize:compact?24:29,color:'#555',padding:'12px 0'}}>{excerpt[0]}：{excerpt[1]}</div>
 <strong>{excerpt[6]}</strong>
 <div style={{marginTop:12,background:highlight?accent:'transparent',padding:'6px 10px'}}>{excerpt[7]}</div>
 <div style={{marginTop:12}}>{excerpt[9]}</div>
 </div>
 </Surface>}

function CompareTable({x=0,y=0,w=750,h=420,active=0}:any){const c=manifest.collaborationCopy;return <Surface x={x} y={y} w={w} h={h} style={{background:'#f5f5f5',boxShadow:'none',borderRadius:20}}>
 <Txt x={32} y={25} w={w-64} size={43}>{words('collab')[13]}</Txt>
 <div style={{position:'absolute',left:32,right:32,top:108,bottom:30,display:'grid',gridTemplateColumns:'1fr 1.3fr',gridTemplateRows:'repeat(3,1fr)',gap:3,background:'#ddd',fontSize:31}}>
 {[c[9],c[10],c[11],c[2],c[12],active>.5?c[13]:c[5]].map((s,i)=><div key={i} style={{padding:'20px 17px',background:i<2?'#111':i===5&&active>.5?accent:'#fff',color:i<2?'#fff':'#111',display:'flex',alignItems:'center'}}>{s}</div>)}
 </div>
 </Surface>}

export function SharedEditing({t}:any){
 const w=words('collab'),c=manifest.collaborationCopy,enter=q(t,40.333,40.8),focus=smooth(t,45.9,46.45),record=smooth(t,48.133,48.6),board=smooth(t,49.55,50),end=smooth(t,51.2,51.75);
 const cx=960,sc=1,roles=q(t,43.833,44.2);
 return <AbsoluteFill style={{background:'#fff',color:'#111',clipPath:`inset(0 ${100*(1-enter)}% 0 0)`}}>
 <div style={{position:'absolute',left:cx,top:-1100*end,transform:`scale(${sc}) translateX(-960px)`,transformOrigin:'left 470px'}}>
 <div style={{width:1920,height:1080,position:'relative'}}>
 <div style={{position:'absolute',left:220,top:100,width:1480,height:140,overflow:'hidden'}}>
 {focus===0&&<div style={{fontSize:80,fontWeight:600,textAlign:'center',transform:`translateY(${-150*roles}px)`}}>{c[0]}</div>}
 {roles>0&&focus===0&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'space-around',fontSize:68,fontWeight:600,transform:`translateY(${150*(1-roles)}px)`}}>{[w[10],w[11],w[12]].map(s=><div key={s}>{s}</div>)}</div>}
 {focus>0&&<div style={{fontSize:80,fontWeight:600,textAlign:'center',transform:`translateY(${150*(1-focus)}px)`}}>{board>.8?w[15]:record>.8?w[14]:w[13]}</div>}
 </div>
 <div style={{position:'absolute',left:260,top:265,width:1400,height:580,border:'4px solid #111',borderRadius:50,background:'#fff',overflow:'hidden',boxShadow:'0 25px 55px #00000013'}}>
 <div style={{position:'absolute',inset:0,transform:`translateX(${-1450*focus}px)`}}>
 <RecordText x={55} y={60} w={610} h={445} compact highlight={q(t,41.3,41.6)}/><CompareTable x={715} y={60} w={620} h={445} active={q(t,42,42.3)}/>
 <Cursor x={mix(220,515,q(t,40.8,41.3))} y={mix(480,345,q(t,40.8,41.3))} label={w[10]}/>
 <Cursor x={mix(1220,1150,q(t,41.5,42))} y={mix(500,430,q(t,41.5,42))} label={w[11]}/>
 </div>
 {focus>0&&<div style={{position:'absolute',inset:0,transform:`translateX(${1450*(1-focus)-1450*record}px)`}}><CompareTable x={65} y={45} w={1260} h={485} active={q(t,46.65,47.2)}/><Cursor x={mix(1100,930,q(t,46.5,47))} y={mix(400,410,q(t,46.5,47))} label={w[12]}/></div>}
 {record>0&&<div style={{position:'absolute',inset:0,transform:`translateX(${1450*(1-record)-1450*board}px)`}}><RecordText x={65} y={35} w={1260} h={510} highlight={1}/><Cursor x={1090} y={340} label={w[11]}/></div>}
 {board>0&&<div style={{position:'absolute',inset:0,transform:`translateX(${1450*(1-board)}px)`}}><Txt x={65} y={45} w={1270} size={48}>{w[15]}</Txt>{[w[10],w[11],w[12]].map((s,i)=><Surface key={s} x={65+i*435} y={145} w={400} h={350} style={{background:i===2?accent:'#f1f1f1',boxShadow:'none'}}><Txt x={25} y={30} w={350} size={41}>{s}</Txt><Txt x={25} y={133} w={350} size={39}>{i===2&&t>=50.3?c[7]:c[5]}</Txt><div style={{position:'absolute',left:25,top:230,fontSize:58,transform:`scale(${q(t,50+i*.12,50.3+i*.12)})`,transformOrigin:'left'}}>✓</div></Surface>)}</div>}
 </div>
 {focus<1&&<>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0}}>{[[140,280,260,355],[1780,280,1660,355],[140,735,260,735],[1780,735,1660,735]].map(([x,y,x2,y2],i)=><Path key={i} d={`M${x} ${y} L${x2} ${y2}`} p={q(t,40.45,40.85)*(1-focus)} width={4}/>)}</svg>
 {[[140,280],[1780,280],[140,735],[1780,735]].map(([x,y],i)=><div key={i} style={{position:'absolute',left:x,top:y,transform:`scale(${q(t,40.45+i*.04,40.85+i*.04)*(1-focus)})`}}><Person x={0} y={0} size={105}/></div>)}
 </>}
 </div></div>
 {end>0&&<Txt x={180} y={mix(1350,400,end)} w={1560} size={130} style={{textAlign:'center'}}>{w[16]}</Txt>}
 </AbsoluteFill>;
}

export function FollowupRepair({t}:any){const w=words('followup'),task=smooth(t,58.8,59.35),phone=smooth(t,61.233,61.75),finish=smooth(t,63.633,64.08),advance=smooth(t,65.533,66.05);return stage(<>
 <div style={{position:'absolute',inset:0,transform:`translateY(${-1100*finish}px)`}}>
 <RecordText x={mix(560,95,task)} y={235} w={mix(800,650,task)} h={600} highlight={1}/>
 {task>0&&<Surface x={mix(2000,805,task)} y={235} w={540} h={600} dark style={{borderRadius:28}}>
 <div style={{position:'absolute',inset:'45px 38px',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:33}}><div style={{fontSize:66,fontWeight:600}}>{w[1]}</div><div style={{height:2,width:'100%',background:'#484848'}}/><div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:20,height:100}}><svg width={64} height={64} viewBox="0 0 100 100"><circle cx="50" cy="30" r="18" fill="#fff"/><path d="M17 90Q17 52 50 52Q83 52 83 90Z" fill="#fff"/></svg><span style={{fontSize:50}}>{w[2]}</span></div><div style={{fontSize:39,color:accent}}>{excerpt[7]}</div><div style={{fontSize:44}}>{w[4]}</div></div>
 </Surface>}
 {phone>0&&<div style={{position:'absolute',left:mix(2070,1430,phone),top:146.2,transform:'scale(.84)',transformOrigin:'top left'}}><Phone><div style={{padding:'140px 32px 0',fontSize:53,fontWeight:600}}>{w[3]}</div><div style={{margin:'80px 26px 0',padding:'28px 22px',background:'#eee',borderRadius:20,fontSize:34,lineHeight:1.8}}>@{w[2]}<br/>{w[0]}<br/><strong>{w[4]}</strong></div></Phone></div>}
 </div>
 {finish>0&&<div style={{position:'absolute',inset:0,transform:`translateY(${1050*(1-finish)}px)`}}>
 <Pill text={w[5]} x={mix(960,490,advance)} y={475} w={mix(1100,700,advance)} h={260} size={mix(100,75,advance)}/>
 {advance>0&&<Pill text={w[6]} x={mix(2240,1410,advance)} y={475} w={800} h={320} size={88} color={accent}/>}
 </div>}
 </>);}

export function ValueRepair({t}:any){
 const w=words('value'),zoom=smooth(t,1.5,2.28),expand=smooth(t,2.3,2.8),follow=smooth(t,4.634,5.12),done=q(t,6.25,6.7);
 const scale=mix(.88,1.38,zoom),width=1340; // global border-box from index.tsx
 return stage(<>
 <div style={{position:'absolute',left:960-width*scale/2,top:mix(110,-24,zoom),transform:`scale(${scale})`,transformOrigin:'top left'}}><Monitor>
 <Brand x={65} y={50} size={40}/><Txt x={65} y={137} w={1150} size={54}>{w[1]}</Txt>
 <Surface x={65} y={240} w={mix(1160,350,expand)} h={305} style={{background:'#f2f2f2',boxShadow:'none'}}><Txt x={25} y={25} w={300} size={43}>{w[5]}</Txt><div style={{position:'absolute',left:25,top:105,right:25,fontSize:30,lineHeight:1.75}}>{words('followup')[0]}<br/>{excerpt[7]}<br/>{excerpt[9]}</div></Surface>
 {expand>0&&<Surface x={mix(1400,470,expand)} y={240} w={350} h={305} dark><Txt x={30} y={25} w={290} size={47}>{w[2]}</Txt><div style={{position:'absolute',left:30,top:130,width:290,height:105,background:'#fff',borderRadius:12,display:'grid',placeItems:'center',color:'#111',fontSize:36,transform:`translateY(${160*(1-q(t,3,3.45))}px)`}}>{w[6]}</div></Surface>}
 {follow>0&&<Surface x={mix(1400,875,follow)} y={240} w={350} h={305} style={{background:accent}}><Txt x={30} y={25} w={290} size={47}>{w[3]}</Txt><Txt x={30} y={122} w={290} size={38}>{w[7]}</Txt><div style={{position:'absolute',left:30,top:194,fontSize:38,clipPath:`inset(0 ${100*(1-q(t,5.25,5.65))}% 0 0)`}}>{w[8]} ✓</div></Surface>}
 </Monitor></div>
 {done>0&&<div style={{position:'absolute',left:175,top:775,width:1570,height:100,background:'#111',color:'white',borderRadius:18,display:'grid',placeItems:'center',fontSize:59,fontWeight:600,clipPath:`inset(0 ${100*(1-done)}% 0 0)`}}>{w[4]}</div>}
 </>);
}
