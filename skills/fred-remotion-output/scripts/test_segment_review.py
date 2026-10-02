"""Review UI regressions: provenance, scoped invalidation and unselected suggestions."""
import base64
import hashlib
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path
from build_segment_review import build

PNG = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6l9sAAAAASUVORK5CYII=')


def fixture(folder):
    folder = Path(folder)
    folder.mkdir(parents=True, exist_ok=True)
    for name in ['candidate.png', 'frame.png']:
        (folder / name).write_bytes(PNG)
    (folder / 'preview.mp4').write_bytes(b'fixture-video-v1')
    raw = Path(__file__).with_name('fixtures').joinpath('segment-review.example.json').read_text()
    for name in ['CANDIDATE', 'FRAME']:
        raw = raw.replace('__' + name + '_SHA__', hashlib.sha256(PNG).hexdigest())
    manifest = folder / 'manifest.json'
    manifest.write_text(raw)
    build(manifest, folder / 'index.html')
    return manifest


def review_data(path):
    text = Path(path).read_text()
    return json.loads(re.search(r'<script id="review-data" type="application/json">(.*?)</script>', text, re.S)[1])


class SegmentReviewTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.folder = Path(self.tmp.name)
        self.manifest = fixture(self.folder)
        self.output = self.folder / 'index.html'
        self.data = json.loads(self.manifest.read_text())

    def rebuild(self):
        self.manifest.write_text(json.dumps(self.data, ensure_ascii=False))
        return build(self.manifest, self.output)

    def test_three_views_and_no_suggestion_is_preselected(self):
        entries = review_data(self.output)
        self.assertEqual({x['view'] for x in entries}, {'suggestion', 'keyframes', 'video'})
        suggestion = next(x for x in entries if x['view'] == 'suggestion')
        self.assertEqual(suggestion['assistantRecommendation']['candidateId'], 'option-a')
        self.assertIsNone(suggestion['existingUserSelection'])
        html = self.output.read_text()
        self.assertNotRegex(html.split('<script id=')[0], r'<input[^>]+checked')
        self.assertNotIn('已回填', html)

    def test_changed_image_updates_only_its_artifact_identity(self):
        before = {x['rowId']: x['identity'] for x in review_data(self.output)}
        (self.folder / 'frame.png').write_bytes(PNG + b'new-render')
        self.data['pages'][0]['keyframeReview']['frames'][0]['sha256'] = hashlib.sha256(PNG + b'new-render').hexdigest()
        self.rebuild()
        changed = [x for x in review_data(self.output) if before[x['rowId']] != x['identity']]
        self.assertEqual([(x['stableId'], x['view']) for x in changed], [('scene-one', 'keyframes')])

    def test_hash_mismatch_and_duplicate_frame_ids_fail(self):
        self.data['pages'][0]['keyframeReview']['frames'][0]['sha256'] = '0' * 64
        with self.assertRaisesRegex(ValueError, 'sha256 mismatch'):
            self.rebuild()
        self.data['pages'][0]['keyframeReview']['frames'][0]['sha256'] = hashlib.sha256(PNG).hexdigest()
        self.data['pages'][0]['keyframeReview']['frames'] *= 2
        with self.assertRaisesRegex(ValueError, 'unique ids'):
            self.rebuild()

    def test_other_scene_subtitle_does_not_invalidate_this_scene(self):
        before = {x['rowId']: x['identity'] for x in review_data(self.output)}
        self.data['subtitles']['cues'][1]['text'] = '另一段修改了'
        self.rebuild()
        changed = [x for x in review_data(self.output) if before[x['rowId']] != x['identity']]
        self.assertEqual({x['stableId'] for x in changed}, {'scene-two'})

    def test_current_subtitle_and_video_change_invalidate(self):
        before = {x['rowId']: x['identity'] for x in review_data(self.output)}
        self.data['subtitles']['cues'][0]['text'] = '本段字幕修改了'
        self.rebuild()
        self.assertTrue(all(before[x['rowId']] != x['identity'] for x in review_data(self.output) if x['stableId'] == 'scene-one'))
        before = {x['rowId']: x['identity'] for x in review_data(self.output)}
        (self.folder / 'preview.mp4').write_bytes(b'fixture-video-v2')
        self.rebuild()
        changed = [x['view'] for x in review_data(self.output) if before[x['rowId']] != x['identity']]
        self.assertEqual(set(changed), {'suggestion', 'video'})

    def test_script_and_markup_are_escaped(self):
        self.data['pages'][0]['sourceSpans'][0]['text'] = '</script><script>window.injected=true</script>'
        self.rebuild()
        text = self.output.read_text()
        self.assertNotIn('</script><script>window.injected', text)
        self.assertIn('&lt;/script&gt;', text)
        self.assertEqual(review_data(self.output)[0]['context']['narration'], self.data['pages'][0]['sourceSpans'][0]['text'])

    def test_all_supported_aligned_statuses_have_accurate_labels(self):
        for status, label in [('aligned', '录音对齐时间'), ('audio-aligned', '录音对齐时间'),
                              ('approved-manual', '人工确认时间')]:
            with self.subTest(status=status):
                self.data['timingStatus'] = status
                self.rebuild()
                self.assertIn(label, self.output.read_text())
                self.assertNotIn('时间待核对 / 估时', self.output.read_text())

    def test_explicit_global_offsets_match_display_and_metadata(self):
        for field in ['globalStartFrame', 'globalVoiceStartFrame']:
            with self.subTest(field=field):
                page = self.data['pages'][0]
                page.pop('globalStartFrame', None)
                page.pop('globalVoiceStartFrame', None)
                page[field] = 3600
                page['keyframeReview']['frames'][0]['timeSeconds'] = 61
                self.rebuild()
                self.assertIn('01:00.000—01:05.000', self.output.read_text())
                for record in review_data(self.output):
                    if record['stableId'] == 'scene-one':
                        self.assertEqual(record['context']['startFrame'], 3600)
                        self.assertEqual(record['context']['startSeconds'], 60)
                        self.assertEqual(record['context']['endSeconds'], 65)

    def test_scene_local_without_global_anchor_is_unmapped(self):
        self.data['clockContract'] = {'mode': 'scene-local'}
        self.rebuild()
        self.assertIn('全片时间待映射', self.output.read_text())
        for record in review_data(self.output):
            self.assertEqual(record['context']['timeMapping'], 'unmapped')
            self.assertIsNone(record['context']['startFrame'])
            self.assertIsNone(record['context']['startSeconds'])
            if record['view'] == 'keyframes' and record['artifact']['available']:
                self.assertIsNone(record['artifact']['timeSeconds'])
                self.assertEqual(record['artifact']['declaredTimeSeconds'], 1)


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--write-fixture':
        print(fixture(sys.argv[2]))
    else:
        unittest.main()
