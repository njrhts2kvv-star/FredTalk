import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';

// INT03 adaptation: interaction-codex-full / CodexFullWindowFlow.fullState.
// Frozen source: interaction-components-20261007/source/src/CodexFullWindowFlow.tsx
// SHA-256: 6d69657476f42c06a52bc2e03f5b1b1233b9f9f197356d5028a0513aba420987.
// Preserve input/page separation, clear typing, focus dim and submit return.
// All input pixels come from the current texture, including real typing/cursor.
const W = 16, H = 9, PX = W / 1920;
const clamp = (v: number) => Math.max(0, Math.min(1, v));
type Props = {texture: THREE.Texture; roi: number[]; amount: number};

function roundedPath(left: number, bottom: number, width: number, height: number, radius: number, clockwise = false) {
  const p = new THREE.Path(), right = left + width, top = bottom + height;
  const r = Math.min(radius, width / 2, height / 2);
  if (clockwise) {
    p.moveTo(left + r, top); p.lineTo(right - r, top);
    p.absarc(right - r, top - r, r, Math.PI / 2, 0, true);
    p.lineTo(right, bottom + r); p.absarc(right - r, bottom + r, r, 0, -Math.PI / 2, true);
    p.lineTo(left + r, bottom); p.absarc(left + r, bottom + r, r, -Math.PI / 2, -Math.PI, true);
    p.lineTo(left, top - r); p.absarc(left + r, top - r, r, Math.PI, Math.PI / 2, true);
  } else {
    p.moveTo(left + r, bottom); p.lineTo(right - r, bottom);
    p.absarc(right - r, bottom + r, r, -Math.PI / 2, 0, false);
    p.lineTo(right, top - r); p.absarc(right - r, top - r, r, 0, Math.PI / 2, false);
    p.lineTo(left + r, top); p.absarc(left + r, top - r, r, Math.PI / 2, Math.PI, false);
    p.lineTo(left, bottom + r); p.absarc(left + r, bottom + r, r, Math.PI, Math.PI * 1.5, false);
  }
  p.closePath(); return p;
}

