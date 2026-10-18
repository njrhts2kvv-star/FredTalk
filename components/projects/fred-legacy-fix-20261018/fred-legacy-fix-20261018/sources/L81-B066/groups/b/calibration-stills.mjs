// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
const serveUrl=await bundle({entryPoint:path.resolve('src/calibration-entry.tsx'),publicDir:path.resolve('public')});
const browser=await openBrowser('chrome');
const output=path.resolve('../../analysis/B002/calibration-stills');fs.mkdirSync(output,{recursive:true});
try{
 for(const id of ['B002Proof','B002Fred']){
  const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});
  for(const frame of id==='B002Fred'?[180]:[42,60,90,114,132,180,279,282,288,299]){
   await renderStill({serveUrl,composition,frame,puppeteerInstance:browser,output:path.join(output,`${id}-${frame}.png`)});
   console.log(id,frame);
  }
 }
}finally{await browser.close({silent:true});}
