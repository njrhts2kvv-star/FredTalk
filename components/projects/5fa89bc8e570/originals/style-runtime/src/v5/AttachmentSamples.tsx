import {useCurrentFrame} from 'remotion';
import type {V5Spec} from './types';
import {DeviceFrame, FileCard, motion, QuickText, SfxPair, V5Canvas} from './V5Shared';

export const AttachmentSamples=({spec}:{spec:V5Spec})=>{
  const frame=useCurrentFrame(); const [a,b,c,d]=spec.cues;
  if(spec.layout==='single-focus'){
    const p=motion(frame,a,20),q=motion(frame,b,22),r=motion(frame,c,22);
    return <V5Canvas dark={false}>
      <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:40,filter:`blur(${(1-q)*0+q*5}px)`,transform:`scale(${1-q*0.03})`}}><FileCard label="来源" style={{transform:`translateX(${(1-p)*-80}px)`}}/><FileCard label="笔记" style={{transform:`translateX(${(1-p)*80}px)`}}/></div>
      <FileCard label={spec.words[0]} style={{position:'absolute',left:710,top:220,width:500,height:580,transform:`scale(${0.94+q*.06})`,clipPath:`inset(0 ${(1-q)*100}% 0 0 round 26px)`,zIndex:3}}/>
      <QuickText at={c} from="center" style={{position:'absolute',left:0,right:0,bottom:86,textAlign:'center',fontSize:76,fontWeight:600,zIndex:4}}>{spec.words[1]}</QuickText><SfxPair cues={spec.cues} names={spec.sfx}/>
    </V5Canvas>;
  }
  if(spec.layout==='cascade-focus'){
    const ps=spec.words.map((_,i)=>motion(frame,[a,b,c][i],20)); const focus=Math.min(2,Math.max(0,Math.floor((frame-b)/68)+1));
    return <V5Canvas dark><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:36}}>{spec.words.map((w,i)=><div key={w} style={{width:470,height:570,borderRadius:34,background:i===focus?'#fff':'#171717',color:i===focus?'#111':'#fff',border:'4px solid #333',display:'flex',alignItems:'center',justifyContent:'center',fontSize:104,fontWeight:600,clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 34px)`}}>{w}</div>)}</div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='stack-to-conclusion'){
    const p=motion(frame,a,22),q=motion(frame,b,28),r=motion(frame,c,22);
    return <V5Canvas dark={false}><div style={{position:'absolute',left:210,top:260,width:650,height:520}}>{[0,1,2].map(i=><FileCard key={i} label={i===2?spec.words[0]:'材料'} style={{position:'absolute',left:i*48,top:i*38,transform:`translateX(${(1-p)*-120}px) rotate(${(i-1)*4}deg)`}}/>)}</div>
      <div style={{position:'absolute',left:850,top:490,width:q*230,height:10,background:'#111'}}/>
      <div style={{position:'absolute',right:170,top:290,width:610,height:450,borderRadius:40,background:'#111',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:92,fontWeight:600,textAlign:'center',clipPath:`inset(0 ${(1-r)*100}% 0 0 round 40px)`}}>{spec.words[1]}</div><SfxPair cues={spec.cues} names={spec.sfx}/>
    </V5Canvas>;
  }
  const p=motion(frame,a,24),q=motion(frame,b,26),r=motion(frame,c,22);
  return <V5Canvas dark><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',gap:110}}>
    <DeviceFrame kind="phone" dark style={{clipPath:`inset(0 ${(1-p)*100}% 0 0 round 52px)`}}><div style={{padding:'145px 28px',fontSize:50,fontWeight:600,textAlign:'center'}}>{spec.words[0]}</div></DeviceFrame>
    <div style={{width:q*180,height:8,background:'#fff'}}/>
    <DeviceFrame kind="monitor" dark style={{clipPath:`inset(0 0 0 ${(1-q)*100}%)`}}><div style={{height:'100%',position:'relative'}}>{[0,1,2,3,4].map(i=><span key={i} style={{position:'absolute',left:100+i*120,top:120+(i%2)*120,width:34,height:34,borderRadius:99,background:'#fff'}}/>)}<svg width="780" height="455" style={{position:'absolute',inset:0}}><path d="M115 138 L235 258 L355 138 L475 258 L595 138" stroke="#fff" strokeWidth="7" fill="none" strokeDasharray={`${r*900} 900`}/></svg><QuickText at={c} style={{position:'absolute',left:0,right:0,bottom:52,textAlign:'center',fontSize:62,fontWeight:600}}>{spec.words[1]}</QuickText></div></DeviceFrame>
  </div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
};
