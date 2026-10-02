import React,{useEffect,useState} from 'react';
import {AbsoluteFill,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import trajectories from './X050-motion.json';
let ready:Promise<unknown>|undefined;
const q=(f:number,a:number,b:number)=>{const x=Math.max(0,Math.min(1,(f-a)/(b-a)));return x*x*(3-2*x)};
export function ToolErrors({t,accent,words}:{t:number;accent:string;words?:string[]}){
 const [handle]=useState(()=>delayRender('Load error headline font'));useEffect(()=>{ready??=Promise.all([new FontFace('ErrorLatin',`url(${staticFile('calibration-c/RobotoCondensed.ttf')})`,{weight:'900'}).load().then(f=>document.fonts.add(f)),new FontFace('ErrorHeavy',`url(${staticFile('calibration-c/SourceHanSansSC-Heavy.otf')})`,{weight:'900'}).load().then(f=>document.fonts.add(f))]);ready.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const f=Math.min(539,Math.max(0,Math.round(t*60))),tr=trajectories[f];
 const blur=q(f,76,88)*(1-q(f,179,205))+q(f,453,479);
 const operations=['文件读取 /workspace/resume-generator/src/utils/export.ts','文件写入 /workspace/resume-generator/src/utils/export.ts','文件读取 /workspace/resume-generator/src/components/steps/Step5Preview.tsx','编辑 /workspace/resume-generator/src/components/steps/Step5Preview.tsx','命令行执行 cd /workspace/resume-generator && pnpm build','项目部署','TodoWrite'];
 const scroll=135*q(f,292,340)+175*q(f,353,417);
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans',fontWeight:400}}>
 <div style={{position:'absolute',left:152,top:54,width:1616,height:972,background:'white',borderRadius:30,boxShadow:'0 7px 12px 9px #0006',filter:`blur(${blur*10}px)`,overflow:'hidden'}}>
 <div style={{position:'absolute',left:12,top:13,fontSize:16,fontWeight:600}}>软件定制开发</div>
 <div style={{position:'absolute',left:438,top:82,width:900,height:674,overflow:'hidden'}}><div style={{transform:`translateY(${-scroll}px)`}}>
 {operations.map((s,i)=><div key={s} style={{height:72,display:'flex',alignItems:'center',opacity:.46}}><span style={{border:'1px solid #e7e7e7',borderRadius:24,padding:'5px 14px',fontSize:16,whiteSpace:'nowrap'}}>♧ 已完成 {s}</span></div>)}
 <div style={{fontSize:28,fontWeight:650,margin:'4px 0 25px'}}><span style={{color:accent}}>✓</span> 三个问题已全部修复！</div><div style={{fontSize:22,fontWeight:650}}>更新后的访问地址</div><div style={{fontSize:20,color:accent,textDecoration:'underline',marginTop:20}}>https://fred-resume.demo.local</div>
 <div style={{fontSize:22,fontWeight:650,margin:'50px 0 26px'}}>修复结果</div><table style={{fontSize:17,borderCollapse:'collapse',width:900}}><tbody>{['问题|修复内容|状态','内容展示|修复布局与信息遗漏|已完成','预览导出|确保预览与导出一致|已完成','交互体验|完善空状态和边界反馈|已完成'].map((r,i)=><tr key={r}>{r.split('|').map(c=><td key={c} style={{borderBottom:'1px solid #ddd',padding:'17px 18px',fontWeight:i===0?650:400,background:i===0?'#f7f7f7':'white'}}>{c}</td>)}</tr>)}</tbody></table>
 </div></div>
 <div style={{position:'absolute',left:438,top:766,width:900,height:166,border:'1px solid #ededed',borderRadius:22,padding:20,boxSizing:'border-box',color:'#aaa',fontSize:18}}>请输入你的需求，按「Enter」发送<div style={{position:'absolute',bottom:16,left:18,right:18,display:'flex',alignItems:'center',gap:12}}><span>♧</span><span>☷</span><span style={{border:'1px solid #eee',borderRadius:9,padding:'5px 10px',color:'#555'}}>▣ 技能</span><span>◌</span><span style={{marginLeft:'auto'}}>♧ 全能</span><span style={{background:'#aaa',color:'white',borderRadius:10,padding:'3px 9px',fontSize:30}}>↑</span></div></div>
 </div>
 {tr.map((m,i)=>m?<div key={i} style={{position:'absolute',left:m[1],top:m[2]-[6,15,9][i],transform:`translate(-50%,-50%) rotate(${m[3]}deg)`,fontFamily:'ErrorHeavy',fontWeight:900,fontSize:[184,196,188][i],lineHeight:1,whiteSpace:'nowrap',letterSpacing:i===0?4:i===1?-4:0}}>{(words?.[i]??['功能欠缺','出现bug','内容错误'][i]).slice(0,2)}<span style={{color:accent}}>{(words?.[i]??['功能欠缺','出现bug','内容错误'][i]).slice(2)}</span></div>:null)}
 <div style={{position:'absolute',inset:0,opacity:q(f,461,483),transform:`scale(${1+.08*(1-q(f,461,488))})`}}><svg width={1920} height={1080}><text x={85} y={643} fontSize={270} fontFamily='ErrorHeavy' fontWeight={900} letterSpacing={-25}>{words?.[3]??'严重消耗'}</text><text x={1070} y={650} fontSize={309} fontFamily='ErrorLatin' fontWeight={900} letterSpacing={-6} fill={accent}>{words?.[4]??'Token'}</text></svg></div>
 </AbsoluteFill>;
}
