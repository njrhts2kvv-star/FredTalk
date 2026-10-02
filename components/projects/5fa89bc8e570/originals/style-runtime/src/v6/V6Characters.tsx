import {useCurrentFrame} from 'remotion';
import type {V5Spec} from '../v5/types';
import {arrive,Canvas,Character,Cut,Sfx,Slab} from './V6Shared';

export const V6Characters=({spec}:{spec:V5Spec})=>{
  const f=useCurrentFrame();const [a,b,c,d,e]=spec.cues;const dark=spec.background==='black';
  if(spec.layout==='character-hero-question'){
    const q=arrive(f,b),r=arrive(f,c);
    return <Canvas dark={false}><Character pose="thinking" at={a} style={{position:'absolute',left:80,bottom:-45}}/>
      <Slab style={{position:'absolute',right:95,top:195,width:1040,height:690,display:'block',padding:'130px 80px',boxSizing:'border-box',clipPath:`inset(0 ${(1-q)*100}% 0 0 round 34px)`}}>
        <div style={{fontSize:104,fontWeight:600,color:'#aaa'}}>我是在找答案</div><div style={{fontSize:108,fontWeight:600,marginTop:65,whiteSpace:'nowrap',clipPath:`inset(0 ${(1-r)*100}% 0 0)`}}>还是在找支持？</div>
      </Slab><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='character-hero-judge'){
    const ps=spec.words.map((_,i)=>arrive(f,[b,c,d][i]??b,18));
    return <Canvas dark><Character pose="judging" at={a} style={{position:'absolute',left:60,bottom:-30}}/>
      <Slab style={{position:'absolute',right:110,top:195,width:1030,height:690,padding:'70px 78px',boxSizing:'border-box',display:'flex',flexDirection:'column',alignItems:'stretch',gap:18}}>{spec.words.map((w,i)=><div key={w} style={{height:170,fontSize:i===2?128:100,fontWeight:600,color:i===2?'#090909':'#fff',background:i===2?'#fff':'transparent',borderRadius:24,display:'flex',alignItems:'center',justifyContent:'center',clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 24px)`}}>{w}</div>)}</Slab><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='character-hero-point'){
    const ps=spec.words.map((_,i)=>arrive(f,[b,c,d,e][i]??b,18));
    return <Canvas dark={false}><Character pose="pointing" at={a} style={{position:'absolute',left:50,bottom:-50}}/>
      <div style={{position:'absolute',right:80,top:245,width:1100,height:600,display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>{spec.words.map((w,i)=><Slab key={w} dark={i===3} style={{fontSize:116,fontWeight:600,clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 34px)`,transform:`scale(${.94+.06*ps[i]})`}}>{w}</Slab>)}</div><Sfx spec={spec}/></Canvas>;
  }
  const q=arrive(f,b),r=arrive(f,c);
  return <Canvas dark={dark}><Character pose="confirming" at={a} style={{position:'absolute',right:25,bottom:-45}}/>
    <Slab style={{position:'absolute',left:100,top:205,width:1110,height:660,display:'block',padding:'120px 80px',boxSizing:'border-box',clipPath:`inset(0 ${(1-q)*100}% 0 0 round 34px)`}}>
      <div style={{fontSize:102,fontWeight:600,color:'#aaa'}}>AI 把事情做对</div><div style={{fontSize:128,fontWeight:600,marginTop:75,clipPath:`inset(0 ${(1-r)*100}% 0 0)`}}>人选择正确的事</div>
    </Slab><Sfx spec={spec}/></Canvas>;
};
