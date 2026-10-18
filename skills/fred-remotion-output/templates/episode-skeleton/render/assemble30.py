#!/usr/bin/env python3
"""1080p30 预览成片（120 期定型）：按段拼 out/p30/<段>.mp4（各段已含口播+音效+插入段原声）→ 接封底 → 加 BGM → 响度兜底。
用法：python3 render/assemble30.py [--segdir out/p30] [--out <成片路径>]
默认输出 02_最终输出/<episode>-preview-1080p30.mp4（已存在就挪进 out/old/）。
- 每段音频按 frames/60 截齐再拼：Remotion 分段 AAC 比画面长约 0.05s，直接拼 10 段下来声音会慢约 0.6s（120 期）。
- 远端失败段不会留旧文件（remote-p30.sh 渲前先删、失败返回非 0），本脚本只检查各段文件是否齐全。
- 封底画面缩到 1920×1080、30fps；声音用 episode.json outro.audio（已按正文响度对齐，不再压）；BGM 在封底让位（bgm-plan.json 里 reason 含“封底”的区间自动填）。"""
import argparse, json, os, pathlib, subprocess, sys, time
V = pathlib.Path(__file__).resolve().parents[1]
SKILL_ROOT = pathlib.Path(os.environ.get('FRED_TOOLS_ROOT', '/absolute/fredtalk'))   # 与 final.py 相同
ap = argparse.ArgumentParser(); ap.add_argument('--segdir', default='out/p30'); ap.add_argument('--out'); a = ap.parse_args()
T = json.loads((V / 'src/timing.json').read_text()); C = json.loads((V / 'episode.json').read_text())
FPS = T['fps']; OUTRO = C.get('outro')
ids = [p['stableId'] for p in T['pages']]
segs = [V / a.segdir / f'{i}.mp4' for i in ids]
miss = [str(s) for s in segs if not s.exists()]
if miss: sys.exit('缺段：' + ' '.join(miss))
cmd = ['ffmpeg', '-nostdin', '-y', '-hide_banner', '-loglevel', 'error']
for s in segs: cmd += ['-i', str(s)]
fc, n = [], len(segs)
for k, p in enumerate(T['pages']):
    d = p['frames'] / FPS
    fc.append(f'[{k}:v]fps=30,scale=1920:1080,setsar=1,format=yuv420p,trim=duration={d:.5f},setpts=PTS-STARTPTS[v{k}]')
    fc.append(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration={d:.5f},asetpts=PTS-STARTPTS,apad=whole_dur={d:.5f}[a{k}]')
fc.append(''.join(f'[v{k}][a{k}]' for k in range(n)) + f'concat=n={n}:v=1:a=1[bv][ba0]')
fc.append('[ba0]alimiter=limit=0.79:attack=3:release=80:level=false[ba]')
body = T['totalFrames'] / FPS
if OUTRO:
    od = OUTRO['frames'] / FPS
    cmd += ['-t', f'{od:.4f}', '-i', str((V / OUTRO['picture']).resolve()), '-t', f'{od:.4f}', '-i', str((V / OUTRO['audio']).resolve())]
    fc.append(f'[{n}:v]fps=30,scale=1920:1080:flags=lanczos,setsar=1,format=yuv420p,trim=duration={od:.4f},setpts=PTS-STARTPTS[ov]')
    fc.append(f'[{n + 1}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration={od:.4f},asetpts=PTS-STARTPTS[oa]')
    fc.append('[bv][ba][ov][oa]concat=n=2:v=1:a=1[v][a]')
else:
    fc.append('[bv]null[v];[ba]anull[a]')
OUT = V / 'out'; nobgm = OUT / f"{C['episode']}-1080p30-nobgm.mp4"
cmd += ['-filter_complex', ';'.join(fc), '-map', '[v]', '-map', '[a]', '-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', str(nobgm)]
subprocess.run(cmd, check=True)
final = pathlib.Path(a.out).resolve() if a.out else (V / '../../../02_最终输出').resolve() / f"{C['episode']}-preview-1080p30.mp4"
plan_path = V / 'render/bgm-plan.json'; plan = json.loads(plan_path.read_text())
if OUTRO:
    for r in plan['muteRanges']:
        if '封底' in r['reason']: r['startSeconds'], r['endSeconds'] = round(body, 4), round(body + OUTRO['frames'] / FPS - 0.02, 4)
    plan_path.write_text(json.dumps(plan, ensure_ascii=False, indent=1))
stamp = time.strftime('%m%d-%H%M%S')
for f in (final, final.with_suffix('.bgm.json')):   # bgm.py 不覆盖已有输出：旧版连附属 json 一起挪进 out/old/（加时间戳，不覆盖更早的旧版）
    if f.exists(): (OUT / 'old').mkdir(exist_ok=True); f.replace(OUT / 'old' / f'{f.stem}.{stamp}{f.suffix}')
final.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(['python3', 'skills/fred-remotion-output/scripts/bgm.py', '--video', str(nobgm), '--plan', str(plan_path), '--output', str(final)], check=True, cwd=SKILL_ROOT)
sys.path.insert(0, str(V / 'render')); import loudness; loudness.check(final)   # 只报告，偏低时提示手动 --fix
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(final)], capture_output=True, text=True).stdout)
expect = body + (OUTRO['frames'] / FPS if OUTRO else 0)
print(f'成片 {final}\n  时长 {dur:.3f}s（期望 {expect:.3f}s）');
if abs(dur - expect) > 0.1: sys.exit('时长不符，检查各段时长与封底')
