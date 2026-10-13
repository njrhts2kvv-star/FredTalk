#!/usr/bin/env python3
"""Start linked audio and media review modules; no dependency installation."""
import argparse
import json
import socket
import subprocess
import sys
from pathlib import Path


def ensure_port(port):
    with socket.socket() as sock:
        # A recently closed connection may remain in TIME_WAIT. An active
        # listener still prevents this bind; never terminate another server.
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        sock.bind(('127.0.0.1', port))


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--review', required=True)
    p.add_argument('--port', type=int, default=8148)
    p.add_argument('--audio-review')
    p.add_argument('--audio-port', type=int, default=8107)
    a = p.parse_args()
    review = Path(a.review).resolve()
    audio = Path(a.audio_review).resolve() if a.audio_review else None
    if not (review / 'server.mjs').is_file():
        p.error('Initialize the shared review app first')
    if audio and not (audio / 'server.py').is_file():
        p.error('Initialize the audio review first')
    if audio and a.port == a.audio_port:
        p.error('Audio and media ports must differ')
    for port in [a.port] + ([a.audio_port] if audio else []):
        if not 1 <= port <= 65535:
            p.error('Invalid port')
        ensure_port(port)
    if audio:
        media_config = review / 'review.json'
        data = json.loads(media_config.read_text()); data['audioReviewUrl'] = f'http://127.0.0.1:{a.audio_port}/'
        temp = media_config.with_suffix('.tmp'); temp.write_text(json.dumps(data, ensure_ascii=False, indent=2)); temp.replace(media_config)
        config = audio / 'project.json'
        data = json.loads(config.read_text()); data['mediaReviewUrl'] = f'http://127.0.0.1:{a.port}/'
        temp = config.with_suffix('.tmp'); temp.write_text(json.dumps(data, ensure_ascii=False, indent=2)); temp.replace(config)
    children = []
    try:
        children.append(subprocess.Popen(['node', str(review / 'server.mjs'), str(a.port)]))
        if audio:
            children.append(subprocess.Popen([sys.executable, str(audio / 'server.py'), '--port', str(a.audio_port)]))
        # Poll only to supervise owned child processes; no browser/user waits.
        while all(c.poll() is None for c in children):
            try:
                children[0].wait(timeout=1)
            except subprocess.TimeoutExpired:
                pass
        if any(c.returncode not in (None, 0) for c in children):
            raise RuntimeError('A review server exited with an error; see its log')
    except KeyboardInterrupt:
        pass
    finally:
        for c in children:
            if c.poll() is None:
                c.terminate()
        for c in children:
            try:
                c.wait(timeout=5)
            except subprocess.TimeoutExpired:
                c.kill(); c.wait()


if __name__ == '__main__':
    main()
