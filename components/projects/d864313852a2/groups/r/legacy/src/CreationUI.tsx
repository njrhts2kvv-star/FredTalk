import React from 'react';
import data from '../../../../specs/R008.json';
import {measured,ClipSpec} from '../../../../runtime/clip-spec';
const spec=data as unknown as ClipSpec;
const obj=data.objects.creationUI;
/** Editable creation form. Camera and focus rectangle have independent tracks. */
export const CreationUI=({sourceTime}:{sourceTime:number})=>{
 const frame=(sourceTime-12.5)*60;
 const [top]=measured(spec,'uiY',frame);
 const [x,y,width,height,opacity]=measured(spec,'focus',frame);
 const isVertical=sourceTime>=27.85;
 const field:React.CSSProperties={position:'absolute',left:34,right:34,background:'#fff',border:'2px solid #dfe1e4',borderRadius:24};
 const option=(label:string,index:number,selected:boolean,at:number)=> <div key={label} style={{position:'absolute',left:34+index*400,top:at,width:372,height:196,background:selected?'#e9e6f8':'#fff',border:`2px solid ${selected?'#7967bd':'#dfe1e4'}`,borderRadius:24,textAlign:'center',color:selected?'#725dba':'#677073',fontSize:30}}><div style={{height:100,paddingTop:30,boxSizing:'border-box',fontSize:44}}>{at===1120?(index?'▣':'▧'):(index?'▯':'▭')}</div>{label}</div>;
 return <><div style={{position:'absolute',left:obj.x,top,width:obj.width,height:obj.height,borderRadius:obj.radius,background:'#f1f3f6',boxShadow:'32px 17px 25px #0005',overflow:'hidden',fontFamily:'MiSans',fontWeight:400,color:'#333'}}>
 <div style={{position:'absolute',top:0,height:250,width:'100%',background:'#fff'}}><div style={{position:'absolute',left:60,top:50,fontSize:36,fontWeight:800}}>03:37</div><div style={{position:'absolute',left:240,top:38,width:345,height:74,borderRadius:45,background:'#000'}}/><div style={{position:'absolute',left:50,top:166,fontSize:40,fontWeight:800}}>{obj.content.title}</div></div>
 <div style={{position:'absolute',left:34,top:290,fontSize:30}}>参考图片 <span style={{color:'#abb0b3'}}>（可选）</span></div>
 <div style={{...field,top:350,height:315,borderStyle:'dashed',textAlign:'center'}}><div style={{margin:'48px auto 20px',width:98,height:98,borderRadius:'50%',background:'#eceaf4',fontSize:50,color:'#7963c0',display:'grid',placeItems:'center'}}>+</div><div style={{fontSize:30,color:'#677073'}}>{obj.content.upload}</div><div style={{fontSize:26,color:'#adb5b8',marginTop:18}}>支持 JPG/PNG，≤10MB</div></div>
 <div style={{position:'absolute',left:34,top:710,fontSize:30}}>提示词 <span style={{color:'#d77179'}}>*</span></div>
 <div style={{...field,top:768,height:245,padding:28,boxSizing:'border-box'}}><div style={{border:'2px solid #dfe1e4',borderRadius:15,height:180,padding:'30px 36px',boxSizing:'border-box',fontSize:28,color:'#a8b0b4'}}>{obj.content.prompt}</div></div>
 <div style={{position:'absolute',left:34,right:34,top:945,height:86,borderRadius:18,background:'#e7e5f5',fontSize:30,color:'#7563bd',display:'grid',placeItems:'center'}}>使用提示词模板</div>
 <div style={{position:'absolute',left:34,top:1075,fontSize:30}}>生成模式</div>
 {obj.content.mode.map((label,i)=>option(label,i,i===0,1120))}
 <div style={{position:'absolute',left:34,top:1375,fontSize:30}}>画面比例</div>
 {obj.content.aspect.map((label,i)=>option(label,i,i===(isVertical?1:0),1420))}
 <div style={{position:'absolute',left:34,right:34,top:1675,height:118,borderRadius:28,background:sourceTime>27.8?'linear-gradient(100deg,#7251e8,#9580f5)':'#e3e9eb',fontSize:40,color:'#fff',display:'grid',placeItems:'center'}}>{obj.content.button}</div>
 </div><div style={{position:'absolute',left:x,top:y,width,height,borderRadius:54,border:'16px solid #f00008',boxSizing:'border-box',opacity,pointerEvents:'none'}}/></>;
};
