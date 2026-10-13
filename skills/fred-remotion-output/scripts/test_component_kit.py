import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from common import project_root
from component_kit import (KIT_REL, add_component, cloud_script, preview_page, lint_component, lint_project, new_project, registry_rows,
                           split_id, validate_intake)

ROOT = project_root(Path(__file__).resolve().parents[3])
FRED_NATIVE = ROOT / 'skills/fred-remotion-output/assets/reference-code/fred-native-16-20261012/source'

GOOD = """import React from 'react';
import { S, p } from '../kit/theme';
import { Frame, Sfx, textBase, useT } from '../kit/ui';
export type GoodProps = { label: string };
export const goodDefaults: GoodProps = {
  label: '第一部分',
};
export function Good(props: Partial<GoodProps>) {
  const t = useT();
  return <Frame><div style={{ ...textBase(96), color: S.accent, opacity: p(t, 0, 1) }}>{props.label}</div><Sfx name="pop" at={0.2} /></Frame>;
}
"""


class ComponentKitTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.project = Path(cls.tmp.name) / 'proj'
        new_project(ROOT, cls.project)
        add_component(ROOT, cls.project, 'T99a-SampleThing', '示例：结论落定', '材料 → 一句结论', '一句话观点')

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def write(self, name, text):
        path = self.project / 'src/components' / name
        path.write_text(text)
        self.addCleanup(path.unlink)
        return path

    def test_scaffold_has_locked_kit_and_base_assets(self):
        lock = json.loads((ROOT / KIT_REL / 'kit.lock.json').read_text())
        for name in lock['files']:
            self.assertTrue((self.project / 'src/kit' / name).is_file())
        for sub in ['fonts/MiSans-Heavy.otf', 'fonts/RuiZi.ttf', 'brand/light.png', 'sfx/pop.wav']:
            self.assertTrue((self.project / 'public' / sub).is_file(), sub)
        self.assertTrue((self.project / 'qc/BRIEF.md').is_file())

    def test_add_registers_component_with_change(self):
        rows = registry_rows(self.project)
        self.assertEqual(rows[0]['id'], 'T99a-SampleThing')
        self.assertEqual(rows[0]['change'], '材料 → 一句结论')
        self.assertEqual(lint_project(ROOT, self.project)['status'], 'PASS')

    def test_add_requires_change_and_known_scene(self):
        with self.assertRaises(ValueError):
            add_component(ROOT, self.project, 'T99b-X', 't', '  ', '对比')
        with self.assertRaises(ValueError):
            add_component(ROOT, self.project, 'T99b-X', 't', '旧 → 新', '随便')
        with self.assertRaises(ValueError):
            split_id('bad_id')

    def test_lint_accepts_rule_following_component(self):
        errors, warnings = lint_component(self.write('Good.tsx', GOOD), self.project / 'public')
        self.assertEqual(errors, [])
        self.assertEqual(warnings, [])

    def test_lint_flags_rule_breaks(self):
        bad = (GOOD.replace("import { S, p } from '../kit/theme';", "import { spring } from 'remotion';\nimport { S, p } from '../kit/theme';")
               .replace('color: S.accent', "color: '#1e90ff', fontFamily: 'Arial', border: '2px solid #ddd'")
               .replace('<Sfx name="pop" at={0.2} />', '<Sfx name="boom" at={0.2} volume={0.9} />')
               .replace("label: '第一部分'", "label: 'PART ONE'"))
        errors, warnings = lint_component(self.write('Bad.tsx', bad), self.project / 'public')
        text = '\n'.join(errors + warnings)
        for needle in ['spring', 'Arial', '#1e90ff', '描边', 'boom', '0.9', 'PART ONE']:
            self.assertIn(needle, text)

    def test_lint_detects_modified_kit(self):
        theme = self.project / 'src/kit/theme.ts'
        original = theme.read_text()
        theme.write_text(original.replace("radius: 24", "radius: 30"))
        try:
            result = lint_project(ROOT, self.project)
            self.assertEqual(result['status'], 'FAIL')
            self.assertTrue(any('src/kit' in e for e in result['errors']))
        finally:
            theme.write_text(original)

    def test_accepted_library_components_pass_lint(self):
        result = lint_project(ROOT, FRED_NATIVE)
        self.assertEqual(result['status'], 'PASS', result['errors'])
        self.assertTrue(any('旧版 v1' in w for w in result['warnings']))
        self.assertEqual(result['components'], 16)

    def test_intake_validation_blocks_taken_labels_and_missing_meta(self):
        errors = validate_intake(ROOT, FRED_NATIVE, 'fred-native-16-20261012', ['T05c-RewriteLine'], {}, FRED_NATIVE.parent / 'previews')
        text = '\n'.join(errors)
        self.assertIn('集合目录已存在', text)
        self.assertIn('T05c 已被组件库占用', text)
        self.assertIn('meta 里没有登记信息', text)

    def test_intake_validation_checks_enum_values(self):
        meta = {'T99a-SampleThing': {'sceneTypes': ['nope'], 'useIds': ['explain'], 'conceptIds': ['text'], 'primaryUse': 'explain',
                                     'scenarioId': 'headline', 'inputObjects': ['一句话'], 'tags': ['结论']}}
        errors = validate_intake(ROOT, self.project, 'sample-kit-20991231', ['T99a-SampleThing'], meta, self.project)
        text = '\n'.join(errors)
        self.assertIn('sceneTypes', text)
        self.assertIn('缺少认可成片', text)
        self.assertNotIn('scenarioId 无效', text)

    def test_intake_end_to_end_in_sandbox(self):
        """在复制出来的登记表上跑完整入库，不碰真实组件库。"""
        sandbox = Path(self.tmp.name) / 'root'
        skill = 'skills/fred-remotion-output/'
        for rel in [skill + 'assets/dependency-registry.json', skill + 'assets/episode-code-inventory.json',
                    skill + 'references/visual-usage-registry.json', skill + 'references/scene-routing.json',
                    skill + 'verification/source-registrations.json', 'skills/fred-remake/assets/preferred-motion/catalog.json']:
            (sandbox / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(ROOT / rel, sandbox / rel)
        shutil.copytree(ROOT / KIT_REL, sandbox / KIT_REL)
        (sandbox / (skill + 'assets/reference-code')).mkdir(parents=True)
        (sandbox / (skill + 'assets/reference-archives')).mkdir(parents=True)
        renders = Path(self.tmp.name) / 'renders'
        renders.mkdir()
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i', 'color=white:s=1920x1080:r=60:d=1', '-c:v', 'libx264',
                        '-pix_fmt', 'yuv420p', str(renders / 'T99a-SampleThing.mp4')], check=True)
        meta = {'T99a-SampleThing': {'sceneTypes': ['summary'], 'useIds': ['explain'], 'conceptIds': ['summary'], 'primaryUse': 'explain',
                                     'scenarioId': 'headline', 'inputObjects': ['一句结论'], 'tags': ['结论']}}
        from component_kit import intake, sha
        result = intake(sandbox, self.project, 'sample-kit-20991231', ['T99a-SampleThing'], [], '测试原话', meta, renders, '测试集合',
                        supersede={'T99a-SampleThing': 'X003'})
        self.assertEqual(result['components'], 1)
        reg = json.loads((sandbox / skill / 'assets/dependency-registry.json').read_text())
        catalog = sandbox / 'skills/fred-remake/assets/preferred-motion/catalog.json'
        self.assertEqual(reg['selectionCatalogSha256'], sha(catalog))
        self.assertEqual(reg['inventorySha256'], sha(sandbox / skill / 'assets/episode-code-inventory.json'))
        self.assertEqual(reg['registrationReceipt']['sha256'], sha(sandbox / skill / 'verification/source-registrations.json'))
        item = json.loads(catalog.read_text())['components'][-1]
        self.assertEqual((item['displayLabel'], item['compositionId'], item['media']['fps']), ('T99a', 'T99a-SampleThing', 60))
        self.assertEqual(len(item['coreFrames']), 3)
        usage = json.loads((sandbox / skill / 'references/visual-usage-registry.json').read_text())
        self.assertEqual(usage['entries']['T99a']['scenarioTitle'], '强调一句话')
        inv = {f['path'] for f in json.loads((sandbox / skill / 'assets/episode-code-inventory.json').read_text())['files']}
        pack = sandbox / skill / 'assets/reference-code/sample-kit-20991231'
        for p in pack.rglob('*'):
            if p.is_file():
                self.assertIn(str(p.relative_to(sandbox)), inv)
        self.assertFalse((pack / 'source/src/components/Good.tsx').exists())
        old = next(c for c in json.loads(catalog.read_text())['components'] if c.get('displayLabel') == 'X003')
        self.assertEqual((old['defaultReuse'], old['supersededBy']), (False, 'sample-kit-t99a'))
        self.assertEqual(usage['archivedReferences']['X003']['duplicateOf'], 'T99a')
    def test_cloud_script_pins_ids_and_preview_lists_renders(self):
        script = cloud_script(self.project)
        text = script.read_text()
        self.assertIn('IDS="T99a-SampleThing"', text)
        self.assertIn('remotion browser ensure', text)
        with self.assertRaises(ValueError):
            cloud_script(self.project, ['Nope-Missing'])
        renders = Path(self.tmp.name) / 'pv'
        renders.mkdir(exist_ok=True)
        (renders / 'T99a-SampleThing.mp4').write_bytes(b'')
        page = preview_page(self.project, renders).read_text()
        self.assertIn('T99a-SampleThing', page)
        self.assertIn('材料 → 一句结论', page)


if __name__ == '__main__':
    unittest.main()
