import {useCurrentFrame} from 'remotion';
import type {V5Spec} from './types';
import {DeviceFrame, motion, QuickText, SfxPair, V5Canvas} from './V5Shared';

export const TransitionSamples = ({spec}: {spec: V5Spec}) => {
  const frame = useCurrentFrame();
  const [a, b, c] = spec.cues;
  if (spec.layout === 'dot-expand') {
    const p = motion(frame, a, 30);
    const q = motion(frame, b, 24);
    const r = motion(frame, c, 24);
    return <V5Canvas dark={false}>
      <div style={{position:'absolute',left:'50%',top:'50%',width:24+p*2200,height:24+p*1400,borderRadius:p<0.5?'50%':36,background:'#000',transform:'translate(-50%,-50%)'}}/>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',textAlign:'center'}}><div style={{transform:`translateY(${-r*86}px)`}}>
        <div style={{fontSize:142,fontWeight:600,clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>{spec.words[0]}</div>
        <div style={{fontSize:150,fontWeight:600,marginTop:38,clipPath:`inset(0 ${(1-r)*100}% 0 0)`}}>{spec.words[1]}</div>
      </div></div><SfxPair cues={spec.cues} names={spec.sfx}/>
    </V5Canvas>;
  }
  if (spec.layout === 'device-build') {
    const p = motion(frame,a,24), q=motion(frame,b,24), r=motion(frame,c,24);
    return <V5Canvas dark>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:70}}>
        <DeviceFrame kind="phone" dark style={{clipPath:`inset(0 ${(1-p)*100}% 0 0)`}}><div style={{fontSize:54,fontWeight:600,padding:'140px 24px',textAlign:'center'}}>执行<br/>更快</div></DeviceFrame>
        <div style={{height:8,width:q*180,background:'#fff'}}/>
        <DeviceFrame kind="desktop" dark style={{clipPath:`inset(0 0 0 ${(1-q)*100}%)`}}><div style={{height:448,display:'flex',alignItems:'center',justifyContent:'center',fontSize:78,fontWeight:600,textAlign:'center'}}>{spec.words[0]}</div></DeviceFrame>
      </div>
      <QuickText at={c} from="center" style={{position:'absolute',left:0,right:0,bottom:74,textAlign:'center',fontSize:74,fontWeight:600,color:'#fff'}}>{spec.words[1]}</QuickText>
      <SfxPair cues={spec.cues} names={spec.sfx}/>
    </V5Canvas>;
  }
  if (spec.layout === 'attachment-cut') {
    const p=motion(frame,a,20), q=motion(frame,b,24), r=motion(frame,c,22);
    return <V5Canvas dark={false}>
      <div style={{position:'absolute',left:180,top:220,width:p*1560,height:10,background:'#111'}}/>
      <div style={{position:'absolute',left:'50%',top:'50%',width:520,height:600,borderRadius:32,background:'#111',color:'#fff',transform:`translate(-50%,-50%) scale(${0.94+q*0.06})`,clipPath:`inset(0 ${(1-q)*100}% 0 0 round 32px)`,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:84,fontWeight:600}}>{spec.words[0]}</div>
      <div style={{position:'absolute',left:0,right:0,bottom:98,textAlign:'center',fontSize:82,fontWeight:600,clipPath:`inset(0 ${(1-r)*50}%)`}}>{spec.words[1]}</div>
      <SfxPair cues={spec.cues} names={spec.sfx}/>
    </V5Canvas>;
  }
  const p=motion(frame,a,20), q=motion(frame,b,24), r=motion(frame,c,22);
  return <V5Canvas dark>
    <div style={{position:'absolute',left:0,top:0,bottom:0,width:`${p*100}%`,background:'#fff'}}/>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',transform:`translateY(${-r*80}px)`}}>
      <div style={{fontSize:178,fontWeight:600,color:p>0.52?'#111':'#fff',clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>{spec.words[0]}</div>
    </div>
    <QuickText at={c} from="right" style={{position:'absolute',left:0,right:0,bottom:160,textAlign:'center',fontSize:96,fontWeight:600,color:'#111'}}>{spec.words[1]}</QuickText>
    <SfxPair cues={spec.cues} names={spec.sfx}/>
  </V5Canvas>;
};
