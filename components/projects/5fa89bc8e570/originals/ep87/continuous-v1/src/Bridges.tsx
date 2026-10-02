import React from 'react';
import {Box,Brand} from './shared';
import {joinState,mix} from './joins.mjs';
const shells=[[200,185,880,420],[350,200,550,340],[65,175,1150,430],[150,95,980,520],[260,125,760,510],[365,267,181.44,230.4]];
export function Bridge({frame,join,index,components,pages}:any){
 const s=joinState(frame,join),a=shells[index*2],b=shells[index*2+1], [x,y,w,h]=a.map((v,i)=>mix(v,b[i],s.morph));
 const Before=components[index],After=components[index+1],id='join-'+index,r=mix(32,index===2?23.04:32,s.morph);
 return <>
 {index===0&&<Brand x={mix(503,375,s.morph)} y={mix(100,160,s.morph)}/>}
 <Box x={x} y={y} w={w} h={h} r={r}/>
 <clipPath id={id}><rect x={x} y={y} width={w} height={h} rx={r}/></clipPath>
 <clipPath id={id+'-old'}><rect x={a[0]} y={a[1]} width={a[2]} height={a[3]} rx={32}/></clipPath>
 <clipPath id={id+'-new'}><rect x={b[0]} y={b[1]} width={b[2]} height={b[3]} rx={index===2?23.04:32}/></clipPath>
 <g clipPath={'url(#'+id+')'}>
 {s.oldVisible&&<g transform={`translate(${x-a[0]+(w-a[2])/2} ${y-a[1]-900*s.oldOut})`}><g clipPath={'url(#'+id+'-old)'}><Before t={(pages[index].durationInFrames-30)/60} page={pages[index]}/></g></g>}
 {s.newVisible&&<g transform={`translate(${x-b[0]+(w-b[2])/2} ${y-b[1]+900*(1-s.newIn)})`}><g clipPath={'url(#'+id+'-new)'}><After t={.5} page={pages[index+1]}/></g></g>}
 </g></>;
}
