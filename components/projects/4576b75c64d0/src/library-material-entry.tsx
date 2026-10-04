import React,{useEffect,useState} from 'react';
import {Composition,registerRoot,useCurrentFrame,delayRender,continueRender} from 'remotion';
import {approvedStaticFile as staticFile} from '../material-policy';
import {Sketch} from './SketchLibrary';
function Clip(){const t=222.9666667+useCurrentFrame()/60;const [h]=useState(()=>delayRender('Local fonts'));useEffect(()=>{Promise.all([['Medium',500],['Semibold',600]].map(async([name,w])=>{const f=new FontFace('MiSans',`url(${staticFile(name+'.otf')})`,{weight:String(w)});await f.load();document.fonts.add(f);})).then(()=>continueRender(h));},[h]);return <div style={{fontFamily:'MiSans'}}><Sketch t={t}/></div>;}
registerRoot(()=><Composition id="E15" component={Clip} width={1920} height={1080} fps={60} durationInFrames={1020}/>);
