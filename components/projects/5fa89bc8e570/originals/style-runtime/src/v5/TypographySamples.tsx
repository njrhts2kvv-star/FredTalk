import {useCurrentFrame} from 'remotion';
import type {V5Spec} from './types';
import {motion, QuickText, SfxPair, V5Canvas} from './V5Shared';

export const TypographySamples=({spec}:{spec:V5Spec})=>{
  const frame=useCurrentFrame(); const [a,b,c,d]=spec.cues;
  if(spec.layout==='word-matrix'){
    return <V5Canvas dark><div style={{position:'absolute',inset:'126px 180px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'18px 28px'}}>{spec.words.map((w,i)=>{const p=motion(frame,[a,b,c][Math.floor(i/3)]??c,16);return <div key={w} style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:w==='判断'?104:88,fontWeight:600,color:w==='判断'?'#000':'#fff',background:w==='判断'?'#fff':'transparent',borderRadius:28,clipPath:`inset(0 ${(1-p)*100}% 0 0 round 28px)`}}>{w}</div>})}</div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='vertical-words'){
    return <V5Canvas dark={false}><div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4}}>{spec.words.map((w,i)=>{const p=motion(frame,[b,c,d][i]??b,20);return <div key={w} style={{fontSize:176,fontWeight:600,lineHeight:1.02,color:i===1?'#fff':'#111',background:i===1?'#111':'transparent',padding:'0 70px 14px',borderRadius:24,clipPath:`inset(0 ${(1-p)*100}% 0 0 round 24px)`}}>{w}</div>})}</div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='big-number'){
    const p=motion(frame,a,18); const run=Math.max(0,Math.min(1,(frame-b)/90)); const num=Math.max(1,Math.round(100*Math.pow(0.01,run)));
    return <V5Canvas dark><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'SF Pro Display, -apple-system, MiSans, sans-serif',fontSize:440,fontWeight:600,letterSpacing:-25,clipPath:`inset(0 ${(1-p)*50}%)`}}>{num}</div>
      <QuickText at={c} from="center" style={{position:'absolute',left:0,right:0,bottom:104,textAlign:'center',fontSize:88,fontWeight:600}}>{spec.words[2]}</QuickText>
      <SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  const p=motion(frame,a,18),q=motion(frame,b,20),r=motion(frame,c,20);
  return <V5Canvas dark={false}><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',transform:`translateY(${-r*92}px)`}}><div style={{fontSize:430,fontWeight:600,letterSpacing:-34,clipPath:`circle(${p*80}% at 50% 50%)`}}>{spec.words[0]}</div></div>
    <div style={{position:'absolute',left:350,right:350,top:570,height:14,background:'#111',transform:`scaleX(${q})`,transformOrigin:'left'}}/>
    <QuickText at={c} from="center" style={{position:'absolute',left:0,right:0,bottom:155,textAlign:'center',fontSize:122,fontWeight:600}}>{spec.words[1]}</QuickText><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
};
