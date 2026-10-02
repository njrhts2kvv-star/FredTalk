import React from 'react';
import {Img} from 'remotion';
import {cleanStaticFile} from './clean-assets';
import data from '../../../specs/B024.json';
export function B024Screen({index,scale}:{index:number;scale:number}){
 const t=data.content.texts,accent=data.content.accent;
 return <div style={{position:'absolute',inset:0,overflow:'hidden',background:'white'}}><div style={{width:462,height:1006,transform:`scale(${scale})`,transformOrigin:'top left',fontFamily:'B024Regular',fontSize:18,color:'#18181c'}}>
 {index===1?<><Img src={cleanStaticFile('batch1/phone24-1.jpg')} style={{position:'absolute',inset:0,width:462,height:1006,objectFit:'cover'}}/><div style={{position:'absolute',top:72,left:25,right:25,display:'flex',justifyContent:'space-between',color:'white',fontSize:24}}><span>{t[3]}</span><span>♧　◉　☷</span></div><div style={{position:'absolute',bottom:40,left:23,right:23,display:'flex',justifyContent:'space-between'}}>{['♩','▣','▰','×'].map((v,i)=><div key={i} style={{background:'#eeeeeedb',width:80,height:80,borderRadius:50,fontSize:48,textAlign:'center',lineHeight:'80px',color:i===3?'#e54b4b':'#303035'}}>{v}</div>)}</div></>:<><div style={{padding:'65px 15px 16px',textAlign:'center',fontSize:20,fontWeight:700,borderBottom:'1px solid #eee'}}>‹　{t[0]}　♧</div><div style={{padding:'10px 18px'}}>{[0,1,2].map((v)=><React.Fragment key={v}><div style={{margin:'12px 0 20px 30px',borderRadius:18,background:accent,color:'white',padding:13,fontSize:19,lineHeight:1.45}}>{v===0?t[1]:t[v+3]}</div><div style={{fontSize:21,lineHeight:1.7,padding:'4px 4px 16px'}}>{v===0?<>{t[3]}<br/>{t[0]}<br/>{t[1]}</>:<>{t[4]}<br/>{t[5]}<br/>{t[0]}</>}</div></React.Fragment>)}</div><div style={{position:'absolute',bottom:7,left:0,right:0,background:'white',borderTop:'1px solid #ddd',padding:'12px 16px',fontSize:19}}>♧　{t[2]}　＋　　　　　◎</div></>}
 <div style={{position:'absolute',top:13,left:25,right:23,display:'flex',justifyContent:'space-between',fontSize:16,color:index===1?'white':'black'}}><span>04:30</span><span>ııı ▰</span></div>
 </div></div>;
}
