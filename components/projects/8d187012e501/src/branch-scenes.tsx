import React from 'react';
import {Clip,Pill,Path,Text} from './common';
import {progress,lerp} from './motion';
export const BranchThree:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const move=progress(t,0.6,0.57),collapse=progress(t,3.32,0.61);
  const rootX=lerp(960,475,move),rootY=lerp(540,215,move);
  return <>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
      {[0,1,2].map(i=>{
        const y=475+i*218,d='M'+rootX+' '+(rootY+110)+' C'+rootX+' '+y+' '+rootX+' '+y+' 1030 '+y;
        return collapse<1?<g key={i} style={{clipPath:'inset(0 0 '+collapse*100+'% 0)'}}><Path d={d} p={progress(t,1.15+i*0.26,0.5)} width={14}/></g>:null;
      })}
    </svg>
    {collapse<1&&<Pill text={c.words[0]} cx={rootX} cy={rootY} width={670} height={300} size={197} color={c.color} scale={1-collapse}/>}
    {[0,1,2].map(i=>{
      const enter=progress(t,1.4+i*0.26,0.34),cx=i===0?lerp(1380,960,collapse):1380,cy=i===0?lerp(475,540,collapse):475+i*218;
      return enter>0?<Pill key={i} text={c.words[i+1]} cx={cx} cy={cy} width={760} height={193} size={c.fontSize} color={c.color}
        scale={enter*(i===0?1:1-collapse)}/>:null;
    })}
  </>;
};
export const TreeFlow:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const born=progress(t,0.13,0.65),rise=progress(t,1.12,0.57),collapse=progress(t,7.5,1.8);
  const treeScale=lerp(1,0.05,collapse),flow=progress(t,9,0.56);
  return <>
    {t<9.45&&<div style={{position:'absolute',inset:0,transform:'scale('+treeScale+')',transformOrigin:'960px 475px',clipPath:t>9.05?'inset(0 0 '+progress(t,9.05,0.4)*100+'% 0)':'none'}}>
      <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
        {c.words.slice(1,7).map((_,i)=><Path key={i} d={'M960 275 L'+(160+i*320)+' 705'} p={progress(t,2.03+i*0.48,0.42)} width={13}/>)}
      </svg>
      <Pill text={born>0.7?c.words[0]:''} cx={960} cy={lerp(540,180,rise)} width={lerp(20,750,born)} height={lerp(20,194,born)} size={107} color={c.color}/>
      {c.words.slice(1,7).map((word,i)=>{
        const p=progress(t,2.17+i*0.48,0.38);
        const segments=word.startsWith('Agent')?word.split(''):word.replace('·','｜').split('');
        return p>0?<Pill key={word} text={segments.join('\n')} cx={160+i*320} cy={760} width={145} height={Math.max(380,segments.length*52+54)}
          size={52} color="#fff" scale={p}/>:null;
      })}
    </div>}
    {t>=9&&<>
      <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
        <Path d="M680 610 L1180 610" p={progress(t,9.75,0.5)} width={38}/>
        {t>9.9&&<path d="M1150 540 L1250 610 L1150 680 Z" fill="#111" style={{transform:'scale('+progress(t,9.9,0.35)+')',transformOrigin:'1200px 610px'}}/>}
      </svg>
      {[0,1].map(i=><Pill key={i} text={t>9.64+i*0.39?c.words[7+i]:''} cx={i===0?lerp(-400,390,flow):lerp(2320,1530,flow)} cy={610} width={630} height={283} size={157} color="#8960CA"/>)}
      <Text text={t>=12.08?c.words[9]:''} x={677} y={437} size={100} color="#8960CA" style={{clipPath:'inset(0 '+(1-progress(t,12.08,0.25))*100+'% 0 0)',textShadow:'6px 6px 4px #555'}}/>
      <Text text={t>=11.65?c.words[10]:''} x={747} y={667} size={100} color="#8960CA" style={{clipPath:'inset(0 '+(1-progress(t,11.65,0.25))*100+'% 0 0)',textShadow:'6px 6px 4px #555'}}/>
    </>}
  </>;
};
