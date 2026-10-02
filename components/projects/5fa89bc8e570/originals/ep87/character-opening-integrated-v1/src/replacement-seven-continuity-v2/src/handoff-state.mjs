const smooth=(f,a,b)=>{const p=Math.max(0,Math.min(1,(f-a)/(b-a)));return p*p*p*(p*(p*6-15)+10);};
export const lerp=(a,b,p)=>p<=0?a:p>=1?b:a+(b-a)*p;
export function handoffState(f,h){
 const travel=smooth(f,5,55);
 return {
  box:h.from.map((n,i)=>lerp(n,h.to[i],travel)),
  travel,
  oldContext:1-smooth(f,0,17),
  oldContent:1-smooth(f,12,27),
  newContent:smooth(f,33,49),
  newContext:smooth(f,44,60),
 };
}
