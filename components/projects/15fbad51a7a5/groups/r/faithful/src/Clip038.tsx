import {approvedStaticFile as staticFile} from '../../../../material-policy';
import React from 'react';
import {AbsoluteFill, Img, useCurrentFrame, useVideoConfig} from 'remotion';
import {Media} from './Media';
import motion from './038-motion.json';

// Source-measured container motion; replaceable Fred media content.
export const Clip038: React.FC<{landscape?:string;portrait?:string}> = ({landscape='revision/fred-conversation.mp4',portrait='revision/fred-street-portrait.mp4'}) => {
  const frame = useCurrentFrame()*30/useVideoConfig().fps;
  const pose = motion[Math.min(Math.floor(frame), motion.length - 1)];
  const window = (kind: string, box: number[]) => {
    const [left, top, width, height] = box;
    return <div style={{position: 'absolute', left, top, width, height,
      overflow: 'hidden', borderRadius: (kind === 'landscape' ? 48 : 44) * width / (kind === 'landscape' ? 1156 : 388),
      boxShadow: '13px 15px 16px rgba(0,0,0,0.23)'}}>
      <Media src={kind==='landscape'?landscape:portrait}/>
    </div>;
  };
  return <AbsoluteFill style={{background: '#fff'}}>
    {frame>=175&&<div style={{position:'absolute',left:198,top:-660+Math.min(1,(frame-175)/4)*170,width:884,height:650,background:'#222226',borderRadius:8}}/>}
    {window('landscape', pose.landscape)}
    {pose.portrait && window('portrait', pose.portrait)}

  </AbsoluteFill>;
};
