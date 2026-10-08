from pathlib import Path
import subprocess,json,shutil,sys,hashlib
import numpy as np
root=Path(__file__).resolve().parent;timing=json.loads((root/'qc/codex-timing.json').read_text());video=root/'outputs/Codex-EP109.mp4';raw=root/'qc/render-before-audio.mp4';temp=root/'outputs/audio.tmp.mp4'
if not raw.exists() or '--refresh-render' in sys.argv:shutil.copyfile(video,raw)
rate=48000;length=timing['totalFrames']*800;mix=np.zeros((length,2),dtype=np.float32)
def decode(path):return np.frombuffer(subprocess.check_output(['ffmpeg','-nostdin','-v','error','-i',str(path),'-vn','-ac','2','-ar','48000','-f','f32le','-']),dtype=np.float32).reshape(-1,2)
keys=decode(root/'public/sfx/typing-source.wav')[:round((timing['typeEnd']-timing['typeStart'])*rate)].copy()*.48
fade=min(2400,len(keys)//2);keys[:fade]*=np.linspace(0,1,fade)[:,None];keys[-fade:]*=np.linspace(1,0,fade)[:,None]
start=round(timing['typeStart']*60)*800;mix[start:start+len(keys)]+=keys
click=decode(root/'public/sfx/click.wav')[:24000]*.5
for key in ['sendClick','mp4Click']:
 at=round(timing[key]*60)*800;mix[at:at+len(click)]+=click
assert np.max(np.abs(mix))<.98
subprocess.run(['ffmpeg','-nostdin','-y','-v','error','-i',str(raw),'-f','f32le','-ar','48000','-ac','2','-i','pipe:0','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t',str(length/rate),'-movflags','+faststart',str(temp)],input=mix.tobytes(),check=True)
temp.replace(video)
(root/'qc/audio-placement.json').write_text(json.dumps({'status':'PASS','typingSeconds':1,'typingStartSamples':start,'sendClickFrame':round(timing['sendClick']*60),'mp4ClickFrame':round(timing['mp4Click']*60),'sourcePlaybackAudio':'none in original selected EP109-06','outputSha256':hashlib.sha256(video.read_bytes()).hexdigest(),'mixSamples':length,'videoStream':'copy'},indent=2));print('Mixed continuous keyboard and two clicks at exact 48k sample positions')
