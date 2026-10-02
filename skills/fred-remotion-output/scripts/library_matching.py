"""Shared visual-library categories and explainable narration-query matching.

This is a derived search view. It never changes selections, source identities,
review fingerprints or the approved catalog.
"""
from functools import lru_cache
import json
from pathlib import Path
import re


CONCEPTS = {
    'text': ('文字呈现', ('文字', '标题', '逐字', '刷出', '滚动', '短句', '遮罩', 'typing')),
    'input': ('输入与反馈', ('输入', '提示词', '发送', '对话', '聊天', '打字', 'prompt', 'input')),
    'process': ('流程与关系', ('流程', '步骤', '阶段', '协作', '分工', '判断', '分支', '汇聚', '关系')),
    'media': ('媒体与设备', ('媒体', '录屏', '横竖', '横屏', '竖屏', '图片', '视频', '作品', '手机', '电脑', '窗口', 'media')),
    'handoff': ('接力与让位', ('接力', '交接', '让位', '接管', '转场', '交换', '转入', '替换', '切换', 'handoff')),
    'focus': ('阅读与聚焦', ('聚焦', '高亮', '放大', '特写', '重点', '阅读', '全貌', '局部', '荧光笔', 'focus')),
    'data': ('数值与图表', ('数字', '数值', '图表', '百分比', '指标', '余量', '数量', 'metric')),
    'people': ('人物与反应', ('人物', '头像', '情绪', '角色', '手势', 'character')),
    'comparison': ('比较与对照', ('比较', '对比', '版本', '双列', '并列', 'comparison')),
    'summary': ('结论与收束', ('总结', '收束', '结论', '概括', 'summary')),
    'orientation': ('横竖画幅交接', ('横竖', '横屏', '竖屏', '横转竖', 'landscape', 'portrait')),
    'cards': ('卡片与容器', ('卡片', '胶囊', '卡组', '信息卡', 'card', 'pill')),
    'send': ('发送与提交', ('发送', '提交', 'send', 'submit')),
    'document': ('全文与文档', ('全文', '长文', '文档', '原文', '提示词', '报告', 'document')),
}

# These are production tasks, separate from objects and source collections.
USE_WORDS = {
    'explain': ('讲解', '一段', '解释', '15秒', '20秒', '15 秒', '20 秒', '段落'),
    'recording-focus': ('录屏聚焦', '蒙版', '遮罩', '标注', '高亮', '突出操作'),
    'images': ('图片', '作品', '作品墙', '结果图', '参考图'),
    'video-entry': ('录屏', '视频入场', '视频接入', '实操', '设备画面'),
    'handoff': ('交接', '转场', '过渡', '接力', '下一段', '下一步'),
    'data': ('图表', '柱状图', '饼图', '数值', '百分比'),
}


@lru_cache(maxsize=16)
def _usage(path, modified):
    del modified
    return json.loads(Path(path).read_text())


def usage_registry(root):
    path = Path(root) / 'skills/fred-remotion-output/references/visual-usage-registry.json'
    return _usage(str(path), path.stat().st_mtime_ns) if path.is_file() else {}


def use_ids(text):
    folded = str(text).casefold()
    return [key for key, words in USE_WORDS.items() if any(word in folded for word in words)]


@lru_cache(maxsize=16)
def _groups(path, modified):
    del modified
    text = Path(path).read_text()
    match = re.search(r'const\s+libraryGroups\s*=\s*', text)
    if not match:
        return []
    value, _ = json.JSONDecoder().raw_decode(text[match.end():])
    return value if isinstance(value, list) else []


def library_groups(root):
    path = Path(root) / 'tools/fred-motion-picker/web/library.js'
    return _groups(str(path), path.stat().st_mtime_ns) if path.is_file() else []


@lru_cache(maxsize=16)
def _curation(path, modified):
    del modified
    text = Path(path).read_text()
    result = {}
    for name, default in [('libraryMerged', {}), ('libraryRemoved', [])]:
        match = re.search(r'const\s+' + name + r'\s*=\s*', text)
        result[name] = json.JSONDecoder().raw_decode(text[match.end():])[0] if match else default
    return result


def library_merge_labels(root, entry):
    confirmed = usage_registry(root).get("confirmedMerges", {}).get(visual_label(entry))
    if confirmed:
        return [confirmed["representative"]]
    path = Path(root) / 'tools/fred-motion-picker/web/library.js'
    if not path.is_file(): return []
    rules = _curation(str(path), path.stat().st_mtime_ns)
    merged = rules['libraryMerged'].get(visual_label(entry), {})
    return [label.strip() for label in re.split('[、,]', merged.get('keep', '')) if label.strip()]


