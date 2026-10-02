import {DARK_PURPLE,purpleOnDark,purpleOnSurface} from "../../../surface-purple.ts";
import {FiveFontFace} from "../../../five-fonts.ts";
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, delayRender, continueRender, cancelRender} from 'remotion';
import data from '../../../specs/B002.json';
import {measured, type ClipSpec} from '../../../runtime/clip-spec';
import {cleanStaticFile} from './clean-assets';

export function RebuiltB002({frame, text, accent, assets, proof=false}: {frame:number; text?:string; accent?:string; assets?:Record<string,string>; proof?:boolean}) {
  const spec=data as unknown as ClipSpec;
  const font=data.fonts[0];
  const [handle]=useState(()=>delayRender('B002 measured typeface'));
  useEffect(()=>{
    const face=new FiveFontFace(font.family,`url(${staticFile(font.file)})`,{weight:'400'});
    face.load().then(f=>{document.fonts.add(f);continueRender(handle);}).catch(cancelRender);
  },[font.family,font.file,handle]);
  const [cx,cy,width,height]=measured(spec,'capsule',frame);
  const [offset]=measured(spec,'mediaOffset',frame);
  const [blur]=measured(spec,'circleBlur',frame);
  const opacity=measured(spec,'textOpacity',frame);
  const shadow=data.objects.capsule.shadowParameters;
  const words=Array.from(text??(proof?data.content.referenceText:data.content.text));
  const [cornerRadius]=measured(spec,'cornerRadius',frame);
  const radius=Math.min(cornerRadius,width/2,height/2);
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    {width>0&&<svg width={1920} height={1080} style={{position:'absolute',overflow:'visible'}}><defs><filter id="b002-shadow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation={`${shadow.sigmaX} ${shadow.sigmaY}`}/></filter></defs><rect x={cx-width/2+shadow.offsetX} y={cy-height/2+shadow.offsetY} width={width} height={height} rx={radius} fill="black" opacity={shadow.alpha} filter="url(#b002-shadow)"/></svg>}
    {width>0&&<div style={{position:'absolute',left:cx-width/2,top:cy-height/2,width,height,background:'#000',borderRadius:radius,filter:blur?`blur(${blur}px)`:undefined}}/>}
    {frame<72&&data.content.media.map((asset,i)=>{
      const replacement=assets?.[i?'film-right':'film-left'];
      const src=replacement?staticFile(replacement):cleanStaticFile(asset);
      const style:React.CSSProperties={width:'100%',height:'100%',objectFit:'cover'};
      return <div key={asset} style={{position:'absolute',left:i*960+(i?offset:-offset),top:270,width:960,height:540,overflow:'hidden',borderRadius:40,boxShadow:data.objects.media.shadow}}>{/\.mp4(?:\?|$)/i.test(src)?<OffthreadVideo muted src={src} style={style}/>:<Img src={src} style={style}/>}</div>;
    })}
    <div style={{position:'absolute',top:data.objects.text.top,left:0,width:1920,textAlign:'center',fontFamily:font.family,fontSize:font.fontSize,fontWeight:400,fontSynthesis:'none',letterSpacing:font.letterSpacing,lineHeight:1,whiteSpace:'nowrap',color:proof?'#c4dd69':purpleOnDark(accent??data.content.accent)}}>
      {words.map((char,i)=>{const position=words.length===1?0:i*7/(words.length-1),lo=Math.floor(position),hi=Math.ceil(position),a=opacity[lo]+(opacity[hi]-opacity[lo])*(position-lo);return <span key={i} style={{opacity:a}}>{char}</span>;})}
    </div>
  </AbsoluteFill>;
}
