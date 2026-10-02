import React from 'react';
import {AbsoluteFill, Img, Sequence, staticFile, interpolate} from 'remotion';
import {Media, ReadingEmail, phase, mix, clamp, fitSize, textStyle, INK} from './library/SelectedMotion';
import c001 from './specs/C001.json';
import c003 from './specs/C003.json';
import c005 from './specs/C005.json';
import b018 from './specs/B018.json';
import b065 from './specs/B065.json';
import b070 from './specs/B070.json';
import r004 from './specs/R004.json';
import r005 from './specs/R005.json';
import r006 from './specs/R006.json';
import r016 from './specs/R016.json';
import r053 from './specs/R053.json';
import queue from './specs/N002-queue.json';
import revealY from './specs/N027-reveal-y.json';
import chalk from './specs/chalk-grain-url.json';
import b062 from './library/timelines/B062.json';
import w05 from './specs/W05.json';
import n054 from './specs/N054-motion.json';
import {JevWordGrid} from './ReviewReplacements';
import {R4OpeningPriceQuestion, R4DotUsageEvidence} from './R4Replacements';
import {R4DefinitionWindow, R4StageHandoff, R4LandscapeDevice, R4SpeedEvidence} from './R4Media';
export {CompetitorDecision} from './ReviewReplacements';

