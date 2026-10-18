// 一次打包，按 段:秒 列表抽检查帧。用法：node tools/stills.mjs <outDir> S01:1.0,5.9,9 S02:...
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.resolve(process.argv[2]);
fs.mkdirSync(outDir, { recursive: true });
const jobs = process.argv.slice(3).flatMap((a) => {
  const [id, ts] = a.split(':');
  return ts.split(',').map((t) => ({ id, t: Number(t) }));
});
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.tsx'), publicDir: path.join(root, process.env.PUBLIC_DIR || 'public') });
const comps = {};
let i = 0;
const queue = [...jobs];
async function worker() {
  while (queue.length) {
    const j = queue.shift();
    const c = comps[j.id];
    const frame = Math.min(c.durationInFrames - 1, Math.round(j.t * c.fps));
    const out = path.join(outDir, `${j.id}_${String(j.t.toFixed(2)).padStart(6, '0')}.png`);
    await renderStill({ serveUrl, composition: c, frame, output: out, scale: Number(process.env.SCALE || 0.5), timeoutInMilliseconds: 120000 });
    i++;
  }
}
try {
  await Promise.all([...new Set(jobs.map((j) => j.id))].map(async (id) => { comps[id] = await selectComposition({ serveUrl, id }); }));
  await Promise.all([1, 2, 3, 4].map(worker));
} finally {
  // 120 期：每次 bundle() 都在系统临时目录留一份几百 MB 的打包，不删会越攒越多（10-14 攒到 60GB 把系统盘写满）
  fs.rmSync(serveUrl, { recursive: true, force: true });
}
console.log(`rendered ${i} stills to ${outDir}`);
