import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser, getCompositions, renderMedia} from '@remotion/renderer';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const versions = Object.fromEntries(['remotion', 'react', 'react-dom'].map(name =>
  [name, JSON.parse(fs.readFileSync(path.join('node_modules', name, 'package.json'), 'utf8')).version]));
if (versions.remotion !== '4.0.473' || versions.react !== '19.2.4' || versions['react-dom'] !== '19.2.4') {
  throw new Error('Dependency baseline differs from the delivery contract');
}
const options = {
  chromeMode: 'headless-shell',
  ...(process.env.REMOTION_BROWSER ? {browserExecutable: process.env.REMOTION_BROWSER} : {}),
};
const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, 'public')});
let browser;
try {
  browser = await openBrowser('chrome', options);
  const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser, ...options});
  if (compositions.length !== manifest.clips.length) throw new Error('Composition count mismatch');
  for (const item of manifest.clips) {
    const c = compositions.find(c => c.id === item.id);
    if (!c || c.width !== 1920 || c.height !== 1080 || c.fps !== 60 || c.durationInFrames !== item.durationInFrames) {
      throw new Error('Composition registration mismatch: ' + item.id);
    }
  }
  const id = process.argv[2] || 'X027';
  const composition = compositions.find(c => c.id === id);
  if (!composition) throw new Error('Unknown proof composition: ' + id);
  const output = process.env.PROOF_OUTPUT || path.join(root, 'qc', 'delivery-proof-' + id + '.mp4');
  fs.mkdirSync(path.dirname(output), {recursive: true});
  await renderMedia({serveUrl, composition, inputProps: composition.defaultProps,
    outputLocation: output, codec: 'h264', crf: 15, pixelFormat: 'yuv420p',
    muted: true, concurrency: 2, puppeteerInstance: browser, ...options});
  const report = {checkedAt: new Date().toISOString(), cwd: root, versions,
    physicalDependencies: !fs.lstatSync('node_modules').isSymbolicLink(),
    compositionIds: compositions.map(c => c.id), allRegistrationsMatch: true,
    representativeRender: {id, output, frames: composition.durationInFrames,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(output)).digest('hex')},
    visualAcceptanceGranted: false};
  fs.mkdirSync('qc', {recursive: true});
  fs.writeFileSync('qc/runtime-verification.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
} finally {
  if (browser) await browser.close({silent: true});
  if (path.basename(serveUrl).startsWith('remotion-webpack-bundle-')) {
    await fs.promises.rm(serveUrl, {recursive: true, force: true});
  }
}
