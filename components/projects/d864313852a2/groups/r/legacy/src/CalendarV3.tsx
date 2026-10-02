import React from 'react';
import data from '../../../../specs/R001.json';
import {measured,ClipSpec} from '../../../../runtime/clip-spec';
const spec=data as unknown as ClipSpec;
export const CalendarV3=({t}:{t:number})=>{
 const f=t*60, obj=data.objects.calendar;
 const title=obj.title.slice(0,Math.min(obj.title.length,Math.ceil(Math.max(0,f-1)/44*obj.title.length)));
 const [x,y,w,h]=measured(spec,'calendar',f),[scale,opacity,blend]=measured(spec,'title',f),[circle]=measured(spec,'circle',f);
 const [reveal]=measured(spec,'calendarReveal',f);
 const CalendarBody=<div style={{position:'absolute',left:x,top:y,width:obj.width,height:obj.height,transform:`scale(${w/obj.width},${h/obj.height})`,transformOrigin:'0 0',borderRadius:obj.radius,background:obj.background,color:'#f7f7f7',fontFamily:'MiSans',fontWeight:400,overflow:'hidden',boxShadow:'0 8px 18px #0004'}}>
 {['#ff635e','#ffc54f','#38c64b'].map((c,i)=><div key={c} style={{position:'absolute',left:31+i*51,top:29,width:31,height:31,borderRadius:'50%',background:c}}/>)}
 <div style={{position:'absolute',left:36,top:104,fontSize:68,fontWeight:700}}>{obj.month}</div>
 <div style={{position:'absolute',right:40,top:114,display:'flex',gap:9}}>{['‹','›','今天'].map((v,i)=><div key={i} style={{width:i===2?166:80,height:60,borderRadius:14,background:'#464646',fontSize:46,textAlign:'center',lineHeight:'58px'}}>{v}</div>)}</div>
 <div style={{position:'absolute',left:0,right:0,top:220,display:'grid',gridTemplateColumns:'repeat(7,1fr)',fontSize:42,color:'#9d9d9d',textAlign:'center'}}>{obj.weekdays.map(d=><div key={d}>{d}</div>)}</div>
 <div style={{position:'absolute',top:obj.gridTop,left:0,right:0,display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>{Array.from({length:35},(_,i)=>{const d=i-2;return <div key={i} style={{height:obj.cellHeight,boxSizing:'border-box',borderTop:'2px solid #393939',borderRight:'2px solid #393939',fontSize:45,textAlign:'center',paddingTop:29,position:'relative'}}>{d>0&&d<32?d:''}{d===31&&<svg width="183" height="122" style={{position:'absolute',left:0,top:0}}><path d="M147 25 C117 0 27 1 0 40 C-18 73 17 96 51 109 C90 124 156 96 176 51" fill="none" stroke="#d73343" strokeWidth="5" pathLength={1} strokeDasharray={1} strokeDashoffset={1-circle}/></svg>}</div>})}</div></div>;
 return <><svg width={1920} height={1080} style={{position:'absolute'}}><defs><clipPath id="r001-title"><text x={960} y={635} textAnchor="middle" style={{fontFamily:'MiSans',fontWeight:800,fontSize:250,transform:`translate(960px,540px) scale(${scale}) translate(-960px,-540px)`}}>{title}</text></clipPath></defs>
 {reveal<1&&<><text x={960} y={635} textAnchor="middle" opacity={opacity*(1-reveal)} style={{fontFamily:'MiSans',fontWeight:800,fontSize:250,fill:'#222',filter:'drop-shadow(20px 14px 14px #0004)',transform:`translate(960px,540px) scale(${scale}) translate(-960px,-540px)`}}>{title}</text><foreignObject width={1920} height={1080} clipPath="url(#r001-title)" opacity={blend*(1-reveal)}>{CalendarBody}</foreignObject></>}
 {reveal>0&&<foreignObject width={1920} height={1080} opacity={reveal}>{CalendarBody}</foreignObject>}
 </svg></>;
};
