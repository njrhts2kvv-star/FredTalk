#!/usr/bin/env node
import assert from 'node:assert/strict';
import {existsSync, mkdtempSync, mkdirSync, readFileSync, unlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

if (existsSync('[LOCAL_PATH]')) {
  process.env.PATH = `[LOCAL_PATH]}`;
}

const validator = resolve(import.meta.dirname, 'validate-stage-gate.mjs');
const gateRunner = resolve(import.meta.dirname, 'run-stage-gate.mjs');
const root = mkdtempSync(join(tmpdir(), 'fredtalk-stage-gates-'));
const sourceDir = join(root, 'src');
mkdirSync(sourceDir);
const refsDir = join(root, 'refs');
mkdirSync(refsDir);
for (const id of ['a', 'b', 'c', 'd', 'e', 'f']) writeFileSync(join(refsDir, `${id}.png`), `reference-${id}`);
const manifestPath = join(root, 'deck.manifest.json');

const basePage = (id, layoutFamily, cueFrame, durationInFrames) => ({
  stableId: id,
  sourceBeatIds: [`beat-${id}`],
  scriptAnchor: `script ${id}`,
  exactScreenWords: [id === 'f' ? '这是一条用于验证长句代表页覆盖范围的完整上屏文字' : `word ${id}`],
  oneQuestion: `question ${id}`,
  layoutFamily,
  majorGeometry: `${layoutFamily}-geometry`,
  readingOrder: [`word ${id}`],
  visualCenter: `word ${id}`,
  styleTrack: 'fred-type',
  mediaRole: 'none',
  referenceImages: [],
  finalFrameReference: {path: `refs/${id}.png`, checksum: `sha256:${createHash('sha256').update(`reference-${id}`).digest('hex')}`},
  typographyRoles: [{role: 'hero', text: id === 'f' ? '这是一条用于验证长句代表页覆盖范围的完整上屏文字' : `word ${id}`, sizeClass: 'xl'}],
  connectorType: 'semantic-line',
  pathTopology: `${layoutFamily}-path`,
  spokenOrder: [`beat-${id}`],
  timingSource: 'transcript-cue',
  motionEvents: [{sourceBeatId: `beat-${id}`, event: `show ${id}`, cueFrame}],
  noFade: true,
  primaryMotion: 'mask-reveal',
  durationInFrames,
  finalHoldFrames: 60,
  implementationComponentId: `component-${layoutFamily}`,
  background: id.charCodeAt(0) % 2 ? 'black' : 'white',
});

const goodPages = [
    basePage('a', 'vertical-stack', 12, 252),
    basePage('b', 'zigzag', 18, 276),
    basePage('c', 'grid-2x2', 24, 300),
    basePage('d', 'branch', 30, 330),
    basePage('e', 'horizontal-compare', 36, 360),
    basePage('f', 'loop', 42, 390),
];
const manifestBody = JSON.stringify({pages: goodPages.map(({stableId, sourceBeatIds}) => ({stableId, sourceBeatIds}))});
writeFileSync(manifestPath, manifestBody);
const manifestChecksum = `sha256:${createHash('sha256').update(manifestBody).digest('hex')}`;
const good = {
  contractVersion: 1,
  productionSourceDir: 'src',
  runtimeSource: {type: 'manifest-derived', sourcePath: 'deck.manifest.json', checksum: manifestChecksum},
  pages: goodPages,
};
const contract = join(root, 'contract.json');
const prompt = join(root, 'direction-prompt.md');
const approval = join(root, 'preview-approval.json');
writeFileSync(contract, JSON.stringify(good, null, 2));
writeFileSync(prompt, good.pages.map((page) => `${page.stableId}\n${page.exactScreenWords.join(' / ')}`).join('\n\n'));
const previewPath = join(root, 'preview-reel.mp4');
const ffmpeg = spawnSync('ffmpeg', ['-loglevel', 'error', '-f', 'lavfi', '-i', 'color=black:s=1920x1080:r=30:d=0.2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', previewPath], {encoding: 'utf8'});
assert.equal(ffmpeg.status, 0, `ffmpeg fixture failed: ${ffmpeg.stderr}`);
const previewChecksum = `sha256:${createHash('sha256').update(readFileSync(previewPath)).digest('hex')}`;
const contractChecksum = `sha256:${createHash('sha256').update(readFileSync(contract)).digest('hex')}`;
writeFileSync(approval, JSON.stringify({
  status: 'approved',
  approvedBy: 'user',
  approvedAt: new Date(Date.now() + 1000).toISOString(),
  representativePages: ['a', 'b', 'c', 'd', 'e', 'f'],
  coverage: ['black', 'white', 'vertical', 'grid', 'curve', 'branch', 'long-copy'],
  contractChecksum,
  previewFiles: [{path: 'preview-reel.mp4', checksum: previewChecksum}],
  qualityChecks: {typography: true, layoutDiversity: true, spokenTiming: true, noFade: true, finalFrame: true},
}, null, 2));
writeFileSync(join(sourceDir, 'pages.tsx'), 'export const PageA = () => <div style={{clipPath: mask}}>A</div>;\n');

const receipts = {
  direction: join(root, 'direction-receipt.json'),
  motion: join(root, 'motion-receipt.json'),
  render: join(root, 'render-receipt.json'),
  formal: join(root, 'formal-receipt.json'),
};
const previousStage = {motion: 'direction', render: 'motion', formal: 'render'};
const run = (stage, extra = []) => {
  const chain = previousStage[stage] ? ['--previous-receipt', receipts[previousStage[stage]]] : [];
  return spawnSync(process.execPath, [validator, '--stage', stage, '--contract', contract, '--prompt', prompt, ...chain, '--receipt-out', receipts[stage], ...extra], {encoding: 'utf8'});
};

for (const stage of ['direction', 'motion', 'render']) {
  const result = run(stage, stage === 'render' ? ['--source-dir', sourceDir] : []);
  assert.equal(result.status, 0, `${stage} should pass:\n${result.stdout}\n${result.stderr}`);
}
{
  const bypass = join(sourceDir, 'Bypass.tsx');
  writeFileSync(bypass, "const previews = [{id: 'x', words: ['x']}]; const View=({p}) => <div style={{opacity:p}}>x</div>;\n");
  const result = run('render', ['--source-dir', sourceDir]);
  assert.notEqual(result.status, 0, 'render must reject renamed page registries and renamed opacity progress');
  unlinkSync(bypass);
  run('render', ['--source-dir', sourceDir]);
}
{
  const tampered = structuredClone(good);
  tampered.runtimeSource.checksum = 'sha256:stale';
  writeFileSync(contract, JSON.stringify(tampered, null, 2));
  const result = run('motion');
  assert.notEqual(result.status, 0, 'motion must reject a stale or invented manifest checksum');
  writeFileSync(contract, JSON.stringify(good, null, 2));
}
{
  writeFileSync(join(refsDir, 'a.png'), 'changed-reference');
  const result = run('motion');
  assert.notEqual(result.status, 0, 'motion must reject a stale final-frame reference checksum');
  writeFileSync(join(refsDir, 'a.png'), 'reference-a');
}
{
  const result = run('formal', ['--source-dir', sourceDir, '--approval', approval]);
  assert.equal(result.status, 0, `formal should pass with explicit representative approval:\n${result.stdout}\n${result.stderr}`);
}

const bad = structuredClone(good);
bad.runtimeSource = {type: 'handwritten-page-data', sourcePath: 'src/data.ts', checksum: 'sha256:legacy'};
for (const page of bad.pages) {
  page.layoutFamily = 'horizontal-compare';
  page.majorGeometry = 'left-right';
  page.durationInFrames = 360;
  page.timingSource = 'fixed-default';
  page.noFade = false;
}
writeFileSync(contract, JSON.stringify(bad, null, 2));
writeFileSync(join(sourceDir, 'data.ts'), "export const pages = [{kind: 'swap'}];\n");
writeFileSync(join(sourceDir, 'DeckPage.tsx'), 'const Word=({progress}) => <div style={{opacity:progress}}>x</div>;\n');

for (const stage of ['direction', 'motion', 'render']) {
  const result = run(stage, stage === 'render' ? ['--source-dir', sourceDir] : []);
  assert.notEqual(result.status, 0, `${stage} must block legacy behavior`);
}
{
  const result = run('formal', ['--source-dir', sourceDir]);
  assert.notEqual(result.status, 0, 'formal must block 4K without user preview approval');
}

const sentinel = join(root, 'command-ran.txt');
const directionReceipt = receipts.direction;
{
  const result = spawnSync(process.execPath, [gateRunner, '--stage', 'direction', '--action', 'direction-check', '--contract', contract, '--prompt', prompt, '--receipt-out', directionReceipt, '--', process.execPath, '-e', `require('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'ran')`], {encoding: 'utf8'});
  assert.notEqual(result.status, 0, 'failed gate must not execute the production command');
  assert.equal(spawnSync('test', ['-e', sentinel]).status, 1, 'blocked command created an output');
}
writeFileSync(contract, JSON.stringify(good, null, 2));
{
  const result = spawnSync(process.execPath, [gateRunner, '--stage', 'direction', '--action', 'direction-check', '--contract', contract, '--prompt', prompt, '--receipt-out', directionReceipt, '--', process.execPath, '-e', `require('node:fs').writeFileSync(${JSON.stringify(sentinel)}, 'ran')`], {encoding: 'utf8'});
  assert.equal(result.status, 0, `passed gate should execute the command:\n${result.stdout}\n${result.stderr}`);
  assert.equal(spawnSync('test', ['-e', sentinel]).status, 0, 'allowed command did not run');
  assert.equal(spawnSync('test', ['-e', directionReceipt]).status, 0, 'direction receipt was not written before the command');
}
{
  const mismatchSentinel = join(root, 'formal-command-ran.txt');
  const result = spawnSync(process.execPath, [gateRunner, '--stage', 'direction', '--action', 'direction-check', '--contract', contract, '--prompt', prompt, '--receipt-out', directionReceipt, '--', process.execPath, '-e', `require('node:fs').writeFileSync(${JSON.stringify(mismatchSentinel)}, 'render:4k60')`, 'render:4k60'], {encoding: 'utf8'});
  assert.notEqual(result.status, 0, 'direction gate must not be usable to launch a formal 4K command');
  assert.equal(spawnSync('test', ['-e', mismatchSentinel]).status, 1, 'mismatched formal command executed');
}

console.log('PASS: stage gates reject the legacy pattern and accept the guarded contract');
