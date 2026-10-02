import {useCurrentFrame} from 'remotion';
import type {V5Spec} from './types';
import {FredCard, motion, QuickText, SfxPair, V5Canvas} from './V5Shared';

export const CharacterSamples = ({spec}: {spec: V5Spec}) => {
  const frame=useCurrentFrame(); const [a,b,c,d,e]=spec.cues; const dark=spec.background==='black';
  if(spec.layout==='character-question'){
    const q=motion(frame,b,22), r=motion(frame,c,22);
    return <V5Canvas dark={dark}><FredCard at={a} dark={dark} pose="thinking" style={{position:'absolute',left:790,top:170}}/>
      <div style={{position:'absolute',left:130,top:390,width:520,height:210,borderRadius:34,background:'#111',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:66,fontWeight:600,clipPath:`inset(0 ${(1-q)*100}% 0 0 round 34px)`}}>{spec.words[0]}</div>
      <div style={{position:'absolute',right:130,top:390,width:520,height:210,borderRadius:34,background:'#111',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:66,fontWeight:600,clipPath:`inset(0 0 0 ${(1-r)*100}% round 34px)`}}>{spec.words[1]}</div>
      <SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='character-judge'){
    const levels=spec.words.map((_,i)=>motion(frame,[b,c,d][i]??c,20));
    return <V5Canvas dark><FredCard at={a} dark pose="judging" style={{position:'absolute',left:260,top:180}}/>
      <div style={{position:'absolute',left:760,top:210,width:930,display:'grid',gap:22}}>{spec.words.map((word,i)=><div key={word} style={{height:190,borderRadius:28,background:i===2?'#fff':'#171717',color:i===2?'#111':'#fff',border:'3px solid #333',fontSize:92,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',clipPath:`inset(0 ${(1-levels[i])*100}% 0 0 round 28px)`}}>{word}</div>)}</div>
      <SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='character-point'){
    const ps=spec.words.map((_,i)=>motion(frame,[b,c,d,e][i]??d,18));
    return <V5Canvas dark={false}><FredCard at={a} dark={false} pose="pointing" style={{position:'absolute',left:180,top:180}}/>
      <div style={{position:'absolute',left:640,right:140,top:405,height:10,background:'#111'}}/>
      {spec.words.map((word,i)=><div key={word} style={{position:'absolute',left:630+i*280,top:330,width:210,height:160,borderRadius:999,background:i===3?'#111':'#fff',color:i===3?'#fff':'#111',border:'6px solid #111',display:'flex',alignItems:'center',justifyContent:'center',fontSize:56,fontWeight:600,clipPath:`circle(${ps[i]*75}% at 50% 50%)`}}>{word}</div>)}
      <SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  const q=motion(frame,b,24), r=motion(frame,c,22);
  return <V5Canvas dark><FredCard at={a} dark pose="confirming" style={{position:'absolute',right:180,top:180}}/>
    <div style={{position:'absolute',left:150,top:280,width:1020,transform:`translateY(${-r*120}px)`,color:`rgb(${Math.round(255-r*135)},${Math.round(255-r*135)},${Math.round(255-r*135)})`}}>
      <div style={{fontSize:104,fontWeight:600,clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>{spec.words[0]}</div>
      <QuickText at={c} style={{fontSize:122,fontWeight:600,marginTop:64,color:'#fff'}}>{spec.words[1]}</QuickText>
    </div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
};
