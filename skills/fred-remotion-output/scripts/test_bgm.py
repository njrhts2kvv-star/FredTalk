"""Verify owner exclusion, precise mute clocks and interior music extension."""
import array
import json
import math
import shutil
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path
from unittest.mock import patch
import bgm
import bgm_policy
import package_bgm


class BgmTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.music = self.root / 'own.wav'
        rate = bgm.RATE
        with wave.open(str(self.music), 'wb') as w:
            w.setparams((2, 2, rate, 0, 'NONE', 'not compressed'))
            samples = array.array('h')
            for i in range(3 * rate):
                value = round(2000 * math.sin(2 * math.pi * (211 * i / rate + 7 * (i/rate)**2)))
                samples.extend([value, value])
            w.writeframes(samples.tobytes())

    def tearDown(self):
        self.temp.cleanup()

    def test_other_machine_requires_supplied_music(self):
        with patch.object(bgm_policy, 'authorized_owner', return_value=None):
            with self.assertRaisesRegex(ValueError, 'own --bgm'):
                bgm_policy.resolve_music()

    def test_other_machine_can_use_own_music(self):
        with patch.object(bgm_policy, 'authorized_owner', return_value=None):
            self.assertEqual(bgm_policy.resolve_music(self.music)[2], 'user-supplied')

    def test_renamed_owner_music_refused_on_other_machine(self):
        policy = {'localOnlyAssets': [{'sha256': bgm_policy.digest(self.music)}]}
        with patch.object(bgm_policy, 'authorized_owner', return_value=None), \
                patch.object(bgm_policy, 'load_policy', return_value=policy):
            with self.assertRaisesRegex(ValueError, 'cannot be used'):
                bgm_policy.resolve_music(self.music)
            self.assertIsNotNone(bgm_policy.export_exclusion(self.music))

    def test_owner_binding_does_not_transfer_to_other_machine(self):
        config = self.root / 'owner.json'
        config.write_text(json.dumps({'machineFingerprint': 'original-machine'}))
        config.chmod(0o600)
        with patch.object(bgm_policy, 'machine_fingerprint', return_value='different-machine'):
            self.assertIsNone(bgm_policy.authorized_owner(config))

    def test_world_readable_owner_binding_refused(self):
        config = self.root / 'owner.json'; config.write_text('{}'); config.chmod(0o644)
        self.assertIsNone(bgm_policy.authorized_owner(config))

    def test_private_directory_excluded_without_reading_file(self):
        self.assertIsNotNone(bgm_policy.export_exclusion(self.root/'bgm-local-only/missing.wav'))

    def test_extension_covers_long_video_with_interior_segments(self):
        segments, fade = bgm.music_segments(600, 268.032, {'loopSourceRangeSeconds': [120, 240]})
        self.assertEqual(segments[0], [0, 180])
        self.assertTrue(all(x == [120, 240] for x in segments[1:]))
        self.assertGreaterEqual(sum(b-a for a,b in segments)-fade*(len(segments)-1), 600)

    def test_invalid_music_range_refused(self):
        with self.assertRaises(ValueError):
            bgm.music_segments(10, 3, {'loopSourceRangeSeconds': [2, 4]})

    def test_short_explicit_plan_not_silently_padded(self):
        with self.assertRaisesRegex(ValueError, 'do not cover'):
            bgm.music_segments(10, 3, {'segments': [[0, 3]]})

    def test_overlapping_mute_ranges_refused(self):
        with self.assertRaises(ValueError):
            bgm.mute_expression(3, [{'startSeconds': 0, 'endSeconds': 2, 'reason': 'source'},
                                    {'startSeconds': 1, 'endSeconds': 3, 'reason': 'source'}], .1)

    def floats(self, path):
        data = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path),
                                        '-f', 'f32le', '-c:a', 'pcm_f32le', '-'])
        samples = array.array('f'); samples.frombytes(data); return samples

    @unittest.skipUnless(shutil.which('ffmpeg'), 'FFmpeg unavailable')
    def test_mute_is_silent_and_clock_continues_at_original_gain(self):
        out = self.root / 'bed.wav'
        bgm.compose(self.music, out, 3, 3, {'muteRanges': [
            {'startSeconds': .8, 'endSeconds': 1.2, 'reason': 'listen to source'}]})
        samples, original = self.floats(out), self.floats(self.music)
        self.assertEqual(len(samples), 3 * bgm.RATE * 2)
        self.assertEqual(max(abs(x) for x in samples[round(.8*bgm.RATE)*2:round(1.2*bgm.RATE)*2]), 0)
        for start, end in [(.1, .5), (1.4, 2.8)]:
            lo, hi = round(start*bgm.RATE)*2, round(end*bgm.RATE)*2
            self.assertLess(max(abs(a-b) for a,b in zip(samples[lo:hi],original[lo:hi])), 1e-6)

    @unittest.skipUnless(shutil.which('ffmpeg'), 'FFmpeg unavailable')
    def test_extended_music_has_exact_samples_and_no_crossfade_gain_boost(self):
        out = self.root/'long.wav'
        bgm.compose(self.music, out, 8, 3, {'loopSourceRangeSeconds': [.8, 2.5]})
        samples = self.floats(out)
        self.assertEqual(len(samples), 8 * bgm.RATE * 2)
        self.assertLessEqual(max(abs(x) for x in samples), 2001/32768)

    def test_mixed_input_refused_before_processing(self):
        with self.assertRaisesRegex(ValueError, 'never add'):
            bgm.mix(self.root/'input.mp4', self.root/'output.mp4', {'enabled': True, 'inputBgmAlreadyPresent': True})

    def test_disabled_music_does_not_start_mixing(self):
        with self.assertRaisesRegex(ValueError, 'BGM disabled'):
            bgm.mix(self.root/'input.mp4', self.root/'output.mp4', {'enabled': False})

    def test_capability_package_has_no_music_or_owner_configuration(self):
        import zipfile
        out = self.root/'capability.zip';package_bgm.package(out)
        with zipfile.ZipFile(out) as archive:
            self.assertFalse(any(name.endswith(('.wav', '.mp3', '.m4a', 'bgm-owner.json')) for name in archive.namelist()))
            self.assertFalse(json.loads(archive.read('manifest.json'))['musicIncluded'])
            self.assertIsNone(archive.testzip())


if __name__ == '__main__':
    unittest.main()
