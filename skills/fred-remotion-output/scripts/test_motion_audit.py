import unittest

import numpy as np

import motion_audit as m

FPS = 10.0
KW = dict(step_still=0.12, step_slow=0.9, max_hold=2.0, max_slow=1.2,
          max_move=1.4, max_scroll=2.0, cut_step=80.0, name="S", max_hold_block=3.0)


def page(h=m.H, w=m.W, seed=1):
    # smooth blocks (like text lines on a page), not pixel noise
    rng = np.random.default_rng(seed)
    coarse = rng.integers(60, 230, size=(h * 4 // 6 + 1, w // 6 + 1)).astype(np.float32)
    tall = np.kron(coarse, np.ones((6, 6), np.float32))[: h * 4, :w]
    for axis in (0, 1):
        tall = (np.roll(tall, -2, axis) + np.roll(tall, -1, axis) + tall
                + np.roll(tall, 1, axis) + np.roll(tall, 2, axis)) / 5
    return tall


def scroll(seconds, px_per_sample, start=0):
    src = page()
    n = int(seconds * FPS)
    return np.stack([src[start + i * px_per_sample: start + i * px_per_sample + m.H] for i in range(n)])


def hold(frame, seconds):
    return np.repeat(frame[None], int(seconds * FPS), axis=0)


def ease_move(a, b, seconds):
    n = int(seconds * FPS)
    t = (1 - np.cos(np.linspace(0, np.pi, n))) / 2
    return np.stack([a * (1 - k) + b * k for k in t])


class MotionAuditTest(unittest.TestCase):
    def kinds(self, frames):
        return [f.kind for f in m.analyse(frames, FPS, **KW)]

    def test_long_hold_is_reported(self):
        f = page()[: m.H]
        self.assertEqual(self.kinds(hold(f, 3.5)), ["hold"])
        self.assertEqual(self.kinds(hold(f, 2.5)), ["hold-warn"])

    def test_jitter_does_not_break_hold(self):
        f = page()[: m.H]
        frames = np.concatenate([hold(f, 1.8), (f + 0.4)[None], hold(f, 1.8)])
        self.assertEqual(self.kinds(frames), ["hold"])

    def test_reading_pause_passes(self):
        f = page()[: m.H]
        g = page(seed=2)[: m.H]
        frames = np.concatenate([hold(f, 1.5), ease_move(f, g, 0.6), hold(g, 1.5)])
        self.assertEqual(self.kinds(frames), [])

    def test_long_page_scroll_is_reported(self):
        self.assertIn("scroll", self.kinds(scroll(4.0, 3)))

    def test_short_scroll_passes(self):
        f = scroll(1.2, 4)
        frames = np.concatenate([f, hold(f[-1], 1.0)])
        self.assertEqual(self.kinds(frames), [])

    def test_one_slow_push_is_reported(self):
        f = page()[: m.H]
        g = page(seed=3)[: m.H]
        self.assertEqual(self.kinds(ease_move(f, g, 2.5)), ["move"])

    def test_hard_cut_splits_runs(self):
        a = page()[: m.H]
        b = 255 - a
        frames = np.concatenate([ease_move(a, a * 0.9, 1.0), b[None], hold(b, 1.0)])
        self.assertEqual(self.kinds(frames), [])

    def test_allow_window(self):
        allow = m.parse_allow(["S02", "S09:0-6"])
        self.assertTrue(m.is_allowed(m.Finding("S02", "hold", 1, 9, 0, 0), allow))
        self.assertTrue(m.is_allowed(m.Finding("S09", "scroll", 1.5, 6.0, 0, 0), allow))
        self.assertFalse(m.is_allowed(m.Finding("S09", "scroll", 5.0, 8.0, 0, 0), allow))
        self.assertEqual(m.parse_allow(["S11:2"])["S11"], [(2.0, float("inf"))])
        with self.assertRaises(SystemExit):
            m.parse_allow(["S11:a-b"])

    def test_cut_step_not_counted_in_piece(self):
        a = page()[: m.H] * 0.3
        b = 255 - a
        # two quick moves separated by a hard cut: neither piece is a long move
        frames = np.concatenate([ease_move(a, a * 0.8, 0.8), b[None], ease_move(b, b * 0.8, 0.8)])
        self.assertEqual(self.kinds(frames), [])

    def test_subtitle_band_cropped(self):
        frames = np.zeros((3, m.H, m.W), np.float32)
        self.assertEqual(m.crop_picture(frames, 0.13).shape[1], round(m.H * 0.87))


if __name__ == "__main__":
    unittest.main()
