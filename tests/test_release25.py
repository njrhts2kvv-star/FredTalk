"""Access boundaries for the actual 2.5 publication catalog."""
from datetime import datetime
import hashlib
import json
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
FRESH = {'episode-scenes-112-125-20261018': 47,
         'fred-recording-8-20261018': 8,
         'fred-chapter-transitions-wave2-20261014': 9}

class Release25Tests(unittest.TestCase):
    def setUp(self):
        self.catalog = json.loads((ROOT / 'library/catalog.json').read_text())
        self.routes = json.loads((ROOT / 'library/routes.json').read_text())

    def test_32_revisions_are_public_and_source_bytes_are_present(self):
        revisions = [i for i in self.catalog['items'] if i.get('collectionId') == 'fred-legacy-fix-20261018']
        self.assertEqual(len(revisions), 32)
        for item in revisions:
            self.assertEqual(item['access'], 'public')
            self.assertFalse(item.get('earlyAccess', {}).get('enabled'))
            self.assertTrue(item['projectDownload']['url'].startswith('https://www.fred-fu.com/visual-library-app/objects/'))
            self.assertTrue(item['originalDownload']['url'].startswith('https://www.fred-fu.com/visual-library-app/objects/'))
            for source in item['sources']:
                path = ROOT / self.routes[source['url']]
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), source['sha256'])

    def test_64_new_records_share_an_exact_14_day_exclusive_window(self):
        packages = {p['collectionId']: p for p in json.loads((ROOT / 'library/member-packages.json').read_text())['collections']}
        windows = set()
        for collection, count in FRESH.items():
            items = [i for i in self.catalog['items'] if i.get('collectionId') == collection]
            self.assertEqual(len(items), count)
            for item in items:
                policy = item['earlyAccess']
                self.assertEqual(policy, packages[collection]['earlyAccess'])
                self.assertEqual(policy['requiredMembershipLevels'], ['exclusive_group'])
                start = datetime.fromisoformat(policy['startsAt'].replace('Z', '+00:00'))
                end = datetime.fromisoformat(policy['publicAt'].replace('Z', '+00:00'))
                self.assertEqual((end - start).total_seconds(), 14 * 86400)
                windows.add((start, end))
                self.assertFalse((ROOT / 'components/projects' / collection).exists())
                self.assertTrue(all(s['url'].startswith('/api/visual-library/assets/') and not s['available'] for s in item['sources']))
        self.assertEqual(len(windows), 1)

    def test_older_release_dates_are_preserved(self):
        for item in self.catalog['items']:
            col = item.get('collectionId')
            if col == 'fred-chapter-transitions-20-20261014':
                self.assertEqual(item['earlyAccess']['publicAt'], '2026-10-28T00:59:11Z')
            elif col in {'fred-native-16-20261012', 'fred-wave2-42-20261012', 'fred-wave2-fix5-20261012',
                         'fred-wave3-40-20261012', 'fred-wave3-extra2-20261012'}:
                end = datetime.fromisoformat(item['earlyAccess']['publicAt'].replace('Z', '+00:00'))
                self.assertEqual(end.isoformat(), '2026-10-27T03:15:00+00:00')

if __name__ == '__main__':
    unittest.main()
