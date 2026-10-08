import React, {CSSProperties} from 'react';
import {AbsoluteFill, Img, interpolate, staticFile} from 'remotion';
import comparisonMotion from './rev2-n023-motion.json';

const FONT = 'Fred MiSans';
const BLACK = '#171719';
const ACCENT = '#D6BEFF';
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {const p = clamp(value); return p * p * (3 - 2 * p);};
const q = (t: number, start: number, end: number) => smooth((t - start) / (end - start));
const mix = (a: number, b: number, p: number) => a + (b - a) * p;
const track = (f: number, points: number[][]) => interpolate(f, points.map(point => point[0]), points.map(point => point[1]), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
const comparisonValue = (frame: number, key: number) => {
  const at = Math.max(0, Math.min(125, frame)), a = Math.floor(at), b = Math.min(125, a + 1);
  return comparisonMotion[a][key] + (comparisonMotion[b][key] - comparisonMotion[a][key]) * (at - a);
};
const resolved = (name: string) => staticFile(`media/${name}`);
const imageStyle: CSSProperties = {width: '100%', height: '100%', objectFit: 'cover'};

/** N023 actual measured picture-in-picture to equal-window geometry, with source-frame evidence. */
export function FightFrameEvidence({t}: {t: number}) {
  const open = comparisonValue(Math.min(t, 1.8) * 30, 0);
  const reaction = q(t, 3.43, 3.68);
  const files = ['rev2-evidence-first-attack.jpg', 'rev2-evidence-defence.jpg'];
  const replacements = ['rev2-evidence-impact.jpg', 'rev2-evidence-recoil.jpg'];
  const labels = reaction < .5 ? ['灰衣先攻 · 跃起出腿', '黑衣应接 · 抬臂格挡'] : ['重拳命中 · 上身受力', '身体反馈 · 后撤弯腰'];
  const times = reaction < .5 ? ['源帧 48 · 00:01.600', '源帧 54 · 00:01.800'] : ['源帧 558 · 00:18.600', '源帧 588 · 00:19.600'];
  const captionOpacity = q(open, .92, 1);
  return <AbsoluteFill style={{background: 'white', fontFamily: FONT, fontSynthesis: 'none'}}>
    {[0, 1].map(i => {
      const width = i ? mix(520, 864, open) : mix(1920, 864, open);
      const left = i ? mix(1370, 1016, open) : mix(0, 40, open);
      const top = i ? mix(575, 275, open) : mix(0, 275, open);
      const height = width * 9 / 16, scale = width / 864;
      return <div key={i} style={{position: 'absolute', left, top, width, height, borderRadius: i ? 40 * scale : 40 * open, overflow: 'hidden', boxShadow: `${20 * (i ? scale : open)}px ${22 * (i ? scale : open)}px ${22 * (i ? scale : open)}px #0005`}}>
        <Img src={resolved(files[i])} style={imageStyle}/>
        <Img src={resolved(replacements[i])} style={{...imageStyle, position: 'absolute', inset: 0, opacity: reaction}}/>
      </div>;
    })}
    {[0, 1].map(i => <div key={i} style={{position: 'absolute', left: i ? 1016 : 40, top: 792, width: 864, textAlign: 'center', opacity: captionOpacity}}>
      <div style={{color: BLACK, fontSize: 38, fontWeight: 500, lineHeight: 1.2}}>{labels[i]}</div>
      <div style={{color: '#727272', fontSize: 23, fontWeight: 500, lineHeight: 1.2, marginTop: 10}}>{times[i]}</div>
    </div>)}
  </AbsoluteFill>;
}

const ribbonOpening = [[0,0],[1,.06],[2,.16],[3,.30],[4,.48],[5,.67],[6,.81],[7,.91],[8,.96],[10,.99],[12,1]];
const ribbonSlide = [[0,0],[36,0],[38,.078],[40,.194],[42,.424],[44,.71],[46,.875],[48,.955],[50,.991],[52,1],[72,1],[74,1.004],[76,1.042],[78,1.146],[80,1.4],[82,1.748],[84,1.915],[86,1.979],[88,1.995],[90,2],[171,2]];
const ribbonClose = [[0,0],[150,0],[154,.014],[158,.065],[162,.18],[166,.40],[168,.57],[170,.70],[171,.73]];

/** N004 curve-and-flatten track, assigned to the episode's own rescue -> intercept -> fight images. */
export function OwnStoryRibbon({t}: {t: number}) {
  // Its visual task is story progression. These exact native landmarks are retimed to the narration.
  const f = track(t, [[0,0],[.50,12],[6.05,36],[7.60,52],[8.72,72],[9.167,90],[9.48,150],[10.35,171]]);
  const opening = track(f, ribbonOpening), slide = track(f, ribbonSlide), close = track(f, ribbonClose);
  const width = 1920 - (1920 - 1234) * opening + close * 390;
  const height = 1080 - (1080 - 698) * opening + close * 210;
  const storyReveal = q(t, 6.05, 6.35);
  const files = ['market-scene.png','rev2-story-cell-2.png','rev2-story-cell-1.png','rev2-story-cell-3.png','rev2-story-cell-2.png'];
  return <AbsoluteFill style={{background: 'white', fontFamily: FONT, fontSynthesis: 'none'}}>
    {[-1,0,1,2,3].map((j,i) => {
      const d = j - slide, side = Math.max(-1, Math.min(1, d)), isFinal = j === 2;
      const bend = 120 * opening * (1 - close), leftInset = Math.max(-side,0) * bend, rightInset = Math.max(side,0) * bend;
      const denominator = (height - 2 * leftInset) / (height - 2 * rightInset);
      const perspectiveX = (denominator - 1) / width, shearY = (rightInset * denominator - leftInset) / width;
      const matrix = `matrix3d(${denominator},${shearY},0,${perspectiveX},0,${(height-2*leftInset)/height},0,0,0,0,1,0,0,${leftInset},0,1)`;
      const x = 960 + d * (1920 - (1920 - 1276) * opening + close * 390) - width / 2;
      return <div key={j} style={{position: 'absolute', left: x, top: 465-height/2, width, height, transform: `${matrix} scaleX(${1-close*.72*(isFinal?0:1)})`, transformOrigin: 'top left', zIndex: isFinal && close > 0 ? 3 : 1, opacity: isFinal ? 1 : 1-close*.18, filter: 'drop-shadow(8px 12px 7px #0004)'}}>
        <div style={{width: '100%', height: '100%', borderRadius: 48*opening, overflow: 'hidden', position: 'relative', background: 'white'}}>
          <Img src={resolved(files[i])} style={imageStyle}/>
          {j === 0 && <Img src={resolved('knife-fighter-three-view.png')} style={{...imageStyle, position: 'absolute', inset: 0, objectFit: 'contain', background: 'white', opacity: 1-storyReveal}}/>}
        </div>
      </div>;
    })}
    <div style={{position: 'absolute', left: 0, top: 846, width: 1920, textAlign: 'center', color: BLACK, fontSize: 38, fontWeight: 900, lineHeight: 1.2, opacity: q(t,.42,.68) * (1 - q(t,9.08,9.161667))}}>
      {t < 5.283 ? '自己的故事 · 准备资产' : t < 7.600 ? '刀客 · 出手拦住地痞' : t < 9.167 ? '集市救人' : '与地痞交手'}
    </div>
  </AbsoluteFill>;
}

// X002 exact measured ingress tracks. Eight carriers show all nine real storyboard cells;
// the tall first carrier holds the two establishing shots, so no cell disappears from context.
const wallSlots = [
  {box:[42,49,230,403],axis:'x',track:[[35,-240],[36,-230],[38,-201],[39,-162],[40,-93],[41,-40],[42,-1],[43,25],[44,40],[45,42]],cells:[1,6]},
  {box:[338,49,485,277],axis:'y',track:[[35,-280],[36,-277],[37,-239],[38,-200],[39,-163],[40,-127],[41,-92],[42,-60],[43,-32],[44,-9],[45,11],[46,26],[47,37],[48,44],[49,48],[50,49]],cells:[2]},
  {box:[338,367,234,311],axis:'y',track:[[31,725],[32,720],[34,690],[36,506],[37,476],[38,449],[39,425],[40,405],[41,391],[42,380],[43,372],[44,368],[45,367]],cells:[3]},
  {box:[881,214,355,144],axis:'x',track:[[36,1280],[37,1270],[38,1170],[39,1086],[40,1017],[41,964],[42,925],[43,900],[44,885],[45,881]],cells:[5]},
  {box:[845,385,391,293],axis:'y',track:[[40,725],[41,709],[42,672],[43,635],[44,597],[45,561],[46,526],[47,494],[48,466],[49,442],[50,423],[51,408],[52,397],[53,390],[54,386],[55,385]],cells:[8]},
  {box:[624,360,179,318],axis:'y',track:[[45,720],[46,684],[47,647],[48,610],[49,572],[50,536],[51,501],[52,469],[53,441],[54,417],[55,398],[56,383],[57,372],[58,365],[59,361],[60,360]],cells:[7]},
  {box:[43,479,265,199],axis:'x',track:[[52,-265],[53,-259],[54,-153],[55,-84],[56,-31],[57,8],[58,34],[59,43],[60,43]],cells:[4]},
  {box:[881,49,355,144],axis:'y',track:[[54,-144],[55,-123],[56,-89],[57,-57],[58,-29],[59,-5],[60,14],[61,29],[62,40],[63,47],[64,49]],cells:[9]},
];

/** X002 real wall assembly plus current-shot focus and a concrete prompt revision. */
export function StoryboardRefinementWall({t}: {t: number}) {
  // Start with the genuine nine images already visible. The original X002 eight
  // measured ingress tracks now unfold those images from their grid positions.
  const f = t*30 + 31;
  const focus = q(t,3.50,4.08), prompt = q(t,5.18,5.62), revision = q(t,6.28,6.72);
  const returnToWall = q(t,7.80,8.35), amount = focus*(1-returnToWall);
  const initialBox = (cell: number) => {
    const col = (cell-1)%3, row = Math.floor((cell-1)/3);
    return [288+[0,429,858][col]*1.05,50+[0,244,484][row]*1.05,[422,422,422][col]*1.05,[237,233,236][row]*1.05];
  };
  const contextBox = (cell: number) => {
    const col = (cell-1)%3, row = Math.floor((cell-1)/3);
    return [1250+col*190,140+row*106.875,180,101.25];
  };
  return <AbsoluteFill style={{background: 'white', fontFamily: FONT, fontSynthesis: 'none'}}>
    {wallSlots.map((slot,i)=>{
      const [x,y,width,height] = slot.box;
      const offset = track(f,slot.track), axisEnd = slot.axis==='x'?x:y;
      const ingress = (offset-slot.track[0][1])/(axisEnd-slot.track[0][1]);
      const native = [x*1.1+240,y*1.1+85,width*1.1,height*1.1];
      const isFocus = i===4;
      return slot.cells.map((cell,j)=>{
        const target = [native[0],native[1]+j*native[3]/slot.cells.length,native[2],native[3]/slot.cells.length];
        const start = initialBox(cell);
        const wall = start.map((value,key)=>mix(value,target[key],ingress));
        const destination = isFocus ? [90,176,1130,635.625] : contextBox(cell);
        const box = wall.map((value,key)=>mix(value,destination[key],amount));
        return <div key={cell} style={{position:'absolute',left:box[0],top:box[1],width:box[2],height:box[3],borderRadius:mix(0,[21,21,17,12,22,13,14,12][i],ingress),overflow:'hidden',boxShadow:'16px 10px 19px #0003',zIndex:isFocus?5:1}}>
          <Img src={resolved(`rev2-story-cell-${cell}.png`)} style={imageStyle}/>
        </div>;
      });
    })}
    <div style={{position:'absolute',left:1250,top:475,width:570,boxSizing:'border-box',padding:'24px 24px',borderRadius:30,background:BLACK,color:'white',boxShadow:'0 16px 32px #0002',opacity:q(t,4.08,4.32)*(1-returnToWall),pointerEvents:'none'}}>
      <div style={{fontSize:36,lineHeight:1.2,fontWeight:900,color:ACCENT,marginBottom:20}}>{prompt<.5?'先看打击关系':'调整提示词'}</div>
      <div style={{fontSize:28,lineHeight:1.55,fontWeight:500}}>出手方向是否清楚<br/>命中后身体是否有反馈</div>
      <div style={{opacity:prompt,fontSize:27,lineHeight:1.5,fontWeight:500,marginTop:18,paddingTop:18,borderTop:'1px solid #ffffff35'}}>重拳命中上身后，<br/>躯干后仰、重心后撤。</div>
      <div style={{opacity:revision,marginTop:20,fontSize:32,lineHeight:1.2,fontWeight:900,color:ACCENT}}>调整后重新生成</div>
    </div>
    <div style={{position:'absolute',left:90,top:858,width:1740,textAlign:'center',fontSize:32,lineHeight:1.2,fontWeight:500,color:BLACK}}>{amount>.5?(revision>.5?'第 08 格 · 把身体反馈写清，再重新生成':'当前第 08 格 · 重拳与受击反应'):(t>7.8?'回到完整分镜，核对整体关系':'九格分镜 · 先看剧情与动作')}</div>
  </AbsoluteFill>;
}
