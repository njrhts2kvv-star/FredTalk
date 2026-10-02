import {readFileSync, statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {mediaGeometryFailures} from './stage-gate-media.mjs';
import {verifyDirectOutput} from './stage-gate-direct-output.mjs';
import {verifyBoundedRevision} from './stage-gate-bounded-revision.mjs';

const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;

export const verifyFormalApproval = ({approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures, warnings = []}) => {
  if (!approvalPath) {
    failures.push('formal render requires a representative preview approval file');
    return;
  }
  let approval;
  try {
    approval = JSON.parse(readFileSync(resolve(approvalPath), 'utf8'));
  } catch (error) {
    failures.push(`approval cannot be read: ${error.message}`);
    return;
  }
  if (!approval || typeof approval !== 'object' || Array.isArray(approval)) {
    failures.push('approval must be a JSON object');
    return;
  }
  const kind = approval.approvalKind ?? 'preview-acceptance';
  if (kind === 'direct-output') {
    verifyDirectOutput({approval, approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures});
    return;
  }
  if (kind === 'bounded-revision') {
    verifyBoundedRevision({approval, approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures});
    return;
  }
  if (kind !== 'preview-acceptance') {
    failures.push(`unsupported approvalKind: ${kind}`);
    return;
  }
  if (approval.status !== 'approved' || approval.approvedBy !== 'user' || !nonEmpty(approval.approvedAt)) failures.push('approval must identify an explicit user decision and time');
  const approvalTime = Date.parse(approval.approvedAt);
  if (!Number.isFinite(approvalTime) || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(approval.approvedAt ?? '')) failures.push('approval time must be a valid ISO date with timezone');
  if (Number.isFinite(approvalTime) && approvalTime > Date.now() + 60000) failures.push('approval time must not be in the future beyond clock tolerance');
  if (approval.contractChecksum !== contractChecksum) failures.push('approval is not bound to the current contract checksum');
  const representatives = approval.representativePages;
  if (!Array.isArray(representatives) || !representatives.length || representatives.some((id) => !pages.some((page) => page.stableId === id))) failures.push('representative preview pages must map to contract stableIds');

  const representativeContracts = pages.filter((page) => representatives?.includes(page.stableId));
  const coverageOf = selected => {
  const derivedCoverage = new Set();
  selected.forEach((page) => {
    if (page.background === 'black' || page.background === 'white') derivedCoverage.add(page.background);
    if (Array.isArray(page.backgroundStates)) {
      page.backgroundStates.filter((state) => state === 'black' || state === 'white').forEach((state) => derivedCoverage.add(state));
    }
    const geometry = `${page.layoutFamily} ${page.majorGeometry} ${page.pathTopology}`.toLowerCase();
    if (/vertical|stack/.test(geometry)) derivedCoverage.add('vertical');
    if (/grid/.test(geometry)) derivedCoverage.add('grid');
    if (/curve|circle|loop|zigzag|圆形/.test(geometry)) derivedCoverage.add('curve');
    if (/branch/.test(geometry)) derivedCoverage.add('branch');
    if ((page.exactScreenWords ?? []).join('').length >= 20) derivedCoverage.add('long-copy');
  });
  return derivedCoverage;
  };
  const derivedCoverage = coverageOf(representativeContracts);
  const standalone = contract?.deliveryProfile === 'standalone-video';
  const allCoverage = ['black', 'white', 'vertical', 'grid', 'curve', 'branch', 'long-copy'];
  const declaredCoverage = contract?.formalCoverageRequired;
  const requiredCoverage = Array.isArray(declaredCoverage) && declaredCoverage.length
    ? declaredCoverage
    : standalone ? [...coverageOf(pages)] : allCoverage;
  if (requiredCoverage.some((item) => !allCoverage.includes(item))) failures.push(`formalCoverageRequired contains unsupported coverage; allowed: ${allCoverage.join(', ')}`);
  if (requiredCoverage.some((item) => !derivedCoverage.has(item))) failures.push(`representative page contracts do not cover ${requiredCoverage.join(', ')}`);
  if (!Array.isArray(approval.coverage) || requiredCoverage.some((item) => !approval.coverage.includes(item))) failures.push(`approval coverage must include ${requiredCoverage.join(', ')}`);

  if (!Array.isArray(approval.previewFiles) || !approval.previewFiles.length) {
    failures.push('approval must list reviewed preview files with checksums');
  } else {
    approval.previewFiles.forEach((preview, index) => verifyPreview({preview, index, approvalPath, approvalTime, failures, contract, warnings}));
  }
  const requiredChecks = standalone ? [...(pages.some(page => page.exactScreenWords?.length) ? ['typography'] : []), 'spokenTiming', 'finalFrame', 'motionClarity'] : ['typography', 'layoutDiversity', 'spokenTiming', 'noFade', 'finalFrame'];
  if (standalone && approval.qualityChecks?.layout !== true && approval.qualityChecks?.layoutDiversity !== true) failures.push('preview checks must pass actual layout review');
  if (requiredChecks.some((checkName) => approval.qualityChecks?.[checkName] !== true)) failures.push(`preview checks must pass ${requiredChecks.join(', ')}`);
};

const verifyPreview = ({preview, index, approvalPath, approvalTime, failures, contract, warnings}) => {
  if (!nonEmpty(preview?.path) || !nonEmpty(preview?.checksum)) {
    failures.push(`previewFiles[${index}] needs path and checksum`);
    return;
  }
  const previewPath = resolve(dirname(resolve(approvalPath)), preview.path);
  try {
    const stats = statSync(previewPath);
    const checksum = `sha256:${createHash('sha256').update(readFileSync(previewPath)).digest('hex')}`;
    if (checksum !== preview.checksum) failures.push(`previewFiles[${index}] checksum mismatch`);
    // Copies/restores can change mtime without changing the actually accepted bytes.
    // Preserve the real historical decision; never refresh it to fit filesystem metadata.
    if (checksum === preview.checksum && Number.isFinite(approvalTime) && approvalTime < stats.mtimeMs) warnings.push(`previewFiles[${index}] mtime is later than approval; matching accepted bytes may have been copied/restored, so keep the historical acceptance time`);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', previewPath], {encoding: 'utf8'});
    if (probe.status !== 0) failures.push(`previewFiles[${index}] ffprobe failed`);
    else {
      const stream = JSON.parse(probe.stdout)?.streams?.[0];
      for (const problem of mediaGeometryFailures(stream, contract)) failures.push(`previewFiles[${index}]: ${problem}`);
    }
  } catch (error) {
    failures.push(`previewFiles[${index}] cannot be verified: ${error.message}`);
  }
};
