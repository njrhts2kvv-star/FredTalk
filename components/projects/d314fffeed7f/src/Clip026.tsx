import {Workflow026} from './Workflow026';
import React,{useEffect,useState} from 'react';
import {useCurrentFrame,staticFile,delayRender,continueRender,cancelRender} from 'remotion';
import {Media} from './Media';
import data from '../../../../specs/R026.json';
import {measured,ClipSpec} from '../../../../runtime/clip-spec';
const spec=data as unknown as ClipSpec;
export const Clip026:React.FC=()=>{
 const frame=useCurrentFrame();const [gate]=useState(()=>delayRender('R026 selected font'));
 useEffect(()=>{const font=new FontFace('SourceHanR026',`url(${staticFile(data.fonts[0].file)})`,{weight:'900'});font.load().then(f=>{document.fonts.add(f);continueRender(gate)}).catch(cancelRender)},[gate]);
 const [cx,cw]=measured(spec,'centerPill',frame),[blur,opacity]=measured(spec,'backgroundFocus',frame),obj=data.objects.pills;
 const ramp=(a:number,b:number)=>Math.max(0,Math.min(1,(frame-a)/(b-a)));
 return <div style={{position:'absolute',width:1920,height:1080,transform:'scale(.6666666667)',transformOrigin:'0 0',overflow:'hidden',background:'#fff'}}>
 <div style={{position:'absolute',inset:0,background:'#181818',opacity:ramp(163,210),filter:`blur(${(1-ramp(193,229))*15}px)`}}><Workflow026 frame={frame}/></div>
 {[0,1,3,4,2].map(i=>{const start=obj.starts[i],a=ramp(start,start+21),separate=ramp(start+7,start+31),w=i===2?cw:130+(obj.normalWidth-130)*a,h=i===2?cw*204/522:204*a;const cy=i===2?540:(i<2?320:760)+(obj.centers[i]-(i<2?320:760))*separate;return <div key={i} style={{position:'absolute',left:(i===2?cx:960)-w/2,top:cy-h/2,width:w,height:h,borderRadius:h*.34,background:'#000',boxShadow:'28px 19px 25px #0004',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',opacity:i===2?1:opacity,filter:i===2?'none':`blur(${blur}px)`}}><span style={{fontFamily:'SourceHanR026',fontWeight:900,fontSize:obj.fontSize*(i===2?cw/522:1),color:obj.accent,lineHeight:1,whiteSpace:'nowrap',opacity:ramp(start+17,start+47)}}>{obj.labels[i]}</span></div>})}
 </div>;
};
export default Clip026;
