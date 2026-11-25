"""分块计划（114 v2 定型）。每段切成 ≤CHUNK 帧的块，供 render/local.sh 逐块渲染、final.py 拼接。
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

HEAVY_CHUNK = 180                             # 116：带 4K 视频素材的重段一块 365 帧会超过 15 分钟超时，权重 ≥1.5 的段按 180 帧切

def chunks(sid):
    n = next(p['frames'] for p in T['pages'] if p['stableId'] == sid)
    cap = HEAVY_CHUNK if HEAVY.get(sid, 1) >= 1.5 else CHUNK
    k = -(-n // cap); size = -(-n // k)
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
        print(f'已渲好 {len(allc) - len(missing)}/{len(allc)} 块'); print('缺：', ' '.join(missing) or '无')
        sys.exit()
    skip = set(args)
    jobs = [list(c) for c in all_chunks() if c[0] not in skip]
    (V / 'render/plan.json').write_text(json.dumps({'chunk': CHUNK, 'skipped': sorted(skip), 'chunks': jobs}, indent=1))
    print(f'{len(jobs)} 块，跳过 {sorted(skip)}；用 bash render/local.sh <块名> ... 渲染')
