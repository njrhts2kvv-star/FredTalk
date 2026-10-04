"""Extract every decoded frame into indexed sheets; never infer visual acceptance."""
import argparse,json,subprocess,tempfile
from pathlib import Path
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('video');p.add_argument('out');p.add_argument('--columns',type=int,default=6);p.add_argument('--rows',type=int,default=8);a=p.parse_args()
out=Path(a.out);out.mkdir(parents=True,exist_ok=True)
meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=r_frame_rate,width,height','-of','json',a.video]))['streams'][0]
w=320;h=round(w*meta['height']/meta['width']);n,d=map(int,meta['r_frame_rate'].split('/'));fps=n/d
cmd=['ffmpeg','-nostdin','-v','error','-i',a.video,'-vf',f'scale={w}:{h}','-fps_mode','passthrough','-f','rawvideo','-pix_fmt','rgb24','-']
proc=subprocess.Popen(cmd,stdout=subprocess.PIPE);frame=0;pages=[];size=w*h*3;per=a.columns*a.rows
while True:
 data=proc.stdout.read(size)
 if not data:break
 if len(data)!=size:raise RuntimeError('Partial decoded frame')
 if frame%per==0: sheet=Image.new('RGB',(w*a.columns,(h+24)*a.rows),'#e7e7ec');draw=ImageDraw.Draw(sheet);start=frame
 slot=frame%per;x=(slot%a.columns)*w;y=(slot//a.columns)*(h+24)
 sheet.paste(Image.frombytes('RGB',(w,h),data),(x,y));draw.text((x+5,y+h+3),f'{frame:05d} / {frame/fps:.4f}s',fill='#171719');frame+=1
 if frame%per==0:
  fn=f'{start:05d}-{frame-1:05d}.jpg';sheet.save(out/fn,quality=90);pages.append({'file':fn,'first':start,'last':frame-1,'reviewed':False})
if frame%per:
 fn=f'{start:05d}-{frame-1:05d}.jpg';sheet.save(out/fn,quality=90);pages.append({'file':fn,'first':start,'last':frame-1,'reviewed':False})
if proc.wait()!=0:raise RuntimeError('Decode failed')
(out/'coverage.json').write_text(json.dumps({'video':str(Path(a.video).resolve()),'fps':fps,'frameCount':frame,'extractionComplete':True,'visualReviewComplete':False,'pages':pages},indent=2))
print(json.dumps({'frames':frame,'pages':len(pages),'out':str(out)}))