const vertex = `varying vec2 vUv;
void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const cropFragment = `uniform sampler2D image; uniform vec4 crop; uniform vec2 size; uniform float radius; varying vec2 vUv;
void main(){
  vec2 p=abs((vUv-.5)*size)-(size*.5-radius);
  float d=length(max(p,0.))+min(max(p.x,p.y),0.)-radius;
  if(d>0.)discard;
  gl_FragColor=vec4(texture2D(image,crop.xy+vUv*crop.zw).rgb,1.);
  #include <colorspace_fragment>
}`;
const shadowFragment = `uniform vec2 size; uniform vec2 extent; uniform float radius; uniform float blur; uniform float strength; varying vec2 vUv;
void main(){
  vec2 p=abs((vUv-.5)*extent)-(size*.5-radius);
  float d=length(max(p,0.))+min(max(p.x,p.y),0.)-radius;
  float a=strength*exp(-pow(max(d,0.)/max(blur,.001),2.));
  if(a<.0002)discard;
  gl_FragColor=vec4(0.,0.,0.,a);
}`;
const dimVertex = `varying vec2 vSurfaceUv;
void main(){vSurfaceUv=position.xy/vec2(16.,9.)+.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
const dimFragment = `uniform sampler2D image; uniform vec2 blurStep; uniform float dim; uniform vec4 erasedInput; uniform vec2 inputSize; uniform float inputRadius; varying vec2 vSurfaceUv;
void main(){
  vec2 u=vSurfaceUv, b=blurStep;
  vec3 c=texture2D(image,u).rgb*.25;
  c+=(texture2D(image,u+vec2(b.x,0.)).rgb+texture2D(image,u-vec2(b.x,0.)).rgb+texture2D(image,u+vec2(0.,b.y)).rgb+texture2D(image,u-vec2(0.,b.y)).rgb)*.125;
  c+=(texture2D(image,u+b).rgb+texture2D(image,u-b).rgb+texture2D(image,u+vec2(b.x,-b.y)).rgb+texture2D(image,u+vec2(-b.x,b.y)).rgb)*.0625;
  // The original slot retreats with the page. Leaving a clear white aperture
  // below a depth-lifted card created a second bright rim in the failed still.
  vec2 inputCenter=erasedInput.xy+erasedInput.zw*.5;
  vec2 p=abs((u-inputCenter)*vec2(16.,9.))-(inputSize*.5-inputRadius);
  float d=length(max(p,0.))+min(max(p.x,p.y),0.)-inputRadius;
  if(d<.014)c=vec3(1.);
  gl_FragColor=vec4(c,1.);
  #include <colorspace_fragment>
  gl_FragColor.rgb*=1.-dim;
}`;

/** Extract the true current input ROI, raise it in depth, restore it on amount=0. */
export function RaisedInput({texture, roi, amount}: Props) {
  const frame = useCurrentFrame();
  const cropMaterial = useRef<THREE.ShaderMaterial>(null);
  const dimMaterial = useRef<THREE.ShaderMaterial>(null);
  const shadowMaterial = useRef<THREE.ShaderMaterial>(null);
  const [x, y, w, h] = roi;
  if (roi.length !== 4 || roi.some((v) => !Number.isFinite(v)) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1 || y + h > 1) {
    throw new Error('Raised input requires a valid normalized source ROI');
  }
  const q = clamp(amount), width = w * W, height = h * H;
  const cx = (x + w / 2 - .5) * W, cy = (.5 - y - h / 2) * H;
  // Accurate source rule: borderRadius=48*inputScale, inputScale=inputWidth/1472.
  const radius = Math.min(width * 48 / 1472, height / 2);
  const lift = .006 + .344 * q;
  const blur = (8 + 24 * q) * PX, shadowY = (2 + 10 * q) * PX;
  const dimGeometry = useMemo(() => {
    const screen = roundedPath(-W / 2, -H / 2, W, H, .1);
    const shape = new THREE.Shape(screen.getPoints(32));
    return new THREE.ShapeGeometry(shape, 12);
  }, []);
  // Keep one uniform dictionary for the lifetime of each material. Updating a
  // replacement React prop object is not enough during continuous frame seeks.
  const cropUniforms = useMemo(() => ({image: {value: texture}, crop: {value: new THREE.Vector4(x, 1 - y - h, w, h)}, size: {value: new THREE.Vector2(width, height)}, radius: {value: radius}}), []);
  // Source background uses blur(4*q px) plus black .34*q; 9-tap sampling
  // preserves that retreat without blurring the real lifted typing crop.
  const dimUniforms = useMemo(() => ({image: {value: texture}, blurStep: {value: new THREE.Vector2(4 * q / 1920, 4 * q / 1080)}, dim: {value: .34 * q},erasedInput:{value:new THREE.Vector4(x,1-y-h,w,h)},inputSize:{value:new THREE.Vector2(width,height)},inputRadius:{value:radius}}), []);
  const shadowUniforms = useMemo(() => ({size: {value: new THREE.Vector2(width, height)}, extent: {value: new THREE.Vector2(width + 6 * blur, height + 6 * blur)}, radius: {value: radius}, blur: {value: blur}, strength: {value: (.04 + .05 * q) * q}}), []);
  useLayoutEffect(() => {
    const crop = cropMaterial.current;
    if (crop) {
      crop.uniforms.image.value = texture;
      crop.uniforms.crop.value.set(x, 1 - y - h, w, h);
      crop.uniforms.size.value.set(width, height);
      crop.uniforms.radius.value = radius;
      crop.uniformsNeedUpdate = true;
    }
    const dim = dimMaterial.current;
    if (dim) {
      dim.uniforms.image.value = texture;
      dim.uniforms.blurStep.value.set(4 * q / 1920, 4 * q / 1080);
      dim.uniforms.dim.value = .34 * q;
      dim.uniforms.erasedInput.value.set(x, 1 - y - h, w, h);
      dim.uniforms.inputSize.value.set(width, height);
      dim.uniforms.inputRadius.value = radius;
      dim.uniformsNeedUpdate = true;
    }
    const shadow = shadowMaterial.current;
    if (shadow) {
      shadow.uniforms.size.value.set(width, height);
      shadow.uniforms.extent.value.set(width + 6 * blur, height + 6 * blur);
      shadow.uniforms.radius.value = radius;
      shadow.uniforms.blur.value = blur;
      shadow.uniforms.strength.value = (.04 + .05 * q) * q;
      shadow.uniformsNeedUpdate = true;
    }
  }, [frame, texture, x, y, w, h, width, height, radius, q, blur]);
  if (q <= 0) return null;
  return <group>
    {/* Source implementation erases the original white input and dims the
        whole page. Only the extracted forward card stays clear. */}
    <mesh geometry={dimGeometry} position={[0, 0, .008]} renderOrder={6}>
      <shaderMaterial ref={dimMaterial} vertexShader={dimVertex} fragmentShader={dimFragment} uniforms={dimUniforms} depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide}/>
    </mesh>
    <mesh position={[cx, cy - shadowY, lift - .002]} renderOrder={7}>
      <planeGeometry args={[width + 6 * blur, height + 6 * blur]}/>
      <shaderMaterial ref={shadowMaterial} vertexShader={vertex} fragmentShader={shadowFragment} uniforms={shadowUniforms} transparent depthWrite={false} depthTest={false} toneMapped={false}/>
    </mesh>
    <mesh position={[cx, cy, lift]} renderOrder={8}>
      <planeGeometry args={[width, height]}/>
      <shaderMaterial ref={cropMaterial} vertexShader={vertex} fragmentShader={cropFragment} uniforms={cropUniforms} depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide}/>
    </mesh>
  </group>;
}
