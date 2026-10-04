import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {RebuiltN004} from './library/RebuiltN004';
import {Media,MediaWindow,WorkbenchWindow,FocusLayer,X003Capsule,DotCapsule,LayeredCapsules,
  RisingTitle,ReadingEmail,RulesWindow,FocusWords,NumberedList,SwappingCapsules,
  Advantages,ComparisonWindows,ChoiceDirectory,QuotaComparison,phase,mix,INK,textStyle,fitSize} from './library/SelectedMotion';

type Page={stableId:string;kind:string;startFrame:number;durationInFrames:number;exactScreenWords:string[];motionEvents:{cueFrame:number;spokenCue:string}[]};
const cue=(p:Page,index:number)=>(p.motionEvents[Math.min(index,p.motionEvents.length-1)].cueFrame-p.startFrame)/60;
const Title=({text,size=120,color=INK}:{text:string;size?:number;color?:string})=><div data-qc-text style={{...textStyle,fontSize:fitSize(text,770,size),lineHeight:1.2,textAlign:'center',color}}>{text}</div>;

function ModelCard({which,t}:{which:'astra'|'sol';t:number}){
  const scale=mix(.7,1.28,phase(t,0,.6)),x=which==='astra'?32:662;
  return <div style={{position:'relative',width:'100%',height:'100%',background:'#090d13',overflow:'hidden'}}>
    <div style={{position:'absolute',width:596*scale,height:1016*scale,left:'50%',top:mix(15,-425,phase(t,8.8,9.4)),transform:'translateX(-50%)',overflow:'hidden'}}>
      <div style={{position:'absolute',width:1920*scale,height:1080*scale,left:-x*scale,top:-32*scale}}><Media src='models.png'/></div>
    </div>
  </div>;
}

function Demo({page,t,remote=false}:{page:Page;t:number;remote?:boolean}){
  const firstStop=cue(page,2),secondStop=cue(page,4);
  const zoom=remote?mix(1,1.22,phase(t,cue(page,1),cue(page,1)+.6)):mix(1,1.2,phase(t,cue(page,1),cue(page,1)+.5));
  return <WorkbenchWindow t={t} camera={zoom} origin={remote?'54% 40%':'50% 42%'}>
    {t<firstStop&&<Media src={remote?'desktop.mp4':'name.mp4'} rate={remote?4.9:8.5}/>}
    <Sequence from={Math.round(firstStop*60)} durationInFrames={remote?undefined:Math.round((secondStop-firstStop)*60)}>
      <Media src={remote?'blender.mp4':'task.mp4'} rate={remote?4.7:4.5}/>
    </Sequence>
    {!remote&&<Sequence from={Math.round(secondStop*60)}><Media src='result.mp4' rate={5.9}/></Sequence>}
  </WorkbenchWindow>;
}

