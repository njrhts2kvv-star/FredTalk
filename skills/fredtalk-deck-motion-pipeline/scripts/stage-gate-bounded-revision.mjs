import {mediaGeometryFailures} from './stage-gate-media.mjs';
import {readFileSync, statSync, realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {dirname, resolve} from 'node:path';

const text = (value) => typeof value === 'string' && value.trim().length > 0;
const checksum = (value) => /^sha256:[a-f\d]{64}$/.test(value ?? '');
const range = (value) => Array.isArray(value) && value.length === 2 && value.every(Number.isInteger) && value[0] >= 0 && value[1] > value[0];
const inside = (a, b) => a[0] >= b[0] && a[1] <= b[1];
const merge = (ranges) => [...ranges].sort((a, b) => a[0] - b[0]).reduce((result, item) => {
  const last = result.at(-1);
  if (last && item[0] <= last[1]) last[1] = Math.max(last[1], item[1]);
  else result.push([...item]);
  return result;
}, []);
const covers = (ranges, target) => merge(ranges).some((item) => inside(target, item));
const subtract = (whole, changes) => {
  const result = [];
  let cursor = whole[0];
  for (const [start, end] of merge(changes)) {
    if (start > cursor) result.push([cursor, start]);
    cursor = Math.max(cursor, end);
  }
  if (cursor < whole[1]) result.push([cursor, whole[1]]);
  return result;
};

// This validates evidence identity, timeline coverage and authorization structure.
// It cannot authenticate a quoted chat message or judge the pixels in a review.
export const verifyBoundedRevision = ({approval, approvalPath, contractChecksum, sourceTreeChecksum, contract, pages, failures}) => {
  const fail = (message) => failures.push(`bounded revision: ${message}`);
  if (approval.contractChecksum !== contractChecksum) fail('current contract checksum mismatch');
  if (!checksum(sourceTreeChecksum)) fail('current source tree checksum is unavailable');
  // User-viewed files and current internal previews must never share a field.
  if ('previewFiles' in approval || 'approvedBy' in approval || 'approvedAt' in approval || 'qualityChecks' in approval) fail('legacy preview approval fields cannot be mixed into bounded-revision');

  const readArtifact = (ref, ownerPath, label, json = false) => {
    if (!text(ref?.path) || !checksum(ref?.checksum)) { fail(`${label} needs path and SHA256`); return null; }
    try {
      const path = realpathSync(resolve(dirname(ownerPath), ref.path));
      const bytes = readFileSync(path);
      if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== ref.checksum) { fail(`${label} checksum mismatch`); return null; }
      // ISO timestamps carry millisecond precision; APFS mtime can include
      // fractional milliseconds from the same write. Compare at equal precision.
      return {path, checksum: ref.checksum, mtime: Math.trunc(statSync(path).mtimeMs), data: json ? JSON.parse(bytes) : null};
    } catch (error) { fail(`${label} cannot be read: ${error.message}`); return null; }
  };
  const time = (value, label) => {
    const result = Date.parse(value);
    if (!text(value) || !/^\d{4}-\d{2}-\d{2}T.+(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(result) || result > Date.now() + 60000) fail(`${label} must be a real ISO decision/recording time, not a future date`);
    return result;
  };

  const pageRanges = pages.map((page) => ({id: page.stableId, span: [page.startFrame, page.startFrame + page.durationInFrames]}));
  if (!pageRanges.length || pageRanges.some((page) => !range(page.span))) { fail('contract pages need explicit integer startFrame and durationInFrames'); return; }
  const timeline = merge(pageRanges.map((page) => page.span));
  if (timeline.length !== 1) { fail('contract page timeline must be contiguous'); return; }
  const whole = timeline[0];

  const baselineFile = readArtifact(approval.baselineAcceptance, resolve(approvalPath), 'baseline acceptance', true);
  const reviewFile = readArtifact(approval.internalReview, resolve(approvalPath), 'internal review', true);
  if (!baselineFile || !reviewFile) return;
  const baseline = baselineFile.data, review = reviewFile.data;
  if (!baseline || typeof baseline !== 'object' || Array.isArray(baseline) || !review || typeof review !== 'object' || Array.isArray(review)) { fail('baseline acceptance and internal review must be JSON objects'); return; }
  if (baseline.status !== 'accepted' || baseline.acceptedBy !== 'user' || baseline.scope !== 'complete') fail('baseline must record user acceptance of a complete viewed delivery');
  if (!text(baseline.decisionQuote) || /^(?:开始制作|开始执行|开始吧|start(?:\s+(?:work|production))?)[。.!！\s]*$/i.test(baseline.decisionQuote.trim())) fail('baseline needs the actual acceptance quote, not a production request');
  const acceptedAt = time(baseline.acceptedAt, 'baseline acceptedAt');
  if (!['message-time', 'recorded-at'].includes(baseline.timeMeaning)) fail('baseline timeMeaning must distinguish message-time from recorded-at');
  const fps = contract?.timelineFps;
  if ((!Number.isFinite(fps) || fps <= 0) || baseline.timelineFps !== fps) { fail('current contract timelineFps must be positive and match the accepted baseline timeline'); return; }

  const revision = approval.revision;
  if (revision?.action !== 'bounded-revision-direct-export') fail('revision needs an explicit bounded-revision-direct-export decision');
  if (revision?.directExportAuthorized !== true) fail('revision must explicitly record directExportAuthorized=true from the real user decision');
  const quote = revision?.decisionQuote;
  if (!text(quote) || /^(?:(?:开始制作|开始执行|开始)(?:吧)?|start(?:\s+(?:work|production))?)[。.!！\s]*$/i.test(text(quote) ? quote.trim() : '')) fail('revision needs the actual direct-delivery decision quote, not only a production request');
  if (revision?.decisionContext?.source !== 'conversation' || !text(revision?.decisionContext?.reference)) fail('revision needs a conversation context reference for the quoted decision');
  // Structured authorization records human interpretation; keyword presence is
  // not authorization. Only reject obvious contradictions, without pretending
  // this small check can understand/authenticate every natural-language request.
  const decisionText = (text(quote) ? quote : '')
    .replace(/(?:不用|无需|不必|不需要|不要|别).{0,4}(?:等我|等待我|等我再次|等待我再次)?(?:再|再次)?(?:确认|审批|批准)/g, '')
    .replace(/(?:do not|don't|no need to)\s+(?:wait\s+for\s+)?(?:my\s+|further\s+)?(?:approval|confirmation)/gi, '');
  if (/(?:不要|先不|暂不|先别|别|不允许|不能).{0,8}(?:输出|导出|出片|交付)|(?:等|等待).{0,8}(?:确认|批准|认可)|(?:先|只).{0,6}(?:给我|看).{0,4}(?:预览|样片)|(?:do not|don't|must not|not yet)\s+(?:directly\s+)?(?:export|render|deliver|output)|\bwait.{0,20}(?:approval|confirmation|confirm)/i.test(decisionText)) fail('revision decision contradicts direct export by forbidding export or waiting for preview/approval');
  const decidedAt = time(revision?.decidedAt, 'revision decidedAt');
  if (!['message-time', 'recorded-at'].includes(revision?.timeMeaning)) fail('revision timeMeaning must distinguish message-time from recorded-at');
  if (Number.isFinite(acceptedAt) && Number.isFinite(decidedAt) && decidedAt < acceptedAt) fail('revision decision cannot predate baseline acceptance');
  const changes = [];
  if (!Array.isArray(revision?.changes) || !revision.changes.length) fail('revision changes must name bounded page/frame ranges');
  else for (const change of revision.changes) {
    const page = pageRanges.find((item) => item.id === change?.pageId);
    if (!page || !range(change?.frameRange) || !inside(change.frameRange, page.span) || !text(change.change)) fail('change must describe a valid frameRange inside its current pageId');
    else changes.push(change.frameRange);
  }
  if (!changes.length) return;

  const reviewedAt = time(review.reviewedAt, 'internal reviewedAt');
  if (review.contractChecksum !== contractChecksum || review.sourceTreeChecksum !== sourceTreeChecksum) fail('internal review is stale for the current contract/source tree');
  if (review.reviewedBy !== 'agent') fail('internal review must identify agent review, not current user acceptance');
  if (Number.isFinite(decidedAt) && Number.isFinite(reviewedAt) && reviewedAt < decidedAt) fail('internal review predates the revision decision');

  const media = (files, ownerPath, label, before, preview = false) => {
    const verified = [];
    if (!Array.isArray(files) || !files.length) { fail(`${label} must contain actual media files`); return verified; }
    for (const [index, file] of files.entries()) {
      if (!range(file?.frameRange) || !inside(file.frameRange, whole)) { fail(`${label}[${index}] frameRange is outside the current delivery`); continue; }
      const artifact = readArtifact(file, ownerPath, `${label}[${index}]`);
      if (!artifact) continue;
      // A recovered/copied baseline keeps its accepted content identity even if
      // its filesystem mtime changes. Never refresh the historical acceptedAt.
      if (preview && Number.isFinite(before) && artifact.mtime > before) fail(`${label}[${index}] is newer than its internal review`);
      const probe = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,nb_frames,duration', '-of', 'json', artifact.path], {encoding: 'utf8'});
      try {
        if (probe.status !== 0) throw new Error(probe.stderr || 'ffprobe failed');
        const stream = JSON.parse(probe.stdout)?.streams?.[0];
        const [num, den] = (stream?.r_frame_rate ?? '').split('/').map(Number);
        const actualFps = num / den;
        for (const problem of mediaGeometryFailures(stream, contract, {nativeFps: preview})) fail(`${label}[${index}]: ${problem}`);
        const duration = Number(stream?.nb_frames) > 0 ? Number(stream.nb_frames) / actualFps : Number(stream?.duration);
        const expected = (file.frameRange[1] - file.frameRange[0]) / fps;
        const tolerance = actualFps === fps ? 0.00001 : 1 / actualFps + 0.00001;
        if (!Number.isFinite(duration) || Math.abs(duration - expected) > tolerance) fail(`${label}[${index}] media duration does not cover its declared frameRange`);
        verified.push({...artifact, frameRange: file.frameRange});
      } catch (error) { fail(`${label}[${index}] probe failed: ${error.message}`); }
    }
    return verified;
  };
  const viewed = media(baseline.files, baselineFile.path, 'baseline files', acceptedAt);
  if (!covers(viewed.map((file) => file.frameRange), whole)) fail('viewed baseline files do not completely cover the current contract delivery');
  const previews = media(review.previewFiles, reviewFile.path, 'internal preview files', reviewedAt, true);
  if (previews.some((file) => viewed.some((old) => old.path === file.path || old.checksum === file.checksum))) fail('current internal preview cannot be reused as a user-viewed baseline');

  // Local previews are sufficient: cover changed motion plus both sides of each
  // change/delivery seam; unchanged areas use separately hashed regression evidence.
  const boundaries = [...new Set([...changes.flat(), ...viewed.flatMap((file) => file.frameRange)])].filter((frame) => frame > whole[0] && frame < whole[1]);
  const seams = boundaries.map((frame) => [frame - 1, frame + 1]);
  const previewRanges = previews.map((file) => file.frameRange);
  if ([...changes, ...seams].some((span) => !covers(previewRanges, span))) fail('internal native-fps previews must cover changes and both sides of every change/delivery seam');

  const checked = {'changed-range': [], 'preserved-range': [], seam: []};
  if (!Array.isArray(review.checks) || !review.checks.length) fail('internal review needs hashed changed/preserved/seam evidence, not booleans');
  else for (const [index, check] of review.checks.entries()) {
    if (!check || !Object.hasOwn(checked, check.kind) || !range(check.frameRange) || !inside(check.frameRange, whole) || !text(check.method) || !text(check.findings) || check.result !== 'pass' || !Array.isArray(check.evidence) || !check.evidence.length) { fail(`review checks[${index}] needs kind/range/method/findings/pass and evidence files`); continue; }
    const evidence = check.evidence.map((ref) => readArtifact(ref, reviewFile.path, `review checks[${index}] evidence report`, true));
    if (evidence.some((file) => file && Number.isFinite(reviewedAt) && file.mtime > reviewedAt)) fail(`review checks[${index}] evidence is newer than its review`);
    let bound = evidence.every(Boolean);
    for (const file of evidence.filter(Boolean)) {
      const report = file.data;
      if (!report || report.contractChecksum !== contractChecksum || report.sourceTreeChecksum !== sourceTreeChecksum || !range(report.frameRange) || !inside(check.frameRange, report.frameRange) || !inside(report.frameRange, whole)) { fail(`review checks[${index}] evidence report is stale or does not bind the current contract/source/range`); bound = false; continue; }
      const refs = report.previewFiles;
      if (!Array.isArray(refs) || !refs.length || refs.some((ref) => !checksum(ref?.checksum) || !range(ref?.frameRange) || !previews.some((preview) => preview.checksum === ref.checksum && preview.frameRange[0] === ref.frameRange[0] && preview.frameRange[1] === ref.frameRange[1]))) { fail(`review checks[${index}] evidence report does not bind actual current preview hashes/ranges`); bound = false; }
      else if (check.kind !== 'preserved-range' && !covers(refs.map((ref) => ref.frameRange), check.frameRange)) { fail(`review checks[${index}] evidence preview references do not cover the checked motion`); bound = false; }
    }
    if (check.attachments !== undefined && !Array.isArray(check.attachments)) fail(`review checks[${index}] attachments must be an array`);
    else for (const ref of check.attachments ?? []) readArtifact(ref, reviewFile.path, `review checks[${index}] attachment`);
    if (bound) checked[check.kind].push(check.frameRange);
  }
  if (changes.some((span) => !covers(checked['changed-range'], span))) fail('changed ranges lack current visual review evidence');
  if (subtract(whole, changes).some((span) => !covers(checked['preserved-range'], span))) fail('preserved ranges lack actual regression evidence');
  if (seams.some((span) => !covers(checked.seam, span))) fail('seams lack adjacent-frame/motion evidence');
};
