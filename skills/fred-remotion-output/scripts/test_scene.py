"""Verify bounded scene reading and meaningful per-scene planning coverage."""
import copy
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from common import project_root
from scene import packet, applicable, load_routing, validate_scene_guides, manifest_packet
from feedback import load_feedback


class SceneTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = project_root()

    def page(self, kind='prompt-reading', modifiers=()):
        p = packet(self.root, kind, modifiers)
        return {'stableId': 'sample', 'sceneGuide': {'type': kind, 'modifiers': list(modifiers),
                'signature': p['guideSignature'], 'applications': [
                    {'ruleId': r['id'], 'decision': '本场景保留全文并聚焦实际保留项',
                     'check': '对照保留项cue检查实际文字范围和出口'} for r in p['rules']]}}

    def test_prompt_does_not_preload_characters_audio_or_export(self):
        p = packet(self.root, 'prompt-reading')
        self.assertEqual({r['id'] for r in p['rules']}, {'F01', 'F02', 'F08'})
        self.assertNotIn('evidence', p['rules'][0])

    def test_modifiers_add_only_their_scope(self):
        p = packet(self.root, 'prompt-reading', ['frosted-focus', 'fixed-background'])
        self.assertEqual({r['id'] for r in p['rules']}, {'F01', 'F02', 'F08', 'F05', 'F07'})

    def test_comparison_has_geometry_without_prompt_rules(self):
        self.assertEqual({r['id'] for r in packet(self.root, 'image-comparison')['rules']}, {'F01', 'F03', 'F04'})

    def test_stage_routing_retains_all_existing_feedback(self):
        routing = load_routing(self.root)
        ids = {r for kind in ['types', 'modifiers'] for x in routing[kind] for r in x['ruleIds']}
        ids.update(r for group in routing['stageRules'].values() for r in group)
        self.assertEqual(ids, {r['id'] for r in load_feedback(self.root)['rules']})

    def test_missing_application_is_detected(self):
        page = self.page()
        page['sceneGuide']['applications'].pop()
        self.assertTrue(validate_scene_guides(self.root, [page], required=True))

    def test_empty_decision_is_not_completion(self):
        page = self.page()
        page['sceneGuide']['applications'][0]['decision'] = ''
        self.assertTrue(validate_scene_guides(self.root, [page], required=True))

    def test_scene_type_change_requires_a_fresh_packet(self):
        page = self.page()
        page['sceneGuide']['type'] = 'image-comparison'
        self.assertTrue(any('changed' in e for e in validate_scene_guides(self.root, [page], True)))

    def test_unrelated_rule_change_does_not_stale_prompt(self):
        baseline = packet(self.root, 'prompt-reading')['guideSignature']
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            folder = root / 'skills/fred-remotion-output/references'
            folder.mkdir(parents=True)
            shutil.copy2(self.root / 'skills/fred-remotion-output/references/scene-routing.json', folder)
            data = copy.deepcopy(load_feedback(self.root))
            next(r for r in data['rules'] if r['id'] == 'F13')['avoid'].append('Only a character change')
            (folder / 'feedback-rules.json').write_text(json.dumps(data))
            self.assertEqual(packet(root, 'prompt-reading')['guideSignature'], baseline)

    def test_accepted_old_scene_not_forced_into_replanning(self):
        self.assertEqual(validate_scene_guides(self.root, [{'stableId': 'old'}]), [])
        self.assertTrue(validate_scene_guides(self.root, [{'stableId': 'new'}], required=True))

    def test_custom_is_allowed_but_needs_its_reason(self):
        page = self.page('custom')
        self.assertTrue(validate_scene_guides(self.root, [page], True))
        page['sceneGuide']['customReason'] = '需要把实际物件从线框变成实体，现有场景不覆盖此关系'
        self.assertEqual(validate_scene_guides(self.root, [page], True), [])

    def test_asset_query_limits_candidates_and_rules_to_scene(self):
        result = subprocess.run([sys.executable, str(Path(__file__).resolve().with_name('references.py')),
             '--query', '提示词', '--scene-type', 'prompt-reading', '--limit', '3'],
             cwd=self.root, capture_output=True, text=True, check=True)
        data = json.loads(result.stdout)
        self.assertEqual(data['count'], 3)
        self.assertGreaterEqual(data['matchedCount'], data['count'])
        self.assertEqual({r['id'] for r in data['guidance']}, {'F01', 'F02', 'F08'})

    def test_unknown_modifier_cannot_silently_drop_restrictions(self):
        with self.assertRaises(ValueError):
            applicable(self.root, 'prompt-reading', ['charactre'])

    def test_brand_corner_is_scoped_and_has_canonical_geometry(self):
        plain = packet(self.root, 'summary')
        branded = packet(self.root, 'summary', ['brand-corner'])
        self.assertNotIn('F19', {r['id'] for r in plain['rules']})
        self.assertIn('F19', {r['id'] for r in branded['rules']})
        self.assertIn('skills/fred-remake/references/corner-branding.md',
                      branded['implementationRefs'])

    def test_media_layout_reaches_timing_without_forcing_a_device(self):
        p = packet(self.root, 'summary', ['media-layout'])
        self.assertIn('F20', {r['id'] for r in p['rules']})
        self.assertNotIn('device-frame', {m['id'] for m in p['modifiers']})
        self.assertIn('skills/fred-remotion-output/references/media-and-overlays.md',
                      p['implementationRefs'])

    def test_numeric_scroll_sound_does_not_leak_into_document_scroll(self):
        data = json.loads((self.root / 'skills/fred-remotion-output/references/sound-effects.json').read_text())
        sound = next(e for e in data['entries'] if e['id'] == 'SFX19')
        self.assertIn('number-scroll', sound['actions'])
        self.assertNotIn('document-scroll', sound['actions'])
        self.assertNotIn('W04', sound['actions'])

    def test_manifest_packet_keeps_current_contracts_and_feedback_without_claiming_approval(self):
        current = self.page()
        current.update(implementationMode='original',
                       productionRoute={'suggested': 'remotion', 'selected': None},
                       storyboardReview={'status': 'unselected'},
                       keyframeReview={'status': 'pending'},
                       referenceDisposition={'mode': 'original', 'styleContract': {'geometry': 'large content'}},
                       mediaContract=[{'path': 'real.mp4', 'sha256': 'media-hash'}],
                       dynamicContract={'mode': 'mixed'},
                       currentFeedback={'choice': 'keep', 'note': 'Fix the join', 'reviewedVersion': 'old'},
                       preservation={'scope': 'Keep the main content'},
                       review={'currentOutput': {'sha256': 'new', 'userReviewed': False}},
                       startFrame=60, durationInFrames=120)
        manifest = {'pages': [current], 'timelineFps': 60,
                    'workflow': {'profile': 'fred-video-v2'}, 'outputSpec': {'width': 3840, 'height': 2160, 'fps': 60},
                    'script': 'Do not preload full narration'}
        result = manifest_packet(self.root, manifest, 'sample')
        for field in ['implementationMode', 'productionRoute', 'storyboardReview', 'keyframeReview',
                      'referenceDisposition', 'mediaContract', 'dynamicContract', 'currentFeedback',
                      'preservation', 'review']:
            self.assertEqual(result['currentScene'][field], current[field])
        self.assertNotIn('script', result)
        self.assertEqual(result['manifestContext']['outputSpec'], manifest['outputSpec'])
        self.assertFalse(result['currentScene']['review']['currentOutput']['userReviewed'])
        self.assertIn('keyframes', result['workflowContext']['defaultOrder'])
        self.assertNotIn('F13', {r['id'] for r in result['rules']})

    def test_subtitle_window_uses_global_offset_and_half_open_intersection(self):
        current = self.page()
        current.update(startFrame=0, globalStartFrame=600, durationInFrames=120)
        cues = [{'startSeconds': 8, 'endSeconds': 10, 'text': 'before'},
                {'startSeconds': 9, 'endSeconds': 10.5, 'text': 'entering'},
                {'startSeconds': 11, 'endSeconds': 13, 'text': 'leaving'},
                {'startSeconds': 12, 'endSeconds': 14, 'text': 'after'}]
        manifest = {'pages': [current], 'timelineFps': 60, 'clockContract': {'mode': 'scene-local'},
                    'subtitles': {'enabled': True, 'sourcePath': 'final.srt', 'cues': cues,
                                  'geometry': {'bottom': 25.5}},
                    'brandCorner': {'enabled': True, 'variant': 'local-background'}}
        original = copy.deepcopy(manifest)
        result = manifest_packet(self.root, manifest, 'sample')
        overlays = result['overlayContext']
        self.assertEqual([c['text'] for c in overlays['subtitles']['cues']], ['entering', 'leaving'])
        self.assertEqual(overlays['subtitles']['geometry'], {'bottom': 25.5})
        self.assertEqual(overlays['brandCorner'], manifest['brandCorner'])
        self.assertEqual(overlays['sceneWindow']['startSeconds'], 10)
        self.assertEqual(manifest, original)

    def test_scene_local_clock_without_global_anchor_does_not_invent_subtitle_window(self):
        current = self.page()
        current.update(startFrame=0, durationInFrames=120)
        manifest = {'pages': [current], 'timelineFps': 60, 'clockContract': {'mode': 'scene-local'},
                    'subtitles': {'enabled': True, 'cues': [{'startSeconds': 0, 'endSeconds': 1, 'text': 'not proven local'}]}}
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertIsNone(result['overlayContext']['sceneWindow'])
        self.assertEqual(result['overlayContext']['subtitles']['cues'], [])
        self.assertIn('global', ' '.join(result['contextWarnings']))

    def test_neighbors_include_media_identity_without_their_full_script_or_rules(self):
        previous, current, following = self.page(), self.page(), self.page()
        previous.update(stableId='previous', sourceSpans=[{'text': 'do not leak neighbor script'}],
                        visualPlan={'exit': 'old title leaves', 'handoff': 'same phone remains'},
                        mediaFile='previous.mp4', mediaContract=[{'path': 'previous.mp4', 'sha256': 'prev-hash'}],
                        review={'status': 'review', 'versions': [{'path': 'new.mp4', 'sha256': 'new'},
                                                               {'path': 'old.mp4', 'sha256': 'old'}],
                                'currentOutput': {'sha256': 'new', 'userReviewed': False}},
                        tailFrame={'path': 'last.png', 'sourceVideoSha256': 'new', 'frame': 99})
        following.update(stableId='following', visualPlan={'enter': 'same phone moves'},
                         firstFrame={'path': 'first.png', 'sourceVideoSha256': 'next'})
        result = manifest_packet(self.root, {'pages': [previous, current, following]}, 'sample')
        bounds = result['neighborBoundary']
        self.assertEqual(bounds['previous']['stableId'], 'previous')
        self.assertEqual(bounds['next']['stableId'], 'following')
        self.assertEqual(bounds['previous']['mediaContract'][0]['sha256'], 'prev-hash')
        self.assertEqual(bounds['previous']['tailFrame']['sourceVideoSha256'], 'new')
        self.assertEqual(len(bounds['previous']['review']['versions']), 1)
        self.assertFalse(bounds['previous']['review']['currentOutput']['userReviewed'])
        self.assertNotIn('sourceSpans', bounds['previous'])
        self.assertNotIn('sceneGuide', bounds['previous'])
        self.assertEqual(bounds['previousHandoff'], 'same phone remains')

    def test_neighbor_keyframe_identity_keeps_only_boundary_frames(self):
        previous, current = self.page(), self.page()
        frames = [{'id': f'frame-{i}', 'path': f'{i}.png', 'sha256': f'hash-{i}',
                   'timeSeconds': i} for i in range(3)]
        previous.update(stableId='previous', keyframeReview={
            'status': 'confirmed', 'contextSha256': 'context-hash', 'frames': frames})
        result = manifest_packet(self.root, {'pages': [previous, current]}, 'sample')
        identity = result['neighborBoundary']['previous']['keyframeReview']
        self.assertEqual(identity['contextSha256'], 'context-hash')
        self.assertEqual(identity['frames'], [frames[0], frames[-1]])
        self.assertEqual(previous['keyframeReview']['frames'], frames)

    def test_current_feedback_is_selected_by_stable_id_and_missing_settings_stay_missing(self):
        result = manifest_packet(self.root, {'pages': [self.page()],
            'feedback': {'sample': {'choice': 'change', 'note': 'Current scene'},
                         'other': {'note': 'Do not preload other feedback'}}}, 'sample')
        self.assertEqual(result['feedbackContext'], {'manifestFeedback': {'choice': 'change', 'note': 'Current scene'}})
        self.assertNotIn('brandCorner', result['overlayContext'])
        self.assertNotIn('subtitles', result['overlayContext'])
        self.assertNotIn('workflowContext', result)

    def test_global_voice_anchor_is_supported_and_invalid_cue_is_reported(self):
        current = self.page()
        current.update(startFrame=0, globalVoiceStartFrame=600, durationInFrames=60)
        manifest = {'pages': [current], 'timelineFps': 60,
                    'subtitles': {'cues': [{'startSeconds': 10, 'endSeconds': 11, 'text': 'current'}]}}
        self.assertEqual(manifest_packet(self.root, manifest, 'sample')['overlayContext']['sceneWindow']['startSeconds'], 10)
        manifest['subtitles']['cues'][0]['endSeconds'] = 9
        with self.assertRaises(ValueError):
            manifest_packet(self.root, manifest, 'sample')

    def test_episode_design_and_fonts_reach_each_scene_without_inventing_acceptance(self):
        manifest = {'pages': [self.page()], 'designContract': {
            'currentRequirements': [{'source': 'User feedback', 'decision': 'Keep logos transparent'}],
            'noPersistentChapterHeaders': True}, 'fonts': {'body': 'MiSans'}}
        original = copy.deepcopy(manifest)
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertEqual(result['manifestContext']['designContract'], manifest['designContract'])
        self.assertEqual(result['manifestContext']['fonts'], manifest['fonts'])
        self.assertEqual(manifest, original)
        self.assertNotIn('approval', result['manifestContext'])

    def test_enabled_brand_reaches_scene_even_when_modifier_was_omitted(self):
        manifest = {'pages': [self.page()], 'brandCorner': {'enabled': True, 'position': 'top-right'}}
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertIn('skills/fred-remake/references/corner-branding.md', result['implementationRefs'])
        self.assertEqual(result['overlayContext']['brandGuidance']['position'], 'top-right')
        self.assertTrue(any('brand-corner' in warning for warning in result['contextWarnings']))
        self.assertNotIn('F19', {rule['id'] for rule in result['rules']})
        canonical = result['overlayContext']['brandGuidance']['canonical']
        self.assertEqual(canonical['baseCanvas'], {'width': 3840, 'height': 2160})
        self.assertEqual(canonical['variants']['lightBackground']['destination']['x'], 3099)

    def test_other_format_does_not_silently_receive_landscape_brand_geometry(self):
        manifest = {'pages': [self.page()], 'deliveryProfile': 'standalone-video',
                    'outputSpec': {'width': 1080, 'height': 1920}}
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertNotIn('brandGuidance', result['overlayContext'])
        self.assertNotIn('brandCorner', result['overlayContext'])

    def test_video_scene_can_disable_brand_without_changing_animation_default(self):
        video = self.page('device-demo')
        video['brandCorner'] = {'enabled': False, 'reason': 'Video playback'}
        animation = self.page('summary')
        animation['stableId'] = 'animation'
        manifest = {'pages': [video, animation],
                    'brandCorner': {'enabled': True, 'position': 'top-right'}}
        original = copy.deepcopy(manifest)
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertFalse(result['overlayContext']['brandCorner']['enabled'])
        self.assertNotIn('brandGuidance', result['overlayContext'])
        self.assertTrue(manifest_packet(self.root, manifest, 'animation')
                        ['overlayContext']['brandCorner']['enabled'])
        self.assertEqual(manifest, original)

    def test_mixed_scene_brand_windows_and_explicit_override_reach_execution(self):
        page = self.page()
        page['brandCorner'] = {'enabled': True, 'hiddenIntervals': [
            {'startSeconds': 1, 'endSeconds': 3, 'reason': 'Source video playback'}]}
        manifest = {'pages': [page], 'brandCorner': {'enabled': False, 'position': 'top-right'}}
        original = copy.deepcopy(manifest)
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertEqual(result['overlayContext']['brandCorner']['hiddenIntervals'],
                         page['brandCorner']['hiddenIntervals'])
        self.assertEqual(result['overlayContext']['brandCorner']['position'], 'top-right')
        self.assertIn('brandGuidance', result['overlayContext'])
        self.assertEqual(manifest, original)

    def test_copied_rule_decisions_warn_without_changing_contract_or_approval(self):
        page = self.page(); original = copy.deepcopy(page)
        result = manifest_packet(self.root, {'pages': [page]}, 'sample')
        self.assertTrue(any('repeat the same text' in item for item in result['contextWarnings']))
        self.assertEqual(page, original)
        self.assertEqual(validate_scene_guides(self.root, [page], True), [])

    def test_landscape_default_warns_but_does_not_fill_missing_brand_contract(self):
        manifest = {'pages': [self.page()], 'deliveryProfile': 'standalone-video',
                    'outputSpec': {'width': 1920, 'height': 1080}}
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertTrue(any('brandCorner' in warning for warning in result['contextWarnings']))
        self.assertNotIn('brandCorner', result['overlayContext'])
        manifest['brandCorner'] = {'enabled': False, 'overrideSource': 'Unbranded b-roll'}
        result = manifest_packet(self.root, manifest, 'sample')
        self.assertNotIn('brandGuidance', result['overlayContext'])


if __name__ == '__main__':
    unittest.main()
