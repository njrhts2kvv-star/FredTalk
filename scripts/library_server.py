"""Loopback-only portable catalog server; never serves arbitrary repository files."""
import argparse
import copy
import hashlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
import mimetypes
from pathlib import Path
import re
import threading
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[1]
LOCK = threading.Lock()

def read(name):
    return json.loads((ROOT / 'library' / name).read_text())

def media_file(record):
    if record.get('status') != 'reviewed':
        return None
    installed = [ROOT / relative for relative in record.get('installPaths', [])]
    for p in [*installed, ROOT / '.artifacts/objects' / record['sha256'], ROOT / 'library/demo' / record['sha256']]:
        if (p.resolve().is_relative_to(ROOT.resolve()) and not p.is_symlink() and p.is_file() and
                p.stat().st_size == record['size'] and
                (p not in installed or hashlib.sha256(p.read_bytes()).hexdigest() == record['sha256'])):
            return p
    return None

def public_preview_url(url):
    return isinstance(url, str) and bool(re.fullmatch(r'https://www\.fred-fu\.com/visual-library-app/objects/[a-f0-9]{64}\.(mp4|webm|jpg|jpeg|png|webp)', url))


def projection():
    data = read('catalog.json')
    routes = read('routes.json')
    media = read('media-manifest.json')['files']
    for item in data['items']:
        for source in item.get('sources', []):
            relative = source.get('installPath') or routes.get(source.get('url'))
            path = ROOT / relative if relative else None
            available = (path is not None and path.resolve().is_relative_to(ROOT.resolve()) and
                         path.is_file() and not path.is_symlink() and
                         (not source.get('sha256') or hashlib.sha256(path.read_bytes()).hexdigest() == source['sha256']))
            source['available'] = available
            source['status'] = 'ready' if available else ('member-download' if item.get('access') == 'members' else 'missing')
        download = item.get('projectDownload')
        if download:
            record = media.get(routes.get(download.get('url')), {})
            download['available'] = bool(record and media_file(record))
            download['status'] = 'ready' if download['available'] else ('member-download' if item.get('access') == 'members' else 'optional-download')
        for preview in item['previews']:
            target = routes.get(preview.get('videoUrl'))
            available = public_preview_url(preview.get('videoUrl')) or (target in media and media_file(media[target]) is not None)
            preview['available'] = available
            excluded = target in media and media[target]['status'] == 'quarantined'
            preview['status'] = 'ready' if available else ('privacy-excluded' if excluded else ('member-download' if item.get('access') == 'members' else 'optional-download'))
            if not available:
                preview['unavailableReason'] = ('这段预览因隐私检查被隔离，未随素材包分发。' if excluded else ('先在网站获取 Agent token，再运行 python3 scripts/assets.py download --members --collection ' + item['collectionId'] if item.get('access') == 'members' else '运行 python3 scripts/assets.py download 下载公开素材包。'))
    return data

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def send_json(self, value, status=200):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        route = urlsplit(self.path).path
        if route == '/api/design-system':
            return self.send_json(projection())
        if route in ('/api/review', '/api/remake-curation'):
            state = self.review_state(route)
            return self.send_json({'state': state, 'catalog': {'fingerprint': 'portable-v1'}} if route == '/api/review' else state)
        routes = read('routes.json')
        target = routes.get(route)
        mime = None
        if target:
            record = read('media-manifest.json')['files'].get(target)
            if record:
                path = media_file(record)
                mime = mimetypes.guess_type('file.' + record['kind'])[0]
            else:
                path = (ROOT / target).resolve()
                if not path.is_relative_to(ROOT) or not path.is_file(): path = None
                mime = mimetypes.guess_type(target)[0] if target.startswith('library/fonts/') else 'text/plain; charset=utf-8'
        elif route in ('/', '/design', '/design/'):
            path = ROOT / 'apps/library/dist/index.html'
        elif route.startswith('/design/assets/'):
            name = unquote(route.removeprefix('/design/assets/'))
            path = (ROOT / 'apps/library/dist/assets' / name).resolve()
            if not path.is_relative_to(ROOT / 'apps/library/dist/assets'): path = None
        else:
            path = None
        if path is None or not path.is_file():
            return self.send_json({'error': 'Not found or optional asset not installed'}, 404)
        size = path.stat().st_size
        start, end, code = 0, size - 1, 200
        header = self.headers.get('Range')
        if header:
            match = re.fullmatch(r'bytes=(\d+)-(\d*)', header)
            if not match: return self.send_json({'error': 'Invalid range'}, 416)
            start = int(match[1]); end = min(int(match[2]) if match[2] else end, end)
            if start > end: return self.send_json({'error': 'Invalid range'}, 416)
            code = 206
        self.send_response(code)
        self.send_header('Content-Type', mime or mimetypes.guess_type(path.name)[0] or 'application/octet-stream')
        self.send_header('Content-Length', str(end-start+1))
        self.send_header('Accept-Ranges', 'bytes')
        if code == 206: self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        try:
            with path.open('rb') as f:
                f.seek(start); remaining=end-start+1
                while remaining:
                    chunk=f.read(min(1024*1024,remaining))
                    if not chunk: break
                    self.wfile.write(chunk); remaining-=len(chunk)
        except (BrokenPipeError, ConnectionResetError): pass

    def review_state(self, route):
        path = ROOT / '.local' / ('review.json' if route == '/api/review' else 'remake.json')
        return json.loads(path.read_text()) if path.exists() else {'revision': 0, 'fingerprint': 'portable-v1', 'decisions': {}}

    def do_POST(self):
        route = urlsplit(self.path).path
        if route not in ('/api/review','/api/remake-curation'): return self.send_json({'error':'Not found'},404)
        if self.headers.get('Origin') and self.headers['Origin'] != 'http://' + self.headers.get('Host',''):
            return self.send_json({'error':'Cross-origin writes are disabled'},403)
        try:
            length=int(self.headers.get('Content-Length','0'))
            if not 0 < length <= 32768: raise ValueError('Invalid body size')
            value=json.loads(self.rfile.read(length))
            if value.get('id') not in {i['id'] for i in read('catalog.json')['items']}: raise ValueError('Unknown item')
            if value.get('decision') not in {'keep','remove','reset','optional'}: raise ValueError('Unknown decision')
            with LOCK:
                state=self.review_state(route)
                if value.get('expectedRevision')!=state['revision'] or value.get('fingerprint')!='portable-v1': return self.send_json({'error':'Revision changed'},409)
                if value['decision']=='reset': state['decisions'].pop(value['id'],None)
                else: state['decisions'][value['id']]={'decision':value['decision'],'notes':str(value.get('notes',''))[:10000]}
                state['revision']+=1
                path=ROOT/'.local'/('review.json' if route=='/api/review' else 'remake.json');path.parent.mkdir(exist_ok=True)
                temp=path.with_suffix('.tmp');temp.write_text(json.dumps(state,ensure_ascii=False));temp.replace(path)
            self.send_json(state)
        except (ValueError,TypeError,json.JSONDecodeError) as e: self.send_json({'error':str(e)},400)

if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=3061);args=parser.parse_args()
    print(f'FredTalk: http://127.0.0.1:{args.port}/design/',flush=True)
    ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
