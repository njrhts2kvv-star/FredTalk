"""分块计划（114 v2 定型）。每段切成 ≤CHUNK 帧的块；按“最长处理时间优先”分到各台服务器的渲染线。
  python3 render/plan.py S07          # 生成 plan.json，跳过 S07（还在返修的段）
  python3 render/plan.py --only S07   # 只打印 S07 的块（补渲用）
  python3 render/plan.py --status     # 已拉回块数 / 总块数
块名 = <段>_<起帧>-<止帧>，final.py 按同一规则排序拼接。"""
import json, pathlib, sys
V = pathlib.Path(__file__).resolve().parents[1]
T = json.loads((V / 'src/timing.json').read_text())
C = json.loads((V / 'episode.json').read_text())
CHUNK = 420                                   # 4K60 每块 ≤420 帧：单块 5–10 分钟，卡死时损失小
HEAVY = C.get('heavySegments', {})            # 录屏/长图/视频多的段更重
CL = C['cloud']

def chunks(sid):
    n = next(p['frames'] for p in T['pages'] if p['stableId'] == sid)
    k = -(-n // CHUNK); size = -(-n // k)
    return [(sid, a, min(n, a + size) - 1) for a in range(0, n, size)]

def all_chunks():
    return [c for p in T['pages'] for c in chunks(p['stableId'])]

if __name__ == '__main__':
    args = sys.argv[1:]
    if args and args[0] == '--only':
        for sid in args[1:]:
            for c in chunks(sid): print(*c)
        sys.exit()
    if args and args[0] == '--status':
        have = {f.stem for f in (V / 'out/chunks').glob('*.mp4') if not f.stem.endswith('.tmp')}
        allc = all_chunks(); missing = [f'{s}_{a}-{b}' for s, a, b in allc if f'{s}_{a}-{b}' not in have]
        print(f'已拉回 {len(allc) - len(missing)}/{len(allc)} 块'); print('缺：', ' '.join(missing) or '无')
        sys.exit()
    skip = set(args)
    jobs = sorted([c for c in all_chunks() if c[0] not in skip], key=lambda c: -(c[2] - c[1] + 1) * HEAVY.get(c[0], 1))
    lanes = {s: [[] for _ in range(n)] for s, n in CL['lanes'].items()}
    load = {(s, i): 0.0 for s, n in CL['lanes'].items() for i in range(n)}
    for c in jobs:                            # 最长处理时间优先（LPT）：每块放到完成最早的线
        w = (c[2] - c[1] + 1) * HEAVY.get(c[0], 1)
        s, i = min(load, key=lambda k: load[k] + w / CL['speed'][k[0]])
        lanes[s][i].append(list(c)); load[(s, i)] += w / CL['speed'][s]
    (V / 'render/plan.json').write_text(json.dumps({'chunk': CHUNK, 'skipped': sorted(skip), 'lanes': lanes}, indent=1))
    print(f'{len(jobs)} 块，跳过 {sorted(skip)}；各线负载：', {f'{s}{i}': round(v) for (s, i), v in load.items()})
