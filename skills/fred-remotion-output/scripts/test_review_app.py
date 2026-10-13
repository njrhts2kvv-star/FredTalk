"""Reusable review app must work in a new episode without private production state."""
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from test_segment_review import fixture


def make_demo(root):
    """Synthetic media only: no episode assets, feedback or production approval."""
    from init_review_app import initialize, sha
    from prepare_review_segments import prepare
    root = Path(root).resolve()
    root.mkdir(parents=True, exist_ok=True)
    inputs = root / '01_输入素材'
    inputs.mkdir(exist_ok=True)
    video, audio = inputs / 'sample.mp4', inputs / 'sample.wav'
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i',
                    'testsrc2=size=640x360:rate=30:duration=8', '-f', 'lavfi', '-i',
                    'sine=frequency=440:sample_rate=48000:duration=8', '-c:v', 'libx264',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', str(video)], check=True)
    subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', str(video),
                    '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', str(audio)], check=True)
    subtitle, script = inputs / 'sample.srt', inputs / 'script.md'
    subtitle.write_text('1\n00:00:00,000 --> 00:00:04,000\n这里检查第一段的功能\n\n2\n00:00:04,000 --> 00:00:08,000\n这里检查下一段的功能\n')
    script.write_text('合成测试媒体，用于验证审看台功能，不代表视频制作风格。')
    data = dict(episodeKey='example-review', title='公共模板功能演示', timelineFps=30,
                timingStatus='aligned', audio=dict(path=str(audio)), version='测试数据', pages=[])
    for i, sid in enumerate(('chapter-intro', 'chapter-next')):
        frames = []
        for j in range(3):
            time = i * 4 + j
            file = inputs / f'{sid}-{j}.png'
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', str(time),
                            '-i', str(video), '-frames:v', '1', str(file)], check=True)
            frames.append(dict(id=f'frame-{j}', path=str(file), sha256=sha(file), timeSeconds=time, label='测试运动画面'))
        data['pages'].append(dict(stableId=sid, title='第一段' if i == 0 else '下一段', startFrame=i*120,
            durationInFrames=120, sourceSpans=[dict(text='这是合成测试素材，用来验证审看、版本保存和本段播放。')],
            implementationMode='preserved-media', mediaContract=[dict(path=str(video), sha256=sha(video))],
            productionRoute=dict(suggested='recording', suggestionReason='测试前端功能，不预选用户决定。'),
            storyboardReview=dict(candidates=[dict(id='option-one', label='测试候选方向', imagePath=frames[0]['path'], sha256=frames[0]['sha256'])]),
            keyframeReview=dict(frames=frames)))
    manifest = root / 'manifest.json'
    manifest.write_text(json.dumps(data, ensure_ascii=False, indent=2))
    clips = root / '03_制作过程/segments-current'
    result = prepare(manifest, video, clips, '当前测试视频', 360)
    reused = prepare(manifest, video, clips, '当前测试视频', 360)
    assert reused['reused'] == 2
    app = root / '03_制作过程/review-app'
    initialize(manifest, root, app, segment_indexes=[result['index']])
    audio_init = Path(__file__).resolve().parents[2] / 'audio-subtitle-roughcut/scripts/init_review.py'
    subprocess.run([sys.executable, str(audio_init), '--episode', str(root), '--audio', str(audio),
                    '--subtitles', str(subtitle), '--script', str(script), '--title', data['title']], check=True)
    audio_review = root / '03_制作过程/audio-review'
    deliver = audio_init.with_name('deliver.py')
    subprocess.run([sys.executable, str(deliver), '--review', str(audio_review), '--version', 'demo', '--passthrough'], check=True, capture_output=True)
    return dict(review=str(app), audioReview=str(audio_review), segmentCacheReused=reused['reused'])


class ReviewAppTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.episode = Path(self.tmp.name) / 'new-episode'
        self.episode.mkdir()
        self.manifest = fixture(self.episode)
        spec = importlib.util.spec_from_file_location('init_app', Path(__file__).with_name('init_review_app.py'))
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.app = self.episode / '03_制作过程/review-app'

    def init(self, **kwargs):
        with patch('library_gate.validate_library_gate', return_value=[]):
            return self.module.initialize(self.manifest, self.episode, self.app, **kwargs)

    def test_portable_paths_and_arbitrary_scene_ids(self):
        self.init()
        data = json.loads((self.app / 'review.json').read_text())
        self.assertEqual(data['episodeKey'], 'review-ui-fixture')
        self.assertEqual(data['scenes'][0]['stableId'], 'scene-one')
        self.assertEqual(len(data['scenes']), 2)
        self.assertTrue(all(not Path(a['path']).is_absolute() for a in data['assets'].values()))
        self.assertFalse((self.app / 'feedback.json').exists())
        moved = Path(self.tmp.name) / 'moved-episode'
        shutil.move(str(self.episode), moved)
        root = moved / '03_制作过程/review-app'
        for a in data['assets'].values():
            self.assertTrue((root / a['path']).is_file())

    def test_update_preserves_user_feedback_and_refuses_implicit_overwrite(self):
        self.init()
        feedback = b'{"schemaVersion":2,"versions":{"old":{"records":{}}}}'
        (self.app / 'feedback.json').write_bytes(feedback)
        with self.assertRaisesRegex(ValueError, 'exists'):
            self.init()
        self.init(update=True)
        self.assertEqual((self.app / 'feedback.json').read_bytes(), feedback)

    def test_failed_gate_does_not_replace_current_data(self):
        self.init()
        old = (self.app / 'review.json').read_bytes()
        with patch('library_gate.validate_library_gate', return_value=['No actual reference review']):
            with self.assertRaisesRegex(ValueError, 'gate FAIL'):
                self.module.initialize(self.manifest, self.episode, self.app, update=True)
        self.assertEqual((self.app / 'review.json').read_bytes(), old)

    def test_hash_mismatch_blocks_update(self):
        self.init()
        old = (self.app / 'review.json').read_bytes()
        (self.episode / 'frame.png').write_bytes(b'new frame')
        with self.assertRaisesRegex(ValueError, 'sha256 mismatch'):
            self.init(update=True)
        self.assertEqual((self.app / 'review.json').read_bytes(), old)

    def test_templates_contain_no_episode_state(self):
        self.init()
        for file in self.app.iterdir():
            if file.suffix in ('.js', '.html', '.mjs', '.css'):
                text = file.read_text()
                self.assertNotIn('ep108', text.lower())
                self.assertNotIn('第108期', text)
                self.assertNotIn('/absolute/project', text)

    def test_audio_identity_change_invalidates_review(self):
        audio = self.episode / 'voice.wav'
        audio.write_bytes(b'first audio identity')
        data = json.loads(self.manifest.read_text())
        data['audio'] = dict(path='voice.wav')
        self.manifest.write_text(json.dumps(data))
        self.init()
        first = json.loads((self.app / 'review.json').read_text())['scenes'][0]['identity']
        audio.write_bytes(b'revised audio identity')
        self.init(update=True)
        second = json.loads((self.app / 'review.json').read_text())['scenes'][0]['identity']
        self.assertNotEqual(first, second)

    def test_previous_source_windows_and_frame_cache(self):
        from prepare_review_segments import prepare, probe
        source = self.episode / 'source.mp4'
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'lavfi', '-i',
                        'testsrc2=size=160x90:rate=30:duration=3', '-c:v', 'libx264', str(source)], check=True)
        self.manifest.write_text(json.dumps(dict(timelineFps=30, pages=[dict(stableId='moved-scene',
                                 startFrame=0, durationInFrames=30)])))
        output = self.episode / 'clips'
        result = prepare(self.manifest, source, output, source_windows={'moved-scene': dict(startFrame=30, endFrame=60)})
        index = json.loads(Path(result['index']).read_text())
        clip = index['segments'][0]
        self.assertEqual((clip['startFrame'], clip['endFrame']), (0, 30))
        self.assertEqual((clip['sourceStartFrame'], clip['sourceEndFrame']), (30, 60))
        self.assertEqual(int(probe(output / clip['path'])[0]['nb_read_frames']), 30)
        self.assertEqual(prepare(self.manifest, source, output, source_windows={'moved-scene': dict(startFrame=30, endFrame=60)})['reused'], 1)
        with self.assertRaisesRegex(ValueError, 'Missing previous-source window'):
            prepare(self.manifest, source, output, source_windows={})


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--write-demo':
        print(json.dumps(make_demo(sys.argv[2]), ensure_ascii=False))
    else:
        unittest.main()
