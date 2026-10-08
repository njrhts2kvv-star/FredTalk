import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Composition, Html5Video, staticFile, useCurrentFrame, useDelayRender, useRemotionEnvironment, useVideoConfig} from 'remotion';
import {ThreeCanvas, useOffthreadVideoTexture, useVideoTexture} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import manifest from '../manifest.json';
import {YellowGroup, MaskGroup, OutlineGroup} from './GroupAccents';
import {RaisedInput} from './RaisedInput';

const W=16, H=9, FOV=35, DIST=15.75;
export type Pose={t:number;yaw:number;pitch:number;zoom:number;fx:number;fy:number};
type Accent={kind:string;start:number;end:number;rois:number[][];reveal?:number};
type Shot={stableId:string;title:string;durationInFrames:number;media:string;cameraKeys:Pose[];accents:Accent[];lift?:{roi:number[];start:number;settledAt:number;returnAt:number;end:number}};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
// Quintic interpolation has zero velocity and acceleration at both endpoints. Every frame is independent.
export const smooth=(x:number)=>{const v=clamp(x);return v*v*v*(v*(v*6-15)+10);};
export function poseAt(keys:Pose[],t:number):Pose {
 const i=keys.findIndex(k=>k.t>t);
 if(i<0)return keys[keys.length-1]; if(i===0)return keys[0];
 const a=keys[i-1],b=keys[i],u=smooth((t-a.t)/(b.t-a.t));
 return Object.fromEntries(Object.keys(a).map(k=>[k,a[k as keyof Pose]+(b[k as keyof Pose]-a[k as keyof Pose])*u])) as Pose;
}
const vertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const fragment=`uniform sampler2D image;varying vec2 vUv;
 void main(){vec2 p=abs((vUv-.5)*vec2(16.,9.))-vec2(7.90,4.40);
 float d=length(max(p,0.))+min(max(p.x,p.y),0.)-.10;if(d>0.)discard;
 gl_FragColor=vec4(texture2D(image,vUv).rgb,1.);
 #include <colorspace_fragment>
 }`;
