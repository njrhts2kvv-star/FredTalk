"""Check tracked public text for release-specific obsolete naming patterns."""
import argparse
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]

def searchable(text):
    text = re.sub(r'data:[^;\s]+;base64,[A-Za-z0-9+/=]+', '[embedded data]', text)
    text = re.sub(r'"integrity"\s*:\s*"[^"]*"', '"integrity":"[checksum]"', text)
    return text

def scan(root, patterns):
    names = subprocess.check_output(['git', 'ls-files', '-z'], cwd=root).decode().split('\0')
    findings = []
    for name in filter(None, names):
        path = root / name
        if not path.is_file():
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeError:
            continue
        if '\x00' in text:
            continue
        if path.suffix == '.json':
            try:
                text = json.dumps(json.loads(text), ensure_ascii=False)
            except ValueError:
                pass
        clean = searchable(text)
        for pattern in patterns:
            if re.search(pattern, name, re.I) or re.search(pattern, clean, re.I):
                findings.append(name)
                break
    return findings

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pattern', action='append', required=True)
    args = parser.parse_args()
    findings = scan(ROOT, args.pattern)
    print(json.dumps({'passed': not findings, 'findings': findings}, indent=2))
    return bool(findings)

if __name__ == '__main__':
    raise SystemExit(main())
