// FredTalk 2.5 distribution: fred-legacy-fix-20261018
// patch-b1：本工程依赖 4.0.519（运行环境 approved-motion-library 只有 bundler/renderer、没有 CLI），用 API 渲染。
// 用法：node render-patch.mjs <组合ID> <输出.mp4> [still帧号]
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const [id, out, still] = process.argv.slice(2);
const root = path.dirname(fileURLToPath(import.meta.url));
const serveUrl = await bundle({entryPoint: path.join(root, 'src/rebuilt-entry.tsx'), publicDir: path.join(root, 'public')});
console.log('bundled');
const composition = await selectComposition({serveUrl, id, chromeMode: 'chrome-for-testing', onBrowserDownload: () => { throw new Error('不下载浏览器：用运行环境里已有的 chrome-for-testing'); }});
console.log('selected');
if (still !== undefined) await renderStill({serveUrl, composition, output: out, frame: Number(still), chromeMode: 'chrome-for-testing'});
else await renderMedia({serveUrl, composition, codec: 'h264', crf: 12, outputLocation: out, concurrency: 6, muted: true, chromeMode: 'chrome-for-testing'});
console.log('done', out);
