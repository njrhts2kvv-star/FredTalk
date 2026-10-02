import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets/characters');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const ids = new Set();
if (!manifest.assets?.length) throw new Error('Empty character manifest');
for (const asset of manifest.assets) {
  if (ids.has(asset.assetId)) throw new Error(`Duplicate asset: ${asset.assetId}`);
  ids.add(asset.assetId);
  if (path.basename(asset.file) !== asset.file) throw new Error('Unsafe asset path');
  const file = path.join(root, asset.file);
  if (!fs.lstatSync(file).isFile()) throw new Error(`Not a regular file: ${file}`);
  const buffer = fs.readFileSync(file);
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');
  if (buffer.length !== asset.bytes || hash !== asset.sha256) {
    throw new Error(`Character integrity mismatch: ${asset.assetId}`);
  }
}
console.log(`PASS: ${ids.size} character assets verified (integrity only, not visual approval)`);
