import React from 'react';
export const blue='#064bef';
export const box=(x:number,y:number,w:number,h:number):React.CSSProperties=>({position:'absolute',left:x-w/2,top:y-h/2,width:w,height:h});
export const Pill:React.FC<{text:string,x:number,y:number,w:number,h?:number}>=({text,x,y,w,h=95})=><div style={{...box(x,y,w,h),background:'#050505',color:'white',borderRadius:24,display:'flex',alignItems:'center',justifyContent:'center',fontSize:h*.54,fontWeight:600,whiteSpace:'nowrap',boxShadow:'0 10px 22px #00000015'}}>{text}</div>;
export const Ring:React.FC<{x:number,y:number,t?:number}>=({x,y,t})=>{
 const focus=t!==undefined;
 const shrink=focus?Math.max(0,Math.min(1,(t-5.8)/.7)):1;
 const pulse=focus?[3.28,3.92].map(start=>Math.max(0,Math.min(1,(t-start)/.38))).find(v=>v>0&&v<1):undefined;
 return <><div style={{...box(x,y,58-20*shrink,58-20*shrink),border:(17-9*shrink)+'px solid '+blue,borderRadius:'50%',background:'white',boxShadow:focus?`0 0 0 ${3*(1-shrink)}px white,0 0 0 ${5*(1-shrink)}px #2749c980`:'0 0 0 7px #064bef18'}}/>
 {pulse!==undefined&&<div style={{...box(x,y,64+26*pulse,64+26*pulse),border:(2*(1-pulse))+'px solid #3455c9',borderRadius:'50%'}}/>}</>;
};
export const Card:React.FC<{x:number,y:number,w?:number,h?:number,title:string,task?:boolean,trace?:number}>=({x,y,w=590,h=450,title,task=false,trace=0})=><div style={{...box(x,y,w,h),background:'#fff',borderRadius:50,boxShadow:'0 18px 55px #00000018',border:'2px solid #eeeeee',padding:w*.085}}>
  <div style={{fontSize:w*.108,fontWeight:700,lineHeight:1.2,whiteSpace:'nowrap'}}>{title}</div>
  {task?<><div style={{marginTop:h*.09,background:blue,color:'white',borderRadius:17,padding:'4px 14px',fontSize:w*.09,width:'fit-content'}}>负责人</div><div style={{width:w*.14,height:w*.14,border:'4px solid #aaa',borderRadius:12,marginTop:h*.09}}/></>:<>
  <div style={{marginTop:h*.12,width:'83%',height:h*.045,borderRadius:8,background:'#b9b9b9'}}/>
  <div style={{marginTop:h*.07,width:'40%',height:h*.045,borderRadius:8,background:'#b9b9b9'}}/>
  <div style={{position:'absolute',left:w*.1,bottom:h*.12,width:w*.17,height:w*.17,border:'4px solid #aaa',borderRadius:9}}>
  <svg viewBox="0 0 100 100" style={{position:'absolute',width:'115%',height:'115%',left:-1,top:-8}}><path d="M 13 50 L 39 77 L 87 16" fill="none" stroke="#141414" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
  <div style={{position:'absolute',left:w*.33,bottom:h*.24,width:w*.52,height:h*.046,borderRadius:8,background:'#777'}}/>
  <div style={{position:'absolute',left:w*.33,bottom:h*.14,width:w*.26,height:h*.046,borderRadius:8,background:'#bbb'}}/></>}
  {trace>0&&<svg style={{position:'absolute',inset:-3,width:w+6,height:h+6,overflow:'visible'}}><rect x="2" y="2" width={w} height={h} rx="50" fill="none" stroke={blue} strokeWidth="10" pathLength="1" strokeDasharray="1" strokeDashoffset={1-trace}/></svg>}
</div>;
export const Person:React.FC<{x:number,label:string}>=({x,label})=><>
<div style={{...box(x,255,165,165),borderRadius:28,background:'#080909',boxShadow:'0 15px 30px #00000020'}}>
<svg viewBox="0 0 165 165" width="165" height="165"><circle cx="82" cy="58" r="25" fill="none" stroke="#ddd" strokeWidth="3"/><path d="M40 130v-10c0-45 84-45 84 0v10Z" fill="none" stroke="#ddd" strokeWidth="3"/></svg></div>
<div style={{...box(x,409,370,64),textAlign:'center',fontSize:43,fontWeight:700}}>{label}</div></>;
