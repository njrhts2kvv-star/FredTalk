const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
const {execFileSync} = require('node:child_process');
let project = __dirname;
while (!fs.existsSync(path.join(project, 'skills/_runtime/remotion/library-remakes-20260916/package.json'))) {
  const parent = path.dirname(project);
  if (parent === project) throw Error('Run the project-local Skill source bundle.');
  project = parent;
}
const runtime = path.join(project, 'skills/_runtime/remotion/library-remakes-20260916');
const req = createRequire(path.join(runtime, 'package.json'));
const {bundle} = req('@remotion/bundler');
const {openBrowser, getCompositions, renderStill, renderMedia} = req('@remotion/renderer');
const executable = path.join(project, 'skills/_runtime/remotion/codex-episode-1-xhs/node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell');
(async () => {
  const action = process.argv[2];
  if (!['list', 'stills', 'render'].includes(action)) throw Error('Use list, stills <jobs.json>, or render <id> <new-output.mp4>.');
  const serveUrl = await bundle({entryPoint: path.join(__dirname, 'src/library-entry.tsx'),
    publicDir: action === 'list' ? null : path.join(__dirname, 'public'),
    webpackOverride: config => ({...config, resolve: {...config.resolve,
      modules: [path.join(runtime, 'node_modules'), ...(config.resolve.modules || [])]}})});
  const browser = await openBrowser('chrome', {browserExecutable: executable, chromiumOptions: {gl: 'angle'}});
  try {
    const compositions = await getCompositions(serveUrl, {puppeteerInstance: browser});
    if (action === 'list') {
      console.log(JSON.stringify(compositions.map(({id, width, height, fps, durationInFrames}) =>
        ({id, width, height, fps, durationInFrames})), null, 2));
      return;
    }
    if (action === 'stills') {
      for (const job of JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))) {
        const composition = compositions.find(x => x.id === job.id);
        if (!composition || !job.output || fs.existsSync(job.output)) throw Error('Unknown composition or existing output.');
        await renderStill({serveUrl, composition, frame: job.frame, output: job.output,
          inputProps: {includeSourceAudio: false}, scale: job.scale || 1/3, imageFormat: 'png',
          puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 90000});
        console.log('STILL ' + job.id + ' ' + job.frame);
      }
      return;
    }
    const composition = compositions.find(x => x.id === process.argv[3]);
    const output = process.argv[4];
    if (!composition || !output || fs.existsSync(output) || fs.existsSync(output + '.visual.mp4')) throw Error('Unknown composition or existing output.');
    // Match the cloud job: muted visuals, then mux the preserved source narration.
    const visual = output + '.visual.mp4';
    await renderMedia({serveUrl, composition, inputProps: {includeSourceAudio: false}, muted: true,
      outputLocation: visual, codec: 'h264', crf: 16, imageFormat: 'jpeg', jpegQuality: 95,
      concurrency: 2, puppeteerInstance: browser, chromiumOptions: {gl: 'angle'}, timeoutInMilliseconds: 90000});
    const seconds = composition.durationInFrames / composition.fps;
    execFileSync('ffmpeg', ['-nostdin', '-v', 'error', '-i', visual, '-i',
      path.join(__dirname, 'public/audio', composition.id + '.m4a'), '-map', '0:v:0', '-map', '1:a:0',
      '-c:v', 'copy', '-af', `apad=whole_dur=${seconds}`, '-c:a', 'aac', '-b:a', '320k',
      '-t', String(seconds), '-video_track_timescale', '60000', '-movflags', '+faststart', output]);
    fs.unlinkSync(visual);
  } finally {await browser.close({silent: true});}
})().catch(error => {console.error(error.stack); process.exitCode = 1;});
