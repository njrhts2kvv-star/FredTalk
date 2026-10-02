import React,{useEffect,useState} from 'react';
import {staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {SeedancePage} from './SeedancePage';
import data from '../../../../specs/R003.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
const spec=data as unknown as ClipSpec;
export const FeaturesV3=({t}:{t:number})=>{
 const f=(t-14.55)*60;const o=data.objects.features;const [opacity]=measured(spec,'window',f);const [flipLeft,flipWidth]=measured(spec,'windowFlip',f);const flipScale=flipWidth/o.window.width;
 const [gate]=useState(()=>delayRender('R003 font'));
 useEffect(()=>{const font=new FontFace('SourceHanRFeatures',`url(${staticFile(data.fonts[0].file)})`,{weight:'900'});font.load().then(font=>{document.fonts.add(font);continueRender(gate)}).catch(cancelRender)},[gate]);
 return <><SeedancePage/>
 {f<8&&<div style={{position:'absolute',left:918,top:535,width:84,height:55,background:'#333',opacity:(1-f/8)*.45}}/>}
 <div style={{position:'absolute',inset:0,transform:`translateX(${flipLeft-o.window.x*flipScale}px) scaleX(${flipScale})`,transformOrigin:'0 0'}}>
 <div style={{position:'absolute',left:o.window.x,top:o.window.y,width:o.window.width,height:o.window.height,borderRadius:o.window.radius,background:'#222225',opacity,overflow:'hidden'}}><div style={{height:84,background:'#171719',display:'flex',gap:25,padding:'38px 58px',boxSizing:'border-box'}}>{['#f1249a','#ffb94c','#4488ff'].map(c=><span key={c} style={{width:24,height:24,borderRadius:'50%',background:c}}/>)}</div></div>
 {o.lines.map((text,i)=>{const [x,y,progress]=measured(spec,`line${i}`,f);return <div key={i} style={{position:'absolute',left:x,top:y-o.inkTopOffset,fontFamily:'SourceHanRFeatures',fontWeight:900,fontSize:o.fontSize,lineHeight:o.lineHeight,whiteSpace:'nowrap',color:o.accent,textShadow:'9px 11px 8px #000c'}}>{text.slice(0,Math.round(progress*text.length))}</div>})}</div></>;
};
