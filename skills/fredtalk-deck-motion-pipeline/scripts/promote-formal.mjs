#!/usr/bin/env node
import {createHash} from 'node:crypto';
import {copyFile, mkdir, readFile, rename, rm, stat} from 'node:fs/promises';
import {basename, dirname, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const help = `Usage: node promote-formal.mjs --contract <json> --staging <dir> --formal <dir>
  --deck-public <dir> --qc-report <json> --formal-receipt <json>
  [--poster-dir <dir>] [--ffmpeg <binary>]

Requires a current formal gate receipt plus four independent PASS results. All
incoming files and posters are prepared before destination files are renamed.`;
const args = process.argv.slice(2);
const value = (name, fallback) => { const i=args.indexOf(name); return i>=0?args[i+1]:fallback; };
if (args.includes('--help') || args.includes('-h')) { console.log(help); process.exit(0); }
const required = ['--contract','--staging','--formal','--deck-public','--qc-report','--formal-receipt'];
if (required.some((x) => !value(x))) { console.error(help); process.exit(2); }
const contractPath=resolve(value('--contract')); const staging=resolve(value('--staging')); const formal=resolve(value('--formal')); const deck=resolve(value('--deck-public')); const qcPath=resolve(value('--qc-report')); const receiptPath=resolve(value('--formal-receipt'));
const posterDir=value('--poster-dir')?resolve(value('--poster-dir')):undefined; const ffmpeg=value('--ffmpeg','ffmpeg');
const contractBody=await readFile(contractPath,'utf8'); const contract=JSON.parse(contractBody); const qc=JSON.parse(await readFile(qcPath,'utf8')); const receipt=JSON.parse(await readFile(receiptPath,'utf8'));
if (qc.verdict!=='PASS') throw new Error('QC report is not PASS');
for (const check of ['encodingQc','visualFidelityQc','scriptTimingQc','userAcceptance']) {
  if (qc[check]?.verdict!=='PASS') throw new Error(`${check} is not PASS`);
}
if (!qc.contract || resolve(qc.contract)!==contractPath) throw new Error('QC report contract mismatch');
if (!qc.input || resolve(qc.input)!==staging) throw new Error('QC report staging mismatch');
const contractChecksum=`sha256:${createHash('sha256').update(contractBody).digest('hex')}`;
if (qc.contractChecksum!==contractChecksum) throw new Error('QC report contract checksum mismatch');
if (receipt.verdict!=='PASS'||receipt.stage!=='formal'||receipt.contractChecksum!==contractChecksum) throw new Error('formal gate receipt is missing or stale');
const age=Date.now()-new Date(qc.generatedAt).getTime(); if (!Number.isFinite(age)||age>24*60*60*1000) throw new Error('QC report is stale (>24h)');
const pages=contract.pages.filter((p)=>!p.exclude);
const hash=async(file)=>createHash('sha256').update(await readFile(file)).digest('hex');
const prepared=[];
const prepareCopy=async(source,destination)=>{
  await stat(source); await mkdir(dirname(destination),{recursive:true});
  const incoming=`${destination}.incoming-${process.pid}`; await rm(incoming,{force:true}); await copyFile(source,incoming);
  const [a,b]=await Promise.all([hash(source),hash(incoming)]); if(a!==b) throw new Error(`copy hash mismatch: ${source}`);
  prepared.push({source,destination,incoming,hash:a,type:'video'});
};

try {
  for (const page of pages) {
    const source=resolve(staging,page.outputFile); const finalName=page.formalFile??basename(page.outputFile); const deckName=page.deckMapping?.file??finalName;
    await prepareCopy(source,resolve(formal,finalName)); await prepareCopy(source,resolve(deck,deckName));
    if (posterDir) {
      const posterName=page.deckMapping?.poster??deckName.replace(/\.mp4$/i,'.jpg'); const destination=resolve(posterDir,posterName);
      await mkdir(dirname(destination),{recursive:true}); const incoming=`${destination}.incoming-${process.pid}.jpg`; await rm(incoming,{force:true});
      const run=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',source,'-frames:v','1','-q:v','2',incoming],{encoding:'utf8'});
      if(run.status!==0) throw new Error(`poster failed ${page.stableId}: ${run.stderr}`);
      prepared.push({source,destination,incoming,hash:await hash(incoming),type:'poster'});
    }
  }
  for (const item of prepared) await rename(item.incoming,item.destination);
} catch (error) {
  await Promise.all(prepared.map((x)=>rm(x.incoming,{force:true}).catch(()=>undefined))); throw error;
}
const videos=prepared.filter((x)=>x.type==='video');
for (let i=0;i<videos.length;i+=2) {
  const pair=videos.slice(i,i+2); if(pair.length===2 && pair[0].hash!==pair[1].hash) throw new Error(`formal/deck hash mismatch: ${pair[0].source}`);
}
console.log(JSON.stringify({verdict:'PASS',promotedPages:pages.length,written:prepared.length,formal,deck,posterDir},null,2));
