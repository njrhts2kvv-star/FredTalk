import {approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import motion from './X037-motion.json';
const sample=(f:number,i:number,k:number)=>{const n=Math.max(0,Math.min(359,f)),a=Math.floor(n),b=Math.min(359,a+1);return motion[a][i][k]+(motion[b][i][k]-motion[a][i][k])*(n-a)};
export function IllustrationGrid({t,assets={}}:{t:number;assets?:Record<string,string>}){
 const f=t*60;
 return <AbsoluteFill style={{background:'white'}}>{[0,1,2,3].map(i=>{
  const width=sample(f,i,2),scale=width/638;
  return <div key={i} style={{position:'absolute',left:sample(f,i,0),top:sample(f,i,1),width,height:width*.75,borderRadius:24*scale,overflow:'hidden',boxShadow:`${8*scale}px ${13*scale}px ${13*scale}px #0005`}}><Img src={assets[`image${i+1}`]??staticFile(`group-c/image${i+1}.jpg`)} style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/></div>;
 })}</AbsoluteFill>;
}
