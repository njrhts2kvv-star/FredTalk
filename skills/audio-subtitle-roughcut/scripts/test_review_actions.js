const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const template = path.resolve(__dirname, '../assets/review-app');
function review() {
  const elements = new Map();
  const backups = [];
  const element = id => {
    if (!elements.has(id)) elements.set(id, {
      value: id === 'zoom' ? '1' : id === 'filter' ? 'all' : '', checked: false,
      style: {}, innerHTML: '', textContent: '', disabled: false, clientWidth: 640,
      classList: {toggle() {}, add() {}, remove() {}, contains() {return false;}},
      setAttribute() {}, pause() {}, focus() {}, showModal() {}, close() {},
      getContext() {return {setTransform() {}, clearRect() {}, fillText() {}, fillRect() {}, strokeRect() {}};},
    });
    return elements.get(id);
  };
  const sandbox = {
    document: {getElementById: element, querySelector: element, querySelectorAll: () => [],
      body: element('body'), addEventListener() {}}, window: {}, lucide: {createIcons() {}},
    localStorage: {setItem(key, value) {backups.push(JSON.parse(value));}}, requestAnimationFrame() {},
    fetch: () => new Promise(() => {}), setTimeout() {}, clearTimeout() {},
    devicePixelRatio: 1, Date, console,
  };
  vm.createContext(sandbox);
  const actions = path.join(template, 'cut-actions.js');
  if (fs.existsSync(actions)) vm.runInContext(fs.readFileSync(actions, 'utf8'), sandbox);
  vm.runInContext(fs.readFileSync(path.join(template, 'app.js'), 'utf8'), sandbox);
  const run = source => vm.runInContext(source, sandbox);
  run(`project={duration:3,episodeKey:'test',sourceHash:'test',peaks:[],script:'',cues:[
    {id:1,start:0,end:1,originalStart:0,originalEnd:1,text:'第一句'},
    {id:2,start:1,end:2,originalStart:1,originalEnd:2,text:'第二句'},
    {id:3,start:2,end:3,originalStart:2,originalEnd:3,text:'第三句'}]}; cuts=[];`);
  return {run, elements, backups};
}

