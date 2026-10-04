import copy
import json
import math
from pathlib import Path
import struct
import subprocess
import sys
import tempfile
import unittest
import wave
from deliver import load_server

SCRIPTS = Path(__file__).resolve().parent

class QualityTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='roughcut-quality-')
        self.episode = Path(self.tmp.name) / 'Test'
        self.episode.mkdir()
        self.audio = self.episode / 'input.wav'
        # The phase produces intersample peaks after hard limiting.
        with wave.open(str(self.audio), 'wb') as w:
            w.setparams((2, 2, 48000, 0, 'NONE', 'not compressed'))
            w.writeframes(b''.join(struct.pack('<hh', *([int(29000*math.sin(2*math.pi*9973*i/48000+.7))]*2)) for i in range(96000)))
        (self.episode/'input.srt').write_text('1\n00:00:00,000 --> 00:00:02,000\n一共一秒只需要6积分一秒啊\n')
        (self.episode/'script.md').write_text('测试')
        subprocess.run([sys.executable,str(SCRIPTS/'init_review.py'),'--episode',str(self.episode),'--audio',str(self.audio),'--subtitles',str(self.episode/'input.srt'),'--script',str(self.episode/'script.md'),'--title','Test'],check=True,capture_output=True)
        self.root=self.episode/'03_制作过程/audio-review'
        self.cuts=[dict(id='repeat',start=.4,end=.7,enabled=True)]
        self.write('cuts.json', self.cuts)
        self.write('subtitle-boundaries.json',[dict(cue=1,cutId='repeat',cutRange=[.4,.7],removeInfix=dict(text='一秒',occurrence=1),note='word and waveform reviewed')])
        self.server=load_server(self.root)
    def tearDown(self):
        self.tmp.cleanup()
    def write(self,name,data):
        (self.root/name).write_text(json.dumps(data,ensure_ascii=False))
    def test_infix_export_and_restore(self):
        self.assertEqual(self.server.corrected_project()['cues'][0]['text'],'一共只需要6积分一秒啊')
        result=self.server.export(self.cuts)
        blocks=(Path(result['path'])/'review-cut.srt').read_text().strip().split('\n\n')
        self.assertEqual(len(blocks),1)
        self.assertIn('一共只需要6积分一秒啊',blocks[0])
        self.assertEqual(result['subtitleWarnings'],0)
        restored=copy.deepcopy(self.cuts);restored[0]['enabled']=False
        # Export must respect the passed decision, even before saving the JSON.
        result=self.server.export(restored)
        self.assertIn('一共一秒只需要6积分一秒啊',(Path(result['path'])/'review-cut.srt').read_text())
        self.write('cuts.json',restored)
        self.assertEqual(self.server.corrected_project()['cues'][0]['text'],'一共一秒只需要6积分一秒啊')
    def test_moved_cut_requires_new_text_review(self):
        self.cuts[0]['end']=.9;self.write('cuts.json',self.cuts)
        with self.assertRaisesRegex(ValueError,'range'):
            self.server.corrected_project()
    def test_unreviewed_extra_cut_still_warns(self):
        cuts=self.cuts+[dict(id='unknown',start=1.2,end=1.3,enabled=True)]
        self.write('cuts.json',cuts)
        result=self.server.export(cuts)
        self.assertGreater(result['subtitleWarnings'],0)
    def test_occurrence_and_manual_override(self):
        plan=json.loads((self.root/'subtitle-boundaries.json').read_text());plan[0]['removeInfix']['occurrence']=2
        self.write('subtitle-boundaries.json',plan)
        self.assertEqual(self.server.corrected_project()['cues'][0]['text'],'一共一秒只需要6积分啊')
        self.server.save_subtitle(dict(cue=1,text='用户手改'))
        self.assertEqual(self.server.corrected_project()['cues'][0]['text'],'用户手改')
    def test_true_peak_and_unity_speed_duration(self):
        self.write('cuts.json',[]);self.write('subtitle-boundaries.json',[])
        subprocess.run([sys.executable,str(SCRIPTS/'deliver.py'),'--review',str(self.root),'--version','v1','--speed','1','--trim-start','0','--gain-db','8'],check=True,capture_output=True)
        m=json.loads((self.root/'final-delivery.json').read_text())
        # Independent measurement, not the manifest's self-reported pass.
        from audio_qc import measure
        measured=measure(Path(m['audioPath']))
        self.assertLessEqual(measured['truePeakDbtp'],-1+.05)
        self.assertEqual(m['frames'],96000)
        self.assertIn('loudnessBefore',m)
        self.assertTrue(m['truePeakCheck']['passed'])

if __name__=='__main__':unittest.main()
