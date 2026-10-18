// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';import fs from 'node:fs';import path from 'node:path';
import {bundle} from '@remotion/bundler';import {openBrowser,selectComposition,renderStill} from '@remotion/renderer';
process.chdir(path.dirname(fileURLToPath(import.meta.url)));
const request=process.argv.slice(2);const sets=request.length?[[request[0],request[1],Number(request[2]||170)]]:[['B064','产品',140]];
const candidates=JSON.parse(fs.readFileSync('src/font-candidates.json','utf8')).filter(c=>!request[4]||c.family===request[4]);
const serveUrl=await bundle({entryPoint:path.resolve('src/font-probe-entry.tsx'),publicDir:path.resolve('public')});const browser=await openBrowser('chrome');
try{for(const [id,text,size]of sets){const out=path.resolve(`../../analysis/${id}/${request[3]||"font-proof"}`);fs.mkdirSync(out,{recursive:true});for(const c of candidates){const coverage=JSON.parse(execFileSync(path.resolve('../../analysis/tools/font-coverage'),[path.resolve('public',c.file),text],{encoding:'utf8'}));fs.writeFileSync(path.join(out,c.family+'-coverage.json'),JSON.stringify(coverage,null,2));if(!coverage.supported){console.log(id,c.family,'excluded: missing glyphs');continue;}const inputProps={family:c.family,text,size};const composition=await selectComposition({serveUrl,id:'FontProbe',inputProps,puppeteerInstance:browser});await renderStill({serveUrl,composition,inputProps,puppeteerInstance:browser,output:path.join(out,c.family+'.png')});}console.log(id,'font candidates rendered')}}finally{await browser.close({silent:true});if(path.basename(serveUrl).startsWith('remotion-webpack-bundle-'))fs.rmSync(serveUrl,{recursive:true,force:true});}
