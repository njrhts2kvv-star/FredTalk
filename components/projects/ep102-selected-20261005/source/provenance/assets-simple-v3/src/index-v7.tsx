import React from 'react';
import {AbsoluteFill, Audio, Composition, Loop, registerRoot, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Corner, Fonts, Media} from './common';
import {SmileySubtitle} from './SmileySubtitle';
import {OpeningRibbon} from './adapters/OpeningRibbon';
import {ToolCombinationV7} from './adapters/ToolCombinationV7';
import {AssetsToResultV7, DispatchV7, TipsV7, SummaryV7, TIPS_V7_DARK_FROM_SCENE_FRAME} from './adapters/ExplainRevisionV7';
import {AssetsV7, CanvasV7, DanceV7, InstallV7, PullV7, ScriptV7, StableMediaV7} from './adapters/MediaRevisionV7';
import {BoardsV7, VoiceV7} from './adapters/CanvasReviewV7';
import data from './production.json';
import {AssetsToResultV8, DispatchV8, VoiceV8, AssetsV8, BoardsV8, ScriptV8, SummaryV8, TipsV8} from './adapters/MajorRevisionV8';
import {DispatchReferenceV8} from './adapters/DispatchReferenceV8';
import {AssetsReferenceV8} from './adapters/AssetsReferenceV8';
import {SummaryReferenceV8} from './adapters/SummaryReferenceV8';
import {DispatchReferenceV9} from './adapters/DispatchReferenceV9';
import {AssetsReferenceV9} from './adapters/AssetsReferenceV9';
import {ScriptPlaybackV9} from './adapters/ScriptPlaybackV9';

type SceneProps = {sceneId: string};
const TOTAL_FRAMES = data.pages.reduce((n, s) => n + s.durationInFrames, 0);

// All scene geometry stays in the approved 1920 design coordinates. The
// complete canvas scales as one object for the native 3840×2160 master.
function DesignCanvas({children}: {children: React.ReactNode}) {
  const {width} = useVideoConfig();
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden', fontFamily: 'EP102', fontSynthesis: 'none'}}>
    <div style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}>{children}</div>
  </AbsoluteFill>;
}

function SceneBody({sceneId}: SceneProps) {
  const frame = useCurrentFrame();
  const scene = data.pages.find(s => s.stableId === sceneId);
  if (!scene) throw new Error('Unknown scene ' + sceneId);
  let body: React.ReactNode;
  switch (sceneId) {
    case 'S01': body = <OpeningRibbon frame={frame}/>; break;
    case 'S02': body = <Media id="B01"/>; break;
    case 'S03': body = <>
      <Sequence durationInFrames={350}><ToolCombinationV7 frame={frame}/></Sequence>
      <Sequence from={350} durationInFrames={778}><DispatchReferenceV9 frame={frame - 350}/></Sequence>
      <Sequence from={1128} durationInFrames={521}><Media id="B02"/></Sequence>
      <Sequence from={1649}><Loop durationInFrames={120}><Media id="game-transition"/></Loop></Sequence>
    </>; break;
    case 'S04': body = <InstallV7 frame={frame}/>; break;
    case 'S05': body = <PullV7 frame={frame}/>; break;
    case 'S06': body = <ScriptPlaybackV9 frame={frame}/>; break;
    case 'S07': body = <AssetsReferenceV9 frame={frame}/>; break;
    case 'S08': body = <VoiceV8 frame={frame}/>; break;
    case 'S09': body = <BoardsV8 frame={frame}/>; break;
    case 'S10': body = <>
      <Sequence durationInFrames={300}>
        <AbsoluteFill style={{background: '#fff'}}>
          <Sequence durationInFrames={130}><StableMediaV7 id="generate" frame={frame} start={1.1} rate={.3} slide/></Sequence>
          <Sequence from={130}><StableMediaV7 id="generate" start={2.9} rate={.38}/></Sequence>
        </AbsoluteFill>
      </Sequence>
      <Sequence from={300} durationInFrames={347}><AssetsToResultV8 frame={frame - 300}/></Sequence>
      <Sequence from={647}><TipsV8 frame={frame - 647}/></Sequence>
    </>; break;
    // The master WAV already contains the full original S11 soundtrack.
    // Media is muted throughout to prevent doubling or segment AAC seams.
    case 'S11': body = <AbsoluteFill style={{background: '#000'}}><Media id="final-demo"/></AbsoluteFill>; break;
    case 'S12': body = <DanceV7 frame={frame}/>; break;
    case 'S13': body = <AbsoluteFill style={{background: '#fff'}}><StableMediaV7 id="fight" start={2}/></AbsoluteFill>; break;
    case 'S14': body = <AbsoluteFill style={{background: '#fff'}}><div style={{position: 'absolute', left:60, top:33.222222, width:1800, height:1013.555556, borderRadius:24, overflow:'hidden'}}><div style={{position:'absolute',width:1920,height:1080,transform:'scale(.9375)',transformOrigin:'top left'}}><CanvasV7 frame={frame}/></div></div></AbsoluteFill>; break;
    case 'S15': body = <SummaryReferenceV8 frame={frame}/>; break;
    default: throw new Error('Unimplemented V7 scene ' + sceneId);
  }
  // Fred: recorded/film playback carries no logo. S02 explicitly requests a pale logo.
  const showCorner = sceneId === 'S02' || (sceneId === 'S01' && frame >= 48 && frame < 386)
    || sceneId === 'S03'
    || (sceneId === 'S10' && ((frame >= 647 && frame < 929) || (frame >= 1127 && frame < 1663)));
  return <>
    {body}
    {showCorner && <Corner dark={sceneId === 'S02' || (sceneId === 'S10' && frame >= 1127)}/>}
    {sceneId !== 'S11' && <SmileySubtitle cues={data.cues} timeSeconds={(scene.startFrame + frame) / 60}/>}
  </>;
}

function SegmentV7({sceneId}: SceneProps) {
  const scene = data.pages.find(s => s.stableId === sceneId)!;
  return <><Fonts/><DesignCanvas><SceneBody sceneId={sceneId}/></DesignCanvas>
    <Audio src={staticFile('media/review-audio-v6.wav')} startFrom={scene.startFrame}/>
  </>;
}

function FullMovieV7() {
  return <><Fonts/><DesignCanvas>{data.pages.map(scene =>
    <Sequence key={scene.stableId} from={scene.startFrame} durationInFrames={scene.durationInFrames}>
      <SceneBody sceneId={scene.stableId}/>
    </Sequence>
  )}</DesignCanvas><Audio src={staticFile('media/review-audio-v6.wav')}/></>;
}

const RootV7 = () => <>
  <Composition id="EP102-V7" component={FullMovieV7} width={3840} height={2160} fps={60} durationInFrames={TOTAL_FRAMES}/>
  {data.pages.map(s => <Composition key={s.stableId} id={`${s.stableId}-v7`} component={SegmentV7} width={1920} height={1080} fps={60} durationInFrames={s.durationInFrames} defaultProps={{sceneId: s.stableId}}/>)}
</>;
registerRoot(RootV7);
