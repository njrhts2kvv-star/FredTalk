#!/usr/bin/env python3
"""Check narration coverage and timing in the existing Manifest, not visual quality."""
import argparse
import hashlib
import json
from pathlib import Path
from common import project_root, load_references, strip_prefix
from scene import validate_scene_guides
from reference_usage import validate_reference_usage
from production_contract import validate_production_contract


def validate(manifest, script_text, choices, require_final=False):
    errors, warnings = [], []
    script_meta = manifest.get('script')
    if not isinstance(script_meta, dict) or not isinstance(script_meta.get('sha256'), str):
        errors.append('Manifest script must be an object with path and sha256')
    elif strip_prefix(script_meta['sha256'], 'sha256:') != hashlib.sha256(script_text.encode()).hexdigest():
        errors.append('Script hash does not match the actual source text')
    timing = manifest.get('timingStatus')
    if timing not in ['estimated', 'audio-aligned', 'approved-manual']:
        errors.append('Explicit timingStatus is required')
    if timing == 'estimated':
        (errors if require_final else warnings).append('Timing is estimated; align to audio before final production')
    if timing == 'audio-aligned' and not manifest.get('timingEvidence'):
        errors.append('Audio alignment requires a timingEvidence reference')
    if timing == 'approved-manual' and not manifest.get('timingEvidence'):
        errors.append('Manual timing requires its actual approval evidence')
    fps, duration = manifest.get('timelineFps'), manifest.get('durationInFrames')
    if not isinstance(fps, (int, float)) or isinstance(fps, bool) or fps <= 0:
        errors.append('timelineFps must be positive')
    if not isinstance(duration, int) or isinstance(duration, bool) or duration <= 0:
        errors.append('durationInFrames must be a positive integer')
        return errors, warnings
    lookup = {c['id']: c.get('status', 'keep') for c in choices['components'] + choices['clips']}
    coverage = [0] * len(script_text)
    seen, end_frame = set(), 0
    pages = manifest.get('pages', [])
    if not pages:
        errors.append('No narration scene groups in pages')
    for page in pages:
        pid = page.get('stableId', '<missing>')
        if pid in seen or pid == '<missing>':
            errors.append('Missing or duplicate stableId: ' + pid)
        seen.add(pid)
        for field in ['oneQuestion', 'sourceBeatIds', 'sourceSpans']:
            if not page.get(field): errors.append(pid + ': missing ' + field)
        if 'exactScreenWords' not in page:
            errors.append(pid + ': missing exactScreenWords')
        elif not isinstance(page['exactScreenWords'], list):
            errors.append(pid + ': exactScreenWords must be an array; use [] for no added text')
        plan = page.get('visualPlan', {})
        if any(not plan.get(k) for k in ['enter', 'change', 'read', 'exit', 'handoff']):
            errors.append(pid + ': describe enter/change/read/exit/handoff')
        start, length = page.get('startFrame'), page.get('durationInFrames')
        if not isinstance(start, int) or not isinstance(length, int) or isinstance(start, bool) or isinstance(length, bool) or start < 0 or length <= 0:
            errors.append(pid + ': invalid global frame range')
            continue
        stop = start + length
        overlap = page.get('transitionOverlapFrames', 0)
        if not isinstance(overlap, int) or isinstance(overlap, bool) or overlap < 0 or (not end_frame and overlap):
            errors.append(pid + ': invalid transition overlap')
            overlap = 0
        if start != end_frame - overlap or stop > duration or stop <= end_frame:
            errors.append(pid + ': unexplained gap/overlap or duration mismatch')
        end_frame = max(end_frame, stop)
        own_text = ''
        for span in page.get('sourceSpans', []):
            a, b = span.get('startChar'), span.get('endChar')
            if not isinstance(a, int) or not isinstance(b, int) or not 0 <= a < b <= len(script_text):
                errors.append(pid + ': invalid character span')
                continue
            if span.get('text') != script_text[a:b]:
                errors.append(pid + ': sourceSpan changed the narration')
            if any(coverage[i] and not script_text[i].isspace() for i in range(a, b)) and not page.get('sharedSourceReason'):
                errors.append(pid + ': narration reused without sharedSourceReason')
            for i in range(a, b): coverage[i] += 1
            own_text += script_text[a:b]
        for event in page.get('motionEvents', []):
            cue = event.get('cueFrame')
            if not isinstance(cue, int) or isinstance(cue, bool) or not start <= cue < stop:
                errors.append(pid + ': cueFrame must be inside its global scene range')
            if not event.get('spokenCue') or event['spokenCue'] not in own_text:
                errors.append(pid + ': spokenCue is not in the assigned original narration')
            if event.get('sourceBeatId') not in page.get('sourceBeatIds', []):
                errors.append(pid + ': motion cue is not linked to this scene sourceBeatIds')
        for ref in page.get('referenceChoices', []):
            status = lookup.get(ref.get('id'))
            if status is None or status == 'drop':
                errors.append(pid + ': unknown or excluded reference ' + str(ref.get('id')))
            if not all(ref.get(k) for k in ['reason', 'preserve', 'change', 'useScope']):
                errors.append(pid + ': reference responsibility and allowed changes are required')
    if end_frame != duration: errors.append('Scene groups do not cover the full declared duration')
    if any(not char.isspace() and coverage[i] == 0 for i, char in enumerate(script_text)):
        errors.append('Some narration characters have no scene responsibility')
    previous = 0
    parts = manifest.get('parts', [])
    for part in parts:
        a, b = part.get('startFrame'), part.get('endFrameExclusive')
        if not isinstance(a, int) or not isinstance(b, int) or a != previous or b <= a or b > duration:
            errors.append('Parts must cover the global half-open timeline once')
            continue
        previous = b
    if not parts or previous != duration: errors.append('Delivery parts do not cover the complete timeline')
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--project-root')
    parser.add_argument('--require-final-timing', action='store_true')
    parser.add_argument('--require-scene-guides', action='store_true')
    parser.add_argument('--require-reference-usage', action='store_true')
    parser.add_argument('--require-production-contract', action='store_true',
                        help='Require explicit implementation, media, style and dynamic contracts for every scene')
    parser.add_argument('--scene-id', action='append', help='Limit scene-guide and source-usage checks to affected scenes; narration and timing remain global')
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    try:
        root = project_root(args.project_root)
        _, choices = load_references(root)
        manifest = json.loads(args.manifest.read_text())
        script_meta = manifest.get('script')
        if not isinstance(script_meta, dict) or not isinstance(script_meta.get('path'), str):
            script = ''
        else:
            script_path = args.manifest.parent / script_meta['path']
            # Preserve raw newline characters for exact source-span/hash checks.
            script = script_path.read_bytes().decode('utf-8')
        errors, warnings = validate(manifest, script, choices, args.require_final_timing)
        pages = manifest.get('pages', [])
        missing_targets = set()
        if args.scene_id:
            target_ids = set(args.scene_id)
            missing_targets = target_ids - {page.get('stableId') for page in pages}
            if missing_targets:
                errors.append('Unknown target scenes: ' + ', '.join(sorted(missing_targets)))
            pages = [page for page in pages if page.get('stableId') in target_ids]
        errors += validate_scene_guides(root, pages, args.require_scene_guides)
        if manifest.get('workflow', {}).get('componentMatching') == 'v1':
            from component_selection import validate_component_plan
            errors += validate_component_plan(pages, choices)
        if args.require_reference_usage and not missing_targets:
            errors += validate_reference_usage(manifest, choices, args.manifest.parent, args.scene_id, root=root)
        if args.require_production_contract and not missing_targets:
            errors += validate_production_contract(manifest, require_explicit=True,
                                                   check_media_files=False, base=args.manifest.parent,
                                                   scene_ids=args.scene_id)
        result = {'status': 'FAIL' if errors else 'PASS', 'scope': 'Narration, timing and scene planning fields; not a render gate or visual approval',
                  'errors': errors, 'warnings': warnings}
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
        print(json.dumps(result, ensure_ascii=False, indent=2))
        raise SystemExit(bool(errors))
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
