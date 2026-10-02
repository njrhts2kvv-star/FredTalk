#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

const help = `Usage: node validate-contract.mjs --contract <file> [--json]

Validates a generic FredTalk episode contract. Required top-level field: pages[].
Each non-excluded page needs stableId, scriptAnchor, durationSeconds, outputFile,
deckMapping.stableId, sourceBeatIds[], cues[].`;

const args = process.argv.slice(2);
const value = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
if (args.includes('--help') || args.includes('-h')) { console.log(help); process.exit(0); }
const contractPath = value('--contract');
if (!contractPath) { console.error(help); process.exit(2); }

let contract;
try { contract = JSON.parse(readFileSync(resolve(contractPath), 'utf8')); }
catch (error) { console.error(`FAIL cannot read contract: ${error.message}`); process.exit(1); }

const failures = [];
const warn = [];
const deliveryProfile = contract.deliveryProfile ?? 'deck';
if (!['deck', 'standalone-video'].includes(deliveryProfile)) failures.push('deliveryProfile must be deck or standalone-video');
const isDeck = deliveryProfile === 'deck';
const pages = Array.isArray(contract.pages) ? contract.pages : [];
if (!pages.length) failures.push('pages must be a non-empty array');
const unique = (field, values) => {
  const seen = new Set();
  for (const item of values.filter(Boolean)) {
    if (seen.has(item)) failures.push(`duplicate ${field}: ${item}`);
    seen.add(item);
  }
};

for (const [index, page] of pages.entries()) {
  const at = `pages[${index}]`;
  if (!page || typeof page !== 'object') { failures.push(`${at} must be an object`); continue; }
  if (!page.stableId || typeof page.stableId !== 'string') failures.push(`${at}.stableId missing`);
  if (page.exclude) continue;
  if (!page.scriptAnchor || typeof page.scriptAnchor !== 'string') failures.push(`${at}.scriptAnchor missing`);
  if (!Array.isArray(page.sourceBeatIds) || !page.sourceBeatIds.length) failures.push(`${at}.sourceBeatIds missing`);
  if (!(Number(page.durationSeconds) > 0)) failures.push(`${at}.durationSeconds must be > 0`);
  if (!page.outputFile || typeof page.outputFile !== 'string') failures.push(`${at}.outputFile missing`);
  if (isDeck && !page.deckMapping?.stableId) failures.push(`${at}.deckMapping.stableId missing`);
  if (!['black', 'white'].includes(page.background)) failures.push(`${at}.background must be black or white`);
  const expectedBadge = page.background === 'white' ? 'light' : 'dark';
  if (isDeck && page.pageRole === 'narrative-transition' && page.badgeVariant !== 'dark') failures.push(`${at}.narrative transition must use dark badge`);
  else if (page.badgeVariant && page.badgeVariant !== expectedBadge && !(deliveryProfile === 'standalone-video' && page.badgeVariant === 'none')) failures.push(`${at}.badgeVariant conflicts with background`);
  if (page.protected !== undefined && typeof page.protected !== 'boolean') failures.push(`${at}.protected must be boolean`);
  const cues = Array.isArray(page.cues) ? page.cues : [];
  if (!cues.length) failures.push(`${at}.cues missing`);
  let previous = -1;
  for (const [cueIndex, cue] of cues.entries()) {
    const prefix = `${at}.cues[${cueIndex}]`;
    const start = Number(cue.startSeconds);
    const end = Number(cue.endSeconds);
    if (!(start >= 0) || !(end > start)) failures.push(`${prefix} invalid range`);
    if (start < previous) failures.push(`${prefix} is not ordered`);
    if (end > Number(page.durationSeconds) + 1e-6) failures.push(`${prefix} exceeds page duration`);
    if (!cue.event || !cue.screenTarget) failures.push(`${prefix} needs event and screenTarget`);
    previous = start;
  }
  const firstCue = Number(cues[0]?.startSeconds);
  if (firstCue > 0.8 && !page.intentionalOpeningPause) warn.push(`${page.stableId}: first cue is ${firstCue}s; add transcript-derived pre-roll reaction`);
  const hold = Number(page.durationSeconds) - Number(cues.at(-1)?.endSeconds ?? page.durationSeconds);
  if (hold < 1 && !page.allowShortFinalHold) warn.push(`${page.stableId}: final hold is ${hold.toFixed(3)}s`);
}

unique('stableId', pages.map((p) => p?.stableId));
unique('outputFile', pages.filter((p) => !p?.exclude).map((p) => p?.outputFile));
unique('deckMapping.stableId', pages.filter((p) => !p?.exclude).map((p) => p?.deckMapping?.stableId));
const primaryBeats = pages.filter((p) => !p?.exclude && (p.sourceResponsibility ?? 'primary') === 'primary').flatMap((p) => p.sourceBeatIds ?? []);
unique('primary sourceBeatId', primaryBeats);
if (Array.isArray(contract.sourceBeatIds)) {
  const missing = contract.sourceBeatIds.filter((id) => !primaryBeats.includes(id));
  const extra = primaryBeats.filter((id) => !contract.sourceBeatIds.includes(id));
  if (missing.length) failures.push(`unowned sourceBeatIds: ${missing.join(', ')}`);
  if (extra.length) failures.push(`unknown primary sourceBeatIds: ${extra.join(', ')}`);
}

const result = {verdict: failures.length ? 'FAIL' : 'PASS', pageCount: pages.length, activePageCount: pages.filter((p) => !p.exclude).length, failures, warnings: warn};
console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : `${result.verdict}: ${result.activePageCount} active pages, ${failures.length} failures, ${warn.length} warnings`);
if (!args.includes('--json')) [...failures.map((x) => `ERROR ${x}`), ...warn.map((x) => `WARN ${x}`)].forEach((x) => console.log(x));
if (failures.length) process.exitCode = 1;
