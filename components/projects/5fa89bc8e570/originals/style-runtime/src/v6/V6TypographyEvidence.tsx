import {useCurrentFrame} from 'remotion';
import type {V5Spec} from '../v5/types';
import {arrive,Canvas,Cut,Sfx,Slab} from './V6Shared';

export const V6TypographyEvidence=({spec}:{spec:V5Spec})=>{
  const f=useCurrentFrame();const [a,b,c,d,e]=spec.cues;
  if(spec.layout==='type-blocks'){
    return <Canvas dark><div style={{position:'absolute',inset:0,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gridTemplateRows:'repeat(3,1fr)'}}>{spec.words.map((w,i)=>{const p=arrive(f,[a,b,c][Math.floor(i/3)]??a,18);const inverse=(i+Math.floor(i/3))%2===0;return <div key={w} style={{background:inverse?'#f8f8f6':'#050505',color:inverse?'#050505':'#fff',fontSize:i>5?112:94,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',clipPath:`inset(0 ${(1-p)*100}% 0 0)`,transform:`scale(${.95+.05*p})`}}>{w}</div>})}</div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='number-wall'){
    const p=arrive(f,a,18);const run=Math.max(0,Math.min(1,(f-b)/92));const num=Math.max(1,Math.round(100*Math.pow(.01,run)));
    return <Canvas dark><div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'SF Pro Display,-apple-system,MiSans,sans-serif',fontSize:600,fontWeight:600,letterSpacing:-45,clipPath:`inset(0 ${(1-p)*50}%)`}}>{num}</div>
      <Cut at={c} from="center" style={{position:'absolute',left:0,right:0,bottom:78,textAlign:'center',fontSize:94,fontWeight:600}}>越来越快</Cut><Sfx spec={{...spec,sfx:['scroll','pop']}}/></Canvas>;
  }
  if(spec.layout==='word-impact'){
    const p=arrive(f,a,20),q=arrive(f,b,24),r=arrive(f,c,20);
    return <Canvas dark={false}><div style={{position:'absolute',left:100,top:40,fontSize:720,fontWeight:600,lineHeight:1,letterSpacing:-50,clipPath:`inset(0 ${(1-p)*100}% 0 0)`}}>快</div>
      <Slab style={{position:'absolute',right:100,bottom:120,width:1120*q,height:390,fontSize:154,fontWeight:600,clipPath:`inset(0 0 0 ${(1-q)*100}% round 34px)`,transform:`translateY(${(1-r)*24}px)`}}>不等于对</Slab><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='material-bars'){
    const widths=[1500,980,610];
    return <Canvas dark={false}><div style={{position:'absolute',left:170,top:180,width:1580,display:'flex',flexDirection:'column',gap:42}}>{spec.words.map((w,i)=>{const p=arrive(f,[a,b,c][i]??a,24);return <Slab key={w} dark={i<2} style={{width:widths[i]*p,height:210,justifyContent:'flex-start',paddingLeft:68,fontSize:102,fontWeight:600,clipPath:`inset(0 ${(1-p)*100}% 0 0 round 34px)`}}>{w}</Slab>})}</div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='split-panels'){
    const p=arrive(f,a,24),q=arrive(f,b,22),r=arrive(f,c,24);
    return <Canvas dark><div style={{position:'absolute',inset:0,display:'flex'}}>
      <div style={{width:`${50+10*r}%`,background:'#f8f8f6',color:'#080808',display:'flex',alignItems:'center',justifyContent:'center',fontSize:122,fontWeight:600,clipPath:`inset(0 ${(1-p)*100}% 0 0)`}}>得到答案</div>
      <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',fontSize:148,fontWeight:600,clipPath:`inset(0 0 0 ${(1-q)*100}%)`}}>形成能力</div>
    </div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='step-tiles'){
    const ps=spec.words.map((_,i)=>arrive(f,[a,b,c][i]??a,20));const active=Math.min(2,Math.max(0,Math.floor((f-a)/70)));
    return <Canvas dark={false}><div style={{position:'absolute',inset:'185px 90px',display:'flex',alignItems:'center',justifyContent:'center',gap:30,perspective:1200}}>{spec.words.map((w,i)=><Slab key={w} dark={i===active||i===2} style={{width:i===active?680:500,height:i===active?710:570,fontSize:i===active?96:72,fontWeight:600,textAlign:'center',padding:'0 40px',clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 34px)`,transform:`translateZ(${i===active?70:0}px)`}}>{w}</Slab>)}</div><Sfx spec={spec}/></Canvas>;
  }
  const ps=spec.words.map((_,i)=>arrive(f,[a,b,c,d][i]??a,18));const merge=arrive(f,e,26);
  return <Canvas dark><div style={{position:'absolute',inset:0,perspective:1200}}>
    {spec.words.slice(0,3).map((w,i)=><Slab key={w} style={{position:'absolute',left:70+i*610,top:110,width:560,height:260,fontSize:78,fontWeight:600,textAlign:'center',clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 34px)`}}>{w}</Slab>)}
    <Slab dark={false} style={{position:'absolute',left:95+merge*25,top:520-merge*120,width:1730-merge*50,height:450+merge*160,fontSize:168,fontWeight:600,textAlign:'center',clipPath:`inset(0 ${(1-ps[3])*50}% round 34px)`,transform:`translateZ(${merge*80}px)`}}>选择正确的事</Slab>
  </div><Sfx spec={spec}/></Canvas>;
};
