import {FiveFontFace} from "../../../../five-fonts.ts";
import React,{useState,useEffect} from 'react';
import {staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {SeedancePage} from './SeedancePage';
import data from '../../../../specs/R004.json';
import {measured,ClipSpec} from '../../../../runtime/clip-spec';
export const VersionV3=({t}:{t:number})=>{
 const f=Math.round((t-22.3)*60), spec=data as unknown as ClipSpec, [x,w]=measured(spec,'window',f),[opacity]=measured(spec,'content',f),[arrow]=measured(spec,'arrowReveal',f),o=data.objects;
 const [gate]=useState(()=>delayRender('R004 font'));useEffect(()=>{const font=new FiveFontFace('R004Heavy',`url(${staticFile(data.fonts[0].file)})`,{weight:'900'});font.load().then(font=>{document.fonts.add(font);continueRender(gate)}).catch(cancelRender)},[gate]);
 const value=o.title.valueCues.filter(v=>v[0]<=f).at(-1)?.[1]??20;
 const start=o.title.scrambleStarts.find(start=>f>=start&&f<start+14);
 const digit=start===undefined?String(value):'2'+[String(value%10),'=','+','$',String((value+1)%10)][Math.min(4,Math.floor((f-start)/3))];
 return <><SeedancePage/><div style={{position:'absolute',left:x,top:o.window.y,width:1664,height:o.window.height,borderRadius:o.window.radius,background:'#222225',transform:`scaleX(${w/1664})`,transformOrigin:'0 0',overflow:'hidden'}}><div style={{height:o.window.barHeight,background:'#171719',display:'flex',gap:25,padding:'38px 58px',boxSizing:'border-box'}}>{['#f1249a','#ffb94c','#4488ff'].map(c=><span key={c} style={{width:24,height:24,borderRadius:'50%',background:c}}/>)}</div><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:60,fontFamily:'R004Heavy',fontWeight:900,fontSize:o.title.fontSize,color:'#fff',opacity,transform:'translateY(-25px)'}}>{o.title.prefix} {digit} {o.title.suffix}<svg width={285} height={240} viewBox="0 0 285 240" style={{transform:'translateY(-40px)',clipPath:`inset(0 ${(1-arrow)*100}% 0 0)`,opacity:arrow>0?1:0}}><path d="M12 210 Q179 196 207 63 L179 57 L256 0 L277 114 L243 98 Q166 224 20 234 Z" fill="#ffbf13"/></svg></div></div></>;
};
