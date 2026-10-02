import React from 'react';
import {Clip,Text,WindowFrame,Path} from './common';
import {progress,lerp,reveal} from './motion';

export const DiagramFocus:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const blur=progress(t,4.2,0.23)*(1-progress(t,6.83,0.17));
  const nodes=[{x:980,y:265},{x:650,y:760},{x:1310,y:760}];
  const paths=['M938 419 Q835 550 716 707','M750 724 Q851 573 969 444','M1210 724 Q1108 577 991 444','M1022 419 Q1118 551 1244 707','M850 802 Q974 798 1100 805','M1100 845 Q978 852 850 842'];
  return <>
    <WindowFrame y={lerp(-850,82,progress(t,-0.035,0.32))} blur={blur*19}>
      {nodes.map((n,i)=><Text key={i} text={c.words[i]} x={n.x-320-220} y={n.y-82} size={c.fontSize} weight={600} color="#ecedef"
        style={{fontFamily:'FredHandwriting',fontWeight:400,width:440,textAlign:'center',letterSpacing:0,clipPath:reveal(t,0.6+i*0.08,0.25)}}/>)}
      <svg width="1320" height="940" viewBox="320 82 1320 940" style={{position:'absolute',inset:0}}>
        <defs><marker id="arrowhead" markerWidth="5" markerHeight="5" refX="4.4" refY="2.5" orient="auto"><path d="M0 0 L4.4 2.5 L0 5" stroke="#dfe1e3" fill="none" strokeWidth="0.8"/></marker></defs>
        {paths.map((d,i)=><g key={i} markerEnd={t>1.15+i*0.12?'url(#arrowhead)':undefined} opacity={0.96}>
          <Path d={d} p={progress(t,0.92+i*0.12,0.35)} width={11} color="#dfe1e3"/>
          {/* a second, slightly offset stroke restores the source's hand-drawn weight */}
          <g transform="translate(2 -3)"><Path d={d} p={progress(t,0.92+i*0.12,0.35)} width={3} color="#f7f7f7"/></g>
        </g>)}
      </svg>
    </WindowFrame>
    {t>=4.2&&t<7&&<Text text={c.words[3]} x={210} y={497} size={181} color={c.color} tracking={4}
      style={{width:1500,textAlign:'center',transform:'translateY('+lerp(110,0,progress(t,4.2,0.22))+'px)',clipPath:'inset(0 0 '+progress(t,6.83,0.17)*100+'% 0)',textShadow:'8px 8px 5px rgba(0,0,0,.28)'}}/>}
  </>;
};
export const FormulaFocus:React.FC<{c:Clip;t:number}>=({c,t})=>{
  const blur=progress(t,4.7,0.25)*(1-progress(t,10.35,0.34));
  const heading=t<3.2;
  return <>
    <WindowFrame y={lerp(-890,82,progress(t,0,0.4))} blur={blur*20}>
      {heading?<Text text={c.words[0]} x={110} y={360} size={151} tracking={3} weight={600} color="#f5f5f5"
        style={{width:1100,textAlign:'center',clipPath:'inset(0 '+(1-progress(t,0.5,0.2)+progress(t,2.93,0.25))*100+'% 0 0)'}}/>:
        <Text text={(c.formulaLines??[]).join('\n')} x={110} y={335} size={102} tracking={0} weight={500} color="#f5f5f5"
          style={{width:1100,lineHeight:1.5,textAlign:'center',clipPath:reveal(t,3.2,0.24)}}/>}
    </WindowFrame>
    {c.words.slice(2).map((word,i)=>{
      const start=4.7+i*1.36,p=progress(t,start,0.62),end=progress(t,10.35,0.32);
      const x=220+(i%2)*885,y=310+Math.floor(i/2)*410;
      return t>=start&&t<10.7?<Text key={word} text={word} x={x} y={y+lerp(115,0,p)} size={162} color={c.color}
        style={{transform:'perspective(1000px) rotateX('+lerp(-65,0,p)+'deg) rotateZ('+lerp(-12,0,p)+'deg)',transformOrigin:'left center',clipPath:'inset(0 '+end*100+'% 0 0)',textShadow:'8px 10px 6px rgba(0,0,0,.32)'}}/>:null;
    })}
  </>;
};
