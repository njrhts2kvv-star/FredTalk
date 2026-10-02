import {useCurrentFrame} from 'remotion';
import type {V8Spec} from './types';
import {activeIndex,BigCopy,Clip,FixedPanel,FullCenter,Sfx,V8Canvas} from './V8Shared';

const appleLayouts=new Set(['apple-speed-contrast','apple-emergence-cut','apple-cost-choice','apple-direction-accelerate','apple-responsibility-cut','apple-five-books-path']);

export const V8Editorial=({spec}:{spec:V8Spec})=>{
  const frame=useCurrentFrame();const [a,b,c,d,e]=spec.cues;const dark=spec.background==='black';
  if(appleLayouts.has(spec.layout)){
    const second=frame>=b;const invert=spec.layout==='apple-cost-choice';
    return <V8Canvas dark={dark}><div style={{position:'absolute',inset:0,background:second?(invert?'#090909':'#fff'):(dark?'#000':'#fff'),color:second?(invert?'#fff':'#090909'):(dark?'#fff':'#090909')}}><Clip at={second?b:a} from={second?'right':'left'}><FullCenter size={spec.words[second?1:0].length>8?132:176}>{spec.words[second?1:0]}</FullCenter></Clip>{!second&&spec.layout==='apple-speed-contrast'?<div style={{position:'absolute',left:180,right:180,bottom:160,height:22,background:'#fff'}}/>:null}</div><Sfx spec={spec}/></V8Canvas>;
  }
  if(spec.layout==='notion-answer-ability'||spec.layout==='notion-question-swap'||spec.layout==='notion-answer-ability-swap'){
    const second=frame>=b;return <V8Canvas dark={false}><FullCenter size={spec.words[second?1:0].length>8?130:176}>{spec.words[second?1:0]}</FullCenter><div style={{position:'absolute',left:690,right:690,bottom:210,height:14,borderRadius:8,background:second?'#090909':'#d0d0cc'}}/><Sfx spec={spec}/></V8Canvas>;
  }
  if(spec.layout==='arc-system-detail'){
    const second=frame>=b;return <V8Canvas dark={false}>{second?<><div style={{position:'absolute',left:120,top:110,width:930,height:860,background:'#090909',borderRadius:28}}/><Clip at={b} from="right" style={{right:100,top:280,width:900,height:520,display:'flex',alignItems:'center',justifyContent:'center',fontSize:150,fontWeight:600}}>{spec.words[1]}</Clip></>:<><Clip at={a} style={{left:100,top:110,width:1720,height:860,background:'#efefed',borderRadius:28}}><div style={{position:'absolute',left:120,top:110,width:530,height:530,borderRadius:26,background:'#090909'}}/><div style={{position:'absolute',right:120,top:145,fontSize:146,fontWeight:600}}>{spec.words[0]}</div></Clip></>}<Sfx spec={spec}/></V8Canvas>;
  }
  if(spec.layout==='arc-workflow-cuts'){
    const active=activeIndex(frame,spec.cues,4);const colors=['#fff','#090909','#ededeb','#000'];const ink=['#090909','#fff','#090909','#fff'];
    return <V8Canvas dark={active===1||active===3}><div style={{position:'absolute',inset:0,background:colors[active],color:ink[active],display:'flex',alignItems:'center',justifyContent:'center',fontSize:210,fontWeight:600,letterSpacing:-8}}>{spec.words[active]}</div><Sfx spec={spec}/></V8Canvas>;
  }
  return <V8Canvas dark><div style={{position:'absolute',left:120,right:120,top:150,bottom:150,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>{spec.words.map((word,index)=><Clip key={word} at={[a,b,c][index]??a} from="center" style={{left:index*560,top:0,width:520,height:780}}><FixedPanel dark={index!==activeIndex(frame,spec.cues,spec.words.length)} style={{inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:index===activeIndex(frame,spec.cues,spec.words.length)?'#fff':'#151515'}}><BigCopy dark={index!==activeIndex(frame,spec.cues,spec.words.length)} style={{fontSize:112}}>{word}</BigCopy></FixedPanel></Clip>)}</div><Sfx spec={spec}/></V8Canvas>;
};

