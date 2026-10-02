// Frame-independent state functions: callers supply seconds from the output clock.
export const lerp=(a,b,p)=>a+(b-a)*p;
export const clamp01=x=>Math.max(0,Math.min(1,x));
export function phase(time,start,end){
 if(![time,start,end].every(Number.isFinite)||end<=start)throw Error('A phase needs finite time and an increasing interval');
 const p=clamp01((time-start)/(end-start));return p*p*(3-2*p);
}
export function boxAt(from,to,progress){
 if(from.length!==4||to.length!==4||![...from,...to].every(Number.isFinite))throw Error('Boxes must be [x,y,width,height]');
 return from.map((v,i)=>lerp(v,to[i],clamp01(progress)));
}
export function branchState({time,origin,targets,selected,expand,focus}){
 if(!targets.length||selected<0||selected>=targets.length)throw Error('A valid selected branch is required');
 const p=phase(time,...expand),q=phase(time,...focus);
 return targets.map((target,i)=>({box:boxAt(boxAt(origin,target,p),i===selected?origin:target,q),
  visible:i===selected||(p>0&&q<1),scale:i===selected?1:p*(1-q),selected:i===selected}));
}
export function expandReturn({time,rest,expanded,open,close}){
 if(close[0]<open[1])throw Error('Return must follow expansion');
 return boxAt(rest,expanded,phase(time,...open)*(1-phase(time,...close)));
}
export function slotState(time,items){
 if(!items.length||items.some((x,i)=>!Number.isFinite(x.at)||(i&&x.at<=items[i-1].at)))throw Error('Slot cues must be ordered and unique');
 let index=-1;for(let i=0;i<items.length;i++)if(time>=items[i].at)index=i;
 return {index,value:index<0?null:items[index].value};
}
export function handoffState({time,from,to,travel,swap}){
 if(swap[0]<travel[0]||swap[1]>travel[1])throw Error('Content swap must lie inside travel');
 const progress=phase(time,...travel),change=phase(time,...swap);
 return {box:boxAt(from,to,progress),progress,oldContent:1-change,newContent:change,surfaceVisible:true};
}
export function audioPosition(seconds,duration,width){
 if(!(duration>0)||!(width>0))throw Error('Positive duration and width required');
 return clamp01(seconds/duration)*width;
}
export function frostedFocusState({progress,tone='light',blur=19,tintOpacity=.58}){
 if(!Number.isFinite(progress)||!Number.isFinite(blur)||blur<0)throw Error('Frosted focus needs finite progress and non-negative blur');
 if(!Number.isFinite(tintOpacity)||tintOpacity<0||tintOpacity>1)throw Error('Frosted tint opacity must be between 0 and 1');
 if(tone!=='light'&&tone!=='dark')throw Error('Frosted focus tone must be light or dark');
 const p=clamp01(progress);
 return {blurPx:blur*p,tintAlpha:tintOpacity*p,tintRgb:tone==='light'?[255,255,255]:[0,0,0],foregroundVisible:p>0};
}
