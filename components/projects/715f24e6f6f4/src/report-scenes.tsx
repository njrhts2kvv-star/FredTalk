import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import content from './report-content.json';
import motion from './report-motion.json';
const purple='#7650d7';
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const ease=(f:number,a:number,b:number)=>{const x=interpolate(f,[a,b],[0,1],clamp);return x*x*(3-2*x);};
const surface:React.CSSProperties={position:'absolute',background:'#fff',color:'#111',borderRadius:40,boxShadow:'0 16px 36px #0002',boxSizing:'border-box'};
const H:React.FC<{children:React.ReactNode}>=({children})=><div style={{fontSize:36,fontWeight:900,marginBottom:20}}>{children}</div>;
const Lines:React.FC<{items:string[];size?:number;tight?:boolean}>=({items,size=29,tight=false})=><div>{items.map((x,i)=><div key={i} style={{display:'flex',gap:16,fontSize:size,lineHeight:tight?1.35:1.43,margin:tight?'8px 0':'13px 0'}}><span style={{color:purple}}>•</span><span>{x}</span></div>)}</div>;
const Table:React.FC<{headers:string[];rows:(string|string[])[][];size?:number;rowHeight?:number}>=({headers,rows,size=29,rowHeight=124})=><table style={{width:'100%',borderCollapse:'collapse',fontSize:size,lineHeight:1.45,tableLayout:'fixed'}}>{headers.length===2&&<colgroup><col style={{width:'30%'}}/><col style={{width:'70%'}}/></colgroup>}<thead><tr>{headers.map((x,i)=><th key={i} style={{textAlign:'left',padding:'18px 16px',fontWeight:500,borderBottom:'1px solid #ddd'}}>{x}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i} style={{height:rowHeight}}>{row.map((cell,j)=><td key={j} style={{verticalAlign:'top',padding:'16px',borderBottom:i<rows.length-1?'1px solid #ddd':undefined,fontWeight:j===0?800:400,whiteSpace:'pre-line'}}>{Array.isArray(cell)?cell.map((s,k)=><div key={k}>{s}</div>):cell}</td>)}</tr>)}</tbody></table>;

const measured = (f:number,samples:number[][])=>interpolate(f,samples.map(x=>x[0]),samples.map(x=>x[1]),clamp);
/** Native paper bounds clip the editable flat front as the turning edge crosses it.
 * SVG clipping avoids filtered CSS strip compositor loss in software rendering. */
const WarpedPage:React.FC<{mesh:typeof motion.pageMesh[number];width:number;height:number;children:React.ReactNode}>=({mesh,width,height,children})=>{
 const points=[...mesh.strips.map(s=>[s.left,s.top]),...mesh.strips.slice().reverse().map(s=>[s.left+s.width,s.top+s.height])];
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,overflow:'hidden'}}>
 <defs>{mesh.strips.map((strip,k)=><clipPath id={`paper-${mesh.frame}-${k}`} key={k}><rect x={strip.left} y={strip.top} width={strip.width+.5} height={strip.height}/></clipPath>)}</defs>
 <polygon points={points.map(p=>p.join(',')).join(' ')} fill="#fff" style={{filter:'drop-shadow(0 16px 24px #0002)'}}/>
 {mesh.strips.map((strip,k)=>{
 const u=mesh.backside?1-strip.u-1/128:strip.u;
 // Keep readable text flat until clipped by the physical turning edge.
 const sx=mesh.w/width,sy=Math.max(...mesh.strips.map(s=>s.height))/height;
 const frontTop=Math.min(...mesh.strips.slice(0,32).map(s=>s.top));
 return <g key={k} clipPath={`url(#paper-${mesh.frame}-${k})`}><foreignObject width={width} height={height} transform={`matrix(${sx} 0 0 ${sy} ${strip.left-u*mesh.w} ${frontTop})`}><div style={{width,height,background:'#fff'}}>{children}</div></foreignObject></g>;
 })}
 </svg>;
};