function shape(w:number,h:number,r:number){
 const s=new THREE.Shape(),x=-w/2,y=-h/2;
 s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);
 s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
 s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);
 s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;
}
function Screen({texture}:{texture:THREE.Texture}){
 const {gl}=useThree();
 const uniforms=useMemo(()=>({image:{value:texture}}),[]);
 const geometry=useMemo(()=>new THREE.ExtrudeGeometry(shape(W+.012,H+.012,.108),{depth:.025,bevelEnabled:false,curveSegments:12}),[]);
 useLayoutEffect(()=>{
  texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;texture.magFilter=THREE.LinearFilter;
  texture.generateMipmaps=false;texture.anisotropy=Math.min(16,gl.capabilities.getMaxAnisotropy());texture.needsUpdate=true;uniforms.image.value=texture;
 },[texture,gl,uniforms]);
 return <>
  <mesh geometry={geometry} position={[0,0,-.024]} renderOrder={0}><meshBasicMaterial color="#dde0e4" toneMapped={false}/></mesh>
  <mesh position={[0,0,.003]} renderOrder={1}><planeGeometry args={[W,H]}/><shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} toneMapped={false} depthWrite side={THREE.DoubleSide}/></mesh>
 </>;
}
// Groups reveal together only after the V2 camera has reached its target.
function AccentLayer({a,t,texture}:{a:Accent;t:number;texture:THREE.Texture}){
 if(t<a.start||t>=a.end)return null;
 const enter=smooth((t-a.start)/(a.reveal??.35)),leave=smooth((a.end-t)/.15),alpha=Math.min(enter,leave);
 if(a.kind==='yellow')return <YellowGroup texture={texture} rois={a.rois} progress={enter} opacity={leave}/>;
 if(a.kind==='mask')return <MaskGroup rois={a.rois} progress={alpha}/>;
 return <OutlineGroup rois={a.rois} progress={enter} opacity={leave}/>;
}
function CameraRig({pose,texture}:{pose:Pose;texture:THREE.Texture|null}){
 const {camera,gl,scene}=useThree(),frame=useCurrentFrame();
 useLayoutEffect(()=>{
  const c=camera as THREE.PerspectiveCamera,rad=Math.PI/180,theta=pose.yaw*rad,phi=pose.pitch*rad,r=DIST/pose.zoom;
  const target=new THREE.Vector3((pose.fx-.5)*W,(.5-pose.fy)*H,0);
  c.position.copy(target).add(new THREE.Vector3(r*Math.sin(theta)*Math.cos(phi),r*Math.sin(phi),r*Math.cos(theta)*Math.cos(phi)));
  c.up.set(0,1,0);c.lookAt(target);c.fov=FOV;c.updateProjectionMatrix();c.updateMatrixWorld();gl.render(scene,c);
 },[pose,texture,frame,camera,gl,scene]);return null;
}
// Readiness scheduling uses RAF only as a paint barrier; all visual states remain frame-derived.
function FrameCommit({texture}:{texture:THREE.Texture|null}){
 const frame=useCurrentFrame(),{fps}=useVideoConfig(),{isRendering}=useRemotionEnvironment();
 const {gl,scene,camera}=useThree(),{delayRender,continueRender}=useDelayRender();
 const handle=useRef<number|null>(null);
 useLayoutEffect(()=>{
  if(!isRendering)return;
  const h=delayRender('Wait for exact source texture and final WebGL paint '+frame,{timeoutInMilliseconds:90000});handle.current=h;
  return ()=>{continueRender(h);if(handle.current===h)handle.current=null;};
 },[frame,isRendering,delayRender,continueRender]);
 useEffect(()=>{
  if(!isRendering||!texture||handle.current===null)return;
  const img=texture.image as HTMLImageElement;const url=img.currentSrc||img.src;
  if(!url)return;
  const sourceTime=Number(new URL(url).searchParams.get('time'));
  if(!Number.isFinite(sourceTime)||Math.abs(sourceTime-frame/fps)>1e-5)return;
  const h=handle.current;
  const id=requestAnimationFrame(()=>{gl.render(scene,camera);gl.getContext().finish();continueRender(h);if(handle.current===h)handle.current=null;});
  return ()=>cancelAnimationFrame(id);
 },[frame,fps,isRendering,texture,camera,gl,scene,continueRender]);
 return null;
}
function Scene({texture,shot}:{texture:THREE.Texture|null;shot:Shot}){
 const t=useCurrentFrame()/60,pose=poseAt(shot.cameraKeys,t);
 const lift=shot.lift;const liftAmount=lift?Math.min(smooth((t-lift.start)/(lift.settledAt-lift.start)),smooth((lift.end-t)/(lift.end-lift.returnAt))):0;
 return <>
  <color attach="background" args={['#ffffff']}/>
  {texture&&<><Screen texture={texture}/>{lift&&<RaisedInput texture={texture} roi={lift.roi} amount={liftAmount}/>}{shot.accents.map((a,i)=><AccentLayer key={i} a={a} t={t} texture={texture}/>)}</>}
  <CameraRig pose={pose} texture={texture}/><FrameCommit texture={texture}/>
 </>;
}
function RenderTexture({shot}:{shot:Shot}){
 const texture=useOffthreadVideoTexture({src:staticFile(shot.media),toneMapped:false,delayRenderRetries:2,delayRenderTimeoutInMilliseconds:90000});
 return <Scene texture={texture} shot={shot}/>;
}
function PreviewTexture({shot,videoRef}:{shot:Shot;videoRef:React.RefObject<HTMLVideoElement|null>}){
 const texture=useVideoTexture(videoRef);return <Scene texture={texture} shot={shot}/>;
}
export function CameraExample({shot}:{shot:Shot}){
 const {width,height}=useVideoConfig(),env=useRemotionEnvironment(),videoRef=useRef<HTMLVideoElement>(null);
 return <AbsoluteFill>{!env.isRendering&&<Html5Video ref={videoRef} src={staticFile(shot.media)} muted style={{width:2,height:2,opacity:0}}/>}
 <ThreeCanvas width={width} height={height} dpr={1} camera={{fov:FOV,near:.1,far:100,position:[0,0,DIST]}} gl={{antialias:true,alpha:false,toneMapping:THREE.NoToneMapping,outputColorSpace:THREE.SRGBColorSpace}}>
 {env.isRendering?<RenderTexture shot={shot}/>:<PreviewTexture shot={shot} videoRef={videoRef}/>}
 </ThreeCanvas></AbsoluteFill>;
}
export function Root(){return <>{(manifest.pages as Shot[]).map(shot=><Composition key={shot.stableId} id={shot.stableId} component={CameraExample} defaultProps={{shot}} durationInFrames={shot.durationInFrames} fps={60} width={1920} height={1080}/>)}</>;}
