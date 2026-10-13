"""Behavior checks for read-only full-audio profiling, using isolated synthetic audio."""
import hashlib
import math
from pathlib import Path
import struct
import tempfile
import unittest
import wave
from loudness_profile import build_profile

class LoudnessProfileTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='loudness-profile-test-')
        self.path=Path(self.tmp.name)/'input.wav'
    def tearDown(self):self.tmp.cleanup()
    def audio(self,duration,amplitude):
        rate=48000
        frames=bytearray()
        for i in range(round(duration*rate)):
            t=i/rate;v=round(32767*amplitude(t)*math.sin(2*math.pi*997*t))
            frames.extend(struct.pack('<hh',v,v))
        with wave.open(str(self.path),'wb') as w:
            w.setparams((2,2,rate,0,'NONE','not compressed'));w.writeframes(frames)
    def test_local_jump_is_found_despite_close_integrated_average(self):
        self.audio(20,lambda t:.16 if 8<=t<9 else .08)
        before=hashlib.sha256(self.path.read_bytes()).hexdigest()
        result=build_profile(self.path,segments=[dict(id='intro',role='narration',start=0,end=8),dict(id='insert',role='insert',start=8,end=9),dict(id='body',role='narration',start=9,end=20)])
        self.assertTrue(result['analysisOnly'])
        self.assertEqual(hashlib.sha256(self.path.read_bytes()).hexdigest(),before)
        self.assertLess(abs(result['integrated']['integratedLufs']-result['reference']['momentaryMedianLufs']),2)
        self.assertGreater(max(p['momentaryLufs'] for p in result['timeline'] if p['momentaryLufs'] is not None)-result['reference']['momentaryMedianLufs'],4)
        self.assertTrue(any(p['start']<9 and p['end']>8 for p in result['candidates']))
        self.assertIsNone(result['segments'][1]['shortTermMedianLufs'])
    def test_silence_is_unavailable_not_zero_lufs(self):
        self.audio(2,lambda t:0)
        result=build_profile(self.path)
        self.assertIsNone(result['reference']['momentaryMedianLufs'])
        self.assertEqual(result['candidates'],[])
        self.assertTrue(all(p['momentaryLufs'] is None for p in result['timeline']))
    def test_short_cue_does_not_inherit_another_segments_window(self):
        self.audio(4,lambda t:.1)
        result=build_profile(self.path,cues=[dict(start=.1,end=.3,text='short'),dict(start=1,end=2,text='longer')])
        self.assertEqual(result['cues'][0]['momentarySamples'],0)
        self.assertIsNone(result['cues'][0]['momentaryMedianLufs'])
        self.assertGreater(result['cues'][1]['momentarySamples'],0)
        self.assertIsNone(result['cues'][1]['shortTermMedianLufs'])
    def test_invalid_ranges_fail_before_processing(self):
        self.audio(2,lambda t:.1)
        for segments in [[dict(start=0,end=3,role='insert')],[dict(start=0,end=1.5),dict(start=1,end=2)]]:
            with self.assertRaises(ValueError):build_profile(self.path,segments=segments)

if __name__=='__main__':unittest.main()
