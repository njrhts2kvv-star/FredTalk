// Local surface palette. Does not change geometry, typography, cues or media.
export const DARK_PURPLE = '#D6BEFF';
const rgb=(value:string):number[]|null=>{
 const hex=/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.exec(value);
 if(hex){const s=hex[1].length===3?[...hex[1]].map(c=>c+c).join(''):hex[1];return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16));}
 const match=/^rgb\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)\s*\)$/i.exec(value);
 return match?match.slice(1).map(Number):null;
};
export function purpleOnDark(color:string):string {
 const c=rgb(color);if(!c)return color;const [r,g,b]=c,max=Math.max(...c),min=Math.min(...c),d=max-min;
 if(d<12)return color;const h=((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)+6)%6;
 return h>3.9&&h<5.1?DARK_PURPLE:color;
}
// Preserve the existing surface inversion animation, including its pale state.
export function purpleOnSurface(color:string,gray:number):string {
 const target=purpleOnDark(color);if(target===color)return color;
 const p=Math.max(0,Math.min(1,(gray-75)/100));if(p===0)return target;if(p===1)return color;
 const a=rgb(target)!,b=rgb(color)!;return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*p)).join(',')})`;
}
