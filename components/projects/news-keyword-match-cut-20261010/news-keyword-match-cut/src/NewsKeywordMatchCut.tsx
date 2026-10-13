import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';

export type MatchCutPage = {src: string; durationInFrames: number};
export type NewsKeywordMatchCutProps = {
  pages: MatchCutPage[];
  audioSrc?: string;
  audioVolume?: number;
};

/** Images have already been aligned, zoomed and shaded by pipeline.py. */
export const NewsKeywordMatchCut: React.FC<NewsKeywordMatchCutProps> = ({pages, audioSrc, audioVolume=1}) => {
  const frame = useCurrentFrame();
  if (!pages.length || pages.some(p => !Number.isInteger(p.durationInFrames) || p.durationInFrames <= 0)) {
    throw new Error('Match cut requires pages with positive integer frame durations');
  }
  let cursor = 0;
  const page = pages.find(p => {cursor += p.durationInFrames; return frame < cursor;}) ?? pages[pages.length-1];
  return <AbsoluteFill style={{backgroundColor: '#111'}}>
    <Img src={staticFile(page.src)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    {audioSrc ? <Audio src={staticFile(audioSrc)} volume={audioVolume}/> : null}
  </AbsoluteFill>;
};
