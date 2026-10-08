import React, {CSSProperties} from 'react';
import {Frame, Window, Surface, Text, Cursor, media, S, useT, q, mix} from './shared';
import {fullscreenVideoWindowGeometry} from './fullscreen-video-window-geometry';
import type {OpeningProps} from './OpeningScenes';
import type {ExplainContent} from './ExplainScenes';

const shell=fullscreenVideoWindowGeometry();
const center:CSSProperties={display:'flex',alignItems:'center',justifyContent:'center'};

/**
 * Three horizontal wipe strokes reveal original pixels of one continuously playing
 * source. One Window instance stays mounted throughout; source time never resets.
 * SVG masks are geometry only, with no painted stroke or UI progress indicator.
 */
export function OP10({src=media.videoC,start=0}:OpeningProps={}) {
  const t=useT(),bands=[q(t,-.10,.54),q(t,.72,1.16),q(t,1.34,1.78)];
  const id='fred-three-stroke-reveal';
  let x:number,y:number;
  if(t<.54){x=1920*bands[0];y=180;}
  else if(t<.72){x=1920;y=mix(180,540,q(t,.54,.72));}
  else if(t<1.16){x=1920*(1-bands[1]);y=540;}
  else if(t<1.34){x=0;y=mix(540,900,q(t,1.16,1.34));}
  else{x=1920*bands[2];y=900;}
  return <Frame brand={false}>
    <svg width={0} height={0} style={{position:'absolute'}} aria-hidden>
      <defs><clipPath id={id} clipPathUnits="userSpaceOnUse">
        {bands.map((p,i)=><rect key={i} x={i===1?1920*(1-p):0} y={i*360} width={1920*p} height={361}/>)}
      </clipPath></defs>
    </svg>
    <Window src={src} start={start} style={{clipPath:`url(#${id})`}}/>
    <Cursor x={Math.max(60,Math.min(1850,x))-13} y={y-13} style={{opacity:1-q(t,1.80,1.96)}}/>
  </Frame>;
}

/**
 * The same three action objects reorder along separated upper/lower arcs.
 * The reaction moves above the stationary contact, and power moves below it;
 * the lift completes before horizontal travel; the top carrier stays below the brand, and neither crosses the centre card.
 */
export function EX05({words}:ExplainContent={}) {
  const t=useT(),enter=q(t,0,.35),reorder=q(t,2.05,3.70),done=q(t,4.30,4.85);
  const lifted=q(t,1.55,2.10)*(1-q(t,3.65,4.25));
  const labels=[words?.[0]??'受击反应',words?.[1]??'发生接触',words?.[2]??'出招发力'];
  const width=500,height=230,y=420;
  const positions=[
    {x:mix(130,1290,reorder),y:y-260*lifted},
    {x:710,y},
    {x:mix(1290,130,reorder),y:y+280*lifted},
  ];
  return <Frame>
    <Text x={250} y={135} w={1420} size={103} align="center" style={{opacity:enter*(1-q(t,1.30,1.85))}}>{words?.[3]??'顺序乱了'}</Text>
    {labels.map((label,i)=><Surface key={i} x={positions[i].x} y={positions[i].y} w={width} h={height} dark
      style={{...center,opacity:enter,transform:`translateY(${(1-enter)*30}px)`,zIndex:i===1?1:2}}>
      <span style={{fontFamily:S.font,fontWeight:900,fontSynthesis:'none',fontSize:86,lineHeight:1.12,
        color:i===1&&done>.5?S.accentDark:'#fff'}}>{label}</span>
    </Surface>)}
    <Text x={180} y={775} w={1560} size={95} align="center" color={S.accent} style={{opacity:done}}>{words?.[4]??'先接触，身体再受力'}</Text>
  </Frame>;
}
