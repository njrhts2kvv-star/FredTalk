import copy
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

import validate_production_gate as gate


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg tools required")
class ProductionGateTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.base = Path(cls.temp.name)
        cls.video = cls.base / "reading.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i",
                        "color=c=white:s=64x36:r=12:d=1", "-c:v", "libx264",
                        "-pix_fmt", "yuv420p", str(cls.video)], check=True)
        cls.audio_video = cls.base / "narrated.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(cls.video), "-f", "lavfi", "-i",
                        "sine=frequency=440:duration=1", "-c:v", "copy", "-c:a", "aac",
                        "-shortest", str(cls.audio_video)], check=True)
        cls.still = cls.base / "frame.png"
        subprocess.run(["ffmpeg", "-v", "error", "-i", str(cls.video),
                        "-frames:v", "1", str(cls.still)], check=True)

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def setUp(self):
        self.case = tempfile.TemporaryDirectory(dir=self.base)
        self.root = Path(self.case.name)
        self.addCleanup(self.case.cleanup)
        self.manifest_path = self.root / "manifest.json"
        self.manifest = {"timelineFps": 12, "durationInFrames": 12, "pages": [
            {"stableId": "reading", "startFrame": 0, "durationInFrames": 12,
             "dynamicContract": {"mode": "stable-reading", "reason": "Read the full sentence"}}]}
        self.write_manifest()
        self.source = self.root / "src"
        self.source.mkdir()
        (self.source / "Scene.tsx").write_text("export const Scene = () => null;\n")

    def write_manifest(self):
        self.manifest_path.write_text(json.dumps(self.manifest))

    def review(self):
        return {"status": "PASS", "manifestSha256": gate._sha(self.manifest_path), "scenes": [{
            "stableId": "reading", "artifactPath": str(self.video),
            "artifactSha256": gate._sha(self.video),
            "reviewRange": {"startSeconds": 0, "endSeconds": 1},
            "checks": {name: True for name in ["normalSpeed", "semanticMatch", "readability",
                       "motionOrStableReading", "handoff"]},
            "observations": [{"check": name, "atSeconds": 0.5,
                "note": "The complete sentence stays readable; the end retains the same document."}
                for name in ["semanticMatch", "readability", "motionOrStableReading", "handoff"]]}]}

    def review_errors(self, value):
        path = self.root / "review.json"
        path.write_text(json.dumps(value))
        return gate._representative_review(self.manifest_path, self.manifest, path)[1]

    def run_stage(self, stage, previous=None, review=None):
        args = SimpleNamespace(stage=stage, manifest=self.manifest_path,
            project_root=str(self.root), source_dir=str(self.source),
            previous_receipt=str(previous) if previous else None,
            review_receipt=str(review) if review else None,
            video=self.video, require_final_timing=False)
        with patch.object(gate, "project_root", return_value=self.root), \
                patch.object(gate, "_planning", return_value=([], [])):
            receipt = gate.run(args)
        path = self.root / (stage + ".json")
        path.write_text(json.dumps(receipt))
        return path, receipt

    def implementation_chain(self):
        planning, _ = self.run_stage("planning")
        return self.run_stage("implementation", planning)

    def representative_chain(self):
        implementation, _ = self.implementation_chain()
        review = self.root / "review.json"
        review.write_text(json.dumps(self.review()))
        return self.run_stage("representative", implementation, review)

    def test_explicit_representatives_cannot_hide_risk_scenes(self):
        manifest = {"representativeScenes": ["first"], "pages": [
            {"stableId": "first"}, {"stableId": "long", "sourceSpans": [{"text": "longest text"}]},
            {"stableId": "new", "implementationMode": "original"},
            {"stableId": "media", "mediaContract": [{"path": "recording.mp4"}]},
            {"stableId": "complex", "motionEvents": [{}, {}, {}]}, {"stableId": "last"}]}
        self.assertEqual(set(gate._required_scenes(manifest)),
                         {"first", "long", "new", "media", "complex", "last"})

    def test_text_file_cannot_be_normal_speed_review(self):
        artifact = self.root / "pretend.mp4"
        artifact.write_text("This is not a video")
        review = self.review()
        review["scenes"][0].update(artifactPath=str(artifact), artifactSha256=gate._sha(artifact))
        self.assertTrue(self.review_errors(review))

    def test_keyframe_review_does_not_replace_video_review(self):
        review = self.review()
        review["keyframeReview"] = review.pop("scenes")
        self.assertTrue(self.review_errors(review))

    def test_real_png_cannot_be_normal_speed_video(self):
        review = self.review()
        review["scenes"][0].update(artifactPath=str(self.still), artifactSha256=gate._sha(self.still))
        self.assertTrue(self.review_errors(review))

    def test_observations_and_timed_full_scene_review_are_required(self):
        for mutate in [lambda item: item.pop("observations"),
                       lambda item: item.pop("reviewRange"),
                       lambda item: item.update(reviewRange={"startSeconds": 0, "endSeconds": 0.1}),
                       lambda item: item.update(reviewRange={"startSeconds": 0, "endSeconds": 20}),
                       lambda item: item["observations"][0].update(atSeconds=20),
                       lambda item: item["observations"][0].update(note="PASS")]:
            with self.subTest(mutate=mutate):
                review = self.review()
                mutate(review["scenes"][0])
                self.assertTrue(self.review_errors(review))

    def test_real_stable_reading_video_is_valid(self):
        self.assertEqual(self.review_errors(self.review()), [])
        self.assertEqual(gate._probe(self.video, self.manifest), [])

    def test_formal_rejects_timeline_duration_and_fps_mismatch(self):
        for key, value in [("durationInFrames", 60), ("timelineFps", 24)]:
            with self.subTest(key=key):
                manifest = copy.deepcopy(self.manifest)
                manifest[key] = value
                self.assertTrue(gate._probe(self.video, manifest))

    def test_only_declared_output_spec_is_enforced(self):
        for spec in [{"width": 1920}, {"height": 1080}, {"fps": 60}, {"audio": "required"}]:
            with self.subTest(spec=spec):
                self.assertTrue(gate._probe(self.video, dict(self.manifest, outputSpec=spec)))
        self.assertEqual(gate._probe(self.video, dict(self.manifest,
            outputSpec={"width": 64, "height": 36, "fps": 12, "audio": "none"})), [])

    def test_full_decode_failure_blocks_formal(self):
        real_run = subprocess.run
        def fail_decode(command, **kwargs):
            if command[0] == "ffmpeg":
                return subprocess.CompletedProcess(command, 1, "", "corrupt decoded frame")
            return real_run(command, **kwargs)
        with patch.object(gate.subprocess, "run", side_effect=fail_decode):
            self.assertTrue(gate._probe(self.video, self.manifest))

    def test_declared_audio_presence_and_absence_are_checked(self):
        self.assertEqual(gate._probe(self.audio_video,
            dict(self.manifest, outputSpec={"audio": "required"})), [])
        self.assertTrue(gate._probe(self.audio_video,
            dict(self.manifest, outputSpec={"audio": "none"})))

    def test_implementation_records_actual_source_directory(self):
        _, receipt = self.implementation_chain()
        self.assertEqual(receipt["sourceDir"], str(self.source.resolve()))

    def test_changed_source_invalidates_representative_and_formal(self):
        representative, _ = self.representative_chain()
        (self.source / "Scene.tsx").write_text("export const Scene = () => 'changed';\n")
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "FAIL")
        self.assertTrue(any("source" in item.lower() for item in receipt["errors"]))

    def test_changed_source_invalidates_representative(self):
        implementation, _ = self.implementation_chain()
        (self.source / "Scene.tsx").write_text("export const Scene = () => 'changed';\n")
        review = self.root / "review.json"
        review.write_text(json.dumps(self.review()))
        _, receipt = self.run_stage("representative", implementation, review)
        self.assertEqual(receipt["status"], "FAIL")

    def test_modified_ancestor_receipt_invalidates_formal(self):
        representative, _ = self.representative_chain()
        planning = self.root / "planning.json"
        value = json.loads(planning.read_text())
        value["status"] = "FAIL"
        planning.write_text(json.dumps(value))
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "FAIL")

    def test_modified_review_receipt_invalidates_formal(self):
        representative, _ = self.representative_chain()
        (self.root / "review.json").write_text("{}")
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "FAIL")

    def test_changed_reviewed_video_invalidates_formal(self):
        implementation, _ = self.implementation_chain()
        artifact = self.root / "reviewed.mp4"
        shutil.copyfile(self.video, artifact)
        review = self.review()
        review["scenes"][0].update(artifactPath=str(artifact), artifactSha256=gate._sha(artifact))
        review_path = self.root / "review.json"
        review_path.write_text(json.dumps(review))
        representative, receipt = self.run_stage("representative", implementation, review_path)
        self.assertEqual(receipt["status"], "PASS", receipt["errors"])
        artifact.write_bytes(b"replaced after review")
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "FAIL")

    def test_valid_chain_preserves_reading_pause(self):
        representative, receipt = self.representative_chain()
        self.assertEqual(receipt["status"], "PASS", receipt["errors"])
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "PASS", receipt["errors"])
        self.assertEqual(receipt["dynamicScan"]["scenes"][0]["status"], "SKIP")

    def test_new_workflow_checks_keyframes_in_representative_gate(self):
        self.manifest["workflow"] = {"profile": "fred-video-v2"}
        self.manifest["pages"][0].update(
            productionRoute={"selected": "remotion", "source": "Current user selection"},
            storyboardReview={"status": "confirmed", "confirmedSource": "Current direction selection",
                              "directionNote": "Keep the selected document motion"})
        self.write_manifest()
        _, receipt = self.representative_chain()
        self.assertEqual(receipt["status"], "FAIL")
        self.assertTrue(any("keyframe" in error.lower() for error in receipt["errors"]))

    def test_current_direct_output_keeps_internal_checks_without_extra_user_wait(self):
        self.manifest["workflow"] = {"profile": "fred-video-v2", "authorization": {
            "mode": "direct-output", "source": "Current user explicitly asks for direct output"}}
        self.write_manifest()
        representative, receipt = self.representative_chain()
        self.assertEqual(receipt["status"], "PASS", receipt["errors"])
        _, receipt = self.run_stage("formal", representative)
        self.assertEqual(receipt["status"], "PASS", receipt["errors"])


if __name__ == "__main__":
    unittest.main()
