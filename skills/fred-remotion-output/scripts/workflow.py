#!/usr/bin/env python3
"""Validate explicit direction choices and real keyframes for the new workflow.

These checks bind records to files; they cannot prove user identity or visual quality.
Historical manifests are not retroactively subjected to the new review workflow.
"""
import argparse
import hashlib
import json
import math
import subprocess
from pathlib import Path
from scene import _scene_window

PROFILE = 'fred-video-v2'
ROUTES = {'recording', 'remotion', 'generated-video', 'mixed'}


def _text(value):
    return isinstance(value, str) and bool(value.strip())


def _sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def _plain_sha(value):
    return value.removeprefix('sha256:') if isinstance(value, str) else value


def scene_window(manifest, page):
    """Return the declared global time window, or None when mapping is unknown."""
    window = _scene_window(manifest, page)
    return (window['startSeconds'], window['endSeconds']) if window else None


def scene_review_signature(manifest, page):
    """Hash the current scene context, excluding review state and other scenes' cues."""
    subtitles = manifest.get('subtitles', {})
    window = scene_window(manifest, page)
    if isinstance(subtitles, dict):
        subtitles = dict(subtitles)
        cues = subtitles.get('cues')
        if isinstance(cues, list):
            # Validate the complete source file separately. Its whole-film hash
            # must not stale an unchanged scene when only another cue changes.
            subtitles.pop('sourceSha256', None)
        if isinstance(cues, list) and window is not None:
            start, end = window
            subtitles['cues'] = [cue for cue in cues if isinstance(cue, dict)
                and isinstance(cue.get('startSeconds'), (int, float))
                and isinstance(cue.get('endSeconds'), (int, float))
                and cue['startSeconds'] < end and cue['endSeconds'] > start]
    selection = page.get('storyboardReview', {})
    selected_direction = {k: selection[k] for k in ['userSelection', 'directionNote'] if k in selection}
    keys = ['stableId', 'sourceSpans', 'startFrame', 'globalStartFrame', 'globalVoiceStartFrame',
            'durationInFrames', 'oneQuestion', 'visualPlan', 'motionEvents', 'implementationMode',
            'referenceChoices', 'referenceDisposition', 'mediaContract', 'dynamicContract', 'exactScreenWords',
            'brandCorner']
    payload = {'scene': {k: page[k] for k in keys if k in page}, 'direction': selected_direction,
               'route': page.get('productionRoute', {}).get('selected'),
               'timelineFps': manifest.get('timelineFps'), 'subtitles': subtitles,
               'sceneWindow': window if window is not None else 'missing-global-mapping',
               'brandCorner': manifest.get('brandCorner'), 'audio': manifest.get('audio'),
               'outputSpec': manifest.get('outputSpec')}
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def _file(entry, base, path_key, label, errors):
    if not isinstance(entry, dict) or not _text(entry.get(path_key)):
        errors.append(label + ': missing ' + path_key)
        return None
    path = Path(entry[path_key])
    path = path if path.is_absolute() else base / path
    if not path.is_file():
        errors.append(label + ': file does not exist: ' + str(path))
        return None
    if _plain_sha(entry.get('sha256')) != _sha(path):
        errors.append(label + ': file hash missing or changed')
        return None
    return path


def _subtitle_errors(manifest, stage, base):
    subtitles = manifest.get('subtitles', {})
    if stage != 'representative' or not isinstance(subtitles, dict) or subtitles.get('enabled') is not True:
        return []
    errors = []
    cues = subtitles.get('cues')
    if not isinstance(cues, list):
        errors.append('Enabled subtitles require imported cues before the representative gate; sourcePath alone is not timing evidence')
    else:
        for index, cue in enumerate(cues):
            if not isinstance(cue, dict):
                errors.append(f'subtitles.cues[{index}] must be an object')
                continue
            start, end = cue.get('startSeconds'), cue.get('endSeconds')
            if (not all(isinstance(value, (int, float)) and not isinstance(value, bool)
                        and math.isfinite(value) for value in [start, end])
                    or start < 0 or end <= start or not _text(cue.get('text'))):
                errors.append(f'subtitles.cues[{index}] needs valid global times and nonempty text')
    if 'sourcePath' in subtitles:
        _file({'path': subtitles.get('sourcePath'), 'sha256': subtitles.get('sourceSha256')},
              base, 'path', 'subtitles/sourceSha256', errors)
    return errors


def _image(path):
    """Decode one still, rejecting text, videos, and unreadable image data."""
    try:
        probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=codec_name,width,height', '-of', 'json', str(path)],
            capture_output=True, text=True, timeout=20)
        streams = json.loads(probe.stdout).get('streams', []) if probe.returncode == 0 else []
        if not streams or streams[0].get('codec_name') not in {'png', 'mjpeg', 'webp', 'bmp', 'tiff'}:
            return False
        decode = subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(path),
            '-frames:v', '1', '-f', 'null', '-'], capture_output=True, timeout=20)
        return decode.returncode == 0 and not decode.stderr.strip()
    except (OSError, ValueError, subprocess.TimeoutExpired):
        return False


