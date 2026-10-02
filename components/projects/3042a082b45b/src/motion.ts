import {Easing, interpolate} from 'remotion';
export const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const ease=Easing.bezier(0.2,0.8,0.2,1);
const exit=Easing.bezier(0.55,0,0.9,0.35);
export const progress=(t:number,start:number,duration:number,mode:'in'|'out'|'linear'='in')=>
  interpolate(t,[start,start+duration],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:mode==='linear'?Easing.linear:mode==='out'?exit:ease});
export const reveal=(t:number,start:number,duration:number)=>'inset(0 '+((1-progress(t,start,duration))*100)+'% 0 0)';
export const type=(text:string,t:number,start:number,duration:number)=>
  text.slice(0,Math.floor(clamp((t-start)/duration)*text.length));
export const inRange=(t:number,start:number,end:number)=>t>=start&&t<end;
