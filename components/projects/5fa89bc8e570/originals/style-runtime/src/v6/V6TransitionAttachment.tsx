import {useCurrentFrame} from 'remotion';
import type {V5Spec} from '../v5/types';
import {arrive,Canvas,Cut,Sfx,Slab} from './V6Shared';

export const V6TransitionAttachment=({spec}:{spec:V5Spec})=>{
  const f=useCurrentFrame();const [a,b,c,d]=spec.cues;
  if(spec.layout==='hero-slab'){
    const p=arrive(f,a,26),q=arrive(f,b,22),r=arrive(f,c,22);
    return <Canvas dark><div style={{position:'absolute',inset:0,perspective:1200}}>
      <Slab dark={false} style={{position:'absolute',left:100,top:145,width:1030*p,height:790,transform:`rotateY(${(1-p)*-10}deg)`,transformOrigin:'left',justifyContent:'flex-start',paddingLeft:90}}>
        <div style={{fontSize:108,fontWeight:600,lineHeight:1.08,clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>AI 让执行<br/>越来越便宜</div>
      </Slab>
      <Slab style={{position:'absolute',right:90,top:290,width:790*r,height:500,fontSize:104,fontWeight:600,textAlign:'center',padding:'0 40px',boxSizing:'border-box'}}>判断，<br/>反而更贵</Slab>
    </div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='material-stack'){
    const p=arrive(f,a),q=arrive(f,b,24),r=arrive(f,c,22);
    return <Canvas dark={false}><div style={{position:'absolute',inset:0,perspective:1300}}>
      {[0,1,2].map(i=><Slab key={i} dark={false} style={{position:'absolute',left:170+i*58,top:190+i*38,width:760,height:620,transform:`translateX(${(1-p)*-90}px) rotateY(-5deg)`,zIndex:i}}/>)}
      <div style={{position:'absolute',left:220,top:300,fontSize:116,fontWeight:600,zIndex:5,clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>答案很多</div>
      <Slab style={{position:'absolute',right:130,top:255,width:780,height:570,zIndex:8,transform:`scale(${.92+.08*r})`,clipPath:`inset(0 ${(1-r)*100}% 0 0 round 34px)`,fontSize:106,fontWeight:600}}>证据在哪里？</Slab>
    </div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='photo-depth'){
    const p=arrive(f,a),q=arrive(f,b),r=arrive(f,c);
    return <Canvas dark={false}><div style={{position:'absolute',inset:0,perspective:1300}}>
      <Slab dark={false} style={{position:'absolute',left:160,top:150,width:1180,height:780,transform:`translateX(${(1-p)*-100}px) rotateY(-7deg)`,transformOrigin:'left',justifyContent:'flex-start',paddingLeft:100}}>
        <div style={{fontSize:150,fontWeight:600,clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>一张附件</div>
        <div style={{position:'absolute',right:90,top:0,width:110,height:'100%',background:'#080808',transform:`scaleY(${p})`}}/>
      </Slab>
      <Slab style={{position:'absolute',right:95,bottom:95,width:820,height:270,fontSize:84,fontWeight:600,clipPath:`inset(0 0 0 ${(1-r)*100}% round 34px)`}}>先看关键证据</Slab>
    </div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='material-tiles'){
    const ps=spec.words.map((_,i)=>arrive(f,[a,b,c][i]??a,20));const active=Math.min(2,Math.max(0,Math.floor((f-b)/68)+1));
    return <Canvas dark><div style={{position:'absolute',inset:'170px 95px',display:'flex',alignItems:'center',justifyContent:'center',gap:34,perspective:1200}}>{spec.words.map((w,i)=><Slab key={w} dark={i!==active} style={{width:i===active?690:470,height:i===active?710:560,fontSize:i===active?132:92,fontWeight:600,clipPath:`inset(0 ${(1-ps[i])*100}% 0 0 round 34px)`,transform:`translateZ(${i===active?70:0}px)`}}>{w}</Slab>)}</div><Sfx spec={spec}/></Canvas>;
  }
  if(spec.layout==='document-hero'){
    const p=arrive(f,a),q=arrive(f,b,26),r=arrive(f,c,22);
    return <Canvas dark={false}><div style={{position:'absolute',inset:0,perspective:1300}}>
      {[0,1,2,3].map(i=><Slab key={i} dark={i%2===0} style={{position:'absolute',left:120+i*155,top:240+i*72,width:450,height:540,transform:`translateX(${(1-p)*-100}px)`}}/>)}
      <Slab dark={false} style={{position:'absolute',right:105,top:185,width:900*q,height:710,zIndex:9,clipPath:`inset(0 0 0 ${(1-q)*100}% round 34px)`,fontSize:118,fontWeight:600,textAlign:'center'}}>材料很多</Slab>
      <Cut at={c} from="right" style={{position:'absolute',right:165,bottom:150,zIndex:12,fontSize:106,fontWeight:600}}>结论只有一个</Cut>
    </div><Sfx spec={spec}/></Canvas>;
  }
  const p=arrive(f,a),q=arrive(f,b,26),r=arrive(f,c,22);
  return <Canvas dark><Slab style={{position:'absolute',left:120,top:150,width:1680,height:780,transform:`scale(${.9+.1*p})`,clipPath:`inset(0 ${(1-p)*50}% round 34px)`,overflow:'hidden'}}>
    <div style={{position:'absolute',left:100,top:105,fontSize:82,fontWeight:600,color:'#aaa',clipPath:`inset(0 ${(1-q)*100}% 0 0)`}}>收集只是开始</div>
    <div style={{fontSize:150,fontWeight:600,clipPath:`inset(0 ${(1-r)*100}% 0 0)`}}>沉淀才会复利</div>
    <div style={{position:'absolute',left:100,right:100,bottom:80,height:54,borderRadius:28,background:'#fff',transform:`scaleX(${r})`,transformOrigin:'left'}}/>
  </Slab><Sfx spec={spec}/></Canvas>;
};
