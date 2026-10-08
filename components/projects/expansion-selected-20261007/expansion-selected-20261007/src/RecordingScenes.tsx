import React, {CSSProperties} from 'react';
import {Freeze, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Frame, Surface, S, media, mix, q, useT} from './shared';

export type RecordingROI = {x:number;y:number;w:number;h:number};
type Box = RecordingROI;
export type RecordingClock = {freezeFrom:number;freezeTo:number};
export type RecordingSceneProps = {src?:string;start?:number;roi?:RecordingROI;clock?:RecordingClock|null};
export type RecordingPairProps = RecordingSceneProps & {roiA?:RecordingROI;roiB?:RecordingROI};
const FULL:Box={x:60,y:33.22,w:1800,h:1013.56};
const SOURCE:RecordingROI={x:0,y:0,w:1920,h:1080};
const bounds=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const between=(a:Box,b:Box,p:number):Box=>({x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),w:mix(a.w,b.w,p),h:mix(a.h,b.h,p)});
const sourceBox=(r:RecordingROI):Box=>({x:FULL.x+r.x*FULL.w/1920,y:FULL.y+r.y*FULL.h/1080,w:r.w*FULL.w/1920,h:r.h*FULL.h/1080});

// A reading pause is explicit: both context and crop hold the same real source frame.
// Camera/box motion runs on composition time. Source playback resumes after the pause.
function SourceVideo({src,start,clock,left=0,top=0,width=1920,height=1080}:{src:string;start:number;clock?:RecordingClock|null;left?:number;top?:number;width?:number;height?:number}){
  const {fps}=useVideoConfig();
  const frame=useCurrentFrame();
  const from=Math.round((clock?.freezeFrom??0)*fps);
  const to=Math.round((clock?.freezeTo??0)*fps);
  const sourceFrame=!clock?frame:frame<from?frame:frame<to?from:frame-(to-from);
  return <Freeze frame={sourceFrame}><OffthreadVideo src={staticFile(src)} muted startFrom={Math.round(start*fps)} style={{position:'absolute',left,top,width,height,objectFit:'fill'}}/></Freeze>;
}
function RecordingCrop({src,start,clock,box,roi=SOURCE,style}:{src:string;start:number;clock?:RecordingClock|null;box:Box;roi?:RecordingROI;style?:CSSProperties}){
  const s=Math.max(box.w/roi.w,box.h/roi.h);
  const left=(box.w-roi.w*s)/2-roi.x*s;
  const top=(box.h-roi.h*s)/2-roi.y*s;
  return <Surface x={box.x} y={box.y} w={box.w} h={box.h} style={style}><SourceVideo src={src} start={start} clock={clock} left={left} top={top} width={1920*s} height={1080*s}/></Surface>;
}
function CameraWindow({src,start,clock,centerX,centerY,zoom=1}:{src:string;start:number;clock?:RecordingClock|null;centerX:number;centerY:number;zoom?:number}){
  const s=FULL.w/1920*zoom;
  const left=bounds(FULL.w/2-centerX*s,FULL.w-1920*s,0);
  const top=bounds(FULL.h/2-centerY*s,FULL.h-1080*s,0);
  return <Surface x={FULL.x} y={FULL.y} w={FULL.w} h={FULL.h}><SourceVideo src={src} start={start} clock={clock} left={left} top={top} width={1920*s} height={1080*s}/></Surface>;
}
function FocusVeil({box,amount,id}:{box:Box;amount:number;id:string}){
  return <svg width={1920} height={1080} style={{position:'absolute',inset:0,pointerEvents:'none',opacity:amount}}><defs><mask id={id}><rect width={1920} height={1080} fill="white"/><rect x={box.x} y={box.y} width={box.w} height={box.h} rx={S.radius} fill="black"/></mask></defs><rect width={1920} height={1080} fill="#fff" mask={`url(#${id})`}/></svg>;
}

// RC01: the real explanation pane grows locally while its page remains in place.
export function RC01({src=media.recording,start=3.15,roi={x:1292,y:132,w:557,h:530},clock={freezeFrom:1.55,freezeTo:5.6}}:RecordingSceneProps={}){
  const t=useT();
  const p=q(t,.65,1.55)*(1-q(t,4.7,5.6));
  const origin=sourceBox(roi);
  const target:Box={x:930,y:72,w:872,h:872*roi.h/roi.w};
  const box=between(origin,target,p);
  return <Frame brand={false}><RecordingCrop src={src} start={start} clock={clock} box={FULL}/><div style={{position:'absolute',inset:0,background:'#fff',opacity:.74*p}}/><RecordingCrop src={src} start={start} clock={clock} roi={roi} box={box} style={{opacity:p,boxShadow:S.shadow}}/></Frame>;
}

