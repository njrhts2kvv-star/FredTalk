#!/usr/bin/env python3
"""Read just one scene's applicable methods, preferences and checks."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from common import project_root
from feedback import load_feedback


def load_routing(root):
    data = json.loads((root / 'skills/fred-remotion-output/references/scene-routing.json').read_text())
    if data.get('schemaVersion') != 1:
        raise ValueError('Unsupported scene routing schema')
    return data


def applicable(root, scene_type, modifiers=(), extra_rules=()):
    routing = load_routing(root)
    types = {x['id']: x for x in routing['types']}
    addons = {x['id']: x for x in routing['modifiers']}
    rules = {x['id']: x for x in load_feedback(root)['rules']}
    if scene_type not in types:
        raise ValueError('Unknown scene type: ' + str(scene_type))
    if not isinstance(modifiers, (list, tuple)) or not isinstance(extra_rules, (list, tuple)):
        raise ValueError('Modifiers and extraRuleIds must be arrays')
    if any(x not in addons for x in modifiers):
        raise ValueError('Unknown scene modifier')
    profile = types[scene_type]
    selected_modifiers = [addons[x] for x in dict.fromkeys(modifiers)]
    ids = list(dict.fromkeys(profile['ruleIds'] +
                            [r for m in selected_modifiers for r in m['ruleIds']] + list(extra_rules)))
    if any(r not in rules for r in ids):
        raise ValueError('Unknown feedback rule in scene routing')
    selected = [{k: rules[r][k] for k in ['id', 'title', 'when', 'prefer', 'avoid', 'scope', 'checks']}
                for r in ids]
    signature = hashlib.sha256(json.dumps([profile, selected_modifiers, selected],
                                          ensure_ascii=False, sort_keys=True).encode()).hexdigest()
    return profile, selected_modifiers, selected, signature


def packet(root, scene_type, modifiers=(), extra_rules=()):
    profile, addons, rules, signature = applicable(root, scene_type, modifiers, extra_rules)
    return {
        'scope': 'One scene planning and review aid; no fixed composition or visual approval',
        'sceneType': profile['id'], 'title': profile['title'], 'when': profile['when'],
        'designGuide': load_routing(root).get('designGuide', {}),
        'inputsToResolve': profile['inputs'], 'suggestedActionLogic': profile['flow'],
        'modifiers': [{k: m[k] for k in ['id', 'title', 'when']} for m in addons],
        'rules': rules, 'exitCheck': profile['exitCheck'],
        'referenceQueries': profile['referenceQueries'],
        'contentToComponent': 'references/content-to-component.md: define the visible content change, bind actual source and call site, review meaning and visual quality',
        'implementationRefs': list(dict.fromkeys(profile['implementationRefs'] +
                                                  [p for m in addons for p in m['implementationRefs']])),
        'guideSignature': signature,
        'recordInManifest': 'sceneGuide: type, modifiers, signature, applications[{ruleId, decision, check}]; '
                            'write this scene\'s actual decisions, not a copy of general rules',
        'evidenceOnDemand': 'references.py --kind rules --id <ruleId> --full',
        'next': 'If reusing a selected reference, resolve its exact source ID; otherwise record the new design '
                'and its scene-specific checks. At joins read --stage joining; '
                'at export read --stage render. Do not preload every stage or the complete guide.'}


def _fields(value, names):
    return {key: value[key] for key in names if key in value}


def _neighbor(page):
    if page is None:
        return None
    result = _fields(page, ['stableId', 'startFrame', 'globalStartFrame', 'globalVoiceStartFrame',
        'durationInFrames', 'implementationMode', 'productionRoute', 'mediaFile',
        'firstFrame', 'tailFrame', 'boundaryContract'])
    if 'mediaContract' in page:
        media = page['mediaContract']
        identity_fields = ['id', 'path', 'sha256', 'role', 'startFrame', 'endFrameExclusive', 'range',
                           'firstFrame', 'tailFrame']
        if isinstance(media, list):
            result['mediaContract'] = [_fields(item, identity_fields) for item in media]
        elif isinstance(media, dict):
            result['mediaContract'] = _fields(media, identity_fields)
    result['visualPlan'] = _fields(page.get('visualPlan', {}), ['enter', 'exit', 'handoff'])
    if isinstance(page.get('review'), dict):
        review = page['review']
        result['review'] = _fields(review, ['status', 'note', 'currentOutput', 'reviewedVersion', 'choice'])
        if 'versions' in review:
            result['review']['versions'] = review['versions'][:1]
    if isinstance(page.get('keyframeReview'), dict):
        result['keyframeReview'] = _fields(page['keyframeReview'],
            ['status', 'contextSha256', 'sourceRevision', 'confirmedSource', 'artifact', 'sha256'])
        frames = page['keyframeReview'].get('frames', [])
        if frames:
            result['keyframeReview']['frames'] = frames[:1] + (frames[-1:] if len(frames) > 1 else [])
    return result


def _number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _scene_window(manifest, page):
    # The two explicit global offsets occur in existing EP99 scene-local manifests.
    source = next((key for key in ['globalStartFrame', 'globalVoiceStartFrame'] if key in page), None)
    if source is None and manifest.get('clockContract', {}).get('mode') != 'scene-local':
        source = 'startFrame'
    start = page.get(source) if source else None
    fps, duration = manifest.get('timelineFps'), page.get('durationInFrames')
    if not all(_number(x) for x in [fps, start, duration]) or fps <= 0 or start < 0 or duration <= 0:
        return None
    return {'startSeconds': start / fps, 'endSeconds': (start + duration) / fps,
            'startFrameSource': source, 'clock': 'global', 'interval': '[start, end)'}


def _overlay_context(manifest, page, warnings):
    window = _scene_window(manifest, page)
    result = {'sceneWindow': window}
    corner = {}
    for source, label in [(manifest, 'Manifest'), (page, 'Scene')]:
        if 'brandCorner' in source:
            if not isinstance(source['brandCorner'], dict):
                raise ValueError(f'{label} brandCorner must be an object')
            corner.update(source['brandCorner'])
    if 'brandCorner' in manifest or 'brandCorner' in page:
        result['brandCorner'] = corner
    if 'subtitles' not in manifest:
        return result
    subtitles = manifest['subtitles']
    if not isinstance(subtitles, dict):
        raise ValueError('Manifest subtitles must be an object')
    result['subtitles'] = {k: v for k, v in subtitles.items() if k != 'cues'}
    if 'cues' not in subtitles:
        if subtitles.get('enabled') is not False:
            warnings.append('Subtitle cue windows are not in this Manifest; use the declared source before layout review.')
        return result
    cues = subtitles['cues']
    if not isinstance(cues, list):
        raise ValueError('Manifest subtitles.cues must be an array')
    selected = []
    for index, cue in enumerate(cues):
        if not isinstance(cue, dict):
            raise ValueError(f'Invalid subtitle cue at index {index}')
        start, end = cue.get('startSeconds'), cue.get('endSeconds')
        if not all(_number(x) for x in [start, end]) or start < 0 or end <= start:
            raise ValueError(f'Subtitle cue {index} needs valid global startSeconds/endSeconds')
        if window and start < window['endSeconds'] and end > window['startSeconds']:
            selected.append(cue)
    result['subtitles']['cues'] = selected
    if window is None:
        warnings.append('No reliable global scene window; subtitle cues were not guessed from a local clock.')
    return result


def _brand_guidance(root, manifest, result, warnings):
    """Expose the existing standard without silently changing a scene contract."""
    corner = result['overlayContext'].get('brandCorner')
    if corner is not None and not isinstance(corner, dict):
        raise ValueError('Manifest brandCorner must be an object')
    output = manifest.get('outputSpec', {})
    width, height = output.get('width'), output.get('height')
    landscape = (all(_number(x) and x > 0 for x in (width, height)) and
                 abs(width / height - 16 / 9) < .001)
    default_scope = manifest.get('deliveryProfile') == 'standalone-video' and landscape
    enabled = isinstance(corner, dict) and corner.get('enabled') is True
    if not enabled and not (corner is None and default_scope):
        return
    reference = 'skills/fred-remake/references/corner-branding.md'
    if reference not in result['implementationRefs']:
        result['implementationRefs'].append(reference)
    canonical = json.loads((root / 'skills/fred-remake/references/corner-branding.json').read_text())
    result['overlayContext']['brandGuidance'] = {
        'position': 'top-right', 'reference': reference, 'canonical': canonical,
        'scope': 'Reference guidance only. Current explicit exceptions override the default; '
                 'source video playback has no added corner brand; use scene brandCorner '
                 'and hiddenIntervals for mixed scenes rather than an unconditional film-wide layer. '
                 'keep the brand on the final canvas outside the content camera. '
                 'Do not infer visual approval or multiply destination scale twice.'}
    if corner is None:
        warnings.append('brandCorner is undeclared: FredTalk landscape explainers default to the '
                        'canonical top-right brand in animation; source video playback is unbranded. '
                        'Resolve scene applicability and playback windows '
                        'scope before layout; no contract was inserted automatically.')
    elif 'brand-corner' not in {item['id'] for item in result['modifiers']}:
        warnings.append('brandCorner is enabled but sceneGuide omits brand-corner; its canonical '
                        'guidance is included. Check the actual layer and update affected scene '
                        'decisions when applicable; the old signature was not rewritten.')


def manifest_packet(root, manifest, scene_id):
    """Return declared current-scene facts plus bounded adjacent context; never infer approval."""
    pages = manifest['pages']
    matches = [(i, p) for i, p in enumerate(pages) if p.get('stableId') == scene_id]
    if not scene_id or len(matches) != 1:
        raise ValueError('--scene-id must identify exactly one Manifest scene')
    i, page = matches[0]
    guide = page.get('sceneGuide', {})
    result = packet(root, guide.get('type'), guide.get('modifiers', []), guide.get('extraRuleIds', []))
    result['currentScene'] = _fields(page, [
        'stableId', 'oneQuestion', 'sourceBeatIds', 'sourceSpans', 'scriptAnchor', 'exactScreenWords',
        'startFrame', 'globalStartFrame', 'globalVoiceStartFrame', 'durationInFrames',
        'narrationDurationInFrames', 'cues', 'visualClock', 'visualPlan', 'motionEvents',
        'implementationMode', 'productionRoute', 'storyboardReview', 'keyframeReview',
        'referenceChoices', 'referenceDisposition', 'componentPlan', 'typography', 'styleContract', 'mediaContract', 'dynamicContract',
        'mediaFile', 'sourceMapping', 'sounds', 'sceneGuide', 'review', 'revision',
        'brandCorner',
        'currentFeedback', 'feedback', 'preservation', 'preserveScope', 'approval',
        'firstFrame', 'tailFrame', 'boundaryContract'])
    previous = _neighbor(pages[i - 1]) if i else None
    following = _neighbor(pages[i + 1]) if i + 1 < len(pages) else None
    result['neighborBoundary'] = {
        'previous': previous, 'next': following,
        'previousHandoff': previous['visualPlan'].get('handoff') if previous else None,
        'nextEnter': following['visualPlan'].get('enter') if following else None}
    result['manifestContext'] = _fields(manifest, ['episodeKey', 'revision', 'deliveryProfile',
        'timelineFps', 'output', 'outputSpec', 'clockContract', 'sourceSrt', 'approval',
        'preservation', 'preserveScope', 'designContract', 'fonts'])
    feedback = manifest.get('feedback', {})
    if isinstance(feedback, dict) and scene_id in feedback:
        result['feedbackContext'] = {'manifestFeedback': feedback[scene_id]}
    if 'workflow' in manifest:
        result['workflowContext'] = {'declared': manifest['workflow']}
        if isinstance(manifest['workflow'], dict) and manifest['workflow'].get('profile') == 'fred-video-v2':
            result['workflowContext']['defaultOrder'] = ['suggestion', 'keyframes', 'internal-motion-review', 'video']
            result['workflowContext']['note'] = 'Default reading order only; actual choices and reviews stay as declared, with no inferred confirmation.'
    warnings = []
    result['overlayContext'] = _overlay_context(manifest, page, warnings)
    _brand_guidance(root, manifest, result, warnings)
    decisions = [item.get('decision') for item in guide.get('applications', [])
                 if isinstance(item, dict) and isinstance(item.get('decision'), str)]
    if len(decisions) > 1 and len(set(decisions)) == 1:
        warnings.append('All sceneGuide rule decisions repeat the same text. Check that each '
                        'rule has actually been applied, especially typography, media and brand; '
                        'this is a review warning, not a visual failure or a rewrite requirement.')
    if warnings:
        result['contextWarnings'] = warnings
    from component_selection import scene_shortlist
    result['libraryCandidates'] = scene_shortlist(root, page)
    result['typographyGuide'] = 'references/typography.md; query typography.py for exact local fonts and source examples'
    result['timingStatus'] = manifest.get('timingStatus')
    result['contextScope'] = 'Current scene contracts are copied as declared. Neighbor review versions include only the current first entry. Missing fields are not approval; full script, other feedback and external files are not loaded.'
    return result


def validate_scene_guides(root, pages, required=False):
    errors = []
    for page in pages:
        pid = page.get('stableId', '<missing>')
        guide = page.get('sceneGuide')
        if not guide:
            if required:
                errors.append(pid + ': missing sceneGuide')
            continue
        try:
            profile, _, rules, signature = applicable(root, guide.get('type'),
                guide.get('modifiers', []), guide.get('extraRuleIds', []))
            if guide.get('signature') != signature:
                errors.append(pid + ': scene guidance changed; re-read this scene packet')
            applications = guide.get('applications', [])
            if not isinstance(applications, list):
                raise ValueError('applications must be an array')
            ids = [a.get('ruleId') for a in applications]
            expected = {r['id'] for r in rules}
            if set(ids) != expected or len(set(ids)) != len(ids):
                errors.append(pid + ': applications must cover exactly the selected scene rules')
            for a in applications:
                if not isinstance(a.get('decision'), str) or not a['decision'].strip() or \
                   not isinstance(a.get('check'), str) or not a['check'].strip():
                    errors.append(pid + ': each applicable rule needs a local decision and check')
            if profile['id'] == 'custom' and not guide.get('customReason'):
                errors.append(pid + ': custom scene needs its actual design reason')
        except (ValueError, TypeError, AttributeError) as error:
            errors.append(pid + ': ' + str(error))
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root')
    parser.add_argument('--list', action='store_true')
    parser.add_argument('--type')
    parser.add_argument('--with', dest='modifiers', action='append', default=[])
    parser.add_argument('--rule', action='append', default=[])
    parser.add_argument('--stage', choices=['planning', 'joining', 'render', 'revision'])
    parser.add_argument('--manifest', type=Path)
    parser.add_argument('--scene-id')
    args = parser.parse_args()
    try:
        root = project_root(args.project_root)
        routing = load_routing(root)
        if args.list:
            result = {k: [{f: x[f] for f in ['id', 'title', 'when']} for x in routing[k]]
                      for k in ['types', 'modifiers']}
        elif args.stage:
            if args.type or args.manifest or args.modifiers or args.rule:
                raise ValueError('Read a stage separately from a scene packet')
            ids = routing['stageRules'][args.stage]
            result = {'stage': args.stage, 'rules': [
                {k: r[k] for k in ['id', 'title', 'when', 'prefer', 'avoid', 'scope', 'checks']}
                for r in load_feedback(root)['rules'] if r['id'] in ids]}
            if args.stage in routing.get('stageReferences', {}):
                result['implementationRefs'] = routing['stageReferences'][args.stage]
        elif args.manifest:
            if args.type or args.modifiers or args.rule:
                raise ValueError('With --manifest, routing comes only from that sceneGuide')
            manifest = json.loads(args.manifest.read_text())
            result = manifest_packet(root, manifest, args.scene_id)
            result['manifestPath'] = str(args.manifest.absolute())
        else:
            if args.scene_id:
                raise ValueError('--scene-id requires --manifest')
            result = packet(root, args.type, args.modifiers, args.rule)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (OSError, ValueError, KeyError, TypeError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
