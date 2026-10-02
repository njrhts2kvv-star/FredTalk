import React from 'react';
import {measured,ClipSpec} from '../../../runtime/clip-spec';
import data from '../../../specs/B008.json';
/** Independently editable source interaction; authorized Fred copy only. */
export function B008Input({frame}:{frame:number}) {
 const spec=data as unknown as ClipSpec;
 const [x,y,scale]=measured(spec,'inputPanel',frame);
 const [cursorX,cursorY,cursorScale]=measured(spec,'inputCursor',frame);
 const clicked=frame>=181, sent=frame>=212;
 const text=data.objects.documents['batch1/app-eight-3.jpg'].items.join('，');
 return <div style={{position:'absolute',inset:0,overflow:'hidden',fontFamily:data.fonts[1].family,background:sent?'white':'radial-gradient(#bcbcc2 1px, transparent 1px) #f3f3f3',backgroundSize:`${20*scale}px ${20*scale}px`}}>
 {sent?<div style={{position:'absolute',right:95,top:570-Math.min(140,(frame-212)*6),padding:'20px 28px',background:'#ededed',borderRadius:20,fontSize:24}}>{text}</div>:<>
 <div style={{position:'absolute',left:x,top:y,width:1056,height:296-42*Math.min(1,Math.max(0,(frame-144)/16)),transform:`scale(${scale})`,transformOrigin:'top left',borderRadius:30,background:clicked?'linear-gradient(130deg,white 12%,#b2a0e5 62%,#8960ca 100%)':'white',boxShadow:'0 0 18px #dedee355'}}>
 <div style={{display:frame>=152?'none':'flex',gap:12,position:'absolute',left:28,top:26}}>{['会议摘要','行动清单','回顾记录'].map((label,i)=><div key={label} style={{opacity:frame>=90+i*12?1:0,border:'1px solid #ececef',borderRadius:16,width:218,height:70,display:'flex',alignItems:'center',gap:15,fontSize:20}}><span style={{marginLeft:16,color:['#e86986','#63b9a0','#689acd'][i]}}>▤</span>{label}</div>)}</div>
 <div style={{position:'absolute',left:28,right:20,top:frame>=152?110:132,fontSize:25,whiteSpace:'nowrap',textAlign:frame>=152?'right':'left'}}>{frame<90?'':text.slice(0,Math.max(0,Math.floor((frame-89)*1.6)))}</div>
 <div style={{position:'absolute',left:30,bottom:35,fontSize:30,color:'#555'}}>▣　♧　♧</div>
 <div style={{position:'absolute',right:118,bottom:40,fontSize:23,color:'#888',display:'flex',alignItems:'center',gap:35}}><span>⌄</span><span>♩</span><span>ııı</span></div>
 <div style={{position:'absolute',right:20,bottom:26,width:58,height:58,borderRadius:15,background:clicked?'white':data.content.accent,color:clicked?data.content.accent:'white',fontSize:39,textAlign:'center',lineHeight:'58px',transform:frame>=181&&frame<187?'scale(.92)':'none'}}>↑</div>
 </div>
 <svg viewBox="0 0 80 80" style={{position:'absolute',left:cursorX,top:cursorY,width:80*cursorScale,height:80*cursorScale,overflow:'visible'}}><path d="M5 5 L65 25 Q73 28 64 34 L42 45 L30 67 Q26 73 22 62 Z" fill="black" stroke="white" strokeWidth="6" strokeLinejoin="round"/></svg>
 </>}
 </div>;
}
