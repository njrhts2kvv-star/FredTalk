export function sourceFrameAt(clock,frame){
 if(frame<=clock[0].frame)return clock[0].sourceFrame;
 for(let i=1;i<clock.length;i++){
  const b=clock[i],a=clock[i-1];
  if(frame<=b.frame)return a.sourceFrame+(b.sourceFrame-a.sourceFrame)*(frame-a.frame)/(b.frame-a.frame);
 }
 return clock.at(-1).sourceFrame;
}
