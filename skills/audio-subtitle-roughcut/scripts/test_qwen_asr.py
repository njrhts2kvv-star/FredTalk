import argparse
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch, MagicMock
import qwen_asr as q

RAW={'transcripts':[{'sentences':[{'begin_time':100,'end_time':900,'text':'第二，这里啊',
    'words':[{'begin_time':100,'end_time':300,'text':'第二'},{'begin_time':300,'end_time':900,'text':'这里啊'}]}]}]}

class QwenTests(unittest.TestCase):
    def test_export_preserves_raw_text(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);q.export_result(RAW,root)
            self.assertIn('第二，这里啊',(root/'source-asr.srt').read_text())
            self.assertEqual(len(json.loads((root/'word-timestamps.json').read_text())),2)
    def test_invalid_word_bounds(self):
        raw=json.loads(json.dumps(RAW));raw['transcripts'][0]['sentences'][0]['words'][0]['begin_time']=0
        with tempfile.TemporaryDirectory() as d:
            with self.assertRaises(ValueError):q.export_result(raw,Path(d))
    def test_key_permissions(self):
        with tempfile.TemporaryDirectory() as d:
            p=Path(d)/'private/key'
            with patch.object(q,'KEY_PATH',p),patch.object(q.getpass,'getpass',return_value='test-only-placeholder'):
                q.configure();self.assertEqual(q.credential(),'test-only-placeholder')
                self.assertEqual(p.stat().st_mode&0o777,0o600)
                self.assertEqual(p.parent.stat().st_mode&0o777,0o700)
    def setup_job(self,root,status,task=None):
        src=root/'input.wav';src.write_bytes(b'test-source')
        state=dict(model=q.MODEL,sourceHash=q.digest(src),status=status)
        if task:state['task_id']=task
        q.write_json(root/'asr-state.json',state)
        return argparse.Namespace(audio=src,output=root,polls=1,interval=0)
    def test_ambiguous_submit_stops(self):
        with tempfile.TemporaryDirectory() as d:
            args=self.setup_job(Path(d),'submitting')
            with patch.object(q,'credential',side_effect=AssertionError('must not read key')):
                with self.assertRaisesRegex(ValueError,'unknown'):q.execute(args)
    def test_completed_is_offline(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);args=self.setup_job(root,'complete');q.write_json(root/'raw-asr.json',RAW)
            with patch.object(q,'credential',side_effect=AssertionError('must not read key')):q.execute(args)
    def test_resume_never_posts(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);args=self.setup_job(root,'RUNNING','saved-task')
            session=MagicMock()
            result={'output':{'task_status':'SUCCEEDED','results':[{'subtask_status':'SUCCEEDED','transcription_url':'https://example.test/result'}]}}
            responses=[]
            for data in [result,dict(RAW,file_url='temporary-signed-url')]:
                response=MagicMock();response.ok=True;response.json.return_value=data;responses.append(response)
            session.get.side_effect=responses
            with patch('requests.Session',return_value=session),patch.object(q,'credential',return_value='test-only-placeholder'):
                q.execute(args)
            session.post.assert_not_called()
            self.assertNotIn('file_url',json.loads((root/'raw-asr.json').read_text()))
            self.assertEqual(json.loads((root/'asr-state.json').read_text())['status'],'complete')

if __name__=='__main__':unittest.main()
