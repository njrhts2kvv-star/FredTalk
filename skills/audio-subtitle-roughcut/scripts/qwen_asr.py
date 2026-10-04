"""Alibaba file transcription with private credentials and resumable task receipts."""
import argparse
import getpass
import hashlib
import json
import os
import re
from pathlib import Path
import stat
import subprocess
import tempfile
import time

MODEL = 'qwen-audio-3.1-asr-flash-filetrans'
BASE = 'https://dashscope.aliyuncs.com/api/v1'
KEY_PATH = Path.home() / '.config/fredtalk/private/dashscope-api-key'

def write_json(path, data):
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix='.pending-')
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024*1024), b''): h.update(chunk)
    return h.hexdigest()

def configure():
    key = getpass.getpass('API key (hidden): ').strip()
    if not key or any(c.isspace() for c in key):
        raise ValueError('Invalid key format')
    KEY_PATH.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(KEY_PATH.parent, 0o700)
    fd, tmp = tempfile.mkstemp(dir=KEY_PATH.parent, prefix='.key-')
    try:
        with os.fdopen(fd, 'w') as f: f.write(key+'\n')
        os.chmod(tmp, 0o600)
        os.replace(tmp, KEY_PATH)
    finally:
        if os.path.exists(tmp): os.unlink(tmp)
    print('Saved private local credential (0600); value not displayed.')

def credential():
    if KEY_PATH.is_symlink(): raise ValueError('Credential must not be a symlink')
    if stat.S_IMODE(KEY_PATH.stat().st_mode) != 0o600:
        raise ValueError('Credential permissions must be 0600')
    key = KEY_PATH.read_text().strip()
    if not key: raise ValueError('Empty credential')
    return key