def validate_workflow(manifest, stage, base):
    workflow = manifest.get('workflow', {})
    if not isinstance(workflow, dict) or workflow.get('profile') != PROFILE:
        return []
    errors = []
    base = Path(base)
    authorization = workflow.get('authorization', {})
    if not isinstance(authorization, dict):
        return ['workflow.authorization must be an object']
    mode = authorization.get('mode', 'standard')
    if mode not in {'standard', 'direct-output', 'bounded-revision'}:
        return ['Unknown workflow authorization mode']
    errors.extend(_subtitle_errors(manifest, stage, base))
    if mode != 'standard':
        if not _text(authorization.get('source')):
            return ['Workflow override requires the actual current user authorization source']
        # Only user waiting is overridden. Source, dynamic and technical gates still run.
        return errors
    for page in manifest.get('pages', []):
        sid = page.get('stableId', '<missing>')
        route = page.get('productionRoute', {})
        if not isinstance(route, dict) or route.get('selected') not in ROUTES or not _text(route.get('source')):
            errors.append(sid + ': route needs an explicit selection and user source, not only a suggestion')
            continue
        if route['selected'] not in {'remotion', 'mixed'}:
            continue
        selection = page.get('storyboardReview', {})
        if not isinstance(selection, dict) or selection.get('status') != 'confirmed' or not _text(selection.get('confirmedSource')):
            errors.append(sid + ': direction confirmation is missing or stale')
            continue
        picked = selection.get('userSelection')
        if picked:
            if not isinstance(picked, dict):
                errors.append(sid + ': userSelection must identify a candidate')
            else:
                matches = [x for x in selection.get('candidates', []) if isinstance(x, dict) and x.get('id') == picked.get('candidateId')]
                if len(matches) != 1 or _plain_sha(picked.get('sha256')) != _plain_sha(matches[0].get('sha256')):
                    errors.append(sid + ': selected candidate hash is stale or unknown')
                else:
                    _file(matches[0], base, 'imagePath', sid + '/direction', errors)
        elif not _text(selection.get('directionNote')):
            errors.append(sid + ': record the selected candidate or explicit existing direction')
        if stage != 'representative':
            continue
        review = page.get('keyframeReview', {})
        if not isinstance(review, dict) or review.get('status') != 'confirmed' or not _text(review.get('confirmedSource')):
            errors.append(sid + ': real keyframes need user confirmation or a current explicit override')
            continue
        if review.get('openIssues'):
            errors.append(sid + ': keyframe issues remain open; a keep label is not approval of requested changes')
        if _plain_sha(review.get('contextSha256')) != scene_review_signature(manifest, page):
            errors.append(sid + ': keyframe context changed; review the affected frames')
        sources = review.get('sourceFiles')
        if not isinstance(sources, list) or not sources:
            errors.append(sid + ': keyframes must bind the actual scene source files')
        else:
            for source in sources:
                _file(source, base, 'path', sid + '/source', errors)
        confirmed = review.get('confirmedFrames', [])
        confirmed_hashes = {x.get('id'): _plain_sha(x.get('sha256')) for x in confirmed if isinstance(x, dict)} if isinstance(confirmed, list) else {}
        frames = review.get('frames')
        if not isinstance(frames, list) or not frames:
            errors.append(sid + ': no real keyframes recorded')
            continue
        ids = set()
        window = scene_window(manifest, page)
        if window is None:
            errors.append(sid + ': missing reliable global scene mapping; declare timelineFps and an explicit global offset for a scene-local clock')
            continue
        start, end = window
        for frame in frames:
            if not isinstance(frame, dict) or not _text(frame.get('id')) or frame.get('id') in ids:
                errors.append(sid + ': keyframes require unique ids')
                continue
            ids.add(frame['id'])
            if confirmed_hashes.get(frame['id']) != _plain_sha(frame.get('sha256')) or not confirmed_hashes.get(frame['id']):
                errors.append(sid + ': current frame does not match the explicitly confirmed image')
            path = _file(frame, base, 'path', sid + '/' + frame['id'], errors)
            time = frame.get('timeSeconds')
            if not isinstance(time, (float, int)) or isinstance(time, bool) or not math.isfinite(time) or not start <= time < end:
                errors.append(sid + ': keyframe timeSeconds must be inside this scene global window')
            if path and not _image(path):
                errors.append(sid + ': keyframe is not a decodable still image')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--stage', choices=['planning', 'representative', 'signature'], required=True)
    parser.add_argument('--scene-id', action='append')
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    pages = manifest.get('pages', [])
    if args.scene_id:
        known = {p.get('stableId') for p in pages}
        if set(args.scene_id) - known:
            parser.error('Unknown scene id')
        pages = [p for p in pages if p.get('stableId') in args.scene_id]
    if args.stage == 'signature':
        result = {p['stableId']: scene_review_signature(manifest, p) for p in pages}
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        scoped = dict(manifest, pages=pages)
        errors = validate_workflow(scoped, args.stage, args.manifest.parent)
        print(json.dumps({'status': 'FAIL' if errors else 'PASS', 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(bool(errors))


if __name__ == '__main__':
    main()
