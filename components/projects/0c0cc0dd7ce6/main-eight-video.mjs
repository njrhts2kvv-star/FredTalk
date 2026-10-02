import fs from 'node:fs';import path from 'node:path';
import {bundle} from '@remotion/bundler';import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
const ids=process.argv.slice(2);if(!ids.length)throw new Error('Composition IDs required');
const serveUrl=await bundle({entryPoint:path.resolve('src/main-eight-entry.tsx'),publicDir:path.resolve('public')});const browser=await openBrowser('chrome');
try{for(const id of ids){const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser});const out=path.resolve(`../../analysis/${id.slice(0,4)}/calibration-video`);fs.mkdirSync(out,{recursive:true});await renderMedia({serveUrl,composition,puppeteerInstance:browser,codec:'h264',muted:true,concurrency:2,outputLocation:path.join(out,id+'.mp4')});console.log(id,'local calibration rendered')}}finally{await browser.close({silent:true});if(path.basename(serveUrl).startsWith('remotion-webpack-bundle-'))fs.rmSync(serveUrl,{recursive:true,force:true});}
