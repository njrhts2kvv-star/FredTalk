import {useShuHei} from './useShuHei';
import {Finder036} from './ReferenceInterfaces';
import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Media} from './Media';
import raw from '../../../../specs/R036.json';
import {ClipSpec,measured} from '../../../../runtime/clip-spec';

/** Three media cards join into one continuously clipped outer container. */
export const Clip036: React.FC<{media?:string[];labels?:string[]}> = ({media=['revision/fred-walk-portrait.mp4','revision/fred-meeting-portrait.mp4','revision/fred-street-portrait.mp4'],labels=['灵感','会议','交流']}) => {
 useShuHei();
 const frame=useCurrentFrame()*60/useVideoConfig().fps;
 const spec=raw as ClipSpec;
 const ramp=(a:number,b:number)=>interpolate(frame,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const smooth=(a:number,b:number)=>{const t=ramp(a,b);return t*t*(3-2*t)};
 const merge=measured(spec,'merge',frame)[0];
 const [ox,oy,ow,oh]=measured(spec,'outer',frame);
 const [titleOpacity,titleX,colorMix]=measured(spec,'title',frame);
 const shift=smooth(16,36);
 const joined=frame>=240;
 return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}><div style={{position:'absolute',width:1920,height:1080,transform:'scale(0.666666667)',transformOrigin:'0 0',fontFamily:'FredHeavy'}}>
 {frame<38&&<>
 <div style={{position:'absolute',left:-38+shift*2220,top:876,width:668,height:308,borderRadius:112,background:'#000',filter:'blur(18px)'}}/>
 <div style={{position:'absolute',zIndex:4,left:105+shift*2220,top:45,width:1710,height:990,borderRadius:105,overflow:'hidden',boxShadow:'27px -21px 54px #0007'}}><Finder036/></div>
 </>}
 {frame>=20&&<div style={{position:'absolute',left:joined?ox:0,top:joined?oy:0,width:joined?ow:1920,height:joined?oh:1080,borderRadius:joined?114:0,overflow:'hidden',background:joined?'black':'transparent',boxShadow:joined?'30px 20px 30px #0003':undefined}}>
 {media.map((src,i)=>{
 const enters=smooth(20+i*2,38+i*2);
 const baseX=[21,672,1326][i];
 const x=baseX+([228,716,1204][i]-baseX)*merge;
 const y=measured(spec,'cardEntryY',frame)[i]-14*merge;
 const textIn=smooth([50,80,110][i],[66,96,126][i]);
 return <div key={i} style={{position:'absolute',left:x-(joined?ox:0),top:y-(joined?oy:0),width:576-88*merge,height:864+28*merge,borderRadius:114*(1-merge),overflow:'hidden',background:'#000',boxShadow:merge===0?'27px 21px 30px #0003':undefined,opacity:1-ramp(240,256)}}>
 <div style={{position:'absolute',inset:0,opacity:ramp([34,64,94][i],[48,78,108][i])}}><Media src={src}/></div>
 <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:168,fontWeight:900,letterSpacing:-4.5,opacity:textIn*(1-ramp(222,242)),transform:`scale(${1.23-.23*textIn})`,textShadow:'0 6px 18px #0008'}}>{labels[i]}</div>
 </div>})}
 {frame>=288&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'FredHeavy',fontStyle:'italic',fontSize:Math.min(90,ow*.15),color:'#888',opacity:ramp(288,298)}}>FredTalk</div>}
 </div>}
 <div style={{position:'absolute',left:titleX,top:436,color:`rgb(${255-colorMix*238},${255-colorMix*238},${255-colorMix*238})`,fontFamily:'OfficialShuHei',fontSize:165,lineHeight:1.2,whiteSpace:'nowrap',opacity:titleOpacity}}>日常记录</div>
 </div></AbsoluteFill>;
};
export default Clip036;
