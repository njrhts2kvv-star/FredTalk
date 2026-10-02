#!/usr/bin/env python3
"""Build a verified, standalone source package and links to active current MP4s.

Run only after source edits and output publication have stopped. This script does
not install dependencies, render compositions, or grant visual acceptance.
It refuses existing delivery artifacts and never edits original source/outputs.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import tempfile
import zipfile

SCRIPT_NAMES = {
    'render.mjs', 'verify.py', 'technical-review.py', 'frame_audit.py',
    'freeze-snapshot.py', 'verify-snapshot.py', 'build-delivery.py', 'verify-delivery.mjs',
}
EXCLUDED_PARTS = {'node_modules', 'snapshots', '__pycache__', '.git', 'history'}
SECRET_NAMES = {'.npmrc', '.netrc', 'id_rsa', 'id_ed25519', 'credentials.json', 'known_hosts'}
TEXT_SUFFIXES = {'.json', '.md', '.txt', '.ts', '.tsx', '.js', '.mjs', '.py', '.html', '.css', '.svg'}


def sha(path: Path) -> str:
    with path.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8'))


def write_json(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def eligible(path: Path) -> bool:
    name = path.name.lower()
    return not (
        any(part in EXCLUDED_PARTS for part in path.parts)
        or name in SECRET_NAMES or name == '.ds_store'
        or name.startswith('.env') or name.endswith(('.pem', '.key', '.p12', '.pyc'))
    )


def safe_copy(source: Path, target: Path, project: Path, records: dict):
    rel = source.relative_to(project).as_posix()
    if not eligible(source):
        raise RuntimeError('Excluded file entered the copy plan: ' + rel)
    if source.suffix.lower() in TEXT_SUFFIXES:
        content = source.read_bytes()
        if re.search(rb'(?m)^-----BEGIN (?:RSA |EC |OPENSSH |ENCRYPTED )?PRIVATE KEY-----\r?$', content):
            raise RuntimeError('Private-key material detected; refusing package: ' + rel)
    before = sha(source)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target, follow_symlinks=True)
    if sha(source) != before or sha(target) != before:
        raise RuntimeError('Source changed or copy hash mismatched: ' + rel)
    records[rel] = {'sha256': before, 'bytes': target.stat().st_size}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--destination', type=Path, help='Default: PROJECT/delivery; existing artifacts are never replaced')
    parser.add_argument('--expected-count', type=int, default=53)
    parser.add_argument('--review-url', help='Optional verified comparison-frontend URL')
    parser.add_argument('--dry-run', action='store_true', help='Read plans only; do not copy or package anything')
    args = parser.parse_args()
    project = args.project.resolve()
    destination = (args.destination or project / 'delivery').resolve()
    manifest = read_json(project / 'manifest.json')
    state = read_json(project / 'state/production.json')
    deferred = set(state.get('deferredByUser', {}))
    clips = [clip for clip in manifest['clips'] if clip['id'] not in deferred]
    if len(clips) != args.expected_count or len({c['id'] for c in clips}) != len(clips):
        raise RuntimeError(f'Expected {args.expected_count} unique active clips, found {len(clips)}')
    if (manifest['width'], manifest['height'], manifest['fps']) != (1920, 1080, 60):
        raise RuntimeError('Delivery manifest is not 1920x1080 at60fps')
    if state.get('activeScopeCount', len(clips)) != len(clips):
        raise RuntimeError('State activeScopeCount does not match manifest minus deferredByUser')

    required = ['package.json', 'package-lock.json', 'tsconfig.json', 'README.md',
                'manifest.json', 'selection-frozen.json', 'state/production.json', 'FONT-SOURCES.md']
    plan = {project / name for name in required}
    for folder in ['src', 'public', 'examples']:
        plan.update(p for p in (project / folder).rglob('*') if p.is_file() and eligible(p))
    plan.update(project / 'scripts' / name for name in SCRIPT_NAMES if (project / 'scripts' / name).is_file())
    for clip in clips:
        cid = clip['id']
        if not (project / 'examples' / f'{cid}.json').is_file():
            raise RuntimeError('Missing example props: ' + cid)
        for suffix in ['acceptance', 'provenance']:
            record = project / 'qc' / f'{cid}-{suffix}.json'
            if record.exists():
                plan.add(record)
        # Include current per-clip JSON measurement/repair notes, not extracted images,
        # old cloud reports, videos, copied snapshots, or prior output versions.
        for parent in (project / 'qc').glob('rebuild-*'):
            folder = parent / cid
            if folder.is_dir():
                plan.update(p for p in folder.rglob('*.json') if p.is_file() and eligible(p)
                            and not any(part in {'source', 'full-render-check', 'survey'} for part in p.relative_to(folder).parts))
    # Preserve B/C measurement methods and calibration decisions without frame
    # dumps or obsolete movie outputs. These records retain their original scope.
    for folder in [project / 'analysis', *(project / 'qc').glob('calibration-*')]:
        allowed = {'.json', '.md', '.py'} if folder.name == 'analysis' else {'.json', '.md'}
        if folder.is_dir():
            plan.update(p for p in folder.rglob('*')
                        if p.is_file() and p.suffix.lower() in allowed and eligible(p))
    missing = [str(p.relative_to(project)) for p in plan if not p.is_file()]
    if missing:
        raise RuntimeError('Missing required source files: ' + ', '.join(missing))
    final_names = ['source', 'source.zip', 'videos', 'output-index.json', 'INDEX.md', 'build-receipt.json']
    if any((destination / name).exists() or (destination / name).is_symlink() for name in final_names):
        raise RuntimeError('Destination contains delivery artifacts; choose a new --destination')
    if args.dry_run:
        print(json.dumps({'activeIds': [c['id'] for c in clips], 'deferredIds': sorted(deferred),
                          'sourceFiles': len(plan), 'sourceBytes': sum(p.stat().st_size for p in plan),
                          'destination': str(destination), 'executed': False}, ensure_ascii=False, indent=2))
        return

    # Bind every link and technical receipt to the MP4 currently at the final path.
    outputs = []
    for clip in clips:
        cid = clip['id']
        video = project / 'outputs' / f'{cid}.mp4'
        acceptance_path = project / 'qc' / f'{cid}-acceptance.json'
        if not video.is_file() or not acceptance_path.is_file():
            raise RuntimeError('Missing final MP4 or current technical receipt: ' + cid)
        digest = sha(video)
        acceptance = read_json(acceptance_path)
        tech = acceptance.get('technical', {})
        if acceptance.get('sha256') != digest or tech.get('status') != 'passed':
            raise RuntimeError('Technical receipt is stale or not passed: ' + cid)
        if (tech.get('size') != [1920, 1080] or tech.get('fps') != '60/1'
                or tech.get('frames') != clip['durationInFrames'] or not tech.get('fullDecode')):
            raise RuntimeError('Technical dimensions/fps/frames/decode do not match manifest: ' + cid)
        provenance_path = project / 'qc' / f'{cid}-provenance.json'
        provenance = read_json(provenance_path) if provenance_path.exists() else None
        if provenance and provenance.get('sha256') != digest:
            raise RuntimeError('Output provenance is stale: ' + cid)
        outputs.append({'id': cid, 'title': clip.get('title'), 'sha256': digest,
                        'bytes': video.stat().st_size, 'frames': clip['durationInFrames'],
                        'width': 1920, 'height': 1080, 'fps': 60,
                        'video': f'videos/{cid}.mp4', 'originalLocalPath': str(video),
                        'example': f'source/examples/{cid}.json',
                        'qc': f'source/qc/{cid}-acceptance.json',
                        'technical': tech, 'fidelity': acceptance.get('fidelity', {'status': 'pending'}),
                        'dynamic': acceptance.get('dynamic', {'status': 'pending'}),
                        'renderInputSnapshot': provenance.get('snapshot') if provenance else None,
                        'renderInputSnapshotSha256': provenance.get('snapshotSha256') if provenance else None,
                        'provenanceAvailable': provenance is not None})

    destination.mkdir(parents=True, exist_ok=True)
    # A unique staging folder is preserved after failure to make incomplete builds
    # inspectable. Originals and prior deliveries are never deleted by this script.
    staging = Path(tempfile.mkdtemp(prefix='.building-', dir=destination))
    source_dir = staging / 'source'
    source_dir.mkdir()
    inputs = {}
    for path in sorted(plan):
        safe_copy(path, source_dir / path.relative_to(project), project, inputs)
    created = dt.datetime.now(dt.timezone.utc).isoformat()
    info = {'createdAt': created, 'activeIds': [c['id'] for c in clips],
            'deferredIds': sorted(deferred), 'allRegisteredIdsRetained': True,
            'sourceInputHashes': inputs, 'dependencyVerification': 'pending final execution by main agent',
            'compositionRegistrationVerification': 'pending final execution by main agent',
            'representativeRenderVerification': 'pending final execution by main agent',
            'acceptanceBoundary': 'Technical receipt checks and packaging hashes do not grant visual or playback acceptance.'}
    write_json(source_dir / 'delivery-inputs.json', info)
    write_json(source_dir / 'qc/delivery-output-hashes.json', outputs)
    (source_dir / 'DELIVERY.md').write_text(
        '# Editable source delivery\n\n'
        f'This source contains all54 registered compositions; {len(clips)} active MP4s are linked from the outer delivery index. '
        'N052 remains deferred. No node_modules, remote credential files, old outputs, or render snapshots are included.\n\n'
        'All media and fonts needed by composition code are copied into public/. Video links in the outer delivery folder '
        'point to the existing local final outputs; source.zip remains independently runnable without those links.\n\n'
        'Run from this extracted directory:\n\n```bash\nnpm ci --no-audit --no-fund\n'
        'npm run typecheck\nnpm run compositions\n'
        'RENDER_CONCURRENCY=2 npm run render -- N004\npython3 scripts/technical-review.py N004\n```\n\n'
        'The main agent must still execute dependency verification, check every registered composition, and render representative '
        'components from this copied source directory. This packaging script does not perform those checks.\n\n'
        'qc/delivery-output-hashes.json preserves current MP4 hashes and separate technical, fidelity, and dynamic states. '
        'Do not treat pending fidelity or dynamic checks as accepted.\n', encoding='utf-8')
    videos = staging / 'videos'
    videos.mkdir()
    for record in outputs:
        # Relative links keep working when the whole project folder is moved.
        target = project / 'outputs' / f"{record['id']}.mp4"
        final_link_parent = destination / 'videos'
        (videos / f"{record['id']}.mp4").symlink_to(os.path.relpath(target, final_link_parent))
    write_json(staging / 'output-index.json', {'createdAt': created, 'clips': outputs,
                                               'deferredIds': sorted(deferred), 'comparisonFrontend': args.review_url})
    lines = ['# 1080p60 video and source delivery', '',
             f'{len(clips)} active MP4s; N052 deferred. [Editable source archive](source.zip).', '',
             'Visual and playback states remain separate from technical checks. See each hash-bound QC record.', '']
    if args.review_url:
        lines += [f'[Original / remake comparison]({args.review_url})', '']
    lines += ['| ID | Video | Example | QC | Fidelity | Playback |', '|---|---|---|---|---|---|']
    for r in outputs:
        lines.append(f"| {r['id']} | [MP4]({r['video']}) | [JSON]({r['example']}) | [QC]({r['qc']}) | "
                     f"{r['fidelity'].get('status', 'pending')} | {r['dynamic'].get('status', 'pending')} |")
    (staging / 'INDEX.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    archive = staging / 'source.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as zf:
        for path in sorted(source_dir.rglob('*')):
            if path.is_file():
                zf.write(path, path.relative_to(staging).as_posix())
    with zipfile.ZipFile(archive) as zf:
        failed = zf.testzip()
        if failed:
            raise RuntimeError('Archive CRC check failed: ' + failed)
    for rel, record in inputs.items():
        if sha(project / rel) != record['sha256'] or sha(source_dir / rel) != record['sha256']:
            raise RuntimeError('Source changed during delivery build: ' + rel)
    for record in outputs:
        if sha(Path(record['originalLocalPath'])) != record['sha256']:
            raise RuntimeError('Output changed during delivery build: ' + record['id'])
    receipt = {'createdAt': created, 'sourceFiles': len(inputs), 'activeOutputCount': len(outputs),
               'archiveSha256': sha(archive), 'archiveBytes': archive.stat().st_size,
               'sourceCopyHashChecks': 'passed', 'archiveCRC': 'passed',
               'allInputAndOutputHashesRecheckedAtEnd': True,
               'dependencyAndRerenderVerification': 'pending main-agent execution',
               'visualAcceptanceGranted': False}
    write_json(staging / 'build-receipt.json', receipt)
    for name in final_names:
        (staging / name).rename(destination / name)
    staging.rmdir()
    print(json.dumps({'destination': str(destination), **receipt}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
