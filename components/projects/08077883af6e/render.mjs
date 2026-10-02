import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {resolveRenderOptions} from './render-options.mjs';
const configPath=resolve(process.argv[2]??'render-job.json');
const c=JSON.parse(readFileSync(configPath,'utf8'));const root=dirname(configPath);
const path=p=>resolve(root,p);const now=()=>performance.now()/1000;const begin=now();
if(!c.composition||!c.entry||!c.publicDir)throw new Error('Missing composition, entry or publicDir');
if(!['external','none'].includes(c.audio?.mode))throw new Error('Explicit external or none audio mode required');
if(c.audio.mode==='external'&&(!c.audio.path||!Number.isFinite(c.audio.startSeconds)))throw new Error('External audio requires path and exact startSeconds');
const options=resolveRenderOptions(c);
const out=path(c.outputDir??'cloud-output');
if(existsSync(out))throw new Error('Output directory exists; choose a new directory');
mkdirSync(out,{recursive:true});
const chrome={...(options.browserExecutable?{browserExecutable:path(options.browserExecutable)}:{}),chromeMode:options.chromeMode,chromiumOptions:options.gl?{gl:options.gl}:{}};
const report={status:'running',startedAt:new Date().toISOString(),configuration:c,resolvedConfiguration:options,browsers:options.browsers,concurrency:options.concurrency};
const save=()=>writeFileSync(resolve(out,'result.json'),JSON.stringify(report,null,2));save();
const browsers=[];let chunks=[];
try {
 const serveUrl=await bundle({entryPoint:path(c.entry),publicDir:path(c.publicDir)});report.bundleSeconds=now()-begin;
 const readyStart=now();const browser=await openBrowser('chrome',{...chrome,forceDeviceScaleFactor:1});browsers.push(browser);
 let comp=await selectComposition({...chrome,serveUrl,id:c.composition,pupeteerInstance:browser,inputProps:c.inputProps??{}});
 if(c.width||c.height){if(!c.width||!c.height)throw new Error('Both width and height required');comp={...comp,width:c.width,height:c.height};}
 const [first,last]=c.frameRange??[0,comp.durationInFrames-1];
 if(!Number.isInteger(first)||!Number.isInteger(last)||first<0||last<first||last>=comp.durationInFrames)throw new Error('Invalid inclusive frameRange');
 const frames=last-first+1;const count=Math.min(options.browsers,frames);
 // Await every launch so that failed launches do not leave untracked browsers.
 const opened=await Promise.allSettled(Array.from({length:count-1},()=>openBrowser('chrome',{...chrome,forceDeviceScaleFactor:1})));
 for(const r of opened)if(r.status==='fulfilled')browsers.push(r.value);
 const failed=opened.find(r=>r.status==='rejected');if(failed)throw failed.reason;
 chunks=Array.from({length:count},(_,i)=>({index:i,first:first+Math.floor(i*frames/count),last:first+Math.floor((i+1)*frames/count)-1,file:resolve(out,`chunk-${i}.mp4`)}));
 report.video={width:comp.width,height:comp.height,fps:comp.fps,frames,duration:frames/comp.fps,first,last};report.chunks=chunks;
 report.browserPreparationSeconds=now()-readyStart;const renderStart=now();
 const completed=await Promise.allSettled(chunks.map(async(chunk,i)=>{
  let progressAt=0;const t=now();
  await renderMedia({...chrome,serveUrl,composition:comp,inputProps:c.inputProps??{},pupeteerInstance:browsers[i],frameRange:[chunk.first,chunk.last],outputLocation:chunk.file,concurrency:options.concurrency,timeoutInMilliseconds:120000,codec:'h264',crf:c.crf??15,pixelFormat:'yuv420p',imageFormat:'jpeg',jpegQuality:c.jpegQuality??95,muted:true,onProgress:p=>{if(now()-progressAt>20){progressAt=now();console.log(JSON.stringify({worker:i,rendered:p.renderedFrames,encoded:p.encodedFrames,elapsed:now()-renderStart}));}}});
  chunk.renderSeconds=now()-t;
 }));report.renderSeconds=now()-renderStart;
 const error=completed.find(r=>r.status==='rejected');if(error)throw error.reason;
 const muxStart=now();
 for(const chunk of chunks){
  chunk.videoOnly=resolve(out,`video-${chunk.index}.mp4`);
  execFileSync('ffmpeg',['-nostdin','-v','error','-y','-i',chunk.file,'-map','0:v:0','-an','-c:v','copy',chunk.videoOnly]);
 }
 // Basenames are generated internally and safe for the concat format.
 writeFileSync(resolve(out,'concat.txt'),chunks.map(x=>`file 'video-${x.index}.mp4'\nduration ${((x.last-x.first+1)/comp.fps).toFixed(9)}`).join('\n')+'\n');
 const args=['-nostdin','-v','error','-y','-f','concat','-safe','0','-i',resolve(out,'concat.txt')];
 if(c.audio.mode==='external')args.push('-ss',String(c.audio.startSeconds),'-i',path(c.audio.path),'-map','0:v:0','-map','1:a:0','-c:v','copy','-af',`apad=whole_dur=${frames/comp.fps}`,'-c:a','aac','-b:a','320k');
 else args.push('-map','0:v:0','-an','-c:v','copy');
 report.output=resolve(out,'video.mp4');args.push('-t',String(frames/comp.fps),'-video_track_timescale','60000','-movflags','+faststart',report.output);
 execFileSync('ffmpeg',args);report.muxSeconds=now()-muxStart;report.totalSeconds=now()-begin;report.status='rendered-awaiting-validation';save();console.log(JSON.stringify(report));
} catch(e){report.status='failed';report.error=String(e);report.totalSeconds=now()-begin;save();throw e;}
finally{await Promise.allSettled(browsers.map(b=>b.close({silent:true})));}
