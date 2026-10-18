"""成片响度检查（120 期）。4K 整片按 final.py 混音（口播+音效过 alimiter 0.79）再加 BGM 后只有 -10.4 LUFS，比往期 -9.4 轻约 1dB。
- 默认只检查：final.py / assemble30.py 出片后调用 check()，偏低时打印提示，不改文件（背景音乐规则：不自动补偿增益，单片响度不当固定目标）。
- 需要补时手动：python3 render/loudness.py <成片> --fix [--target -9.5]
  只改音轨（视频流复制）；补前原片挪进同目录工程的 out/old/（加时间戳）；补完复核真峰值 ≤ -1 dBTP，不满足就还原并报错；
  同名 .bgm.json 里追加 postGain 记录（增益、前后响度/真峰值、新 sha256），保持返修绑定可追溯。"""
import argparse, hashlib, json, pathlib, re, shutil, subprocess, sys, time
MIN_LUFS, TP_LIMIT = -10.0, -1.0

def measure(path):
    err = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', str(path), '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    i = re.findall(r'I:\s+(-?[\d.]+) LUFS', err); tp = re.findall(r'Peak:\s+(-?[\d.]+) dBFS', err)
    if not i or not tp: return None, None   # 静音或测不出（-inf）
    return float(i[-1]), float(tp[-1])

def check(path):
    i, tp = measure(path)
    if i is None: print('  响度：测不出（静音或无音轨），跳过'); return None, None
    print(f'  响度 {i:.1f} LUFS / 真峰值 {tp:.1f} dBTP')
    if i < MIN_LUFS:
        print(f'  ⚠ 低于 {MIN_LUFS} LUFS（往期成片约 -9.4）。需要补就运行：python3 render/loudness.py "{path}" --fix')
    return i, tp

def fix(path, target=-9.5):
    path = pathlib.Path(path).resolve(); i, tp = measure(path)
    if i is None: sys.exit('测不出响度，不处理')
    gain = round(min(target - i, (TP_LIMIT - 0.3) - tp), 1)
    if gain < 0.3: print(f'  响度 {i:.1f} / 真峰值 {tp:.1f}，可补空间不足 0.3dB，不处理'); return
    old_dir = next((p / 'out/old' for p in [path.parent, *path.parents] if (p / 'episode.json').exists()), path.parent / 'old')
    old_dir.mkdir(parents=True, exist_ok=True)
    keep = old_dir / f'{path.stem}.pregain-{time.strftime("%m%d-%H%M%S")}{path.suffix}'
    tmp = path.with_name(path.stem + '.gain-tmp' + path.suffix)
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', str(path), '-map', '0:v', '-map', '0:a', '-c:v', 'copy',
                    '-af', f'volume={gain}dB', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', str(tmp)], check=True)
    i2, tp2 = measure(tmp)
    if tp2 is None or tp2 > TP_LIMIT:
        tmp.unlink(missing_ok=True); sys.exit(f'补增益后真峰值 {tp2} dBTP 超过 {TP_LIMIT}，已放弃，原片未改')
    shutil.copy2(path, keep); shutil.move(tmp, path)
    side = path.with_suffix('.bgm.json')
    if side.exists():
        rec = json.loads(side.read_text())
        rec.setdefault('postGain', []).append({'at': time.strftime('%Y-%m-%dT%H:%M:%S'), 'gainDb': gain, 'before': {'lufs': i, 'tp': tp},
            'after': {'lufs': i2, 'tp': tp2}, 'pregainCopy': str(keep), 'outputSha256': hashlib.sha256(path.read_bytes()).hexdigest()})
        side.write_text(json.dumps(rec, ensure_ascii=False, indent=1))
    print(f'  响度 {i:.1f} → {i2:.1f} LUFS（+{gain}dB），真峰值 {tp2:.1f} dBTP；原片留在 {keep}')

if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--fix', action='store_true'); ap.add_argument('--target', type=float, default=-9.5)
    a = ap.parse_args(); fix(a.video, a.target) if a.fix else check(a.video)
