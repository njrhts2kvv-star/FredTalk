#!/usr/bin/env python3
"""Initialize/update the shared disk-backed review UI from a gated manifest."""
import argparse
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path
from build_segment_review import build, fingerprint


def sha(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def initialize(manifest, episode, output=None, *, update=False, segment_indexes=(),
               final_registration=None, audio_review_url=None):
    manifest, episode = Path(manifest).resolve(), Path(episode).resolve()
    output = Path(output or episode / '03_制作过程/review-app').resolve()
    if not manifest.is_relative_to(episode):
        raise ValueError('Manifest must be inside the episode')
    if not output.is_relative_to(episode):
        raise ValueError('Review output must be inside the episode')
    if output.exists() and not update:
        raise ValueError('Review exists; resume it, or explicitly --update templates/data')
    if update and not (output / 'review.json').is_file():
        raise ValueError('No reusable review app exists to update')
    raw = manifest.read_bytes()
    data = json.loads(raw)
    old = json.loads((output / 'review.json').read_text()) if update else {}
    assets = {}

    def asset(value, expected=None, relative_to=manifest.parent):
        file = (relative_to / value).resolve()
        if not file.is_file():
            raise ValueError(f'Missing asset: {file}')
        actual = sha(file)
        if expected and actual != expected.removeprefix('sha256:'):
            raise ValueError(f'Asset sha256 mismatch: {file}')
        rel = os.path.relpath(file, output)
        key = fingerprint(rel)[:24]
        assets[key] = dict(path=rel, sha256=actual)
        return dict(url=f'/media/{key}?v={actual[:12]}', sha256=actual, assetId=key)

    # Consume the same actual library gate, source/hash and clock validation as
    # the existing generator. Nothing is copied/overwritten on failed validation.
    with tempfile.TemporaryDirectory() as temp:
        metadata = Path(temp) / 'metadata.json'
        build(manifest, Path(temp) / 'suggestions.html', data_output=metadata)
        rows = json.loads(metadata.read_text())
    scenes = []
    for page in data['pages']:
        sid = page['stableId']
        if sid in {'__proto__', 'constructor', 'prototype'}:
            raise ValueError('Reserved stableId: ' + sid)
        items = [row for row in rows if row['stableId'] == sid]
        context = items[0]['context']
        frames = []
        for row in items:
            obj = row['artifact']
            if row['view'] == 'keyframes' and obj['available']:
                frame = dict(id=obj['id'], timeSeconds=obj['timeSeconds'],
                             label=obj['label'], spokenCue=next((f.get('spokenCue', '') for f in
                             page['keyframeReview']['frames'] if f['id'] == obj['id']), ''),
                             **asset(obj['image']['path'], obj['image']['sha256']))
                frames.append(frame)
                for source in obj['sourceFiles']:
                    asset(source['path'], source['sha256'])
        suggestion = next(row for row in items if row['view'] == 'suggestion')
        candidates = []
        original = page.get('storyboardReview', {}).get('candidates', [])
        for candidate in suggestion['artifact']['candidates']:
            label = next(x.get('label', x['id']) for x in original if x['id'] == candidate['id'])
            candidates.append(dict(id=candidate['id'], label=label,
                                   image=asset(candidate['image']['path'], candidate['image']['sha256']),
                                   clip=asset(candidate['clip']['path'], candidate['clip']['sha256']) if candidate['clip'] else None))
        videos = [dict(label=v['label'], **asset(v['path'], v.get('sha256')),
                       poster=asset(v['poster'])['url'] if v.get('poster') else None)
                  for v in page.get('review', {}).get('versions', [])]
        scenes.append(dict(stableId=sid, title=page.get('title', sid),
                           startSeconds=context['startSeconds'], endSeconds=context['endSeconds'],
                           narration=context['narration'], context=context,
                           frames=frames, videos=videos, candidates=candidates,
                           suggestion=suggestion['artifact'],
                           existingProductionRoute=suggestion['existingProductionRoute'],
                           existingUserSelection=suggestion['existingUserSelection']))
    indexes = segment_indexes or [output / p for p in old.get('segmentIndexes', [])]
    for index_position, index in enumerate(indexes):
        index = Path(index).resolve()
        info = json.loads(index.read_text())
        if info['manifestSha256'] != hashlib.sha256(raw).hexdigest() or info['fps'] != data['timelineFps']:
            raise ValueError('Segment index does not match current manifest/fps; regenerate segments')
        asset(info['sourcePath'], info['sourceSha256'], index.parent)
        for scene in scenes:
            entry = next((x for x in info['segments'] if x['stableId'] == scene['stableId']), None)
            if not entry:
                raise ValueError('Missing exact segment: ' + scene['stableId'])
            fps = info['fps']
            if entry['startFrame'] / fps != scene['startSeconds'] or entry['endFrame'] / fps != scene['endSeconds']:
                raise ValueError('Segment window mismatch: ' + scene['stableId'])
            clip = dict(label=info['label'], **asset(entry['path'], entry['sha256'], index.parent))
            scene['videos'].insert(index_position, clip)
    audio_asset = asset(data['audio']['path'], data['audio'].get('sha256')) if data.get('audio', {}).get('path') else None
    for scene in scenes:
        scene['identity'] = dict(
            keyframes=fingerprint([scene['context'], audio_asset, scene['frames']]),
            video=fingerprint([scene['context'], audio_asset, scene['videos']]),
            suggestion=fingerprint([scene['context'], audio_asset, scene['candidates'], scene['suggestion']]))
        # Strip old file:// data from the UI; media are served only by explicit IDs.
        scene['suggestion'] = {k: v for k, v in scene['suggestion'].items() if k != 'candidates'}
    config = dict(schemaVersion=1, templateVersion=1, episodeKey=data['episodeKey'],
                  title=data.get('title', data['episodeKey']), fps=data['timelineFps'],
                  versionLabel=data.get('version', '当前版本'),
                  episodeRoot=os.path.relpath(episode, output),
                  manifestPath=os.path.relpath(manifest, output),
                  manifestSha256=hashlib.sha256(raw).hexdigest(),
                  segmentIndexes=[os.path.relpath(Path(p).resolve(), output) for p in indexes],
                  audioUrl=audio_asset['url'] if audio_asset else None,
                  audioReviewUrl=audio_review_url or old.get('audioReviewUrl'),
                  finalRegistration=os.path.relpath(Path(final_registration).resolve(), output) if final_registration else old.get('finalRegistration'),
                  deliveryAllowed=True, scenes=scenes, assets=assets)
    if data.get('example', {}).get('purpose') == 'review-template-example':
        config['example'] = data['example']
    config['version'] = fingerprint(config)
    output.mkdir(parents=True, exist_ok=True)
    template = Path(__file__).resolve().parents[1] / 'templates/review-app'
    for file in template.iterdir():
        if file.is_file():
            shutil.copyfile(file, output / file.name)
    temp = output / 'review.json.tmp'
    temp.write_text(json.dumps(config, ensure_ascii=False, indent=2))
    temp.replace(output / 'review.json')
    return dict(output=str(output), episodeKey=data['episodeKey'], scenes=len(scenes), version=config['version'])


if __name__ == '__main__':
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--manifest', required=True)
    p.add_argument('--episode', required=True)
    p.add_argument('--output')
    p.add_argument('--update', action='store_true')
    p.add_argument('--segment-index', action='append', default=[])
    p.add_argument('--final-registration')
    p.add_argument('--audio-review-url')
    a = p.parse_args()
    print(json.dumps(initialize(a.manifest, a.episode, a.output, update=a.update,
                               segment_indexes=a.segment_index, final_registration=a.final_registration,
                               audio_review_url=a.audio_review_url), ensure_ascii=False))