def timestamp(ms):
    ms = round(ms)
    return '{:02}:{:02}:{:02},{:03}'.format(ms//3600000, ms//60000%60, ms//1000%60, ms%1000)

def export_result(raw, root):
    sentences = [s for t in raw.get('transcripts', []) for s in t.get('sentences', [])]
    if not sentences: raise ValueError('No transcription sentences returned')
    words = []
    blocks = []
    previous = -1
    for i, s in enumerate(sentences, 1):
        a, b = s['begin_time'], s['end_time']
        if not 0 <= a < b or a < previous: raise ValueError('Invalid sentence timestamps')
        previous = b
        blocks.append(f'{i}\n{timestamp(a)} --> {timestamp(b)}\n{s["text"]}')
        for w in s.get('words', []):
            if not a <= w['begin_time'] <= w['end_time'] <= b:
                raise ValueError('Invalid word timestamps')
            words.append(dict(w, sentence_id=i))
    if not words: raise ValueError('Word timestamps missing; do not claim word alignment')
    (root/'source-asr.srt').write_text('\n\n'.join(blocks)+'\n')
    write_json(root/'word-timestamps.json', words)
    write_json(root/'asr-validation.json', dict(sentences=len(sentences),wordRecords=len(words),
        includesWhitespaceTokens=True,listeningReviewed=False,finalSubtitles=False))

def checked(response):
    # Do not print response bodies, URLs, headers or exception strings containing signed URLs.
    if not response.ok: raise RuntimeError('Alibaba HTTP status '+str(response.status_code))
    return response.json()

def execute(args):
    import requests
    root = args.output.resolve()
    root.mkdir(parents=True, exist_ok=True)
    state_path = root/'asr-state.json'
    source = args.audio.resolve()
    identity = dict(model=MODEL, sourceHash=digest(source))
    if state_path.exists():
        state = json.loads(state_path.read_text())
        if any(state.get(k) != v for k,v in identity.items()):
            raise ValueError('Output belongs to another audio/model; use a separate directory')
        if state.get('status') == 'complete':
            export_result(json.loads((root/'raw-asr.json').read_text()),root)
            print('Reused completed result; no API request.')
            return
        if not state.get('task_id'):
            raise ValueError('Prior submit outcome unknown. Resolve task in console; do not resubmit automatically.')
    else:
        state = identity.copy()
        if (root/'raw-asr.json').exists(): raise ValueError('Existing unmanaged result; use another directory')
    session = requests.Session()
    session.trust_env = False
    headers = {'Authorization':'Bearer '+credential()}
    if not state.get('task_id'):
        context = args.context.read_text().strip() if args.context else ''
        if len(context)>400: raise ValueError('Context must be <=400 characters; use names, not the entire script')
        terms = json.loads(args.terms.read_text()) if args.terms else []
        if not isinstance(terms,list) or any(not isinstance(t,str) or not t.strip() for t in terms):
            raise ValueError('Terms must be a JSON list of nonempty strings')
        flac = root/'source-asr-mono.flac'
        # Measure float WAV headroom before integer FLAC conversion; preserve quiet inputs.
        measurement=subprocess.run(['ffmpeg','-nostdin','-v','info','-i',str(source),'-map','0:a:0',
            '-af','astats=metadata=0:reset=0','-f','null','-'],capture_output=True,text=True,check=True)
        peaks=[float(v) for v in re.findall(r'Peak level dB:\s*(-?[\d.]+)',measurement.stderr)]
        if not peaks: raise ValueError('Cannot measure source peak; inspect audio before upload')
        gain=min(0.0,-1.0-max(peaks))
        write_json(root/'asr-conversion.json',dict(gainDb=gain,sourcePeakDb=max(peaks),speed=1,sourceHash=identity['sourceHash']))
        subprocess.run(['ffmpeg','-nostdin','-v','error','-y','-i',str(source),'-map','0:a:0',
            '-af',f'volume={gain}dB','-ac','1','-ar','48000','-sample_fmt','s32','-c:a','flac',str(flac)],check=True)
        policy=checked(session.get(BASE+'/uploads',params={'action':'getPolicy','model':MODEL},headers=headers,timeout=30))['data']
        object_key=policy['upload_dir']+'/'+flac.name
        form={'OSSAccessKeyId':policy['oss_access_key_id'],'Signature':policy['signature'],
              'policy':policy['policy'],'key':object_key,'x-oss-object-acl':policy['x_oss_object_acl'],
              'x-oss-forbid-overwrite':policy['x_oss_forbid_overwrite'],'success_action_status':'200'}
        with flac.open('rb') as f:
            response=session.post(policy['upload_host'],data=form,files={'file':f},timeout=240)
        if response.status_code!=200: raise RuntimeError('Temporary upload failed; no ASR submitted')
        body={'model':MODEL,'input':{'file_urls':['oss://'+object_key]},
              'parameters':{'channel_id':[0],'language_hints':['zh','en'],'keep_dialect':True,
                            'vocabulary':{term:2 for term in terms}}}
        if context:body['input']['context']=[{'role':'user','content':[{'type':'input_text','text':context}]}]
        write_json(root/'request-redacted.json',dict(body,input=dict(body['input'],file_urls=['[temporary Alibaba object]'])))
        state.update(status='submitting',createdAt=time.time())
        write_json(state_path,state)
        submitted=checked(session.post(BASE+'/services/audio/asr/transcription',
            headers=dict(headers,**{'X-DashScope-Async':'enable','X-DashScope-OssResourceResolve':'enable'}),json=body,timeout=60))
        state.update(task_id=submitted['output']['task_id'],status='submitted')
        write_json(state_path,state)
    print('Model:',MODEL,'task:',state['task_id'],flush=True)
    for _ in range(args.polls):
        result=checked(session.get(BASE+'/tasks/'+state['task_id'],headers=headers,timeout=30))
        output=result['output'];status=output['task_status']
        state.update(status=status,usage=result.get('usage'))
        write_json(state_path,state)
        if status=='SUCCEEDED':
            results=output.get('results',[])
            if len(results)!=1 or results[0].get('subtask_status')!='SUCCEEDED':
                raise RuntimeError('ASR subtask failed; saved task ID can be inspected')
            url=results[0]['transcription_url']
            if not url.startswith(('https://','http://')):raise ValueError('Unexpected result URL')
            response=session.get(url,timeout=60)
            raw=checked(response)
            raw.pop('file_url',None)
            write_json(root/'raw-asr.json',raw)
            export_result(raw,root)
            state.update(status='complete');write_json(state_path,state)
            print('Saved raw ASR, sentence SRT and word timestamps. Editorial review still required.')
            return
        if status in ('FAILED','CANCELED','UNKNOWN'):raise RuntimeError('ASR status '+status)
        time.sleep(args.interval)
    raise RuntimeError('Polling window ended. Repeat the same command to resume, not resubmit.')

def main():
    p=argparse.ArgumentParser()
    sub=p.add_subparsers(dest='command',required=True)
    sub.add_parser('configure')
    t=sub.add_parser('transcribe')
    t.add_argument('--audio',type=Path,required=True)
    t.add_argument('--output',type=Path,required=True)
    t.add_argument('--context',type=Path)
    t.add_argument('--terms',type=Path)
    t.add_argument('--polls',type=int,default=120)
    t.add_argument('--interval',type=float,default=10)
    e=sub.add_parser('export')
    e.add_argument('--json',type=Path,required=True)
    e.add_argument('--output',type=Path,required=True)
    args=p.parse_args()
    try:
        if args.command=='configure':configure()
        elif args.command=='export':
            args.output.mkdir(parents=True,exist_ok=True)
            export_result(json.loads(args.json.read_text()),args.output)
        else:execute(args)
    except Exception as exc:
        # Network errors may contain temporary credentials in URLs.
        message=str(exc) if isinstance(exc,(ValueError,RuntimeError)) else type(exc).__name__
        p.exit(1,'Error: '+message+'\n')

if __name__=='__main__':main()
