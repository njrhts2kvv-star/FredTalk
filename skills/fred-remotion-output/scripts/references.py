#!/usr/bin/env python3
"""Portable reference lookup; shares the public ranked catalog with scene selection."""
from pathlib import Path
import runpy
if __name__=='__main__':
 runpy.run_path(str(Path(__file__).resolve().parents[3]/'scripts/catalog.py'),run_name='__main__')
