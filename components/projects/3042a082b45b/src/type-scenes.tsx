import React from 'react';
import {Clip,Pill,Text,WindowFrame} from './common';
import {progress,lerp,type,reveal} from './motion';

export const Questions:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const index=c.cues.reduce((last,s,i)=>t>=s?i:last,-1);
  if(index<0)return null;
  const start=c.cues[index],next=c.cues[index+1]??100;
  const enter=progress(t,start,0.53),leave=progress(t,next-0.28,0.2,'out');
  return <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
    <div style={{fontSize:c.fontSize,fontWeight:600,letterSpacing:c.tracking,color:c.color,whiteSpace:'nowrap',
      transform:'scale('+lerp(3.4,1,enter)+') translateY('+(-155*leave)+'px)',clipPath:'inset(0 0 '+(leave*100)+'% 0)'}}>{c.words[index]}</div>
  </div>;
};
export const TitleWindow:React.FC<{c:Clip;t:number}>=({c,t})=>
  <WindowFrame y={lerp(41,82,progress(t,0,0.18))}>
    {c.words.map((word,i)=><Text key={word} text={type(word,t,c.cues[i],0.34)} x={110} y={193+i*213} size={c.fontSize} tracking={c.tracking} color={c.color} style={{width:1100,textAlign:'center'}}/>)}
  </WindowFrame>;
export const Baseline:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const line=progress(t,-0.09,0.7),drop=progress(t,0.93,0.4),out=progress(t,5.05,0.8,'out');
  const lineY=lerp(610,760,drop),x=1920*out;
  return <div style={{position:'absolute',inset:0,transform:'translateX('+x+'px)'}}>
    <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
      <line x1={48} x2={48+1824*line} y1={lineY} y2={lineY} stroke="#151515" strokeWidth={13}/>
      {line>0.5&&<circle cx={1859} cy={lineY-29} r={12} stroke="#111" fill="white" strokeWidth={10}/>}
    </svg>
    <Text text={type(c.words[0],t,1.25,1.88)} x={54} y={lineY-156} size={c.fontSize} color={c.color}/>
  </div>;
};
export const Matrix:React.FC<{c:Clip;t:number}>=({c,t})=><>
  {c.words.map((word,i)=>{
    const row=Math.floor(i/3),col=i%3;
    const born=row*0.36+col*0.1,shape=progress(t,born,0.47);
    const color=c.palette[Math.floor(row/2)];
    return t>=born?<Pill key={word} text={type(word,t,2.45+i*0.105,0.18)} cx={387+col*578} cy={100+row*170}
      width={lerp(12,510,shape)} height={lerp(12,139,shape)} size={c.fontSize} color={color}/>:null;
  })}
</>;
export const ListExpand:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const expanded=t>=0.52&&t<4.44;
  return <>
    {[0,2,3].map(i=><Pill key={i} text={i===0?c.words[i]:type(c.words[i],t,i===2?4.98:7.16,0.34)}
      cx={960} cy={145+i*250} width={i===3?lerp(630,1350,progress(t,6.84,0.35)):630}
      height={193} size={c.fontSize} color={c.color} style={{boxShadow:'none'}}/>)}
    {!expanded&&<Pill text={c.words[1]} cx={960} cy={395} width={630} height={193} size={c.fontSize} color={c.color} style={{boxShadow:'none'}}/>}
    {expanded&&[0,1,2].map(i=>{
      const start=0.52+i*1.02,arrival=progress(t,start,0.4),rowSpread=progress(t,1.85,1.05),x=lerp(2280,i===0?lerp(960,340,rowSpread):i===1?lerp(1580,960,rowSpread):1580,arrival);
      const localMerge=progress(t,3.95+i*0.03,0.35);
      return t>=start?<Pill key={i} text={c.words[4+i]} cx={lerp(x,960,localMerge)} cy={395} width={600}
        height={193} size={c.fontSize} color={c.color}
        style={{boxShadow:'none',clipPath:i===1?'none':'inset(0 '+localMerge*100+'% 0 0)',zIndex:i===1?2:1}}/>:null;
    })}
  </>;
};
export const QuestionCards:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const focus=progress(t,2.8,0.16)*(1-progress(t,3.85,0.18));
  const keyword=t>=2.75&&t<3.96;
  return <>
    <div style={{position:'absolute',inset:0,filter:'blur('+focus*18+'px)'}}>
      {[0,1,2].map(i=>{
        const enter=progress(t,0.06+i*0.75,0.55),leave=progress(t,9.52+i*0.09,0.65,'out');
        const baseX=55+i*278,x=lerp(-1450,baseX,enter)+2100*leave;
        const replacement=i===0&&t>=5.7;
        const text=replacement?c.words[4]:c.words[i];
        return <div key={i} style={{position:'absolute',left:x,top:80+i*350,width:1300,height:193,
          background:'#fff',borderRadius:10,boxShadow:'5px 12px 10px rgba(0,0,0,.28),0 0 5px rgba(0,0,0,.12)',
          display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontFamily:'MiSans',fontWeight:600,fontSize:replacement?42:46,letterSpacing:0,whiteSpace:'nowrap',clipPath:replacement?reveal(t,5.7,0.32):'none'}}>{text}</span>
        </div>;
      })}
    </div>
    {keyword&&<Text text={c.words[3]} x={510} y={360} size={290} color={c.color} tracking={12}
      style={{width:900,textAlign:'center',transform:'translateY('+lerp(95,0,progress(t,2.75,0.22))+'px)',clipPath:'inset(0 0 '+progress(t,3.83,0.13)*100+'% 0)',textShadow:'9px 12px 6px rgba(0,0,0,.35)'}}/>}
  </>;
};
