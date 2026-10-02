#!/usr/bin/env node
import {loadLibrary,selectEntries,resolvedEntry,historicalDecisions} from './motion-library.mjs';
import fs from 'node:fs';
import path from 'node:path';
const args=process.argv.slice(2);const value=k=>{const i=args.indexOf(k);return i<0?undefined:args[i+1];};
if(args.includes('--help')) {console.log('Usage: list-approved-styles.mjs [--id <exact-referenceId|approvalId|A01>] [--query <text>] [--topology <grammar>] [--kind <source-composition|hybrid-composition|media-dependency>] [--status current|historical|all] [--library <path>]');process.exit(0);}
try {
  const {root,manifest,ledger}=loadLibrary(value('--library'));
  const preferencePath=path.resolve(root,'../../../fred-remake/assets/preferred-motion/catalog.json');
  let preference=null;
  if(!value('--library') && !args.includes('--ignore-preferences') && fs.existsSync(preferencePath)) {
    preference=JSON.parse(fs.readFileSync(preferencePath,'utf8'));
    if(fs.existsSync(preference.selectionFile) && JSON.parse(fs.readFileSync(preference.selectionFile,'utf8')).revision!==preference.selectionRevision) throw Error('Picker selection changed; refresh preferred-motion catalogue before selection.');
  }
  const decisions=new Map((preference?.components??[]).map(e=>[e.id,e.status]));
  const entries=selectEntries(manifest,{id:value('--id'),query:value('--query'),kind:value('--kind'),group:value('--group'),topology:value('--topology')??value('--layout'),status:value('--status')})
    .filter(e=>!preference || (value('--status')??'current')!=='current' || decisions.get(e.referenceId)==='keep')
    .map(e=>({...resolvedEntry(root,e),...(preference?{currentPreference:decisions.get(e.referenceId)??'not-in-latest-selection'}:{})}));
  const history=['historical','all'].includes(value('--status'))?historicalDecisions(ledger,{id:value('--id'),query:value('--query')}):[];
  console.log(JSON.stringify({count:entries.length,entries,...(preference?{preferenceRevision:preference.selectionRevision,completePreferredCatalogue:'python3 skills/fred-remake/scripts/query-preferred-motion.py'}:{}),...(history.length||value('--status')==='historical'?{historicalCount:history.length,historicalDecisions:history}:{})},null,2));
  if(value('--id') && value('--status')!=='historical' && entries.length!==1) {console.error('Exact reference selection must resolve to one source version.');process.exitCode=1;}
} catch(e){console.error(e.message);process.exitCode=1;}