type TrackSpec = {tracks:Record<string,{samples:number[][]}>};
const val = (spec:unknown, name:string, frame:number) => {
  const rows=(spec as TrackSpec).tracks[name].samples;
  return rows[0].slice(1).map((_,i)=>interpolate(frame,rows.map(r=>r[0]),rows.map(r=>r[i+1]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'}));
};
const lerpTrack=(points:number[][],t:number,col=1)=>interpolate(t,points.map(p=>p[0]),points.map(p=>p[col]),{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
const accent='#8554E8', light='#D6BEFF', yellow='#FFBF13';
const display:React.CSSProperties={fontFamily:'RuiZi',fontWeight:700,fontSynthesis:'none',letterSpacing:0};
const heavy:React.CSSProperties={fontFamily:'SourceHanHeavy',fontWeight:900,fontSynthesis:'none',letterSpacing:0};
const shadow='22px 18px 27px #0004';
export type MotionProps={t:number;n:number;c:(i:number)=>number};
const Dots=()=> <div style={{display:'flex',alignItems:'center',gap:22,paddingLeft:48,height:78,background:'#151517'}}>{['#df3099','#ffc354','#4289ee'].map(color=><i key={color} style={{width:23,height:23,borderRadius:'50%',background:color}}/>)}</div>;
const Label=({children,x,y,w,size=100,color=INK,style={}}:{children:React.ReactNode;x:number;y:number;w:number;size?:number;color?:string;style?:React.CSSProperties})=> <div data-qc-text style={{position:'absolute',left:x,top:y,width:w,...display,fontSize:size,lineHeight:1.2,color,...style}}>{children}</div>;

// N002's measured queue transform is rebound to this episode's two questions.
export function r4ClosingState(t:number,at=212/60){
  const p=phase(t,at,at+.65);
  return {anchorX:mix(90,960,p),translatePercent:-50*p,historyOpacity:1-p};
}
export function QuestionQueue({t,closing=false,centerAt=212/60}:{t:number;closing?:boolean;centerAt?:number}){
  const labels=closing?['Codex 还是 Claude Code','你会选谁']:['额度减半','继续掏 200 美元'];
  const at=closing?2.75:.8;
  return <AbsoluteFill data-component='N002'>{labels.map((text,i)=>{
    const start=i?at:0,move=i?0:Math.min(12,Math.max(-1,(t-at+.12)*30)),q=i?[-1,0,1,0,0]:[move,lerpTrack(queue,move,1),lerpTrack(queue,move,2),lerpTrack(queue,move,3),lerpTrack(queue,move,4)];
    const count=Math.floor(clamp((t-start)/.6)*[...text].length);
    const size=fitSize(text,closing&&!i?1240:1580,closing?(i?174:96):138);
    const alpha=phase(t,start,start+.16);
    const ending=r4ClosingState(t,centerAt);
    return <div key={i} style={{position:'absolute',inset:0,opacity:alpha*(closing&&!i?ending.historyOpacity:1),transform:`translate(${q[3]}px,${q[4]}px) rotate(${q[1]}deg) scale(${q[2]})`,transformOrigin:'0 0'}}>
      <Label x={closing&&!i?140:closing&&i?ending.anchorX:90} y={closing&&!i?480:430} w={1740} size={size} style={{whiteSpace:'nowrap',color:i||t<at?INK:'#464646',textShadow:'5px 7px 11px #0003',...(closing&&i?{width:'max-content',transform:`translateX(${ending.translatePercent}%)`}:{})}}>{[...text].slice(0,count).join('')}{count===[...text].length&&<span style={{color:accent}}>？</span>}</Label>
    </div>;
  })}</AbsoluteFill>;
}
export const ClosingQueue=({t,c}:MotionProps)=><QuestionQueue t={t} closing centerAt={c(1)}/>;

export const OpeningPriceQuestion=(props:MotionProps)=><R4OpeningPriceQuestion {...props}/>;

export const DefinitionWindow=(props:MotionProps)=><R4DefinitionWindow {...props}/>;

export const StageHandoff=(props:MotionProps)=><R4StageHandoff {...props}/>;

// 99-03: the source stays mounted while the same screen takes over the canvas.
export const LandscapeDevice=(props:MotionProps)=><R4LandscapeDevice {...props}/>;

function BranchDiagram({t,c,rules=false}:{t:number;c:(i:number)=>number;rules?:boolean}){
  const expand=rules?c(1):c(2),focus=rules?99:c(3),f=lerpTrack([[0,0],[expand-.2,54],[expand+.6,180],[focus,180],[focus+.7,255]],t);
  const raw=[0,1,2,3].map(i=>val(c003,'node'+i,Math.min(180,f)));
  const sx=.88,sy=.78;
  const data=raw.map(([x,y,w,h,op,tx])=>[x*sx+110,y*sy+95,w*sx,h*sy,op,tx]);
  const q=phase(t,focus,focus+.65);
  const texts=rules?['Pro 首个 Dot','聊天\n不占 ChatGPT 额度','Codex / 工作任务\n按对应规则消耗']:['自己的电脑','Codex','ChatGPT 工作','处理具体任务'];
  return <AbsoluteFill data-component='C003'>
    <svg width={1920} height={1080} style={{position:'absolute',inset:0,opacity:1-q,filter:'drop-shadow(10px 10px 10px #0003)'}}>{texts.slice(1).map((_,i)=>{
      const a=data[0],b=data[i+1],op=val(c003,'wire'+i,Math.min(180,f))[0];
      return <path key={i} d={`M${a[0]+a[2]/2} ${a[1]+a[3]} C${a[0]+a[2]/2} ${b[1]+b[3]/2} ${b[0]-110} ${b[1]+b[3]/2} ${b[0]+10} ${b[1]+b[3]/2}`} fill='none' stroke={INK} strokeWidth={14} opacity={op}/>;
    })}</svg>
    {texts.map((text,i)=>{
      let [x,y,w,h,op,tx]=data[i];
      if(rules&&i===2)op*=phase(t,c(2),c(2)+.5);
      if(!rules&&i===3)op*=phase(t,c(3)-.35,c(3));
      if(!rules){if(i===3){x=mix(x,345,q);y=mix(y,325,q);w=mix(w,1230,q);h=mix(h,330,q);}else op*=1-q;}
      return w>0&&h>0&&<div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:Math.min(56,h*.24),background:INK,boxShadow:shadow,opacity:op,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
        <span data-qc-text style={{...heavy,fontSize:rules?fitSize(text.split('\n').sort((a,b)=>b.length-a.length)[0],w-42,86):fitSize(text,w-60,i?104:98),lineHeight:1.3,color:i===0?'white':light,whiteSpace:'pre-line',textAlign:'center',opacity:tx}}>{text}</span>
      </div>;
    })}
  </AbsoluteFill>;
}
export const BranchFocus=({t,c}:MotionProps)=><BranchDiagram t={t} c={c}/>;
export const RuleBranches=({t,c}:MotionProps)=><BranchDiagram t={t} c={c} rules/>;

export function TaskSourceLead(){
  return <AbsoluteFill><Media src='dot-codex.mp4' rate={2.7}/></AbsoluteFill>;
}

export function InvoiceSource(){
  return <AbsoluteFill><Media src='slack.mp4' rate={3.4}/></AbsoluteFill>;
}

export function TeamSource(){
  return <AbsoluteFill><Media src='team-animation.mp4' fit='cover'/></AbsoluteFill>;
}

export const DotUsageEvidence=(props:MotionProps)=><R4DotUsageEvidence {...props}/>;

export function InvoiceTimeline({t,c}:MotionProps){
  const at=c(2),progress=phase(t,at,at+.55),local=Math.max(0,t-at);
  const stops=[0,c(3)-at,c(3)-at+1.05,c(3)-at+1.9];
  const native=lerpTrack([[0,0],[.5,90],[stops[1],150],[stops[2],260],[stops[3],365],[stops[3]+.7,520]],local);
  const reveal=(revealY[Math.min(557,Math.round(native))]-300)/580;
  return <AbsoluteFill data-component='N027'>
    <div style={{position:'absolute',left:42,top:24,width:1836,height:896,overflow:'hidden',borderRadius:20,opacity:1-progress}}><Media src='slack.mp4' rate={3.4}/></div>
    <div style={{position:'absolute',left:150,top:110,width:1620,height:770,background:'#202525',borderRadius:26,overflow:'hidden',boxShadow:shadow,opacity:progress}}>
      <Media src='blackboard-wipe.png' fit='cover'/><div style={{position:'absolute',inset:0,background:'#14202020'}}/><Dots/>
      <Label x={72} y={102} w={1476} size={92} color='white'>发票，先准备再批准</Label>
      <div style={{position:'absolute',left:0,top:275,width:1620,height:455,clipPath:`inset(0 0 ${Math.max(0,1-reveal)*455}px 0)`}}>
        {['发现遗漏','准备发票','请你批准','发送'].map((text,i)=><Label key={text} x={i<2?125+i*710:125+(3-i)*710} y={i<2?18:275} w={470} size={i===2?96:90} color={i===2?light:'white'}>{text}</Label>)}
        <svg width={1620} height={455} style={{position:'absolute',inset:0}}><defs><pattern id='chalk107' width={257} height={257} patternUnits='userSpaceOnUse'><image href={chalk} width={257} height={257}/></pattern></defs>
          {['M580 72 Q675 67 795 72 M772 49 L795 72 L772 95','M1250 78 C1435 152 1370 225 1200 280 M1207 251 L1200 280 L1230 286','M795 323 Q675 316 580 323 M600 301 L580 323 L600 345'].map((d,i)=><path key={i} d={d} fill='none' stroke='url(#chalk107)' strokeWidth={8} strokeLinecap='round'/>)}</svg>
      </div>
    </div>
  </AbsoluteFill>;
}

export function VersionFlip({t,c}:MotionProps){
  const enter=phase(t,c(1),c(1)+.7),flip=phase(t,c(2),c(2)+.55),native=(t-c(1))*95;
  const [x,w]=val(r004,'window',native),newer=flip>.5;
  const turn=Math.abs(1-flip*2),width=1664;
  return <AbsoluteFill data-component='R004'>
    <div style={{position:'absolute',left:80,top:80,width:1760,height:805,opacity:1-enter}}><Media src='official-01.webp'/></div>
    <div style={{position:'absolute',left:x,top:130,width,height:740,borderRadius:34,background:'#222225',overflow:'hidden',transform:`scaleX(${w/1664*(flip>0&&flip<1?Math.max(.025,turn):1)})`,transformOrigin:'50% 50%',boxShadow:shadow,opacity:enter}}>
      <Dots/><Label x={66} y={265} w={1532} size={148} color='white' style={{textAlign:'center'}}>{newer?'GPT-6.1 Sol':'GPT-6 Sol'}</Label>
      <Label x={85} y={500} w={1494} size={76} color={light} style={{textAlign:'center',opacity:phase(t,c(3),c(3)+.4)}}>这才是真正的 Sol？</Label>
    </div>
  </AbsoluteFill>;
}

export function PriceBranches({t,c}:MotionProps){
  const at=c(4),p=phase(t,at,at+.7),native=250+Math.max(0,t-at)*85;
  const number=val(r005,'number',native),branch=val(r005,'branchLight',native);
  return <AbsoluteFill data-component='R005'>
    <div style={{position:'absolute',left:mix(60,1130,p),top:mix(18,145,p),width:mix(1800,720,p),height:mix(900,650,p)}}><Media src='models.png'/></div>
    <div style={{position:'absolute',inset:0,opacity:p}}>
      <Label x={94} y={115} w={1000} size={66}>标准 API 价格 · 相对 Astra</Label>
      <Label x={110} y={325} w={490} size={230} color={accent} style={{...heavy,textAlign:'center',opacity:number[4],textShadow:'8px 10px 14px #0002'}}>1/5</Label>
      <svg width={1140} height={900} style={{position:'absolute'}}>{[0,1].map(i=><path key={i} d={`M575 480 Q670 480 700 ${i?650:330}`} fill='none' stroke={INK} strokeWidth={16} opacity={branch[i]}/>)}</svg>
      {['标准输入','标准输出'].map((text,i)=><Label key={text} x={720} y={i?595:275} w={430} size={82} style={{opacity:phase(t,at+.65+i*.4,at+1+i*.4),...heavy}}>{text}</Label>)}
    </div>
  </AbsoluteFill>;
}

export function BenchmarkEvidence({t,c}:MotionProps){
  const p=phase(t,c(1),c(1)+.65);
  return <AbsoluteFill data-component='X025'>
    <Label x={44} y={44} w={1250} size={52} style={{fontFamily:'MiSans',fontWeight:600}}>DeepSWE v1.1</Label>
    <div style={{position:'absolute',left:mix(50,44,p),top:116,width:mix(1820,1250,p),height:722}}><Media src='deepswe.png'/></div>
    <div style={{position:'absolute',left:58,top:866,width:1200,display:'flex',gap:46,fontFamily:'MiSans',fontSize:38,fontWeight:600}}>{[['GPT-6.1 Sol','#fae598'],['GPT-6 Sol','#b8802b'],['GPT-6 Astra','#2c67c5']].map(([name,color],i)=><div key={name} style={{display:'flex',alignItems:'center',gap:14,whiteSpace:'nowrap'}}><i style={{width:52,borderTop:`6px ${i===1?'dashed':'solid'} ${color}`}}/>{name}</div>)}</div>
    <Label x={1335} y={285} w={540} size={146} color={accent} style={{...heavy,opacity:p}}>+6.4</Label>
    <Label x={1340} y={470} w={490} size={66} style={{opacity:p}}>个百分点</Label>
    <Label x={1340} y={675} w={490} size={50} style={{opacity:phase(t,c(2),c(2)+.5)}}>电脑操作<br/>专业工作也有提升</Label>
  </AbsoluteFill>;
}

export function NotEqualWindow({t,c}:MotionProps){
  const [x,y,w,h]=val(b065,'circle',Math.min(170,t*100)),enter=phase(t,0,.3),window=b065.objects.window;
  return <AbsoluteFill data-component='B065'>
    <div style={{position:'absolute',left:170,top:130,width:1580,height:750,borderRadius:window.radius,background:window.background,boxShadow:shadow,overflow:'hidden',opacity:enter}}><Dots/>
      <Label x={62} y={270} w={610} size={112} color='white' style={{textAlign:'center'}}>官方成绩</Label>
      <Label x={940} y={270} w={600} size={112} color='white' style={{textAlign:'center'}}>实测体验</Label>
      <div style={{position:'absolute',left:mix(790,700,phase(t,.1,.5)),top:mix(330,240,phase(t,.1,.5)),width:Math.min(210,w),height:Math.min(210,h),borderRadius:'50%',background:light,display:'grid',placeItems:'center',fontSize:150,color:'#272443',...display}}>≠</div>
      <Label x={110} y={555} w={1360} size={76} color={light} style={{textAlign:'center',opacity:phase(t,c(1),c(1)+.3)}}>{t<c(2)?'能比得上 Opus 5.5？':'还得实际测一测'}</Label>
    </div>
  </AbsoluteFill>;
}

export function QuotaEvidence({t,c}:MotionProps){
  const reduced=phase(t,c(1)+2.6,c(1)+3.1),second=phase(t,c(2),c(2)+.4);
  const a=val(b062,'barA',Math.min(216,t*100)),b=val(b062,'barB',216+second*108);
  return <AbsoluteFill data-component='B062'><AbsoluteFill style={{transform:'translateX(350px)'}}>
    <div data-qc-quota-row style={{position:'absolute',left:115,top:235,width:990,height:132,display:'flex',alignItems:'center',...display,fontSize:110,lineHeight:1.2}}>
      <span style={{width:475}}>$200</span><span style={{width:515,color:accent}}>{reduced>.5?'10×':'20×'}</span>
    </div>
    <div style={{position:'absolute',left:110,top:430,width:1000,height:15,background:'#e6e6e6'}}><div style={{width:mix(800,400,reduced),height:'100%',background:INK,transform:`scaleY(${a[2]/292})`}}/></div>
    <div style={{opacity:second}}><div data-qc-quota-row style={{position:'absolute',left:115,top:515,width:990,height:132,display:'flex',alignItems:'center',...display,fontSize:110,lineHeight:1.2}}><span style={{width:475}}>$500</span><span style={{width:515}}>25×</span></div><div style={{position:'absolute',left:110,top:710,width:1000,height:15,background:INK,transform:`scaleY(${b[2]/292})`}}/></div>
    <Label x={100} y={792} w={1050} size={50} style={{opacity:phase(t,c(4),c(4)+.4)}}>我的感受：没有折扣或优惠</Label>
  </AbsoluteFill></AbsoluteFill>;
}
export function CreditReading({t,c}:MotionProps){
  const p=phase(t,c(1),c(1)+.6);
  return <AbsoluteFill data-component='X025'><div style={{position:'absolute',left:-240*p,top:0,width:1920,height:1080,transform:`scale(${mix(1,.86,p)})`,transformOrigin:'38% 40%'}}><ReadingEmail t={t} focus='credits'/></div>
    <Label x={1390} y={345} w={475} size={72} style={{opacity:p}}>我的感觉</Label><Label x={1375} y={470} w={475} size={99} color={accent} style={{opacity:p}}>不太耐用</Label>
  </AbsoluteFill>;
}
export const SpeedEvidence=(props:MotionProps)=><R4SpeedEvidence {...props}/>;

export function EvidenceMontage({t,c}:MotionProps){
  const f=lerpTrack([[0,0],[.7,100],[c(1),140],[c(2),190]],t),focus=t<c(1)?-1:t<c(2)?0:-1;
  const files=['official-04.webp','official-05.webp','official-06.webp','official-07.webp'];
  return <AbsoluteFill data-component='R016'>{files.map((src,i)=>{
    const [nx,ny,nw,nh]=val(r016,'card'+i+'Entry',f),scale=.89;
    const x=nx*1.5*scale+106,y=ny*1.5*scale+80,w=nw*1.5*scale,h=nh*1.5*scale;
    return <div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,overflow:'hidden',borderRadius:22,boxShadow:shadow,opacity:focus<0||focus===i?1:.55}}><Media src={src}/></div>;
  })}</AbsoluteFill>;
}
export function ApiEvidence({t}:MotionProps){
  return <AbsoluteFill><div style={{position:'absolute',left:70,top:110,width:1780,height:780,transform:`scale(${mix(1,1.1,phase(t,.4,1.5))})`,transformOrigin:'53% 52%'}}><Media src='official-09.webp'/></div></AbsoluteFill>;
}

export function DecisionTree({t,c}:MotionProps){
  const p=phase(t,c(1),c(1)+.4),compare=phase(t,c(3),c(3)+.4),f=lerpTrack([[c(1),0],[c(1)+.6,180],[c(2)-.3,250],[c(2)+.6,650],[c(3)+.8,700]],t);
  const states=c005.nativeStates,idx=Math.max(0,Math.min(states.length-1,Math.round(val(c005,'nativeFrames',f)[0]))),s=states[idx];
  const [rx,ry,rw,rh]=s.root,scale=.81,offsetY=40;
  const words=['选项 A','选项 B','选项 C','选项 D','选项 E','选项 F'];
  return <AbsoluteFill data-component='C005'>
    <div style={{position:'absolute',left:95,top:98,width:1730,height:770,opacity:1-p}}><Media src='official-08.webp'/></div>
    <div style={{position:'absolute',left:182,top:offsetY,width:1920,height:1080,transform:`scale(${scale})`,transformOrigin:'0 0',opacity:p*(1-compare)}}>
      <div style={{opacity:'treeOpacity' in s?Number(s.treeOpacity):1}}>
        <svg width={1920} height={1080} style={{position:'absolute'}}>{s.leaves.map((b,i)=>b[2]>0&&<line key={i} x1={rx+rw/2} y1={ry+rh} x2={b[0]+b[2]/2} y2={b[1]} stroke={INK} strokeWidth={8} opacity={s.leafOpacity[i]}/>)}</svg>
        {rw>0&&<div style={{position:'absolute',left:rx,top:ry,width:rw,height:rh,borderRadius:rh/2,background:INK,display:'grid',placeItems:'center',color:light,...heavy,fontSize:fitSize('几个选择',rw-25,120)}}>几个选择</div>}
        {s.leaves.map(([x,y,w,h],i)=>w>0&&<div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:Math.min(60,w*.4),background:INK,opacity:s.leafOpacity[i],display:'grid',placeItems:'center',color:'white',...heavy,fontSize:Math.min(72,h/4),writingMode:'vertical-rl'}}>{words[i]}</div>)}
      </div>
      {s.flow.map(([x,y,w,h],i)=>w>0&&<div key={i} style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:50,background:INK,color:light,display:'grid',placeItems:'center',...heavy,fontSize:fitSize(i?'快速判断':'选择',w-40,118)}}>{i?'快速判断':'选择'}</div>)}
      {f>=590&&<svg width={1920} height={1080} style={{position:'absolute',opacity:Math.min(1,(f-590)/45)}}><path d={`M${s.flow[0][0]+s.flow[0][2]+25} 540 H${s.flow[1][0]-90}`} stroke={INK} strokeWidth={26}/><path d={`M${s.flow[1][0]-145} 472 L${s.flow[1][0]-20} 540 L${s.flow[1][0]-145} 608Z`} fill={INK}/></svg>}
    </div>
    {t>=c(3)&&<JevWordGrid t={t} c={c}/>}
  </AbsoluteFill>;
}

