import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import {useCurrentFrame} from 'remotion';
import * as THREE from 'three';

/**
 * INT01/INT02 group adaptation of the frozen NewsFocus.tsx:
 * skills/fred-remotion-output/assets/reference-code/interaction-components-20261007/source/src/NewsFocus.tsx
 * SHA-256 5f839ff118d1050318f4e4c0ebaab0d20c37459a84762c1f45a7207c5da8da23.
 * INT01 canonical: interaction-news-brush / NewsBrushFocus.
 * INT02 canonical: interaction-news-spotlight / NewsSpotlightFocus.
 * Preserve original source geometry, asymmetric brush wipe, original-pixel
 * multiply and the union of clear ROI apertures. Group timing is supplied by
 * the current shot manifest (narration synchronization is not claimed). OutlineGroup is the explicitly requested revision:
 * stationary, constant-width rounded frame, draw once then hold. It retains
 * these source ROI/aperture bounds, not the rejected moving/tapered ribbons.
 */
export const GROUP_ACCENT_PROVENANCE = {
  sourceSha256: '5f839ff118d1050318f4e4c0ebaab0d20c37459a84762c1f45a7207c5da8da23',
  source: 'interaction-components-20261007/source/src/NewsFocus.tsx',
  yellowCanonicalId: 'interaction-news-brush',
  maskCanonicalId: 'interaction-news-spotlight',
  outlineScope: 'Current requested normal-frame revision; original INT02 ROI geometry retained, new outline timing is not claimed as historical approval.',
} as const;

const W = 16, H = 9, PX = W / 1920, STROKE = .022;
const clamp = (n: number) => Math.max(0, Math.min(1, n));
type GroupProps = {rois: number[][]; progress: number; opacity?: number};
type YellowProps = GroupProps & {texture: THREE.Texture};
type Box = {left: number; top: number; width: number; height: number};

function sourceBox(roi: number[]): Box {
  const [x, y, w, h] = roi;
  if (roi.length !== 4 || roi.some((v) => !Number.isFinite(v)) || x < 0 || y < 0 || w <= 0 || h <= 0 || x + w > 1 || y + h > 1) {
    throw new Error('Group accents require normalized [x,y,width,height] source ROIs');
  }
  return {left: (x - .5) * W, top: (.5 - y) * H, width: w * W, height: h * H};
}

function brushShape(width: number, height: number) {
  // Exact source CSS: 9px 4px 7px 3px / 4px 7px 3px 6px.
  const rx = [9, 4, 7, 3].map((v) => v * PX), ry = [4, 7, 3, 6].map((v) => v * PX);
  const f = Math.min(1, width / (rx[0] + rx[1]), width / (rx[2] + rx[3]), height / (ry[0] + ry[3]), height / (ry[1] + ry[2]));
  const ax = rx.map((v) => v * f), ay = ry.map((v) => v * f), s = new THREE.Shape();
  s.moveTo(ax[3], 0); s.lineTo(width - ax[2], 0);
  s.absellipse(width - ax[2], ay[2], ax[2], ay[2], -Math.PI / 2, 0, false, 0);
  s.lineTo(width, height - ay[1]); s.absellipse(width - ax[1], height - ay[1], ax[1], ay[1], 0, Math.PI / 2, false, 0);
  s.lineTo(ax[0], height); s.absellipse(ax[0], height - ay[0], ax[0], ay[0], Math.PI / 2, Math.PI, false, 0);
  s.lineTo(0, ay[3]); s.absellipse(ax[3], ay[3], ax[3], ay[3], Math.PI, Math.PI * 1.5, false, 0);
  s.closePath(); return s;
}

