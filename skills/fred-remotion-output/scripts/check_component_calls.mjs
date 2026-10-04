// Parse source without running it. Explicit invocation is not proof of visible output.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const require=createRequire(import.meta.url);
const ts=require(path.join(input.root,'apps/library/node_modules/typescript'));
const results=[];
for(const request of input.requests){
 const source=ts.createSourceFile(request.path,fs.readFileSync(request.path,'utf8'),ts.ScriptTarget.Latest,true,
   /\.[jt]sx$/.test(request.path)?ts.ScriptKind.TSX:ts.ScriptKind.TS);
 const definitions=[],uses=[];
 function owner(node){
  for(let p=node.parent;p;p=p.parent){
   if(ts.isFunctionDeclaration(p)&&p.name)return p.name.text;
   if(ts.isArrowFunction(p)||ts.isFunctionExpression(p)){
    if(p.parent&&ts.isVariableDeclaration(p.parent))return p.parent.name.getText(source);
    if(p.name)return p.name.text;
   }
  }
  return null;
 }
 function visit(node){
  if((ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node))&&node.name?.text===request.symbol)
   definitions.push(node.name.getStart(source));
  if(ts.isVariableDeclaration(node)&&node.name.getText(source)===request.symbol)
   definitions.push(node.name.getStart(source));
  let callee=null,kind=null;
  if(ts.isJsxSelfClosingElement(node)||ts.isJsxOpeningElement(node)){callee=node.tagName.getText(source);kind='jsx';}
  if(ts.isCallExpression(node)){callee=node.expression.getText(source);kind='call';}
  if(ts.isJsxAttribute(node)&&node.name.getText(source)==='component'&&node.initializer&&
      ts.isJsxExpression(node.initializer)&&node.initializer.expression){
    callee=node.initializer.expression.getText(source);kind='composition-component';
  }
  if(callee===request.symbol){
   const pos=source.getLineAndCharacterOfPosition(node.getStart(source));
   uses.push({kind,owner:owner(node),line:pos.line+1});
  }
  ts.forEachChild(node,visit);
 }
 visit(source);
 results.push({path:request.path,symbol:request.symbol,definitions,uses,
   parseErrors:source.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' '))});
}
process.stdout.write(JSON.stringify(results));