/** Editable pages retain the report sequence without embedding composed source footage. */
export const SP007:React.FC=()=>{
 const f=useCurrentFrame();const r=content.SP007.report;
 const widths=[1080,1360,1730,1610,950,1280];const heights=[1020,978,780,978,980,978];
 const nodes:React.ReactNode[]=[
 <><H>{r.title}</H><H>{r.heading}</H><H>{r.socialHeading}</H><Lines items={r.social}/><H>{r.behaviorHeading}</H><Lines items={r.behaviors}/><H>{r.conclusion}</H><div style={{fontSize:29,lineHeight:1.4}}>{r.body}</div>{r.needs.map((x,i)=><div key={i} style={{fontSize:29,lineHeight:1.5,marginTop:14}}><span style={{color:purple}}>{i+1}.　</span><b>{x.label}：</b>{x.body}</div>)}</>,
 <Table headers={content.SP007.demographics.headers} rows={content.SP007.demographics.rows} rowHeight={160}/>,
 <><H>{content.SP007.motives.title}</H><Table headers={content.SP007.motives.headers} rows={content.SP007.motives.rows} rowHeight={128}/></>,
 <><H>{content.SP007.sales.title}</H><Table headers={content.SP007.sales.headers} rows={content.SP007.sales.rows} rowHeight={78}/><div style={{marginTop:32}}><H>{content.SP007.sales.summaryHeading}</H><Lines items={content.SP007.sales.summary}/></div></>,
 <>{content.SP007.opportunity.sections.map((s,i)=><section key={i} style={{marginBottom:29}}><H>{s.heading}</H><div style={{fontSize:29,fontWeight:800}}>{s.subheading}</div><Lines items={s.body} size={28}/></section>)}</>,
 <div style={{position:'absolute',inset:0}}><div style={{position:'absolute',left:44,top:30,fontSize:42,fontWeight:900}}>{content.SP007.algorithm.title}</div><div style={{position:'absolute',left:44,top:110,fontSize:40,fontWeight:900}}>{content.SP007.algorithm.subheading}</div>{content.SP007.algorithm.sections.map((section,i)=><section key={i} style={{position:'absolute',left:44,top:[190,510,750][i],width:1160}}><div style={{fontSize:38,fontWeight:800}}><span style={{color:purple}}>{i+1}.　</span>{section.heading}</div>{section.body.map((line,j)=><div key={j} style={{position:'absolute',left:66,top:80+j*80,fontSize:38,lineHeight:1.35}}><span style={{color:purple,marginRight:30}}>◦</span>{line}</div>)}</section>)}</div>
 ];
 const focus=ease(f,20,35);
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden',fontFamily:'MiSans',color:'#111'}}>
 <div style={{position:'absolute',left:120,top:50,width:1260,height:960,filter:`blur(${16*focus}px)`,opacity:.55*(1-focus)+.18}}><H>{r.title}</H><Lines items={r.social}/><Lines items={r.behaviors}/></div>
 <div style={{position:'absolute',inset:0,background:'#fff',opacity:.75*focus}}/>
 {f<motion.tail.clearFrame&&nodes.map((node,i)=>{
 const g=motion.steady[i];const incoming=i===0?null:motion.transitions[i-1];const outgoing=i===5?null:motion.transitions[i];
 if((i===0&&f<22)||(i===5&&f>=467)||(incoming&&f<incoming.start)||(outgoing&&f>=outgoing.end))return null;
 const x=(incoming?measured(f,incoming.incomingX):g.x)+(outgoing?measured(f,outgoing.outgoingX)-g.x:0);
 const mesh=motion.pageMesh.find(row=>row.frame===Math.floor(f)&&((i===0&&f<=48)||(i===5&&f>=445)));
 const editable=<div style={{position:'relative',width:widths[i],height:heights[i],padding:i===0?'18px 20px':i===5?0:'28px 32px',boxSizing:'border-box'}}>{node}</div>;
 if(mesh)return <WarpedPage key={i} mesh={mesh} width={widths[i]} height={heights[i]}>{editable}</WarpedPage>;
 return <div key={i} style={{...surface,zIndex:i===3&&f>=264&&f<279?7:6-i,opacity:i===3&&f===264?.65:1,left:x,top:g.y,width:widths[i],height:heights[i],transform:`scale(${g.w/widths[i]},${g.h/heights[i]})`,transformOrigin:'left top'}}>{editable}</div>;
 })}
 {f>=motion.tail.clearFrame&&<AbsoluteFill style={{background:'#fff'}}><svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{filter:'drop-shadow(10px 14px 12px #0002)'}}>{motion.tail.ringFrames.filter(row=>row.frame===Math.floor(f)).map((row,i)=>'polygon' in row&&<polygon key={i} points={row.polygon?.map(point=>point.join(',')).join(' ')} fill={purple}/>)}</svg></AbsoluteFill>}

 </AbsoluteFill>;
};
const q=content.Q07;const focusTimes=[241,406,502,730,808];
const Definition:React.FC=()=> <><H>{q.definition.title}</H><div style={{...surface,left:0,top:85,width:1240,height:485,padding:38}}>{q.definition.paragraphs.map((s,i)=><div key={i} style={{fontSize:26,lineHeight:1.42,marginBottom:18}}>{s}</div>)}<div style={{background:'#111',color:'#fff',borderRadius:25,padding:20,fontSize:25}}><b style={{color:'#cbbaff'}}>{q.definition.officialLabel}</b><div style={{marginTop:12}}>{q.definition.official}</div></div></div></>;
const Practice:React.FC<{heading?:boolean}>=({heading=true})=> <>{heading&&<div style={{position:'relative',left:50,top:-25}}><H>{q.practice.title}</H></div>}<div style={{...surface,left:0,top:90,width:1375,height:820,padding:38}}><div style={{fontSize:30,marginBottom:34}}>{q.practice.body}</div><div style={{background:'#111',borderRadius:28,color:'#fff',padding:'24px 32px',height:505,boxSizing:'border-box'}}><div style={{fontSize:25,color:'#aaa',marginBottom:28}}>SKILL.md</div><pre style={{fontFamily:'MiSans',fontSize:23,lineHeight:1.42,whiteSpace:'pre-wrap',margin:0}}>{q.practice.code}</pre></div><div style={{fontSize:27,marginTop:28,color:purple,fontWeight:700}}>{q.practice.footer}</div></div></>;
const Pitfalls:React.FC=()=> <><div style={{marginLeft:50}}><H>{q.pitfalls.title}</H></div>{q.pitfalls.cards.map((s,i)=><div key={i} style={{...surface,left:i%2*735,top:100+Math.floor(i/2)*285,width:690,height:245,padding:34}}><H>{s.title}</H><div style={{fontSize:29,lineHeight:1.5}}>{s.body}</div><div style={{color:purple,fontSize:28,lineHeight:1.45,marginTop:16}}>建议：{s.recommendation}</div></div>)}</>;

