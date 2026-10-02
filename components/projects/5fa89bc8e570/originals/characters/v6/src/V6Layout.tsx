import type {CSSProperties, FC, ReactNode} from "react";
import {useCurrentFrame} from "remotion";
import type {Page} from "./types";
import {crisp, mix, weighted} from "./motion";
import {FitText, ink, paper, zoneFor} from "./primitives";

const shadow = "0 18px 42px rgba(0,0,0,.10),0 4px 12px rgba(0,0,0,.055),inset 0 1px 0 rgba(255,255,255,.96)";
const radius = 30;

const Shell: FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => <div style={{position: "absolute", borderRadius: radius, background: paper, boxShadow: shadow, overflow: "hidden", ...style}}>{children}</div>;

const Ink: FC<{children: ReactNode; style?: CSSProperties}> = ({children, style}) => <div style={{position: "absolute", borderRadius: radius, background: ink, color: paper, overflow: "hidden", ...style}}>{children}</div>;

const Stage: FC<{item: Page; children: ReactNode}> = ({item, children}) => {
  const z = zoneFor(item);
  return <div style={{position: "absolute", left: z.left, top: 138, width: z.width, height: 804, zIndex: 3}}>{children}</div>;
};

const Enter: FC<{at: number; side?: "left" | "right" | "up" | "down"; children: ReactNode; style?: CSSProperties}> = ({at, side = "left", children, style}) => {
  const frame = useCurrentFrame();
  if (frame < at) return null;
  const p = Math.max(0, Math.min(1, weighted(frame, at, 18)));
  const dx = side === "left" ? -42 : side === "right" ? 42 : 0;
  const dy = side === "up" ? -34 : side === "down" ? 34 : 0;
  return <div style={{transform: `translate(${dx * (1 - p)}px,${dy * (1 - p)}px)`, ...style}}>{children}</div>;
};

const Label: FC<{text: string; width: number; color?: string; max?: number}> = ({text, width, color = ink, max = 104}) => <FitText text={text} width={width} max={max} min={48} color={color}/>;

const CardText: FC<{text: string; width: number; dark?: boolean}> = ({text, width, dark}) => <div style={{position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 34, boxSizing: "border-box"}}><Label text={text} width={width - 68} color={dark ? paper : ink}/></div>;

const PairShift: FC<{item: Page}> = ({item}) => {
  const frame = useCurrentFrame(); const [a,b] = item.exactScreenWords; const q = crisp(frame,item.moduleCues[1],20); const w = zoneFor(item).width;
  const vertical = item.option === "B";
  return <Stage item={item}>
    <Enter at={item.moduleCues[0]} side={item.characterSide === "left" ? "left" : "right"} style={{position:"absolute",left:vertical?40:mix(w*.22,0,q),top:vertical?60:190,width:vertical?w-80:mix(w*.56,w*.43,q),height:vertical?270:420}}><Shell style={{inset:0}}><CardText text={a} width={vertical?w-80:mix(w*.56,w*.43,q)}/></Shell></Enter>
    <Enter at={item.moduleCues[1]} side={vertical?"down":item.characterSide === "left"?"left":"right"} style={{position:"absolute",left:vertical?40:w*.46,top:vertical?390:190,width:vertical?w-80:w*.54,height:vertical?310:420}}><Ink style={{inset:0}}><CardText text={b} width={vertical?w-80:w*.54} dark/></Ink></Enter>
  </Stage>;
};

const ExpandField: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const words=item.exactScreenWords; const a=words[0]; const b=words[words.length-1]; const p=weighted(frame,item.carrierCue,22); const w=zoneFor(item).width;
  if (frame < item.carrierCue) return <Stage item={item}><></></Stage>;
  return <Stage item={item}>
    <Shell style={{left:mix(w*.42,0,p),top:mix(270,28,p),width:mix(w*.58,w,p),height:mix(250,706,p),borderRadius:mix(42,30,p)}}>
      <Enter at={item.moduleCues[0]} side="up" style={{position:"absolute",left:48,top:90,width:w-96}}><Label text={a} width={w-96} max={92}/></Enter>
      {words.slice(1,-1).map((word,i)=><Enter key={word} at={item.moduleCues[i+1]} side="right" style={{position:"absolute",left:80,top:250+i*104,width:w-160}}><Label text={word} width={w-160} max={76}/></Enter>)}
      <Enter at={item.moduleCues[words.length-1]} side="down" style={{position:"absolute",left:48,bottom:80,width:w-96,height:270}}><Ink style={{inset:0}}><CardText text={b} width={w-96} dark/></Ink></Enter>
    </Shell>
  </Stage>;
};

const Gather: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const words=item.exactScreenWords; const w=zoneFor(item).width; const last=words.length-1; const lock=weighted(frame,item.moduleCues[last],20);
  return <Stage item={item}>
    {words.slice(0,last).map((word,i)=>{const count=Math.max(1,last); const gap=24; const cw=Math.min(330,(w-gap*(count-1))/count); const start=i*(cw+gap); const rowWidth=count*cw+(count-1)*gap; const target=(w-rowWidth)/2+i*(cw+gap); return <Enter key={word} at={item.moduleCues[i]} side={i%2?"down":"up"} style={{position:"absolute",left:mix(start,target,lock),top:mix(95,92,lock),width:cw,height:210}}><Shell style={{inset:0}}><CardText text={word} width={cw}/></Shell></Enter>})}
    <Enter at={item.moduleCues[last]} side={item.characterSide === "left"?"left":"right"} style={{position:"absolute",left:38,top:385,width:w-76,height:310}}><Ink style={{inset:0}}><CardText text={words[last]} width={w-76} dark/></Ink></Enter>
  </Stage>;
};

