/* Local DOM and persistence checks. Run with an existing Playwright installation. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const {pathToFileURL} = require('node:url');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');

(async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'segment-review-dom-'));
  const python = process.env.PYTHON || 'python3';
  const run = args => execFileSync(python, args, {encoding: 'utf8'});
  run([path.join(__dirname, 'test_segment_review.py'), '--write-fixture', folder]);
  const browser = await chromium.launch({headless: true});
  const context = await browser.newContext({viewport: {width: 1440, height: 1000}});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const entry = path.join(folder, 'index.html');
  const wait = () => page.waitForSelector('body[data-ready="true"]');
  try {
    await page.goto(pathToFileURL(entry).href);
    await wait();
    const suggestion = page.locator('tr[data-view="suggestion"][data-stable-id="scene-one"]');
    assert.equal(await suggestion.isVisible(), true);
    assert.equal(await suggestion.locator('input:checked').count(), 0);
    await suggestion.locator('.route-choice').selectOption('remotion');
    await suggestion.locator('input[value="option-a"]').check();
    await suggestion.locator('.decision').selectOption('keep');
    await suggestion.locator('.rich-feedback').fill('保留主体，下面的文字放大。');
    assert.equal(await suggestion.locator('.badge').textContent(), '保留主体，仍需修改');
    await page.locator('[data-filter="change"]').click();
    assert.equal(await suggestion.isVisible(), true);
    const screenshot = await page.screenshot();
    await suggestion.locator('input[type=file]').setInputFiles({name: 'note.png', mimeType: 'image/png', buffer: screenshot});
    await page.waitForFunction(() => document.querySelector('.inline-feedback-image'));
    await page.locator('[data-view-button="keyframes"]').click();
    const frame = page.locator('tr[data-view="keyframes"][data-stable-id="scene-one"]');
    assert.equal(await frame.isVisible(), true);
    assert.equal(await suggestion.isVisible(), false);
    await frame.locator('.asset-image').click();
    assert.equal(await page.locator('dialog').evaluate(node => node.open), true);
    await page.getByRole('button', {name: '关闭大图'}).click();
    await frame.locator('.decision').selectOption('keep');
    let exported = await page.evaluate(() => window.segmentReview.exportData());
    const staticRecord = exported.records.find(record => record.current && record.view === 'keyframes' && record.stableId === 'scene-one');
    assert.equal(staticRecord.approvalScope, 'static-frame');
    assert.equal(staticRecord.animationApproved, false);
    assert.equal(staticRecord.needsChanges, false);
    const selected = exported.records.find(record => record.current && record.view === 'suggestion' && record.stableId === 'scene-one');
    assert.equal(selected.selectedRoute, 'remotion');
    assert.equal(selected.userSelection.candidateId, 'option-a');
    assert.equal(selected.userSelection.sha256.length, 64);
    assert.equal(selected.needsChanges, true);
    assert.deepEqual(selected.content.map(item => item.type), ['text', 'image']);
    assert.match(selected.images[0].dataUrl, /^data:image\/png;base64,/);
    assert.equal(exported.episodeKey, 'review-ui-fixture');
    assert.equal(exported.savedToManifest, false);

    // A new file under the same frame id/path must not inherit the old judgment.
    const manifestPath = path.join(folder, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath));
    fs.writeFileSync(path.join(folder, 'frame.png'), screenshot);
    manifest.pages[0].keyframeReview.frames[0].sha256 = crypto.createHash('sha256').update(screenshot).digest('hex');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    run([path.join(__dirname, 'build_segment_review.py'), '--manifest', manifestPath, '--output', entry, '--view', 'keyframes']);
    await page.reload();
    await wait();
    assert.equal(await frame.locator('.decision').inputValue(), '');
    assert.match(await frame.locator('.history').textContent(), /以前的意见/);
    exported = await page.evaluate(() => window.segmentReview.exportData());
    const frameVersions = exported.records.filter(record => record.stableId === 'scene-one' && record.view === 'keyframes');
    assert.equal(frameVersions.length, 2);
    assert.equal(frameVersions.find(record => !record.current).choice, 'keep');
    assert.equal(frameVersions.find(record => record.current).choice, '');

    await page.locator('[data-view-button="video"]').click();
    assert.equal(await page.locator('tr[data-view="video"][data-stable-id="scene-one"] video').isVisible(), true);
    await page.locator('[data-view-button="suggestion"]').click();
    assert.equal(await suggestion.locator('.route-choice').inputValue(), 'remotion');
    assert.equal(await suggestion.locator('.inline-feedback-image').count(), 1);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({status: 'PASS', checks: ['three views', 'explicit selection', 'keep with changes', 'rich image export', 'static scope', 'version invalidation', 'history retention', 'video retained']}));
  } finally {
    await browser.close();
    fs.rmSync(folder, {recursive: true, force: true});
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
