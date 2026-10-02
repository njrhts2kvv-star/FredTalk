import React from 'react';
import {AbsoluteFill,Composition,registerRoot,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import manifest from '../manifest.json';
import {resolveComponent} from './registry';
const handle=delayRender('Load local Fred fonts before measuring source layout');
const fontsReady=Promise.all([['Medium','500'],['Semibold','600']].map(async([file,weight])=>{
 const face=new FontFace('FredMiSans',`url("${staticFile(`fonts/MiSans-${file}.otf`)}")`,{weight});await face.load();(document.fonts as FontFaceSet & {add(f:FontFace):void}).add(face); const alias=new FontFace('MiSans',`url("${staticFile(`fonts/MiSans-${file}.otf`)}")`,{weight}); await alias.load(); (document.fonts as FontFaceSet & {add(f:FontFace):void}).add(alias);
})).then(async()=>{const face=new FontFace('FredBlockUltra',`url("${staticFile('fonts/Ultra-latin.woff2')}")`,{weight:'400'});await face.load();(document.fonts as FontFaceSet & {add(f:FontFace):void}).add(face);continueRender(handle);}).catch(cancelRender);
const resolveAssets=(value:any):any=>typeof value==='string'&&value.startsWith('asset:')?staticFile(value.slice(6)):Array.isArray(value)?value.map(resolveAssets):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,resolveAssets(v)])):value;
const SnapFrame=({entry}:any)=>{const [ready,setReady]=React.useState(false);const [wait]=React.useState(()=>delayRender('Wait for fonts before original measured layout mounts'));React.useEffect(()=>{fontsReady.then(()=>setReady(true)).catch(cancelRender)},[]);React.useLayoutEffect(()=>{if(ready)continueRender(wait)},[ready,wait]);if(!ready)return null;const C=resolveComponent(entry.stableId);return <AbsoluteFill style={{background:entry.previewBackdrop?.value||'#faf9f6'}}><C {...resolveAssets(entry.props)}/></AbsoluteFill>;};
const Sample=({entry}:any)=>{if(entry.sourceEntry.library==='Snapcn')return <SnapFrame entry={entry}/>;const Component=resolveComponent(entry.stableId);return <Component {...resolveAssets(entry.props)}/>;};
registerRoot(()=> <>{manifest.pages.map(p=><Composition key={p.stableId} id={p.stableId} component={Sample} defaultProps={{entry:p}} width={p.designWidth} height={p.designHeight} fps={p.fps} durationInFrames={p.durationInFrames}/>)}</>);
