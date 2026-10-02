import React from 'react';
import {e,mix,Box,Text,Brand,Paper,C} from './shared';
export function Clip3({t,page}:any){const w=page.words,c=page.cues;const intro=e(t,c[0],1),exit=e(t,c[1],5.6),quantity=e(t,c[2],7.7),intake=e(t,c[3],9.7),mark=e(t,c[4],10.8),pending=e(t,c[5],12.6);return <>
 <g style={{display:exit<1?undefined:'none'}} transform={`translate(${150+1200*exit} 95)`}><Box w={980} h={520}/><g transform='translate(405 55) scale(.38)'>{[0,1,2].map(i=><Paper key={i} x={i*185} kind={i===1?'grid':'sheet'}/>)}</g><Text x={490} y={280} size={52} anchor='middle'>{w[0]}</Text><g transform={`translate(490 ${380+35*(1-intro)}) scale(${intro})`}><Text x={0} y={0} size={82} anchor='middle'>{w[1]}</Text></g></g>
 {exit>0&&<>
 <g style={{display:intake<1?undefined:'none'}} transform={`translate(${mix(-650,110,exit)+intake*460} 220) scale(${1-.2*intake})`}>
  <Text x={0} y={-30} size={36} fill='#111'>{w[2]}</Text>{[5,4,3,2,1,0].map(i=><Paper key={i} x={i*(18+15*quantity)} y={i*3} s={1.18}/>)}
  {quantity>0&&<g transform={`translate(405 30) scale(${quantity})`}><Text x={0} y={0} size={100} fill='#111'>{w[3]}</Text><Text x={0} y={55} size={42} fill='#111'>{w[4]}</Text></g>}
 </g>
 <g transform={`translate(${mix(1360,750,exit)+(260-750)*intake} ${mix(185,125,intake)})`}>
  <Box w={mix(450,760,intake)} h={mix(400,510,intake)}/>
  <Brand x={32} y={mix(340,453,intake)} dark/>
  <clipPath id='intake-field'><rect width={mix(450,760,intake)} height={mix(285,395,intake)} rx={32}/></clipPath>
  <g clipPath='url(#intake-field)'>
  {intake>0&&<g><Box x={30} y={26} w={mix(690,405,pending)} h={369} fill='#202420' r={18}/><Text x={50} y={72} size={39}>{w[6]}</Text>{[3,2,1,0].map(i=><Paper key={i} x={65+14*i} y={98} s={1.08} mark={i===0?mark:0}/>)}</g>}
  {pending>0&&<><g transform='translate(462 26)'><Box w={268} h={369} fill='#202420' r={18}/><path d='M15 15H253' stroke={C} strokeWidth={8}/><Text x={134} y={46} size={32} anchor='middle'>{w[7]}</Text></g><Paper x={mix(160,499,pending)} y={98} s={1.07}/></>}
  </g>
 </g></>}
 </>;}
