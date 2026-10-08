import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export type ROI = {x: number; y: number; width: number; height: number};
export type NewsFocusProps = {
  src: string; sourceWidth: number; sourceHeight: number; regions: ROI[];
  color?: string; zoom?: number; dimOpacity?: number;
  order?: "parallel" | "camera-first"; emphasisAt?: number;
  focusAt?: number; sweepSeconds?: number; cameraSeconds?: number;
  returnAt?: number; returnSeconds?: number;
};
const clamp = (v: number) => Math.max(0, Math.min(1, v));
// Preserved highlighter-sweep power2.inOut and power2.out easing.
const ease = (p: number) => p < .5 ? 4*p*p*p : 1 - Math.pow(-2*p+2,3)/2;
const out = (p: number) => 1-Math.pow(1-p,3);
const progress = (t: number, at: number, duration: number) => ease(clamp((t-at)/duration));

/** Source, highlights and aperture share exactly one camera transform. */
export function cameraState(props: NewsFocusProps, time: number) {
  const {sourceWidth: sw, sourceHeight: sh, regions, zoom=2.05,
    focusAt=.85, cameraSeconds=1.55, returnAt=5.35, returnSeconds=1.35} = props;
  if (sw<=0 || sh<=0 || !regions.length || regions.some(r=>r.x<0 || r.y<0 || r.width<=0 || r.height<=0 || r.x+r.width>1 || r.y+r.height>1)) throw new Error('Invalid source dimensions or normalized ROI');
  const scale = Math.min(1920/sw,1080/sh);
  const imageWidth=sw*scale, imageHeight=sh*scale;
  const left=(1920-imageWidth)/2, top=(1080-imageHeight)/2;
  const boxes=regions.map(r=>({x:left+r.x*imageWidth,y:top+r.y*imageHeight,width:r.width*imageWidth,height:r.height*imageHeight}));
  const minX=Math.min(...boxes.map(r=>r.x)), maxX=Math.max(...boxes.map(r=>r.x+r.width));
  const minY=Math.min(...boxes.map(r=>r.y)), maxY=Math.max(...boxes.map(r=>r.y+r.height));
  const cx=(minX+maxX)/2,cy=(minY+maxY)/2;
  const safeZoom=Math.min(zoom,1600/(maxX-minX),740/(maxY-minY));
  const exit=1-progress(time,returnAt,returnSeconds);
  const amount=progress(time,focusAt+.15,cameraSeconds)*exit;
  const z=1+(safeZoom-1)*amount;
  return {left,top,imageWidth,imageHeight,boxes,z,tx:(960-cx*safeZoom)*amount,ty:(470-cy*safeZoom)*amount,
    amount,exit,active:out(clamp((time-focusAt)/.45))*exit};
}
function Stage({props,mode}:{props:NewsFocusProps;mode:'brush'|'spotlight'}) {
  const frame=useCurrentFrame();const {fps,width}=useVideoConfig();const t=frame/fps;
  const s=cameraState(props,t);
  const at=props.emphasisAt??((props.order??"parallel")==="camera-first" ? (props.focusAt??.85)+.15+(props.cameraSeconds??1.55)+.25 : props.focusAt??.85);
  if(props.order==="camera-first" && at<(props.focusAt??.85)+.15+(props.cameraSeconds??1.55))throw new Error("Camera-first emphasis must follow camera settlement");
  const sweep=progress(t,at,props.sweepSeconds??.95);
  const emphasis=out(clamp((t-at)/.45))*s.exit;
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left'}}>
      <div data-camera-group style={{position:'absolute',width:1920,height:1080,transform:`translate(${s.tx}px,${s.ty}px) scale(${s.z})`,transformOrigin:'top left'}}>
        <Img src={props.src.startsWith('http')?props.src:staticFile(props.src)} style={{position:'absolute',left:s.left,top:s.top,width:s.imageWidth,height:s.imageHeight}}/>
        {mode==='brush' && s.boxes.map((r,i)=><div key={i} style={{position:'absolute',left:r.x-3,top:r.y+3,width:(r.width+6)*sweep,height:r.height-5,
          opacity:.65*s.exit,background:props.color??'#FFE949',mixBlendMode:'multiply',borderRadius:'9px 4px 7px 3px / 4px 7px 3px 6px'}}/>)}
        {mode==='spotlight' && <svg width={1920} height={1080} style={{position:'absolute',inset:0,overflow:'visible'}}>
          <defs><mask id="sentence-aperture" maskUnits="userSpaceOnUse" x={-10000} y={-10000} width={20000} height={20000}>
            <rect x={-10000} y={-10000} width={20000} height={20000} fill="white"/>
            {s.boxes.map((r,i)=><rect key={i} x={r.x-6} y={r.y-5} width={r.width+12} height={r.height+10} rx={4} fill="black"/>)}
          </mask></defs>
          <rect x={-10000} y={-10000} width={20000} height={20000} fill="black" mask="url(#sentence-aperture)" opacity={(props.dimOpacity??.76 )*emphasis}/>
        </svg>}
      </div>
    </div>
  </AbsoluteFill>;
}
/** Adapted from approved preview-v2-talk-highlighter-sweep: multiply color wipe. */
export function NewsBrushFocus(props:NewsFocusProps){return <Stage props={props} mode="brush"/>;}
/** Adapted from approved 109-03: source pixels remain clear while context recedes. */
export function NewsSpotlightFocus(props:NewsFocusProps){return <Stage props={props} mode="spotlight"/>;}
