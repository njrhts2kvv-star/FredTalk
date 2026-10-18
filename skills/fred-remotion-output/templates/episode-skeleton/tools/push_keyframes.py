"""把关键帧推进本期审看前端（<期>/03_制作过程/review-app，页面代码来自 Skill 的 templates/review-app）。116 期定型。
- 首次运行：从 Skill 的 templates/review-app 拷页面代码（server.mjs / index.html / app.js / style.css / final.*），不拷 114 的意见和数据。
- 每次运行：按 src/timing.json + keyframes/plan/Sxx.json + keyframes/<dir>/Sxx_tt.tt.png 重写 review.json（改前自动备份），
  同时写一份最小 manifest（审看服务器校验它的 sha256）。Fred 已写的意见在 feedback.json，不动。
用法：python3 tools/push_keyframes.py [keyframes/v1]
启动：node ../../review-app/server.mjs 8160   （只监听 127.0.0.1）"""
import hashlib, json, os, pathlib, shutil, sys, time

V = pathlib.Path(__file__).resolve().parents[1]
WORK = V.parents[1]                                   # 03_制作过程
APP = WORK / 'review-app'
SRC_APP = pathlib.Path('/absolute/fredtalk/skills/fred-remotion-output/templates/review-app')
KF = (V / (sys.argv[1] if len(sys.argv) > 1 else 'keyframes/v1')).resolve()
PLAN = V / 'keyframes/plan'
E = json.loads((V / 'episode.json').read_text())
EPISODE_KEY = E.get('episodeKey', E['episode'])
EPISODE_TITLE = E.get('title', EPISODE_KEY)
AUTH_SOURCE = E.get('reviewAuthorization', 'Fred 当次要求：先出关键帧')
# keyframes/plan/titles.json：{段号: {title, route, plan}}；route 取 remotion / mixed / broll / insert，plan 写给 Fred 看的画面方案（用了哪个组件、哪些为本期单独写）
timing = json.loads((V / 'src/timing.json').read_text())
FPS = timing['fps']

def sha(p):
    return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()

def fp(v):
    return hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

APP.mkdir(exist_ok=True)
for f in ['server.mjs', 'index.html', 'app.js', 'style.css', 'final.html', 'final.js']:
    if not (APP / f).exists():
        shutil.copyfile(SRC_APP / f, APP / f)

# 最小 manifest：段落与时间（审看服务器只校验 sha256，内容供追溯）
manifest = {'episodeKey': EPISODE_KEY, 'timelineFps': FPS, 'totalFrames': timing['totalFrames'],
            'workflow': {'authorization': {'mode': 'keyframes-first', 'source': AUTH_SOURCE}},
            'pages': [{'stableId': p['stableId'], 'globalStartFrame': p['globalStartFrame'], 'durationInFrames': p['frames']} for p in timing['pages']]}
mpath = V.parent / 'manifest.json'
mpath.write_text(json.dumps(manifest, ensure_ascii=False, indent=1))

old = json.loads((APP / 'review.json').read_text()) if (APP / 'review.json').exists() else None
if old:
    shutil.copyfile(APP / 'review.json', APP / f'review.json.bak-{time.strftime("%Y%m%d-%H%M%S")}')
assets = {}

def asset(file):
    file = pathlib.Path(file).resolve()
    rel = os.path.relpath(file, APP)
    key = fp(rel)[:24]
    h = sha(file)
    assets[key] = dict(path=rel, sha256=h)
    return dict(url=f'/media/{key}?v={h[:12]}', sha256=h, assetId=key)

TITLES = json.loads((V / 'keyframes/plan/titles.json').read_text()) if (V / 'keyframes/plan/titles.json').exists() else {}
scenes = []
for p in timing['pages']:
    sid = p['stableId']
    g0 = p['globalStartFrame'] / FPS
    meta = json.loads((PLAN / f'{sid}.json').read_text()) if (PLAN / f'{sid}.json').exists() else []
    pngs = sorted(KF.glob(f'{sid}_*.png'), key=lambda f: float(f.stem.split('_')[1]))
    frames = []
    for f in pngs:
        t = float(f.stem.split('_')[1])
        note = next((m['note'] for m in meta if abs(float(m['t']) - t) < 0.011), '')
        frames.append(dict(id=f'kf-{sid}-{t:.2f}', timeSeconds=round(g0 + t, 3), label=f'{sid} 段内 {t:.2f}s',
                           spokenCue=(f'【{sid} {t:.2f}s】' + note) if note else '', **asset(f)))
    narration = ''.join(c['text'] for c in p['cues'])
    info = TITLES.get(sid, {})
    scene = dict(stableId=sid, title=info.get('title', sid), startSeconds=g0, endSeconds=(p['globalStartFrame'] + p['frames']) / FPS,
                 narration=narration, context=dict(narration=narration, timeMapping='global', timelineFps=FPS, durationInFrames=p['frames']),
                 frames=frames, videos=[], candidates=[],
                 suggestion=dict(suggested=info.get('route', 'remotion'), recommendation=info.get('plan', ''), suggestionReason=info.get('plan', '')),
                 existingProductionRoute=None, existingUserSelection=None)
    scene['identity'] = dict(keyframes=fp(['v1-keyframes', p, [fr['sha256'] for fr in frames]]), video=fp(['v1-video', p]), suggestion=fp(['v1-suggestion', p, info]))
    scenes.append(scene)

audio = asset(V / 'public/audio/voice-v3.wav')
review = dict(schemaVersion=1, templateVersion=1, episodeKey=EPISODE_KEY, title=EPISODE_TITLE, fps=FPS,
              versionLabel=E.get('keyframesLabel', '关键帧（真实录音）'), episodeRoot='../..', manifestPath=os.path.relpath(mpath, APP), manifestSha256=sha(mpath),
              segmentIndexes=[], audioUrl=audio['url'], audioReviewUrl=None, finalRegistration=None, deliveryAllowed=False,
              scenes=scenes, assets=assets)
review['version'] = fp({k: v for k, v in review.items() if k != 'assets'})
tmp = APP / 'review.json.tmp'
tmp.write_text(json.dumps(review, ensure_ascii=False, indent=2))
tmp.replace(APP / 'review.json')
print({s['stableId']: len(s['frames']) for s in scenes})
