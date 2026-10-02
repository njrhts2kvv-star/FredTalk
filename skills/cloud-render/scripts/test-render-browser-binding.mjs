// Run the actual launcher with strict Remotion API stubs; no cloud or media render.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const scripts = dirname(fileURLToPath(import.meta.url));
for (const [browsers, concurrency] of [[4, 2], [1, 1]]) {
  const dir = mkdtempSync(join(tmpdir(), 'render-binding-'));
  try {
    for (const name of ['render.mjs', 'render-options.mjs']) copyFileSync(join(scripts, name), join(dir, name));
    const module = (name, source) => {
      const folder = join(dir, 'node_modules', '@remotion', name);
      mkdirSync(folder, {recursive: true});
      writeFileSync(join(folder, 'package.json'), JSON.stringify({type: 'module', exports: './index.mjs'}));
      writeFileSync(join(folder, 'index.mjs'), source);
    };
    module('bundler', 'export async function bundle() { return "http://test.invalid"; }');
    module('renderer', `
      import assert from 'node:assert/strict';
      import {appendFileSync} from 'node:fs';
      const opened = []; const used = new Set();
      const log = value => appendFileSync('calls.jsonl', JSON.stringify(value)+'\\n');
      export async function openBrowser() {
        const browser = {id: opened.length, close: async () => log({closed: browser.id})};
        opened.push(browser); return browser;
      }
      export async function selectComposition(options) {
        assert.equal(options.puppeteerInstance, opened[0], 'selectComposition must reuse the opened browser');
        return {id: 'Example', width: 1920, height: 1080, fps: 60, durationInFrames: 12};
      }
      export async function renderMedia(options) {
        assert.ok(opened.includes(options.puppeteerInstance), 'renderMedia must receive an opened browser');
        assert.ok(!used.has(options.puppeteerInstance), 'each chunk must use its own browser');
        used.add(options.puppeteerInstance);
        log({worker: options.puppeteerInstance.id, frames: options.frameRange, concurrency: options.concurrency, muted: options.muted});
      }
    `);
    const bin = join(dir, 'bin'); mkdirSync(bin);
    writeFileSync(join(bin, 'ffmpeg'), '#!/usr/bin/env node\n'+
      "require('node:fs').appendFileSync('mux.jsonl', JSON.stringify(process.argv.slice(2))+'\\n');\n", {mode: 0o755});
    writeFileSync(join(dir, 'job.json'), JSON.stringify({composition: 'Example', entry: 'src.tsx', publicDir: 'public',
      browsers, concurrency, frameRange: [1, 10], audio: {mode: 'external', path: 'mix.wav', startSeconds: 2}}));
    const run = spawnSync(process.execPath, ['render.mjs', 'job.json'], {cwd: dir, encoding: 'utf8',
      env: {...process.env, PATH: bin+':'+process.env.PATH}});
    assert.equal(run.status, 0, run.stderr);
    const calls = readFileSync(join(dir, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
    const workers = calls.filter(x => x.worker !== undefined);
    assert.equal(workers.length, browsers);
    assert.ok(workers.every(x => x.concurrency === concurrency && x.muted));
    assert.deepEqual(workers.flatMap(x => Array.from({length: x.frames[1]-x.frames[0]+1}, (_,i) => i+x.frames[0])),
      Array.from({length: 10}, (_,i) => i+1));
    assert.equal(calls.filter(x => x.closed !== undefined).length, browsers);
    const mux = readFileSync(join(dir, 'mux.jsonl'), 'utf8').trim().split('\n').map(JSON.parse).at(-1);
    assert.ok(!mux.includes('-frames:v'));
    assert.equal(mux[mux.indexOf('-t')+1], String(10/60));
    assert.equal(mux[mux.indexOf('-ss')+1], '2');
    console.log(`PASS actual launcher: ${browsers} browsers x ${concurrency} pages, exact chunk coverage, complete-mix mux arguments`);
  } finally { rmSync(dir, {recursive: true, force: true}); }
}
