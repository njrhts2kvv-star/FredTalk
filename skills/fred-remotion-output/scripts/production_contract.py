"""Validate the production contract that sits between storyboard and rendering.

This module deliberately checks planning facts, not visual quality.  It makes the
four valid implementation routes explicit without requiring every scene to reuse
the reference library.
"""
from pathlib import Path
from common import digest, strip_prefix


IMPLEMENTATION_MODES = {
    "reference",       # accurate library component, minimally adapted
    "adapted",         # library motion/relationship adapted to new content
    "original",        # new motion/layout with an explicit style contract
    "preserved-media", # real supplied media carries the proof
    "talk-only",       # narration/typography only, no visual evidence claim
}
DYNAMIC_MODES = {"dynamic", "mixed", "stable-reading"}
STYLE_KEYS = {
    "surface", "typography", "geometry", "motion", "camera", "mediaBehavior"
}


def _text(value):
    return isinstance(value, str) and bool(value.strip())


def _list(value):
    return isinstance(value, list)


def _scene_mode(page):
    mode = page.get("implementationMode")
    if isinstance(mode, str):
        return mode
    # Backward-compatible inference for diagnostics.  The production gate still
    # requires an explicit implementationMode, so old manifests cannot slip into
    # formal rendering accidentally.
    if page.get("referenceChoices"):
        return "reference"
    disposition = page.get("referenceDisposition", {})
    return disposition.get("mode")


def _check_media_contract(page, base=None, check_files=False):
    errors = []
    pid = page.get("stableId", "<missing>")
    media = page.get("mediaContract")
    if media is None:
        if _scene_mode(page) in {"preserved-media", "adapted", "original"} and page.get("requiresRealMedia"):
            errors.append(pid + ": requiresRealMedia=true but mediaContract is missing")
        return errors
    if not _list(media) or not media:
        errors.append(pid + ": mediaContract must be a non-empty array when declared")
        return errors
    for item in media:
        mid = item.get("id", "<missing-media-id>") if isinstance(item, dict) else "<invalid-media>"
        label = pid + "/media/" + str(mid)
        if not isinstance(item, dict):
            errors.append(label + ": media entry must be an object")
            continue
        for field in ["id", "path", "role"]:
            if not _text(item.get(field)):
                errors.append(label + ": " + field + " is required")
        if "required" in item and not isinstance(item["required"], bool):
            errors.append(label + ": required must be boolean")
        if check_files:
            path = Path(item.get("path", ""))
            if not path.is_absolute():
                path = base / path
            if not path.is_file():
                errors.append(label + ": media file does not exist: " + str(path))
            elif not _text(item.get("sha256")):
                errors.append(label + ": sha256 is required once media files are checked")
            else:
                try:
                    actual = digest(path)
                    expected = strip_prefix(item["sha256"], "sha256:")
                    if actual != expected:
                        errors.append(label + ": sha256 mismatch")
                except OSError as error:
                    errors.append(label + ": " + str(error))
        for key in ["startFrame", "endFrameExclusive"]:
            if key in item and (not isinstance(item[key], int) or isinstance(item[key], bool) or item[key] < 0):
                errors.append(label + ": " + key + " must be a non-negative integer")
        if "startFrame" in item and "endFrameExclusive" in item and item["endFrameExclusive"] <= item["startFrame"]:
            errors.append(label + ": endFrameExclusive must be greater than startFrame")
    return errors


