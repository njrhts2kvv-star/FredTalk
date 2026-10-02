#!/usr/bin/env python3
"""Validate rendered video and optional external master audio; no extra Python deps."""
import argparse,array,hashlib,json,math,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('config',type=Path);a=p.parse_args();root=a.config.resolve().parent;c=json.loads(a.config.read_text());out=root/c.get('outputDir','cloud-output');r=json.loads((out/'result.json').read_text());v=r['video'];file=out/'video.mp4'
def run(args):return subprocess.check_output(args)
probe=json.loads(run(['ffprobe','-v','error','-show_streams','-of','json',str(file)]));video=next(s for s in probe['streams'] if s['codec_type']=='video');num,den=map(int,video['r_frame_rate'].split('/'))
assert int(video['width'])==v['width'] and int(video['height'])==v['height'],'Dimensions mismatch'
assert abs(num/den-v['fps'])<1e-6,'FPS mismatch'
assert int(video['nb_frames'])==v['frames'],'Missing or extra frames'
assert abs(float(video['duration'])-v['duration'])<1/v['fps'],'Duration mismatch'
dec=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(file),'-f','null','-'],capture_output=True,text=True);assert dec.returncode==0 and not dec.stderr,dec.stderr
pts=json.loads(run(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(file)]))['frames'];times=[float(x['best_effort_timestamp_time']) for x in pts]
assert len(times)==v['frames'],'Decoded frame count mismatch'
assert all(abs((t-times[0])-i/v['fps'])<.0001 for i,t in enumerate(times)),'Discontinuous video timestamps'
audios=[s for s in probe['streams'] if s['codec_type']=='audio'];result={'fullDecode':'passed','frameCount':len(times),'continuousPTS':True,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
if c['audio']['mode']=='none':assert not audios,'Unexpected audio'
else:
 assert audios,'Missing audio'
 def pcm(path,start):
  data=run(['ffmpeg','-nostdin','-v','error','-ss',str(start),'-i',str(path),'-t',str(v['duration']),'-vn','-ac','1','-ar','8000','-f','f32le','-']);x=array.array('f');x.frombytes(data);return x
 x=pcm(file,0);y=pcm(root/c['audio']['path'],c['audio']['startSeconds']);n=min(len(x),len(y));assert n>0
 assert abs(len(x)-len(y))<=800,'Audio master shorter than output; confirm intended padding'
 sx=sum(x[:n]);sy=sum(y[:n]);xx=sum(t*t for t in x[:n])-sx*sx/n;yy=sum(t*t for t in y[:n])-sy*sy/n;xy=sum(x[i]*y[i] for i in range(n))-sx*sy/n
 if xx<1e-10 or yy<1e-10:raise ValueError('Silent/constant audio requires explicit manual validation')
 corr=xy/math.sqrt(xx*yy);assert corr>.995,f'Audio mismatch {corr}';result['audioCorrelation']=corr
(out/'validation.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
