import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, registerRoot, staticFile, delayRender, continueRender, cancelRender} from 'remotion';
import candidates from './font-candidates.json';

const FontProbe = ({family, text, size}: {family: string; text: string; size: number}) => {
  const [handle] = useState(() => delayRender('Font candidate'));
  useEffect(() => {
    const candidate = candidates.find(c => c.family === family)!;
    const font = new FontFace(family, `url(${staticFile(candidate.file)})`, {weight:('weight' in candidate?candidate.weight:'400') as string});
    font.load().then(f => {document.fonts.add(f); continueRender(handle);}).catch(cancelRender);
  }, [family, handle]);
  return <AbsoluteFill style={{background:'white'}}><div style={{position:'absolute',left:100,top:160,fontFamily:family,fontSize:size,fontWeight:(candidates.find(c=>c.family===family) as {weight?:string})?.weight??'400',fontSynthesis:'none',lineHeight:1,whiteSpace:'pre'}}>{text}</div></AbsoluteFill>;
};
registerRoot(() => <Composition id="FontProbe" component={FontProbe} width={1920} height={540} durationInFrames={1} fps={60} defaultProps={{family:'MiSansHeavy',text:'更精准的视频编辑',size:165}}/>);
