import React from 'react';
import data from '../../../specs/B008.json';
export function B008Workbench(){
 const docs=Object.values(data.objects.documents).slice(0,3),accent=data.content.accent;
 return <div style={{position:'absolute',inset:'85px 50px 70px',display:'grid',gridTemplateColumns:'18% 46% 36%',border:'2px solid #e9e9ec',borderRadius:15,background:'white',overflow:'hidden',fontFamily:data.fonts[1].family,color:'#36363c',fontSize:17}}>
 <div style={{background:'#f4f4f5',padding:'24px 15px',borderRight:'1px solid #e4e4e6'}}><div style={{fontSize:22,marginBottom:24}}>FRED</div>{docs.map(d=><div key={d.title} style={{padding:'14px 0'}}>▤　{d.title}</div>)}<div style={{marginTop:55,fontSize:15,color:'#888'}}>{docs[0].label}</div></div>
 <div style={{position:'relative',padding:'22px 28px',borderRight:'1px solid #e4e4e6'}}><div style={{fontSize:20,paddingBottom:24,borderBottom:'1px solid #eee'}}>{docs[0].title}</div>{docs.map(d=><div key={d.title} style={{marginTop:26}}><div style={{fontWeight:700,marginBottom:12}}>◉　{d.title}</div>{d.items.map(t=><div key={t} style={{lineHeight:1.85,paddingLeft:20}}><span style={{color:accent}}>◦ </span>{t}</div>)}</div>)}<div style={{position:'absolute',bottom:14,left:20,right:20,border:'1px solid #ececf0',borderRadius:12,height:54,display:'flex',alignItems:'center',padding:'0 15px',color:'#888'}}>＋　♩<span style={{marginLeft:'auto',background:accent,borderRadius:7,color:'white',padding:'3px 10px'}}>↑</span></div></div>
 <div style={{padding:'22px 24px'}}><div style={{fontSize:20,borderBottom:'1px solid #eee',paddingBottom:24}}>{docs[1].title}　＋</div><div style={{marginTop:24,fontSize:16,color:'#888'}}>{docs[1].label}</div>{docs[1].items.map(t=><div key={t} style={{marginTop:20,lineHeight:1.6}}>◯　{t}</div>)}<div style={{marginTop:80,color:'#888',fontSize:17}}>{docs[2].title}</div>{docs[2].items.map(t=><div key={t} style={{marginTop:15,fontSize:16,color:'#888'}}>· {t}</div>)}</div>
 </div>;
}
