#!/usr/bin/env node
import {readFileSync, readdirSync, realpathSync, statSync, writeFileSync} from 'node:fs';
import {resolve, join, extname, dirname, relative} from 'node:path';
import {createHash} from 'node:crypto';
import {verifyFormalApproval} from './stage-gate-formal.mjs';
import {validateMotionContract} from './validate-motion-contract.mjs';
import {reviewMotionSources} from './review-motion-source.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const stage = argValue('--stage');
const contractPath = argValue('--contract');
const sourceDir = argValue('--source-dir');
const approvalPath = argValue('--approval');
const promptPath = argValue('--prompt');
const previousReceiptPath = argValue('--previous-receipt');
const receiptOutPath = argValue('--receipt-out');
const jsonOutput = args.includes('--json');
const stages = ['direction', 'motion', 'render', 'formal'];

if (!stages.includes(stage) || !contractPath) {
  console.error('Usage: node validate-stage-gate.mjs --stage <direction|motion|render|formal> --contract <json> [--source-dir <dir>] [--approval <json>] [--json]');
  process.exit(2);
}

const failures = [];
const warnings = [];
const readJson = (path, label) => {
  try {
    return JSON.parse(readFileSync(resolve(path), 'utf8'));
  } catch (error) {
    failures.push(`${label} cannot be read: ${error.message}`);
    return null;
  }
};
const nonEmpty = (value) => typeof value === 'string' && value.trim().length > 0;
const stringArray = (value) => Array.isArray(value) && value.length > 0 && value.every(nonEmpty);
const contract = readJson(contractPath, 'contract');
const contractChecksum = contract ? `sha256:${createHash('sha256').update(readFileSync(resolve(contractPath))).digest('hex')}` : null;
const standalone = contract?.deliveryProfile === 'standalone-video';
const pages = Array.isArray(contract?.pages) ? contract.pages.filter((page) => !page?.exclude) : [];
let promptChecksum = null;
let sourceTreeChecksum = null;
const pageLabel = (page, index) => page?.stableId ? `page ${page.stableId}` : `pages[${index}]`;
const requireField = (page, index, field, predicate = nonEmpty) => {
  if (!predicate(page?.[field])) failures.push(`${pageLabel(page, index)}: ${field} missing or invalid`);
};

const validateDirection = () => {
  if (contract) failures.push(...validateMotionContract(contract, contractPath));
  if (!pages.length) failures.push('contract.pages must contain active pages');
  const seen = new Set();
  for (const [index, page] of pages.entries()) {
    for (const field of ['stableId', 'scriptAnchor', 'oneQuestion', 'layoutFamily', 'majorGeometry', 'visualCenter', 'styleTrack', 'mediaRole']) {
      requireField(page, index, field);
    }
    for (const field of ['sourceBeatIds', 'readingOrder']) requireField(page, index, field, stringArray);
    requireField(page, index, 'exactScreenWords', value => Array.isArray(value) && (standalone || value.length > 0) && value.every(nonEmpty));
    if (seen.has(page.stableId)) failures.push(`duplicate stableId: ${page.stableId}`);
    seen.add(page.stableId);
    const refs = page.referenceImages;
    if (!Array.isArray(refs)) {
      failures.push(`${pageLabel(page, index)}: referenceImages must be an array`);
    } else {
      if (refs.length > 2) failures.push(`${pageLabel(page, index)}: referenceImages exceeds 2`);
      refs.forEach((ref, refIndex) => {
        if (!nonEmpty(ref?.path) || !nonEmpty(ref?.responsibility)) {
          failures.push(`${pageLabel(page, index)}: referenceImages[${refIndex}] needs path and one responsibility`);
        }
      });
    }
    if (page.mediaRole === 'real-evidence' && ['generated', 'ai-generated', 'layout-proxy'].includes(page.assetSourceKind)) {
      failures.push(`${pageLabel(page, index)}: real-evidence cannot use generated or proxy media`);
    }
  }

  if (!standalone && pages.length >= 4) {
    const counts = new Map();
    pages.forEach((page) => counts.set(page.layoutFamily, (counts.get(page.layoutFamily) ?? 0) + 1));
    for (const [family, count] of counts) {
      if (count / pages.length > 0.5) failures.push(`layoutFamily ${family} occupies ${count}/${pages.length}; maximum is 50%`);
    }
    for (let index = 2; index < pages.length; index += 1) {
      const run = pages.slice(index - 2, index + 1);
      const sameFamily = run.every((page) => page.layoutFamily === run[0].layoutFamily);
      const intentionalRepeat = run.every((page) => nonEmpty(page.repeatGroup) && page.repeatGroup === run[0].repeatGroup);
      if (sameFamily && !intentionalRepeat) failures.push(`three consecutive pages reuse layoutFamily ${run[0].layoutFamily} without one repeatGroup`);
    }
  }
  if (!promptPath) {
    failures.push('direction and downstream gates require --prompt');
  } else {
    try {
      const promptBody = readFileSync(resolve(promptPath), 'utf8');
      promptChecksum = `sha256:${createHash('sha256').update(promptBody).digest('hex')}`;
      for (const [index, page] of pages.entries()) {
        if (!promptBody.includes(page.stableId)) failures.push(`${pageLabel(page, index)}: prompt is missing stableId`);
        for (const words of page.exactScreenWords ?? []) {
          if (!promptBody.includes(words)) failures.push(`${pageLabel(page, index)}: prompt is missing exact screen words: ${words}`);
        }
      }
      const forbiddenPromptPatterns = [
        /所有页面.{0,12}(统一|都).{0,12}(左右|左侧|右侧)/,
        /(?:所有页面|全部页面|每一页).{0,12}(?:统一|固定).{0,8}(?:字号|坐标|线型)/,
        /每页.{0,8}(左图右文|左文右图)/,
      ];
      if (!standalone && forbiddenPromptPatterns.some((pattern) => pattern.test(promptBody))) failures.push('prompt globally locks layout, coordinates, typography or line style');
    } catch (error) {
      failures.push(`prompt cannot be read: ${error.message}`);
    }
  }
};

