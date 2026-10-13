#!/usr/bin/env python3
"""新做组件工具：建工程、加组件、规则检查、逐帧检查图、入库登记。

只在 Fred 当次明确授权新做组件时使用；流程见 references/new-component-workflow.md，
固定规则见 DESIGN.md 第 2 节。所有外观、动效、字体、音效值都来自 templates/component-kit/src/kit。
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from common import project_root  # noqa: E402

SKILL_REL = 'skills/fred-remotion-output'
KIT_REL = SKILL_REL + '/templates/component-kit'
PUBLIC_REL = SKILL_REL + '/assets/component-kit-public'
RUNTIME_REL = ''  # Each portable kit installs its own locked npm dependencies
CATALOG_REL = 'skills/fred-remake/assets/preferred-motion/catalog.json'
ID_RE = re.compile(r'^([A-Z][0-9]{2}[a-z]?[0-9]?)-([A-Z][A-Za-z0-9]*)$')  # 返修版可加数字：T05b2
SCENES = ['真实操作录屏', '流程与关系', '对比', '章节与节奏', '开场与收尾', '数字与图表', '一句话观点',
          '截图/网页/文档聚焦', '产品与人物', '多图与作品', '输入与对话', '列举要点']

# 允许的非中性色：浅底紫、深底紫。中性灰（R≈G≈B）不限。其他颜色只能来自真实素材像素。
PALETTE = {'#8554e8', '#d6beff'}
# 常见缩写不算英文眉题
CAPS_OK = {'API', 'GPT', 'JSON', 'HTML', 'CSS', 'URL', 'SDK', 'CLI', 'MCP', 'PDF', 'PNG', 'MP4', 'TOKEN', 'TOKENS',
           'README', 'AGENTS', 'CLAUDE', 'ENV', 'KEY', 'APP', 'AIGC', 'IDE', 'GPU', 'CPU', 'RAM', 'UI', 'AI', 'MD',
           'SSH', 'HTTP', 'HTTPS', 'DNS', 'SQL', 'YAML', 'TOML', 'NPM', 'IOS', 'MAC', 'USB', 'LLM', 'RAG', 'OCR'}


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()


def now_iso():
    return datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')


def dump(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


# ---------- new / add ----------

def split_id(component_id):
    m = ID_RE.match(component_id)
    if not m:
        raise ValueError('组件 ID 格式应为 <场景码>-<英文名>，例如 T22a-PlanTimeline：' + component_id)
    return m.group(1), m.group(2)


def new_project(root, project, runtime_rel=RUNTIME_REL):
    project = Path(project)
    if project.exists() and any(project.iterdir()):
        raise ValueError('目标目录已存在且不为空：' + str(project))
    kit = root / KIT_REL
    (project / 'src/components').mkdir(parents=True, exist_ok=True)
    for name in ['package.json', 'package-lock.json', 'tsconfig.json']:
        shutil.copy2(kit / name, project / name)
    shutil.copytree(kit / 'src/kit', project / 'src/kit')
    for name in ['index.tsx', 'registry.ts']:
        shutil.copy2(kit / 'src' / name, project / 'src' / name)
    public = root / PUBLIC_REL
    if (root / 'library/catalog.json').is_file():
        manifest = json.loads((public / 'manifest.json').read_text())
        for item in manifest['files']:
            relative = Path(item['path'])
            if relative.is_absolute() or '..' in relative.parts:
                raise ValueError('Unsafe public kit asset path')
            asset = public / relative
            if not asset.is_file():
                asset = root / '.artifacts/objects' / item['sha256']
            if not asset.is_file() or sha(asset) != item['sha256']:
                raise ValueError('Missing or changed public kit asset: ' + str(relative) + '; run python3 scripts/assets.py download')
            target = project / 'public' / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(asset, target)
    else:
        for sub in ['fonts', 'brand', 'sfx']:
            shutil.copytree(public / sub, project / 'public' / sub)
    (project / 'public/media').mkdir(parents=True, exist_ok=True)
    (project / 'qc').mkdir(exist_ok=True)
    shutil.copy2(kit / 'BRIEF.md', project / 'qc/BRIEF.md')
    modules = root / runtime_rel / 'node_modules'
    if runtime_rel and modules.is_dir():
        os.symlink(os.path.relpath(modules, project), project / 'node_modules')
    return project


def add_component(root, project, component_id, title, change, scene, seconds=5):
    project = Path(project)
    if scene not in SCENES:
        raise ValueError('scene 必须是 12 个日常场景之一：' + '、'.join(SCENES))
    if not change.strip():
        raise ValueError('先写一句“观众要看懂的变化”（--change），再建组件')
    _, name = split_id(component_id)
    camel = name[0].lower() + name[1:]
    target = project / 'src/components' / (component_id + '.tsx')
    if target.exists():
        raise ValueError('组件文件已存在：' + str(target))
    text = (root / KIT_REL / 'component.template.tsx').read_text()
    for key, value in [('__ID__', component_id), ('__NAME__', name), ('__CAMEL__', camel),
                       ('__TITLE__', title), ('__CHANGE__', change)]:
        text = text.replace(key, value)
    target.write_text(text)
    registry = project / 'src/registry.ts'
    reg = registry.read_text()
    if '// @imports' not in reg or '// @entries' not in reg:
        raise ValueError('registry.ts 缺少 // @imports 或 // @entries 标记')
    imp = f"import {{ {name}, {camel}Defaults }} from './components/{component_id}';\n// @imports"
    entry = (f"  {{ id: '{component_id}', title: {json.dumps(title, ensure_ascii=False)}, scene: '{scene}', "
             f"change: {json.dumps(change, ensure_ascii=False)}, seconds: {seconds}, component: {name}, defaults: {camel}Defaults }},\n  // @entries")
    reg = reg.replace('// @imports', imp, 1).replace('  // @entries', entry, 1)
    registry.write_text(reg)
    return target


# ---------- lint ----------

def _neutral(hex_color):
    h = hex_color.lstrip('#')
    if len(h) in (3, 4):
        h = ''.join(c * 2 for c in h[:3])
    elif len(h) == 8:
        h = h[:6]
    if len(h) != 6:
        return True
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return max(r, g, b) - min(r, g, b) <= 14


def registry_rows(project):
    text = (Path(project) / 'src/registry.ts').read_text()
    rows = []
    for m in re.finditer(r"\{ id: '([^']+)', title: ('[^']*'|\"[^\"]*\"), scene: '([^']+)', (?:subtype: '[^']*', )?"
                         r"(?:change: (\"(?:[^\"\\]|\\.)*\"|'[^']*'), )?seconds: ([0-9.]+)", text):
        rows.append({'id': m.group(1), 'title': m.group(2)[1:-1], 'scene': m.group(3),
                     'change': (m.group(4) or '""')[1:-1], 'seconds': float(m.group(5))})
    return rows


def lint_component(path, public_dir):
    """返回 (errors, warnings)。只做静态检查；画面质量仍要看检查图。"""
    text = Path(path).read_text()
    errors, warnings = [], []
    name = Path(path).stem
    if not re.search(r'export type \w+Props\b', text):
        errors.append(f'{name}: 缺少导出的 Props 类型（内容必须走 props）')
    if not re.search(r'export const \w+Defaults\b', text):
        errors.append(f'{name}: 缺少导出的 Defaults（默认内容用真实素材）')
    if re.search(r'\bspring\s*\(', text) or re.search(r'import[^;]*\bspring\b[^;]*from\s+[\'"]remotion', text):
        errors.append(f'{name}: 不用 Remotion spring()；回弹用 kit 的 springAt，主曲线用 p()/q()')
    if 'Math.random' in text:
        errors.append(f'{name}: 渲染必须确定，不能用 Math.random')
    if re.search(r'from\s+[\'"]\.\./kit/(?!theme|ui)', text):
        warnings.append(f'{name}: 引用了 kit 之外的模块')
    for m in re.finditer(r'fontFamily\s*:\s*[\'"]([^\'"]+)[\'"]', text):
        errors.append(f'{name}: 字体写死为 “{m.group(1)}”；只用 S.body / S.display / S.mono / S.kai')
    for m in re.finditer(r'fontWeight\s*:\s*(\d+)', text):
        if m.group(1) not in {'400', '500', '600', '900'}:
            warnings.append(f'{name}: 字重 {m.group(1)} 没有对应字体文件（MiSans 500/600/900，锐字真言 400），会被合成')
    for m in re.finditer(r'#[0-9a-fA-F]{3,8}\b', text):
        color = m.group(0).lower()
        if not _neutral(color) and color not in PALETTE:
            warnings.append(f'{name}: 非规范颜色 {m.group(0)}；彩色只允许 #8554E8（浅底）/#D6BEFF（深底）')
    for m in re.finditer(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', text):
        r, g, b = (int(x) for x in m.groups())
        if max(r, g, b) - min(r, g, b) > 14:
            warnings.append(f'{name}: 非规范颜色 {m.group(0)}')
    for m in re.finditer(r'border\s*:\s*[`\'"][^`\'"]*solid', text):
        line = text[:m.start()].count('\n') + 1
        warnings.append(f'{name}:{line} 自制描边；卡片/胶囊默认无描边，只有点击环等有职责的笔画可用')
    for m in re.finditer(r'(linear|radial)-gradient\([^)]*(#8554e8|#d6beff|133,\s*84,\s*232)', text, re.I):
        warnings.append(f'{name}: 紫色渐变铺底；紫色只给当前关键词/选中项')
    sfx_names = {p.stem for p in Path(public_dir, 'sfx').glob('*.wav')}
    sfx_calls = list(re.finditer(r'<Sfx\b([^>]*)/>', text))
    for m in sfx_calls:
        attrs = m.group(1)
        n = re.search(r'name=["\']([^"\']+)["\']', attrs)
        if n and n.group(1) not in sfx_names:
            errors.append(f'{name}: 音效 {n.group(1)} 不在 public/sfx（可用：{"、".join(sorted(sfx_names))}）')
        v = re.search(r'volume=\{\s*([0-9.]+)\s*\}', attrs)
        if v and float(v.group(1)) > 0.5:
            errors.append(f'{name}: 音效音量 {v.group(1)} 超过 0.5')
    if not sfx_calls:
        warnings.append(f'{name}: 没有音效；主动作通常配一声')
    elif len(sfx_calls) > 5:
        warnings.append(f'{name}: {len(sfx_calls)} 个音效，偏多；一个主动作一声')
    defaults = re.search(r'export const \w+Defaults[^=]*=\s*(\{.*?\n\};)', text, re.S)
    if defaults:
        body = defaults.group(1)
        for m in re.finditer(r'[\'"]((?:media|brand|fonts)/[^\'"]+)[\'"]', body):
            if not Path(public_dir, m.group(1)).exists():
                errors.append(f'{name}: 默认素材不存在 public/{m.group(1)}')
        # 只看标签类字段；代码、配置、产品名等真实内容不算眉题
        for s in re.findall(r"\b(?:label|eyebrow|kicker|badge|tag|heading|caption|title|subtitle)\w*\s*:\s*'([^'\n]*)'", body, re.I):
            words = [w for w in re.findall(r'\b[A-Z]{3,}\b', s) if w not in CAPS_OK]
            if words and not re.search(r'[一-鿿]', s):
                warnings.append(f'{name}: 标签 “{s}” 是英文眉题；标签用中文（例：第一部分）')
        if re.search(r'(sk-[A-Za-z0-9]{12,}|ghp_[A-Za-z0-9]{12,}|AKIA[0-9A-Z]{12,})', body) and 'mask' not in text.lower():
            errors.append(f'{name}: 默认内容像真实密钥，且组件没有打码逻辑')
    return errors, warnings


def lint_project(root, project):
    project = Path(project)
    errors, warnings = [], []
    lock = json.loads((root / KIT_REL / 'kit.lock.json').read_text())
    current = {f: sha(project / 'src/kit' / f) for f in lock['files'] if (project / 'src/kit' / f).is_file()}
    if len(current) != len(lock['files']):
        errors += [f'缺少 src/kit/{f}' for f in lock['files'] if f not in current]
    elif current != lock['files']:
        old = next((c['version'] for c in lock.get('compatible', []) if c['files'] == current), None)
        if old is None:
            errors.append('src/kit 被改过；kit 是固定规则，改值需 Fred 同意并更新 templates/component-kit')
        else:
            warnings.append(f'src/kit 是旧版 v{old}（已入库组件可以保留；新做组件用当前版）')
    rows = registry_rows(project)
    ids = {r['id'] for r in rows}
    files = sorted((project / 'src/components').glob('*.tsx'))
    for p in files:
        if p.stem not in ids:
            warnings.append(f'{p.stem}: 没有登记到 src/registry.ts')
        e, w = lint_component(p, project / 'public')
        errors += e
        warnings += w
    for r in rows:
        if not (project / 'src/components' / (r['id'] + '.tsx')).is_file():
            errors.append(f"{r['id']}: registry 有登记但没有组件文件")
        if r['scene'] not in SCENES:
            warnings.append(f"{r['id']}: scene “{r['scene']}” 不在 12 个日常场景里")
        if not r['change']:
            warnings.append(f"{r['id']}: 没写“观众要看懂的变化”（registry 的 change）")
        if r['seconds'] < 1.5 or r['seconds'] > 8:
            warnings.append(f"{r['id']}: 时长 {r['seconds']}s；常规 5s，快过渡约 2s")
    return {'status': 'FAIL' if errors else 'PASS', 'components': len(files), 'errors': errors, 'warnings': warnings}


# ---------- sheet ----------

def default_frames(seconds):
    n = round(seconds * 60)
    return sorted({12, round(n * 0.3), round(n * 0.5), round(n * 0.7), n - 6})


def contact_sheet(project, component_id, frames=None, props=None, tag='', entry='src/index.tsx'):
    project = Path(project)
    row = next((r for r in registry_rows(project) if r['id'] == component_id), None)
    if row is None:
        raise ValueError('registry 里没有 ' + component_id)
    frames = frames or default_frames(row['seconds'])
    out_dir = project / 'qc' / (component_id + (('-' + tag) if tag else ''))
    if out_dir.exists():
        shutil.rmtree(out_dir)  # 清掉上一次的帧，避免旧图混进新检查图
    out_dir.mkdir(parents=True)
    stills = []
    for i, fr in enumerate(frames):
        png = out_dir / f'{i:02d}-f{fr}.png'
        cmd = ['npx', 'remotion', 'still', entry, component_id, str(png), f'--frame={fr}', '--log=error']
        if props:
            cmd.append('--props=' + str(Path(props).absolute()))
        subprocess.run(cmd, cwd=project, check=True)
        stills.append(png)
    sheet = project / 'qc' / f"{component_id}{('-' + tag) if tag else ''}-sheet.jpg"
    cols = 3
    rows_n = (len(stills) + cols - 1) // cols
    # 帧号写在单帧文件名里；拼图按文件名顺序排列，不依赖系统字体画标签
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-pattern_type', 'glob', '-i', str(out_dir / '*.png'),
                    '-vf', f'scale=640:-1,tile={cols}x{rows_n}:padding=8:color=white', '-frames:v', '1', '-q:v', '3', str(sheet)],
                   check=True)
    return sheet, frames


# ---------- intake ----------

def _usage_enums(root):
    skill = root / SKILL_REL
    usage = json.loads((skill / 'references/visual-usage-registry.json').read_text())
    routing = json.loads((skill / 'references/scene-routing.json').read_text())
    from library_matching import CONCEPTS
    return {
        'sceneTypes': {t['id'] for t in routing['types']},
        'useIds': {c['id'] for c in usage['categories']},
        'scenarioId': {s['id'] for s in usage['scenarios']},
        'conceptIds': set(CONCEPTS),
    }, usage


def props_of(component_file):
    text = Path(component_file).read_text()
    m = re.search(r'export type \w+Props = \{(.*?)\};', text, re.S)
    if not m:
        return []
    body = m.group(1)
    if '\n' not in body.strip():
        return re.findall(r'(\w+)\??:', body)
    return re.findall(r'^\s+(\w+)\??:', body, re.M)


def validate_intake(root, project, collection, accept, meta, renders):
    """入库前检查；返回错误列表（空表示可以入库）。"""
    errors = []
    enums, usage = _usage_enums(root)
    catalog = json.loads((root / CATALOG_REL).read_text())
    labels = {c.get('displayLabel') for c in catalog['components']}
    if not re.match(r'^[a-z0-9-]+-\d{8}$', collection):
        errors.append('集合名格式应为 <英文短名>-<YYYYMMDD>：' + collection)
    if (root / SKILL_REL / 'assets/reference-code' / collection).exists():
        errors.append('集合目录已存在：' + collection)
    lint = lint_project(root, project)
    errors += ['lint: ' + e for e in lint['errors']]
    rows = {r['id']: r for r in registry_rows(project)}
    for cid in accept:
        if cid not in rows:
            errors.append(f'{cid}: 不在工程 registry 里')
            continue
        code, _ = split_id(cid)
        if code in labels or code in usage['entries']:
            errors.append(f'{cid}: 编号 {code} 已被组件库占用，换一个场景码后缀')
        if not (Path(renders) / (cid + '.mp4')).is_file():
            errors.append(f'{cid}: 缺少认可成片 {Path(renders) / (cid + ".mp4")}')
        m = meta.get(cid)
        if not m:
            errors.append(f'{cid}: meta 里没有登记信息')
            continue
        for key in ['sceneTypes', 'useIds', 'conceptIds']:
            bad = [v for v in m.get(key, []) if v not in enums[key]]
            if not m.get(key) or bad:
                errors.append(f'{cid}: {key} 缺失或无效 {bad}（可选：{sorted(enums[key])}）')
        if m.get('primaryUse') not in enums['useIds']:
            errors.append(f'{cid}: primaryUse 无效')
        if m.get('scenarioId') not in enums['scenarioId']:
            errors.append(f'{cid}: scenarioId 无效（可选：{sorted(enums["scenarioId"])}）')
        for key in ['inputObjects', 'tags']:
            if not m.get(key):
                errors.append(f'{cid}: 缺少 {key}')
    return errors


def _probe(mp4):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,nb_frames', '-of', 'json', str(mp4)], capture_output=True, text=True, check=True)
    s = json.loads(out.stdout)['streams'][0]
    return int(s['width']), int(s['height']), int(s['nb_frames'])


def intake(root, project, collection, accept, reject, quote, meta, renders, title, task_quote='', supersede=None):
    """supersede：{新组件ID: 被替换的旧组件编号}。升级版/返修版入库后，旧版归档（不删），默认不再调用。"""
    supersede = supersede or {}
    project, renders = Path(project).absolute(), Path(renders).absolute()
    errors = validate_intake(root, project, collection, accept, meta, renders)
    from library_matching import visual_label
    labels_now = {visual_label(c): c for c in json.loads((root / CATALOG_REL).read_text())['components']}
    for new_id, old in supersede.items():
        if new_id not in accept:
            errors.append(f'supersede: {new_id} 不在本次认可列表里')
        if old not in labels_now:
            errors.append(f'supersede: 组件库里没有 {old}')
    if errors:
        raise ValueError('入库检查未通过：\n- ' + '\n- '.join(errors))
    skill = root / SKILL_REL
    dest = skill / 'assets/reference-code' / collection
    stamp = now_iso()
    sel_id = collection.rsplit('-', 1)[0] + '-user-' + collection.rsplit('-', 1)[1]
    usage_source = collection.rsplit('-', 1)[0]
    rel = lambda p: str(Path(p).relative_to(root))
    paths = {'catalog': root / CATALOG_REL, 'registry': skill / 'assets/dependency-registry.json',
             'usage': skill / 'references/visual-usage-registry.json', 'inventory': skill / 'assets/episode-code-inventory.json',
             'receipt': skill / 'verification/source-registrations.json'}
    backup = skill / 'assets/reference-archives' / (collection + '-intake')
    backup.mkdir(parents=True)
    for key in ['catalog', 'registry', 'usage']:
        shutil.copy2(paths[key], backup / (paths[key].stem + '-before.json'))

    # 1. 组件包：源码（不含被拒组件和测试入口）、公共素材、成片、核心帧
    src = dest / 'source'
    (src / 'src/components').mkdir(parents=True)
    for name in ['package.json', 'package-lock.json', 'tsconfig.json']:
        shutil.copy2(project / name, src / name)
    shutil.copytree(project / 'src/kit', src / 'src/kit')
    shutil.copytree(project / 'public', src / 'public')
    shutil.copy2(project / 'src/index.tsx', src / 'src/index.tsx')
    for cid in accept:
        shutil.copy2(project / 'src/components' / (cid + '.tsx'), src / 'src/components')
    reg_lines = (project / 'src/registry.ts').read_text().split('\n')
    drop = [c for c in [r['id'] for r in registry_rows(project)] if c not in accept]
    kept = [l for l in reg_lines if not any(f"'{c}'" in l or f"/{c}'" in l for c in drop)]
    (src / 'src/registry.ts').write_text('\n'.join(kept))
    (src / 'qc').mkdir()
    for p in (project / 'qc').glob('*.md'):
        shutil.copy2(p, src / 'qc' / p.name)
    (dest / 'previews').mkdir()
    (dest / 'thumbnails').mkdir()
    selection = {'id': sel_id, 'recordedAt': stamp, 'source': 'current chat user request', 'quote': quote,
                 'taskQuote': task_quote, 'accepted': accept, 'rejected': reject, 'supersedes': supersede,
                 'approvalBoundary': f'Fred accepted these {len(accept)} exact renders for library intake. '
                                     'New text, media, counts and narration cues still need capacity and visual checks.'}
    dump(dest / 'selection.json', selection)

    rows = {r['id']: r for r in registry_rows(project)}
    items, usage_entries, compositions = [], {}, []
    for cid in accept:
        code, symbol = split_id(cid)
        m = meta[cid]
        mp4 = dest / 'previews' / (cid + '.mp4')
        shutil.copy2(renders / (cid + '.mp4'), mp4)
        w, h, n = _probe(mp4)
        frames = []
        for fr in [round(n * 0.3), round(n * 0.6), n - 6]:
            jpg = dest / 'thumbnails' / f'{cid}-{fr}.jpg'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(mp4), '-vf', f'select=eq(n\\,{fr}),scale=960:-2',
                            '-frames:v', '1', '-q:v', '3', str(jpg)], check=True)
            frames.append({'path': str(jpg), 'sha256': sha(jpg), 'frame': fr})
        comp = src / 'src/components' / (cid + '.tsx')
        sources = [{'path': str(comp), 'sha256': sha(comp), 'symbol': symbol}] + [
            {'path': str(src / 'src' / f), 'sha256': sha(src / 'src' / f)} for f in ['kit/theme.ts', 'kit/ui.tsx', 'registry.ts']]
        title_text = rows[cid]['title']
        entry_point = str(src / 'src/index.tsx')
        item = {
            'id': usage_source + '-' + code.lower(), 'displayLabel': code, 'collectionId': collection, 'selectionSourceId': sel_id,
            'status': 'keep', 'defaultReuse': True, 'preferred': True, 'title': title_text, 'category': m.get('category', rows[cid]['scene']),
            'sceneTypes': m['sceneTypes'], 'tags': ['新做组件', code] + m['tags'], 'useWhen': title_text,
            'motionDescription': rows[cid]['change'] or title_text,
            'preserve': 'Keep the shared kit values and the one-action-per-component structure; change content only through props.',
            'basedOn': ['templates/component-kit (DESIGN.md §2 fixed rules)'], 'editableParameters': props_of(comp),
            'knownLimitations': ['New text/media/counts require a still check for overflow and readability.'] + m.get('limitations', []),
            'approvalScope': selection['approvalBoundary'], 'reviewStatus': 'user-accepted-exact-preview',
            'sourceReadiness': 'props-driven; kit lint passed; exact render verified', 'addedAt': stamp,
            'sourceFiles': sources, 'sourceCode': sources,
            'media': {'path': str(mp4), 'sha256': sha(mp4), 'duration': round(n / 60, 3), 'fps': 60, 'width': w, 'height': h},
            'coreFrames': frames, 'entryPoint': entry_point, 'compositionId': cid,
            'execution': {'entryPoint': entry_point, 'publicDir': str(src / 'public'), 'runtime': str(root / RUNTIME_REL),
                          'sourceBundle': collection, 'compositionId': cid, 'nativeTiming': {'fps': 60, 'durationInFrames': n}},
            'variants': [],
        }
        items.append(item)
        compositions.append({'id': cid, 'fps': 60, 'durationInFrames': n, 'width': w, 'height': h})
        usage_entries[code] = {
            'referenceId': item['id'], 'primaryUse': m['primaryUse'], 'useIds': m['useIds'], 'sourceId': usage_source,
            'conceptIds': m['conceptIds'], 'inputObjects': m['inputObjects'], 'action': rows[cid]['change'] or title_text,
            'segmentRole': '新做参数化组件（Fred 认可入库）', 'nativeDurationSeconds': round(n / 60, 3),
            'adaptation': '只通过 props 换文字、素材、数量；新内容先出静帧检查容量与可读性。',
            'tags': ['新做组件', code] + m['tags'], 'evidence': {'selectionSourceId': sel_id},
            'scenarioId': m['scenarioId'], 'addedAt': stamp,
        }
    dump(dest / 'manifest.json', {'schemaVersion': 1, 'collectionId': collection, 'addedAt': stamp,
                                  'sourceRuntime': {'remotion': '4.0.515', 'react': '19.2.4'},
                                  'selection': {'path': str(dest / 'selection.json'), 'sha256': sha(dest / 'selection.json')},
                                  'components': items})

    # 2. 用途登记
    usage = json.loads(paths['usage'].read_text())
    titles = {s['id']: s['title'] for s in usage['scenarios']}
    for v in usage_entries.values():
        v['scenarioTitle'] = titles[v['scenarioId']]
    usage['entries'].update(usage_entries)
    archived = usage.setdefault('archivedReferences', {})
    order = len(archived)
    from library_matching import visual_label
    cat_now = {visual_label(c): c for c in json.loads(paths['catalog'].read_text())['components']}
    for new_id, old_label in supersede.items():
        order += 1
        archived[old_label] = {'referenceId': cat_now[old_label]['id'], 'order': order, 'archivedAt': stamp,
                               'archivePath': rel(backup), 'defaultReuse': False, 'libraryVisibility': 'visible-at-tail',
                               'archiveId': collection + '-supersede', 'reason': 'superseded',
                               'duplicateOf': split_id(new_id)[0]}
    if not any(s['id'] == usage_source for s in usage['sources']):
        usage['sources'].append({'id': usage_source, 'title': title})
    dump(paths['usage'], usage)

    # 3. 组件目录
    catalog = json.loads(paths['catalog'].read_text())
    catalog['components'].extend(items)
    catalog['counts']['keep'] = catalog['counts'].get('keep', 0) + len(items)
    catalog['catalogRevision'] = collection
    from library_matching import visual_label
    by_label = {visual_label(c): c for c in catalog['components']}
    new_code = {cid: split_id(cid)[0] for cid in accept}
    archive_id = collection + '-supersede'
    for new_id, old_label in supersede.items():
        entry = by_label[old_label]
        entry.update({'defaultReuse': False, 'archiveId': archive_id, 'supersededBy': usage_source + '-' + new_code[new_id].lower()})
    catalog['selectionSources'].append({'id': sel_id, 'path': str(dest / 'selection.json'), 'sha256': sha(dest / 'selection.json'),
                                        'kind': 'user-exact-new-component-acceptance', 'recordedAt': stamp})
    dump(paths['catalog'], catalog)

    # 4. 文件清单、登记回执、依赖登记
    inv = json.loads(paths['inventory'].read_text())
    known = {f['path'] for f in inv['files']}
    for p in sorted(dest.rglob('*')):
        if p.is_file() and rel(p) not in known:
            inv['files'].append({'path': rel(p), 'sha256': sha(p), 'bytes': p.stat().st_size})
    dump(paths['inventory'], inv)
    receipt = json.loads(paths['receipt'].read_text())
    receipt['results'].append({'id': collection, 'entryPoint': rel(src / 'src/index.tsx'), 'runtime': RUNTIME_REL, 'status': 'PASS',
                               'checkedAt': stamp, 'compositions': compositions,
                               'scope': 'component_kit.py intake: kit lint passed; exact renders probed.'})
    dump(paths['receipt'], receipt)
    reg = json.loads(paths['registry'].read_text())
    reg['selectionCatalogSha256'] = sha(paths['catalog'])
    reg['catalogRevision'] = collection
    reg['counts']['keep'] = reg['counts'].get('keep', 0) + len(items)
    reg['referenceCollections'].append({'id': collection, 'root': rel(dest), 'selectionSourceId': sel_id,
                                        'registrationStatuses': ['keep'], 'addedAt': stamp, 'publicationStatus': 'local-only',
                                        'sourceReadiness': f'props-driven package; {len(items)} exact renders'})
    reg['episodeBundles'].append({'id': collection, 'root': rel(src), 'entryPoint': rel(src / 'src/index.tsx'),
                                  'publicDir': rel(src / 'public'), 'runtime': RUNTIME_REL,
                                  'scope': f'Fred accepted {len(items)} exact renders; content changes go through props and need new checks.'})
    reg['inventorySha256'] = sha(paths['inventory'])
    reg['registrationReceipt']['sha256'] = sha(paths['receipt'])
    dump(paths['registry'], reg)
    return {'collection': collection, 'components': len(items), 'addedAt': stamp, 'backup': str(backup)}


# ---------- cloud script / preview ----------

RENDER_SH = """#!/bin/bash
# component_kit.py cloud-script 生成：逐条渲染 1080p60 H.264（CRF15，JPEG95），带组件内音效；每条渲完核对规格。
# 组件 ID 写死在下面，避免浏览器下载日志混进 ID 列表（2026-10-12 实际踩过）。
set -u
cd "$(dirname "$0")/.."
[ -f ~/fred-render/env.sh ] && source ~/fred-render/env.sh
mkdir -p out
npx remotion browser ensure </dev/null >/dev/null 2>&1
IDS="{ids}"
START=$(date +%s)
for ID in $IDS; do
  T0=$(date +%s)
  npx remotion render src/index.tsx "$ID" "out/$ID.mp4" --codec=h264 --crf=15 --jpeg-quality=95 --concurrency=8 --log=error </dev/null
  RC=$?
  INFO=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 "out/$ID.mp4" 2>/dev/null)
  AUD=$(ffprobe -v error -select_streams a:0 -show_entries stream=codec_name -of csv=p=0 "out/$ID.mp4" 2>/dev/null)
  echo "DONE $ID rc=$RC video=$INFO audio=${{AUD:-none}} sec=$(( $(date +%s) - T0 ))"
