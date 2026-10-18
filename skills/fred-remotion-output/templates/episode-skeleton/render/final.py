"""拼成片（114 v2/v3 整理，116 期完整跑通并补了封底、时间基统一、时长核对）。顺序：
  1. 画面：按段顺序把静音分块只拷贝视频轨拼接（严格 60/1，不重编码，时间基统一 1/90000；封底接在最后）；
  2. 音效轨：本机渲整片 <EP>-FULL，传 noVoice（只含音效 + 插入段原声 + B-roll 原声）；
  3. 口播轨：最终录音在插入点切开，中间补插入段等长静音；
  4. 两轨 amix（normalize=0）后过 alimiter 压峰值——114 v2 直接整片叠加时爆过音；
  5. 封装（视频 copy，AAC 320k）→ 无 BGM 版；
  6. 用 Skill 的 bgm.py 按 render/bgm-plan.json 加 BGM，输出 episode.json 的 finalVideo（bgm.py 自己做 AAC 实测和峰值保护）。
用法：python3 render/final.py [--no-bgm]      REUSE_SFX=1 沿用已渲好的 out/full-sfx.wav（代码没变时省十几分钟）
封底：episode.json 写 "outro": {picture, audio, frames}（Fred 封底素材在 Skill 的 assets/outro-local-only/）；bgm-plan.json 里 reason 含“封底”的让位区间由本脚本自动填写。"""
import json, pathlib, subprocess, sys, tempfile, time
V = pathlib.Path(__file__).resolve().parents[1]
T = json.loads((V / 'src/timing.json').read_text())
C = json.loads((V / 'episode.json').read_text())
FPS = T['fps']; CH = V / 'out/chunks'; OUT = V / 'out'
FINAL = (V / C['finalVideo']).resolve()
import os
SKILL = pathlib.Path(os.environ.get('FRED_TOOLS_ROOT', '/absolute/fredtalk'))   # 正式工作目录
# 音效轨用冻结的 render/stage（与云端画面块同一份代码）；没有冻结时才用工作区 src
ENTRY = 'render/stage/src/index.tsx' if (V / 'render/stage/src/index.tsx').exists() else 'src/index.tsx'
run = lambda *a, **k: subprocess.run(a, check=True, **k)

# 块的时间基必须一致（云端块 1/90000）；不一致的先重封装再拼
order = []
sys.path.insert(0, str(V / 'render'))
from plan import chunks   # 与 plan.py 同一切块规则（含重段小块）
for p in T['pages']:
    order += [f'{s}_{a}-{b}' for s, a, b in chunks(p['stableId'])]
missing = [c for c in order if not (CH / f'{c}.mp4').exists()]
if missing: sys.exit('缺块：' + ' '.join(missing))

tmp = pathlib.Path(tempfile.mkdtemp())
OUTRO = C.get('outro')   # 封底：画面接在最后一块后，自带混音接在正文音轨后，BGM 让位
def tb90k(path):   # 时间基不是 1/90000 的（封底、手工拼回的块）先无损重封装，否则 concat 会把它压成一瞬间
    tb = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=time_base', '-of', 'csv=p=0', str(path)],
                        capture_output=True, text=True).stdout.strip().rstrip(',')
    if tb == '1/90000': return path
    fixed = tmp / (pathlib.Path(path).stem + '.tb90k.mp4')
    run('ffmpeg', '-v', 'error', '-y', '-i', str(path), '-c', 'copy', '-video_track_timescale', '90000', str(fixed))
    print(f'  {pathlib.Path(path).name}: 时间基 {tb} → 1/90000'); return fixed
parts = [tb90k(CH / f'{c}.mp4') for c in order] + ([tb90k((V / OUTRO['picture']).resolve())] if OUTRO else [])
(tmp / 'v.txt').write_text(''.join(f"file '{x}'\n" for x in parts))
video = OUT / 'full-video.mp4'
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'v.txt'), '-map', '0:v', '-c', 'copy',
    '-video_track_timescale', '90000', str(video))

sfx = OUT / 'full-sfx.wav'
if not (os.environ.get('REUSE_SFX') and sfx.exists()):   # REUSE_SFX=1：沿用已渲好的音效轨（代码未变时）
    import shutil
    # 120 期：给这次渲染一个独占的临时目录，结束整个删掉——打包缓存不会攒在系统临时目录，也不会误删别的进程正在用的
    priv = tempfile.mkdtemp(prefix='fred-remotion-')
    try:
        run('npx', 'remotion', 'render', ENTRY, C['fullComposition'], str(sfx), '--codec=wav', '--props={"noVoice":true}', '--log=error', cwd=V,
            env={**os.environ, 'TMPDIR': priv + '/'})
    finally:
        shutil.rmtree(priv, ignore_errors=True)

