#!/usr/bin/env python3
"""Generate the human-readable rules and complete guide from maintained sources."""
import argparse
import re
from pathlib import Path
from common import project_root
from feedback import load_feedback


def absolute_links(text, directory):
    def replace(match):
        label, target = match.groups()
        if target.startswith(('http:', 'https:', '/', '#', '<')):
            return match.group(0)
        return f'[{label}](<{directory / target}>)'
    return re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace, text)


def build(root):
    skill = root / 'skills/fred-remotion-output'
    data = load_feedback(root)
    sections = [
        '# 历史偏好与防错规则',
        '本文件从 `feedback-rules.json` 生成。规则来自跨期多轮原始反馈及最新维护确认；F17另标为实际渲染诊断。'
        '每条按触发条件使用，保留例外；用户最新要求与最新准确选片优先，不新增组件批准。',
        '本全表仅用于审计、追溯与维护；日常先用scene.py取单场景小抄。`scripts/references.py --kind rules --id F02`查具体原话；'
        '普通组件/片段查询同时返回相关 `guidance`。`--episode` 筛选证据来源期数。'
        '落实到现有分镜/修订记录的实际状态和检查，不另建审批流程。',
        '| ID | 场景与问题 | 来源期数 |\n| --- | --- | --- |'
    ]
    sections += [f'| {r["id"]} | {r["title"]} | {"、".join(r["episodes"])} |' for r in data['rules']]
    for rule in data['rules']:
        sections += ['', '## ' + rule['id'] + ' · ' + rule['title'],
                     '**触发：**' + rule['when'], '**优先做法**',
                     '\n'.join('- ' + x for x in rule['prefer']), '**避免重犯**',
                     '\n'.join('- ' + x for x in rule['avoid']), '**适用边界：**' + rule['scope'],
                     '**实际检查**', '\n'.join('- ' + x for x in rule['checks']), '**证据举例**']
        for e in rule['evidence'][:2]:
            kind = {'user-message': '用户原话', 'user-feedback': '前端用户意见',
                    'implementation-diagnosis': '助手技术诊断'}[e['kind']]
            sections.append(f'- {e["episode"]}期{kind}：“{e["quote"]}” '
                            f'[出处](<{root / e["path"]}:{e["line"]}>)')
        if len(rule['evidence']) > 2:
            sections.append(f'完整{len(rule["evidence"])}条出处见该规则JSON或 `--kind rules --id {rule["id"]} --full`。')
    sections += ['', '## 维护',
                 '原始反馈的完整摘录保存在项目审计目录；原片、批准记录与源码依赖继续保留各自身份。'
                 '历史秒数、特定品牌、单期字幕/音轨要求、固定效果顺序不升级成通用模板。'
                 '更改JSON后运行 `scripts/verify_feedback.py` 和 `scripts/build_reading_guide.py`，'
                 '同步全局轻量文件；完整阅读版为派生文件，不另行手改。']
    rules_path = skill / 'references/feedback-rules.md'
    rules_path.write_text('\n\n'.join(sections).replace(' |\n\n| ', ' |\n| ') + '\n')
    sources = [skill / 'SKILL.md', skill / 'DESIGN.md'] + [skill / 'references' / x for x in
              ['route-and-storyboard-review.md', 'storyboard-image-workflow.md', 'chatgpt-pro-storyboard-replication.md', 'production-defaults.md', 'media-and-overlays.md', 'fullscreen-video-window.md', 'sound-effects.md', 'background-music.md', 'storyboard.md', 'content-to-component.md', 'scene-workflow.md', 'exploration.md', 'implementation.md',
               'components-and-dependencies.md', 'component-reuse-map.md', 'selected-reference-library.md', 'object-transitions.md', 'text-presentation.md', 'render-and-delivery.md', 'production-gates.md', 'landscape-subtitles.md', 'segment-review.md', 'maintenance.md',
               'visual-quality.md', 'feedback-rules.md']]
    guide = ['# Fred 的 Remotion 视频输出 · 完整说明',
             '这是供Fred人工通览或维护审计的完整阅读版。Agent日常只读短入口与当前场景小抄，不预读本全文。执行事实源仍为SKILL.md和对应references；'
             '代码、字体、素材与 runtime 由 dependency-registry.json 指向项目实体。',
             '调用：`$fred-remotion-output`。你给出已确定的稿件、录音或当前返修范围，Codex 按输入阶段继续。'
             '已确认方案按内容选择，历史偏好按场景检索；不要求每期重复同一模板。']
    for path in sources:
        text = re.sub(r'\A---\n.*?\n---\n', '', path.read_text(), count=1, flags=re.S).strip()
        guide.extend(['---', absolute_links(text, path.parent)])
    output = skill / 'Fred-Remotion-完整说明.md'
    output.write_text('\n\n'.join(guide) + '\n')
    print(f'Generated {rules_path} and {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    build(project_root(parser.parse_args().project_root))
