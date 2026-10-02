#!/usr/bin/env node
import assert from 'node:assert/strict';
import {mkdtempSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import {verifyFormalApproval} from './stage-gate-formal.mjs';

const root = mkdtempSync(join(tmpdir(), 'fredtalk-bounded-revision-'));
const hash = (path) => `sha256:${createHash('sha256').update(readFileSync(path)).digest('hex')}`;
const ref = (name) => ({path: name, checksum: hash(join(root, name))});
const write = (name, data) => writeFileSync(join(root, name), JSON.stringify(data, null, 2));
const makeMedia = (name, size, frames, color) => {
  const result = spawnSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `color=${color}:s=${size}:r=60`, '-frames:v', String(frames), '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', join(root, name)], {encoding: 'utf8'});
  assert.equal(result.status, 0, `fixture failed: ${result.stderr}`);
};

try {
  makeMedia('accepted-a.mp4', '3840x2160', 30, 'black');
  makeMedia('accepted-b.mp4', '3840x2160', 30, 'white');
  makeMedia('patch-a.mp4', '1920x1080', 6, 'gray');
  makeMedia('patch-b.mp4', '1920x1080', 6, 'blue');
  makeMedia('patch-a-4k.mp4', '3840x2160', 6, 'gray');
  makeMedia('seam.mp4', '1920x1080', 2, 'gray');
  const sourceTreeChecksum = `sha256:${'2'.repeat(64)}`;
  const contract = {timelineFps: 60, pages: [{stableId: 'a', startFrame: 0, durationInFrames: 30}, {stableId: 'b', startFrame: 30, durationInFrames: 30}]};
  const contractChecksum = `sha256:${'1'.repeat(64)}`;
  const mediaRef = (name, frameRange) => ({...ref(name), frameRange});
  const goodEvidence = {contractChecksum, sourceTreeChecksum, frameRange: [0, 60], previewFiles: [mediaRef('patch-a.mp4', [9, 15]), mediaRef('patch-b.mp4', [39, 45]), mediaRef('seam.mp4', [29, 31])], method: 'synthetic test evidence', changedFrames: [10, 14, 40, 44], preservedPixelError: 0, seamFrames: [29, 30]};
  write('visual-evidence.json', goodEvidence);
  const at = new Date().toISOString();
  const check = (kind, frameRange) => ({kind, frameRange, method: 'native-frame playback and ROI comparison', result: 'pass', findings: 'Fixture frame states match expected change/preserve boundaries.', evidence: [ref('visual-evidence.json')]});
  const goodBaseline = {
    status: 'accepted', acceptedBy: 'user', scope: 'complete', decisionQuote: '这两段完整视频我都看了，非常不错。', acceptedAt: at, timeMeaning: 'recorded-at', timelineFps: 60,
    files: [mediaRef('accepted-a.mp4', [0, 30]), mediaRef('accepted-b.mp4', [30, 60])],
  };
  const goodReview = {
    reviewedBy: 'agent', reviewedAt: at, contractChecksum, sourceTreeChecksum,
    // No full-length rerender: two six-frame patches and a two-frame delivery seam.
    previewFiles: [mediaRef('patch-a.mp4', [9, 15]), mediaRef('patch-b.mp4', [39, 45]), mediaRef('seam.mp4', [29, 31])],
    checks: [check('changed-range', [10, 14]), check('changed-range', [40, 44]), check('preserved-range', [0, 10]), check('preserved-range', [14, 40]), check('preserved-range', [44, 60]), ...[10, 14, 30, 40, 44].map((frame) => check('seam', [frame - 1, frame + 1]))],
  };
  const goodApproval = {
    approvalKind: 'bounded-revision', contractChecksum,
    revision: {action: 'bounded-revision-direct-export', directExportAuthorized: true, decisionQuote: '以上两处改好后直接输出最终4K60视频，不用再次确认。', decisionContext: {source: 'conversation', reference: 'test user message containing the two requested fixes and direct-delivery instruction'}, decidedAt: at, timeMeaning: 'recorded-at', changes: [{pageId: 'a', frameRange: [10, 14], change: 'Fix card font weight'}, {pageId: 'b', frameRange: [40, 44], change: 'Keep background geometry while foreground enters'}]},
  };
  let count = 0;
  const run = (name, mutate, expected) => {
    const state = {approval: structuredClone(goodApproval), baseline: structuredClone(goodBaseline), review: structuredClone(goodReview), contract: structuredClone(contract), evidence: structuredClone(goodEvidence)};
    mutate?.(state);
    write('visual-evidence.json', state.evidence);
    for (const check of state.review.checks) if (check?.evidence) check.evidence = [ref('visual-evidence.json')];
    state.review.reviewedAt = state.reviewTime ?? new Date().toISOString();
    write('baseline.json', state.baseline);
    write('review.json', state.review);
    state.approval.baselineAcceptance = ref('baseline.json');
    state.approval.internalReview = ref('review.json');
    if (state.tamperBaselineHash) state.approval.baselineAcceptance.checksum = `sha256:${'0'.repeat(64)}`;
    write('approval.json', state.approval);
    const failures = [];
    verifyFormalApproval({approvalPath: join(root, 'approval.json'), contractChecksum, sourceTreeChecksum, contract: state.contract, pages: state.contract.pages, failures});
    if (expected) assert.ok(failures.some((failure) => expected.test(failure)), `${name}: expected ${expected}; got ${JSON.stringify(failures)}`);
    else assert.deepEqual(failures, [], `${name}: ${failures.join('; ')}`);
    count++;
  };

  run('complete accepted 4K baseline plus local native-fps previews', null);
  run('already available current 4K preview needs no extra 1080 copy', ({review,evidence}) => { review.previewFiles[0] = mediaRef('patch-a-4k.mp4', [9,15]); evidence.previewFiles[0] = mediaRef('patch-a-4k.mp4', [9,15]); });
  run('no explicit direct export', ({approval}) => { approval.revision.decisionQuote = '开始制作吧'; }, /not only a production request/);
  run('ordinary delivery wording accepted with actual authorization context', ({approval}) => { approval.revision.decisionQuote = '改完后输出第二段给我'; });
  run('missing structured direct authorization', ({approval}) => { delete approval.revision.directExportAuthorized; }, /directExportAuthorized=true/);
  run('missing conversation reference', ({approval}) => { delete approval.revision.decisionContext; }, /conversation context reference/);
  run('negative export quote cannot exploit final keyword', ({approval}) => { approval.revision.decisionQuote = '不要直接输出最终视频，先给我预览。'; }, /contradicts direct export/);
  run('wait for approval cannot exploit 4K keyword', ({approval}) => { approval.revision.decisionQuote = '先不要导出4K，等我确认。'; }, /contradicts direct export/);
  run('English explicit negative export rejected', ({approval}) => { approval.revision.decisionQuote = 'Do not export the final video; wait for my confirmation.'; }, /contradicts direct export/);
  run('no direct-export action', ({approval}) => { delete approval.revision.action; }, /explicit bounded-revision-direct-export/);
  run('incomplete viewed baseline', ({baseline}) => { baseline.files.pop(); }, /do not completely cover/);
  run('inflated baseline range', ({baseline}) => { baseline.files = [{...baseline.files[0], frameRange: [0, 60]}]; }, /media duration does not cover/);
  run('change crosses named page', ({approval}) => { approval.revision.changes[0].frameRange = [10, 31]; }, /inside its current pageId/);
  run('unknown changed page', ({approval}) => { approval.revision.changes[0].pageId = 'missing'; }, /inside its current pageId/);
  run('stale source review', ({review}) => { review.sourceTreeChecksum = `sha256:${'3'.repeat(64)}`; }, /review is stale/);
  run('stale contract review', ({review}) => { review.contractChecksum = `sha256:${'3'.repeat(64)}`; }, /review is stale/);
  run('stale preview bytes', ({review}) => { review.previewFiles[0].checksum = `sha256:${'3'.repeat(64)}`; }, /checksum mismatch/);
  run('current preview pretended user viewed', ({baseline, review}) => { baseline.files.push(review.previewFiles[0]); }, /cannot be reused as a user-viewed baseline/);
  run('current user approval fields mixed in', ({approval}) => { approval.approvedBy = 'user'; approval.previewFiles = []; }, /legacy preview approval fields/);
  run('agent review disguised as user', ({review}) => { review.reviewedBy = 'user'; }, /must identify agent review/);
  run('missing delivery-seam preview', ({review}) => { review.previewFiles.pop(); }, /previews must cover changes/);
  run('missing preserved regression', ({review}) => { review.checks = review.checks.filter((check) => check.kind !== 'preserved-range'); }, /preserved ranges lack/);
  run('booleans cannot replace evidence', ({review}) => { review.checks = [{kind: 'changed-range', frameRange: [0, 60], result: 'pass'}]; }, /evidence files/);
  run('baseline decision cannot be start work', ({baseline}) => { baseline.decisionQuote = '开始制作'; }, /not a production request/);
  run('restored identical baseline hash keeps historical acceptance date', ({baseline}) => { baseline.acceptedAt = '2000-01-01T00:00:00Z'; });
  run('current internal preview time still checked', (state) => { state.reviewTime = '2000-01-01T00:00:00Z'; }, /newer than its internal review/);
  run('stale evidence source remains invalid after refreshing outer hash', ({evidence}) => { evidence.sourceTreeChecksum = `sha256:${'4'.repeat(64)}`; }, /evidence report is stale/);
  run('stale evidence contract remains invalid after refreshing outer hash', ({evidence}) => { evidence.contractChecksum = `sha256:${'4'.repeat(64)}`; }, /evidence report is stale/);
  run('stale evidence preview hash remains invalid after refreshing outer hash', ({evidence}) => { evidence.previewFiles[0].checksum = `sha256:${'4'.repeat(64)}`; }, /does not bind actual current preview/);
  run('stale evidence preview range remains invalid after refreshing outer hash', ({evidence}) => { evidence.previewFiles[0].frameRange = [8, 14]; }, /does not bind actual current preview/);
  run('stale evidence report range remains invalid after refreshing outer hash', ({evidence}) => { evidence.frameRange = [0, 10]; }, /evidence report is stale/);
  run('baseline acceptance hash stale', (state) => { state.tamperBaselineHash = true; }, /baseline acceptance checksum mismatch/);
  run('timeline unit required', ({contract}) => { delete contract.timelineFps; }, /timelineFps/);
  run('one-frame missing motion cannot be padded by declaration', ({review}) => { review.previewFiles[0].frameRange = [9, 16]; }, /media duration does not cover/);
  run('date requires explicit timezone', ({baseline}) => { baseline.acceptedAt = '2026-09-09'; }, /real ISO/);
  run('malformed change becomes failure, not crash', ({approval}) => { approval.revision.changes[0] = null; }, /inside its current pageId/);
  run('malformed baseline media becomes failure, not crash', ({baseline}) => { baseline.files[0] = null; }, /frameRange is outside/);
  run('malformed check becomes failure, not crash', ({review}) => { review.checks[0] = null; }, /evidence files/);
  run('unknown approval kind rejected', ({approval}) => { approval.approvalKind = 'production-request'; }, /unsupported approvalKind/);
  console.log(`PASS: ${count} bounded-revision approval cases; complete 4K baseline, local previews and separate user/agent evidence verified`);
} finally {
  rmSync(root, {recursive: true, force: true});
}
