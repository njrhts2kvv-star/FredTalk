from pathlib import Path
import argparse,subprocess
p=argparse.ArgumentParser();p.add_argument('action',choices=['list','still','render']);p.add_argument('id',choices=['CAM01','CAM02','CAM03','CAM04','CAM05']);p.add_argument('--frame',type=int,default=240);p.add_argument('--browser');a=p.parse_args()
b=Path(__file__).resolve().parent; project=b/('codex' if a.id=='CAM04' else 'overhead' if a.id=='CAM05' else 'camera');out=b/'outputs';out.mkdir(exist_ok=True)
cli=project/'node_modules/.bin/remotion';cmd=[str(cli),'compositions' if a.action=='list' else a.action,'src/index.tsx']
if a.action!='list':cmd += [a.id,str(out/(a.id+('.png' if a.action=='still' else '.mp4')))]
if a.action=='still':cmd += ['--frame='+str(a.frame)]
if a.action=='render':cmd += ['--crf=16','--concurrency=4']
chrome=a.browser or ('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' if Path('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome').exists() else None)
if chrome:cmd += ['--browser-executable='+chrome,'--gl=angle']
subprocess.run(cmd,cwd=project,check=True)
