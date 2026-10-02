// Font-only adapter. Geometry, text, cues, media and frame rate remain in the original files.
import {staticFile, delayRender, continueRender, cancelRender} from 'remotion';
const target=(src:string)=>{
 const s=src.toLowerCase();
 if (/sourcehansans|sourcesans3|robotocondensed|misans-bold/.test(s)) return 'MiSans-Heavy.otf';
 if (/alimamashuhei/.test(s)) return 'RuiZi.ttf';
 if (/muyao|longcang/.test(s)) return 'LXGWWenKai-Regular.ttf';
 if (/arimo/.test(s)) return 'MiSans-Medium.otf';
 return null;
};
export class FiveFontFace extends FontFace {
 private siblings:FontFace[]=[];
 constructor(family:string,source:string,descriptors:FontFaceDescriptors={}){
  const noto=/notosanssc/i.test(source),mapped=target(source),weight=String(descriptors.weight||'400');
  const range=noto && /\s/.test(weight);
  const number=parseInt(weight),file=noto?(number>=700?'MiSans-Heavy.otf':number>=600?'MiSans-Semibold.otf':'MiSans-Medium.otf'):mapped;
  super(family,file?`url(${staticFile('_five-fonts/'+(range?'MiSans-Heavy.otf':file))})`:source,{...descriptors,...(range?{weight:'900'}:{})});
  if(range)for(const w of [100,200,300,400,500,600,700,800])this.siblings.push(new FontFace(family,`url(${staticFile('_five-fonts/'+(w>=700?'MiSans-Heavy.otf':w>=600?'MiSans-Semibold.otf':'MiSans-Medium.otf'))})`,{...descriptors,weight:String(w)}));
 }
 async load():Promise<FontFace>{await Promise.all(this.siblings.map(async f=>{await f.load();document.fonts.add(f)}));return super.load();}
}