const validateMotion = () => {
  validateDirection();
  if (contract?.runtimeSource?.type !== 'manifest-derived') {
    failures.push('runtimeSource.type must be manifest-derived; handwritten page data is forbidden');
  }
  if (!nonEmpty(contract?.runtimeSource?.sourcePath) || !nonEmpty(contract?.runtimeSource?.checksum)) {
    failures.push('runtimeSource needs sourcePath and checksum');
  } else {
    const factSource = resolve(dirname(resolve(contractPath)), contract.runtimeSource.sourcePath);
    try {
      const factBody = readFileSync(factSource);
      const actual = `sha256:${createHash('sha256').update(factBody).digest('hex')}`;
      if (actual !== contract.runtimeSource.checksum) failures.push('runtimeSource checksum does not match the manifest-derived fact source');
      const manifest = JSON.parse(factBody.toString('utf8'));
      const manifestPages = Array.isArray(manifest.pages) ? manifest.pages.filter((page) => page && !page.exclude && !page.retired) : [];
      if (manifestPages.length !== pages.length) failures.push('production contract page count does not match the complete active Manifest');
      const count = Math.max(manifestPages.length, pages.length);
      for (let index = 0; index < count; index += 1) {
        const manifestPage = manifestPages[index];
        const contractPage = pages[index];
        if (manifestPage?.stableId !== contractPage?.stableId) failures.push(`page order/stableId differs from Manifest at index ${index}`);
        if (JSON.stringify(manifestPage?.sourceBeatIds ?? []) !== JSON.stringify(contractPage?.sourceBeatIds ?? [])) failures.push(`sourceBeatIds differ from Manifest at index ${index}`);
      }
    } catch (error) {
      failures.push(`runtimeSource fact source cannot be read: ${error.message}`);
    }
  }
  const durations = [];
  for (const [index, page] of pages.entries()) {
    if (!nonEmpty(page?.finalFrameReference?.path) || !nonEmpty(page?.finalFrameReference?.checksum)) {
      failures.push(`${pageLabel(page, index)}: finalFrameReference path/checksum required`);
    } else {
      try {
        const refPath = resolve(dirname(resolve(contractPath)), page.finalFrameReference.path);
        const refChecksum = `sha256:${createHash('sha256').update(readFileSync(refPath)).digest('hex')}`;
        if (refChecksum !== page.finalFrameReference.checksum) failures.push(`${pageLabel(page, index)}: finalFrameReference checksum mismatch`);
      } catch (error) {
        failures.push(`${pageLabel(page, index)}: finalFrameReference cannot be read: ${error.message}`);
      }
    }
    const roles = page.typographyRoles;
    if (!Array.isArray(roles) || (!roles.length && (!standalone || (page.exactScreenWords?.length ?? 0) > 0)) || roles.some((role) => !nonEmpty(role?.role) || !nonEmpty(role?.text) || !nonEmpty(role?.sizeClass))) {
      failures.push(`${pageLabel(page, index)}: typographyRoles must define role/text/sizeClass`);
    } else {
      const roleText = roles.map((role) => role.text).join('\n');
      for (const words of page.exactScreenWords ?? []) {
        if (!roleText.includes(words)) failures.push(`${pageLabel(page, index)}: typographyRoles do not cover exact screen words: ${words}`);
      }
    }
    for (const field of ['connectorType', 'pathTopology', 'timingSource', 'primaryMotion', 'implementationComponentId']) {
      requireField(page, index, field);
    }
    requireField(page, index, 'spokenOrder', stringArray);
    if (JSON.stringify(page.spokenOrder ?? []) !== JSON.stringify(page.sourceBeatIds ?? [])) failures.push(`${pageLabel(page, index)}: spokenOrder must preserve sourceBeatIds order`);
    if (!standalone && page.noFade !== true) failures.push(`${pageLabel(page, index)}: noFade must be true`);
    if (!['transcript-cue', 'audio-timecode', 'approved-manual-cue'].includes(page.timingSource)) {
      failures.push(`${pageLabel(page, index)}: timingSource must bind to transcript/audio/approved cue`);
    }
    if (!Array.isArray(page.motionEvents) || !page.motionEvents.length) {
      failures.push(`${pageLabel(page, index)}: motionEvents required`);
    } else {
      let previousCue = -1;
      page.motionEvents.forEach((event, eventIndex) => {
        if (!nonEmpty(event?.sourceBeatId) || !nonEmpty(event?.event) || (!Number.isInteger(event?.cueFrame) || event.cueFrame < 0)) {
          failures.push(`${pageLabel(page, index)}: motionEvents[${eventIndex}] needs sourceBeatId/event/cueFrame`);
        }
        if (!page.sourceBeatIds?.includes(event?.sourceBeatId)) failures.push(`${pageLabel(page, index)}: motionEvents[${eventIndex}] sourceBeatId is not owned by the page`);
        if (Number(event?.cueFrame) < previousCue) failures.push(`${pageLabel(page, index)}: motionEvents cueFrame order is invalid`);
        previousCue = Number(event?.cueFrame);
      });
    }
    if (!(Number(page.durationInFrames) > 0)) failures.push(`${pageLabel(page, index)}: durationInFrames must be > 0`);
    else durations.push(Number(page.durationInFrames));
    const globalClock = page.startFrame !== undefined;
    if (globalClock && (!Number.isInteger(page.startFrame) || page.startFrame < 0)) failures.push(`${pageLabel(page, index)}: startFrame must be a nonnegative integer`);
    const sceneStart = globalClock ? Number(page.startFrame) : 0;
    const sceneEnd = sceneStart + Number(page.durationInFrames);
    if (!Number.isInteger(page.finalHoldFrames) || page.finalHoldFrames < (standalone ? 0 : 1)) failures.push(`${pageLabel(page, index)}: finalHoldFrames must be ${standalone ? 'a nonnegative integer' : '> 0'}`);
    for (const event of page.motionEvents ?? []) if (event?.cueFrame < sceneStart || event?.cueFrame >= sceneEnd) failures.push(`${pageLabel(page, index)}: cueFrame is outside its declared scene range`);
    const lastCue = Math.max(...(page.motionEvents ?? []).map((event) => Number(event.cueFrame)).filter(Number.isFinite), 0);
    if (sceneEnd < lastCue + Number(page.finalHoldFrames)) failures.push(`${pageLabel(page, index)}: durationInFrames does not leave the declared final hold after the last cue`);
    const motionCount = 1 + (nonEmpty(page.secondaryMotion) ? 1 : 0) + (Array.isArray(page.additionalMotions) ? page.additionalMotions.length : 0);
    if (!standalone && motionCount > 2) failures.push(`${pageLabel(page, index)}: maximum is one primary and one secondary motion`);
  }
  if (!standalone && durations.length >= 4 && new Set(durations).size === 1) {
    failures.push('all pages use one fixed duration; derive duration from spoken cues');
  }
};

