import {approvedStaticFile as staticFile} from '../../../../material-policy';
import React from 'react';
import {Img} from 'remotion';
const rows=['image','width','height','upscale_method','keep_proportion','pad_color','crop_position','divisible_by','device'];
const values=['reference','832','480','lanczos','resize','0, 0, 0','center','2','cpu'];
const Panel:React.FC<{x:number;y:number;w:number;h:number;title:string;image?:string;type?:string}>=({x,y,w,h,title,image,type})=><div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:22,background:'#303030',border:'3px solid #181818',boxShadow:'3px 6px 10px #0008',overflow:'hidden',fontFamily:'FredRegular',color:'#ddd'}}><div style={{background:'#363636',padding:'15px 20px',fontSize:28,display:'flex',gap:15}}><span style={{color:'#888'}}>●</span>{title}</div><div style={{textAlign:'right',padding:'12px 18px',fontSize:23,color:'#b4cbdc'}}>{type??'IMAGE'} <span style={{color:'#6fb7e8'}}>●</span></div>{image?<><div style={{margin:'0 22px',padding:'8px',borderRadius:20,background:'#222',fontSize:24,textAlign:'center'}}>◀ fred-recording.png ▶</div><div style={{margin:'10px 22px',border:'2px solid #777',textAlign:'center',padding:8,fontSize:22}}>upload</div><Img src={staticFile(image)} style={{position:'absolute',left:28,top:182,width:w-56,height:h-222,objectFit:'cover'}}/><div style={{position:'absolute',bottom:8,left:0,width:'100%',textAlign:'center',fontSize:21}}>1024 × 1536</div></>:<>{rows.map((name,i)=><div key={name} style={{height:40,margin:'7px 20px',padding:'0 12px',borderRadius:23,border:'2px solid #666',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:21,background:'#222'}}><span>◀ {name}</span><span>{values[i]} ▶</span></div>)}<div style={{padding:'15px 22px',fontSize:21}}>Output: 1 × 1024 × 1536 | 12.00MB</div></>}</div>;
export const Workflow026:React.FC<{frame:number}>=({frame})=>{const q=Math.max(0,Math.min(1,(frame-210)/99));return <div style={{position:'absolute',inset:-100,background:'#181818',overflow:'hidden',transform:`perspective(2400px) rotateY(${-8+q*4}deg) rotateZ(${-2+q}deg) scale(1.08) translate(${-30-q*25}px,${-30-q*180}px)`}}>
 <svg width="2200" height="1400" style={{position:'absolute'}}>{[[600,320,1100,210],[600,870,1320,420],[1090,520,1330,740],[1080,1010,1900,480]].map((p,i)=><path key={i} d={`M${p[0]} ${p[1]} C${p[0]+250} ${p[1]},${p[2]-180} ${p[3]},${p[2]} ${p[3]}`} fill="none" stroke={['#68b5ee','#a588d2','#7ad0bd','#68b5ee'][i]} strokeWidth={5}/>)}</svg>
 <Panel x={180} y={-90} w={550} h={430} title="预览图像" image="revision/fred-conversation.jpg"/>
 <Panel x={180} y={380} w={550} h={860} title="加载图像" image="revision/fred-walk-portrait.jpg"/>
 <Panel x={770} y={-200} w={450} h={610} title="Resize Image"/>
 <Panel x={770} y={215} w={450} h={230} title="ONNX Detection Model Loader" type="MODEL"/>
 <Panel x={770} y={450} w={450} h={640} title="Pose and Face Detection" type="MODEL"/>
 <Panel x={1260} y={390} w={330} h={360} title="预览图像" image="revision/fred-night-review.jpg"/>
 <Panel x={1640} y={220} w={460} h={670} title="Resize Image v2"/>
 <div style={{position:'absolute',left:430,top:780,fontSize:92,lineHeight:1,color:'white',textShadow:'2px 2px 3px black',opacity:q>.7?1:0}}>＋</div>
 </div>};
