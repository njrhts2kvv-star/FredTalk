import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {NewsKeywordMatchCut} from './NewsKeywordMatchCut';
import sample from './sample.json';

const Root = () => <Composition id="News-Keyword-Match-Cut" component={NewsKeywordMatchCut}
  width={1920} height={1080} fps={30}
  durationInFrames={sample.pages.reduce((sum,p)=>sum+p.durationInFrames,0)} defaultProps={sample}/>;
registerRoot(Root);
