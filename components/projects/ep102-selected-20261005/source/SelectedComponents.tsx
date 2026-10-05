import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ToolCombinationV7} from './versions/direction-a/adapters/ToolCombinationV7';
import {PullV7} from './versions/direction-a/adapters/MediaRevisionV7';
import {InstallV7} from './versions/install-v8/adapters/MediaRevisionV7';
import {AssetsReferenceV9} from './versions/assets-simple-v3/adapters/AssetsReferenceV9';
import {VoiceRevisionV13} from './versions/voice-v13/adapters/VoiceRevisionV13';
import {CanvasRevisionV14} from './versions/canvas-v17/adapters/CanvasRevisionV14';
import {IncomingAdapter} from './IncomingAdapter';
import {Corner, Fonts} from './versions/direction-a/common';
import {SmileySubtitle} from './versions/direction-a/SmileySubtitle';
import directionData from './versions/direction-a/production.json';
import installData from './versions/install-v8/production.json';
import assetsData from './versions/assets-simple-v3/production.json';
import voiceData from './versions/voice-v13/production.json';
import canvasData from './versions/canvas-v17/production.json';
import specs from './component-specs.json';
import {NativeSceneClock} from './NativeSceneClock';

export type EP102SelectedProps = {
  /** Include the exact example narration/independent audio auditions. */
  includeAudio?: boolean;
  /** Keep episode captions for the original example; disable for new content. */
  includeSubtitles?: boolean;
  /** Only 102-01 carries its original FredTalk corner brand. */
  includeBrand?: boolean;
};

function NativeBody({number, includeSubtitles = true, includeBrand = true}: EP102SelectedProps & {number: number}) {
  const frame = useCurrentFrame();
  const spec = specs[number - 1];
  const data = [directionData, installData, directionData, directionData, assetsData, voiceData, canvasData][number - 1];
  let body: React.ReactNode;
  switch (number) {
    case 1: body = <ToolCombinationV7 frame={frame}/>; break;
    case 2:
      // Final S04 includes its original Incoming composite through scene frame 35.
      // Only two selected frames use that repair. The zoom remains real source code.
      body = <InstallV7 frame={frame}/>; break;
    case 3:
    case 4: body = <PullV7 frame={frame}/>; break;
    case 5: body = <AssetsReferenceV9 frame={frame}/>; break;
    case 6: body = <VoiceRevisionV13 frame={frame}/>; break;
    case 7:
      body = <AbsoluteFill style={{background: '#fff'}}>
        <div style={{position: 'absolute', left: 60, top: 33.222222, width: 1800, height: 1013.555556, borderRadius: 24, overflow: 'hidden'}}>
          <div style={{position: 'absolute', width: 1920, height: 1080, transform: 'scale(.9375)', transformOrigin: 'top left'}}><CanvasRevisionV14 frame={frame}/></div>
        </div>
      </AbsoluteFill>;
      break;
    default: throw new Error('Unknown EP102 selected component: ' + number);
  }
  return <>{body}
    {number === 1 && includeBrand && <Corner/>}
    {includeSubtitles && <SmileySubtitle cues={data.cues} timeSeconds={(spec.productionStartFrame + frame) / 60}/>}
  </>;
}

/** Restore the complete original scene context, including media pre-roll. */
function Selected({number, includeAudio = true, ...props}: EP102SelectedProps & {number: number}) {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const spec = specs[number - 1];
  const start = spec.localFrameRange[0];
  const data = [directionData, installData, directionData, directionData, assetsData, voiceData, canvasData][number - 1];
  const sceneDuration = data.pages.find(page => page.stableId === spec.sourceScene)!.durationInFrames;
  return <>
    <Fonts/>
    {number === 2 && frame + start < 36 ?
      <NativeSceneClock frame={frame + start} durationInFrames={sceneDuration}><IncomingAdapter includeSubtitles={props.includeSubtitles}/></NativeSceneClock>
      : <AbsoluteFill style={{background: '#fff', overflow: 'hidden', fontFamily: 'EP102', fontSynthesis: 'none'}}>
      <div style={{position: 'absolute', width: 1920, height: 1080, transform: `scale(${width / 1920})`, transformOrigin: 'top left', overflow: 'hidden'}}>
        <NativeSceneClock frame={frame + start} durationInFrames={sceneDuration}>
          <NativeBody number={number} {...props}/>
        </NativeSceneClock>
      </div>
    </AbsoluteFill>}
    {includeAudio && <Audio src={staticFile(spec.audioPath)}/>}
  </>;
}

export const EP102Selected01: React.FC<EP102SelectedProps> = props => <Selected number={1} {...props}/>;
export const EP102Selected02: React.FC<EP102SelectedProps> = props => <Selected number={2} {...props}/>;
export const EP102Selected03: React.FC<EP102SelectedProps> = props => <Selected number={3} {...props}/>;
export const EP102Selected04: React.FC<EP102SelectedProps> = props => <Selected number={4} {...props}/>;
export const EP102Selected05: React.FC<EP102SelectedProps> = props => <Selected number={5} {...props}/>;
export const EP102Selected06: React.FC<EP102SelectedProps> = props => <Selected number={6} {...props}/>;
export const EP102Selected07: React.FC<EP102SelectedProps> = props => <Selected number={7} {...props}/>;
