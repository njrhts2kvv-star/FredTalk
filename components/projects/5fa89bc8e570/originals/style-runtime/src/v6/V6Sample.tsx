import type {V5Spec} from '../v5/types';
import {V5Sample} from '../v5/V5Sample';
import {V6Characters} from './V6Characters';
import {V6TransitionAttachment} from './V6TransitionAttachment';
import {V6TypographyEvidence} from './V6TypographyEvidence';

export type V6Spec=V5Spec&{protected?:boolean;version?:string};

export const V6Sample=({spec}:{spec:V6Spec})=>{
  if(spec.protected) return <V5Sample spec={spec}/>;
  if(spec.group==='character') return <V6Characters spec={spec}/>;
  if(spec.group==='transition'||spec.group==='attachment') return <V6TransitionAttachment spec={spec}/>;
  return <V6TypographyEvidence spec={spec}/>;
};