export function r4CapabilityState(t:number,c:MotionProps['c']){
  const mergeAt=c(3),f=lerpTrack([[0,0],[c(1),160],[c(2),500],[mergeAt,560],[mergeAt+.8,654]],t);
  const [ux,uy,uw,uh,ur]=val(r006,'unifiedCard',Math.max(624,f));
  const width=1000,height=330;
  return {x:ux+uw/2-width/2,y:uy+uh/2-height/2,width,height,radius:height/2,fontSize:fitSize('ChatGPT',546-70,130),captionY:uy+uh/2+height/2+35};
}
export function CapabilityMerge({t,c}:MotionProps){
  const mergeAt=c(3),p=phase(t,mergeAt,mergeAt+.7),f=lerpTrack([[0,0],[c(1),160],[c(2),500],[mergeAt,560],[mergeAt+.8,654]],t);
  const words=['云端 Agent','团队协作','极速决策'],media=['official-04.webp','official-16.webp','official-08.webp'];
  const block=r4CapabilityState(t,c),ux=block.x,uy=block.y,uw=block.width,uh=block.height,ur=block.radius;
  return <AbsoluteFill data-component='R006'>
    {words.map((text,i)=>{
      const [bx,by,bw,bh]=val(r006,'entryBox'+(i===2?3:i),Math.min(548,80+Math.max(0,t-i*.65)*100)),x=mix(150+i*574,ux,p),y=mix(210+(by-231)*.45,uy,p),w=mix(Math.min(470,bw/318*470),uw,p),h=mix(Math.min(355,bh/318*355),uh,p);
      const alpha=phase(t,.15+i*.65,.6+i*.65)*(1-p);
      return <React.Fragment key={i}><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:36,background:INK,boxShadow:shadow,overflow:'hidden',opacity:alpha}}><Media src={media[i]}/></div><Label x={150+i*574} y={635} w={470} size={78} style={{textAlign:'center',opacity:alpha}}>{text}</Label></React.Fragment>;
    })}
    <div data-qc-chatgpt-block style={{position:'absolute',left:ux,top:uy,width:uw,height:uh,borderRadius:ur,background:INK,boxShadow:shadow,opacity:p,display:'grid',placeItems:'center'}}><div data-qc-chatgpt-text style={{...heavy,fontSize:block.fontSize,color:light}}>ChatGPT</div></div>
    <Label x={140} y={block.captionY} w={1640} size={69} style={{textAlign:'center',opacity:p}}>一口气整合进来</Label>
  </AbsoluteFill>;
}

