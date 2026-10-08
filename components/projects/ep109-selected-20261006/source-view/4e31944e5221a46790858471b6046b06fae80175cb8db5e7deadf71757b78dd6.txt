import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {FullscreenVideoWindow} from '../shared/FullscreenVideoWindow';
import {FightPromptScroll} from './RevisionEntry';
import {FightAnalysisTimeline} from './N027';
import {FightFrameEvidence} from './RevisionEvidence';

const q=(t:number,a:number,b:number)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*(3-2*p);};

/** Reuses the B009 prompt carrier at its settled geometry before handing its surface to the movie. */
export function PromptVideoHandoff({t,src,sourceIn,fps=60}:{t:number;src:string;sourceIn:number;fps?:number}) {
  return <AbsoluteFill style={{background:'#fff'}}>
    <FullscreenVideoWindow src={staticFile(src)} videoProps={{muted:true,startFrom:Math.round(sourceIn*fps)}}/>
    <div style={{position:'absolute',inset:0,opacity:1-q(t,0,.38)}}><FightPromptScroll t={2.35}/></div>
  </AbsoluteFill>;
}

/** The real recording remains the main evidence; the approved N027 graph only summarizes at the end. */
export function RecordingAnalysisWithSummary({t,src,sourceIn,fps=60,summary=false}:{t:number;src:string;sourceIn:number;fps?:number;summary?:boolean}) {
  const summaryOpacity=summary?q(t,3.5,3.95):0;
  return <AbsoluteFill style={{background:'#fff'}}>
    <FullscreenVideoWindow src={staticFile(src)} videoProps={{muted:true,startFrom:Math.round(sourceIn*fps)}}/>
    {summary&&<>
      <AbsoluteFill style={{background:'#000',opacity:summaryOpacity*.62}}/>
      <div style={{position:'absolute',inset:0,opacity:summaryOpacity,transform:'scale(.82)',transformOrigin:'960px 510px'}}>
        <FightAnalysisTimeline t={q(t,3.6,4.4)*17.269} duration={17.269} title="逐帧拆解" words={['出手','应接','反馈','场景','镜头','表情','动机','反转']}/>
      </div>
    </>}
  </AbsoluteFill>;
}

/** N023 real-frame comparison is introduced by the matching analysis row from Fred's recording. */
export function RecordedFightEvidence({t,src,sourceIn=10,fps=60}:{t:number;src:string;sourceIn?:number;fps?:number}) {
  const evidenceT=Math.max(0,(t-.92)*1.26);
  return <AbsoluteFill style={{background:'#fff'}}>
    <FightFrameEvidence t={evidenceT}/>
    <div style={{position:'absolute',inset:0,background:'#fff',opacity:1-q(t,.78,1.16)}}>
      <FullscreenVideoWindow src={staticFile(src)} videoProps={{muted:true,startFrom:Math.round(sourceIn*fps)}}/>
    </div>
  </AbsoluteFill>;
}
