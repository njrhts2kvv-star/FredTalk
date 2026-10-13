#!/usr/bin/env python3
"""Build a playable reference shelf from canonical choices and local media bindings."""
import argparse
import json
from pathlib import Path
from common import project_root, load_references, digest

CATEGORIES = {
    'summary': '标题、清单与结论', 'relationship': '关系、流程与分支',
    'device-demo': '设备操作与画面接管', 'metric-change': '数值、公式与比例',
    'image-comparison': '图片展示、对比与特写', 'prompt-reading': '原文阅读与重点提取',
    'search-process': '搜索与结果筛选', 'custom': '其他表达',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--collection', required=True)
    parser.add_argument('--status', choices=['keep', 'optional'], default='keep')
    args = parser.parse_args()
    root = project_root(args.project_root)
    registry, catalog = load_references(root)
    collection = next(x for x in registry['referenceCollections'] if x['id'] == args.collection)
    pack = root / collection['root']
    by_id = {x['id']: x for x in catalog['components']}
    records = [x for x in by_id.values() if x.get('collectionId') == args.collection]
    selected = {x['id'] for x in records if x['status'] == args.status and not x.get('canonicalId')}
    selected |= {x['canonicalId'] for x in records if x.get('canonicalId')
                 and by_id[x['canonicalId']]['status'] == args.status}
    bindings_path = pack / 'shelf-bindings.json'
    bindings = json.loads(bindings_path.read_text()) if bindings_path.is_file() else {}
    pages = {x['number']: x for x in json.loads((pack / 'manifest.json').read_text())['pages']}
    items = []
    for reference_id in selected:
        item = by_id[reference_id]
        if item['status'] != args.status or item.get('canonicalId'):
            raise ValueError('Shelf target does not match requested status: ' + reference_id)
        scene_type = item['sceneTypes'][0]
        aliases = [x['number'] for x in item.get('aliases', []) if x['collectionId'] == args.collection]
        if item.get('collectionId') == args.collection:
            number = item['number']
            page = pages[number]
            preview = str((root / item['media']['path']).relative_to(pack))
            code = str((root / item['sourceCode'][0]['path']).relative_to(pack))
            retention = item.get('motionDescription') or ' → '.join(cue['event'] for cue in page.get('cues', []))
            card = {'number': number, 'title': item['title'], 'preview': preview,
                    'poster': f'posters/{number:03d}.jpg', 'codeEntry': code,
                    'retentionNote': retention,
                    'editableParameters': item.get('editableParameters', []),
                    'assetNote': '；'.join(item.get('knownLimitations', [])) or '文字、几何与外部动效可编辑；真人、影视和部分真实界面内部使用可替换图片。',
                    'usageNote': '复制源码及对应素材到新一期工程，替换文案后按录音调整节奏。'}
        else:
            card = dict(bindings[reference_id])
            card.update(title=item.get('summaryTitle', item['title']) + '（沿用已有版本）',
                        retentionNote='沿用已有库的完整动作与准确源码。',
                        editableParameters=['按已有组件接口替换内容'],
                        assetNote='此卡沿用已有组件；查看代码可定位准确入口与依赖。')
        for key in ['preview', 'poster', 'codeEntry']:
            path = pack / card[key]
            if not path.is_file():
                raise ValueError('Missing shelf file: ' + str(path))
        if digest(pack / card['preview']) != item['referenceSha256']:
            raise ValueError('Shelf preview differs from selected source: ' + reference_id)
        card.update(referenceId=reference_id, status=item['status'], aliases=aliases,
                    sceneType=scene_type, category=CATEGORIES[scene_type],
                    purpose=item['useWhen'], keywords=item.get('tags', []))
        for field in ['displayLabel', 'approvalScope', 'reviewStatus', 'sourceReadiness', 'adaptationNeeds']:
            if field in item:
                card[field] = item[field]
        items.append(card)
    items.sort(key=lambda item: item['number'])
    new_count = sum(x.get('collectionId') == args.collection for x in map(by_id.get, selected))
    description = f'{new_count} 条新增动效 + {len(items)-new_count} 个沿用旧库的代表。按表达用途选择，原编号可搜索。'
    if args.status == 'optional':
        description = f'{len(items)} 条复刻候选，待你复看。可按内容借用代码；新视频需替换真实素材并按录音调整。'
    data = {'title': 'Fred · 复刻候选参考' if args.status == 'optional' else 'Fred · 精选动效参考',
            'description': description,
            'catalogSha256': registry['selectionCatalogSha256'], 'items': items}
    encoded = json.dumps(data, ensure_ascii=False)
    template = (root / 'skills/fred-remotion-output/templates/reference-shelf.html').read_text()
    marker = '<script id="catalog" type="application/json">'
    start = template.index(marker) + len(marker)
    end = template.index('</script>', start)
    (pack / 'index.html').write_text(template[:start] + encoded.replace('<', '\\u003c') + template[end:])
    (pack / 'shelf-data.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'cards': len(items), 'new': new_count, 'existing': len(items)-new_count, 'path': str(pack)}))


if __name__ == '__main__':
    main()