export function Scene({page}:{page:Page}){
  const t=useCurrentFrame()/60,n=page.durationInFrames/60,c=(i:number)=>cue(page,i);
  let content:React.ReactNode;
  switch(page.stableId){
    case 'S01':
      content=<><MediaWindow t={t} full><Media src='stage.mp4'/></MediaWindow>
        <div style={{position:'absolute',inset:0,background:`rgba(0,0,0,${.3*(1-phase(t,1.65,2.3))})`}}/>
        <RisingTitle lines={['OpenAI','DevDay 2026']} t={t} dark cap={166} exit={1.68}/></>;break;
    case 'S02':content=<ReadingEmail t={t}/>;break;
    case 'S03':content=<><ReadingEmail t={6} carry/><FocusLayer t={t} at={0}><X003Capsule text='继续掏 200 美元？' t={t} at={.12}/></FocusLayer></>;break;
    case 'S04':content=<>
      {t<2.4&&<MediaWindow t={t} zoom={mix(1,1.28,phase(t,.25,1.25))}><Media src='50f176cb-5be9-4b8d-8635-a7f85b9a9783.png'/></MediaWindow>}
      <Sequence from={144}><MediaWindow t={Math.max(0,t-2.4)}><Media src='dot-animation.mp4' rate={.91}/></MediaWindow></Sequence>
      <FocusLayer t={t} at={c(2)} opacity={.75}><DotCapsule text='像 Muse、龙虾' t={t} at={c(2)+.05} cap={138}/></FocusLayer>
    </>;break;
    case 'S05':content=<Demo page={page} t={t}/>;break;
    case 'S06':content=<Demo page={page} t={t} remote/>;break;
    case 'S07':content=<><MediaWindow t={t}><Media src='dot-codex.mp4' rate={2.7}/></MediaWindow>
      <FocusLayer t={t} at={c(2)}><DotCapsule text={t<c(3)?'调用 Codex':'处理具体任务'} t={t} at={c(2)} cap={140}/></FocusLayer></>;break;
    case 'S08':content=<><MediaWindow t={t}><Media src='introducing-dots-carousel-launch.png'/></MediaWindow>
      <FocusLayer t={t} at={.3} opacity={.9}><FocusWords words={['沟通需求','安排工作','持续跟进']} t={t} cues={[.4,2,c(1)]}/></FocusLayer></>;break;
    case 'S09':content=<>
      {t<c(2)&&<MediaWindow t={t}><Media src='slack.mp4' rate={3.4}/></MediaWindow>}
      <Sequence from={Math.round(c(2)*60)}><MediaWindow t={Math.max(0,t-c(2))}><Media src='invoice-animation.mp4'/></MediaWindow></Sequence>
      <FocusLayer t={t} at={c(4)}><DotCapsule text='具体的工作场景' t={t} at={c(4)} cap={132}/></FocusLayer>
    </>;break;
    case 'S10':content=<><ReadingEmail t={4} focus='dot' carry/><FocusLayer t={t} at={0} opacity={.84}/>
      <RulesWindow t={t} lines={['Dot 使用规则','Pro 包含首个 Dot','聊天不占 ChatGPT 额度','工作任务按规则消耗额度']} cues={[.2,.75,c(1),c(3)]}/></>;break;
    case 'S11':content=<><MediaWindow t={t}><Media src='official-01.webp'/></MediaWindow>
      <FocusLayer t={t} at={c(1)}><LayeredCapsules texts={['GPT-6 Sol','GPT-6.1 Sol']} t={t} at={c(1)} swap={c(2)} y={425}/>
        <div style={{opacity:phase(t,c(3),c(3)+.45),position:'absolute',top:694,left:140,width:1640,...textStyle,textAlign:'center',fontSize:76,color:INK}}>这才是真正的 Sol？</div>
      </FocusLayer></>;break;
    case 'S12':content=<>
      <ComparisonWindows t={t} at={c(2)} left={<ModelCard which='astra' t={t}/>} right={<ModelCard which='sol' t={t}/>}/>
      <FocusLayer t={t} at={c(1)} until={c(2)} opacity={.87}><X003Capsule text='还能干一样的活？' t={t} at={c(1)}/></FocusLayer>
      <FocusLayer t={t} at={c(4)+.35}><X003Capsule text='API 输入 / 输出：1/5' t={t} at={c(4)+.4} cap={104}/></FocusLayer>
    </>;break;
    case 'S13':content=<><MediaWindow t={t}><Media src='deepswe.png'/></MediaWindow>
      <FocusLayer t={t} at={c(1)}><DotCapsule text='+6.4 个百分点' t={t} at={c(1)} cap={138}/>
        <div data-qc-text style={{...textStyle,position:'absolute',left:180,top:705,width:1560,textAlign:'center',fontSize:62,opacity:phase(t,c(2),c(2)+.4)}}>电脑操作 / 专业工作也有提升</div>
      </FocusLayer></>;break;
    case 'S14':content=<><MediaWindow t={4}><Media src='deepswe.png'/></MediaWindow><FocusLayer t={t} at={0}>
      <RisingTitle lines={['比得上','Opus 5.5？']} t={t} cap={145} exit={c(2)-.3}/>
      <RisingTitle lines={['还得','实际测一测']} t={t} at={c(2)} cap={145}/>
    </FocusLayer></>;break;
    case 'S15':content=<><ReadingEmail t={4} carry/><FocusLayer t={t} at={.35} opacity={.97}/>
      <QuotaComparison t={t} cues={[c(0),c(1),c(2),c(3)]}/>
      <FocusLayer t={t} at={c(4)} opacity={.91}><X003Capsule text='没有折扣或优惠' t={t} at={c(4)} cap={132}/></FocusLayer>
    </>;break;
    case 'S16':content=<><ReadingEmail t={t} focus='credits'/><FocusLayer t={t} at={c(1)}>
      <DotCapsule text='不太耐用' t={t} at={c(1)} cap={148}/></FocusLayer></>;break;
    case 'S17':content=<><MediaWindow t={t}><Media src='ultrafast.mp4' rate={1.55}/></MediaWindow>
      <FocusLayer t={t} at={c(2)}><DotCapsule text='这次不加钱测了' t={t} at={c(2)} cap={135}/></FocusLayer></>;break;
    case 'S18':content=<MediaWindow t={t} zoom={mix(1,1.13,phase(t,1,1.5))} origin='55% 50%'>
      <Media src={t<c(2)?'official-04.webp':t<c(2)+1.6?'official-05.webp':'official-06.webp'}/>
    </MediaWindow>;break;
    case 'S19':content=<MediaWindow t={t} zoom={mix(1,1.2,phase(t,.35,1.6))} origin='53% 52%'><Media src='official-09.webp'/></MediaWindow>;break;
    case 'S20':content=<RebuiltN004 t={t*5.72/n} overrides={{assets:{video0:'media/official-15.webp',video1:'media/official-16.webp',video2:'media/official-17.webp',video3:'media/team-animation.mp4',video4:'media/official-20.webp'}}}/>;break;
    case 'S21':content=<><MediaWindow t={t}><Media src='official-08.webp'/></MediaWindow>
      <FocusLayer t={t} at={c(1)} opacity={.95}><div style={{opacity:1-phase(t,c(3),c(3)+.35)}}><ChoiceDirectory t={t} at={c(1)}/></div>
        {t>=c(3)&&<LayeredCapsules texts={['Jev','进入大厂产品']} t={t} at={c(3)} swap={c(4)} y={420}/>}
        <div data-qc-text style={{...textStyle,position:'absolute',left:140,top:710,width:1640,fontSize:66,textAlign:'center',opacity:phase(t,c(5),c(5)+.45)}}>OpenAI 也做出来了</div>
      </FocusLayer></>;break;
    case 'S22':content=<>
      <NumberedList words={['云端 Agent','团队协作','极速决策']} t={t} cues={[.15,c(1),c(1)+1.2]} collapseAt={c(3)}/>
      <DotCapsule text='整合进 ChatGPT' t={t} at={c(3)} cap={137}/>
    </>;break;
    case 'S23':content=<><ReadingEmail t={4} carry/><FocusLayer t={t} at={0} opacity={.96}/>
      <SwappingCapsules words={['更商业化','更多功能','额度回归商业状态']} t={t} swapAt={c(1)} thirdAt={c(3)}/>
    </>;break;
    case 'S24':content=<>
      <Advantages words={['Claude Code','Opus 5.5','模型强，消耗正常']} t={t} cues={[0,.7,c(1)]}/>
      <FocusLayer t={t} at={c(2)+1.2} opacity={.92}><X003Capsule text='考虑转回 Claude Code' t={t} at={c(2)+1.2} cap={104}/></FocusLayer>
    </>;break;
    default:content=<>
      <ComparisonWindows t={t} at={.1} left={<div style={{height:'100%',background:INK,display:'flex',alignItems:'center',justifyContent:'center'}}><Title text='Codex' color='white' size={155}/></div>}
        right={<div style={{height:'100%',background:'#f4f4f5',display:'flex',alignItems:'center',justifyContent:'center'}}><Title text='Claude Code' size={127}/></div>}/>
      <FocusLayer t={t} at={2.1} opacity={.94}><RisingTitle lines={['你会选谁？']} t={t} at={2.1} cap={165}/></FocusLayer>
    </>;
  }
  return <AbsoluteFill style={{background:'#fff',fontFamily:'MiSans',letterSpacing:0}}>{content}</AbsoluteFill>;
}
