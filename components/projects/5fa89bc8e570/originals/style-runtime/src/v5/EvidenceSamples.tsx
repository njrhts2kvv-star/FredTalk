import {useCurrentFrame} from 'remotion';
import type {V5Spec} from './types';
import {motion, QuickText, SfxPair, V5Canvas} from './V5Shared';

export const EvidenceSamples=({spec}:{spec:V5Spec})=>{
  const frame=useCurrentFrame(); const [a,b,c,d,e]=spec.cues;
  if(spec.layout==='metric-bars'){
    const widths=[1280,760,430];
    return <V5Canvas dark={false}><div style={{position:'absolute',left:240,right:220,top:230,display:'grid',gap:92}}>{spec.words.map((w,i)=>{const p=motion(frame,[b,c,d][i]??b,28);return <div key={w} style={{display:'grid',gridTemplateColumns:'190px 1fr',alignItems:'center',gap:40}}><div style={{fontSize:72,fontWeight:600,textAlign:'right'}}>{w}</div><div style={{height:54,borderRadius:999,background:'#ececec',overflow:'hidden'}}><div style={{height:'100%',width:widths[i]*p,background:'#111',borderRadius:999}}/></div></div>})}</div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='table-compare'){
    const p=motion(frame,a,24),q=motion(frame,b,22),r=motion(frame,c,24);
    return <V5Canvas dark><div style={{position:'absolute',inset:'170px 140px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:48}}>{spec.words.map((w,i)=><div key={w} style={{borderRadius:36,border:'4px solid #3b3b3b',overflow:'hidden',clipPath:`inset(0 ${i===0?(1-p)*100:0}% 0 ${i===1?(1-q)*100:0}% round 36px)`}}><div style={{height:150,background:i===1?'#fff':'#171717',color:i===1?'#111':'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:76,fontWeight:600}}>{w}</div>{[0,1,2].map(j=><div key={j} style={{height:150,borderTop:'3px solid #333',display:'grid',gridTemplateColumns:'1fr 1fr'}}><div style={{borderRight:'3px solid #333'}}/><div style={{background:i===1&&j===2?'#fff':'transparent',transform:`scaleX(${r})`,transformOrigin:'left'}}/></div>)}</div>)}</div><SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  if(spec.layout==='path-build'){
    const ps=spec.words.map((_,i)=>motion(frame,[b,c,d][i]??b,20));
    return <V5Canvas dark={false}><svg width="1920" height="1080" style={{position:'absolute',inset:0}}><path d="M300 600 C520 260 720 850 960 540 C1190 240 1370 820 1620 470" fill="none" stroke="#111" strokeWidth="12" strokeDasharray={`${motion(frame,a,60)*2300} 2300`}/></svg>{spec.words.map((w,i)=><div key={w} style={{position:'absolute',left:[190,750,1320][i],top:[530,470,400][i],width:410,height:190,borderRadius:999,background:i===2?'#111':'#fff',color:i===2?'#fff':'#111',border:'7px solid #111',display:'flex',alignItems:'center',justifyContent:'center',fontSize:58,fontWeight:600,textAlign:'center',clipPath:`circle(${ps[i]*76}% at 50% 50%)`}}>{w}</div>)}<SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
  }
  const center=motion(frame,a,20); const ps=spec.words.map((_,i)=>motion(frame,[b,c,d,e][i]??b,18));
  const pos=[[160,170],[1260,170],[160,710],[1260,710]];
  return <V5Canvas dark><div style={{position:'absolute',left:695,top:350,width:530,height:380,borderRadius:999,background:'#fff',color:'#111',display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:94,fontWeight:600,clipPath:`circle(${center*78}% at 50% 50%)`}}>选择<br/>正确的事</div>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}><path d="M695 430 L460 280 M1225 430 L1460 280 M695 650 L460 800 M1225 650 L1460 800" stroke="#fff" strokeWidth="9" fill="none" strokeDasharray={`${motion(frame,b,42)*500} 500`}/></svg>
    {spec.words.map((w,i)=><div key={w} style={{position:'absolute',left:pos[i][0],top:pos[i][1],width:500,height:190,borderRadius:30,border:'4px solid #333',background:i===3?'#fff':'#171717',color:i===3?'#111':'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:58,fontWeight:600,clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 30px)`}}>{w}</div>)}<SfxPair cues={spec.cues} names={spec.sfx}/></V5Canvas>;
};
