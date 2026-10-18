import unittest

import readability_audit as ra


def box(x, y, w, h, conf=0.9, text="abc"):
    return {"x": x, "y": y, "w": w, "h": h, "conf": conf, "text": text}


def wall(n, h=15):
    return [box(100, 100 + i * 30, 600, h) for i in range(n)]


class UsableBoxes(unittest.TestCase):
    def test_subtitle_band_badge_and_low_conf_dropped(self):
        boxes = [box(700, 980, 500, 50),            # subtitle band (center y > 918)
                 box(1600, 40, 200, 40),            # corner badge
                 box(100, 100, 300, 30, conf=0.1),  # noise
                 box(100, 200, 300, 30, text=" "),  # empty
                 box(100, 300, 300, 30)]
        kept = ra.usable_boxes(boxes, 1920)
        self.assertEqual(len(kept), 1)
        self.assertEqual(kept[0]["y"], 300)

    def test_badge_zone_scales_with_width(self):
        # same normalised position at 3840 width
        self.assertEqual(ra.usable_boxes([box(3300, 40, 400, 40)], 3840), [])


class FrameJudgement(unittest.TestCase):
    def test_wall_of_tiny_text_unreadable(self):
        n, mx, share = ra.frame_stats(wall(20))
        self.assertTrue(ra.is_unreadable(n, share))
        self.assertEqual(mx, 15)

    def test_small_chip_does_not_rescue_wall(self):
        boxes = wall(20) + [box(100, 50, 300, 31)]
        n, _, share = ra.frame_stats(boxes)
        self.assertTrue(ra.is_unreadable(n, share))

    def test_big_capsule_rescues_busy_background(self):
        boxes = wall(12) + [box(300, 400, 1200, 160)]
        n, _, share = ra.frame_stats(boxes)
        self.assertFalse(ra.is_unreadable(n, share))

    def test_sparse_frame_not_flagged(self):
        n, _, share = ra.frame_stats(wall(3))
        self.assertFalse(ra.is_unreadable(n, share))

    def test_large_text_page_ok(self):
        n, _, share = ra.frame_stats(wall(15, h=40))
        self.assertFalse(ra.is_unreadable(n, share))

    def test_empty_frame(self):
        self.assertEqual(ra.frame_stats([]), (0, 0.0, 1.0))


class RunMerging(unittest.TestCase):
    def stats(self, n):
        return [(10 + i, 20.0 + i, 0.1) for i in range(n)]

    def kinds(self, flags):
        return [(f.kind, f.start, f.end) for f in ra.merge_runs(flags, self.stats(len(flags)), name="S")]

    def test_three_seconds_blocks(self):
        self.assertEqual(self.kinds([False, True, True, True, False]), [("block", 1.0, 4.0)])

    def test_two_seconds_warns(self):
        self.assertEqual(self.kinds([True, True, False]), [("warn", 0.0, 2.0)])

    def test_single_second_ignored(self):
        self.assertEqual(self.kinds([False, True, False, True, False]), [])

    def test_two_runs_and_end_of_video(self):
        self.assertEqual(self.kinds([True, True, False, True, True, True, True]),
                         [("warn", 0.0, 2.0), ("block", 3.0, 7.0)])

    def test_summary_uses_run_samples(self):
        f = ra.merge_runs([False, True, True, True], self.stats(4), name="S")[0]
        self.assertEqual((f.maxHeight, f.boxes, f.duration), (23.0, 13, 3.0))


class Allow(unittest.TestCase):
    def test_allow_window_and_whole_segment(self):
        f = ra.Finding("S02", "block", 1.0, 4.0, 20.0, 9)
        self.assertTrue(ra.is_allowed(f, ra.parse_allow(["S02"])))
        self.assertTrue(ra.is_allowed(f, ra.parse_allow(["S02:0-5"])))
        self.assertFalse(ra.is_allowed(f, ra.parse_allow(["S02:0-3"])))
        self.assertFalse(ra.is_allowed(f, ra.parse_allow(["S03"])))


if __name__ == "__main__":
    unittest.main()
