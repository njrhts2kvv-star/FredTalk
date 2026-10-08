import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {MeshVideo, PlaneMapper} from './MeshVideo';

export type ElasticClickVideoProps = {
  src: string;
  /** Local adaptation: source in-point, measured in the composition clock. */
  trimBefore?: number;
  clickSrc?: string;
  showCursor?: boolean;
  clickVolume?: number;
  clickTime?: number;
};
const times = [0,.066667,.1,.133333,.166667,.2,.233333,.266667,.3,.333333,.366667,.4,.433333,.466667,.5,.533333,.566667,.6,.633333,.666667,.7,.733333,.766667,.8,.866667,.933333];
const widths = [1248,1248,1248,1248,1248,1248,1248,1247,1247,1242,1241,1240,1236,1230,1224,1216,1204,1182,656,763,1002,1464,1810,2060,1990,1920];
const heights = [780,780,780,780,780,780,780,780,752,775,781,779,776,773,769,764,756,744,426,504,651,952,1160,1300,1140,1080];
const tops = [1370,1120,915,716,542,394,274,183,117,73,50,38,29,23,21,23,27,33,192,153,79,-71,-166,-230,-30,0];
const warpTimes = [0,.6,.633333,.666667,.7,.733333,.766667,.8,.866667,.933333];
const warpAmounts = [0,0,.44,.44,.43,.40,.31,.15,.035,0];
const clamped = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;

/** Rounded window rises, visibly compresses on the click, then rebounds into the full video. */
export function createElasticMapper(t: number): PlaneMapper {
  const w = interpolate(t,times,widths,clamped);
  const h = interpolate(t,times,heights,clamped);
  const top = interpolate(t,times,tops,clamped);
  const pinch = interpolate(t,warpTimes,warpAmounts,clamped);
  return (u,v) => {
    const x = (u-.5)*w, y = (v-.5)*h;
    // Both the boundary and the pixels bend. Mid-edges pull inward; corners retain their span.
    return {x:960 + x*(1-pinch*Math.sin(Math.PI*v)),
      y:top+h/2 + y*(1-pinch*.54*Math.sin(Math.PI*u))};
  };
}

export function ElasticClickVideo({src,trimBefore=0,clickSrc,showCursor=true,clickVolume=1,clickTime=.55}: ElasticClickVideoProps) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame/fps;
  const glow = interpolate(t,[0,.3,.6,.633333,.733333,.833333,.933333],[12,18,18,34,40,8,0],clamped);
  const brightness = interpolate(t,[0,.6,.633333,.733333,.833333,.933333],[1,1,1.65,1.9,1.12,1],clamped);
  const radius = interpolate(t,[0,.6,.8,.933333],[90,90,45,0],clamped);
  const blur = interpolate(t,[0,.3,.6,.633333,.733333,.833333,.933333],[4,3,3,12,18,4,0],clamped);
  const travel = interpolate(t,[.3,.566667],[0,1],clamped);
  const q = 1-travel;
  const cursorX = q*q*1730 + 2*q*travel*1480 + travel*travel*935;
  const cursorY = q*q*404 + 2*q*travel*120 + travel*travel*390;
  const pressed = interpolate(t,[.533333,.566667,.633333,.683333],[1,.85,.85,1],clamped);
  const cursorOpacity = interpolate(t,[.283333,.3,.766667,.866667],[0,1,1,0],clamped);
  const cursorGlow = interpolate(t,[.55,.633333,.766667,.866667],[0,8,10,0],clamped);
  return <AbsoluteFill style={{background:'#000',overflow:'hidden'}}>
    <MeshVideo src={src} trimBefore={trimBefore} map={createElasticMapper(t)} columns={64} rows={40}
      glow={glow} blur={blur} brightness={brightness} cornerRadius={radius} show={t>=.066667} flat={t>=.933333}/>
    {showCursor && <svg width={86} height={160} viewBox="0 0 86 160" style={{position:'absolute',left:cursorX,top:cursorY,
      opacity:cursorOpacity,transform:`scale(${pressed})`,transformOrigin:'0 0',
      filter:`drop-shadow(0 2px 2px #0007) drop-shadow(0 0 ${cursorGlow}px #fff)`}}>
      <path d="M3 3 L3 112 L26 91 L52 146 L68 138 L43 83 L77 82 Z" fill="white" stroke="#333" strokeWidth={3} strokeLinejoin="miter"/>
    </svg>}
    {clickSrc && <Sequence from={Math.round(clickTime*fps)} layout="none"><Audio src={clickSrc} volume={clickVolume}/></Sequence>}
  </AbsoluteFill>;
}
