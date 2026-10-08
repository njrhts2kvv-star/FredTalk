import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Frame, Media, Window, Surface, Text, Cursor, useT, q, mix, springAt, media, S} from './shared';
import {fullscreenVideoWindowGeometry} from './fullscreen-video-window-geometry';
const shell=fullscreenVideoWindowGeometry();
const win=(x:number,y:number,w:number,h:number,style:React.CSSProperties={})=>({transform:`translate(${x-shell.left}px,${y-shell.top}px) scale(${w/shell.width},${h/shell.height})`,transformOrigin:`${shell.left}px ${shell.top}px`,...style});
const center={display:'flex',alignItems:'center',justifyContent:'center'} as const;
export type OpeningProps={src?:string;title?:string;imageSources?:string[];start?:number};
/** Two halves of a known image open, exposing a different continuous result behind. */
export function OP02({src=media.videoA,imageSources=media.works,start=8}:OpeningProps){const t=useT(),p=q(t,.24,1.48);return <Frame brand={false}><Window src={src} start={start} style={{opacity:q(t,.15,.70),transform:`scale(${mix(.84,1,p)})`,transformOrigin:'960px 540px'}}/>{[0,1].map(i=><div key={i} style={{position:'absolute',left:60+(i===0?-p*1100:900+p*1100),top:shell.top,width:900,height:shell.height,overflow:'hidden',borderRadius:i===0?'24px 0 0 24px':'0 24px 24px 0',transform:`perspective(2200px) rotateY(${(i===0?-1:1)*p*48}deg)`,transformOrigin:i===0?'0 50%':'100% 50%',opacity:1-q(t,1.18,1.60),boxShadow:S.shadow}}><Img src={staticFile(imageSources[2])} style={{position:'absolute',left:i===0?0:-900,width:1800,height:shell.height,objectFit:'cover'}}/></div>)}</Frame>;}
/** A circular portal becomes the full approved rounded-rectangle media carrier. */
export function OP03({src=media.videoB}:OpeningProps){const t=useT(),p=q(t,.18,1.58),w=mix(340,1800,p),h=mix(340,shell.height,p);return <Frame brand={false}><Media src={src} x={(1920-w)/2} y={(1080-h)/2} w={w} h={h} radius={mix(170,24,p)} style={{transform:`scale(${mix(.85,1,springAt(t,.05,.48))})`}}/></Frame>;}
/** A substantive question rotates as a single surface; its answer is a live shot. */
export function OP05({src=media.videoB,title='这段怎么做出来的？'}:OpeningProps){const t=useT(),p=q(t,.56,1.48),grow=q(t,.8,1.8),a=mix(0,180,p);return <Frame brand={false}><div style={{position:'absolute',inset:0,transform:`perspective(2300px) rotateY(${a}deg) scale(${mix(.65,1,grow)})`,transformOrigin:'960px 540px',transformStyle:'preserve-3d'}}><Surface x={60} y={shell.top} w={1800} h={shell.height} dark style={{...center,backfaceVisibility:'hidden'}}><Text x={100} y={405} w={1600} size={128} color='#fff' align='center'>{title}</Text></Surface><Window src={src} style={{transform:'rotateY(180deg)',transformOrigin:'960px 540px',backfaceVisibility:'hidden'}}/></div></Frame>;}
/** Four playing views converge, but the selected view keeps its time and becomes the main shot. */
export function OP09({src=media.videoB}:OpeningProps){const t=useT(),p=q(t,.28,1.70);return <Frame brand={false}>{[[60,100],[1020,100],[60,590]].map(([x,y],i)=><Media key={i} src={i===0?media.videoA:i===1?media.videoC:media.works[2]} x={mix(x,960,p)} y={mix(y,540,p)} w={mix(840,160,p)} h={mix(472.5,90,p)} style={{opacity:1-q(t,1.12,1.75),transform:`rotate(${p*(i-1)*14}deg)`}}/>)}<Window src={src} style={win(mix(1020,60,p),mix(590,shell.top,p),mix(840,1800,p),mix(472.5,shell.height,p))}/></Frame>;}
/** Several circular evidence objects orbit inward, then give the centre to one live result. */

export {OP10} from './NovelScenes';
