import v7Manifest from '../../production/v7/manifest.json';
import {V7Sample} from '../v7/V7Sample';
import type {V7Spec} from '../v7/types';
import {V8Editorial} from './V8Editorial';
import {V8Product} from './V8Product';
import {V8Redesign} from './V8Redesign';
import {V8DevicesMedia} from './V8DevicesMedia';
import type {V8Spec} from './types';

const originalV7=new Map((v7Manifest.pages as V7Spec[]).map((page)=>[page.stableId,page]));
const redesignLayouts=new Set(['notion-path-reveal','evidence-document-stage','mosaic-to-conclusion','claude-prompt-result','apple-slot-replace','product-cost-choice-panels','codex-judgment-handoff']);
const editorialPrefixes=['apple-','notion-','arc-'];
const deviceMediaLayouts=new Set(['desktop-system-focus','device-network-stage','dual-device-cost-choice','evidence-search-stage','linear-project-workspace','error-checklist-stage','human-device-handoff','raycast-selection-grid','workflow-media-board','answer-ability-doc-flow','five-book-shelf-stage','result-decision-board']);

export const V8Sample=({spec}:{spec:V8Spec})=>{
  if(spec.protected){const original=originalV7.get(spec.stableId);if(!original)throw new Error(`Missing protected V7 spec: ${spec.stableId}`);return <V7Sample spec={original}/>;}
  if(redesignLayouts.has(spec.layout))return <V8Redesign spec={spec}/>;
  if(deviceMediaLayouts.has(spec.layout))return <V8DevicesMedia spec={spec}/>;
  if(editorialPrefixes.some((prefix)=>spec.layout.startsWith(prefix)))return <V8Editorial spec={spec}/>;
  return <V8Product spec={spec}/>;
};
