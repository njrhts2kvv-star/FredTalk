import {V6Sample} from '../v6/V6Sample';
import type {V7Spec} from './types';
import {V7MediaStages} from './V7MediaStages';
import {V7ResultStages} from './V7ResultStages';
import {V7TypeStages} from './V7TypeStages';

const mediaLayouts=new Set(['single-stage-focus','fixed-input-panel','fixed-cascade','fixed-document-pair','fixed-dark-window','prompt-panel','paired-docs','single-media-focus','fixed-browser-stage','single-card-conclusion']);
const resultLayouts=new Set(['fixed-result-board','metric-ribbon']);

export const V7Sample=({spec}:{spec:V7Spec})=>{
  if(spec.protected) return <V6Sample spec={spec}/>;
  if(mediaLayouts.has(spec.layout)) return <V7MediaStages spec={spec}/>;
  if(resultLayouts.has(spec.layout)) return <V7ResultStages spec={spec}/>;
  return <V7TypeStages spec={spec}/>;
};

