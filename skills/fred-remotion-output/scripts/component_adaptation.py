"""Resolve explicitly shared typography and bounded adaptation checks; never rewrite a Manifest."""
from copy import deepcopy

STYLE_FIELDS = ('fontId', 'fontFamily', 'fontFile', 'fontSha256', 'fontWeight',
                'fontSize', 'lineHeight', 'letterSpacing', 'logicalCanvas')


def _resolved(manifest, item):
    group = item.get('styleGroup')
    shared = manifest.get('sharedTypography', {})
    if not isinstance(shared, dict):
        raise ValueError('sharedTypography must be an object')
    if group and group not in shared:
        raise ValueError('Unknown shared typography: ' + str(group))
    style = shared.get(group, {}) if group else {}
    if not isinstance(style, dict):
        raise ValueError('Shared typography style must be an object')
    # Explicit local values are authoritative, including exceptions in current user requests.
    return {**deepcopy(style), **deepcopy(item)}


def adaptation_context(manifest, page):
    typography = page.get('typography', [])
    if not isinstance(typography, list) or any(not isinstance(x, dict) for x in typography):
        raise ValueError('Scene typography must be an array of objects')
    resolved = [_resolved(manifest, item) for item in typography]
    comparisons, warnings = [], []
    for current in resolved:
        group = current.get('styleGroup')
        if not group:
            continue
        for peer in manifest.get('pages', []):
            if peer.get('stableId') == page.get('stableId'):
                continue
            for item in peer.get('typography', []):
                if item.get('styleGroup') != group:
                    continue
                other = _resolved(manifest, item)
                different = [key for key in STYLE_FIELDS if current.get(key) != other.get(key)]
                declared = bool(current.get('overrideReason') or other.get('overrideReason'))
                status = 'MATCH' if not different else 'DECLARED_DIFFERENCE' if declared else 'REVIEW_DIFFERENCE'
                comparisons.append({'styleGroup': group, 'role': current.get('role'),
                                    'peerSceneId': peer.get('stableId'), 'peerRole': other.get('role'),
                                    'differentFields': different, 'status': status,
                                    'overrideReason': current.get('overrideReason') or other.get('overrideReason')})
                if status == 'REVIEW_DIFFERENCE':
                    warnings.append(f'Shared typography {group} differs from {peer.get("stableId")}: '
                                    + ', '.join(different) + '. Compare actual viewing scale; keep explicit user values.')
    checks = []
    if resolved:
        checks.append({'topic': 'typography', 'check': 'Use the shared implementation for matching styleGroup values; '
                       'verify loaded font identity, weight, logical canvas and parent scaling in actual output. '
                       'MATCH describes declarations only, not visual approval.'})
    if page.get('readingPlan') or page.get('sceneGuide', {}).get('type') == 'prompt-reading':
        checks.append({'topic': 'reading', 'check': 'Keep the declared full text, longest line and correct repeated-term range; '
                       'use the same measured glyphs and camera for text and brush. Check establishment, focus, '
                       'stable reading, return and handoff at real narration cues; no fixed number of states.'})
    if page.get('sourceMapping') or page.get('boundaryContract') or page.get('mediaContract'):
        checks.append({'topic': 'handoff', 'check': 'Carry the actual source identity/time, scroll and camera state at the boundary; '
                       'overlay focus must not restart playback. Continuous playback and deliberate hold are separate choices.'})
    if page.get('preserveObjects'):
        checks.append({'topic': 'revision', 'check': 'Bind each changed or protected object to its current source and time range; '
                       'a change to the first panel does not authorize replacement of later input/result carriers.'})
    if page.get('componentPlan', {}).get('contentRoles'):
        checks.append({'topic': 'content-roles', 'check': 'Verify each declared carrier serves its background, operation or result role; '
                       'combine selected components only where the narrated state changes.'})
    return {'resolvedTypography': resolved, 'typographyComparisons': comparisons,
            'checks': checks, 'warnings': warnings,
            'runtimeHelper': 'templates/components/component-adaptation.ts',
            'scope': 'Declared inputs and bounded comparisons only; no automatic layout, asset choice or approval.'}