def validate_scene_contract(page, *, require_explicit=False, check_media_files=False, base=None):
    """Return errors for one page's implementation and evidence contract."""
    errors = []
    pid = page.get("stableId", "<missing>")
    mode = page.get("implementationMode")
    if require_explicit and mode not in IMPLEMENTATION_MODES:
        errors.append(pid + ": implementationMode must be one of " + ", ".join(sorted(IMPLEMENTATION_MODES)))
        return errors
    mode = _scene_mode(page)
    refs = page.get("referenceChoices", [])
    if not _list(refs):
        errors.append(pid + ": referenceChoices must be an array")
        refs = []
    disposition = page.get("referenceDisposition", {})
    if mode in {"reference", "adapted"}:
        if not refs:
            errors.append(pid + ": " + mode + " mode requires at least one referenceChoice")
        if disposition and disposition.get("mode") not in [None, "reference", "adapted"]:
            errors.append(pid + ": reference/adapted scene has an incompatible referenceDisposition")
    elif mode in {"original", "preserved-media", "talk-only"}:
        if refs:
            errors.append(pid + ": " + mode + " mode must not use referenceChoices as fake attribution; use anchors")
        if not isinstance(disposition, dict) or disposition.get("mode") != mode or not _text(disposition.get("reason")):
            errors.append(pid + ": " + mode + " mode requires referenceDisposition.mode and reason")
    if mode == "original":
        anchors = disposition.get("anchors", []) if isinstance(disposition, dict) else []
        style = disposition.get("styleContract", {}) if isinstance(disposition, dict) else {}
        if not _list(anchors) or not anchors:
            errors.append(pid + ": original visual design requires at least one style/motion anchor")
        if not isinstance(style, dict) or any(not _text(style.get(key)) for key in STYLE_KEYS):
            errors.append(pid + ": original visual design requires styleContract: " + ", ".join(sorted(STYLE_KEYS)))
        if not _list(disposition.get("newElements")) or not disposition.get("newElements"):
            errors.append(pid + ": original visual design must list newElements")
        if not _list(disposition.get("risks")) or not disposition.get("risks"):
            errors.append(pid + ": original visual design must list scene-specific risks")
        if disposition.get("reviewRequired") is not True:
            errors.append(pid + ": original visual design must set reviewRequired=true")
    if mode == "preserved-media" and not page.get("mediaContract"):
        errors.append(pid + ": preserved-media mode requires mediaContract")
    if mode == "talk-only" and page.get("mediaContract"):
        errors.append(pid + ": talk-only mode cannot claim media evidence")
    errors += _check_media_contract(page, base=base, check_files=check_media_files)

    dynamic = page.get("dynamicContract")
    if not isinstance(dynamic, dict):
        if require_explicit:
            errors.append(pid + ": dynamicContract is required; choose dynamic, mixed or stable-reading")
    else:
        dyn_mode = dynamic.get("mode")
        if dyn_mode not in DYNAMIC_MODES:
            errors.append(pid + ": dynamicContract.mode must be dynamic, mixed or stable-reading")
        if dyn_mode in {"dynamic", "mixed"}:
            changes = dynamic.get("requiredChangeEvents")
            if not isinstance(changes, int) or isinstance(changes, bool) or changes < 1:
                errors.append(pid + ": dynamic/mixed scenes require requiredChangeEvents >= 1")
            count = dynamic.get("sampleCount", 5)
            if (type(count) is not int or count < 3 or
                    (type(changes) is int and changes > count - 1)):
                errors.append(pid + ": dynamicContract.sampleCount defaults to 5 and must be an integer "
                              ">= 3 with requiredChangeEvents <= sampleCount - 1; fix sampling before rendering")
        if dyn_mode == "stable-reading" and not _text(dynamic.get("reason")):
            errors.append(pid + ": stable-reading scenes require a reason for the allowed stillness")
        allowance = dynamic.get("staticAllowanceSeconds", 0)
        if not isinstance(allowance, (int, float)) or isinstance(allowance, bool) or allowance < 0:
            errors.append(pid + ": staticAllowanceSeconds must be non-negative")
    return errors


def _brand_errors(corner, label):
    if not isinstance(corner, dict):
        return [label + ' must be an object']
    if (corner.get('enabled') is True and corner.get('position') not in (None, 'top-right')
            and not _text(corner.get('overrideSource'))):
        return [label + '.position differs from the canonical top-right position; '
                'record the actual current user exception in overrideSource or correct the placement']
    return []


def validate_production_contract(manifest, *, require_explicit=False, check_media_files=False,
                                 base=None, scene_ids=None):
    errors = []
    all_pages = manifest.get("pages", [])
    pages = all_pages
    if not isinstance(pages, list) or not pages:
        return ["Manifest pages must be a non-empty array"]
    corner = manifest.get('brandCorner')
    if corner is not None:
        errors.extend(_brand_errors(corner, 'brandCorner'))
    if scene_ids is not None:
        ids = {p.get("stableId") for p in pages}
        missing = set(scene_ids) - ids
        if missing:
            errors.append("Unknown target scenes: " + ", ".join(sorted(missing)))
        pages = [p for p in pages if p.get("stableId") in set(scene_ids)]
    if require_explicit and len(all_pages) > 1:
        clock = manifest.get("clockContract", {})
        if not isinstance(clock, dict) or clock.get("mode") != "scene-local" or not _text(clock.get("sourceRule")):
            errors.append("Multi-scene Manifest requires clockContract.mode=scene-local and a sourceRule")
    for page in pages:
        if 'brandCorner' in page:
            settings = page['brandCorner']
            if isinstance(settings, dict):
                settings = {**(corner if isinstance(corner, dict) else {}), **settings}
            errors.extend(_brand_errors(settings, page.get('stableId', '<missing>') + '/brandCorner'))
        errors.extend(validate_scene_contract(page, require_explicit=require_explicit,
                                              check_media_files=check_media_files, base=base))
    representative = manifest.get("representativeScenes")
    if representative is not None:
        if not _list(representative) or not representative or any(not _text(x) for x in representative):
            errors.append("representativeScenes must be a non-empty array of stableId values")
        else:
            ids = {p.get("stableId") for p in pages}
            errors.extend("representativeScenes contains unknown stableId: " + x
                          for x in representative if x not in ids)
    return errors
