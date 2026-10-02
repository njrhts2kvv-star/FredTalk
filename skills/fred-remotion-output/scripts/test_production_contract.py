import copy
import tempfile
import unittest
from pathlib import Path

from production_contract import validate_production_contract


def original_page():
    return {
        "stableId": "original-01", "implementationMode": "original", "referenceChoices": [],
        "referenceDisposition": {"mode": "original", "reason": "No exact business relationship exists in the shelf",
            "anchors": ["B044", "T10"], "styleContract": {key: "kept" for key in ["surface", "typography", "geometry", "motion", "camera", "mediaBehavior"]},
            "newElements": ["supplier cards"], "risks": ["text density"], "reviewRequired": True},
        "dynamicContract": {"mode": "dynamic", "requiredChangeEvents": 1}}


class ProductionContractTests(unittest.TestCase):
    def test_original_scene_is_valid_without_fake_code_reference(self):
        self.assertEqual(validate_production_contract({"pages": [original_page()]}, require_explicit=True), [])

    def test_original_scene_requires_style_contract_and_review(self):
        page = original_page(); del page["referenceDisposition"]["styleContract"]; page["referenceDisposition"]["reviewRequired"] = False
        errors = validate_production_contract({"pages": [page]}, require_explicit=True)
        self.assertTrue(any("styleContract" in error for error in errors)); self.assertTrue(any("reviewRequired" in error for error in errors))

    def test_stable_reading_requires_reason(self):
        page = original_page(); page["implementationMode"] = "talk-only"; page["referenceDisposition"] = {"mode": "talk-only", "reason": "A conclusion only"}; page["dynamicContract"] = {"mode": "stable-reading"}
        self.assertTrue(any("stable-reading" in error for error in validate_production_contract({"pages": [page]}, require_explicit=True)))

    def test_multi_scene_requires_scene_local_clock(self):
        page = original_page(); second = copy.deepcopy(page); second["stableId"] = "original-02"
        self.assertTrue(any("clockContract" in error for error in validate_production_contract({"pages": [page, second]}, require_explicit=True)))

    def test_media_hash_is_checked_at_implementation_gate(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory); (base / "screen.mp4").write_bytes(b"media")
            page = {"stableId": "media", "implementationMode": "preserved-media", "referenceChoices": [],
                    "referenceDisposition": {"mode": "preserved-media", "reason": "Real recording"},
                    "mediaContract": [{"id": "screen", "path": "screen.mp4", "role": "evidence", "required": True}],
                    "dynamicContract": {"mode": "dynamic", "requiredChangeEvents": 1}}
            errors = validate_production_contract({"pages": [page]}, require_explicit=True, check_media_files=True, base=base)
            self.assertTrue(any("sha256" in error for error in errors))

    def test_wrong_declared_corner_requires_explicit_override(self):
        manifest = {'pages': [original_page()], 'brandCorner': {'enabled': True, 'position': 'top-left'}}
        self.assertTrue(any('brandCorner.position' in error for error in
                            validate_production_contract(manifest, require_explicit=True)))
        manifest['brandCorner']['overrideSource'] = 'Current user requested top-left for this project'
        self.assertEqual(validate_production_contract(manifest, require_explicit=True), [])
        manifest['brandCorner'] = {'enabled': False}
        self.assertEqual(validate_production_contract(manifest, require_explicit=True), [])

    def test_impossible_motion_sampling_fails_before_render(self):
        page = original_page(); page['dynamicContract']['requiredChangeEvents'] = 6
        self.assertTrue(any('sampleCount' in error for error in
                            validate_production_contract({'pages': [page]}, require_explicit=True)))
        page['dynamicContract']['sampleCount'] = 15
        self.assertEqual(validate_production_contract({'pages': [page]}, require_explicit=True), [])
        page['dynamicContract']['sampleCount'] = True
        self.assertTrue(any('sampleCount' in error for error in
                            validate_production_contract({'pages': [page]}, require_explicit=True)))

    def test_scene_brand_override_retains_position_guard_and_allows_disabled_playback(self):
        page = original_page()
        page['brandCorner'] = {'enabled': True, 'position': 'top-left'}
        manifest = {'pages': [page], 'brandCorner': {'enabled': True, 'position': 'top-right'}}
        self.assertTrue(any('brandCorner.position' in error for error in
                            validate_production_contract(manifest, require_explicit=True)))
        page['brandCorner'] = {'enabled': False}
        self.assertEqual(validate_production_contract(manifest, require_explicit=True), [])


if __name__ == "__main__":
    unittest.main()
