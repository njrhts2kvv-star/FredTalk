import React, {CSSProperties} from 'react';
import {Frame, Media, Window, Text, Cursor, S, media, mix, q, useT} from './shared';

/** 1920 logical coordinates; Window owns the approved 1800 × 1013.56 shell. */
type Box = {x:number;y:number;w:number;h:number};
const FULL:Box = {x:60,y:33.222106,w:1800,h:1013.555787};
const RATIO = FULL.h/FULL.w;
const box = (x:number,y:number,w:number):Box => ({x,y,w,h:w*RATIO});
const blend = (a:Box,b:Box,p:number):Box => ({x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),w:mix(a.w,b.w,p),h:mix(a.h,b.h,p)});
const pose = (b:Box):CSSProperties => {
  const sx=b.w/FULL.w,sy=b.h/FULL.h;
  return {transform:`matrix(${sx},0,0,${sy},${b.x-FULL.x*sx},${b.y-FULL.y*sy})`,transformOrigin:'0 0'};
};
function ContinuousWindow({src,b,opacity=1,style}:{src:string;b:Box;opacity?:number;style?:CSSProperties}) {
  return <Window src={src} style={{...pose(b),opacity,...style}}/>;
}
const captionStyle = (opacity:number):CSSProperties => ({opacity});

/** Old source remains recognizable in a small slot while the next source takes the stage. */
export function HD02({oldSrc=media.videoC,src=media.videoB}:{oldSrc?:string;src?:string}) {
  const t=useT(),retreat=q(t,.75,2.15),arrive=q(t,1.6,3.05),take=q(t,3.4,4.6);
  const old=blend(FULL,box(100,205,470),retreat);
  const next=blend(box(2150,170,1230),box(610,170,1230),arrive);
  const nextFinal=blend(next,FULL,take);
  return <Frame brand={false}>
    <ContinuousWindow src={oldSrc} b={old} opacity={1-q(t,3.65,4.3)}/>
    <ContinuousWindow src={src} b={nextFinal} opacity={q(t,1.3,1.65)}/>
    <Text x={100} y={110} w={470} size={60} color={S.muted} style={captionStyle(retreat*(1-q(t,3.25,3.75)))}>前一个结果</Text>
    <Text x={620} y={75} w={1230} size={74} style={captionStyle(arrive*(1-q(t,3.25,3.75)))}>接着看这一段</Text>
  </Frame>;
}

/** Nine-work wall; its central Fred laptop image becomes the same character's live result. */
const HD03_WORKS=[media.videoA,media.works[1],media.works[0],media.works[4],media.works[2],media.works[8],media.works[7],media.works[5],media.recordingImage];
export function HD03({src=media.videoC,works=HD03_WORKS,selectedIndex=4}:{src?:string;works?:string[];selectedIndex?:number}) {
  const t=useT(),activeWorks=(works.length?works:HD03_WORKS).slice(0,9),chosen=Math.max(0,Math.min(activeWorks.length-1,selectedIndex));
  const choose=q(t,1.2,1.75),lift=q(t,1.85,3.5),play=q(t,3.4,3.95);
  const tiles=activeWorks.map((image,i)=>({image,b:box(160+(i%3)*550,95+Math.floor(i/3)*330,500)}));
  const selected=blend(tiles[chosen].b,FULL,lift);
  return <Frame brand={false}>
    {tiles.map(({image,b},i)=>i===chosen?null:<Media key={i} src={image} {...b} style={{opacity:1-q(t,1.6,2.85),filter:`blur(${choose*3}px)`}}/>)}
    <ContinuousWindow src={src} b={selected} opacity={play}/>
    <Media src={tiles[chosen].image} {...selected} style={{opacity:1-play}}/>
    <Cursor x={1060} y={600} scale={mix(1,.83,choose)} style={{opacity:q(t,.75,1.05)*(1-q(t,1.72,2.0))}}/>
  </Frame>;
}
