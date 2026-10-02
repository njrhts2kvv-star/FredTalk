import React from 'react';
import {Photo} from './common';
/** Reference page geometry stays visible beneath the foreground window. */
export const SeedancePage=({blur=15,brightness=.76}:{blur?:number,brightness?:number})=><div style={{position:'absolute',inset:-25,background:'#fafafa',filter:`blur(${blur}px) brightness(${brightness})`,fontFamily:'MiSans',color:'#242424'}}>
 <div style={{position:'absolute',top:35,left:650,fontSize:22}}>FredTalk · AI 创作工具与实践</div>
 <div style={{position:'absolute',top:90,left:770,fontSize:50,fontWeight:800}}>创作，让灵感发生</div>
 <div style={{position:'absolute',top:192,left:570,width:800,height:266,background:'#fff',borderRadius:28,padding:34,boxSizing:'border-box',boxShadow:'0 5px 22px #bbb4'}}><div style={{fontSize:28}}>描述你希望创作的画面</div><div style={{marginTop:72,fontSize:23,color:'#777'}}>图像参考　　视频生成　　创作参数</div><div style={{marginTop:45,fontSize:24}}>＋ 添加素材　　　　　　　16:9　　　　开始创作</div></div>
 <div style={{position:'absolute',top:550,left:580,display:'flex',gap:30}}>{['fred-conversation.jpg','fred-team-meeting.jpg','fred-walk-portrait.jpg','fred-street-portrait.jpg'].map((x,i)=><div key={i} style={{width:170,height:100,borderRadius:12,overflow:'hidden'}}><Photo name={'revision/'+x} style={{objectFit:'cover'}}/></div>)}</div>
 <div style={{position:'absolute',top:755,left:405,width:1135,display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24}}>{Array.from({length:12},(_,i)=><div key={i} style={{height:185,borderRadius:16,overflow:'hidden',background:'#eee'}}>{i===0?<div style={{height:'100%',background:'#161616',color:'#fff',fontSize:36,padding:20,boxSizing:'border-box'}}>FredTalk<br/>创作案例</div>:<Photo name={'revision/'+['fred-conversation.jpg','fred-team-meeting.jpg','fred-walk-portrait.jpg','fred-street-portrait.jpg'][i%4]} style={{objectFit:'cover'}}/>}</div>)}</div>
</div>;
