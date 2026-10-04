import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,openBrowser,renderStill} from '@remotion/renderer';
const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync('manifest.json','utf8'));
const ids=(process.argv[2]||manifest.clips.filter(c=>!(manifest.deferredIds||[]).includes(c.id)).map(c=>c.id).join(',')).split(',');
const concurrency=Number(process.env.RENDER_CONCURRENCY||4);
const options={chromeMode:'chrome-for-testing',...(process.env.REMOTION_BROWSER?{browserExecutable:process.env.REMOTION_BROWSER}:{}),...(process.env.REMOTION_GL?{chromiumOptions:{gl:process.env.REMOTION_GL}}:{})};
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public')});
const browser=await openBrowser('chrome',options);
fs.mkdirSync('outputs',{recursive:true});fs.mkdirSync('qc',{recursive:true});
const reportPath='qc/render-report-'+ids[0]+'.json';
const report={startedAt:new Date().toISOString(),concurrency,options,clips:[]};
try {
for(const id of ids){
 const item=manifest.clips.find(c=>c.id===id);if(!item)throw Error('Unknown '+id);
 const inputProps={id,overrides:{}};
 const composition=await selectComposition({serveUrl,id,inputProps,puppeteerInstance:browser,...options});
 const outputLocation=path.join(root,'outputs',id+'.mp4');
 const started=Date.now();console.log('START',id,composition.durationInFrames);
 await renderMedia({composition,serveUrl,inputProps,outputLocation,codec:'h264',crf:15,pixelFormat:'yuv420p',muted:true,concurrency,puppeteerInstance:browser,...options,onProgress:({progress})=>{if(progress===1)console.log('ENCODED',id);}});
 for(const frame of [0,Math.floor(item.durationInFrames/2),item.durationInFrames-1]){
  await renderStill({composition,serveUrl,inputProps,output:path.join(root,'qc',`${id}-${frame}.jpg`),frame,imageFormat:'jpeg',scale:0.5,puppeteerInstance:browser,...options});
 }
 const receipt={id,frames:item.durationInFrames,seconds:(Date.now()-started)/1000,sha256:crypto.createHash('sha256').update(fs.readFileSync(outputLocation)).digest('hex')};report.clips.push(receipt);
 fs.writeFileSync(reportPath,JSON.stringify(report,null,2));console.log('DONE',JSON.stringify(receipt));
}
}finally{
 await browser.close({silent:true});
 // The frozen source snapshot is retained; the generated webpack bundle is disposable.
 if(path.basename(serveUrl).startsWith('remotion-webpack-bundle-')){
  await fs.promises.rm(serveUrl,{recursive:true,force:true});
 }
}
