#!/usr/bin/env node
import {existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const help = `Usage: node qc-ffprobe.mjs --input <dir> --contract <json> [options]
Options: --mode draft|formal  --ffprobe <binary>  --report <json>  --allow-extra`;
const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; };
if (args.includes('--help') || args.includes('-h')) { console.log(help); process.exit(0); }
const input = value('--input'); const contractFile = value('--contract');
if (!input || !contractFile) { console.error(help); process.exit(2); }
const mode = value('--mode', 'formal');
const ffprobe = value('--ffprobe', 'ffprobe');
const contract = JSON.parse(readFileSync(resolve(contractFile), 'utf8'));
const profile = contract.render?.[mode] ?? contract.render ?? (mode === 'formal'
  ? {width:3840,height:2160,fps:60,videoCodec:'h264',pixelFormat:'yuv420p',colorSpace:'bt709',audioCodec:'aac'}
  : {width:1920,height:1080,fps:60,videoCodec:'h264',pixelFormat:'yuv420p',audioCodec:'aac'});
const collect = (dir) => existsSync(dir) ? readdirSync(dir,{withFileTypes:true}).flatMap((e) => e.isDirectory() ? collect(resolve(dir,e.name)) : (/\.mp4$/i.test(e.name) ? [resolve(dir,e.name)] : [])) : [];
const files = collect(resolve(input)).sort();
const pages = contract.pages.filter((p) => !p.exclude);
const byName = new Map(pages.map((p) => [basename(p.outputFile), p]));
const report = []; let failed = false;
const fpsNumber = (text) => { const [a,b='1'] = String(text ?? '').split('/').map(Number); return b ? a/b : 0; };

for (const file of files) {
  const page = byName.get(basename(file));
  if (!page && !args.includes('--allow-extra')) { failed = true; report.push({file,status:'FAIL',errors:['not in contract']}); continue; }
  if (!page) continue;
  const run = spawnSync(ffprobe,['-v','error','-show_entries','stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,color_space,color_transfer,color_primaries,color_range,duration,nb_frames:format=duration','-of','json',file],{encoding:'utf8'});
  if (run.status !== 0) { failed=true; report.push({file,status:'FAIL',errors:[run.stderr.trim() || 'ffprobe failed']}); continue; }
  const metadata = JSON.parse(run.stdout); const video = metadata.streams?.find((s) => s.codec_type === 'video'); const audio = metadata.streams?.find((s) => s.codec_type === 'audio');
  const expectedFrames = Math.round(Number(page.durationSeconds) * Number(profile.fps));
  const duration = Number(video?.duration ?? metadata.format?.duration ?? 0);
  const errors = [];
  if (video?.width !== Number(profile.width) || video?.height !== Number(profile.height)) errors.push(`dimensions ${video?.width}x${video?.height}`);
  if (Math.abs(fpsNumber(video?.r_frame_rate)-Number(profile.fps)) > 0.001) errors.push(`fps ${video?.r_frame_rate}`);
  if (video?.codec_name !== (profile.videoCodec ?? 'h264')) errors.push(`video codec ${video?.codec_name}`);
  if (video?.pix_fmt !== (profile.pixelFormat ?? 'yuv420p')) errors.push(`pixel format ${video?.pix_fmt}`);
  if (profile.colorSpace && video?.color_space !== profile.colorSpace) errors.push(`color space ${video?.color_space}`);
  if (profile.colorTransfer && video?.color_transfer !== profile.colorTransfer) errors.push(`color transfer ${video?.color_transfer}`);
  if (profile.colorPrimaries && video?.color_primaries !== profile.colorPrimaries) errors.push(`color primaries ${video?.color_primaries}`);
  if (!audio || audio.codec_name !== (profile.audioCodec ?? 'aac')) errors.push(`audio codec ${audio?.codec_name ?? 'missing'}`);
  if (Number(video?.nb_frames) && Number(video.nb_frames) !== expectedFrames) errors.push(`frames ${video.nb_frames} expected ${expectedFrames}`);
  if (Math.abs(duration - expectedFrames/Number(profile.fps)) > 0.035) errors.push(`duration ${duration} expected ${expectedFrames/Number(profile.fps)}`);
  if (errors.length) failed = true;
  report.push({stableId:page.stableId,file,status:errors.length?'FAIL':'PASS',errors,expectedFrames,duration,metadata});
  console.log(`[ffprobe] ${errors.length?'FAIL':'PASS'} ${page.stableId} ${basename(file)}`);
}
for (const page of pages) if (!files.some((f) => basename(f) === basename(page.outputFile))) { failed=true; report.push({stableId:page.stableId,file:page.outputFile,status:'FAIL',errors:['missing file']}); }
const output = {verdict:failed?'FAIL':'PASS',mode,profile,contract:resolve(contractFile),input:resolve(input),generatedAt:new Date().toISOString(),report};
const reportPath = resolve(value('--report', resolve(input, 'qc-ffprobe.json')));
mkdirSync(dirname(reportPath),{recursive:true}); writeFileSync(reportPath,`${JSON.stringify(output,null,2)}\n`);
console.log(`[ffprobe] ${output.verdict} report ${reportPath}`); if (failed) process.exitCode=1;
