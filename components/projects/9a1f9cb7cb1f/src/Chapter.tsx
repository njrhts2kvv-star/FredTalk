import React from 'react';
import {Easing,interpolate} from 'remotion';
// Adapted from canonical EP87 Transition.tsx / Drag. Original source is frozen in reference-source.
const phase=(f:number,a:number,b:number)=>interpolate(f,[a,b],[0,1],{easing:Easing.bezier(.65,0,.2,1),extrapolateLeft:'clamp',extrapolateRight:'clamp'});
export function ChapterDrag({f}:{f:number}){
 const width=1120,labelSize=96,titleSize=152,x=(1920-width)/2,y=362,w=width+28,h=labelSize*1.15+18+titleSize*1.15+20,grow=phase(f,5,37);
 return <div style={{position:'absolute',inset:0,background:'#000',color:'white'}}>
 <div style={{position:'absolute',left:x,top:y,width:w,height:h,clipPath:`inset(0 ${100*(1-grow)}% ${100*(1-grow)}% 0)`}}>
 <div style={{fontSize:96,fontWeight:500,lineHeight:1.15,marginBottom:18,color:'#c9c9c9'}}>Part.01</div>
 <div style={{fontSize:152,fontWeight:700,lineHeight:1.15,whiteSpace:'nowrap'}}>Jev 到底是什么</div></div>
 {f<48&&<><div style={{position:'absolute',left:x-10,top:y-8,width:w*grow,height:h*grow,border:'1.5px solid #909090'}}/>{grow>0&&[[0,0],[1,0],[0,1],[1,1]].map(([xx,yy],i)=><div key={i} style={{position:'absolute',left:x-13+w*grow*xx,top:y-11+h*grow*yy,width:6,height:6,background:'#080808',border:'1px solid #bbb'}}/>)}<svg width="42" height="52" viewBox="0 0 42 52" style={{position:'absolute',left:x-7+w*grow,top:y-5+h*grow}}><path d="M3 2 L3 38 L13 30 L22 48 L29 44 L20 26 L34 26 Z" fill="#080808" stroke="#eee" strokeWidth="2.5" strokeLinejoin="round"/></svg></>}
 </div>;
}