const SlotSwap: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const [a,b]=item.exactScreenWords; const w=zoneFor(item).width; const q=weighted(frame,item.moduleCues[1],18);
  return <Stage item={item}>
    <Enter at={item.moduleCues[0]} side="up" style={{position:"absolute",left:40,top:mix(218,70,q),width:w-80,height:mix(330,220,q)}}><Shell style={{inset:0}}><CardText text={a} width={w-80}/></Shell></Enter>
    <Enter at={item.moduleCues[1]} side="down" style={{position:"absolute",left:40,top:330,width:w-80,height:360}}><Ink style={{inset:0}}><CardText text={b} width={w-80} dark/></Ink></Enter>
  </Stage>;
};

const StopBand: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const words=item.exactScreenWords; const a=words.slice(0,-1).join(" · "); const b=words[words.length-1]; const w=zoneFor(item).width; const stop=weighted(frame,item.moduleCues[0],14); const settle=weighted(frame,item.moduleCues[words.length-1],18);
  if (frame < item.moduleCues[0]) return <Stage item={item}><></></Stage>;
  return <Stage item={item}>
    <div style={{position:"absolute",left:mix(item.characterSide==="left"?-180:180,20,stop),top:84,width:w-40,height:225}}><Shell style={{inset:0}}><CardText text={a} width={w-40}/></Shell></div>
    <Enter at={item.moduleCues[words.length-1]} side="down" style={{position:"absolute",left:mix(92,28,settle),top:380,width:mix(w-184,w-56,settle),height:300}}><Ink style={{inset:0}}><CardText text={b} width={w-56} dark/></Ink></Enter>
  </Stage>;
};

const Pressure: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const words=item.exactScreenWords; const a=words.slice(0,-1).join(" · "); const b=words[words.length-1]; const lastCue=item.moduleCues[words.length-1]; const w=zoneFor(item).width; const q=weighted(frame,lastCue,22);
  return <Stage item={item}>
    {[0,1,2].map((i)=><Enter key={i} at={item.moduleCues[0]+i*10} side={i%2?"right":"left"} style={{position:"absolute",left:30+i*34,top:58+i*116,width:w-60-i*68,height:190}}><Shell style={{inset:0}}>{i===0&&<CardText text={a} width={w-60}/>}</Shell></Enter>)}
    <Enter at={lastCue} side="up" style={{position:"absolute",left:mix(110,24,q),top:mix(500,458,q),width:mix(w-220,w-48,q),height:250}}><Ink style={{inset:0}}><CardText text={b} width={w-48} dark/></Ink></Enter>
  </Stage>;
};

const Bridge: FC<{item: Page}> = ({item}) => {
  const frame=useCurrentFrame(); const words=item.exactScreenWords; const a=words.slice(0,-1).join(" · "); const b=words[words.length-1]; const lastCue=item.moduleCues[words.length-1]; const w=zoneFor(item).width; const q=weighted(frame,lastCue,20);
  return <Stage item={item}>
    <Enter at={item.moduleCues[0]} side="left" style={{position:"absolute",left:mix(0,w*.08,q),top:90,width:w*.44,height:250}}><Shell style={{inset:0}}><CardText text={a} width={w*.44}/></Shell></Enter>
    <Enter at={lastCue} side="right" style={{position:"absolute",left:mix(w*.56,w*.34,q),top:400,width:mix(w*.44,w*.64,q),height:300}}><Ink style={{inset:0}}><CardText text={b} width={w*.64} dark/></Ink></Enter>
  </Stage>;
};

const Cascade: FC<{item: Page}> = ({item}) => {
  const words=item.exactScreenWords; const w=zoneFor(item).width; const chunks=words.length>2?words:[words[0],words[1]];
  return <Stage item={item}>{chunks.map((word,i)=>{const last=i===chunks.length-1; const cw=last?w-72:w*.62; return <Enter key={word} at={item.moduleCues[Math.min(i,item.moduleCues.length-1)]} side={i%2?"right":"left"} style={{position:"absolute",left:last?36:i%2?w*.32:0,top:50+i*(620/Math.max(2,chunks.length)),width:cw,height:last?260:205}}>{last?<Ink style={{inset:0}}><CardText text={word} width={cw} dark/></Ink>:<Shell style={{inset:0}}><CardText text={word} width={cw}/></Shell>}</Enter>})}</Stage>;
};

export const V6Layout: FC<{item: Page}> = ({item}) => {
  if (item.option === "A") {
    if ([6,10].includes(item.group)) return <StopBand item={item}/>;
    if (item.group === 9) return <Pressure item={item}/>;
    if ([7,8,11].includes(item.group)) return <Gather item={item}/>;
    return <PairShift item={item}/>;
  }
  if (item.option === "B") {
    if ([2,4,5,10].includes(item.group)) return <SlotSwap item={item}/>;
    if ([8,11].includes(item.group)) return <Bridge item={item}/>;
    if ([7,9].includes(item.group)) return <Gather item={item}/>;
    return <ExpandField item={item}/>;
  }
  if ([1,3,4].includes(item.group)) return <ExpandField item={item}/>;
  if ([6,10].includes(item.group)) return <StopBand item={item}/>;
  if ([7,8,11].includes(item.group)) return <Bridge item={item}/>;
  if (item.group === 9) return <Pressure item={item}/>;
  return <Cascade item={item}/>;
};
