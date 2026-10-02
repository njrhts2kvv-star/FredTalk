"""Ensure concrete motion checks reach real scene packets without imposing templates."""
import unittest
from common import project_root
from scene import packet, manifest_packet, load_routing


class MotionReadinessTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.root = project_root()

    def rule(self, scene_type, rule_id, modifiers=()):
        return next(rule for rule in packet(self.root, scene_type, modifiers)['rules']
                    if rule['id'] == rule_id)

    def test_continuous_motion_has_waypoint_and_velocity_checks(self):
        rule = self.rule('relationship', 'F01')
        self.assertTrue(any('路过' in value and '速度' in value for value in rule['checks']))
        self.assertIn('稳定阅读', rule['scope'])

    def test_content_readiness_and_fixed_layout_focus_reach_comparison(self):
        rules = packet(self.root, 'image-comparison')['rules']
        text = '\n'.join(value for rule in rules for key in ['prefer', 'checks']
                         for value in rule[key])
        self.assertIn('扩容', text)
        self.assertIn('首个可读', text)
        self.assertIn('保留排布', text)

    def test_same_shell_handoff_keeps_direct_cut_exception(self):
        rule = self.rule('summary', 'F10', ['object-transition'])
        self.assertTrue(any('外壳' in value and 'Freeze' in value for value in rule['checks']))
        self.assertIn('直接切换', rule['scope'])

    def test_revision_scope_is_passed_without_global_single_line_white_rule(self):
        scene = {'stableId': 'sample', 'sceneGuide': {'type': 'summary', 'modifiers': []},
                 'preserveScope': {'otherCards': 'unchanged'},
                 'currentFeedback': {'note': 'Only this label is single-line white'}}
        result = manifest_packet(self.root, {'pages': [scene]}, 'sample')
        self.assertEqual(result['currentScene']['preserveScope'], scene['preserveScope'])
        self.assertEqual(result['currentScene']['currentFeedback'], scene['currentFeedback'])
        self.assertIn('不把所有视频固定白字', self.rule('summary', 'F08')['scope'])

    def test_export_and_revision_stages_route_to_existing_delivery_methods(self):
        stages = load_routing(self.root)['stageReferences']
        reference = 'skills/fred-remotion-output/references/render-and-delivery.md'
        self.assertIn(reference, stages['render'])
        self.assertIn(reference, stages['revision'])
        self.assertIn('skills/fred-remotion-output/references/object-transitions.md', stages['joining'])


if __name__ == '__main__':
    unittest.main()
