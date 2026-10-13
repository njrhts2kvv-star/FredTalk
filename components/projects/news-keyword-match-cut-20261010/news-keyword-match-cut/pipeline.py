"""Prepare imagegen pages and render a frame-timed keyword match cut locally."""
from pathlib import Path
import argparse
import json
import subprocess


def run(args):
    subprocess.run(args, check=True)


def prepare(config_path, output):
    config = json.loads(config_path.read_text())
    root = config_path.parent
    width, height = config['width'], config['height']
    sw, sh = config.get('scaledSize', [round(width * config['zoom']), round(height * config['zoom'])])
    ax, ay = config['anchor']
    mask = config['mask']
    radius = mask['centralSharpRadius']
    fade_range = mask['fadeRange']
    distance = f'sqrt(pow((X-{ax})/{width*1100/1920},2)+pow((Y-{ay})/{height*750/1080},2))'
    fade = f'clip(({distance}-{radius})/{fade_range},0,1)'
    opacity = f'{mask["maxOpacity"]}*pow({fade},2)*(3-2*({fade}))'
    shade = 'geq=' + ':'.join(f"{c}='{c}(X,Y)*(1-({opacity}))'" for c in ['r', 'g', 'b'])
    if not config['pages'] or len(config['pages']) != len(config['durationsFrames']):
        raise ValueError('One positive frame duration is required for each page')
    if any(not isinstance(n, int) or n <= 0 for n in config['durationsFrames']):
        raise ValueError('Page durations must be positive integer frames')
    output.mkdir(parents=True, exist_ok=True)
    from PIL import Image
    geometry = []
    for index, page in enumerate(config['pages']):
        source = root / page['file']
        pw, ph = Image.open(source).size
        x0, y0, x1, y1 = page['glyphBox']
        if not (0 <= x0 < x1 <= pw and 0 <= y0 < y1 <= ph):
            raise ValueError(f'Invalid glyphBox for page {index+1}')
        ox = round((x0+x1)/2*sw/pw-ax)
        oy = round((y0+y1)/2*sh/ph-ay)
        if not (0 <= ox <= sw-width and 0 <= oy <= sh-height):
            raise ValueError(f'Page {index+1} cannot align without exposing blank edges; adjust generation or uniform zoom')
        vf = f'scale={sw}:{sh}:flags=lanczos,crop={width}:{height}:{ox}:{oy},format=rgb24,{shade}'
        run(['ffmpeg', '-y', '-v', 'error', '-i', str(source), '-vf', vf, '-frames:v', '1', str(output/f'page-{index+1:02}.png')])
        geometry.append(dict(page=index+1, crop=[ox,oy,width,height], anchor=[ax,ay]))
    (output/'geometry.json').write_text(json.dumps(geometry, indent=2)+'\n')
    return config


def render(config_path, output, sound=None):
    requested = json.loads(config_path.read_text())
    timing = requested.get('audioTiming')
    if not sound and requested.get('audioFile') and timing:
        if timing['fps'] != requested['fps'] or timing['durationsFrames'] != requested['durationsFrames']:
            raise ValueError('Premixed audio timing differs; rebuild with --sound for changed cuts')
    pages = output.parent/(output.stem+'-pages')
    config = prepare(config_path, pages)
    fps = config['fps']
    durations = config['durationsFrames']
    concat = pages/'concat.txt'
    entries = []
    for i, frames in enumerate(durations):
        path = (pages/f'page-{i+1:02}.png').resolve()
        escaped = str(path).replace("'", "'\\''")
        entries += [f"file '{escaped}'", f'option framerate {fps}', f'duration {frames/fps}']
    entries += entries[-3:-1]
    concat.write_text('\n'.join(entries)+'\n')
    args = ['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(concat)]
    if sound:
        sound_file = config.get('soundFiles', {}).get(sound, f'public/sfx/{sound}.wav')
        args += ['-i',str(config_path.parent/sound_file)]
        count = len(durations)
        starts = [sum(durations[:i]) for i in range(count)]
        filters = ['[1:a]asplit='+str(count)+''.join(f'[s{i}]' for i in range(count))]
        filters += [f'[s{i}]adelay={round(frame*1000/fps)}:all=1[a{i}]' for i,frame in enumerate(starts)]
        filters += [''.join(f'[a{i}]' for i in range(count))+f'amix=inputs={count}:normalize=0,alimiter=limit=0.8:level=false,apad[a]']
        args += ['-filter_complex',';'.join(filters),'-map','0:v','-map','[a]','-c:a','aac','-b:a','192k']
    elif config.get('audioFile'):
        args += ['-i',str(config_path.parent/config['audioFile']),'-map','0:v','-map','1:a','-c:a','copy']
    args += ['-vf',f'fps={fps}','-t',str(sum(durations)/fps),'-c:v','libx264','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
    run(args)
    run(['ffmpeg','-v','error','-i',str(output),'-f','null','-'])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['prepare','render'])
    parser.add_argument('--config', type=Path, default=Path(__file__).with_name('config.json'))
    parser.add_argument('--out', type=Path, required=True)
    parser.add_argument('--sound', choices=['shutter','shutter1'], help='Rebuild per-cut sound cues for changed timing')
    args = parser.parse_args()
    config = args.config.resolve()
    if args.command == 'prepare':
        prepare(config, args.out.resolve())
    else:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        render(config, args.out.resolve(), args.sound)


if __name__ == '__main__':
    main()
