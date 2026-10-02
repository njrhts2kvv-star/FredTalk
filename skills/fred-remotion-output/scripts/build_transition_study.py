#!/usr/bin/env python3
"""Build a local slow-play study page without copying or rendering source scenes."""
import argparse
import json
import os
from common import project_root, load_references
from transitions import load_patterns, select_patterns

TEMPLATE = '''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fred · 过渡动作学习</title>
<style>
:root{font-family:-apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;color:#171519;background:#f5f4f7;color-scheme:light}*{box-sizing:border-box}body{margin:0}header,main{max-width:1320px;margin:auto;padding:32px 24px}header{padding-bottom:18px}small{color:#7952b3;font-weight:700;letter-spacing:.07em}h1{font-size:34px;margin:12px 0}header p{color:#625e69;line-height:1.7;max-width:960px}.toolbar{display:flex;align-items:center;gap:16px;margin-top:22px}input{flex:1;min-width:160px}input,select,button{font:inherit;padding:9px 12px;border:1px solid #d4d0dc;border-radius:8px;background:white;color:#242027}button{cursor:pointer}button:hover,a:hover{color:#7952b3}input:focus,select:focus,button:focus-visible{outline:2px solid #8960ca;outline-offset:2px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}.card{border:1px solid #e4e0e9;border-radius:18px;overflow:hidden;background:white;min-width:0}.info{padding:22px}h2{font-size:22px;margin:8px 0 10px}.info p{font-size:15px;line-height:1.7;margin:8px 0;color:#5c5763}.video{width:100%;display:block;aspect-ratio:16/9;background:#eceaf0}.controls{display:flex;gap:8px;align-items:center;flex-wrap:wrap;padding:14px 22px;background:#faf9fc}.controls label{font-size:14px}.clock{font-size:13px;color:#6b6376;font-variant-numeric:tabular-nums;width:100%}.links{display:flex;gap:20px;margin-top:16px}a{color:#7651ae;text-underline-offset:3px;font-size:14px}details{margin-top:18px;font-size:14px;color:#6b6376}summary{cursor:pointer}details img{width:100%;margin-top:12px}.empty{color:#625e69;padding:60px}#count{font-size:14px;color:#6b6376;white-space:nowrap}@media(max-width:720px){header,main{padding:22px 16px}.grid{grid-template-columns:1fr}h1{font-size:28px}.toolbar{flex-wrap:wrap}.info{padding:18px}}
</style><header><small>FRED · TRANSITION STUDY</small><h1>把过渡动作单独拿出来看</h1><p>10 类动作，12 个准确短区间。先看谁让位、谁接管，再看缩放和移动怎样配合。默认半速、无声循环；可以逐帧查看，也可以回到完整源片。</p><div class="toolbar"><input id="search" type="search" placeholder="搜索：交替、缩放、左右、让位、038…" aria-label="搜索动作"><span id="count"></span></div></header><main><div class="grid" id="grid"></div></main>
<script id="data" type="application/json">__DATA__</script><script>
const entries=JSON.parse(document.getElementById('data').textContent),grid=document.getElementById('grid'),search=document.getElementById('search');let playing=null;
const el=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
function card(e){const article=el('article','card');article.dataset.id=e.id;const info=el('div','info');info.append(el('small','',e.id+' · #'+String(e.number).padStart(3,'0')+' · '+e.startSeconds.toFixed(2)+'–'+e.endSeconds.toFixed(2)+'s'),el('h2','',e.title),el('p','',e.useWhen),el('p','',e.phases.join(' → ')));const v=el('video','video');v.src=e.preview;v.controls=true;v.muted=true;v.loop=true;v.playsInline=true;v.preload='metadata';v.playbackRate=.5;v.setAttribute('aria-label',e.title+'短段');
const controls=el('div','controls'),speed=el('select');speed.setAttribute('aria-label','播放速度');for(const rate of [1,.5,.25]){const o=el('option','',rate+'×');o.value=rate;o.selected=rate===.5;speed.append(o)}speed.addEventListener('change',()=>{v.playbackRate=Number(speed.value)});const label=el('label','','速度 ');label.append(speed);controls.append(label);
for(const [delta,text] of [[-1,'上一帧'],[1,'下一帧']]){const b=el('button','',text);b.type='button';b.addEventListener('click',()=>{v.pause();const frame=Math.round(v.currentTime*e.fps)+delta;v.currentTime=Math.max(0,Math.min((e.endFrameExclusive-e.startFrame-1)/e.fps,frame/e.fps))});controls.append(b)}const replay=el('button','','从头播放');replay.type='button';replay.addEventListener('click',()=>{v.currentTime=0;v.play().catch(()=>{})});controls.append(replay);const clock=el('output','clock');const tick=()=>{clock.textContent='源片 '+(e.startSeconds+v.currentTime).toFixed(3)+'s · 第 '+(e.startFrame+Math.round(v.currentTime*e.fps))+' 帧 / '+e.fps+' fps'};for(const name of ['timeupdate','seeked','loadedmetadata'])v.addEventListener(name,tick);v.addEventListener('play',()=>{if(playing&&playing!==v)playing.pause();playing=v});tick();controls.append(clock);
const tail=el('div','info');const links=el('div','links');for(const [text,url] of [['完整源片区间',e.source],['对应源码',e.code]]){const a=el('a','',text);a.href=url;a.target='_blank';a.rel='noopener';links.append(a)}tail.append(links);const details=el('details'),summary=el('summary','','关键帧与复用说明');details.append(summary);const img=el('img');img.src=e.poster;img.loading='lazy';img.alt=e.title+'按时间排列的10帧';details.append(img);for(const note of e.transferRules)details.append(el('p','',note));for(const note of e.limitations)details.append(el('p','',note));tail.append(details);article.append(info,v,controls,tail);return article}
function render(){if(playing)playing.pause();const q=search.value.trim().toLowerCase(),numeric=q.replace(/^#/,'');const shown=entries.filter(e=>/^\\d+$/.test(numeric)?e.number===Number(numeric):[e.id,e.title,e.useWhen,...e.tags].join(' ').toLowerCase().includes(q));grid.replaceChildren(...shown.map(card));if(!shown.length)grid.append(el('p','empty','没有对应动作，试试“交替”“让位”或参考片段段编号。'));document.getElementById('count').textContent=shown.length+' 个短区间'}search.addEventListener('input',render);render();
</script></html>'''


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--kind', choices=['transitions', 'text-effects'], default='transitions')
    args = parser.parse_args()
    root = project_root(args.project_root)
    _, choices = load_references(root)
    items = select_patterns(load_patterns(root, args.kind), choices)
    skill = root / 'skills/fred-remotion-output'
    folder = 'transition-studies' if args.kind == 'transitions' else 'text-studies'
    output = skill / 'assets' / folder / 'library-fred-20260913'
    cards = []
    for item in items:
        for example in item['examples']:
            card = {**item, **example}
            card.pop('examples')
            for key in ['preview', 'poster']:
                card[key] = os.path.relpath(skill / example[key], output)
            card['source'] = os.path.relpath(example['sourceVideo'], output) + f'#t={example["startSeconds"]},{example["endSeconds"]}'
            card['code'] = os.path.relpath(example['sourceCode'][0]['path'], output)
            cards.append(card)
    encoded = json.dumps(cards, ensure_ascii=False).replace('<', '\\u003c')
    template = TEMPLATE
    navigation = '<nav class="links"><a href="../../transition-studies/library-fred-20260913/index.html">对象过渡</a><a href="../../text-studies/library-fred-20260913/index.html">文字呈现</a><a href="../../reference-code/library-fred-20260913/index.html">完整组件文件架</a></nav>'
    template = template.replace('</h1>', '</h1>' + navigation, 1)
    if args.kind == 'text-effects':
        template = template.replace('Fred · 过渡动作学习', 'Fred · 文字呈现学习').replace('FRED · TRANSITION STUDY', 'FRED · TEXT STUDY')
        template = template.replace('把过渡动作单独拿出来看', '文字怎样出现、流动和退出')
        template = template.replace('10 类动作，12 个准确短区间。先看谁让位、谁接管，再看缩放和移动怎样配合。', f'{len(items)} 类文字呈现，{len(cards)} 个准确短区间。区分滚动、逐字输出、遮罩刷出和透明度变化。')
        template = template.replace('搜索：交替、缩放、左右、让位、038…', '搜索：滚动、逐字、刷出、淡出、014…')
    (output / 'index.html').write_text(template.replace('__DATA__', encoded))
    print(json.dumps({'patterns': len(items), 'excerpts': len(cards), 'path': str(output / 'index.html')}))


if __name__ == '__main__': main()
