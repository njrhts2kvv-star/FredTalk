const fs=require('fs'),path=require('path'),os=require('os'),{createRequire}=require('module');
const root=__dirname,runtime=root;
const req=createRequire(path.join(runtime,'package.json'));if(req('remotion/package.json').version!=='4.0.519'||req('react/package.json').version!=='19.2.3')throw new Error('Locked runtime mismatch');
const {bundle}=req('@remotion/bundler'),{getCompositions,renderStill,renderMedia,openBrowser}=req('@remotion/renderer');
for(const name of ['qc','outputs'])fs.mkdirSync(path.join(root,name),{recursive:true});
const command=process.argv[2]||'list',wanted=process.argv[3];
(async()=>{const aliases=Object.fromEntries(['react','react-dom','remotion','react/jsx-runtime','react/jsx-dev-runtime'].map(n=>[n+'$',req.resolve(n)]));
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(root,'build'),webpackOverride:c=>({...c,resolve:{...c.resolve,modules:[path.join(runtime,'node_modules'),...(c.resolve.modules||[])],alias:{...c.resolve.alias,...aliases}}})});
 const browser=await openBrowser('chrome',{...(process.env.CHROME_PATH?{browserExecutable:process.env.CHROME_PATH}:{})});
 try{let comps=await getCompositions(serveUrl,{puppeteerInstance:browser});if(wanted)comps=comps.filter(c=>c.id===wanted);if(!comps.length)throw new Error('Unknown component');
 if(command==='list'){console.log(comps.map(c=>({id:c.id,fps:c.fps,width:c.width,height:c.height,frames:c.durationInFrames})));return;}
 for(const c of comps){
  if(command==='stills'){const frames=c.id==='Codex-EP109'?[0,201,473,669,848]:[0,90,150,180,240,Math.min(360,c.durationInFrames-1),c.durationInFrames-1];for(const frame of frames)await renderStill({serveUrl,composition:c,frame,output:path.join(root,'qc',`${c.id}-${frame}.png`),imageFormat:'png',puppeteerInstance:browser});console.log('Stills '+c.id);}
  else if(command==='render'){console.log('Rendering '+c.id);await renderMedia({serveUrl,composition:c,outputLocation:path.join(root,'outputs',c.id+'.mp4'),codec:'h264',crf:18,concurrency:1,muted:!c.id.startsWith('WeChat'),puppeteerInstance:browser});if(c.id==='Codex-EP109')require('child_process').execFileSync('python3',[path.join(root,'mix_codex.py'),'--refresh-render'],{stdio:'inherit'});console.log('Rendered '+c.id);}
 }
 }finally{await browser.close({silent:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
