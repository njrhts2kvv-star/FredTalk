import React from 'react';
import {Composition} from 'remotion';
import manifest from '../../docs/fourth-sentence-manifest.json';
import {FourthSentenceRemake} from './FourthSentenceRemake';

const page = manifest.pages[0];

export const Root: React.FC = () => (
  <Composition id={page.stableId} component={FourthSentenceRemake} durationInFrames={page.durationInFrames} fps={manifest.fps} width={manifest.width} height={manifest.height} />
);
