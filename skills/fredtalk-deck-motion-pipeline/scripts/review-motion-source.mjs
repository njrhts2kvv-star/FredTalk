import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

// A keyword scan is a risk signal, not a substitute for inspecting a bounded motion.
export function reviewMotionSources(files,sourceDir,reviews=[], {enforceVisualDefaults=true}={}){
 const failures=[],allowed=new Map();
 const rules=new Set(['dynamic-opacity','fade-helper']);
 for(const review of reviews){
  const file=path.resolve(sourceDir,review.file??'');
  if(!files.includes(file)||!review.reason?.trim()||!review.evidence?.trim()||!Array.isArray(review.rules)||!review.rules.length||review.rules.some(r=>!rules.has(r))||!Array.isArray(review.frameRange)||review.frameRange.length!==2||!review.frameRange.every(Number.isInteger)||review.frameRange[0]<0||review.frameRange[1]<=review.frameRange[0]){
   failures.push('Motion source review needs an indexed file, exact rules, frame range, reason and review evidence');continue;
  }
  const checksum='sha256:'+createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(review.checksum!==checksum){failures.push(`${file}: stale motion source review checksum`);continue;}
  allowed.set(file,new Set([...(allowed.get(file)??[]),...review.rules]));
 }
 for(const file of files){
  const code=fs.readFileSync(file,'utf8'),accept=allowed.get(file)??new Set();
  if(enforceVisualDefaults&&/opacity\s*:\s*(?![01](?:\.\d+)?\b|\.\d+\b)[A-Za-z_$({]/.test(code)&&!accept.has('dynamic-opacity'))failures.push(`${file}: dynamic raw opacity needs a bounded motion source review; do not use default whole-page fades`);
  if(enforceVisualDefaults&&/\b(?:fadeIn|fadeOut|defaultFade|slowFade)\b/i.test(code)&&!accept.has('fade-helper'))failures.push(`${file}: fade helper needs a bounded motion source review`);
  if(/(?:export\s+)?(?:const|let)\s+(?:pages|deckPages|pageData|slides|previews)\b[^=]*=\s*\[/.test(code))failures.push(`${file}: handwritten page-like registry creates a second page fact source`);
 }
 return failures;
}
