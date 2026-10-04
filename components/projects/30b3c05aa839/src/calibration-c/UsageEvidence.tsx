import {approvedStaticFile as staticFile} from '../../material-policy';
import React,{useEffect,useState} from 'react';
import {AbsoluteFill, delayRender, continueRender, cancelRender} from 'remotion';
import motion from './N054-motion.json';
let ready:Promise<unknown>|undefined;
export function UsageEvidence({t,words,accent}:{t:number;words?:string[];accent:string}){
 const [handle]=useState(()=>delayRender('Load evidence typeface'));useEffect(()=>{ready??=new FontFace('UsageHeavy',`url(${staticFile('calibration-c/SourceHanSansSC-Heavy.otf')})`,{weight:'900'}).load().then(f=>document.fonts.add(f));ready.then(()=>continueRender(handle)).catch(cancelRender)},[handle]);
 const f=Math.max(0,Math.min(311,Math.round(t*60))),m=motion[f];
 const labels=['图片生成','语音克隆','文转语音','视频生成','音乐生成'];
 const names=['Speech Preview','Text to Speech HD','music-2.6','music-cover','lyrics_generation','image-01'];
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans',fontWeight:400}}>
 <div style={{position:'absolute',left:m.x,top:m.y,width:1106,height:644,borderRadius:26,overflow:'hidden',background:'white',boxShadow:'0 5px 13px 7px #0006',transform:`scale(${m.scale})`,transformOrigin:'0 0'}}>
  <div style={{position:'absolute',left:30,top:-126-m.scroll,width:1030,borderLeft:'1px solid #f5f5f5',borderRight:'1px solid #f5f5f5',padding:'0 28px',boxSizing:'border-box'}}>{names.map((name,i)=><div key={name} style={{height:280,border:'1px solid #f5f5f5',borderRadius:10,boxSizing:'border-box',padding:20}}><div style={{fontFamily:'Arial',fontSize:22,color:'#292929',marginBottom:20}}>{name}</div><div style={{height:168,background:'#f8f8fa',borderRadius:8,padding:'21px 16px',boxSizing:'border-box'}}><div style={{fontSize:20,color:accent,fontWeight:600}}>今日</div><div style={{height:3,width:36,background:accent,marginTop:8}}/><div style={{display:'flex',justifyContent:'space-between',fontSize:15,color:'#888',marginTop:31}}><span>时间范围: 2026/09/28 00:00 - 2026/09/29 00:00</span><span>重置时间: 2 小时 14 分钟后重置</span></div><div style={{display:'flex',alignItems:'center',gap:15,marginTop:12,fontSize:18,color:'#555'}}><div style={{height:22,background:'white',border:'1px solid #e9e9e9',borderRadius:4,flex:1}}><div style={{width:5,height:'100%',background:accent,borderRadius:4}}/></div><span style={{width:96}}>0/{i===0?1500:i===1?9000:100}</span><span>0% 已使用</span></div></div></div>)}</div>
 </div>
 {labels.map((label,i)=><svg key={label} style={{position:'absolute',left:1339,top:[148,336,524,711,898][i],width:520,height:125,overflow:'visible',opacity:m.alpha[i]}}><text x={0} y={97} fontFamily='UsageHeavy' fontSize={110} fontWeight={900} fill='#000'>{words?.[i]??label}</text></svg>)}
 </AbsoluteFill>;
}
