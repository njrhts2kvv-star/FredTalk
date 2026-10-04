const fs=require('fs'),vm=require('vm');const esbuild=require('../apps/library/node_modules/esbuild');const root=require('path').resolve(__dirname, '..');const policy=JSON.parse(fs.readFileSync(root+'/library/material-policy.json'));let checks=0;
(async()=>{for(const [project,mapping] of Object.entries(policy.projects)){
 const b=await esbuild.build({entryPoints:[`${root}/components/projects/${project}/material-policy.tsx`],bundle:true,write:false,packages:'external',platform:'node',format:'cjs',logLevel:'silent'});
 const sandbox={module:{exports:{}},exports:{},require:(name)=>name==='remotion'?{staticFile:x=>'/'+x}:name==='react'?{}:{jsx:()=>null}};
 vm.runInNewContext(b.outputFiles[0].text,sandbox);const resolve=sandbox.module.exports.resolveMaterial;
 for(const [old,replacement] of Object.entries(mapping)){
  if(resolve(old)!==replacement)throw Error(`Unmapped ${old}`);
  if(!fs.existsSync(`${root}/${policy.publicRoots[project][0]}/${replacement}`))throw Error(`Missing ${replacement}`);checks++;
 }
 if(resolve('fred/host.webm')!=='fred/host.webm')throw Error('Unrelated media changed');
 let blocked=false;try{resolve('audio/SP001.m4a')}catch{blocked=true}if(!blocked)throw Error('Source audio allowed');checks++;
 if(['46d3ccc7f02f','bf97a4a22921'].includes(project)){
  if(resolve('code-revision/SP006/9999.png')!=='approved-materials/demo-phone.svg')throw Error('Native frame fallback bypass');checks++;
 }
}
console.log(`PASS ${checks} resolver/payload/audio checks`);})();