done
echo "ALL_DONE total_sec=$(( $(date +%s) - START ))"
(cd out && (sha256sum *.mp4 2>/dev/null || shasum -a 256 *.mp4) > sha256.txt)
"""


def cloud_script(project, ids=None):
    project = Path(project)
    rows = registry_rows(project)
    ids = ids or [r['id'] for r in rows]
    unknown = [i for i in ids if i not in {r['id'] for r in rows}]
    if unknown:
        raise ValueError('registry 里没有：' + '、'.join(unknown))
    out = project / 'cloud/render-all.sh'
    out.parent.mkdir(exist_ok=True)
    out.write_text(RENDER_SH.format(ids=' '.join(ids)))
    out.chmod(0o755)
    return out


PREVIEW_HEAD = """<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title>
<style>:root{{--bg:#f6f5f2;--card:#fff;--ink:#19191c;--muted:#6c6c72;--line:#e3e1dc}}
@media (prefers-color-scheme:dark){{:root{{--bg:#121214;--card:#1c1c20;--ink:#ececef;--muted:#9a9aa3;--line:#2c2c32}}}}
body{{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 -apple-system,"PingFang SC",sans-serif}}main{{max-width:1280px;margin:0 auto;padding:28px 24px 60px}}
h1{{font-size:24px;margin:0 0 4px}}.sub{{color:var(--muted);margin:0 0 18px}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:16px}}
article{{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}}video{{width:100%;display:block;background:#000;aspect-ratio:16/9}}
.meta{{display:flex;justify-content:space-between;gap:8px;padding:10px 14px 0}}.meta span{{color:var(--muted);font-size:13px}}p{{margin:4px 14px 12px}}.change{{color:var(--muted);font-size:13px}}
@media (max-width:640px){{main{{padding:20px 16px}}.grid{{grid-template-columns:1fr}}}}</style></head>
<body><main><h1>{title}</h1><p class="sub">{sub}</p><div class="grid">"""


def preview_page(project, renders, title='新组件候选'):
    import html
    project, renders = Path(project), Path(renders)
    cards = []
    for r in registry_rows(project):
        mp4 = renders / (r['id'] + '.mp4')
        if not mp4.is_file():
            continue
        src = os.path.relpath(mp4, project)
        secs = ('%g' % r['seconds'])
        cards.append(f'<article><video src="{html.escape(src)}" controls preload="metadata" playsinline></video>\n'
                     f'<div class="meta"><b>{html.escape(r["id"])}</b><span>{html.escape(r["scene"])} · {secs} 秒</span></div>'
                     f'<p>{html.escape(r["title"])}' + (f'<br><span class="change">{html.escape(r["change"])}</span>' if r['change'] else '') + '</p></article>')
    if not cards:
        raise ValueError('渲染目录里没有与 registry 对应的 MP4：' + str(renders))
    out = project / '预览新组件.html'
    out.write_text(PREVIEW_HEAD.format(title=html.escape(title), sub=f'{len(cards)} 条，均为候选，Fred 认可后再入库。')
                   + ''.join(cards) + '</div></main></body></html>\n')
    return out


# ---------- CLI ----------

def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--project-root')
    sub = ap.add_subparsers(dest='cmd', required=True)
    a = sub.add_parser('new', help='从固定基础库建一个新组件工程')
    a.add_argument('project')
    b = sub.add_parser('add', help='在工程里加一个组件（先写清观众要看懂的变化）')
    b.add_argument('project')
    b.add_argument('--id', required=True, help='例：T22a-PlanTimeline')
    b.add_argument('--title', required=True)
    b.add_argument('--change', required=True, help='观众要看懂的变化：谁 → 变成什么')
    b.add_argument('--scene', required=True, choices=SCENES)
    b.add_argument('--seconds', type=float, default=5)
    c = sub.add_parser('lint', help='按 DESIGN.md 固定规则静态检查')
    c.add_argument('project')
    d = sub.add_parser('sheet', help='渲染关键帧并拼成检查图')
    d.add_argument('project')
    d.add_argument('id')
    d.add_argument('--frames', help='逗号分隔帧号；默认开场、30/50/70%%、末帧')
    d.add_argument('--props', help='换一组内容（JSON 文件）做容量测试')
    d.add_argument('--tag', default='')
    d.add_argument('--entry', default='src/index.tsx', help='多人并行时用自己的测试入口，只编译自己的组件')
    e = sub.add_parser('intake', help='把 Fred 认可的组件登记进组件库')
    e.add_argument('project')
    e.add_argument('--collection', required=True)
    e.add_argument('--accept', required=True, help='逗号分隔组件 ID')
    e.add_argument('--reject', default='')
    e.add_argument('--quote', required=True, help='Fred 认可原话')
    e.add_argument('--task-quote', default='')
    e.add_argument('--meta', required=True, help='每个组件的用途登记 JSON')
    e.add_argument('--renders', required=True, help='认可成片目录（<ID>.mp4）')
    e.add_argument('--title', required=True, help='集合中文名')
    e.add_argument('--supersede', default='', help='新ID=旧编号，逗号分隔；升级版入库后旧版归档')
    e.add_argument('--dry-run', action='store_true')
    f = sub.add_parser('cloud-script', help='生成云端逐条渲染脚本 cloud/render-all.sh')
    f.add_argument('project')
    f.add_argument('--ids', help='逗号分隔；默认 registry 全部')
    g = sub.add_parser('preview', help='生成一页看完全部成片的预览页')
    g.add_argument('project')
    g.add_argument('--renders', required=True)
    g.add_argument('--title', default='新组件候选')
    h = sub.add_parser('review', help='启动选片页（保留/要改/不要 + 备注，升级版与原版并排）')
    h.add_argument('project')
    h.add_argument('--renders', required=True)
    h.add_argument('--port', type=int, default=3072)
    h.add_argument('--title', default='新组件选片')
    args = ap.parse_args(argv)
    # 先按 --project-root / 当前目录找 FredTalk 项目；在新工程目录里运行时，退回脚本所在的项目
    try:
        root = project_root(args.project_root)
    except ValueError:
        root = project_root(Path(__file__).resolve().parents[3])
    try:
        if args.cmd == 'new':
            print(new_project(root, args.project))
        elif args.cmd == 'add':
            print(add_component(root, args.project, args.id, args.title, args.change, args.scene, args.seconds))
        elif args.cmd == 'lint':
            result = lint_project(root, args.project)
            print(json.dumps(result, ensure_ascii=False, indent=2))
            return 0 if result['status'] == 'PASS' else 1
        elif args.cmd == 'sheet':
            frames = [int(x) for x in args.frames.split(',')] if args.frames else None
            sheet, used = contact_sheet(args.project, args.id, frames, args.props, args.tag, args.entry)
            print(json.dumps({'sheet': str(sheet), 'frames': used}, ensure_ascii=False))
        elif args.cmd == 'cloud-script':
            print(cloud_script(args.project, [x for x in (args.ids or '').split(',') if x] or None))
        elif args.cmd == 'preview':
            print(preview_page(args.project, args.renders, args.title))
        elif args.cmd == 'review':
            # 选片结果写入 <工程>/qc/decisions.json；升级版对应的原版写在 <工程>/qc/replaces.json
            return subprocess.call([sys.executable, str(root / KIT_REL / 'review/server.py'), str(args.project),
                                    '--renders', str(args.renders), '--catalog', str(root / CATALOG_REL),
                                    '--port', str(args.port), '--title', args.title])
        elif args.cmd == 'intake':
            if (root / 'library/catalog.json').is_file():
                raise ValueError('Portable intake requires a separate release review; build and inspect the kit, then contribute its exact source/media package. The published catalog is not mutated automatically.')
            accept = [x for x in args.accept.split(',') if x]
            reject = [x for x in args.reject.split(',') if x]
            meta = json.loads(Path(args.meta).read_text())
            supersede = dict(x.split('=', 1) for x in args.supersede.split(',') if x)
            if args.dry_run:
                errs = validate_intake(root, Path(args.project).absolute(), args.collection, accept, meta, args.renders)
                print(json.dumps({'status': 'FAIL' if errs else 'PASS', 'errors': errs}, ensure_ascii=False, indent=2))
                return 1 if errs else 0
            print(json.dumps(intake(root, args.project, args.collection, accept, reject, args.quote, meta,
                                    args.renders, args.title, args.task_quote, supersede), ensure_ascii=False, indent=2))
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
