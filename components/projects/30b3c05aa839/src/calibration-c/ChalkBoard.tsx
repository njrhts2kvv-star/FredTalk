import {approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {Img} from 'remotion';
import chalkGrainUrl from './chalk-grain-url.json';
import revealY from './N027-reveal-y.json';

const grain = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
// Fixed, subpixel unevenness follows the same hand-traced path on every frame.
function chalkPath(d:string) {
  const tokens=d.match(/[MQLC]|-?\d+(?:\.\d+)?/g)!;
  let index=0, x=0, y=0, serial=0, result='';
  while(index<tokens.length) {
    const command=tokens[index++];
    const values=Array.from({length:command==='C'?6:command==='Q'?4:2},()=>Number(tokens[index++]));
    if(command==='M'){[x,y]=values; result+=`M${x} ${y} `;continue;}
    const ox=x,oy=y; const [ex,ey]=values.slice(-2);
    const steps=Math.max(2,Math.ceil((Math.abs(ex-x)+Math.abs(ey-y)+100)/2));
    for(let n=1;n<=steps;n++) {
      const t=n/steps,u=1-t;
      let px=ox+(ex-ox)*t,py=oy+(ey-oy)*t;
      if(command==='Q'){px=u*u*ox+2*u*t*values[0]+t*t*ex;py=u*u*oy+2*u*t*values[1]+t*t*ey;}
      if(command==='C'){px=u*u*u*ox+3*u*u*t*values[0]+3*u*t*t*values[2]+t*t*t*ex;py=u*u*u*oy+3*u*u*t*values[1]+3*u*t*t*values[3]+t*t*t*ey;}
      serial++; result+=`L${(px+(grain(serial)-.5)*1.6).toFixed(2)} ${(py+(grain(serial+500)-.5)*1.6).toFixed(2)} `;
    }
    x=ex;y=ey;
  }
  return result;
}

/** Measured in the reference's 1920x1080 coordinate space. */
export function ChalkBoard({frame, words, accent}: {frame:number; words?:string[];accent:string}) {
  const y = revealY[Math.max(0, Math.min(557, frame))];
  const nodes = [
    ['制作脚本',336,375],['设计分镜',843,375],['确定画风',1314,375],
    ['人物设定',336,574],['光影设计',845,574],['运镜手法',1313,574],
    ['动作设计',529,780],['剪辑拼接',1013,780],
  ] as const;
  const strokes = [
    'M688 430 Q742 429 817 430 M795 413 L817 430 L795 448',
    'M1190 430 Q1250 431 1305 430 M1284 413 L1305 430 L1284 447',
    'M1655 431 C1708 443 1705 494 1619 516 M1638 493 L1619 516 L1650 529',
    'M1595 520 C1310 548 1000 516 742 516 C490 516 296 540 250 580 C218 608 266 626 309 628 M283 607 L309 628 L282 648',
    'M688 628 Q752 626 817 628 M795 611 L817 628 L795 646',
    'M1190 628 Q1250 630 1303 628 M1282 611 L1303 628 L1282 646',
    'M1655 629 C1712 644 1701 690 1585 708 C1316 751 974 716 747 719 C604 718 472 737 437 765 C393 800 432 829 509 832 M482 811 L509 832 L481 852',
    'M875 832 Q934 834 1001 832 M979 815 L1001 832 L979 850',
  ];
  return <>
    <div style={{position:'absolute',left:168,top:124,width:1596,height:850,borderRadius:26,background:'#202525',boxShadow:'0 18px 32px #0006, inset 0 0 17px #bfc4c469',overflow:'hidden'}}>
      <Img src={staticFile('calibration-c/blackboard-wipe.png')} style={{position:'absolute',inset:0,width:'100%',height:'100%'}} />
      <div style={{position:'absolute',inset:0,borderRadius:26,boxShadow:'inset 0 0 13px 3px #bfc4c466',border:'1px solid #c6cccc55'}} />
      <div style={{position:'relative',height:77,background:'#0d1111b8',boxShadow:'inset 0 4px 11px #c6cccc44',display:'flex',gap:20,paddingLeft:47,paddingTop:31,boxSizing:'border-box'}}>
        {[accent,'#d8d8d8','#919191'].map((color,i)=><i key={i} style={{width:21,height:21,borderRadius:'50%',background:color}}/>)}
      </div>
    </div>
    <div style={{position:'absolute',left:696,top:194,width:530,textAlign:'center',fontFamily:'MiSans',fontSize:92,fontWeight:400,lineHeight:1.2,color:'#fff'}}>Time Line</div>
    {/* Original is a horizontal top-to-bottom matte reveal, including lines and glyphs. */}
    <div style={{position:'absolute',inset:0,clipPath:`inset(0 0 ${1080-y}px 0)`}}>
      {nodes.map(([text,x,top],i)=><div key={i} style={{position:'absolute',left:x+3,top:top+4,width:340,fontFamily:'MiSans',fontWeight:400,fontSize:84,lineHeight:1.2,letterSpacing:-3.5,color:'#fff',whiteSpace:'nowrap'}}>{words?.[i]??text}</div>)}
      <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
        <defs><pattern id="chalk-grain" width="257" height="257" patternUnits="userSpaceOnUse">
          <image href={chalkGrainUrl} width="257" height="257" />
        </pattern></defs>
        {strokes.map((d,i)=><path key={i} d={chalkPath(d)} fill="none" stroke="url(#chalk-grain)" strokeWidth={i===3||i===6?9:6.5} strokeLinecap="round" strokeLinejoin="round"/>)}
      </svg>
    </div>
  </>;
}
