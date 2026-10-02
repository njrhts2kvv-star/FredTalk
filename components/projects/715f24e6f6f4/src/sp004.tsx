import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Img, continueRender, delayRender, interpolate, staticFile, useCurrentFrame} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const mix = (frame: number, keys: number[], values: number[]) =>
  interpolate(frame, keys, values, clamp);
const tasks = [
  '数据调研', '竞品分析', '用户画像',
  '原型设计', '代码开发', '功能测试',
  '注册上线', '运营宣传', '官网定制',
];

const Phone: React.FC<{width:number;top:number;opacity:number}> = ({width,top,opacity}) =>
  <div style={{position:'absolute',left:960-width/2,top,width,height:width*2.04,opacity,
    border:`${width*.035}px solid #111`,boxSizing:'border-box',borderRadius:width*.13,background:'#fff',overflow:'hidden',boxShadow:'0 8px 16px #0003'}}>
    <div style={{position:'absolute',left:'37%',top:'2.8%',width:'26%',height:'4%',borderRadius:100,background:'#050505'}}/>
    <div style={{position:'absolute',left:'5%',top:'3%',font:'normal 18px Arial',color:'#111'}}>9:41</div>
    <Img src={staticFile('code-revision/sp004-phone-ui.png')} style={{position:'absolute',left:'3%',top:'12.8%',width:'94%',height:'84.4%',objectFit:'fill'}}/>
  </div>;

export const SP004: React.FC = () => {
  const frame = useCurrentFrame();
  const [fontHandle] = useState(() => delayRender('load MiSans Heavy'));
  useEffect(() => {
    document.fonts.load('900 134px MiSans').then(() => continueRender(fontHandle));
  }, [fontHandle]);
  const phoneWidth = mix(frame, [0, 7, 15, 23, 38, 45], [800, 800, 800, 800, 500, 430]);
  const phoneTop = mix(frame, [0, 7, 15, 23, 38, 45], [1420, 850, 95, 95, 26, 70]);
  const phoneOpacity = mix(frame, [45, 53], [1, 0]);
  const pill = mix(frame, [47, 53], [0, 1]);
  const card = mix(frame, [102, 110], [0, 1]);
  const width = mix(frame, [49, 59, 75, 102, 118], [250, 250, 575, 575, 1760]);
  const height = mix(frame, [49, 59, 75, 102, 118], [250, 250, 250, 250, 720]);
  const linesVisible = mix(frame, [108, 122], [0, 1]);
  return <AbsoluteFill style={{background: '#fff', overflow: 'hidden'}}>
    {phoneOpacity > 0 && <Phone width={phoneWidth} top={phoneTop} opacity={phoneOpacity} />}
    {pill > 0 && <div style={{position: 'absolute', left: 960 - width / 2,
      top: 540 - height / 2 + mix(frame,[126,153],[0,80]), width, height, borderRadius: mix(frame, [49, 118], [125, 100]),
      background: '#030303', opacity: pill, overflow:'hidden',
      boxShadow: '9px 15px 20px #0003', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position:'absolute',inset:0,opacity:1-card,color:'#f8f8f8',fontFamily:'MiSans, sans-serif',fontWeight:900,fontSize:134,whiteSpace:'nowrap'}}>
        <span style={{position:'absolute',top:'50%',left:`calc(50% - ${mix(frame,[58,74],[0,185])}px)`,transform:'translate(-50%,-50%)'}}>0</span>
        <span style={{position:'absolute',top:'50%',left:'47%',transform:'translateY(-50%)',opacity:mix(frame,[58,74],[0,1])}}>— 1</span>
      </div>
      {linesVisible > 0 && <div style={{position: 'absolute', inset: '12% 4%', opacity: linesVisible,
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridTemplateRows: 'repeat(3,1fr)',
        alignItems: 'center', justifyItems: 'center', columnGap: 12, rowGap: 5}}>
        {tasks.map((task, i) => <div key={task} style={{color: '#f8f8f8', fontFamily: 'MiSans', fontWeight: 900,
          fontSize: 120, whiteSpace: 'nowrap',
          
          opacity: mix(frame, [108, 122], [0, 1])}}>{task}</div>)}
      </div>}
    </div>}
  </AbsoluteFill>;
};