let passed = 0, failed = 0;
function test(name, fn) {
  try {fn(); passed++; console.log(`PASS ${name}`);}
  catch (error) {failed++; console.error(`FAIL ${name}: ${error.message}`);}
}
test('repeated sentence deletion does not stack cuts or undo checkpoints', () => {
  const {run} = review();
  run(`addCut(1,2,'手动删除整句'); addCut(1,2,'手动删除整句');`);
  assert.equal(run('cuts.length'), 1);
  assert.equal(run('history.length'), 1);
});
test('already covered selection does not create a duplicate broad cut', () => {
  const {run} = review();
  run(`cuts=[{id:'a',start:1,end:1.5,enabled:true},{id:'b',start:1.5,end:2,enabled:true}];addCut(1,2);`);
  assert.equal(run('cuts.length'), 2);
  assert.equal(run('history.length'), 0);
});
test('each row offers restore and disables it only without active overlap', () => {
  const {run, elements} = review();
  run(`cuts=[{id:'a',start:1.1,end:1.3,enabled:true}];renderTranscript();`);
  const html = elements.get('transcript').innerHTML;
  assert.match(html, /data-restore="2"(?! disabled)/);
  assert.match(html, /data-restore="1" disabled/);
});
test('one restore clears all repeated deletions and undo redo round trips', () => {
  const {run, backups} = review();
  run(`cuts=[{id:'a',start:1,end:2,enabled:true},{id:'b',start:1,end:2,enabled:true}];restoreCue(2);`);
  assert.equal(run('cuts.filter(c=>c.enabled).length'), 0);
  assert.equal(backups.at(-1).cuts.filter(c => c.enabled).length, 0);
  assert.equal(run('history.length'), 1);
  run(`$('undo').onclick();`);
  assert.equal(run('cuts.filter(c=>c.enabled).length'), 2);
  assert.equal(backups.at(-1).cuts.filter(c => c.enabled).length, 2);
  run(`$('redo').onclick();`);
  assert.equal(run('cuts.filter(c=>c.enabled).length'), 0);
  assert.equal(backups.at(-1).cuts.filter(c => c.enabled).length, 0);
});
test('restore only one cue of a broad cut and retains origin identities', () => {
  const {run} = review();
  run(`cuts=[{id:'wide',start:.2,end:2.8,enabled:true}];restoreCue(2);`);
  assert.equal(run(`JSON.stringify(intervals())`), '[[0.2,1],[2,2.8]]');
  assert.equal(run(`cuts.find(c=>c.id==='wide').enabled`), false);
  assert.equal(run(`cuts.filter(c=>c.enabled&&c.originCutId==='wide').length`), 2);
  run(`$('undo').onclick();`);
  assert.equal(run(`JSON.stringify(intervals())`), '[[0.2,2.8]]');
  run(`$('redo').onclick();`);
  assert.equal(run(`JSON.stringify(intervals())`), '[[0.2,1],[2,2.8]]');
});
test('restoration uses original row bounds after cut-bound subtitle shortening', () => {
  const {run} = review();
  run(`project.cues[1].start=1.2;project.cues[1].end=1.8;cuts=[{id:'bound',start:1.05,end:1.2,enabled:true}];restoreCue(2);`);
  assert.equal(run('cuts.filter(c=>c.enabled).length'), 0);
});
test('bound prefix cut starts before estimated cue and leaves no stray deleted onset', () => {
  const {run} = review();
  run(`project.cues[1].originalStart=1.05;project.cues[1].start=1.2;
    project.subtitleBoundaries=[{cue:2,cutId:'prefix',removePrefix:'但是',start:1.2}];
    cuts=[{id:'prefix',start:1.02,end:1.2,enabled:true}];restoreCue(2);`);
  assert.equal(run('cuts.filter(c=>c.enabled).length'), 0);
});
test('bound prefix restoration never restores the preceding cue content', () => {
  const {run} = review();
  run(`project.cues[1].originalStart=1.05;project.cues[1].start=1.2;
    project.subtitleBoundaries=[{cue:2,cutId:'prefix',removePrefix:'但是',start:1.2}];
    cuts=[{id:'prefix',start:.9,end:1.2,enabled:true}];restoreCue(2);`);
  assert.equal(run('JSON.stringify(intervals())'), '[[0.9,1]]');
});
test('bound suffix restoration reaches the actual tail but protects the next cue', () => {
  const {run} = review();
  run(`project.cues[2].start=2.1;project.cues[2].originalStart=2.1;
    project.subtitleBoundaries=[{cue:2,cutId:'suffix',removeSuffix:'尾字'}];
    cuts=[{id:'suffix',start:1.8,end:2.2,enabled:true}];restoreCue(2);`);
  assert.equal(run('JSON.stringify(intervals())'), '[[2.1,2.2]]');
});
test('restoring a row again is a no-op and does not disturb unrelated cuts', () => {
  const {run} = review();
  run(`cuts=[{id:'a',start:1,end:2,enabled:true},{id:'other',start:2.2,end:2.6,enabled:true}];restoreCue(2);restoreCue(2);`);
  assert.equal(run('history.length'), 1);
  assert.equal(run(`cuts.find(c=>c.id==='other').enabled`), true);
});
test('bounded revision displays inherited gain without applying new processing', () => {
  const {run} = review();
  const info = run(`finalProcessingInfo({processingMode:'bounded-pcm-revision',preprocessingSpeed:1.1,
    speed:1,gainDb:0,passthrough:true,inheritedProcessing:{gainDb:8,peakLimitDb:-1.5},listeningReviewed:false})`);
  assert.match(info, /预处理 1\.1 倍语速/);
  assert.match(info, /音量 \+8 dB/);
  assert.match(info, /本次局部返修，沿用已有音频处理/);
  assert.doesNotMatch(info, /音量 \+0|接缝已听审/);
});
test('ordinary passthrough has no invented inherited gain', () => {
  const {run} = review();
  const info = run(`finalProcessingInfo({speed:1,gainDb:0,passthrough:true,listeningReviewed:false})`);
  assert.doesNotMatch(info, /音量 \+/);
  assert.match(info, /保持源语速与音量/);
});
test('HTML versions app and styles so existing browser caches cannot serve stale controls', () => {
  const html = fs.readFileSync(path.join(template, 'index.html'), 'utf8');
  assert.match(html, /src="app\.js\?v=[a-zA-Z0-9-]+"/);
  assert.match(html, /href="styles\.css\?v=[a-zA-Z0-9-]+"/);
});
console.log(`${passed} passed, ${failed} failed`);
process.exitCode = failed ? 1 : 0;
