import React from 'react';
import {AbsoluteFill,Img,Loop,OffthreadVideo,staticFile} from 'remotion';
import motion from './N026-motion.json';
const sample=(f:number,k:number)=>{const at=Math.max(0,Math.min(227,f)),a=Math.floor(at),b=Math.min(227,a+1);return motion[a][k]+(motion[b][k]-motion[a][k])*(at-a)};
const ramp=(f:number,a:number,b:number)=>{const x=Math.max(0,Math.min(1,(f-a)/(b-a)));return x*x*(3-2*x)};
const Video=({src}:{src:string})=><Loop durationInFrames={420}><OffthreadVideo src={src} muted style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/></Loop>;
const Spinner=({f}:{f:number})=><div style={{position:'absolute',left:'50%',top:'50%',width:34,height:34,marginLeft:-17,marginTop:-17,border:'3px solid #fff5',borderTopColor:'white',borderRightColor:'white',borderRadius:'50%',transform:`rotate(${f*15}deg)`}}/>;
export function UploadToPhone({t,accent,words,assets={}}:{t:number;accent:string;words?:string[];assets?:Record<string,string>}){
 const f=t*30,phoneX=sample(f,0)-4;
 const menu=ramp(f,87,98)*(1-ramp(f,134,143));
 const keyboard=ramp(f,157,162)*(1-ramp(f,221,227));
 const pasted=f>=197&&f<204,sent=f>=204;
 const sending=ramp(f,204,207);
 const inputExtra=pasted?110*ramp(f,197,202):0,panelHeight=menu*300+keyboard*330;
 const copy=words?.[0]??'请把这三份素材整理成一条完整的视频。先用全景建立场景，再切到人物和细节，保持画面风格与运动方向一致。每个镜头自然衔接，最后保存可以继续编辑的版本。';
 const film=[assets.film1??staticFile('group-c/clean-film1.mp4'),assets.film2??staticFile('group-c/clean-film2.mp4'),assets.film3??staticFile('calibration-b/slot-1.mp4')];
 const thumbs=[assets.image1??staticFile('group-c/image1.jpg'),assets.image2??staticFile('group-c/image3.jpg'),assets.image3??staticFile('group-c/image4.jpg')];
 const cards=[{x:sample(f,1),y:sample(f,2),w:sample(f,3)},{x:sample(f,4),y:sample(f,5),w:828},{x:sample(f,6),y:sample(f,7),w:384}];
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans',fontWeight:400}}>
  {cards.map((b,i)=><div key={i} style={{position:'absolute',left:b.x,top:b.y,width:b.w,height:b.w*9/16,borderRadius:i===1?42:22,overflow:'hidden',boxShadow:'14px 18px 21px #0005'}}><Video src={film[i]}/></div>)}
  <div style={{position:'absolute',left:phoneX,top:20,width:490,height:1010,boxSizing:'border-box',padding:14,borderRadius:83,background:'#111214',boxShadow:'12px 16px 20px #0005,inset 0 0 0 3px #888'}}>
   <div style={{position:'absolute',left:-3,top:220,width:5,height:90,borderRadius:4,background:'#444'}}/><div style={{position:'absolute',right:-3,top:248,width:5,height:106,borderRadius:4,background:'#444'}}/>
   <div style={{position:'relative',width:462,height:982,borderRadius:70,overflow:'hidden',background:'#eee'}}>
    <div style={{height:54,padding:'0 28px',display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:18,fontWeight:600}}><span>{f<85?'12:59':'14:33'}</span><span style={{fontSize:15}}>▴ ▰</span></div>
    <div style={{position:'absolute',left:150,top:11,width:158,height:32,borderRadius:20,background:'#050505'}}><span style={{position:'absolute',left:12,top:12,width:9,height:9,borderRadius:9,background:accent}}/></div>
    <div style={{height:52,display:'flex',justifyContent:'center',alignItems:'center',fontSize:18,fontWeight:500}}><span style={{position:'absolute',left:19,fontSize:32}}>‹</span>{f>=206&&f<222?'对方正在输入…':'Fred 创作助手'}<span style={{position:'absolute',right:18,fontSize:23}}>⚙</span></div>
    <div style={{position:'absolute',left:0,right:0,top:106,bottom:88+panelHeight+inputExtra,overflow:'hidden',background:'#1c2426'}}>
     <Img src={assets.wallpaper??staticFile('group-c/image2.jpg')} style={{width:'100%',height:844,objectFit:'cover',filter:'grayscale(1) brightness(.55)'}}/>
     {f>=117&&<div style={{position:'absolute',right:9,bottom:12+148*sending,display:'flex',alignItems:'flex-end',flexDirection:'column',gap:20}}>
      <span style={{alignSelf:'center',background:'#eee9',padding:'2px 5px',borderRadius:3,fontSize:11,color:'#555'}}>14:33</span>
      {thumbs.map((src,i)=><div key={i} style={{width:i===1?143:180,height:i===0?174:202,position:'relative',overflow:'hidden',borderRadius:2}}><Img src={src} style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/>{f<[139,153,157][i]&&<><div style={{position:'absolute',inset:0,background:'#8889'}}/><Spinner f={f}/></>}</div>)}
     </div>}
     {f>=183&&f<197&&<div style={{position:'absolute',left:20,bottom:0,display:'flex',gap:15,background:'#e5e5e5',borderRadius:6,padding:'9px 13px',fontSize:13,color:'#333'}}>粘贴<span>自动填充</span><span>选择文本</span></div>}
     {sent&&<div style={{position:'absolute',right:9,bottom:12,width:388,opacity:sending,padding:'12px 14px',boxSizing:'border-box',background:accent,color:'white',fontSize:15,lineHeight:1.4,borderRadius:6}}>{copy}</div>}
    </div>
    <div style={{position:'absolute',left:0,right:0,bottom:30+panelHeight,height:58+inputExtra,padding:'0 11px',display:'flex',gap:8,alignItems:'center',background:'#eee',boxSizing:'border-box'}}><span style={{fontSize:22}}>◎</span><div style={{flex:1,height:42+inputExtra,borderRadius:5,background:'white',padding:pasted?'7px 9px':0,boxSizing:'border-box',fontSize:15,lineHeight:1.35,overflow:'hidden'}}>{pasted?copy:(keyboard>0&&f<204?<span style={{color:accent,paddingLeft:8}}>|</span>:null)}</div><span style={{fontSize:24}}>☺</span>{pasted?<span style={{background:accent,color:'white',padding:'4px',fontSize:12,borderRadius:3}}>发送</span>:<span style={{fontSize:26}}>⊕</span>}</div>
    <div style={{position:'absolute',left:0,right:0,bottom:30,height:menu*300,visibility:menu>0?'visible':'hidden',background:'#e9e9eb',overflow:'hidden',display:'flex',justifyContent:'space-around',paddingTop:20,boxSizing:'border-box'}}>{['照片','拍摄','语音输入','文件'].map((label,i)=><div key={label} style={{width:80,fontSize:12,textAlign:'center',color:'#777'}}><div style={{width:64,height:64,background:'white',borderRadius:14,margin:'0 auto 9px',display:'grid',placeItems:'center',fontSize:25,color:i===0?accent:'#555'}}>{['▧','▣','♩','▤'][i]}</div>{label}</div>)}</div>
    <div style={{position:'absolute',left:0,right:0,bottom:30,height:keyboard*330,visibility:keyboard>0?'visible':'hidden',overflow:'hidden',background:'#cdd0d5',padding:'6px',boxSizing:'border-box'}}>
     <div style={{display:'flex',justifyContent:'space-around',height:35,fontSize:18,alignItems:'center',color:'#222'}}>{['我','你','好','是','嗯','不','这','在','看'].map(x=><span key={x}>{x}</span>)}</div>
     {['qwertyuiop','asdfghjkl','zxcvbnm'].map((row,i)=><div key={row} style={{display:'flex',gap:5,justifyContent:'center',height:54,marginBottom:7}}>{i===2&&<span style={{width:45,textAlign:'center',paddingTop:11,fontSize:24}}>⇧</span>}{row.split('').map(x=><span key={x} style={{background:'white',borderRadius:6,boxShadow:'0 2px 0 #999',width:39,height:48,textAlign:'center',lineHeight:'48px',fontSize:23}}>{x}</span>)}{i===2&&<span style={{width:45,textAlign:'center',paddingTop:11,fontSize:22}}>⌫</span>}</div>)}
     <div style={{display:'flex',gap:7,height:44}}>{['123','◎','空格','换行'].map((x,i)=><span key={x} style={{background:i===2?'white':'#b0b6c0',borderRadius:5,flex:i===2?4:1,display:'grid',placeItems:'center',fontSize:15}}>{x}</span>)}</div>
     <div style={{fontSize:25,padding:'12px 10px'}}>◎</div>
    </div>
    <div style={{position:'absolute',bottom:11,left:157,width:148,height:5,borderRadius:5,background:'#161616'}}/>
   </div>
  </div>
 </AbsoluteFill>;
}
