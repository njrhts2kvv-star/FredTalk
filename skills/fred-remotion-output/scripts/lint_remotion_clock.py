#!/usr/bin/env python3
"""Catch the two timing mistakes that can invalidate a multi-scene Remotion video."""
import argparse
import re
from pathlib import Path


SOURCE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"}
ZERO_SEQUENCE = re.compile(r"\bSequence\b[\s\S]{0,140}?from\s*=\s*\{\s*0\s*\}")
GLOBAL_CLOCK = re.compile(r"(?:const|let|var)\s+\w+\s*=\s*\(?\s*(?:f|frame)\s*\)?\s*/\s*FPS\b")


def files_for(source):
    path = Path(source)
    if path.is_file():
        return [path]
    if path.is_dir():
        return sorted(x for x in path.rglob("*") if x.is_file() and x.suffix in SOURCE_SUFFIXES)
    raise FileNotFoundError(source)


def lint(source, multi_scene=True):
    errors, warnings = [], []
    files = files_for(source)
    for path in files:
        try:
            text = path.read_text()
        except (OSError, UnicodeError) as error:
            errors.append(f"{path}: {error}")
            continue
        if multi_scene:
            for match in ZERO_SEQUENCE.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                errors.append(f"{path}:{line}: Sequence from={{0}} is not allowed in a multi-scene composition")
            for match in GLOBAL_CLOCK.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                context = text[max(0, match.start() - 120):match.start()]
                if "@global-clock" in context:
                    warnings.append(f"{path}:{line}: explicit @global-clock escape; verify it is not scene animation")
                else:
                    errors.append(f"{path}:{line}: full-frame / FPS clock used without an explicit scene-local conversion")
    if not files:
        errors.append(f"No Remotion source files found under {source}")
    return errors, warnings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", required=True)
    parser.add_argument("--single-scene", action="store_true",
                        help="Do not apply multi-scene timing rules")
    args = parser.parse_args()
    errors, warnings = lint(args.source, multi_scene=not args.single_scene)
    import json
    result = {"status": "FAIL" if errors else "PASS", "errors": errors, "warnings": warnings}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(bool(errors))


if __name__ == "__main__":
    main()
