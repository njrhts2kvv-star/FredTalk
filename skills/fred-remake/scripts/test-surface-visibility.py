#!/usr/bin/env python3
"""End-to-end ROI audit regression using a real, locally encoded MP4."""
import argparse
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--ffmpeg', required=True)
parser.add_argument('--output', help='Optional persistent validation report')
args = parser.parse_args()
ffmpeg = str(Path(args.ffmpeg).resolve())
audit = Path(__file__).resolve().with_name('audit-surface-visibility.py')
spec = importlib.util.spec_from_file_location('surface_audit', audit)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

try:
    module.analyze([bytes([255]*1024)]*3, 0, (0, 2), .35)
    raise AssertionError('A flat baseline must be rejected')
except ValueError:
    pass

with tempfile.TemporaryDirectory(prefix='fred-surface-audit-') as directory:
    root = Path(directory)
    width, height, count, missing = 160, 96, 36, 18
    frames = bytearray()
    for index in range(count):
        frame = bytearray([255]*(width*height*3))
        for y in range(height):
            for x in range(width):
                # The left object remains visible throughout, so frame 18 is not a blank frame.
                visible = (12 <= x < 42 and 22 <= y < 68) or (index != missing and 80 <= x < 140 and 26 <= y < 54)
                if visible:
                    offset = (y*width+x)*3
                    frame[offset:offset+3] = bytes([24,24,24])
        frames.extend(frame)
    video = root/'one-frame-local-loss.mp4'
    subprocess.run([ffmpeg,'-v','error','-f','rawvideo','-pixel_format','rgb24',
                    '-video_size',f'{width}x{height}','-framerate','60','-i','-',
                    '-an','-c:v','libx264','-crf','0','-pix_fmt','yuv444p',str(video)],
                   input=frames,capture_output=True,check=True,timeout=60)
    reports = {}
    for name, roi in [('right','70,18,80,50'),('whole','0,0,160,96')]:
        target=root/f'{name}.json'
        subprocess.run([sys.executable,str(audit),'--input',str(video),'--output',str(target),
                        '--roi',roi,'--frames','0:36','--baseline','0:6','--ffmpeg',ffmpeg],
                       capture_output=True,check=True,timeout=60)
        reports[name]=json.loads(target.read_text())
    assert reports['right']['candidates']==[missing], reports['right']['candidates']
    assert missing not in reports['whole']['candidates'], reports['whole']['candidates']
    assert len(reports['right']['rows'])==count
    result={'verdict':'PASS','checks':3,'fixture':'36-frame MP4 with persistent left object and missing right object at frame 18',
            'roiCandidateFrames':reports['right']['candidates'],'wholeFrameCandidateFrames':reports['whole']['candidates'],
            'flatBaseline':'rejected','decodedFrames':count,'ffmpeg':ffmpeg,
            'scope':'Detects calibrated local contrast loss; not general visual acceptance'}
    if args.output:
        target=Path(args.output);target.parent.mkdir(parents=True,exist_ok=True)
        target.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(result))
