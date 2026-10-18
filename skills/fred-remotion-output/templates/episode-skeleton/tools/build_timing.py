"""整期时间轴：按最终录音的 SRT 切段，可在某个静音点插入固定过渡（如 109 过渡动画），输出 src/timing.json。
配置写在工程根目录 episode.json（字段见 templates/episode-skeleton/episode.example.json）。
timing.json 是全片唯一时间源：每段全片起点帧、帧数、段内字幕（段内秒）。场景代码用 shell.tsx 的 cue()/cueI() 取真实口播时间。
114 v2 用这个算法得到 18811 帧（与原版逐帧一致）。"""
import json, pathlib, re, sys
ROOT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
C = json.loads((ROOT / 'episode.json').read_text())
FPS = C.get('fps', 60)
SRT = (ROOT / C['srt']).resolve()
SEGS = [tuple(s) for s in C['segments']]          # [段号, 首条字幕序号, 末条字幕序号]（序号 1 起）
TAIL = C.get('tailSeconds', 0.6)                  # 片尾停留
INS = C.get('insert')                             # {afterSegment, cutSeconds, frames, id, cues[]} 或 null

def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
cues = []
raw = SRT.read_text(encoding='utf-8-sig').replace('\r\n', '\n').replace('\r', '\n')   # 去 BOM、统一换行
for block in re.split(r'\n\s*\n', raw.strip()):                                        # 多个空行也算一个分隔
    ln = [x for x in block.strip().split('\n') if x.strip()]
    if len(ln) < 2 or '-->' not in ln[1]: sys.exit(f'SRT 块格式不对：{block[:60]!r}')
    a, b = [x.strip() for x in ln[1].split('-->')]
    cues.append({'i': int(ln[0]), 'start': ts(a), 'end': ts(b), 'text': ' '.join(ln[2:])})
# —— 配置校验：段号不重复、字幕序号连续覆盖、插入点落在两段之间的静音里 ——
ids = [s[0] for s in SEGS]
if len(set(ids)) != len(ids): sys.exit('段号重复')
if SEGS[0][1] != 1 or SEGS[-1][2] != len(cues): sys.exit(f'分段没有覆盖全部字幕（共 {len(cues)} 条）')
for (s1, a1, b1), (s2, a2, b2) in zip(SEGS, SEGS[1:]):
    if not (a1 <= b1 and a2 == b1 + 1): sys.exit(f'{s1}→{s2} 字幕序号不连续')
AUDIO_END = C.get('audioEndSeconds') or cues[-1]['end']
CUT = INS['cutSeconds'] if INS else 1e9
if INS:
    if INS['afterSegment'] not in ids or INS['afterSegment'] == ids[-1]: sys.exit('insert.afterSegment 不存在或是最后一段')
    k = ids.index(INS['afterSegment']); last_end = cues[SEGS[k][2] - 1]['end']; next_start = cues[SEGS[k + 1][1] - 1]['start']
    if not last_end <= CUT <= next_start:
        sys.exit(f'insert.cutSeconds={CUT} 不在 {INS["afterSegment"]} 末句结束 {last_end} 与下一段首句开始 {next_start} 之间')
ins = INS['frames'] / FPS if INS else 0
g = lambda t: t if t < CUT else t + ins          # 录音秒 → 全片秒
fr = lambda t: round(t * FPS)
# 段界：相邻两段字幕的中点；插入点所在的接缝用插入点
bounds = [0.0]
for (sid, a1, b1), (_, a2, b2) in zip(SEGS, SEGS[1:]):
    bounds.append(CUT if INS and sid == INS['afterSegment'] else (cues[b1 - 1]['end'] + cues[a2 - 1]['start']) / 2)
pages = []
for k, (sid, a, b) in enumerate(SEGS):
    last = k + 1 == len(SEGS)
    after_ins = INS and k > 0 and SEGS[k - 1][0] == INS['afterSegment']
    start_f = fr(CUT + ins) if after_ins else fr(g(bounds[k]))
    end_f = fr(CUT) if INS and sid == INS['afterSegment'] else fr(g(AUDIO_END + TAIL if last else bounds[k + 1]))
    loc = [{'i': c['i'], 'start': round(g(c['start']) - start_f / FPS, 3), 'end': round(g(c['end']) - start_f / FPS, 3), 'text': c['text']}
           for c in cues[a - 1:b]]
    pages.append({'stableId': sid, 'globalStartFrame': start_f, 'frames': end_f - start_f, 'cues': loc})
    if INS and sid == INS['afterSegment']:
        pages.append({'stableId': INS.get('id', 'INSERT'), 'globalStartFrame': end_f, 'frames': INS['frames'],
                      'cues': [dict(i=0, **c) for c in INS.get('cues', [])]})
for p, q in zip(pages, pages[1:]):
    assert p['globalStartFrame'] + p['frames'] == q['globalStartFrame'], (p['stableId'], q['stableId'])
total = pages[-1]['globalStartFrame'] + pages[-1]['frames']
out = {'fps': FPS, 'audio': {'voice': C['voiceStatic'], 'cutAtSeconds': CUT if INS else None, 'insertFrames': INS['frames'] if INS else 0,
                             'insertId': INS.get('id', 'INSERT') if INS else None,
                             'insertBrand': INS.get('brand', 'dark') if INS else 'dark'},   # 125：过渡画面是浅色时写 "light"
       'totalFrames': total, 'pages': pages}
(ROOT / 'src/timing.json').write_text(json.dumps(out, ensure_ascii=False, indent=1))
for p in pages: print(p['stableId'], p['globalStartFrame'], p['frames'], round(p['frames'] / FPS, 2))
print('total', total, round(total / FPS, 3))
