import React, {useLayoutEffect} from 'react';
import {AbsoluteFill, Img, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {NativeSceneClock} from './NativeSceneClock';
import {OpeningV5 as WhiteOpening} from './versions/white/adapters/opening-v5/OpeningV5';
import {OpeningV5 as FinalOpening} from './versions/v9/adapters/opening-v5';
import {FightReferenceAnalysis} from './versions/v8/adapters/RevisionEntry';
import {LateRecordingFocus} from './versions/v8/adapters/LateRecordingFocus';
import {RecordedFightEvidence} from './versions/v8/adapters/V4Entry';
import {FightActionFocus} from './versions/v8/adapters/RevisionVariety';
import {ChosenModelStoryboard as BaselineStoryboard} from './versions/v8/adapters/ChosenModelStoryboard';
import {ChosenModelStoryboard as FinalStoryboard} from './versions/v9/adapters/ChosenModelStoryboard';
import {SmileySubtitle} from './versions/v8/shared/SmileySubtitle';
import data from './scene-data.json';

const ranges = [[0,120],[1200,1620],[3240,3900],[4200,4440],[6420,6600],[7860,8160]];
const seams: Record<number, number> = {4:20,5:6,6:7};
let fontsReady: Promise<void> | undefined;

export type EP109SelectedProps = {
  includeSubtitles?: boolean;
  includeBrand?: boolean;
  /** Keep the final film's short entry seam for the exact example. Disable when adapting content. */
  preserveOriginalBoundaryPixels?: boolean;
  videoSrc?: string;
  gridSrc?: string;
};

function Fonts() {
  useLayoutEffect(() => {
    const handle = delayRender('EP109 selected local fonts');
    fontsReady ??= Promise.all([
      ['Fred MiSans',500,'MiSans-Medium.otf'],['Fred MiSans',900,'MiSans-Heavy.otf'],['Fred RuiZi',400,'RuiZi.ttf'],
    ].map(async ([family,weight,file]) => {
      const face = new FontFace(String(family),`url(${staticFile('fonts/'+file)})`,{weight:String(weight)});
      await face.load();document.fonts.add(face);
    })).then(() => {});
    fontsReady.then(() => continueRender(handle)).catch(cancelRender);
    return () => continueRender(handle);
  },[]);
  return null;
}

function Brand({theme='light'}:{theme?:string}) {
  return <Img src={staticFile(theme==='dark'?'brand/fredtalk-ai-dark-cropped.png':'brand/fredtalk-ai-corner.png')}
    style={{position:'absolute',left:theme==='dark'?1554.5:1549.5,top:theme==='dark'?41:36,
      width:theme==='dark'?335:345.5,height:theme==='dark'?75:85,zIndex:900}}/>;
}

function Body({number,globalFrame,page,...props}: EP109SelectedProps & {number:number;globalFrame:number;page:any}) {
  const frame = useCurrentFrame();
  const t = frame / 60;
  let body: React.ReactNode;
  if(number===1) body=frame<60
    ? <WhiteOpening src={props.videoSrc || page.src} sourceIn={page.sourceIn}/>
    : <FinalOpening src={props.videoSrc || page.src} sourceIn={page.sourceIn}/>;
  else if(number===2) body=<FightReferenceAnalysis t={t} src={props.videoSrc || page.src} sourceIn={page.sourceIn} fps={60}/>;
  else if(number===3 || page.stableId==='S10') body=<LateRecordingFocus t={t} src={props.videoSrc || page.src} sourceIn={page.sourceIn} fps={60} sceneId={page.stableId}/>;
  else if(number===4) body=<RecordedFightEvidence t={t} src={props.videoSrc || page.src} sourceIn={page.sourceIn} fps={60}/>;
  else if(number===5) body=<FightActionFocus t={t}/>;
  else body=frame<219
    ? <BaselineStoryboard t={t} src={props.videoSrc} gridSrc={props.gridSrc}/>
    : <FinalStoryboard t={t} src={props.videoSrc} gridSrc={props.gridSrc}/>;
  return <>
    {body}
    {props.includeBrand && page.brand && frame>=(page.brandStartFrame??0) && frame<(page.brandEndFrame??Infinity) && <Brand theme={page.brandTheme}/>}
    {props.includeSubtitles && <SmileySubtitle cues={data.cues} timeSeconds={globalFrame/60}/>}
  </>;
}

function Selected({number,includeSubtitles=true,includeBrand=true,preserveOriginalBoundaryPixels=true,...props}:EP109SelectedProps & {number:number}) {
  const frame=useCurrentFrame();
  const {width}=useVideoConfig();
  const globalFrame=ranges[number-1][0]+frame;
  const page=data.pages.find(p=>globalFrame>=p.startFrame && globalFrame<p.startFrame+p.durationInFrames);
  if(!page) throw new Error('Selected range has no original scene at '+globalFrame);
  const boundary=preserveOriginalBoundaryPixels && includeSubtitles && includeBrand && frame<(seams[number]??0);
  return <AbsoluteFill style={{background:'#fff',overflow:'hidden'}}>
    <Fonts/>
    <div style={{position:'absolute',width:1920,height:1080,transform:`scale(${width/1920})`,transformOrigin:'top left'}}>
      {boundary ? <Img src={staticFile(`boundaries/109-${String(number).padStart(2,'0')}/${String(frame).padStart(3,'0')}.png`)}
        style={{width:1920,height:1080}}/>
        : <NativeSceneClock frame={globalFrame-page.startFrame} durationInFrames={page.durationInFrames}>
          <Body number={number} page={page} globalFrame={globalFrame} includeSubtitles={includeSubtitles} includeBrand={includeBrand} {...props}/>
        </NativeSceneClock>}
    </div>
  </AbsoluteFill>;
}

export const EP109Selected01: React.FC<EP109SelectedProps> = props => <Selected number={1} {...props}/>;
export const EP109Selected02: React.FC<EP109SelectedProps> = props => <Selected number={2} {...props}/>;
export const EP109Selected03: React.FC<EP109SelectedProps> = props => <Selected number={3} {...props}/>;
export const EP109Selected04: React.FC<EP109SelectedProps> = props => <Selected number={4} {...props}/>;
export const EP109Selected05: React.FC<EP109SelectedProps> = props => <Selected number={5} {...props}/>;
export const EP109Selected06: React.FC<EP109SelectedProps> = props => <Selected number={6} {...props}/>;
