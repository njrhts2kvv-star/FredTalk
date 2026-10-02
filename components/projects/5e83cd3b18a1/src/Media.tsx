import mediaBindings from "../media-bindings.json";
import React from 'react';
import {Img, Loop, OffthreadVideo, staticFile, useVideoConfig, delayRender, continueRender, cancelRender, Freeze, useCurrentFrame} from 'remotion';
import durations from '../public/shared/videos.json';
import revisionAssets from '../public/revision/manifest.json';
export const Media: React.FC<{src:string;fit?:'cover'|'contain';style?:React.CSSProperties;startFrame?:number}> = ({src,fit='cover',style,startFrame=0}) => {
 const {fps,id}=useVideoConfig(); const frame=useCurrentFrame();
 const isProduct=(mediaBindings as Record<string,string>)[src]==='product.png';
 const common:React.CSSProperties={width:'100%',height:'100%',objectFit:fit,...style,...(isProduct?{objectFit:'contain' as const,background:'#fff'}:{})};
 if(!/\.(mp4|webm)$/.test(src))return <Img src={staticFile(src)} style={common}/>;
 const source=revisionAssets.find(x=>src===`revision/${x.id}.mp4`); const duration=source?source.end-source.start:durations.find(x=>x.file===src)?.duration??5;
 const length=Math.max(2,Math.floor(duration*fps)-2),blend=Math.min(12,Math.floor(length/4)),elapsed=Math.max(0,frame-startFrame);
 const continuous=['Motion015','Motion016','Motion033','Motion036','Motion038','Motion041','Motion042','Motion044','Motion045','Motion051','Motion052'].includes(id);
 const local=!continuous?Math.min(elapsed,length-1):elapsed<length?elapsed:blend+(elapsed-length)%(length-blend),mix=continuous?Math.max(0,(local-(length-blend))/blend):0;
 return <div style={{position:'relative',width:'100%',height:'100%'}}><Freeze frame={local}><OffthreadVideo transparent={src.endsWith('.webm')} muted src={staticFile(src)} style={common}/></Freeze>{mix>0&&<div style={{position:'absolute',inset:0,opacity:mix}}><Freeze frame={local-(length-blend)}><OffthreadVideo transparent={src.endsWith('.webm')} muted src={staticFile(src)} style={common}/></Freeze></div>}</div>;
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
