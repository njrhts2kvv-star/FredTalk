// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
const candidates=JSON.parse(fs.readFileSync('src/font-candidates.json','utf8'));
const serveUrl=await bundle({entryPoint:path.resolve('src/font-probe-entry.tsx'),publicDir:path.resolve('public')});
const browser=await openBrowser('chrome');
const output=path.resolve('../../analysis/B002/font-proof');fs.mkdirSync(output,{recursive:true});
try {
 for(const candidate of candidates){
  const inputProps={family:candidate.family,text:'更精准的视频编辑',size:165};
  const composition=await selectComposition({serveUrl,id:'FontProbe',inputProps,puppeteerInstance:browser});
  await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,output:path.join(output,candidate.family+'.png')});
  console.log('FONT_PROOF',candidate.family);
 }
}finally{await browser.close({silent:true});}
