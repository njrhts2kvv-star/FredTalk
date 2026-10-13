import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { COMPONENTS } from './registry';

function Root() {
  return <>{COMPONENTS.map((c) => <Composition key={c.id} id={c.id} component={c.component as React.FC} durationInFrames={Math.round(c.seconds * 60)}
    fps={60} width={1920} height={1080} defaultProps={c.defaults} />)}</>;
}
registerRoot(Root);
