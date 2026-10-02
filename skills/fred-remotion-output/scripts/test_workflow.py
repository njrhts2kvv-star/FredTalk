import copy
import hashlib
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from workflow import scene_window, scene_review_signature, validate_workflow

class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.base = Path(self.temp.name)
        self.source = self.base / 'Scene.tsx'
        self.source.write_text('export const Scene = () => null;')
        self.frame = self.base / 'frame.png'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=c=white:s=32x32', '-frames:v', '1', '-threads', '1', str(self.frame)], check=True, capture_output=True)
        self.page = {'stableId': 'S1', 'startFrame': 0, 'durationInFrames': 60,
            'sourceSpans': [{'text': 'Show the decision'}],
            'productionRoute': {'selected': 'remotion', 'source': 'User message selecting the recommendation'},
            'storyboardReview': {'status': 'confirmed', 'confirmedSource': 'User message', 'directionNote': 'Keep the selected library motion'}}
        self.manifest = {'workflow': {'profile': 'fred-video-v2'}, 'timelineFps': 60, 'pages': [self.page]}
        self.page['keyframeReview'] = {'status': 'confirmed', 'confirmedSource': 'User keyframe feedback',
            'confirmedFrames': [{'id': 'focus', 'sha256': self.sha(self.frame)}],
            'frames': [{'id': 'focus', 'path': 'frame.png', 'sha256': self.sha(self.frame), 'timeSeconds': 0.5}],
            'sourceFiles': [{'path': 'Scene.tsx', 'sha256': self.sha(self.source)}],
            'contextSha256': scene_review_signature(self.manifest, self.page)}
    def tearDown(self):
        self.temp.cleanup()
    def sha(self, path):
        return hashlib.sha256(path.read_bytes()).hexdigest()
    def test_valid_keyframes_and_explicit_direction(self):
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_suggestion_is_not_selection(self):
        self.page['productionRoute'] = {'suggested': 'remotion'}
        self.assertTrue(validate_workflow(self.manifest, 'planning', self.base))
    def test_changed_source_invalidates_keyframes(self):
        self.source.write_text('changed layout')
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_subtitle_change_invalidates_keyframes(self):
        self.manifest['subtitles'] = {'enabled': True, 'cues': [{'startSeconds': 0, 'endSeconds': 1, 'text': 'New subtitle'}]}
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_scene_brand_visibility_change_invalidates_only_its_review_context(self):
        before = scene_review_signature(self.manifest, self.page)
        other = {'stableId': 'other', 'brandCorner': {'enabled': False}}
        self.manifest['pages'].append(other)
        self.assertEqual(before, scene_review_signature(self.manifest, self.page))
        self.page['brandCorner'] = {'enabled': False}
        self.assertNotEqual(before, scene_review_signature(self.manifest, self.page))
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
        signature = scene_review_signature(self.manifest, self.page)
        self.page['brandCorner']['hiddenIntervals'] = [
            {'startSeconds': 0.1, 'endSeconds': 0.8, 'reason': 'Playback'}]
        self.assertNotEqual(signature, scene_review_signature(self.manifest, self.page))
    def test_unrelated_subtitle_does_not_invalidate_scene(self):
        self.manifest['subtitles'] = {'enabled': True, 'cues': [{'startSeconds': 9, 'endSeconds': 10, 'text': 'Other scene'}]}
        before = scene_review_signature(self.manifest, self.page)
        self.manifest['subtitles']['cues'][0]['text'] = 'Changed other scene'
        self.assertEqual(before, scene_review_signature(self.manifest, self.page))
    def test_unrelated_cue_and_source_hash_refresh_do_not_reapprove_this_scene(self):
        self.manifest['subtitles'] = {'enabled': True, 'sourcePath': 'captions.srt',
            'sourceSha256': 'a' * 64, 'cues': [{'startSeconds': 9, 'endSeconds': 10, 'text': 'Other scene'}]}
        before = scene_review_signature(self.manifest, self.page)
        self.manifest['subtitles']['cues'][0]['text'] = 'Changed other scene'
        self.manifest['subtitles']['sourceSha256'] = 'b' * 64
        self.assertEqual(before, scene_review_signature(self.manifest, self.page))
    def test_text_file_cannot_be_keyframe(self):
        self.frame.write_text('not an image')
        self.page['keyframeReview']['frames'][0]['sha256'] = self.sha(self.frame)
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_overridden_wait_requires_authorization_source(self):
        self.manifest['workflow']['authorization'] = {'mode': 'direct-output'}
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_explicit_direct_output_does_not_require_user_keyframe_approval(self):
        self.manifest['workflow']['authorization'] = {'mode': 'direct-output', 'source': 'Current user asks for direct output'}
        self.page.pop('keyframeReview')
        self.page.pop('storyboardReview')
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_open_issue_blocks_confirmation(self):
        self.page['keyframeReview']['openIssues'] = ['Subtitle overlaps the result']
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_new_frame_cannot_inherit_old_approval(self):
        self.page['keyframeReview']['confirmedFrames'][0]['sha256'] = '0' * 64
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_regenerated_identical_frames_keep_original_confirmation(self):
        self.source.write_text('updated timing with identical sampled state')
        self.page['keyframeReview']['sourceFiles'][0]['sha256'] = self.sha(self.source)
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.page['keyframeReview']['revalidationNote'] = 'Rerendered affected frames; identical hashes to confirmed images'
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_historical_manifest_is_not_retroactively_replanned(self):
        self.assertEqual([], validate_workflow({'pages': [{'stableId': 'old'}]}, 'representative', self.base))
    def test_changed_selected_candidate_is_rejected(self):
        self.page['storyboardReview'].update(candidates=[{'id': 'A', 'imagePath': 'frame.png', 'sha256': self.sha(self.frame)}], userSelection={'candidateId': 'A', 'sha256': '0'*64})
        self.assertTrue(validate_workflow(self.manifest, 'planning', self.base))
    def test_scene_local_clock_does_not_guess_global_zero(self):
        self.manifest['clockContract'] = {'mode': 'scene-local'}
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertIsNone(scene_window(self.manifest, self.page))
        errors = validate_workflow(self.manifest, 'representative', self.base)
        self.assertTrue(any('global' in error.lower() for error in errors))
    def test_unknown_window_retains_cues_in_signature_without_blocking_history(self):
        self.manifest['clockContract'] = {'mode': 'scene-local'}
        self.manifest['subtitles'] = {'enabled': True, 'cues': [
            {'startSeconds': 10, 'endSeconds': 11, 'text': 'Actual scene caption'}]}
        before = scene_review_signature(self.manifest, self.page)
        self.manifest['subtitles']['cues'][0]['text'] = 'Changed actual scene caption'
        self.assertNotEqual(before, scene_review_signature(self.manifest, self.page))
        self.manifest.pop('workflow')
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_explicit_global_voice_offset_maps_scene_local_frames(self):
        self.manifest['clockContract'] = {'mode': 'scene-local'}
        self.page['globalVoiceStartFrame'] = 600
        self.page['keyframeReview']['frames'][0]['timeSeconds'] = 10.5
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertEqual((10, 11), scene_window(self.manifest, self.page))
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_missing_or_invalid_timing_is_not_guessed_for_signature(self):
        for fps in [None, 0, -1, True, float('nan')]:
            with self.subTest(fps=fps):
                self.manifest['timelineFps'] = fps
                self.assertIsNone(scene_window(self.manifest, self.page))
                self.assertIsInstance(scene_review_signature(self.manifest, self.page), str)
    def test_enabled_subtitles_require_imported_cues_at_representative_only(self):
        self.manifest['subtitles'] = {'enabled': True, 'sourcePath': 'captions.srt'}
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertEqual([], validate_workflow(self.manifest, 'planning', self.base))
        errors = validate_workflow(self.manifest, 'representative', self.base)
        self.assertTrue(any('cues' in error for error in errors))
    def test_subtitle_source_requires_current_hash(self):
        source = self.base / 'captions.srt'
        source.write_text('1\n00:00:00,000 --> 00:00:01,000\nConfirmed caption\n')
        self.manifest['subtitles'] = {'enabled': True, 'sourcePath': 'captions.srt',
            'cues': [{'startSeconds': 0, 'endSeconds': 1, 'text': 'Confirmed caption'}]}
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
        self.manifest['subtitles']['sourceSha256'] = self.sha(source)
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
        source.write_text('1\n00:00:00,000 --> 00:00:01,000\nChanged caption with different width\n')
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_explicit_empty_subtitle_cues_do_not_create_review_work(self):
        self.manifest['subtitles'] = {'enabled': True, 'cues': []}
        self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
        self.assertEqual([], validate_workflow(self.manifest, 'representative', self.base))
    def test_invalid_imported_subtitle_cues_cannot_pass_as_an_empty_window(self):
        for cue in [{}, {'startSeconds': 0, 'endSeconds': -1, 'text': 'Wrong interval'},
                    {'startSeconds': 0, 'endSeconds': 1, 'text': ''}]:
            with self.subTest(cue=cue):
                self.manifest['subtitles'] = {'enabled': True, 'cues': [cue]}
                self.page['keyframeReview']['contextSha256'] = scene_review_signature(self.manifest, self.page)
                self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))
    def test_direct_output_does_not_skip_subtitle_source_integrity(self):
        self.manifest['workflow']['authorization'] = {'mode': 'direct-output', 'source': 'Current direct output request'}
        self.manifest['subtitles'] = {'enabled': True, 'cues': [], 'sourcePath': 'missing.srt'}
        self.assertTrue(validate_workflow(self.manifest, 'representative', self.base))

if __name__ == '__main__':
    unittest.main()
