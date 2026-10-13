#!/usr/bin/env python3
"""新组件选片页：一页看完候选成片；升级版与原版并排。Fred 的选择写入 <工程>/qc/decisions.json。

由 component_kit.py review 启动。只读媒体（只服务登记过的路径），不改组件库。
"""
import argparse
import json
import os
import re
import sys
import tempfile
import threading
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
LOCK = threading.Lock()
CHOICES = {'keep', 'revise', 'drop', 'reset'}


def build_items(project, renders, catalog_path):
    sys.path.insert(0, str(HERE.parent.parent.parent / 'scripts'))
    from component_kit import registry_rows
    replaces = {}
    rp = project / 'qc/replaces.json'
    if rp.is_file():
        replaces = json.loads(rp.read_text())
    from library_matching import visual_label
    catalog = {visual_label(c): c for c in json.loads(Path(catalog_path).read_text())['components']} if replaces else {}
    items, media = [], {}
    for r in registry_rows(project):
        mp4 = renders / (r['id'] + '.mp4')
        if not mp4.is_file():
            continue
        item = dict(r, video=f'/media/{r["id"]}')
        media[r['id']] = mp4
        old = replaces.get(r['id'])
        if old:
            item['replaces'] = old.get('label') if isinstance(old, dict) else old
            item['note'] = old.get('note', '') if isinstance(old, dict) else ''
            entry = catalog.get(item['replaces'])
            # replaces.json 可写 video：用 Fred 实际看过的那一版（如字体/紫色修订版），否则用 catalog 登记的成片
            path = (old.get('video') if isinstance(old, dict) else None) or (entry and entry.get('media', {}).get('path'))
            if path and Path(path).is_file():
                media['old-' + r['id']] = Path(path)
                item['oldVideo'] = f'/media/old-{r["id"]}'
        items.append(item)
    return items, media


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('project')
    ap.add_argument('--renders', required=True)
    ap.add_argument('--catalog', required=True)
    ap.add_argument('--port', type=int, default=3072)
    ap.add_argument('--title', default='新组件选片')
    args = ap.parse_args()
    project, renders = Path(args.project).resolve(), Path(args.renders).resolve()
    decisions_path = project / 'qc/decisions.json'
    items, media = build_items(project, renders, args.catalog)

    def read_decisions():
        return json.loads(decisions_path.read_text()) if decisions_path.is_file() else {'revision': 0, 'decisions': {}}

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *a):
            pass

        def send(self, code, body, kind='application/json; charset=utf-8', extra=None):
            if isinstance(body, (dict, list)):
                body = json.dumps(body, ensure_ascii=False).encode()
            self.send_response(code)
            self.send_header('Content-Type', kind)
            self.send_header('Content-Length', str(len(body)))
            self.send_header('Cache-Control', 'no-store')
            for k, v in (extra or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            if self.path in ('/', '/index.html'):
                html = (HERE / 'index.html').read_text().replace('__TITLE__', args.title)
                return self.send(200, html.encode(), 'text/html; charset=utf-8')
            if self.path == '/api/items':
                return self.send(200, {'title': args.title, 'items': items})
            if self.path == '/api/decisions':
                return self.send(200, read_decisions())
            m = re.match(r'^/media/([\w.-]+)$', self.path)
            if m and m.group(1) in media:
                return self.serve_video(media[m.group(1)])
            return self.send(404, {'error': 'not found'})

        def serve_video(self, path):
            size = path.stat().st_size
            rng = self.headers.get('Range')
            start, end = 0, size - 1
            if rng:
                mm = re.match(r'bytes=(\d*)-(\d*)', rng)
                if mm:
                    start = int(mm.group(1) or 0)
                    end = int(mm.group(2)) if mm.group(2) else size - 1
            end = min(end, size - 1)
            with open(path, 'rb') as f:
                f.seek(start)
                data = f.read(end - start + 1)
            self.send(206 if rng else 200, data, 'video/mp4',
                      {'Accept-Ranges': 'bytes', **({'Content-Range': f'bytes {start}-{end}/{size}'} if rng else {})})

        def do_POST(self):
            if self.path != '/api/decision':
                return self.send(404, {'error': 'not found'})
            body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))) or b'{}')
            cid, choice, notes = body.get('id'), body.get('decision'), str(body.get('notes', ''))[:2000]
            if cid not in {i['id'] for i in items} or choice not in CHOICES:
                return self.send(400, {'error': 'bad request'})
            with LOCK:
                data = read_decisions()
                if choice == 'reset':
                    data['decisions'].pop(cid, None)
                else:
                    data['decisions'][cid] = {'decision': choice, 'notes': notes,
                                              'updatedAt': datetime.now(timezone(timedelta(hours=8))).isoformat(timespec='seconds')}
                data['revision'] = data.get('revision', 0) + 1
                decisions_path.parent.mkdir(exist_ok=True)
                fd, tmp = tempfile.mkstemp(dir=decisions_path.parent, suffix='.tmp')
                with os.fdopen(fd, 'w') as h:
                    json.dump(data, h, ensure_ascii=False, indent=1)
                os.replace(tmp, decisions_path)
            return self.send(200, data)

    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(f'http://127.0.0.1:{args.port}/  ({len(items)} 条，选择写入 {decisions_path})', flush=True)
    server.serve_forever()


if __name__ == '__main__':
    main()
