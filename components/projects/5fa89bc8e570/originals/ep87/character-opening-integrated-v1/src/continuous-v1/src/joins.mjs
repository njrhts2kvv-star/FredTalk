export const mix=(a,b,p)=>a+(b-a)*p;
export const ease=(t,a,b)=>{const p=Math.max(0,Math.min(1,(t-a)/(b-a)));return p*p*p*(p*(p*6-15)+10);};
export function partFourState(t){const take=ease(t,6.6,7.5);return {take,oldX:300-760*take,oldVisible:take<1,oldScale:mix(1,.7,take),placeholderY:195+460*ease(t,6.6,7.3),copyOut:ease(t,6.6,7.05),conclusion:ease(t,7.12,7.65)};}
export function joinState(frame,join){const p=(frame-join.startFrame)/(join.endFrame-join.startFrame);return {p,morph:ease(p,0,1),oldOut:ease(p,0,.46),newIn:ease(p,.54,1),oldVisible:p<.46,newVisible:p>.54};}
