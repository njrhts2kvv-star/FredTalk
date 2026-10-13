"""成片切段推进审看前端“逐段视频”页（114 v2/v3 定型）。
每段按 timing.json 的帧窗口从成片切出 720p 审看短片（真实录音、音效、字幕、BGM 都在），
episode.json 的 mergeIntoPrevious（如 {"INSERT": "S03"}）把插入段并进前一段。改前自动备份 review.json。
注意：推送前先删掉 assets 里指向已不存在文件的旧登记——服务器逐个校验资源，缺一个文件整页 500。
用法：python3 tools/push_videos.py --video <成片.mp4> --app <review-app 目录> --label "v3 成片切段"
"""
import argparse, hashlib, json, os, pathlib, shutil, subprocess, sys, time
tools_root = os.environ.get('FREDTALK_ROOT')
if not tools_root: raise SystemExit('Set FREDTALK_ROOT to your FredTalk repository before publishing review clips')
sys.path.insert(0, str(pathlib.Path(tools_root) / 'skills/fred-remotion-output/scripts'))
from build_segment_review import fingerprint  # noqa: E402
ap = argparse.ArgumentParser(); ap.add_argument('--video', required=True); ap.add_argument('--app', required=True)
ap.add_argument('--label', default='成片切段'); ap.add_argument('--version-label', default=None)
a = ap.parse_args()
V = pathlib.Path(__file__).resolve().parents[1]
SRC, APP = pathlib.Path(a.video).resolve(), pathlib.Path(a.app).resolve()
T = json.loads((V / 'src/timing.json').read_text()); FPS = T['fps']
C = json.loads((V / 'episode.json').read_text()); MERGE = C.get('mergeIntoPrevious', {})
pages = {p['stableId']: p for p in T['pages']}
key = hashlib.sha256(f'{SRC}:{SRC.stat().st_size}:{SRC.stat().st_mtime}'.encode()).hexdigest()[:10]
OUT = V / f'out/review-{key}'; OUT.mkdir(parents=True, exist_ok=True)
sha = lambda p: hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
review = json.loads((APP / 'review.json').read_text())
shutil.copyfile(APP / 'review.json', APP / f'review.json.bak-{time.strftime("%Y%m%d-%H%M%S")}')
assets = review['assets']
for k in [k for k, x in assets.items() if not (APP / x['path']).resolve().exists()]: del assets[k]
for scene in review['scenes']:
    sid = scene['stableId']; p = pages[sid]
    a0 = p['globalStartFrame']; b0 = a0 + p['frames']
    for child, parent in MERGE.items():
        if parent == sid: b0 = pages[child]['globalStartFrame'] + pages[child]['frames']
    f = OUT / f'{sid}.mp4'
    if not f.exists():
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', f'{a0 / FPS:.6f}', '-i', str(SRC), '-t', f'{(b0 - a0) / FPS:.6f}',
                        '-vf', 'scale=-2:720', '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-r', str(FPS), '-frames:v', str(b0 - a0),
                        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(f)], check=True)
    rel = os.path.relpath(f, APP); k = fingerprint(rel)[:24]; h = sha(f)
    assets[k] = dict(path=rel, sha256=h)
    scene['videos'] = [dict(label=a.label, url=f'/media/{k}?v={h[:12]}', sha256=h, assetId=k)]
    scene['startSeconds'] = a0 / FPS; scene['endSeconds'] = b0 / FPS
    scene['identity']['video'] = fingerprint(['video', key, sid, h])
    print(sid, round((b0 - a0) / FPS, 2), 's')
if a.version_label: review['versionLabel'] = a.version_label
review.pop('version', None); review['version'] = fingerprint(review)
tmp = APP / 'review.json.tmp'; tmp.write_text(json.dumps(review, ensure_ascii=False, indent=2)); tmp.replace(APP / 'review.json')