export const r4CommercialState=()=>({x:925,y:370,width:860,textAlign:'center' as const});
export function CommercialList({t,c}:MotionProps){
  const info=val(b018,'infoMotion',Math.min(370,310+Math.max(0,t)*45)),starts=[c(1),c(2)],items=['功能更多','额度收紧'];
  const heading=r4CommercialState();
  return <AbsoluteFill data-component='B018'>
    <Label x={heading.x} y={heading.y} w={heading.width} size={154} style={{...heavy,textAlign:heading.textAlign,opacity:clamp(info[2]),textShadow:'8px 11px 14px #0002'}}>更商业化</Label>
    {items.map((text,i)=>{
      const native=65+Math.max(0,t-starts[i])*110,[x,y,w,h]=val(b018,'pill'+i,Math.min(170,native)),p=phase(t,starts[i],starts[i]+.55);
      return <div key={text} style={{position:'absolute',left:140+(x-640)*.25,top:220+i*290,width:650,height:Math.min(220,h)*p,borderRadius:58,background:INK,boxShadow:shadow,display:'grid',placeItems:'center',overflow:'hidden',opacity:p}}><span data-qc-text style={{...display,fontSize:126,color:light,whiteSpace:'nowrap'}}>{text}</span></div>;
    })}
  </AbsoluteFill>;
}

