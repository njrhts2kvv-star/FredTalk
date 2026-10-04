import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {AbsoluteFill, Img, interpolate} from 'remotion';
import type {Overrides} from './types';
const track=(f:number,p:number[][])=>interpolate(f,p.map(v=>v[0]),p.map(v=>v[1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
// Source-native time keeps all embedded movies advancing across focus changes.
export function RebuiltN004({t,overrides={}}:{t:number;overrides?:Overrides}){
 const f=Math.max(0,(t-.033008)*30);
 const opening=track(f,[[0,0],[1,.06],[2,.16],[3,.30],[4,.48],[5,.67],[6,.81],[7,.91],[8,.96],[10,.99],[12,1]]);
 const slide=track(f,[[0,0],[36,0],[38,.078],[40,.194],[42,.424],[44,.71],[46,.875],[48,.955],[50,.991],[52,1],[72,1],[74,1.004],[76,1.042],[78,1.146],[80,1.4],[82,1.748],[84,1.915],[86,1.979],[88,1.995],[90,2],[171,2]]);
 const close=track(f,[[0,0],[150,0],[154,.014],[158,.065],[162,.18],[166,.40],[168,.57],[170,.70],[171,.73]]);
 const width=1920-(1920-1234)*opening+close*390,height=1080-(1080-698)*opening+close*210;
 const files=['scene-b.mp4','scene-a.mp4','scene-b.mp4','scene-a.mp4','scene-b.mp4'];
 return <AbsoluteFill style={{background:'white'}}>

  {[-1,0,1,2,3].map((j,i)=>{
   const d=j-slide,side=Math.max(-1,Math.min(1,d)),isFinal=j===2;
   const bend=120*opening*(1-close),leftInset=Math.max(-side,0)*bend,rightInset=Math.max(side,0)*bend;
   const denominator=(height-2*leftInset)/(height-2*rightInset),perspectiveX=(denominator-1)/width,shearY=(rightInset*denominator-leftInset)/width;
   const matrix=`matrix3d(${denominator},${shearY},0,${perspectiveX},0,${(height-2*leftInset)/height},0,0,0,0,1,0,0,${leftInset},0,1)`;
   const x=960+d*(1920-(1920-1276)*opening+close*390)-width/2,y=540-height/2;
   const file=overrides.assets?.[`video${j+1}`]??`group-a/${files[i]}`;
   return <div key={j} style={{position:'absolute',left:x,top:y,width,height,transform:`${matrix} scaleX(${1-close*.72*(isFinal?0:1)})`,transformOrigin:'top left',zIndex:isFinal&&close>0?3:1,opacity:isFinal?1:1-close*.18,filter:'drop-shadow(8px 12px 7px #0004)'}}>
    <div style={{width:'100%',height:'100%'}}><div style={{width:'100%',height:'100%',borderRadius:48*opening,overflow:'hidden',background:'white'}}>{/\.(mp4|webm)$/.test(file)?<OffthreadVideo src={staticFile(file)} muted playbackRate={1.1} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<Img src={staticFile(file)} style={{width:'100%',height:'100%',objectFit:'contain'}}/>}</div></div>
   </div>;
  })}
 </AbsoluteFill>;
}
