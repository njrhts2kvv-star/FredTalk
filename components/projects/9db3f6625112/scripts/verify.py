import json, subprocess, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
manifest=json.loads((root/'manifest.json').read_text())
report=[]
prior_path=root/"qc/media-validation.json"
prior={r["id"]:r for r in json.loads(prior_path.read_text())} if prior_path.exists() else {}
for item in manifest['clips']:
 if item['id'] in manifest.get('deferredIds',[]): continue
 path=root/'outputs'/f"{item['id']}.mp4"
 if not path.exists(): report.append({'id':item['id'],'ok':False,'error':'missing'});continue
 sha=hashlib.sha256(path.read_bytes()).hexdigest()
 if prior.get(item['id'],{}).get('sha256')==sha and prior[item['id']].get('ok') and prior[item['id']].get('ptsContinuous') and prior[item['id']].get('expectedFrames')==item['durationInFrames']:
  report.append(prior[item['id']]);continue
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(path)]))
 video=next(s for s in probe['streams'] if s['codec_type']=='video')
 decode=subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(path),'-f','null','-'],capture_output=True)
 pts_data=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',str(path)]))
 pts=[float(f['best_effort_timestamp_time']) for f in pts_data['frames']]
 pts_ok=bool(pts) and abs(pts[0])<0.00001 and all(abs((b-a)-1/60)<0.00001 for a,b in zip(pts,pts[1:]))
 actual=int(video.get('nb_read_frames',0)); ok=pts_ok and all(s['codec_type']!='audio' for s in probe['streams']) and video['width']==1920 and video['height']==1080 and video['r_frame_rate']=='60/1' and actual==item['durationInFrames'] and decode.returncode==0 and not decode.stderr
 report.append({'id':item['id'],'ok':bool(ok),'width':video['width'],'height':video['height'],'fps':video['r_frame_rate'],'frames':actual,'expectedFrames':item['durationInFrames'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'decodeErrors':decode.stderr.decode(),'ptsContinuous':pts_ok,'audioStreams':sum(s['codec_type']=='audio' for s in probe['streams'])})
(root/'qc/media-validation.json').write_text(json.dumps(report,indent=2))
print('PASS',sum(r['ok'] for r in report),'/',len(report))
raise SystemExit(0 if all(r['ok'] for r in report) else 1)