const sourceFiles = (dir) => {
  const result = [];
  const walk = (current) => {
    for (const name of readdirSync(current)) {
      if (['node_modules', 'dist', 'build', '.git', 'staging'].includes(name)) continue;
      const path = join(current, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (['.js', '.jsx', '.mjs', '.ts', '.tsx', '.css'].includes(extname(path))) result.push(path);
    }
  };
  walk(resolve(dir));
  return result;
};

const validateRender = () => {
  validateMotion();
  if (!sourceDir) {
    failures.push('render/formal gate requires --source-dir');
    return;
  }
  let files = [];
  try {
    if (!nonEmpty(contract?.productionSourceDir)) {
      failures.push('contract.productionSourceDir is required');
    } else {
      const boundSource = realpathSync(resolve(dirname(resolve(contractPath)), contract.productionSourceDir));
      const requestedSource = realpathSync(resolve(sourceDir));
      if (boundSource !== requestedSource) failures.push('source-dir does not match contract.productionSourceDir');
    }
    files = sourceFiles(sourceDir);
    const treeHash = createHash('sha256');
    for (const file of [...files].sort()) {
      treeHash.update(relative(resolve(sourceDir), file));
      treeHash.update(readFileSync(file));
    }
    sourceTreeChecksum = `sha256:${treeHash.digest('hex')}`;
  } catch (error) {
    failures.push(`source-dir cannot be scanned: ${error.message}`);
    return;
  }
  failures.push(...reviewMotionSources(files,resolve(sourceDir),contract.motionSourceReviews??[], {enforceVisualDefaults: !standalone}));
  if (standalone) warnings.push('Standalone appearance is assessed against its current scene decisions; opacity, layout frequency and motion counts are not blanket blockers.');
};

const validateFormal = () => {
  validateRender();
  verifyFormalApproval({approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures, warnings});
};

if (stage === 'direction') validateDirection();
if (stage === 'motion') validateMotion();
if (stage === 'render') validateRender();
if (stage === 'formal') validateFormal();

const requiredPrevious = {motion: 'direction', render: 'motion', formal: 'render'}[stage];
if (requiredPrevious) {
  if (!previousReceiptPath) {
    failures.push(`${stage} requires the ${requiredPrevious} receipt`);
  } else {
    const previous = readJson(previousReceiptPath, 'previous receipt');
    if (previous) {
      if (previous.verdict !== 'PASS' || previous.stage !== requiredPrevious) failures.push(`previous receipt must be a PASS for ${requiredPrevious}`);
      if (previous.contractChecksum !== contractChecksum) failures.push('previous receipt contract checksum is stale');
      if (previous.promptChecksum !== promptChecksum) failures.push('previous receipt prompt checksum is stale');
      if (requiredPrevious === 'render' && previous.sourceTreeChecksum !== sourceTreeChecksum) failures.push('render receipt source tree checksum is stale');
    }
  }
}
if (!receiptOutPath) failures.push(`${stage} requires --receipt-out so the next stage can prove ordering`);

const result = {
  verdict: failures.length ? 'FAIL' : 'PASS',
  stage,
  activePageCount: pages.length,
  failures: [...new Set(failures)],
  warnings,
};
if (!result.failures.length) {
  const receipt = {
    verdict: 'PASS',
    stage,
    createdAt: new Date().toISOString(),
    contractChecksum,
    manifestChecksum: contract?.runtimeSource?.checksum ?? null,
    promptChecksum,
    sourceTreeChecksum,
  };
  writeFileSync(resolve(receiptOutPath), `${JSON.stringify(receipt, null, 2)}\n`);
}
console.log(jsonOutput ? JSON.stringify(result, null, 2) : `${result.verdict} ${stage}: ${result.activePageCount} pages, ${result.failures.length} blockers`);
if (!jsonOutput) result.failures.forEach((failure) => console.log(`BLOCK ${failure}`));
if (result.failures.length) process.exitCode = 1;
