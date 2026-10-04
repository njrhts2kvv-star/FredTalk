import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'skills/fred-remotion-output/scripts'))
from build_segment_review import build

class ReviewAudioTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.root=Path(self.tmp.name)
        (self.root/'voice.wav').write_bytes(b'synthetic-test-audio')
        (self.root/'frame.png').write_bytes(b'synthetic-test-frame')
        def record(name):return {'path':name,'sha256':hashlib.sha256((self.root/name).read_bytes()).hexdigest()}
        self.data={'episodeKey':'test','timelineFps':60,'audio':record('voice.wav'),
            'pages':[{'stableId':'s1','startFrame':0,'durationInFrames':120,'implementationMode':'preserved-media',
                'mediaContract':[record('frame.png')],'sourceSpans':[{'text':'Synthetic UI test'}],
                'keyframeReview':{'frames':[dict(record('frame.png'),id='f1',timeSeconds=.5)]}}]}
    def tearDown(self):self.tmp.cleanup()
    def render(self):
        path=self.root/'manifest.json';path.write_text(json.dumps(self.data))
        return build(path,self.root/'index.html','keyframes')
    def test_current_audio_and_frame_are_embedded(self):
        self.render();text=(self.root/'index.html').read_text()
        self.assertIn('id="review-audio"',text)
        self.assertIn(self.data['audio']['sha256'],text)
        self.assertNotIn('__TIMELINE_SCRIPT__',text)
    def test_changed_audio_requires_regeneration(self):
        (self.root/'voice.wav').write_bytes(b'changed')
        with self.assertRaisesRegex(ValueError,'sha256 mismatch'):self.render()
    def test_unmapped_frame_is_not_treated_as_a_global_clock(self):
        self.data['pages'][0]['startFrame']=120
        with self.assertRaisesRegex(ValueError,'outside the scene global window'):self.render()

if __name__=='__main__':unittest.main()