const yellowVertex = `uniform vec2 worldOrigin; varying vec2 sourceUv;
void main(){sourceUv=(position.xy+worldOrigin)/vec2(16.,9.)+.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const yellowFragment = `uniform sampler2D image;uniform vec3 multiplyColor;varying vec2 sourceUv;
void main(){gl_FragColor=vec4(texture2D(image,sourceUv).rgb,1.);
  #include <colorspace_fragment>
  gl_FragColor.rgb*=multiplyColor;
}`;

function YellowRegion({texture, box, progress, opacity}: {texture: THREE.Texture; box: Box; progress: number; opacity: number}) {
  const frame = useCurrentFrame(), material = useRef<THREE.ShaderMaterial>(null);
  const reveal = clamp(progress), strength = .65 * clamp(opacity);
  const width = (box.width + 6 * PX) * Math.max(.00001, reveal), height = Math.max(PX, box.height - 5 * PX);
  const x = box.left - 3 * PX, y = box.top - 3 * PX - height;
  const geometry = useMemo(() => new THREE.ShapeGeometry(brushShape(width, height), 16), [width, height]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const uniforms = useMemo(() => ({image: {value: texture}, worldOrigin: {value: new THREE.Vector2(x, y)}, multiplyColor: {value: new THREE.Vector3(1, 1, 1)}}), []);
  useLayoutEffect(() => {
    const m = material.current; if (!m) return;
    m.uniforms.image.value = texture;
    m.uniforms.worldOrigin.value.set(x, y);
    m.uniforms.multiplyColor.value.set(1, 1 - strength * (1 - 233 / 255), 1 - strength * (1 - 73 / 255));
    m.uniformsNeedUpdate = true;
  }, [frame, texture, x, y, strength]);
  return <mesh geometry={geometry} position={[x, y, .016]} renderOrder={2} visible={reveal > 0 && strength > 0}>
    <shaderMaterial ref={material} vertexShader={yellowVertex} fragmentShader={yellowFragment} uniforms={uniforms} blending={THREE.NoBlending} depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide}/>
  </mesh>;
}

/** Every ROI starts on the same frame, advances with the same progress and holds together. */
export function YellowGroup({texture, rois, progress, opacity = 1}: YellowProps) {
  return <group>{rois.map((roi, i) => <YellowRegion key={i} texture={texture} box={sourceBox(roi)} progress={progress} opacity={opacity}/>)}</group>;
}

const maskVertex = `varying vec2 surface;
void main(){surface=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
function maskFragment(count: number) {
  return `uniform vec4 boxes[${count}];uniform float amount;varying vec2 surface;
void main(){
  // Exact source aperture radius 4 logical pixels; all holes form one union.
  float nearest=10000.;float r=${4 * PX};
  for(int i=0;i<${count};i++){
    vec2 p=abs(surface-boxes[i].xy)-boxes[i].zw+r;
    float d=length(max(p,0.))+min(max(p.x,p.y),0.)-r;
    nearest=min(nearest,d);
  }
  vec2 edge=abs(surface)-(vec2(8.,4.5)-.1);
  float outside=length(max(edge,0.))+min(max(edge.x,edge.y),0.)-.1;
  if(outside>0.)discard;
  float aa=max(fwidth(nearest),.0001);
  float alpha=.76*amount*smoothstep(-aa,aa,nearest);
  if(alpha<.00001)discard;
  gl_FragColor=vec4(0.,0.,0.,alpha);
}`;
}

/** A single dim layer with a union of clear apertures, including overlapping ROIs. */
export function MaskGroup({rois, progress}: GroupProps) {
  const frame = useCurrentFrame(), material = useRef<THREE.ShaderMaterial>(null);
  const boxes = rois.map(sourceBox), count = Math.max(1, boxes.length), amount = clamp(progress);
  // Count changes deliberately remount the shader; each material keeps its own
  // initialized uniform dictionary, then actual refs are updated every frame.
  const uniforms = useMemo(() => ({boxes: {value: Array.from({length: count}, () => new THREE.Vector4())}, amount: {value: 0}}), [count]);
  const fragment = useMemo(() => maskFragment(count), [count]);
  useLayoutEffect(() => {
    const m = material.current; if (!m) return;
    boxes.forEach((b, i) => m.uniforms.boxes.value[i].set(b.left + b.width / 2, b.top - b.height / 2, b.width / 2 + 6 * PX, b.height / 2 + 5 * PX));
    m.uniforms.amount.value = amount;
    m.uniformsNeedUpdate = true;
  }, [frame, uniforms, boxes, amount]);
  return <mesh position={[0, 0, .020]} renderOrder={3} visible={boxes.length > 0 && amount > 0}>
    <planeGeometry args={[W, H]}/>
    <shaderMaterial key={count} ref={material} vertexShader={maskVertex} fragmentShader={fragment} uniforms={uniforms} transparent depthWrite={false} depthTest={false} toneMapped={false} side={THREE.DoubleSide}/>
  </mesh>;
}

function outlineCurve(box: Box) {
  // Same padded source aperture bounds, rendered as a normal outer frame.
  const l = box.left - 6 * PX, r = box.left + box.width + 6 * PX;
  const top = box.top + 5 * PX, bottom = box.top - box.height - 5 * PX;
  const radius = Math.min(.08, (r - l) / 4, (top - bottom) / 4), k = .5522847498307936;
  const path = new THREE.CurvePath<THREE.Vector3>(), v = (x: number, y: number) => new THREE.Vector3(x, y, 0);
  const line = (a: number[], b: number[]) => path.add(new THREE.LineCurve3(v(a[0], a[1]), v(b[0], b[1])));
  const bezier = (a: number[], b: number[], c: number[], d: number[]) => path.add(new THREE.CubicBezierCurve3(v(a[0], a[1]), v(b[0], b[1]), v(c[0], c[1]), v(d[0], d[1])));
  line([l + radius, top], [r - radius, top]);
  bezier([r - radius, top], [r - radius + k * radius, top], [r, top - radius + k * radius], [r, top - radius]);
  line([r, top - radius], [r, bottom + radius]);
  bezier([r, bottom + radius], [r, bottom + radius - k * radius], [r - radius + k * radius, bottom], [r - radius, bottom]);
  line([r - radius, bottom], [l + radius, bottom]);
  bezier([l + radius, bottom], [l + radius - k * radius, bottom], [l, bottom + radius - k * radius], [l, bottom + radius]);
  line([l, bottom + radius], [l, top - radius]);
  bezier([l, top - radius], [l, top - radius + k * radius], [l + radius - k * radius, top], [l + radius, top]);
  path.arcLengthDivisions = 2048;
  return path;
}

class RevealedCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private readonly full: THREE.CurvePath<THREE.Vector3>, private readonly end: number) {super();}
  getPoint(t: number, target = new THREE.Vector3()) {return target.copy(this.full.getPointAt(t * this.end));}
}

