import React from 'react';
export const ink='#111111',green='#52b99c',mint='#bce9dc';
export const mix=(a:number,b:number,p:number)=>a+(b-a)*p;
export function ease(t:number,a:number,b:number){const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p);}
export const T=({x=0,y=0,size=32,fill=ink,anchor='start',children}:any)=><text x={x} y={y} fontFamily="MiSans" fontWeight={600} fontSize={size} textAnchor={anchor}>{React.Children.map(children,c=>typeof c==='string'?<tspan fill={fill}>{c}</tspan>:c)}</text>;
export const R=({x=0,y=0,w=100,h=100,fill='#fff',stroke='none',sw=1,r=0}:any)=><rect x={x} y={y} width={Math.max(0,w)} height={Math.max(0,h)} rx={r} fill={fill} stroke={stroke} strokeWidth={sw}/>;
export function Reveal({x=0,y=0,w=1280,h=720,p=1,children,axis='y'}:any){const id=React.useId();return <g><clipPath id={id}><rect x={x} y={y} width={axis==='x'?w*p:w} height={axis==='y'?h*p:h}/></clipPath><g clipPath={`url(#${id})`}>{children}</g></g>;}
export function Sheet({x=0,y=0,w=180,h=260,dark=false,answer=false,rows=3,stack=0,hand=false}:any){const pad=w*.09,gap=h*.04,rh=(h-pad*2-gap*(rows-1))/rows;return <g transform={`translate(${x} ${y})`}>
 {Array.from({length:stack},(_,i)=>stack-i).map(i=><R key={i} x={i*9} y={-i*6} w={w} h={h} fill={dark?'#343632':'#f6f6f4'} stroke={dark?'#454641':'#e0e1de'}/>)}
 <R x={3} y={5} w={w} h={h} fill='#00000008'/><R w={w} h={h} fill={dark?'#242621':'#fff'} stroke={dark?'#343631':'#e0e2df'}/>
 {Array.from({length:rows},(_,i)=><g key={i}><R x={pad} y={pad+i*(rh+gap)} w={w-2*pad} h={rh} fill={answer?mint:dark?'#090a08':'#f8f9f7'} stroke={dark?'#777b72':'#d5d9d3'} sw={1.2}/>
 {hand?<path d={`M${pad+12} ${pad+i*(rh+gap)+rh*.3} l14 -5 7 15 12 -22 10 13 18 -8 M${pad+12} ${pad+i*(rh+gap)+rh*.62} l24 -5 8 9 21 -13 16 6`} fill='none' stroke={dark?'#ccd1c6':'#727970'} strokeWidth={1.8}/>:<><R x={pad+9} y={pad+i*(rh+gap)+10} w={(w-pad*2)*.42} h={3} fill={dark?'#777b73':'#c4c9c1'}/><R x={pad+9} y={pad+i*(rh+gap)+18} w={(w-pad*2)*.66} h={2} fill={dark?'#474b42':'#e1e4de'}/></>}
 </g>)}
 </g>;}
export const Cells=({x=0,y=0,w=300,h=90,count=4,active=-1}:any)=><g transform={`translate(${x} ${y})`}>{Array.from({length:count},(_,i)=><g key={i}><R x={i*w/count} w={w/count-5} h={h} fill='#fff' stroke={i===active?green:'#dedfda'} sw={i===active?3:1}/><R x={i*w/count+10} y={15} w={w/count*.42} h={5} fill='#aeb5ad'/><R x={i*w/count+10} y={28} w={w/count*.65} h={3} fill='#e3e5df'/></g>)}</g>;
