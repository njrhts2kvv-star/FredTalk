import {approvedStaticFile as staticFile} from '../../material-policy';
import React from 'react';
import {AbsoluteFill, Img} from 'remotion';
import motion from './X043-motion.json';
const messages=[
 {f:12,x:320,y:244,w:278,h:60,right:false,text:'在么在么？有事儿着急..'},
 {f:36,x:320,y:338,w:308,h:62,right:false,text:'在么？在么？急急急！！！'},
 {f:92,x:1458,y:432,w:130,h:64,right:true,text:'怎么了？'},
 {f:156,x:320,y:528,w:778,h:94,right:false,text:'拜托帮我做个表格呗，领导让我中午就做好销售数据的分析报告，这里面上千条数据...我...表格不太会用🥺'},
 {f:232,x:1526,y:656,w:62,h:62,right:true,text:'...'},
 {f:298,x:320,y:752,w:634,h:60,right:false,text:'我这刚入职..要是搞不好试用期都过不去了..拜托帮帮忙吧🥺'},
 {f:482,x:1402,y:844,w:186,h:64,right:true,text:'好吧..表格发我'},
 {f:582,x:320,y:940,w:416,h:156,right:false,text:'各分公司 Q1 销售数据.csv'},
];
export function ChatFileExchange({t,accent,words,assets={}}:{t:number;accent:string;words?:string[];assets?:Record<string,string>}){
 const f=Math.max(0,Math.min(599,Math.round(t*60))),m=motion[f];
 return <AbsoluteFill style={{background:'white',fontFamily:'MiSans',fontWeight:400}}><div style={{position:'absolute',left:212,top:m.top,width:1496,height:974,background:'#eee',borderRadius:54,boxShadow:'10px 12px 10px #0005',overflow:'hidden'}}>
 <div style={{height:108,borderBottom:'1px solid #d0d0d0',padding:'32px 23px',boxSizing:'border-box',fontSize:28}}>Fred<div style={{position:'absolute',right:36,top:28,display:'flex',gap:23,alignItems:'center',fontSize:32}}><span>☏</span><span style={{background:'#e4e4e4',padding:'4px 10px',borderRadius:8}}>♧</span><span>⋯</span></div></div>
 <div style={{position:'absolute',top:108,bottom:0,left:0,right:0,overflow:'hidden'}}>
 <div style={{position:'absolute',top:25-m.scroll,width:'100%',textAlign:'center',color:'#aaa',fontSize:20,opacity:f>=12?1:0}}>10:00</div>
 {messages.filter(v=>f>=v.f).map((v,i)=>{const bg=v.right?accent:'white';return <div key={v.f} style={{position:'absolute',left:0,top:v.y-162-m.scroll,width:'100%',height:v.h}}>
 <Img src={v.right?(assets.avatarRight??staticFile('group-a/fred-avatar.png')):(assets.avatarLeft??staticFile('group-a/portrait.jpg'))} style={{position:'absolute',left:v.right?1400:28,top:0,width:56,height:56,borderRadius:6,objectFit:'cover',filter:'grayscale(1)'}}/>
 <div style={{position:'absolute',left:v.x-212,width:v.w,height:v.h,background:bg,borderRadius:5,padding:i===7?'18px 17px':'13px 18px',boxSizing:'border-box',fontSize:22,lineHeight:'33px',color:v.right?'white':'#111'}}><div style={{position:'absolute',top:20,[v.right?'right':'left']:-6,width:12,height:12,background:bg,transform:'rotate(45deg)'}}/>
 {i===7?<><div style={{fontSize:22,paddingRight:57,whiteSpace:'nowrap'}}>{words?.[i]??v.text}</div><div style={{fontSize:20,color:'#aaa',marginTop:7}}>104.2K</div><div style={{position:'absolute',right:25,top:23,width:46,height:64,background:'#eee',fontSize:37,lineHeight:'76px',textAlign:'center',color:accent}}>＊</div><div style={{borderTop:'1px solid #eee',marginTop:15,paddingTop:3,fontSize:19,color:'#aaa'}}>◉ 微信电脑版</div></>:words?.[i]??v.text}
 </div></div>})}
 </div></div></AbsoluteFill>;
}
