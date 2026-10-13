"""拼成片（按 114 v2/v3 的手工流程整理；整条脚本还没有完整跑过一期，第一次用时逐步核对）。顺序：
  1. 画面：按段顺序把静音分块只拷贝视频轨拼接（严格 60/1，不重编码，track timescale 60000）；
  2. 音效轨：本机渲整片 <EP>-FULL，传 noVoice（只含音效 + 插入段原声 + B-roll 原声）；
  3. 口播轨：最终录音在插入点切开，中间补插入段等长静音；
  4. 两轨 amix（normalize=0）后过 alimiter 压峰值——114 v2 直接整片叠加时爆过音；
  5. 封装（视频 copy，AAC 320k）→ 无 BGM 版；
  6. 用 Skill 的 bgm.py 按 render/bgm-plan.json 加 BGM，输出 episode.json 的 finalVideo（bgm.py 自己做 AAC 实测和峰值保护）。
用法：python3 render/final.py [--no-bgm]"""
import json, pathlib, subprocess, sys, tempfile
V = pathlib.Path(__file__).resolve().parents[1]
T = json.loads((V / 'src/timing.json').read_text())
C = json.loads((V / 'episode.json').read_text())
FPS = T['fps']; CH = V / 'out/chunks'; OUT = V / 'out'
FINAL = (V / C['finalVideo']).resolve()
import os
tools_root = os.environ.get('FREDTALK_ROOT')
if not tools_root: raise SystemExit('Set FREDTALK_ROOT to your FredTalk repository')
SKILL = pathlib.Path(tools_root)
BGM = os.environ.get('FREDTALK_BGM')
# 音效轨用冻结的 render/stage（与云端画面块同一份代码）；没有冻结时才用工作区 src
ENTRY = 'render/stage/src/index.tsx' if (V / 'render/stage/src/index.tsx').exists() else 'src/index.tsx'
run = lambda *a, **k: subprocess.run(a, check=True, **k)

order = []
for p in T['pages']:
    n = p['frames']; k = -(-n // 420); size = -(-n // k)
    order += [f"{p['stableId']}_{a}-{min(n, a + size) - 1}" for a in range(0, n, size)]
missing = [c for c in order if not (CH / f'{c}.mp4').exists()]
if missing: sys.exit('缺块：' + ' '.join(missing))

tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / 'v.txt').write_text(''.join(f"file '{CH / c}.mp4'\n" for c in order))
video = OUT / 'full-video.mp4'
run('ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'v.txt'), '-map', '0:v', '-c', 'copy',
    '-video_track_timescale', '60000', str(video))

sfx = OUT / 'full-sfx.wav'
run('npx', 'remotion', 'render', ENTRY, C['fullComposition'], str(sfx), '--codec=wav', '--props={"noVoice":true}', '--log=error', cwd=V)

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

nobgm = OUT / 'full-nobgm.mp4'
run('ffmpeg', '-v', 'error', '-y', '-i', str(video), '-i', str(mix), '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '320k', '-shortest', '-movflags', '+faststart', str(nobgm))
target = nobgm
if '--no-bgm' not in sys.argv:
    if not BGM: raise SystemExit('Set FREDTALK_BGM to your own music or use --no-bgm')
    FINAL.parent.mkdir(parents=True, exist_ok=True)
    run('python3', 'skills/fred-remotion-output/scripts/bgm.py', '--video', str(nobgm), '--plan', str(V / 'render/bgm-plan.json'),
        '--output', str(FINAL), '--bgm', BGM, cwd=SKILL)
    target = FINAL
probe = subprocess.run(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v:0', '-show_entries',
                        'stream=width,height,avg_frame_rate,nb_read_packets', '-of', 'csv=p=0', str(target)], capture_output=True, text=True).stdout.strip()
print(f'成片 {target}\n  {probe}（期望 3840,2160,60/1,{T["totalFrames"]}）')
