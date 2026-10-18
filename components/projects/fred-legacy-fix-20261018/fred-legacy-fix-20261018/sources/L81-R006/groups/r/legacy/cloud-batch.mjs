// FredTalk 2.5 distribution: fred-legacy-fix-20261018
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';

const project=process.cwd();
const jobs=JSON.parse(fs.readFileSync(path.join(project,'render-jobs.json'),'utf8'));
const root=path.resolve(project,jobs.rootRelative);
const browserCount=Number(process.env.RENDER_BROWSERS||4);
const concurrency=Number(process.env.RENDER_CONCURRENCY||2);
if(browserCount!==4||concurrency!==2)throw Error('This batch is pinned to 4 browsers × 2 concurrency');
const browserOptions={chromeMode:'chrome-for-testing',...(process.env.REMOTION_BROWSER?{browserExecutable:process.env.REMOTION_BROWSER}:{}),...(process.env.REMOTION_GL?{chromiumOptions:{gl:process.env.REMOTION_GL}}:{})};
const qc=path.join(root,'qc','cloud-jobs'),chunksRoot=path.join(root,'qc','cloud-chunks'),outputs=path.join(root,'outputs');
for(const dir of [qc,chunksRoot,outputs])fs.mkdirSync(dir,{recursive:true});
const save=(id,value)=>fs.writeFileSync(path.join(qc,id+'.json'),JSON.stringify(value,null,2)+'\n');
const sha=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
let browsers=[],serveUrl,failed=0;
try{
 serveUrl=await bundle({entryPoint:path.join(project,jobs.entry),publicDir:path.join(project,'public')});
 const opened=await Promise.allSettled(Array.from({length:browserCount},()=>openBrowser('chrome',browserOptions)));
 browsers=opened.filter(x=>x.status==='fulfilled').map(x=>x.value);
 const launchError=opened.find(x=>x.status==='rejected');if(launchError)throw launchError.reason;
 for(const job of jobs.items){
  const file=path.join(outputs,job.label+'.mp4');
  const record={label:job.label,compositionId:job.compositionId,project:jobs.project,status:'rendering',startedAt:new Date().toISOString(),expectedFrames:job.durationInFrames,configuration:{browsers:4,concurrencyPerBrowser:2,gl:process.env.REMOTION_GL||'default',codec:'h264',crf:15,audio:'none'}};save(job.label,record);
  try{
   const inputProps=job.inputProps||{};
   const composition=await selectComposition({serveUrl,id:job.compositionId,inputProps,puppeteerInstance:browsers[0],...browserOptions});
   for(const [name,actual,expected] of [['fps',composition.fps,60],['width',composition.width,1920],['height',composition.height,1080],['durationInFrames',composition.durationInFrames,job.durationInFrames]]){
    if(actual!==expected)throw Error(`${name} ${actual} != ${expected}`);
   }
   const chunkDir=path.join(chunksRoot,job.label);fs.mkdirSync(chunkDir,{recursive:true});
   const ranges=Array.from({length:browserCount},(_,i)=>({index:i,first:Math.floor(i*job.durationInFrames/browserCount),last:Math.floor((i+1)*job.durationInFrames/browserCount)-1}));
   if(ranges.some(x=>x.last<x.first))throw Error('Too few frames for four browsers');
   record.chunks=ranges;save(job.label,record);
   const renders=await Promise.allSettled(ranges.map(async(chunk,i)=>{
    const chunkPath=path.join(chunkDir,`chunk-${i}.mp4`);
    await renderMedia({composition,serveUrl,inputProps,frameRange:[chunk.first,chunk.last],outputLocation:chunkPath,codec:'h264',crf:15,pixelFormat:'yuv420p',imageFormat:'jpeg',jpegQuality:95,muted:true,concurrency,puppeteerInstance:browsers[i],...browserOptions});
    return chunkPath;
   }));
   const renderError=renders.find(x=>x.status==='rejected');if(renderError)throw renderError.reason;
   const parts=renders.map(x=>x.value);
   const concat=path.join(chunkDir,'concat.txt');
   fs.writeFileSync(concat,ranges.map((x,i)=>`file 'chunk-${i}.mp4'\nduration ${((x.last-x.first+1)/60).toFixed(9)}`).join('\n')+'\n');
   execFileSync('ffmpeg',['-nostdin','-v','error','-y','-f','concat','-safe','0','-i',concat,'-map','0:v:0','-an','-c:v','copy','-video_track_timescale','60000','-movflags','+faststart',file]);
   record.status='rendered';record.completedAt=new Date().toISOString();record.sha256=sha(file);record.bytes=fs.statSync(file).size;save(job.label,record);console.log('DONE',job.label,record.sha256);
  }catch(error){failed++;record.status='failed';record.error=String(error);record.failedAt=new Date().toISOString();save(job.label,record);console.error('FAILED',job.label,String(error));}
 }
}finally{
 await Promise.allSettled(browsers.map(b=>b.close({silent:true})));
 if(serveUrl&&path.basename(serveUrl).startsWith('remotion-webpack-bundle-'))await fs.promises.rm(serveUrl,{recursive:true,force:true});
}
if(failed)process.exitCode=1;
