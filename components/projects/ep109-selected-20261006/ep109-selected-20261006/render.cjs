#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const {createRequire} = require('module');
const SOURCE = __dirname;
const SKILLS = SOURCE;
const RUNTIME = SOURCE;
const BROWSER = process.env.FRED_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.statSync(BROWSER).isFile()) throw new Error('The canonical project browser is missing: ' + BROWSER);
const runtimeRequire = createRequire(path.join(RUNTIME, 'package.json'));
const expected = {'react': '19.2.4', 'remotion': '4.0.473', '@remotion/bundler': '4.0.473', '@remotion/renderer': '4.0.473'};
for (const [name, version] of Object.entries(expected)) {
  const actual = runtimeRequire(name + '/package.json').version;
  if (actual !== version) throw new Error(`${name} must be ${version}; found ${actual}`);
}
const specs = JSON.parse(fs.readFileSync(path.join(SOURCE, 'component-specs.json')));
const {bundle} = runtimeRequire('@remotion/bundler');
const {getCompositions, renderStill, renderMedia, openBrowser} = runtimeRequire('@remotion/renderer');
const command = process.argv[2] || 'list';
const id = process.argv[3];
const output = process.argv[4];
const aliases = Object.fromEntries(Object.keys(expected).concat(['react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime']).map(name => [name + '$', runtimeRequire.resolve(name)]));
async function main() {
  const serveUrl = await bundle({entryPoint: path.join(SOURCE, 'index.tsx'), publicDir: path.join(SOURCE, 'public'), outDir: fs.mkdtempSync(path.join(os.tmpdir(),'fred-ep109-selected-')), webpackOverride: config => ({...config, cache:false, resolve: {...config.resolve, modules: [path.join(RUNTIME, 'node_modules'), ...(config.resolve?.modules || [])], alias: {...config.resolve?.alias, ...aliases}}})});
  const browser = await openBrowser('chrome', {browserExecutable: BROWSER});
  try {
  const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
  if (command === 'list') {
    process.stdout.write(JSON.stringify(compositions.map(c => ({id: c.id, fps: c.fps, width: c.width, height: c.height, durationInFrames: c.durationInFrames})), null, 2) + '\n');
    fs.mkdirSync(path.join(SOURCE, 'verification'), {recursive: true});
    fs.writeFileSync(path.join(SOURCE, 'verification/compositions.json'), JSON.stringify({status: 'PASS', browserExecutable: path.relative(SKILLS, BROWSER), runtime: expected, compositions: compositions.map(c => ({id: c.id, fps: c.fps, width: c.width, height: c.height, durationInFrames: c.durationInFrames}))}, null, 2) + '\n');
    return;
  }
  const selected = id ? compositions.filter(c => c.id === id || specs.find(s => s.id === id)?.compositionId === c.id) : compositions;
  if (!selected.length) throw new Error('Unknown composition: ' + id);
  if (command === 'render-all') {
    const dir = output ? path.resolve(output) : path.join(SOURCE,'outputs');
    fs.mkdirSync(dir,{recursive:true});
    for(const c of selected){
      process.stdout.write(JSON.stringify({event:'start',id:c.id,frames:c.durationInFrames})+'\n');
      const target=path.join(dir,c.id+'.mp4');let lastLog=Date.now();
      await renderMedia({serveUrl,composition:c,outputLocation:target,codec:'h264',concurrency:2,crf:18,
        scale:Number(process.env.FRED_RENDER_SCALE || 1),muted:true,puppeteerInstance:browser,
        onProgress:progress=>{if(Date.now()-lastLog>30000){lastLog=Date.now();process.stdout.write(JSON.stringify({event:'progress',id:c.id,renderedFrames:progress.renderedFrames})+'\n');}}});
      process.stdout.write(JSON.stringify({status:'PASS',id:c.id,output:target})+'\n');
    }
    return;
  }
  if (command === 'stills') {
    const dir = output ? path.resolve(output) : path.join(SOURCE, 'verification/stills');
    fs.mkdirSync(dir, {recursive: true});
    const checks = [];
    for (const c of selected) {
      for (const frame of [0, Math.floor(c.durationInFrames / 2), c.durationInFrames - 1]) {
        const target = path.join(dir, `${c.id}-${String(frame).padStart(5, '0')}.png`);
        await renderStill({serveUrl, composition: c, output: target, frame, scale: .5, imageFormat: 'png', puppeteerInstance: browser});
        checks.push({id: c.id, frame, path: path.relative(SOURCE, target), sha256: crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')});
      }
    }
    fs.mkdirSync(path.join(SOURCE, 'verification'), {recursive: true});
    fs.writeFileSync(path.join(SOURCE, 'verification/stills.json'), JSON.stringify(checks, null, 2) + '\n');
    process.stdout.write(JSON.stringify({status: 'PASS', stills: checks.length}) + '\n');
    return;
  }
  if (command === 'render') {
    if (selected.length !== 1) throw new Error('render requires one composition ID');
    const c = selected[0];
    const target = output ? path.resolve(output) : path.join(SOURCE, 'outputs', c.id + '.mp4');
    fs.mkdirSync(path.dirname(target), {recursive: true});
    await renderMedia({serveUrl, composition: c, outputLocation: target, codec: 'h264', concurrency: 2, crf: 18, scale: Number(process.env.FRED_RENDER_SCALE || 1), muted: true, puppeteerInstance: browser});
    process.stdout.write(JSON.stringify({status: 'PASS', composition: c.id, output: target}) + '\n');
    return;
  }
  throw new Error('Usage: node render.cjs list | stills [compositionId] [directory] | render compositionId [output.mp4]');
  } finally {await browser.close({silent: true});}
}
main().catch(error => {console.error(error); process.exitCode = 1;});
