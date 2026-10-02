import type {V5Spec} from './types';
import {TransitionSamples} from './TransitionSamples';
import {CharacterSamples} from './CharacterSamples';
import {AttachmentSamples} from './AttachmentSamples';
import {TypographySamples} from './TypographySamples';
import {EvidenceSamples} from './EvidenceSamples';

export const V5Sample=({spec}:{spec:V5Spec})=>{
  if(spec.group==='transition') return <TransitionSamples spec={spec}/>;
  if(spec.group==='character') return <CharacterSamples spec={spec}/>;
  if(spec.group==='attachment') return <AttachmentSamples spec={spec}/>;
  if(spec.group==='typography') return <TypographySamples spec={spec}/>;
  return <EvidenceSamples spec={spec}/>;
};