// RC02: one camera with an explicit same-frame reading pause, then return and resume.
export function RC02({src=media.recording,start=2.55,roi={x:1292,y:132,w:557,h:530},clock={freezeFrom:2.15,freezeTo:5.65}}:RecordingSceneProps={}){
  const t=useT();
  const p=q(t,1.0,2.15)*(1-q(t,4.55,5.65));
  const centerX=mix(960,roi.x+roi.w/2,p);
  const centerY=mix(540,roi.y+roi.h/2,p);
  return <Frame brand={false}><CameraWindow src={src} start={start} clock={clock} centerX={centerX} centerY={centerY} zoom={mix(1,1.96,p)}/></Frame>;
}

// RC03: visual evidence and the real written conclusion exchange camera focus.
export function RC03({src=media.recording,start=2.6,roiA={x:57,y:132,w:1235,h:660},roiB={x:1324,y:277,w:493,h:280},clock={freezeFrom:2.1,freezeTo:7.05}}:RecordingPairProps={}){
  const t=useT();
  const entered=q(t,.75,1.65);
  const swapped=q(t,2.9,3.95);
  const returned=q(t,6.05,7.05);
  const focus=between(roiA,roiB,swapped);
  const centerX=mix(mix(960,focus.x+focus.w/2,entered),960,returned);
  const centerY=mix(mix(540,focus.y+focus.h/2,entered),540,returned);
  const z=mix(1,mix(1.47,2.14,swapped),entered);
  return <Frame brand={false}><CameraWindow src={src} start={start} clock={clock} centerX={centerX} centerY={centerY} zoom={mix(z,1,returned)}/></Frame>;
}

// RC04: lift actual paragraph pixels out of the page, then return to their origin.
export function RC04({src=media.recording,start=3,roi={x:1308,y:380,w:536,h:186},clock={freezeFrom:1.7,freezeTo:6.15}}:RecordingSceneProps={}){
  const t=useT();
  const p=q(t,.85,1.9)*(1-q(t,5.0,6.15));
  const origin=sourceBox(roi);
  const target:Box={x:312,y:257,w:1296,h:1296*roi.h/roi.w};
  const box=between(origin,target,p);
  return <Frame brand={false}><RecordingCrop src={src} start={start} clock={clock} box={FULL}/><div style={{position:'absolute',inset:0,background:'#fff',opacity:.78*p}}/><RecordingCrop src={src} start={start} clock={clock} roi={roi} box={box} style={{opacity:p,boxShadow:S.shadow}}/></Frame>;
}

// RC05: establish the actual document, pause it for three real sidebar blocks, then resume.
export function RC05({src=media.recording,start=18.4,roi={x:48,y:395,w:380,h:405},clock={freezeFrom:1.6,freezeTo:7.4}}:RecordingSceneProps={}){
  const t=useT();
  const established=q(t,.7,1.7);
  const ended=q(t,6.4,7.4);
  const p=established*(1-ended);
  const context:Box={x:946,y:243,w:842,h:473.625};
  const reading:Box={x:136,y:147,w:640,h:640*roi.h/roi.w};
  const box=between(FULL,context,p);
  const local=sourceBox(roi);
  const aperture=between(local,reading,p);
  // Actual blocks at source 20.000s: characters, scene, and constraints.
  // The mask exchanges the reading focus; original text and original scrollbar stay intact.
  const upper={x:aperture.x,y:aperture.y+8/roi.h*aperture.h,w:aperture.w,h:102/roi.h*aperture.h};
  const middle={x:aperture.x,y:aperture.y+109/roi.h*aperture.h,w:aperture.w,h:95/roi.h*aperture.h};
  const lower={x:aperture.x,y:aperture.y+209/roi.h*aperture.h,w:aperture.w,h:163/roi.h*aperture.h};
  const band=between(between(upper,middle,q(t,2.7,3.35)),lower,q(t,4.4,5.1));
  const bandTop=bounds(band.y-aperture.y,0,aperture.h);
  const bandBottom=bounds(band.y+band.h-aperture.y,0,aperture.h);
  return <Frame brand={false}><RecordingCrop src={src} start={start} clock={clock} box={box}/><RecordingCrop src={src} start={start} clock={clock} roi={roi} box={aperture} style={{opacity:p}}/><div style={{position:'absolute',left:aperture.x,top:aperture.y,width:aperture.w,height:aperture.h,borderRadius:S.radius,overflow:'hidden',pointerEvents:'none',opacity:p*.63}}><div style={{position:'absolute',left:0,top:0,width:'100%',height:bandTop,background:'#fff'}}/><div style={{position:'absolute',left:0,top:bandBottom,width:'100%',height:aperture.h-bandBottom,background:'#fff'}}/></div></Frame>;
}
