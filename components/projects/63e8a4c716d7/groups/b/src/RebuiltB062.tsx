import {FiveFontFace} from "../../../five-fonts.ts";
import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import data from '../../../specs/B062.json';
import {measured,type ClipSpec} from '../../../runtime/clip-spec';
export function RebuiltB062({frame,proof=false}:{frame:number;proof?:boolean}){
 const spec=data as unknown as ClipSpec;const [handle]=useState(()=>delayRender('B062 measured numeral fonts'));const [descent,setDescent]=useState(0);
 useEffect(()=>{Promise.all(data.fonts.map(async font=>{const face=await new FiveFontFace(font.family,`url(${staticFile(font.file)})`,{weight:font.weight}).load();document.fonts.add(face)})).then(()=>{const ctx=document.createElement('canvas').getContext('2d')!;ctx.font=`500 ${data.objects.digits.fontSize}px B062Numeral`;setDescent(ctx.measureText('32.0%').actualBoundingBoxDescent);continueRender(handle)}).catch(cancelRender)},[handle]);
 const header=measured(spec,'brandBox',frame);const brandScale=header[3]/127;const titleX=header[0]-9*brandScale;const titleY=header[1]-2*brandScale;const conclusionOpacity=measured(spec,'conclusionOpacity',frame)[0];const scale=measured(spec,'barA',frame)[2]/292;
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
 {proof?<Img src={staticFile(data.objects.header.referenceFile)} style={{position:'absolute',left:titleX,top:titleY,width:400*brandScale,height:130*brandScale,objectFit:'contain'}}/>:<div style={{position:'absolute',left:titleX,top:titleY+15*brandScale,fontFamily:'B062Title',fontWeight:400,fontSynthesis:'none',fontSize:data.objects.header.fontSize*brandScale,lineHeight:1.2,whiteSpace:'nowrap'}}>{data.content.text[0]}</div>}
 <div style={{position:'absolute',left:titleX+(proof?416:340)*brandScale,top:titleY+15*brandScale,fontFamily:'B062Title',fontWeight:400,fontSynthesis:'none',fontSize:data.objects.header.conclusionFontSize*brandScale,lineHeight:1,whiteSpace:'nowrap',opacity:conclusionOpacity}}>{proof?data.objects.header.sourceConclusion:data.content.text[3]}</div>
 {[0,1].map(i=>{const [x,y,w,h]=measured(spec,i?'barB':'barA',frame);const [tx,ty,tw,th]=measured(spec,'digits'+i,frame);const value=measured(spec,'value'+i,Math.floor(frame))[0];const avatar=measured(spec,'avatar'+i,frame);return <React.Fragment key={i}>
 <div style={{position:'absolute',left:x,top:y,width:w,height:h,boxSizing:'border-box',background:(proof?data.objects.bars.colors:data.objects.bars.fredColors)[i],borderRadius:`${data.objects.bars.radius*scale}px ${data.objects.bars.radius*scale}px 0 0`,border:h>0?data.objects.bars.border:'none'}}/>
 <svg width={1920} height={1080} style={{position:'absolute',inset:0,overflow:'visible'}}><text x={tx+tw/2} y={ty+th-descent*scale} textAnchor="middle" style={{fontFamily:'B062Numeral',fontWeight:500,fontSize:data.objects.digits.fontSize*scale,letterSpacing:data.objects.digits.letterSpacing*scale,fontSynthesis:'none'}}>{value.toFixed(1)}%</text></svg>
 {<div style={{position:'absolute',opacity:measured(spec,'avatarOpacity'+i,frame)[0],left:avatar[0],top:avatar[1],width:avatar[2],height:avatar[3],borderRadius:'50%',overflow:'hidden',background:'#fff',boxShadow:data.objects.avatars.shadow}}><Img src={staticFile((proof?data.objects.avatars.proofFiles:data.objects.avatars.files)[i])} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
 </React.Fragment>})}
 </AbsoluteFill>
}
