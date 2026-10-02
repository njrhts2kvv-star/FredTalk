import {useCurrentFrame} from 'remotion';
import {Sound} from '../shared';
import {Canvas,ease,Wipe} from '../v11/V11Shared';
import type {V13Spec} from './types';

const Sfx=({spec}:{spec:V13Spec})=><>{spec.sfx.map((name,index)=><Sound
  key={`${name}-${index}`}
  at={spec.cues[index]??spec.cues[0]??10}
  file={`sfx/${name}.wav`}
  volume={name==='whoosh'||name==='swipe'?.14:.15}
/>)}</>;

const Checkerboard=({spec}:{spec:V13Spec})=>{
  const frame=useCurrentFrame();
  return <Canvas dark>{spec.words.map((word,index)=>{
    const row=Math.floor(index/3);const col=index%3;const at=spec.cues[row]+col*4;const progress=ease(frame,at,14);const light=(row+col)%2===0;
    return <div key={word} style={{
      position:'absolute',left:col*640,top:row*360,width:640,height:360,
      background:light?'#fff':'#000',color:light?'#090909':'#fff',
      display:'flex',alignItems:'center',justifyContent:'center',fontSize:104,fontWeight:600,
      clipPath:`inset(0 ${(1-progress)*100}% 0 0)`,transform:`translateX(${(1-progress)*(col-1)*48}px)`,
    }}>{word}</div>})}<Sfx spec={spec}/></Canvas>;
};

const StepTiles=({spec}:{spec:V13Spec})=>{
  const groups=[['自己','判断'],['AI','挑战'],['自己','决定']];
  return <Canvas dark={false}><div style={{position:'absolute',inset:'190px 90px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:30}}>{groups.map((lines,index)=><Wipe key={lines.join('')} at={spec.cues[index]} style={{
    borderRadius:30,background:'#000',color:'#fff',display:'flex',flexDirection:'column',gap:18,
    alignItems:'center',justifyContent:'center',fontSize:132,lineHeight:1.08,fontWeight:600,textAlign:'center',letterSpacing:-3,
  }}><span>{lines[0]}</span><span>{lines[1]}</span></Wipe>)}</div><Sfx spec={spec}/></Canvas>;
};

export const V13Sample=({spec}:{spec:V13Spec})=>spec.approvalId==='reference-v13-13'?<Checkerboard spec={spec}/>:<StepTiles spec={spec}/>;

