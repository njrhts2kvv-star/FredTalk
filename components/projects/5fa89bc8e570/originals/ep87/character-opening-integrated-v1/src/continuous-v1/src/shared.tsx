import React from 'react';
import {Img,staticFile} from 'remotion';
import {WorkBuddyBrandVisible} from '../../BrandVisibility';
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export const e=(t:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*p*(p*(p*6-15)+10);};
export const C='#0eb99a';
export const Text=({x,y,size=44,fill='#fff',anchor='start',children}:any)=><text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={600}>{children}</text>;
export const Box=({x=0,y=0,w,h,fill='#090909',r=32}:any)=><rect x={x} y={y} width={w} height={h} rx={r} fill={fill}/>;
export const Brand=({x=0,y=0,s=1,dark=false}:any)=>{
 const visible=React.useContext(WorkBuddyBrandVisible);
 if(!visible)return null;
 return <g transform={`translate(${x} ${y}) scale(${s})`}><foreignObject x={0} y={-35} width={52} height={52}><Img src={staticFile('workbuddy.png')} style={{width:52,height:52}}/></foreignObject><Text x={62} y={2} size={34} fill={dark?'#fff':'#111'}>WorkBuddy</Text></g>;
};
export function Paper({x=0,y=0,s=1,kind='sheet',title='',mark=0}:any){return <g transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x={5} y={8} width={180} height={242} rx={8} fill='#000' opacity={.07}/><rect width={180} height={242} rx={8} fill='#fff' stroke='#dfe3df' strokeWidth={1.2}/>
  {title&&<Text x={90} y={35} size={24} anchor='middle' fill='#111'>{title}</Text>}
  {kind==='grid'?<g stroke='#aab0ae' strokeWidth={2} fill='none'><rect x={18} y={56} width={144} height={160}/>{[1,2,3].map(i=><path key={i} d={`M${18+36*i} 56V216`}/>)}{[1,2,3,4].map(i=><path key={i} d={`M18 ${56+32*i}H162`}/>)}</g>:<g fill='#d9dcda'>{[0,1,2,3].map(i=><g key={i}><rect x={19} y={59+i*39} width={i%2?111:141} height={7} rx={2}/><rect x={19} y={73+i*39} width={141} height={15} rx={2} fill='#f0f1f0'/></g>)}</g>}
  {mark>0&&<path d='M28 92L55 101L110 82' stroke='#454b48' strokeWidth={5} fill='none' pathLength={1} strokeDasharray={1} strokeDashoffset={1-mark}/>}
 </g>;}
export function Slides({title}:any){return <g>{[2,1,0].map(i=><g key={i} transform={`translate(${i*84} ${i*14})`}><rect x={4} y={5} width={420} height={255} rx={19} fill='#000' opacity={.08}/><Box w={420} h={255} fill={i?'#f4f5f4':'#fff'} r={19}/><Text x={32} y={60} size={45} fill='#111'>{title}</Text><rect x={32} y={92} width={158} height={121} rx={10} fill='#eceeec'/><rect x={214} y={94} width={164} height={17} rx={3} fill='#303632'/><rect x={214} y={131} width={128} height={9} fill='#b5bab7'/><rect x={214} y={156} width={149} height={9} fill='#b5bab7'/><rect x={214} y={187} width={75} height={24} rx={6} fill={C}/></g>)}</g>;}
export const Record=({x=0,y=0,s=1}:any)=><g transform={`translate(${x} ${y}) scale(${s})`}><Box w={168} h={225} fill='#fff' r={15}/><rect x={0} y={0} width={9} height={225} rx={4} fill={C}/>{[0,1,2,3].map(i=><g key={i}><rect x={27} y={24+i*45} width={108} height={10} rx={3} fill='#d3d7d4'/><rect x={27} y={43+i*45} width={78} height={6} rx={2} fill='#eceeec'/></g>)}</g>;
