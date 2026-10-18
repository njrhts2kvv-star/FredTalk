// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
const serveUrl=await bundle({entryPoint:path.resolve('src/calibration-entry.tsx'),publicDir:path.resolve('public')});
const browser=await openBrowser('chrome');
const out=path.resolve('../../analysis/B002/calibration-video');fs.mkdirSync(out,{recursive:true});
try{for(const id of ['B002Proof','B002Fred']){const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',muted:true,concurrency:2,outputLocation:path.join(out,`${id}.mp4`)});console.log(id,'internal calibration rendered');}}finally{await browser.close({silent:true});}
