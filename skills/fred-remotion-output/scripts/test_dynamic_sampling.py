"""Sampling must distinguish impossible configuration from absent motion."""
import unittest
from unittest.mock import patch
from scan_dynamic_scenes import scan


class DynamicSamplingTests(unittest.TestCase):
    def run_scan(self, contract):
        manifest = {'timelineFps': 60, 'pages': [{'stableId': 'sample', 'startFrame': 0,
                    'durationInFrames': 60, 'dynamicContract': contract}]}
        with patch('scan_dynamic_scenes._frame', side_effect=[bytes([n]) * 4 for n in range(0, 100, 10)]) as frames:
            return scan('unused.mp4', manifest, ffmpeg='unused'), frames.call_count

    def test_impossible_event_count_is_configuration_error_before_decoding(self):
        result, calls = self.run_scan({'mode': 'dynamic', 'sampleCount': 5, 'requiredChangeEvents': 6})
        self.assertEqual(calls, 0)
        self.assertEqual(result['status'], 'FAIL')
        self.assertIn('sampleCount - 1', result['errors'][0])

    def test_valid_sampling_detects_motion(self):
        result, calls = self.run_scan({'mode': 'dynamic', 'sampleCount': 5, 'requiredChangeEvents': 4})
        self.assertEqual((result['status'], calls), ('PASS', 5))

    def test_stable_reading_is_not_forced_to_move(self):
        result, calls = self.run_scan({'mode': 'stable-reading', 'reason': 'Read the result'})
        self.assertEqual((result['status'], calls), ('PASS', 0))

    def test_zero_required_events_cannot_bypass_declared_motion(self):
        result, calls = self.run_scan({'mode': 'dynamic', 'requiredChangeEvents': 0})
        self.assertEqual((result['status'], calls), ('FAIL', 0))


if __name__ == '__main__':
    unittest.main()
