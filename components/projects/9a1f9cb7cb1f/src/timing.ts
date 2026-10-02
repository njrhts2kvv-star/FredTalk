import timing from '../timing.json';
export const mapFrame=(f:number)=>{const a=timing.anchors;for(let i=1;i<a.length;i++){if(f<=a[i].new){const t=(f-a[i-1].new)/(a[i].new-a[i-1].new);return a[i-1].old+t*(a[i].old-a[i-1].old)}}return a[a.length-1].old;};
