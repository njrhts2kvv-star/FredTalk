const fs=require('fs'),path=require('path'),os=require('os'),{createRequire}=require('module');
const root=__dirname,runtime=process.env.COMPONENT_RUNTIME||root;
const req=createRequire(path.join(runtime,'package.json'));if(req('remotion/package.json').version!=='4.0.519'||req('react/package.json').version!=='19.2.3')throw new Error('Locked runtime mismatch');
const {bundle}=req('@remotion/bundler'),{getCompositions,renderStill,renderMedia,openBrowser}=req('@remotion/renderer');
const command=process.argv[2]||'list',wanted=process.argv[3],output=process.argv[4];const work=fs.mkdtempSync(path.join(os.tmpdir(),'fred-matchcut-'));
(async()=>{const aliases=Object.fromEntries(['react','react-dom','remotion','react/jsx-runtime','react/jsx-dev-runtime'].map(n=>[n+'$',req.resolve(n)]));
 const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),outDir:path.join(work,'build'),webpackOverride:c=>({...c,resolve:{...c.resolve,modules:[path.join(runtime,'node_modules'),...(c.resolve.modules||[])],alias:{...c.resolve.alias,...aliases}}})});
 const browser=await openBrowser('chrome',{...(process.env.CHROME_PATH?{browserExecutable:process.env.CHROME_PATH}:{})});
 try{let comps=await getCompositions(serveUrl,{puppeteerInstance:browser});if(wanted)comps=comps.filter(c=>c.id===wanted);if(!comps.length)throw new Error('Unknown component');
 if(command==='list'){console.log(comps.map(c=>({id:c.id,fps:c.fps,width:c.width,height:c.height,frames:c.durationInFrames})));return;}
 for(const c of comps){
  if(command==='stills'){if(!output)throw new Error('Output directory required');fs.mkdirSync(output,{recursive:true});for(const frame of [0,14,30,47])await renderStill({serveUrl,composition:c,frame,output:path.join(output,`${c.id}-${frame}.png`),imageFormat:'png',puppeteerInstance:browser});console.log('Stills '+c.id);}
  else if(command==='render'){if(!output)throw new Error('Output file required');await renderMedia({serveUrl,composition:c,outputLocation:output,codec:'h264',crf:17,concurrency:1,puppeteerInstance:browser});console.log('Rendered '+c.id);}
 }
 }finally{await browser.close({silent:true});fs.rmSync(work,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1;});
