// 每段一个 Composition（带口播切片与字幕），<EP>-FULL 串起全片。把 EP114 换成本期编号。
import React from 'react';
import { Composition, Sequence, registerRoot } from 'remotion';
import { FPS, PAGES, SceneShell } from './lib/shell';
import { SCENES } from './scenes';
import timing from './timing.json';

const Seg = ({ id }: { id: string }) => { const C = SCENES[id]; return <SceneShell id={id}><C /></SceneShell>; };

function Full() {
  return <>{PAGES.map((p) => <Sequence key={p.stableId} from={p.globalStartFrame} durationInFrames={p.frames} name={p.stableId}>
    <Seg id={p.stableId} />
  </Sequence>)}</>;
}

function Root() {
  return <>
    {PAGES.map((p) => <Composition key={p.stableId} id={p.stableId} component={() => <Seg id={p.stableId} />}
      durationInFrames={p.frames} fps={FPS} width={1920} height={1080} />)}
    <Composition id="EP114-FULL" component={Full} durationInFrames={timing.totalFrames} fps={FPS} width={1920} height={1080} />
  </>;
}
registerRoot(Root);
