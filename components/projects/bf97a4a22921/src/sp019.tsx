import {ApprovedVideo as OffthreadVideo, approvedStaticFile as staticFile} from '../material-policy';
import React, {useEffect, useState} from 'react';
import mediaMotion from './sp019-media-motion.json';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const arcWords = [
  {label: '西游买瓜', color: '#7C3AED', from: 190, to: 220},
  {label: '山歌买瓜', color: '#7C3AED', from: 193, to: 220},
  {label: '海绵宝宝', color: '#7C3AED', from: 223, to: 251},
  {label: '华强买精灵球', color: '#7C3AED', from: 226, to: 253},
  {label: '华强买瓜', color: '#7C3AED', from: 261, to: 302},
  {label: '许仙买瓜', color: '#7C3AED', from: 263, to: 302},
];

export const SP019: React.FC = () => {
  const f = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load SP019 font'));
  useEffect(() => {Promise.all([document.fonts.load('900 120px MiSans'), document.fonts.load('150px FusionPixel')]).then(() => continueRender(fontHandle));}, [fontHandle]);
  const gridExit = ramp(f, 14, 52);
  const headline = ramp(f, 72, 76) * (1 - ramp(f, 143, 157));
  const headlineSmall = ramp(f, 89, 105);
  const circles = ramp(f, 149, 166) * (1 - ramp(f, 320, 340));
  const together = ramp(f, 227, 243) * (1 - ramp(f, 310, 327));
  const capsules = ramp(f, 327, 360);
  return <AbsoluteFill style={{background: '#fff', fontFamily: 'MiSans, sans-serif', overflow: 'hidden'}}>
    {f < mediaMotion.length && ['a','b','c','d'].map((id, i) => {
      const [x,y,visible]=mediaMotion[f][i];
      return <div key={id} style={{position:'absolute',left:x,top:y,width:865,height:486,opacity:visible,overflow:'hidden',borderRadius:55}}>
        <OffthreadVideo src={staticFile(`sp019-${id}-motion.mp4`)} muted style={{width:'100%',height:'100%',objectFit:'fill'}} />
      </div>;
    })}
    {f < mediaMotion.length && <div style={{position:'absolute',left:0,right:0,bottom:0,height:64,background:'#fff'}}/>}
    {f>=60&&f<mediaMotion.length&&<div style={{position:'absolute',left:250,top:250,width:1420,height:650,background:'#fff'}}/>}
    <div style={{position: 'absolute', left: 420-380*headlineSmall, top: 205-170*headlineSmall,
      color: '#7C3AED', fontSize: 500-410*headlineSmall,
      fontWeight: 900, letterSpacing: 12-10*headlineSmall,
      opacity: headline,
      transform: `scale(${.7 + .3 * ramp(f,72,76)})`}}>抽象</div>
    {['华强','其它'].map((label, i) => <div key={label} style={{position:'absolute',
      left:(i ? 1106 : 423)+(i ? -161 : 136)*together+(i?1:-1)*1200*ramp(f,309,327), top:445,
      width:385,height:385,borderRadius:'50%',background:'#000',color:'#fff',
      display:'grid',placeItems:'center',fontSize:145,fontWeight:900,fontFamily:'MiSans, sans-serif',
      boxShadow:'17px 20px 22px #0003',opacity:ramp(f,i ? 154 : 128,i ? 173 : 144)*(1-ramp(f,320,340)),
      transform:`scale(${.55+.45*ramp(f,i ? 154 : 128,i ? 173 : 144)})`}}><span style={{opacity:ramp(f,i ? 154 : 128,i ? 173 : 144)}}>{label}</span></div>)}
    {arcWords.map((word, i) => {
      const paired = i % 2;
      const x = paired ? 870 : 460;
      const y = i < 2 ? 355 : i < 4 ? 330 : 350;
      const visible = ramp(f,word.from,word.from+10)*(1-ramp(f,word.to,word.to+10));
      return <svg key={word.label} width="1920" height="1080" style={{position:'absolute',inset:0,opacity:visible,overflow:'visible'}}>
        <defs><path id={`sp019-arc-${i}`} d={`M ${x} ${y} Q ${x+205} ${y-155} ${x+410} ${y}`} /></defs>
        <text fill="#7C3AED" fontFamily="MiSans" fontWeight="900" fontSize={i < 4 ? 92 : 90}>
          <textPath href={`#sp019-arc-${i}`} startOffset="50%" textAnchor="middle" textLength="455" lengthAdjust="spacingAndGlyphs">{word.label}</textPath>
        </text>
      </svg>;
    })}
    <div style={{position:'absolute',left:527,top:167,opacity:1}}>
      {['AI短剧','AI带货'].map((label,i)=><div key={label} style={{width:865,height:343,
        borderRadius:95,background:'#000',marginBottom:102,boxShadow:'17px 20px 20px #0003',
        color:'#fff',fontWeight:900,fontSize:170,display:'grid',placeItems:'center',
        opacity:ramp(f,i ? 341 : 327,i ? 355 : 340)}}><span style={{opacity:ramp(f,i ? 385 : 370,i ? 398 : 389)}}>{label}</span></div>)}
    </div>
  </AbsoluteFill>;
};
