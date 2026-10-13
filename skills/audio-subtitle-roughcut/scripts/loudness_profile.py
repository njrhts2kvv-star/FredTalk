"""Read-only EBU R128 timeline and segment/cue comparisons; never edit audio or cuts."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import re
import statistics
import subprocess
import wave
from audio_qc import measure


def digest(path):
    h=hashlib.sha256()
    with Path(path).open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
    return h.hexdigest()


def valid_loudness(value):
    return value if value is not None and math.isfinite(value) and value>-70 else None


def validate_segments(segments,duration):
    result=[]
    for i,entry in enumerate(segments):
        a,b=float(entry['start']),float(entry['end'])
        if not math.isfinite(a) or not math.isfinite(b) or not 0<=a<b<=duration+.001:
            raise ValueError('Invalid segment range')
        result.append(dict(entry,id=entry.get('id',str(i+1)),role=entry.get('role','narration'),start=a,end=min(b,duration)))
    result.sort(key=lambda x:x['start'])
    if any(left['end']>right['start']+.001 for left,right in zip(result,result[1:])):
        raise ValueError('Loudness role segments must not overlap; use cues separately')
    return result


def segments_for_delivery(data):
    if data.get('loudnessSegments') is not None:return data['loudnessSegments']
    spans=[]
    for key,role in [('transition','insert'),('replacement','replacement')]:
        entry=data.get(key) or {}; a=entry.get('start',entry.get('outputStart')); b=entry.get('end',entry.get('outputEnd'))
        if a is not None and b is not None and a<b:spans.append((float(a),float(b),role))
    duration=float(data['duration']);edges=sorted({0.,duration}|{t for a,b,_ in spans for t in (a,b) if 0<t<duration})
    result=[]
    for a,b in zip(edges,edges[1:]):
        roles=[role for left,right,role in spans if left<=(a+b)/2<right]
        role='insert' if 'insert' in roles else 'replacement' if roles else 'narration'
        result.append(dict(id=str(len(result)+1),start=a,end=b,role=role))
    return result


def collect_timeline(path,duration):
    run=subprocess.run(['ffmpeg','-nostdin','-hide_banner','-i',str(path),'-map','0:a:0',
        '-af','ebur128=metadata=1,ametadata=print','-f','null','-'],capture_output=True,text=True,check=True)
    points=[];current=None
    for line in run.stderr.splitlines():
        match=re.search(r'\bframe:\d+\s+pts:\S+\s+pts_time:([\d.eE+-]+)',line)
        if match:
            if current is not None:points.append(current)
            current={'end':min(duration,float(match[1])+.1)}
        match=re.search(r'lavfi\.r128\.([MS])=(-?[\d.eE+]+)',line)
        if match and current is not None:
            key='momentaryLufs' if match[1]=='M' else 'shortTermLufs'
            current[key]=valid_loudness(float(match[2]))
    if current is not None:points.append(current)
    for p in points:
        for key,window in [('momentaryLufs',.4),('shortTermLufs',3.)]:
            if p['end']<window-1e-6:p[key]=None
            else:p.setdefault(key,None)
        p['end']=round(p['end'],6)
    if not points:raise ValueError('No R128 timeline returned')
    return points


def range_summary(points,start,end):
    out={}
    for key,prefix,window in [('momentaryLufs','momentary',.4),('shortTermLufs','shortTerm',3.)]:
        # Only use complete windows inside the range; nearby narration must not leak into an insert/cue.
        values=[p[key] for p in points if p[key] is not None and p['end']-window>=start-1e-6 and p['end']<=end+1e-6]
        out[prefix+'Samples']=len(values)
        out[prefix+'MedianLufs']=round(statistics.median(values),3) if values else None
        out[prefix+'MinLufs']=min(values) if values else None
        out[prefix+'MaxLufs']=max(values) if values else None
    return out


def build_profile(path,segments=None,cues=None,threshold_lu=2.):
    path=Path(path).resolve()
    with wave.open(str(path)) as w:
        duration=w.getnframes()/w.getframerate();frames=w.getnframes()
        if w.getsampwidth()!=2:raise ValueError('Profile expects normalized PCM16 WAV')
    if not math.isfinite(threshold_lu) or threshold_lu<=0:raise ValueError('Threshold must be positive')
    segments=validate_segments(segments if segments is not None else [dict(start=0,end=duration,role='narration')],duration)
    cues=cues or []
    for cue in cues:
        if not 0<=float(cue['start'])<float(cue['end'])<=duration+.001:raise ValueError('Invalid cue range')
    before=digest(path);points=collect_timeline(path,duration)
    summaries=[dict(s,**range_summary(points,s['start'],s['end'])) for s in segments]
    reference_values=[p['momentaryLufs'] for p in points if p['momentaryLufs'] is not None and
        any(s['role']=='narration' and s['start']<=p['end']-.4+1e-6 and p['end']<=s['end']+1e-6 for s in segments)]
    reference=statistics.median(reference_values) if reference_values else None
    for s in summaries:
        s['momentaryDeltaFromNarrationLu']=round(s['momentaryMedianLufs']-reference,3) if reference is not None and s['momentaryMedianLufs'] is not None else None
    candidates=[]
    for p in points:
        if reference is None or p['momentaryLufs'] is None:continue
        delta=p['momentaryLufs']-reference
        if abs(delta)<threshold_lu:continue
        a,b=max(0,p['end']-.4),p['end'];direction='louder' if delta>0 else 'quieter'
        if candidates and candidates[-1]['direction']==direction and a<=candidates[-1]['end']+.001:
            c=candidates[-1];c['end']=b;c['maxAbsDeltaLu']=max(c['maxAbsDeltaLu'],round(abs(delta),3))
        else:candidates.append(dict(start=round(a,6),end=b,direction=direction,maxAbsDeltaLu=round(abs(delta),3),needsContextReview=True))
    integrated=measure(path)
    if digest(path)!=before:raise ValueError('Audio changed during read-only analysis')
    return dict(schemaVersion=1,analysisOnly=True,audio=dict(path=str(path),sha256=before,duration=duration,frames=frames),
        integrated=integrated,reference=dict(role='narration',momentaryMedianLufs=round(reference,3) if reference is not None else None,sampleCount=len(reference_values)),
        windows=dict(momentarySeconds=.4,shortTermSeconds=3.,stepSeconds=.1),
        coverage=dict(decodedDurationSeconds=duration,lastTimelineEndSeconds=points[-1]['end'],unreportedTailSeconds=round(max(0,duration-points[-1]['end']),6),tailCoveredByWholeFilePeakAndIntegrated=True),
        timeline=points,segments=summaries,
        cues=[dict(c,**range_summary(points,float(c['start']),float(c['end']))) for c in cues],candidates=candidates,
        thresholdLu=threshold_lu,listeningReviewed=False,limitations=[
            'Candidates are prompts for contextual review, not failure labels or gain/cut commands.',
            'Silence/below-gate and incomplete windows are null, not zero LUFS.',
            'Short cues may lack 400ms/3s windows; momentary, short-term and integrated values are distinct.',
            'Loudness does not classify speech, repeats, mouth noise, SFX or source identity.'])


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--audio',type=Path,required=True);p.add_argument('--output',type=Path,required=True)
    p.add_argument('--segments',type=Path,help='JSON list of non-overlapping role ranges in final audio seconds')
    p.add_argument('--cues',type=Path,help='JSON list of subtitle cue ranges; may be shorter than analysis windows')
    p.add_argument('--threshold-lu',type=float,default=2.,help='Review-candidate threshold, not an automatic normalization target')
    args=p.parse_args()
    if args.output.exists():p.error('Output exists; choose another report path')
    result=build_profile(args.audio,json.loads(args.segments.read_text()) if args.segments else None,json.loads(args.cues.read_text()) if args.cues else None,args.threshold_lu)
    args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(dict(output=str(args.output.resolve()),duration=result['audio']['duration'],candidateCount=len(result['candidates']),analysisOnly=True)))

if __name__=='__main__':main()
