const fs = require('fs');
const path = require('path');
const {bundle} = require('@remotion/bundler');
const {getCompositions, renderMedia, renderStill, openBrowser} = require('@remotion/renderer');
const source = __dirname;
const mode = process.argv[2] || 'list';
const id = process.argv[3];
const browserExecutable = process.env.FRED_BROWSER_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async () => {
  const serve = await bundle({entryPoint: path.join(source, 'src/index.tsx'), publicDir: path.join(source, 'public'), enableCaching: false, webpackOverride: config => ({...config, cache: false})});
  const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions: {gl: 'angle'}});
  try {
    const compositions = await getCompositions(serve, {puppeteerInstance: browser});
    if (mode === 'list') { console.log(JSON.stringify(compositions, null, 2)); return; }
    let composition = compositions.find(c => c.id === id);
    if (!composition) throw new Error('Unknown selected component: ' + id);
    if (process.argv.includes('--4k')) composition = {...composition, width: 3840, height: 2160};
    const output = path.resolve(process.argv[4] || `${id}.${mode === 'still' ? 'png' : 'mp4'}`);
    if (mode === 'still') {
      await renderStill({serveUrl: serve, composition, output, imageFormat: 'png', frame: Math.round(composition.fps), puppeteerInstance: browser});
    } else if (mode === 'render') {
      await renderMedia({serveUrl: serve, composition, codec: 'h264', muted: true, outputLocation: output, crf: 18, pixelFormat: 'yuv420p', concurrency: 4, puppeteerInstance: browser, overwrite: true});
    } else throw new Error('Usage: node render.cjs list | render ID output.mp4 | still ID output.png');
    console.log(output);
  } finally { await browser.close({silent: true}); }
})().catch(error => {console.error(error); process.exit(1);});
