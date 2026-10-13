import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import wave
from http.server import ThreadingHTTPServer
from threading import Thread
from urllib.request import Request, urlopen

from deliver import load_server

SCRIPTS = Path(__file__).resolve().parent


class RestoreBindingsTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='roughcut-restore-')
        self.episode = Path(self.tmp.name) / 'Test'
        self.episode.mkdir()
        audio = self.episode / 'input.wav'
        with wave.open(str(audio), 'wb') as output:
            output.setparams((2, 2, 48000, 0, 'NONE', 'not compressed'))
            output.writeframes(b'\0' * 3 * 48000 * 4)
        subs = self.episode / 'input.srt'
        subs.write_text('1\n00:00:00,000 --> 00:00:01,000\n但是前句\n\n'
                        '2\n00:00:01,000 --> 00:00:02,000\n但是中句\n\n'
                        '3\n00:00:02,000 --> 00:00:03,000\n但是后句\n')
        script = self.episode / 'script.md'
        script.write_text('测试')
        subprocess.run([sys.executable, str(SCRIPTS / 'init_review.py'), '--episode', str(self.episode),
                        '--audio', str(audio), '--subtitles', str(subs), '--script', str(script),
                        '--title', 'Restore test'], check=True, capture_output=True)
        self.root = self.episode / '03_制作过程/audio-review'
        self.write('subtitle-boundaries.json', [dict(cue=i, cutId='wide', removePrefix='但是', note='fixture') for i in (1, 2, 3)])
        self.server = load_server(self.root)

    def tearDown(self):
        self.tmp.cleanup()

    def write(self, name, data):
        (self.root / name).write_text(json.dumps(data, ensure_ascii=False))

    def test_split_restoration_preserves_other_cue_bindings(self):
        cuts = [dict(id='wide', start=.2, end=2.8, enabled=False),
                dict(id='left', originCutId='wide', start=.2, end=1, enabled=True),
                dict(id='right', originCutId='wide', start=2, end=2.8, enabled=True)]
        self.write('cuts.json', cuts)
        texts = [cue['text'] for cue in self.server.corrected_project()['cues']]
        self.assertEqual(texts, ['前句', '但是中句', '后句'])
        # Export and a reload use the persisted fragments, not frontend-only state.
        result = self.server.export(cuts)
        self.assertIn('但是中句', (Path(result['path']) / 'review-cut.srt').read_text())
        reloaded = load_server(self.root)
        self.assertEqual([c['text'] for c in reloaded.corrected_project()['cues']], texts)

    def test_bound_prefix_and_time_restore_when_this_cue_loses_overlap(self):
        self.write('subtitle-boundaries.json', [dict(cue=2, cutId='wide', start=1.2, removePrefix='但是', note='fixture')])
        cuts = [dict(id='wide', start=.2, end=2.8, enabled=False),
                dict(id='left', originCutId='wide', start=.2, end=1, enabled=True),
                dict(id='right', originCutId='wide', start=2, end=2.8, enabled=True)]
        cue = self.server.corrected_project(cuts=cuts)['cues'][1]
        self.assertEqual((cue['start'], cue['text']), (1, '但是中句'))
        cuts[0]['enabled'] = True
        cue = self.server.corrected_project(cuts=cuts)['cues'][1]
        self.assertEqual((cue['start'], cue['text']), (1.2, '中句'))

    def test_manual_text_override_survives_bound_cut_restore(self):
        self.write('cuts.json', [dict(id='wide', start=.2, end=2.8, enabled=False)])
        self.server.save_subtitle(dict(cue=2, text='用户修改'))
        cue = self.server.corrected_project()['cues'][1]
        self.assertEqual(cue['text'], '用户修改')
        self.assertEqual(cue['correctedText'], '但是中句')

    def test_original_cut_preserves_legal_cross_cue_word_binding(self):
        self.write('subtitle-boundaries.json', [dict(cue=2, cutId='trigger', removePrefix='但是', note='adjacent cue word ownership')])
        cue = self.server.corrected_project(cuts=[dict(id='trigger', start=.2, end=.8, enabled=True)])['cues'][1]
        self.assertEqual(cue['text'], '中句')
        cue = self.server.corrected_project(cuts=[dict(id='trigger', start=.2, end=.8, enabled=False)])['cues'][1]
        self.assertEqual(cue['text'], '但是中句')

    def test_save_restore_undo_redo_preserves_fragments_and_bound_text(self):
        original = [dict(id='wide', start=.2, end=2.8, enabled=True)]
        restored = [dict(id='wide', start=.2, end=2.8, enabled=False),
                    dict(id='left', originCutId='wide', start=.2, end=1, enabled=True),
                    dict(id='right', originCutId='wide', start=2, end=2.8, enabled=True)]
        http = ThreadingHTTPServer(('127.0.0.1', 0), self.server.Handler)
        thread = Thread(target=http.serve_forever, daemon=True)
        thread.start()
        try:
            base = f'http://127.0.0.1:{http.server_port}'
            for cuts, expected in [(restored, ['前句', '但是中句', '后句']),
                                   (original, ['前句', '中句', '后句']),
                                   (restored, ['前句', '但是中句', '后句'])]:
                request = Request(base + '/api/save', json.dumps(dict(cuts=cuts)).encode(),
                                  {'Content-Type': 'application/json'})
                with urlopen(request) as response:
                    self.assertTrue(json.load(response)['saved'])
                with urlopen(base + '/api/project') as response:
                    self.assertEqual([cue['text'] for cue in json.load(response)['cues']], expected)
                self.assertEqual(json.loads((self.root / 'cuts.json').read_text()), cuts)
        finally:
            http.shutdown()
            http.server_close()
            thread.join()

    def test_static_code_revalidates_without_changing_audio_cache_policy(self):
        http = ThreadingHTTPServer(('127.0.0.1', 0), self.server.Handler)
        thread = Thread(target=http.serve_forever, daemon=True)
        thread.start()
        try:
            base = f'http://127.0.0.1:{http.server_port}'
            for route in ['/', '/app.js?v=current', '/styles.css?v=current']:
                with urlopen(base + route) as response:
                    self.assertEqual(response.headers.get('Cache-Control'), 'no-cache')
            with urlopen(base + '/source.wav') as response:
                self.assertIsNone(response.headers.get('Cache-Control'))
                self.assertEqual(response.read()[:4], b'RIFF')
        finally:
            http.shutdown()
            http.server_close()
            thread.join()


if __name__ == '__main__':
    unittest.main()
