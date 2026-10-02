import {FiveFontFace} from "../../../../five-fonts.ts";
import React,{useState,useEffect} from 'react';
import {staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../../specs/R005.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';
export const CountV3=({t}:{t:number})=>{
 const f=(t-data.reference.referenceStart)*60,spec=data as unknown as ClipSpec,o=data.objects.count;
 const [x,y,w,h,opacity]=measured(spec,'number',f),branches=measured(spec,'branchLight',f),[pw,ph,pa]=measured(spec,'pill',f),glyphs=measured(spec,'pillGlyphOpacity',f);
 const [gate]=useState(()=>delayRender('R005 font'));useEffect(()=>{const font=new FiveFontFace('R005Heavy',`url(${staticFile(data.fonts[0].file)})`,{weight:'900'});font.load().then(font=>{document.fonts.add(font);continueRender(gate)}).catch(cancelRender)},[gate]);
 return <div style={{fontFamily:'R005Heavy',fontWeight:900}}><div style={{position:'absolute',left:960-pw/2,top:540-ph/2,width:pw,height:ph,background:'#000',borderRadius:ph/2,opacity:pa,boxShadow:'22px 18px 22px #0004',color:'#d6f878'}}/><div style={{position:'absolute',left:216,top:540-o.pillFontSize*.6-28,width:1464,textAlign:'center',color:'#d6f878',fontSize:o.pillFontSize,whiteSpace:'nowrap',filter:`blur(${Math.max(0,Math.min(8,(f-200)/2))}px)`}}>{[...o.pillText].map((char,i)=><span key={i} style={{opacity:glyphs[Math.min(i,glyphs.length-1)]??0}}>{char}</span>)}</div>
 <div style={{position:'absolute',left:x+w/2,top:y+h/2,transform:'translate(-50%,-50%)',fontSize:h/.76,lineHeight:1,color:'#ffae00',opacity,textShadow:'12px 12px 15px #000c'}}>50</div>
 <svg width={1920} height={1080} style={{position:'absolute'}}>{branches.map((v,i)=><path key={i} d={`M${o.origin[0]} ${o.origin[1]}L${o.ends[i][0]} ${o.ends[i][1]}`} stroke="#000" strokeWidth={24} opacity={v} style={{filter:'drop-shadow(8px 8px 7px #0005)'}}/>)}</svg>
 {o.labels.map((text,i)=>{const chars=[...(o.values[i]+text)];return <div key={i} style={{position:'absolute',left:o.textLeft,top:o.textTops[i],fontSize:o.textSize,lineHeight:1,color:'#fff',textShadow:'8px 9px 10px #000, -2px -2px 3px #0007',whiteSpace:'nowrap'}}>{chars.map((char,j)=><span key={j} style={{color:j<o.values[i].length?o.colors[i]:'#fff',opacity:f>=o.glyphStarts[i][j]?1:0}}>{char}</span>)}</div>})}</div>;
};
