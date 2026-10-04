const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');

let project = __dirname;
while (!fs.existsSync(path.join(project, 'skills/_runtime/remotion/preferred-motion-v2/package.json'))) {
  const parent = path.dirname(project);
  if (parent === project) throw new Error('Run from the project-local Skill source bundle.');
  project = parent;
}
const runtime = path.join(project, 'skills/_runtime/remotion/preferred-motion-v2');
const req = createRequire(path.join(runtime, 'package.json'));
const {bundle} = req('@remotion/bundler');
const {openBrowser, getCompositions, renderStill, renderMedia} = req('@remotion/renderer');
const executable = path.join(project, 'skills/_runtime/remotion/codex-episode-1-xhs/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell');

(async () => {
  const serveUrl = await bundle({entryPoint: path.join(__dirname, 'src/library-entry.tsx'),
    publicDir: path.join(__dirname, 'public'), webpackOverride: config => ({...config,
      resolve: {...config.resolve, modules: [path.join(runtime, 'node_modules'), ...(config.resolve.modules || [])]}})});
  const browser = await openBrowser('chrome', {browserExecutable: executable, chromiumOptions: {gl: 'angle'}});
  try {
    const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
    if (process.argv[2] === 'list') {
      process.stdout.write(JSON.stringify(compositions.map(({id, width, height, fps, durationInFrames}) =>
        ({id, width, height, fps, durationInFrames})), null, 2) + '\n');
      return;
    }
    if (process.argv[2] === 'stills') {
      const jobs = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
      for (const job of jobs) {
        const composition = compositions.find(item => item.id === job.id);
        if (!composition) throw new Error('Unknown composition: ' + job.id);
        await renderStill({serveUrl, composition, frame: job.frame, output: job.output,
          scale: job.scale || 0.5, imageFormat: 'png', puppeteerInstance: browser,
          chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 90000});
        process.stdout.write('STILL ' + job.id + ' ' + job.frame + '\n');
      }
      return;
    }
    if (process.argv[2] !== 'render') throw new Error('Use list, stills <jobs.json>, or render <id> <output.mp4>.');
    const composition = compositions.find(item => item.id === process.argv[3]);
    if (!composition || !process.argv[4]) throw new Error('Composition and output required.');
    await renderMedia({serveUrl, composition, outputLocation: process.argv[4], codec: 'h264',
      crf: 17, imageFormat: 'jpeg', jpegQuality: 95, x264Preset: 'fast', concurrency: 2,
      puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 90000});
  } finally {await browser.close({silent: true});}
})().catch(error => {process.stderr.write(error.stack + '\n'); process.exitCode = 1;});
