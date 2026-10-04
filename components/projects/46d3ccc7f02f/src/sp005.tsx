import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import motion from './sp005-source-motion.json';
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
export const SP005: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender('load MiSans Heavy'));
  useEffect(() => {document.fonts.load('900 154px MiSans').then(() => continueRender(handle));}, [handle]);
  const row=motion[Math.min(frame,motion.length-1)];
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    {row.boxes.map((bounds,index)=>{
      if(!bounds)return null;
      const [x,y,w,h]=bounds;
      const width=frame>88?980:w;
      return <div key={index} style={{position:'absolute',left:x,top:y,width,height:h,
        borderRadius:h/2+(76-h/2)*Math.min(1,Math.max(0,(width/h-1)/2.7)),background:'#000',boxShadow:'0 12px 20px #0003',display:'grid',placeItems:'center'}}>
        {index===0&&<span style={{fontFamily:'MiSans',fontSize:154,fontWeight:900,color:'#fff',whiteSpace:'nowrap',
          opacity:interpolate(frame,[50,60,64],[0,.3,1],clamp)}}>筹划阶段</span>}
      </div>;
    })}
  </AbsoluteFill>;
};
