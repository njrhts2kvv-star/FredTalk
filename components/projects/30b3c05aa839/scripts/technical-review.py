"""Technical media verification only; never grants fidelity or viewing approval."""
import argparse,hashlib,json,subprocess,datetime
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('ids',nargs='+');args=p.parse_args();root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text());clips={c['id']:c for c in manifest['clips']}
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
for key in args.ids:
 if key not in clips:raise SystemExit('Unknown clip '+key)
 video=root/'outputs'/f'{key}.mp4';before=sha(video)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=width,height,r_frame_rate,avg_frame_rate,nb_read_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(video)]))
 stream=probe['streams'][0];frames=int(stream['nb_read_frames']);pts=[float(f['best_effort_timestamp_time']) for f in probe['frames']];expected=clips[key]['durationInFrames']
 audio=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','json',str(video)]))['streams']
 errors=[]
 if audio:errors.append('Expected silent output without audio streams')
 if (stream['width'],stream['height'])!=(1920,1080):errors.append('Incorrect size')
 if stream['r_frame_rate']!='60/1' or stream['avg_frame_rate']!='60/1':errors.append('Incorrect frame rate')
 if frames!=expected:errors.append(f'Incorrect frame count {frames} vs {expected}')
 if len(pts)!=expected or any(abs(t-i/60)>.00002 for i,t in enumerate(pts)):errors.append('Incorrect frame timestamps')
 decode=subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(video),'-f','null','-'],capture_output=True,text=True)
 if decode.returncode:errors.append('Decode failed: '+decode.stderr[-1000:])
 if sha(video)!=before:raise SystemExit('Output changed during validation: '+key)
 path=root/'qc'/f'{key}-acceptance.json';old=json.loads(path.read_text()) if path.exists() else {};keep=old if old.get('sha256')==before else {}
 record={'id':key,'sha256':before,'technical':{'status':'failed' if errors else 'passed','checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'size':[stream['width'],stream['height']],'fps':stream['r_frame_rate'],'frames':frames,'audioStreams':len(audio),'timestampsChecked':len(pts),'fullDecode':decode.returncode==0,'errors':errors},'fidelity':keep.get('fidelity',{'status':'pending'}),'dynamic':keep.get('dynamic',{'status':'pending'})}
 temp=path.with_suffix('.tmp');temp.write_text(json.dumps(record,ensure_ascii=False,indent=2));temp.replace(path);print(key,record['technical']['status'],before)
 if errors:raise SystemExit(1)
