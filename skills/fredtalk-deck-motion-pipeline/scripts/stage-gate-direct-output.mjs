import {readFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {dirname, resolve, extname} from 'node:path';
import {frameRate, mediaGeometryFailures} from './stage-gate-media.mjs';

const text = x => typeof x === 'string' && x.trim().length > 0;
const range = x => Array.isArray(x) && x.length === 2 && x.every(Number.isInteger) && x[0] >= 0 && x[1] > x[0];
const inside = (a,b) => range(a) && range(b) && a[0] >= b[0] && a[1] <= b[1];
const covers = (spans,target) => {let end=target[0];for(const span of spans.filter(range).sort((a,b)=>a[0]-b[0])){if(span[0]>end)break;if(span[1]>end)end=span[1];}return end>=target[1];};
const digest = bytes => `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
const sameSpec = (a,b) => ['width','height','fps'].every(k=>a?.[k]===b?.[k]);

// This branch records a request to export, not a statement that the user viewed
// a sample. The final output still needs post-render media-integrity checks.
export function verifyDirectOutput({approval, approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures}) {
 const fail = message => failures.push(`direct-output: ${message}`);
 const load = (ref,parent,label) => {
  if(!text(ref?.path)||!/^sha256:[a-f0-9]{64}$/.test(ref?.checksum??'')){fail(`${label} needs a real path/checksum`);return null;}
  try{const path=resolve(dirname(parent),ref.path),bytes=readFileSync(path);if(digest(bytes)!==ref.checksum){fail(`${label} checksum mismatch`);return null;}return {path,bytes};}catch(e){fail(`${label} cannot be read: ${e.message}`);return null;}
 };
 const json = (artifact,label) => {try{return JSON.parse(artifact.bytes);}catch{fail(`${label} must be JSON`);return null;}};
 const decision = (value,label) => {
  if(!text(value?.decisionQuote)||value?.decisionContext?.source!=='conversation'||!text(value?.decisionContext?.reference))fail(`${label} needs its real quote and conversation reference`);
  const time=Date.parse(value?.decidedAt);
  if(!['message-time','recorded-at'].includes(value?.timeMeaning)||!text(value?.decidedAt)||!/(?:Z|[+-]\d{2}:\d{2})$/.test(value.decidedAt)||!Number.isFinite(time)||time>Date.now()+60000)fail(`${label} needs an honest timestamp and timeMeaning`);
 };
 if(contract?.deliveryProfile!=='standalone-video')fail('direct export currently applies to explicit standalone-video contracts');
 if(approval.contractChecksum!==contractChecksum)fail('authorization is stale for the current contract');
 if(['approvedBy','approvedAt','status','previewFiles','qualityChecks','baselineAcceptance'].some(k=>Object.hasOwn(approval,k)))fail('do not mix sample acceptance fields into direct output authorization');
 const spans=pages.map(p=>[p.startFrame,p.startFrame+p.durationInFrames]);
 if(!spans.length||spans.some(s=>!range(s))){fail('contract needs explicit valid global scene frame ranges');return;}
 const whole=[Math.min(...spans.map(s=>s[0])),Math.max(...spans.map(s=>s[1]))];
 if(!covers(spans,whole))fail('delivery scope has unexplained scene gaps');
 const fps=frameRate(contract.timelineFps),spec=contract.outputSpec;
 if(!Number.isFinite(fps)||!Number.isInteger(spec?.width)||spec.width<=0||!Number.isInteger(spec?.height)||spec.height<=0||spec?.fps!==fps)fail('contract needs real outputSpec width/height/fps and timelineFps');
 const auth=approval.authorization;
 decision(auth,'authorization');
 if(auth?.action!=='direct-output'||auth?.directExportAuthorized!==true)fail('authorization must identify the direct-output action');
 // Authorization semantics are assessed from the actual conversation by the agent.
 // A phrase regex cannot authenticate consent or safely classify cross-message context.
 if(!range(auth?.frameRange)||auth.frameRange.some((n,i)=>n!==whole[i])||!Array.isArray(auth?.pageIds)||auth.pageIds.length!==pages.length||auth.pageIds.some((id,i)=>id!==pages[i].stableId))fail('authorization scope must exactly match the current ordered delivery');
 if(!sameSpec(auth?.outputSpec,spec))fail('authorized output specification differs from the current contract');
 const limited=approval.reviewPolicy?.mode==='limited-by-user';
 if(approval.reviewPolicy?.mode&&!['standard','limited-by-user'].includes(approval.reviewPolicy.mode))fail('unknown review policy');
 if(limited){decision(approval.reviewPolicy,'limited review');if(approval.reviewPolicy.creativeReviewSkippedByUser!==true)fail('limited review requires creativeReviewSkippedByUser=true from the actual conversation');}
 const artifact=load(approval.internalReview,approvalPath,'internal review');
 const review=artifact&&json(artifact,'internal review');if(!review)return;
 const reviewedAt=Date.parse(review.reviewedAt);
 if(review.reviewedBy!=='agent'||review.contractChecksum!==contractChecksum||review.sourceTreeChecksum!==sourceTreeChecksum||!Number.isFinite(reviewedAt)||reviewedAt>Date.now()+60000)fail('internal review is stale or does not identify current agent review');
 const actual=[];
 if(!Array.isArray(review.previewFiles)||(!limited&&!review.previewFiles.length))fail('standard internal review needs available current preview/still evidence');
 for(const [i,media] of (review.previewFiles??[]).entries()){
  if(!inside(media?.frameRange,whole)){fail(`preview ${i} range is outside delivery`);continue;}
  const m=load(media,artifact.path,`preview ${i}`);if(!m)continue;
  if(Number.isFinite(reviewedAt)&&statSync(m.path).mtimeMs>reviewedAt+1)fail(`preview ${i} is newer than internal review`);
  const still=/\.(?:png|jpe?g|webp)$/i.test(extname(m.path));
  const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate,nb_frames,duration','-of','json',m.path],{encoding:'utf8'});
  if(probe.status!==0){fail(`preview ${i} cannot be probed`);continue;}
  try{const stream=JSON.parse(probe.stdout).streams?.[0];for(const problem of mediaGeometryFailures(stream,contract,{nativeFps:!still}))fail(`preview ${i}: ${problem}`);
   if(still){if(media.frameRange[1]-media.frameRange[0]!==1)fail(`preview ${i} still must represent exactly one frame`);}else{const duration=Number(stream.nb_frames)/frameRate(stream.r_frame_rate);const expected=(media.frameRange[1]-media.frameRange[0])/fps;if(!Number.isFinite(duration)||Math.abs(duration-expected)>0.00001)fail(`preview ${i} duration does not cover its declared range`);}
   actual.push(media);
  }catch{fail(`preview ${i} invalid media metadata`);}
 }
 const checked={technical:[],visual:[],pending:[]};
 for(const [i,check] of (review.checks??[]).entries()){
  if(!['technical','visual'].includes(check?.kind)||!inside(check?.frameRange,whole)||!text(check?.method)||!text(check?.findings)){fail(`check ${i} needs kind/range/method/findings`);continue;}
  if(check.result==='pending'&&check.kind==='visual'&&limited){checked.pending.push(check.frameRange);continue;}
  if(check.result!=='pass'){fail(`check ${i} ${check.kind} must pass before export`);continue;}
  if(!Array.isArray(check.evidence)||!check.evidence.length){fail(`check ${i} needs actual evidence`);continue;}
  let valid=true;
  for(const [j,ref] of check.evidence.entries()){
   const e=load(ref,artifact.path,`check ${i} evidence ${j}`),report=e&&json(e,'evidence report');
   if(!report||report.contractChecksum!==contractChecksum||report.sourceTreeChecksum!==sourceTreeChecksum||!inside(check.frameRange,report.frameRange)||!inside(report.frameRange,whole)||!text(report.method)||!text(report.findings)){fail(`check ${i} evidence is stale or does not cover the checked scope`);valid=false;continue;}
   const refs=report.previewFiles;
   if(!Array.isArray(refs)||(!refs.length&&!(limited&&check.kind==='technical'))||refs.some(r=>!actual.some(a=>a.checksum===r?.checksum&&JSON.stringify(a.frameRange)===JSON.stringify(r?.frameRange)))){fail(`check ${i} evidence does not bind current preview hashes/ranges`);valid=false;}
   if(check.kind==='visual'&&!covers((refs??[]).map(r=>r?.frameRange),check.frameRange)){fail(`check ${i} visual evidence does not cover the claimed viewing`);valid=false;}
  }
  if(valid)checked[check.kind].push(check.frameRange);
 }
 if(!covers(checked.technical,whole))fail('complete delivery scope needs technical preflight evidence');
 if(!covers(limited?[...checked.visual,...checked.pending]:checked.visual,whole))fail('visual review must cover the delivery; only explicit limited review may record pending regions');
}
