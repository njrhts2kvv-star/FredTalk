import React from 'react';
import {Img, OffthreadVideo, Freeze, useCurrentFrame, useVideoConfig} from 'remotion';

/** Scene sources keep their native shape; a portrait card must not stretch a landscape scene. */
export const ProductSafeImage: React.FC<React.ComponentProps<typeof Img>> = ({src,style,...rest}) => {
 const frame=useCurrentFrame();
 const {fps}=useVideoConfig();
 const path=typeof src === 'string' ? src.split('?')[0] : '';
 const scene=path.includes('/scenes/');
 const portrait=path.includes('-portrait.');
 const document=path.endsWith('.svg');
 const product=path.endsWith('/product.png');
 const fitted:React.CSSProperties={...style,...(scene?{objectFit:document?'contain':portrait?'cover':'contain',background:document?'#f6f3fa':'#f1efe9'}:product?{objectFit:'contain',background:'#fff'}:{})};
 if(path.endsWith('.mp4')) {
  const seconds=path.includes('fred-mic-power')?5.8:5;
  return <Freeze frame={Math.min(frame, Math.floor(seconds*fps)-1)}><OffthreadVideo src={src!} muted style={fitted}/></Freeze>;
 }
 if(scene && !portrait && !document) {
  return <div style={{position:'relative',...style,overflow:'hidden',background:'#efede8'}}>
   <Img src={src} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(30px)',opacity:0.35,transform:'scale(1.12)'}}/>
   <Img {...rest} src={src} style={{position:'relative',width:'100%',height:'100%',objectFit:'contain'}}/>
  </div>;
 }
 return <Img {...rest} src={src} style={fitted}/>;
};
