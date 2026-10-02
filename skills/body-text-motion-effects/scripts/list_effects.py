#!/usr/bin/env python3
import argparse
import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "references" / "effects-registry.json"


def load_registry():
    with REGISTRY.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def main():
    parser = argparse.ArgumentParser(description="List FredTalk body text motion effects.")
    parser.add_argument("--id", help="Filter by effect id.")
    parser.add_argument("--group", help="Filter by group.")
    parser.add_argument("--supports-four-steps", action="store_true", help="Only show effects that support 1-2-3-4.")
    parser.add_argument("--json", action="store_true", help="Print raw JSON.")
    args = parser.parse_args()

    registry = load_registry()
    effects = registry["effects"]

    if args.id:
        effects = [effect for effect in effects if effect["id"] == args.id]
    if args.group:
        effects = [effect for effect in effects if effect["group"] == args.group]
    if args.supports_four_steps:
        effects = [effect for effect in effects if effect["supportsFourSteps"]]

    if args.json:
        print(json.dumps(effects, ensure_ascii=False, indent=2))
        return

    for effect in effects:
      marker = "1-2-3-4" if effect["supportsFourSteps"] else "1-2-3"
      print(f'{effect["slide"]:02d}  {effect["id"]:<22} {effect["name"]}  [{effect["group"]}, {marker}]')
      print(f'    {effect["bestUse"]}')
      print(f'    preview: {effect["previewUrl"]}')


if __name__ == "__main__":
    main()
