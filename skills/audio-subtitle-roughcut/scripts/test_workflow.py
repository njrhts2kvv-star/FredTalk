import json
import math
import struct
import subprocess
import sys
import tempfile
import unittest
import wave
from threading import Thread
from urllib.request import urlopen
from http.server import ThreadingHTTPServer
from pathlib import Path
from deliver import load_server
from verify_delivery import verify

class WorkflowTest(unittest.TestCase):
    def test_passthrough_retains_exact_samples(self):
        scripts = Path(__file__).resolve().parent
        with tempfile.TemporaryDirectory(prefix='roughcut-passthrough-') as folder:
            episode = Path(folder) / 'Test_Passthrough'
            episode.mkdir()
            audio, subtitle, script = [episode / name for name in ('input.wav', 'input.srt', 'script.md')]
            samples = b''.join(struct.pack('<hh', value, -value) for value in
                               (0 if i < 4800 else int(31000 * math.sin(i * .057)) for i in range(48000)))
            with wave.open(str(audio), 'wb') as w:
                w.setparams((2, 2, 48000, 0, 'NONE', 'not compressed'))
                w.writeframes(samples)
            subtitle.write_text('1\n00:00:00,100 --> 00:00:00,250\n保留啊\n\n2\n00:00:00,250 --> 00:00:00,500\n重说\n\n3\n00:00:00,500 --> 00:00:01,000\n完整表达\n')
            script.write_text('保留啊，完整表达。')
            subprocess.run([sys.executable, str(scripts / 'init_review.py'), '--episode', str(episode), '--audio', str(audio), '--subtitles', str(subtitle), '--script', str(script), '--title', 'Passthrough'], check=True, capture_output=True)
            root = episode / '03_制作过程/audio-review'
            (root / 'cuts.json').write_text(json.dumps([dict(id='cut-1', start=.25, end=.5, enabled=True)]))
            command = [sys.executable, str(scripts / 'deliver.py'), '--review', str(root), '--version', 'v1', '--passthrough']
            subprocess.run(command, check=True, capture_output=True)
            data = json.loads((root / 'final-delivery.json').read_text())
            with wave.open(data['audioPath']) as w:
                self.assertEqual(w.readframes(w.getnframes()), samples[:12000 * 4] + samples[24000 * 4:])
            self.assertEqual((data['speed'], data['gainDb'], data['trimStart']), (1, 0, 0))
            self.assertIsNone(data['peakLimitDb'])
            self.assertTrue(data['passthrough'])
            self.assertTrue(verify(root)['technicalPass'])
            bad = subprocess.run(command + ['--gain-db', '8'], capture_output=True, text=True)
            self.assertNotEqual(bad.returncode, 0)
            self.assertIn('passthrough', bad.stderr)

    def test_isolated_workflow(self):
        scripts = Path(__file__).resolve().parent
        with tempfile.TemporaryDirectory(prefix='roughcut-test-') as folder:
            episode = Path(folder) / '108_Test'
            episode.mkdir()
            audio, subtitle, script = [episode / name for name in ('input.wav', 'input.srt', 'script.md')]
            with wave.open(str(audio), 'wb') as w:
                w.setnchannels(2)
                w.setsampwidth(2)
                w.setframerate(48000)
                w.writeframes(b''.join(struct.pack('<hh', *(2 * [0 if i < 24000 else int(16000 * math.sin(i * .057))])) for i in range(192000)))
            subtitle.write_text('1\n00:00:00,500 --> 00:00:01,500\nUpdate\n\n2\n00:00:01,500 --> 00:00:02,500\n重说\n\n3\n00:00:02,500 --> 00:00:04,000\n完整表达啊\n')
            script.write_text('Dev Day，完整表达啊。')
            cmd = [sys.executable, str(scripts / 'init_review.py'), '--episode', str(episode), '--audio', str(audio), '--subtitles', str(subtitle), '--script', str(script), '--title', 'Synthetic review']
            subprocess.run(cmd, check=True, capture_output=True)
            self.assertNotEqual(subprocess.run(cmd, capture_output=True).returncode, 0)
            root = episode / '03_制作过程/audio-review'
            (root / 'subtitle-corrections.json').write_text(json.dumps([dict(cue=1, **{'from': 'Update', 'to': 'Dev Day'})]))
            cuts = [dict(id='cut-1', start=1.5, end=2.5, title='restart', reason='retain later take', enabled=True, reviewed=True)]
            (root / 'cuts.json').write_text(json.dumps(cuts))
            server = load_server(root)
            self.assertEqual(server.corrected_project()['cues'][0]['text'], 'Dev Day')
            server.save_subtitle(dict(cue=3, text='完整表达啊嗯'))
            subprocess.run([sys.executable, str(scripts / 'deliver.py'), '--review', str(root), '--version', 'v1'], check=True, capture_output=True)
            report = verify(root)
            self.assertTrue(report['technicalPass'])
            self.assertEqual(report['cueCount'], 2)
            final = json.loads((root / 'final-delivery.json').read_text())
            self.assertEqual(final['speed'], 1.1)
            self.assertEqual(final['gainDb'], 8)
            self.assertGreater(final['trimStart'], .35)
            self.assertIn('啊嗯', Path(final['subtitlePath']).read_text())
            self.assertEqual(final['subtitleWarnings'], 0)
            http = ThreadingHTTPServer(('127.0.0.1', 0), server.Handler)
            thread = Thread(target=http.serve_forever, daemon=True)
            thread.start()
            try:
                url = f'http://127.0.0.1:{http.server_port}'
                with urlopen(url + '/api/final') as response:
                    self.assertEqual(json.load(response)['version'], 'v1')
                with urlopen(url + '/final/subtitles.srt') as response:
                    self.assertIn('啊嗯', response.read().decode())
                with urlopen(url + '/final/audio.wav') as response:
                    self.assertEqual(response.read()[:4], b'RIFF')
            finally:
                http.shutdown()
                http.server_close()
                thread.join()

if __name__ == '__main__':
    unittest.main()
