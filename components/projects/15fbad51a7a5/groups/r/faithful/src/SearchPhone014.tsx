import {approvedStaticFile as staticFile} from '../../../../material-policy';
import React from 'react';
import {Img} from 'remotion';
/** Editable Fred search screen follows the reference typing, results and scroll states. */
export const SearchPhone014:React.FC<{seconds:number}>=({seconds:t})=>{
 const results=t>=2.82;
 const letters=Math.max(0,Math.min(8,Math.floor((t-1.04)*9)));
 const files=['fred-mic-magnet','fred-conversation','fred-team-meeting','fred-family','fred-walk-portrait','fred-night-review'];
 const titles=['声音随身记录','会议里的真实想法','把讨论整理成笔记','重要的日常细节','路上的新灵感','回看今天的记录'];
 return <div style={{position:'absolute',inset:0,background:'#f8f8f8',color:'#151515',fontFamily:'FredRegular',fontSize:12}}>
 <div style={{height:42,padding:'13px 17px 0',fontSize:13,boxSizing:'border-box'}}>14:41 <span style={{float:'right'}}>▂▄▆　◒ ▰</span></div>
 <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px'}}><span style={{fontSize:24}}>‹</span><div style={{flex:1,background:'white',padding:'7px 9px',borderRadius:5}}>{'FredTalk'.slice(0,letters)}{!results&&<span style={{color:'#8960ca'}}>|</span>}<span style={{float:'right',color:'#aaa'}}>⊗</span></div><span>搜索</span></div>
 {!results?<>
 <div style={{padding:'0 12px'}}>{['FredTalk','FredTalk 声音记录','FredTalk 会议笔记','FredTalk Codex','FredTalk 日常','FredTalk AI','FredTalk 工作流'].map(x=><div key={x} style={{height:32,borderBottom:'1px solid #ddd',display:'flex',alignItems:'center',gap:12}}><span style={{color:'#aaa'}}>⌕</span>{x}<span style={{marginLeft:'auto',color:'#aaa'}}>↖</span></div>)}</div>
 <div style={{position:'absolute',bottom:0,width:'100%',height:235,background:'#d9dbe1',paddingTop:12}}>{['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((row,i)=><div key={row} style={{display:'flex',justifyContent:'center',gap:4,marginBottom:8}}>{[...row].map(c=><span key={c} style={{background:'white',borderRadius:5,width:25,height:34,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{c}</span>)}</div>)}<div style={{margin:'0 12px',background:'white',borderRadius:6,height:32,textAlign:'right',paddingRight:15}}>⌕</div></div>
 </>:<>
 <div style={{display:'flex',justifyContent:'space-around',padding:'7px 0 11px',borderBottom:'1px solid #ddd'}}>综合　视频　用户　图文　团购</div>
 <div style={{height:29,color:'#666',padding:'7px 10px',boxSizing:'border-box',fontSize:11}}>全部　最新　记录　会议　日常</div>
 <div style={{height:560,overflow:'hidden'}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:3,transform:`translateY(${-Math.max(0,Math.min(1,(t-4.7)/1.1))*180}px)`}}>{files.map((file,i)=><div key={file} style={{background:'white'}}><Img src={staticFile(`revision/${file}.jpg`)} style={{width:'100%',height:i<2?110:180,objectFit:'cover'}}/><div style={{padding:'6px 5px',fontSize:11,lineHeight:1.4}}>{titles[i]}<div style={{fontSize:9,color:'#888',marginTop:8}}>◉ FredTalk <span style={{float:'right'}}>♡</span></div></div></div>)}</div></div>
 </>}
 </div>
};
