import tempfile
import unittest
from pathlib import Path

from lint_remotion_clock import lint


class ClockLintTests(unittest.TestCase):
    def test_unsafe_global_clock_and_zero_sequence_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "index.tsx"; path.write_text("const t = f / FPS;\n<Sequence from={0}>x</Sequence>")
            errors, _ = lint(path)
            self.assertTrue(any("Sequence from" in error for error in errors)); self.assertTrue(any("frame / FPS" in error for error in errors))

    def test_scene_local_clock_passes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "index.tsx"; path.write_text("const localFrame = frame - scene.startFrame;\n<Sequence from={scene.startFrame}>x</Sequence>")
            self.assertEqual(lint(path), ([], []))


if __name__ == "__main__":
    unittest.main()
