// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import React from 'react';
import {Img, Loop, OffthreadVideo, staticFile, useVideoConfig, delayRender, continueRender, cancelRender} from 'remotion';
import durations from '../public/shared/videos.json';
export const Media: React.FC<{src:string;fit?:'cover'|'contain';style?:React.CSSProperties}> = ({src,fit='cover',style}) => {
 const {fps}=useVideoConfig();
 const common:React.CSSProperties={width:'100%',height:'100%',objectFit:fit,...style};
 if(!src.endsWith('.mp4'))return <Img src={staticFile(src)} style={common}/>;
 const duration=durations.find(x=>x.file===src)?.duration??5;
 return <Loop durationInFrames={Math.max(1,Math.floor(duration*fps))}><OffthreadVideo muted src={staticFile(src)} style={common}/></Loop>;
};
let fontReady:Promise<unknown>|null=null;
export const FontGate:React.FC<React.PropsWithChildren>=({children})=>{
 const [handle]=React.useState(()=>delayRender('Load packaged fonts'));
 React.useEffect(()=>{
  if(!fontReady)fontReady=Promise.all([['FredRegular','shared/MiSans-Regular.otf','400'],['FredHeavy','shared/MiSans-Heavy.otf','900']].map(async([family,url,weight])=>{
   const face=new FontFace(family,`url(${staticFile(url)})`,{weight});await face.load();document.fonts.add(face);
  }));
  fontReady.then(()=>continueRender(handle)).catch(cancelRender);
 },[handle]);
 return <>{children}</>;
};
