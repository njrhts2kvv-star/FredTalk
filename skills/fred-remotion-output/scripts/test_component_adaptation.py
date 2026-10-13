"""Verify adaptation facts reach the real scene packet without changing old contracts."""
import copy
import unittest
from common import project_root
from scene import manifest_packet
from component_adaptation import adaptation_context


class ComponentAdaptationTests(unittest.TestCase):
    def manifest(self):
        style = {'fontId': 'misans-heavy', 'fontFamily': 'EpisodePrompt', 'fontWeight': 900,
                 'fontSize': 62, 'lineHeight': 1.4, 'logicalCanvas': [1920, 1080]}
        current = {'stableId': 'A', 'sceneGuide': {'type': 'prompt-reading'},
                   'typography': [{'role': 'body', 'styleGroup': 'prompt-body'}],
                   'readingPlan': {'fullText': '背景\n需求与目标', 'highlights': [{'start': 3, 'end': 5}]},
                   'preserveObjects': [{'objectId': 'first-panel', 'decision': 'keep three lines'}]}
        peer = {'stableId': 'B', 'sceneGuide': {'type': 'prompt-reading'},
                'typography': [{'role': 'body', 'styleGroup': 'prompt-body'}],
                'readingPlan': {'fullText': 'Do not preload sibling content'}}
        return {'sharedTypography': {'prompt-body': style}, 'pages': [current, peer]}

    def test_shared_style_reaches_actual_packet_and_only_matching_peers(self):
        manifest = self.manifest()
        baseline = copy.deepcopy(manifest)
        result = manifest_packet(project_root(), manifest, 'A')
        context = result['componentAdaptation']
        self.assertEqual(context['resolvedTypography'][0]['fontSize'], 62)
        self.assertEqual(context['typographyComparisons'][0]['status'], 'MATCH')
        self.assertEqual(context['typographyComparisons'][0]['peerSceneId'], 'B')
        self.assertNotIn('Do not preload sibling content', str(result))
        self.assertEqual(result['currentScene']['readingPlan'], manifest['pages'][0]['readingPlan'])
        self.assertEqual(result['currentScene']['preserveObjects'][0]['objectId'], 'first-panel')
        self.assertEqual(manifest, baseline)

    def test_explicit_user_override_is_kept_and_mismatch_warned(self):
        manifest = self.manifest()
        manifest['pages'][0]['typography'][0]['fontSize'] = 70
        result = adaptation_context(manifest, manifest['pages'][0])
        self.assertEqual(result['resolvedTypography'][0]['fontSize'], 70)
        self.assertEqual(result['typographyComparisons'][0]['status'], 'REVIEW_DIFFERENCE')
        self.assertTrue(result['warnings'])
        manifest['pages'][0]['typography'][0]['overrideReason'] = 'Current request: larger focus'
        result = adaptation_context(manifest, manifest['pages'][0])
        self.assertEqual(result['typographyComparisons'][0]['status'], 'DECLARED_DIFFERENCE')
        self.assertFalse(result['warnings'])

    def test_font_identity_and_canvas_difference_are_visible(self):
        manifest = self.manifest()
        manifest['pages'][1]['typography'][0].update(fontSha256='different', logicalCanvas=[960, 540])
        result = adaptation_context(manifest, manifest['pages'][0])
        self.assertIn('fontSha256', result['typographyComparisons'][0]['differentFields'])
        self.assertIn('logicalCanvas', result['typographyComparisons'][0]['differentFields'])

    def test_unknown_shared_group_does_not_silently_fall_back(self):
        manifest = self.manifest()
        manifest['pages'][0]['typography'][0]['styleGroup'] = 'typo'
        with self.assertRaisesRegex(ValueError, 'Unknown shared typography'):
            adaptation_context(manifest, manifest['pages'][0])

    def test_old_scene_needs_no_new_fields_or_approval(self):
        page = {'stableId': 'old', 'sceneGuide': {'type': 'summary'}}
        result = adaptation_context({'pages': [page]}, page)
        self.assertEqual(result['resolvedTypography'], [])
        self.assertEqual(result['typographyComparisons'], [])
        self.assertNotIn('approved', result)

    def test_handoff_keeps_source_mapping_and_camera_from_neighbor(self):
        manifest = self.manifest()
        previous = {'stableId': 'previous', 'sourceMapping': {'sourceInSeconds': 10},
                    'boundaryContract': {'exit': {'camera': {'scale': 1.2}, 'sourceSeconds': 12}},
                    'sceneGuide': {'type': 'summary'}}
        manifest['pages'].insert(0, previous)
        result = manifest_packet(project_root(), manifest, 'A')
        self.assertEqual(result['neighborBoundary']['previous']['sourceMapping']['sourceInSeconds'], 10)
        self.assertEqual(result['neighborBoundary']['previous']['boundaryContract'], previous['boundaryContract'])


if __name__ == '__main__':
    unittest.main()