/** Native 30 fps cues move one editable document, including the opening overview. */
export const Q07:React.FC=()=>{
 const f=useCurrentFrame();
 const zoom=ease(f,12,25), overview=ease(f,166,177), focus=ease(f,241,256);
 const scroll=345*(ease(f,406,415)+ease(f,502,511)+ease(f,730,739)+ease(f,808,817));
 const scale=(.4+.6*zoom)*(1+.147*focus);
 const docLeft=(1920-1240*(.4+.6*zoom))/2-89*focus;
 const practiceY=measured(f,motion.Q07.practiceTitleY)+20;
 const pitfallsY=measured(f,motion.Q07.pitfallTitleY);
 const returnTitleY=measured(f,motion.Q07.returnTitleY);
 const returnY=measured(f,motion.Q07.returnCardTopY)-90*.88;
 const practiceExit=pitfallsY-1180;
 const docTop=316-56*zoom-670*overview-140*focus-scroll+(practiceY-840);
 return <AbsoluteFill style={{background:'#fff',color:'#111',fontFamily:'MiSans',overflow:'hidden'}}>
 <div style={{position:'absolute',left:docLeft,top:docTop,transform:`scale(${scale})`,transformOrigin:'left top',display:f>=981?'none':undefined}}>
 <div style={{position:'absolute',left:0,top:-510,width:1240,textAlign:'center',opacity:1-zoom}}><div style={{fontSize:94,fontWeight:900,lineHeight:1.2}}>新手从零做一个<br/>自己的 Skill</div><div style={{fontSize:27,marginTop:28}}>从零到创意实战，5 步带你玩出第一个专属 AI 技能</div></div>
 <Definition/>
 <div style={{position:'absolute',left:0,top:720,width:1240,fontSize:42,fontWeight:900,color:f>=191?purple:'#111',opacity:1-.75*focus}}>{q.stepsTitle}</div>
 <div style={{position:'absolute',left:102,top:804,width:1138}}>
 {q.steps.map((s,i)=>{const active=ease(f,focusTimes[i],focusTimes[i]+(i===0?15:9));const expired=i===4?0:ease(f,focusTimes[i+1],focusTimes[i+1]+9);const dim=focus*(1-active+expired);return <div key={i} style={{...surface,position:'relative',height:266,marginBottom:35,padding:'26px 42px',opacity:1-.78*Math.min(1,dim)}}><div style={{position:'absolute',left:-102,top:0,width:67,height:67,borderRadius:18,background:'#111',color:'#fff',display:'grid',placeItems:'center',fontSize:30,fontWeight:900}}>{String(i+1).padStart(2,'0')}</div><H>{s.title}</H><Lines items={s.body} size={23.5} tight/></div>;})}
 </div>
 </div>
 {f>=972&&f<1121&&<div style={{position:'absolute',left:250,top:practiceY+(f>=1112?practiceExit:0)}}><Practice/></div>}
 {f>=1112&&<div style={{position:'absolute',left:250,top:pitfallsY,opacity:f>=1280?1-ease(f,1284,1295):1,zIndex:1}}><Pitfalls/></div>}
 {f>=1280&&<div style={{position:'absolute',left:354,top:returnTitleY-28,width:1210,height:980,background:'#fff',borderRadius:22,zIndex:2,opacity:ease(f,1280,1283),boxShadow:'0 12px 30px #0002'}}/>}
 {f>=1280&&<div style={{position:'absolute',left:354,top:returnY,zIndex:3,opacity:ease(f,1280,1283),transform:'scale(.88)',transformOrigin:'left top'}}><Practice heading={false}/></div>}
 {f>=1280&&<div style={{position:'absolute',left:400,top:returnTitleY,zIndex:4,opacity:ease(f,1280,1283),fontSize:32,fontWeight:900}}>{q.practice.title}</div>}
 </AbsoluteFill>;
};