function OutlineRegion({box, progress, opacity}: {box: Box; progress: number; opacity: number}) {
  const frame = useCurrentFrame(), p = clamp(progress), alpha = clamp(opacity);
  const curve = useMemo(() => outlineCurve(box), [box.left, box.top, box.width, box.height]);
  const geometry = useMemo(() => p <= 0 ? new THREE.BufferGeometry() : new THREE.TubeGeometry(new RevealedCurve(curve, p), Math.max(8, Math.ceil(768 * p)), STROKE / 2, 8, p >= 1), [curve, p]);
  const material = useMemo(() => new THREE.MeshBasicMaterial({color: '#D6BEFF', transparent: true, depthWrite: false, depthTest: false, toneMapped: false, side: THREE.DoubleSide}), []);
  useLayoutEffect(() => {material.opacity = alpha; material.needsUpdate = true;}, [frame, material, alpha]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  const start = curve.getPointAt(0), end = curve.getPointAt(p);
  return <group position={[0, 0, .022]} visible={p > 0 && alpha > 0}>
    <mesh geometry={geometry} material={material} renderOrder={3}/>
    {p > 0 && p < 1 && <>
      <mesh position={start} material={material} renderOrder={3}><sphereGeometry args={[STROKE / 2, 12, 8]}/></mesh>
      <mesh position={end} material={material} renderOrder={3}><sphereGeometry args={[STROKE / 2, 12, 8]}/></mesh>
    </>}
  </group>;
}

/** Pass progress=clamp((time-start)/.45); once 1, each full frame remains closed and stationary. */
export function OutlineGroup({rois, progress, opacity = 1}: GroupProps) {
  return <group>{rois.map((roi, i) => <OutlineRegion key={i} box={sourceBox(roi)} progress={progress} opacity={opacity}/>)}</group>;
}