def library_disposition(root, entry):
    if visual_label(entry) in usage_registry(root).get("confirmedRemovals", {}):
        return "removed"
    if visual_label(entry) in usage_registry(root).get("confirmedMerges", {}):
        return "merged"
    path = Path(root) / 'tools/fred-motion-picker/web/library.js'
    if not path.is_file(): return None
    rules = _curation(str(path), path.stat().st_mtime_ns)
    label = visual_label(entry)
    if label in rules['libraryMerged']: return 'merged'
    if label in rules['libraryRemoved']: return 'removed'
    return None


def visual_label(entry):
    if entry.get('displayLabel'):
        return entry['displayLabel']
    number = entry.get('number')
    if number is None:
        return entry.get('id', '')
    if entry.get('recordType') == 'clip' or entry.get('episodeId') and not entry.get('media'):
        return 'E' + str(number).zfill(2)
    collection = entry.get('collectionId', '')
    prefix = 'V' if collection == 'previews-v2' else 'B' if collection == 'library-fred-20260913' else 'C'
    return prefix + str(number).zfill(3)


def concept_ids(text):
    folded = str(text).casefold()
    return [key for key, (_, words) in CONCEPTS.items() if any(word in folded for word in words)]


def match_metadata(root, entry):
    label = visual_label(entry)
    registry = usage_registry(root)
    usage = registry.get('entries', {}).get(label)
    if usage:
        categories = {row['id']: row['title'] for row in registry.get('categories', [])}
        sources = {row['id']: row['title'] for row in registry.get('sources', [])}
        # IDs and title remain searchable; example prose never infers new uses.
        category = categories.get(usage['primaryUse'], usage['primaryUse'])
        tags = list(dict.fromkeys(usage.get('tags', []) + [category, usage.get('scenarioTitle', '')]))
        search_text = ' '.join([str(entry.get('id', '')), label,
                               str(entry.get('title', '')), usage.get('action', ''),
                               usage.get('segmentRole', ''), ' '.join(tags),
                               sources.get(usage.get('sourceId'), '')])
        return {**{key: value for key, value in usage.items() if key != 'evidence'},
                'label': label, 'categoryId': usage['primaryUse'], 'category': category,
                'sceneTypes': list(entry.get('sceneTypes', [])), 'tags': tags,
                'searchText': search_text}
    groups = library_groups(root)
    group = next((group for group in groups if label in group.get('labels', [])), None)
    if group is None:
        group = next((group for group in groups if group.get('title') == entry.get('category')), None)
    category = group.get('title') if group else entry.get('category') or entry.get('group') or '按内容适配'
    search_text = ' '.join(str(entry.get(key, '')) for key in
                           ['id', 'displayLabel', 'title', 'summaryTitle', 'useWhen', 'motionDescription', 'preserve', 'tags'])
    concepts = concept_ids(search_text + ' ' + category)
    tags = list(dict.fromkeys([str(value) for value in entry.get('tags', [])] +
                             [category] + [CONCEPTS[key][0] for key in concepts]))
    return {'label': label, 'categoryId': group.get('id') if group else 'other',
            'category': category, 'sceneTypes': list(entry.get('sceneTypes', [])),
            'conceptIds': concepts, 'tags': tags,
            'searchText': search_text + ' ' + ' '.join(tags)}


def rank_references(root, entries, query):
    """Rank relationship matches; numeric labels and status filters stay upstream."""
    wanted = concept_ids(query)
    wanted_uses = use_ids(query)
    terms = [term.casefold() for term in re.split(r'[\s,，、/]+', query) if term]
    words = list(dict.fromkeys(word for key in wanted for word in CONCEPTS[key][1]
                              if word in query.casefold()))
    result = []
    for order, entry in enumerate(entries):
        metadata = match_metadata(root, entry)
        text = metadata['searchText'].casefold()
        matched = [key for key in wanted if key in metadata['conceptIds']]
        matched_uses = [key for key in wanted_uses if key in metadata.get('useIds', [])]
        literal = [term for term in terms if term in text]
        if not matched and not matched_uses and not literal:
            continue
        matched_words = [word for word in words if word in text]
        score = 100 * len(literal) + 25 * len(matched) + 12 * len(matched_words) + 50 * len(matched_uses)
        if wanted_uses and len(matched_uses) == len(wanted_uses):
            score += 60
        if wanted and len(matched) == len(wanted):
            score += 35
        reasons = [CONCEPTS[key][0] for key in matched] + ['原词命中：' + term for term in literal]
        row = dict(entry)
        row['matching'] = {key: value for key, value in metadata.items() if key != 'searchText'}
        row['matching'].update(score=score, matchedConceptIds=matched, matchedUseIds=matched_uses,
                               matchedWords=matched_words, reasons=reasons)
        result.append((score, order, row))
    return [row for _, _, row in sorted(result, key=lambda row: (-row[0], row[1]))]