export function CompetitorPills({t,c}:MotionProps){
  const f=lerpTrack([[0,54],[.55,105],[1.1,145],[c(1),160],[c(1)+.8,240],[c(2)+2.6,280],[c(2)+3.5,390]],t);
  const texts=['Claude Code','Opus 5.5','消耗正常'];
  return <AbsoluteFill data-component='R053' style={{background:'#f7f7f8'}}>
    {texts.map((text,i)=>{
      const [cx,cy,w,h,opacity]=val(r053,'pill'+i,f),lights=val(r053,'textLight'+i,f),top=(cy-h/2)*.82+60,width=w;
      return <div key={i} style={{position:'absolute',left:cx-width/2,top,width,height:h*.82,borderRadius:h/2,background:INK,opacity,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center'}}><div data-qc-text style={{fontFamily:'OfficialShuHei',fontWeight:700,fontSynthesis:'none',fontSize:fitSize(text,width-100,146),lineHeight:1.2,color:'white',whiteSpace:'nowrap'}}>{[...text].map((ch,j)=><span key={j} style={{opacity:lights[Math.min(lights.length-1,Math.floor(j*lights.length/text.length))],color:i===2?light:'white'}}>{ch}</span>)}</div></div>;
    })}
    <Label x={150} y={815} w={1620} size={64} style={{textAlign:'center',opacity:phase(t,c(2)+1.5,c(2)+2)}}>可能会考虑转回 Claude Code</Label>
  </AbsoluteFill>;
}

// 99-05's d/focus/width/x/y rail is preserved; these are opinion text objects, not fake product screens.
export function CompetitorRail({t,c}:MotionProps){
  const progress=phase(t,c(1),c(1)+.65)+phase(t,c(2)+2.2,c(2)+2.85),enter=phase(t,0,.4);
  const titles=['Opus 5.5','额度消耗','转回 Claude Code？'],subs=['模型非常强','也很正常','可能重新考虑'];
  return <AbsoluteFill data-component='99-05'>
    <Label x={100} y={82} w={1280} size={56} style={{fontFamily:'MiSans',fontWeight:600}}>Claude Code · 我的看法</Label>
    {titles.map((text,i)=>{
      const d=i-progress,focus=Math.max(0,1-Math.abs(d)),w=mix(460,1260,focus),h=w*9/16,x=960+d*1020,y=500+(i%2?1:-1)*185*(1-focus);
      return <div key={text} style={{position:'absolute',left:x-w/2+1920*(1-enter),top:y-h/2,width:w,height:h,borderRadius:34,overflow:'hidden',background:i===1?'#171719':'#fff',border:i===1?undefined:'2px solid #e9e9e9',boxShadow:'0 22px 65px #00000022',zIndex:Math.round(focus*10),color:i===1?'white':INK}}>
        <div style={{position:'absolute',left:w*.08,top:h*.23,width:w*.84,fontFamily:'MiSans',fontWeight:700,fontSynthesis:'none',fontSize:fitSize(text,w*.84,i===2?112:170),lineHeight:1.2,whiteSpace:'nowrap'}}>{text}</div>
        <div style={{position:'absolute',left:w*.08,top:h*.59,width:w*.84,fontFamily:'MiSans',fontWeight:600,fontSize:fitSize(subs[i],w*.84,104),color:i===1?light:accent,lineHeight:1.2}}>{subs[i]}</div>
        <div style={{position:'absolute',inset:0,background:`rgba(0,0,0,${(1-focus)*.08})`}}/>
      </div>;
    })}
  </AbsoluteFill>;
}
