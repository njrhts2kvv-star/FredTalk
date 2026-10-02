import revisionAssets from '../public/revision/manifest.json';
import mediaBindings from "../media-bindings.json";
import React,{useState,useEffect} from 'react';
import {continueRender,delayRender,cancelRender,staticFile,interpolate,Easing,Img,OffthreadVideo,Freeze,useCurrentFrame,useVideoConfig} from 'remotion';
const fontsReady=Promise.all([['400','MiSans-Regular.otf'],['500','MiSans-Medium.otf'],['700','MiSans-Semibold.otf'],['800','MiSans-Heavy.otf']].map(async ([weight,file])=>{const font=new FontFace('MiSans',`url(${staticFile('fonts/'+file)})`,{weight});await font.load();document.fonts.add(font);}));
export const useFonts=()=>{const [gate]=useState(()=>delayRender('Local MiSans mounted'));useEffect(()=>{fontsReady.then(()=>continueRender(gate)).catch(cancelRender);return ()=>continueRender(gate);},[gate]);};
export const ease=Easing.bezier(.22,1,.36,1);
export const p=(t:number,a:number,b:number)=>interpolate(t,[a,b],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
export const mix=(a:number,b:number,v:number)=>a+(b-a)*v;
export const shadow='10px 14px 18px #0003';
export const lime='#8960CA';
export const Center:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>>=({children,style})=><div style={{position:'absolute',inset:0,display:'flex',justifyContent:'center',alignItems:'center',...style}}>{children}</div>;
export const Mac:React.FC<React.PropsWithChildren<{style?:React.CSSProperties}>>=({children,style})=><div style={{position:'relative',background:'#222225',borderRadius:22,overflow:'hidden',boxShadow:shadow,...style}}><div style={{height:56,background:'#161617',display:'flex',gap:13,alignItems:'center',paddingLeft:28}}>{['#ec5270','#d8ca51','#70b6dc'].map(c=><i key={c} style={{width:17,height:17,borderRadius:30,background:c}}/>)}</div>{children}</div>;
const pictureRoles:Record<string,string>={
 'seedance-ui.jpg':'fred-conversation.jpg','character-blur.jpg':'fred-team-meeting.jpg','document.jpg':'fred-conversation.jpg',
 'phone-0.jpg':'fred-walk-portrait.mp4','phone-1.jpg':'fred-meeting-portrait.mp4','phone-2.jpg':'fred-street-portrait.mp4',
 'app-0.jpg':'fred-walk-portrait.mp4','app-1.jpg':'fred-meeting-portrait.mp4','app-2.jpg':'fred-street-portrait.mp4',
 'art-0.jpg':'fred-walk-portrait.jpg','art-1.jpg':'note-0.svg','art-2.jpg':'fred-meeting-portrait.jpg','art-3.jpg':'note-1.svg','art-4.jpg':'fred-street-portrait.jpg','art-5.jpg':'note-2.svg'};
export const Photo=({name,style}:{name:string,style?:React.CSSProperties})=>{
 const frame=useCurrentFrame(),{fps,id}=useVideoConfig(); const asset=pictureRoles[name],src=asset?`revision/${asset}`:name;
 const css:React.CSSProperties={width:'100%',height:'100%',objectFit:'contain',background:'#F2F0F5',...style};
 if(!src.endsWith('.mp4'))return <Img src={staticFile(src)} style={css}/>;
 const source=revisionAssets.find(x=>src===`revision/${x.id}.mp4`);const duration=source?source.end-source.start:5;
 const length=Math.max(2,Math.floor(duration*fps)-2),blend=Math.min(12,Math.floor(length/4));
 const continuous=id==='Library120-MediaMontage';
 const local=!continuous?Math.min(frame,length-1):frame<length?frame:blend+(frame-length)%(length-blend),mix=continuous?Math.max(0,(local-(length-blend))/blend):0;
 return <div style={{position:'relative',width:'100%',height:'100%'}}><Freeze frame={local}><OffthreadVideo muted src={staticFile(src)} style={css}/></Freeze>{mix>0&&<div style={{position:'absolute',inset:0,opacity:mix}}><Freeze frame={local-(length-blend)}><OffthreadVideo muted src={staticFile(src)} style={css}/></Freeze></div>}</div>;
};

export const Phone:React.FC<React.PropsWithChildren<{x?:number,y?:number,scale?:number,rotate?:number,bg?:string,style?:React.CSSProperties}>>=({children,x=960,y=510,scale=1,rotate=0,bg='white',style})=><div style={{position:'absolute',left:x,top:y,width:440,height:930,transform:`translate(-50%,-50%) scale(${scale}) rotate(${rotate}deg)`,border:'12px solid #111',borderRadius:88,background:bg,boxShadow:'inset 0 0 0 4px #aaa, 12px 12px 17px #0004',...style}}><div style={{position:'absolute',inset:8,borderRadius:65,overflow:'hidden'}}>{children}</div><div style={{position:'absolute',width:133,height:34,left:'50%',top:20,transform:'translateX(-50%)',background:'#080808',borderRadius:50}}/></div>;
export const Icon=({kind,color=lime,size=120}:{kind:number,color?:string,size?:number})=><svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">{kind===0?<><path d="M24 14h37l16 17v55H24zM60 14v20h17M35 43h29M35 54h29M35 65h29M35 76h17"/></>:kind===1?<><rect x="14" y="18" width="72" height="65" rx="7"/><circle cx="64" cy="36" r="7"/><path d="M16 68l23-25 21 23 13-12 12 15"/></>:kind===2?<><rect x="13" y="21" width="74" height="60" rx="7"/><path d="M42 36l24 15-24 15z"/></>:<>{[24,45,68,83,58,33,13].map((h,i)=><path key={i} d={`M${14+i*12} ${50-h/2}v${h}`}/>)}</>}</svg>;
