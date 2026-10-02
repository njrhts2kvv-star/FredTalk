import React from 'react';
import {continueRender,delayRender,staticFile} from 'remotion';
export type Clip=any;
export const font='MiSans';
const handle=delayRender('Load local MiSans fonts');
Promise.all([['Medium','500'],['Semibold','600']].map(async([name,weight])=>{
  const face=new FontFace(font,'url('+staticFile('fonts/MiSans-'+name+'.otf')+')',{weight});
  await face.load();document.fonts.add(face);
})).then(()=>continueRender(handle)).catch(e=>{throw e});
export const shadow='19px 22px 19px rgba(0,0,0,0.23), 4px 5px 5px rgba(0,0,0,0.19)';
export const WindowFrame:React.FC<{children?:React.ReactNode;y?:number;scale?:number;blur?:number}>=({children,y=82,scale=1,blur=0})=>
  <div style={{position:'absolute',left:320,top:y,width:1320,height:940,background:'#202529',borderRadius:28,boxShadow:shadow,overflow:'hidden',transform:'scale('+scale+')',filter:blur?'blur('+blur+'px)':'none'}}>
    <div style={{height:77,background:'#111719',display:'flex',gap:16,padding:'26px 32px'}}>
      {['#b85b91','#ddb654','#6598b3'].map(c=><i key={c} style={{display:'block',width:24,height:24,borderRadius:24,background:c}}/>)}
    </div>{children}
  </div>;
export const Text:React.FC<{text:string;x:number;y:number;size:number;color?:string;tracking?:number;weight?:number;style?:React.CSSProperties}>=
  ({text,x,y,size,color='#111',tracking=0,weight=600,style={}})=>
  <div style={{position:'absolute',left:x,top:y,fontFamily:font,fontWeight:weight,fontSize:size,lineHeight:1.15,letterSpacing:tracking,color,whiteSpace:'pre',...style}}>{text}</div>;
export const Pill:React.FC<{text:string;cx:number;cy:number;width:number;height:number;size:number;color:string;scale?:number;style?:React.CSSProperties}>=
  ({text,cx,cy,width,height,size,color,scale=1,style={}})=>
  <div style={{position:'absolute',left:cx-width/2,top:cy-height/2,width,height,borderRadius:Math.min(height*0.32,55),background:'#000',boxShadow:shadow,display:'flex',justifyContent:'center',alignItems:'center',transform:'scale('+scale+')',...style}}>
    <span style={{fontFamily:font,fontWeight:600,fontSize:size,lineHeight:1.05,color,whiteSpace:'pre'}}>{text}</span>
  </div>;
export const Path:React.FC<{d:string;p:number;width?:number;color?:string}>=({d,p,width=13,color='#111'})=>
  <path d={d} pathLength={1} stroke={color} fill="none" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={1} strokeDashoffset={1-p}/>;
