import React,{useEffect,useState} from 'react';
import {Composition,registerRoot,useCurrentFrame,delayRender,continueRender} from 'remotion';
import {approvedStaticFile as staticFile} from '../material-policy';
import {Comparison} from './Comparison';
import {M} from './UI';
const c=JSON.parse(JSON.stringify(M.cases[3]));
c.assets.left.model='Fred · 创作素材'; c.assets.right.model='Fred · 组件素材';
c.assets.left.size=[3844,2160];c.assets.right.size=[3844,2160];
const details=[
 [[.40,.71,.34,.42,'蓝色组件'],[.71,.33,.46,.46,'手部动作']],
 [[.365,.26,.30,.36,'人物神态'],[.64,.50,.23,.32,'候选画面']],
 [[.17,.71,.24,.25,'组件底座'],[.915,.76,.16,.35,'收纳边框']],
 [[.40,.65,.30,.40,'组件材质'],[.70,.36,.35,.40,'手部细节']],
 [[.82,.60,.25,.38,'夕阳画面']]
];
c.shots.forEach((shot:any,i:number)=>shot.items.forEach((item:any,j:number)=>{const [x,y,w,h,label]=details[i][j];item.center=[x,y];item.span=[w,h];item.label=label;}));
function Clip(){const t=163.65+useCurrentFrame()/60;const [h]=useState(()=>delayRender('Local fonts'));useEffect(()=>{Promise.all([['Medium',500],['Semibold',600]].map(async([name,w])=>{const f=new FontFace('MiSans',`url(${staticFile(name+'.otf')})`,{weight:String(w)});await f.load();document.fonts.add(f);})).then(()=>continueRender(h));},[h]);return <div style={{fontFamily:'MiSans'}}><Comparison c={c} t={t}/></div>;}
registerRoot(()=><Composition id="E14" component={Clip} width={1920} height={1080} fps={60} durationInFrames={1200}/>);