voice_src = V / 'public' / T['audio']['voice']; voice = OUT / 'full-voice.wav'; dur = T['totalFrames'] / FPS
if T['audio'].get('insertFrames'):
    cut, ins = T['audio']['cutAtSeconds'], T['audio']['insertFrames'] / FPS
    run('ffmpeg', '-v', 'error', '-y', '-i', str(voice_src), '-filter_complex',
        f"[0:a]atrim=0:{cut},asetpts=N/SR/TB[a];[0:a]atrim={cut},asetpts=N/SR/TB[b];"
        f"anullsrc=r=48000:cl=stereo,atrim=0:{ins}[s];[a]aresample=48000[a2];[b]aresample=48000[b2];[a2][s][b2]concat=n=3:v=0:a=1,apad,atrim=0:{dur}[o]",
        '-map', '[o]', str(voice))
else:
    run('ffmpeg', '-v', 'error', '-y', '-i', str(voice_src), '-af', f'aresample=48000,apad,atrim=0:{dur}', str(voice))
mix = OUT / 'full-mix.wav'
run('ffmpeg', '-v', 'error', '-y', '-i', str(voice), '-i', str(sfx), '-filter_complex',
    '[0:a][1:a]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.79:attack=3:release=80:level=false[o]', '-map', '[o]', '-ar', '48000', str(mix))

if OUTRO:   # 正文混音 + 封底原混音（采样拼接，不再压一次）
    body = OUT / 'full-mix-body.wav'; mix.replace(body)
    run('ffmpeg', '-v', 'error', '-y', '-i', str(body), '-i', OUTRO['audio'], '-filter_complex',
        '[0:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[a];[1:a]aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[b];[a][b]concat=n=2:v=0:a=1[o]',
        '-map', '[o]', '-c:a', 'pcm_f32le', str(mix))
    plan = json.loads((V / 'render/bgm-plan.json').read_text())
    for r in plan['muteRanges']:
        if '封底' in r['reason']: r['startSeconds'], r['endSeconds'] = round(dur, 4), round(dur + OUTRO['frames'] / FPS - 0.02, 4)  # 末端留 0.02s，避免浮点超出片长（119）
    (V / 'render/bgm-plan.json').write_text(json.dumps(plan, ensure_ascii=False, indent=1))
nobgm = OUT / 'full-nobgm.mp4'
run('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-i', str(mix), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', str(nobgm))
target = nobgm
if '--no-bgm' not in sys.argv:
    FINAL.parent.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime('%m%d-%H%M%S')   # bgm.py 不覆盖已有成片：旧版连附属 .bgm.json（120 期漏挪导致报错）一起挪进 out/old/，加时间戳不覆盖更早的旧版
    for f in (FINAL, FINAL.with_suffix('.bgm.json')):
        if f.exists(): (OUT / 'old').mkdir(exist_ok=True); f.replace(OUT / 'old' / f'{f.stem}.{stamp}{f.suffix}')
    run('python3', 'skills/fred-remotion-output/scripts/bgm.py', '--video', str(nobgm), '--plan', str(V / 'render/bgm-plan.json'),
        '--output', str(FINAL), cwd=SKILL)
    target = FINAL
    sys.path.insert(0, str(V / 'render')); import loudness; loudness.check(FINAL)   # 120 期：只报告响度，偏低时提示手动补（BGM 规则不自动补偿增益）
probe = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height,avg_frame_rate,nb_read_packets', '-of', 'csv=p=0', str(target)], capture_output=True, text=True).stdout.strip()
expect_frames = T["totalFrames"] + (OUTRO["frames"] if OUTRO else 0)
print(f'成片 {target}\n  {probe}（期望 3840,2160,60/1,{expect_frames}）')
# 116 教训：帧数对、时长不对时（时间基不一致被压缩），画面会在拼接处“定住”。时长也核对。
dur_real = float(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', str(target)],
                                capture_output=True, text=True).stdout.strip().rstrip(','))
if abs(dur_real - expect_frames / FPS) > 0.1:
    sys.exit(f'时长不符：{dur_real:.3f}s，期望 {expect_frames / FPS:.3f}s——检查各块和外部片段的时间基（应为 1/90000）')
print(f'  时长 {dur_real:.3f}s 与帧数一致')
