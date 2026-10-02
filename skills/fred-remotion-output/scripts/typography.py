#!/usr/bin/env python3
"""Resolve exact local visual-library font faces by responsibility."""
import argparse,json
from pathlib import Path
from common import project_root,digest


def resolve_faces(root, ids=None, role=None):
    data=json.loads((root/'skills/fred-remotion-output/references/typography-registry.json').read_text())
    faces=[]
    for record in data['faces']:
        if ids and record['id'] not in ids or role and record['role']!=role:continue
        item=dict(record);path=root/item['path']
        item['absolutePath']=str(path)
        item['status']='ready' if path.is_file() and digest(path)==item['sha256'] else 'missing-or-changed'
        faces.append(item)
    return {'selectionRule':data['selectionRule'],'faces':faces,'levels':data['levels'],
            'scope':'Exact local font files and observed source roles; sizes remain scene-specific.'}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root');parser.add_argument('--id',action='append')
    parser.add_argument('--role',choices=['body','display','expression','handwriting','code','latin'])
    args=parser.parse_args()
    try:
        result=resolve_faces(project_root(args.project_root),args.id,args.role)
        if args.id and set(args.id)!={f['id'] for f in result['faces']}:raise ValueError('Unknown typography ID')
        print(json.dumps(result,ensure_ascii=False,indent=2))
        if any(f['status']!='ready' for f in result['faces']):parser.exit(1,'Font source missing or changed.\n')
    except (OSError,ValueError) as error:parser.exit(1,str(error)+'\n')

if __name__=='__main__':main()
